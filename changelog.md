# Changelog

## [1.5.0] - 2026-09-09

### Added
- **Phase 4 compliance foundation**:
  - FDA Orange Book worker now downloads and validates the FDA ZIP archive, normalizes Products/Patent/Exclusivity records, produces deterministic checksums/diffs, and supports PostgreSQL upserts.
  - `04_phase4_compliance.sql` introduces FDA source tables plus a per-tenant append-only SHA-256 hash-chain ledger; update and delete attempts are rejected by database triggers.
  - Pharmacist sign-offs calculate the required SHA-256 payload and persist a PHI-minimized Part 11 audit entry when the production database is configured.

### Changed
- OCR CORS now uses an explicit `CORS_ALLOWED_ORIGINS` allowlist rather than wildcard credentialed cross-origin access.
## GenericMed Enterprise & Multi-Tenant Platform

> **Maintenance rule:** Add new release entries directly below `Unreleased`. Use the section headings `Added`, `Changed`, `Fixed`, and `Removed`; omit a heading only when that category has no entries for the release.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Real-time WebSockets integration for continuous courier GPS telemetry in `OrderTrackingScreen`.
- Integration of HTML5 `navigator.mediaDevices.getUserMedia` for hardware smartphone camera capture in `RxScannerScreen`.
- Connection of live PostgreSQL 16 database and Kong API Gateway with JWT session rotation.
- Automated monthly FDA Orange Book synchronization script.

## [1.4.0] - 2026-09-08

### Added
- **Real-Time Courier Telemetry Engine (`src/services/telemetry.ts`)**:
  - Live GPS waypoint streaming service emitting real-time latitude, longitude, speed (km/h), heading (degrees), and battery levels.
  - Interactive route map in `OrderTrackingScreen.tsx` with animated courier marker progression and live telemetry HUD.
- **Hardware WebRTC Prescription Camera (`RxScannerScreen.tsx`)**:
  - Live video stream using `navigator.mediaDevices.getUserMedia()` with low-light torch/flashlight constraints.
  - Snapshot canvas capture rendering full-resolution prescription photos directly into the OCR pipeline.
  - Hardware source toggle supporting Live WebRTC, high-resolution demo fixture, and custom PDF/JPG file upload.
- **Dispensary Barcode Gun Listener (`PharmacyPortalScreen.tsx`)**:
  - Global keyboard-wedge listener capturing rapid HID input (< 50ms per key) from USB / Bluetooth laser barcode scanners.
  - Automatic validation of 1D NDC barcodes (`0071-0156-23`) against active order prescription items with toast verification alerts.
- **Thermal Label Print Engine (`PharmacyPortalScreen.tsx`)**:
  - Printable 4x6 Zebra ZD420 / ESC-POS thermal label layout with SVG barcodes and serialized tamper-evident security tape (`GM-SEAL-88219-BK`).
  - Native `window.print()` trigger for direct dispensary thermal printing.

---

## [1.3.0] - 2026-09-08

### Added
- **Multi-Tenant PostgreSQL 16 Data Layer (`backend/db/`)**:
  - `01_schema.sql`: Comprehensive DDL schema with UUID keys and foreign key constraints across 10 core tables (`tenants`, `users`, `medicines`, `prescriptions`, `orders`, `order_items`, `pharmacy_hubs`, `batch_lots`, `wholesale_orders`, `audit_trail_logs`).
  - `02_rls_policies.sql`: Strict Row-Level Security (RLS) policies enforcing tenant isolation and session context injection (`set_tenant_context`).
  - `03_seed_data.sql`: Production seed data matching canonical clinical datasets.
- **Medicine & Catalog Microservice (`backend/services/catalog/`)**:
  - Go REST service with endpoints for fuzzy drug searching, active salt matching, and bio-equivalence AUC calculations.
  - Multi-stage Dockerfile (`backend/services/catalog/Dockerfile`).
- **Prescription OCR Microservice (`backend/services/ocr/`)**:
  - Python FastAPI service for prescription document parsing, clinical entity extraction, and confidence scoring.
  - Pharmacist digital signature endpoint with SHA-256 audit hash generation (21 CFR Part 11).
  - Dockerfile (`backend/services/ocr/Dockerfile`).
- **Order & Dispatch Microservice (`backend/services/order/`)**:
  - Node.js Express + TypeScript microservice with 35-min SLA state machine.
  - Tamper-evident seal generator and 4-digit doorstep delivery PIN verification.
  - Dockerfile (`backend/services/order/Dockerfile`).
- **API Gateway & Orchestration (`backend/docker-compose.yml`)**:
  - Reverse proxy Nginx API Gateway routing `/api/v1/*` through port 8000.
  - Multi-container Docker Compose file orchestrating Postgres 16, Redis 7.2, and all microservices.
- **Frontend Resilient API Client Layer (`src/services/api.ts`)**:
  - Unified TypeScript client connecting React screens to live microservices with zero-regression mock fallback.

---

## [1.2.0] - 2026-09-08

### Added
- **System Architecture & Service Bus Visualizer (`SystemArchitectureScreen.tsx`)**:
  - Interactive 4-layer topology visualizer detailing Client, Edge, Microservices, and Multi-Tenant Data Layer.
  - Interactive telemetry inspector displaying live node status, tech stacks, and latencies.
  - End-to-end interactive workflow traces for Brand Search (Workflow 1), Prescription OCR (Workflow 2), and 35-Min Delivery (Workflow 3).
- **Persistent AI Engineering Context Files**:
  - `decisions.md`: Comprehensive Architectural Decision Records (ADRs) covering RLS, OCR pipelines, bio-equivalence matching, and zero-trust edge security.
  - `rules.md`: Strict engineering, naming, UI/UX consistency, Git commit, and security rules for AI assistants.
  - `memory.md`: Persistent system memory capturing database schemas, API specs, completed features, and multi-year roadmaps.
  - `phases.md`: Master engineering implementation roadmap, milestones, and phased rollout matrix.
  - `changelog.md`: Chronological SemVer release history.
- **Universal Command Palette (`⌘K` / `Ctrl+K`)**:
  - Global shortcut modal allowing instant fuzzy search across all branded and generic medicines.
  - Quick-switch keyboard navigation directly targeting any of the 8 platform screens.
- **Global Toast Bus (`src/App.tsx`)**:
  - Fixed-position floating notification banner with auto-dismiss timer (4000ms) and action confirmation messages.

### Changed
- **Navigation Architecture (`NavigationHeader.tsx`)**:
  - Expanded screen switcher to support all 8 platform screens with category grouping and status badges (`SOC-2`, `AI`, `8410`, `Signed In`).
  - Added visual user identity indicator reflecting active session persona.
- **Customer App Price Comparison UI**:
  - Enhanced bio-equivalence badges to prominently display AUC score and FDA AB rating.
  - Added clear active salt breakdown table with dosage guidelines.

### Fixed
- Fixed mobile device frame toggle overflow on wide desktop monitors.
- Resolved race condition in global keyboard event listener when unmounting modal overlays.

---

## [1.1.0] - 2026-07-22

### Added
- **Multi-Role Authentication & Account Screen (`AuthScreen.tsx`)**:
  - Role-based tabs supporting Patients, Dispensing Pharmacists, Bulk Manufacturers, and Enterprise Super Admins.
  - One-click demo credentials switcher for rapid stakeholder walkthroughs.
  - Complete registration form capturing state medical board licenses, facility names, and delivery addresses.
  - User profile drawer with active prescription count and session termination.
- **Manufacturer cGMP Portal (`ManufacturerPortalScreen.tsx`)**:
  - Production batch lot dossier inspector (`#CP-9021`, Atorvastatin Calcium 20mg, 45k units).
  - High-Performance Liquid Chromatography (HPLC) assay purity metrics (99.82%), dissolution rate (96.4%), and residual solvent counters.
  - Verifiable cryptographic quality token (`cGMP Token #904-QA`).
  - B2B Wholesale Purchase Order management table with cold-chain loading dock manifests.

### Changed
- Refactored `src/types.ts` to add `UserProfile`, `BatchLot`, and `WholesaleOrder` interfaces.
- Standardized status badges across all portals with unified clinical color tokens.

### Fixed
- Fixed tab state reset bug when switching between patient and pharmacist views.

---

## [1.0.0] - 2026-05-18

### Added
- **Core Platform Launch**:
  - **Customer Search & Compare (`CustomerAppScreen.tsx`)**: Real-time generic substitution calculating up to 85.6% savings between originator brands and generic equivalents.
  - **Prescription OCR Scanner (`RxScannerScreen.tsx`)**: Viewfinder viewfinder simulation with animated scanlines, drug name detection, and confidence scoring.
  - **Live Order Tracking (`OrderTrackingScreen.tsx`)**: 35-minute express local fulfillment countdown, courier telemetry simulation, and 4-digit doorstep delivery PIN (`8410`).
  - **Pharmacy Dispensing Workbench (`PharmacyPortalScreen.tsx`)**: NDC barcode verification, lot packing, and tamper-evident security tape generation (`GM-SEAL-88219-BK`).
  - **Enterprise Gateway Screen (`EnterpriseOpsScreen.tsx`)**: Multi-tenant dispensary matrix with gross merchandise volume (GMV), clinical verification queue, and pharmacist digital sign-off.
- **Design System Foundation**:
  - Custom Tailwind CSS v4 styling with medical color palette (`#001026`, `#006c49`, `#6cf8bb`, `#f8f9ff`).
  - Google Fonts integration: Plus Jakarta Sans for headings, Inter for body copy, and JetBrains Mono for NDC and batch codes.
  - Animated CSS scanline, pulse ring, and custom clinical scrollbars in `src/index.css`.

---

## [0.2.0] - 2026-02-14

### Added
- Interactive prescription viewfinder overlay prototype.
- Initial bio-equivalence algorithmic calculation formula based on FDA Orange Book AUC parameters.
- Local mock dataset in `src/data/mockData.ts` featuring Lipitor, Augmentin, Glucophage, Crestor, and Prilosec.
- Mobile phone frame emulator toggle for desktop testing.

### Changed
- Migrated UI layout from generic card grids to an enterprise multi-role dashboard.

### Fixed
- Fixed text truncation issues on drug dosage strings in mobile viewports.

---

## [0.1.0] - 2026-01-10

### Added
- Initial project repository initialization.
- Core TypeScript domain models in `src/types.ts` (`MedicineItem`, `PrescriptionOrder`, `PharmacyHub`).
- Basic HTML5 entrypoint (`index.html`) with Google Fonts and Material Symbols integration.
- Workspace metadata definition in `metadata.json`.
