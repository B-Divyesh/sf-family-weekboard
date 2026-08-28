# Weekboard polish 1 handoff — PASS locally

Repair commit: `189b515467e8ca45d69eac5ec2476bfdd06a5db9`. Base reviewed:
`772cdae24fc996d47ee840dbbf582d68769a21ad`.
Adversarial findings source: `3c0edcda51177c9973bdd3e4672e822333582464`.

## Delivered

- Added an isolated one-click `/?demo=1` path. It uses only
  `demo:weekboard-local-v1`, seeds the realistic Patel sample, keeps the demo
  banner visible, resets safely, and discards demo changes on Start for real.
- Repaired every F-1-1 through F-1-29 item; the exact finding map is in
  `.factory/polish-1.md`.
- Added the required claims inventory coverage for free core operations and
  made the checkout claim require three cold hosted redirects. The product
  displays a reconnect-and-retry message instead of leaving an offline buyer on
  a dead checkout path.
- Rewrote first-screen, dialog, README, legal, and catalog copy in plain,
  consistent terms without altering the pixel-console visual system.
- Made all inspected dialog/prose-link controls 45 px targets; added tests for
  every mobile dialog control. Added focus plus polite title announcement on
  document routes and browser history restoration.
- Added demo discovery to the sitemap and direct-demo metadata updates.

## Exact verification evidence

- `npm ci` — pass; 91 packages, 0 vulnerabilities.
- `npm run typecheck` and `npm run lint` — pass.
- `npm test` — pass: 22 tests.
- `npm run build` — pass; `dist/index.html` exists. Main JavaScript is
  71,459 bytes raw / 24.24 kB gzip; initial JS stays below the 200 kB budget.
- Every exact command in `.factory/claims.json` was invoked separately from a
  fresh browser context — 17/17 pass. The paid checkout test made three cold
  requests, each a 303 to the hosted Dodo checkout.
- `npm run test:e2e` — pass: 70 passed, 4 expected project-specific skips.
  This includes demo isolation, offline reload, no cross-origin demo traffic,
  real-board persistence, all historical date/ICS/license regressions,
  390 px layout, route metadata, focus restoration, dialog targets, and
  checkout offline feedback.
- Playwright Axe scans are clean for home, demo, Privacy, Terms, and 404 in
  desktop/mobile suite runs; no serious or critical violations. The local
  smoke check at `/?demo=1` reported title `Demo — Weekboard`, `lang=en`, one
  main, one h1, no missing image alt text, and no console errors.
- Lighthouse mobile against the production build demo route: performance 96,
  accessibility 100. Report: `/tmp/weekboard-lighthouse.json`.
- Fresh visual evidence: `.factory/evidence/polish-1/demo-390.png` and
  `.factory/evidence/polish-1/demo-1440.png`.

## Run and deploy

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Deploy the generated `dist/` directory using the static work-order pipeline.
`staticwebapp.config.json` retains the real 404 rewrite/status policy and
hashed-asset caching policy.

## Deployment and cold live verification

- Deployed with `/opt/fleet/lib/deploy-static.sh family-weekboard dist` to the
  configured Static Web App. Deployment id:
  `becc7d84-6911-48ba-8ec4-bbe2e3dcd25e`.
- `https://family-weekboard.sociobot.in/?demo=1` cold check: HTTP 200; 870 ms
  load; title `Demo — Weekboard`; `lang=en`; one h1/main; no missing alt or
  unlabeled buttons; zero console errors. Evidence:
  `.factory/evidence/polish-1-live/verify.json` and its screenshots.
- Live route sweep: `/`, `/demo/`, `/privacy/`, `/terms/` = 200; unknown route
  = 404. Live demo reset preserved the shipped sample. Privacy navigation
  focused its h1 and announced `Privacy — Weekboard`. Axe reported no serious
  or critical issue on live demo, Privacy, Terms, or 404.

## Known gaps

None.
