# PROJECT_STATUS.md

Portable status snapshot. Full milestone history: docs/CHANGELOG_ARCHIVE.md (read only if asked).
Design/engineering rules: docs/START_HERE.md.

## Last updated
**Premium phase begins (2026-08-15.)** The functional/responsive foundation is complete and
pushed: contact form (`6fa7f55`, `19d78d4`), robots.txt + sitemap.xml (`8eafb14`), mobile
responsiveness and media sizing (`11440f3`). The prior "next milestone: robots.txt + sitemap"
note below was stale — that shipped.

This phase is art direction, not bug fixing. Direction and roadmap: `DESIGN_DIRECTION.md`
(repo root; a phase document, explicitly NOT canonical — `docs/START_HERE.md` §1 still governs).
Baseline assessed in-browser at 1440×900, 768×1024 and 390×844, dark and light.

Core finding: the site is under-composed, not under-animated. `AnimatedHeaderSection` renders
all five homepage frames AND all nine project-page chapter openers through one identical
composition, so `COMPOSITION_PRINCIPLES.md` §2's mandated per-frame rhythm and
`TRANSITION_PHILOSOPHY_CANONICAL.md`'s Tier 1/Tier 3 handoffs are both unbuilt — the latter
blocked by the former.

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

## Current milestone
**Tier 1.1 — Frame composition system.** `DESIGN_DIRECTION.md` §3. Adds an additive `layout`
prop to `AnimatedHeaderSection` (`split` default / `centered` / `offset`) and applies the
per-frame rhythm `COMPOSITION_PRINCIPLES.md` §2 specifies: Works keeps `split` (the one frame
the current layout is already correct for), About → `offset`, Capabilities → `centered`,
Contact → `centered`.

Picked first because it is the **precondition** for all transition work — a Tier 1/Tier 3
handoff is not legible between two frames that look identical. Hero is deliberately excluded
(Tier 1.2): its composition cannot be decided separately from the star↔headline relationship
`COMPOSITION_PRINCIPLES.md` §5 deferred, and that deferral's condition (a real asset) is now met.

Constraints: `split` must stay byte-identical for every existing caller, including all nine
`ProjectPage.jsx` chapter openers. No new easing curve, no new duration token, no new library.

## Known open items
- Contact form: complete and verified in production. No longer open — see "Last updated" above.
- SEO/share metadata: per-route <title>/description/OG/Twitter shipped and live in production
  — see Deployment section above. No longer open.
- robots.txt + sitemap.xml: shipped (`8eafb14`). No longer open.
- Route-based code splitting (`React.lazy` for `HomePage`/`ProjectPage`) — deferred, not this
  milestone. See `FUTURE_IMPLEMENTATIONS.md` for the reason (mount-timing risk).
- About section still uses the template's stock photo (`images/photo.jpg`), not a real
  portrait — flagged, blocked on the site owner providing a photo.
- No verified-certification/credential links anywhere in the site — flagged, blocked on the
  site owner providing real certification names/URLs. Also has no obvious home in the current
  canonical UX architecture (About explicitly avoids "resume-style" content, Capability Map
  avoids skill lists) — needs a placement decision before implementation, not just assets.
- **Reduced-motion collapse does not work for time-based tweens** (found 2026-08-15, pre-existing).
  `motion.js`'s `gsap.defaults({duration: 0})` is inert wherever a call site passes `duration:`
  explicitly — which is everywhere. Measured, not inferred; see FUTURE_IMPLEMENTATIONS.md for the
  evidence and why a 2.6s sample gives a false pass. Fix belongs in `motion.js`.
- ProjectPage.jsx metadata-row mount tween fires offscreen for cinematicIntro projects — needs scroll-triggered version, deferred.
- .theme-init dead class in crossfade selector.
- Tailwind bumped 4.1.7→4.3.3 (lockfile only); fixed a malformed CSS comment that was silently truncating --shadow-sm/md/lg tokens.
- MainReel hover CTA not gated to settled/enlarged state (deliberate simplification).
- ReelIntro's second "transition title" card removed — stale docs references may exist.
- beu bento: map.png (768KB) is a webp-conversion candidate if page weight becomes a concern.

## Repo notes
docs/ is an embedded git repo with its own remote (Claude-Manual on GitHub) — tracked as a
gitlink but with no .gitmodules entry, so it is not a registered submodule. Commits there need
a separate push, plus a gitlink bump in the parent. Both repos are currently pushed and in sync
with their respective `origin/main`.

`docs/2026-08-08.md` is untracked and does not belong to this project (personal job-search
notes/links) — left untracked deliberately, not a project doc.
