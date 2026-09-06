# Family weekly planning verification 8 — **PASS**

Verified on **2026-09-06 UTC** against
<https://family-weekboard.sociobot.in>.

- Work order: `family-weekboard-verify-8`
- Implementation candidate reviewed: `85f06c751fcda20dbe4a43a22097b1dad0f59509`
- Last product-code commit: `e33dfe06b7e5940494ace3343a53f9c93fc641ac`
- Documentation baseline reviewed: `e0d64275cff81e7c02d1cbf959b71bdb457e7f76`
- Environment: Node 22.23.2, npm 10.9.8, Playwright 1.58.2,
  Chrome for Testing 145.0.7632.6, Lighthouse 13.4.1
- Verdict: **PASS — ready to release**
- Findings: **0**
- Untested public claims: **0**

No product code was changed during verification.

## Job, audience, and first action before scrolling

Fresh 390×844 phone and 1440×900 desktop profiles showed the following before
scrolling:

- **Job:** “Plan your family week together.”
- **Audience:** families using phones, computers, and paper who need one shared
  weekly view without a new account.
- **First action:** **Add plan**. The adjacent no-setup action is **Try it with
  sample data**, followed by “Opens a separate sample board.”

The same screen states the offline boundary, on-device storage, and free core
features. The phone intentionally shows one day. Desktop shows all seven days.

## One-click sample and data isolation

The sample action opened the demo in one click. It contained Asha, Ravi, and
Kids, with School drop-off, Dentist, Football practice, and Groceries and meal
prep. The phone showed Groceries and meal prep for the selected Sunday before
scrolling; selecting Monday showed School drop-off.

The label **Demo — sample data, nothing is saved** remained visible after an
edit and after reset. **Reset demo** removed a demo-only marker and restored the
sample. **Start for real** returned to a real-only marker. The demo marker did
not appear in real data. The browser showed both separate databases:
`demo:weekboard-local-v1` and `weekboard-local-v1`.

The exercised landing and demo flow made 13 same-origin requests in each fresh
desktop and phone profile and zero off-origin requests. It produced no console
or page errors.

## Declared claims

`.factory/claims.json` contains 19 entries. Each `@claim:<id>` tag occurs exactly
once. After `npm ci --include=dev` in a detached fresh checkout of the candidate,
every declared command was run separately and passed with one test.

| Claim | Exact command | Result |
| --- | --- | --- |
| `demo-sandbox` | `npx playwright test --project=chromium --grep '@claim:demo-sandbox'` | PASS |
| `offline-reload` | `npx playwright test --project=chromium --grep '@claim:offline-reload'` | PASS |
| `local-privacy` | `npx playwright test --project=chromium --grep '@claim:local-privacy'` | PASS |
| `free-core` | `npx playwright test --project=chromium --grep '@claim:free-core'` | PASS |
| `ics-export` | `npx playwright test --project=chromium --grep '@claim:ics-export'` | PASS |
| `ics-person-colour-notes` | `npx playwright test --project=chromium --grep '@claim:ics-person-colour-notes'` | PASS |
| `ics-import` | `npx playwright test --project=chromium --grep '@claim:ics-import'` | PASS |
| `encrypted-handoff` | `npx playwright test --project=chromium --grep '@claim:encrypted-handoff'` | PASS |
| `calendar-options` | `npx playwright test --project=chromium --grep '@claim:calendar-options'` | PASS |
| `copy-not-sync` | `npx playwright test --project=chromium --grep '@claim:copy-not-sync'` | PASS |
| `person-lanes` | `npx playwright test --project=chromium --grep '@claim:person-lanes'` | PASS |
| `responsive-agenda` | `npx playwright test --project=chromium --grep '@claim:responsive-agenda'` | PASS |
| `print-board` | `npx playwright test --project=chromium --grep '@claim:print-board'` | PASS |
| `themes` | `npx playwright test --project=chromium --grep '@claim:themes'` | PASS |
| `installable-pwa` | `npx playwright test --project=chromium --grep '@claim:installable-pwa'` | PASS |
| `paid-checkout` | `npx playwright test --project=chromium --grep '@claim:paid-checkout'` | PASS |
| `license-restore` | `npx playwright test --project=chromium --grep '@claim:license-restore'` | PASS |
| `supporter-entitlements` | `npx playwright test --project=chromium --grep '@claim:supporter-entitlements'` | PASS |
| `license-revocation` | `npx playwright test --project=chromium --grep '@claim:license-revocation'` | PASS |

Landing, dialog, legal, and README copy was compared with the inventory. No
missing, broader, false, or untested public claim was found.

## Clean-checkout gates

| Command | Result |
| --- | --- |
| `npm ci --include=dev` | PASS — 91 packages |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm test` | PASS — 4 files, 22 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — `dist/` produced |
| `npm run test:e2e` | PASS — 77 passed, 5 intentional viewport skips |
| `/opt/fleet/lib/verify-url.sh` | PASS — title, lang, h1, main, alt, controls, console |

The build emitted 24.31 KB gzip JavaScript, 4.61 KB gzip CSS, no font payload,
and 67.41 KB and 116.42 KB responsive images. These are within the product
budgets.

An exploratory full-suite run with `PLAYWRIGHT_BASE_URL` set to the live origin
reported 73 passes, five expected skips, and four harness-only failures. Both
affected tests define every URL different from hard-coded
`http://127.0.0.1:4173` as cross-origin. Their failure lists contained only the
live Weekboard origin and its own assets. The required exact claim commands
passed on the documented clean preview, and the origin-aware live request
capture above independently confirmed zero off-origin requests. This is a test
harness scope mismatch, not a product failure.

## Normal, invalid, boundary, and recovery paths

- Normal use passed for adding, editing, refresh persistence, confirmed
  deletion, people, print, themes, calendar import/export, encrypted file and
  QR copies, and license restore/revocation.
- Invalid input gave clear feedback for a whitespace plan, whitespace person,
  end before start, inverted recurrence, malformed calendar file, wrong
  encrypted-copy passphrase, empty license, and unverified license.
- Boundaries passed for the free four-person limit, daily/weekly/monthly and
  all-day repeats, spring and autumn DST dates, timed UTC `UNTIL`, exact final
  recurring occurrences, phone single-day layout, QR size handling, and paid
  extras.
- Recovery passed for blocked IndexedDB with **Try again**, offline checkout
  feedback, offline app reload, demo reset, revoked licenses, and service-worker
  update notification and reload.

## Accessibility, keyboard, motion, and routes

- Axe found zero serious or critical issues on `/`, `/demo/`, `/privacy/`,
  `/terms/`, and the designed unknown route at desktop and phone sizes.
- Dark demo scans also found zero issues. Both demo actions computed to dark
  `rgb(17, 26, 34)` text on light `rgb(255, 253, 243)` backgrounds.
- Phone controls measured at least 44 CSS px. At 200% root text size, document
  width remained 390/390 with no horizontal overflow.
- Dialog Escape returned focus. Phone day tabs responded to arrow keys. Route
  navigation focused and announced the new h1. Focus rings remained visible.
- Reduced motion changed dialog animation to 0.01 ms and scrolling to `auto`.
- Each checked page had `lang=en`, one h1, one main, a header, a footer, and its
  own title. Home, demo, Privacy, and Terms returned 200. The designed unknown
  route returned the expected HTTP 404 with title `Page not found — Weekboard`.
- All internal navigation, icons, manifest, the Param Factory link, and hosted
  checkout destination resolved. `mailto:` was treated as an allowed scheme.

## Offline, update, privacy, and response policy

A fresh live demo received a controlling service worker, reloaded with the
network disabled, retained the sample label and School drop-off, and showed the
offline status. The controlled update simulation requested a changed worker,
showed **A fresh Weekboard is ready**, reloaded, and activated the revised
cache. The production-build test also proved that application changes revise
both the worker cache and hashed app asset.

The free and demo flows use local IndexedDB and made no analytics, tracking,
remote-font, account, or schedule request. Privacy and Terms are real routes.
The site sends HSTS, CSP, frame denial, nosniff, strict referrer policy, and a
restrictive Permissions Policy. Hashed assets are immutable; `sw.js` is
`no-cache, no-store`; the manifest is JSON; and the 404 policy is real.

This is a static local-first PWA, not a product backend. Backend tenant,
restart-persistence, health, and SQLite checks are therefore not applicable.
Browser refresh and restart-style persistence are covered by IndexedDB and PWA
tests. No shared database or unrelated service was accessed.

## Checkout and rate limit

The ₹499 one-time checkout returned HTTP 303 to the hosted Dodo checkout. A
sequential 40-request invalid-license burst returned 200 for requests 1–30 and
429 for requests 31–40. The first 429 included `Retry-After: 3`. A request after
that window returned 200. No credential was used or recorded.

## Performance

Fresh live mobile Lighthouse results:

| Category or metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| First contentful paint | 1.1 s |
| Largest contentful paint | 1.1 s |
| Total blocking time | 0 ms |
| Cumulative layout shift | 0 |

## Live deployment identity

All 20 public files from the candidate's fresh `dist/` matched the HTTPS origin
byte-for-byte. This includes HTML routes, `main-D6Zy94Yg.js`, CSS, route helper,
both images, worker, manifest, icons, social card, robots, sitemap, offline
page, legal pages, and 404. Deployment-only configuration and Vite's internal
manifest were correctly excluded from public-file comparison.

The candidate differs from the last product-code commit only through review,
evidence, copy/catalog documentation, and test changes. The documentation
baseline is later than the implementation candidate and changes only the
handoff. The live product therefore matches the reviewed implementation; no
new image was required for later report-only work.

## Earlier findings

Every earlier review and verification report was read. Current disposition is
proved below.

| Earlier source | Current disposition and fresh evidence |
| --- | --- |
| Review 1 `F-1-1` | Closed — live hosted checkout and exact paid claim pass. |
| Review 1 `F-1-2` | Closed — phone and dialog targets are at least 44 px. |
| Review 1 `F-1-3`–`F-1-7` | Closed — offline, free-core, no-sync, standard calendar, and checkout wording now have passing exact claims. |
| Review 1 `F-1-8` | Closed — route focus and live-region announcements pass. |
| Review 1 `F-1-9` | Closed — demo is in the live sitemap. |
| Review 1 `F-1-10`–`F-1-16` | Closed — README length, jargon, acronym, storage, terminology, and artwork-copy repairs remain in the current copy audit. |
| Review 1 `F-1-17`–`F-1-20` | Closed — empty, supporter, storage, and section headings are plain and specific. |
| Review 1 `F-1-21`–`F-1-28` | Closed — share, week, people, print, about, delete, close, and supporter controls name their result. |
| Review 1 `F-1-29` | Closed — the verb-first catalog summary is present and under 120 characters. |
| Review 2 `F-2-1` | Closed — fresh phone demo shows a real sample plan before scrolling. |
| Review 2 `F-2-2`–`F-2-4` | Closed — no-sync, hosted price/recurrence, and calendar-file scope have passing outcome tests. |
| Review 2 `F-2-5`–`F-2-11` | Closed — calendar wording, spelling, control labels, headings, demo metadata, 180 px icon, and free-export wording remain repaired. |
| Review 3 `F-3-1` | Closed — calendar exports include every sample person's name and colour; exact claim passes. |
| Review 4 | Remains PASS; none of its closed findings reopened. |
| Review 5 high finding | Closed — the full clean browser command now passes 77 tests with five intentional skips; phone claims select Monday before School drop-off. |
| Verification 1 | Closed — spring DST end date, inverted repeat, checkout, legal-page names, target sizes, worker revision, security/cache/MIME, and whitespace-title regressions all pass. |
| Verification 2 | Closed — checkout works; request 31 now returns 429 with `Retry-After`. |
| Verification 3 | Closed — checkout works and manifest MIME is `application/json`. |
| Verification 4 | Closed — complete claim inventory, one-click isolated demo, plain first screen, fail-closed license checks, discovery/404 structure, arrow tabs, and copy audit all pass. |
| Verification 5 | Closed — complete claims, autumn DST, omitted all-day end, timed `UNTIL`, CSP recovery, secondary metadata, whitespace person, and README 404 policy all pass. |
| Verification 6 | Closed — dark demo contrast passes and ICS round trips preserve the selected final timed and all-day occurrence. |
| Verification 7 | Remains PASS; its gates were repeated against the newer 19-claim candidate and live deployment. |

The brief does not benefit from an AI step: family schedule entry, recurrence,
and file exchange are deterministic and privacy-sensitive. No missed AI
feature finding is warranted. Standard calendar import/export and explicit
copy exchange already address the brief's expected leverage.

## Findings by severity

| Severity | Findings |
| --- | --- |
| Critical | None |
| High | None |
| Medium | None |
| Low | None |

**Final verdict: PASS — zero findings and zero untested public claims.**

Evidence is in `/work/.evidence/family-weekboard-verify8/` and the required
copies are `/work/.evidence/qa-report.md` and `/work/.evidence/qa-result.json`.
