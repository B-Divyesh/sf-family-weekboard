# Independent product verification 7 — **PASS**

Verified on **2026-08-28 UTC** from a clean checkout of
`772cdae24fc996d47ee840dbbf582d68769a21ad` (`main`) against
<https://family-weekboard.sociobot.in>.

- Work order: `family-weekboard-verify-7`
- Environment: Node 22.23.2, npm 10.9.8, Playwright 1.58.2, Chromium 145,
  Lighthouse 13.4.1
- Overall result: **PASS — ready to release**

No release-blocking defect was reproduced. The candidate fixes the two prior
release blockers: dark demo actions now have accessible contrast, and ICS
recurrence ends preserve the selected final occurrence.

## Mandatory first checks

### Claim manifest and exact commands — PASS

`.factory/claims.json` was present. After `npm ci`, each declared command was
run separately against the product's built demo entry point; all passed with
one test each.

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `offline-reload` | PASS |
| `local-privacy` | PASS |
| `ics-export` | PASS |
| `ics-import` | PASS |
| `encrypted-handoff` | PASS |
| `calendar-options` | PASS |
| `person-lanes` | PASS |
| `responsive-agenda` | PASS |
| `print-board` | PASS |
| `themes` | PASS |
| `installable-pwa` | PASS |
| `paid-checkout` | PASS |
| `license-restore` | PASS |
| `supporter-entitlements` | PASS |
| `license-revocation` | PASS |

The ICS export claim now exercises both the New York timed-boundary case and
the all-day boundary case, imports the downloaded calendar in a fresh board,
and observes three occurrences of each. The visitor-facing claims on the
landing page and README map to the manifest inventory; no unlisted material
claim was found.

### Cold first-read and demo — PASS

In a new desktop browser profile with no storage, the first live screen said:

- **What it does:** “Plan your family week together.”
- **For whom:** families using phones, computers, and paper who need one
  shared weekly view without a new account.
- **First action:** “Try it with sample data,” with “Opens a separate sample
  board” immediately beside it.

The same screen provides the plain offline, on-device, and free-core facts.
The one-click demo opens `/demo/` with four realistic plans for Asha, Ravi,
and Kids. Its banner says “Demo — sample data, nothing is saved,” offers
**Reset demo** and **Start for real**, and uses its own IndexedDB namespace.

## Clean-checkout gates — PASS

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 91 packages, audit clean |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm test` | PASS — 4 files, 22 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (`tsc --noEmit`) |
| `npm run build` | PASS — Vite production `dist/` |
| `npm run test:e2e` | PASS — 64 passed, 2 intentional viewport skips |
| Factory `verify-url.sh` | PASS — title/lang/h1/main/alt/button/error checks |

The production build is within the static-PWA asset budget: JavaScript 71.37
kB raw / 24.43 kB gzip, CSS 17.00 kB raw / 4.48 kB gzip, no font payload, and
the responsive images are 67.41 kB and 116.42 kB. Mobile Lighthouse reported
91 Performance, 100 Accessibility, 100 Best Practices, and 100 SEO (FCP 1.1
s, LCP 1.2 s, TBT 390 ms, CLS 0). Lighthouse emitted a browser-cleanup warning
after writing the complete valid report; it did not affect the measured page
or the browser console checks.

## Independent product checks — PASS

- Normal and recovery paths covered by the full production E2E suite: create,
  refresh persistence, edit, cancel/confirm delete, all-day and daily/weekly/
  monthly repeats, whitespace and inverted-range rejection, malformed-then-
  valid ICS import, free-person boundary, encrypted passphrase/QR handoff,
  and checkout/license revocation behavior.
- Live recurrence evidence: a 20:00 America/New_York daily event through
  2026-08-26 exported `RRULE:FREQ=DAILY;UNTIL=20260827T000000Z`; an all-day
  event exported `RRULE:FREQ=DAILY;UNTIL=20260826`. This is the repaired
  behavior that preserves the final occurrence and matches DTSTART value type.
- At 390×844 the live demo shows a one-day agenda, the complete demo banner,
  no horizontal overflow (390 px scroll/client width), and visibly usable
  controls. Desktop shows the seven-day board.
- Keyboard production tests confirm Skip to weekly board, visible focus,
  Escape dialog closing with focus return, and arrow-key mobile day selection.
  Reduced-motion tests pass with the transition reduced to an effectively
  instant duration.

## Accessibility, privacy, PWA, and security — PASS

- Axe found **zero serious/critical** findings on live `/`, `/demo/`,
  `/privacy/`, `/terms/`, and `/not-a-real-page` at 1440 px and 390 px.
  Dark-mode demo was separately scanned at both sizes with zero findings;
  Reset demo and Start for real computed to dark `rgb(17,26,34)` text on light
  `rgb(255,253,243)` backgrounds.
- A fresh live `/demo/` session made only same-origin requests for the HTML,
  `main-eFBaZvT6.js`, and CSS. It opened only
  `demo:weekboard-local-v1`; no analytics, remote font, tracking, account,
  or schedule request was observed. Console and page-error lists were empty.
- `/demo/` received a controlling worker and, after going offline, reloaded
  showing both OFFLINE status and School drop-off. The rendered worker cache
  was `weekboard-shell-8deef49354d6a9f4`. A local production update simulation
  changed only copied worker bytes, invoked `registration.update()`, and
  showed “A fresh Weekboard is ready — Reload.”
- Live headers provide HTTPS/HSTS, CSP, `X-Frame-Options: DENY`, nosniff,
  strict referrer policy, restrictive Permissions-Policy, immutable hashed
  assets, `no-cache/no-store` worker caching, JSON manifest MIME, and a real
  HTTP 404. The app has no sign-in, so Microsoft Entra tenant validation is
  not applicable.

## Billing and rate limiting — PASS

`https://api.sociobot.in/api/v1/products/family-weekboard/checkout` returned
`303` to `checkout.dodopayments.com`. A fresh sequential 40-request burst to
the production license verifier returned 200 for requests 1–30; request **31**
was the first 429, and requests 31–40 carried `Retry-After: 2`.

## Deployment identity — PASS

All 18 deployable public files in freshly generated local `dist/` matched the
live origin byte-for-byte, including the content-hashed JS/CSS/assets, worker,
manifest, legal pages, icons, and 404. Local
`staticwebapp.config.json` correctly returned a public 404 because Azure
Static Web Apps consumes it as deployment configuration rather than serving
it as an artifact.

## Defects by severity

| Severity | Findings |
| --- | --- |
| Critical | None |
| High | None |
| Medium | None |
| Low | None |

## Handoff

No product-code changes were made during this verification. The concise
release handoff is in `.factory/handoff.md`.
