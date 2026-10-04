# Solarisx Portfolio — Master Implementation Blueprint

**Prepared as:** Creative Direction + Technical Architecture document
**Status:** Planning only — no implementation performed in this phase
**Audience:** A future Claude Code session (or you) executing the redesign
**Site under evolution:** https://s0larisx.vercel.app (canonical: awwwards-portfolio-rho.vercel.app)

---

## 0. How to use this document, and its honest limits

This blueprint is the source of truth for the redesign. It should live in the repo (e.g. `/BLUEPRINT.md`) and be read in full before any code changes.

Two honesty notes, stated up front rather than papered over:

1. **I could not render your live site's DOM in this session.** Your app is a client-rendered Next.js SPA; a plain fetch only returns metadata (title, OG tags, theme color), not the rendered frames. I did not have repository access either. So this blueprint's picture of your *current build* is assembled from your own prior-session notes (the five-frame structure, stack, and the self-critique you already produced) rather than from me looking at pixels directly. **Phase 0 below exists specifically to close that gap** — its first job is to re-ground every reference in this document against the actual file tree, before anything else proceeds.
2. **The reference video's caption is false and should be ignored.** It's captioned "POV: GPT-6 Astra just COOKED," implying an AI model generated the site live. It didn't — the site is a real, professionally built site by **Alche, Inc.**, a Japanese creative studio (their 3D logo/interaction work is independently documented on Awwwards). None of the analysis below treats the clickbait framing as real; it treats the site as what it actually is — a well-executed piece of human art direction worth reverse-engineering.
3. **Section 2 draws a hard line between reference *principles* (adopt) and reference *executions* (don't rebuild).** Alche's crystal/triangle mark, its chrome-glitch intro, and its grid-floor-plus-HUD works staging are that studio's specific authorship and are explicitly out of scope — Sections 9 and 10 enforce this for the signature motif and project system respectively. If any phase produces something that would read as a recognizable trace of Alche's site to someone who's seen it, stop and flag it rather than ship it.

Everything else in this document is built from what's reliably known: your prior architecture notes, your stated goals, and a frame-by-frame analysis of the reference video.

---

## 1. Current Site — What's Known

**Positioning to build toward:** Dagim Demissie — *Visual Storyteller & Creative Technologist*. Disciplines: video editing, After Effects, motion design, VFX, compositing, typography, visual storytelling, sound design, music production, UI/product animation, web design, frontend development, creative technology. The site's job is to prove these are one integrated practice, not a skills list.

**Stack (per your own architecture notes):**
- Next.js 15 (App Router) + TypeScript — migrated off an original Vite/React starting point (Ali-Sanati `awwwards-portfolio` template, audited and selectively retained)
- Animation: GSAP, React Three Fiber, Lenis (smooth scroll)
- Forms: React Hook Form + Zod; contact submission currently **simulated**, no live email provider wired up
- Typeface: Amiamie (display)
- Structure: five frames — Opening Frame (Hero), Proof of Craft (Selected Work), Context Layer (About), Capability Map (Capabilities), Final Frame (Contact) — an order established through comparative research, not default habit

**Self-diagnosed issues already on record** (from your own post-build creative-director critique — this blueprint treats these as correct and builds on them rather than re-deriving them):
- A `--ease-connective` design token exists but is **unimplemented** — frames reveal independently instead of handing off to one another cinematically
- Heading hierarchy is **identical in weight across all five frames**, flattening pacing
- Three canonical docs already exist from that critique — **Hierarchy System, Composition Principles, Transition Philosophy** — but haven't been applied yet
- A routing conflict is unresolved: `/projects/:slug` vs. the canonical `/work/[slug]` — a project case-study system was mid-build when this was flagged
- Contact form needs a real email provider

This is a good sign, not a bad one: the diagnosis is already sound. What's missing is application, not analysis.

---

## 2. The Reference, Reverse-Engineered

The reference is Alche, Inc.'s site. Frame-by-frame, here's what's actually happening — and why it reads as premium.

**How to read this section:** it's split into two tiers on purpose. *Principles* are transferable craft — techniques and reasoning that belong to the discipline of web/motion design generally, not to Alche. *Signature executions* are Alche's specific, identifiable visual authorship — their mark, their staging, their sequence — and are explicitly off-limits as targets to rebuild on your own site, no matter how close the resemblance would otherwise get you to "looks impressive." The goal is a site that could sit in the same room as this one on craft, built from your own vocabulary.

### What happens on screen
1. **Entry:** a chrome/glass blob, heavily motion-blurred and glitch/scan-line distorted, morphs on load — an "instrument calibrating" beat before any content is trusted to the viewer.
2. **Brand construction:** the glitch resolves into a wireframe triangle built from visible geometric guides (circles, grid lines, construction rays) — the mark is *drawn*, not simply revealed.
3. **Solid hero:** the triangle becomes a faceted, iridescent 3D crystal (blue/purple, shifting to green) sitting inside a persistent WebGL grid environment. A HUD-like control cluster (joystick, "MainLogo Distortion" sliders) sits top-right — instrumentation, not decoration.
4. **Work carousel:** the crystal gives way to a horizontal, in-scene carousel — a centered active project (video/image) flanked by cropped neighboring thumbnails, still resting on the same grid floor. Each project carries a compact metadata block (date stamp, colored tag, bold title, one-line subtitle) and a quiet "More Works →" affordance.
5. **Per-project "moment":** each project swaps the *entire scene's* palette and lighting — a Fortnite project sits in a blue grid with a small "Featured in Fortnite" badge; an Unreal Engine project sits in magenta/purple with its own badge and a right-column description panel (icon + eyebrow + short paragraph, roughly a 25/75 split against the media).
6. **Value inversion:** one section abruptly cuts to a stark white/paper environment with a single color-shifting crystal shard and large type set on **opaque dark scrim blocks** laid directly into the 3D depth — not a translucent CSS overlay. Small ruler-tick and coordinate-style micro-labels sit around the composition like production annotation.
7. **Loop/exit:** transitions resolve back to the minimal line-art triangle with motion blur, closing the loop.

### Principles — adopt these, build them in your own vocabulary
- **Persistent world, not pages.** The whole experience appears to live in one continuous space; "sections" are camera moves through it, so transitions feel diegetic (motivated by an in-scene camera) instead of decorative (a CSS fade bolted onto a page load). *This is Gap 1 and the entire point of Phase 3.*
- **One mark, many states.** A single signature element recurs at every beat in a different material, color, and complexity — a visual rhyme that makes several wildly different-looking scenes still feel like one authored piece. *This is Section 9 — but the mark itself must be yours, see below.*
- **Palette as narration.** Each project/section gets its own tight, disciplined palette rather than one brand palette reused everywhere. The site is bold overall because each individual scene is restrained, not despite it.
- **Type as object.** Headlines sit on opaque cards placed in depth — typography has literal z-position and weight, not just font-size.
- **Instrumentation over decoration.** Interface chrome (sliders, ticks, controls) can signal "this is a crafted tool" and reinforce a technologist's identity through UI chrome itself, not just written content — the *idea* of diegetic instrumentation, not Alche's specific joystick/slider widget.
- **Contrast through restraint.** Nav and utility elements barely move; all dramatic motion budget goes to the signature mark and the media. If everything animated, nothing would read as a moment.
- **One continuous easing system driving every handoff** — this is pure technique (a single named CustomEase curve governing all transitions) and is the safest, most directly transferable item on this list.

### Signature executions — Alche's specific authorship, not a target to rebuild
These four are what someone who's seen Alche's site would immediately recognize if reproduced, even with different colors or assets. Treat them as reference points to understand the *job* each one is doing, then solve that job from scratch:
- The chrome/glass glitch-blob intro sequence, specifically
- The faceted crystal triangle as the mark itself — the triangle *shape*, the crystal *material*, and the wireframe-construction *reveal technique* together
- The grid-floor-plus-HUD-widget staging of the works carousel (the literal floor, the "+" crosshair markers, the joystick/slider cluster)
- The ruler-tick/coordinate micro-label system used as decorative chrome around text

Your Hero, your intro, and your works-scroll section should do the *same jobs* these do (earn the reveal, carry a recurring mark, stage projects as moments) using assets, geometry, and motifs that come from your own disciplines — compositing, motion graphics, sound design, your existing 3D work — not a reskinned version of Alche's.

---

## 3. Update or Rebuild

### PRESERVE
- Next.js 15 + TypeScript App Router foundation
- The GSAP + React Three Fiber + Lenis animation stack — already proven and already migrated off Vite deliberately, and explicitly sequenced first in your own process specifically *because* it was the highest-risk integration
- The five-frame structure and order (Hero → Selected Work → About → Capabilities → Contact) — evidence-based, not a default
- Amiamie display typeface
- React Hook Form + Zod validation logic on the contact form
- The three existing diagnostic docs (Hierarchy System, Composition Principles, Transition Philosophy) — this blueprint operationalizes them, it doesn't replace them

### TRANSFORM
- `--ease-connective`: defined but inert → becomes the single token that drives every frame-to-frame handoff
- Heading hierarchy: uniform → differentiated per frame per the existing Hierarchy System doc
- Frame transitions: independent reveals → one continuous authored gesture (adapted from the reference's persistent-world principle, not its literal 3D grid)
- Project presentation: → each case study gets a restrained per-project palette/mood "moment" plus a consistent compact metadata block

### REMOVE
- The `/projects/:slug` vs `/work/[slug]` routing ambiguity — pick the canonical pattern (this blueprint recommends `/work/[slug]`, matching your own prior "canonical" language) and delete the other
- Any unaudited leftover surface area from the original Ali-Sanati template not already deliberately retained — flagged for a Phase 0 audit, not assumed

### REBUILD
- Nothing structural. The only genuinely *new* construction is the transition/choreography layer itself, because `--ease-connective` doesn't do anything yet — but that's new work built inside the existing architecture, not a reason to discard it.

### DECISION: **Elevate, don't rebuild.**

The foundation — stack, structure, content model, and even the correct self-diagnosis of what's wrong — is already in place. The entire measured gap between current and reference lives in choreography, typographic hierarchy, and per-project art direction: exactly the layer that gets added on top of a sound architecture. A rebuild would re-risk the GSAP + R3F + Lenis integration you deliberately front-loaded as your hardest proof-of-concept, for zero benefit — the stack isn't the problem.

---

## 4. Current → Target Gap Analysis

**Gap 1 — Frame transitions**
- CURRENT: Frames reveal independently; `--ease-connective` exists as a token but is unused.
- TARGET: Every frame-to-frame handoff is authored as one continuous gesture — the outgoing frame's exit and the incoming frame's entrance share timing and easing, driven by `--ease-connective`, so scrolling feels like one move through five rooms, not five page loads.
- WHY: This is the largest single gap versus the reference. The reference's persistent-world feel comes entirely from this; without it, the site reads as five well-made components rather than one authored experience.

**Gap 2 — Heading hierarchy**
- CURRENT: Heading weight/scale is identical across all five frames.
- TARGET: Each frame gets a distinct typographic weight-class matched to its role — e.g. Hero at maximum scale/minimum words, About at editorial paragraph-weight, Capabilities at systematic label-scale — per the already-written Hierarchy System doc.
- WHY: Undifferentiated headings flatten pacing. The reference uses type-scale changes between sections as a pacing device as much as color; right now the site has the color-story tools but not the type-story tools.
- **> SUPERSEDED 2026-10-01 — see §0.11.** The TARGET above contradicts canonical `HIERARCHY_SYSTEM.md` §1/§2/§4, which forbids solving hierarchy with size. Gap 2's CURRENT line is also out of date: per-frame differentiation shipped structurally via the `layout` prop. Do not implement per-frame type scale.**

**Gap 3 — Signature visual motif**
- CURRENT: The 3D hero functions as a one-time opener.
- TARGET: One geometric/material signature — built from existing 3D assets or a new mark — reappears in reduced form at transitions, loading states, and the final/footer frame.
- WHY: This is what makes the reference feel authored rather than assembled: one mark in many states, not five unrelated hero moments.

**Gap 4 — Project presentation**
- CURRENT: Case-study system mid-build; routing undecided.
- TARGET: Each project gets a brief, deliberate "moment" — a restrained palette or lighting cue within the larger system — plus a consistent, compact metadata block (role, tools, date, one-line outcome). Never a generic card grid.
- WHY: Projects are the hero of the site (Section 9 of the brief). The uniformity problem you already flagged is exactly what would flatten project presentation into interchangeable cards if left unaddressed.

**Gap 5 — Utility chrome restraint**
- CURRENT: Not yet audited — flagged for Phase 0.
- TARGET: Nav and utility elements stay visually quiet and small so the dramatic motion budget goes entirely to the signature mark and project media.
- WHY: Contrast requires something to hold still. If everything moves, nothing reads as a moment.

---

## 5. What This Explicitly Is Not

No blanket addition of gradients, glow, particles, 3D, parallax, hover effects, or WebGL. Every motion or visual decision earns its place only if it strengthens the brand, storytelling, hierarchy, memorability, or interaction — not because it looks cool in isolation. The existing dark/iridescent-blue-purple-gold/glass/3D identity is **matured**, not discarded or genericized into another SaaS-gradient site.

---

## 6. Experience Structure

Keep the evidence-based order: **Hero → Selected Work → About → Capabilities → Contact.** The brief invited exploring a non-linear structure, but nothing in the gap analysis points to the *order* being the problem — the problem is the *seams between* frames. Re-sequencing now would discard research-backed work to solve a problem sequencing doesn't cause. Spend the redesign budget on the seams (Gap 1), the signature motif (Gap 3), and per-project moments (Gap 4) instead.

---

## 7. Typography System

> **SUPERSEDED 2026-10-01 — see §0.11.** This section's per-frame scale prescriptions were written without access to `HIERARCHY_SYSTEM.md`, and conflict with it: the canonical doc's §1 is "hierarchy through contrast, not volume — the strongest frame does not get bigger", and its §2 excludes size increases from the permitted mechanisms entirely. Apply the Hierarchy System doc as the literal spec, as the line below says — but **without** the constraints this blueprint stacked on top of it. They are retained here only as the superseded record.

Apply the existing Hierarchy System doc as the literal spec; this blueprint adds the following constraints on top of it:
- **Hero:** maximum scale, fewest words, Amiamie at its most sculptural weight — the frame that says the least and takes up the most visual space
- **Selected Work:** title-weight per project, but metadata (date/tags/role) at a consistent, quieter label-scale across every project — the recurring rhythm that makes many different projects feel like one system
- **About:** editorial/paragraph-weight, narrower measure, more line-height — the one frame allowed to feel like reading rather than viewing
- **Capabilities:** systematic, label-scale, grid-driven — disciplines presented as one coherent toolkit, not a bullet list
- **Contact:** back to Hero-adjacent scale for the close — the closing frame should feel like a peer of the opening frame, not an afterthought

Animated typography (per-character or per-line reveals) is reserved for the Hero and section-transition moments only — used everywhere, it stops registering as a signature move.

---

## 8. Motion System

**Global principles:**
- Durations: micro-interactions 150–250ms, frame-content reveals 400–800ms, frame-to-frame handoffs 800–1400ms (the longest category, since these are now the site's signature beat)
- Easing: one connective curve (`--ease-connective`) governs all frame handoffs; a separate, snappier curve governs micro-interactions (hover, button states) — never share a curve between the two categories
- Entrance/exit: every frame's exit motion and the next frame's entrance motion are authored as a single GSAP timeline, not two independent ScrollTrigger callbacks that happen to run near each other
- Reduced motion: every animation has a reduced-motion fallback that preserves the *content reveal* but drops the *camera/parallax* layer (see Section 16)

**Motion hierarchy (contrast, not uniformity):**
- Rare/signature: the recurring motif's state changes, frame-to-frame handoffs
- Dramatic: Hero entrance, per-project palette shifts in Selected Work
- Noticeable: card/media hover states, nav state changes
- Subtle: button micro-interactions, form field focus states

If a proposed animation doesn't clearly belong to one of these four tiers, it's a sign the animation doesn't have a job yet — cut it or assign it one.

---

## 9. The Signature Motif

Define one recurring visual/geometric element — this can evolve from whatever 3D asset already exists in the Hero, it does not need to be invented from nothing. **It must not be a faceted crystal and must not be a triangle** unless the audit confirms that's already an established mark of yours independent of this blueprint — those two choices specifically belong to Alche's identity (Section 2) and reusing them is the one most visible way this project would read as a trace rather than original direction. Start instead from what's actually yours: your existing Hero geometry, a shape or motif drawn from the video/motion-design side of your practice (a waveform, a scrub/timeline marker, a compositing mask shape, a lens/aperture form), or anything else native to your own disciplines list (Section 1).

Requirements:
- Must appear in at least three states across the site: full/complex (Hero), reduced/line-form (transitions and loading), and minimal/mark-form (footer or final frame)
- Must be the *only* element whose material/color is allowed to shift dramatically between sections — this is what earns the per-project palette shifts in Gap 4 the right to feel intentional rather than chaotic
- Should be reachable/reusable as a favicon-scale mark and a loading-state mark, so it functions as an actual identity system, not a one-off hero prop

---

### 9.1 Phase 2 decision — **The Gate**: an aperture read as a timeline, not a lens (2026-10-04)

**Decision (user, 2026-10-04):** the motif is the aperture/iris direction, grounded in the reel
footage. Two other candidates (the existing glass star reduced to its edge drawing; a radial
waveform) were considered and declined — the star because its four-point silhouette is the Gemini
sparkle family that `src/components/reel/StarField2D.jsx:7-16` names outright, which is the
AI-brand adjacency Section 21's "no generic AI/SaaS treatment" exists to prevent; the waveform
because it would *state* sound design on a site that currently carries no sound, where the
Definition of Done asks the site to *demonstrate* the practice.

**Name: the Gate.** In film the gate is the aperture plate where the frame physically sits —
"gate weave", "check the gate". It is an aperture term from the cutting room and the camera
body, not from a phone camera UI, and it names the thing this motif actually is: the plate a
frame is held in.

#### The refinement — what a camera app would not do

The risk logged against this direction was that an iris reads as a generic camera glyph. Four
decisions push the execution to an editing-timeline reading instead. Each is load-bearing; drop
them and the glyph risk returns.

1. **Six blades carrying six discrete footage segments.** A camera iris shows one continuous
   image *through* the opening. The Gate shows footage *on the blades themselves* — six
   simultaneous moments of the reel, one per blade, read as a contact sheet / multicam split,
   never as one clip behind a hole.
2. **A timecode ring.** Outside the iris sits a ruler: minor ticks at frame intervals, major
   ticks at second intervals carrying small numeric labels. This is canon §3's "Editing-timeline
   UI (Premiere/Resolve/AE) — precise alignment, functional typography", applied literally. It is
   also the single clearest non-camera signal in the composition.
3. **A playhead, with in/out brackets — and the iris is driven by it.** One tick travels the
   ring; two bracket marks denote an in/out range. **Aperture opening is a readout of playhead
   position within that range, not an exposure control.** That inverts the metaphor: this is a
   scrub position being displayed, which is why it is a timeline instrument rather than a lens.
4. **Blades move on a staggered lead/trail, not as a mechanical shutter.** Canon §6 requires
   "lead/trail transitions — next frame enters slightly before previous exits (J-cut/L-cut
   logic)". Blades therefore open in a staggered cascade on `--ease-connective`, reading as an
   edit rhythm. A real iris snaps all blades in unison; that is precisely the reading to avoid.

#### The three required states (Section 9)

| State | Where | Form |
|---|---|---|
| **Full** | Hero (Direction C moment, canon §1) | R3F. Six glass blades sharing `GLASS_PROPS` with `GeminiStar.jsx` for material continuity; **one** `VideoTexture`, segmented per blade by baked UVs; timecode ring; playhead. Hover uses `--ease-revelation`/`--duration-revelation` — `DESIGN_SYSTEM_TOKENS.md:177` names the signature 3D element as the one component where those tokens are expected |
| **Reduced** | Transitions, loading | SVG line-form. Blade outlines + tick ring + playhead, stroke only, **no footage and no WebGL** — so a loading state never spins up a GL context. Draw-on via `stroke-dashoffset`; iris close/open is the transition beat; playhead sweep carries loading progress |
| **Minimal** | Footer, favicon | SVG mark: ring + six blade seams + one playhead notch, solid ink, no labels (unreadable below ~24px). The off-axis playhead notch is what keeps the mark identifiably *this* and not a generic hexagon or shutter icon |

**One silhouette source.** Blade count, blade profile, tick counts and playhead angle live in a
single module consumed by all three states, following the `geminiVideos.js` +
`starVideoRegions.js` precedent where one array drives both geometry and content so the two
cannot drift. Three hand-drawn states that merely resemble each other would not be an identity
system.

**Direction C scope.** Only the full state is a Direction C exception. Reduced and minimal are
Direction A — restrained, instrument-like, no overshoot — so the mark does not read as a break in
composure every time it appears (canon §1's closing rule).

#### Asset requirement, stated before build

The full state wants **one 3×2 grid composite video** — six moments of the reel in one file,
silent, encoded to the §0.10 budget class (CRF ~26, audio stripped). One file means **one decode
instead of six**, which is §0.9's point 2: the motif's reduced/minimal states and the media-cost
fix are the same work. Until that composite exists, the component samples six cells from an
existing clip, which reads as six *crops* of one frame rather than six moments — a visible
placeholder, not the design.

#### Risks carried into the build

- **Cell resolution.** Six cells of a 640×360-class grid are ~213×180 each — likely too soft on a
  large hero blade. The composite may need to be 1280×720 (cells ~426×240) or larger. To be
  measured on the real render, not assumed.
- **Glyph risk is mitigated, not eliminated.** The four refinements above are the mitigation;
  whether the mark still reads as a camera shutter at favicon scale must be checked visually at
  16/24/32px, since the timecode ring — the strongest non-camera signal — is exactly what drops
  out at that size.
- **Radial symmetry fights `COMPOSITION_PRINCIPLES.md` §5.** That section flags the Opening Frame
  failure of "text and signature object both independently centered — coincidence, not
  composition", and a concentric ring is the most centrable form possible. The Hero wiring (a
  separate sign-off) must therefore place the Gate deliberately — off-centre, cropped by a frame
  edge, or anchoring the headline — and §5 asks to be revisited specifically once the real asset
  exists. It now does.

#### Built — Phase 2 isolation (2026-10-04)

Phase 2's acceptance criterion ("renders correctly in all three states in isolation, before it's
wired into transitions") is met. **Not wired into the Hero or the transition system** — a dev-only
`/motif-lab` route is the only mount, registered behind `import.meta.env.DEV`, and the production
bundle was checked to contain no trace of the motif or the lab.

| File | Role |
|---|---|
| `src/lib/apertureGeometry.js` | The one silhouette source. Three.js-free, so the SVG states never pull the WebGL chunk back onto the critical path (§0.14) |
| `src/components/motif/ApertureGateFull.jsx` | Full state — R3F scene content only; no Canvas, no lights |
| `src/components/motif/ApertureGateReduced.jsx` | Reduced state — SVG line-form, no WebGL |
| `src/components/motif/ApertureGateMark.jsx` | Minimal state — filled SVG mark |
| `src/pages/MotifLab.jsx` | The isolation harness; owns the Canvas and reuses Hero.jsx's exact lighting rig |

**Three geometry findings, all measured on the render rather than styled by eye.** They are
recorded because each one looks correct right up until it is checked:

1. **Only one swing direction actually opens the iris.** The other keeps every blade inside the
   housing and looks tidy in the numbers, but the centre stays covered at every angle — it never
   opens. The test that catches it is whether the origin is *outside all six blades*, not how far
   the nearest blade edge sits from it.
2. **Opening necessarily throws blades outside the housing, so both states clip.** The SVG uses a
   `clipPath`; the 3D uses a radial `discard` whose clip centre is derived per blade
   (`|v_local + Rot(-φ)·pivot| ≤ APERTURE_R`), which avoids a per-frame matrix inversion and stays
   correct under any transform applied to the gate. A background-coloured mask ring was rejected:
   it breaks the moment anything sits behind the canvas.
3. **Build radius and housing radius have to differ.** Building blades against the same disc they
   are clipped to caps the hole at ~0.19, because the blades' own outer arcs rotate off the rim and
   open wedge gaps right at the edge. Oversizing the blades (build 1.15, housing 0.80) puts those
   gaps outside the housing — where a real iris also hides them — and the hole reaches 0.27 with
   the aperture still reading as solid. The SVG hid this bug for a while because its blade fill is
   the page background, so the gaps were invisible there and only showed once footage was mapped.

**Verified:** all three states in both themes; the mark at 16/24/32/64/128px and inverted on ink;
`npm run lint` clean; `npm run build` green; no console errors or exceptions.

**Deferred, unchanged from the risks above:** the 3×2 grid composite does not exist, so the full
state currently samples six crops of one clip and the footage is visibly soft — the cell-resolution
risk, now confirmed on the render rather than predicted. The Hero placement question
(`COMPOSITION_PRINCIPLES.md` §5) is untouched and belongs to the wiring sign-off.

---

## 10. Project (Case Study) System

- Routing: resolve whichever conflict Phase 0 actually finds live in the repo (see Phase 0 findings) — don't assume this blueprint's original recommendation is still correct once real findings exist
- Each project: hero media (video preferred, poster-image fallback), one restrained palette/lighting treatment distinct from neighboring projects, and a fixed metadata block — date, role/discipline tags (drawn from the discipline list in Section 1), one-line outcome, "next project" affordance
- Consistency lives in the *metadata block and layout grid*; variation lives in the *palette and media* — adopt that split as a principle (Section 2), not the reference's literal floor-grid-plus-HUD staging. A project "moment" can be a lighting/color/camera shift within your own layout language; it doesn't need a 3D gallery floor or crosshair markers to read as deliberate

---

## 11. 3D / WebGL Evaluation

Retain React Three Fiber, but scope it deliberately:
- Keep it where it already earns its place: the Hero and the signature motif's various states
- Do not expand it into a full persistent 3D "world" behind every frame purely to chase the reference literally — that is a large performance and engineering surface for a personal portfolio and was explicitly not requested as a literal copy
- Isolate any R3F canvas so it can be unmounted/paused when its frame isn't in view (both for performance and for battery/mobile behavior)

---

## 12. Responsive Experience

- **Desktop:** full motion system, full 3D signature motif, frame-to-frame handoff choreography at full complexity
- **Tablet:** retain the frame structure and per-project palette shifts; simplify the handoff choreography (shorter timelines, fewer simultaneous layers)
- **Mobile:** the signature motif renders as a lighter-weight asset (reduced geometry or a pre-rendered loop instead of live R3F, if performance testing in Phase 9 requires it); frame transitions become simpler scroll-triggered fades/slides rather than full camera-move choreography; navigation collapses to a standard mobile pattern — motion restraint here is a feature, not a compromise

---

## 13. Performance

- Lazy-load and code-split each frame's heavy dependencies (GSAP plugins, R3F canvas) so the initial bundle only pays for the Hero
- Preload the signature motif's assets specifically (it's the highest-reuse asset in the system) and defer per-project media until its frame nears the viewport
- Video: poster-frame-first, load full video on intersection, not on page load
- Fonts: preload Amiamie's critical weights only; system-font fallback stack defined so there's no invisible-text flash
- ~~Budget check before Phase 10: Lighthouse performance score on mobile, not just desktop — your own prior notes already target Lighthouse 95+~~ — **superseded for `/` only, see §0.14.** A lab Performance score is not a meaningful target for a page with an intentionally persistent animated hero (Section 9/11); `/` is budgeted against field metrics (LCP/CLS/INP) instead. The 95+ lab target still applies unchanged to static/content pages (`/projects/:slug`).

---

## 14. Accessibility

- Full keyboard navigation across all five frames, including any custom scroll-hijacking behavior from Lenis (this is the most common place cinematic scroll sites break accessibility — verify explicitly)
- Reduced-motion media query: keep content reveals, drop camera-move/parallax layers entirely (not just shorten them)
- Semantic heading order preserved even though visual hierarchy is now differentiated per frame (Gap 2) — visual weight and semantic level are not the same axis
- Focus states visible against every one of the per-project palettes from Gap 4, not just the default dark theme — check this explicitly per project

---

## 15. SEO

- Preserve existing meta/OG/Twitter card setup (already present and correctly filled per the current metadata)
- Resolve routing (Section 10) before adding canonical tags per project page, so canonical URLs don't need to change twice
- Ensure per-project pages have unique titles/descriptions once the case-study system ships — this is currently blocked on the routing decision

---

## 16. Design System Tokens

Extend the existing token set (which already includes `--ease-connective`) with:
- ~~Per-frame typographic scale tokens (Section 7)~~ — **struck, see §0.11.** Contrary to `HIERARCHY_SYSTEM.md`; the canonical scale in `DESIGN_SYSTEM_TOKENS.md` §2 is global, not per-frame, and is already fully implemented.
- ~~Two motion-curve tokens: connective (frame handoffs) and interactive (micro-interactions)~~ — **already built.** Canon defines *four* curves and all four exist in `src/index.css` and `src/lib/motion.js` (§0.2).
- Per-project palette tokens, scoped so they don't leak into global theme
- Signature-motif material tokens (the states from Section 9)

---

## 17. Technical Architecture Mapping

Because this session couldn't inspect the live repo, this section defines the *kind* of change per area rather than exact file paths — Phase 0's output should replace the bracketed placeholders with real paths before Phase 1 begins.

| Area | Kind of change |
|---|---|
| Frame transition orchestration | New — this logic doesn't exist yet (`--ease-connective` is unused) |
| Heading components per frame | Refactor — apply Hierarchy System doc |
| Signature motif component | Refactor/extend — evolve existing Hero 3D asset into a shared, multi-state component |
| Project/case-study routing | Refactor — collapse to one canonical pattern |
| Project/case-study page template | New or refactor, depending on Phase 0 findings on the in-progress case-study system |
| Contact form submission | Refactor — wire real email provider in place of simulation |
| Design tokens file | Extend — add tokens from Section 16 |

---

## 18. Master Implementation Plan

**Phase 0 — Baseline, Audit & Repo Hygiene**
- Objective: Ground every reference in this blueprint against the real repository; produce a concrete file map replacing Section 17's placeholders
- Prerequisites: None
- Work: Inventory current components/routes; visually audit the live rendered site (screenshot each frame); classify any leftover template surface area per the existing documentation policy (Canonical / Superseded / Unknown); confirm current Lighthouse baseline
- Acceptance criteria: A filled-in version of the Section 17 table with real paths; a baseline performance/accessibility report; an explicit decision on `/work/[slug]` vs `/projects/:slug`
- Do NOT change: Any actual code yet

**Phase 1 — Design Tokens (Typography + Motion)** — **COMPLETE 2026-10-01, see §0.11**
- Objective: Implement Section 7 and Section 16's token additions
- Prerequisites: Phase 0
- Outcome: **All 19 canonical tokens from `DESIGN_SYSTEM_TOKENS.md` §2 and §4 were already present** in `src/index.css` at the documented values — the full type scale, `--content-max-width: 65ch`, four easing curves and four durations. The per-frame type-scale work was struck as contrary to `HIERARCHY_SYSTEM.md`. The one genuinely unmet canonical item in §2 — "convert `.otf`/`.ttf` to `.woff2` before implementation" — **was done** (§0.11), which is what this phase actually delivered.
- Do NOT change: Visual layout yet — this phase is tokens only

**Phase 2 — Signature Motif System**
- Objective: Build the multi-state signature motif (Section 9)
- Prerequisites: Phase 0 (asset audit)
- Work: Extend the existing Hero 3D asset into a shared component with full/reduced/minimal states; verify it can mount in the footer/final frame and in a loading state
- Acceptance criteria: The motif renders correctly in all three states in isolation, before it's wired into transitions

**Phase 3 — Frame Transition / Continuity Engine**
- Objective: Close Gap 1 — the highest-priority gap
- Prerequisites: Phases 1–2
- Work: Build the GSAP timeline(s) that connect each frame's exit to the next frame's entrance, driven by `--ease-connective`; integrate the signature motif's reduced state as the connective visual thread between frames
- Acceptance criteria: Scrolling through all five frames reads as one continuous gesture, verified by recording a full scroll-through and reviewing it against the reference's *pacing principles* (not its literal visuals)
- Do NOT change: Frame order or content (Section 6)

**Phase 4 — Hero Refinement**
- Objective: Apply Section 7's Hero typography spec; confirm the signature motif's full state is the centerpiece
- Prerequisites: Phases 1–3
- Acceptance criteria: Hero passes a "first five seconds" review — does it say the least and take up the most space, per Section 7
- **Deferred decision point, see §0.14:** whether the Hero's R3F render loop should eventually settle to a rest state (render-on-demand after the entrance/idle motion has been visible for some period) rather than running `frameloop="always"` indefinitely. Not resolved in Phase 0 — §0.13/§0.14 only implemented and measured a visibility-based pause (off-screen stops the loop entirely; on-screen behavior is untouched). Revisit here, with the full Hero motion spec in view, not as a Phase 0/perf-branch decision.

**Phase 5 — Project / Case Study System**
- Objective: Close Gap 4; resolve the routing conflict permanently
- Prerequisites: Phase 0's routing decision, Phase 1 tokens
- Work: Finalize `/work/[slug]`; build per-project palette scoping (Section 16); implement the consistent metadata block; complete whatever remained in-progress from the prior case-study system work
- Acceptance criteria: At least two real projects render with distinct palettes but identical metadata-block layout

**Phase 6 — About / Capabilities Hierarchy Application** — **REFRAMED, see §0.11**
- Objective: ~~Apply Section 7's editorial and systematic type treatments~~ → Apply `HIERARCHY_SYSTEM.md` §3's **pacing / density / restraint** treatment to these two frames. Note §3 explicitly credits Capability Map as having *already* solved this via its grid density, and warns: "don't undo it by adding a heading-size change on top of a mechanism that's already working."
- Prerequisites: Phase 1
- Acceptance criteria: About reads as editorial copy; Capabilities reads as a systematic toolkit, not a list — achieved through surrounding pause, element count and measure, **not** type size. Each frame must still have exactly one focal point per `HIERARCHY_SYSTEM.md` §5.

**Phase 7 — Contact & Real Email Provider**
- Objective: Replace the simulated submission with a live provider
- Prerequisites: None (can run in parallel with Phases 4–6)
- Acceptance criteria: A real test submission is received

**Phase 8 — Responsive Adaptation**
- Objective: Implement Section 12 across tablet and mobile
- Prerequisites: Phases 3–5 (transitions and project system must exist before they can be adapted down)
- Acceptance criteria: Mobile version reviewed as its own intentional design, not a scaled-down desktop screenshot

**Phase 9 — Performance Pass**
- Objective: Implement Section 13; re-baseline Lighthouse against Phase 0's numbers
- Prerequisites: All content/motion phases complete
- Acceptance criteria: ~~Mobile Lighthouse performance score meets the 95+ target from your existing standard~~ — **superseded for `/` only, see §0.14.** `/` is re-baselined against field metrics (LCP/CLS/INP, real-user thresholds); the 95+ lab score target applies to `/projects/:slug` and any future static/content pages.

**Phase 10 — Accessibility & Reduced Motion**
- Objective: Implement Section 14
- Prerequisites: Phase 3 (transition system must exist to build its reduced-motion fallback) and Phase 5 (per-project palettes must exist to check focus-state contrast against each)
- Acceptance criteria: Full keyboard walkthrough passes; reduced-motion mode preserves all content
- **Explicit scope addition, see §0.14:** validate the `#CFA355` accent color for contrast against the dark theme background wherever it's used for text, not only as a decorative/border accent. Flagged as open in §0.11 and again in §0.13; `/` currently has 24 `color-contrast` Lighthouse failures that may share this root cause. This item belongs to this phase, not a future unscheduled pass.

**Phase 11 — SEO Verification**
- Objective: Implement Section 15
- Prerequisites: Phase 5 (routing must be final)
- Acceptance criteria: Unique meta per project page; no regressions on existing meta/OG setup

**Phase 12 — Polish & Definition of Done Review**
- Objective: Final pass against Section 19's checklist in full
- Prerequisites: All prior phases

---

## 19. Implementation Dependency Graph

```
Phase 0 (Audit)
   ↓
Phase 1 (Tokens: type + motion)  ──────┐
   ↓                                    │
Phase 2 (Signature Motif)               │
   ↓                                    │
Phase 3 (Transition/Continuity Engine)  │
   ↓                    ↓               │
Phase 4 (Hero)     Phase 5 (Projects) ←─┘   Phase 7 (Contact) [parallel, independent]
        ↓                ↓
        Phase 6 (About/Capabilities)
        ↓                ↓
        Phase 8 (Responsive)
        ↓
        Phase 9 (Performance)
        ↓
        Phase 10 (Accessibility)  ← needs Phase 3 + Phase 5
        ↓
        Phase 11 (SEO)  ← needs Phase 5 routing final
        ↓
        Phase 12 (Polish / Definition of Done)
```

Phase 7 (Contact) has no dependency on the motion/visual chain and can run any time after Phase 0.

---

## 20. Risk Register

| Risk | Mitigation |
|---|---|
| Rebuilding the transition engine breaks the already-working GSAP+R3F+Lenis integration | Build Phase 3 as an additive layer with feature-flag rollback; don't modify the existing R3F canvas internals, only orchestrate around them |
| Chasing the reference's literal 3D-world too closely creates a mobile performance/accessibility trap | Section 11 explicitly scopes R3F usage; Phase 9 re-baselines against the 95+ Lighthouse target before ship |
| Per-project palette variation (Gap 4) drifts into visual clutter across many projects | Palette tokens are scoped and reviewed together (Phase 5 acceptance criteria requires side-by-side review, not one project in isolation) |
| Heading hierarchy differentiation (Gap 2) is applied inconsistently across frames | Phase 6 explicitly requires a side-by-side comparison against Hero before sign-off |
| Routing change breaks any existing inbound links to `/projects/:slug` | Add a redirect from the deprecated pattern to `/work/[slug]` in Phase 5, don't just delete it |
| Reduced-motion users lose content, not just motion | Phase 10 acceptance criteria is explicit: content must be preserved, only the camera/parallax layer is dropped |
| Scope creep back into "add more effects" | Section 5's constraint is restated at the top of Phases 2–5 specifically, the phases most likely to attract it |

---

## 21. Definition of Done

**Creative**
- [ ] The site demonstrates, rather than states, that video/motion/sound/web/frontend are one integrated practice
- [ ] A first-time visitor can articulate "what this person does" within the Hero alone

**Visual**
- [ ] Each frame is **compositionally** distinct (Gap 2, as reframed in §0.11 — distinctness via `layout` + pacing/density/restraint, not type size)
- [ ] The signature motif appears in at least three states across the site (Section 9)
- [ ] No section relies on a generic AI/SaaS-gradient treatment

**UX**
- [ ] Projects are presented as the clear hero of the site, not competing with decorative UI
- [ ] Navigation and utility chrome stay visually quiet relative to hero/project media

**Motion**
- [ ] Every frame-to-frame handoff runs through `--ease-connective` (Gap 1 closed)
- [ ] Motion hierarchy from Section 8 is verifiable — at least one clearly "rare/signature" moment exists and is distinct from routine micro-interactions

**Technical**
- [ ] `/work/[slug]` vs `/projects/:slug` conflict is resolved with a redirect in place
- [ ] Contact form delivers to a real inbox
- [ ] No monolithic components — signature motif, transition engine, and project system are each independently reusable

**Performance**
- [ ] ~~Mobile Lighthouse performance ≥ 95~~ — **superseded for `/`, see §0.14.** Applies to `/projects/:slug` and future static/content pages unchanged. `/`'s acceptance criteria is field LCP/CLS/INP at real-user thresholds (§0.14) — TBT/TTI/overall Performance are not meaningful scores for a page with an intentionally persistent animated hero (Section 9/11).
- [ ] Heavy dependencies (GSAP plugins, R3F canvas) are code-split per frame

**Responsive**
- [ ] Mobile version was designed, not scaled down (Section 12 reviewed as its own artifact)

**Accessibility**
- [ ] Full keyboard walkthrough passes across all frames including custom scroll behavior
- [ ] Reduced-motion mode preserves all content
- [ ] Focus states are visible against every per-project palette

**SEO**
- [ ] Unique meta per project page
- [ ] No regression on existing OG/Twitter card setup

---

*End of blueprint. Next step: open a Claude Code session against the repository, run Phase 0, and fill in Section 17's file map before touching any other phase.*

---
---

# Phase 0 Findings — Baseline, Audit & Repo Hygiene

**Executed:** 2026-10-01 · against `main` @ `e901762` (working tree clean)
**Method:** Full file-tree inventory, import-graph trace, exact-path asset reference check, `npm run build`, and a Lighthouse 12.8.2 mobile audit against the real production build.
**Scope honored:** No component code was written or edited. The only file changed is this one.

> **Read this section before Section 1.** Section 0 of this blueprint was explicit that its
> picture of the current build came from prior-session notes rather than repo access, and that
> Phase 0's first job was to close that gap. The gap turned out to be large. **Sections 1, 3, 4,
> 10 and 17, and Phases 1, 3, 5, 7 and 9, all contain claims that do not match the repository.**
> Where this section and the body of the blueprint disagree, this section is correct — it was
> measured, not inferred.

---

## 0.1 Stack correction — the blueprint describes the wrong framework

Section 1 states the stack is "Next.js 15 (App Router) + TypeScript — migrated off an original
Vite/React starting point." **No such migration happened.** The repo is still Vite + React, and
there is no TypeScript.

| Section 1 claim | Reality | Evidence |
|---|---|---|
| Next.js 15, App Router | **Vite 6** SPA, `react-router-dom` v7 | `package.json`, `vite.config.js`, `src/App.jsx` |
| TypeScript | **Plain JSX/JS.** `@types/*` are devDeps only; zero `.ts`/`.tsx` files | file tree |
| React Hook Form + Zod | **Neither is installed.** Validation is hand-rolled | `package.json`; `src/components/ContactForm.jsx:8` |
| Contact submission "simulated", no provider | **Live via Resend**, in production | `api/contact.mjs:12`; `PROJECT_STATUS.md` |

This matters beyond pedantry: **`/work/[slug]` is Next.js file-route syntax and cannot exist in
this codebase.** React Router uses `:slug`. Every reference to `[slug]` in Sections 3, 10, 15, 21
and Phases 5/11 should be read as `:slug`.

**Also:** `node_modules` was absent at Phase 0 start — `npm install` is a prerequisite for any
later phase. Build verified green after install (`npm run build`, 3.66s, 735 modules).

---

## 0.2 Correction — `--ease-connective` is NOT unused

The blueprint asserts this in six places (Sections 1, 3, 4, 17, Phase 1, Definition of Done).
**It is false in both layers.**

- **CSS:** `src/index.css:250` defines it, and `src/index.css:379-383` consumes it for the
  theme crossfade.
- **JS:** `src/lib/motion.js:15` registers it as a GSAP `CustomEase` named `connective`,
  exported as `EASE.connective` and used at **three** call sites:
  `src/components/AnimatedHeaderSection.jsx:66`, `src/pages/ProjectPage.jsx:680`,
  `src/components/beu/BentoSection.jsx:175`.

Most significantly, `AnimatedHeaderSection.jsx:52-85` is **already an authored two-part
handoff** — a `connective` tween on the frame container followed by a `cinematic` tween on the
header content at `"<+0.2"`, with the in-code comment *"The frame arriving is the handoff
between frames — connective character, quicker and quieter than an entrance."*

**Revised Gap 1.** The gap is not "`--ease-connective` is unused" and not "frame transitions
don't exist." It is narrower and more precise: **the existing handoff is per-frame and
self-contained — each frame animates its own entrance on its own ScrollTrigger. No timeline
spans a frame boundary**, so there is no shared choreography between an outgoing frame's exit
and the next frame's entrance. Phase 3's actual job is to connect existing per-frame timelines,
not to build easing from nothing. Phase 1's task "wire `--ease-connective` so it's referenced"
is **already done and should be struck.**

---

## 0.3 Correction — the routing conflict is not live

**There is no conflict.** The codebase is uniformly `/projects/:slug`. `/work/` appears nowhere
as a route — every `work-*` match in the tree is a *video filename* (`work-01.mp4` …
`work-11.mp4`), not a path.

Current canonical surface, all consistent:

- `src/App.jsx:19` — `<Route path="/projects/:slug" …>`
- `src/lib/seo.js:51` — `PROJECT_PREFIX = "/projects/"`
- `src/sections/Works.jsx:191,285` — navigation targets
- `scripts/prerender-meta.mjs` — emits `dist/projects/<slug>/index.html`
- Live and verified in production for three slugs (`PROJECT_STATUS.md`)

**Revised recommendation — adopt `/projects/:slug`, do not rename.** The blueprint preferred
`/work/[slug]` on the strength of prior-session "canonical" language, but that pattern was never
implemented, while `/projects/:slug` is shipped, prerendered, indexed, and has live inbound URLs.
Renaming would mean touching five files, regenerating prerendered meta, and adding redirects —
real cost and SEO risk to resolve a conflict that does not exist. Section 3's REMOVE item,
Phase 5's "Finalize `/work/[slug]`", the Section 20 redirect risk row, and the Section 21
technical checkbox are all **moot and should be struck.** Phase 11 is unblocked now, not after
Phase 5.

**Section 10's routing bullet is already reconciled** — the blueprint revision of 2026-10-01
rewrote it to defer to "whichever conflict Phase 0 actually finds live in the repo" rather than
presuming `/work/[slug]`. This section supplies that answer: **no conflict exists; the live
pattern is `/projects/:slug` and it stays.**

---

## 0.4 BLOCKER — the canonical documentation is not in this checkout

`docs/` **is an empty directory.** It is registered as a gitlink (`160000
22ff2fd3a260c82f7d60d4dc94fd28f1d75eb709`) pointing at a separate private repo
(*Claude-Manual*), with **no `.gitmodules` entry** — so it is not a registered submodule and
`git submodule update` fails (`no submodule mapping found in .gitmodules for path 'docs'`). No
file was ever tracked under `docs/` in this repo's history.

Unavailable as a direct result — every one of these is referenced by name in code comments or
by this blueprint:

`START_HERE.md` · `HIERARCHY_SYSTEM.md` · `COMPOSITION_PRINCIPLES.md` ·
`TRANSITION_PHILOSOPHY_CANONICAL.md` · `DESIGN_SYSTEM_TOKENS.md` ·
`CREATIVE_DIRECTION_BOARD.md` · `CHANGELOG_ARCHIVE.md` · `engineering/DEPLOYMENT_PLAN.md` ·
`engineering/CONTACT_FORM_ARCHITECTURE.md`

**Consequences, stated plainly:**

1. `CLAUDE.md` mandates reading `docs/START_HERE.md` before any design decision, and declares
   the documentation canonical and authoritative over implementation. **That instruction cannot
   currently be satisfied.**
2. Phase 0 was asked to classify template leftovers "per the existing documentation policy
   (Canonical / Superseded / Unknown)." **That policy document is unavailable**, so §0.5 applies
   the three labels by their plain meaning and marks the basis as provisional.
3. **Phases 1, 2, 6 and 7 all have an unmet prerequisite.** Phase 1 implements "Section 16's
   token additions" and Phase 6 applies the Hierarchy System — both specified as *the literal
   spec* from docs that aren't here.

**Required before Phase 1:** clone/restore the docs repo into `docs/`, and either add a proper
`.gitmodules` entry or record the arrangement explicitly. This is the single highest-priority
Phase 0 output.

> **RESOLVED 2026-10-01.** `docs/` has been cloned from `IridescentGlow/Claude-Manual` and its
> HEAD is exactly the pinned gitlink commit `22ff2fd`, so the working tree now matches what the
> parent repo records. All 15 canonical documents are present and Phases 1, 2 and 6 are
> unblocked. Two notes: the missing `.gitmodules` entry is **still** missing — the arrangement
> is unchanged, only the checkout is restored — and `START_HERE.md` §1 lists canonical doc 13 as
> `PROJECT_PAGE_SYSTEM.md`, "the `/projects/:slug` depth layer", which independently confirms
> §0.3's routing answer from the canonical side.

---

## 0.5 Template leftover audit (Ali-Sanati `awwwards-portfolio`)

Classified by actual reachability from `src/main.jsx`, verified by import-graph trace and
exact-path (not substring) reference search. **Basis is provisional** per §0.4.

### Superseded — dead, safe to remove

| Surface | Evidence |
|---|---|
| `src/components/Planet.jsx` | **Imported by nothing.** Superseded by `src/components/GeminiStar.jsx` |
| `public/models/Planet.glb` | Referenced only by the dead `Planet.jsx` |
| `public/images/man.jpg` | Zero references |
| `public/assets/backgrounds/blanket.jpg`, `table.jpg` | Zero references (`curtains/map/poster.jpg` **are** used by `src/constants/index.js`) |
| `public/assets/projects/{apple-tech-store,electronics-store,game-store,home-decor-store,mobile-accessories-store,plant-shop}.jpg` | Template demo projects. Zero references. `src/constants/index.js:193` explicitly calls `game-store.jpg` "the template's leftover" |
| `public/assets/projects/Star-Iridescent.svg` | Zero references |

Removing these deletes no reachable behavior. **Deferred to a Phase 0 hygiene commit — not done
here, since this task was audit-only.**

### Canonical — template-derived but deliberately retained and substantially rewritten

`src/components/AnimatedHeaderSection.jsx` (now carries the `layout` composition system),
`AnimatedTextLines.jsx`, `Marquee.jsx`, `src/lib/motion.js`, and the five `src/sections/` frames.
These began as template files but are load-bearing and heavily modified.

### Unknown — flagged, not guessed

| Surface | Why unclear |
|---|---|
| `public/images/photo.jpg` | **Still the template's stock photo**, live in `src/sections/About.jsx`. Already flagged in `PROJECT_STATUS.md` as blocked on a real portrait. Reachable, so not dead — but not intended final content either. Needs an asset decision, not a code decision |
| `src/components/reel/StarField2D.jsx` | Reachable via `ReelIntro`, but overlaps the Section 9 signature-motif remit. Keep/fold-in is a Phase 2 design call |
| `.theme-init` class in the `src/index.css:378` crossfade selector | Already self-flagged as dead in `PROJECT_STATUS.md`. Trivial, but touches the theme cascade — not a blind delete |

---

## 0.6 Lighthouse baseline (mobile) — Performance is UNSCOREABLE

Lighthouse 12.8.2, `--form-factor=mobile`, simulated throttling, against `npm run preview` of
the real production build (`http://localhost:4173/`).

| Category | Score |
|---|---|
| Performance | **`null` — could not be computed** |
| Accessibility | **96** |
| Best Practices | **100** |
| SEO | **92** |

> **Environment note:** no Chromium-family browser was installed on this machine. Chrome for
> Testing 154.0.8037.57 was downloaded to `~/.cache/puppeteer/` to run this audit. The bundled
> Chrome DevTools MCP could not be used — it resolves Chrome only at `/opt/google/chrome/chrome`
> — so later browser-QA phases should either use the Lighthouse CLI with `CHROME_PATH` as done
> here, or install Chrome at that system path.

### Why Performance returned null

`largest-contentful-paint`, `total-blocking-time` and `interactive` all failed with
**`NO_LCP`** — the page never produced a Largest Contentful Paint at all, so the category has no
basis to score. What *was* measured:

| Metric | Value |
|---|---|
| First Contentful Paint | **4.1 s** (score 0.22) |
| Speed Index | 4.1 s (score 0.80) |
| Cumulative Layout Shift | **0** (score 1.00) — genuinely good |
| **Total page weight** | **20,425 KiB (≈20 MB)** |
| Main-thread work | **179.6 s** |
| Script bootup time | **94.1 s** |

### Root cause: ~17.6 MB of video on initial homepage load

27 requests. Media alone is 17,638 KiB — **86% of total weight** — all eager:

| Asset | Transfer |
|---|---|
| `/assets/projects/reel.mp4` | **7,704 KiB** |
| `/videos/optimized/work-05.mp4` | 2,564 KiB |
| `/videos/optimized/work-11.mp4` | 2,369 KiB |
| `work-03 / work-10 / work-06 / work-01.mp4` | 1,143 / 1,045 / 987 / 814 KiB |
| `editor-portfolio/work-01.mp4`, `medi-help.mp4` | 576 / 435 KiB |
| `backgrounds/curtains · poster · map .jpg` | 604 / 584 / 565 KiB (1,847 KiB images total) |
| `/assets/index-*.js` | 438 KiB (single chunk — build warns >500 KiB pre-gzip) |
| `/models/3d-star.glb` | 346 KiB |

The six `work-*.mp4` files are `GeminiStar.jsx` video textures (`src/constants/geminiVideos.js`).
Combined with a homepage render gate that withholds all content until
`useProgress() === 100` (`src/pages/HomePage.jsx:21-25`), the page cannot settle — which is
very likely *why* no LCP is ever recorded.

### This materially changes Phase 9

Phase 9 is written as "re-baseline against Phase 0's numbers" with a 95+ target. **There is no
Phase 0 performance number to re-baseline against, and the distance is not a polish gap.**
Section 13's remedies (lazy-load, poster-first video, defer per-project media) are correct in
kind but are scoped in the blueprint as a late tuning pass. On a 20 MB / 180 s-main-thread
baseline they are **structural work that should move much earlier** — Section 13's own
"poster-frame-first, load full video on intersection, not on page load" is precisely the
unfixed bug here. Recommend promoting the media-loading strategy to a Phase 1.5, ahead of
Phase 3's choreography work, since transition timing tuned on an unsettled page will have to be
re-tuned afterward.

### Accessibility 96 / SEO 92 — specific failures

- **`color-contrast` (24 nodes)** — e.g. `div.flex > div > h3.flex > span.mr-12`. Relevant to
  Section 14's per-palette focus/contrast requirement, which is thus failing *before* any
  per-project palettes are introduced.
- **`crawlable-anchors` (5 nodes)** — `react-scroll`'s `<Link>` (`src/sections/Navbar.jsx:110`)
  renders an `<a>` with **no `href`**, so the five in-page nav links aren't crawlable. A
  concrete, small Phase 11 item.

---

## 0.7 Section 17 — filled in with real paths

Replaces the placeholder table in Section 17. **"Kind of change" is corrected where Phase 0
found the work already done.**

| Area | Real paths | Kind of change (corrected) |
|---|---|---|
| Frame transition orchestration | `src/components/AnimatedHeaderSection.jsx:52-85` · `src/lib/motion.js` (`EASE`, `DURATION`, `SCROLL_REVEAL_START`) · `src/lib/useLenisScrollSync.js` · `src/pages/HomePage.jsx` | **Extend, not New.** Per-frame `connective`→`cinematic` handoff already exists; what's missing is a timeline spanning frame *boundaries* (§0.2) |
| Heading components per frame | `src/components/AnimatedHeaderSection.jsx` (`layout` prop: `split`/`centered`/`offset`) · `src/components/AnimatedTextLines.jsx` · callers `src/sections/{Hero,Works,About,Services,Contact}.jsx` | **Partly done.** Per-frame *composition* shipped (`About`→`offset:52`, `Services`→`centered:40`, `Contact`→`centered:48`, `Works`→`split` default). Per-frame *type scale* still pending — and blocked on `HIERARCHY_SYSTEM.md` (§0.4) |
| Signature motif component | `src/components/GeminiStar.jsx` + `public/models/3d-star.glb` · `src/constants/geminiVideos.js` · `src/lib/starVideoRegions.js` · `src/components/reel/StarField2D.jsx` · *(dead: `src/components/Planet.jsx`, `public/models/Planet.glb`)* | Refactor/extend. Note the motif's video textures are the single largest perf cost (§0.6). **Section 9's no-crystal/no-triangle constraint is already satisfied** — see §0.9 |
| Project/case-study routing | `src/App.jsx:19` · `src/lib/seo.js:51` · `src/sections/Works.jsx:191,285` · `scripts/prerender-meta.mjs` · `vercel.json` | **No change.** Already uniformly `/projects/:slug` (§0.3) |
| Project/case-study page template | `src/pages/ProjectPage.jsx` · `src/components/reel/{ReelIntro,MainReel,VideoConstellation,StarField2D}.jsx` · `src/components/beu/{BentoSection,BentoObject,beuBentoConfig}.jsx` · data in `src/constants/index.js` | Refactor. Three case studies complete, not mid-build |
| Contact form submission | `src/components/ContactForm.jsx` · `api/contact.mjs` (Resend, Vercel function) | **No change — already live.** Phase 7 is complete; strike it |
| Design tokens file | `src/index.css` (tokens ~L120-268; light-theme overrides L288-326) · JS mirror in `src/lib/motion.js` | Extend. **Any token change must be made in both files** — `motion.js` duplicates the curves as GSAP `CustomEase`s |

### Architecture facts for later phases

- **Frame order as built** (`src/pages/HomePage.jsx:57-64`): `Navbar → Hero → Works → About →
  ServiceSummary → Services → ContactSummary → Contact`. The five canonical frames are present
  in Section 6's order, interleaved with two marquee interstitials
  (`ServiceSummary`/`ContactSummary`) the blueprint never mentions — **these sit exactly at the
  frame seams Phase 3 must choreograph**, so they are part of Gap 1's surface, not decoration.
- **Known pre-existing bug, relevant to Phase 10:** `motion.js`'s reduced-motion collapse via
  `gsap.defaults({duration: 0})` is **inert** wherever a call site passes `duration:`
  explicitly — which is every call site. Measured in a prior session, recorded in
  `PROJECT_STATUS.md`. Phase 10 must fix `motion.js`, not just add fallbacks.
- **`PROJECT_STATUS.md` "Current milestone" is stale** — it describes Tier 1.1 (the
  `layout` prop) as the in-flight milestone, but it is built and shipped. Worth correcting when
  status is next updated.

---

## 0.8 Phase 0 acceptance criteria

| Criterion | Status |
|---|---|
| Filled-in Section 17 table with real paths | **Done** — §0.7 |
| Baseline performance/accessibility report | **Partial** — a11y 96 / BP 100 / SEO 92 captured; **Performance unscoreable (`NO_LCP`)**, §0.6. This is itself the finding, not a measurement failure |
| Explicit decision on `/work/[slug]` vs `/projects/:slug` | **Done** — adopt `/projects/:slug`; no conflict existed, §0.3 |
| Visual audit / screenshot each frame | **Not done** — deferred with the DevTools MCP browser limitation in §0.6 |
| No code changed | **Honored** — `BLUEPRINT.md` is the only modified file |

### Blockers to clear before Phase 1

1. **Restore `docs/`** (§0.4) — canonical specs for Phases 1, 2 and 6 are missing, and
   `CLAUDE.md`'s core instruction is unsatisfiable without them. Highest priority.
2. **Decide on promoting media-loading work ahead of Phase 3** (§0.6) — 20 MB initial load.
3. **Optional hygiene commit** removing the §0.5 Superseded files.

---

## 0.9 Addendum — against the 2026-10-01 blueprint revision (originality guardrail)

The blueprint was revised after Phase 0's audit ran, adding honesty note 3, the Section 2
principles/executions split, Section 9's no-crystal/no-triangle constraint, and Section 10's
deferral to Phase 0 on routing. Re-checking Phase 0's findings against those four changes:

**1. Section 9's constraint is already satisfied — no redirection needed.** The existing motif is
**a star, not a crystal or a triangle.** Verified by parsing the glTF directly: `3d-star.glb` is a
single mesh (`mesh_node`, 9,818 verts / 19,632 tris, positions+indices only — no normals, no UVs,
no embedded material). `GeminiStar.jsx` splits that one mesh into regions and maps **the site
owner's own reel footage onto them as live `THREE.VideoTexture`s**
(`src/constants/geminiVideos.js`, `src/lib/starVideoRegions.js`).

That is a stronger position than Section 9's fallback suggestions. Section 9 proposes starting
from "a waveform, a scrub/timeline marker, a compositing mask shape, a lens/aperture form" —
motifs drawn from the video/motion side of the practice. The built motif **already is** that: a
form whose surface is literally the owner's own edited video. The "one mark, many states"
principle can be developed from an asset that is native by construction, with no Alche
resemblance to design around.

**2. Phase 2's framing needs one adjustment.** Phase 2 says "extend the existing Hero 3D asset
into a shared component with full/reduced/minimal states." §0.6 found the motif's six video
textures are the single largest performance cost on the site (~9.9 MB of the 17.6 MB media
load). So the *reduced* and *minimal* states required by Section 9 are not only an identity
exercise — **they are also the performance fix**: a line-form or mark-form state that carries no
video is what makes the motif reusable in transitions, loading states and the footer without
re-paying that cost. Phase 2 and the §0.6 media work are the same piece of work approached from
two directions, which strengthens the case in §0.6 for pulling media strategy earlier.

**3. Section 2's "one continuous easing system driving every handoff"** is called out in the
revision as "the safest, most directly transferable item on this list." Per §0.2 it is **already
built** — four named GSAP `CustomEase` curves in `src/lib/motion.js` mirroring the CSS tokens,
with `connective` reserved for handoffs. The transferable technique is in place; only the
cross-frame-boundary timeline is missing.

**4. Section 10's routing deferral** is answered in §0.3: no conflict exists, `/projects/:slug`
is live and stays.

**No Phase 0 finding is invalidated by the revision.** The stack correction (§0.1), the
`--ease-connective` correction (§0.2), the routing answer (§0.3), the missing-`docs/` blocker
(§0.4), the template audit (§0.5) and the Lighthouse baseline (§0.6) all stand unchanged, and
**§0.4 remains the blocker on Phase 1.**

---

---

## 0.10 Media load fix — implemented and verified (2026-10-01)

Carried out after the docs were restored, so it is governed by canonical rules rather than
inference. `PROJECT_PAGE_SYSTEM.md` §6 requires a poster frame and mandates
`preload="metadata"` — **never `auto`** — because "a project page may hold several clips; they
must not all fetch in full on load"; §8 adds that mobile "should favour posters that play on
interaction over several simultaneous autoplaying videos". `TECH_STACK.md`'s VIDEO HANDLING
section forbids "huge uncompressed files" and requires assets be "optimized before use".

### Three causes, three fixes

**1. `src/sections/Works.jsx` — clips fetched behind `display: none` (~8.7 MB).**
Each project rendered a `<video autoPlay>` inside a `md:hidden` wrapper. CSS `display: none`
does not prevent a download, so all three preview clips fetched on *both* breakpoints —
`reel.mp4` alone was 7.7 MB. The `preload="metadata"` already there was inert, because
`autoPlay` obliges the browser to fetch media it has been told to play. Now the element renders
with its `poster` and **no `src`**, and an `IntersectionObserver` (`rootMargin: "200px"`, matching
the existing gallery observer in `ProjectPage.jsx`) attaches `src` only when the row nears the
viewport, then unobserves. Falls back to immediate attach where `IntersectionObserver` is
undefined. Note the pre-existing gallery observer gates *playback*, which saves no bytes;
withholding `src` is what saves bytes.

**2. `src/components/GeminiStar.jsx` — `preload="auto"` on six clips (§6 violation).**
Corrected to `preload="metadata"`, with `src` attached at wire-up rather than at element
creation.

**3. The texture clips were ~8× over-spec — the actual root cause.**
All six were **1280×720** (0.83–2.6 Mbps, ~8 s), while they are only ever sampled as textures on
star faces a few hundred pixels wide. Re-encoded to **640×360** (H.264, CRF 26, audio stripped —
they are silent textures): **8,920 KiB → 2,235 KiB, −75%**, with frame counts and aspect ratios
preserved. `work-11` keeps its 640×268 letterbox. Originals are recoverable from git.

Both other consumers were checked first: `reelConstellationConfig.js` renders the same six clips
as small floating panels, and `MainReel` uses `reel.mp4`, not these — so no consumer displays
them large enough to notice.

### An intermediate fix was reverted on evidence

Between 2 and 3, the six clips were loaded *sequentially* to stop them racing for bandwidth
before first paint. Once they were re-encoded that contention no longer existed, and
measurement showed sequencing **cost ~1.8 s of Speed Index** by holding the last clips back. It
was removed rather than kept "just in case" — the asset fix removed the need for the code
workaround.

### Verified result (Lighthouse 12.8.2, mobile, simulated throttling)

| Metric | Baseline | After | Change |
|---|---|---|---|
| **Total transfer** | 20,425 KiB | **5,111 KiB** | **−75%** |
| of which Media | 17,638 KiB | **2,237 KiB** | **−87%** |
| Main-thread work | 179.6 s | ~~20.5 s~~ | ~~−89%~~ — **unverified, does not reproduce; see §0.12** |
| Script bootup | 94.1 s | **4.8 s** | **−95%** |
| First Contentful Paint | 4.1 s | 4.1 s | unchanged |
| Speed Index | 4.1 s | 4.1 s | unchanged (regression reverted) |
| CLS | 0 | 0 | unchanged |
| Accessibility / Best Practices / SEO | 96 / 100 / 92 | **96 / 100 / 92** | no regression |

`npm run lint` clean and `npm run build` green after every step.

### `NO_LCP` is a separate bug, and it is now narrowed

Performance still scores `null`: bytes were not the cause. Trace inspection
(`--save-assets`) shows **zero `largestContentfulPaint::Candidate` events** and four
`NavStartToLargestContentfulPaint::Invalidate::AllFrames::UKM` events — no element ever
qualified as an LCP candidate.

The cause is **specific to the homepage**, established by controlled comparison rather than
inference: `/projects/medihelp`, which renders the *same* `AnimatedHeaderSection` with the same
`gsap.from(..., {opacity: 0})` entrance, **reports LCP normally at 5.8 s and scores performance
68.** That rules out the shared header and its opacity animation. What is left is homepage-only:
`HomePage.jsx:21-25`'s `useProgress()` gate, which holds every frame inside an `opacity-0`
wrapper until `progress === 100` and then swaps out the loading overlay — removing the only
paint candidate and invalidating LCP — plus the R3F canvas itself.

Fixing that means changing how the homepage's loading experience is composed, which is Phase 4
(Hero) and Phase 9 (Performance) territory, not a media-loading change. **Flagged, not
attempted.** Until it is fixed, the Section 21 "mobile Lighthouse performance ≥ 95" criterion
cannot be measured on `/` at all — though `/projects/:slug` now gives a real number (68) to
work against.

### Remaining media opportunities (not done)

- `public/videos/optimized/work-02/04/07/08/09.mp4` (~3 MB tracked) are **referenced nowhere** —
  the portrait clips left over from the removed side panels. A §0.5-style Superseded candidate,
  left in place pending a decision.
- `/assets/backgrounds/{curtains,poster,map}.jpg` are 565–604 KiB each (1,847 KiB total) and
  still load eagerly as `bgImage`. Next-largest win after this pass.
- The single JS chunk is 1,513 KiB (447 KiB gzipped) and still warns at build; route-based
  code-splitting is deferred per `FUTURE_IMPLEMENTATIONS.md`.

---

---

## 0.11 Phase 1 — closed, and Gap 2 reframed against canon (2026-10-01)

First phase executed with the canonical docs actually readable. Two findings, one of which
changes the redesign plan.

### Phase 1's tokens were already fully implemented

Every token in `DESIGN_SYSTEM_TOKENS.md` §2 and §4 is already present in `src/index.css`, at the
documented values — verified token by token:

- **§2 type scale (10/10):** `--text-display`, `--text-h1`, `--text-h2`, `--text-h3`,
  `--text-body-lg`, `--text-body`, `--text-body-sm`, `--text-label`, `--text-caption`,
  `--content-max-width: 65ch`
- **§4 motion (8/8):** `--ease-precise`, `--ease-cinematic`, `--ease-connective`,
  `--ease-revelation`, `--duration-micro`, `--duration-transition`, `--duration-reveal`,
  `--duration-revelation` — and all four curves are mirrored in `src/lib/motion.js` as GSAP
  `CustomEase`s (§0.2)

So Phase 1's "add tokens" work was a no-op. Its remaining item was contrary to canon, below.

### Gap 2's premise contradicts `HIERARCHY_SYSTEM.md` — struck on the user's decision

Phase 1's last task was "add per-frame type-scale tokens", the implementation of **Gap 2** and
Section 7. Canonical `HIERARCHY_SYSTEM.md` — written, per its own header, from the very critique
Gap 2 is derived from — prohibits exactly that:

| `HIERARCHY_SYSTEM.md` | Says |
|---|---|
| §1 (The Governing Rule) | "Hierarchy through contrast, not volume. **The strongest frame does not get bigger.** Everything around it gets quieter so it can land." Called "not optional texture — the test every hierarchy decision has to pass." |
| §2 (The Test) | Permitted mechanisms, in order: **pacing, density, restraint**, then composition/motion. "**Size/color increases are not on this list.**" |
| §4 | "**Explicitly not: larger type size** for the lead row. Size is the last resort, not the first." |
| §3 | On Capability Map: "**don't undo it** by adding a heading-size change on top of a mechanism that's already working." |

The blueprint prescribed the opposite ("Hero at maximum scale", "About at editorial
paragraph-weight", "Capabilities at label-scale"). `CLAUDE.md` gives canon precedence, and the
blueprint is a root-level phase document, not canonical.

**Decision (user, 2026-10-01): canon wins.** Gap 2's size premise is struck. Supersede markers
are now inline at Gap 2, Section 7, Section 16, Phase 1, Phase 6 and the Section 21 checklist so
no future session implements the struck version.

**Gap 2's actual intent is already satisfied.** Per-frame distinctness shipped structurally in
Tier 1.1's `layout` prop — `split` / `centered` / `offset`, where the full-bleed rule is
`split`'s signature, inset in `centered` and absent in `offset`. That is contrast without
volume: precisely the mechanism §1 calls for. Residual work belongs to Phase 6, reframed to
pacing/density/restraint.

Worth noting the canonical type scale is **global and role-based** (`--text-display` for the
opening headline, `--text-h1` for frame titles), not per-frame. A per-frame scale would have
fought the system it was supposedly extending.

### What Phase 1 actually delivered: the woff2 conversion

`DESIGN_SYSTEM_TOKENS.md` §2 carries one explicit, unmet action item: *"convert `.otf`/`.ttf`
source files to `.woff2` before implementation — required for load performance, not currently in
the template's asset set."* Zero `.woff2` existed; five `@font-face` rules served OTF with TTF
fallback and nothing was preloaded.

- Converted the six `Amiamie` faces to `.woff2` via `fontTools` (`public/fonts/amiamie/woff2/`).
  **All 419 glyphs preserved per face**, verified by reloading each output.
- `src/index.css` now lists `woff2` first in each of those six `src` stacks, keeping otf/ttf as
  fallback rather than deleting them — a browser without woff2 still needs a source and the files
  are already in the repo.
- The three `Amiamie-Round` faces are deliberately left on otf/ttf: §2 lists Round/Italic
  variants as "Reserved, not in default scale", and nothing in `src/` references that family.
- Added `rel="preload"` for **Light (300) and Regular (400) only**. Chosen on evidence, not
  taste: `src/` has 20 `font-light` call sites against 2 `font-normal` and **0** `font-black`,
  and `banner-text-responsive` sets no weight so it inherits Regular from `body`. LightItalic
  does load on the homepage but below the fold, so preloading it would compete with
  render-critical requests. `crossorigin` is required even same-origin or the font is fetched
  twice.

**Verified (Lighthouse 12.8.2, mobile, simulated):**

| Metric | Before | After |
|---|---|---|
| Fonts transferred | 134 KiB (3 × `.otf`) | **81 KiB (3 × `.woff2`), −40%** |
| **First Contentful Paint** | 4.1 s | **3.3 s, −0.8 s** |
| Speed Index | 4.1 s | **3.3 s** |
| Total transfer | 5,111 KiB | 5,059 KiB |
| a11y / best-practices / SEO | 96 / 100 / 92 | **96 / 100 / 92**, no regression |
| `font-display` audit | — | pass |

FCP had been pinned at 4.1 s through the entire media pass; the font preload is the first change
to move it. `npm run lint` clean, `npm run build` green, and the preload tags survive
`prerender-meta.mjs` on `/` and every `/projects/:slug`.

### Still open

- `NO_LCP` on the homepage is unchanged (§0.10) — still the blocker on any `/` performance score.
- `DESIGN_SYSTEM_TOKENS.md` §7's own open item stands: the accent `#CFA355` has never been
  contrast-validated against the dark background for *text* use. Related to §0.6's 24
  `color-contrast` failures; neither has been addressed.
- The canonical tokens exist but are **not yet consumed** by components — `AnimatedHeaderSection`
  still uses Tailwind utility classes and the bespoke `banner-text-responsive` rather than
  `--text-display` / `--text-h1`. Wiring components onto the token scale is real, unscheduled
  work that no blueprint phase currently owns.

---

---

## 0.12 `NO_LCP` resolved — the homepage now returns a real Performance score (2026-10-02)

The blocker carried since §0.6 is fixed. **Mobile Performance on `/` went from `null` to a
numeric score.** The cause was never media weight, and the fix was six lines.

### What the request assumed, and what was actually true

This pass was requested as "poster-image-first for every eager video (reel.mp4, the six
GeminiStar texture videos), with real video source deferred via IntersectionObserver." Two
parts of that premise did not survive contact with the repo:

1. **`reel.mp4` was already deferred.** `Works.jsx` has been poster-first since §0.10 —
   `poster={project.poster}`, `preload="none"`, no `src` until an `IntersectionObserver`
   attaches it. The baseline audit for this pass confirms it directly: `reel.mp4` does not
   appear in `/`'s network requests at all, and the only media left is the 2,237 KiB of star
   textures.
2. **Poster-first cannot apply to the six star clips.** They are
   `document.createElement("video")` (`GeminiStar.jsx:296`) used as `THREE.VideoTexture`
   sources and are **never attached to the DOM** — the file says so at :280-282. A `poster`
   attribute does nothing on a detached element, and `IntersectionObserver` cannot observe a
   node outside the document. The star's existing plain-glass fallback already *is* the poster
   equivalent.

More importantly, media was already ruled out as the cause: §0.10 cut it 87% (20.4 MB → 2.2 MB)
and `NO_LCP` did not move.

### The actual cause — an `opacity-0` wrapper

`HomePage.jsx` gated all five frames behind `opacity-0` until `useProgress()` hit 100:

```jsx
<div className={`${isReady ? "opacity-100" : "opacity-0"} transition-opacity duration-1000`}>
```

Chrome emits Largest-Contentful-Paint candidates **at paint time**. Content painted inside an
`opacity: 0` ancestor is not a candidate, and later animating that opacity to 1 emits no new
candidate, because no fresh first paint occurs. Meanwhile the loading overlay — the only thing
painting at full opacity — was **unmounted** the instant `isReady` flipped, invalidating the one
candidate it had supplied. Net result: zero surviving candidates, matching the trace exactly
(0 `largestContentfulPaint::Candidate` events, 4 `Invalidate` events).

This is also why §0.10's controlled comparison held: `/projects/medihelp` runs the same
`AnimatedHeaderSection` with the same `gsap.from(..., {opacity: 0})` entrance and reported LCP
normally — it has no `useProgress` wrapper.

**The fix inverts the crossfade.** Content now paints at full opacity from the first frame,
hidden behind the opaque full-viewport overlay, and the *overlay* fades itself out to reveal it
(unmounted on a timer matched to its own `duration-700`). Visually equivalent — verified by
screenshot at 390×844: star, headline and positioning statement all render correctly, overlay
cleanly gone.

### Verified result (Lighthouse 12.8.2, mobile, simulated)

| Metric | Before | After |
|---|---|---|
| **Performance score** | **`null` (NO_LCP)** | **35** |
| Largest Contentful Paint | `ERR NO_LCP` | **9.0 s** |
| Total Blocking Time | `ERR NO_LCP` | **148,850 ms** |
| Time to Interactive | `ERR NO_LCP` | **178.8 s** |
| First Contentful Paint | 3.2 s | 3.2 s |
| Speed Index | 4.8 s | 5.5 s |
| CLS | 0 | 0 |
| media / total transfer | 2,237 / 5,059 KiB | 2,237 / 5,059 KiB |
| Accessibility / Best Practices / SEO | 96 / 100 / 92 | **96 / 100 / 92** |

`npm run lint` clean, `npm run build` green.

### Three honest caveats

1. **The star-texture `IntersectionObserver` changed nothing on `/`.** It was implemented
   (gating `src` attachment on the canvas via `gl.domElement`, the only observable surface a
   WebGL texture has), but media transfer is byte-identical before and after — because the hero
   canvas is in view on arrival, so the observer fires immediately. It is still correct for the
   case it was built for: a restored scroll position or a deep link landing below the hero, where
   six clips would otherwise load for a star nobody is looking at. It is **not** a performance
   win for the homepage and is not claimed as one.
2. **A score of 35 is not success, it is the start of measurement.** The target in Section 21 is
   ≥ 95. What this fix bought is the ability to *see* the problem: TBT of **148,850 ms** and TTI
   of **178.8 s** were previously hidden behind `NO_LCP`. Those are the real remaining defect,
   and they are main-thread work (R3F + GSAP), not payload.
3. **Correction to §0.10's main-thread figure.** That section reports main-thread work falling
   179.6 s → 20.5 s (−89%). **That does not reproduce.** Both runs in this pass measure ~179 s
   on builds whose media is identical to the one that produced 20.5 s. The metric appears highly
   variable on this page under simulated throttling, so the 20.5 s reading should be treated as
   an outlier and the −89% claim in §0.10 as **unverified**. The transfer-size reductions in
   §0.10 and §0.11 were each confirmed across multiple runs and stand unchanged.

---

---

## 0.13 Root cause of the 148,850 ms TBT / 178.8 s TTI — profiled, not inferred (2026-10-02)

Investigation only. **No fix applied**, because the effective fix is architectural and the risk
register (Section 20) flags exactly this integration. Evidence from a 49 MB Lighthouse trace
(`--save-assets`), not code reading.

### Answers to the three questions asked

**1. `frameloop` — confirmed `"always"`, and `"demand"` is NOT viable.**
No `frameloop` prop exists anywhere in `src/`. All three Canvases (`Hero.jsx:49`,
`ReelIntro.jsx:100`, `ReelIntro.jsx:179`) therefore use React Three Fiber's default,
`frameloop="always"`, which requests an animation frame forever.

`"demand"` renders only when `invalidate()` is called, and the hero has four things that need a
frame continuously: the idle spin increment, the proximity-tilt `damp()` easing, the hover-scale
easing (all `GeminiStar.jsx:761`), and six `THREE.VideoTexture`s that freeze into stills if the
loop stops. Switching to `"demand"` would not be a tuning change — it would delete the hero's
motion design.

**2. ScrollTrigger is NOT refreshing per scroll event — hypothesis negative.**
`useLenisScrollSync.js:30-32` calls `ScrollTrigger.update()` on each Lenis scroll event. That is
the cheap per-frame position read, **not** `refresh()` (the expensive full recalculation, which
appears nowhere in the codebase outside a resize comment). More decisively: **Lighthouse never
scrolls the page**, so every scrub-linked trigger on `/` (`About.jsx:24`, `ServiceSummary.jsx`
×4, `ContactSummary.jsx:23`) contributes essentially nothing to this trace. ScrollTrigger is
exonerated.

**3. Continuous loops — two on `/`, both by design.**
`Hero.jsx:49`'s R3F rAF loop, and `useLenisScrollSync.js:39`'s `gsap.ticker.add(update)` driving
`lenis.raf`. The `gsap.ticker` callbacks in `BentoObject.jsx:185` / `BentoSection.jsx:189` are
ProjectPage-only. No `setInterval` anywhere. The `useFrame` body itself is cheap — a few
`damp()` calls and a scale write.

### What the trace actually shows

| Signal | Value |
|---|---|
| Long tasks | 20, spanning **@4,509 ms → @175,453 ms** — never stops |
| `RequestAnimationFrame` / `FireAnimationFrame` | 1,704 / 1,701 |
| `DroppedFrame` | 2,161 |
| `Commit` (compositor) | **36,463 ms** |
| `GPUTask` | **35,892 ms** |
| All JS (`FunctionCall` + `v8.callFunction` + `FireAnimationFrame`) | ~20,700 ms |
| Main-thread "Other" | **148,090 ms of 179,000 ms (83%)** |

Startup tasks cluster at 4–11 s; after that a steady stream of ~460–513 ms tasks continues to
the end of the trace. The dominant cost is **compositor/GPU frame production, not script**.

### The falsified hypothesis (why this section exists)

The obvious reading was "six `VideoTexture`s re-upload to the GPU every frame
(`GeminiStar.jsx:320`) — that's the 148 s." It was tested by disabling the video textures
entirely and re-measuring:

| Metric | With video | No video |
|---|---|---|
| Performance | 35 | 36 |
| Total Blocking Time | 148,850 ms | 137,400 ms |
| Time to Interactive | 178.8 s | 179.4 s |
| **Main-thread total** | **179.0 s** | **179.0 s — identical** |
| Script Evaluation | 28,325 ms | 4,967 ms |
| "Other" | 148,090 ms | **171,167 ms — rose** |

Script Evaluation collapsed by 23 s and **the total did not move**; "Other" simply absorbed it.
Removing the single heaviest per-frame item changed the score by one point. The experiment was
reverted; nothing from it is committed.

### Root cause

**The homepage never reaches idle, and that alone is what produces these numbers.** The R3F loop
at `Hero.jsx:49` runs unconditionally for the life of the page. Lighthouse's TTI requires a
5-second quiet window on the main thread; a perpetual rAF loop guarantees one never occurs, so
TTI resolves to roughly the end of the trace (178.8 s) and TBT accumulates against that span.
Main-thread total ≈ trace duration is the tell: 179.0 s in both runs above, independent of how
much work the frames actually do.

This is **not** a "heavy page" problem to optimise away. Making each frame cheaper does not help
— proven above. Only stopping the loop helps, and the loop is the hero.

Two caveats on the absolute numbers: the audit environment has **no GPU** — Chrome headless
reports `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)`, so
every frame is software-rasterised on the CPU, inflating `Commit`/`GPUTask` well beyond what a
real phone with a GPU would pay. And `totalTaskTime` is 44,749 ms against a 179,000 ms
main-thread figure, consistent with "mostly not-idle" rather than "mostly busy".

### The real conflict this surfaces

**Section 21's "mobile Lighthouse performance ≥ 95" is unattainable for any design with a
permanently-animating WebGL hero.** That is not a statement about this implementation's quality
— it is structural to how lab TTI/TBT are defined. Sections 9 and 11 require a signature 3D
motif in the Hero; Section 21 requires a lab score that a continuously-rendering canvas cannot
produce. **These two requirements are in direct conflict and the blueprint does not acknowledge
it.** It needs an explicit decision, not an optimisation pass.

### Options, none applied pending sign-off

1. **Re-scope the performance criterion to field metrics.** LCP (9.0 s here, fixable), CLS
   (already 0) and INP are what users and Core Web Vitals actually measure; TTI is deprecated in
   Lighthouse's own scoring direction and TBT is a lab proxy. Keep a lab target for
   `/projects/:slug` (currently 68, a real number to improve) and judge `/` on LCP/CLS/INP.
   *Lowest risk, highest honesty.*
2. **Pause the loop when the canvas is off-screen** — Section 11 already mandates this
   ("isolate any R3F canvas so it can be unmounted/paused when its frame isn't in view"). Scoped
   and additive via the `IntersectionObserver` already added in §0.12. **It will not change this
   score** (the hero is in view for the whole audit, which never scrolls), but it is real battery
   and thermal benefit on mobile. Worth doing on its own merit, not as a metric fix.
3. **Stop the loop once the hero settles** — render on demand after the entrance completes,
   invalidating only on pointer interaction, and accept that idle spin and the video textures
   stop when untouched. This *would* move the metric. It is a deliberate change to the hero's
   motion design and belongs to Phase 4, with the Section 20 feature-flag/rollback discipline.

Fixing LCP (9.0 s) is a separate, non-architectural thread and the most valuable next
performance work regardless of which option is chosen.

---

## 0.14 Conflict resolved, off-screen pause implemented, LCP fixed — with one caught regression (2026-10-02)

Three pieces of follow-up work on the §0.13 findings, done in order: resolve the Section 21 vs
9/11 conflict in writing (docs only), implement Option 2's off-screen pause for real, and fix the
9.0 s LCP. All three are done; the pause took two attempts, and the LCP fix introduced a CLS
regression that was caught before being reported as done, not after.

### 1. The conflict — resolved on the user's decision, not re-litigated

Section 21's "mobile Lighthouse performance ≥ 95" now applies to static/content pages
(`/projects/:slug` and future ones) only. For `/`, the lab Performance/TBT/TTI score is struck as
a target and replaced with field metrics — LCP, CLS, INP, judged against real-user thresholds
(good: LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms), because a page with an intentionally persistent
animated hero structurally cannot pass a lab TTI/TBT check regardless of implementation quality
(§0.13). Applied as inline supersede-markers at Section 13, Section 18 Phase 9, and Section 21 —
see those sections directly rather than this summary. Render-on-demand-after-settle (§0.13's
option 3) is recorded as a **deferred decision point for Phase 4**, not rejected — see the note
added to Phase 4 in Section 18. The accent-contrast question is now explicit, written scope inside
Phase 10 in Section 18 (not just a flag in this findings log) — this is its third mention
(§0.11, §0.13, here) and it was overdue to actually land somewhere actionable.

### 2. Off-screen pause — the first implementation didn't work, and shipping it unverified would have been wrong

Section 11 requires any R3F canvas be "unmounted/paused when its frame isn't in view." The first
attempt: a child component inside `<Canvas>` calling the store's imperative `state.setFrameloop()`
from an `IntersectionObserver` on `gl.domElement`. This is documented R3F API and reads correctly
from the library's own source (`setFrameloop('never')` makes the shared render loop skip that root
entirely — traced directly in `node_modules/@react-three/fiber`). It also **did not work**, and
the systematic-debugging skill's "verify before claiming success" step is what caught it rather
than the user:

- A WebGL-draw-call counter (CDP-injected into a real headless Chrome session, not inferred) showed
  draws continuing, *and increasing*, after the observer fired and logged `never`.
- Polling the live store state directly (`state.get().frameloop`, via a store reference exposed
  through `onCreated`) showed `frameloop` reading back `"always"` continuously — the external
  `"never"` call never stuck for even one 500 ms poll tick.
- Root cause, found in `<Canvas>`'s own source: its internal `useIsomorphicLayoutEffect` has no
  dependency array and re-runs `configure({ ..., frameloop })` — reasserting the **declared prop**
  (default `"always"`) — on every re-render of `CanvasImpl`. `react-use-measure`'s `{scroll:true}`
  option plus its `ResizeObserver` make that happen often enough (well under 500 ms) that an
  external, imperative override can never win.

Fix: make `frameloop` a **declared, state-driven prop** on `<Canvas>` instead
(`<Canvas frameloop={frameloop}>`, `frameloop` from `useState`, flipped by the same
`IntersectionObserver`, now watching a stable `<figure>` ref instead of the canvas element). This
way Canvas's own re-render-driven resync reasserts the *correct* value instead of fighting it.
Still only `"always"`/`"never"` — `"demand"` was never introduced, so the entrance/idle animation
logic in `GeminiStar` is untouched, matching the instruction to keep this scoped.

**Verified, not assumed**, via the same CDP draw-call counter against the real built app:

| State | WebGL draw calls / 1.5 s |
|---|---|
| Hero on screen | 63 |
| Scrolled fully off-screen (past the 200px margin), settled | **0** |
| Scrolled back on screen | 63 (resumes — not stuck off) |

No change on `/` itself: the Hero is on screen for the entire page load and the entire Lighthouse
run (which never scrolls), so this doesn't move any lab or field number here. It matters for a
restored scroll position, a deep link landing below the Hero, or simply not burning battery/GPU
once a visitor has scrolled past it — exactly Section 11's stated reason, nothing more claimed.

### 3. The 9.0 s LCP — root cause named, fixed, re-measured

Profiled instead of guessed, per instruction. The trace's one real `largestContentfulPaint::Candidate`
event names the element directly: `<p class="mb-4 ... animate-pulse">Loading N%</p>` —
the loading overlay's own text (`HomePage.jsx`), not any piece of real Hero/page content. Two
compounding causes, both fixed:

- **No `<Suspense>` boundary existed anywhere in the app.** `GeminiStar`'s `useGLTF` call suspends
  while `3d-star.glb` loads; with nothing to catch that, React has nowhere to localize the wait
  except the app root, serializing the *entire* initial commit — including this already-ready,
  dependency-free text — behind a 3D-model fetch it has nothing to do with. Fixed by wrapping just
  `<Float><GeminiStar/></Float>` in `<Suspense fallback={null}>` inside the Canvas (the standard
  R3F/drei pattern).
- **The whole route shipped as one 436 KB-gzip JS bundle**, including `ProjectPage` (its own GSAP
  timelines and a second R3F canvas, `ReelIntro`, that `/` never uses) and, more significantly,
  three.js/`@react-three/fiber`/`@react-three/drei` — used only by `Hero`, needed by nothing else
  on `/` at first paint. Fixed by code-splitting `ProjectPage` via `React.lazy` (`src/App.jsx`) and,
  the larger win, making `Hero` itself `React.lazy` from `HomePage.jsx`: it sits fully behind the
  opaque loading overlay until `isReady` regardless, so deferring its module has no visible cost.
  Verified safe against the `isReady` gate specifically: `useProgress`'s zustand store initializes
  at `progress: 0`, not 100 (read directly from `node_modules/@react-three/drei/core/Progress.js`),
  so nothing can flip `isReady` early just because `Hero` hasn't mounted yet.

**A regression this introduced was caught before being reported, not after.** Lazy-loading `Hero`
with `<Suspense fallback={null}>` means nothing reserves `Hero`'s own `min-h-screen` box while its
chunk loads — `Works`/`About`/etc. briefly render one full viewport higher, then jump down the
instant `Hero`'s real `<section>` mounts. Measured: CLS **0 → 1** (the maximum). Invisible to a
viewer only because the opaque loading overlay happens to be covering the page the first time this
happens — not something to rely on, since a cached-chunk revisit or any later remount wouldn't have
that cover. Fixed by giving the `Suspense` a sized fallback (`<div className="min-h-screen" />`)
that reserves the same box Hero's own section occupies, instead of `null`. Re-measured clean
afterward (table below).

One environmental trap worth recording for future Lighthouse runs on this machine: an earlier
`npx lighthouse` invocation left an orphaned Chrome **renderer** subprocess running at ~80% CPU
(`ps aux` showed it accumulating 13+ minutes of CPU time, `--user-data-dir=/tmp/lighthouse.*`,
survived its own run's "Killing Chrome instance" log line). It silently contaminated several
intermediate measurements in this pass with CPU contention until caught and killed
(`pkill -9 -f "cache/puppeteer/chrome"`) — a stray TBT/TTI/CLS reading that looks like a regression
is worth a `ps aux` check before it's trusted.

### Verified result (Lighthouse 12.8.2, mobile, simulated throttling, clean process table)

| Metric | §0.13 baseline | After this pass | Change |
|---|---|---|---|
| LCP | 9.0 s | **5.8 s** | −35% |
| TBT | 148,850 ms | **23,670 ms** | −84% |
| TTI | 178.8 s | **40.8 s** | −77% |
| CLS | ~0 | **~0** (0.0002, same floor — regression caught and fixed, not shipped) | unchanged |
| Speed Index | 5.5 s | 3.5 s | −36% |
| FCP | 3.2 s | 3.1 s | ~flat |
| Performance (lab, informational only per §0.14 item 1) | 0.35 | 0.42 | +7 pts |

INP has no lab equivalent — it is a field metric by definition (real interaction latency over a
real session) and Lighthouse cannot produce one. The closest lab proxy, max-potential-FID, improved
1,620 ms → ~1,450 ms, consistent with the TBT drop, but is reported here only as a proxy, not as
INP itself. Real INP requires field data (CrUX/RUM) this project doesn't yet collect.

TTI/TBT are no longer target metrics for `/` per item 1 above — reported here only to show the
Suspense/code-split fix's side effect (lighter initial JS execution helps these too, even though
the permanent rAF loop still structurally caps TTI, per §0.13) was real and not a regression.

`/projects/:slug` (`signature-reel`, now re-scoped as the lab-target page, item 1): Performance 47,
LCP 4.4 s, TBT 3.57 s, CLS 0, max-potential-FID 220 ms — a real number to improve in Phase 9, not
addressed this pass.

### Still open, untouched this pass

- Token-consumption gap: canonical tokens exist in `src/index.css` but components like
  `AnimatedHeaderSection` still use Tailwind utilities instead of consuming them directly (§0.11).
- Accent-contrast: `#CFA355` has never been validated for text use against the dark background;
  `/` has 24 `color-contrast` Lighthouse failures that may share this root cause (§0.11, §0.13) —
  now explicit, written scope inside Phase 10, Section 18 (see above), not just a repeated flag.

---

*End of Phase 0 findings.*
