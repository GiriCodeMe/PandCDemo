# Group Benefits AI Demo — Overview

## Application Name

AI-Powered Group Benefits Plan & Requirements Engineering Platform

## Primary Persona

Benefits Administrator / Product Owner

## Secondary Personas

- HR Administrator
- Employer / Group Administrator
- Employee
- Benefits Analyst
- Carrier Administrator
- Payroll Administrator
- Business Analyst / Product Manager

## Core Demo Scenario

A new employer, **Acme Corporation**, is launching a Group Benefits program for 5,000 employees.

The benefits administrator needs to configure:

- Medical
- Dental
- Vision
- Basic Life
- Voluntary Life
- Short-Term Disability
- Long-Term Disability

The system must:

1. Configure the benefits products and plans
2. Define employee and dependent eligibility
3. Support employee enrollment
4. Process qualifying life events
5. Exchange eligibility and deduction information with carriers and payroll
6. Use AI to analyze documents and conversations and generate implementation-ready requirements

---

## AI Model Assignment

### By Capability

| AI Capability | Model | Rationale |
|---------------|-------|-----------|
| AI Chat / Requirements Interview | Gemini 2.0 Flash | Fast, low latency; interactive conversations and clarification questions |
| PDF / Benefits Document Ingestion | Gemini 1.5 Pro | Better suited for long, complex documents and large context windows |
| Requirements Extraction | Gemini 1.5 Pro | Extract business rules, eligibility rules, plan details, and exceptions from source documents |
| Requirements Generation | Gemini 2.0 Flash | Fast generation of user stories, acceptance criteria, and structured outputs |
| Requirements Validation | Gemini 2.0 Flash | Quick comparison, conflict detection, and completeness checks |
| Impact Analysis | Gemini 1.5 Pro | Complex cross-document analysis |
| AI Benefits Assistant (Employee/HR) | Gemini 2.0 Flash | Real-time employee and HR interactions |
| Document Q&A | Gemini 1.5 Pro | Deep contextual analysis across long documents |

### By Epic

| Epic | Primary Model | Use |
|------|--------------|-----|
| Epic 1 — Plan & Product Configuration | — | No AI; configuration is user-driven |
| Epic 2 — Eligibility & Business Rules | Gemini 2.0 Flash | Conflict detection, rule explanation |
| Epic 3 — Enrollment & Life Events | Gemini 2.0 Flash | AI Benefits Assistant, life event guidance |
| Epic 4 — Carrier & Payroll Integration | Gemini 2.0 Flash | Exception analysis, reconciliation explanation |
| Epic 5 — AI Requirements Engineering | Gemini 1.5 Pro + Flash | Pro for ingestion/extraction/Q&A; Flash for interview/generation/validation |

### Streaming Requirements

| Capability | Streaming | Pattern |
|------------|-----------|---------|
| Requirements Interview (Feature 5.3) | Yes | SSE — multi-turn conversation with real-time token streaming |
| Document Ingestion (Feature 5.1) | Yes | SSE — long-running analysis with progress updates |
| Requirements Generation (Feature 5.4) | Yes | SSE — stream generated requirements as they are produced |
| Impact Analysis (Feature 5.7) | Yes | SSE — iterative cross-reference analysis |
| AI Benefits Assistant (Feature 3.6) | Yes | SSE — real-time employee-facing responses |
| Eligibility Simulation (Feature 2.5) | No | Request / Response — deterministic, fast |
| Conflict Detection (Feature 2.6) | No | Request / Response — structured comparison output |

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React + Zustand (see [Architecture](08-architecture.md)) |
| Backend | Node.js |
| AI | Gemini 1.5 Pro + Gemini 2.0 Flash |
| Data | LowDB / JSON file store (see [Data Model](07-data-model.md)) |
| Auth | Mock personas via `AUTH_MODE=mock` (see [Architecture](08-architecture.md)) |
| File Storage | Local disk (demo) / GCS (production) |
