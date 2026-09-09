#!/usr/bin/env python3
"""Nightly FDA Orange Book ingestion worker.

Downloads the FDA's tilde-delimited archive, validates and normalizes its
Products, Patent, and Exclusivity files, and optionally persists a snapshot.
Network/database writes are opt-in for safe local and demo use.
"""
from __future__ import annotations

import csv
import hashlib
import io
import json
import os
import sys
import urllib.request
import zipfile
from collections import defaultdict
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

FDA_ORANGE_BOOK_URL = os.getenv("FDA_ORANGE_BOOK_URL", "https://www.fda.gov/media/76860/download?attachment=")
REQUIRED_FILES = {"products.txt", "patent.txt", "exclusivity.txt"}
USER_AGENT = "GenericMed-FDA-Sync/1.4 (compliance@genericmed.example)"


@dataclass(frozen=True)
class OrangeBookProduct:
    application_number: str
    product_number: str
    ingredient: str
    dosage_form_route: str
    trade_name: str
    applicant: str
    strength: str
    therapeutic_equivalence_code: str | None
    reference_listed_drug: bool
    reference_standard: bool
    application_type: str
    approval_date: str | None
    patents: tuple[dict[str, str], ...]
    exclusivities: tuple[dict[str, str], ...]

    @property
    def source_key(self) -> str:
        return f"{self.application_number}:{self.product_number}"


def clean(value: str | None) -> str:
    return (value or "").strip()


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def read_delimited(content: bytes) -> list[dict[str, str]]:
    reader = csv.DictReader(io.StringIO(content.decode("utf-8-sig")), delimiter="~")
    return [{clean(k): clean(v) for k, v in row.items() if k is not None} for row in reader]


def row_value(row: dict[str, str], *names: str) -> str:
    values = {key.upper().replace(" ", "").replace("_", ""): value for key, value in row.items()}
    for name in names:
        value = values.get(name.upper().replace(" ", "").replace("_", ""))
        if value is not None:
            return value
    return ""


def download_archive(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=60) as response:
        if response.status != 200:
            raise RuntimeError(f"FDA download returned HTTP {response.status}")
        archive = response.read()
    if not zipfile.is_zipfile(io.BytesIO(archive)):
        raise RuntimeError("FDA response was not a valid Orange Book ZIP archive")
    return archive


def extract_data_files(archive: bytes) -> dict[str, list[dict[str, str]]]:
    with zipfile.ZipFile(io.BytesIO(archive)) as bundle:
        names = {Path(name).name.lower(): name for name in bundle.namelist()}
        missing = REQUIRED_FILES - names.keys()
        if missing:
            raise RuntimeError(f"FDA archive missing required file(s): {', '.join(sorted(missing))}")
        return {filename: read_delimited(bundle.read(names[filename])) for filename in REQUIRED_FILES}


def normalize_products(files: dict[str, list[dict[str, str]]]) -> list[OrangeBookProduct]:
    patents: dict[tuple[str, str], list[dict[str, str]]] = defaultdict(list)
    for row in files["patent.txt"]:
        key = (row_value(row, "Appl_No", "ApplNo"), row_value(row, "Product_No", "ProductNo"))
        patents[key].append({"patentNumber": row_value(row, "Patent_No", "PatentNo"), "patentExpireDate": row_value(row, "Patent_Expire_Date_Text", "Patent_Expire_Date")})
    exclusivities: dict[tuple[str, str], list[dict[str, str]]] = defaultdict(list)
    for row in files["exclusivity.txt"]:
        key = (row_value(row, "Appl_No", "ApplNo"), row_value(row, "Product_No", "ProductNo"))
        exclusivities[key].append({"code": row_value(row, "Exclusivity_Code"), "expiresAt": row_value(row, "Exclusivity_Date")})
    records: list[OrangeBookProduct] = []
    for row in files["products.txt"]:
        application_number, product_number = row_value(row, "Appl_No", "ApplNo"), row_value(row, "Product_No", "ProductNo")
        if not application_number or not product_number:
            continue
        records.append(OrangeBookProduct(
            application_number, product_number, row_value(row, "Ingredient"), row_value(row, "DF;Route", "DF_Route"), row_value(row, "Trade_Name", "TradeName"), row_value(row, "Applicant"), row_value(row, "Strength"), row_value(row, "TE_Code", "TECode") or None,
            row_value(row, "RLD") == "YES", row_value(row, "RS") == "YES", row_value(row, "Type", "Appl_Type"), row_value(row, "Approval_Date") or None,
            tuple(patents[(application_number, product_number)]), tuple(exclusivities[(application_number, product_number)])))
    return records


def checksum(records: Iterable[OrangeBookProduct]) -> str:
    payload = json.dumps([asdict(record) for record in records], sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def calculate_diff(records: list[OrangeBookProduct], state_path: Path) -> dict[str, int]:
    current = {record.source_key: asdict(record) for record in records}
    previous = json.loads(state_path.read_text(encoding="utf-8")).get("records", {}) if state_path.exists() else {}
    return {"created": len(current.keys() - previous.keys()), "updated": sum(current[key] != previous[key] for key in current.keys() & previous.keys()), "removed": len(previous.keys() - current.keys())}


def persist_snapshot(records: list[OrangeBookProduct], dataset_checksum: str) -> None:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        return
    try:
        import psycopg  # type: ignore[import-not-found]
    except ImportError as error:
        raise RuntimeError("DATABASE_URL requires psycopg; install requirements.txt") from error
    with psycopg.connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO fda_sync_runs (source_url, dataset_checksum, status, started_at, completed_at, record_count) VALUES (%s, %s, 'running', now(), now(), %s) RETURNING id", (FDA_ORANGE_BOOK_URL, dataset_checksum, len(records)))
            run_id = cursor.fetchone()[0]
            for product in records:
                cursor.execute("""INSERT INTO fda_orange_book_products (source_key, application_number, product_number, ingredient, dosage_form_route, trade_name, applicant, strength, therapeutic_equivalence_code, reference_listed_drug, reference_standard, application_type, approval_date, patents, exclusivities, source_checksum, last_seen_at) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NULLIF(%s,'')::date,%s::jsonb,%s::jsonb,%s,now()) ON CONFLICT (source_key) DO UPDATE SET ingredient=EXCLUDED.ingredient,dosage_form_route=EXCLUDED.dosage_form_route,trade_name=EXCLUDED.trade_name,applicant=EXCLUDED.applicant,strength=EXCLUDED.strength,therapeutic_equivalence_code=EXCLUDED.therapeutic_equivalence_code,reference_listed_drug=EXCLUDED.reference_listed_drug,reference_standard=EXCLUDED.reference_standard,application_type=EXCLUDED.application_type,approval_date=EXCLUDED.approval_date,patents=EXCLUDED.patents,exclusivities=EXCLUDED.exclusivities,source_checksum=EXCLUDED.source_checksum,last_seen_at=now()""", (product.source_key, product.application_number, product.product_number, product.ingredient, product.dosage_form_route, product.trade_name, product.applicant, product.strength, product.therapeutic_equivalence_code, product.reference_listed_drug, product.reference_standard, product.application_type, product.approval_date, json.dumps(product.patents), json.dumps(product.exclusivities), dataset_checksum))
            cursor.execute("UPDATE fda_sync_runs SET status = 'succeeded' WHERE id = %s", (run_id,))


def run_sync_pipeline(archive: bytes | None = None) -> dict[str, Any]:
    records = normalize_products(extract_data_files(archive or download_archive(FDA_ORANGE_BOOK_URL)))
    if not records:
        raise RuntimeError("FDA archive contained no valid product records")
    dataset_checksum = checksum(records)
    state_path = Path(os.getenv("FDA_SYNC_STATE_PATH", Path(__file__).with_name("orange_book_sync_state.json")))
    diff = calculate_diff(records, state_path)
    persist_snapshot(records, dataset_checksum)
    state_path.write_text(json.dumps({"checksum": dataset_checksum, "records": {record.source_key: asdict(record) for record in records}}, sort_keys=True), encoding="utf-8")
    return {"status": "SUCCESS", "source": FDA_ORANGE_BOOK_URL, "timestamp": utc_now(), "totalRecordsParsed": len(records), "datasetChecksum": dataset_checksum, "changes": diff}


if __name__ == "__main__":
    try:
        print(json.dumps(run_sync_pipeline(), sort_keys=True))
    except Exception as error:
        print(json.dumps({"status": "FAILED", "timestamp": utc_now(), "error": str(error)}), file=sys.stderr)
        raise SystemExit(1)
