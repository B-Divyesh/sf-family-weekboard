# Weekboard polish 3 — complete repair map

Repair base: `b54c9aaf8604b700b675800510af8bfcb47958e2` with adversarial
review `5b12154aee8a52d36cb0f59c15f68873c21b362f`. Product repair commit:
`e33dfe06b7e5940494ace3343a53f9c93fc641ac`. Deployment:
`009e1846-39bc-46b4-a607-d8fe8caea504`.

All 19 declared claim commands passed from the fresh `file:///work/repo` clone
at `e33dfe0` under `set -e`. `npm test` passed 22 tests; typecheck, lint, and
build passed; and the full browser run passed 77 checks with 5 intentional
responsive skips. Shared visual evidence is
`.factory/evidence/polish-3/demo-390.png`,
`.factory/evidence/polish-3/demo-1440.png`, and
`.factory/evidence/polish-3/live-demo-390.png`. The cold live route, metadata,
focus, 404, and export checks are in
`.factory/evidence/polish-3/live-checks.json`; URL verification is in
`.factory/evidence/polish-3/verify-url-live/`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the hosted Sociobot checkout and narrowed purchase copy to the amount and one-time terms that the hosted session exposes. | `@claim:paid-checkout` passed three cold hosted-session checks; live shell check in `live-checks.json`. |
| F-1-2 | Kept all mobile controls, dialog controls, and legal links at least 44px. | `@regression:mobile-dialog-targets`; `live-demo-390.png`. |
| F-1-3 | Says offline use begins after the first visit. | `@claim:offline-reload`. |
| F-1-4 | Names the free core precisely: add plans, print, calendar export, and password-protected copy. | `@claim:free-core`. |
| F-1-5 | Keeps the account/privacy boundary and explicit no-sync boundary as separate, tested promises. | `@claim:local-privacy`; `@claim:copy-not-sync`. |
| F-1-6 | Uses “standard calendar file (.ics)” rather than named third-party compatibility. | `@claim:ics-export`; `@claim:ics-import`; copy audit. |
| F-1-7 | Removed merchant/refund causal promises not exposed by checkout; tests inspect INR 499 and non-recurring hosted-session facts. | `@claim:paid-checkout`. |
| F-1-8 | Legal documents move focus to their h1 and announce the destination, including browser Back. | `@regression:document-routes`; live `routeFocusAndHistory` check. |
| F-1-9 | Includes `/demo/` in the sitemap and precached static shell. | `tests/unit/pwa-build.test.ts`; live `/demo/` check. |
| F-1-10 | Split the README opening into short plain sentences. | `.factory/copy-audit.md`. |
| F-1-11 | Explains calendar files before the limited UTC-repeat detail. | `.factory/copy-audit.md`; `@claim:ics-export`. |
| F-1-12 | Uses “password-encrypted copy” in visitor copy. | `@claim:encrypted-handoff`; copy audit. |
| F-1-13 | Uses install/offline language rather than unexplained PWA jargon. | `@claim:installable-pwa`; copy audit. |
| F-1-14 | Says “this browser” in visitor copy; storage implementation stays technical documentation. | `@claim:local-privacy`; copy audit. |
| F-1-15 | Standardized plan, person’s colour, copy, calendar file, demo, and supporter pack. | Terminology table; `@claim:person-lanes`. |
| F-1-16 | Separates generated-art provenance from hand-authored interface-mark provenance. | `.factory/copy-audit.md`; About dialog browser test. |
| F-1-17 | Uses “No plans this week” for the empty-state heading. | Full browser suite; `demo-390.png`. |
| F-1-18 | Uses “Add room for a bigger household” for the supporter result. | Copy audit; `@claim:supporter-entitlements`. |
| F-1-19 | Uses “How Weekboard stores your schedule” for About. | Copy audit; dialog accessibility suite. |
| F-1-20 | Uses understandable console labels: Empty board, Three steps, People, and Share a copy. | `demo-390.png`; full browser suite. |
| F-1-21 | Replaced ambiguous transfer wording with “Share or export board.” | `@claim:encrypted-handoff`; `@claim:ics-export`. |
| F-1-22 | Uses the action “Show this week.” | Full browser suite. |
| F-1-23 | Uses “Edit people.” | `@claim:supporter-entitlements`. |
| F-1-24 | Uses “Print week.” | `@claim:print-board`. |
| F-1-25 | Uses “Read about Weekboard.” | `@regression:mobile-dialog-targets`. |
| F-1-26 | Uses “Delete plan.” | Event-editor regression suite. |
| F-1-27 | Uses “Close people settings.” | `@regression:mobile-dialog-targets`. |
| F-1-28 | Uses “Manage supporter pack” for the supporter-management action. | `@claim:supporter-entitlements`. |
| F-1-29 | Keeps the catalog description verb-first and below 120 characters. | `.factory/catalog-description.txt` (50 characters). |
| F-2-1 | Compacts the demo masthead so a selected-day plan is already in the 390×844 viewport. | `@regression:mobile-demo-shows-a-sample-plan-before-scrolling`; `live-demo-390.png`. |
| F-2-2 | Declares and tests that opened file/QR copies do not sync after later sender edits. | `@claim:copy-not-sync`. |
| F-2-3 | Verifies the hosted checkout session’s INR 499 and one-time/non-recurring fields. | `@claim:paid-checkout` passed clean-clone and live deployment retained the checkout link. |
| F-2-4 | Limits README export wording to tested daily/weekly UTC repeats. | `@claim:ics-export`; `.factory/copy-audit.md`. |
| F-2-5 | Explains “calendar file (.ics)” at first mention. | `@claim:ics-import`; copy audit. |
| F-2-6 | Uses “colour” consistently. | Terminology audit; `@claim:person-lanes`. |
| F-2-7 | Replaced generic controls with result-led labels. | Full browser accessibility suite. |
| F-2-8 | Replaced internal shorthand headings with plain headings. | Copy audit; `demo-390.png`. |
| F-2-9 | Query-demo updates title, canonical, Open Graph, Twitter description, and URL. | `@regression:route-metadata`; live Demo title/canonical check. |
| F-2-10 | Ships and precaches an original 180px Apple touch icon. | `@regression:apple-touch-icon-is-an-original-180px-asset`; `tests/unit/pwa-build.test.ts`. |
| F-2-11 | Names the free calendar and encrypted exports before the supporter pitch. | `@claim:free-core`; copy audit. |
| F-3-1 | Calendar event notes now write both `Weekboard person: <name>` and `Weekboard colour: <#hex>`, preserving the promise without pretending ICS has a portable colour field. | `@claim:ics-person-colour-notes`; unit ICS export assertion; live cold download checks Asha `#087d96`, Ravi `#b54b23`, and Kids `#397144` in `live-checks.json`. |

No review finding is deferred. The live route check confirmed `/`, `/?demo=1`,
`/demo/`, `/privacy/`, `/terms/`, and the designed 404; it also confirmed the
current `main-D6Zy94Yg.js` build, h1 focus/announcement on Privacy and Back,
and no browser console errors. Live Axe via Playwright reported zero serious or
critical violations.
