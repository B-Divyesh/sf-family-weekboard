# Adversarial first-read review 3 — **FAIL**

Reviewed 2026-08-28 UTC against the deployed site at
<https://family-weekboard.sociobot.in> and a fresh clone of repository commit
`b54c9aaf8604b700b675800510af8bfcb47958e2`.

## Verdict

**FAIL.** One finding remains. The calendar-export dialog promises that person
colours are written into the exported file. The implementation exports only a
person's name; it exports no colour value. This false promise is also absent
from `.factory/claims.json`. All 18 declared claim commands pass; none covers
this additional promise.

## Cold first read, before scrolling

### 390 × 844

- **What does this do?** It plans a family's week on the current device.
- **For whom?** Families using phones, computers, and paper that do not want
  a new account.
- **What should I click first?** **Try it with sample data** to inspect a
  separate sample board, or **Add plan** to begin a real board.

These answers are visible without scrolling in: **“Plan your family week
together”**; **“For families using phones, computers, and paper who need one
shared weekly view without a new account.”**; **“Try it with sample data”**;
and **“Opens a separate sample board.”** The first-read gate passes.

### 1440 × 900

The same wording and actions are visible, along with the seven-day empty
board. The first-read gate passes.

## Findings

### Major

#### F-3-1 — The calendar export falsely promises person-colour notes

- **Quote/location:** **“Person colours are included as notes.”** in the
  **Share or export a copy** dialog, under **Standard calendar file (.ics)**
  (`src/app.ts`, `transferDialog`).
- **Evidence:** `src/ics.ts:60-63` creates the ICS description from
  **`Weekboard lane: ${person}`** and event notes. It receives the `people`
  array but never reads `person.color`. A fresh live-demo download contained
  `DESCRIPTION:Weekboard lane: Asha`, `Kids`, and `Ravi`, with no hexadecimal
  colour value. `.factory/claims.json` has no claim for this result.
  `@claim:ics-export` checks VCALENDAR syntax, titles, UTC timed values, and
  recurrence output; it never checks a person-colour note. The
  `person-lanes` claim checks colours on the Weekboard board, not in an export.
- **Why this fails review:** a visitor can reasonably choose calendar export
  expecting a colour assignment to survive in the backup. It does not. The
  false promise also evades the required observable claim test.
- **Concrete fix:** either export a documented colour value and add an
  `ics-person-colour-notes` clean-demo download test that asserts each
  sampled name and colour, or rewrite the sentence to **“Person names are
  included as notes.”** and test that narrower claim.

## Copy audit

Counts treat a hyphenated term and `.ics` as one word. Dynamic dates, plan
names, counts, and form field values are excluded. Headings, captions, and
button labels are included where they need a first-read or result-name check.
No audited copy exceeds 22 words or uses a banned marketing adjective. The
only copy finding is F-3-1, because it makes an unlisted testable claim.

### Landing and app copy

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
| L09 | OFFLINE · changes still save on this device | 7 | — |
| L10 | No plans this week | 4 | — |
| L11 | Add the first plan, or import a standard calendar file (.ics). | 11 | — |
| L12 | Everything stays in this browser unless you explicitly export it. | 10 | — |
| L13 | Saved locally · 0 plans on board | 6 | — |
| L14 | How it works | 3 | — |
| L15 | Add plans. | 2 | — |
| L16 | Put each commitment on a person’s colour. | 7 | — |
| L17 | Check the week. | 3 | — |
| L18 | Use seven columns or one phone-friendly day. | 7 | — |
| L19 | Share a copy. | 3 | — |
| L20 | Print, export a calendar file, or share an encrypted copy. | 10 | — |
| L21 | What Weekboard does not do | 5 | — |
| L22 | It has no account and does not send your schedule. | 10 | — |
| L23 | File and QR copies do not sync. | 7 | — |
| L24 | Add room for a bigger household | 6 | — |
| L25 | ₹499 once. | 2 | — |
| L26 | Add more than four people, extra colours, and a custom board name. | 12 | — |
| L27 | A fresh Weekboard is ready. | 5 | — |
| L28 | Colour helps you scan. | 4 | — |
| L29 | Every plan also carries the person’s name. | 7 | — |
| L30 | Copies do not sync. | 4 | — |
| L31 | Importing replaces the receiving board with the copy you send. | 10 | — |
| L32 | Weekboard never uploads it. | 4 | — |
| L33 | Export a calendar file. | 5 | — |
| L34 | Person colours are included as notes. | 6 | F-3-1 |
| L35 | Encrypts people, notes, and plans in this browser. | 8 | — |
| L36 | Share the passphrase separately. | 4 | — |
| L37 | The supporter pack adds a custom board name, extra colours, and more than four people. | 15 | — |
| L38 | No subscription | 2 | — |
| L39 | No account required | 3 | — |
| L40 | One license can be restored on your devices | 8 | — |
| L41 | Weekboard is a deliberately small, installable weekly view. | 8 | — |
| L42 | It stores your board in this browser and sends nothing unless you export it. | 14 | — |
| L43 | The first-run pixel illustration was generated for Weekboard with the factory image model. | 13 | — |
| L44 | The interface marks are hand-authored. | 5 | — |
| L45 | Weekboard needs JavaScript to keep your board in this browser. | 10 | — |

Static labels and controls were also checked. **Try it with sample data**,
**Add plan**, **Share or export board**, **Reset demo**, **Start for real**,
**Edit people**, **Print week**, **Export calendar file**, **Import calendar
file**, **Download encrypted copy**, **Make QR copy**, **Open encrypted
copy**, **Buy supporter pack**, **Verify license**, **Discard changes**, and
**Close About** name a destination or result. **Plan**, **People**, **Share a
copy**, **Empty board**, and **Three steps** are understandable out of
context. Terminology is consistent: *plan*, *person’s colour*, *copy*,
*calendar file*, *demo*, and *supporter pack*.

### README copy

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
| R21 | Every user-facing product claim and its exact command is listed in `.factory/claims.json`. | 12 | F-3-1 until repaired |
| R22 | The free planner makes no cross-origin request. | 7 | — |
| R23 | Buying or verifying a supporter license uses the Sociobot billing API. | 11 | — |
| R24 | Data ownership and deployment | 4 | — |
| R25 | IndexedDB holds the board. | 4 | Technical implementation note. |
| R26 | Standard calendar files are a UTC backup; `.weekboard` files are encrypted copies. | 10 | Technical implementation note. |
| R27 | Importing an encrypted copy replaces the receiving board after a named confirmation. | 12 | — |
| R28 | Deploy the contents of `dist/` as a static site with `index.html` at its root. | 14 | Technical instruction. |
| R29 | Keep the shipped 404 response override: unknown paths must serve `/404.html` with HTTP 404, not an SPA fallback. | 18 | Technical instruction. |
| R30 | `/privacy/` and `/terms/` are real static routes. | 7 | Technical instruction. |
| R31 | `staticwebapp.config.json` ships the 404 policy, CSP, frame/permission policy, no-cache worker rule, and immutable caching for Vite’s content-hashed assets. | 18 | Technical instruction. |
| R32 | Do not add runtime CDN assets. | 6 | Technical instruction. |
| R33 | The visual system and generated-art provenance are in `.factory/design.md`. | 9 | — |
| R34 | Build handoff and measured gates are in `.factory/handoff.md`. | 8 | — |
| R35 | Licensed under MIT. | 3 | — |

The README's implementation and deployment section necessarily uses technical
terms for developers. It is separate from the visitor-facing opening and does
not introduce a user-facing promise beyond the declared claims.

## Demo and sandbox

- **One click:** the cold landing action opens `/?demo=1`; direct `/demo/` is
  also available.
- **Immediate realistic use:** at 390 × 844, **School drop-off** occupies
  `y=662–752` on initial load and **Football practice** starts at `y=761`.
  The initial screen therefore already shows a family board in use.
- **Isolation and controls:** the persistent banner reads **“Demo — sample
  data, nothing is saved”** and exposes **Reset demo** and **Start for real**.
  A fresh browser opened only `demo:weekboard-local-v1`; reset restored the
  two visible sample plans. The declared sandbox claim separately created real
  data, mutated/reset demo data, and confirmed the real record returned.
- **Offline/privacy:** `@claim:offline-reload` intercepts the network after
  service-worker control and reloads the sample board offline. `@claim:local-
  privacy` captures requests throughout its demo flow and reports no
  cross-origin request.

## Claims and quality gates

I cloned the repository into `/tmp/weekboard-review3.cYXVr5`, ran `npm ci`,
and then ran each exact command in `.factory/claims.json` separately. All 18
passed: `demo-sandbox`, `offline-reload`, `local-privacy`, `free-core`,
`ics-export`, `ics-import`, `encrypted-handoff`, `calendar-options`,
`copy-not-sync`, `person-lanes`, `responsive-agenda`, `print-board`, `themes`,
`installable-pwa`, `paid-checkout`, `license-restore`,
`supporter-entitlements`, and `license-revocation`.

Additional fresh-clone gates passed:

- `npm test` — 22 tests passed.
- `npm run build` — passed and emitted `dist/`.
- `npm run test:e2e` — 80 expected browser-test outcomes passed, with only
  the suite's intentional responsive skips.
- `/opt/fleet/lib/verify-url.sh 'https://family-weekboard.sociobot.in/?demo=1'
  /tmp/weekboard-review3-verify` — passed: title, `lang`, one h1, `main`, alt
  text, labeled controls, and no console errors.

## Structure, routing, and visual check

`/`, `/?demo=1`, `/demo/`, `/privacy/`, `/terms/`, and an unknown path were
checked live. Each real route has one h1, a description, canonical URL,
OpenGraph URL, SVG favicon, and 180px Apple icon. Titles are respectively
**Weekboard — plan your family week**, **Demo — Weekboard**, **Privacy —
Weekboard**, and **Terms — Weekboard**. The unknown route returns a designed
404 with HTTP 404 and a return action. `sitemap.xml` lists all four public
routes; internal links, `mailto:`, Sociobot, and the checkout redirect all
resolve as expected.

Header/footer, Privacy, and Terms are present on each route. A live keyboard
route check moved focus to `H1:Privacy` and announced **Privacy — Weekboard**;
Back returned focus to `H1:Plan your family week together`. The pixel-console
layout, hard shadows, paper/navy palette, and original planning-station art
match the recorded family-console thesis rather than a generic SaaS template.
The live response has CSP, no-sniff, frame, permissions, and referrer-policy
headers.

## History and missed leverage

All prior findings F-1-1 through F-1-29 and F-2-1 through F-2-11 were checked
against the live deployment and current code. Their repairs remain present:
the sample card is above the phone fold, copy-not-sync is declared and
two-context tested, checkout verifies INR 499 one-time billing, the Apple icon
is 180px, result-led controls remain, and route focus/announcement works. No
earlier finding is reopened.

The brief calls for a local weekly board, standard calendar-file exchange,
print, and explicit encrypted copies. All are supplied. AI assistance would
not remove an obvious planning step here and would weaken the offline,
local-first job, so no missing-AI finding is made. No runtime provider key or
decorative AI feature was found.

## What would make this perfect

Export and test colour values in the ICS notes, or change the copy to the
actually exported person name and test that claim. Then re-run the 18 claim
commands and copy audit. With that one defect closed, this review has no
remaining finding.
