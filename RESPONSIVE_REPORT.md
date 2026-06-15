# BeetleX Responsive Report

**Generated:** 2026-06-15T18:14:08.769Z

## Breakpoints tested

320, 375, 390, 414, 768, 1024, 1280, 1440, 1920 px

## Screenshot evidence

**54** captures — `reports/screenshots/manifest.json`

## Layout safeguards

| Page | Mobile | Tablet | Desktop |
|------|--------|--------|---------|
| Landing | Stacked hero stats | 2-col prizes | Full grid |
| Events | Single column cards | 2-col grid | 3-col + filters sidebar |
| Registration | Single-column wizard | Same | max-w-2xl centered |
| Dashboard | Bottom nav + tabs | Sidebar | Full sidebar |
| Organizer | Horizontal scroll tables | Virtual scroll | Full analytics grid |

## QA fix

Registration route screenshots no longer hang on `networkidle` when auth SSE is active.
