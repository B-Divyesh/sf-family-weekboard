# Adversarial first-read review 4 — **PASS**

Reviewed 2026-08-28 UTC against
<https://family-weekboard.sociobot.in> and a clean clone of commit
`4d2d3314ab4906fd08062eb70b9d9c7823e087f7`.

## Verdict

**PASS.** There are zero findings, zero untested claims, and no reopened
historical findings. The cold landing page is clear at 390 px and desktop, the
one-click demo immediately shows realistic plans, demo changes remain isolated,
all 19 declared claim commands pass, and the live route/accessibility/link
checks pass.

## Cold first read before scrolling

### 390 × 844

- **What does this do?** It plans a family's week on one device.
- **For whom?** Families using phones, computers, and paper that want one view
  without a new shared account.
- **What should I click first?** **Add plan** is the filled action for real use.
  **Try it with sample data** is the explicit evaluation path, followed by
  **“Opens a separate sample board.”**

All answers are visible at `scrollY = 0`. The exact copy is **“Plan your family
week together”** and **“For families using phones, computers, and paper who need
one shared weekly view without a new account.”** The three short facts and all
three start actions are also visible. The h1 occupies `y=116–183`; the sample
action ends at `y=494` in the 844 px viewport.

### 1440 × 900

The same answers, actions, and facts are visible before scrolling. The complete
seven-day board is also visible. The h1 occupies `y=124–225`. The first-read
gate passes at both requested sizes.

## Copy audit

Counts use rendered words. Hyphenated terms, URLs, paths, and code tokens count
as one word. Dynamic dates, names, counts, and sample-event data are excluded.
The maximum product sentence is 17 words; the maximum README sentence is 18.
No sentence exceeds 22 words. No banned marketing word appears. Terms remain
consistent: **plan**, **person's colour**, **copy**, **calendar file**, **demo**,
and **supporter pack**. Protocol and build terms occur only where the README is
instructing developers; the product-facing copy introduces **calendar file**
before the `.ics` extension.

### Landing/app sentences and headings

This table includes the cold page, demo-specific masthead/banner, empty state,
sections, and dialogs reachable from the landing page.

| ID | Exact copy | Words | Flag |
| --- | --- | ---: | --- |
| L01 | Plan your family week together | 5 | — |
| L02 | For families using phones, computers, and paper who need one shared weekly view without a new account. | 17 | — |
| L03 | Works offline after the first visit. | 6 | — |
| L04 | Your schedule stays on this device. | 6 | — |
| L05 | Adding plans, printing, calendar export, and a password-protected copy are free. | 10 | — |
| L06 | Opens a separate sample board. | 5 | — |
| L07 | Demo — sample data, nothing is saved | 6 | — |
| L08 | Changes stay separate from your real board. | 7 | — |
| L09 | Sample family board | 3 | — |
| L10 | OFFLINE · changes still save on this device | 7 | — |
| L11 | No plans this week | 4 | — |
| L12 | Add the first plan, or import a standard calendar file (.ics). | 11 | — |
| L13 | Everything stays in this browser unless you explicitly export it. | 10 | — |
| L14 | Saved locally · [count] plans on board | 6 | — |
| L15 | How it works | 3 | — |
| L16 | Add plans. | 2 | — |
| L17 | Put each commitment on a person’s colour. | 7 | — |
| L18 | Check the week. | 3 | — |
| L19 | Use seven columns or one phone-friendly day. | 7 | — |
| L20 | Share a copy. | 3 | — |
| L21 | Print, export a calendar file, or share an encrypted copy. | 10 | — |
| L22 | What Weekboard does not do | 5 | — |
| L23 | It has no account and does not send your schedule. | 10 | — |
| L24 | File and QR copies do not sync. | 7 | — |
| L25 | Add room for a bigger household | 6 | — |
| L26 | ₹499 once. | 2 | — |
| L27 | Add more than four people, extra colours, and a custom board name. | 12 | — |
| L28 | Adding plans, printing, calendar export, and a password-protected copy are free. | 10 | — |
| L29 | Plan a family week without a shared cloud account. | 9 | — |
| L30 | A fresh Weekboard is ready. | 5 | — |
| L31 | Add a plan | 3 | — |
| L32 | People on this board | 4 | — |
| L33 | Colour helps you scan. | 4 | — |
| L34 | Every plan also carries the person’s name. | 7 | — |
| L35 | Share or export a copy | 5 | — |
| L36 | Copies do not sync. | 4 | — |
| L37 | Importing replaces the receiving board with the copy you send. | 10 | — |
| L38 | Weekboard never uploads it. | 4 | — |
| L39 | Standard calendar file (.ics) | 4 | — |
| L40 | Export a calendar file. | 4 | — |
| L41 | Person colours are included as notes. | 6 | — |
| L42 | Private Weekboard copy | 3 | — |
| L43 | Encrypts people, notes, and plans in this browser. | 8 | — |
| L44 | Share the passphrase separately. | 4 | — |
| L45 | Add options for a bigger household | 6 | — |
| L46 | ₹499 one time | 3 | — |
| L47 | The supporter pack adds a custom board name, extra colours, and more than four people. | 15 | — |
| L48 | No subscription | 2 | — |
| L49 | No account required | 3 | — |
| L50 | One license can be restored on your devices | 8 | — |
| L51 | How Weekboard stores your schedule | 5 | — |
| L52 | Weekboard is a deliberately small, installable weekly view. | 8 | — |
| L53 | It stores your board in this browser and sends nothing unless you export it. | 14 | — |
| L54 | The first-run pixel illustration was generated for Weekboard with the factory image model. | 13 | — |
| L55 | The interface marks are hand-authored. | 5 | — |

### Landing/app controls

Links name destinations. Buttons name an action or result. The required demo
phrases are retained exactly.

| Controls | Words | Result |
| --- | ---: | --- |
| Change colour theme · See supporter pack | 3 · 3 | Pass |
| Add plan · Add the first plan | 2 · 4 | Pass |
| Share or export board · Try it with sample data | 4 · 5 | Pass |
| Reset demo · Start for real | 2 · 3 | Pass |
| Show this week · Edit people · Print week | 3 · 2 · 2 | Pass |
| View supporter options · Read about Weekboard · Reload Weekboard | 3 · 3 · 2 | Pass |
| Delete plan · Discard changes · Save plan | 2 · 2 · 2 | Pass |
| Add person · Save name · Close people settings | 2 · 2 · 3 | Pass |
| Export calendar file · Import calendar file | 3 · 3 | Pass |
| Download encrypted copy · Make QR copy · Open encrypted copy | 3 · 3 · 3 | Pass |
| Open pasted copy · Buy supporter pack · Verify license | 3 · 3 · 2 | Pass |
| Close About and the named icon-button accessible labels | 2 / named | Pass |

### README sentences and headings

Shell commands and bare URLs are not sentences. Technical terms in the
developer/deployment sections identify actual APIs, formats, files, or browser
storage rather than substituting jargon for a user outcome.

| ID | Exact copy | Words | Flag |
| --- | --- | ---: | --- |
| R01 | Weekboard | 1 | — |
| R02 | Weekboard is a weekly planner for families using phones, computers, and paper. | 12 | — |
| R03 | It keeps their shared schedule out of cloud accounts. | 9 | — |
| R04 | After the first visit, it works offline and stores plans in this browser. | 13 | — |
| R05 | opens a seeded sample board in a separate browser database. | 10 | — |
| R06 | Use Reset demo to restore the sample or Start for real to leave without copying changes. | 16 | — |
| R07 | What Weekboard includes | 3 | — |
| R08 | A seven-day desktop board and focused one-day phone agenda | 9 | — |
| R09 | Person colours, all-day plans, and daily, weekly, or monthly repeats | 10 | — |
| R10 | Import and export standard calendar files (.ics). | 7 | — |
| R11 | Exported daily and weekly repeats use UTC calendar times. | 9 | — |
| R12 | Share a password-encrypted Weekboard file or QR code. | 8 | — |
| R13 | Each is a copy, not live sync. | 8 | — |
| R14 | Install Weekboard on your device and keep using it offline after the first visit. | 14 | — |
| R15 | Optional ₹499 one-time supporter license through the Sociobot billing API | 10 | — |
| R16 | Weekboard has no account and does not send your schedule. | 10 | — |
| R17 | Develop and verify | 3 | — |
| R18 | Requires Node 20 or newer. | 5 | — |
| R19 | npm test covers calendar recurrence and calendar-file import and export. | 10 | — |
| R20 | The Playwright suite covers creation/persistence, keyboard-accessible dialogs, mobile layout, accessibility, demo isolation, claims, and installed/offline reload. | 16 | — |
| R21 | Every user-facing product claim and its exact command is listed in `.factory/claims.json`. | 12 | — |
| R22 | The free planner makes no cross-origin request. | 7 | — |
| R23 | Buying or verifying a supporter license uses the Sociobot billing API. | 11 | — |
| R24 | Data ownership and deployment | 4 | — |
| R25 | IndexedDB holds the board. | 4 | Developer implementation note. |
| R26 | Standard calendar files are a UTC backup; `.weekboard` files are encrypted copies. | 10 | Developer format note. |
| R27 | Importing an encrypted copy replaces the receiving board after a named confirmation. | 12 | — |
| R28 | Deploy the contents of `dist/` as a static site with `index.html` at its root. | 14 | Developer instruction. |
| R29 | Keep the shipped 404 response override: unknown paths must serve `/404.html` with HTTP 404, not an SPA fallback. | 18 | Developer instruction. |
| R30 | `/privacy/` and `/terms/` are real static routes. | 7 | Developer instruction. |
| R31 | `staticwebapp.config.json` ships the 404 policy, CSP, frame/permission policy, no-cache worker rule, and immutable caching for Vite’s content-hashed assets. | 18 | Developer instruction. |
| R32 | Do not add runtime CDN assets. | 6 | Developer instruction. |
| R33 | The visual system and generated-art provenance are in `.factory/design.md`. | 9 | — |
| R34 | Build handoff and measured gates are in `.factory/handoff.md`. | 8 | — |
| R35 | Licensed under MIT. | 3 | — |

The catalog description is also valid: **“Plan a family week without a shared
cloud account.”** It is verb-first, nine words, and 50 characters.

## Demo and sandbox

- The landing page exposes **Try it with sample data** without scrolling. One
  click opens `/?demo=1`; `/demo/` also works directly.
- At 390 × 844, the first sample card, **School drop-off**, occupies
  `y=662–752`. **Football practice** begins at `y=761`. The product is visibly
  in use before scrolling.
- The persistent banner says **“Demo — sample data, nothing is saved”** and
  exposes **Reset demo** and **Start for real**.
- A fresh direct demo context created only `demo:weekboard-local-v1`; it made
  zero cross-origin requests. The application source passes the demo flag to
  `BoardStore.create`, which selects that database before any store is opened.
- A live isolated flow added real data, entered demo, added a demo-only plan,
  reset the sample, exited, and was also covered by the exact
  `@claim:demo-sandbox` test. Reset removed the demo mutation and restored all
  shipped sample plans; the real marker remained isolated.
- Live offline reload retained the sample board and displayed the offline
  status. The exact offline claim test also passed from the clean clone.

The sample is specific and plausible: Asha, Ravi, and Kids have school
drop-off, a dentist visit, football practice, and groceries/meal preparation.

## Claims

The repository declares 19 claims. Every declared ID occurs on exactly one test
tag. Each exact command from `.factory/claims.json` was run separately in
`/tmp/weekboard-review4-clean.D6ft5V`, a clean clone at the reviewed commit.

| Claim ID | Result | Observable coverage |
| --- | --- | --- |
| `demo-sandbox` | PASS | Demo mutation/reset and real-board isolation |
| `offline-reload` | PASS | Worker-controlled demo reload with network disabled |
| `local-privacy` | PASS | Local persistence, no account UI, zero cross-origin requests |
| `free-core` | PASS | Unlicensed add, print, calendar export, encrypted copy |
| `ics-export` | PASS | VCALENDAR, UTC times, daily/weekly repeats, four events |
| `ics-person-colour-notes` | PASS | All sample names and exact colour values in notes |
| `ics-import` | PASS | Standard calendar fixture imported into the board |
| `encrypted-handoff` | PASS | AES-GCM use, opaque content, QR, confirmed replacement |
| `calendar-options` | PASS | All-day, daily, weekly, and monthly occurrences |
| `copy-not-sync` | PASS | Receiver remains unchanged after a sender edit |
| `person-lanes` | PASS | Names and three distinct colours |
| `responsive-agenda` | PASS | Seven desktop days, one 390 px day, no overflow |
| `print-board` | PASS | Print invoked with seven-day print layout |
| `themes` | PASS | System/light/dark cycle and persisted choice |
| `installable-pwa` | PASS | Standalone manifest, icons, controlling worker |
| `paid-checkout` | PASS | ₹499 INR, non-recurring hosted checkout contract |
| `license-restore` | PASS | Valid verifier response restores supporter state |
| `supporter-entitlements` | PASS | Custom name, fifth colour, fifth person |
| `license-revocation` | PASS | Revocation relocks extras and leaves free board intact |

Result: **19/19 exact commands passed.** A second cross-check of the live copy,
dialogs, README, Privacy, and Terms found no claim-like product sentence outside
this inventory. Artwork provenance is separately documented in the source-of-
truth design file and represented by the shipped original/derived assets.

## Earlier-finding verification

Every earlier review, polish map, and the handoff was read. Each repair was
then checked independently in both the live deployment and current source/test
coverage.

| Earlier ID | Result | Independent confirmation |
| --- | --- | --- |
| F-1-1 | Fixed | Live hosted checkout resolved; the exact billing claim passed. |
| F-1-2 | Fixed | Mobile legal/dialog target regressions passed; live controls remain at least 44 px. |
| F-1-3 | Fixed | Live/README copy says offline use begins after the first visit. |
| F-1-4 | Fixed | `free-core` names and exercises every promised free operation. |
| F-1-5 | Fixed | Account/privacy wording is narrow; no-sync has its own passing claim. |
| F-1-6 | Fixed | Named third-party compatibility is absent; copy says standard calendar file. |
| F-1-7 | Fixed | Unsupported merchant/refund promises remain absent; hosted price/recurrence are tested. |
| F-1-8 | Fixed | Live Privacy navigation and browser Back focus and announce each h1. |
| F-1-9 | Fixed | `/demo/` appears in the live and source sitemap. |
| F-1-10 | Fixed | README opening is split; its longest sentence is 13 words. |
| F-1-11 | Fixed | Calendar file is explained before `.ics`; visitor copy omits RRULE jargon. |
| F-1-12 | Fixed | User copy says password-encrypted; implementation details stay technical. |
| F-1-13 | Fixed | Visitor copy says install/offline rather than unexplained PWA. |
| F-1-14 | Fixed | About says “this browser”; IndexedDB is confined to the developer section. |
| F-1-15 | Fixed | Person's colour and copy terminology remain consistent. |
| F-1-16 | Fixed | Generated-art and hand-authored-mark statements remain separate. |
| F-1-17 | Fixed | Empty heading is “No plans this week.” |
| F-1-18 | Fixed | Paid heading names the bigger-household result. |
| F-1-19 | Fixed | About heading names schedule storage. |
| F-1-20 | Fixed | Console labels are Empty board, Three steps, People, and Share a copy. |
| F-1-21 | Fixed | Action is “Share or export board.” |
| F-1-22 | Fixed | Week action is “Show this week.” |
| F-1-23 | Fixed | People action is “Edit people.” |
| F-1-24 | Fixed | Print action is “Print week.” |
| F-1-25 | Fixed | About action is “Read about Weekboard.” |
| F-1-26 | Fixed | Destructive action is “Delete plan.” |
| F-1-27 | Fixed | People closer is “Close people settings.” |
| F-1-28 | Fixed | Active supporter action is “Manage supporter pack.” |
| F-1-29 | Fixed | Brief/catalog summary is present, verb-first, and under 120 characters. |
| F-2-1 | Fixed | Live 390 px demo shows School drop-off above the fold. |
| F-2-2 | Fixed | `copy-not-sync` is declared and passes its two-context outcome test. |
| F-2-3 | Fixed | Checkout test inspects INR 499 and non-recurring hosted-session data. |
| F-2-4 | Fixed | README limits export wording to tested daily/weekly UTC behavior. |
| F-2-5 | Fixed | First use is “standard calendar file (.ics)”; actions use calendar file. |
| F-2-6 | Fixed | Visitor copy consistently uses “colour.” |
| F-2-7 | Fixed | See, Discard, Reload, and Close controls retain result-led labels. |
| F-2-8 | Fixed | Headings use Plan and What Weekboard includes. |
| F-2-9 | Fixed | Query demo has matching title, description, canonical, OG/Twitter data. |
| F-2-10 | Fixed | Live/source Apple touch icon is an original 180 × 180 asset. |
| F-2-11 | Fixed | First-screen free fact names both export results. |
| F-3-1 | Fixed | Live/source ICS export writes each person's name and hexadecimal colour; claim passes. |

No earlier finding is half-fixed, regressed, or reopened.

## Structure, routing, accessibility, links, and identity

| Route | HTTP | Title | h1 |
| --- | ---: | --- | --- |
| `/` | 200 | Weekboard — plan your family week | Plan your family week together |
| `/?demo=1` | 200 | Demo — Weekboard | Sample family board |
| `/demo/` | 200 | Demo — Weekboard | Sample family board |
| `/privacy/` | 200 | Privacy — Weekboard | Privacy |
| `/terms/` | 200 | Terms — Weekboard | Terms |
| unknown path | 404 | Page not found — Weekboard | This page is not on the board |

- Every route has `lang=en`, exactly one h1, one main landmark, a route-specific
  plain title and description, canonical/OG URL, social image, SVG favicon,
  180 px Apple icon, skip link, consistent header/footer, Privacy, Terms,
  factory credit, and build ID.
- The social image is 1200 × 630. The sitemap lists `/`, `/demo/`, `/privacy/`,
  and `/terms/`. The designed 404 returns HTTP 404 and provides a home action.
- Direct links, reload, Privacy navigation, and browser Back work. Live route
  focus moved to `H1:Privacy` and announced **“Privacy — Weekboard”**; Back
  moved to the home h1 and announced the home title.
- The crawl resolved every internal route/asset and the external factory link
  with HTTP 200. The supporter link reached the hosted checkout with HTTP 200
  after redirect. `mailto:` is the only non-HTTP link.
- The live URL verifier found one h1, `lang`, `main`, no missing alt text, no
  unlabeled button, and no console error. Live Axe found zero serious or
  critical violations on demo, Privacy, Terms, and the designed 404.
- The pixel-console layout, paper/navy palette, cyan/orange accents, hard
  shadows, mono labels, seven-column board, original planning-station art, and
  compact demo masthead match `.factory/design.md`. This is recognisably a
  household planning console, not a generic centred SaaS hero/card template.
- Focus styles, dark-theme contrast, reduced-motion rules, phone layout, dialog
  focus return, and 44 px targets have automated coverage and passed.

## Quality gates

From the same clean clone:

- `npm test`: 22/22 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed and emitted `dist/`.
- Main JS: 72.11 kB raw / 24.31 kB gzip; CSS: 17.64 kB raw / 4.61 kB gzip.
- `npm run test:e2e`: 77 passed, 5 expected project/viewport skips, 0 failed.
- `/opt/fleet/lib/verify-url.sh`: passed for the live query demo after creating
  its evidence directory.

## Missed leverage

No obvious feature implied by the brief is missing. The product already
provides standard calendar import/export, encrypted file and QR copies,
printing, recurring plans, and offline use. Real-time sync is an explicit
non-goal and the copy explains that boundary. An AI step would not remove a
clear household-planning task and would weaken the local/offline proposition;
no AI finding is warranted. No provider key, Azure endpoint, decorative AI
control, analytics script, third-party font, or CDN script is present.

## What would make this perfect

Nothing remains in the required review scope. Preserve the exact claim suite,
demo-isolation checks, copy audit, route metadata/focus tests, and mobile
above-the-fold regression on future changes.
