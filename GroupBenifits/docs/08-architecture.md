# Architecture Decisions (ADRs)

P0 platform decisions that must be implemented before any feature code is written.

---

## ADR-1: React State Management — Zustand

**Decision:** Use Zustand for all cross-screen client state. Do not use Context API or Redux.

**Rationale:** Context causes unnecessary re-renders across deep component trees. Redux is over-engineered for a demo app. Zustand provides a minimal, hook-based API with zero boilerplate and direct slice isolation.

### State Slices

| Store Slice | Owned State | Consumer Screens |
|-------------|-------------|-----------------|
| `employerStore` | Active employer group ID, group name, plan year | All screens (global header) |
| `personaStore` | Current persona, persona RACI, persona-aware nav | Global switcher, all guarded routes |
| `enrollmentStore` | Active enrollment session, step index, elections in progress, draft elections | Epic 3 enrollment wizard |
| `requirementsStore` | Active workspace, extracted rules, conflict list, resolution status | Epic 5 requirements studio |
| `uiStore` | Side panel open/close, loading states, toast queue, modal stack | Layout, shared components |

### Persistence Strategy

| Store | Storage | Reason |
|-------|---------|--------|
| `employerStore` | `sessionStorage` | Page reloads must not reset active employer context |
| `personaStore` | `sessionStorage` | Persona switch survives tab refresh |
| `enrollmentStore` (draft) | `sessionStorage` | Draft elections survive browser refresh mid-wizard |
| `requirementsStore` | In-memory only | Workspace loads clean every session; user re-uploads documents |
| `uiStore` | In-memory only | Transient UI state; never persisted |

### P0 Acceptance Criteria

- Active employer group is available on all screens without prop drilling
- Persona switcher changes role without page reload
- Enrollment wizard draft survives a browser refresh
- Requirements workspace loads clean on every session start

---

## ADR-2: File Storage Architecture — Epic 5 Document Storage

**Decision:** Implement a `DocumentStorageService` interface that abstracts local disk (demo) from Google Cloud Storage (production).

### DocumentStorageService Interface

```ts
interface DocumentStorageService {
  upload(file: Buffer, path: string, metadata: DocumentMetadata): Promise<string>;
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  getMetadata(path: string): Promise<DocumentMetadata>;
}
```

### Storage Path Convention

```
employers/{employerId}/documents/{documentId}/original.{ext}
employers/{employerId}/documents/{documentId}/extracted.json
employers/{employerId}/documents/{documentId}/requirements.json
```

Example: `employers/ACM-001/documents/DOC-2027-0001/original.pdf`

### Document Lifecycle States

```
UPLOADED → VALIDATING → VALIDATED → PROCESSING → EXTRACTED
  → ANALYZED → REQUIREMENTS_GENERATED → COMPLETED
                                              ↓ (on error)
                                            FAILED
```

### Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-5.1 | MIME type allowlist: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| FR-5.2 | Max file size: 25 MB per document |
| FR-5.3 | Max documents per workspace: 10 |
| FR-5.4 | Storage path follows `employers/{id}/documents/{docId}/original.{ext}` convention |
| FR-5.5 | Lifecycle state transitions must be persisted — document survives server restart |
| FR-5.6 | SHA-256 hash stored at upload time for integrity verification |
| FR-5.7 | Document metadata stored in LowDB; binary stored on disk/GCS |
| FR-5.8 | All extracted business rules are traceable to the source document ID and page number |

### Implementation Notes

- **Local demo:** `multer` writes to `data/uploads/`. `LocalDiskStorageService` implements the interface using `fs`.
- **Production:** `GCSStorageService` implements the same interface using `@google-cloud/storage`. Swap via `STORAGE_PROVIDER=gcs` env var.
- **LowDB** stores metadata only — binary files never go into JSON.
- Magic byte validation (`%PDF-` prefix) supplements MIME type check — cannot trust browser-supplied `Content-Type` alone.

### P0 Checklist

- [ ] `DocumentStorageService` interface defined before any upload route is written
- [ ] `LocalDiskStorageService` implemented and passing integration tests
- [ ] Upload route validates MIME + extension + magic bytes
- [ ] Lifecycle state machine implemented with state transition guards
- [ ] Document metadata persisted in LowDB `documents.json`
- [ ] SHA-256 computed and stored at upload time

---

## ADR-3: Environment and Configuration Management

**Decision:** All configuration from environment variables. Zod validates the full schema at server startup — missing required vars crash fast with a clear error.

### `.env.example`

```bash
# Server
NODE_ENV=development
PORT=3001

# AI
AI_PROVIDER=vertex-ai
GEMINI_CHAT_MODEL=gemini-2.0-flash
GEMINI_DOCUMENT_MODEL=gemini-1.5-pro
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
GCP_PROJECT_ID=your-project-id

# Storage
STORAGE_PROVIDER=local          # local | gcs
GCS_BUCKET_NAME=group-benefits-demo-uploads

# Data
DATA_PROVIDER=lowdb             # lowdb | memory
DATA_DIR=./data

# Carrier mock endpoints
CARRIER_MEDICAL_URL=http://localhost:4001/api/v1
CARRIER_DENTAL_URL=http://localhost:4002/api/v1
CARRIER_VISION_URL=http://localhost:4003/api/v1
CARRIER_LIFE_URL=http://localhost:4004/api/v1

# Payroll mock endpoint
PAYROLL_MOCK_URL=http://localhost:4010/api/v1

# Auth
AUTH_MODE=mock                  # mock | jwt

# Feature flags
FEATURE_AI_REQUIREMENTS=true
FEATURE_AI_DOCUMENT_INGESTION=true
FEATURE_PLAN_VERSIONING=true
FEATURE_LIFE_EVENTS=true
FEATURE_CARRIER_INTEGRATION=true
FEATURE_PAYROLL_INTEGRATION=true
FEATURE_IMPACT_ANALYSIS=false
```

### Zod Startup Validation

```ts
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3001),
  AI_PROVIDER: z.enum(['vertex-ai', 'gemini-api']),
  GEMINI_CHAT_MODEL: z.string(),
  GEMINI_DOCUMENT_MODEL: z.string(),
  STORAGE_PROVIDER: z.enum(['local', 'gcs']),
  DATA_PROVIDER: z.enum(['lowdb', 'memory']),
  AUTH_MODE: z.enum(['mock', 'jwt']),
  FEATURE_AI_REQUIREMENTS: z.coerce.boolean().default(true),
  FEATURE_AI_DOCUMENT_INGESTION: z.coerce.boolean().default(true),
  FEATURE_PLAN_VERSIONING: z.coerce.boolean().default(true),
  FEATURE_LIFE_EVENTS: z.coerce.boolean().default(true),
  FEATURE_CARRIER_INTEGRATION: z.coerce.boolean().default(true),
  FEATURE_PAYROLL_INTEGRATION: z.coerce.boolean().default(true),
  FEATURE_IMPACT_ANALYSIS: z.coerce.boolean().default(false),
});

export const env = envSchema.parse(process.env);
```

If any required variable is missing, `envSchema.parse()` throws a `ZodError` with the exact missing field name. The server does not start.

### Feature Flags

Feature flags are consumed via a shared `featureFlags` object derived from `env`:

```ts
export const featureFlags = {
  aiRequirements: env.FEATURE_AI_REQUIREMENTS,
  aiDocumentIngestion: env.FEATURE_AI_DOCUMENT_INGESTION,
  planVersioning: env.FEATURE_PLAN_VERSIONING,
  lifeEvents: env.FEATURE_LIFE_EVENTS,
  carrierIntegration: env.FEATURE_CARRIER_INTEGRATION,
  payrollIntegration: env.FEATURE_PAYROLL_INTEGRATION,
  impactAnalysis: env.FEATURE_IMPACT_ANALYSIS,
};
```

Routes guarded by a disabled flag return `HTTP 501 Not Implemented`:

```json
{ "error": "Feature not enabled", "feature": "aiRequirements" }
```

### Security Rules

- `.env` MUST be in `.gitignore` — never committed
- `.env.example` IS committed — contains no secrets, only variable names and safe defaults
- Production secrets go in GCP Secret Manager — never in `.env` on a deployed host
- `GOOGLE_APPLICATION_CREDENTIALS` points to a service account JSON file — this file MUST be in `.gitignore`

### Demo Personas (`AUTH_MODE=mock`)

In `AUTH_MODE=mock`, any of the 8 persona IDs is accepted as a Bearer token — no password validation. A nav-level persona switcher calls `POST /api/auth/switch` with `{ "personaId": "P-001" }` and receives a mock JWT.

| Persona ID | Name | Role |
|-----------|------|------|
| P-001 | Alex Chen | Benefits Administrator |
| P-002 | Maria Torres | HR Administrator |
| P-003 | James Wilson | Employer/Group Admin |
| P-004 | Rachel Kim | Employee |
| P-005 | David Park | Benefits Analyst |
| P-006 | Susan Carter | Carrier Administrator |
| P-007 | Mark Johnson | Payroll Administrator |
| P-008 | Lisa Anderson | Business Analyst / Product Manager |

### P0 Checklist

- [ ] `.env.example` committed to repo at project root
- [ ] `.env` and `service-account.json` in `.gitignore`
- [ ] Zod env schema validates on server startup — missing var crashes with clear message
- [ ] Feature flag constants exported from a single module (`config/featureFlags.ts`)
- [ ] All 8 demo personas defined in `seed/auth/personas.json`
- [ ] Mock auth middleware accepts persona ID as Bearer token in `AUTH_MODE=mock`
