# Independent product verification 6 — **FAIL**

Verified on **2026-08-28 UTC** from a clean checkout of candidate
`766a039c123c519aad6dae4188ad9b17ed4966cb` (`main`) against
<https://family-weekboard.sociobot.in>.

- Work order: `family-weekboard-verify-6`
- Environment: Node `v22.23.2`, npm `10.9.8`, Playwright `1.58.2`, Chromium
  `145.0.7632.6`, Lighthouse `13.4.1`
- Build shown by the product: `1.0.0-r4`
- Overall result: **FAIL — do not promote**

The earlier deployment-only failures are fixed in fresh evidence. The
production checkout redirects to the hosted Dodo checkout, and the production
license verifier starts rate limiting at request 31 with `Retry-After: 4`.
The live deployment is byte-identical to this candidate's public build output.

Release acceptance still fails two product-contract gates. The required demo
has two serious WCAG contrast failures in dark mode, and standard ICS handoff
can silently lose the final occurrence of a recurring plan. The latter also
means the passing `ics-export` claim test does not prove the full claim it is
attached to.

## Mandatory gates run first

### Claims gate — commands PASS; claimed ICS outcome FAILS independently

`.factory/claims.json` was present in the initially clean checkout. After the
lockfile install, every exact command in the manifest was run separately,
before source inspection or broader QA. All 16 commands passed:

| Claim ID | Result |
| --- | --- |
| `demo-sandbox` | PASS — 1 test |
| `offline-reload` | PASS — 1 test |
| `local-privacy` | PASS — 1 test |
| `ics-export` | PASS as written — 1 test |
| `ics-import` | PASS — 1 test |
| `encrypted-handoff` | PASS — 1 test |
| `calendar-options` | PASS — 1 test |
| `person-lanes` | PASS — 1 test |
| `responsive-agenda` | PASS — 1 test |
| `print-board` | PASS — 1 test |
| `themes` | PASS — 1 test |
| `installable-pwa` | PASS — 1 test |
| `paid-checkout` | PASS — 1 test |
| `license-restore` | PASS — 1 test |
| `supporter-entitlements` | PASS — 1 test |
| `license-revocation` | PASS — 1 test |

Each manifest ID occurs exactly once as an `@claim:<id>` test tag, with no
unmatched claim tags. The landing page and README capability statements map to
the inventory. However, `@claim:ics-export` only checks that UTC fields and
RRULE strings exist. It does not check that the exported recurrence preserves
the user's selected occurrences. The independent live round trip below proves
that this advertised outcome is false for a normal timezone boundary case.

### Cold first-read and one-click demo — PASS

A fresh profile at 1440×900 loaded the live root with no stored state. The
first screen answers the required questions in plain words:

- **What:** “Plan your family week together.”
- **For whom:** families using phones, computers, and paper who need one shared
  weekly view without a new account.
- **First action:** “Try it with sample data,” immediately followed by “Opens
  a separate sample board.”

The same viewport shows the three facts about offline use, on-device storage,
and free core planning/export. One click opens `/demo/`, titled “Demo —
Weekboard,” with Asha, Ravi, Kids, and four realistic plans already visible.
The persistent banner says “Demo — sample data, nothing is saved” and includes
**Reset demo** and **Start for real**. The real and demo IndexedDB namespaces
remain separate.

Evidence: `evidence/verification-6-live/screenshot-desktop.png`,
`screenshot-mobile.png`, and `mobile-demo.png`.

## Release-blocking defects

### High — dark-mode demo actions have 1.11:1 text contrast

In a fresh browser with `prefers-color-scheme: dark`, open `/demo/`. Both
mandatory demo-banner actions—**Reset demo** and **Start for real**—render dark
text `#111a22` on dark background `#18242e`. Axe reports two `color-contrast`
violations with impact **serious** on desktop and again at 390 px:

```text
contrast ratio: 1.11:1
required for 14 px bold text: 4.5:1
```

The button labels are visibly difficult to read. This violates the supplied
accessibility and design contracts, which require both themes to meet 4.5:1
and require all serious/critical axe findings to be fixed. The default light
theme and other scanned routes have no axe violations.

Evidence: `evidence/verification-6-live/dark-contrast.png`.

### High — recurring ICS export loses a selected final occurrence

Fresh live reproduction in `America/New_York`, with the clock fixed to
24 August 2026:

1. Add `Late medicine`, 20:00–20:30, repeating daily through 26 August.
2. Weekboard correctly shows it on 24, 25, and 26 August.
3. Export ICS. The event contains:

   ```ics
   DTSTART:20260825T000000Z
   DTEND:20260825T003000Z
   RRULE:FREQ=DAILY;UNTIL=20260826T235959Z
   ```

4. Import that exported file into a fresh Weekboard in the same timezone.

Only 24 and 25 August appear. The selected 26 August occurrence would start at
`20260827T000000Z`, one second after the emitted UTC `UNTIL`, so it is silently
excluded. This is a loss of a household commitment through the brief's central
ICS handoff workflow.

The all-day variant is also not standard-conformant: live export emits
`DTSTART;VALUE=DATE:20260824` with a date-time
`UNTIL=20260826T235959Z`. RFC 5545 requires `UNTIL` to use the same value type
as `DTSTART`. The implementation therefore does not satisfy the declared
“standard ICS ... with supported recurrence rules” claim for these cases.

The `ics-export` claim test asserts only the presence of one UTC `DTSTART`,
RRULE text, and four sample VEVENTs. It does not validate recurrence semantics
or round-trip the result, so its green result masks this failure.

Evidence: `evidence/verification-6-live/ics-roundtrip-loses-until-day.png`.

## Clean-checkout repository gates

The initial `git status --short` was empty and HEAD was exactly the requested
candidate before `npm ci`. No product source was modified.

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 91 packages; 0 vulnerabilities |
| every command in `.factory/claims.json` | PASS — 16/16 separately |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm test` | PASS — 4 files, 20 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (the script is `tsc --noEmit`) |
| `npm run build` | PASS — exact Vite production build emitted `dist/` |
| `npm run test:e2e` | PASS — 62 passed, 2 intentional viewport skips |
| `/opt/fleet/lib/verify-url.sh <url> <evidence-dir>` | PASS |

The two Playwright skips are paired viewport cases: the mobile agenda/legal
checks skip under desktop and run successfully in the mobile project.

## Independent end-to-end coverage

Against fresh live browser profiles, independent flows covered:

- invalid end-before-start rejection and correction;
- create, refresh persistence, edit, cancelled delete, and confirmed delete;
- the free four-person boundary and clear fifth-person recovery message;
- malformed ICS rejection followed by successful valid ICS import;
- short handoff passphrase rejection, AES-GCM QR generation, wrong-passphrase
  recovery, and preservation of the receiving board;
- demo reset/exit isolation, recurring/all-day options, seven-day print,
  explicit snapshot-not-sync wording, and theme persistence;
- the live hosted checkout. It reached `checkout.dodopayments.com`, showed
  “Weekboard Supporter Pack,” and displayed `$5.23` in its USD locale. No
  purchase was submitted.

The manual free/demo flow made zero off-origin requests and raised no console
or page errors. All discovered HTTP links resolved: first-party pages and
Sociobot returned 200, checkout returned 303, and the unknown route returned
the designed HTTP 404. The `mailto:` privacy contact and in-page fragments were
treated as non-HTTP links.

## Accessibility and responsive behavior

- The live URL verifier found a title, `lang="en"`, one h1, a main landmark,
  complete image alt/button names, and zero normal-load console/page errors.
- Axe found zero violations on `/`, `/demo/`, `/privacy/`, `/terms/`, and the
  real 404 at desktop and 390 px in the light treatment. The dark demo failure
  is reported above.
- Keyboard-only Tab reveals a skip link with a 3 px cyan focus outline and
  Enter moves focus to `main`. Escape closes a modal and returns focus to its
  trigger.
- At 390×844 the board shows one selected day, Right Arrow selects and focuses
  the next day, no visible target is below 44×44 px, and the document has no
  horizontal overflow. Setting root text to 200% also produced no horizontal
  overflow.
- Under reduced motion, dialog transition duration computes to `0.00001s`.

## PWA, privacy, security, and rate limiting

- The live worker controls `/demo/` with cache
  `weekboard-shell-f5e873601a414ff9`; after network disable, the demo reloads
  with its sample plans and OFFLINE status intact.
- The independent update simulation installed changed worker bytes, showed
  “A fresh Weekboard is ready,” reloaded, and removed the old cache.
- Board data uses IndexedDB. Free/demo use made no cross-origin request. Source
  inspection found no analytics, tracking, CDN font/script, WebSocket, or
  schedule upload. License verification is the only runtime API request.
- HTTP redirects to HTTPS. Live responses include HSTS, CSP, frame denial,
  `nosniff`, strict referrer policy, and restrictive Permissions-Policy.
  Hashed assets are one-year immutable; the worker is no-store/no-cache and the
  manifest is no-cache. Unknown routes return the designed page with HTTP 404.
- The production license verifier returned a normal invalid verdict with
  `Cache-Control: no-store`. In a fresh sequential 40-request burst completed
  in 621 ms, requests 1–30 returned 200; request **31** was the first 429 and
  carried `Retry-After: 4`; requests 31–40 were all limited.
- The application has no sign-in flow, so the Microsoft Entra tenant check is
  not applicable.

## Deployment identity and performance

All 18 public release files matched local `dist/` byte-for-byte. The host-only
`staticwebapp.config.json` correctly returns 404 because Azure consumes it as
deployment configuration. Representative SHA-256 values:

| File | SHA-256 |
| --- | --- |
| `index.html` | `699791219dc35b387a91431bb3a4a0cc616ed69f9d0a4ea8bcb90c1c3ee5ccde` |
| `assets/main-D-enI-h2.js` | `4af9d601cde541f82e7d0561bfca3c99ad22066519f23fb530cfa19b9aced498` |
| `assets/style-CPJKgGnq.css` | `aff15d20c6df3557e3b6125b5d968f38918b1bc4ae267aa691d48a3b8c99aacc` |
| `sw.js` | `dff03eb3e77e6479d34063b8b803f2f0b8f6b3b39667449282e198c9cccb7d65` |

| Budget item | Measured | Result |
| --- | ---: | --- |
| Initial JavaScript | 71,173 B raw / 24,028 B gzip | PASS (≤200 KB) |
| CSS | 16,988 B raw / 4,500 B gzip | PASS (≤50 KB) |
| Fonts | 0 B | PASS (≤120 KB) |
| Mobile hero | 67,410 B | PASS (≤300 KB) |

A completed live Lighthouse mobile run scored performance **100**,
accessibility **100**, best practices **100**, and SEO **100**; FCP 1.1 s, LCP
1.1 s, TBT 60 ms, CLS 0, and Speed Index 1.1 s. Lighthouse does not provide a
field INP value for this new deployment.

Raw evidence is under `.factory/evidence/verification-6-live/`.

## Disposition

**FAIL — do not promote candidate `766a039c123c519aad6dae4188ad9b17ed4966cb`.**
Fix dark-demo button contrast in both responsive layouts, correct ICS
recurrence end serialization (including all-day value types), add regression
coverage that round-trips boundary occurrences, redeploy, and reverify.
