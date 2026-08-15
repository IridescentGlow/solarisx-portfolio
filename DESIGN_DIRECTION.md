# DESIGN_DIRECTION.md
Solarisx Portfolio — Premium Phase

**Status: phase document, not canonical.** The canonical design bible is
`docs/` (see `docs/START_HERE.md` §1). This file does not define a new
design system and does not override any canonical document. It records
one thing: *which already-specified-but-unbuilt canonical rules this
phase implements, and in what order.* Where this file and a canonical
document disagree, the canonical document wins.

---

## 1. The finding

The site is not under-animated. It is **under-composed**.

`AnimatedHeaderSection` renders **every frame on the homepage** (Hero,
Works, About, Capabilities, Contact) **and every chapter on every project
page** (Challenge, Approach, Craft, Result) through one identical
composition:

```
letterspaced uppercase subtitle        ← left
GIANT UPPERCASE DISPLAY TITLE          ← left
────────────────────────────────────── ← full-bleed 2px rule
                  right-aligned uppercase paragraph
                  (left half of the frame empty)
```

That is nine-plus instances of one layout. Verified in browser at
1440×900, 768×1024 and 390×844, dark and light.

Almost every "polished but not exceptional" symptom traces back to it:

| Symptom | Cause |
|---|---|
| Page reads as a sequence of independent screens | No compositional rhythm — `COMPOSITION_PRINCIPLES.md` §2's mandated rhythm was never built |
| No frame-to-frame transitions are legible | A handoff needs two frames that *look* different to hand off between. `TRANSITION_PHILOSOPHY_CANONICAL.md` Tier 1 / Tier 3 have nothing to express themselves against |
| Hierarchy inverted | The largest element in every frame is a **category label** ("WORKS", "ABOUT", "CAPABILITIES") at ~152px, while the actual evidence — project rows — renders at 26–32px |
| Empty half-frame reads as unfilled, not as negative space | `COMPOSITION_PRINCIPLES.md` §4: negative space only reads as *placement* when the occupied side varies. Repeated identically, it reads as a missing column |

**The premium gap is not taste. It is a set of canonical mandates that
were specified and never implemented.**

---

## 2. What is already right — do not touch

Restraint is part of this phase. These are working and are not in scope:

- **The custom cursor** (`Cursor.jsx`) — magnetic pull, contextual
  labels (`OPEN ↗` / `WATCH` / `LET'S TALK`), capability-gated on
  `(hover:hover) and (pointer:fine)`, reduced-motion aware. This is
  already a signature-grade interaction.
- **The Works hover preview** — floating video/image with `quickTo`
  inertia, and the click-burst with its deliberate 150ms
  paint-before-navigate delay.
- **The project-page chapter stack** — sticky chapter titles layering
  over each other is a genuine signature moment that already exists.
- **The motion token system** — four named eases, four durations,
  `--ease-revelation` deliberately quarantined. Do not add a fifth curve.
- **The two-theme system** — one design system under two lightings.
- **The featured-row accent divider** — `HIERARCHY_SYSTEM.md` §4's
  one-accent rule, correctly implemented.

---

## 3. Composition system — the core of this phase

`COMPOSITION_PRINCIPLES.md` §2 already specifies the rhythm. It has never
been built. This phase builds it.

| Frame | Mandated composition | Current | Action |
|---|---|---|---|
| Opening (Hero) | Symmetrical, centered | split | **deferred** — see §4 |
| Proof of Craft (Works) | Asymmetric — left title, right metadata | split | **keep** — the one frame the current layout is already correct for |
| Context Layer (About) | Asymmetric, genuinely offset (§3) | split | **change → `offset`** |
| Capability Map | Symmetric grid | split | **change → `centered`** |
| Final Frame (Contact) | Symmetrical, centered | split | **change → `centered`** |

### The three variants

Implemented as an **additive `layout` prop** on
`AnimatedHeaderSection`, defaulting to `"split"` so every existing caller
— including all nine `ProjectPage.jsx` chapter openers — renders
byte-identically. This follows the convention that file's own comments
already establish for `textClassName` and `compact`.

**`split`** *(default, unchanged)*
Subtitle left · display title left · full-bleed rule · right-aligned
paragraph over an empty left half. The empty half is justified here: on
Works it is exactly where the floating hover preview appears. Retained
for Works and for every project-page chapter opener.

**`centered`**
Subtitle centered · title centered · **inset** rule (not full-bleed —
the full-bleed rule is `split`'s signature and must not be shared) ·
paragraph centered at a constrained measure. Bookend character:
confidence at the open, resolution at the close.

**`offset`**
Subtitle and title left · **no rule at all** · paragraph directly beneath
the title at a narrow measure held to the left third, with the right
two-thirds genuinely empty. This is `COMPOSITION_PRINCIPLES.md` §3's one
explicit change request — a text block *placed* to one side, not a
centered box that happens to left-align.

Dropping the rule from `offset` and insetting it in `centered` is what
makes the three read as different compositions rather than three
alignments of one composition.

### Scope limits of Tier 1.1, stated plainly

- **This milestone changes header bands only.** About's `offset` header is
  genuinely asymmetric, but the body directly beneath it is still the
  full-width photo-left/text-right two-column, so the negative space does
  not survive past the header. `COMPOSITION_PRINCIPLES.md` §3 is therefore
  *partially* addressed, not closed. Completing it is Tier 2.3.
- **The rhythm is 4/5 built.** Hero and Works remain the one identical
  adjacency on the page — and that is precisely the Tier-1 "cold open
  resolves" boundary. It stays identical on purpose until §4's Opening
  Frame decision is made, because the star relationship and that frame's
  composition have to be resolved together.

---

## 4. Opening Frame — deliberately deferred

`COMPOSITION_PRINCIPLES.md` §5 deferred the hero's star↔headline spatial
relationship until "the real asset exists," and instructed a revisit
before finalizing Opening Frame's layout. **That condition is now met** —
GeminiStar Stages 1–4 are complete.

Browser verification confirms the predicted failure is structural, not
transient: the star is centered in the viewport and the headline is
centered horizontally, so the star bisects "DAGIM DEMISSIE" on every
frame, at every width. Confirmed across two captures seconds apart (the
`Float` drift does not cause it) and again at 390×844, where the
divider rule additionally cuts through "DEMISSIE".

This frame's composition and its object relationship **cannot be decided
separately** — changing one without the other makes the collision worse,
not better. It is therefore its own milestone (Tier 1.2), not folded
into the composition system.

---

## 5. Typography

No new scale. The tokens in `DESIGN_SYSTEM_TOKENS.md` §2 are sound. The
problem is *what gets the display size*, not what the display size is.

**Principle: display weight belongs to content, not to categories.**
A frame whose largest element is the word "WORKS" has spent its loudest
voice on a label. Correcting this is Tier 1.3, and per
`HIERARCHY_SYSTEM.md` §2 it is corrected by making the *label* quieter
and the surrounding pacing more generous — **not** by making project
rows bigger.

---

## 6. Color

**Preserve.** The palette is deliberate, documented, and correctly
implemented in both themes. One refinement is queued at Tier 3: in the
light theme `--color-bg-base` (`#efebe2`) and `--color-surface-1`
(`#e5dfd3`) sit close enough that the About and Capabilities panels
barely read as a different material — the exact contrast delta the theme
layer's own comment says it exists to preserve. Verify and tighten;
do not re-hue.

No new accent. No gradients. No glow.

---

## 7. Motion language

Four principles. No new library, no fifth easing curve.

1. **A transition is an edit, not a reveal.**
   `TRANSITION_PHILOSOPHY_CANONICAL.md` §1, still unimplemented as a
   frame handoff. Blocked on §3 — build compositions first.
2. **Tier 1 and Tier 3 differ by timing, pacing and sequencing only.**
   Never by new elements or new curves (§4's restraint constraint).
3. **Composition is choreography.** When a frame's layout differs, its
   entrance can differ *in direction* — `offset` enters laterally,
   `centered` settles vertically — at zero added cost.
4. **Reduced motion collapses to instant state changes.** Already
   global via `motion.js`. Every new tween inherits it; none may opt out.

---

## 8. Interaction language

Already largely authored (§2). This phase adds nothing new to it. The
one open item is Tier 2: project media reacting more intelligently on
the Works frame, reusing the existing preview system rather than adding
a second one.

---

## 9. Signature moments

Three to keep, two to build.

**Existing, keep and protect**
- The custom cursor's contextual label swap.
- The project-page sticky chapter stack.
- The Works hover preview + click-burst.

**To build**
- **The Opening Frame resolving.** The star and the name composing as one
  authored object, then handing off to Works as the site's single Tier-1
  transition — "the cold open resolves." (Tier 1.2 → Tier 2.1)
- **The Final Frame arriving.** Tier 3 pacing so the contact frame reads
  as an arrival rather than one more section. (Tier 2.2)

That is the whole list. Five moments, three of which already exist.

---

## 10. Roadmap

Ordered. See `FUTURE_IMPLEMENTATIONS.md` for the same list with the
parking-lot items it supersedes.

### Tier 1 — must have

| # | Milestone | Why first |
|---|---|---|
| 1.1 | **Frame composition system** (§3) | Highest leverage; **precondition** for all transition work; implements an unbuilt canonical mandate |
| 1.2 | **Opening Frame** — star↔headline relationship + symmetric composition (§4) | The 10-second impression; the §5 deferral is now due |
| 1.3 | **Works evidence weighting** (§5) | The site's highest-priority frame currently under-weights its own evidence |

### Tier 2 — strong additions

| # | Milestone |
|---|---|
| 2.1 | Tier-1 transition: Opening Frame → Proof of Craft |
| 2.2 | Tier-3 transition: Capability Map → Final Frame (arrival pacing) |
| 2.3 | Context Layer body composition — the photo/text block, following its new header |
| 2.4 | Project-page chapter differentiation, so Editor Portfolio and Signature Reel read as distinct identities |

### Tier 3 — optional polish

| # | Milestone |
|---|---|
| 3.1 | Light-theme surface contrast (§6) |
| 3.2 | Marquee treatment — the most template-derived element remaining |
| 3.3 | Real About portrait (blocked: needs the asset) |

---

## 11. What this phase explicitly will not do

- Add an animation library.
- Add a fifth easing curve or a new duration token.
- Add gradients, glow, or additional 3D.
- Rebuild `AnimatedHeaderSection`'s internals — variants compose
  additively, existing callers stay byte-identical.
- Touch the cursor, the preview system, the chapter stack, or the theme
  architecture.
- Implement more than one milestone per session.
