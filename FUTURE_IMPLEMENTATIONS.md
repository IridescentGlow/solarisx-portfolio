# FUTURE_IMPLEMENTATIONS.md

A parking lot for ideas we intentionally do **not** implement yet.

The purpose is to prevent feature creep — to give good ideas a place to
land without letting them interrupt the current priority (finishing the
portfolio's actual content, especially the Works/case-study pages).

Nothing in this file is a task. Nothing here is scheduled. An idea moves
out of this file only when it is deliberately picked up as real work in a
future session — not by accumulating here until it feels "due."

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

## Signature Reel

The cinematic intro (hero, 3D video constellation, scroll flythrough, reel
arrival/enlarge/sticky-hold) is built — see `PROJECT_STATUS.md`'s
Signature Reel Cinematic Intro milestone. Deliberately not part of that
phase:

- **BeU Delivery** — a bento-grid graphic-design showcase, planned as the
  next major section after Signature Reel. Layout, images, animation,
  hierarchy, interaction, and copy are all still undefined; explicitly
  scoped out until a dedicated pass.
- Challenge/Approach/Craft/Result/Credits narrative copy for Signature
  Reel itself — not a design idea, a real content gap. The exact missing
  pieces are enumerated in `PROJECT_STATUS.md`'s milestone entry rather
  than duplicated here.

## Other Future Ideas

- Per-route SEO/share metadata for `/projects/:slug` pages — currently
  unresolved because this is a Vite SPA with no pre-rendering/SSG/SSR
  (flagged in `PROJECT_STATUS.md` §5 as deliberately deferred).
- Revisit the two dead template images in `public/assets/projects/`
  (`apple-tech-store.jpg`, `electronics-store.jpg`, `home-decor-store.jpg`,
  `mobile-accessories-store.jpg`, `plant-shop.jpg`) — unreferenced
  leftovers from the original template. Not urgent; candidates for
  deletion once confirmed permanently unused.
