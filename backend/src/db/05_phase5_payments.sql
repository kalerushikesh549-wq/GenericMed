-- =====================================================================
-- Phase 5: Payments, settlements, insurance estimates, and subscriptions.
-- No PAN, CVV, member ID, or raw EDI payload is stored in these tables.
-- =====================================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    provider VARCHAR(32) NOT NULL CHECK (provider IN ('stripe', 'demo')),
    provider_payment_id VARCHAR(255) UNIQUE NOT NULL,
    payment_method_type VARCHAR(32) NOT NULL,
    amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(32) NOT NULL CHECK (status IN ('requires_payment_method', 'authorized', 'succeeded', 'failed', 'refunded')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_transaction_id UUID NOT NULL REFERENCES payment_transactions(id) ON DELETE RESTRICT,
    hub_id UUID REFERENCES pharmacy_hubs(id) ON DELETE SET NULL,
    platform_fee_cents INTEGER NOT NULL CHECK (platform_fee_cents >= 0),
    hub_payout_cents INTEGER NOT NULL CHECK (hub_payout_cents >= 0),
    courier_payout_cents INTEGER NOT NULL CHECK (courier_payout_cents >= 0),
    status VARCHAR(24) NOT NULL CHECK (status IN ('pending', 'paid', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS insurance_adjudication_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    claim_reference_hash CHAR(64) NOT NULL,
    payer_name VARCHAR(255) NOT NULL,
    adjudication_status VARCHAR(32) NOT NULL CHECK (adjudication_status IN ('estimated', 'adjudicated', 'rejected')),
    brand_copay_cents INTEGER,
    generic_copay_cents INTEGER,
    cash_price_cents INTEGER NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS insurance_quote_order_idx ON insurance_adjudication_quotes (order_id, created_at DESC);

CREATE TABLE IF NOT EXISTS refill_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE RESTRICT,
    cadence_days INTEGER NOT NULL CHECK (cadence_days IN (30, 90)),
    payment_transaction_id UUID REFERENCES payment_transactions(id) ON DELETE SET NULL,
    status VARCHAR(24) NOT NULL CHECK (status IN ('active', 'paused', 'cancelled')),
    next_charge_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
