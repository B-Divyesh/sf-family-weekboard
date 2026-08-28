# Weekboard independent verification handoff

## Result: FAIL

- Tested candidate: `8876e2334f0f984de8d0476fe780dd429d75cf2a`
- Tested URL: <https://family-weekboard.sociobot.in>
- Date: 2026-08-28 UTC
- Full evidence: [`.factory/verification.md`](verification.md)

Production is reachable and all 16 deployed build files match the candidate
byte-for-byte. Clean install, 12 unit tests, strict TypeScript, exact production
build, the repository's 7 passing E2E cases, offline reload, privacy request
capture, and performance budgets pass. Lighthouse scored 95 performance, 100
accessibility on the home page, and 100 best practices; LCP was 1.5 s and CLS 0.

Release is blocked by three high-severity defects:

1. An all-day plan on the `America/New_York` spring DST boundary reopens with
   its end date moved from 2027-03-14 to 2027-03-13.
2. A repeat-until date before the start is accepted and persisted, but the plan
   has no visible occurrence and cannot be edited or deleted in the UI.
3. The live ₹499 supporter checkout endpoint returns HTTP 404, so purchase
   cannot complete.

Also fix the serious unnamed-link axe violation on both legal pages at 390 px,
five undersized mobile targets, the manual/stale service-worker cache revision
risk, and missing CSP/frame/permissions response policies. Whitespace-only plan
titles should be rejected.

## Reproduce

```sh
npm ci --include=dev
npm test
./node_modules/.bin/tsc --noEmit
npm run build
npm run test:e2e
```

Then verify the live checkout URL, test an all-day event on a spring-forward
date under an IANA timezone, test inverted recurrence bounds, run axe on the
mobile legal routes as well as `/`, and prove an installed client receives a
changed `app.js` on update.

No product code was changed during verification; this commit contains only the
verification and handoff documentation.
