-- =====================================================================
-- Phase 4: Regulatory Compliance, Clinical Safety & FDA Data
-- Applies safely after 01_schema.sql to establish an append-only ledger
-- and persistent FDA Orange Book source-of-truth tables.
-- =====================================================================

ALTER TABLE audit_trail_logs
    ADD COLUMN IF NOT EXISTS ledger_scope TEXT NOT NULL DEFAULT 'SYSTEM',
    ADD COLUMN IF NOT EXISTS sequence_number BIGINT,
    ADD COLUMN IF NOT EXISTS previous_hash CHAR(64),
    ADD COLUMN IF NOT EXISTS record_hash CHAR(64),
    ADD COLUMN IF NOT EXISTS signature_algorithm VARCHAR(32) NOT NULL DEFAULT 'SHA-256';

CREATE UNIQUE INDEX IF NOT EXISTS audit_trail_ledger_sequence_unique
    ON audit_trail_logs (ledger_scope, sequence_number);
CREATE UNIQUE INDEX IF NOT EXISTS audit_trail_record_hash_unique
    ON audit_trail_logs (record_hash) WHERE record_hash IS NOT NULL;

CREATE OR REPLACE FUNCTION audit_trail_chain_record()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    prior_hash CHAR(64);
BEGIN
    NEW.ledger_scope := COALESCE(NEW.tenant_id::text, 'SYSTEM');
    SELECT record_hash INTO prior_hash
      FROM audit_trail_logs
     WHERE ledger_scope = NEW.ledger_scope
     ORDER BY sequence_number DESC NULLS LAST
     LIMIT 1
     FOR UPDATE;

    NEW.sequence_number := COALESCE((SELECT MAX(sequence_number) + 1 FROM audit_trail_logs WHERE ledger_scope = NEW.ledger_scope), 1);
    NEW.previous_hash := prior_hash;
    NEW.record_hash := encode(digest(concat_ws('|', NEW.ledger_scope, NEW.sequence_number, COALESCE(NEW.previous_hash, ''), NEW.actor_id::text, NEW.actor_name, NEW.actor_role, NEW.action, NEW.resource_type, NEW.resource_id, NEW.details::text, NEW.signature_hash, NEW.created_at::text), 'sha256'), 'hex');
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION reject_audit_trail_mutation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION 'audit_trail_logs is append-only; historical clinical records cannot be changed or deleted';
END;
$$;

DROP TRIGGER IF EXISTS audit_trail_chain_on_insert ON audit_trail_logs;
CREATE TRIGGER audit_trail_chain_on_insert
    BEFORE INSERT ON audit_trail_logs FOR EACH ROW EXECUTE FUNCTION audit_trail_chain_record();
DROP TRIGGER IF EXISTS audit_trail_reject_mutation ON audit_trail_logs;
CREATE TRIGGER audit_trail_reject_mutation
    BEFORE UPDATE OR DELETE ON audit_trail_logs FOR EACH ROW EXECUTE FUNCTION reject_audit_trail_mutation();

CREATE TABLE IF NOT EXISTS fda_sync_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_url TEXT NOT NULL,
    dataset_checksum CHAR(64) NOT NULL,
    status VARCHAR(16) NOT NULL CHECK (status IN ('running', 'succeeded', 'failed')),
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    record_count INTEGER NOT NULL DEFAULT 0,
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fda_orange_book_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_key VARCHAR(32) UNIQUE NOT NULL,
    application_number VARCHAR(16) NOT NULL,
    product_number VARCHAR(8) NOT NULL,
    ingredient TEXT NOT NULL,
    dosage_form_route TEXT NOT NULL,
    trade_name TEXT NOT NULL,
    applicant TEXT NOT NULL,
    strength TEXT NOT NULL,
    therapeutic_equivalence_code VARCHAR(16),
    reference_listed_drug BOOLEAN NOT NULL DEFAULT FALSE,
    reference_standard BOOLEAN NOT NULL DEFAULT FALSE,
    application_type VARCHAR(8) NOT NULL,
    approval_date DATE,
    patents JSONB NOT NULL DEFAULT '[]'::jsonb,
    exclusivities JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_checksum CHAR(64) NOT NULL,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS fda_orange_book_ingredient_idx ON fda_orange_book_products (ingredient);
CREATE INDEX IF NOT EXISTS fda_orange_book_te_code_idx ON fda_orange_book_products (therapeutic_equivalence_code);
