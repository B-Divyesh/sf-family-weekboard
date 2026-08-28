# Weekboard v1 handoff

## Delivered

- A complete Vite + TypeScript offline PWA with a seven-day desktop board and
  focused single-day 390 px mobile agenda.
- IndexedDB persistence for people, lane colours, plans, notes, theme, and board
  name. Storage failures show recovery guidance.
- Create/edit/delete flows for timed and all-day plans, multi-day display, and
  daily, weekly, or monthly recurrence with an optional end date.
- Standards-based ICS import/export with UTC timestamps, IANA `TZID` handling,
  exclusive all-day end dates, escaped fields, UIDs, and RRULEs.
- Explicit private handoff using PBKDF2 (210,000 iterations) and AES-256-GCM via
  encrypted file, copy/paste code, or locally rendered QR deep link. URL
  fragments are never sent to the server.
- Print view, light/dark/system themes, keyboard-friendly native dialogs, focus
  return, live status, confirmations, reduced motion, offline status, and update
  prompts.
- Install manifest, PWA icons, versioned app-shell cache, cache-first assets, and
  offline fallback.
- A ₹499 one-time supporter pack using the Sociobot checkout/verify contract,
  cached offline unlock, and paste-to-restore. Core features are not gated.
- Product-specific pixel/demoscene design, original generated art with
  provenance, legal pages, MIT license, and operating documentation.

## Verification (2026-08-28)

- `npm test`: **12/12 passed**.
- `npx tsc --noEmit`: **passed** with strict TypeScript.
- `npm run build`: **passed**; `dist/index.html` is at the deploy root.
- `npm run test:e2e`: **7 passed, 1 expected project skip**. Desktop Chromium
  and 390×844 mobile cover add/persist, dialog keyboard behavior, axe checks,
  responsive layout, and real offline reload.
- Factory `verify-url.sh`: **passed**; HTTP 200, title/lang/one h1/main/alt
  checks, 0 console errors, and desktop/mobile screenshots.
- Lighthouse 12.8.2 simulated mobile: **Performance 100, Accessibility 100,
  Best Practices 100**; LCP 1.7 s, CLS 0, total blocking time 0 ms, speed index
  1.1 s.
- Production payload: **64.97 KB JS** (22.37 KB gzip), **15.29 KB CSS**
  (4.19 KB gzip), 66 KB mobile hero, and 114 KB desktop hero.
- `npm audit --omit=dev`: **0 vulnerabilities**; there are no runtime CDNs,
  fonts, analytics, or trackers.

## Run

```sh
npm install
npm test
npm run build
npm run test:e2e
```

Static deployment publishes `dist/`. Unknown application navigation should
fall back to `index.html`; `/privacy/` and `/terms/` are real built documents.

## Known boundaries / next steps

- Handoffs and ICS files are intentional snapshots, never real-time sync.
- The UI creates simple daily/weekly/monthly RRULEs. Advanced imported rules
  such as `BYDAY`, `INTERVAL`, exceptions, and modified instances are preserved
  in the event note but shown once rather than silently misrepresented.
- QR is intended for modest boards; oversized payloads direct users to the
  encrypted file flow.
- The factory must register the production billing product and run a live
  purchase/restore/refund smoke test. No product ID or secret is embedded.
- Before broader release, field-test ICS round trips with current Apple, Google,
  and Outlook clients and run VoiceOver/TalkBack checks on physical devices.
