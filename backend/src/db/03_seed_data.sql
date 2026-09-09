-- =====================================================================
-- GenericMed Canonical Clinical Seed Data
-- Mirrors src/data/mockData.ts for Production & Testing
-- File: 03_seed_data.sql
-- =====================================================================

-- 1. Insert Tenants
INSERT INTO tenants (id, name, tenant_code, tier, status, contact_email, contact_phone)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'MetroCare Dispensary Network', 'TENANT-METRO-01', 'enterprise', 'ACTIVE', 'ops@metrocarerx.com', '+1-718-555-4082'),
    ('22222222-2222-2222-2222-222222222222', 'Apollo Health Consortium', 'TENANT-APOLLO-02', 'hospital', 'ACTIVE', 'admin@apollohealth.org', '+1-212-555-0199')
ON CONFLICT (tenant_code) DO NOTHING;

-- 2. Insert Users (Demo Passwords bcrypt hashed for 'demo1234')
INSERT INTO users (id, tenant_id, email, password_hash, full_name, phone, role, license_number, facility_name, delivery_address)
VALUES 
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '11111111-1111-1111-1111-111111111111',
        'johnathan.doe@gmail.com',
        '$2b$10$epR.x7wM9z1VvXmXk4z3h.N7gY0Ff4Nq7p5W4B3gY.Hq2E3R4t5y6',
        'Johnathan Doe',
        '+1 (718) 555-0142',
        'patient',
        NULL,
        NULL,
        '742 Evergreen Terr, Brooklyn NY 11201'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '11111111-1111-1111-1111-111111111111',
        'm.vance@metrocarerx.com',
        '$2b$10$epR.x7wM9z1VvXmXk4z3h.N7gY0Ff4Nq7p5W4B3gY.Hq2E3R4t5y6',
        'Dr. Marcus Vance, PharmD',
        '+1 (718) 555-4082',
        'pharmacist',
        'GDL-99201-MH (NY State Board)',
        'MetroCare Central Dispensary #4082',
        '142 Court St, Brooklyn NY 11201'
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        NULL,
        'a.vance@apexbio.com',
        '$2b$10$epR.x7wM9z1VvXmXk4z3h.N7gY0Ff4Nq7p5W4B3gY.Hq2E3R4t5y6',
        'Dr. Alistair Vance',
        '+1 (212) 555-9004',
        'manufacturer',
        'FDA FEI #300482910',
        'Apex BioPharma Labs (Plant 4)',
        NULL
    ),
    (
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        '11111111-1111-1111-1111-111111111111',
        'elena.rostova@genericmed.health',
        '$2b$10$epR.x7wM9z1VvXmXk4z3h.N7gY0Ff4Nq7p5W4B3gY.Hq2E3R4t5y6',
        'Dr. Elena Rostova',
        '+1 (212) 555-0199',
        'enterprise_admin',
        'MD-884102-NY (Board Certified)',
        'GenericMed Enterprise Operations Mesh',
        NULL
    )
ON CONFLICT (email) DO NOTHING;

-- 3. Insert Canonical Medicines
INSERT INTO medicines (id, brand_name, brand_manufacturer, brand_price, generic_name, generic_manufacturer, generic_price, form, active_salt, bio_equivalence_score, fda_rating, ndc, in_stock, dosage)
VALUES 
    (
        '550e8400-e29b-41d4-a716-446655440001',
        'Lipitor 20mg',
        'Pfizer Labs',
        98.50,
        'Atorvastatin Calcium 20mg',
        'Cipla / Teva Multi-Source',
        14.20,
        '30 Tablets (Oral) • Film-coated',
        'Atorvastatin Calcium Trihydrate (20mg equivalent)',
        99.40,
        'AB Rated',
        '0071-0156-23',
        true,
        '1 tablet orally once daily at bedtime (qHS)'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440002',
        'Augmentin 625mg',
        'GSK Pharmaceuticals',
        42.00,
        'Amoxicillin + Pot. Clavulanate 625mg',
        'Aurobindo / Sandoz',
        8.50,
        '10 Tablets • Oral',
        'Amoxicillin Trihydrate + Potassium Clavulanate',
        99.10,
        'A-Rated',
        '43598-445-14',
        true,
        '1 tablet twice daily with meals for 7 days'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440003',
        'Glucophage XR 500mg',
        'Bristol Myers Squibb',
        48.00,
        'Metformin HCl Extended-Release 500mg',
        'Zydus / Teva',
        6.00,
        '100 Tablets ER • Oral',
        'Metformin Hydrochloride (Extended Release)',
        99.60,
        'AB Rated',
        '50268-301-10',
        true,
        '1 tablet once daily with dinner'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440004',
        'Crestor 10mg',
        'AstraZeneca',
        110.00,
        'Rosuvastatin Calcium 10mg',
        'Glenmark / Watson',
        16.00,
        '30 Tablets • Oral',
        'Rosuvastatin Calcium',
        99.20,
        'AB Rated',
        '65862-594-30',
        true,
        '1 tablet once daily'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440005',
        'Prilosec 20mg',
        'Procter & Gamble',
        34.50,
        'Omeprazole Delayed-Release 20mg',
        'Dr. Reddy''s Laboratories',
        7.20,
        '30 Capsules • Oral',
        'Omeprazole Magnesium',
        99.00,
        'AB Rated',
        '55111-123-30',
        true,
        '1 capsule 30 minutes before breakfast'
    )
ON CONFLICT (ndc) DO NOTHING;

-- 4. Insert Pharmacy Hubs
INSERT INTO pharmacy_hubs (id, tenant_id, code, name, region, address, latitude, longitude, dispatch_sla_mins, generic_match_rate, platform_take_rate, monthly_gmv, status, rating, reviews_count)
VALUES 
    ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', '#HUB-104', 'MetroCare Rx Downtown', 'Metro Core East', '142 Court St, Brooklyn, NY 11201', 40.6928, -73.9903, 24, 99.40, 8.50, 412800.00, 'ONLINE', 4.90, 1840),
    ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', '#HUB-108', 'HealthPlus Express Hub West', 'Western Suburbs', '884 86th St, Brooklyn, NY 11228', 40.6189, -74.0264, 29, 98.10, 9.00, 298450.00, 'ONLINE', 4.80, 1210),
    ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', '#HUB-214', 'Apollo Generic Dispatch Depot', 'Industrial North', '520 2nd Ave, New York, NY 10016', 40.7421, -73.9782, 32, 99.80, 8.00, 534100.00, 'ONLINE', 4.90, 2430),
    ('33333333-3333-3333-3333-333333333334', '11111111-1111-1111-1111-111111111111', '#HUB-302', 'St. Jude Community Pharmacy', 'South Bay Medical Center', '2411 Ocean Ave, Brooklyn, NY 11229', 40.5982, -73.9531, 21, 99.20, 8.50, 183600.00, 'ONLINE', 4.90, 940)
ON CONFLICT DO NOTHING;

-- 5. Insert Manufacturing Batch Lot
INSERT INTO batch_lots (id, batch_number, molecule, brand_equivalent, yield_units, expiry_date, reactor, purity_grade, hplc_assay, dissolution, bio_equiv_auc, residual_solvents, status, auditor_name, cgmp_token)
VALUES (
    '44444444-4444-4444-4444-444444444444',
    '#CP-9021',
    'Atorvastatin Calcium 20mg',
    'Lipitor (Pfizer) 20mg',
    45000,
    '11/2026',
    'Reactor 04-B',
    'USP-NF Grade',
    99.82,
    96.40,
    99.40,
    '<0.001 ppm',
    'PASSED QA',
    'Dr. Alistair Vance, Lead Auditor',
    'cGMP Token #904-QA'
)
ON CONFLICT (batch_number) DO NOTHING;

-- 6. Insert Canonical Prescription & Order
INSERT INTO prescriptions (id, tenant_id, patient_id, order_number, brand_prescribed, generic_substitute, instructions, refills, ocr_confidence, status, prescriber_name, prescriber_license, clinic_name)
VALUES (
    '66666666-6666-6666-6666-666666666666',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'ORD-88219',
    'Lipitor 20mg',
    'Atorvastatin Calcium 20mg',
    'Sig: 1 tablet orally once daily at bedtime (qHS) for hyperlipidemia. Dispense: #30. Refills: 3',
    3,
    99.10,
    'out_for_delivery',
    'Dr. Elena Rostova, MD',
    'LIC #MD-88319 / NPI: #18839201',
    'ST. JUDE CARDIOVASCULAR CLINIC'
)
ON CONFLICT (order_number) DO NOTHING;

INSERT INTO orders (id, tenant_id, order_number, patient_id, hub_id, prescription_id, status, price_brand, price_generic, savings_total, batch_number, expiry_date, bin_location, tamper_seal_id, delivery_pin_hash, delivery_address, courier_name, courier_vehicle, time_remaining_mins)
VALUES (
    '77777777-7777-7777-7777-777777777777',
    '11111111-1111-1111-1111-111111111111',
    'ORD-88219',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '33333333-3333-3333-3333-333333333331',
    '66666666-6666-6666-6666-666666666666',
    'out_for_delivery',
    98.50,
    14.20,
    84.30,
    '#CP-9021',
    '11/2026',
    'Bin A-14',
    'GM-SEAL-88219-BK',
    -- Bcrypt hash for PIN '8410'
    '$2b$10$wOaR1sK6zKkL5E3kXzVv3.sT2gG8kY.F3qL5N9p1W2E3R4t5y6u7',
    '742 Evergreen Terr, Brooklyn, NY 11201',
    'Miguel S.',
    'E-Cargo Bike #14 (Heated/Insulated)',
    9
)
ON CONFLICT (order_number) DO NOTHING;
