# Weekboard polish 2 — complete repair map

Repair target: `bbb3d67b74093251420dbfde619c835e49a66c4b`. Source reviews:
`.factory/review-1.md` and `.factory/review-2.md`. Local screenshots are
`.factory/evidence/polish-2/demo-390.png` and
`.factory/evidence/polish-2/demo-1440.png`; live checks are recorded in the
handoff after deployment.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Checkout remains a Sociobot link and its claim now repeats the redirect and inspects Dodo’s authoritative INR 499, one-time session fields. | `@claim:paid-checkout`; live checkout redirect/session check |
| F-1-2 | Every visible dialog and legal-page control remains at least 44px. | `@regression:mobile-dialog-targets`; `demo-390.png` |
| F-1-3 | README says offline use starts after the first visit. | `@claim:offline-reload` |
| F-1-4 | The free-core claim names and exercises adding, printing, calendar export, and encrypted copy export without a license. | `@claim:free-core` |
| F-1-5 | The no-sync boundary now has a dedicated claim and two-context test. | `@claim:copy-not-sync` |
| F-1-6 | Visitor copy says standard calendar file rather than named third-party compatibility. | `@claim:ics-export`; `@claim:ics-import` |
| F-1-7 | Removed the unprovable refund-detail promise; price and recurrence are verified against the hosted session. | `@claim:paid-checkout` |
| F-1-8 | Document routes focus and announce their h1, including browser back. | `@regression:document-routes` |
| F-1-9 | The sitemap includes `/demo/`. | `tests/unit/pwa-build.test.ts` |
| F-1-10 | README opening is split into plain short sentences. | `.factory/copy-audit.md` |
| F-1-11 | README introduces calendar files before technical details. | `.factory/copy-audit.md` |
| F-1-12 | README uses password-encrypted copy wording. | `@claim:encrypted-handoff` |
| F-1-13 | README says install and offline use, not PWA jargon. | `@claim:installable-pwa` |
| F-1-14 | About copy says “this browser”, leaving IndexedDB to technical documentation. | `@claim:local-privacy` |
| F-1-15 | Visitor terminology is person’s colour and copy. | `.factory/copy-audit.md`; `@claim:person-lanes` |
| F-1-16 | Artwork and interface-mark provenance are separate sentences. | `.factory/copy-audit.md` |
| F-1-17 | Empty heading is “No plans this week.” | browser accessibility suite |
| F-1-18 | Supporter heading names the larger-household result. | `@claim:paid-checkout` |
| F-1-19 | About heading names schedule storage. | browser accessibility suite |
| F-1-20 | Console section labels are plain-language labels. | `demo-390.png` |
| F-1-21 | Transfer action says “Share or export board.” | transfer claim tests |
| F-1-22 | Week reset says “Show this week.” | browser suite |
| F-1-23 | People action says “Edit people.” | `@claim:supporter-entitlements` |
| F-1-24 | Print action says “Print week.” | `@claim:print-board` |
| F-1-25 | About action says “Read about Weekboard.” | mobile target regression |
| F-1-26 | Destructive action says “Delete plan.” | event-editor regression suite |
| F-1-27 | People closer says “Close people settings.” | mobile target regression |
| F-1-28 | Unlocked header says “Manage supporter pack.” | `@claim:supporter-entitlements` |
| F-1-29 | Catalog description is verb-first and under 120 characters. | `.factory/catalog-description.txt` |
| F-2-1 | Demo has a compact sample-board masthead, so an event intersects the initial 390×844 viewport. | `@regression:mobile-demo-shows-a-sample-plan-before-scrolling`; `demo-390.png` |
| F-2-2 | Added `copy-not-sync` to the inventory and tested a sender mutation after receiver import. | `@claim:copy-not-sync` |
| F-2-3 | Hosted session assertions verify one-time billing and INR 499; refund-detail copy was removed because it is not exposed as a testable product promise. | `@claim:paid-checkout` |
| F-2-4 | README now limits calendar-file wording to tested UTC daily and weekly repeats and removes interoperability language. | `@claim:ics-export`; `.factory/copy-audit.md` |
| F-2-5 | First mention says “standard calendar file (.ics)”; controls say import/export calendar file. | `@claim:ics-import`; `@claim:ics-export` |
| F-2-6 | All visitor-facing spelling uses “colour”. | `.factory/copy-audit.md`; `@claim:person-lanes` |
| F-2-7 | Controls now say See supporter pack, Discard changes, Reload Weekboard, and Close About. | browser accessibility suite |
| F-2-8 | “PLAN” and “What Weekboard includes” replace internal shorthand. | `.factory/copy-audit.md` |
| F-2-9 | Query-demo updates Open Graph description, Twitter description, and URL as well as title/canonical. | `@regression:route-metadata` |
| F-2-10 | Added and linked original 180×180 Apple touch icon; it is precached. | `@regression:apple-touch-icon-is-an-original-180px-asset`; `tests/unit/pwa-build.test.ts` |
| F-2-11 | Free fact names calendar export and password-protected copy before the supporter pitch. | `@claim:free-core`; `.factory/copy-audit.md` |

No review finding is deferred. The post-deploy live checks in the handoff cover
the home, query demo, `/demo/`, legal pages, 404, metadata, the checkout
redirect/session, focus, accessibility, and the phone demo screenshot.
