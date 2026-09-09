-- =====================================================================
-- GenericMed Enterprise & Multi-Tenant Platform Database Schema
-- Target Engine: PostgreSQL 16.x
-- File: 01_schema.sql
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tenants Table (Pharmacy Chains, Hospital Networks, Manufacturers)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    tenant_code VARCHAR(64) UNIQUE NOT NULL,
    tier VARCHAR(32) NOT NULL DEFAULT 'standard', -- 'standard', 'enterprise', 'hospital'
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',  -- 'ACTIVE', 'SUSPENDED', 'PENDING'
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (Patients, Pharmacists, Manufacturers, Admins)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(64),
    role VARCHAR(32) NOT NULL, -- 'patient', 'pharmacist', 'manufacturer', 'enterprise_admin'
    license_number VARCHAR(128),
    facility_name VARCHAR(255),
    company_name VARCHAR(255),
    delivery_address TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Pharmacy Hubs Table (Physical Dispensary Locations)
CREATE TABLE IF NOT EXISTS pharmacy_hubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(128) NOT NULL,
    address TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    dispatch_sla_mins INTEGER DEFAULT 35,
    generic_match_rate NUMERIC(5, 2) DEFAULT 99.00,
    platform_take_rate NUMERIC(5, 2) DEFAULT 8.50,
    monthly_gmv NUMERIC(12, 2) DEFAULT 0.00,
    status VARCHAR(32) DEFAULT 'ONLINE', -- 'ONLINE', 'STANDBY', 'MAINTENANCE'
    rating NUMERIC(3, 2) DEFAULT 4.90,
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Medicines & Molecules Catalog Table
CREATE TABLE IF NOT EXISTS medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_name VARCHAR(255) NOT NULL,
    brand_manufacturer VARCHAR(255) NOT NULL,
    brand_price NUMERIC(10, 2) NOT NULL,
    generic_name VARCHAR(255) NOT NULL,
    generic_manufacturer VARCHAR(255) NOT NULL,
    generic_price NUMERIC(10, 2) NOT NULL,
    savings_percentage NUMERIC(5, 2) GENERATED ALWAYS AS (
        ROUND(((brand_price - generic_price) / NULLIF(brand_price, 0)) * 100, 2)
    ) STORED,
    form VARCHAR(128) NOT NULL,
    active_salt VARCHAR(255) NOT NULL,
    bio_equivalence_score NUMERIC(5, 2) NOT NULL DEFAULT 99.00,
    fda_rating VARCHAR(32) NOT NULL DEFAULT 'AB Rated',
    ndc VARCHAR(64) UNIQUE NOT NULL,
    in_stock BOOLEAN DEFAULT true,
    dosage TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Prescriptions Table (Uploaded Scans & Clinical Reviews)
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(64) UNIQUE NOT NULL,
    image_url TEXT,
    brand_prescribed VARCHAR(255) NOT NULL,
    generic_substitute VARCHAR(255) NOT NULL,
    instructions TEXT NOT NULL,
    refills INTEGER DEFAULT 0,
    ocr_confidence NUMERIC(5, 2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending_review', 
    -- 'pending_review', 'verified', 'packed', 'out_for_delivery', 'delivered', 'rejected'
    prescriber_name VARCHAR(255),
    prescriber_license VARCHAR(128),
    clinic_name VARCHAR(255),
    verified_by_pharmacist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Orders Table (Fulfillment & Delivery)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    order_number VARCHAR(64) UNIQUE NOT NULL,
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    hub_id UUID REFERENCES pharmacy_hubs(id) ON DELETE SET NULL,
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending_review',
    price_brand NUMERIC(10, 2) NOT NULL,
    price_generic NUMERIC(10, 2) NOT NULL,
    savings_total NUMERIC(10, 2) NOT NULL,
    batch_number VARCHAR(64),
    expiry_date VARCHAR(32),
    bin_location VARCHAR(64),
    tamper_seal_id VARCHAR(64) NOT NULL,
    delivery_pin_hash VARCHAR(255) NOT NULL, -- bcrypt hash of 4-digit PIN
    delivery_address TEXT NOT NULL,
    courier_name VARCHAR(255),
    courier_vehicle VARCHAR(255),
    courier_lat NUMERIC(10, 7),
    courier_lng NUMERIC(10, 7),
    time_remaining_mins INTEGER DEFAULT 35,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES medicines(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL
);

-- 8. Manufacturing Batch Lots (cGMP Quality Dossiers)
CREATE TABLE IF NOT EXISTS batch_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_number VARCHAR(64) UNIQUE NOT NULL,
    molecule VARCHAR(255) NOT NULL,
    brand_equivalent VARCHAR(255) NOT NULL,
    yield_units INTEGER NOT NULL,
    expiry_date VARCHAR(32) NOT NULL,
    reactor VARCHAR(64) NOT NULL,
    purity_grade VARCHAR(64) NOT NULL DEFAULT 'USP-NF Grade',
    hplc_assay NUMERIC(5, 2) NOT NULL,
    dissolution NUMERIC(5, 2) NOT NULL,
    bio_equiv_auc NUMERIC(5, 2) NOT NULL,
    residual_solvents VARCHAR(64) NOT NULL DEFAULT '<0.001 ppm',
    status VARCHAR(32) NOT NULL DEFAULT 'PASSED QA', -- 'PASSED QA', 'UNDER TEST', 'QUARANTINE'
    auditor_name VARCHAR(255) NOT NULL,
    cgmp_token VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Wholesale B2B Orders
CREATE TABLE IF NOT EXISTS wholesale_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(64) UNIQUE NOT NULL,
    hub_name VARCHAR(255) NOT NULL,
    store_code VARCHAR(64) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    molecule VARCHAR(255) NOT NULL,
    batch_id UUID REFERENCES batch_lots(id) ON DELETE RESTRICT,
    quantity_units INTEGER NOT NULL,
    package_size VARCHAR(64) NOT NULL,
    tier_rate VARCHAR(64) NOT NULL,
    contract_value NUMERIC(12, 2) NOT NULL,
    fulfillment_status VARCHAR(64) NOT NULL,
    dispatch_eta VARCHAR(64) NOT NULL,
    dock VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Immutable Audit Trail (FDA 21 CFR Part 11 Compliance)
CREATE TABLE IF NOT EXISTS audit_trail_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(32) NOT NULL,
    action VARCHAR(128) NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(128) NOT NULL,
    details JSONB NOT NULL,
    ip_address VARCHAR(45),
    signature_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Optimal Query Performance
CREATE INDEX IF NOT EXISTS idx_medicines_active_salt ON medicines(active_salt);
CREATE INDEX IF NOT EXISTS idx_medicines_brand_name ON medicines(brand_name);
CREATE INDEX IF NOT EXISTS idx_medicines_generic_name ON medicines(generic_name);
CREATE INDEX IF NOT EXISTS idx_prescriptions_tenant ON prescriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_trail_logs(resource_type, resource_id);
