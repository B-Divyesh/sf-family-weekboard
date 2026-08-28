# Independent product verification 5 — **FAIL**

Verified on **2026-08-28 UTC** from candidate
`d237bd47a43422d376a3c150e1e4020c17bb1642` (`main`) against
<https://family-weekboard.sociobot.in>.

The live deployment is byte-identical to the candidate's production output,
the cold first screen and one-click demo gates pass, and all declared claim
commands pass after the lockfile install. Release acceptance still fails. The
claims inventory does not cover several capability statements, its quantitative
price test does not test the price, and fresh live calendar cases produce extra
commitments around daylight-saving time and after an ICS recurrence has ended.

## Mandatory gates run first

### Claims gate — FAIL

`.factory/claims.json` exists with eight entries. Before source inspection, all
eight exact commands were invoked from the clean checkout. The pre-install
invocations could not load `@playwright/test`, as expected with no
`node_modules`; after `npm ci`, every declared assertion ran and passed:

| Claim | Result | Observable assertion |
| --- | --- | --- |
| `demo-sandbox` | PASS | Real/demo IndexedDB isolation, reset, and return |
| `offline-reload` | PASS | Controlled demo reload with network disabled |
| `local-privacy` | PASS | Persisted demo change and zero cross-origin requests |
| `ics-export` | PASS | Four sample `VEVENT`s in downloaded VCALENDAR |
| `encrypted-handoff` | PASS | Ciphertext omitted names and QR image rendered |
| `installable-pwa` | PASS | Manifest fields/icons and controlling worker |
| `paid-checkout` | PASS as written | 303 redirect to Dodo checkout |
| `license-restore` | PASS | Mock-valid returned token produced supporter state |

The overall claims contract nevertheless fails its required landing/README
cross-check:

- The landing page and README promise ICS **import**, printing, all-day plans,
  daily/weekly/monthly repeats, people/lane colours, a seven-day desktop board,
  a one-day phone agenda, and light/dark/system themes. None has an entry in
  `.factory/claims.json`.
- The supporter copy promises a custom board name, extra colours, and more than
  four people. The checkout and restore claims do not assert those entitlements.
- The README says a passphrase cannot be recovered and that encrypted import
  replaces the board after named confirmation. Neither statement is listed.
- `@claim:paid-checkout` is quantitative (`₹499 once`), but its test only checks
  the 303 and destination host; it never asserts 499 or one-time billing. A
  fresh hosted checkout displayed `Weekboard Supporter Pack` and `$5.23` under
  its default `Pay in USD` locale, so the test itself cannot prove the stated
  number.
- `@claim:encrypted-handoff` checks a ciphertext prefix/plaintext absence and
  the presence of an image. It does not prove AES-GCM or decode the QR into a
  restorable board through that claim command.

The attached claims contract makes any unlisted claim release-blocking.

### Cold first-read and demo gate — PASS

Fresh browser profiles at 1440×900 and 390×844 showed, in the first viewport:

- **What:** `Plan your family week together`.
- **For whom:** families using phones, computers, and paper who need one weekly
  view without a new account.
- **First click:** `Try it with sample data`, with `Opens a separate sample
  board.` immediately below it.

The action opened `/demo/` in one click with Asha, Ravi, Kids, and four real-looking
plans already visible. The persistent demo banner exposes Reset and Start for
real. A live isolation flow created a real plan, entered the demo, reset a demo
mutation, returned, and recovered the real plan. The two databases were
`weekboard-local-v1` and `demo:weekboard-local-v1`; captured request origins
contained only `https://family-weekboard.sociobot.in`.

Screenshots: `evidence/live-first-read-desktop.png` and
`evidence/live-first-read-mobile.png`.

## Release-blocking defects

### Critical — required claims inventory and tests are incomplete

The unlisted and under-asserted capability/price claims above violate the
explicit acceptance rule that every visitor-facing claim must have exactly one
demo-sandbox test. Passing the eight present commands is not sufficient when
the inventory omits shipped promises.

### High — recurring all-day plans gain a false day across the autumn DST change

Fresh live reproduction in `America/New_York`:

1. Set the current date to 7 November 2027.
2. Add `DST weekly holiday` as an all-day weekly plan from 7 through 21 November.
3. Open the week 15–21 November.

The plan appears on both **Monday 15 November** and **Sunday 21 November**. It
should appear only on Sundays. The fall-back source day is 25 elapsed hours;
`occurrencesInRange()` reuses that millisecond duration for later civil-day
occurrences (`src/dates.ts:55-60`), making them end at 01:00 the next day.

The same civil-day error affects valid all-day ICS input with no `DTEND`.
`DTSTART;VALUE=DATE:20270314` (the New York spring-forward day) correctly showed
on Sunday 14 March, then incorrectly appeared again on Monday 15 March. The
importer defaults to 86,400,000 elapsed milliseconds (`src/ics.ts:112`) instead
of the next local midnight required for an all-day civil date.

Evidence: `evidence/live-dst-recurrence-defect.png`.

### High — timed ICS `UNTIL` is truncated and imports an event after recurrence ends

Fresh live UTC import used this supported rule:

```ics
DTSTART:20260824T180000Z
DTEND:20260824T183000Z
RRULE:FREQ=DAILY;UNTIL=20260826T120000Z
```

The RFC recurrence ends before the 18:00 occurrence on 26 August, so the board
should contain 24 and 25 August only. Weekboard displayed the plan on **24, 25,
and 26 August**. `importIcs()` accepts the UTC timestamp as a simple rule but
stores only its date (`src/ics.ts:114-127`); recurrence expansion then treats
the limit as local 23:59:59. This silently changes a standard calendar.

Evidence: `evidence/live-ics-until-defect.png`.

## Other defects

### Medium — storage-failure recovery button is blocked by the production CSP

With IndexedDB unavailable, the live page correctly displayed `Weekboard could
not open` and a `Try again` action. Clicking it caused no navigation. The button
uses `onclick="location.reload()"` (`src/main.ts:16`), while production CSP is
`script-src 'self'`; Chromium logged that the inline handler was blocked. This
leaves a core error state without its offered recovery.

### Medium — required metadata/skeleton is incomplete on secondary routes

The demo, Privacy, and Terms pages omit the required Open Graph and Twitter
card metadata. The designed 404 has a title and return link but no description,
canonical URL, apple-touch icon, standard header, or footer. These routes pass
axe and return correct HTTP statuses, but they do not meet the attached
site-structure contract.

### Low — whitespace-only person names fail silently

Submitting three spaces in the People dialog leaves the dialog open, creates no
person, and leaves the `role="alert"` empty (`src/app.ts:417-418`). The four-person
limit does provide a clear recovery message; this earlier validation path does
not.

### Low — README contradicts the deployed 404 policy

README deployment guidance says to configure an SPA fallback to `index.html`.
The shipped host config intentionally has no navigation fallback and returns a
real `404.html` with HTTP 404. Following the README would undo the correct route
behavior.

## Clean-checkout repository gates

No product source was changed.

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 91 packages, 0 vulnerabilities |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (the repository maps lint to `tsc --noEmit`) |
| `npm test` | PASS — 4 files, 16 tests |
| `npm run build` | PASS — exact Vite production build emitted `dist/` |
| `npm run test:e2e` | PASS — 34 passed, 2 intentional project skips |

## Independent end-to-end evidence

- Normal create, invalid end-time rejection, correction, refresh persistence,
  edit, cancelled deletion, and confirmed deletion worked without console or
  page errors.
- The free board accepted four people total and rejected a fifth with a clear
  limit message.
- Malformed ICS input produced `No calendar events were found in that ICS file.`
- A live encrypted demo snapshot produced a 2,014-character `WB1.` ciphertext
  with no sample names, rendered a QR, rejected a wrong passphrase, and restored
  the original sample board after confirmation.
- Print media showed seven columns, hid site chrome, and had no horizontal
  overflow. Evidence: `evidence/live-print-view.png`.
- The 390 px layout intentionally showed one day, had no horizontal overflow,
  implemented Left/Right/Home/End tab behavior, and retained all content at
  200% text size.
- All discovered HTTP links resolved: first-party pages returned 200, the
  checkout returned 303, Sociobot returned 200, and mail/fragment links were
  valid non-HTTP targets.
- No sign-in exists, so the Microsoft Entra authority requirement is not
  applicable.

## Accessibility and browser behavior

- `/opt/fleet/lib/verify-url.sh` passed: HTTPS 200, title, `lang="en"`, one h1,
  main landmark, complete image alts/button names, and zero normal-load console
  or page errors. Evidence: `evidence/verify-url/verify.json`.
- Independent axe scans found zero serious/critical findings on home, demo,
  Privacy, Terms, supporter dialog, and the 404 at desktop and 390 px, plus the
  system dark treatment.
- The skip link showed a 3 px cyan outline and moved focus to `main`. Event
  dialog Escape returned focus to its trigger. No visible mobile interactive
  target was below 44×44 px.
- With reduced motion, dialog transition duration computed to `0.00001s`.
- Dark system mode rendered the intended `rgb(17, 26, 34)` background.

## PWA, privacy, policies, and rate limiting

- Chromium reported zero manifest errors. The manifest has a versioned start
  URL, standalone display, matching theme/background colours, and 192/512 plus
  maskable icons.
- The live demo was controlled by cache `weekboard-shell-bd5679470c6fb1ad` and
  reloaded offline with sample plans plus the `OFFLINE` strip.
- An independent dynamic-worker simulation installed a changed production
  worker, showed `A fresh Weekboard is ready`, reloaded, and removed the old
  cache. Evidence: `evidence/pwa-update-check.mjs`.
- Free and demo flows made only same-origin requests. Source inspection found no
  analytics, tracker, beacon, WebSocket, CDN script/font, or schedule upload.
  Invalid live licenses remained locked and the verifier returned
  `{valid:false, reason:"invalid"}` with `Cache-Control: no-store`.
- HTTP redirects to HTTPS. Root responses include HSTS, restrictive CSP, frame
  denial, `nosniff`, Permissions-Policy, and strict-origin referrer policy.
  Hashed assets are one-year immutable; manifest is no-cache; worker is
  no-store/must-revalidate. Unknown routes return the designed body with 404.
- A sequential 40-request burst to the production license verifier returned
  200 for requests 1–30. Request **31** was the first 429 and carried
  `Retry-After: 4`; requests 31–40 were all limited.

## Deployment identity and budgets

Nineteen served runtime/build files matched local `dist/` byte-for-byte. The
host-only `staticwebapp.config.json` is correctly consumed rather than exposed.
Representative SHA-256 values:

| File | SHA-256 |
| --- | --- |
| `index.html` | `1de98cb2385fc22b710995f6fb350019b06161c3fe80666ca8b581bcec805ef1` |
| `assets/main-Bs7ESc_5.js` | `435097428bc2cddfa90d3f14c20a033bced011217a5a3beba27fe544d5ee1152` |
| `assets/style-CPJKgGnq.css` | `aff15d20c6df3557e3b6125b5d968f38918b1bc4ae267aa691d48a3b8c99aacc` |
| `sw.js` | `149262821881bb519c1d9237124b965f0c4e0f39ebed45ad5ad1b2c93184e6b2` |

Production sizes remain within contract: JavaScript 70,488 B raw / 24.16 KB
gzip; CSS 16,988 B raw / 4.48 KB gzip; fonts 0 B; mobile hero 67,410 B; social
card 91,692 B at 1200×630.

Two Lighthouse 13.4.1 mobile simulated runs showed normal environment variance:

| Run | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Cold run | 87 | 100 | 100 | 100 | 1.1 s | 1.2 s | 510 ms | 0 |
| Immediate repeat | 100 | 100 | 100 | 100 | 1.1 s | 1.4 s | 60 ms | 0 |

The repeat meets the Lighthouse score gate and both LCP/CLS budgets; the cold
score variance should be watched. No field INP value was available. Raw reports
are `evidence/lighthouse-mobile.json` and
`evidence/lighthouse-mobile-repeat.json`.

## Disposition

**FAIL — do not promote.** Correct civil-day recurrence/default-duration logic,
preserve timed ICS `UNTIL` semantics, make the storage-failure action CSP-safe,
and complete the claim inventory with outcome tests (including exact price,
import, print, recurrence, responsive view, themes, and paid entitlements).
