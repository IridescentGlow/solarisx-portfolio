# PROJECT_STATUS.md

Portable status snapshot. Full milestone history: docs/CHANGELOG_ARCHIVE.md (read only if asked).
Design/engineering rules: docs/START_HERE.md.

## Last updated
Editor Portfolio is now a real case study: six-piece gallery (two locally-hosted optimized
previews — Senai English tutorial + ad — plus four link-out pieces, each with a real
ffmpeg-extracted still rather than a YouTube thumbnail), full challenge/approach/craft/result
copy, `game-store.jpg` placeholder removed, real `seo` key added. Gallery renderer extended
with viewport-gated video playback (IntersectionObserver) and optional external `href`
link-out support. Build + lint clean, browser-verified desktop/mobile, MediHelp/Signature Reel
regression-checked. Pushed (`e5abc8d`, `3bd3d7e`).

## Stack
React 19 + Vite 6, Tailwind v4, GSAP 3 + @gsap/react, React Three Fiber + Drei,
react-router-dom v7, Lenis, Iconify.

## Architecture
src/App.jsx → routes: "/" HomePage, "/projects/:slug" ProjectPage
src/pages/, src/sections/, src/components/, src/lib/, src/constants/index.js

Data-driven routing: project.slug + project.caseStudy (object or null → index-only by design).
Navigation always opens new tab (internal or external).

## Deployment
Live in production on Vercel, project `awwwards-portfolio`, auto-deploying from
`IridescentGlow/solarisx-portfolio`'s `main` branch on every push. Current production URL:
`https://awwwards-portfolio-rho.vercel.app` (no custom domain yet). `VITE_SITE_URL` is set in
Vercel's Production environment, feeding `src/lib/seo.js`. Verified directly against served
bytes on 2026-08-14: `/`, `/projects/medihelp`, `/projects/signature-reel`, and
`/projects/editor-portfolio` each return distinct, correct `<title>`, `og:title`, absolute
`og:image`, `og:url`, and `<link rel="canonical">`; an unknown `/projects/:slug` returns 200
with the SPA shell (fallback rewrite in `vercel.json` working), not a 404. `og:description`,
asset loading, and in-browser click-through were not part of this verification pass.
`docs/engineering/DEPLOYMENT_PLAN.md` has been corrected to reflect this — it previously
described deployment as not yet implemented, which was stale.

## Current project data state
| Slug | caseStudy | Status |
|---|---|---|
| medihelp | full | Complete — only finished case study |
| signature-reel | full | Chapter stack + cinematic intro (VideoConstellation, MainReel, StarField2D) built. Real narrative copy complete and pushed (`6003611`) — no `[PLACEHOLDER — ...]` markers remain. |
| editor-portfolio | full | Six-piece gallery case study (2 local previews + 4 link-out with real extracted posters). Pushed (`3bd3d7e`). |
| beu-delivery (bento) | n/a | src/components/beu/ — 5th refinement pass done, committed, browser-verified |

## Gemini Hero (homepage 3D star)
Stages 1-4 complete: GLB/material/lighting/motion, video textures, hover, proximity tilt,
grab/drag/momentum. No further stages planned.

## Known open items
- Contact form: implemented (`api/contact.mjs` + `ContactForm.jsx` in the Final Frame, Resend
  provider). See `docs/engineering/CONTACT_FORM_ARCHITECTURE.md`. Requires external setup
  (Resend account + `RESEND_API_KEY`/`CONTACT_TO_EMAIL` in Vercel) before it can send real mail
  in production — not yet configured there as of this pass.
- SEO/share metadata: per-route <title>/description/OG/Twitter shipped and live in production
  — see Deployment section above. No longer open.
- ProjectPage.jsx metadata-row mount tween fires offscreen for cinematicIntro projects — needs scroll-triggered version, deferred.
- .theme-init dead class in crossfade selector.
- Tailwind bumped 4.1.7→4.3.3 (lockfile only); fixed a malformed CSS comment that was silently truncating --shadow-sm/md/lg tokens.
- MainReel hover CTA not gated to settled/enlarged state (deliberate simplification).
- ReelIntro's second "transition title" card removed — stale docs references may exist.
- beu bento: map.png (768KB) is a webp-conversion candidate if page weight becomes a concern.

## Repo notes
docs/ is an embedded git repo with its own remote (Claude-Manual on GitHub) — tracked as a
gitlink but with no .gitmodules entry, so it is not a registered submodule. Commits there need
a separate push, plus a gitlink bump in the parent. As of this cleanup pass both repos have a
locally committed but unpushed state — push both together next.

`docs/2026-08-08.md` is untracked and does not belong to this project (personal job-search
notes/links) — left untracked deliberately, not a project doc.
