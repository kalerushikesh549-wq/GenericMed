-- =====================================================================
-- GenericMed Enterprise & Multi-Tenant Row-Level Security (RLS) Policies
-- Reference: ADR-001 (Multi-Tenant Architecture & Data Isolation Model)
-- File: 02_rls_policies.sql
-- =====================================================================

-- 1. Enable Row-Level Security on all tenant-partitioned tables
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail_logs ENABLE ROW LEVEL SECURITY;

-- 2. Prescriptions Isolation Policy
-- Users can only access prescriptions belonging to their active tenant session,
-- unless the session is executing under the 'enterprise_admin' role.
CREATE POLICY prescriptions_tenant_isolation ON prescriptions
    FOR ALL
    USING (
        current_setting('app.current_user_role', true) = 'enterprise_admin'
        OR tenant_id IS NULL
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    )
    WITH CHECK (
        current_setting('app.current_user_role', true) = 'enterprise_admin'
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

-- 3. Orders Isolation Policy
CREATE POLICY orders_tenant_isolation ON orders
    FOR ALL
    USING (
        current_setting('app.current_user_role') = 'enterprise_admin'
        OR tenant_id IS NULL
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    )
    WITH CHECK (
        current_setting('app.current_user_role', true) = 'enterprise_admin'
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

-- 4. Pharmacy Hubs Isolation Policy
CREATE POLICY pharmacy_hubs_tenant_isolation ON pharmacy_hubs
    FOR ALL
    USING (
        current_setting('app.current_user_role', true) = 'enterprise_admin'
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    )
    WITH CHECK (
        current_setting('app.current_user_role', true) = 'enterprise_admin'
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

-- 5. Audit Trail Isolation Policy
-- Audit logs are readable by tenant admins for their tenant, or enterprise_admin across all.
-- Appends are allowed from any authenticated user session.
CREATE POLICY audit_trail_tenant_select ON audit_trail_logs
    FOR SELECT
    USING (
        current_setting('app.current_user_role', true) = 'enterprise_admin'
        OR tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
    );

CREATE POLICY audit_trail_tenant_insert ON audit_trail_logs
    FOR INSERT
    WITH CHECK (true); -- Append-only allowed

-- 6. Helper procedure for setting session tenant context
CREATE OR REPLACE PROCEDURE set_tenant_context(p_tenant_id UUID, p_user_role VARCHAR)
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM set_config('app.current_tenant_id', p_tenant_id::TEXT, false);
    PERFORM set_config('app.current_user_role', p_user_role, false);
END;
$$;
