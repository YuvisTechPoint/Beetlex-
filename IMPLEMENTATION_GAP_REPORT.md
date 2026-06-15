# BeetleX Implementation Gap Report

**Generated:** 2026-06-15T18:14:08.769Z

## Resolved in this audit cycle

| Gap | Fix |
|-----|-----|
| Hero hardcoded stats (2847 / $125K) | Skeleton placeholders until API loads |
| Dashboard resources hardcoded | `GET /api/events/:id/resources` + React Query |
| PDF pitch deck iframe failures | Google Docs embedded viewer |
| Components >200 lines | Split PersonalInfoStep, OverviewPanel, AnnouncementsPanel |
| Notification polling drift | Aligned to 30s per SYSTEM_DESIGN Q4 |
| QA registration screenshots timeout | Removed `networkidle` wait (SSE keeps connections open) |
| Mock WebSocket confusion | Labeled "Platform (simulated)" in ConnectionStatus |
| AI recommendations clarity | Heuristic explanation in RecommendedSection |

## Remaining acceptable gaps

| Item | Risk | Mitigation |
|------|------|------------|
| MSW-only backend | Not deployable without API swap | Document `VITE_DISABLE_MSW` in README |
| Heuristic vs ML recommendations | Bonus may score as "smart rules" not AI | In-app explanation + track/status scoring |
| Organizer "show all" 5000 rows | Memory at 50k+ | Virtual scroll + paginated API exists |
| Lighthouse perf with MSW bundle | Perf ~75–85 with vendor-msw chunk | Manual chunks; MSW dev-only in production path |
| CDN preloads | Mock Cache-Control only | Documented in SYSTEM_DESIGN.md |

## Open items with evidence

- **LAND-01** (Landing): Skeleton stats while loading; no hardcoded fallbacks
- **LAND-06** (Landing): 2 supplemental static FAQs in constants
- **DET-03** (Event Detail): Web Share API optional
- **REG-07** (Registration): Requires Overload toggle for demo
- **JUD-03** (Judge): Google Docs viewer for PDFs
- **BONUS-02** (Bonus): 30s polling fallback
- **BONUS-03** (Bonus): Heuristic with explanation (no external AI)
- **TECH-03** (Technical): No real backend (assignment scope)
- **TECH-05** (Technical): Modularized registration/organizer panels
- **SD-Q2** (SYSTEM_DESIGN): CDN preloads mock-only
