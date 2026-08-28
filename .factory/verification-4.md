# Independent product verification 4 — **FAIL**

Verified on **2026-08-28 UTC** from a clean checkout of candidate
`cf033f0c0fe36c161d8ad0c830bd711f38537b7a` (`main`) against
<https://family-weekboard.sociobot.in>.

The live build is byte-identical to this candidate's production output and the
core local weekly-board workflow works. Release acceptance nevertheless fails
four independent blockers: the required claims manifest is absent, there is no
sample-data demo and the cold first screen does not satisfy the plain-words
gate, the advertised production purchase still returns 404, and an unverified
token unlocks paid features when license verification is unavailable.

## Mandatory gates run first

### Claims gate — FAIL

`.factory/claims.json` is missing. This was checked before dependency install
or other repository tests, as required. There were consequently no declared
claim commands to execute. No test in the repository contains an `@claim:` tag.

This is not merely a missing file: the live UI and README make material claims
including “works offline,” “no schedule sent away,” local storage, ICS export,
AES-GCM encrypted handoff, installability, and no analytics/third-party scripts.
None is listed in the required claims manifest or proven through the required
clean demo entry point.

### Cold first-read and demo gate — FAIL

At 1440 × 900, a fresh browser showed `Our week`, followed by `One clear week.
No account, no cloud sync, no schedule sent away.` The page appears to be a
private household weekly planner, and `Add plan` is the apparent first action.
It does not plainly name cross-platform families as the audience, `Our week` is
not a job-stating headline, and no adjacent sentence explains what follows the
first click.

There is no visible `Try it with sample data` action. Opening `/demo` returns
HTTP 200 but displays the same empty production board: zero sample-data action,
zero demo banner, no reset/start-for-real controls, and no isolated `demo:`
storage namespace. `.factory/demo.md` is also absent. These conditions trigger
the work order's automatic FAIL rule.

## Defects

### Critical

1. **Required claim tests do not exist.** `.factory/claims.json` is absent and
   all user-facing reliability/privacy/export claims are unlisted. This is an
   explicit release blocker in the acceptance contract.

2. **The mandatory one-click isolated demo and plain-words first screen do not
   exist.** `/demo` is the empty real app, not a sandbox, and the cold screen
   does not answer what/for whom/first click in the required wording and shape.

### High

1. **The advertised ₹499 purchase still cannot start.** A fresh request to
   `https://api.sociobot.in/api/v1/products/family-weekboard/checkout` returned
   HTTP 404 with `{"error":"enabled factory product","status":404}`. The live
   `Buy supporter pack` link points to this endpoint. The previously reported
   deployment-only billing failure therefore remains present in fresh evidence.

2. **A never-validated token unlocks paid features if verification is
   unavailable.** In a fresh live browser, the verification request was made
   unavailable and `never-validated-token` was entered through the restore
   form. The UI changed to `Supporter ✓`, the paid board-name field became
   enabled, and local storage contained
   `{"valid":true,"checkedAt":0}`. Online, a fresh invalid token correctly
   returned the inactive-license message and stayed locked. `saveLicense()`
   creates a trusted-looking positive verdict before any server success, while
   `verifyLicense()` returns that value on fetch/HTTP failure; network loss or
   rate limiting therefore bypasses the one-time purchase gate.

### Medium

1. **Required site discovery and route structure are incomplete.** There is no
   canonical link, Open Graph/Twitter metadata or 1200 × 630 social image,
   apple-touch icon, `robots.txt`, or `sitemap.xml`. The latter two return 404.
   An unknown path returns the Weekboard shell with HTTP 200 instead of a real
   designed 404. The landing page also lacks the required How it works and
   explicit non-goals sections, and the footer lacks Param Factory attribution
   and a version/build ID.

2. **Mobile day tabs do not implement arrow-key navigation.** At 390 px, focus
   on the selected `Fri 28` element remained on `Fri 28`, and selection did not
   change, after `ArrowRight`. Because these controls declare `role="tab"`, the
   expected arrow interaction is part of their keyboard contract. Tab/Enter
   navigation remains usable.

### Low

1. `.factory/copy-audit.md` is absent, so the required sentence-length,
   banned-word, and terminology audit was not delivered.

## Clean-checkout repository gates

The checkout began clean at the requested SHA. No product source was changed.

| Command | Result |
| --- | --- |
| `npm ci --include=dev` | PASS — 91 packages; 0 vulnerabilities |
| `npm test` | PASS — 4 files, 14 tests |
| `./node_modules/.bin/tsc --noEmit` | PASS |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm run build` | PASS — exact Vite production build emitted `dist/` |
| `npm run test:e2e` | PASS — 18 passed, 2 intentional responsive skips |

There is no lint script or separate integration-test script. The E2E command
builds and serves the production output.

Production output is within the supplied static-PWA budgets:

| Asset | Raw | Gzip | Budget |
| --- | ---: | ---: | ---: |
| Initial JavaScript | 65,671 B | 22.60 KB | ≤ 200 KB |
| CSS | 15,403 B | 4.19 KB | ≤ 50 KB |
| Fonts | 0 B | — | ≤ 120 KB |
| Mobile WebP | 67,410 B | — | ≤ 300 KB |
| Desktop WebP | 116,422 B | — | ≤ 300 KB |

## End-to-end product evidence

Fresh Playwright contexts exercised the live app at 1440 × 900 and 390 × 844.

- Created a timed weekly recurring family plan, rejected an end before its
  start with `The end must be after the start.`, corrected it, persisted it
  across reload, cancelled deletion, then confirmed deletion.
- Added people up to the free total of four; the fifth was rejected with the
  documented limit and recovery message.
- Recovered from a malformed ICS file, imported a valid
  `TZID=America/New_York` weekly event, and downloaded a 715-byte ICS file that
  contained the expected summary and RRULE.
- Rejected a short handoff passphrase, generated an encrypted QR/code without
  plaintext leakage, rejected the wrong passphrase, and successfully replaced
  the board from the valid encrypted handoff.
- Confirmed seven columns in print media, an intentional one-day phone agenda,
  no 390 px horizontal overflow, no undersized visible controls, and no content
  loss or horizontal overflow with body text enlarged to 200%.
- Repository regressions also passed the spring-forward all-day date,
  inverted recurrence, whitespace-only title, monthly short-month, and
  timezone conversion boundaries.

The free workflow made no cross-origin request. Source inspection found no
analytics, tracker, CDN font/script, WebSocket, beacon, or schedule upload. The
only designed external client call is explicit Sociobot license verification.
No sign-in exists, so the Entra tenant requirement is not applicable.

## Accessibility and browser behavior

- Independent axe scans found zero serious/critical violations on desktop home
  and supporter dialog, and on 390 px home, Privacy, and Terms in both the
  exercised light/dark paths.
- `verify-url.sh` passed in 916 ms: HTTPS 200, title, `lang="en"`, one h1, main
  landmark, no missing image alts, no unnamed buttons, and no console/page
  errors.
- The skip link had a visible 3 px solid focus outline and moved focus to main.
  Native modal Escape returned focus. Dark theme rendered with background
  `rgb(17, 26, 34)`. Reduced-motion transitions computed to `0.00001s`.
- No console or uncaught page errors occurred in the independent desktop,
  mobile, or legal-page flows. The ARIA tab arrow defect is listed above.

## PWA, privacy, response policy, and rate limiting

- Chromium parsed `/manifest.json` with zero manifest errors. It contains a
  versioned start URL, standalone display, matching theme/background colors,
  192/512 icons, and a maskable icon.
- A controlling live service worker retained the imported plan through an
  offline reload and showed `OFFLINE`. A local production-output update
  simulation installed a changed worker, displayed `A fresh Weekboard is
  ready`, reloaded under control, and removed the old cache. The unit build
  regression independently proves application changes alter both hashed assets
  and the worker cache revision.
- HTTPS redirects correctly. Root and assets supply HSTS, restrictive CSP,
  frame denial, no-sniff, Permissions-Policy, and strict-origin referrer
  policy. Hashed assets are one-year immutable; the manifest is no-cache and
  the worker is no-store/must-revalidate.
- The real invalid-token endpoint returned HTTP 200, `Cache-Control: no-store`,
  and `{valid:false, reason:"invalid"}`.
- In a rapid 45-request burst against the production verify endpoint, requests
  1–30 returned 200. Request **31** was the first 429 and included
  `Retry-After: 3`; subsequent limited responses also carried Retry-After.

## Deployment identity

All 13 public runtime files in the local `dist/` matched the live origin
byte-for-byte. Representative SHA-256 values:

| File | SHA-256 |
| --- | --- |
| `index.html` | `88ebe8e667cd5f82478e3ca45d86af0597efeefa4e7ed1fbd003ac3d3b4a78ef` |
| `assets/main-BNBuyBae.js` | `76004ca82aeade81ce14bb28406b84b683b1711678e8c3021023a4f73519c042` |
| `assets/style-87JL0McU.css` | `96bada53019100e5e02898faa2ddb961d1df1be4a204cb13422ad5944ae23944` |
| `sw.js` | `cf8ad557c5c321acaf2160592f9092fc9d2bba9e3e8e72372b863d2bf584a425` |
| `manifest.json` | `ab50d6007476e999e7a10c71aa6b03ff8f5a751bb370d84d2cc54f980a2f9e65` |

The candidate commit itself changes only `.factory/handoff.md`; rebuilding at
that SHA still reproduces the deployed application exactly.

## Performance

Lighthouse 12.8.2 mobile simulated throttling against the live URL:

| Measure | Result |
| --- | ---: |
| Performance | 91 |
| Accessibility | 100 |
| Best practices | 100 |
| FCP | 1.14 s |
| LCP | 1.17 s |
| Speed Index | 1.67 s |
| Total blocking time | 385 ms |
| CLS | 0 |

No field INP data is available, so no INP claim is made.

## Disposition

**FAIL — do not promote.** Add the required claims manifest and tagged demo
tests, build the isolated one-click sample-data demo and compliant first screen,
require a previously server-validated verdict before offline paid access,
register/enable and smoke-test the production checkout, and repair the listed
site/keyboard contract gaps before re-verification.
