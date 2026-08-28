# Weekboard visual thesis

## Direction — the family console

Weekboard uses a **pixel/demoscene language** because the product is a small,
self-contained household appliance rather than a cloud suite. The visual world
borrows from 1990s home-computer organisers: squared corners, 1 px keylines,
pixel-step shadows, compact status strips, and a limited phosphor-and-paper
palette. It should feel capable, private, and a little playful—not nostalgic
decoration pasted onto a generic dashboard. The board remains the hero.

Clarity wins over the motif. Pixel details live in borders, icons, the masthead
illustration, and microcopy; all schedule text uses a highly legible system sans.
Cards are reserved for independent events and setup panels. The desktop board is
a seven-column week; the phone is intentionally a single-day agenda with an
accessible day switcher, avoiding an unusable shrunken grid.

## Palette

The light theme is based on a kitchen noticeboard under morning light; the dark
theme is based on the same board after lights-out.

| Token | Light | Dark | Purpose |
| --- | --- | --- | --- |
| `--canvas` | `#F3EBD4` | `#111A22` | app background |
| `--paper` | `#FFFDF3` | `#18242E` | primary surface |
| `--ink` | `#18242E` | `#F8F1D8` | primary text |
| `--muted` | `#5E625C` | `#B8C4C1` | secondary text |
| `--line` | `#48505A` | `#8FA3A6` | outlines and grid |
| `--electric` | `#006C83` | `#57D7E8` | primary action/focus |
| `--sun` | `#E47724` | `#FFB454` | active day/emphasis |
| `--ok` | `#397144` | `#7FD98E` | saved/online |
| `--danger` | `#A33232` | `#FF8E82` | destructive/error |

Lane accents are deep blue, terracotta, forest, violet, and ochre. Each event
also shows the person’s initial/name, so meaning never depends on colour alone.
All body-text combinations meet 4.5:1; focus and control outlines meet 3:1.

## Type and spacing

- Display: `ui-monospace, "Cascadia Mono", "SFMono-Regular", Consolas,
  monospace`, uppercase only for tiny console labels; tabular figures for time.
- Reading/interface: `Inter`-like native stack (`system-ui, -apple-system,
  "Segoe UI", sans-serif`). No runtime font download and no font payload.
- Scale: 14 px console labels, 16 px body, 20 px subheads, clamp(28–42 px) h1.
- Rhythm: a 4 px base; primary gaps 8, 12, 16, 24, 32, and 48 px.
- Corners: 2 px controls, 4 px event blocks; never pill-shaped except status dots.
- Shadows: hard 3–4 px offsets, evoking stacked paper and pixel depth.

## Interaction grammar

- Primary action is always `Add plan`; clicking an empty day preselects it.
- Selected/pressed objects move by 1–2 px into their hard shadow.
- Save/import/export feedback appears in a persistent polite live status line.
- Dialogs emerge from the triggering region with a short opacity/translate
  transition, trap focus, close with Escape, and return focus to the origin.
- Destructive event deletion names the event and requires confirmation.
- Theme follows the operating system with an explicit theme toggle.

## Motion policy

Transitions last 160–220 ms and animate only opacity or transform. Events use a
single stepped entrance when the visible week changes; there is no looping or
flashing animation. With `prefers-reduced-motion: reduce`, movement and smooth
scrolling are removed and state changes are instant. Depth remains through
keylines, offsets, and contrast.

## Original asset plan and prompt sheet

One generated hero vignette appears only in the first-run empty state: a
pixel-art family planning station whose seven glowing columns explain the core
weekly-board idea. Hand-authored SVG PWA icons use a `W` calendar glyph. UI
icons are inline, original geometric SVG/path marks or Unicode where semantic.

**Art direction prompt:** “16-bit demoscene pixel art, isometric household
planning station with seven vertical calendar panels, small abstract household
tokens arranging colourful schedule blocks, warm cream paper and deep navy
console, cyan phosphor, burnt orange highlight, forest green details, sharp
pixel clusters, limited palette, crisp hard-edged lighting, friendly and calm,
wide editorial composition, no gradients, no readable text, no watermark, no
logos, no real people, no copyrighted characters.” Negative list: blurry
airbrush, photorealism, illegible pseudo-text, brand marks, corporate dashboard,
neon cyberpunk excess, human anatomy, clutter.

Generated with the factory Azure OpenAI image model (`factory-image`) on
2026-08-28. The original PNG and prompt sidecar live in `assets/src/`; derived
WebP files in `src/assets/` are bundled under content-hashed names. Generated imagery is original
to Weekboard and disclosed in the footer. `public/social-card.webp` is a
1200×630 centre crop of that same original image, produced locally with
ImageMagick; it introduces no third-party artwork.
