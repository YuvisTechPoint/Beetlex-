# BeetleX Hackathon Platform

A production-grade hackathon management frontend built with **React 19**, **TypeScript (strict)**, **Tailwind CSS**, **MSW**, and **React Router**.

## Prerequisites

- **Node.js 20+** (LTS recommended)
- **npm 10+**

## Setup & Run

```bash
git clone https://github.com/YuvisTechPoint/Beetlex-.git
cd beetlex-hackathon
npm install
npm run dev
```

Open **http://localhost:5173**

See **[SUBMISSION.md](./SUBMISSION.md)** for the evaluator checklist (Loom, email, repo visibility, QA gates).

### Other commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with MSW mock API |
| `npm run build` | TypeScript check + production build |
| `npm run build:perf` | Lighthouse-optimized build (no MSW, static JSON API) |
| `npm run preview` | Serve production build locally |
| `npm run lint` | ESLint on `src/`, `e2e/` |
| `npm run format` | Prettier format `src/` and `e2e/` |
| `npm run qa` | Full automated QA pipeline (build, lint, screenshots, Lighthouse, reports) |
| `npx tsc -b` | TypeScript project references build |

### Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_ENABLE_MSW` | `true` in dev | Enable Mock Service Worker |
| `VITE_DISABLE_MSW` | unset | Set to `true` to skip MSW (use with static API or real backend) |
| `VITE_STATIC_API` | unset | Set to `true` in perf build — serves pre-generated JSON from `/static-api/` |
| `VITE_QA_FAST_MS` | unset | Short mock delays for QA builds |

### Test different roles

Use the **dev toolbar** (bottom-left):

- **Guest** — Landing, events, event details
- **Participant** — + team dashboard, submission
- **Judge** — Judge dashboard
- **Organizer** — Organizer dashboard

Toggle **Overload** in the dev toolbar to simulate registration queue (503/429) and retry UX.

---

## Architecture Decisions

### Why React + TypeScript (strict)

The assignment requires React 18+ with TypeScript. This project uses **React 19** and **`strict: true`** in `tsconfig.app.json` for end-to-end type safety across API contracts, forms (Zod), and UI props. No `any` types are used in application code.

### State management: Zustand + React Query

| Layer | Tool | Rationale |
|-------|------|-----------|
| **Server state** | **React Query** | Events, submissions, scores, and organizer data are fetched remotely. React Query provides caching, deduplication, stale/refetch semantics, and mutation invalidation without boilerplate. |
| **Client state** | **Zustand** | Auth session, UI preferences (dark mode), notification read state, and leaderboard stream cache are local concerns that do not belong in the server cache. Zustand is minimal, supports persistence, and works well with selector subscriptions. |
| **Forms** | **React Hook Form + Zod** | Registration and submission flows need field-level validation, step gating, and draft persistence. RHF keeps re-renders low; Zod schemas are shared between client validation and API shapes. |

**Why not Redux Toolkit or Context alone?** Redux adds ceremony for a frontend with no complex cross-slice middleware needs. Context would cause broad re-renders for auth and notifications at scale. The split matches React community best practice: *React Query for async server data, Zustand for client UI state.*

### Styling: Tailwind CSS + shadcn/ui

- **Tailwind** — utility-first, responsive breakpoints, design tokens via CSS variables
- **shadcn/ui** — accessible Radix primitives with copy-paste ownership (not a black-box component library)
- **No vanilla CSS-in-JS** — styling lives in Tailwind classes and `index.css` design tokens only

### Mock API: MSW v2

All dynamic data flows through **Mock Service Worker** handlers in `src/mocks/handlers/`. Components call typed clients in `src/api/`; MSW intercepts at the network layer. **No business data is hardcoded inside React components.**

Features:

- REST handlers with realistic delays
- SSE streams for leaderboard, notifications, and auth sync (`ReadableStream`)
- Scale dataset (~400 teams, ~1.2k participants) via `scaleTeams.ts` generator
- Idempotency keys, duplicate registration (409), and overload simulation (503/429)

### Routing: React Router v7

- File-based **page shells** in `src/pages/` with **lazy loading** and `Suspense`
- **Protected routes** via `ProtectedRoute` wrapper (role-based)
- URL state for event filters and pagination

### Project structure

```
src/
├── api/              # Typed HTTP clients (no fetch in components)
├── features/         # Domain modules (organizer, judge, registration)
├── pages/            # Thin route shells
├── hooks/            # React Query + realtime hooks
├── store/            # Zustand stores
├── mocks/            # MSW handlers + mock data
├── components/       # Shared UI (layout, shadcn/ui)
└── types/            # Shared TypeScript types
```

Organizer and judge dashboards are split into `src/features/` with lazy-loaded tab panels. Registration flow lives in `src/features/registration/`.

---

## Code Quality

| Requirement | Status |
|-------------|--------|
| TypeScript strict mode | ✅ `tsconfig.app.json` |
| ESLint | ✅ `eslint.config.js` (TypeScript ESLint + React Hooks) |
| Prettier | ✅ `.prettierrc` + `eslint-config-prettier` |
| No `any` without comment | ✅ Zero `any` in `src/` |
| Components ≤ 200 lines | ✅ Enforced via `src/features/*` extraction; page shells may compose feature modules |
| Meaningful commits | ✅ Conventional, descriptive messages (see git log) |

Run before submitting:

```bash
npm run lint
npm run format
npm run build
```

---

## Bonus Features Implemented

- [x] **Dark mode** — header toggle, persisted in localStorage, anti-FOUC script
- [x] **Real-time notifications** — SSE stream + 30s polling fallback, toast + bell + priority handling
- [x] **AI-powered event recommendations** — heuristic scoring (track preference + registration history) with in-app explanation
- [x] **Live leaderboard** — SSE with rank-change animations and organizer publish workflow

---

## Known Limitations & Tradeoffs

| Area | Tradeoff |
|------|----------|
| **Backend** | MSW simulates a backend; production would use paginated REST + WebSocket/SSE from a real API |
| **Scale** | In-memory mock DB loads ~1.2k participants at startup — fine for demo, not for true 10k+ datasets without server-side pagination |
| **Lighthouse** | Heavy routes (organizer charts, MSW bundle) affect mobile performance scores; mitigated via code-splitting |
| **Auth** | Dev toolbar role picker for evaluation; production would use OAuth/SAML |
| **Page shells** | Some `pages/*` files orchestrate multiple feature modules and may exceed 200 lines as composition roots — business UI lives in `features/` |

---

## What I Would Do With More Time

1. **Real backend integration** — Replace MSW with OpenAPI-generated clients and cursor-based pagination for participants/submissions
2. **E2E test expansion** — Cover full registration, judge scoring, and organizer publish flows in Playwright (screenshots exist today)
3. **Further page decomposition** — Extract `DashboardPage` and `LandingPage` sections into `features/` modules
4. **Performance** — Image CDN, route prefetching, and service worker for offline shell
5. **Accessibility audit** — Manual screen-reader pass beyond Lighthouse automation
6. **i18n** — Extract strings for multi-locale hackathons

---

## Quality Assurance

```bash
npm run qa
```

Pipeline (`scripts/qa-pipeline.mjs`):

1. `build:qa` — MSW-enabled production bundle
2. Bundle stats → `reports/bundle/stats.json`
3. ESLint
4. Playwright — 54 responsive screenshots (6 routes × 9 viewports)
5. Lighthouse — desktop + mobile
6. Reports — `reports/QUALITY_AUDIT_REPORT.md` + root-level production reports

See `docs/FINAL_AUDIT_REPORT.md` and `docs/GAP_AUDIT.md` for requirement traceability.

---

## Documentation

| Doc | Purpose |
|-----|---------|
| [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) | Q1–Q5 system design answers (required) |
| [docs/GAP_AUDIT.md](./docs/GAP_AUDIT.md) | Implementation checklist vs design |
| [docs/FINAL_AUDIT_REPORT.md](./docs/FINAL_AUDIT_REPORT.md) | Assignment audit summary |

---

## License

MIT — see repository for details.
