# Independent product verification — FAIL

Verified on **2026-08-28 UTC**.

- Candidate: `8876e2334f0f984de8d0476fe780dd429d75cf2a`
- Live URL: <https://family-weekboard.sociobot.in>
- Work order: `family-weekboard-verify-1`
- Environment: Node `v22.23.2`, npm `10.9.8`, Chromium `145.0.7632.6`
- Overall result: **FAIL**

The deployment is present and byte-for-byte matches the candidate build. The
normal local-first workflow, encrypted handoff, ICS exchange, installability,
and offline reload work. Release acceptance nevertheless fails because the
live purchase link is broken, valid-looking recurrence input can create an
invisible/unrecoverable plan, all-day dates are corrupted across a daylight
saving boundary, and the legal pages have a serious mobile accessibility
violation.

## Defects

### High

1. **All-day plans corrupt their end date on a spring DST boundary.** In a
   Chromium context using `America/New_York`, with the clock at 2027-03-13, I
   created an all-day plan whose start and end fields were both 2027-03-14.
   IndexedDB stored a 23-hour interval, which is valid for that local civil
   day, but reopening the plan showed **Ends = 2027-03-13**. The editor subtracts
   a fixed 86,400,000 ms from the exclusive end, so saving an edit can move or
   invalidate the event. This violates the brief's explicit timezone-care
   requirement and can change a household commitment.

2. **An inverted recurrence range is accepted and makes the plan inaccessible.**
   A daily plan starting 2026-08-28 with “Repeat until” 2026-08-27 saves with
   “Plan added” and increments the persisted count, but has no occurrence on
   any week and therefore no UI through which it can be edited or deleted.
   There is no validation or recovery guidance.

3. **The production supporter purchase is unavailable.** The deployed button
   points to the required Sociobot endpoint, but a fresh GET to
   `https://api.sociobot.in/api/v1/products/family-weekboard/checkout` returned
   HTTP 404 and `{"error":"enabled factory product","status":404}`. A user
   cannot complete the advertised ₹499 one-time purchase. The verify endpoint
   itself returned HTTP 200 with the expected invalid verdict for a fake token.

### Medium

1. **The mobile Privacy and Terms pages each have an axe `serious` finding.**
   At 390 px, responsive CSS hides the text in the header brand link while its
   visible `W` is `aria-hidden`; neither legal-page link has the `aria-label`
   used on the application page. Axe reports `link-name` against `.brand` on
   both `/privacy/` and `/terms/`.

2. **Five visible mobile controls miss the 44×44 CSS-pixel target baseline.**
   Measured at 390 px: brand 34×34, Support Weekboard 159×40, Privacy 51×21,
   Terms 41×21, and About 41×37. Spacing prevents obvious overlap, but this does
   not meet the supplied accessibility contract.

3. **Application updates depend on a manual `sw.js` byte change.** The positive
   path works: changing the service-worker bytes installs a new worker, shows
   “A fresh Weekboard is ready,” and Reload succeeds. In a controlled release
   simulation where `assets/app.js` changed but `sw.js` did not, an installed
   client continued receiving the old app from `weekboard-shell-v2` after
   `registration.update()` and reload. Fixed asset names plus a hand-maintained
   cache revision can strand installed users on stale code.

4. **Browser hardening and deployment cache policy are incomplete.** HTTPS
   redirect, HSTS, `nosniff`, and `strict-origin-when-cross-origin` are present,
   but responses have no Content-Security-Policy, frame restriction
   (`frame-ancestors` or `X-Frame-Options`), or Permissions-Policy. All files,
   including static JS/CSS/images, use `public, must-revalidate, max-age=30`
   rather than hashed immutable assets; asset names are fixed. The manifest and
   source maps are served as `application/octet-stream`. Chromium still parsed
   the manifest and reported zero installability errors.

### Low

1. **Whitespace-only plan titles are accepted.** Entering three spaces passes
   native `required` validation, is trimmed to an empty title, persists, and
   renders an unnamed event card. The item remains editable, but the saved data
   and accessible name are poor.

No critical defects were found.

## Clean checkout and repository gates

Testing started from a detached, clean worktree at the candidate SHA.

| Command | Result |
| --- | --- |
| `npm ci --include=dev` | PASS — 91 packages; 0 vulnerabilities |
| `npm test` | PASS — 3 files, 12/12 tests |
| `./node_modules/.bin/tsc --noEmit` | PASS |
| `npm run build` | PASS — exact Vite 7.3.6 production build, `dist/` emitted |
| `npm run test:e2e` | PASS — 7 passed, 1 expected desktop-only project skip |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |

There is no lint script or separate integration-test command in `package.json`.
The supplied E2E suite builds and serves `dist/`, rather than exercising the
development server.

Production output:

- JavaScript: 64,972 bytes (22.37 KB gzip), below 200 KB.
- CSS: 15,293 bytes (4.19 KB gzip), below 50 KB.
- Fonts: none.
- Responsive hero: 67,410-byte mobile WebP and 116,422-byte desktop WebP, both
  below 300 KB.
- Source map: 211,854 bytes, deployed but not loaded during normal startup.

## Independent end-to-end coverage

An uncommitted verifier-only Playwright suite ran 13 scenarios against the
production build and live origin. Defect-evidence scenarios intentionally
asserted the reproduced bad outcomes. Coverage included:

- create, persist, reload, edit, cancel delete, confirm delete;
- timed range rejection and correction, weekly recurrence, whitespace and
  inverted recurrence boundaries;
- people creation and the free four-person limit;
- valid IANA-`TZID`/RRULE ICS import, malformed ICS recovery, and a real browser
  ICS download with escaped comma/semicolon content;
- minimum passphrase feedback, QR generation, wrong-passphrase recovery, and
  encrypted snapshot replacement;
- desktop and 390×844 layouts, dark theme, reduced motion, keyboard skip link,
  focus visibility, dialog Escape/focus return, and horizontal overflow;
- print media (seven columns visible, application chrome hidden);
- local and live service-worker control, persisted-data offline reload, update
  notification, and the unchanged-worker stale-cache case;
- fresh-origin request capture, console errors, page errors, and axe scans.

Normal and malformed-input recovery paths passed except where listed above.
The free application made **zero cross-origin requests** on first load and
through normal scheduling, import/export, and encrypted handoff flows. No CDN,
analytics, tracker, remote font, or silent schedule upload was observed.

## Accessibility and visual checks

- Home page, desktop/mobile default theme and mobile dark theme: 0 axe
  serious/critical findings.
- `/privacy/` and `/terms/` at 390 px: 1 serious `link-name` finding each.
- Factory `verify-url.sh`: PASS — HTTPS 200, title present, `lang="en"`, one
  `h1`, a `main`, 0 missing image alts, 0 unlabeled buttons, 0 console/page
  errors; measured network-idle load 802 ms.
- 390 px: single-day agenda and no horizontal overflow. Reduced-motion media
  reduced transition/animation durations to 0.01 ms.
- Desktop 1280×900 and mobile 390×844 screenshots were visually inspected.
  Content is legible, hierarchy and empty state are clear, and no clipping or
  overlap was observed.

## PWA, privacy, and live deployment

- Chromium `Page.getAppManifest`: parsed successfully; zero manifest errors and
  zero installability errors. Icons are valid 192×192 and 512×512 PNGs, with a
  maskable declaration.
- Service worker controls after reload. Both local and live boards reload
  offline with a newly created plan still present and the OFFLINE state shown.
- The worker precaches the shell, legal pages, icons, and both responsive
  images. The update toast works when a changed worker installs.
- IndexedDB persistence survived refresh and offline reload. Encrypted handoff
  content did not expose plaintext in its code; wrong credentials did not
  replace existing data.
- A fresh free session requested only same-origin application resources. The
  only designed external runtime call is an explicit/cached license check.
- HTTP redirects to HTTPS. Main, legal, offline, manifest, icons, images,
  scripts, styles, service worker, and source maps all returned successfully.
  An unknown route returns the SPA shell with HTTP 200.

### Deployment identity

All 16 files emitted by the candidate's `dist/` were fetched from production
and matched SHA-256 byte-for-byte, including all source maps. Representative
hashes:

| File | SHA-256 |
| --- | --- |
| `index.html` | `465ebbe9f9ce861716c4d158feaf3cec5a87137cdb87fba402e35fd18401f04d` |
| `assets/app.js` | `fc1f5b460f924e1568097ef342e2cb7efb0f4b078a775455cf4d1ae2829a034e` |
| `assets/style.css` | `9de863bf42db81405675e882e6eea6043f0fc2ae131634ee885f903df031949e` |
| `sw.js` | `31bea23859dc9114487ba321b072649974955b9780a6d2e0ef97f5f637eb432f` |
| `manifest.webmanifest` | `ab50d6007476e999e7a10c71aa6b03ff8f5a751bb370d84d2cc54f980a2f9e65` |

This is strong evidence that the live deployment is candidate
`8876e2334f0f984de8d0476fe780dd429d75cf2a`, despite the absence of an embedded
build-SHA endpoint.

## Performance

Lighthouse 12.8.2 against the live URL, simulated mobile:

| Metric | Result |
| --- | --- |
| Performance | 95 |
| Accessibility | 100 (home page only; see legal-page axe failures above) |
| Best Practices | 100 |
| FCP | 1.2 s |
| LCP | 1.5 s |
| Speed Index | 1.2 s |
| CLS | 0 |
| Total Blocking Time | 240 ms |
| Transfer size | 113 KiB |

No field INP is available for this new deployment; the requested INP threshold
therefore cannot be claimed from lab data.

## Required disposition

Do not promote this candidate. Fix the two calendar-integrity paths, register
and smoke-test the production billing product, remove the serious legal-page
axe findings and undersized controls, and couple the worker/cache revision to
every application build. Re-run this verification after redeployment.
