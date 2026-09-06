# Family weekly planning review 5 — **FAIL**

Reviewed on **2026-09-06 UTC** against the live product at
<https://family-weekboard.sociobot.in>.

- Product implementation reviewed: `e33dfe06b7e5940494ace3343a53f9c93fc641ac`
  (`fix: preserve person colours in calendar exports`).
- Implementation evidence/documentation commit: `4d2d3314ab4906fd08062eb70b9d9c7823e087f7`
  (`docs: record polish round three evidence`). Its changes after the product
  implementation are factory reports, copy audit, and evidence only.
- Documentation/report head: `d8fbb486056c5e0cb99bd6ae1719e9c3e6ec01c4`
  (`qa: add adversarial first-read review 4`). The difference contains only
  `.factory/handoff.md` and `.factory/review-4.md`; it does not change the
  product image.
- Clean checkout: `/tmp/family-weekboard-review5.ywDtQ4`, cloned from the
  requested repository before dependencies were installed.

## Verdict

**FAIL.** There is **1 high finding**, **0 untested public claims**, and no
live product-path regression found. The documented `npm run test:e2e` quality
gate fails from a clean checkout, so this review cannot declare PASS.

## Job, audience, and first action before scrolling

### Phone, 390 × 844

- **Job:** Plan a family week together.
- **Audience:** Families using phones, computers, and paper who need a shared
  weekly view without a new account.
- **First action:** **Add plan** is the filled primary action. **Try it with
  sample data** is visible beside it and says that it opens a separate sample
  board.

### Desktop, 1440 × 900

The same job, audience, and actions are visible without scrolling. The empty
seven-day board is also visible. The first screen uses plain words and states
the offline, on-device, and free-core facts.

Evidence screenshots: `/work/.evidence/review5-live-phone.png` and
`/work/.evidence/review5-live-desktop.png`.

## Finding

### High — the documented full end-to-end quality gate fails on mobile

`npm run test:e2e` from the clean checkout ran 82 tests: **77 passed, 2 were
intentional skips, and 3 failed**. The failures are the mobile runs of
`@claim:demo-sandbox`, `@claim:offline-reload`, and `@claim:copy-not-sync`.
Each waits for an accessible name matching `Edit School drop-off`.

On the review date the mobile agenda correctly selects Sunday, September 6.
The seeded plan visible in that agenda is **Groceries and meal prep**. School
drop-off is on Monday and is not rendered in the one-day phone agenda until
the user selects Monday. The tests therefore time out after five seconds even
though the demo banner, sample plan, offline state, and copy flow are present.
The failed snapshots are in the clean checkout under `test-results/`.

This is a test expectation defect, not evidence that the live user path is
broken: the fresh live phone demo visibly shows the persistent demo label and
Groceries and meal prep above the fold. However, `README.md` documents
`npm run test:e2e` as a verification command and the product contract requires
quality gates to pass. The failing command is a release acceptance failure.

**Repair:** Change the mobile assertions to select Monday before asserting
School drop-off, or assert the visible seeded plan for the selected day. Then
run the full command, not only the individual Chromium claim commands.

## Demo, normal, invalid, boundary, and recovery checks

- One click and direct `/demo/` opened an already-populated board with Asha,
  Ravi, Kids, school drop-off, dentist, football, and groceries. The phone
  screenshot shows a realistic sample plan before scrolling.
- The persistent banner reads **“Demo — sample data, nothing is saved”** and
  has **Reset demo** and **Start for real**. In a fresh live context, adding a
  review-only demo plan changed visible occurrences from 8 to 9; Reset demo
  restored 8 and removed it; Start for real opened an empty real board with
  zero events. IndexedDB used `demo:weekboard-local-v1` and
  `weekboard-local-v1` separately.
- The direct demo request log contained only same-origin requests. The demo
  database was the only database opened before leaving demo.
- A fresh worker-controlled `/demo/` session reloaded offline with the
  OFFLINE status and School drop-off still present. It produced no console or
  page errors.
- The full suite did run normal create/edit/delete/persistence, invalid
  whitespace and inverted-date recovery, all-day/DST and recurrence boundaries,
  malformed-then-valid calendar-file import, encrypted-copy recovery,
  keyboard/dialog behavior, printing, theme, license, and update checks. Its
  only failures are the three mobile selector failures described above.

## Claims and clean-checkout commands

After `npm ci` (91 packages; audit clean), every exact command declared in
`.factory/claims.json` was run separately. **All 19 passed.** Each ID appears
once as an `@claim:` test tag.

| Claim IDs | Result |
| --- | --- |
| `demo-sandbox`, `offline-reload`, `local-privacy`, `free-core` | PASS |
| `ics-export`, `ics-person-colour-notes`, `ics-import`, `encrypted-handoff` | PASS |
| `calendar-options`, `copy-not-sync`, `person-lanes`, `responsive-agenda` | PASS |
| `print-board`, `themes`, `installable-pwa`, `paid-checkout` | PASS |
| `license-restore`, `supporter-entitlements`, `license-revocation` | PASS |

Other clean-checkout results:

| Command | Result |
| --- | --- |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm test` | PASS — 22 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — `dist/` produced |
| `npm run test:e2e` | **FAIL — 77 passed, 2 skipped, 3 failed** |

The production build contains 72.11 kB raw / 24.31 kB gzip JavaScript,
17.64 kB raw / 4.61 kB gzip CSS, no font payload, and 67.41 kB / 116.42 kB
responsive images. These remain within the static-PWA budgets.

No unlisted material public claim was found in the landing page, dialogs,
README, Privacy, or Terms. Thus the untested-claim count is **0**.

## Live structure, accessibility, privacy, PWA, and links

- Fresh desktop, phone, and dark-phone Chromium contexts found route-specific
  titles and one h1 on `/`, `/demo/`, `/privacy/`, `/terms/`, and the unknown
  route. The unknown route deliberately returned HTTP 404 with the designed
  “This page is not on the board” screen. Its expected failed-resource console
  message is not a defect.
- Playwright Axe scans at those routes and sizes found zero serious or critical
  violations, including dark-phone demo. The standalone `npx @axe-core/cli`
  attempt could not start because its Selenium wrapper has no Chrome binary in
  this worker; the required equivalent Playwright Axe integration completed.
- `/opt/fleet/lib/verify-url.sh` passed: title, `lang=en`, one h1, `main`,
  image alt text, named buttons, and no normal-load console errors.
- Keyboard smoke checks in the full suite cover the skip link, visible focus,
  Escape/focus return, and mobile arrow-day behavior. Reduced-motion and
  200%-text checks are also covered there.
- All discovered HTTP links resolved: first-party pages and `sociobot.in`
  returned 200; the hosted checkout entry returned 303. `mailto:` and
  in-page anchors were not treated as HTTP links.
- Live headers show HTTPS/HSTS, CSP with response-header `frame-ancestors`,
  frame denial, `nosniff`, strict referrer policy, Permissions-Policy, JSON
  manifest MIME, immutable hashed assets, and a no-store worker.
- A fresh 40-request invalid-license burst returned 200 for requests 1–30 and
  429 with `Retry-After: 4` for requests 31–40.
- The product has no application backend, account, or tenant. The only
  product API is the hosted licensing path; tenant isolation and restart
  persistence checks do not apply.

## Candidate and deployment comparison

The locally built implementation candidate was compared byte-for-byte with
the live origin. All **20 deployable files** other than Azure's host-only
`staticwebapp.config.json` matched. This confirms the live runtime is the
reviewed implementation image; the newer head is report-only.

## Earlier finding disposition

All prior review and verification reports were read. The following records
were rechecked against current source, claim coverage, and the live runtime.
They remain closed; none is reopened by the new test failure.

| Earlier records | Current disposition and proof |
| --- | --- |
| Review 1 `F-1-1` | Closed: hosted checkout returns 303 and `paid-checkout` passes. |
| Review 1 `F-1-2` | Closed: live phone/legal/dialog controls and Axe scans pass. |
| Review 1 `F-1-3`–`F-1-7` | Closed: offline-after-first-visit, free-core, privacy/no-sync, standard calendar-file, and limited billing copy all map to passing claims. |
| Review 1 `F-1-8`–`F-1-9` | Closed: routed focus/announcement is covered and `/demo/` is in the sitemap. |
| Review 1 `F-1-10`–`F-1-16` | Closed: README and visitor copy retain the reviewed plain sentence lengths, explained calendar/encryption/install terms, consistent “colour,” and separate artwork statements. |
| Review 1 `F-1-17`–`F-1-28` | Closed: empty, supporter, about, section, sharing, week, people, print, delete, close, and supporter action labels remain result-led and specific. |
| Review 1 `F-1-29` | Closed: the brief/catalog description is present and concise. |
| Review 2 `F-2-1` | Closed: current phone demo has a sample plan above the fold. |
| Review 2 `F-2-2`–`F-2-4` | Closed: no-sync, checkout session facts, and bounded calendar-file wording have passing claims. |
| Review 2 `F-2-5`–`F-2-11` | Closed: terminology, action labels, demo metadata, 180px Apple icon, and named exports remain correct. |
| Review 3 `F-3-1` | Closed: person name and hexadecimal colour are in exported notes; the dedicated claim passes. |
| Verification 1 high findings | Closed: DST/all-day and inverted-recurrence regressions are covered; checkout now returns 303. |
| Verification 1 medium/low findings | Closed: legal-page Axe/targets, worker revisioning, headers/cache/MIME, and whitespace validation are covered by current runtime/tests. |
| Verification 2–3 findings | Closed: checkout works, rate limiting now starts at request 31 with Retry-After, and manifest is JSON. |
| Verification 4 findings | Closed: claim inventory/demo, hosted checkout, safe license verification, metadata/404, mobile arrows, and copy audit are all present and covered. |
| Verification 5 findings | Closed: all claims are inventoried; DST civil-day and timed UNTIL handling, storage recovery, secondary-route metadata, person-name recovery, and 404 docs were repaired and tested. |
| Verification 6 findings | Closed: dark demo actions have no serious Axe contrast issue; calendar recurrence end round-trip is in `ics-export`. |
| Verification 7 | Its PASS evidence was reproduced except for the newly observed full-suite mobile selector failure. |

## What is required for PASS

Repair the three date-dependent mobile test expectations and rerun `npm run
test:e2e` from a fresh clean checkout. With that command passing, no current
product, claims, accessibility, privacy, PWA, links, or deployment finding
remains from this review.
