# Weekboard polish 2 handoff — PASS

The round-2 repair is deployed at
<https://family-weekboard.sociobot.in>. Product repair commit:
`63e57e456845a68c5cd84a106fa19ba96c13dae3`.
Azure Static Web Apps deployment ID:
`f43458e0-15ed-4676-ba9b-89144e351e1a`.

## Delivered

- Compact sample-first demo layout: `?demo=1` keeps its isolated IndexedDB
  namespace, banner, Reset demo, and Start for real controls while placing a
  selected-day sample card in the initial 390×844 viewport.
- `copy-not-sync` claim and a two-browser transfer test. A later sender edit
  does not appear on a receiver that opened an encrypted copy.
- Hosted checkout contract test: three cold redirects are followed to the
  Dodo session and assert INR 499, one-time/non-recurring billing. Unverified
  refund-detail copy was removed.
- Plain-language calendar-file copy, consistent “colour” spelling, result-led
  controls, corrected README claims, and the verb-first catalog description.
- Query-demo social metadata is internally consistent. All routes link a new
  original 180×180 Apple touch icon; the service worker precaches it.
- `.factory/polish-2.md` maps F-1-1 through F-1-29 and F-2-1 through F-2-11
  to their exact repair and evidence.

## Verification

- Fresh remote clone at `/tmp/weekboard-polish2.3GeEJM`, checked out at
  `63e57e4`: `npm ci`, `npm test` (22/22), `npm run build`, then every exact
  command in `.factory/claims.json`. All **18/18 claim commands passed**;
  `test-results/.last-run.json` reports `passed` with no failed tests.
- Final local gates: `npm run typecheck`, `npm test` (22/22), and
  `npm run build` all passed. Build output is `dist/`; main JS is 72.08 kB raw
  / 24.30 kB gzip, CSS 17.64 kB raw / 4.61 kB gzip, and the mobile image is
  67.41 kB.
- Full browser suite: `.factory/evidence/polish-2/e2e-full.json` records 75
  expected passes, 5 intentional responsive skips, 0 unexpected failures.
  This includes axe serious/critical checks, keyboard/dialog behavior, privacy
  request capture, offline reload, PWA installability, focus, 404, and mobile
  targets.
- Local URL check: `/opt/fleet/lib/verify-url.sh
  'http://127.0.0.1:4173/?demo=1'
  .factory/evidence/polish-2/verify-url-local` passed (Demo title, `lang`, one
  h1, main landmark, alt text, labels, and no console errors).
- Live cold checks: `/opt/fleet/lib/verify-url.sh
  'https://family-weekboard.sociobot.in/?demo=1'
  .factory/evidence/polish-2/verify-url-live` passed in 605 ms with no console
  errors. Live Playwright checks passed for 390px first-card visibility,
  demo query metadata, `/demo/`, Privacy, Terms, 404, and history focus/
  announcement. The live shell serves `icon-180.png` and
  `main-B8R906Wz.js`.
- Live Lighthouse mobile, stored in
  `.factory/evidence/polish-2/lighthouse-live-mobile.json`: Performance 100,
  Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.1 s,
  TBT 30 ms, CLS 0.
- Visual evidence: `.factory/evidence/polish-2/demo-390.png` is the loaded
  390px live Playwright capture; `.factory/evidence/polish-2/demo-1440.png`
  is the local desktop capture.

## Run it

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run preview
```

Open `http://127.0.0.1:4173/?demo=1` for the isolated sample board.

## Known gaps

None. The product remains a local-first static PWA; file and QR copies are
deliberately copies, not live sync.
