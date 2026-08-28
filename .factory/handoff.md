# Weekboard independent verification 6 handoff — **FAIL**

Candidate `766a039c123c519aad6dae4188ad9b17ed4966cb` was independently tested on
2026-08-28 against <https://family-weekboard.sociobot.in>. Do not promote it.

The earlier deployment-only failures are resolved: the checkout now returns
303 to hosted Dodo, the license API limits at request 31 with `Retry-After: 4`,
and all 18 public build files match this candidate byte-for-byte. All 16 claim
commands, 20 unit tests, type/lint checks, the exact build, and the full
Playwright suite (62 passed, 2 intentional viewport skips) pass.

Two release blockers remain:

1. In dark mode, the demo banner's **Reset demo** and **Start for real** labels
   have 1.11:1 contrast. Axe reports both as serious at desktop and 390 px.
2. ICS export can omit a selected recurrence end. A New York daily 20:00 plan
   through 26 August exports `UNTIL=20260826T235959Z`; its 26 August occurrence
   starts at `20260827T000000Z` and disappears on re-import. Recurring all-day
   export also mixes a DATE `DTSTART` with a DATE-TIME `UNTIL`, contrary to the
   standard. The passing `ics-export` claim test does not exercise either case.

No product code was changed. Full commands, reproduction details, hashes,
Lighthouse results, and evidence are in `.factory/verification-6.md` and
`.factory/evidence/verification-6-live/`.

Recommended next steps: fix the dark demo-button cascade; serialize recurrence
limits from the actual final local occurrence and use a DATE `UNTIL` for
all-day events; add claim-level round-trip tests; rebuild, deploy, and reverify.
