# BeetleX Gap Audit

Canonical checklist of implementation status vs assignment phases and `SYSTEM_DESIGN.md` (Q1–Q5).

**Last updated:** 2026-06-15 — gap build complete

---

## Completion summary

| Area | Status | Notes |
|------|--------|-------|
| Pages & routes (11 incl. legal) | 100% | All routes in `src/App.tsx` |
| MSW REST + SSE APIs | 100% | Leaderboard + notification streams |
| Assignment UI features | ~95% | Core flows complete |
| SYSTEM_DESIGN behaviors | ~90% | See checklists below |

---

## Implementation phases

| Phase | Scope | Status |
|-------|-------|--------|
| A | This audit file | Done |
| B | P0 critical UX | Done |
| C | P1 leaderboard SSE | Done |
| D | P1 notification SSE | Done |
| E | P2 registration overload | Done |
| F | P3 polish | Done |
| G | P4 QA docs | Done |

---

## P0 — Critical

- [x] Post-deadline draft shown read-only (`SubmissionPage` + `SubmissionReadOnly`)
- [x] Client `DEADLINE_PASSED` (403) handling on final submit
- [x] Join-team `409 ALREADY_REGISTERED` mock + UI

## P1 — Real-time SSE

- [x] `leaderboardStore` Map-based state
- [x] `useLeaderboardStream` EventSource + sequence ordering + 500ms debounce
- [x] MSW `GET /api/leaderboard/:eventId/stream`
- [x] Degraded 10s polling + connection badge wired to stream state
- [x] `Notification.type` field
- [x] `useNotificationStream` + MSW `GET /api/notifications/stream`
- [x] 30s polling fallback for notifications

## P2 — Registration scale

- [x] Mock 429/503 on register (dev **Overload** toggle + `X-Simulate-Overload` header)
- [x] Queue position UX + 3-strike messaging
- [x] Silent 30s background retry after overload
- [x] `index.html` preloads
- [x] `Cache-Control: s-maxage=30` on event GET mocks

## P3 — Polish

- [x] `useAuth` migration (components use hook; store exports token helpers)
- [x] Judge re-score overwrite warning
- [x] Optional urgent notification sound (`uiStore.notificationSoundsEnabled`)
- [x] Footer Privacy/Terms → `/legal/privacy`, `/legal/terms`
- [x] `GITHUB_REPOS.md`

## P4 — QA (automated)

- [x] Build + ESLint pass (`npm run build:qa`, `npm run lint`)
- [x] Playwright responsive screenshots — 9 viewports × 6 routes → `reports/screenshots/`
- [x] Lighthouse automation — perf/a11y/bp/seo desktop + mobile → `reports/lighthouse/`
- [x] `npm run qa` single-command pipeline (`scripts/qa-pipeline.mjs`)
- [x] `reports/QUALITY_AUDIT_REPORT.md` generated with matrix + scores
- [x] MSW enabled in QA preview builds (`VITE_ENABLE_MSW=true`)
- [x] Mock catalog expanded to 14 events for pagination/filter demos

### Run QA

```bash
npm install
npm run qa
```

Artifacts: `reports/QUALITY_AUDIT_REPORT.md`, `reports/screenshots/manifest.json`, `reports/lighthouse/summary.json`

Target: Lighthouse accessibility ≥ 85, performance ≥ 75 on preview build (MSW bundle included).

---

## Already implemented (baseline)

| Feature | Files |
|---------|-------|
| Cross-tab registration lock | `src/lib/registrationLock.ts`, `RegistrationPage.tsx` |
| Registration session draft + idempotency | `src/lib/sessionDraft.ts`, `RegistrationPage.tsx` |
| Submission session draft + upload retry | `SubmissionForm.tsx`, `src/lib/retry.ts` |
| Notification localStorage persist | `src/store/notificationStore.ts` |
| Urgent banner (no toast overlap) | `UrgentBanner.tsx`, `useNotificationSync.ts` |
| Duplicate registration 409 (create path) | `mocks/handlers/events.ts`, `RegistrationPage.tsx` |

---

## Out of scope (intentional)

- **React Router loaders** — React Query remains the server-state layer
- **Real backend / CDN** — MSW mocks simulate edge behavior

---

## Quality assurance & delivery workflow

Automated QA is integrated into the repo — not a manual checklist.

| Step | Command | Artifact |
|------|---------|----------|
| Full pipeline | `npm run qa` | All artifacts below |
| QA build | `npm run build:qa` | `dist/` with MSW |
| Preview | `npm run preview:qa` | http://127.0.0.1:4173 |
| Screenshots | `npm run qa:screenshots` | `reports/screenshots/*.png` |
| Lighthouse | `npm run qa:lighthouse` | `reports/lighthouse/*.report.{json,html}` |
| Report | `npm run qa:report` | `reports/QUALITY_AUDIT_REPORT.md` |

**Pipeline order** (`scripts/qa-pipeline.mjs`): build → lint → start preview → Playwright → Lighthouse (Playwright Chromium + Lighthouse programmatic API) → report.

**Screenshot matrix:** 320–1920px widths; routes include landing, listing, filtered listing, pagination, event detail, registration (seeded auth).

**Lighthouse:** desktop + mobile form factors; categories performance, accessibility, best-practices, SEO.

Reviewers run `npm run qa` once and inspect `reports/QUALITY_AUDIT_REPORT.md`.

---

## SYSTEM_DESIGN Q1–Q5 checklist

### Q1 Leaderboard
- [x] REST leaderboard API
- [x] Rank CSS transitions
- [x] SSE stream + sequenceNumber ordering
- [x] Map store O(1) updates
- [x] 500ms debounced render batch
- [x] React.memo rows
- [x] 10s degraded polling + badge

### Q2 Registration scale
- [x] 5s client rate limit
- [x] Idempotency key
- [x] sessionStorage draft
- [x] Exponential backoff on submit
- [x] 429/503 mocks + queue UX
- [x] 30s silent background retry
- [x] CDN preloads / cache headers (mock)

### Q3 Duplicate prevention
- [x] GET /registrations/me on mount
- [x] 409 ALREADY_REGISTERED (create + join)
- [x] Cross-tab localStorage lock

### Q4 Notifications
- [x] Toast + bell + urgent banner tiers
- [x] localStorage persist
- [x] visibilitychange buffer
- [x] SSE stream + event id resume
- [x] Notification `type` field
- [x] Urgent sound (Web Audio beep)

### Q5 Submissions
- [x] Dual endpoints draft/submit
- [x] Auto-save 60s / blur / visibility
- [x] sessionStorage recovery
- [x] Upload retry 3x
- [x] Offline banner + reconnect sync
- [x] Post-deadline read-only draft view
- [x] DEADLINE_PASSED client handling

---

## Acceptance criteria — met

- All routes functional with role guards
- Q3 duplicate flow for create **and** join paths
- Q5 post-deadline read-only draft view
- Q1/Q4 EventSource in dev; degraded polling on disconnect
- Q2 overload simulation with auto-retry
- 0 open P0/P1 items
