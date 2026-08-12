# PROJECT_STATUS.md

Portable status snapshot. Full milestone history: docs/CHANGELOG_ARCHIVE.md (read only if asked).
Design/engineering rules: docs/START_HERE.md.

## Last updated
Replaced all Signature Reel case-study placeholder copy in `src/constants/index.js` with real
narrative content (outcome, challenge, approach + challenges, craft development + myRole,
result), sourced directly from the creator; `credits` key omitted entirely (solo project,
would've duplicated `craft.myRole`). Build verified clean, browser-verified by the user.
Committed (`6003611`) and pushed to `origin/main`.

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
| signature-reel | full | Chapter stack + cinematic intro (VideoConstellation, MainReel, StarField2D) built. Real narrative copy complete and pushed (`6003611`) — no `[PLACEHOLDER — ...]` markers remain. |
| editor-portfolio | null | Index-only by design, no case-study page |
| beu-delivery (bento) | n/a | src/components/beu/ — 5th refinement pass done, committed, browser-verified |

## Gemini Hero (homepage 3D star)
Stages 1-4 complete: GLB/material/lighting/motion, video textures, hover, proximity tilt,
grab/drag/momentum. No further stages planned.

## Known open items
- SEO/share metadata (per-route <title>/OG) unresolved — needs pre-render/SSG/SSR.
- ProjectPage.jsx metadata-row mount tween fires offscreen for cinematicIntro projects — needs scroll-triggered version, deferred.
- .theme-init dead class in crossfade selector.
- Tailwind bumped 4.1.7→4.3.3 (lockfile only); fixed a malformed CSS comment that was silently truncating --shadow-sm/md/lg tokens.
- MainReel hover CTA not gated to settled/enlarged state (deliberate simplification).
- ReelIntro's second "transition title" card removed — stale docs references may exist.
- beu bento: map.png (768KB) is a webp-conversion candidate if page weight becomes a concern.

## Repo notes
docs/ is a git submodule with its own remote (Claude-Manual on GitHub) — commits there need a
separate push. Currently one local-only commit in docs/ (CHANGELOG_ARCHIVE.md) not yet pushed.
