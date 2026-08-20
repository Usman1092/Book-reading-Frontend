# Wisdom — Frontend (Phase 12)

React (Vite) single-page app implementing every page from the spec's
sitemap, wired to the backend built in Phases 3–7.

## Install & run

```bash
cd frontend
npm install
npm run dev
```

By default the API client (`src/api/client.js`) calls a **relative**
`/api` path — `vite.config.js` proxies `/api` and `/covers` through to
`http://localhost:4000` in dev, so make sure the backend (see the root
`SETUP.md`) is running on port 4000 first. Change the proxy target there
if your backend runs elsewhere.

## Design system

**"The Reading Lamp"** — a quiet reading-room palette (see
`src/styles/tokens.css`) rather than a generic template: warm paper
canvas, a deep shelf-green/ink primary, brass accents, and a
card-catalog-tab signature motif reused across book covers, the auth
card, and category cards. Display type is a serif (bookish, not the
default cream+terracotta look); body type is a clean humanist sans.

## Pages implemented

| Area | Pages |
|---|---|
| Public | Home, Books/Library, Book Details, Categories, Subscription Plans, Login, Register, Forgot/Reset Password, About, Contact |
| Authenticated | Dashboard, My Books & Reading History, My Subscription, Profile, PDF Reader |
| Admin | Dashboard, Users (+ detail drill-down), Books, Categories, Book Assignment (20-day grants), Payments, Subscription Plans |

## How the reader enforces access (frontend side)

`Reader.jsx` fetches `/api/books/:id/pdf` through the **authenticated
axios client** (so the Bearer token is attached) as raw bytes, and hands
those bytes to `pdf.js` entirely client-side. It never points `pdf.js`
at a bare public URL. Whatever bytes come back — the full book or a
genuinely 3-page-truncated preview — were already decided server-side;
the reader just displays them and has no way to "unlock" further pages
on its own. Right-click is disabled in the canvas area as a deterrent
(documented in the root `SETUP.md` as non-absolute protection, per the
project's own stated limitation).

## Auth flow

`AuthContext` holds the short-lived access token in memory (never
localStorage) and relies on the httpOnly refresh cookie for silent
re-authentication on reload — matching the backend's token design from
Phase 4.

## New backend endpoints added to support this phase

The frontend needed "what does the *current* user own" data that didn't
have a dedicated endpoint yet, so Phase 12 added:

```
GET /api/me/reading-progress
GET /api/me/book-access
GET /api/me/subscription
GET /api/me/payments
```
All four require auth and are scoped to `req.user.id` only — see
`backend/src/controllers/me.controller.js`.

## Known gaps

- Contact page submits nothing yet (no backend contact endpoint exists) — it just confirms receipt client-side.
- No automated component tests — verification here was static (import-resolution and syntax checks), since `npm install` requires network access this sandbox doesn't have. Run the app locally to do a full interactive pass.
- Search-within-PDF (mentioned in the original reader spec) isn't implemented — `pdf.js` supports it, but it's a reasonable next addition rather than core to the access-control feature set.
