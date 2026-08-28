# Weekboard

Weekboard is a private, installable weekly planner for households that use a
mix of Android, iPhone, desktop, and paper—but do not want to put their shared
schedule into another cloud account. It runs fully offline and stores plans in
the browser on the current device.

Live: <https://family-weekboard.sociobot.in>

Demo: <https://family-weekboard.sociobot.in/demo/> — opens a seeded sample
board in the separate `demo:weekboard-local-v1` database. Use **Reset demo**
to restore the sample or **Start for real** to leave without copying changes.

## What v1 includes

- A seven-day desktop board and focused one-day phone agenda
- Household people/lane colours, all-day plans, and daily/weekly/monthly repeats
- Standard ICS import and export, with UTC timestamps and RRULE recurrence
- Explicit AES-GCM encrypted file and QR handoff (a snapshot, not live sync)
- Print layout, light/dark/system themes, installable PWA, and offline storage
- Optional ₹499 one-time supporter license through the Sociobot billing API

There are deliberately no accounts, invitations, cloud sync, contacts, chat,
analytics, third-party scripts, or CalDAV server.

## Develop and verify

Requires Node 20 or newer.

```sh
npm install
npm run dev
npm test
npm run build       # exact production command; output is dist/
npm run preview     # serves dist for browser checks
npm run test:e2e    # builds and starts an isolated preview automatically
```

`npm test` covers calendar recurrence and ICS interoperability. The Playwright
suite covers creation/persistence, keyboard-accessible dialogs, mobile layout,
accessibility, demo isolation, claims, and installed/offline reload. Every
user-facing product claim and its exact command is listed in
[`.factory/claims.json`](.factory/claims.json). The free planner makes no
cross-origin request. Buying or verifying a supporter license uses the
Sociobot billing API.

## Data ownership and deployment

IndexedDB holds the board. ICS is the interoperable backup; `.weekboard` files
are encrypted snapshots. Importing an encrypted snapshot replaces the receiving
board after a named confirmation.

Deploy the contents of `dist/` as a static site with `index.html` at its root.
Keep the shipped 404 response override: unknown paths must serve `/404.html`
with HTTP 404, not an SPA fallback. `/privacy/` and `/terms/` are real static
routes. `staticwebapp.config.json` ships the 404 policy, CSP, frame/permission
policy, no-cache worker rule, and immutable caching for Vite’s content-hashed
assets. Do not add runtime CDN assets.

The visual system and generated-art provenance are in
[`.factory/design.md`](.factory/design.md). Build handoff and measured gates are
in [`.factory/handoff.md`](.factory/handoff.md). Licensed under MIT.
