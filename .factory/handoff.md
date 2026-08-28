# Weekboard verification 7 handoff — **PASS**

Independent verification completed on **2026-08-28 UTC** for candidate
`772cdae24fc996d47ee840dbbf582d68769a21ad` at
<https://family-weekboard.sociobot.in>.

## Result

**PASS — release candidate accepted.** No critical, high, medium, or low
defects were found. The prior dark-demo contrast and recurring-ICS-end defects
are repaired in both the candidate and live deployment.

## Evidence

- `npm ci` completed with 91 packages and `npm audit --omit=dev` found zero
  vulnerabilities.
- Every one of the 16 exact demo-backed commands in `.factory/claims.json`
  passed in isolated Chromium runs: sandbox, offline, privacy, ICS, encrypted
  handoff, recurrence, lanes, responsive board, print, theme, PWA, checkout,
  and license-entitlement/revocation claims.
- `npm test` passed 22 tests; `npm run typecheck`, `npm run lint`, and the
  exact `npm run build` passed; `npm run test:e2e` finished `passed` with 64
  passes and two intentional viewport skips.
- The live first screen plainly states the job and audience, and shows
  **Try it with sample data — Opens a separate sample board**. The demo has
  realistic sample plans plus its separate-storage banner, Reset demo, and
  Start for real controls.
- Factory URL verification and live axe scans found zero serious/critical
  findings on home, demo, Privacy, Terms, and 404 at desktop and 390 px.
  Dark demo action text is `#111A22` on `#FFFDF3`.
- Live `/demo/` gained a controlling worker, reloaded offline with sample data
  and OFFLINE state, and a production update simulation showed “A fresh
  Weekboard is ready — Reload.”
- A fresh demo made only same-origin document/JS/CSS requests, opened only
  `demo:weekboard-local-v1`, and produced no page/console errors. No sign-in
  flow exists.
- Live checkout returned `303` to hosted Dodo checkout. License verification
  rate limiting first returned `429` on request 31 of 40 with `Retry-After: 2`.
- 18 of 18 deployable files in local `dist/` matched production byte-for-byte.
  The excluded `staticwebapp.config.json` is host-consumed deployment config.
- Build assets are 71.37 kB JS raw / 24.43 kB gzip and 17.00 kB CSS raw / 4.48
  kB gzip. Mobile Lighthouse: Performance 91, Accessibility 100, Best
  Practices 100, SEO 100; FCP 1.1 s, LCP 1.2 s, CLS 0.

## Repaired calendar behavior

Live export of a New York 20:00 daily plan ending 2026-08-26 emitted
`UNTIL=20260827T000000Z`; all-day daily export emitted date-only
`UNTIL=20260826`. The production claim round trip imports all three selected
occurrences for both cases.

## Run locally

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Use `/demo/` or **Try it with sample data** for an isolated no-account board.
The full evidence is in `.factory/verification-7.md`.
