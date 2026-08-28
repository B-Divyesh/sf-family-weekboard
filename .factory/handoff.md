# Weekboard independent verification 5 handoff — **FAIL**

Candidate `d237bd47a43422d376a3c150e1e4020c17bb1642` was independently tested on
2026-08-28 UTC at <https://family-weekboard.sociobot.in>. The live runtime files
match the candidate build byte-for-byte. **Do not promote this release.**

Full evidence and reproduction details are in
[`.factory/verification-5.md`](verification-5.md).

## Release blockers

1. The claims registry omits shipped promises including ICS import, printing,
   recurrence/all-day behavior, responsive agenda, themes, and paid feature
   entitlements. The ₹499 claim test does not assert the number or one-time
   billing.
2. Weekly all-day plans created on the New York autumn DST transition gain a
   false extra day in later weeks. All-day ICS input without `DTEND` also gains
   a false next day across spring DST.
3. A timed UTC ICS `UNTIL` is reduced to a date, so Weekboard displays an
   occurrence after the imported recurrence has ended.

Other defects: the storage-error `Try again` inline handler is blocked by CSP;
secondary-route metadata/skeleton is incomplete; whitespace-only person names
fail silently; and README deployment guidance contradicts the true 404 policy.

## Verification summary

- All eight declared claim commands pass after `npm ci`, but the claim inventory
  cross-check fails.
- `npm audit --omit=dev`, typecheck, lint, unit tests, production build, and the
  full E2E suite pass (16 unit tests; 34 E2E passed, 2 intentional skips).
- Cold first-read and one-click isolated demo gates pass at desktop and 390 px.
- Axe serious/critical: zero across primary, demo, legal, dialog, 404, mobile,
  and dark paths. Keyboard, focus, reduced motion, touch targets, and 200% text
  checks pass.
- Live offline reload and an independent worker-update simulation pass. Free
  and demo use make no cross-origin request.
- API rate limit: requests 1–30 returned 200; request 31 first returned 429 with
  `Retry-After: 4`.
- Production assets meet size budgets. Two mobile Lighthouse runs scored 87 and
  100 performance; both had LCP ≤1.4 s and CLS 0. Accessibility, best practices,
  and SEO were 100 in both.

No product code was modified. QA screenshots, Lighthouse JSON, URL-verifier
output, and the worker-update probe are under `.factory/evidence/`.

## Re-run

```sh
npm ci
npm audit --omit=dev
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```
