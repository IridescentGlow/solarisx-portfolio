# PROJECT_STATUS.md

Portable status snapshot. Full milestone history: docs/CHANGELOG_ARCHIVE.md (read only if asked).
Design/engineering rules: docs/START_HERE.md.

## Last updated
Browser-verified (Playwright + headless Chromium, no prior session had this available) both
the global cursor (src/components/Cursor.jsx, 57cb686) and the BeU Delivery bento assembly
(b0919dc) — both were already committed, just never actually seen running. All four cursor
states (default, OPEN ↗, WATCH, LET'S TALK) crossfade and magnetically pull correctly; the
full bento scroll-assembly renders with zero-crop, uniform gaps, and hands off cleanly into
the Challenge chapter. Zero console errors across homepage and /projects/signature-reel.
Deleted a stray untracked 16MB public/assets/projects/beu-delivery.zip (leftover raw-assets
upload). Build+lint clean.

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
| signature-reel | placeholder text | Chapter stack + cinematic intro (VideoConstellation, MainReel, StarField2D) built and committed (`8fe69ad`). Real narrative copy still needed — see `[PLACEHOLDER — ...]` markers in constants/index.js. |
| editor-portfolio | null | Index-only by design, no case-study page |
| beu-delivery (bento) | n/a | src/components/beu/ — 5th refinement pass done, committed, browser-verified |

## Gemini Hero (homepage 3D star)
Stages 1-4 complete: GLB/material/lighting/motion, video textures, hover, proximity tilt,
grab/drag/momentum. No further stages planned.

## Known open items
- SEO/share metadata (per-route <title>/OG) unresolved — needs pre-render/SSG/SSR.
- signature-reel real copy still needed.
- ProjectPage.jsx metadata-row mount tween fires offscreen for cinematicIntro projects — needs scroll-triggered version, deferred.
- .theme-init dead class in crossfade selector.
- Tailwind bumped 4.1.7→4.3.3 (lockfile only); fixed a malformed CSS comment that was silently truncating --shadow-sm/md/lg tokens.
- MainReel hover CTA not gated to settled/enlarged state (deliberate simplification).
- ReelIntro's second "transition title" card removed — stale docs references may exist.
- beu bento: map.png (768KB) is a webp-conversion candidate if page weight becomes a concern.

## Repo notes
docs/ is a git submodule with its own remote (Claude-Manual on GitHub) — commits there need a
separate push. Currently one local-only commit in docs/ (CHANGELOG_ARCHIVE.md) not yet pushed.
