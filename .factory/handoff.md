# Weekboard repair 6 handoff — PASS

## Outcome

The clean-checkout mobile end-to-end failure from review 5 is fixed. The app
correctly opens the current one-day phone agenda; the three affected tests now
select Monday before checking the weekday sample plan. They also assert that
the Monday tab becomes selected, so the regression proves the user-visible
mobile path rather than relying on the current date.

The full browser suite no longer writes screenshots into tracked historical
evidence. It uses Playwright's test-results directory, leaving a clean checkout
clean after verification.

## Revisions and deployment

- Last deployable product implementation: `e33dfe06b7e5940494ace3343a53f9c93fc641ac`.
- Repair/test candidate deployed and verified: `85f06c751fcda20dbe4a43a22097b1dad0f59509`.
- The repair changes test code only. The current 20 published files are
  byte-for-byte equal to the final `dist/` build, including
  `main-D6Zy94Yg.js`, CSS, worker, pages, icons, and assets.
- Static deployment completed on 2026-09-06 UTC. The HTTPS origin returns 200.

## Clean-checkout verification

Fresh clone: `/tmp/family-weekboard-repair6-final` at the repair candidate.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 91 packages |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm test` | PASS — 22 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — `dist/` produced |
| Every exact command in `.factory/claims.json` | PASS — all 19 individual claims |
| `npm run test:e2e` | PASS — 77 passed, 5 intentional viewport skips |

The 19 passing claims cover the isolated demo, offline reload, local privacy,
free core, calendar file import/export, encrypted copies, repeats, no-sync
copies, lanes, responsive agenda, printing, themes, installability, hosted
checkout, and license states.

## Live verification

- `/opt/fleet/lib/verify-url.sh` passed against the HTTPS home page: title,
  `lang`, one h1, main landmark, image alt text, named controls, and no normal
  load errors.
- Fresh 390×844 and 1440×900 contexts show **Plan your family week together**,
  the family audience, **Add plan**, and **Try it with sample data** before
  scrolling. The sample action explains that it opens a separate board.
- The live phone demo showed realistic groceries/meal preparation for the
  selected Sunday, its persistent sample banner, Reset demo, and Start for
  real. A real-only marker survived entering, mutating, resetting, and leaving
  the demo. The demo made no cross-origin request.
- A fresh worker-controlled live demo reloaded offline with its banner and
  OFFLINE status.
- Playwright Axe found zero serious or critical issues on home, demo, Privacy,
  Terms, and the designed 404 at desktop and phone sizes, plus dark-phone demo.
  The browser's expected failed-resource message for the deliberate HTTP 404
  is not counted as an application error.
- Route titles and HTTP statuses pass for `/`, `/demo/`, `/privacy/`, `/terms/`,
  and an unknown path (designed HTTP 404). The latter is intentional.
- Fresh mobile Lighthouse: performance 98, accessibility 100, best practices
  100, SEO 100; FCP 1.4 s, LCP 1.9 s, TBT 130 ms, CLS 0.
- The live licensing verifier returned 200 for requests 1–30 and 429 with
  `Retry-After: 4` for requests 31–40.

Evidence is under `/work/.evidence/family-weekboard-repair6-live/`. Required
catalog and billing metadata are at `/work/.evidence/catalog-description.txt`
and `/work/.evidence/billing-offer.json`.

## Earlier findings

Review 5's only high finding is closed by the full clean-checkout browser run.
All earlier review and verification findings remain covered by the existing
claims and regressions: calendar DST/recurrence integrity, storage recovery,
mobile targets and keyboard tabs, route metadata/focus/404, demo isolation,
local privacy, PWA updates, hosted checkout, license verification, and
calendar-file colour notes.

## Known gaps and next steps

No release-blocking gap remains. Weekboard intentionally does not provide live
sync; file and QR transfers are copies. Continue to run the full E2E suite on
the day of release because the phone agenda intentionally opens the current
day.
