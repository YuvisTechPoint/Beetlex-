# BeetleX Hackathon — Submission Checklist

Use this checklist before sending your assignment to **team@beetlex.io**.

## Repository access

- **Remote:** [https://github.com/YuvisTechPoint/Beetlex-.git](https://github.com/YuvisTechPoint/Beetlex-.git)
- Confirm the repo is **Public** (or that evaluators have been invited as collaborators).
- README clone URL must match the accessible repository.

## Required deliverables

### 1. Loom walkthrough (~5 minutes)

Record a screen share covering:

1. **Landing page** — hero, featured events, **public live leaderboard** (guest, no sign-in).
2. **Events** — browse, filters, pagination, event detail for active event (`/events/evt-active-1`) with live scores.
3. **Registration** — solo vs team flow on `/events/evt-upcoming-1/register`.
4. **Participant dashboard** — submission + personal leaderboard view.
5. **Organizer panel** — publish leaderboard, assign judges by **project category**, announcements.
6. **Architecture decision** — e.g. React Query + Zustand split, SSE leaderboard with degraded polling fallback.
7. **Dev toolbar** — toggle **Overload** to demo 503/429 registration retry UX (SYSTEM_DESIGN Q2).

Suggested script outline: see [docs/LOOM_SCRIPT.md](./docs/LOOM_SCRIPT.md).

### 2. Submission email

Send to **team@beetlex.io** with:

- Subject: `BeetleX Frontend Assignment — [Your Name]`
- GitHub repo URL (public or access instructions)
- Loom link
- Brief note on how to run: `npm install && npm run dev` (MSW mock API)

## Quality gates (automated)

```bash
npm run qa
```

Targets documented in assignment:

| Metric | Target | Where to verify |
|--------|--------|-----------------|
| Lighthouse Performance | > 85 | `reports/lighthouse/summary.json` (perf build, no MSW) |
| Accessibility | > 95 | same |
| Best Practices | > 90 | same |
| SEO | > 90 | same |

Perf audits use `npm run build:perf` (static JSON API, MSW excluded from bundle). Functional QA/screenshots still use `build:qa` with MSW.

## Feature verification (manual)

| Feature | How to verify |
|---------|----------------|
| Public live leaderboard | Open `/` or `/events/evt-active-1` as **Guest** (dev toolbar) — scores visible without auth |
| Solo registration | `/events/evt-upcoming-1/register` → choose **Register individually** |
| Judge categories | Organizer → Judges → **Assign Judge to Project Category** |
| Meaningful git history | `git log --oneline` shows logical feature commits |

## Known limitations (acceptable per assignment)

- MSW-only backend — swap via `VITE_DISABLE_MSW=true` for real API
- Demo auth — role picker, not OAuth
- AI recommendations — heuristic scoring, not external LLM API
- CDN — mock `Cache-Control` headers in MSW only
