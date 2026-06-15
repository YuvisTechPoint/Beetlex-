# BeetleX Hackathon Platform

Production frontend for hackathon registration, team management, submissions, judging, and live leaderboards.

**Stack:** React 19 · TypeScript (strict) · Vite · Tailwind CSS · React Router · Zustand · React Query · MSW

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

```bash
git clone https://github.com/YuvisTechPoint/Beetlex-.git
cd beetlex-hackathon
npm install
npm run dev
```

Open **http://localhost:5173**

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with MSW mock API |
| `npm run build` | TypeScript check + production build → `dist/` |
| `npm run preview` | Serve production build locally |
| `npm run lint` | ESLint on `src/` |
| `npm run format` | Prettier format `src/` |

## Environment variables

Copy `.env.example` to `.env` and fill in values as needed.

| Variable | Purpose |
|----------|---------|
| `VITE_ENABLE_MSW` | Enable Mock Service Worker (default in dev) |
| `VITE_DISABLE_MSW` | Skip MSW for real/static API |
| `VITE_STATIC_API` | Serve pre-generated JSON from `/static-api/` |
| `VITE_FIREBASE_*` | Firebase client config (Google sign-in) |
| `VITE_GOOGLE_CLIENT_ID` | Optional Google OAuth client override |

## Authentication

- **Google (Firebase)** — when `VITE_FIREBASE_*` is configured
- **Demo accounts** — Participant / Judge / Organizer role picker (MSW)
- **Dev toolbar** — quick role switching in development builds

## Project structure

```
src/
├── api/           # Typed HTTP clients
├── features/      # Domain modules (dashboard, events, judge, organizer, registration)
├── pages/         # Route shells (lazy-loaded)
├── hooks/         # React Query + realtime hooks
├── store/         # Zustand stores
├── mocks/         # MSW handlers + mock data
├── components/    # Shared layout + UI
└── types/         # Shared TypeScript types
public/             # Static assets + MSW service worker
```

## Deployment

Build the app and deploy the `dist/` folder to any static host (Vercel, Netlify, S3, etc.):

```bash
npm run build
```

For production with a real backend, set `VITE_DISABLE_MSW=true` and point API routes to your server.

## License

MIT
