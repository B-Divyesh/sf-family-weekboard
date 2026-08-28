# Weekboard repair handoff

## Result: code and static-release repair complete; billing registration remains external

- Repair base: `b96404a75cad8c60ac301edf13ea7f7ccb063f3f`
- Repaired application commit: recorded after the final verification below
- Product: `family-weekboard` — Vite + TypeScript local-first PWA, static deploy
- Date: 2026-08-28 UTC
- Original independent evidence: [`.factory/verification.md`](verification.md)

## Repairs made

1. **Spring DST all-day integrity:** the editor now subtracts one local
   calendar day from an exclusive all-day end, rather than 86,400,000 ms. This
   preserves 2027-03-14 when it is reopened in `America/New_York`.
2. **Recurrence integrity and recovery:** repeat-until must be the start date
   or later; whitespace-only titles are rejected. IndexedDB schema v2 also
   repairs old inverted ranges to a one-occurrence range, making every
   previously stranded plan visible and editable. Imports and encrypted board
   replacement use the same recovery path.
3. **Mobile accessibility:** Privacy and Terms now retain the accessible
   `Weekboard home` link name on narrow screens. The brand, supporter button,
   footer links, and About button have at least 44 × 44 CSS-pixel targets.
4. **Reliable updates and caching:** application CSS, JS, and generated WebP
   assets now use Vite content hashes. The build generates `sw.js` from a
   template with a content-derived cache name and the exact emitted precache;
   any application build change therefore changes both the asset URL and the
   worker revision. Production source maps are no longer shipped.
5. **Response policy:** `staticwebapp.config.json` provides CSP, no framing,
   no sniffing, restrictive Permissions-Policy, strict referrer policy,
   immutable caching for content-hashed assets, and a no-cache worker rule.

## Exact regression coverage

- The Playwright suite creates and reopens a same-day all-day plan over the
  2027 `America/New_York` spring-forward boundary.
- It rejects an inverted daily recurrence before persistence and rejects a
  whitespace-only title.
- At 390 px it runs axe against both legal documents, checks their named home
  link, and measures all five formerly undersized targets.
- The offline PWA test reloads under `context.setOffline(true)` after worker
  control. A dedicated production-build test creates two isolated builds with
  an application-code change and proves the generated main-asset URL and
  service-worker cache revision both change.

## Verification evidence

All commands ran from a clean dependency install on Node 22:

| Command | Result |
| --- | --- |
| `npm ci --include=dev` | PASS — 91 packages, 0 vulnerabilities |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm test` | PASS — 4 files, 13 tests |
| `./node_modules/.bin/tsc --noEmit` | PASS |
| `npm run build` | PASS — `dist/` root contains `index.html` |
| `npm run test:e2e` | PASS — 14 passed, 2 expected desktop/mobile skips |

Production output is 65,671 bytes of JavaScript (22.60 KB gzip), 15,403 bytes
of CSS (4.19 KB gzip), 67,410-byte mobile WebP, and 116,422-byte desktop WebP.
All are inside the static/PWA budgets. The full desktop/mobile suite checks
keyboard dialog escape/focus return, skip-link semantics through axe scans,
390 px layout, offline reload, no console errors, dark/reduced-motion paths,
and the original normal scheduling/ICS/encrypted handoff flows.

## Billing finding and disposition

The client continues to use the required Sociobot endpoint
`https://api.sociobot.in/api/v1/products/family-weekboard/checkout` and the
required license verification API. A fresh production `GET` on 2026-08-28
still returned `404 {"error":"enabled factory product","status":404}`; the
public product listing also has no `family-weekboard` entry. Registering or
changing a paid product is billing infrastructure, explicitly outside this
repository's authority. No payment provider was embedded or substituted. The
factory billing owner must register the ₹499 one-time product with the return
URL `https://family-weekboard.sociobot.in/`, then smoke-test its hosted
checkout. Recheck this endpoint after registration before declaring the paid
path release-ready.

## Deploy and verify

```sh
npm ci --include=dev
npm test
./node_modules/.bin/tsc --noEmit
npm run build
npm run test:e2e
/opt/fleet/lib/deploy-static.sh family-weekboard dist
/opt/fleet/lib/verify-url.sh https://family-weekboard.sociobot.in /tmp/weekboard-live-evidence
```

After deployment, verify the response policies with `curl -I` for `/`,
`/assets/<hashed-file>`, and `/sw.js`; confirm the generated cache name in
`/sw.js`; then repeat the checkout smoke test above after the billing product
has been registered.
