# Weekboard review 5 handoff

## Outcome

Review 5 is recorded in `.factory/review-5.md` with a **FAIL** verdict. Product
code was not modified. All 19 declared public claims pass individually and the
live user paths checked are sound, but the documented `npm run test:e2e` quality
gate fails in a clean checkout: 77 passed, 2 skipped, and 3 mobile tests fail.

## Verification performed

- Cold live review at 390 × 844 and 1440 × 900 before scrolling.
- Live demo sample, persistent label, reset, real/demo database isolation,
  offline reload, request capture, route/404/link, header, and rate-limit
  checks.
- All 19 exact commands in `.factory/claims.json` passed separately from clean
  clone `/tmp/family-weekboard-review5.ywDtQ4`.
- `npm audit --omit=dev`, `npm test` (22 tests), typecheck, lint, and build
  passed; `dist/` has 24.31 kB gzip main JS.
- `npm run test:e2e` failed only on three mobile selectors that expect Monday's
  School drop-off while the phone correctly opens Sunday's one-day agenda.
- Playwright Axe reported no serious/critical issue on live home, demo,
  Privacy, Terms, or the designed 404 at desktop, phone, and dark-phone sizes.
  The URL verifier passed.
- The live deployment matches all 20 locally built deployable candidate files.

## Reproduce

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Open <https://family-weekboard.sociobot.in> for the cold landing page and
<https://family-weekboard.sociobot.in/?demo=1> for the isolated sample board.

## Known gap and next step

Update the date-dependent mobile E2E assertions to select Monday before
expecting School drop-off, or assert whichever seeded plan is visible on the
selected day. Rerun the full E2E command from a clean checkout. Do not mark the
product PASS until it exits successfully.
