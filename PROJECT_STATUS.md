# PROJECT_STATUS.md

Portable status snapshot. Full milestone history: docs/CHANGELOG_ARCHIVE.md (read only if asked).
Design/engineering rules: docs/START_HERE.md.

## Last updated
Per-route SEO/share metadata shipped: `src/lib/seo.js` (single source of truth, per-project
`seo` keys in constants), `scripts/prerender-meta.mjs` (post-build injector emitting real
per-route HTML for crawlers), `src/lib/useDocumentMeta.js` (runtime head upsert for
client-side nav). `og:url`/canonical deliberately not emitted — no deployment origin exists
yet; setting `SITE_URL` turns both on. Build + lint clean, verified against served bytes and
post-JS DOM. Pushed (`0326533`, `9db7a0b`, `c392fa0`). Also repaired power-loss corruption in
the docs repo (three zero-byte git objects) by restoring its object store from origin.

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
- SEO/share metadata: per-route <title>/description/OG/Twitter shipped (build-time injection
  + runtime hook). Still open: `SITE_URL` is unset, so no og:url/canonical and og:image stays
  root-relative — share cards are text-only until an origin exists. Host must use a
  non-forced/filesystem-first SPA fallback or the per-route files are bypassed.
- ProjectPage.jsx metadata-row mount tween fires offscreen for cinematicIntro projects — needs scroll-triggered version, deferred.
- .theme-init dead class in crossfade selector.
- Tailwind bumped 4.1.7→4.3.3 (lockfile only); fixed a malformed CSS comment that was silently truncating --shadow-sm/md/lg tokens.
- MainReel hover CTA not gated to settled/enlarged state (deliberate simplification).
- ReelIntro's second "transition title" card removed — stale docs references may exist.
- beu bento: map.png (768KB) is a webp-conversion candidate if page weight becomes a concern.

## Repo notes
docs/ is an embedded git repo with its own remote (Claude-Manual on GitHub) — tracked as a
gitlink but with no .gitmodules entry, so it is not a registered submodule. Commits there need
a separate push, plus a gitlink bump in the parent. Both are currently pushed and in sync.
