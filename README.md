# BeetleX Hackathon Platform

A full-featured hackathon management frontend built with React, TypeScript, and a mock API layer powered by MSW.

## Quick Start

```bash
git clone [repo]
cd beetlex-hackathon
npm install
npm run dev
```

Runs at http://localhost:5173

## Documentation

- **[GAP_AUDIT.md](./GAP_AUDIT.md)** — implementation checklist vs `SYSTEM_DESIGN.md`
- **[SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md)** — Q1–Q5 architecture answers
- **[QUALITY_AUDIT_REPORT.md](./reports/QUALITY_AUDIT_REPORT.md)** — automated QA output (`npm run qa`)
- **[FINAL_AUDIT_REPORT.md](./FINAL_AUDIT_REPORT.md)** — assignment audit summary
- **[GITHUB_REPOS.md](./GITHUB_REPOS.md)** — reference repositories

## Quality assurance (automated)

Run the full reproducible QA pipeline (build, lint, responsive screenshots, Lighthouse, report):

```bash
npm install
npm run qa
```

This executes `scripts/qa-pipeline.mjs` which:

1. **`npm run build:qa`** — production build with MSW enabled (`VITE_ENABLE_MSW=true`) and fast mock delays
2. **`npm run lint`** — ESLint on `src/`, `e2e/`, Playwright config
3. **Playwright** — 54 full-page screenshots (6 routes × 9 viewports) → `reports/screenshots/`
4. **Lighthouse** — performance, accessibility, best practices, SEO (desktop + mobile) → `reports/lighthouse/`
5. **Report** — `reports/QUALITY_AUDIT_REPORT.md` with requirement matrix, scores, and artifact index

### Individual commands

| Command | Output |
|---------|--------|
| `npm run qa` | Full pipeline (recommended for reviewers) |
| `npm run build:qa` | MSW-enabled production bundle in `dist/` |
| `npm run preview:qa` | Preview server at http://127.0.0.1:4173 |
| `npm run qa:screenshots` | Playwright screenshot suite only |
| `npm run qa:lighthouse` | Lighthouse audits (preview must be running) |
| `npm run qa:report` | Regenerate `QUALITY_AUDIT_REPORT.md` from artifacts |

### Viewport matrix (screenshots)

320, 375, 390, 414, 768, 1024, 1280, 1440, 1920 px — naming: `{route}--{mobile|tablet|desktop|ultrawide}--{width}x{height}.png`

### Routes captured

`/`, `/events`, `/events?status=active&q=ai`, `/events?page=2`, `/events/evt-upcoming-1`, `/events/evt-upcoming-1/register` (authenticated)

Mock catalog: **14 events** (6 core + 8 extra) for pagination and filter demos.

## Test Different Roles

Use the role switcher in the bottom-left dev toolbar:

- **Guest**: Landing page, Event Listing, Event Details
- **Participant**: + Team Dashboard, Project Submission
- **Judge**: Judge Dashboard
- **Organizer**: Organizer Dashboard

### Dev: Registration overload simulation

Toggle **Overload** in the dev toolbar, then register for an event. The mock API returns 503 → 429 (with queue position) before succeeding, exercising retry UX and 30s background auto-retry.

## Architecture Decisions

### State Management: Zustand + React Query

- **Zustand** for client-side state (auth, UI preferences, notifications, leaderboard stream cache)
- **React Query** for server state (events, submissions, scores) with caching and invalidation
- **React Router loaders intentionally omitted** — React Query is the single server-state layer

### Real-time: SSE (mocked via MSW)

- **Leaderboard**: `EventSource` → `GET /api/leaderboard/:eventId/stream` with `sequenceNumber` ordering, Map-based store, 500ms debounced updates, 10s degraded polling fallback
- **Notifications**: `EventSource` → `GET /api/notifications/stream` with 30s REST polling fallback

### Mock API: MSW v2

- Intercepts at the network level (not in-component)
- SSE handlers use `ReadableStream` (`src/lib/sse.ts`)
- Realistic delays simulate network latency

### Styling: Tailwind + shadcn/ui

- shadcn/ui provides accessible, unstyled base components
- Tailwind handles all custom styling (no CSS files)

### Routing: React Router v6

- Protected routes implemented with wrapper component
- Lazy-loaded page components with Suspense fallbacks

## Bonus Features Implemented

- [x] Dark Mode — toggle in header, persists via localStorage
- [x] Real-time Notifications — SSE + polling fallback, toast + bell + urgent banner
- [x] AI-Powered Event Recommendation — based on user track preferences + registration history
- [x] Live Leaderboard — SSE stream with rank-change delta animations

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (MSW on) |
| `npm run build` | Production build (MSW off) |
| `npm run build:qa` | QA build with MSW + fast mock delays |
| `npm run preview:qa` | Preview QA build at :4173 |
| `npm run lint` | ESLint (`src`, `e2e`) |
| `npm run qa` | **Full automated QA pipeline** |
| `npm run qa:screenshots` | Playwright responsive screenshots |
| `npm run qa:lighthouse` | Lighthouse JSON/HTML reports |
| `npm run qa:report` | Regenerate quality audit markdown |
| `npx tsc --noEmit` | TypeScript check |

## Project Structure

```
e2e/              # Playwright screenshot suite
scripts/          # qa-pipeline, lighthouse, report generator
reports/          # Generated QA artifacts (see npm run qa)
src/
├── api/           # Typed API client functions
├── components/    # UI primitives, layout, shared widgets
├── features/      # Domain-specific feature components
├── hooks/         # React Query hooks + SSE hooks
├── lib/           # retry, sessionDraft, registrationLock, sse, qaMode
├── mocks/         # MSW handlers + mock data
├── pages/         # Route-level page components
├── store/         # Zustand stores
└── types/         # TypeScript interfaces
```
