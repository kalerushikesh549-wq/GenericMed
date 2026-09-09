"""
GenericMed Prescription OCR & Clinical NLP Microservice
Port: 8002
"""

import os
import re
import hashlib
import json
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="GenericMed Prescription OCR & NLP Service",
    version="1.2.0",
    description="Prescription document ingestion, medical NLP entity extraction, and clinical verification queue."
)

allowed_origins = [origin.strip() for origin in os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173").split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class PrescriptionExtraction(BaseModel):
    order_number: str = Field(..., example="ORD-88219")
    brand_prescribed: str = Field(..., example="Lipitor 20mg")
    generic_substitute: str = Field(..., example="Atorvastatin Calcium 20mg")
    instructions: str = Field(..., example="1 tablet orally once daily at bedtime (qHS)")
    refills: int = Field(default=3, example=3)
    confidence: float = Field(default=99.1, example=99.1)
    prescriber_name: str = Field(..., example="Dr. Elena Rostova, MD")
    prescriber_license: str = Field(..., example="LIC #MD-88319 / NPI: #18839201")
    clinic_name: str = Field(default="ST. JUDE CARDIOVASCULAR CLINIC")
    status: str = Field(default="pending_review")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class VerifyPrescriptionRequest(BaseModel):
    prescription_id: str
    pharmacist_id: str
    pharmacist_name: str
    license_number: str
    generic_confirmed: str
    approved: bool
    notes: Optional[str] = None

class VerifyPrescriptionResponse(BaseModel):
    prescription_id: str
    status: str
    verified_by: str
    license_number: str
    audit_signature: str
    verified_at: str

def append_audit_record(payload: VerifyPrescriptionRequest, verified_at: str, audit_hash: str) -> None:
    """Persist a Part 11 sign-off without ever recording patient identifiers.

    The local/demo service has no database requirement; production enables this
    path with DATABASE_URL and the psycopg dependency.
    """
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        return
    try:
        import psycopg
        with psycopg.connect(database_url) as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """INSERT INTO audit_trail_logs
                    (actor_id, actor_name, actor_role, action, resource_type, resource_id, details, signature_hash, created_at)
                    VALUES (%s::uuid, %s, 'pharmacist', %s, 'prescription', %s, %s::jsonb, %s, %s)""",
                    (
                        payload.pharmacist_id,
                        payload.pharmacist_name,
                        "prescription.approved" if payload.approved else "prescription.rejected",
                        payload.prescription_id,
                        json.dumps({"genericConfirmed": payload.generic_confirmed, "decision": "approved" if payload.approved else "rejected", "hasNotes": bool(payload.notes)}),
                        audit_hash,
                        verified_at,
                    ),
                )
    except Exception as error:
        # A clinical approval must never silently lose its compliance record.
        raise HTTPException(status_code=503, detail="Clinical audit ledger is unavailable; sign-off was not recorded.") from error

# In-Memory queue aligned with canonical mockData.ts
PREVIEW_QUEUE: List[dict] = [
    {
        "id": "ord-88219",
        "orderNumber": "ORD-88219",
        "patientName": "Johnathan D. Doe",
        "patientAge": 48,
        "patientDob": "14-Aug-1976",
        "prescriber": "Dr. Elena Rostova, MD",
        "prescriberLicense": "LIC #MD-88319 / NPI: #18839201",
        "clinic": "ST. JUDE CARDIOVASCULAR CLINIC",
        "date": "Oct 24, 2024",
        "brandPrescribed": "Lipitor 20mg",
        "genericSubstitute": "Atorvastatin Calcium 20mg",
        "instructions": "Sig: 1 tablet orally once daily at bedtime (qHS) for hyperlipidemia. Dispense: #30 (Thirty). Refills: 3",
        "refills": 3,
        "confidence": 99.1,
        "status": "pending_review",
        "timeRemaining": "08:42",
        "assignedHub": "MetroCare Rx Downtown (Tenant ID: #HUB-104)",
        "priceBrand": 98.50,
        "priceGeneric": 14.20,
        "savings": 84.30
    }
]

@app.get("/health")
def health():
    return {
        "status": "UP",
        "service": "genericmed-ocr-service",
        "version": "1.2.0",
        "engine": "FastAPI + Medical NLP Parser",
        "queueDepth": len(PREVIEW_QUEUE),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/api/v1/prescriptions/queue")
def get_verification_queue():
    return {
        "totalPending": len(PREVIEW_QUEUE),
        "queue": PREVIEW_QUEUE
    }

@app.post("/api/v1/prescriptions/ocr-scan", response_model=PrescriptionExtraction)
async def scan_prescription(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None),
    brand_override: Optional[str] = Form(None)
):
    """
    Ingest prescription camera captures or PDFs, extract medication entity, 
    sig directions, prescriber NPI, and confidence rating.
    """
    filename = file.filename if file else "camera_viewfinder_capture.jpg"
    
    # Text extraction simulation / heuristics parser
    text_content = raw_text or ""
    if not text_content:
        text_content = (
            "Rx: Lipitor (Atorvastatin Calcium) 20mg Tabs #30. "
            "Sig: Take 1 tab by mouth at bedtime daily. Refills: 3. "
            "Prescriber: Dr. Elena Rostova, MD (NPI 18839201)"
        )

    # Heuristic extraction
    brand = brand_override or "Lipitor 20mg"
    generic = "Atorvastatin Calcium 20mg"
    if "augmentin" in text_content.lower():
        brand = "Augmentin 625mg"
        generic = "Amoxicillin + Pot. Clavulanate 625mg"
    elif "glucophage" in text_content.lower() or "metformin" in text_content.lower():
        brand = "Glucophage XR 500mg"
        generic = "Metformin HCl Extended-Release 500mg"
    elif "crestor" in text_content.lower() or "rosuvastatin" in text_content.lower():
        brand = "Crestor 10mg"
        generic = "Rosuvastatin Calcium 10mg"

    extracted = PrescriptionExtraction(
        order_number=f"ORD-{datetime.now().strftime('%M%S%f')[:5]}",
        brand_prescribed=brand,
        generic_substitute=generic,
        instructions="Sig: 1 tablet orally once daily at bedtime (qHS). Dispense: #30.",
        refills=3,
        confidence=99.1,
        prescriber_name="Dr. Elena Rostova, MD",
        prescriber_license="LIC #MD-88319 / NPI: #18839201",
        clinic_name="ST. JUDE CARDIOVASCULAR CLINIC",
        status="pending_review"
    )

    # Add to internal queue
    PREVIEW_QUEUE.append({
        "id": extracted.order_number.lower(),
        "orderNumber": extracted.order_number,
        "patientName": "Johnathan Doe",
        "prescriber": extracted.prescriber_name,
        "prescriberLicense": extracted.prescriber_license,
        "brandPrescribed": extracted.brand_prescribed,
        "genericSubstitute": extracted.generic_substitute,
        "instructions": extracted.instructions,
        "confidence": extracted.confidence,
        "status": extracted.status,
        "timeRemaining": "35:00"
    })

    return extracted

@app.post("/api/v1/prescriptions/verify", response_model=VerifyPrescriptionResponse)
def verify_prescription(payload: VerifyPrescriptionRequest):
    """
    Pharmacist-in-the-loop digital signoff (FDA 21 CFR Part 11 compliant).
    """
    verified_at = datetime.now(timezone.utc).isoformat()
    
    # Compute SHA-256 non-repudiation audit hash
    sig_payload = f"{payload.prescription_id}|{payload.license_number}|{verified_at}"
    audit_hash = hashlib.sha256(sig_payload.encode()).hexdigest()

    append_audit_record(payload, verified_at, audit_hash)

    # Update in-memory queue status
    for item in PREVIEW_QUEUE:
        if item.get("id") == payload.prescription_id or item.get("orderNumber") == payload.prescription_id:
            item["status"] = "verified" if payload.approved else "rejected"
            item["verifiedBy"] = payload.pharmacist_name

    return VerifyPrescriptionResponse(
        prescription_id=payload.prescription_id,
        status="verified" if payload.approved else "rejected",
        verified_by=payload.pharmacist_name,
        license_number=payload.license_number,
        audit_signature=f"GM-SIG-{audit_hash[:16].upper()}",
        verified_at=verified_at
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8002"))
    print(f"[OCR Service] Python FastAPI listening on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
