# PROJECT_STATUS.md

Portable status snapshot. Full milestone history: docs/CHANGELOG_ARCHIVE.md (read only if asked).
Design/engineering rules: docs/START_HERE.md.

## Last updated
**Phase 1 closed; fonts on woff2 (2026-10-01.)** All 19 canonical tokens
(`DESIGN_SYSTEM_TOKENS.md` §2/§4) were already implemented, so Phase 1's real deliverable was
§2's unmet woff2 action item: Amiamie converted (419 glyphs/face preserved), woff2 first in
`@font-face`, Light+Regular preloaded. Fonts 134 -> 81 KiB and **FCP 4.1s -> 3.3s**.
`BLUEPRINT.md` §0.11. **Gap 2's per-frame type-scale premise was struck** as contrary to
canonical `HIERARCHY_SYSTEM.md` §1/§2/§4 ("hierarchy through contrast, not volume") — decided
with the site owner; Phases 1/6 and the DoD checklist amended inline.

**Media load fixed; redesign Phase 0 complete (2026-10-01.)** Homepage initial transfer cut
20,425 -> 5,111 KiB (media 17,638 -> 2,237 KiB) by lazy-loading Works preview clips on
intersection and re-encoding the six star texture clips 1280x720 -> 640x360. Full detail:
`BLUEPRINT.md` §0.10. `docs/` was missing from this checkout and has been restored at the
pinned gitlink commit `22ff2fd`.

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
**Phase 1 — design tokens: COMPLETE (2026-10-01).** Tokens were already in place; the woff2
conversion was the actual work. See "Last updated" and `BLUEPRINT.md` §0.11.

**Next: BLUEPRINT.md Phase 2 — signature motif system.** Build the full/reduced/minimal states
of the Gemini star. Two constraints carried in from Phase 0: the blueprint's revised Section 9
bars a crystal/triangle mark (already satisfied — the motif is a star carrying the owner's own
reel footage, `BLUEPRINT.md` §0.9), and the reduced/minimal states double as the remaining
performance fix, since a line- or mark-form state carries no video (§0.10).

Note any token change must be made in BOTH `src/index.css` and `src/lib/motion.js`, which
mirrors the curves as GSAP `CustomEase`s.

**Tier 1.1 — Frame composition system: BUILT AND SHIPPED.** The additive `layout` prop on
`AnimatedHeaderSection` (`split` default / `centered` / `offset`) exists, and the per-frame
rhythm `COMPOSITION_PRINCIPLES.md` §2 specifies is applied: Works keeps `split`, About →
`offset` (`About.jsx:52`), Capabilities → `centered` (`Services.jsx:40`), Contact → `centered`
(`Contact.jsx:48`). This section previously described it as in-flight; that was stale.
Hero remains deliberately excluded (Tier 1.2).

## Known open items
- **Homepage mobile Lighthouse performance is unscoreable — `NO_LCP`** (found 2026-10-01). The
  page produces zero LCP candidates, so the category returns `null`; this is NOT a byte problem
  and survived the media fix. Isolated to homepage-only code by controlled comparison:
  `/projects/medihelp` renders the same `AnimatedHeaderSection` and scores 68 with LCP at 5.8s.
  Suspect `HomePage.jsx:21-25`'s `useProgress()` gate (holds all frames in an `opacity-0`
  wrapper, then removes the loading overlay, destroying the only paint candidate) plus the R3F
  canvas. See `BLUEPRINT.md` §0.10. Blocks the "mobile Lighthouse >= 95" criterion on `/`.
- `public/videos/optimized/work-02/04/07/08/09.mp4` (~3 MB, tracked) are referenced nowhere —
  portrait leftovers from the removed star side panels. Removal candidate, decision pending.
- `/assets/backgrounds/{curtains,poster,map}.jpg` are 565–604 KiB each and still load eagerly as
  `bgImage` — the next-largest media win after the 2026-10-01 pass.
- **Canonical tokens exist but components do not consume them.** `AnimatedHeaderSection` still
  uses Tailwind utilities and the bespoke `banner-text-responsive` rather than `--text-display` /
  `--text-h1`. Real work that no blueprint phase currently owns — see `BLUEPRINT.md` §0.11.
- Accent `#CFA355` has never been contrast-validated for *text* use against the dark background
  (`DESIGN_SYSTEM_TOKENS.md` §7's own open item), and `/` still has 24 `color-contrast`
  failures (a11y 96). The two are likely the same problem; neither is addressed.
- `public/fonts/amiamie/{otf,ttf}` (1.6 MB) are retained as `@font-face` fallbacks behind woff2.
  Removal would need a decision about non-woff2 browser support; the 3 `Amiamie-Round` faces are
  reserved/unused per `DESIGN_SYSTEM_TOKENS.md` §2 and stayed on otf/ttf.
- `docs/` still has **no `.gitmodules` entry** — restoring the checkout did not change that, so
  it remains a gitlink-without-submodule needing a separate push plus a parent gitlink bump.
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
