# BeetleX Accessibility Report

**Generated:** 2026-06-15T18:14:08.769Z

## Automated (Lighthouse avg)

**97** / 100 (target ≥ 95)

## WCAG 2.1 AA checklist

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Skip navigation | PASS | PageWrapper skip link |
| Landmarks | PASS | header, main#main-content, footer |
| Keyboard nav | PASS | Radix dialogs, tabs, menus |
| Focus management | PASS | Dialog trap, wizard steps |
| Form errors | PASS | role="alert" on FormMessage |
| aria-live | PASS | Hero stats, connection status, offline banner |
| Color contrast | PASS | shadcn design tokens + dark mode |
| Reduced motion | PASS | index.css media query |
| Screen reader labels | PASS | Icon-only buttons have aria-label |

## Fixes this cycle

- Connection status labels distinguish leaderboard SSE vs simulated platform socket
- Resource cards use semantic links with external rel
