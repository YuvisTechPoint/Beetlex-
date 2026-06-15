# BeetleX Architecture Review

**Generated:** 2026-06-15T18:14:08.769Z

## Layering (clean)

```
pages/          → thin route shells (<120 lines)
features/       → domain modules (landing, events, registration, dashboard, judge, organizer)
api/            → REST clients (no fetch in components)
hooks/          → React Query + SSE orchestration
store/          → Zustand (auth, UI, leaderboard, notifications)
mocks/          → MSW handlers + scale data
```

## Strengths

- Consistent React Query keys and mutation invalidation
- Feature-based code splitting with Vite manual chunks
- SSE + degraded polling for leaderboard and notifications
- Protected routes with role guards
- Registration idempotency, cross-tab lock, session drafts

## Weaknesses addressed

- Oversized page components → feature modules under 200 lines
- Hardcoded dashboard resources → API-driven
- Fragile E2E `networkidle` → domcontentloaded for SSE pages

## Scalability patterns

| Concern | Pattern |
|---------|---------|
| Leaderboard updates | Map store O(1), 500ms debounce, React.memo rows |
| Registrations | Idempotency key, rate limit, 429/503 queue UX |
| Organizer participants | Paginated API + virtual row window |
| Notifications | SSE + 30s poll, localStorage cap 50 |

## Debt (acceptable)

- `useRegistrationPage.ts` hook is large (~400 lines) but isolated
- Recharts in organizer chunk (~470KB) — lazy loaded per tab
