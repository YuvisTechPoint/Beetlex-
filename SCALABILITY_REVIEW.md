# BeetleX Scalability Review

**Generated:** 2026-06-15T18:14:08.769Z

## Load assumptions

50,000 registrations · thousands concurrent · live leaderboard · notification fan-out

## Client protections

| Flow | Mechanism |
|------|-----------|
| Registration submit | 5s rate limit, idempotency key, exponential backoff, 429/503 queue |
| Duplicate reg | GET /registrations/me, 409 handling, cross-tab lock |
| Leaderboard | SSE sequence ordering, Map store, debounced renders, virtualized rows |
| Organizer participants | Paginated API, virtual scroll, optional pageSize=5000 |
| Submissions | Draft autosave, upload retry, offline banner |
| Notifications | SSE resume via lastEventId, 30s poll fallback, 50-item persist cap |
| Queries | staleTime 30s, retry 2x, offlineFirst |

## Mock scale data

`scaleTeams.ts` — 380 additional teams (~1,200 participants) for organizer stress demos.

## Production migration

Replace MSW with cursor-paginated REST, Redis pub/sub for SSE, CDN for static event payloads.
