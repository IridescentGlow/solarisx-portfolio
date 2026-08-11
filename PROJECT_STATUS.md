# PROJECT_STATUS.md

**Last updated:** 2026-08-11 — Signature Reel cinematic-intro motion pass: video panels idle-float + hover-grow after entrance, main reel enlarged with a hover CTA ("Let's work together" / mailto), the transition title now fades out in place instead of re-entering recentered, and a new 2D star field grows/splits/spreads behind the arriving reel. Fixed the `npm run dev` Node deprecation warning (tailwindcss 4.1.7→4.3.3, in-range) and a pre-existing malformed CSS comment it exposed. Build + lint clean; not yet verified in a real browser (none available this session).

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
| signature-reel | placeholder text | Post-reel chapter stack (01 Challenge → 02 Approach → 03 Craft → Result → Credits) reuses MediHelp's shared ProjectPage.jsx code path as-is, no signature-reel-specific JSX. Cinematic intro motion pass: video panels idle-float + hover-grow after entrance (VideoConstellation.jsx), MainReel enlarged + hover CTA ("Let's work together" / mailto), transition title now fades out in place (removed the old separate centered re-entry title), new 2D StarField2D (single star → grows → splits into a field behind MainReel, fades out after). Build + lint pass; visual/scroll/responsive check still needs a browser (none available this session). Real copy still needed. Stops before BeU Delivery by design (not yet implemented). |
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
