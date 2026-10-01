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

### What happens on screen
1. **Entry:** a chrome/glass blob, heavily motion-blurred and glitch/scan-line distorted, morphs on load — an "instrument calibrating" beat before any content is trusted to the viewer.
2. **Brand construction:** the glitch resolves into a wireframe triangle built from visible geometric guides (circles, grid lines, construction rays) — the mark is *drawn*, not simply revealed.
3. **Solid hero:** the triangle becomes a faceted, iridescent 3D crystal (blue/purple, shifting to green) sitting inside a persistent WebGL grid environment. A HUD-like control cluster (joystick, "MainLogo Distortion" sliders) sits top-right — instrumentation, not decoration.
4. **Work carousel:** the crystal gives way to a horizontal, in-scene carousel — a centered active project (video/image) flanked by cropped neighboring thumbnails, still resting on the same grid floor. Each project carries a compact metadata block (date stamp, colored tag, bold title, one-line subtitle) and a quiet "More Works →" affordance.
5. **Per-project "moment":** each project swaps the *entire scene's* palette and lighting — a Fortnite project sits in a blue grid with a small "Featured in Fortnite" badge; an Unreal Engine project sits in magenta/purple with its own badge and a right-column description panel (icon + eyebrow + short paragraph, roughly a 25/75 split against the media).
6. **Value inversion:** one section abruptly cuts to a stark white/paper environment with a single color-shifting crystal shard and large type set on **opaque dark scrim blocks** laid directly into the 3D depth — not a translucent CSS overlay. Small ruler-tick and coordinate-style micro-labels sit around the composition like production annotation.
7. **Loop/exit:** transitions resolve back to the minimal line-art triangle with motion blur, closing the loop.

### Why it feels premium (principles, not effects)
- **Persistent world, not pages.** The whole experience appears to live in one continuous 3D space; "sections" are camera moves through it, so transitions feel diegetic (motivated by an in-scene camera) instead of decorative (a CSS fade bolted onto a page load).
- **One glyph, many states.** The triangle/crystal recurs at every beat in a different material, color, and complexity. It's a visual *rhyme* — the thing that makes five wildly different-looking scenes still feel like one authored piece.
- **Palette as narration.** Each project/section gets its own tight, disciplined palette (tech-blue, stark white, acid-green, broadcast-magenta) rather than one brand palette reused everywhere. The site is bold overall because each individual scene is restrained, not despite it.
- **Type as object.** Headlines sit on opaque cards placed in 3D depth — typography has literal z-position and weight, not just font-size.
- **Instrumentation over decoration.** HUD chrome (sliders, ruler ticks, joystick) signals "this is a crafted tool," reinforcing a technologist's identity through UI chrome itself, not just written content.
- **Contrast through restraint.** Nav and utility elements barely move. All dramatic motion budget goes to the signature mark and the media. If everything animated, nothing would read as a moment.

None of this is about adding more effects — it's one motif, disciplined per-scene color, and legible typographic weight, applied consistently. That's the translation target for your site, not the crystal itself, not the specific triangle, not Japanese-language conventions.

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

Define one recurring visual/geometric element — this can evolve from whatever 3D asset already exists in the Hero, it does not need to be invented from nothing. Requirements:
- Must appear in at least three states across the site: full/complex (Hero), reduced/line-form (transitions and loading), and minimal/mark-form (footer or final frame)
- Must be the *only* element whose material/color is allowed to shift dramatically between sections — this is what earns the per-project palette shifts in Gap 4 the right to feel intentional rather than chaotic
- Should be reachable/reusable as a favicon-scale mark and a loading-state mark, so it functions as an actual identity system, not a one-off hero prop

---

## 10. Project (Case Study) System

- Resolve the `/work/[slug]` vs `/projects/:slug` conflict in favor of `/work/[slug]` before building anything else in this system (see Phase 5)
- Each project: hero media (video preferred, poster-image fallback), one restrained palette/lighting treatment distinct from neighboring projects, and a fixed metadata block — date, role/discipline tags (drawn from the discipline list in Section 1), one-line outcome, "next project" affordance
- Consistency lives in the *metadata block and layout grid*; variation lives in the *palette and media* — this is the same split the reference uses per-project

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
- Budget check before Phase 10: Lighthouse performance score on mobile, not just desktop — your own prior notes already target Lighthouse 95+

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
- Per-frame typographic scale tokens (Section 7)
- Two motion-curve tokens: connective (frame handoffs) and interactive (micro-interactions)
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

**Phase 1 — Design Tokens (Typography + Motion)**
- Objective: Implement Section 7 and Section 16's token additions
- Prerequisites: Phase 0
- Work: Add per-frame type-scale tokens; define and implement the two motion-curve tokens; wire `--ease-connective` so it's referenced (even before the orchestration logic that will use it exists)
- Acceptance criteria: Tokens exist, are documented, and are referenced by at least a placeholder in each frame's heading component
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

**Phase 5 — Project / Case Study System**
- Objective: Close Gap 4; resolve the routing conflict permanently
- Prerequisites: Phase 0's routing decision, Phase 1 tokens
- Work: Finalize `/work/[slug]`; build per-project palette scoping (Section 16); implement the consistent metadata block; complete whatever remained in-progress from the prior case-study system work
- Acceptance criteria: At least two real projects render with distinct palettes but identical metadata-block layout

**Phase 6 — About / Capabilities Hierarchy Application**
- Objective: Apply Section 7's editorial and systematic type treatments to these two frames specifically
- Prerequisites: Phase 1
- Acceptance criteria: About reads as editorial copy; Capabilities reads as a systematic toolkit, not a list — reviewed side by side with Hero to confirm they're now visually distinct registers

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
- Acceptance criteria: Mobile Lighthouse performance score meets the 95+ target from your existing standard

**Phase 10 — Accessibility & Reduced Motion**
- Objective: Implement Section 14
- Prerequisites: Phase 3 (transition system must exist to build its reduced-motion fallback) and Phase 5 (per-project palettes must exist to check focus-state contrast against each)
- Acceptance criteria: Full keyboard walkthrough passes; reduced-motion mode preserves all content

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
- [ ] Each frame is typographically distinct (Gap 2 closed)
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
- [ ] Mobile Lighthouse performance ≥ 95
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
