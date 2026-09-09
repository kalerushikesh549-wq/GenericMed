# Project Rules & AI Operational Constraints
## GenericMed Enterprise & Multi-Tenant Platform

> **Document control:** Treat this file as binding project context. Update it only when a durable engineering rule changes; record the corresponding rationale in `decisions.md` and the delivered change in `changelog.md`.

This document defines the strict engineering, design, security, and operational rules that **every AI coding assistant and human developer must always follow** when modifying or extending this codebase.

---

## 1. The Cardinal Rule: Non-Destructive Continuity

> [!IMPORTANT]
> **NEVER BREAK EXISTING FUNCTIONALITY UNLESS EXPLICITLY REQUESTED BY THE USER.**
> All refactorings, feature additions, and bug fixes must maintain backward compatibility with existing screens, state contracts, and mock datasets.

- **Preserve All 8 Screen Routes**: Never delete, disable, or break navigation between:
  1. `enterprise-ops` (Enterprise Gateway)
  2. `customer-app` (Customer Search & Compare)
  3. `rx-scanner` (Prescription OCR Scanner)
  4. `order-tracking` (Live Order Tracking & Delivery PIN)
  5. `pharmacy-portal` (Pharmacy Dispensing Workbench)
  6. `manufacturer-portal` (Manufacturer cGMP Portal)
  7. `system-architecture` (System Architecture & Service Bus Visualizer)
  8. `auth` (Multi-Role Authentication & Profile)
- **Do Not Discard Mock Data**: Existing data structures in `src/data/mockData.ts` (e.g., `MEDICINES`, `CURRENT_ORDER`, `PHARMACY_HUBS`, `BATCH_DOSSIER`, `WHOLESALE_ORDERS`, `DEMO_USERS`) are canonical references for UI states and demonstrations. Any new schema fields must be additive or optional.
- **Preserve User Interactions**: Ensure device frame toggling, global `⌘K` command search, and toast alerts remain fully functional after every change.

---

## 2. Coding Standards

### 2.1 TypeScript Strictness & Type Safety
- **No Implicit `any`**: Explicitly declare types for all component props, function parameters, and return types.
- **Single Source of Truth for Types**: All shared domain types must live in `src/types.ts`. Do not declare duplicate ad-hoc types across component files.
- **Discriminated Unions for States**: Use strict union types for status fields (e.g., `status: 'pending_review' | 'verified' | 'packed' | 'out_for_delivery' | 'delivered'`).
- **Immutable State Updates**: Never mutate React state directly. Use functional state updates or spread operators (`[...prev, newItem]`, `{ ...prev, key: value }`).

```typescript
// ✅ CORRECT: Explicit typing and immutable update
interface PrescriptionItemProps {
  order: PrescriptionOrder;
  onVerify: (orderId: string) => void;
}

export const PrescriptionItem: React.FC<PrescriptionItemProps> = ({ order, onVerify }) => {
  // Implementation
};

// ❌ FORBIDDEN: Implicit any and direct mutation
export const PrescriptionItem = ({ order, onVerify }: any) => {
  order.status = 'verified'; // FORBIDDEN!
};
```

### 2.2 React 19 Best Practices
- **Functional Components Only**: Class components are forbidden.
- **Explicit Cleanup in `useEffect`**: Any timers, intervals, DOM event listeners, or WebSocket connections must return an explicit cleanup function.
- **Custom Hooks for Reusable Logic**: Extract non-visual, repeated state logic into custom hooks under `src/hooks/`.
- **Memoization Where Appropriate**: Use `useMemo` and `useCallback` for expensive filtering, search ranking, and callbacks passed to virtualized lists.

### 2.3 Error Handling & Defensive Programming
- **Always Handle Nullable References**: Guard all optional properties with optional chaining (`user?.facilityName ?? 'Unassigned'`).
- **User-Friendly Error Notifications**: Never crash the UI on caught exceptions. Propagate failure messages to the user via the `onShowToast(message)` callback.
- **Graceful Fallbacks**: Display skeleton loaders or empty state cards when collections (e.g., search results, orders) have zero entries.

---

## 3. Folder Structure Rules

```
GenericMed/
├── .git/                      # Git repository version control
├── decisions.md               # Architectural & product decision records (ADR)
├── rules.md                   # AI operational constraints and coding rules (this file)
├── memory.md                  # Project memory, database schemas, endpoints, and roadmap
├── phases.md                  # Implementation roadmap, engineering phases, and milestones
├── changelog.md               # Chronological version change log
├── index.html                 # HTML5 entrypoint with Google Fonts & Material Symbols
├── metadata.json              # Workspace metadata and capabilities descriptor
├── package-lock.json          # Dependency lockfile
├── src/
│   ├── main.tsx               # React application DOM mount entrypoint
│   ├── App.tsx                # Universal screen router, global modal, & toast manager
│   ├── index.css              # Tailwind CSS directives, typography tokens, & animations
│   ├── types.ts               # Canonical TypeScript domain interfaces and type unions
│   ├── components/
│   │   ├── NavigationHeader.tsx   # Top multi-role header with screen tabs & frame switcher
│   │   ├── common/                # Reusable design system components (Badge, Modal, etc.)
│   │   └── screens/               # Self-contained top-level screen modules
│   │       ├── AuthScreen.tsx
│   │       ├── CustomerAppScreen.tsx
│   │       ├── EnterpriseOpsScreen.tsx
│   │       ├── ManufacturerPortalScreen.tsx
│   │       ├── OrderTrackingScreen.tsx
│   │       ├── PharmacyPortalScreen.tsx
│   │       ├── RxScannerScreen.tsx
│   │       └── SystemArchitectureScreen.tsx
│   ├── data/
│   │   └── mockData.ts        # Canonical demo entities, medicines, hubs, and dossiers
│   ├── hooks/                 # Custom React hooks (useSearch, useTimer, useAuth)
│   ├── services/              # API clients, OCR parsers, and calculation engines
│   └── utils/                 # Formatting, currency helpers, and validation utilities
```

### Rules for Placing New Files
1. **New Screen**: Must be placed in `src/components/screens/<ScreenName>Screen.tsx` and registered in `src/types.ts` under `ScreenId` and `src/App.tsx`.
2. **Reusable UI Component**: Must be placed in `src/components/common/<ComponentName>.tsx`.
3. **Domain Types & Interfaces**: Must be added to `src/types.ts`.
4. **Mock Fixtures**: Must be added to `src/data/mockData.ts`.
5. **Business Calculation / Formatting**: Must be placed in `src/utils/`.

---

## 4. Naming Conventions

| Entity | Convention | Example |
| :--- | :--- | :--- |
| **React Components** | `PascalCase.tsx` | `PharmacyPortalScreen.tsx`, `Badge.tsx` |
| **Hook Files** | `camelCase.ts` (`use*`) | `useMedicineCatalog.ts`, `useKeyboardShortcuts.ts` |
| **Utility Files** | `camelCase.ts` | `formatCurrency.ts`, `calculateBioEquivalence.ts` |
| **TypeScript Types & Interfaces** | `PascalCase` | `MedicineItem`, `PrescriptionOrder`, `PharmacyHub` |
| **Type Aliases & Enums** | `PascalCase` | `ScreenId`, `UserRole`, `CustomerTab` |
| **Constants** | `UPPER_SNAKE_CASE` | `MEDICINES`, `DEMO_USERS`, `MAX_SLA_MINUTES` |
| **Variables & Functions** | `camelCase` | `currentScreen`, `handleSelectScreen`, `showToast` |
| **CSS Custom Classes** | `kebab-case` | `animate-scan`, `custom-scrollbar`, `pulse-glow` |
| **IDs & HTML Selectors** | `kebab-case` | `root`, `screen-customer-app`, `search-input` |

---

## 5. UI/UX Consistency Rules

GenericMed enforces a **clinical, high-trust, premium enterprise healthcare aesthetic**. Adhere strictly to these design system tokens:

### 5.1 Color Palette Tokens
| Token Name | Hex Code | Semantic Role |
| :--- | :--- | :--- |
| **Deep Medical Navy** | `#001026` / `#000d1d` | Header background, enterprise screens, dark canvas |
| **Navy Surface** | `#001738` / `#0b2545` | Dark mode cards, borders, elevated surfaces |
| **Clinical Emerald** | `#006c49` | Primary action buttons, verified indicators, active tabs |
| **Bioluminescent Mint** | `#6cf8bb` / `#6ffbbe` | Accent highlights, scan lines, key metrics, badges |
| **Clean Hospital Background** | `#f8f9ff` | Light mode canvas, consumer screen background |
| **Soft Surface Light** | `#eff4ff` / `#ffffff` | Light mode cards, search bars, inputs |
| **Slate / Body Text** | `#0b1c30` / `#44474e` | High-contrast readable typography |
| **Alert / Warning Coral** | `#ba1a1a` / `#ff5449` | QA quarantine, prescription errors, expiry warnings |

### 5.2 Typography Tokens
- **Display Headings**: `'Plus Jakarta Sans', sans-serif` (`font-display font-bold`)
- **Body & Data**: `'Inter', sans-serif` (`font-body`)
- **Technical Codes & Tokens**: `'JetBrains Mono', monospace` (`font-mono`) for NDC codes, batch numbers, tamper seal IDs, and delivery PINs.

### 5.3 Iconography Rules
- Use **Lucide React** (e.g. `Building2`, `Smartphone`, `ScanLine`, `Truck`, `Store`, `Factory`, `Network`) for top-level navigation, action bars, and headers.
- Use **Google Material Symbols Outlined** (`<span className="material-symbols-outlined">...</span>`) for granular status indicators, inline icons, and data table badges.
- Always include accessible labels or tooltip text on icon-only buttons.

### 5.4 Mobile Frame Simulation
- Consumer-focused screens (`customer-app`, `rx-scanner`, `order-tracking`) must support both full-width responsive display and simulated mobile frame mode (`isMobileFrame = true`).
- Maintain the custom mobile frame styling (`max-w-[420px] mx-auto rounded-[40px] shadow-2xl border-[8px] border-[#1e293b]`).

### 5.5 Accessibility (WCAG 2.1 AA)
- Maintain minimum contrast ratio of 4.5:1 for normal text and 3:1 for large headers.
- Interactive buttons must have clear focus rings (`focus:ring-2 focus:ring-[#6cf8bb]`).
- Screen transitions must avoid jarring flashes; use smooth opacity transitions.

---

## 6. Git Commit & Branching Rules

### 6.1 Conventional Commits Specification
All commits must strictly follow the [Conventional Commits](https://www.conventionalcommits.org/) format:
```
<type>(<optional scope>): <short description in present tense>

[optional body explaining rationale and impact]

[optional footer(s)]
```

#### Allowed Types:
- `feat`: A new user-facing feature or screen.
- `fix`: A bug fix or error correction.
- `docs`: Documentation updates only (e.g., `decisions.md`, `rules.md`, `memory.md`).
- `style`: Changes that do not affect code logic (formatting, spacing).
- `refactor`: Code restructuring without changing external behavior or adding features.
- `perf`: Code changes that improve rendering or computation performance.
- `test`: Adding missing tests or correcting existing tests.
- `chore`: Changes to build tooling, dependencies, or configuration.

#### Examples:
```bash
# ✅ Good commits:
feat(scanner): add auto-focus viewfinder overlay for prescription OCR
fix(tracking): correct estimated delivery time countdown calculation
docs(adr): record ADR-008 on zero-trust edge security architecture
refactor(types): unify pharmacy hub metrics under PharmacyHub interface

# ❌ Bad commits:
fixed stuff
wip
update code
changes
```

### 6.2 Branch Naming Conventions
- `feature/<feature-name>` (e.g., `feature/ocr-multi-angle-enhancement`)
- `bugfix/<issue-description>` (e.g., `bugfix/pin-modal-keyboard-dismissal`)
- `hotfix/<critical-patch>` (e.g., `hotfix/security-jwt-validation`)
- `docs/<doc-update>` (e.g., `docs/add-persistent-ai-context`)

---

## 7. Security & Environment Variable Rules

### 7.1 HIPAA & Protected Health Information (PHI) Protection
- **No PHI in Logs**: Never log patient names, dates of birth, street addresses, doctor license numbers, or prescription images to `console.log()` or analytics platforms.
- **Data Minimization**: Only display the minimum necessary patient information required for each user role (e.g., couriers only see delivery address and 4-digit PIN, not medical diagnosis or clinical notes).
- **Client Storage Safeguards**: Never store unencrypted PHI or raw prescription images in `localStorage` or `sessionStorage`.

### 7.2 FDA 21 CFR Part 11 Electronic Signature Compliance
- All clinical actions (e.g., generic substitutions, batch lot QA signoffs, pharmacist verification) must record:
  1. Full Name of the signatory
  2. Professional License / Credential Identifier
  3. Exact UTC Timestamp
  4. Non-repudiable audit hash or token

### 7.3 Secrets & Environment Variables
- **Zero Hardcoded Secrets**: Never commit API keys, cloud credentials, JWT signing secrets, or private keys directly into code.
- **Prefixing**: All client-accessible environment variables in Vite must be prefixed with `VITE_` (e.g., `VITE_API_GATEWAY_URL`, `VITE_MAPBOX_TOKEN`).
- **Sanitization**: All user inputs (prescription notes, search queries, contact numbers) must be sanitized to prevent Cross-Site Scripting (XSS) and SQL/NoSQL injection.

---

## 8. AI Assistant Protocol & Self-Verification Checklist

Before concluding any coding task, the AI assistant must run through this checklist:

- [ ] **No regressions**: Did this change break any of the 8 screens or header screen tabs?
- [ ] **Type integrity**: Are all TypeScript interfaces clean, correctly imported, and free of implicit `any`?
- [ ] **UI consistency**: Does the component respect the medical color tokens (`#001026`, `#006c49`, `#6cf8bb`, `#f8f9ff`) and font hierarchy?
- [ ] **Accessibility check**: Can all new interactive elements be navigated via keyboard and dismissed via `ESC`?
- [ ] **Mock synchronization**: If types were extended, was `src/data/mockData.ts` updated with compatible mock data?
- [ ] **Documentation alignment**: Were any significant architectural decisions or changes documented in `decisions.md` and `changelog.md`?
