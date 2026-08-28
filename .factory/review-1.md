# Adversarial first-read review 1 — **FAIL**

Reviewed **2026-08-28 UTC** at
<https://family-weekboard.sociobot.in> from a clean worktree at
`9bee4f5a8a0631fe6d450bed0d5eb7ea971f08eb`.

## Verdict

**FAIL.** There are 29 findings: 2 blocking, 6 major, and 21 minor. The local
planner and isolated demo work, but the advertised checkout returned HTTP 500
during its required claim test. The earlier mobile touch-target defect also
remains only partly fixed. Several live/README claims are absent from the claim
inventory or stronger than their tests, so the product also has untested
claims.

## Cold first read, before scrolling

### 390 × 844

- **What does it do?** It is a weekly family planner that keeps a household
  schedule on the current device.
- **For whom?** Families mixing phones, computers, and paper who do not want a
  new shared cloud account.
- **What should I click first?** **Add plan** is the filled primary action. A
  visitor evaluating the product can instead choose **Try it with sample data**,
  whose adjacent explanation says **“Opens a separate sample board.”**

The answers come directly from **“Plan your family week together”** and **“For
families using phones, computers, and paper who need one shared weekly view
without a new account.”** All three answers are visible without scrolling.

### 1440 × 900

The same three answers are visible. The live seven-column empty board is also
above the fold. The first-read gate therefore passes at both sizes.

## Findings, ordered by severity

### Blocking

#### F-1-1 — The paid checkout claim failed its required test

- **Quote/location:** **“₹499 once”** and **“Buy supporter pack”**; landing
  supporter section/dialog, `src/app.ts:153-156` and `src/app.ts:237-243`.
- **Evidence:** The exact `paid-checkout` command from `.factory/claims.json`
  received HTTP **500**, not the asserted 303, at the production Sociobot
  endpoint. Three immediate later retries and a direct request returned 303,
  so this is an intermittent production failure rather than a permanently dead
  link. The review rule says any failed claim test is blocking. This also
  reopens the checkout defect recorded in the earlier verification history.
- **Why this matters:** A visitor can select a paid offer and intermittently
  reach an error instead of checkout. The one-time purchase is not reliable.
- **Concrete fix:** Make the Sociobot checkout endpoint reliably return a 303 to
  the hosted checkout. Add repeated/cold-start coverage and show a plain retry
  message in Weekboard when checkout is unavailable. Re-run the exact claim
  command from a fresh context until it is stable, not merely passing once.

#### F-1-2 — The earlier 44 × 44 mobile-target defect is only partly fixed

- **Quote/location:** the Privacy email link **“privacy@sociobot.in”** is
  162 × 19 px. Dialog close buttons measure 41 × 44 px in People, 41 × 44 px in
  Move/share, 32 × 44 px in Supporter, and 30 × 44 px in About. The Supporter
  dialog's inline **“privacy”** and **“terms”** links are 48 × 15 and 38 × 15 px.
- **Evidence:** Fresh live Chromium at 390 × 844, using bounding rectangles for
  every visible link/button/input in each opened dialog and legal page. This is
  the same class as `verification.md` “Medium 2”; only the originally named
  controls were enlarged.
- **Why this matters:** These targets remain hard to operate by touch and fail
  the supplied accessibility baseline. The history rule makes a half-fixed
  prior finding blocking again.
- **Concrete fix:** Give every close button at least a 44 × 44 px hit box. Give
  inline links a 44 px minimum-height wrapper or enough surrounding padding
  without making adjacent targets overlap. Add a 390 px test that opens every
  dialog and checks all visible interactive target rectangles.

### Major

#### F-1-3 — README overstates the tested offline claim

- **Quote/location:** **“It runs fully offline”**, `README.md:5`.
- **Why this matters:** The listed and tested claim is narrower: **“Works
  offline after the first visit.”** A cold first visit still needs the network.
- **Concrete fix:** Rewrite to **“After the first visit, it works offline and
  stores plans in this browser.”** Keep it mapped to `offline-reload`.

#### F-1-4 — Free-feature promises are not represented by a claim entry

- **Quote/location:** **“Core planning and export are free”** and **“Planning,
  accessibility, encryption, and export stay free”**, `src/app.ts:102,155,239`.
- **Why this matters:** `supporter-entitlements` tests paid extras, but no claim
  states or test asserts that every named core operation stays usable without a
  license. **“Accessibility”** is also not a feature that should sound gated.
- **Concrete fix:** Add a `free-core` claim and a clean, unlicensed real-board
  test covering add/edit, print, ICS export, and encrypted export. Rewrite the
  sentence as **“Adding plans, printing, and both exports are free.”** Remove
  “accessibility” from the price comparison.

#### F-1-5 — The no-feature bundle contains unlisted claims

- **Quote/location:** **“It does not create accounts, invite people, or sync
  changes live”**, `src/app.ts:151`; README adds **“contacts, chat … or CalDAV
  server”**, `README.md:23-24`.
- **Why this matters:** `local-privacy` checks no account UI and cross-origin
  requests. No claim entry names or test checks invitations, contacts, chat,
  CalDAV, or all live-sync behavior.
- **Concrete fix:** Either reduce both locations to the tested sentence **“It
  has no account and does not send your schedule”**, or add one explicit
  `no-cloud-features` entry with observable checks for every retained item.

#### F-1-6 — Named calendar compatibility is stronger than the ICS test

- **Quote/location:** **“Use ICS with Apple, Google, Outlook, or another
  calendar app”**, `src/app.ts:229`.
- **Why this matters:** `ics-export` checks Weekboard syntax and a Weekboard
  round-trip. It does not exercise Apple Calendar, Google Calendar, or Outlook.
- **Concrete fix:** Rewrite to **“Export a standard ICS calendar file”**, which
  matches the current test, or add fixture validation/import evidence from each
  named calendar.

#### F-1-7 — Merchant and refund behavior is unlisted and under-tested

- **Quote/location:** **“Sociobot / Dodo is the merchant of record. Refunds are
  handled there and revoke the license”**, `src/app.ts:243`.
- **Why this matters:** `paid-checkout` checks only the redirect host.
  `license-revocation` supplies a mocked revoked response; neither proves
  merchant-of-record status or that a real refund causes revocation.
- **Concrete fix:** Add a billing-contract claim backed by a recorded
  refund/revocation fixture and authoritative merchant metadata, or replace the
  copy with a link to the hosted checkout policy and avoid the unproved causal
  promise.

#### F-1-8 — Cross-route focus and announcement are missing

- **Quote/location:** selecting header **“Privacy”** loads `/privacy/`; after
  navigation `document.activeElement` is `BODY`, not the new `h1`. Back returns
  to `/` with focus again on `BODY`. No route-announcement region exists.
- **Why this matters:** Deep links and browser history work, but a keyboard or
  screen-reader user is not moved to or notified of the new page heading as the
  supplied routing contract requires.
- **Concrete fix:** Add a small shared, self-hosted route script that focuses a
  `tabindex="-1"` `h1` after document navigation and announces the title in a
  polite live region. Add direct-link, forward, and back tests.

### Minor

#### F-1-9 — The sitemap omits a real route

- **Quote/location:** `public/sitemap.xml:3-5` lists `/`, `/privacy/`, and
  `/terms/`, but not `/demo/`.
- **Why this matters:** The supplied structure contract says the sitemap lists
  every route. The documented and linked demo is a real route even if it is
  intentionally disallowed from search indexing.
- **Concrete fix:** Add `/demo/` to the sitemap, or document and test a formal
  exception for noindex demo routes.

#### F-1-10 — The README opening sentence exceeds the hard cap

- **Quote/location:** the 31-word sentence beginning **“Weekboard is a private,
  installable weekly planner…”**, `README.md:3-5`.
- **Why this matters:** It exceeds 22 words and combines audience, device mix,
  product category, and privacy posture.
- **Concrete fix:** **“Weekboard is a weekly planner for families using phones,
  computers, and paper. It keeps their shared schedule out of cloud accounts.”**

#### F-1-11 — The README feature list uses unexplained calendar jargon

- **Quote/location:** **“Standard ICS import and export, with UTC timestamps
  and RRULE recurrence”**, `README.md:18`.
- **Why this matters:** ICS, UTC, and RRULE are not explained on first use.
- **Concrete fix:** **“Import and export standard calendar files. Weekboard
  keeps repeat rules and time zones in the file.”** Put protocol details in a
  later developer note.

#### F-1-12 — The README feature list exposes an encryption acronym

- **Quote/location:** **“Explicit AES-GCM encrypted file and QR handoff”**,
  `README.md:19`.
- **Why this matters:** AES-GCM is implementation jargon in the user-oriented
  feature list.
- **Concrete fix:** **“Share a password-encrypted Weekboard file or QR code.
  Each is a snapshot, not live sync.”** Document AES-GCM later.

#### F-1-13 — The README feature list uses an unexplained product acronym

- **Quote/location:** **“installable PWA”**, `README.md:20`.
- **Why this matters:** A household user should not need to expand PWA.
- **Concrete fix:** **“Install Weekboard on your device and keep using it
  offline after the first visit.”**

#### F-1-14 — Local-storage implementation jargon appears in end-user copy

- **Quote/location:** **“It stores data in IndexedDB on this device”**, About
  dialog, `src/app.ts:246`.
- **Why this matters:** IndexedDB is a browser implementation detail and does
  not explain the user outcome.
- **Concrete fix:** **“It stores your board in this browser and sends nothing
  unless you export it.”** Keep “IndexedDB” in the technical README.

#### F-1-15 — The same concepts use several competing terms

- **Quote/location:** **“people/lane colours”** (`README.md:17`) and **“Move /
  share”**, **“Move a copy”**, **“handoff”**, **“snapshot”**, and **“Private
  Weekboard copy”** (`src/app.ts:106,147,151,227-230`). The existing copy audit
  itself records `person / lane` and `handoff / snapshot` as the preferred
  “one word”.
- **Why this matters:** A first-time visitor must infer whether lane/person and
  copy/snapshot/handoff are separate concepts.
- **Concrete fix:** Use **person colour** for assignment and **copy** for every
  file/QR transfer. For example: **“Share or export a copy”** and **“File and QR
  copies do not sync.”**

#### F-1-16 — The artwork sentence carries two ideas

- **Quote/location:** **“The first-run pixel illustration is original
  AI-generated artwork made for Weekboard with the factory image model;
  interface marks are hand-authored.”**, About dialog, `src/app.ts:246`.
- **Why this matters:** It meets the word cap but violates the one-idea rule.
- **Concrete fix:** Split it: **“The first-run pixel illustration was generated
  for Weekboard with the factory image model. The interface marks are
  hand-authored.”**

#### F-1-17 — The empty-state heading is ambiguous out of context

- **Quote/location:** **“Your week is clear”**, `src/app.ts:138`.
- **Why this matters:** A heading list does not reveal whether “clear” means
  empty, organised, or error-free.
- **Concrete fix:** **“No plans this week.”**

#### F-1-18 — The supporter heading does not name the offered result

- **Quote/location:** **“Keep small software possible”**, `src/app.ts:238`.
- **Why this matters:** Out of context it is a fundraising slogan, not an
  explanation of the paid pack.
- **Concrete fix:** **“Add options for a bigger household.”**

#### F-1-19 — The About heading is a metaphor

- **Quote/location:** **“A calendar that is not a cloud”**, `src/app.ts:246`.
- **Why this matters:** It does not say what the dialog explains.
- **Concrete fix:** **“How Weekboard stores your schedule.”**

#### F-1-20 — Decorative console labels obscure their sections

- **Quote/location:** **“READY PLAYER HOUSEHOLD”**, **“THREE MOVES”**,
  **“LANES”**, and **“EXPLICIT HANDOFF”**, `src/app.ts:137,146,217,227`.
- **Why this matters:** These labels require translating a game reference and
  product jargon before reading the real headings.
- **Concrete fix:** Use **“EMPTY BOARD”**, **“THREE STEPS”**, **“PEOPLE”**, and
  **“SHARE A COPY”**. Keep the pixel styling rather than the unclear wording.

#### F-1-21 — “Move / share” does not name one result

- **Quote/location:** `src/app.ts:106`.
- **Why this matters:** The slash hides whether the action moves, exports, or
  shares data.
- **Concrete fix:** **“Share or export board.”**

#### F-1-22 — “This week” is a destination, not an action label

- **Quote/location:** `src/app.ts:115`.
- **Why this matters:** It does not state that the button returns from another
  week.
- **Concrete fix:** **“Show this week.”**

#### F-1-23 — “People” does not name the editing result

- **Quote/location:** `src/app.ts:120`.
- **Why this matters:** It could be a view, filter, or settings page.
- **Concrete fix:** **“Edit people.”**

#### F-1-24 — “Print” omits what will be printed

- **Quote/location:** `src/app.ts:121`.
- **Why this matters:** The action opens browser printing for the whole week,
  not the selected day or page.
- **Concrete fix:** **“Print week.”**

#### F-1-25 — “About” is a noun on a dialog-opening button

- **Quote/location:** `src/app.ts:161`.
- **Why this matters:** It does not name the action or destination.
- **Concrete fix:** **“Read about Weekboard.”**

#### F-1-26 — “Delete” omits the object

- **Quote/location:** plan editor, `src/app.ts:213`.
- **Why this matters:** The destructive button should name what it removes
  before the confirmation appears.
- **Concrete fix:** **“Delete plan.”**

#### F-1-27 — “Done” does not name the result

- **Quote/location:** People dialog, `src/app.ts:223`.
- **Why this matters:** It only closes settings; it does not save a pending
  operation.
- **Concrete fix:** **“Close people settings.”**

#### F-1-28 — “Supporter ✓” is status text on an action

- **Quote/location:** unlocked header button, `src/app.ts:91`.
- **Why this matters:** It opens supporter management but reads only as a
  badge.
- **Concrete fix:** **“Manage supporter pack.”** Keep the active state inside
  the dialog or in a separate status label.

#### F-1-29 — The catalog summary required by the copy contract is absent

- **Quote/location:** `.factory/brief.json` has no `summary` field.
- **Why this matters:** The plain-words contract requires the catalog text to
  be audited as a one-line, action-led description of at most 120 characters.
  There is currently nothing to verify or publish.
- **Concrete fix:** Add **`"summary": "Plan a family week without a shared
  cloud account."`** to the brief and verify the catalog renders that exact
  line.

## Copy audit

Counts use rendered words. URLs, code paths, and hyphenated terms count as one
word. Repeated event occurrences and dynamic dates/names are data, not authored
sentences, and are de-duplicated. Standalone punctuation separators are not
words.

### Landing page prose and headings

| ID | Exact copy | Words | Flag |
| --- | --- | ---: | --- |
| L01 | Plan your family week together | 5 | — |
| L02 | For families using phones, computers, and paper who need one shared weekly view without a new account. | 17 | — |
| L03 | Works offline after the first visit. | 6 | — |
| L04 | Your schedule stays on this device. | 6 | — |
| L05 | Core planning and export are free. | 6 | F-1-4 |
| L06 | Opens a separate sample board. | 5 | — |
| L07 | Demo — sample data, nothing is saved | 6 | — |
| L08 | Changes stay separate from your real board. | 7 | — |
| L09 | OFFLINE · changes still save on this device | 7 | — |
| L10 | Your week is clear | 4 | F-1-17 |
| L11 | Add the first plan, or import an existing ICS calendar. | 10 | — |
| L12 | Everything stays in this browser unless you explicitly export it. | 10 | — |
| L13 | Saved locally · 0 plans on board | 6 | — |
| L14 | How it works | 3 | — |
| L15 | Add plans. | 2 | — |
| L16 | Put each commitment on a person’s lane. | 7 | F-1-15 |
| L17 | Check the week. | 3 | — |
| L18 | Use seven columns or one phone-friendly day. | 7 | — |
| L19 | Move a copy. | 3 | F-1-15 |
| L20 | Print, export ICS, or share an encrypted snapshot. | 8 | F-1-15 |
| L21 | What Weekboard does not do | 5 | — |
| L22 | It does not create accounts, invite people, or sync changes live. | 11 | F-1-5 |
| L23 | File and QR handoffs are snapshots. | 6 | F-1-15 |
| L24 | Add room for a bigger household | 6 | — |
| L25 | ₹499 once. | 2 | F-1-1 |
| L26 | Add more than four people, extra lane colours, and a custom board name. | 13 | — |
| L27 | Planning, accessibility, encryption, and export stay free. | 7 | F-1-4 |
| L28 | Plan a family week without a shared cloud account. | 9 | — |
| L29 | A fresh Weekboard is ready. | 5 | — |
| L30 | Colour helps you scan; every plan also carries the person’s name. | 11 | F-1-15 |
| L31 | This is not live sync. | 5 | — |
| L32 | Importing replaces the receiving board with the copy you send. | 10 | — |
| L33 | Weekboard never uploads it. | 4 | — |
| L34 | Use ICS with Apple, Google, Outlook, or another calendar app. | 10 | F-1-6 |
| L35 | Person colours are included as notes. | 6 | — |
| L36 | Encrypts people, notes, and plans in this browser. | 8 | — |
| L37 | Share the passphrase separately. | 4 | — |
| L38 | Core planning, offline use, printing, encryption, and every export stay free. | 11 | F-1-4 |
| L39 | The supporter pack adds a custom board name, extra lane colours, and more than four people. | 16 | — |
| L40 | No subscription. | 2 | — |
| L41 | No account required. | 3 | — |
| L42 | One license can be restored on your devices. | 8 | — |
| L43 | Sociobot / Dodo is the merchant of record. | 7 | F-1-7 |
| L44 | Refunds are handled there and revoke the license. | 8 | F-1-7 |
| L45 | Weekboard is a deliberately small, installable weekly view. | 8 | — |
| L46 | It stores data in IndexedDB on this device and sends nothing unless you choose an export. | 16 | F-1-14 |
| L47 | The first-run pixel illustration is original AI-generated artwork made for Weekboard with the factory image model; interface marks are hand-authored. | 20 | F-1-16 |
| L48 | Thanks for backing private household software. | 6 | — |
| L49 | Weekboard needs JavaScript to keep your board in this browser. | 10 | — |

No landing sentence exceeds 22 words. The mean is 7.4 words across these 49
items. No banned marketing word appears.

### Landing labels and controls

| Exact copy | Words | Flag |
| --- | ---: | --- |
| WEEKBOARD | 1 | — |
| Demo | 1 | — |
| How it works | 3 | — |
| Privacy | 1 | — |
| Change colour theme | 3 | — |
| Support Weekboard | 2 | — |
| Supporter ✓ | 2 | F-1-28 |
| Add plan | 2 | — |
| Move / share | 3 | F-1-21 |
| Try it with sample data | 5 | — |
| Reset demo | 2 | — |
| Start for real | 3 | — |
| Previous week | 2 | — |
| This week | 2 | F-1-22 |
| Next week | 2 | — |
| People | 1 | F-1-23 |
| Print | 1 | F-1-24 |
| Add the first plan | 4 | — |
| See supporter pack | 3 | — |
| About | 1 | F-1-25 |
| Reload | 1 | — |
| Delete | 1 | F-1-26 |
| Cancel | 1 | — |
| Save plan | 2 | — |
| Add person | 2 | — |
| Save name | 2 | — |
| Done | 1 | F-1-27 |
| Export ICS | 2 | — |
| Import ICS | 2 | — |
| Download encrypted copy | 3 | — |
| Make QR handoff | 3 | F-1-15 |
| Open encrypted copy | 3 | — |
| Open pasted copy | 3 | — |
| Buy supporter pack | 3 | F-1-1 |
| Verify license | 2 | — |
| Close | 1 | — |

| Console/dialog label | Words | Flag |
| --- | ---: | --- |
| READY PLAYER HOUSEHOLD | 3 | F-1-20 |
| THREE MOVES | 2 | F-1-20 |
| CLEAR BOUNDARIES | 2 | — |
| PLAN SLOT | 2 | — |
| LANES | 1 | F-1-20 |
| EXPLICIT HANDOFF | 2 | F-1-20 |
| ONE-TIME SUPPORTER PACK | 3 | — |
| Supporter pack active | 3 | — |
| Standard calendar file | 3 | — |
| Private Weekboard copy | 3 | — |
| Keep small software possible | 4 | F-1-18 |
| A calendar that is not a cloud | 7 | F-1-19 |

### Landing runtime, error, and confirmation sentences

| Exact copy or template | Words | Flag |
| --- | ---: | --- |
| That QR handoff link could not be read. | 8 | — |
| Demo reset to the original sample plans. | 7 | — |
| Plan updated. | 2 | — |
| Plan added. | 2 | — |
| Give this plan a name, not only spaces. | 8 | — |
| The end must be after the start. | 7 | — |
| Repeat until must be the start date or a later date. | 11 | — |
| That plan could not be saved. | 6 | — |
| Your existing board is unchanged. | 5 | — |
| Delete “{plan}” and all its repeats? | 7 | — |
| Plan deleted. | 2 | — |
| The free board includes four people. | 6 | — |
| The supporter pack removes that limit. | 6 | — |
| Give this person a name, not only spaces. | 8 | — |
| {Person} added. | 2 | — |
| Remove {person} and {count} of their plans? | 8 | — |
| {Person} removed. | 2 | — |
| Board name saved. | 3 | — |
| Theme: {theme}. | 2 | — |
| ICS calendar exported. | 3 | — |
| {Count} plans imported from ICS. | 5 | — |
| The ICS file could not be read. | 7 | — |
| Encrypted Weekboard copy downloaded. | 4 | — |
| The encrypted copy could not be created. | 7 | — |
| Use a passphrase with at least 8 characters. | 8 | — |
| That handoff code or passphrase did not match. | 8 | F-1-15 |
| Check both and try again. | 5 | — |
| This board is too large for one QR. | 8 | — |
| Download the encrypted copy instead. | 5 | — |
| Scan on the other device, then enter the passphrase separately. | 10 | — |
| Encrypted code copied. | 3 | — |
| Copy was blocked. | 3 | — |
| Select the code below and copy it manually. | 8 | — |
| The QR handoff could not be created. | 7 | F-1-15 |
| Choose an encrypted copy or paste its handoff code first. | 10 | F-1-15 |
| This is not a valid Weekboard v1 file. | 8 | — |
| No calendar events were found in that ICS file. | 9 | — |
| An imported event has no start date. | 7 | — |
| Replace this board with “{board}” ({count} plans)? | 8 | — |
| Encrypted Weekboard copy opened. | 4 | — |
| The encrypted copy could not be opened. | 7 | — |
| Paste the license token from your receipt. | 7 | — |
| Checking license… | 2 | — |
| License active. | 2 | — |
| Supporter extras are unlocked. | 4 | — |
| That license is not active. | 5 | — |
| Check the token or use the buy link. | 8 | — |
| Supporter pack unlocked. | 3 | — |
| Back online. | 2 | — |
| Your board remained on this device. | 6 | — |
| Weekboard could not open | 4 | — |
| Your browser blocked local storage, so no plans can be safely saved. | 12 | — |
| Allow site data for this page, or open it in a regular (not private) window, then reload. | 17 | — |
| Try again | 2 | — |
| The local database could not be opened. | 7 | — |
| The local change could not be saved. | 7 | — |
| The local change was cancelled. | 5 | — |

### README sentences and list items

| ID | Exact copy | Words | Flag |
| --- | --- | ---: | --- |
| R01 | Weekboard is a private, installable weekly planner for households that use a mix of Android, iPhone, desktop, and paper—but do not want to put their shared schedule into another cloud account. | 31 | F-1-10 |
| R02 | It runs fully offline and stores plans in the browser on the current device. | 14 | F-1-3 |
| R03 | Demo: `https://family-weekboard.sociobot.in/demo/` — opens a seeded sample board in the separate `demo:weekboard-local-v1` database. | 12 | — |
| R04 | Use Reset demo to restore the sample or Start for real to leave without copying changes. | 16 | — |
| R05 | A seven-day desktop board and focused one-day phone agenda | 9 | — |
| R06 | Household people/lane colours, all-day plans, and daily/weekly/monthly repeats | 8 | F-1-15 |
| R07 | Standard ICS import and export, with UTC timestamps and RRULE recurrence | 11 | F-1-11 |
| R08 | Explicit AES-GCM encrypted file and QR handoff (a snapshot, not live sync) | 12 | F-1-12, F-1-15 |
| R09 | Print layout, light/dark/system themes, installable PWA, and offline storage | 9 | F-1-13 |
| R10 | Optional ₹499 one-time supporter license through the Sociobot billing API | 10 | F-1-1 |
| R11 | There are deliberately no accounts, invitations, cloud sync, contacts, chat, analytics, third-party scripts, or CalDAV server. | 16 | F-1-5 |
| R12 | Requires Node 20 or newer. | 5 | — |
| R13 | `npm test` covers calendar recurrence and ICS interoperability. | 8 | — |
| R14 | The Playwright suite covers creation/persistence, keyboard-accessible dialogs, mobile layout, accessibility, demo isolation, claims, and installed/offline reload. | 16 | — |
| R15 | Every user-facing product claim and its exact command is listed in `.factory/claims.json`. | 12 | F-1-3 through F-1-7 |
| R16 | The free planner makes no cross-origin request. | 7 | — |
| R17 | Buying or verifying a supporter license uses the Sociobot billing API. | 11 | — |
| R18 | IndexedDB holds the board. | 4 | — (developer context) |
| R19 | ICS is the interoperable backup; `.weekboard` files are encrypted snapshots. | 10 | F-1-15 |
| R20 | Importing an encrypted snapshot replaces the receiving board after a named confirmation. | 12 | F-1-15 |
| R21 | Deploy the contents of `dist/` as a static site with `index.html` at its root. | 14 | — |
| R22 | Keep the shipped 404 response override: unknown paths must serve `/404.html` with HTTP 404, not an SPA fallback. | 18 | — (developer context) |
| R23 | `/privacy/` and `/terms/` are real static routes. | 7 | — |
| R24 | `staticwebapp.config.json` ships the 404 policy, CSP, frame/permission policy, no-cache worker rule, and immutable caching for Vite’s content-hashed assets. | 18 | — (developer context) |
| R25 | Do not add runtime CDN assets. | 6 | — (developer context) |
| R26 | The visual system and generated-art provenance are in `.factory/design.md`. | 9 | — |
| R27 | Build handoff and measured gates are in `.factory/handoff.md`. | 8 | — |
| R28 | Licensed under MIT. | 3 | — |

README headings/labels are **“Weekboard”** (1), **“Live”** (1), **“Demo”**
(1), **“What v1 includes”** (3), **“Develop and verify”** (3), and **“Data
ownership and deployment”** (4). Shell commands are code, not sentences. The
README prose/list average is 11.3 words. R01 is the only item above 22 words;
no banned marketing word appears.

## Demo and sandbox result

**PASS.** From a fresh context, `/demo/` opens only
`demo:weekboard-local-v1`; it does not create or read `weekboard-local-v1` and
does not write local storage. The first screen shows Asha, Ravi, and Kids with
school drop-off, dentist, football practice, and grocery plans in the current
week. The required banner, Reset demo, and Start for real remain visible.

A live test added a real-board marker, entered demo, added and reset a demo
marker, then selected Start for real. The real marker remained and the demo
marker did not. A separate live test confirmed demo edits survive a reload,
Reset removes them, and the seed returns.

The live demo gained a controlling service worker, reloaded offline with its
sample and OFFLINE indicator, and issued no cross-origin request during the
captured flow. There were no console/page errors.

## Claims audit

Each of the 16 commands in `.factory/claims.json` was run separately against
the production build from the clean checked-out base. Each claim tag occurs in
exactly one test.

| Claim | Exact-command result |
| --- | --- |
| `demo-sandbox` | PASS — 1 test, 4.5 s |
| `offline-reload` | PASS — 1 test, 2.1 s |
| `local-privacy` | PASS — 1 test, 2.3 s |
| `ics-export` | PASS — 1 test, 4.0 s |
| `ics-import` | PASS — 1 test, 2.0 s |
| `encrypted-handoff` | PASS — 1 test, 3.5 s |
| `calendar-options` | PASS — 1 test, 3.9 s |
| `person-lanes` | PASS — 1 test, 2.0 s |
| `responsive-agenda` | PASS — 1 test, 1.9 s |
| `print-board` | PASS — 1 test, 2.0 s |
| `themes` | PASS — 1 test, 2.3 s |
| `installable-pwa` | PASS — 1 test, 2.0 s |
| `paid-checkout` | **FAIL — expected 303, received 500**; three later retries passed |
| `license-restore` | PASS — 1 test, 2.4 s |
| `supporter-entitlements` | PASS — 1 test, 4.0 s |
| `license-revocation` | PASS — 1 test, 2.0 s |

The unlisted/under-tested live and README claims are F-1-3 through F-1-7.
Consequently **“Every user-facing product claim … is listed”** in README is not
currently true.

## History review

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files.
The existing handoff and verification history were checked because the handoff
names earlier defects.

| Historical issue | Live/code confirmation |
| --- | --- |
| Checkout unavailable | **Regressed intermittently; F-1-1.** Initial exact claim run returned 500. |
| Mobile controls below 44 × 44 | **Half-fixed; F-1-2.** Previously named header/footer controls pass, but dialog close and inline legal links remain undersized. |
| Spring/fall DST all-day corruption | Fixed: tagged regressions pass in both projects; live timed/all-day export round-trip preserved 3/3 occurrences. |
| Inverted recurrence accepted | Fixed: validation remains at `src/app.ts:389-391`; regression coverage passes. |
| Legal-page accessible-name failure | Fixed: live axe reports no serious/critical issue. |
| Stale service-worker update | Fixed: unit PWA revision tests pass and current hashed assets are precached. |
| Missing security headers/cache policy | Fixed: live CSP, frame policy, no-sniff, referrer policy, and immutable assets are present. |
| Whitespace-only plan/person names | Fixed: validation and tagged person regression pass. |
| Missing claims/demo/metadata/404 | Fixed except the sitemap omission in F-1-9. Demo, metadata, and real 404 work. |
| Unverified token unlocked paid extras | Fixed: tagged network-failure regression passes. |
| Mobile tab arrow navigation | Fixed in code and the mobile interaction test. |
| Storage-error retry blocked by CSP | Fixed: tagged regression passes. |
| Manifest MIME | Fixed: live response is `application/json`. |
| Dark demo action contrast | Fixed: live colors are `#111A22` on `#FFFDF3`; axe is clear. |
| Recurring ICS end lost | Fixed: local claim/regression tests and a fresh live round-trip pass. |
| Verify endpoint lacked rate limiting | Fixed: a 40-request live burst returned 30 × 200 and 10 × 429 with `Retry-After`. |

## Structure, links, accessibility, and identity

- Titles pass: `Weekboard — plan your family week`, `Demo — Weekboard`,
  `Privacy — Weekboard`, `Terms — Weekboard`, and `Page not found — Weekboard`.
- Each route has `lang="en"`, one `h1`, a main landmark, description,
  canonical, OG/Twitter metadata, SVG favicon, 192 px touch icon, header, and
  footer. The social image is a real 1200 × 630 WebP.
- `/`, `/demo/`, `/privacy/`, `/terms/`, the direct `/404.html`, icons,
  metadata assets, robots, sitemap, and the external Param Factory link return
  200. A random path returns the designed Weekboard 404 with HTTP 404. The only
  observed link failure is the intermittent checkout in F-1-1.
- Fresh axe scans on all five routes at 390 px and 1440 px report zero
  serious/critical violations. The explicit target-size failures are F-1-2.
- Deep links and browser back work. Focus/announcement is the remaining route
  defect in F-1-8.
- The visual identity passes: the cream/navy/cyan/orange pixel-console board,
  hard offset shadows, monospaced labels, and original planning-station art are
  recognisably specific to Weekboard, not a generic SaaS hero/cards template.
- The live JS and CSS hashes match the local production build exactly. Initial
  JS is 71.37 kB raw / 24.43 kB gzip.

## Missed leverage

No finding. The brief's obvious leverage is interoperable import/export and a
deliberate device-to-device handoff; both exist as ICS, encrypted file, and QR
flows. Live sync is an explicit non-goal. An AI feature would not improve this
deterministic, local-first scheduling job enough to justify sending schedule
content to a model. No runtime provider key or decorative AI feature is
present; generated artwork provenance is disclosed.

## Verification commands and observations

- `npm ci` — pass; 91 packages, zero vulnerabilities reported.
- `npm run build` — pass; `dist/` produced.
- `npm test` — pass; 22/22.
- `npm run typecheck` — pass.
- `npm run lint` — pass.
- `npx playwright test --grep '@regression:'` — pass; 20/20 across desktop and
  mobile.
- Every exact `.factory/claims.json` command — 15 passed initially, 1 failed as
  F-1-1; three targeted retries of that claim passed.
- Live axe: zero serious/critical violations on five routes at both sizes.
- Live network interception: no cross-origin request during demo edit/reset and
  offline flow.

## What would make this perfect

Resolve F-1-1 through F-1-29, then repeat the entire review from a clean
context. Perfection requires a stable paid redirect, every touch target at
least 44 × 44 px, exact claim/copy parity, plain and consistent terminology,
result-naming controls, complete route focus behavior and sitemap coverage,
and one clean pass of every claim command with no retries required.
