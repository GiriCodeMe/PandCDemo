# Insurance Workbench

An AI-assisted insurance operations demo platform built with React and TypeScript. It provides two functional workspaces — **Underwriting** and **Claims** — with an AI assistant bar, document viewer, and mock data pipelines to demonstrate intelligent insurance workflows.

## Overview

| Workspace | Description |
|---|---|
| **Underwriting Workbench** | Manage life insurance submissions, review applicant medical/financial/lifestyle data, track requirements, and get AI-driven risk recommendations |
| **Claims Workbench** | Process P&C claims incidents, review payments, manage claim queues, and access AI analysis across claim lifecycle |

Both workspaces share a consistent shell UX:
- Collapsible left navigation sidebar
- Bottom AI prompt bar with selectable AI agents (Ask / Act modes)
- Right slide-in panel for Team Chat, AI Chat, and Notifications

### Key Pages

**Underwriting**
- `Dashboard` — KPI metrics and underwriter task list
- `New Submissions` — Searchable/filterable submissions queue
- `Submission Detail` — Tabbed view: Summary, Medical, Financial, Lifestyle, Documents, Requirements, Notes, History
- `Policy Review`, `Renewals`, `Team Performance`, `UnderwritingBoard`

**Claims**
- `Claims Dashboard` — Claims KPIs and adjuster task list
- `Claims Work Queue` — Filtered claims queue
- `Claims Detail` — Tabbed view: Summary, Incident, Medical, Documents, Requirements, Notes, History, Tasks
- `Payments Review`, `Incidents List`, `Team Performance`

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript 5 |
| Routing | react-router-dom v6 |
| Styling | Tailwind CSS v4 |
| Build | Vite 6 |
| UI Components | @headlessui/react v2, @heroicons/react v2 |
| Data | Static JSON mock data (`src/data/`, `src/claims/data/`) |

---

## Prerequisites

- **Node.js** 14 or higher (Node 16–18 recommended for OpenSSL compatibility)
- **npm** 6 or higher

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm start
```

Launches the Vite dev server. Open **http://localhost:5173** in your browser.

### 3. Build for production

```bash
npm run build
```

Output is placed in the `build/` directory and is ready to serve as a static site.

### 4. Run tests

```bash
npm test
```

---

## Project Structure

```
insurance-workbench/
├── public/               # Static assets (logos, manifest)
├── src/
│   ├── App.tsx           # Root router
│   ├── components/       # Shared UI components (Button, Dialog, Input, Header, Layout)
│   ├── pages/            # Underwriting pages (Dashboard, Submissions, Detail, etc.)
│   ├── claims/           # Claims workspace (layout, pages, mock data)
│   ├── data/             # Mock data — submissions.json
│   ├── styles/           # Global CSS and design tokens (theme.ts)
│   └── types.ts          # Shared TypeScript interfaces
├── tailwind.config.js
├── craco.config.js
├── tsconfig.json
└── package.json
```

---

## Notes

- All data is mocked — no backend or API calls are required to run the app.
- The AI assistant bar UI is front-end only; AI agent responses are simulated.
- The `NODE_OPTIONS=--openssl-legacy-provider` flag in the start/build scripts resolves an OpenSSL error on Node.js 17+. If you are on Node 14–16, it is harmless.
