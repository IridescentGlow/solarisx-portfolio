# FUTURE_IMPLEMENTATIONS.md

A parking lot for ideas we intentionally do **not** implement yet.

The purpose is to prevent feature creep — to give good ideas a place to
land without letting them interrupt the current priority (finishing the
portfolio's actual content, especially the Works/case-study pages).

Nothing in this file is a task. Nothing here is scheduled. An idea moves
out of this file only when it is deliberately picked up as real work in a
future session — not by accumulating here until it feels "due."

---

## Premium Phase Roadmap (2026-08-15)

The one **ordered** list in this file — everything below this section is
still an unordered parking lot. Full reasoning: `DESIGN_DIRECTION.md`.

Tier 1 — must have:

1. **Frame composition system** (§3) — `layout` variants on
   `AnimatedHeaderSection`; per-frame rhythm per `COMPOSITION_PRINCIPLES.md`
   §2. **Done — `4d46455`.** Precondition for everything in Tier 2.
   Header bands only; About's body two-column is still pending as 2.3.
2. **Opening Frame** — the star↔headline spatial relationship
   `COMPOSITION_PRINCIPLES.md` §5 deferred until the real asset existed,
   plus that frame's symmetric composition. The two cannot be decided
   separately. Deferral condition now met (GeminiStar Stages 1–4 done).
3. **Works evidence weighting** — the site's highest-priority frame gives
   its display size to the word "WORKS" (~152px) and its evidence 26–32px.
   Corrected per `HIERARCHY_SYSTEM.md` §2 by quieting the label and
   widening the pacing, *not* by enlarging project rows.

Tier 2 — strong additions:

4. Tier-1 transition: Opening Frame → Proof of Craft ("the cold open
   resolves"). Blocked on 1.1 and 1.2.
5. Tier-3 transition: Capability Map → Final Frame — arrival pacing.
   Timing/pacing/sequencing only, per `TRANSITION_PHILOSOPHY_CANONICAL.md` §4.
6. Context Layer body composition — the photo/text block following its
   new `offset` header. Deliberately split from 1.1 to keep that
   milestone to header composition only.
7. Project-page chapter differentiation, so Editor Portfolio and
   Signature Reel read as distinct visual identities rather than the same
   chapter template with different copy.

Unscheduled, but ahead of Tier 3 — **reduced-motion collapse is not
working for time-based tweens.** `motion.js` sets
`gsap.defaults({ duration: 0 })` under `prefers-reduced-motion: reduce`,
but a GSAP default only applies to tweens that *omit* the property, and
`AnimatedHeaderSection`, `AnimatedTextLines`, `Works`, `Contact` and
`Services` all pass `duration:` explicitly — so the default never
applies. Measured 2026-08-15: sampling 220ms after `#contact` enters
view, the header reads `y: 61px / opacity 0.69` under `reduce` versus
`y: 42px / opacity 0.79` without it — mid-animation in both, not a snap.
(An earlier check sampled at 2.6s and appeared to pass; against a 3.6s
front-loaded ease-out, a running tween is ~indistinguishable from a
collapsed one that late. Sample early.) Pre-existing and site-wide, not
introduced by the composition milestone. `Cursor.jsx` and
`EditorWorkRow` have their own explicit reduced-motion branches and are
unaffected. Fix belongs in `motion.js` — e.g. a duration helper the
call sites use — not in a per-component branch.

Tier 3 — optional polish:

8. Light-theme surface contrast — `--color-bg-base` (`#efebe2`) and
   `--color-surface-1` (`#e5dfd3`) are close enough that the About and
   Capabilities panels barely read as a different material, which is the
   exact delta index.css's own theme-layer comment says it preserves.
   Verify, then tighten. Do not re-hue.
9. Marquee treatment (`ContactSummary`, `Contact`) — the most
   template-derived element remaining.

Explicitly out of scope for the whole phase: new animation libraries, a
fifth easing curve, new duration tokens, gradients, glow, additional 3D,
and any rewrite of `AnimatedHeaderSection`'s internals.

---

## Gemini Star

The Gemini hero (GLB/material/lighting/entrance/turntable, video textures,
hover response, proximity tilt, grab/drag/momentum) is a **completed
feature** as of the Stage 4 milestone (`efe7c61`). These are possible
future directions, not planned work:

- Angle-aware video intensity/visibility — varying which face's video
  reads strongest based on current camera-relative rotation, rather than
  the fixed front/back region split.
- More sophisticated video/material blending between the star's faces.
- Additional interactions beyond hover/proximity/drag (e.g. scroll-linked
  behavior, click-triggered moments).
- Audio-reactive behavior, if audio is ever introduced elsewhere on the
  site.
- Further glass/iridescence material polish.
- Additional motion experiments (secondary/settle motion, different idle
  rhythms, etc).

## Other Future Ideas

- Revisit the two dead template images in `public/assets/projects/`
  (`apple-tech-store.jpg`, `electronics-store.jpg`, `home-decor-store.jpg`,
  `mobile-accessories-store.jpg`, `plant-shop.jpg`) — unreferenced
  leftovers from the original template. Not urgent; candidates for
  deletion once confirmed permanently unused.

- Route-based code splitting (`React.lazy`/`Suspense` for `HomePage` and
  `ProjectPage` in `App.jsx`) — the main JS bundle is ~1.5MB
  (447KB gzipped) and currently ships as one chunk regardless of which
  route a visitor loads. Deliberately not picked as the next milestone
  (2026-08-14 reassessment): this site's identity is GSAP ScrollTrigger +
  React Three Fiber, and a Suspense boundary changes mount timing — the
  exact class of bug already open (`ProjectPage.jsx metadata-row mount
  tween fires offscreen for cinematicIntro projects`, see
  PROJECT_STATUS.md). Splitting also risks the shared Three/GSAP chunk
  fragmenting badly and increasing transfer for the common path. Real
  and worth doing, just not bundled with a lower-risk SEO milestone.

- Real About-section portrait, replacing the template's stock photo
  (`images/photo.jpg`, `src/sections/About.jsx`). Blocked on the site
  owner providing an actual photo — not implementable without it.

- Verified certification/credential links. Blocked on two things: the
  site owner providing real certification names + verification URLs,
  and a placement decision — the current canonical UX architecture has
  no natural home for this (`UX_ARCHITECTURE_BLUEPRINT.md`'s About
  frame explicitly avoids "resume-style" content; Capability Map
  explicitly avoids skill/tool lists). Needs both inputs before a future
  session can implement it.
