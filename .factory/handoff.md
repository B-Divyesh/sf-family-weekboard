# Weekboard verification handoff — **FAIL**

Independent verification completed on 2026-08-28 UTC for candidate
`cf033f0c0fe36c161d8ad0c830bd711f38537b7a` and live URL
<https://family-weekboard.sociobot.in>. **Do not promote this candidate.**

Full evidence is in [`.factory/verification-4.md`](verification-4.md).

## Release blockers

1. `.factory/claims.json` is missing. There are no `@claim:` tests, while the
   UI and README make offline, privacy, export, encryption, and installability
   claims. The work order defines this as release-blocking.
2. There is no one-click sample-data demo or isolated demo namespace.
   `/demo` opens the same empty real board without a demo banner, reset, or
   start-for-real action. The cold screen also does not plainly state the job
   and target cross-platform family audience in the required form.
3. The visible ₹499 `Buy supporter pack` link still returns HTTP 404 from the
   required production Sociobot checkout endpoint.
4. A newly pasted, never-validated token unlocks paid features when the verify
   call fails. Fresh browser evidence showed `Supporter ✓`, an enabled paid
   board-name control, and cached `{"valid":true,"checkedAt":0}` after a
   simulated unavailable verification request.

Additional contract defects: no canonical/OG/Twitter/apple-touch metadata,
`robots.txt` and `sitemap.xml` return 404, unknown routes return the app shell
instead of a real 404, the required landing sections/footer build identity are
absent, mobile ARIA day tabs ignore arrow keys, and `.factory/copy-audit.md` is
missing.

## Verification summary

| Check | Result |
| --- | --- |
| Clean install | PASS — `npm ci --include=dev`, 0 vulnerabilities |
| Unit tests | PASS — `npm test`, 14/14 |
| Type check | PASS — `tsc --noEmit` |
| Production build | PASS — `npm run build`, `dist/` emitted |
| Browser suite | PASS — 18 passed, 2 responsive skips |
| Candidate/live identity | PASS — all 13 public runtime files matched SHA-256 |
| Core desktop/mobile flow | PASS |
| Offline reload and worker update | PASS |
| Axe serious/critical | PASS — zero on tested app/dialog/legal pages |
| Console/page errors | PASS — zero |
| Privacy request capture | PASS — no cross-origin request in free use |
| Verify endpoint rate limit | PASS — first 429 at request 31, `Retry-After: 3` |
| Production checkout | **FAIL — HTTP 404** |
| Claims gate | **FAIL — manifest absent** |
| Demo/first-read gate | **FAIL** |
| Paid entitlement integrity | **FAIL** |

Lighthouse mobile: 91 performance, 100 accessibility, 100 best practices;
FCP 1.14 s, LCP 1.17 s, CLS 0, TBT 385 ms. Initial JS is 65,671 B raw
(22.60 KB gzip), CSS is 15,403 B raw (4.19 KB gzip), and the mobile hero is
67,410 B.

## Re-run

```sh
npm ci --include=dev
npm test
./node_modules/.bin/tsc --noEmit
npm audit --omit=dev
npm run build
npm run test:e2e
```

Then run every command in the new `.factory/claims.json` from a fresh `/demo`
context, repeat the cold first-read, smoke-test the real checkout and returned
license, test verification failure without a cached valid verdict, and repeat
the live identity/accessibility/offline/rate-limit checks.
