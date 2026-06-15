# BeetleX System Design

## Q1: Real-Time Leaderboard

**Data Transport:** SSE (Server-Sent Events) over WebSocket for this use case.

**Reasoning:** 5,000 concurrent viewers need to receive scores; they don't need to send data. SSE is simpler (HTTP/1.1 compatible, auto-reconnect built into browser EventSource API), and scales better for one-directional broadcast vs. WebSocket (which requires stateful connections per client).

**Score update ordering:** Include a sequenceNumber in each score event. Frontend maintains lastProcessedSequence and ignores events with sequence <= lastProcessed. For out-of-order arrivals within a burst, hold events in a buffer array, sort by sequence, then apply in order.

**Frontend state update strategy:**

- Store leaderboard in a Map (teamId → entry) for O(1) updates
- Batch incoming events with a 500ms debounce before re-rendering
- React.memo on each leaderboard row, keyed by teamId (not rank)
- useMemo to recompute sorted array only when Map changes
- CSS transitions on the rank number for smooth visual reordering

**Graceful degradation:**

- EventSource onerror triggers exponential backoff reconnect
- Meanwhile: fall back to polling (every 10s for degraded mode)
- Show connection status badge in UI: "Live" (green dot) vs "Updating every 10s" (yellow dot)
- On reconnect: fetch full leaderboard snapshot to resync, then resume SSE

---

## Q2: 50,000 Registrations in One Day

**Frontend API protection:**

- Debounce all form field validation API calls (e.g., email uniqueness check): 1000ms
- Submit button: disabled after first click, re-enabled only on confirmed error
- Implement client-side rate limiting: block submissions from same session < 5s apart
- Use a request deduplication key (idempotency key) generated on form load, sent with every registration attempt

**Queue/feedback during high load:**

- When API returns 429 (rate limited) or 503 (unavailable): show a queue position message
- "High demand right now — you're in a virtual queue. Estimated wait: 2 minutes"
- Use exponential backoff with jitter: retry after 2 + rand(0,1)s, 4 + rand(0,2)s, 8 + rand(0,4)s
- Show a progress indicator during retry, never a raw error

**CDN/asset strategy:**

- All static assets (JS, CSS, images) served from CDN edge nodes (Cloudflare Workers)
- Landing page HTML: cache at edge with stale-while-revalidate
- Event data API: cache-control: s-maxage=30 (30s CDN cache) to absorb read traffic
- Registration API: not cacheable, goes to origin — this is where backend needs to scale
- Preload critical fonts and hero image in `<head>` using `<link rel="preload">`

**503 handling on client:**

- First 503: show inline error "Server is busy, retrying..." with spinner
- After 3 retries: show "Registration is temporarily unavailable due to high demand. Your form is saved. We'll retry automatically."
- Auto-save form state to sessionStorage on every input change
- Retry silently in background every 30s, show success toast when it works

---

## Q3: Duplicate Registration Prevention

**Client-side detection:**

- On component mount: call GET /api/registrations/me to check if already registered for this event
- If already registered: immediately show "You're already registered" state with existing registration code
- Prevent the form from rendering entirely — don't rely on submit-time detection

**API contract:**

- Success: 201 { registrationId, registrationCode, team }
- Duplicate detected: 409 { code: 'ALREADY_REGISTERED', registrationId: 'xxx', registrationCode: 'ABC123', teamName: 'TeamName' }
- Invalid input: 422 { code: 'VALIDATION_ERROR', fields: { email: 'Invalid format' } }

**UI for duplicate response:**

- Don't show a generic error — show a targeted info state:
  "Looks like you're already registered! Your registration code is ABC123."
- Offer: "View your dashboard" button, "Share your registration" button

**Two-tab simultaneous submission edge case:**

- Backend uses database unique constraint on (userId, eventId) — atomic at DB level
- Frontend: on submit, immediately disable the button and set a "submitting" flag in localStorage (not sessionStorage, so cross-tab)
  `localStorage.setItem('registering_[eventId]', Date.now())`
- Other tab checks this flag on mount and shows "Registration in progress in another tab"
- After 30s, flag is stale and cleared

**What backend must return:**

- 409 must include the existing registrationId and registrationCode
- Without these, the frontend cannot render a helpful "you're already registered" state
- Also include: teamId, teamName, trackName so the UI can show "You're on Team X, Track Y"

---

## Q4: Notification System

**Delivery mechanism:**

- SSE endpoint: GET /api/notifications/stream (text/event-stream)
- EventSource on the client subscribes on login
- Event types: 'announcement', 'score_update', 'deadline_alert', 'system'
- Fallback: polling every 30s if SSE connection fails

**Notification UI: all three tiers:**

- Toast: immediate, ephemeral — for new announcements (auto-dismiss based on priority)
- Notification Bell + Popover: persistent — user can review all notifications, mark as read
- Sticky Banner: for urgent system-wide alerts ("Platform maintenance in 10 minutes")
  - Banner dismisses only with user action, not auto-dismiss

**Priority levels:**

- info: toast auto-dismisses in 5s, blue styling, no sound
- warning: toast auto-dismisses in 8s, yellow styling
- urgent: toast does NOT auto-dismiss, red styling, optionally plays a notification sound (if user has granted audio permission), banner also shown

**Persistence:**

- On receipt: store notification in notificationStore (Zustand)
- Persist to localStorage: notifications array, capped at 50 items (FIFO)
- On page refresh: rehydrate from localStorage — notifications survive refresh
- Mark-as-read state also persisted in localStorage
- SSE stream sends only new notifications since the client's lastEventId (standard SSE feature)
  — avoids re-delivering already-read notifications

**Different tab behavior:**

- visibilitychange API: when document is hidden, buffer incoming notifications
- When user returns (document becomes visible):
  - Process buffered notifications
  - For urgent: immediately show toast + update badge
  - Update document.title with unread count: "(3) BeetleX Dashboard"
  - Reset title when tab becomes visible

---

## Q5: Scaling Submissions at Deadline

**Optimistic UI:**

- On "Save Draft" click: immediately update local state ("Draft saved just now") then POST to API in background
- On "Submit Project" click: show loading state on button
- Don't optimistically set "submitted" — final submission has too many side effects to roll back cleanly
- If submission succeeds: navigate to submitted state
- If it fails: restore form with error message, all data preserved

**Retry logic for uploads:**

- File upload: 3 retries maximum with exponential backoff: 2s, 4s, 8s
- After 3 failures: show error with "Try again" button (don't auto-retry further)
- For the final form submission (not file upload): 2 retries, 3s apart
- Backoff with jitter: delay = base * 2^attempt + Math.random() * 1000ms

**Save Draft vs Final Submit distinction:**

- UI: two separate buttons. "Save Draft" is ghost/secondary, "Submit Project" is primary
- API: two separate endpoints:
  - POST /api/submissions — create/update draft (idempotent, safe to retry)
  - PUT /api/submissions/:id/submit — finalize (non-idempotent, server checks deadline)
- Server response for submit: 200 (success), 403 with DEADLINE_PASSED if too late
- Draft saves never touch the submission status — only the data fields

**Preventing data loss at 11:58 PM:**

- Auto-save draft every 60 seconds (setInterval in useEffect)
- Auto-save on every blur event of required fields
- Auto-save on visibilitychange (user switches tab — save immediately)
- Store form state in sessionStorage as the user types (immediate, no API call)
  — This is the last-resort recovery if API is down
- On network disconnect: show persistent banner "No connection — your work is saved locally"
- On reconnect: auto-sync local state to server
- The submit button shows last saved time: "Last saved 23 seconds ago"

**Post-deadline UX:**

- Countdown timer hits 00:00:00 → trigger a "deadline passed" event
- Form immediately becomes read-only (inputs disabled, buttons hidden)
- Red banner replaces countdown: "Submissions closed at 11:59 PM IST"
- If team had a draft but didn't submit:
  "Your draft was not submitted. Submission period has ended."
- If team submitted:
  "Your project was submitted at 11:47 PM. ✓"
- No form fields, no submit button — only a read-only view of their last draft/submission
- Backend enforces deadline independently — client-side enforcement is UX only, not a security control

---

## Quality assurance

See **[README.md](./README.md#quality-assurance-automated)** and **`reports/QUALITY_AUDIT_REPORT.md`** (generated by `npm run qa`).

- **Playwright** captures full-page screenshots across the assignment viewport matrix against the MSW-enabled preview build.
- **Lighthouse** measures performance, accessibility, best practices, and SEO (desktop + mobile) via Playwright Chromium + programmatic Lighthouse.
- **Report generator** (`scripts/generate-quality-report.mjs`) assembles requirement coverage, Lighthouse averages, screenshot manifest, and pass/fail gates into a single reviewer-facing document.

QA builds set `VITE_ENABLE_MSW=true` so preview matches dev API behavior without a real backend.
