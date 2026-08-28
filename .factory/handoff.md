# Weekboard adversarial review 2 handoff — FAIL

Reviewed the deployed product on 2026-08-28 at repository commit
`bbb3d67b74093251420dbfde619c835e49a66c4b`. No product code was changed.

## Delivered

- `.factory/review-2.md` with the cold mobile/desktop read, complete landing and
  README copy audit, all 17 declared claim results, demo/privacy/offline checks,
  all 29 prior-finding confirmations, route/link/accessibility checks, missed
  leverage assessment, and an 11-finding FAIL verdict.
- `.factory/evidence/review-2/` with cold screenshots, the blocking phone-demo
  screenshot, and the supplied live URL verifier output.

## Verification performed

- Fresh local clone at `/tmp/weekboard-review2.wDER95`: `npm ci`, then every
  exact `.factory/claims.json` command separately — 17/17 pass.
- Live fresh Chromium at 390 × 844 and 1440 × 900; no console error on the 200
  routes.
- Live demo mutation/reset/exit isolation, separate IndexedDB names, same-origin
  request capture, service-worker control, and offline reload.
- Live crawl: home, both demo URLs, Privacy, Terms, factory link, checkout, and
  linked static assets resolve; unknown route returns the designed HTTP 404.
- Live Axe at mobile and desktop on demo, Privacy, Terms, and 404 — zero
  violations.
- `/opt/fleet/lib/verify-url.sh` on the live query demo — pass; output is under
  `.factory/evidence/review-2/verify-url/`.
- `npm test` — 22/22 pass.
- `npm run build` — pass; `dist/` produced; main JS 71,459 bytes raw / 24.24 kB
  gzip.

## Remaining work

The blocking items are F-2-1 (no sample event in the initial 390 × 844 demo
viewport), F-2-2 (unlisted/untested no-sync promise, reopening F-1-5), and
F-2-3 (hosted price/billing-recurrence/refund facts not verified, reopening
F-1-7).
One major and seven minor findings are also specified with exact fixes in
`.factory/review-2.md`.

## Reproduce

```sh
npm ci
npm test
npm run build
npm run test:e2e
/opt/fleet/lib/verify-url.sh 'https://family-weekboard.sociobot.in/?demo=1' .factory/evidence/review-2/verify-url
```
