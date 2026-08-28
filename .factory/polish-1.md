# Weekboard polish 1 — repair evidence

Candidate repaired from `772cdae24fc996d47ee840dbbf582d68769a21ad` using
adversarial review `3c0edcda51177c9973bdd3e4672e822333582464`.

Local visual evidence: `.factory/evidence/polish-1/demo-390.png` and
`.factory/evidence/polish-1/demo-1440.png`. The first shows the direct
`?demo=1` sample board, persistent banner, 45 px actions, and one-day phone
agenda. Browser verification was run against the production build at
`http://127.0.0.1:4173/?demo=1`; the deployment check is recorded in the final
handoff after the release URL is updated.

| Finding | Repair | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the required Sociobot checkout link, made its claim require three cold 303 redirects, and keep an offline visitor in context with a reconnect-and-retry message. Merchant/refund causal promises were removed. | `@claim:paid-checkout`; `@regression:checkout-offline-feedback` |
| F-1-2 | All buttons, form controls, close controls, and prose links now reserve 45 px targets; legal links have their own target box. | `@regression:mobile-dialog-targets`; screenshot `demo-390.png` |
| F-1-3 | README now says offline use starts after the first visit. | `@claim:offline-reload`; README copy audit |
| F-1-4 | Added the `free-core` claim and an unlicensed add/print/ICS/encrypted-export test. Price copy names only those free operations. | `@claim:free-core`; `.factory/claims.json` |
| F-1-5 | Reduced the no-feature wording to the tested account/privacy boundary in product and README copy. | `@claim:local-privacy` |
| F-1-6 | Replaced named third-party calendar compatibility with “standard ICS calendar file.” | `@claim:ics-export`; `@claim:ics-import` |
| F-1-7 | Removed unprovable merchant-of-record and refund-revokes-license promises; hosted checkout owns its policy details. | `@claim:paid-checkout`; `@claim:license-revocation` |
| F-1-8 | Added shared heading focus and polite route announcement for documents, including back/forward restoration. | `@regression:document-routes` |
| F-1-9 | Added `/demo/` to `sitemap.xml`. | `tests/unit/pwa-build.test.ts`; route metadata regression |
| F-1-10 | Split the README opening into short plain-language sentences. | `.factory/copy-audit.md` |
| F-1-11 | Replaced unexplained ICS/UTC/RRULE feature jargon with plain calendar-file language. | `.factory/copy-audit.md`; ICS claims |
| F-1-12 | Replaced AES-GCM feature-list jargon with password-encrypted copy wording. | `.factory/copy-audit.md`; `@claim:encrypted-handoff` |
| F-1-13 | Replaced “PWA” visitor copy with install/offline language. | `.factory/copy-audit.md`; `@claim:installable-pwa` |
| F-1-14 | Replaced IndexedDB visitor copy with “this browser”; technical implementation remains in the README developer section. | `@claim:local-privacy` |
| F-1-15 | Standardized person color and copy terminology throughout controls, dialogs, README, errors, and audit. | `@claim:person-lanes`; `.factory/copy-audit.md` |
| F-1-16 | Split generated-art provenance from interface-mark provenance. | About dialog; `.factory/copy-audit.md` |
| F-1-17 | Renamed empty-state heading to “No plans this week.” | screenshot `demo-390.png` |
| F-1-18 | Renamed supporter heading to “Add options for a bigger household.” | `@claim:paid-checkout` |
| F-1-19 | Renamed About heading to “How Weekboard stores your schedule.” | route/dialog accessibility suite |
| F-1-20 | Replaced unclear console labels with EMPTY BOARD, THREE STEPS, PEOPLE, and SHARE A COPY. | screenshot `demo-390.png` |
| F-1-21 | Renamed Move / share to Share or export board. | all transfer claim tests |
| F-1-22 | Renamed This week to Show this week. | browser suite |
| F-1-23 | Renamed People to Edit people. | `@claim:supporter-entitlements` |
| F-1-24 | Renamed Print to Print week. | `@claim:print-board` |
| F-1-25 | Renamed About to Read about Weekboard. | mobile target regression |
| F-1-26 | Renamed Delete to Delete plan. | event editor regression suite |
| F-1-27 | Renamed Done to Close people settings. | mobile target regression |
| F-1-28 | Renamed Supporter ✓ to Manage supporter pack. | `@claim:supporter-entitlements` |
| F-1-29 | Added `brief.summary` and the verb-first catalog description. | `.factory/catalog-description.txt` |

## Additional required work

- `?demo=1` now loads the demo-only IndexedDB namespace directly. The primary
  sample action uses that URL; the persistent banner can reset it or discard it
  before returning to the real board.
- The query demo route updates its title, canonical, and social title at load.
- Full browser validation covers responsive layout, PWA offline reload, no
  cross-origin demo traffic, metadata, real static routes, focus, dialogs, and
  all historical calendar/licensing regressions.
