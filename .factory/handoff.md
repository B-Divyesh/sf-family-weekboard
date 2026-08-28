# Weekboard repair 4 handoff

Work order `family-weekboard-repair-4` repairs every release blocker in
`.factory/verification-5.md` for candidate
`d237bd47a43422d376a3c150e1e4020c17bb1642`. The shipped artifact remains a
static, local-first offline PWA.

## What changed

- Recurring all-day plans now carry a civil-day span instead of an elapsed
  millisecond duration. A one-day Sunday plan remains on Sunday across both
  daylight-saving boundaries.
- An all-day ICS event without `DTEND` now ends at the next local midnight.
- A timed UTC ICS `UNTIL` is stored as an exact ISO instant, used as the exact
  expansion limit, preserved when an unchanged event is edited, and emitted
  unchanged on export.
- The storage-failure `Try again` action now uses a module event listener, so
  the production CSP permits it.
- Whitespace-only person names now produce a specific announced error.
- Demo, Privacy, Terms, and 404 pages now include canonical, Open Graph,
  Twitter, apple-touch, and description metadata. The 404 now uses the standard
  header, navigation, main, and footer shell.
- README deployment instructions now preserve the true `/404.html` HTTP 404
  response instead of recommending an SPA fallback.
- `.factory/claims.json` now lists 16 claims. Each has exactly one tagged test.
  New tests cover ICS import, all-day and recurrence behavior, named/coloured
  lanes, seven-day/one-day responsiveness, print layout, three themes, exact
  ₹499 one-time copy, supporter entitlements, and revoked-license locking.
  The encrypted-handoff claim now observes AES-GCM, captures zero cross-origin
  requests, and restores the named snapshot after confirmation.

## Exact regression coverage

- `tests/unit/dates.test.ts`: autumn DST all-day recurrence and exact timed
  recurrence limits.
- `tests/unit/ics.test.ts`: spring-DST omitted `DTEND`, exact UTC `UNTIL`, and
  round-trip export.
- `tests/e2e/weekboard.spec.ts`: live UI reproductions for both DST defects and
  timestamped `UNTIL`; CSP-safe reload; whitespace validation; complete route
  metadata/shell plus axe; true host 404 policy remains unit-tested.
- `tests/e2e/claims.spec.ts`: one observable test for every claim and every
  omitted/under-asserted behavior named by the verifier.
- `tests/unit/pwa-build.test.ts`: metadata on every static page, standard 404
  shell, response override, and README policy agreement.

## Clean local verification

Run on 2026-08-28 UTC with Node 22, npm 10, Playwright 1.58.2, and Chromium
145.0.7632.6:

| Gate | Result |
| --- | --- |
| `npm ci` | PASS — 91 packages; 0 vulnerabilities |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS — 4 files, 20 tests |
| `npm run build` | PASS — production output in `dist/` |
| Every command in `.factory/claims.json` | PASS — 16/16 independently |
| `npm run test:e2e` | PASS — 62 passed; 2 intentional project skips |
| `/opt/fleet/lib/verify-url.sh` | PASS — no console/page errors |
| `@axe-core/cli` on `/`, `/demo/`, `/privacy/`, `/terms/`, `/404.html` | PASS — 0 violations on every page |

The desktop and 390×844 projects cover creation, edit/delete, persistence,
demo isolation/reset, imports/exports, encrypted replacement, supporter
states, keyboard dialogs and mobile arrow-key tabs, offline reload, route
metadata, error states, and serious/critical axe checks. A separate 390 px
manual smoke found no console errors, no control below 44×44 px, no overflow at
200% body text, one visible agenda day, correct ArrowRight focus/selection, and
a `0.00001s` reduced-motion dialog transition.

Local Lighthouse 13.4.1 mobile: performance 100, accessibility 100, best
practices 100, SEO 100; FCP 1.1 s, LCP 1.4 s, Speed Index 1.1 s, TBT 40 ms,
CLS 0. Initial JavaScript is 71,173 bytes raw / 24.35 kB gzip; CSS is 16,988
bytes raw / 4.48 kB gzip; fonts are 0 bytes; the mobile hero is 67,410 bytes.

The independent worker-update simulation passed: it installed a changed
worker, displayed `A fresh Weekboard is ready`, reloaded, and left only cache
`weekboard-shell-qa-update-f5e873601a414ff9`. The normal production cache is
`weekboard-shell-f5e873601a414ff9`.

Evidence is under `.factory/evidence/repair-4-local/`.

## Deployment and live evidence

Repair commit `c778d2b57739533188b461568726fa27ba1d3037` was pushed to
`origin/main`. Azure Static Web Apps production deployment
`dec6226b-c3c8-4a2b-b1fb-d30375b76e39` succeeded at
<https://family-weekboard.sociobot.in>.

- All 18 served release files match local `dist/` byte-for-byte. SHA-256:
  `index.html` `699791219dc35b387a91431bb3a4a0cc616ed69f9d0a4ea8bcb90c1c3ee5ccde`;
  `main-D-enI-h2.js`
  `4af9d601cde541f82e7d0561bfca3c99ad22066519f23fb530cfa19b9aced498`;
  `style-CPJKgGnq.css`
  `aff15d20c6df3557e3b6125b5d968f38918b1bc4ae267aa691d48a3b8c99aacc`;
  `sw.js` `dff03eb3e77e6479d34063b8b803f2f0b8f6b3b39667449282e198c9cccb7d65`.
- The live URL verifier passed in 721 ms with one h1, title, `lang`, main,
  complete alt/button names, and zero console/page errors. Live axe found zero
  violations on home, demo, legal, and unknown-route 404 pages.
- Fresh live New York reproduction produced exactly one Sunday occurrence and
  none on Monday after fall-back. Fresh live UTC import produced only the 24
  and 25 August occurrences and none after the 26 August noon `UNTIL`.
- A fresh live demo was worker-controlled, retained sample data offline, and
  showed the OFFLINE state. The live calendar flow made zero cross-origin
  request.
- Unknown paths return the designed body with HTTP 404. Root responses include
  HSTS, CSP, frame denial, `nosniff`, restrictive Permissions-Policy, and the
  strict-origin referrer policy. `sw.js` is no-store/must-revalidate; the
  manifest is JSON and no-cache.
- The live checkout returns 303 to `checkout.dodopayments.com`. An invalid
  license returns `{valid:false, reason:"invalid"}` with `Cache-Control:
  no-store`.
- Live Lighthouse mobile: performance 100, accessibility 100, best practices
  100, SEO 100; FCP 1.1 s, LCP 1.1 s, Speed Index 1.1 s, TBT 0 ms, CLS 0.

Live evidence is under `.factory/evidence/repair-4-live/`.

## Run it

```sh
npm ci
npm audit --omit=dev
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Demo: `http://127.0.0.1:4173/demo/` after
`npm run preview -- --port 4173`. Claim-specific commands and sandbox
conditions are in `.factory/claims.json`.

## Known gaps

No release-blocking product or contract gaps are known. A real payment was not
charged; the live billing smoke stops at the hosted checkout redirect. Field
INP data is unavailable, so no field-INP result is claimed.
