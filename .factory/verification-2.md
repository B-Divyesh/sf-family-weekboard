# Independent product verification — FAIL

Verified on **2026-08-28 UTC** from a clean detached checkout.

- Candidate: `6de4842db3295c205206030e8184e359309950d6`
- Live URL: <https://family-weekboard.sociobot.in>
- Work order: `family-weekboard-verify-2`
- Environment: Node `v22.23.2`, npm `10.9.8`, Playwright Chromium `145.0.7632.6`, Lighthouse `13.4.1`
- Overall result: **FAIL**

The static application and its deployment are healthy: the live release is
byte-identical to the candidate build, local-first scheduling and handoff
flows work, the previous calendar/accessibility/PWA-cache repairs hold, and
the PWA reloads offline. Release acceptance still fails because the advertised
₹499 hosted checkout is unavailable and the product-unlock API did not rate
limit a burst of requests as required by the work order.

## Release-blocking defects

### High

1. **The advertised supporter purchase cannot be completed.** On a fresh GET
   at `2026-08-28 07:53 UTC`,
   `https://api.sociobot.in/api/v1/products/family-weekboard/checkout`
   returned `HTTP 404` with:

   ```json
   {"error":"enabled factory product","status":404}
   ```

   The application correctly uses the required Sociobot endpoint and does not
   embed another payment provider, but a customer selecting “Buy supporter
   pack” cannot reach checkout. This blocks the advertised paid path.

2. **The unlock-verification endpoint did not rate-limit rapid requests.** A
   fresh invalid-token burst to
   `GET /api/v1/products/family-weekboard/verify?license=qa-rate-limit-invalid`
   received all `200` responses: 10 + 20 + 40 + 80 requests (150 total, sent
   as rapid parallel batches). No `429` or `Retry-After` header was observed;
   the rate-limit threshold is therefore **not established / greater than 150
   requests in this test**. The work order explicitly requires every
   server-side endpoint, including product-unlock calls, to begin returning
   `429` with `Retry-After` during a burst.

No critical defects were found. The two failures are owned by the hosted
billing/API configuration rather than the static product code, but they remain
release acceptance failures.

## Clean-checkout repository gates

The candidate was checked out detached into a new empty clone; `git status
--porcelain` was empty before installation.

| Command | Result |
| --- | --- |
| `npm ci --include=dev` | PASS — 91 packages, 0 vulnerabilities |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm test` | PASS — 4 files, 13 tests |
| `./node_modules/.bin/tsc --noEmit` | PASS |
| `npm run build` | PASS — exact Vite production build to `dist/` |
| `npx playwright test --project=chromium` | PASS — 6 passed, 2 expected mobile-only skips |
| `npx playwright test --project=mobile` | PASS — 8 passed |

There is no lint script or separate integration-test command declared in
`package.json`. The project’s full E2E command comprises those two projects;
running them separately avoids the executor’s 30-second command-output cap.

Production output is within the static/PWA budgets:

- JS `assets/main-BNBuyBae.js`: 65,671 bytes (22.60 KB gzip), below 200 KB.
- CSS `assets/style-87JL0McU.css`: 15,403 bytes (4.19 KB gzip), below 50 KB.
- No downloaded fonts.
- Responsive WebP assets: 67,410 bytes mobile and 116,422 bytes desktop,
  both below 300 KB.
- Build uses ES2022, content-hashed assets, no source maps, and a generated
  content-derived service-worker cache revision.

## Independent functional coverage

In addition to the repository tests, fresh Playwright contexts exercised the
following against the exact production build and against the live site:

- normal plan creation, IndexedDB persistence, refresh, all-day edit on the
  2027 `America/New_York` spring-forward boundary, recurrence range rejection,
  whitespace-title rejection, edit, cancel-delete, confirmed delete, people
  limit, and desktop print rules;
- standard ICS export (including comma/semicolon escaping), valid
  `TZID=America/New_York` plus weekly RRULE import, and malformed-ICS error
  recovery;
- short-passphrase feedback, AES-GCM QR handoff generation, and wrong-
  passphrase recovery without replacing the current board;
- explicit confirmation that encrypted handoff is described as a snapshot,
  not live sync;
- desktop 1280×900 and phone 390×844 rendering. The phone intentionally shows
  one selected day; no horizontal document overflow was measured;
- keyboard-only skip-link activation (visible solid outline, then focus moves
  to `main`), Escape/focus-return dialog handling, and 44×44 px key controls;
- light/dark/system path and reduced-motion rule (dialog animation computed
  as `0.01ms` with `prefers-reduced-motion: reduce`);
- an installed live worker with a newly saved plan survived an offline reload:
  event visible, `OFFLINE` state visible, and worker controller present.

The source/build test `tests/unit/pwa-build.test.ts` also passed its isolated
two-build update check: changing application code changes both the emitted
main-asset URL and generated worker cache revision. Live `sw.js` advertises
`weekboard-shell-d5eac90cf24c7905` and precaches the candidate’s hashed assets.

## Accessibility, privacy, and browser checks

- Axe found **0 serious/critical** findings on the live home page at desktop,
  and on home, `/privacy/`, and `/terms/` at 390 px. The repaired legal home
  link has a name and all measured key targets are at least 44 px high/wide.
- The live root produced no console errors or page errors. It has one `h1`,
  `lang="en"`, `main`, title, skip link, and meaningful hero alt text.
- Fresh free-use request capture contained only
  `https://family-weekboard.sociobot.in`; no analytics, tracker, CDN, remote
  font, or schedule upload was observed. Pasting an invalid license made only
  the explicit expected request to Sociobot’s verify URL.
- Local storage/IndexedDB remain local. Source audit found no network client
  except same-origin worker fetches and the explicit Sociobot license verify.
  There is no sign-in flow and therefore no non-Sociobot identity provider.
- `Page.getAppManifest` reported zero errors. The manifest, 192/512 icons,
  standalone display, start URL, and controlling service worker all work in
  Chromium. Chrome accepts the host’s `application/octet-stream` manifest MIME
  in this deployment, though `application/manifest+json` would be preferable.
- HTTPS supplies HSTS, CSP with `frame-ancestors 'none'`, `X-Frame-Options:
  DENY`, `nosniff`, restrictive Permissions-Policy, and strict-origin referrer
  policy. Hashed JS/CSS have `public, max-age=31536000, immutable`; `sw.js`
  has `no-cache, no-store, must-revalidate`.

Lighthouse 13.4.1 live mobile results: **93 performance, 100 accessibility,
100 best practices**; FCP 1.1 s, LCP 1.1 s, TBT 320 ms, CLS 0, 48 KiB transfer.
Lab INP/field data is not available, so no field-INP claim is made.

## Deployment identity

All 13 public release files from the candidate build matched production
SHA-256 byte-for-byte. `staticwebapp.config.json` is consumed by the static
host and appropriately is not public; Vite’s internal `.vite/manifest.json`
is not a runtime release file. Representative exact matches:

| File | SHA-256 |
| --- | --- |
| `index.html` | `7d15a75c0b44e79fbddfbb365121e6cb909558a31c957dd26efaa0cb2287bf6e` |
| `assets/main-BNBuyBae.js` | `76004ca82aeade81ce14bb28406b84b683b1711678e8c3021023a4f73519c042` |
| `assets/style-87JL0McU.css` | `96bada53019100e5e02898faa2ddb961d1df1be4a204cb13422ad5944ae23944` |
| `sw.js` | `ccadb26020cfda7e13de1bde0e8f8f67e91b22164abb5dab5e2478759ee385c2` |
| `manifest.webmanifest` | `ab50d6007476e999e7a10c71aa6b03ff8f5a751bb370d84d2cc54f980a2f9e65` |

## Required disposition

**Do not promote this candidate.** Register/enable the production
`family-weekboard` supporter product and complete a hosted-checkout smoke
test. Apply a rate limit to the Sociobot product verification endpoint that
returns `429` and a usable `Retry-After` header, then repeat the burst test
and this verification. The static app requires no code repair based on this
run.
