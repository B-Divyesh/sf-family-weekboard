# Adversarial first-read review 2 — **FAIL**

Reviewed **2026-08-28 UTC** at
<https://family-weekboard.sociobot.in> from repository commit
`bbb3d67b74093251420dbfde619c835e49a66c4b`.

## Verdict

**FAIL.** There are 11 findings: 3 blocking, 1 major, and 7 minor. The cold
landing screen is clear at both requested widths, all 17 declared claim
commands pass from a clean clone, and the isolated demo resets correctly.
However, the 390 × 844 demo viewport does not show any sample plan without a
scroll. Two earlier claim-inventory defects also remain incomplete: the
no-sync promise is not listed or tested, and the hosted checkout test does not
verify the price, billing recurrence, or refund information that the visitor is told
to rely on.

## Cold first read before scrolling

### 390 × 844

- **What does it do?** It is a weekly family planner that stores the schedule
  on this device.
- **For whom?** Families using a mix of phones, computers, and paper who do not
  want a shared cloud account.
- **What should I click first?** Select **Add plan** to start a real board, or
  **Try it with sample data** to evaluate a separate sample board.

The exact first-screen text that supplies those answers is **“Plan your family
week together”**, **“For families using phones, computers, and paper who need
one shared weekly view without a new account”**, **“Add plan”**, and **“Try it
with sample data”** with **“Opens a separate sample board.”** All are visible
without scrolling. Evidence: `.factory/evidence/review-2/cold-mobile.png`.

### 1440 × 900

The same answers are visible. The seven-column empty board is also visible
without scrolling. Evidence:
`.factory/evidence/review-2/cold-desktop.png`.

The first-read gate passes at both widths.

## Findings, ordered by severity

### Blocking

#### F-2-1 — The phone demo opens before any sample plan is visible

- **Quote/location:** after selecting **“Try it with sample data”** at 390 ×
  844, the viewport shows **“Demo — sample data, nothing is saved”**, the full
  marketing masthead, actions, and week controls, but no sample event.
- **Evidence:** on a cold direct demo load, the selected Friday column begins
  at `y=896.5`; **“School drop-off”** begins at `y=962.5` and **“Football
  practice”** at `y=1061.7`, below the 844 px viewport. See
  `.factory/evidence/review-2/demo-mobile.png`.
- **Why this matters:** the required first screen after the one-click demo does
  not yet look like the product being used on the reviewer's phone. A visitor
  must infer that sample data exists and scroll to discover it. The demo skill
  defines a weak or missing immediate sample as blocking.
- **Concrete fix:** on demo routes, compress or remove the repeated marketing
  masthead and put the selected day's first sample plan directly under the
  banner. Add a 390 × 844 assertion that at least one realistic `.event-card`
  intersects the initial viewport after the demo action.

#### F-2-2 — The no-sync promise is still absent from the claim inventory

- **History:** reopens **F-1-5**; the earlier unlisted live-sync promise was not
  fully removed or given a test.
- **Quote/location:** **“File and QR copies do not sync.”** on the landing
  limits section; **“Each is a copy, not live sync.”** in `README.md`.
- **Evidence:** `.factory/claims.json` has no no-sync claim. The
  `encrypted-handoff` scenario proves encryption and one confirmed snapshot
  replacement, but it does not mutate a sender after import and confirm that a
  receiver remains unchanged.
- **Why this matters:** no live sync is a core product boundary in the brief.
  A family may otherwise expect later edits to reach another device.
- **Concrete fix:** add a `copy-not-sync` claim and test with two fresh browser
  contexts: transfer a copy, change the sender, wait/reload the receiver, and
  confirm the receiver does not change. Map both quoted sentences to it.

#### F-2-3 — Checkout facts still stop at an unverified redirect

- **History:** reopens **F-1-7**; the specific merchant/refund causal wording
  was removed, but the replacement refund promise is still unproved.
- **Quote/location:** **“₹499 once.”**, **“No subscription”**, and **“Checkout
  and refund details appear in the hosted checkout.”** in the supporter
  section/dialog; Terms says **“Checkout shows the applicable payment and
  refund details.”**
- **Evidence:** `@claim:paid-checkout` passed, including three cold 303
  responses. Its assertions only read Weekboard's own ₹499/no-subscription
  text and check that the redirect host is `checkout.dodopayments.com`. It does
  not inspect the hosted amount, currency, recurring status, or refund text.
- **Why this matters:** these are purchase terms, not decorative copy. A
  visitor cannot use a successful redirect as proof that the destination shows
  or charges the promised terms.
- **Concrete fix:** extend the billing contract test to verify the hosted
  product is ₹499 INR, non-recurring, and exposes the stated refund details.
  If the hosted page cannot be tested, remove the refund sentence and avoid
  presenting the amount/recurrence as verified until an authoritative product
  response can be asserted.

### Major

#### F-2-4 — README calendar-file claims are broader than their tests

- **Quote/location:** **“Weekboard keeps repeat rules and time zones in the
  file.”**, **“npm test covers calendar recurrence and ICS interoperability”**,
  and **“ICS is the interoperable backup”** in `README.md`.
- **Evidence:** `@claim:ics-export` asserts UTC output plus daily and weekly
  rules. It does not export/round-trip a monthly rule, move the file between
  different browser time zones, or validate it with an independent calendar
  implementation. The separate `calendar-options` test checks monthly display,
  not monthly file interoperability.
- **Why this matters:** a household may depend on exported recurring plans as
  its backup. The current evidence does not prove the full README wording.
- **Concrete fix:** add monthly export/import and cross-time-zone round trips,
  plus an independent ICS validator or fixture consumer. Otherwise rewrite to
  **“Weekboard exports tested daily and weekly repeats as UTC calendar
  times.”** and replace **“interoperability”** with **“import and export.”**

### Minor

#### F-2-5 — ICS appears before it is explained on the landing page

- **Quote/location:** **“Add the first plan, or import an existing ICS
  calendar.”**, **“Print, export ICS, or share an encrypted copy.”**, and
  **“Export a standard ICS calendar file.”**
- **Why this matters:** a first-time household user must decode a protocol
  acronym before understanding the action.
- **Concrete fix:** introduce **“standard calendar file (.ics)”** once, then
  label the actions **“Import calendar file”** and **“Export calendar file.”**

#### F-2-6 — The same colour concept switches spelling

- **Quote/location:** landing/dialog/README use **“person's color”**, **“Person
  colors”**, and **“extra colors”**; controls use **“Colour”**, **“Colour 1”**,
  and **“Change colour theme.”**
- **Why this matters:** the copy contract requires one term for one concept.
- **Concrete fix:** choose either **colour** or **color** and use it in every
  visitor-facing sentence, form label, option, README bullet, and claim.

#### F-2-7 — Four controls do not name their result

- **Quote/location:** **“Support Weekboard”** in the header opens information;
  **“Cancel”** discards the plan form; **“Reload”** updates the app; **“Close”**
  closes the About dialog.
- **Why this matters:** the labels name an intention or generic operation, not
  the result required by the plain-words button rule.
- **Concrete fix:** use **“See supporter pack”**, **“Discard changes”**,
  **“Reload Weekboard”**, and **“Close About.”**

#### F-2-8 — Two headings depend on internal shorthand

- **Quote/location:** **“PLAN SLOT”** above the plan editor and **“What v1
  includes”** in `README.md`.
- **Why this matters:** neither phrase is self-explanatory in a heading list
  for a non-technical first-time reader.
- **Concrete fix:** use **“PLAN”** and **“What Weekboard includes.”**

#### F-2-9 — The query-string demo has mixed social metadata

- **Quote/location:** `https://family-weekboard.sociobot.in/?demo=1` sets the
  page description and title to demo values, but `og:description` and
  `twitter:description` remain **“A local weekly board for families using
  phones, computers, and paper.”** Its `og:url` remains the home URL.
- **Why this matters:** the catalog's documented demo URL produces a social
  preview that does not identify itself as the sample sandbox.
- **Concrete fix:** when `demo=1`, also set `og:description`,
  `twitter:description`, and `og:url` to the same demo description and
  canonical URL. Add the query route to the metadata test.

#### F-2-10 — The Apple touch icon is not the required size

- **Quote/location:** every route uses
  `<link rel="apple-touch-icon" href="/icon-192.png">`; ImageMagick confirms
  that file is 192 × 192.
- **Why this matters:** the supplied site-structure contract requires a 180 px
  Apple touch asset.
- **Concrete fix:** generate an original 180 × 180 icon, link it as the Apple
  touch icon on every route, and assert its decoded dimensions.

#### F-2-11 — “Both exports” has no referent on the first screen

- **Quote/location:** **“Adding plans, printing, and both exports are free.”**
  appears before either export type is named.
- **Why this matters:** the price fact requires the visitor to search below the
  fold or open a dialog to learn what “both” means.
- **Concrete fix:** use **“Adding plans, printing, calendar export, and a
  password-protected copy are free.”**

## Copy audit

Counts treat a hyphenated term as one word and do not count standalone `—` or
`·` separators. Dynamic dates and repeated sample occurrences are data, not
authored sentences. No sentence exceeds 22 words and no banned marketing word
appears. The landing average is under 7 words; the README average is about 9.

### Landing page sentences, headings, and static prose

| ID | Exact rendered copy | Words | Flag |
| --- | --- | ---: | --- |
| L01 | Plan your family week together | 5 | — |
| L02 | For families using phones, computers, and paper who need one shared weekly view without a new account. | 17 | — |
| L03 | Works offline after the first visit. | 6 | — |
| L04 | Your schedule stays on this device. | 6 | — |
| L05 | Adding plans, printing, and both exports are free. | 8 | F-2-11; shown in three places |
| L06 | Opens a separate sample board. | 5 | — |
| L07 | Demo — sample data, nothing is saved | 6 | — |
| L08 | Changes stay separate from your real board. | 7 | — |
| L09 | OFFLINE · changes still save on this device | 7 | — |
| L10 | No plans this week | 4 | — |
| L11 | Add the first plan, or import an existing ICS calendar. | 10 | F-2-5 |
| L12 | Everything stays in this browser unless you explicitly export it. | 10 | — |
| L13 | Saved locally · 0 plans on board | 6 | — |
| L14 | How it works | 3 | — |
| L15 | Add plans. | 2 | — |
| L16 | Put each commitment on a person's color. | 7 | F-2-6 |
| L17 | Check the week. | 3 | — |
| L18 | Use seven columns or one phone-friendly day. | 7 | — |
| L19 | Share a copy. | 3 | — |
| L20 | Print, export ICS, or share an encrypted copy. | 8 | F-2-5 |
| L21 | What Weekboard does not do | 5 | — |
| L22 | It has no account and does not send your schedule. | 10 | — |
| L23 | File and QR copies do not sync. | 7 | F-2-2 |
| L24 | Add room for a bigger household | 6 | — |
| L25 | ₹499 once. / ₹499 one time | 2 / 3 | F-2-3 |
| L26 | Add more than four people, extra colors, and a custom board name. | 12 | F-2-6 |
| L27 | Plan a family week without a shared cloud account. | 9 | — |
| L28 | A fresh Weekboard is ready. | 5 | — |
| L29 | Color helps you scan. | 4 | F-2-6 |
| L30 | Every plan also carries the person's name. | 7 | — |
| L31 | Copies do not sync. | 4 | F-2-2 |
| L32 | Importing replaces the receiving board with the copy you send. | 10 | — |
| L33 | Weekboard never uploads it. | 4 | — |
| L34 | Export a standard ICS calendar file. | 6 | F-2-5 |
| L35 | Person colors are included as notes. | 6 | F-2-6 |
| L36 | Encrypts people, notes, and plans in this browser. | 8 | — |
| L37 | Share the passphrase separately. | 4 | — |
| L38 | Add options for a bigger household | 6 | — |
| L39 | The supporter pack adds a custom board name, extra colors, and more than four people. | 15 | F-2-6 |
| L40 | No subscription | 2 | F-2-3 |
| L41 | No account required | 3 | — |
| L42 | One license can be restored on your devices | 8 | — |
| L43 | Checkout and refund details appear in the hosted checkout. | 9 | F-2-3 |
| L44 | How Weekboard stores your schedule | 5 | — |
| L45 | Weekboard is a deliberately small, installable weekly view. | 8 | — |
| L46 | It stores your board in this browser and sends nothing unless you export it. | 14 | — |
| L47 | The first-run pixel illustration was generated for Weekboard with the factory image model. | 13 | — |
| L48 | The interface marks are hand-authored. | 5 | — |
| L49 | Supporter pack active | 3 | — |
| L50 | Thanks for backing private household software. | 6 | — |
| L51 | Weekboard needs JavaScript to keep your board in this browser. | 10 | — |

### Landing labels and controls

| Exact copy | Words | Flag |
| --- | ---: | --- |
| WEEKBOARD | 1 | — |
| Demo | 1 | link destination; acceptable |
| How it works | 3 | link destination; acceptable |
| Privacy / Terms | 1 / 1 | link destinations; acceptable |
| Change colour theme | 3 | F-2-6 |
| Support Weekboard | 2 | F-2-7 |
| Manage supporter pack | 3 | — |
| Add plan / Add a plan / Add the first plan | 2 / 3 / 4 | — |
| Share or export board | 4 | — |
| Try it with sample data | 5 | — |
| Reset demo / Start for real | 2 / 3 | — |
| Previous week / Show this week / Next week | 2 / 3 / 2 | — |
| Edit people / Print week | 2 / 2 | — |
| See supporter pack / Buy supporter pack / Verify license | 3 / 3 / 2 | — |
| Read about Weekboard | 3 | — |
| Reload | 1 | F-2-7 |
| PLAN SLOT | 2 | F-2-8 |
| Close plan editor / Close people settings / Close sharing and export / Close supporter information / Close about Weekboard | 3 / 3 / 4 / 3 / 3 | accessible icon names; acceptable |
| Cancel | 1 | F-2-7 |
| Save plan / Delete plan | 2 / 2 | — |
| Add person / Save name / Close people settings | 2 / 2 / 3 | — |
| Export ICS / Import ICS | 2 / 2 | F-2-5 |
| Download encrypted copy / Make QR copy / Open encrypted copy | 3 / 3 / 3 | — |
| Copy code instead / Open pasted copy | 3 / 3 | — |
| Close | 1 | F-2-7 |

### README sentences, headings, and list items

| ID | Exact rendered copy | Words | Flag |
| --- | --- | ---: | --- |
| R01 | Weekboard | 1 | — |
| R02 | Weekboard is a weekly planner for families using phones, computers, and paper. | 12 | — |
| R03 | It keeps their shared schedule out of cloud accounts. | 9 | — |
| R04 | After the first visit, it works offline and stores plans in this browser. | 13 | — |
| R05 | Live: https://family-weekboard.sociobot.in | 2 | — |
| R06 | Demo: https://family-weekboard.sociobot.in/?demo=1 — opens a seeded sample board in a separate browser database. | 12 | — |
| R07 | Use Reset demo to restore the sample or Start for real to leave without copying changes. | 16 | — |
| R08 | What v1 includes | 3 | F-2-8 |
| R09 | A seven-day desktop board and focused one-day phone agenda | 9 | — |
| R10 | Person colors, all-day plans, and daily, weekly, or monthly repeats | 10 | F-2-6 |
| R11 | Import and export standard calendar files. | 6 | — |
| R12 | Weekboard keeps repeat rules and time zones in the file. | 10 | F-2-4 |
| R13 | Share a password-encrypted Weekboard file or QR code. | 8 | — |
| R14 | Each is a copy, not live sync. | 7 | F-2-2 |
| R15 | Install Weekboard on your device and keep using it offline after the first visit. | 14 | — |
| R16 | Optional ₹499 one-time supporter license through the Sociobot billing API | 10 | F-2-3 |
| R17 | Weekboard has no account and does not send your schedule. | 10 | — |
| R18 | Develop and verify | 3 | — |
| R19 | Requires Node 20 or newer. | 5 | — |
| R20 | npm test covers calendar recurrence and ICS interoperability. | 8 | F-2-4 |
| R21 | The Playwright suite covers creation/persistence, keyboard-accessible dialogs, mobile layout, accessibility, demo isolation, claims, and installed/offline reload. | 16 | — |
| R22 | Every user-facing product claim and its exact command is listed in .factory/claims.json. | 12 | contradicted by F-2-2/F-2-3 |
| R23 | The free planner makes no cross-origin request. | 7 | — |
| R24 | Buying or verifying a supporter license uses the Sociobot billing API. | 11 | — |
| R25 | Data ownership and deployment | 4 | — |
| R26 | IndexedDB holds the board. | 4 | technical section; acceptable |
| R27 | ICS is the interoperable backup; .weekboard files are encrypted snapshots. | 10 | F-2-4 |
| R28 | Importing an encrypted snapshot replaces the receiving board after a named confirmation. | 12 | — |
| R29 | Deploy the contents of dist/ as a static site with index.html at its root. | 14 | — |
| R30 | Keep the shipped 404 response override: unknown paths must serve /404.html with HTTP 404, not an SPA fallback. | 18 | technical section; acceptable |
| R31 | /privacy/ and /terms/ are real static routes. | 7 | — |
| R32 | staticwebapp.config.json ships the 404 policy, CSP, frame/permission policy, no-cache worker rule, and immutable caching for Vite's content-hashed assets. | 18 | technical section; acceptable |
| R33 | Do not add runtime CDN assets. | 6 | technical section; acceptable |
| R34 | The visual system and generated-art provenance are in .factory/design.md. | 9 | — |
| R35 | Build handoff and measured gates are in .factory/handoff.md. | 8 | — |
| R36 | Licensed under MIT. | 3 | — |

## Demo and sandbox checks

- One-click entry: **pass** from the first screen to `/?demo=1`.
- Realistic sample: **pass after scrolling**; Asha, Ravi, and Kids have school
  drop-off, dentist, football practice, and groceries. **Initial phone
  visibility fails** as F-2-1.
- Persistent banner: **pass** with Reset demo and Start for real.
- Reset: **pass**; a `DEMO MUTATION` plan disappeared and the four original
  records returned.
- Isolation: **pass**; a real-only plan was absent in demo and returned after
  Start for real. The browser exposed separate
  `weekboard-local-v1` and `demo:weekboard-local-v1` databases.
- Network/privacy: **pass**; the exercised demo flow made only same-origin
  requests.
- Offline: **pass**; after service-worker control, a network-intercepted reload
  returned the demo, banner, offline strip, and eight rendered occurrences.

## Declared claim test results

The repository was cloned to a fresh temporary directory and `npm ci` was run
there. Every exact `test` string in `.factory/claims.json` was then executed
separately. These are command passes; findings F-2-2 through F-2-4 concern
missing or insufficient assertions beyond those passing commands.

| Claim | Exact-command result | Observed evidence |
| --- | --- | --- |
| `demo-sandbox` | PASS | real/demo separation, mutation reset, return to real record |
| `offline-reload` | PASS | controlled worker; sample survives offline reload |
| `local-privacy` | PASS | saved demo change; zero cross-origin requests |
| `free-core` | PASS | unlicensed add, print, ICS, encrypted download |
| `ics-export` | PASS | VCALENDAR, UTC, tested RRULEs, six records, own-parser round trip |
| `ics-import` | PASS | fixture plan imported and reported |
| `encrypted-handoff` | PASS | AES-GCM, opaque text, QR, confirmed replacement |
| `calendar-options` | PASS | all-day plus daily, weekly, monthly display |
| `person-lanes` | PASS | names and three distinct colours |
| `responsive-agenda` | PASS | seven desktop days, one phone day, no overflow |
| `print-board` | PASS | print invoked; seven print columns |
| `themes` | PASS | system/light/dark cycle and persistence |
| `installable-pwa` | PASS | standalone manifest and controlling worker |
| `paid-checkout` | PASS | three cold 303 redirects to Dodo; limitation in F-2-3 |
| `license-restore` | PASS | fixture-valid returned license unlocked support |
| `supporter-entitlements` | PASS | custom name, fifth colour, fifth person |
| `license-revocation` | PASS | revoked verdict relocked extras; free board remained |

Result: **17/17 command passes, 0 command failures.**

## Earlier-finding verification

Every item from `.factory/review-1.md` was checked against the live page and
current code. `.factory/polish-1.md` and `.factory/handoff.md` were read as
repair claims, not accepted as evidence by themselves.

| Earlier ID | Result in review 2 | Independent confirmation |
| --- | --- | --- |
| F-1-1 | Fixed | exact checkout claim passed three cold 303 redirects |
| F-1-2 | Fixed | live 390 px dialogs/legal pages: minimum measured target 44 × 44; dialog minima 45 × 45 |
| F-1-3 | Fixed | README now says offline works after the first visit |
| F-1-4 | Fixed | `free-core` exists and its exact command passes |
| F-1-5 | **Reopened by F-2-2** | no-sync sentence remains without a matching claim/test |
| F-1-6 | Fixed as originally stated | named Apple/Google/Outlook promise removed; new README scope issue is F-2-4 |
| F-1-7 | **Reopened by F-2-3** | replacement refund-detail sentence remains unverified |
| F-1-8 | Fixed | Privacy navigation focuses/announces its h1; Back focuses/announces the home h1 |
| F-1-9 | Fixed | `/demo/` is in `sitemap.xml` |
| F-1-10 | Fixed | README opening is three sentences, maximum 13 words |
| F-1-11 | Fixed in README feature list | plain calendar-file wording precedes technical section; landing issue is F-2-5 |
| F-1-12 | Fixed | user feature text says password-encrypted; AES-GCM stays in privacy/technical evidence |
| F-1-13 | Fixed | visitor copy says install/offline rather than PWA |
| F-1-14 | Fixed | About says “this browser”; IndexedDB remains in developer documentation |
| F-1-15 | Fixed for person-vs-lane and copy-vs-handoff | semantic terms are consistent; spelling-only issue is F-2-6 |
| F-1-16 | Fixed | generated-art and interface-mark provenance are separate sentences |
| F-1-17 | Fixed | heading is “No plans this week” |
| F-1-18 | Fixed | supporter heading names bigger-household options |
| F-1-19 | Fixed | About heading names storage behavior |
| F-1-20 | Fixed | EMPTY BOARD, THREE STEPS, PEOPLE, SHARE A COPY are present |
| F-1-21 | Fixed | “Share or export board” |
| F-1-22 | Fixed | “Show this week” |
| F-1-23 | Fixed | “Edit people” |
| F-1-24 | Fixed | “Print week” |
| F-1-25 | Fixed | “Read about Weekboard” |
| F-1-26 | Fixed | “Delete plan” |
| F-1-27 | Fixed | “Close people settings” |
| F-1-28 | Fixed | “Manage supporter pack” when active |
| F-1-29 | Fixed | brief summary and catalog description both read “Plan a family week without a shared cloud account.” |

## Structure, accessibility, links, and identity

- `/`, `/?demo=1`, `/demo/`, `/privacy/`, and `/terms/` return 200. An unknown
  deep link returns the designed Weekboard 404 with HTTP 404 and a home action.
- Every inspected route has `lang=en`, one `<main>`, one `<h1>`, a route title,
  description, canonical, Open Graph/Twitter image metadata, favicon, header,
  footer, skip link, Privacy, Terms, factory credit, and build id. F-2-9 and
  F-2-10 record the remaining metadata defects.
- The social card is exactly 1200 × 630. Internal pages/assets and the external
  factory link returned 200; the checkout link completed at a hosted 200 after
  redirect. No dead link was found; `mailto:` was treated as an allowed scheme.
- Desktop Privacy navigation focused `h1` and announced **“Privacy —
  Weekboard.”** Browser Back focused the home `h1` and announced **“Weekboard —
  plan your family week.”**
- Live Axe scans at 390 and 1440 found zero violations on demo, Privacy, Terms,
  and 404. The supplied URL verifier recorded no console error, one h1/main,
  no missing alt, and no unlabeled button in
  `.factory/evidence/review-2/verify-url/verify.json`.
- The pixel-console palette, hard shadows, monospaced labels, paper texture,
  seven-column board, and orange/cyan accents are distinct from a generic SaaS
  hero/card template and match `.factory/design.md`. Reduced-motion and visible
  focus rules are present.
- `npm test` passes 22/22. `npm run build` produces `dist/`; main JS is 71,459
  bytes raw and 24.24 kB gzip.

## Missed leverage

No additional AI feature is justified. Planning, repeat handling, print,
standard calendar import/export, and explicit encrypted file/QR transfer cover
the brief's useful handoff. Automatic sync is explicitly outside scope and is
safe to omit once its no-sync behavior is tested. No runtime AI endpoint,
provider key, Azure endpoint, analytics script, or third-party font was found.

## What would make this perfect

Put a real sample event above the fold in the phone demo, close the no-sync and
billing claim gaps with outcome-level tests, narrow or prove the calendar-file
claims, then remove the remaining copy and metadata inconsistencies listed in
F-2-5 through F-2-11. Re-run this entire review from a fresh mobile context;
PASS requires zero remaining findings and no untested sentence.
