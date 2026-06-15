# BeetleX Architecture Report

**Generated:** 2026-06-15T16:53:02.647Z

## Layering

```
src/
  api/           REST clients
  features/      Domain modules (organizer, judge)
  pages/         Route shells (thin)
  hooks/         Data + realtime orchestration
  store/         Client state (Zustand)
  mocks/         MSW handlers + scale data
```

## State management

| Concern | Tool | Notes |
|---------|------|-------|
| Server data | React Query | Stable keys, offlineFirst |
| Auth session | Zustand + persist | BroadcastChannel sync |
| UI chrome | Zustand | Theme, dialogs |
| Realtime | SSE + polling fallback | Leaderboard, notifications, auth |

## Feature module boundaries

### Organizer (`src/features/organizer/`)
- `panels/*` — lazy tab content
- `components/*` — shared stat cards
- `types.ts`, `utils.ts` — panel contracts

### Judge (`src/features/judge/`)
- `ReviewQueue`, `ProjectDetail`, `ScoreConfirmationDialog`
- `schemas.ts` — Zod scoring validation

## Scalability considerations

- MSW generates 380 additional teams with deterministic PRNG
- Participant API builds from in-memory db.teams (O(n) flatMap)
- Virtual row windowing for organizer tables > 100 rows
- Manual chunk splitting keeps initial route JS under budget

## Remaining acceptable debt

- `RegistrationPage.tsx` remains large but functionally complete
- Production backend would replace MSW with paginated REST cursors
