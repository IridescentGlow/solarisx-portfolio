# PROJECT_STATUS.md

**Last updated:** 2026-08-12 — Fifth BeU Delivery bento refinement pass: rebuilt `beuBentoConfig.js` so every card's box is now *derived* (one shared grid + each asset's native pixel aspect) instead of hand-nudged, fixing uneven gaps, the order-cart-track phone's top-crop, and the FRESH wordmark's undersized letterboxing (its origin now maps exactly onto one row of the stroke-group SVG). Woman's crop re-solved from two independent landmarks (hairline, waistband) so her waist/jeans are visible. Pre-assembly idle motion sped up (peak drift ~4-8x faster; amplitude mostly unchanged) since perceived motion tracks velocity, not amplitude. Build + lint clean; still not committed; still not verified in a real browser (none available this session).

Portable status snapshot. Full milestone history: docs/CHANGELOG_ARCHIVE.md (read only if asked).
Design/engineering rules: docs/START_HERE.md.

## Stack
React 19 + Vite 6, Tailwind v4, GSAP 3 + @gsap/react, React Three Fiber + Drei,
react-router-dom v7, Lenis, Iconify.

## Architecture
src/App.jsx → routes: "/" HomePage, "/projects/:slug" ProjectPage
src/pages/, src/sections/, src/components/, src/lib/, src/constants/index.js

Data-driven routing: project.slug + project.caseStudy (object or null → index-only by design).
Navigation always opens new tab (internal or external).

## Current project data state
| Slug | caseStudy | Status |
|---|---|---|
| medihelp | full | Complete — only finished case study |
| signature-reel | placeholder text | Post-reel chapter stack (01 Challenge → 02 Approach → 03 Craft → Result → Credits) reuses MediHelp's shared ProjectPage.jsx code path as-is, no signature-reel-specific JSX. Cinematic intro: video panels idle-float + hover-to-front (frame and video both, VideoConstellation.jsx), MainReel enlarged + hover CTA ("Let's work together" / mailto), transition title fades out in place, StarField2D is a symmetric single star that grows/speeds up then splits into a deliberately-composed 20-star field behind MainReel, finishing its spread before the reel reaches full width, then fading out after. Build + lint pass and committed (`8fe69ad`). BeU Delivery bento (src/components/beu/) through its fifth refinement pass: layout now grid-derived (uniform gaps, zero-crop aspect-exact boxes), order-cart-track phone/buttons/FRESH wordmark repositioned from dedicated per-card reference exports, hero woman's crop extended to show waist/jeans, idle pre-assembly motion sped up to be visibly noticeable — still not committed, still not visually verified in a live browser. Real narrative copy still needed for the chapter stack. |
| editor-portfolio | null | Index-only by design, no case-study page |

## Gemini Hero (homepage 3D star)
Stages 1-4 complete: GLB/material/lighting/motion, video textures on surface,
hover (grow+slow), proximity tilt, grab/drag/momentum. Next stage: none planned.

## Known open items
- SEO/share metadata (per-route <title>/OG tags) unresolved — needs pre-render/SSG/SSR, deferred.
- signature-reel needs real narrative copy (see constants/index.js's inline `[PLACEHOLDER — ...]` markers for the exact open questions per section).
- ProjectPage.jsx's metadata row (role/year/stack) mount-delay tween fires while offscreen for cinematicIntro projects (it's several viewports below ReelIntro) — no visible entrance in practice. Needs a scroll-triggered version for that case; deferred as motion polish.
- .theme-init class in crossfade selector
- `@tailwindcss/vite`/`tailwindcss` bumped 4.1.7 → 4.3.3 (still within package.json's existing `^4.1.7`, lockfile-only change) to fix a Node `module.register()` deprecation warning on `npm run dev`, upstream-fixed at 4.3.1. While fixing this, also repaired a pre-existing malformed CSS comment in index.css (`/* --shadow-*/--radius-* ... */` — the embedded `*/` was closing the comment early) that the 4.1.7 parser silently tolerated but 4.3.3 treated as a hard build error; this had been silently truncating the `--shadow-sm/md/lg` token block. No component currently uses the `shadow-sm` utility class, so no visible effect, but flagging since the token now resolves where it may not have before.
- MainReel's cinematic hover CTA is not gated to the settled/fully-enlarged state — it's live at any scroll position (including mid-scale-scrub), a deliberate simplification rather than adding scroll-position gating logic.
- ReducedMotionIntro (prefers-reduced-motion) gets no star field and keeps its own pre-existing two-title layout (hero + a second static compact title) — neither was in scope for this pass, which only touched the non-reduced-motion cinematic path.
- ReelIntro.jsx's CinematicIntro no longer has a second, separately-rising "transition title" card (previously documented as brief §5) — removed per explicit instruction since it read as a positioning bug (fade out, then reappear recentered). If docs/design references to that second title moment still exist, they're now stale against the code.
- BeU Delivery bento (src/components/beu/) is through a fifth refinement pass but still not committed and still not visually verified in a real browser — the fifth pass's derived-grid layout and sped-up idle motion are verified only via script-composited renders and arithmetic on the config, never a live page; `map.png` (768KB) is a candidate for webp conversion if page weight becomes a concern.
