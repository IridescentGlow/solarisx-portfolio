# PROJECT_STATUS.md

Portable status snapshot for the Solarisx portfolio — meant to be handed to
any AI assistant (Claude Code or otherwise) as a fast on-ramp. Updated at
the end of each completed milestone. This is **implementation status**, not
design intent — the canonical design/engineering rules live in `docs/`
(start at `docs/START_HERE.md`); this file tracks what's actually built.

---

## 1. What this is

Solarisx portfolio — a personal portfolio site for a visual storyteller /
creative technologist (per `docs/vision/CORE_EXPERIENCE_STATEMENT.md`).
Single-page cinematic narrative on the homepage, with an expandable
`/projects/:slug` depth layer for individual case studies.

## 2. Stack (verified against package.json, not assumed)

React 19 + Vite 6, Tailwind CSS v4 (CSS-first `@theme`, no `tailwind.config.js`),
GSAP 3 + `@gsap/react` for all motion, React Three Fiber + Drei for the
Hero's 3D scene, `react-router-dom` v7 for `/projects/:slug`, Lenis for
smooth scroll, Iconify for icons.

## 3. Architecture

```
src/
  App.jsx                → Routes: "/" → HomePage, "/projects/:slug" → ProjectPage
  main.jsx                → BrowserRouter wrapper
  pages/
    HomePage.jsx           → the single-page narrative (former App.jsx body, unchanged)
    ProjectPage.jsx         → case-study depth layer (see §5)
  sections/                → Hero, Works, About, Services, Contact, + Navbar/summaries
  components/               → AnimatedHeaderSection, AnimatedTextLines, Marquee, Planet
  lib/
    motion.js               → EASE/DURATION/SCROLL_REVEAL_START tokens (single source for GSAP timing)
    media.js                 → isVideo() — shared between Works and ProjectPage
  constants/index.js        → all content: servicesData, projects, socials, socialIcons
  index.css                  → design tokens (@theme) + custom @utility blocks (click-burst, trophy-glow, gold-shimmer-text)
```

**Data-driven routing** (`docs/design/PROJECT_PAGE_SYSTEM.md` §3): each
project has `slug` and `caseStudy` (object or `null`). Works.jsx links
internally to `/projects/:slug` only when `caseStudy` is truthy; otherwise
it links externally via `liveHref`. No hardcoded id/slug checks — a future
project switches over automatically the moment its `caseStudy` is populated.

**Navigation is always a new tab**, internal or external
(`window.open(href, "_blank", "noopener,noreferrer")`) — per the doc's §2
new-tab rule, and because same-tab client-side routing was found to inherit
the homepage's scroll position (fixed in the milestone below).

## 4. Current project data state

| Slug | caseStudy | Status |
|---|---|---|
| `signature-reel` | `null` | Index-only, `[Placeholder]` content, links externally |
| `editor-portfolio` | `null` | Index-only, `[Placeholder]` content, links externally |
| `medihelp` | `{}` (truthy, empty) | **First live project page** — real base data, no case-study narrative sections written yet |

## 5. ProjectPage.jsx — what's built

Two required sections per `PROJECT_PAGE_SYSTEM.md` §4 (Overview + Media),
plus terminal Links. Challenge/Approach/Craft/Result/Credits are
**intentionally omitted** — no real content exists for them yet, and the
doc is explicit that missing sections are omitted, not padded with
placeholders.

- **Overview** — reuses `AnimatedHeaderSection` (title/subtitle/qualifier),
  a metadata row (role/year/stack, opposite the title on desktop per §8),
  and the outcome via `AnimatedTextLines`.
- **Media** — hero video with a real poster frame (extracted via ffmpeg
  from `medi-help.mp4` itself), framed rather than full-bleed since the
  clip's own background is light and would fight the dark theme unframed.
- **Links** — terminal position, Live/Code, per §4's fixed ordering.
- **Not yet resolved**: `PROJECT_PAGE_SYSTEM.md` §9's SEO/share-metadata
  problem — this is a Vite SPA, so per-route `<title>`/OG tags need
  pre-rendering, SSG, or SSR, none of which exist yet. Deliberately
  deferred, not forgotten.

## 6. Known content gaps (not code work — need real input)

- MediHelp's `role`/`year`/`stack`/`repoHref` still have literal `TODO:`
  values in some places — check `src/constants/index.js` directly.
- Two other projects are still `[Placeholder]` — no real reel/title-sequence
  content yet.
- No case-study narrative content (Challenge/Approach/Craft/Result/Credits)
  exists for any project.

---

## Changelog

## Milestone — Premium Polish: Typography Rhythm, Gallery Depth
*(this milestone)*

Refinement only — no redesign, no new visual language. Started by
measuring both pages side by side rather than working from memory.

**What the comparison actually showed**

- Home gives every section `min-height: 900px` and **zero** margins; flow
  comes from full-viewport frames, not from gaps. Its raised panels round
  only one edge (About `0/0/32/32`, Capabilities `32/32/0/0`) so they
  bracket the transparent interlude between them.
- The gaps themselves turned out to be comparable (Home 80/168/64px vs
  MediHelp 192px), so the earlier assumption that margins caused the
  abrupt rhythm was wrong — worth recording, because it would have been
  easy to "fix" the wrong thing.
- The real difference was typographic: **Home's body copy renders as
  separate paragraph blocks**, and `AnimatedTextLines` staggers each one
  in. MediHelp's `caseStudy` strings had no line breaks at all, so they
  rendered as one unbroken block and lost the stagger entirely.

**Typography**

- Inserted 9 paragraph breaks across the case-study copy. Formatting
  only — not one word changed. `AnimatedTextLines` splits on `\n`, so
  this restores both the visual rhythm and the staggered reveal Home
  gets. Challenge/Approach/Craft/Result now render 2/5/5/3 blocks.
- Added `space-y-5` (body) and `space-y-4` (large statements) to the
  containers `AnimatedTextLines` already receives — no change to the
  shared component. Needed because Home's separation comes free at ~30px
  body copy; at `--text-body-lg`'s 18px the line breaks alone still read
  as one dense block.
- **Deliberately did not** raise body copy toward Home's ~30px, despite
  that being the largest remaining visual difference between the pages.
  `PROJECT_PAGE_SYSTEM.md` §8 explicitly designates `--text-body-lg` for
  case-study long-form reading, and per `CLAUDE.md` the documentation
  wins. Flagging the tension rather than silently overriding a canonical
  decision — worth a deliberate call if the two should be reconciled.

**Gallery depth**

- Extracted the card and image treatments into shared constants so the
  featured frame and strip items can't drift apart.
- Card and image now move on deliberately different clocks: the card
  lifts and its shadow deepens over 700ms while the image drifts to 1.06
  over 1200ms. That mismatch is what reads as depth — the image appears
  to sit behind the frame and lag it, rather than the tile scaling as one
  flat object. Scale reduced from 1.10 to 1.06; at this frame size the
  larger figure read as a zoom rather than a settle.
- `focus-within` now mirrors the hover treatment, so keyboard traversal
  gets the same affordance as a pointer.
- Aligned hover shadow behaviour across the award cards and the Approach
  callout, which previously lifted without their shadows responding.

**Regression caught and fixed mid-pass**

- The paragraph spacing grew Approach past the stack's narrow-band height
  gate — it needed 1091px against a 1030px threshold, which would have
  clipped its lower content while pinned. Caught by the clipping check
  rather than by eye. Re-measured every width and raised the narrow gate
  to 1120px (worst cases now: 881px from 1024px up, 1091px in the
  768–1023px band). A side effect of the taller chapter is that overlap
  coverage moved from 78% to **80%**, landing inside the 80–85% range
  originally asked for.

- Re-verified nothing regressed: wheel still exact (100px notch → 100px,
  line-mode → 48px, edge hands off), overlap still pins 0/160 with the
  title inside the band, shine still replays on both re-entry paths with
  its end boundary still reachable, all nine stack gate branches clean,
  zero horizontal overflow at 390/700/820/1440px, no console errors.
- `npm run build` and `npm run lint` both pass clean.
- Files touched: `src/pages/ProjectPage.jsx`, `src/constants/index.js`
  (paragraph breaks only). No new dependencies, no new tokens.

### Milestone — Interaction Polish: Wheel, Shine Replay, Overlap Stop

Polish only — no redesign. Three reported issues, all traced to concrete
causes rather than tuned by feel.

**Gallery wheel scrolling — two compounding bugs, both measured**

- `scroll-snap-type: x mandatory` was the main cause. Mandatory snapping
  forces every rest position onto an item centre, so a full 100px wheel
  notch resolved to **24px** of travel and a 3px line-mode notch to
  **zero** — the strip was snapping straight back to where it started.
  Tried `snap-proximity` first; it still snapped, because the items sit
  ~504px apart so there is always a snap point in range. Removed scroll
  snap entirely; the momentum glide now supplies the settled feel.
- `deltaY` is not always pixels. Firefox reports `DOM_DELTA_LINE` (~3 per
  notch) and some setups `DOM_DELTA_PAGE`; the old handler added that
  raw number to `scrollLeft`, so a real mouse wheel moved the strip 3px.
  Now normalised to pixels per `deltaMode`.
- Replaced the discrete `scrollLeft +=` with a `gsap.quickTo` glide —
  the same pattern `Works.jsx` already uses to trail its cursor preview
  — so a notch decelerates instead of stepping.
- Fixed two further defects found while verifying: `gsap.isTweening(el)`
  stays true after a `quickTo` finishes, so the resync that keeps swipe
  and wheel in agreement never ran (now checks the tween's own
  `isActive()`); and the edge check compared for exact equality, which a
  fractional `scrollLeft` defeated, leaving the gallery swallowing wheel
  events at the end of the strip (now compared with a 1px tolerance).
- Verified with dispatched wheel events, not by eye: a 100px notch moves
  exactly **100px**, a Firefox line notch exactly **48px**, three notches
  accumulate to exactly **300px**, and the glide samples
  `[403, 461, 484, 496, 500, 500, 500]` — smooth deceleration onto the
  target with no jitter. All six edge-handoff cases pass (both edges hand
  back to page scroll, mid-strip captures in both directions).

**Award shine — replay was structurally impossible**

- The trigger's `end: "bottom top"` resolves to **6976px**, but the
  document's maximum scroll is **6806px**. That boundary can never be
  reached, so `onLeave` never fired — and without it there is no
  `onEnterBack` to replay from. The shine could only ever play once, no
  matter what `toggleActions` said. Changed to `end: "bottom center"`
  (6526px, comfortably reachable).
- `toggleActions: "restart none restart none"` now replays on both
  re-entry paths, each confirmed: scrolling up above the section and back
  down, and scrolling past it and back up.
- Trigger moved earlier from `"55% bottom"` to `"45% bottom"`, i.e. fires
  when 45% of the section is visible, inside the requested 40–50% window.

**Chapter overlap — previous title now stays visible**

- The overlap stopped 40px short of the covering chapter, which hid the
  pinned chapter's title completely. `Services.jsx` gets this layering for
  free because its cards put their title ~24px from the top; a chapter
  opener put its title **150px** down, largely because the `text=""` slot
  still reserved ~128px for a line that renders nothing.
- Added an opt-in `compact` prop to `AnimatedHeaderSection` — same
  additive contract as the existing `textClassName`, default off, so
  every Home caller renders identically (verified: all five Home headers
  still measure `pt 64px / gap 64px`). It tightens only framing
  whitespace, never the type scale. Applied to the four chapter openers.
- With the title now at 70–150px, the sticky step went from 2.5em to
  **10em (160px)**. Measured result: Challenge pins at 0, Approach at
  160, the visible band is exactly 160px, the pinned title sits fully
  inside it, and Challenge ends up **78% covered** — close to the
  requested 80–85%, and erring toward showing the title rather than
  clipping it, which was the actual goal.
- Side benefit: removing the dead whitespace cut the mobile page from
  8535px to 8055px.

- Re-verified the whole stack after the height changes: all nine gate
  branches still correct, zero clipping, zero horizontal overflow at
  390/700/820/1440px, no console errors.
- `npm run build` and `npm run lint` both pass clean.
- Files touched: `src/pages/ProjectPage.jsx`,
  `src/components/AnimatedHeaderSection.jsx` (additive `compact` prop).
  No new dependencies.

### Milestone — Chapter Stack Transition + Award Light Sweep

Interaction refinement only — no redesign, no content changes.

**Chapter stack (Challenge → Approach → Craft)**

- Reuses `Services.jsx`'s Capabilities interaction as-is rather than
  approximating it. Worth recording what that interaction actually *is*,
  because it isn't obvious from the outside: it's plain CSS
  `position: sticky` with a staggered `top`, an opaque background and a
  top border. GSAP never drives the stacking there — only the entrance
  reveals. So there's no pinning, no scroll hijacking and no new
  scrolling system here either.
- Challenge pins at `top: 0`; Approach pins 2.5em lower, leaving a sliver
  of Challenge visible above it as the stack edge (the same peek Services'
  staggered `top` produces). Verified by tracking viewport-relative tops
  while scrolling: Challenge holds at 0, Approach holds at 40px, Craft
  slides up over both.
- **Craft is deliberately not sticky.** At ~2095px it's far taller than
  any viewport, and a pinned element taller than its own viewport buries
  its lower content permanently — pinning it would have made the gallery
  unreachable. In normal flow it does exactly what was asked anyway
  (scrolls up over the pinned Approach); `relative z-[3]` makes it paint
  above the pinned chapters, since sticky elements are positioned and
  would otherwise paint over a static sibling.
- The three chapters are wrapped in one container, which is what *bounds*
  the effect: sticky releases at its containing block's bottom, so the
  stack is over the moment Craft ends. Confirmed Result is
  `position: static` — the effect cannot reach it, Credits or Links.
- **Viewport-height gate, because the interaction is only safe when the
  pinned chapter fits.** Measured: the two pinned chapters top out at
  810px from 1024px wide up, reflow to 936px in the 768–1023px band, and
  reach 1333px on mobile. That needs two media queries, not one — the
  height a stack requires depends on the width it's at — and mobile is
  excluded outright rather than shipping an interaction that hides
  content. Below the gate the chapters render in normal document flow.
  Verified all nine branches (stacks at 1920×1080 / 1440×900 / 1024×900 /
  1023×1030 / 820×1180 / 768×1030; falls back at 1440×800 / 820×900 /
  390×844) with a check that flags any chapter needing more room than its
  viewport gives — zero clipping warnings.
- **Prerequisite bug fixed**: `<main>` carried `overflow-x-hidden`, which
  makes the element a scroll container and silently breaks
  `position: sticky` for every descendant — the stack would simply never
  have pinned. Swapped to `overflow-x-clip`, which gives the same
  horizontal-overflow protection without establishing a scroll container.
  Re-verified zero horizontal overflow at 390/700/820/1440px afterwards.
- Dropped Challenge and Craft from the scale-scrub transition added in an
  earlier pass: the stack is now their transition, and a scrub transform
  on a stacked chapter fights it (a transform also makes an element a
  containing block, which is another way sticky gets broken by accident).
  Result and the Award chapter keep theirs.

**Award light sweep**

- Two soft light sweeps cross the Award chapter once, staggered 0.9s
  apart, behind all content. New `award-light-sweep` utility in
  `index.css`: alpha peaks at 6–10%, band is 45% of the section wide,
  `blur(48px)` feathers both edges, colours derived from existing tokens
  via `color-mix()` (the idiom `click-burst` already uses) and the 100deg
  angle matched to `gold-shimmer-text`. Deliberately not a flare, laser
  or bright stripe.
- Trigger uses ScrollTrigger's `"55% bottom"` — literally "the point 55%
  down the section reaches the viewport bottom", i.e. 55% of the section
  is visible — so the requested 50–60% window is expressed exactly rather
  than approximated with a viewport percentage. `once: true` guarantees
  exactly two sweeps total.
- `EASE.connective` (0.65, 0, 0.35, 1) is the one true ease-in-out in the
  canonical set — the right curve for "no abrupt starts or stops".
  `EASE.cinematic` would have been wrong (a hard ease-out that whips in
  and crawls out). `EASE`/`DURATION.revelation` stay out entirely per
  `PROJECT_PAGE_SYSTEM.md` §7. Duration is `DURATION.reveal`.
- Verified by sampling the transform over time, not just by eye: both
  elements held at the start position before the trigger, sweep 2 still
  parked while sweep 1 was underway (stagger confirmed), both settled once
  and never repeated. The easing profile measured 8px of travel in the
  first 150ms, ~1200px through the middle and 235px in the final second —
  a textbook ease-in-out. Trigger fired with 584px of 1061px visible =
  55.0% exactly.
- Skipped entirely under `prefers-reduced-motion`: this is pure
  atmosphere, and `lib/motion.js`'s global `gsap.defaults({duration: 0})`
  does not collapse tweens that set their own duration, as this one must.

- `npm run build` and `npm run lint` both pass clean.
- Files touched: `src/pages/ProjectPage.jsx`, `src/index.css` (the new
  sweep utility). No new dependencies — `react-responsive` was already in
  use by `Services.jsx` and `Hero.jsx`.

### Milestone — MediHelp Project Page Art Direction, Third Pass

- Structural fix, not another styling adjustment: Hero.jsx/About.jsx/
  Services.jsx never wrap their content in a centred `max-w-Nxl mx-auto`
  box — they use `px-10` as a gutter and nothing else, and let
  `AnimatedHeaderSection`'s own banner-scale title carry the composition.
  Every chapter opener (Challenge/Approach/Craft/Result) now reuses
  `AnimatedHeaderSection` itself — the exact component and scale Hero/
  About/Services/Contact use for their own frame entrances — instead of
  approximating it with `text-4xl`/`text-5xl`. `text=""` deliberately:
  the case study's real paragraphs are genuine reading-length prose, not
  the short single-line Hero/About/Services pass through that slot, so
  they render separately below at a readable size, offset (not centred).
- Two concrete, verifiable bugs fixed in the screenshot showcase:
  - **Cropping.** Every source screenshot is a real 1920×1080 (16:9)
    capture — confirmed directly, not assumed. The previous pass forced
    the featured frame into 21:9 and the strip into 4:3, cropping real
    product screenshots (the featured image was missing its entire top
    navbar). `aspect-video` (16:9) on both now matches the source
    exactly, so `object-cover` has nothing left to crop.
  - **Horizontal scroll.** `overflow-x-auto` alone only responds to a
    trackpad's real horizontal swipe or touch drag — a plain mouse wheel
    has no native effect on it, which was the exact reported bug (page
    scrolls vertically, the strip never moves). Fixed with a real
    non-passive `wheel` listener (React's synthetic `onWheel` can't
    reliably `preventDefault()` here — a documented React 17+ limitation,
    not something a handler prop can work around) that converts a
    vertical-dominant wheel delta into `scrollLeft`, while a genuine
    trackpad horizontal gesture and mobile touch swipe are left to their
    already-working native behavior, and either scroll edge hands off to
    normal page scroll rather than trapping the visitor. Verified
    functionally with a real Playwright `mouse.wheel()` dispatch, not
    just visually: scrollLeft moved 0→528 while `window.scrollY` stayed
    fixed, and scrolling resumed normally once the strip was exhausted.
- **Real regression caught during verification, not left in**: reusing
  `AnimatedHeaderSection` for single-word chapter titles ("Challenge",
  "Approach") surfaced a genuine pre-existing bug in the shared
  `banner-text-responsive` utility — a single unbroken word has no space
  for the component's flex-col per-word wrap to act on, so at 3 of its 4
  size tiers it could overflow past `px-10` and get silently clipped by
  an ancestor's `overflow-x-hidden`. Confirmed "MediHelp" itself (the
  page's own existing title) was already affected — not something this
  pass introduced. First fix attempt (`break-words` alone) traded
  invisible clipping for visible overlap, since the utility's line-height
  is tuned for the flex-col multi-word case, not in-word wrapping; a
  first sizing attempt was verified with a flawed check
  (`scrollWidth`-vs-`clientWidth`, which false-negatives the moment a
  word wraps) and missed an entire breakpoint tier. Re-verified properly
  — forcing `white-space:nowrap` to measure true text width regardless of
  current wrap state — across 19 widths spanning every tier boundary
  (375–1920px). All clear. `break-words` stays on as a defensive
  backstop; the real fix is each tier's font-size now fit to its own
  worst-case container width.
- **Discovered, not fixed — out of scope**: the same corrected audit
  found Home's own `Services.jsx` title "Capabilities" (12 characters,
  longer than "Challenge") also overflows `banner-text-responsive` at
  several breakpoints, pre-existing and unrelated to this milestone
  (`/projects/medihelp` only; `Services.jsx` untouched). Flagged for a
  separate task, not fixed here.
- Verified Home's own titles (`Dagim Demissie`, `Works`, `About`,
  `Contact`) are unaffected by the `banner-text-responsive` and
  `AnimatedHeaderSection` changes — checked with the same corrected
  wrap-detection probe, plus a direct screenshot comparison at desktop
  and mobile.
- `npm run build` and `npm run lint` both pass clean.
- Files touched: `src/pages/ProjectPage.jsx` (the page itself),
  `src/components/AnimatedHeaderSection.jsx` (the `break-words`
  backstop — additive, a no-op for any title that already fits, so every
  existing caller is unaffected), `src/index.css`
  (`banner-text-responsive` tier resizing). No new dependencies.

### Milestone — MediHelp Project Page Art Direction, Second Pass

- Found and fixed a real bug in the first pass, not a design nitpick: the
  Result marquee (`First Place` / `AASTU Tech Fest 2025`) only had 2 items.
  `Marquee.jsx`'s `horizontalLoop()` needs the combined item width to
  comfortably exceed the viewport, or the loop shows a visible empty gap
  before repeating — confirmed exactly that with a 3-frame capture at
  1440px (the loop went text → stars → dead air → repeat). Every home-page
  marquee (`Contact.jsx`, `ContactSummary.jsx`) uses 5 items for the same
  reason; matched that convention. Re-verified with the same 3-frame
  capture — continuous text at every frame, no gap.
- Rebuilt Challenge and Result around Hero.jsx's own asymmetric signature
  (title block on one side, statement text on the other, right-aligned —
  `AnimatedHeaderSection`'s actual layout) instead of the first pass's
  centered-but-big treatment, which was still fundamentally a centered
  paragraph block. Result mirrors Challenge (numeral+label swaps sides)
  rather than repeating it — a bookend by rhyme, not duplication.
- Approach's "Where It Got Hard" callout became an actual card: raised
  surface, icon badge, hover lift — not a paragraph with a left border.
- Craft's gallery rebuilt entirely. The first pass's 3-column grid of
  same-size thumbnails was evidence "presented as a set" but too small to
  read as the page's stated centerpiece. Now: one large featured frame
  (21:9, the marketing hero shot) full-width in the chapter, then the
  remaining seven in a horizontal scroll-snap strip at up to 480px each
  — closer to how a product page presents screens than how a document
  embeds thumbnails. Next item deliberately peeks at the viewport edge as
  the scroll affordance; a small caption reinforces it. No new library —
  native CSS scroll-snap + Tailwind's arbitrary-property escape hatch for
  the hidden scrollbar.
- Award became its own raised, brighter chapter (`surface-1`/`rounded-4xl`,
  matching Craft) with a soft radial spotlight behind the trophy (existing
  `--color-accent-subtle` token, no new color). "First Place" pulled out
  as its own 4xl/6xl display statement — the same fact the body copy
  already states, just given typographic weight instead of staying a
  small tracked label. Certificate/ceremony cards sized up from 384px to
  480px, matching the gallery strip's own item width.
- Added a continuous-motion scrub transition (About.jsx's own technique:
  scale 0.97, scrollTrigger-scrubbed, `power1.inOut` — outside the four
  canonical reveal curves, same as About's version) at the page's four
  heaviest beats — Challenge, both raised chapters, Result — so leaving
  one doesn't read as a hard stop before blank space. Not applied
  everywhere, matching the restraint of About's own single use on the
  home page.
- Re-verified the tablet-gap breakpoint discipline (`md`, not `sm`) that
  was already fixed once for the old award-card layout still holds for
  every new responsive element — checked scrollWidth === innerWidth at
  390/700/820/1440px explicitly, given the new horizontal-scroll gallery
  and floating cards were new surface area for exactly that kind of bug.
  Zero console errors at any width.
- `npm run build` and `npm run lint` both pass clean.
- Only `src/pages/ProjectPage.jsx` touched — no other component, route, or
  design token changed. No new dependencies.

### Milestone — MediHelp Project Page Art Direction

- Full visual redesign of the case-study sections (Challenge/Approach/
  Craft/Result/Credits) — the previous pass was architecturally correct
  but funneled every section through one identical heading+body wrapper,
  which read as documentation rather than the home page's cinematic
  register. Removed that generic wrapper; every section now has its own
  composition, pulled directly from patterns the home page already uses
  rather than invented fresh:
  - **Challenge** — typography-first, centered, oversized (text-3xl→5xl,
    font-light) instead of a paragraph block, echoing the scale Hero/
    Services headings actually use (the project's own `--text-h2` token
    turned out to be far smaller than anything the home page uses for a
    real heading — a real gap the previous pass didn't catch).
  - **Approach** — split/offset layout (`lg:grid-cols-[1fr_2fr]`), per
    COMPOSITION_PRINCIPLES.md §3's explicit rule for About-style content:
    "text block positioned toward one side... not a centered container."
    Challenges nests inside as an accent-bordered callout.
  - **Craft** — raised onto `--color-surface-1` with `rounded-4xl`, the
    same giant-radius "chapter" language About/Services use where the
    page changes register. Gallery rebuilt: clipPath wipe-in reveal
    (About.jsx's own portrait-reveal technique, staggered across 8
    images), hover scale + lifted shadow, a middle-column vertical offset
    per row of three so it reads as composed rather than tiled, and
    numbered captions matching Services.jsx's `0{n}` list pattern.
  - **Result** — centered resolution beat mirroring Challenge's register
    (this page's own bookend structure). Award section adds the trophy +
    `animate-trophy-glow` treatment — a direct callback to the Works
    index row's own hover state for this exact project, not a new motif.
    Certificate/ceremony images become slightly tilted "floating cards"
    (opposing rotation, settling flat on hover) instead of a flat 2-up
    grid. One `Marquee` band (the same component Contact/ContactSummary
    use) repeats the award's own verified facts as a rhythm break.
  - **Credits** — Contact.jsx's own label/thin-divider/value pattern,
    reused verbatim as the page's quiet closing register before Links.
  - Every heading (not just body paragraphs) now reveals on scroll —
    ported from Services.jsx's ref-array + forEach + per-element
    ScrollTrigger pattern, using the canonical `EASE.cinematic`/
    `DURATION.reveal` tokens in place of Services' pre-token-system ease.
  - No new easing curves, motion tokens, or CSS systems introduced —
    everything traces to `lib/motion.js`'s four canonical curves, this
    project's own `--shadow-lg`/`--radius-lg` tokens (present in
    `index.css` since the design-tokens port but never actually used
    until this pass), and Tailwind's built-in `group`/`group-hover`.
- **Real regression caught and fixed during verification, not left in**:
  the new floating award cards initially used a `sm:` breakpoint for
  their row switch — reintroducing the exact tablet-gap inconsistency
  (multi-column media next to still-single-column text at ~700px) that
  was already found and fixed for the gallery grid in the previous
  milestone. Changed to `md:`, matching the page's one other responsive
  split, and re-verified at 700px/tablet/mobile/desktop.
- Verified via rendered screenshots (headless Chromium) at desktop
  (1440px), tablet (820px), the 700px tablet gap, and mobile (390px),
  plus a direct screenshot comparison against the home page's hero to
  confirm the shared scale/weight/subtitle/divider vocabulary. Zero
  horizontal overflow at any width (`scrollWidth` === `innerWidth`,
  checked explicitly given the new rotated/offset elements).
- `npm run build` and `npm run lint` both pass clean.
- Only `src/pages/ProjectPage.jsx` was touched — no other project,
  component, route, or design token changed.

### Milestone — MediHelp Project Page Implementation

- Implemented the full MediHelp case study on `/projects/medihelp`,
  populating `caseStudy` in `src/constants/index.js` with real content
  sourced entirely from `docs/case-studies/MEDIHELP_CASE_STUDY.md`
  (Challenge ← §2, Approach ← §3+§4 with §7 Challenges nested inside,
  Craft ← §5+§6 plus the media gallery, Result ← §9 with §8 Award nested
  inside, Credits ← §5's team structure). Data lives in constants, not
  hardcoded JSX strings — `ProjectPage.jsx` renders generically from
  `project.caseStudy`, the same pattern `outcome`/`role`/`stack` already
  used.
- Two section-ordering judgment calls, made explicitly rather than
  silently: Award nests under Result (matching the case study's own
  "(see §8)" cross-reference from §9, since `PROJECT_PAGE_SYSTEM.md` §4
  doesn't define an 8th top-level section for it) and Challenges nests
  under Approach (no separate §4 slot exists for it either — obstacles
  navigated are part of "the thinking" Approach is defined to hold).
- Added a local, unexported `CaseStudySection` helper in `ProjectPage.jsx`
  for the five repeated heading+body blocks. Deliberately does *not*
  reuse `AnimatedHeaderSection` for each one — that component's
  banner-text-responsive display scale is this page's one big title,
  already used once for Overview; repeating it five more times down one
  page would compete with it rather than support it
  (`HIERARCHY_SYSTEM.md` §1). Uses `text-h2`/`text-h3` instead.
- Built the media gallery: 8 images (hero, AI Assistant, Features, Who
  We Are, Find a Doctor, Symptom Checker, Sign Up, Testimonials) in a
  uniform responsive grid — no lightbox/carousel/zoom, since nothing
  here passes `UX_ARCHITECTURE_BLUEPRINT.md` §6's three-purpose test for
  one. Award section gets the certificate + ceremony photo in a matching
  2-up grid.
- Quality issues in the source screenshots (unedited template placeholder
  copy in `features.webp`/`who-we-are.webp`, Windows-activation
  watermarks in two captures, `login.webp`'s content being the sign-up
  form rather than a login screen) are surfaced in code comments and
  handled by captioning tiles by actual content — not hidden, cropped,
  or edited out of the images themselves, per this milestone's explicit
  instruction.
- Added MediHelp's `favicon.svg` next to the "Live ↗" link — a small,
  functional use (confirms which product the link leads to), not
  decoration. `logo.png` stays unused and unconverted this milestone, as
  instructed.
- **Real bug caught during responsive verification, not left in**:
  the gallery and award grids initially used Tailwind's `sm:` breakpoint
  (640px) for their 2-column layout. Screenshotting a genuine tablet
  width (700px — between `sm` and this page's only other responsive
  split, `metadata`'s pre-existing `md:flex-row` at 768px) showed
  multi-column media next to still-single-column text: a state
  `PROJECT_PAGE_SYSTEM.md` §8 doesn't define and this page has no other
  precedent for. Changed both grids to `md:`, matching the page's
  existing breakpoint convention, and re-verified at 700px/mobile/desktop
  before proceeding — mobile and desktop screenshots are pixel-identical
  before and after the fix (page height unchanged at both), confirming
  no regression.
- Verified via actual rendered screenshots (headless Chromium), not just
  code review: desktop (1440px), the 700px tablet gap, and mobile
  (390px). One capture-only false alarm along the way — `AnimatedTextLines`
  paragraphs appeared blank in an initial full-page screenshot because
  Playwright's single-shot capture doesn't fire the real scroll events
  `ScrollTrigger` needs; simulating actual incremental scroll resolved it
  and confirmed the content renders correctly for a real visitor.
- `npm run build` and `npm run lint` both pass clean.
- Nothing outside `src/constants/index.js` and `src/pages/ProjectPage.jsx`
  was touched — no other project, component, or route affected.

### Milestone — MediHelp Media Preparation & Case Study Completion

- Renamed `public/assets/projects/medihelp-project/` to `medihelp/`, matching
  the `medihelp` route slug used in `src/constants/index.js`. Pure filesystem
  rename — the folder wasn't wired into React yet, so nothing broke.
- Converted 10 raster assets to WebP (originals kept, nothing deleted):
  `hero/hero.png`, all 7 `screenshots/*.png`, `award/certificate.jpg`, and
  `award/award-ceremony.HEIC` (via ImageMagick's HEIC delegate, with the
  embedded 180° EXIF rotation corrected during conversion — verified
  visually, not just by dimensions). Combined originals 7.4MB → WebP 1.7MB
  (~77% smaller) at quality 85.
- Attempted logo vectorization per instruction. No trace tool (`potrace`,
  `autotrace`, `vtracer`) is installed in this environment, and
  `branding/logo.png`'s ribbon shapes use a smooth multi-stop gradient on
  curved paths — the category automated bitmap tracers handle worst.
  Documented the reasoning in the case study rather than faking an SVG by
  embedding the bitmap; `logo.png` stays a PNG.
- Discovered `branding/favicon.svg` is a genuinely separate hand-authored
  vector mark (real paths, not an embedded bitmap) — visually distinct from
  `logo.png`, not a vector version of it. Corrected an implicit assumption
  from the previous milestone that they were the same mark.
- Rewrote `MEDIHELP_CASE_STUDY.md` §10 (Media) as a complete asset
  inventory — every file's dimensions, size before/after conversion, what
  it depicts, and used-now vs. reserved-for-future status. Flagged
  everything genuinely notable rather than smoothing it over: unedited
  template placeholder copy in two screenshots (`features.webp`,
  `who-we-are.webp`), a `login.webp` filename that doesn't match its
  content (it's the sign-up form), Windows-activation watermarks in two
  captures, and a footer copyright year (2023) that doesn't match the
  certificate's 2025 hackathon date. `mobile/` and `graphics/` stay
  documented as genuinely empty — not fabricated to look complete.
  Certificate text (exact hackathon name, "15,000" cash amount as written
  — no currency symbol printed on the certificate, none invented here —
  07/05/2025 date, full sponsor list) gives §8's award claim primary-source
  backing
  that wasn't recorded anywhere in the document before. Version bumped
  1.1 → 1.2.
- Validated the full asset inventory against the filesystem: every path
  named in the case study exists, every file in `medihelp/` is accounted
  for in the case study, and no stale references to the old
  `medihelp-project/` folder name remain (its two remaining mentions are
  intentional history/rename-explanation text).
- No React components, CSS, routing, animations, or `ProjectPage.jsx`
  touched — this milestone is content and assets only, same restraint as
  every prior MediHelp documentation pass.

### Milestone — Documentation & Obsidian Integration

- Established `docs/` as a self-contained Obsidian vault: created
  `docs/MOC_SOLARISX.md` (main navigation page, wikilinked by section —
  Vision/Design System/Engineering/Project Architecture/Case Studies),
  two `.canvas` mind-map files (`SOLARISX_ARCHITECTURE.canvas` and
  `Solarisx_Project_Map.canvas` — different groupings, both current,
  neither supersedes the other), and `docs/.gitignore` (`.obsidian/`,
  later extended with `.smart-env` for the Smart Connections plugin).
- Added YAML frontmatter (`title`/`type`/`status`/`related`) and a
  "Related Documents" section to all 17 canonical + case-study documents.
  Every cross-reference was grepped out of the documents' own prose first
  (headers like "Governed by X.md", explicit `§`-citations) rather than
  invented; the handful of links added on request without a textual
  citation are called out inline in the affected files themselves
  (`PROJECT_PAGE_SYSTEM.md`, `MEDIHELP_CASE_STUDY.md`, `TECH_STACK.md`).
  Zero content changed — additions only, verified via `git diff --numstat`
  showing 0 deletions across every touched file.
- Resolved the `PROJECT_CONTEXT.md` naming collision: renamed this file
  (root, implementation-status snapshot) from `PROJECT_CONTEXT.md` to
  `PROJECT_STATUS.md`. `docs/vision/PROJECT_CONTEXT.md` (canonical vision
  document, unrelated purpose) is untouched — confirmed via full-repo
  grep that no other file referenced the root document by its old name
  before renaming.
- Re-verified vault integrity end-to-end: both canvas files parse as
  valid JSON, every file-node path resolves, no duplicate node IDs, no
  broken edges, and all 19 wikilink targets across the vault resolve to
  exactly one file each.
- **Known still-open items** (not fixed this milestone — out of scope or
  not yet requested): `docs/` is tracked as a git submodule gitlink but
  has no `.gitmodules` entry, so `git submodule update --init` doesn't
  work on a fresh clone; `docs/case-studies/MEDIHELP_CASE_STUDY.md` is
  still uncommitted in the `Claude-Manual` remote; new MediHelp media
  assets appeared under `public/assets/projects/medihelp-project/`
  (screenshots, award certificate, branding, hero video) — not reviewed
  or wired into anything this milestone.
- No UI implementation performed — `ProjectPage.jsx`, `constants/index.js`,
  components, styling, animations, and routing are all untouched.

### Milestone — MediHelp Case Study Content Filled In

- Updated `docs/case-studies/MEDIHELP_CASE_STUDY.md` (v1.0 → v1.1) with new
  verified information covering the problem statement, research/discovery,
  design process, development (frontend contributions, team structure,
  workflow, technical involvement), challenges, and final outcome.
- Resolved 5 of the 7 previously open `NEEDS USER INPUT` gaps: §2 Problem,
  §3 Research, §4 Design Process, §7 Challenges, §9 Final Outcome.
- Remaining gaps: §5 architecture detail beyond the confirmed tech list
  and confirmed areas of involvement (AI integration, authentication, API
  communication), and §10 website screenshots/graphics assets/hackathon
  materials.
- No unsupported statistics or invented metrics were added — the "70%+"
  figure was explicitly excluded per instruction.
- No UI implementation performed — `ProjectPage.jsx`, `constants/index.js`,
  components, styling, animations, and routing are all untouched.

### Milestone — MediHelp Case Study Documentation

- Created `docs/case-studies/MEDIHELP_CASE_STUDY.md`.
- Added verified project information: hackathon origin, first-place award
  (certificates + cash prize + best-solution title), and the creator's full
  role (front-end team member who built the Home and Blog pages; head of
  video editing; independent graphics and video/asset creation).
- No UI implementation performed — `ProjectPage.jsx`, `constants/index.js`,
  components, styling, animations, and routing are all untouched.
- Implementation waits for content approval. Several sections are
  explicitly marked `NEEDS USER INPUT` (problem statement, research,
  design-process reasoning, architecture detail, challenges, screenshots/
  graphics/hackathon-material assets) rather than filled with invented
  content.

### Milestone — Project Page Overview+Media build, navigation fix, animation gap fix

- Built the real visual design for `ProjectPage.jsx` (previously plain
  placeholder markup): Overview + Media sections per §4, framed hero video
  with a generated poster frame, metadata layout per §8's responsive rule.
- Extracted `isVideo()` into `src/lib/media.js`, shared by Works.jsx and
  ProjectPage.jsx (the second-consumer threshold `PROJECT_PAGE_SYSTEM.md`
  §5 names for when to extract).
- Fixed MediHelp's `outcome` field: it contained a literal `TODO:` sentence.
  Replaced with content sourced from the project's own GitHub README
  (`ellay21/Medihelp-Frontend`) — verified, not invented. The README
  documents no award/placement/result, so nothing about "what came of it"
  was added; the gap stays real rather than fabricated.
- Added a `gold-shimmer-text` treatment for the "Award Winning Solution"
  qualifier line — a one-time (not looping) gold gradient sweep, reusing
  only existing tokens (`--color-accent`, `--color-accent-dim`,
  `--color-text-primary`) and the existing `EASE.cinematic` curve. Exposed
  via a new optional `textClassName` prop on `AnimatedHeaderSection`
  (defaults to empty — every other caller unaffected).
- **Bug fix**: the internal-link click path used React Router's
  `navigate()` (same-tab) instead of `window.open()` (new tab), violating
  §2's new-tab rule. This also caused the reported "opens halfway down the
  page" symptom — React Router doesn't reset scroll position on a same-tab
  route change, so the project page inherited whatever scroll position
  Works was at on the homepage. Fixed by routing both internal and
  external clicks through the same `window.open()` call; a fresh tab
  starts scrolled to top by construction.
- **Bug fix**: everything below the header (metadata row, media block) had
  no reveal animation at all — it just appeared instantly while the header
  animated in. Added a `useGSAP` reveal reusing `EASE.cinematic`/
  `DURATION.reveal`, and swapped the outcome's bare `<p>` for
  `AnimatedTextLines` per §5's own component table.

### Milestone — Click burst interaction (Works.jsx)

Radial light-burst click feedback on every Works row (internal or
external). Root-caused and fixed a real invisibility bug (React Router's
synchronous route swap was unmounting the burst before first paint);
brightness/timing tuned twice based on visual review. Settled values: 24px
base circle, white-to-gold radial gradient (`color-mix()` off
`--color-accent`), 3-phase GSAP timeline (flash → expand → fade), 0.8s
total, `EASE.precise`/`EASE.cinematic`.

### Milestone — Project Page infrastructure

Added `react-router-dom`. `App.jsx` became a route switch; the former
single-page body moved unchanged into `pages/HomePage.jsx`. New
`pages/ProjectPage.jsx` (route resolution, slug lookup, not-found
fallback). Added `slug`/`caseStudy` fields to all projects (additive,
`docs/design/PROJECT_PAGE_SYSTEM.md` §3).

### Milestone — MediHelp video fix + trophy award treatment

`medi-help.mp4` was a corrupted 48-byte stub (interrupted ffmpeg
conversion, no `moov` atom) — re-encoded from the valid `mediHelp.mp4`
source. Added a hover-revealed trophy + "1st" badge on MediHelp's Works
row, escaping slightly above the row for a "breaking the frame" effect.

### Milestone — Scroll-reveal timing fix

Non-scrubbed reveals (section headers, About's image, Services cards,
Contact's social links) were triggering at the default "top bottom" —
meaning the reveal only started once the element was already at the
viewport edge, reading as a late pop-in. Added `SCROLL_REVEAL_START`
(`"top 120%"`) in `lib/motion.js`, applied consistently.

### Earlier milestones (see `git log` for full detail)

Identity cleanup (removed all template-author content), Capability Map
rewrite, motion timing system (`lib/motion.js` EASE/DURATION tokens,
tuned iteratively for a slower cinematic pace), social links (real URLs,
icon rendering, external-tab behavior), portfolio metadata/SEO foundation,
README rewrite, favicon (real asset, replacing an accidental overwrite
traced to a copy of `Star-Iridescent.svg`).
