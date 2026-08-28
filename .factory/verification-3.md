# Independent product verification-3 — **FAIL**

Verified 2026-08-28 UTC from a clean checkout of candidate
`6de4842db3295c205206030e8184e359309950d6`.

- Live URL: <https://family-weekboard.sociobot.in>
- Deployable application commit: `cfc55e77d169c43e99d555fb815335825be43450`
  (the candidate adds handoff documentation; its deployable application tree
  is this parent commit)
- Environment: Node `v22.23.2`, npm `10.9.8`, Playwright `1.58.2`, Chromium
  `145.0.7632.6`, Lighthouse `12.8.2`
- Overall result: **FAIL**

The local-first weekly board itself passes the exercised product contract:
offline persistence, people/lane planning, recurring/all-day plans, standard
ICS exchange, encrypted handoff, print-oriented layout, keyboard use, and the
390 px phone agenda all work. Promotion is blocked because the live UI
advertises a ₹499 supporter purchase but its required checkout endpoint
returns 404.

## Defects

### High

1. **The advertised ₹499 supporter purchase cannot be started.** A fresh
   `GET https://api.sociobot.in/api/v1/products/family-weekboard/checkout`
   returned:

   ```json
   {"error":"enabled factory product","status":404}
   ```

   The Support Weekboard dialog links directly to this required Sociobot
   endpoint. The product therefore cannot complete the one-time purchase it
   promotes. This is external product registration/deployment work, but it is
   still a release-blocking real-user failure.

### Low

1. **Manifest is delivered as `application/octet-stream`.** Chromium parses
   `/manifest.webmanifest` without manifest or installability errors, so this
   is not currently breaking the PWA. It should nevertheless be deployed with
   an application-manifest/JSON MIME type for interoperability.

No critical defects were found. The previous all-day DST, inverted-recurrence,
mobile legal-page accessibility, stale-service-worker, and response-policy
defects were independently rechecked and did not reproduce.

## Clean-checkout repository gates

The checkout began clean at the requested SHA on branch
`verification/family-weekboard-verify-3`; no product source was modified.

| Command | Result |
| --- | --- |
| `npm ci --include=dev` | PASS — 91 packages, 0 vulnerabilities |
| `npm test` | PASS — 4 files, 13 tests |
| `./node_modules/.bin/tsc --noEmit` | PASS |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm run build` | PASS — exact Vite production build into `dist/` |
| `npm run test:e2e` | PASS — 14 passed, 2 expected desktop/mobile skips |

There is no lint script or separate integration-test command defined in
`package.json`. The E2E command builds then serves the production output.

Production output is within the static-PWA budget:

| Asset | Raw | Gzip (where reported) | Budget |
| --- | ---: | ---: | --- |
| Initial JS | 65,671 B | 22.60 KB | <= 200 KB |
| CSS | 15,403 B | 4.19 KB | <= 50 KB |
| Fonts | 0 B | — | <= 120 KB |
| Mobile WebP | 67,410 B | — | <= 300 KB |
| Desktop WebP | 116,422 B | — | <= 300 KB |

## Independent end-to-end evidence

Fresh Playwright checks ran against the live URL at 1280 x 900 and 390 x 844.
They created a timed weekly recurring plan, persisted it through reload,
rejected an end time before the start and recovered by correcting it, exported
ICS, recovered from malformed ICS, generated an encrypted QR handoff, rejected
a too-short passphrase, and exercised delete cancel then confirmation. The
same flows passed at both sizes with no console or page errors.

- A valid `TZID=America/New_York` / `RRULE:FREQ=WEEKLY` ICS import rendered
  `Imported dentist`; escaped location content was accepted.
- A QR-produced encrypted handoff rejected a wrong passphrase with the
  explicit recovery message and left the receiving board unchanged.
- Under `America/New_York`, a one-day all-day plan on the 2027-03-14
  spring-forward boundary reopened with end date `2027-03-14`, not the prior
  day. Inverted repeat ranges and whitespace-only titles were rejected before
  persistence.
- Free normal usage made zero cross-origin requests. No analytics, trackers,
  CDN fonts/scripts, cloud schedule upload, account flow, or non-Sociobot
  payment provider was observed. Board data persisted in IndexedDB.
- The skip link received a visible solid focus outline and moved focus to
  `main`; modal Escape/focus return is covered by the repository E2E suite.
  Dark theme and `prefers-reduced-motion` were exercised; reduced transitions
  computed to `0.00001s`.
- Axe had zero serious/critical findings on the live home page at both
  viewports and on live `/privacy/` and `/terms/` at 390 px. Legal home links
  were named and measured 44 x 44 CSS px. The factory URL verifier also found
  title, `lang="en"`, exactly one h1, a main landmark, zero missing image alts,
  zero unnamed buttons, and no load-time errors (847 ms).
- Visual inspection of fresh desktop and mobile screenshots found a legible
  seven-day desktop board and an intentional one-day phone agenda with no
  horizontal clipping; controls and the empty state remain clear.

## PWA, privacy, and service-worker evidence

- Chromium obtained a controlling live service worker after reload. With the
  context offline, the live app reloaded and displayed `OFFLINE`; the heading
  and local board remained usable.
- The live worker is content-revisioned (`weekboard-shell-d5eac90cf24c7905`)
  and precaches the current hashed assets. The unit build regression mutates
  application code and proves that both the app asset URL and generated worker
  cache revision change; this is the available update-path evidence without
  mutating the production deployment.
- The generated manifest has name, short name, 192/512 icons plus maskable
  icon, standalone display, matching theme/background colors, and a versioned
  start URL. Chromium reported no manifest/installability error despite the
  MIME observation above.
- Browser request capture observed only same-origin resources in a fresh free
  session. The code permits the required Sociobot license verification host
  only when a license is present; no sign-in is implemented or required.

## Live deployment identity, response policy, and rate limit

The live build matches the candidate's deployable production output
byte-for-byte:

| File | SHA-256 |
| --- | --- |
| `index.html` | `7d15a75c0b44e79fbddfbb365121e6cb909558a31c957dd26efaa0cb2287bf6e` |
| `assets/main-BNBuyBae.js` | `76004ca82aeade81ce14bb28406b84b683b1711678e8c3021023a4f73519c042` |
| `assets/style-87JL0McU.css` | `96bada53019100e5e02898faa2ddb961d1df1be4a204cb13422ad5944ae23944` |
| `sw.js` | `ccadb26020cfda7e13de1bde0e8f8f67e91b22164abb5dab5e2478759ee385c2` |

Live HTTPS root and assets provide CSP restricted to self (with only the
necessary Sociobot API connect source), `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`, restrictive `Permissions-Policy`, strict
origin referrer policy, and HSTS. Hashed assets return
`public, max-age=31536000, immutable`; `/sw.js` returns
`no-cache, no-store, must-revalidate`; the manifest returns `no-cache`.

The invalid-token verify endpoint returns a correct no-store invalid verdict.
A rapid 40-request serial burst to
`/api/v1/products/family-weekboard/verify?license=qa-rate-N` started returning
`429` on request **30**, with `Retry-After: 3` (then 2 seconds later in the
same burst). This satisfies the requested endpoint rate-limit check.

## Performance

Lighthouse 12.8.2 mobile, simulated throttling, against the live URL (fresh
successful run using Chromium with `--disable-dev-shm-usage`):

| Measure | Result |
| --- | ---: |
| Performance | 96 |
| Accessibility | 100 |
| Best practices | 100 |
| FCP | 1.08 s |
| LCP | 1.46 s |
| CLS | 0 |
| Total blocking time | 229 ms |

The performance and accessibility category targets pass. Lab TBT is reported
above; no field INP is available to claim an INP measurement.

## Required next step

Enable/register the `family-weekboard` one-time Sociobot product and return
URL `https://family-weekboard.sociobot.in/`, then smoke-test the hosted
checkout and return-license path. Re-run verification before promotion. No
code change can honestly make this report PASS while the public purchase link
returns 404.
