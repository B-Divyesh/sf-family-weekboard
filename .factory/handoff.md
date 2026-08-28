# Weekboard polish 3 handoff — complete

Weekboard is a local-first family weekly planner with an isolated sample board,
calendar-file exchange, encrypted copies, printing, and an optional one-time
supporter pack. This repair closes every finding in reviews 1–3.

## Delivered

- Fixed F-3-1: calendar exports now include readable `Weekboard person` and
  `Weekboard colour` notes. This is a deliberate note convention because
  standard ICS has no portable person-colour property.
- Added `ics-person-colour-notes` to `.factory/claims.json` and an observable
  clean-demo download test. The test checks all shipped sample people and their
  exact hexadecimal colours.
- Retained all previous first-screen, isolated `?demo=1`, banner/reset,
  routing, focus, legal, metadata, mobile, offline, privacy, and copy repairs.
  The round-3 audit map is `.factory/polish-3.md`.
- Updated the catalog sentence to the verb-first, 50-character “Plan a family
  week without a shared cloud account.”

## Exact verification

- Fresh clean clone: `/tmp/weekboard-polish3-clean.4ZrLde` at product commit
  `e33dfe06b7e5940494ace3343a53f9c93fc641ac`; `npm ci` passed with zero audit
  vulnerabilities.
- Every exact command in `.factory/claims.json` passed separately under
  `set -e`: **19/19** including `@claim:ics-person-colour-notes`. A static
  tag audit also confirmed every declared `@claim:<id>` occurs exactly once.
- `npm test` passed **22/22**. `npm run typecheck`, `npm run lint`, and
  `npm run build` passed. The build emitted `dist/` with a 72.11 kB raw /
  24.31 kB gzip main JS, 17.64 kB raw / 4.61 kB gzip CSS, and a 67.41 kB
  mobile hero image.
- `npm run test:e2e` passed **77** checks with **5 intentional responsive
  skips** and no unexpected failure. It covers keyboard/dialog behavior,
  Axe, phone layout, demo isolation, privacy requests, offline reload, PWA
  installation, claims, metadata, legal routes, focus, and 404 behavior.
- Local URL verification passed for `http://127.0.0.1:4173/?demo=1`; evidence:
  `.factory/evidence/polish-3/verify-url-local/`. Playwright Axe reported zero
  total violations at 390px. Local screenshots are
  `.factory/evidence/polish-3/demo-390.png` and `demo-1440.png`.
- Local mobile Lighthouse in
  `.factory/evidence/polish-3/lighthouse-local-mobile.json`: Performance **99**,
  Accessibility **100**, Best Practices **100**, SEO **100**; FCP 1.3 s,
  LCP 1.7 s, TBT 90 ms, CLS 0.

## Deployment and live verification

- Product repair commit: `e33dfe06b7e5940494ace3343a53f9c93fc641ac`.
- Azure Static Web Apps deployment: `009e1846-39bc-46b4-a607-d8fe8caea504`.
  It deployed `/work/repo/dist` to the existing `sf-family-weekboard` app.
- Cold live URL verification passed at
  `https://family-weekboard.sociobot.in/?demo=1`; evidence:
  `.factory/evidence/polish-3/verify-url-live/`. It found the Demo title,
  `lang`, one h1, main landmark, image alt text, named controls, and no console
  errors.
- A separate cold live browser check recorded
  `.factory/evidence/polish-3/live-checks.json`: the current
  `main-D6Zy94Yg.js` asset, two visible 390px sample cards, banner/reset/exit,
  all real routes and designed 404, canonical metadata, Privacy/Back focus and
  announcement, and a downloaded ICS file with all three person-colour notes.
  `live-demo-390.png` is the matching live screenshot. Live Playwright Axe
  reported zero serious or critical violations.

## Run locally

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run preview
```

Open `http://127.0.0.1:4173/?demo=1` for the isolated sample. The real board
uses `weekboard-local-v1`; the demo uses `demo:weekboard-local-v1`. Reset demo
only reseeds the demo database; Start for real discards it.

## Known gaps

None. File and QR exchange deliberately create copies rather than real-time
sync, which is a documented product boundary rather than a limitation left for
later.
