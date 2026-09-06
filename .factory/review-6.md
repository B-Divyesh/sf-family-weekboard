# Plan a family week together — review 6 — **PASS**

Reviewed on **2026-09-06 UTC** against
<https://family-weekboard.sociobot.in>.

- Work order: `family-weekboard-review-6`
- Implementation candidate: `85f06c751fcda20dbe4a43a22097b1dad0f59509`
- Last product-code commit: `e33dfe06b7e5940494ace3343a53f9c93fc641ac`
- Documentation baseline: `7059566f92b16b6ff29961af38096a6133d1965b`
- Environment: Node 22.23.2, npm 10.9.8, Playwright 1.58.2,
  Chromium 145.0.7632.6, Lighthouse 13.4.1
- Findings: **0**
- Untested public claims: **0**

**Final verdict: PASS — zero findings and zero untested public claims.**

No product code changed during this review.

## Job, audience, and first action before scrolling

Fresh 390×844 phone and 1440×900 desktop browser profiles showed this before
scrolling:

- **Job:** “Plan your family week together.”
- **Audience:** families using phones, computers, and paper who need one shared
  weekly view without a new account.
- **First action:** **Add plan** for real use. **Try it with sample data** is
  beside it and says “Opens a separate sample board.”

The same screen states the offline boundary, on-device storage, and free core
features. The wording is plain, specific, and free of metaphor. The phone
shows one selected day; desktop shows the seven-day board.

## One-click sample and data isolation

The sample action opened the demo in one click. It showed Asha, Ravi, and Kids
with School drop-off, Dentist, Football practice, and Groceries and meal prep.
On the phone, Groceries and meal prep was visible at 662–752 CSS px inside the
844 px first viewport.

The label **Demo — sample data, nothing is saved** remained visible after a
demo-only plan was added and after reset. **Reset demo** removed that plan and
restored all sample plans. **Start for real** returned to a real-only marker;
neither marker crossed into the other board. The browser contained separate
`demo:weekboard-local-v1` and `weekboard-local-v1` IndexedDB databases.

Fresh phone and desktop flows made zero off-origin requests and produced no
console or page errors. Screenshots are
`/work/.evidence/review6-phone-demo.png` and
`/work/.evidence/review6-desktop-demo.png`.

## Declared claims

`.factory/claims.json` contains 19 entries. Every `@claim:<id>` tag occurs
exactly once. After `npm ci --include=dev` in a detached clean checkout of the
implementation candidate, every declared command was run separately.

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS — 1 test |
| `offline-reload` | PASS — 1 test |
| `local-privacy` | PASS — 1 test |
| `free-core` | PASS — 1 test |
| `ics-export` | PASS — 1 test |
| `ics-person-colour-notes` | PASS — 1 test |
| `ics-import` | PASS — 1 test |
| `encrypted-handoff` | PASS — 1 test |
| `calendar-options` | PASS — 1 test |
| `copy-not-sync` | PASS — 1 test |
| `person-lanes` | PASS — 1 test |
| `responsive-agenda` | PASS — 1 test |
| `print-board` | PASS — 1 test |
| `themes` | PASS — 1 test |
| `installable-pwa` | PASS — 1 test |
| `paid-checkout` | PASS — 1 test |
| `license-restore` | PASS — 1 test |
| `supporter-entitlements` | PASS — 1 test |
| `license-revocation` | PASS — 1 test |

Each exact command was
`npx playwright test --project=chromium --grep '@claim:<id>'`, as declared in
the manifest. Landing, app, dialog, legal, manifest, and README copy was
cross-checked against the inventory. No claim was missing, broader than its
test, false, incomplete, or left untested. A banned-word scan was also empty.

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
| `/opt/fleet/lib/verify-url.sh` | PASS — title, language, h1, main, alt text, controls, and browser errors |

The build emits 24.31 KB gzip JavaScript and 4.61 KB gzip CSS, with no font
payload. Its responsive images are 67.41 KB and 116.42 KB. These remain within
the static PWA budgets.

## Normal, invalid, boundary, and recovery paths

- Normal use passed for adding, editing, refresh persistence, printing,
  people, themes, calendar import/export, encrypted files and QR copies,
  license restore, and license revocation.
- Fresh live checks rejected an end before its start, malformed calendar data,
  a wrong encrypted-copy passphrase, and an empty license with useful next
  steps. Whitespace-only plan and person names and inverted recurrence ranges
  also passed their regression tests.
- Boundaries passed for the free four-person limit, all-day and
  daily/weekly/monthly repeats, spring and autumn DST dates, UTC recurrence
  limits, final recurring occurrences, phone layout, and supporter extras.
- Recovery passed for cancelled and confirmed deletion, blocked IndexedDB with
  **Try again**, offline checkout, offline reload, demo reset, revoked or
  unverifiable licenses, and the update-ready notice.

## Accessibility, keyboard, motion, routes, and links

- Live Axe scans found zero serious or critical issues on `/`, `/demo/`,
  `/privacy/`, `/terms/`, and a deliberate unknown route at both desktop and
  phone sizes. A dark demo scan also found zero.
- Every checked route has `lang=en`, one h1, one main, header, footer, its own
  title, description, canonical URL, sharing metadata, and a named way home.
- Home, demo, Privacy, and Terms return 200. The deliberate unknown URL
  correctly returns HTTP 404 and the designed title
  `Page not found — Weekboard`; this expected 404 is not a defect.
- Dialog Escape returns focus. Desktop route navigation focuses and announces
  the destination h1. Phone day tabs respond to arrow keys.
- All visible phone controls measured at least 44×44 CSS px. At 200% text size,
  phone and desktop had no horizontal overflow. Reduced motion shortened the
  dialog animation to 0.01 ms.
- Robots, sitemap, manifest, icons, social image, internal navigation, the
  external Param Factory link, and the hosted checkout destination resolved.
  The privacy contact is an intentional `mailto:` link.

## Offline, update, privacy, and response policy

A fresh live demo received a controlling service worker, reloaded with the
network disabled, retained the demo label and sample schedule, and showed the
offline state. An update-ready event displayed **A fresh Weekboard is ready**
with its reload action. The production-build regression also proves that an
application change revises the worker cache and hashed app asset.

The free and demo flows use local IndexedDB and made no analytics, tracking,
remote-font, account, or schedule request. Privacy explains local storage,
export, erasure, optional license verification, and a contact address. Terms
states the copy-not-sync boundary and paid terms.

Live responses send HSTS, CSP with frame denial, `nosniff`, strict referrer
policy, restrictive Permissions Policy, immutable caching for hashed assets,
and no-store caching for the worker. The manifest is served as JSON.

Weekboard is a static local-first PWA, not a backend product. Tenant isolation,
server restart persistence, server health, and product SQLite are therefore
not applicable. Browser persistence and isolation are covered above.

## Checkout and request allowance

The ₹499 one-time checkout returned HTTP 303 to the hosted Dodo checkout, and
the claim test verified INR 499 and non-recurring session data three times. A
fresh invalid-license burst returned the first 429 at request 31 with
`Retry-After`. A second controlled check returned 429 with `Retry-After: 3`
and recovered with HTTP 200 after waiting 4.5 seconds. No credential was used
or recorded.

## Performance

Fresh live mobile Lighthouse results:

| Category or metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| First contentful paint | 0.8 s |
| Largest contentful paint | 1.4 s |
| Total blocking time | 50 ms |
| Cumulative layout shift | 0 |

Lighthouse does not provide a field INP value in this lab run, and the product
makes no INP claim.

## Live deployment identity

All 20 public files in a fresh candidate build matched the HTTPS deployment
byte-for-byte. This includes every HTML route, hashed JavaScript and CSS,
responsive images, worker, manifest, icons, social card, robots, sitemap, and
offline page. Host-only `staticwebapp.config.json` and Vite's internal manifest
were correctly excluded.

Commits after `85f06c7` changed only reports and handoff documentation. The
live product therefore matches the reviewed implementation; later report-only
commits do not require another product image.

## Earlier findings and current disposition

Every earlier review and verification report was inspected, including minor
findings.

| Earlier finding | Fresh disposition |
| --- | --- |
| Review 1 `F-1-1` | Closed — hosted checkout and its exact price/recurrence claim pass. |
| Review 1 `F-1-2` | Closed — live phone, legal, and dialog controls are at least 44 px; Axe is clean. |
| Review 1 `F-1-3`–`F-1-7` | Closed — offline, free-core, no-sync, standard calendar, privacy, and bounded billing wording map to passing claims. |
| Review 1 `F-1-8`–`F-1-9` | Closed — route focus/announcement passes and `/demo/` is in the live sitemap. |
| Review 1 `F-1-10`–`F-1-16` | Closed — README sentences, jargon, encryption/install terms, storage language, terminology, and artwork statements remain repaired. |
| Review 1 `F-1-17`–`F-1-28` | Closed — empty, supporter, About, section, share, week, people, print, delete, close, and supporter labels remain specific. |
| Review 1 `F-1-29` | Closed — the verb-first catalog summary is present and under 120 characters. |
| Review 2 `F-2-1` | Closed — a sample plan is visible before scrolling at 390×844. |
| Review 2 `F-2-2`–`F-2-4` | Closed — no-sync, hosted price/recurrence, and bounded calendar-file outcomes have exact passing claims. |
| Review 2 `F-2-5`–`F-2-11` | Closed — calendar wording, colour spelling, action labels, headings, demo metadata, 180 px icon, and free-export wording remain repaired. |
| Review 3 `F-3-1` | Closed — exported notes contain every sample person's name and hexadecimal colour; its exact claim passes. |
| Review 4 and Verification 7–8 | Their PASS findings remain at zero under this fresh review. |
| Review 5 high finding | Closed — the full browser command passes 77 tests with five intentional skips, including the mobile sample test. |
| Verification 1 high findings | Closed — both DST/all-day and inverted recurrence checks pass; checkout returns 303. |
| Verification 1 medium/low findings | Closed — legal accessibility, target size, worker revision, headers/cache/MIME, and whitespace-title regressions pass. |
| Verification 2 findings | Closed — checkout works and the verifier returns 429 with `Retry-After`. |
| Verification 3 findings | Closed — checkout works and the manifest is JSON. |
| Verification 4 critical/high findings | Closed — the complete claims manifest, isolated one-click demo, plain first screen, checkout, and fail-closed license path pass. |
| Verification 4 medium/low findings | Closed — metadata, discovery, designed 404, arrow-key tabs, and copy audit pass. |
| Verification 5 findings | Closed — claims, autumn DST, omitted all-day end, timed `UNTIL`, CSP recovery, secondary metadata, whitespace person, and README 404 policy pass. |
| Verification 6 findings | Closed — dark demo contrast and the exact recurring ICS final occurrence pass. |

The brief does not benefit from an AI step. Schedule entry, recurrence, and
private file exchange are deterministic and privacy-sensitive. Standard
calendar import/export and explicit copy exchange already supply the expected
leverage; no missing feature finding is warranted.

## Findings by severity

| Severity | Findings |
| --- | --- |
| Critical | None |
| High | None |
| Medium | None |
| Low | None |

**Final verdict: PASS — zero findings and zero untested public claims.**
