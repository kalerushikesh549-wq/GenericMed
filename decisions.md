# Architectural & Product Decision Records (ADR)
## GenericMed Enterprise & Multi-Tenant Platform

> **Document control:** Add an ADR for every material product, architecture, security, data-model, or integration decision. Do not rewrite accepted decisions to match a later implementation; mark them `Superseded` and link the successor ADR instead.

This document captures all high-impact technical, architectural, and product decisions made for **GenericMed**. Each Architectural Decision Record (ADR) outlines the context, rationale, alternatives considered, and downstream consequences to ensure complete alignment across AI coding assistants and human engineering teams.

---

## Decision Index

| ID | Title | Status | Date | Primary Scope |
| :--- | :--- | :--- | :--- | :--- |
| **[ADR-001](#adr-001-multi-tenant-architecture--data-isolation-model)** | Multi-Tenant Architecture & Data Isolation Model | `Accepted` | 2026-01-18 | Architecture & Security |
| **[ADR-002](#adr-002-dual-stage-prescription-ocr--clinical-verification-pipeline)** | Dual-Stage Prescription OCR & Clinical Verification Pipeline | `Accepted` | 2026-02-04 | AI & Clinical Operations |
| **[ADR-003](#adr-003-bio-equivalence-salt-matching-engine--fda-orange-book-indexing)** | Bio-Equivalence Salt-Matching Engine & FDA Orange Book Indexing | `Accepted` | 2026-02-22 | Catalog & Pharmacokinetics |
| **[ADR-004](#adr-004-unified-multi-portal-single-page-application-spa-architecture)** | Unified Multi-Portal Single Page Application (SPA) Architecture | `Accepted` | 2026-03-15 | Frontend & UX Architecture |
| **[ADR-005](#adr-005-express-35-minute-fulfillment-tamper-evident-seals--otp-handover)** | Express 35-Minute Fulfillment, Tamper-Evident Seals & OTP Handover | `Accepted` | 2026-04-10 | Logistics & Compliance |
| **[ADR-006](#adr-006-cgmp-quality-assurance-tokens--wholesale-batch-traceability)** | cGMP Quality Assurance Tokens & Wholesale Batch Traceability | `Accepted` | 2026-05-02 | B2B & Supply Chain |
| **[ADR-007](#adr-007-global-keyboard-first-command-palette-k-navigation)** | Global Keyboard-First Command Palette (`⌘K`) Navigation | `Accepted` | 2026-06-12 | Usability & Workflow Speed |
| **[ADR-008](#adr-008-zero-trust-edge-security-and-hipaa--21-cfr-part-11-compliance)** | Zero-Trust Edge Security and HIPAA / 21 CFR Part 11 Compliance | `Accepted` | 2026-07-01 | Governance & Compliance |
| **[ADR-009](#adr-009-fda-ingestion-and-append-only-clinical-ledger)** | FDA Ingestion and Append-Only Clinical Ledger | `Accepted` | 2026-09-09 | Regulatory Compliance |
| **[ADR-010](#adr-010-token-only-payments-and-credential-gated-adjudication)** | Token-Only Payments and Credential-Gated Adjudication | `Accepted` | 2026-09-09 | Payments & Insurance |
| **[ADR-011](#adr-011-server-enforced-cold-chain-quarantine)** | Server-Enforced Cold-Chain Quarantine | `Accepted` | 2026-09-09 | Wholesale & IoT |
| **[ADR-012](#adr-012-frontend--backend-workspace-separation)** | Frontend & Backend Workspace Separation | `Accepted` | 2026-09-09 | Repository Architecture |

---

### ADR-001: Multi-Tenant Architecture & Data Isolation Model

- **Decision Title**: Multi-Tenant Architecture & Data Isolation Model
- **Date**: 2026-01-18
- **Status**: `Accepted`

#### Context / Problem
GenericMed serves independent pharmacy chains, enterprise hospital networks, bulk pharmaceutical manufacturers, and retail patients. Each pharmacy tenant maintains proprietary pricing schedules, prescription fulfillment queues, and customer health information. We needed a multi-tenant data isolation strategy that satisfies HIPAA security mandates without ballooning infrastructure management overhead and database connection pooling costs.

#### Decision Taken
We adopted a **shared PostgreSQL 16 database with strict Row-Level Security (RLS)** and tenant ID partition keys (`tenant_id UUID`), managed through connection-pooled session variables in PgBouncer:
```sql
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON prescriptions
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
```

#### Reasoning
1. **Security & Regulatory Compliance**: PostgreSQL RLS enforces tenant separation at the kernel database level, eliminating reliance on individual developer `WHERE tenant_id = ?` query hygiene.
2. **Operational Efficiency**: Avoids managing hundreds of distinct database instances or schemas, simplifying migrations, indexing, and backup strategies.
3. **Cross-Tenant Aggregations**: Enables Enterprise Super Admins to run anonymized clinical analytics and macro price comparison indexes across all tenants seamlessly.

#### Alternatives Considered
- **Database-per-Tenant (Isolated RDS instances)**:
  - *Pros*: Complete physical hardware isolation, zero leak probability.
  - *Cons*: Prohibitive infrastructure cost at scale; tedious schema migrations across hundreds of tenant databases; excessive cold connection latency.
- **Schema-per-Tenant (Shared DB, separate PostgreSQL schemas)**:
  - *Pros*: Logical isolation without dedicated instances.
  - *Cons*: Connection pool saturation; complex schema migration scripts; migration tool compatibility limitations.

#### Impact on Project
- Every table containing tenant-scoped data must include a `tenant_id` foreign key.
- API middleware must validate tenant credentials and inject `SET LOCAL app.current_tenant_id = ?` on every acquired database connection.
- Development requires strict testing of tenant leakage in unit and integration test suites.

---

### ADR-002: Dual-Stage Prescription OCR & Clinical Verification Pipeline

- **Decision Title**: Dual-Stage Prescription OCR & Clinical Verification Pipeline
- **Date**: 2026-02-04
- **Status**: `Accepted`

#### Context / Problem
Paper doctor prescriptions exhibit wide variability: cursive doctor handwriting, printed clinic slips, skewed smartphone photo angles, and varying lighting. An incorrect optical character recognition (OCR) transcription for a drug dosage or active salt poses severe clinical and life-safety risks. Fully automated dispensing without human clinical oversight violates state pharmacy board regulations.

#### Decision Taken
We implemented a **two-stage verification pipeline**:
1. **Automated Extraction Stage**: High-resolution image capture passed to Google Cloud Vision OCR coupled with a medical NLP entity extraction model (Python FastAPI microservice) to extract drug name, dosage (sig), quantity, and prescriber DEA/NPI numbers with an algorithmic confidence score.
2. **Mandatory Pharmacist-in-the-Loop Signoff**: Any prescription with confidence < 99.5% or involving controlled substances is automatically routed to the licensed pharmacist workbench (`PharmacyPortalScreen` / `EnterpriseOpsScreen`). The pharmacist must digitally sign off before dispensing or substitution.

#### Reasoning
- **Patient Safety**: Zero-tolerance policy for misidentified medications or dosages.
- **Legal Compliance**: Meets US 21 CFR § 1306 and State Board of Pharmacy requirements requiring licensed pharmacist oversight for generic substitution.
- **High Automation with Safety**: Clean, printed electronic prescriptions pass with > 99% confidence, accelerating fulfillment, while ambiguous cursive slips receive rigorous human review.

#### Alternatives Considered
- **100% Fully Automated AI Dispensing**:
  - *Pros*: Instant checkout and zero labor overhead.
  - *Cons*: Legally prohibited by state boards; unacceptable medical malpractice liability from handwriting hallucinations.
- **100% Manual Manual Pharmacist Entry**:
  - *Pros*: Known legacy workflow.
  - *Cons*: Fails our 35-minute express delivery promise; introduces transcription bottlenecks during peak pharmacy hours.

#### Impact on Project
- Built dedicated OCR scanner viewfinder (`RxScannerScreen.tsx`) with real-time alignment aids and scanline animation.
- Created pharmacist digital signature workflow with timestamped audit trail records.

---

### ADR-003: Bio-Equivalence Salt-Matching Engine & FDA Orange Book Indexing

- **Decision Title**: Bio-Equivalence Salt-Matching Engine & FDA Orange Book Indexing
- **Date**: 2026-02-22
- **Status**: `Accepted`

#### Context / Problem
Originator brand drugs (e.g., Lipitor, Augmentin, Crestor) are heavily marketed, while consumers and pharmacists need instant, legally sound generic alternatives (e.g., Atorvastatin Calcium, Amoxicillin/Clavulanate) with verified therapeutic equivalence. The system must verify that generic alternatives match pharmacokinetic metrics (AUC, Cmax, FDA Orange Book Therapeutic Equivalence rating).

#### Decision Taken
We designed the **Medicine & Catalog Microservice (Go + Redis + Elasticsearch 8.11)** with a specialized chemical salt tokenizer and pre-indexed FDA Orange Book therapeutic codes:
- Medicines are matched by **active salt molecule**, **route of administration**, and **bio-equivalence score** (e.g., 99.4% AUC match).
- Display only FDA **"A-Rated"** (e.g., `AB`, `AP`, `AN`) bio-equivalent generics to ensure complete therapeutic interchangeability.
- Pre-compute real-time savings percentage:
  $$\text{Savings \%} = \frac{\text{Brand Price} - \text{Generic Price}}{\text{Brand Price}} \times 100$$

#### Reasoning
- **Clinical Integrity**: Prevents dangerous substitutions across drugs with narrow therapeutic indexes unless exact bio-equivalence is FDA validated.
- **High Throughput & Low Latency**: Elasticsearch allows fuzzy brand name searching (handling customer typos) while resolving exact salt equivalents in under 12ms.
- **Consumer Trust**: Exposing transparent bio-equivalence scores (e.g., 99.4%) and FDA ratings demystifies generic medicine safety for patients.

#### Alternatives Considered
- **Static Relational SQL Foreign Key Matching**:
  - *Pros*: Simple relational foreign key tables (`generic_substitutes`).
  - *Cons*: Cannot handle phonetic customer misspelling; fails to model complex multi-salt combination therapies or multi-strength variations efficiently.
- **Third-Party Commercial Drug API (e.g., First Databank / Medi-Span)**:
  - *Pros*: Maintained drug database.
  - *Cons*: Very expensive licensing; high latency external API calls; vendor lock-in preventing custom wholesale manufacturing integration.

#### Impact on Project
- Established `MedicineItem` schema in `src/types.ts` containing `activeSalt`, `bioEquivalenceScore`, `fdaRating`, and `ndc`.
- Integrated global catalog search in Customer App and Universal ⌘K Search Palette.

---

### ADR-004: Unified Multi-Portal Single Page Application (SPA) Architecture

- **Decision Title**: Unified Multi-Portal Single Page Application (SPA) Architecture
- **Date**: 2026-03-15
- **Status**: `Accepted`

#### Context / Problem
GenericMed encompasses distinct user personas: Patients (mobile shoppers), Retail Pharmacists (desktop dispensing), Plant Quality Engineers (tablet/desktop cGMP auditors), and Enterprise Executives (monitoring operations). Building 4 separate frontend applications in early stages would fragment code, duplicate UI design tokens, and complicate rapid end-to-end demonstrations.

#### Decision Taken
We architected a **single, unified React 19 + TypeScript + Tailwind CSS application** containing all role-based portals with an integrated device-frame simulator:
- **Global Navigation Bar (`NavigationHeader.tsx`)**: Allows instant role switching and direct access across 8 screens (`enterprise-ops`, `customer-app`, `rx-scanner`, `order-tracking`, `pharmacy-portal`, `manufacturer-portal`, `system-architecture`, `auth`).
- **Responsive Mobile Frame Toggle**: Emulates an iPhone viewport for consumer-facing screens (`customer-app`, `rx-scanner`, `order-tracking`) on desktop displays while naturally adapting to real mobile devices.

#### Reasoning
- **Unified Component Library**: 100% reuse of medical status badges, drug cards, metric counters, and dialogs.
- **Interactive System Demonstration**: Stakeholders, auditors, and investors can experience the entire end-to-end lifecycle—from customer prescription upload to pharmacy fulfillment to manufacturer QA—in a single running application.
- **Zero Monorepo Drift**: Eliminates version drift between client libraries, types, and mock data models.

#### Alternatives Considered
- **Micro-Frontends via Module Federation**:
  - *Pros*: Independent deployment per portal.
  - *Cons*: Extreme setup complexity, shared state synchronization bugs, slow local development cycles.
- **Completely Separate Repositories**:
  - *Pros*: Isolated team ownership.
  - *Cons*: Code duplication across UI tokens; high maintenance overhead for synchronized mock models during development.

#### Impact on Project
- High-performance screen router managed via state in `src/App.tsx`.
- All screens implement standardized navigation and toast feedback handlers (`onNavigateScreen`, `onShowToast`).

---

### ADR-005: Express 35-Minute Fulfillment, Tamper-Evident Seals & OTP Handover

- **Decision Title**: Express 35-Minute Fulfillment, Tamper-Evident Seals & OTP Handover
- **Date**: 2026-04-10
- **Status**: `Accepted`

#### Context / Problem
Online pharmacies traditionally ship medications via national mail carriers taking 2–5 business days. For acute conditions (e.g., antibiotics like Augmentin) or critical maintenance drugs, delays lead to high order cancellation rates and poor clinical outcomes. Furthermore, physical theft, package tampering, and misdelivery of prescription drugs carry severe civil and criminal penalties.

#### Decision Taken
We established a **Hyperlocal Hub Dispatch Network** with a 35-minute SLA coupled with a **Dual-Key Security Handover**:
1. **Hyperlocal Geofencing**: Orders route to the nearest licensed pharmacy hub within a 5-mile radius (e.g., MetroCare Rx Downtown, 1.8 miles away).
2. **Tamper-Evident Security Seal**: Every dispensed prescription package is sealed with a serialized, barcode-tracked security strip (e.g., `GM-SEAL-88219-BK`).
3. **Doorstep 4-Digit PIN Handover**: Couriers cannot mark an order as "Delivered" without entering the recipient's secure 4-digit PIN (e.g., `8410`), generated exclusively on the patient's authenticated device.

#### Reasoning
- **Competitive Advantage**: Delivers generic medications faster than retail pharmacy wait times.
- **Elimination of "Lost Package" Fraud**: Doorstep OTP validation provides indisputable cryptographic proof of delivery.
- **Regulatory Compliance**: Tamper seals ensure compliance with state board rules regarding chain-of-custody for prescription pharmaceuticals.

#### Alternatives Considered
- **Standard 2-Day Courier Mail Delivery**:
  - *Pros*: Cheap, no localized courier fleet management.
  - *Cons*: Cannot handle urgent antibiotics or immediate refills; temperature-sensitive drugs risk spoilage.
- **Unverified Doorstep Dropoff (Leave at door)**:
  - *Pros*: High courier speed.
  - *Cons*: Strictly illegal for controlled medications; high risk of theft and pediatric poisoning.

#### Impact on Project
- Developed `OrderTrackingScreen.tsx` with animated courier telemetry, SLA countdown timers, and live PIN reveal.
- Barcode and tamper seal fields integrated into `PrescriptionOrder` interface in `src/types.ts`.

---

### ADR-006: cGMP Quality Assurance Tokens & Wholesale Batch Traceability

- **Decision Title**: cGMP Quality Assurance Tokens & Wholesale Batch Traceability
- **Date**: 2026-05-02
- **Status**: `Accepted`

#### Context / Problem
Counterfeit generic medications represent a global multi-billion dollar crisis. Pharmacy hubs and hospital networks purchasing bulk generic inventory require verified proof of Current Good Manufacturing Practice (cGMP), High-Performance Liquid Chromatography (HPLC) assay purity, and dissolution profiles before accepting delivery of bulk lots.

#### Decision Taken
We introduced **Cryptographically Signed Batch Dossiers (`BatchLot`)** within the B2B Manufacturer Portal:
- Every manufacturing batch (e.g., `#CP-9021`, Atorvastatin Calcium 20mg, 45,000 units) must have a verified lab audit record.
- Records include HPLC assay purity (e.g., 99.82%), dissolution percentage (96.4%), residual solvents (<0.001 ppm), and lead auditor sign-off.
- Each lot issues an immutable, verifiable token (e.g., `cGMP Token #904-QA`) linked to the manufacturer's FDA Establishment Identifier (FEI).

#### Reasoning
- **Supply Chain Trust**: Pharmacies can purchase bulk generic stock directly from verified plants without intermediary broker markups.
- **Audit Preparedness**: Instant generation of FDA Form 483 / cGMP compliance packages for federal regulators.
- **End-to-End Lineage**: A retail prescription dispensed in Brooklyn can be traced back to the specific synthesis reactor (`Reactor 04-B`) and bulk lot.

#### Alternatives Considered
- **Paper-based Certificates of Analysis (CoA)**:
  - *Pros*: Current industry legacy status quo.
  - *Cons*: Prone to forgery, physical loss, and manual verification delays.
- **Public Blockchain Smart Contracts**:
  - *Pros*: Decentralized immutability.
  - *Cons*: High gas fees, unnecessary public visibility into proprietary manufacturer pricing contracts, regulatory ambiguity.

#### Impact on Project
- Built `ManufacturerPortalScreen.tsx` with live batch QA dossier inspectors, HPLC assay metric cards, and bulk PO handover manifests.

---

### ADR-007: Global Keyboard-First Command Palette (`⌘K`) Navigation

- **Decision Title**: Global Keyboard-First Command Palette (`⌘K`) Navigation
- **Date**: 2026-06-12
- **Status**: `Accepted`

#### Context / Problem
In clinical and enterprise environments, power users (pharmacists, enterprise dispatchers, operations managers) frequently navigate between hundreds of screens, orders, and drug codes. Relying exclusively on mouse clicks across dense navigation trees causes user fatigue and slows down emergency order triage.

#### Decision Taken
We integrated a **system-wide keyboard shortcut palette (`⌘K` / `Ctrl+K`)** accessible across all screens:
- Instant fuzzy lookup across medicine catalog (brand, generic, salt names).
- Rapid screen navigation shortcuts with keyboard `ESC` dismissal.
- Live savings indicators displayed directly in search results.

#### Reasoning
- **Accessibility & Ergonomics**: Complies with power-user ergonomics and accessibility standards.
- **Context Switching Speed**: Pharmacists can verify an incoming prescription and immediately jump to catalog price analysis in under 2 seconds.

#### Alternatives Considered
- **Traditional Top-Level Dropdown Menus**:
  - *Pros*: Familiar to casual web users.
  - *Cons*: Cluttered header navigation bar; slow navigation on complex enterprise data models.

#### Impact on Project
- Global event listeners and modal rendering implemented cleanly in `src/App.tsx`.

---

### ADR-008: Zero-Trust Edge Security and HIPAA / 21 CFR Part 11 Compliance

- **Decision Title**: Zero-Trust Edge Security and HIPAA / 21 CFR Part 11 Compliance
- **Date**: 2026-07-01
- **Status**: `Accepted`

#### Context / Problem
GenericMed handles sensitive Protected Health Information (PHI), digital doctor prescriptions, and financial transactions across multiple independent pharmacy tenants. The platform must comply with HIPAA Security & Privacy Rules and FDA 21 CFR Part 11 requirements for electronic records and electronic signatures.

#### Decision Taken
We adopted a **Zero-Trust Edge & Service Mesh Architecture**:
1. **Edge WAF & TLS 1.3 Termination**: Cloudflare Enterprise edge handles DDoS mitigation, IP geo-fencing, and forces TLS 1.3 encryption in transit.
2. **API Gateway Authentication**: Kong API Gateway validates OAuth2 JWT tokens with short TTLs (15 min) and cryptographically verifies role claims (`patient`, `pharmacist`, `manufacturer`, `enterprise_admin`).
3. **PHI Masking & Ephemeral OCR Storage**: Prescription photos uploaded for OCR are processed in isolated memory buffers; raw unmasked images are encrypted at rest with AES-256 and never logged to stdout or client analytics.
4. **Immutable Audit Trail**: All clinical override actions, pharmacist approvals, and dispense events generate immutable, append-only audit records.

#### Reasoning
- **Legal Mandate**: Healthcare applications in the US cannot operate without verifiable HIPAA BAA compliance and strict PHI isolation.
- **Breach Prevention**: Role-based access control (RBAC) enforced at both gateway and database layer prevents vertical and horizontal privilege escalation.

#### Alternatives Considered
- **Direct Client-to-Microservice Communication**:
  - *Pros*: Lower gateway hop latency.
  - *Cons*: Exposes microservices directly to internet threats; distributes authentication logic across disparate service codebases.

#### Impact on Project
- Documented in detail in `SystemArchitectureScreen.tsx`.
- Reflected in `UserRole` typing and `AuthScreen.tsx` credential management.

---

### ADR-009: FDA Ingestion and Append-Only Clinical Ledger

- **Decision Title**: FDA Ingestion and Append-Only Clinical Ledger
- **Date**: 2026-09-09
- **Status**: `Accepted`

#### Context / Problem
Phase 4 requires regulated source data and clinical sign-off records to remain explainable, reproducible, and resistant to historical modification. Curated FDA fixtures and an ordinary audit table cannot establish either property.

#### Decision Taken
Use the FDA Orange Book ZIP as the source ingestion contract and store normalized Products, Patent, and Exclusivity content with a source checksum and run history. For clinical actions, assign each audit entry a scope-local sequence number, previous hash, and SHA-256 record hash in PostgreSQL. Database triggers calculate the chain and reject `UPDATE` and `DELETE` operations.

#### Reasoning
- The FDA archive exposes the three related datasets together, allowing an approval product to retain its therapeutic-equivalence, patent, and exclusivity context.
- Keeping immutable enforcement in PostgreSQL prevents an application bug or privileged API route from rewriting an accepted clinical action.
- Scope-local chains make tenant verification tractable while preserving tenant isolation.

#### Consequences
- The scheduler must run the worker with `DATABASE_URL`; local runs remain side-effect-free without it.
- Audit entries must be inserted complete because corrective actions are represented by a new compensating record rather than a mutation.
- HIPAA certification, KMS envelope encryption, BAA execution, Elasticsearch alias swaps, and third-party audit remain open Phase 4 work.

---

### ADR-010: Token-Only Payments and Credential-Gated Adjudication

- **Decision Title**: Token-Only Payments and Credential-Gated Adjudication
- **Date**: 2026-09-09
- **Status**: `Accepted`

#### Context / Problem
Payment and insurance workflows must be demonstrable before GenericMed has Stripe Connect approval or clearinghouse contracts. Simulated cards or uncontracted live claims would create unacceptable PCI and HIPAA risk.

#### Decision Taken
Expose a token-only payment boundary that accepts provider payment-method identifiers, never PAN or CVV, and calculates the platform, hub, and courier settlement amounts deterministically. Default to demo mode with no external charge. Return insurance values as explicitly labeled estimates until a contracted clearinghouse adapter is configured; do not persist raw EDI or member identifiers.

#### Consequences
- Stripe Elements/Connect onboarding and clearinghouse 837/835 exchange remain production integration tasks that require credentials, partnership agreements, and compliance review.
- The customer app can safely show transparent cash-versus-coverage comparisons without representing estimates as benefit determinations.
- Refill subscriptions can be created only from an authorized tokenized payment intent and require a scheduled production worker before automatic charging or dispatch.

---

### ADR-011: Server-Enforced Cold-Chain Quarantine

- **Decision Title**: Server-Enforced Cold-Chain Quarantine
- **Date**: 2026-09-09
- **Status**: `Accepted`

#### Context / Problem
Temperature-sensitive shipments cannot rely on a client-side warning to preserve their integrity. A delayed, malformed, or out-of-range reading must never permit delivery acceptance without QA review.

#### Decision Taken
Accept only identified shipment/device telemetry pairs and evaluate the 2°C–8°C rule at ingestion. Any out-of-range temperature changes the server-side shipment state to `quarantined` and returns an actionable alert. Wholesale allocation verifies available released inventory and creates a cryptographic PO signature reference using the signer license and cGMP quality token.

#### Consequences
- A later in-range reading cannot remove quarantine; a separate QA release workflow is required.
- Hardware connectivity is simulated locally, while the API contract supports BLE and cellular sources without embedding a specific vendor SDK.
- The drone delivery pilot remains exploratory and has not been implemented because aviation authorization and safety requirements are external prerequisites.

---

### ADR-012: Frontend & Backend Workspace Separation

- **Decision Title**: Frontend & Backend Workspace Separation
- **Date**: 2026-09-09
- **Status**: `Accepted`

#### Context / Problem
The browser application and server infrastructure shared the repository root, making dependency ownership, environment scope, and startup instructions ambiguous.

#### Decision Taken
Place the React/Vite application in `frontend/` and all API, database, gateway, and service code in `backend/src/`. Each side has its own package manifest and `.env` file. Browser code reaches the backend only using the configured API gateway URL; backend service source is never imported into the frontend.

#### Consequences
- Frontend dependencies are installed and built from `frontend/`; Node backend-service dependencies are installed and built from `backend/src/services/order/`, with backend scripts exposed through `backend/package.json`.
- Docker Compose uses paths relative to `backend/`, so migration, gateway, and service build contexts now begin with `./src/`.
- Docker Desktop is required to start the complete Go, Python, Node, PostgreSQL, Redis, and Nginx backend stack locally.
