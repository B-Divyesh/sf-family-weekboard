# Weekboard repair handoff

Work order `family-weekboard-repair-3` repairs verifier report
`.factory/verification-4.md` for candidate `cf033f0c0fe36c161d8ad0c830bd711f38537b7a`.

## What changed

- Added the required claim registry and one observable Playwright test for
  each listed claim. All eight commands in `.factory/claims.json` pass from
  fresh browser contexts.
- Added `/demo/`, seeded with Asha, Ravi, Kids, and four current-week plans.
  It uses IndexedDB `demo:weekboard-local-v1`; the real board remains in
  `weekboard-local-v1`. Reset and exit flows are covered end to end.
- Rewrote the first screen around the job and cross-platform family audience.
  Added the required facts, How it works, limits, supporter, attribution, and
  build-identity sections. Copy evidence is in `.factory/copy-audit.md`.
- Registered and enabled the live `family-weekboard` supporter product with
  the Sociobot/Dodo billing engine at ₹499 once. The public endpoint now
  returns `303` to `checkout.dodopayments.com` and the live catalog reports
  `INR` / `49900`.
- Fixed entitlement trust. A pasted or returned token starts locked, its
  previous verdict is cleared, and only a successful verifier response stores
  a token-bound positive verdict. An unavailable verifier cannot unlock a new
  token; an already server-validated cached token still works offline.
- Added canonical, Open Graph, Twitter, apple-touch, social-card, robots, and
  sitemap assets. Removed SPA fallback, added a styled `404.html`, and set the
  static host to return it with status 404.
- Added roving tabindex plus Left/Right/Home/End behavior to mobile day tabs.
- Made encrypted handoffs use a compact WB1 envelope so the full sample fits a
  QR. The reader remains compatible with original JSON-envelope WB1 files.

## Clean local evidence

Run on 2026-08-28 UTC with Node 22, npm 10, Playwright 1.58.2, and Chromium
145.0.7632.6:

| Gate | Result |
| --- | --- |
| `npm ci --include=dev` | PASS — 91 packages, 0 vulnerabilities |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS — 4 files, 16 tests |
| `npm run build` | PASS — production output in `dist/` |
| Every `.factory/claims.json` command | PASS — 8/8 independently |
| `npm run test:e2e` | PASS — 34 passed, 2 intentional responsive skips |

Browser coverage includes desktop and 390×844 mobile, demo isolation/reset,
real-data persistence, ICS download contents, encrypted file and QR output,
offline demo reload, worker control/update revision, zero cross-origin free-use
requests, returned-license verification, failed-verifier lock state, dialog
focus return, mobile arrow-key tabs, legal pages, and axe serious/critical
scans. Visual review at 1440×900 and 390×844 found no horizontal overflow or
obscured controls.

Production budgets: initial JS 70,488 bytes raw / 23,831 bytes gzip; CSS
16,988 bytes raw / 4,500 bytes gzip; no fonts; mobile hero 67,410 bytes; social
card 91,692 bytes. All remain below the supplied budgets.

## Run it

```sh
npm ci --include=dev
npm audit --omit=dev
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Demo: `http://127.0.0.1:4173/demo/` after `npm run preview -- --port 4173`.
Claim-specific commands and sandbox conditions are in `.factory/claims.json`.

## Deployment and live evidence

Pending the repair commit and static deployment. This section will be updated
after byte-identity, response-policy, offline, accessibility, Lighthouse, and
checkout checks complete against the live origin.

## Known gaps

No code or product-contract gaps are known. A real paid card was not charged;
the release smoke test stops at the live hosted Dodo checkout page.
