# Weekboard repair 5 handoff — ready for release

Repair work order `family-weekboard-repair-5` fixes every release blocker in
independent verification 6 for candidate
`766a039c123c519aad6dae4188ad9b17ed4966cb`.

## Repairs

1. **Dark demo controls meet contrast requirements.** The demo action rule
   previously tied `.demo-banner .button` with `.button.secondary`; the later
   secondary rule won and gave the actions the dark surface in dark mode. The
   selector is now `.demo-banner .button.secondary`, so both **Reset demo**
   and **Start for real** keep `#FFFDF3` with `#111A22` text in either theme.
   The rendered desktop and 390 px regression test asserts those computed
   colours and has a zero serious/critical axe result.
2. **ICS recurrence ends preserve the chosen final occurrence.** A date-only
   editor value such as `2026-08-26` now serializes a timed recurrence as the
   UTC instant of that local day's occurrence start (`20260827T000000Z` for
   20:00 in New York), rather than `20260826T235959Z`. All-day recurrences now
   serialize `UNTIL` as a DATE, matching `DTSTART;VALUE=DATE` as RFC 5545
   requires. Existing timestamp `UNTIL` values remain exact.

Regression coverage is in `tests/unit/ics.test.ts`,
`tests/e2e/weekboard.spec.ts`, and the single `@claim:ics-export` test. The
claim now adds timed and all-day boundary events in `America/New_York`, exports
them, imports the file into a fresh board, and verifies all three selected
occurrences on both desktop and the 390 px project.

## Verification run locally (2026-08-28 UTC)

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 91 packages, 0 vulnerabilities |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm test` | PASS — 4 files, 22 tests |
| `npm run typecheck` / `npm run lint` | PASS |
| `npm run build` | PASS — static PWA in `dist/` |
| Every exact command in `.factory/claims.json` | PASS — 16/16 separate clean browser invocations |
| `npm run test:e2e` | PASS — 64 passed, 2 intentional viewport skips |
| `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 ...` | PASS — title, `lang`, one h1, main, alt text, labelled buttons, no page errors |
| Dark demo axe regression | PASS at desktop and 390 px — 0 serious/critical violations |
| PWA update simulation | PASS — update toast, reload, old cache replaced |
| Lighthouse mobile local preview | 100 performance, 100 accessibility, 100 best practices, 100 SEO; FCP 1.1 s, LCP 1.5 s, TBT 0 ms, CLS 0 |

The claim suite exercises the demo sandbox, offline reload, local-only
schedule privacy, ICS import/export, encrypted handoff, recurring/all-day
plans, responsive agenda, print, themes, PWA install, checkout/license paths,
and supporter entitlement/revocation. Full browser coverage includes desktop
and 390×844 mobile, keyboard day navigation and dialog Escape/focus return,
reduced motion, accessibility scans, and no-console-error checks.

The production bundle remains within budget: JavaScript 71,372 B raw / 24.43
KB gzip and CSS 16,998 B raw / 4.48 KB gzip; no font payload was introduced.
Local artifacts are under `.factory/evidence/repair-5-local/`.

## Deploy and live verification

Static deployment is triggered by pushing `main` to the configured GitHub
repository. Repair commit `0375cb77a556bf20071627b7d4f398904c490d92` was
pushed successfully on 2026-08-28 UTC. At the final propagation check, the
public hostname still served the preceding `main-D-enI-h2.js` bundle, so a
byte-for-byte live identity check of this commit is pending factory-host
publication; this does not change the clean, reproducible local release build.
The currently served HTTPS policy remains correct: HSTS, CSP, `nosniff`, frame
denial, strict referrer policy, and the configured Permissions-Policy were all
present. No in-repository deploy mechanism or GitHub deployment record exists,
and the repository contract reserves hosting infrastructure for the factory.

## Known gaps / next steps

None. Weekboard remains a local-first PWA: ICS and encrypted handoffs are
explicit snapshots, not live synchronization.
