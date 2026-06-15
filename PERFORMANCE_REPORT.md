# BeetleX Performance Report

**Generated:** 2026-06-15T18:14:08.769Z

## Lighthouse

| Route | Device | Perf | A11y | BP | SEO |
|-------|--------|------|------|----|-----|
| landing | desktop | 99 | 97 | 100 | 92 |
| landing | mobile | 90 | 97 | 100 | 92 |
| events | desktop | 100 | 95 | 100 | 92 |
| events | mobile | 87 | 95 | 100 | 92 |
| event-detail | desktop | 99 | 96 | 100 | 92 |
| event-detail | mobile | 84 | 96 | 100 | 92 |
| registration | desktop | 100 | 100 | 100 | 92 |
| registration | mobile | 90 | 100 | 100 | 92 |

**Averages:** Perf 94 · A11y 97 · BP 100 · SEO 92

## Bundle (1253 KB total)

- `feature-organizer-5e_4oGGU.js`: 460 KB
- `feature-judge-K4l5JDwM.js`: 301 KB
- `vendor-react-CPGXQBPY.js`: 174 KB
- `page-dashboard-C56TRKtX.js`: 112 KB
- `page-landing-COHLLq6G.js`: 86 KB
- `page-registration-C71teEML.js`: 38 KB
- `SubmissionPage-Cv3M2K0-.js`: 21 KB
- `index-BGOhLWIi.js`: 15 KB

## Optimizations

- Route-level React.lazy + Suspense
- Manual chunks: vendor-msw, vendor-charts, feature-organizer, feature-judge
- Skeleton parity for LCP elements (hero, event detail)
- `prefers-reduced-motion` global CSS
- Query offlineFirst + exponential retry

## Targets

| Metric | Target | Status |
|--------|--------|--------|
| Performance | ≥ 90 | PASS |
| Accessibility | ≥ 95 | PASS |
