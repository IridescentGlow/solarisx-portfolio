# PROJECT_STATUS.md

**Last updated:** 2026-08-11 — Added the BeU Delivery bento section to the Signature Reel case study: a new scroll-driven assembly (src/components/beu/) where 9 pre-composed card assets (measured pixel-for-pixel against reference/full-bento-layout.png) scatter, idle-float, then assemble via a restrained ease-out-back approach curve into the exact reference composition, with a static simplified fallback under reduced-motion/mobile. Wired into ProjectPage.jsx via a new `beuBento` project flag, as its own section separate from the shared Craft chapter (MediHelp untouched). Build + lint clean; not committed yet; not verified in a real browser (none available this session).

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
| signature-reel | placeholder text | Post-reel chapter stack (01 Challenge → 02 Approach → 03 Craft → Result → Credits) reuses MediHelp's shared ProjectPage.jsx code path as-is, no signature-reel-specific JSX. Cinematic intro: video panels idle-float + hover-to-front (frame and video both, VideoConstellation.jsx), MainReel enlarged + hover CTA ("Let's work together" / mailto), transition title fades out in place, StarField2D is a symmetric single star that grows/speeds up then splits into a deliberately-composed 20-star field behind MainReel, finishing its spread before the reel reaches full width, then fading out after. Build + lint pass and committed (`8fe69ad`). BeU Delivery bento (src/components/beu/) now implemented: 9 reference-matched card assets scatter and assemble into the exact reference/full-bento-layout.png composition on scroll, with idle float and a static reduced-motion/mobile fallback — not yet committed, not yet visually verified. Real narrative copy still needed for the chapter stack. |
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
- BeU Delivery bento (src/components/beu/) is implemented but not yet committed and not yet visually verified in a real browser — scatter distances/timing are a first-pass judgment call pending review; `map.png` (768KB) is a candidate for webp conversion if page weight becomes a concern.
