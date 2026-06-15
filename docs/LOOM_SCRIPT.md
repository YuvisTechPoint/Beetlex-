# Loom recording script (~5 min)

## Intro (30s)

- "This is the BeetleX Hackathon Platform — React 19, TypeScript strict, MSW mock API."
- Open http://localhost:5173 as **Guest**.

## Public experience (1 min)

1. Scroll landing page — point out **Live Leaderboard** section with SSE connection badge.
2. Go to **Events** — filters, pagination.
3. Open **BeetleX Global Hackathon** (`/events/evt-active-1`) — public leaderboard on detail page.

## Registration (45s)

1. Open **BeetleX AI Forge 2026** → Register.
2. Show **Register individually** (solo) vs create/join team.
3. Complete step 1 — mention Zod + React Hook Form validation.

## Participant (45s)

1. Dev toolbar → **Participant**.
2. Dashboard — team info, submission status, leaderboard tab.
3. Submission page — draft autosave mention.

## Organizer (1 min)

1. Dev toolbar → **Organizer**.
2. **Leaderboard** tab — publish/unpublish.
3. **Judges** — assign judge to **project category** (track).
4. **Announcements** — create + schedule.

## Architecture + resilience (45s)

1. "Server state in React Query, client auth/UI in Zustand."
2. "Leaderboard uses SSE with 500ms debounce; falls back to 10s polling if stream drops."
3. Dev toolbar → **Overload ON** → try registration → show 503/429 retry UI.

## Outro (15s)

- `npm run qa` for Lighthouse + screenshots.
- Repo link + MSW documented in README.
