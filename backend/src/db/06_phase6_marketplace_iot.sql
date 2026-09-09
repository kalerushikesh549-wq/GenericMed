-- =====================================================================
-- Phase 6: B2B wholesale allocation and cold-chain IoT telemetry.
-- =====================================================================

CREATE TABLE IF NOT EXISTS wholesale_inventory_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    batch_id UUID NOT NULL REFERENCES batch_lots(id) ON DELETE RESTRICT,
    available_units INTEGER NOT NULL CHECK (available_units >= 0),
    reserved_units INTEGER NOT NULL DEFAULT 0 CHECK (reserved_units >= 0),
    tier_1_unit_price_cents INTEGER NOT NULL CHECK (tier_1_unit_price_cents >= 0),
    tier_2_unit_price_cents INTEGER NOT NULL CHECK (tier_2_unit_price_cents >= 0),
    tier_3_unit_price_cents INTEGER NOT NULL CHECK (tier_3_unit_price_cents >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, batch_id)
);

CREATE TABLE IF NOT EXISTS wholesale_purchase_order_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wholesale_order_id UUID NOT NULL REFERENCES wholesale_orders(id) ON DELETE RESTRICT,
    signer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    signer_license_number VARCHAR(128) NOT NULL,
    cgmp_token VARCHAR(128) NOT NULL,
    signature_hash CHAR(64) NOT NULL,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cold_chain_shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    batch_id UUID NOT NULL REFERENCES batch_lots(id) ON DELETE RESTRICT,
    shipment_reference VARCHAR(64) UNIQUE NOT NULL,
    device_id VARCHAR(128) NOT NULL,
    min_temperature_c NUMERIC(5,2) NOT NULL DEFAULT 2.00,
    max_temperature_c NUMERIC(5,2) NOT NULL DEFAULT 8.00,
    status VARCHAR(24) NOT NULL CHECK (status IN ('in_transit', 'quarantined', 'accepted')),
    quarantined_at TIMESTAMPTZ,
    quarantine_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cold_chain_telemetry_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES cold_chain_shipments(id) ON DELETE RESTRICT,
    recorded_at TIMESTAMPTZ NOT NULL,
    temperature_c NUMERIC(5,2) NOT NULL,
    humidity_percent NUMERIC(5,2) CHECK (humidity_percent BETWEEN 0 AND 100),
    battery_percent NUMERIC(5,2) CHECK (battery_percent BETWEEN 0 AND 100),
    source VARCHAR(24) NOT NULL CHECK (source IN ('ble', 'cellular', 'simulation')),
    received_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS cold_chain_readings_shipment_time_idx ON cold_chain_telemetry_readings (shipment_id, recorded_at DESC);
