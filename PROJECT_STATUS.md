# PROJECT_STATUS.md

Portable status snapshot for the Solarisx portfolio — meant to be handed to
any AI assistant (Claude Code or otherwise) as a fast on-ramp. Updated at
the end of each completed milestone. This is **implementation status**, not
design intent — the canonical design/engineering rules live in `docs/`
(start at `docs/START_HERE.md`); this file tracks what's actually built.

---

## 1. What this is

Solarisx portfolio — a personal portfolio site for a visual storyteller /
creative technologist (per `docs/vision/CORE_EXPERIENCE_STATEMENT.md`).
Single-page cinematic narrative on the homepage, with an expandable
`/projects/:slug` depth layer for individual case studies.

## 2. Stack (verified against package.json, not assumed)

React 19 + Vite 6, Tailwind CSS v4 (CSS-first `@theme`, no `tailwind.config.js`),
GSAP 3 + `@gsap/react` for all motion, React Three Fiber + Drei for the
Hero's 3D scene, `react-router-dom` v7 for `/projects/:slug`, Lenis for
smooth scroll, Iconify for icons.

## 3. Architecture

```
src/
  App.jsx                → Routes: "/" → HomePage, "/projects/:slug" → ProjectPage
  main.jsx                → BrowserRouter wrapper
  pages/
    HomePage.jsx           → the single-page narrative (former App.jsx body, unchanged)
    ProjectPage.jsx         → case-study depth layer (see §5)
  sections/                → Hero, Works, About, Services, Contact, + Navbar/summaries
  components/               → AnimatedHeaderSection, AnimatedTextLines, Marquee, GeminiStar (Hero 3D), ThemeToggle, Planet (unused)
  lib/
    motion.js               → EASE/DURATION/SCROLL_REVEAL_START tokens (single source for GSAP timing)
    media.js                 → isVideo() — shared between Works and ProjectPage
  constants/index.js        → all content: servicesData, projects, socials, socialIcons
  index.css                  → design tokens (@theme) + custom @utility blocks (click-burst, trophy-glow, gold-shimmer-text)
```

**Data-driven routing** (`docs/design/PROJECT_PAGE_SYSTEM.md` §3): each
project has `slug` and `caseStudy` (object or `null`). Works.jsx links
internally to `/projects/:slug` only when `caseStudy` is truthy; otherwise
it links externally via `liveHref`. No hardcoded id/slug checks — a future
project switches over automatically the moment its `caseStudy` is populated.

**Navigation is always a new tab**, internal or external
(`window.open(href, "_blank", "noopener,noreferrer")`) — per the doc's §2
new-tab rule, and because same-tab client-side routing was found to inherit
the homepage's scroll position (fixed in the milestone below).

## 4. Current project data state

| Slug | caseStudy | Status |
|---|---|---|
| `signature-reel` | `null` | Index-only, `[Placeholder]` content, links externally |
| `editor-portfolio` | `null` | Index-only, `[Placeholder]` content, links externally |
| `medihelp` | `{}` (truthy, empty) | **First live project page** — real base data, no case-study narrative sections written yet |

## 5. ProjectPage.jsx — what's built

Two required sections per `PROJECT_PAGE_SYSTEM.md` §4 (Overview + Media),
plus terminal Links. Challenge/Approach/Craft/Result/Credits are
**intentionally omitted** — no real content exists for them yet, and the
doc is explicit that missing sections are omitted, not padded with
placeholders.

- **Overview** — reuses `AnimatedHeaderSection` (title/subtitle/qualifier),
  a metadata row (role/year/stack, opposite the title on desktop per §8),
  and the outcome via `AnimatedTextLines`.
- **Media** — hero video with a real poster frame (extracted via ffmpeg
  from `medi-help.mp4` itself), framed rather than full-bleed since the
  clip's own background is light and would fight the dark theme unframed.
- **Links** — terminal position, Live/Code, per §4's fixed ordering.
- **Not yet resolved**: `PROJECT_PAGE_SYSTEM.md` §9's SEO/share-metadata
  problem — this is a Vite SPA, so per-route `<title>`/OG tags need
  pre-rendering, SSG, or SSR, none of which exist yet. Deliberately
  deferred, not forgotten.

## 6. Known content gaps (not code work — need real input)

- MediHelp's `role`/`year`/`stack`/`repoHref` still have literal `TODO:`
  values in some places — check `src/constants/index.js` directly.
- Two other projects are still `[Placeholder]` — no real reel/title-sequence
  content yet.
- No case-study narrative content (Challenge/Approach/Craft/Result/Credits)
  exists for any project.

---

## Changelog

### Milestone — Gemini Hero, Stage 4: Grab, Drag, Release, Momentum

**Hover -> it notices you** (Stage 3), **move around it -> it subtly
responds** (Stage 3.5), and now **grab it -> you can rotate it, release it
-> momentum carries it, then it settles back into the cinematic spin.**
Dragging and click/click-response and camera movement beyond this are still
out of scope.

**Rotation ownership — one property, one priority gate, not a second
transform.** Unlike proximity tilt (a genuinely separate roll/pitch layer
that composes additively on its own group), drag rotates the exact same
`spinner.rotation.y` the idle/hover turntable already owns, on the exact
axis the brief requires. A second competing group here would just mean two
systems fighting over what "the star's current angle" means, so priority is
a single boolean gate in `useFrame` instead:

```js
if (!entranceDone.current || prefersReducedMotion()) return;
if (isDragging.current) return; // the drag's own pointermove listener owns rotation.y right now
// ...idle/hover speed + momentum decay, as before
```

While `isDragging.current` is true, `useFrame` never touches `rotation.y` —
a window-level `pointermove` listener (attached only for the lifetime of one
drag) writes it directly, immediately, on every real pointer event rather
than once per rendered frame. The two writers are mutually exclusive by
construction, not by convention.

**Grab — gated the same way proximity tilt already is, plus one more
check.** `handlePointerDown` (added to the same `<mesh>` that already has
`onPointerOver`/`onPointerOut`) requires `supportsProximityTilt()` (a real
hover-capable, fine pointer — see Stage 3.5) AND `entranceDone.current`: the
entrance's own GSAP timeline is still writing `spinner.rotation.y` directly
until it hands off (see the `useGSAP` block above), so grabbing before that
handoff would mean the entrance tween and the drag handler fighting over the
same property — exactly what this stage is required not to do. It also
checks the specific event's own `pointerType` (not just device capability),
so a touch tap on a hybrid mouse+touchscreen device can't start a drag even
though that device's `matchMedia` reports a fine pointer exists elsewhere on
the machine.

**Drag — direct pointer control, sign verified empirically.**
`rotation.y += dx * DRAG_SENSITIVITY` (0.008 rad/px — a full 1440px-wide
desktop drag is a little over one and a half turns). The sign was **not**
derived from the camera setup and trusted — it was tested twice, the first
attempt was wrong, and the fix for that first attempt was *also* wrong,
which is recorded here because the failure mode is instructive:

1. A first check read `spinner.rotation.y`'s sign before/after a drag and
   compared it to the pointer's sign. That's the wrong test — reading
   `rotation.y`'s sign confirms which way a NUMBER moved, not which way the
   star's visible surface moved on screen, and this scene's own camera
   handedness (already recorded in `starVideoRegions.js`: "screen-right at
   rotation.y=0 corresponds to world -X, not +X") means those can differ.
2. A second attempt projected a FIXED point on the mesh's local +X axis
   before/after a drag. This is closer, but still unreliable: that point's
   screen-sensitivity to rotation is `-r*sin(theta)`, which changes sign
   every half turn depending on where in the rotation cycle the star
   happens to currently be — a large single drag (or even a run of small
   steps, if the star starts near an extremum) can cross that sign change
   and produce a misleading reading. This test's result led to an incorrect
   "fix" (negating the sign) that was reverted once the third method below
   contradicted it.
3. The test that actually settled it: raycast the REAL 3D point under the
   cursor at grab time (the thing actually "held"), store it in the mesh's
   own local space, drag, then re-project that SAME point and compare its
   screen-X to the cursor's own screen-X. This has no phase-dependent
   sign-flip problem, because it's always asking the one question that
   actually matters — does the grabbed surface follow the cursor — rather
   than reasoning about an arbitrary reference point's relationship to
   rotation. Result: dragging the cursor 200px right moved the grabbed
   point's screen-X from 719.5 to 816.5 (+97, following the cursor) with the
   original, un-negated sign — confirming the very first implementation's
   sign was correct all along, and the intermediate "fix" had been wrong.

**Velocity estimation.** Each `pointermove` computes an instantaneous
velocity (`dx * DRAG_SENSITIVITY / dt`, real elapsed time via
`performance.now()`, floored at 1/240s to guard a possible zero/near-zero
`dt`) and blends it into `dragVelocity` with `THREE.MathUtils.lerp(...,
0.3)` rather than taking the single most recent sample raw — so the
velocity handed to momentum on release reflects the drag's *recent* motion,
not one noisy sample exactly at the moment of release, per the brief's own
"recent pointer deltas" instruction.

**Release -> momentum -> idle, as one continuous additive term, not a
state-machine handoff.** On release, `momentumVelocity` is set to
`clamp(dragVelocity * MOMENTUM_MULTIPLIER, -MAX_MOMENTUM_SPEED,
MAX_MOMENTUM_SPEED)` (`MOMENTUM_MULTIPLIER = 1`, `MAX_MOMENTUM_SPEED =
SPIN_SPEED * 6` — about 6x idle speed, clearly fast but not disorienting).
From then on, every frame:

```js
const speed = SPIN_SPEED - hoverState.current.t * (SPIN_SPEED - HOVER_SPIN_SPEED); // unchanged Stage 3 formula
momentumVelocity.current = THREE.MathUtils.damp(momentumVelocity.current, 0, MOMENTUM_DAMPING, delta);
spinner.current.rotation.y += delta * (speed + momentumVelocity.current);
```

`speed` is the **exact, byte-for-byte** Stage 3 hover-aware idle formula —
zero regression risk to the already-tuned/verified/committed hover feel.
`momentumVelocity` is a separate residual "kick" that decays to exactly 0
via `damp()` (`MOMENTUM_DAMPING = 1.2`, gentler than proximity tilt's
`PROXIMITY_LAMBDA = 6` on purpose — a flung object gliding to a stop over a
second or two is the "physical, not snappy" read the brief asks for). Once
it's negligible, `speed + momentumVelocity` **is** `speed` again, with no
separate handoff branch, no snap, and nothing that could discontinuously
"jump back" to idle — the blend falls out of the additive structure for
free. `momentumVelocity` starts at 0 on mount and stays there through
ordinary idle/hover use, so none of this changes anything about the star's
behavior until an actual drag has actually released some velocity into it.

**Hover and proximity tilt compose for free, by construction, not by extra
gating.** Hover (`hoverState`/`hoverGroup`, driven by the mesh's existing
`onPointerOver`/`onPointerOut`) and proximity tilt (`pointerOverCanvas`/
`proximityTilt.rotation.x`/`.z`) are untouched by this stage and read by the
same `useFrame` as drag/momentum, but on different properties entirely
(scale, and a *different* group's roll/pitch, respectively) — there is
nothing for drag to fight there, confirmed rather than assumed (see
verification below: proximity tilt kept responding to pointer position
*during* an active drag, and hover scale read the identical Stage 3 value
immediately after a drag/release cycle).

**Cursor feedback — minimal, reusing the existing hover handlers.**
`onPointerOver`/`onPointerOut` (already existing, unchanged in their tween
logic) now also set `gl.domElement.style.cursor` to `"grab"`/`"auto"`,
gated on the same `supportsProximityTilt()` check and skipped while a drag
already has it set to `"grabbing"` (set in `handlePointerDown`, restored to
`"grab"` or `"auto"` in the release handler depending on whether the pointer
is still over the canvas).

**Mobile/touch — no new mobile interaction system, deliberately.** Drag is
gated behind the same `supportsProximityTilt()` check proximity tilt already
uses, so touch devices get idle spin and ordinary hover (both pre-existing,
unchanged) but no proximity tilt and no drag — one consistent "desktop
mouse" tier rather than two slightly different gates for two different
features. This was a deliberate scope decision, not an oversight: the
Hero's `<figure>` Canvas is full-viewport (`inset-0`, `pointer-events-auto`
— see `Hero.jsx`), so a touch-drag handler there would fight native page
scrolling on any touch gesture starting over the star, exactly the
"frustrating gesture conflict" the brief calls out to avoid. A safe
touch-drag (via `touch-action` and careful pointer capture so scroll and
drag can coexist) is materially larger scope than this stage's smallest-
viable-architecture mandate, and the brief explicitly permits skipping it
if it would make mobile worse.

**Lifecycle safety.** A drag attaches its `pointermove`/`pointerup`/
`pointercancel` listeners on `window` (a deliberate, temporary, actively-
initiated exception to the "no window listener" pattern Stage 3.5
established for *passive* proximity sensing — a drag is a different kind of
thing, conventionally global for exactly as long as the pointer is held) and
tears them down on release. A `dragCleanup` ref plus one `useEffect`'s
unmount cleanup is the safety net for the unlikely case of unmounting mid-
drag (a route change away from the homepage while still holding the star) —
without it, that edge case would leak the window listeners.

**Verified in the browser** (same headless-Chromium setup as every prior
stage; `__THREE_DEVTOOLS__`-captured live scene reads for anything numeric,
not screenshots alone):

- **Drag sign**, decisively, via the raycast method described above: the
  actual grabbed point followed the cursor (+97px screen-X for a +200px
  drag). The two earlier, less reliable methods are recorded above rather
  than deleted, because the failure mode (a phase-dependent reference point
  giving an inconsistent answer) is worth keeping on record.
- **Release continuity — exact, not approximate.** `rotation.y` read
  identically immediately before and immediately after `pointerup`
  (`jump: 0`) — confirming release never resets, snaps, or discontinues the
  current angle, only what's being added to it going forward.
- **Momentum direction and boundedness:** post-release sampling (both an
  initial 1s-interval run and a follow-up 0.4s-interval run with the
  release point moved clearly off the star, so the idle target is
  unambiguous) showed rotation continuing to advance in a single consistent
  direction — no reversal, no negative excursion — at no point exceeding a
  sane bound relative to `MAX_MOMENTUM_SPEED`, and trending down toward the
  idle rate rather than sustaining an elevated speed indefinitely.
- **Cursor feedback:** `"grab"` on hover, `"grabbing"` on grab, back to
  `"grab"` on release-while-still-hovering, `"auto"` once the pointer moves
  away — all four states read correctly via `gl.domElement.style.cursor`.
- **Hover compatibility, measured together, not asserted:** `hoverGroup.
  scale.x` read `1.1592935720852509` — the exact Stage 3 value — both
  immediately after a full grab/drag/release cycle and unchanged from
  before, confirming zero regression.
- **Proximity compatibility:** `proximityTilt.rotation.z` continued
  responding to pointer position *while a drag was in progress*, confirming
  the two systems share the frame without either blocking the other.
- **Repeated rapid grab/release cycles** (4 cycles, alternating drag
  direction, ~100ms apart): settled to finite, sane values with zero
  console/page errors — no NaN, no runaway, no accumulation across cycles.
- **Reverse-direction drag:** a leftward drag produced a decrease in
  `rotation.y` (consistent, opposite-sign behavior to the rightward case).
- **Touch/mobile gating, confirmed directly, not just via matchMedia.**
  Under a CDP-forced `pointer: coarse`/`hover: none` environment, a
  synthetic `pointerdown` -> `pointermove` -> `pointerup` sequence with
  `pointerType: "touch"` dispatched straight on the canvas left
  `rotation.y` at **exactly** its pre-touch value — proving the gate
  actually prevents the drag from engaging at all, not merely that no
  qualifying event happened to fire.
- Zero console/page errors across every check (desktop dark, light,
  mobile). Zero horizontal overflow. DOM `<video>` element count unchanged
  (2). Light theme reproduced the identical `1.1592935720852509` hover
  value, confirming theme-independence.
- `npm run build` and `npm run lint` both pass clean.

**Deliberate limitations**

- **The fine-grained shape of the momentum decay curve is not cleanly
  measurable in this sandbox.** By the time of this stage's verification,
  this session's software-rendered Chromium had slowed further than the
  ~2-3fps documented in Stage 2/3 (observed well under 1fps at points,
  `rotation.y` sometimes frozen across several consecutive 400ms polls
  before jumping once). Because `useFrame`'s `delta` is real elapsed time
  and `damp()` is exact for any `dt`, the underlying decay math is sound
  regardless of how sparse the frames are — but sampling a *smooth curve*
  from such sparse, irregular frame timing isn't reliable, the same
  category of sandbox-only artifact Stage 3's own tuning pass hit with
  GSAP's lag smoothing. What WAS verified directly (direction, boundedness,
  continuity, no reversal) is the set of properties that actually matter for
  correctness; the exact "does it feel like ease-out over 1.2 seconds"
  question is a real-hardware, real-browser judgment call, not a sandbox
  measurement.
- Vertical dragging was not implemented. The brief explicitly permitted
  staying horizontal-only if a vertical term risked fighting proximity
  tilt's own pitch axis or causing chaotic tumbling; horizontal-only avoids
  that class of risk entirely rather than mitigating it, and the brief's own
  framing ("not a generic 3D model viewer") supported the simpler choice.
- Touch/coarse-pointer devices get no drag at all (see the mobile/touch
  section above) — a deliberate scope decision given the risk of a
  scroll/gesture conflict on the Hero's full-viewport Canvas, not an
  oversight.
- No cursor style change beyond `grab`/`grabbing`/`auto` — no custom cursor
  system was added, matching the brief's own "keep this minimal" instruction
  and Stage 3/3.5's precedent of not introducing new UI chrome.

**Files changed**: `src/components/GeminiStar.jsx` only (`DRAG_SENSITIVITY`/
`MOMENTUM_MULTIPLIER`/`MAX_MOMENTUM_SPEED`/`MOMENTUM_DAMPING` constants,
`isDragging`/`dragVelocity`/`momentumVelocity`/`dragCleanup` refs, the
unmount-safety `useEffect`, `handlePointerDown` and its window-scoped
`onMove`/`onUp`, the cursor-feedback additions to the existing
`handlePointerOver`/`handlePointerOut`, the priority gate and momentum term
in `useFrame`, and `onPointerDown` wired onto the existing mesh). No new
dependencies — `THREE.MathUtils.damp`/`.lerp`/`.clamp` and native
`pointermove`/`pointerup`/`pointercancel` are already available from
imports already in use.

### Milestone — Gemini Hero, Stage 3.5: Proximity Tilt (Second Interaction)

**Hover → it notices you** (Stage 3) is now followed by **move around it →
it subtly responds**: as the pointer moves anywhere over the Hero's Canvas,
the star leans a small amount toward it — roll for left/right, pitch for
up/down — smoothly damped, and eases back to neutral the moment the pointer
leaves. Dragging, momentum, and release-settle (the next two steps in the
progression) are deliberately not started.

**Architecture — an additional orientation layer, not a change to the
cinematic spin.** A new `proximityTilt` group sits between `hoverGroup` and
the `TILT_X` lean group — i.e. it is the **parent** of the lean/spinner
subtree, not a child of it:

```
hoverGroup -> proximityTilt (NEW) -> TILT_X lean -> spinner -> mesh
```

That placement is load-bearing, for the same reason `TILT_X` is already the
spinner's parent (see `TILT_X`'s own comment above it in `GeminiStar.jsx`):
anything placed INSIDE the spinner would have its own axes rotate along with
the turntable, so "pointer left" would point in a different physical
direction at every phase of the spin and read as tumbling rather than
leaning. Outside the spinner, in a stable frame, it composes cleanly as
*base spin + tilt* — `rotation.y` is still only ever written by the existing
idle/hover increment, and `proximityTilt` only ever writes its own
`rotation.x`/`rotation.z`, so the two layers cannot fight or offset each
other's phase.

**Roll (Z) for left/right, pitch (X) for up/down — Y deliberately
untouched.** A small Y-axis nudge was considered and rejected on the actual
math: for a point near the star's tip (radius ~0.96, near the local X/Y
plane), a *small* rotation about Y moves that point almost entirely in Z
(toward/away from camera), not laterally — that's the mechanism the
turntable already relies on for its width-varies/height-holds signature, but
it means a small Y offset reads as depth, not as "leaning left/right" the
way the brief describes. Roll/pitch on their own small, damped, transient
layer are what actually produce that read, and are architecturally distinct
from Stage 1's rejected *primary, continuous, full* Z-axis spin (which
failed because the whole turntable lost its depth-revealing signature by
turning on the view axis) — a few-degree transient nudge on a separate layer
doesn't reintroduce that problem.

**Pointer source — R3F's own Canvas-scoped state, no window listener.** R3F
already updates `state.pointer` (NDC, -1..1) for the whole Canvas on every
pointer move, independent of whether anything was actually hit by a
raycast — so `useFrame` reads it directly, with no new event wiring and no
risk of the "whole page tilts the star" failure mode a `window` listener
would have introduced. What R3F does not do is clear `state.pointer` when
the pointer leaves the canvas — it holds the last value — so a single extra
signal, `pointerOverCanvas` (a ref, not React state), is tracked via native
`pointerenter`/`pointerleave` listeners on `gl.domElement` itself, still
scoped to the canvas rather than the window. The tilt's target is `0`
whenever that ref is false, so leaving always eases back to neutral instead
of freezing at its last position.

**Smoothing — `THREE.MathUtils.damp`, not a window listener's raw value and
not a hand-rolled lerp.** `damp(current, target, PROXIMITY_LAMBDA, delta)` is
the frame-rate-independent exponential-decay form already available from the
`THREE` import the file already has; using it instead of
`current += (target - current) * constant` means the same visual lag holds
regardless of the actual frame rate, consistent with how `SPIN_SPEED` is
already `delta`-integrated rather than a fixed per-frame step.

**One tunable pair, not scattered magic numbers.** `PROXIMITY_TILT_MAX`
(0.12 rad, ~6.9°) caps the maximum lean in either direction on either axis;
`PROXIMITY_LAMBDA` (6) sets the damping rate. Both are named constants at
module scope alongside `SPIN_SPEED`/`HOVER_SCALE`, not inline numbers.

**Mobile/touch — gated off entirely, not faked.** There is no pointer to be
proximate to on a touch device, and synthesizing one from the last tap
position would mean the tilt jerks to a corner and sticks there — worse
than no effect. `supportsProximityTilt()` checks
`(hover: hover) and (pointer: fine)` once, in the same mount-time `useEffect`
that attaches the enter/leave listeners; on a device that fails that check,
the listeners are never attached at all (an early return, not a runtime
branch that could still fire), so `pointerOverCanvas` can never become true
and the tilt provably cannot engage. **Reduced motion is gated the same way
the idle spin already is** — continuous pointer-driven motion is the same
class of thing `prefers-reduced-motion` is meant to suppress, so the target
collapses to `0` under that setting too, consistent with the existing
pattern rather than a new one-off branch.

**Hover compatibility — no new state machine.** Hover (`hoverState`/
`hoverGroup`) and proximity tilt (`pointerOverCanvas`/`proximityTilt`) are
two independent refs read by the same `useFrame`, not a combined state
machine — the star's material/pointer handlers are unchanged, so hovering
still triggers the exact same scale-up and spin-slowdown as Stage 3 while
the tilt keeps responding underneath it, with no interaction between the two
beyond both existing in the same frame's render.

**Verified in the browser** (same headless-Chromium setup as prior stages —
`--enable-unsafe-swiftshader --use-gl=angle --use-angle=swiftshader`,
`gsap.ticker.lagSmoothing(0)` on the app's own gsap singleton for
measurement only — and via `__THREE_DEVTOOLS__`-captured live scene reads,
not screenshots alone, for anything numeric):

- **Direction and anti-symmetry**, read directly off `proximityTilt.rotation`:
  pointer right of the star → `rotation.z ≈ -0.1008`; pointer left →
  `rotation.z ≈ +0.1008` (exact mirror). Pointer above → `rotation.x ≈
  +0.1008`; pointer below → `rotation.x ≈ -0.1008` (exact mirror). Magnitude
  in all four cases matches the hand-derived prediction from
  `PROXIMITY_TILT_MAX` and the tested pointer position almost exactly.
- **Return to neutral on leave — exact, not approximate.** A real
  `pointerleave` dispatched on the canvas element (the same event the app's
  own listener listens for) brought `rotation.x`/`rotation.z` to
  `2.6e-5`/`-1.1e-33` — floating-point zero. Re-entering and leaving a
  second time reproduced the same exact-zero result, confirming the
  enter/leave pair is not a one-shot listener bug.
- **Rapid movement around the star (8 points on a circle, ~120ms dwell
  each):** settled to a bounded, non-runaway value
  (`rotation.x ≈ 0.038, rotation.z ≈ -0.018`, both well inside
  `PROXIMITY_TILT_MAX`) with zero errors — no NaN, no explosion, consistent
  with `damp()`'s own boundedness.
- **Hover compatibility, measured together, not asserted:** with the pointer
  directly on the star, `hoverGroup.scale.x` read `1.1592935720852509` —
  the **exact same value** Stage 3's tuning pass measured, confirming zero
  regression — while `proximityTilt` continued responding in the same
  frame. Hover rotation speed (measured over an 8s window, not the
  original, noisier 3s window a first pass tried) read **0.0593 rad/s**
  against idle's **0.386 rad/s** measured the same way — a ratio of 0.154,
  matching the tuned `HOVER_SPIN_SPEED = SPIN_SPEED * 0.15` target almost
  exactly and confirming Stage 3's hover slowdown is unregressed by this
  addition.
- **Theme independence:** pointer-right/pointer-left measured under an
  emulated light `colorScheme` reproduced the same `±0.1008` magnitudes as
  dark — expected, since the tilt is a pure transform with no material
  dependency, but confirmed rather than assumed.
- **Mobile/touch gating, confirmed two ways, not one.** First, `matchMedia`
  itself: forced via a CDP `Emulation.setEmulatedMedia` call *before*
  navigation (context-level `hasTouch`/`isMobile` alone did not flip the
  `hover`/`pointer` media features in this Chromium build — confirmed by a
  first attempt that read `hover: hover` / `pointer: fine` as still `true`
  under those flags alone) — `(hover: hover)` and `(pointer: fine)` both
  read `false`, `(hover: none)` and `(pointer: coarse)` both read `true`.
  Second, and more directly: even after dispatching a synthetic mouse move
  across the canvas under that emulated environment,
  `proximityTilt.rotation.x`/`.z` stayed at exactly `0` — proving the gate
  actually prevents the listeners from ever attaching, not merely that no
  qualifying event happened to fire.
- Zero console/page errors across every check (desktop dark, light,
  mobile).
- Zero horizontal overflow at both 1440×900 desktop and 390×844 mobile.
- DOM `<video>` element count unchanged (2) — Stage 2's video lifecycle is
  untouched.
- Screenshots (pointer left/right/above/below, dark desktop) were also
  captured as a supplementary visual check: the star reads correctly as
  glass with video content visible and legible at every pose, with no
  distortion, corruption, or broken layering. These are **not** matched-pose
  comparisons — the idle turntable keeps turning between captures, exactly
  the same limitation Stage 3's own screenshot pairs recorded — so they
  confirm nothing looks broken rather than proving the exact lean direction
  pixel-for-pixel; the scene-graph rotation reads above are the rigorous
  evidence for direction, magnitude, and return-to-neutral.
- `npm run build` and `npm run lint` both pass clean.

**Deliberate limitations**

- `PROXIMITY_TILT_MAX` (0.12 rad, ~6.9°) and `PROXIMITY_LAMBDA` (6) are a
  conservative starting point per the brief's own instruction, verified
  against the actual rendered numbers above rather than left as a guess —
  not re-tuned further this pass since nothing in verification suggested
  they needed to be.
- Damping was tuned for a real 60fps browser, not for this sandbox's
  software-rendered ~2-3fps path. At that low a frame rate `delta` is large
  enough that `damp()`'s exponential term is close to fully saturated most
  frames, so the tilt will read as closer to instant in this sandbox's own
  screenshots than it will on real hardware — the same class of caveat
  Stage 3 already recorded for its own GSAP-lag-smoothing artifact, and,
  like that one, it affects only how convincing a *sandbox measurement*
  looks, not the shipped behavior on an actual browser.
- Dragging, release momentum, and settle-back-to-cinematic-rotation are the
  next two steps in the stated progression and are explicitly not started.
- No cursor style change was added — not requested, out of this stage's
  scope, matching Stage 3's own note on the same point.

**Files changed**: `src/components/GeminiStar.jsx` only (`proximityTilt`
ref and group, `pointerOverCanvas` ref, `supportsProximityTilt()` gate,
`PROXIMITY_TILT_MAX`/`PROXIMITY_LAMBDA` constants, the `useEffect` wiring
`pointerenter`/`pointerleave` on `gl.domElement`, and the new block in
`useFrame`). No new dependencies — `THREE.MathUtils.damp` and R3F's own
`state.pointer` are already available from imports already in use.

### Milestone — Gemini Hero, Stage 3: First Interaction (Hover)
*(this milestone, tuned in a follow-up pass — see below)*

The Gemini star now responds to the pointer: hovering it grows and its idle
spin noticeably slows, both smoothly interpolated; moving away smoothly
reverses both. **Stage 3's first interaction only** — no dragging, click
response, cursor-following, tilt, or camera movement.

**Architecture — reuses the existing render loop, adds no new animation
system.** The idle spin was already a raw `useFrame` increment
(`spinner.current.rotation.y += delta * SPIN_SPEED`), not a GSAP tween, so
hover speed is implemented the same way: a `hoverState` ref holds a plain
`{ t: 0..1 }` object that GSAP tweens on pointer over/out
(`duration: DURATION.micro`, `ease: EASE.precise` — the same tokens already
established for UI-scale feedback elsewhere), and `useFrame` reads
`hoverState.current.t` each frame to blend the per-frame rotation increment
between `SPIN_SPEED` and `HOVER_SPIN_SPEED`. Critically, `rotation.y` itself
is never written to directly — only the increment shrinks — so the current
angle is always preserved and there is nothing to snap, reset, or restart on
hover/leave. This mirrors the existing separation of concerns from the
entrance animation: GSAP owns the tweened *value*, the render loop owns
*applying* it to the scene, so the two never compete.

**Scale uses the same pattern via a new nested group.** `hoverGroup`, a
plain `<group>` inserted between the existing `appliedScale`-scaled group
and the tilt/spinner groups, has its `.scale` written imperatively every
frame (`1 + hoverState.current.t * (hoverScaleMultiplier - 1)`) — never
through React props/state, so it costs nothing per-frame beyond a single
`setScalar` call. `HOVER_SCALE` is a single tunable constant, not scattered
magic numbers.

**Pointer detection — R3F's built-in event system, no new dependency.**
`onPointerOver`/`onPointerOut` directly on the star's `<mesh>`; three.js
raycasting through the Canvas already supports this natively.

**Tuning pass — first-pass values verified as smooth but read as too
subtle.** The user's own words: "the effect is currently too subtle." Three
constants moved together, because the ask was specifically for the
*contrast* between the two states to be unmistakable, not just for either
number in isolation:

| Constant | Before | After |
|---|---|---|
| `SPIN_SPEED` (idle) | one revolution / 22s | one revolution / **16s** |
| `HOVER_SCALE` | 1.08 (8%) | **1.18** (18%) |
| `HOVER_SPIN_SPEED` | 35% of idle | **15%** of idle |

Idle got faster *and* hover got proportionally slower relative to the new,
higher idle baseline, so hover reads as a real deceleration against an
already-energetic default rather than "the same speed, marginally reduced."
Rotation axis, direction, tilt, and the entrance timeline are untouched —
only these three tunables moved.

**A real headroom bug found while tuning, not just a bigger number
applied.** Raising `HOVER_SCALE` to 1.18 alone did almost nothing on
screen. Root cause, confirmed by reading the actual clamp math rather than
assumed: `hoverScaleMultiplier` was capped against `maxSafeScale /
appliedScale`, where `maxSafeScale` comes from the SAME `WIDTH_FIT`/
`HEIGHT_FIT` (0.86/0.82) the *resting* composition already uses almost in
full. On any landscape desktop viewport the vertical term is what binds
(camera fov/distance alone determine `viewport.height` in world units —
it does not scale with the window's pixel height, only `viewport.width`
does via aspect), and at the requested resting scale of 1.3 that term
already sits within ~1% of its own ceiling — leaving `hoverScaleMultiplier`
almost no room regardless of how large `HOVER_SCALE` was raised. On a
narrow/portrait viewport it's worse: `appliedScale` there is clamped to
exactly equal `maxSafeScale` by definition (`WIDTH_FIT` is the binding
term), so the ratio computes to exactly 1 — **zero hover growth at all**,
confirmed both by re-deriving the arithmetic from the actual constants and
by measuring `hoverGroup.scale.x` directly in a rendered page at 390×844,
which read exactly `1` under hover before the fix.

The fix is a second, looser pair of fit fractions — `HOVER_WIDTH_FIT` /
`HOVER_HEIGHT_FIT` (0.94/0.94) — used only to compute the hover ceiling,
leaving `WIDTH_FIT`/`HEIGHT_FIT` and the resting composition completely
unchanged. The reasoning: the permanent resting pose needs its full 0.86/
0.82 margin because it's what every visitor sees by default, but a
pointer-engaged hover is transient and reversible, so it can safely use a
tighter (though still real, still-under-1.0) margin without ever letting the
star's edge touch the viewport. Verified this produces the intended,
non-zero growth on both a landscape desktop viewport (measured
`hoverGroup.scale.x` ≈ 1.159, matching the hand-derived prediction from the
new constants almost exactly) and, critically, on a portrait mobile
viewport (measured ≈ 1.093 — real, visible growth where there was
previously none).

**Viewport safety — same guard, updated ceiling.** `hoverScaleMultiplier =
Math.min(HOVER_SCALE, maxSafeHoverScale / appliedScale)` still caps hover
growth at however much headroom actually exists, exactly as before; only
`maxSafeHoverScale`'s own fit fractions changed, so a hovered star still can
never be pushed past a real, computed edge-safety bound.

**A real architectural bug found and fixed, not worked around.** The star
is meant to visually pass behind the Hero copy (a `-z-50` figure, Stage 1's
design), and that copy is purely presentational (no links/buttons). The
first hover implementation worked everywhere the star was NOT visually
covered by text, but silently failed wherever it was — confirmed with
`document.elementFromPoint()` during verification, not assumed: at a point
where the star sits behind the title, the DOM hit-test returned the title's
own `<span>`, meaning the pointer event never reached the canvas at all.
Adding `pointer-events-none` to just the text was not sufficient on its
own: per CSS stacking rules, a plain (non-positioned) ancestor's OWN box
still paints *above* its own negative-z-index descendant, so
`elementFromPoint` next returned the Hero `<section>` itself, and — because
neither the section nor `HomePage.jsx`'s page-wide fade wrapper establish a
local stacking context — the hit then fell through not to the canvas but to
that unrelated, page-wide ancestor. The real fix has two parts, both on the
Hero `<section>` only: `pointer-events-none` on the section (re-enabled via
`pointer-events-auto` on just the `<figure>`/Canvas), plus `isolate` (CSS
`isolation: isolate`) so the `-z-50` figure's stacking is scoped locally to
Hero's own subtree instead of competing against the whole page's shared
root stacking context. Scoped entirely to `Hero.jsx`; `AnimatedHeaderSection`
itself and its five other callers (About/Works/Services/Contact/
ProjectPage) are untouched.

**Verified in the browser** (headless Chromium with
`--enable-unsafe-swiftshader --use-gl=angle --use-angle=swiftshader`, this
sandbox's documented requirement for video-texture rendering — Claude-in-
Chrome was not available this session, so this is not the normal-browser
check the user's own instructions treat as final authority, and is flagged
as such rather than overclaimed):

- Scale increase confirmed via matched-elapsed-time screenshot pairs (same
  total time since page load in both, so the star's rotation phase lines up
  and the comparison isolates scale rather than being confounded by pose):
  the hovered star's silhouette measurably extends further in multiple
  directions than the non-hovered baseline at the same pose.
- The elementFromPoint architectural bug above was found BECAUSE hovering
  at a point behind the title text produced no visible growth before the
  Hero.jsx fix, and did produce visible growth after it — confirmed with
  both a DOM-level check (`elementFromPoint` returns `<CANVAS>` after the
  fix, was `<SPAN>` before) and a screenshot.
- Leave/return-to-idle verified by construction (the tween target
  deterministically returns to `t: 0`, which the render loop reads
  unconditionally) and is visually consistent with that in a post-leave
  screenshot.
- Rapid repeated hover/unhover (3 cycles of ~60ms dwell each) settles to a
  normal single-hover-sized state with no runaway growth or thrown errors —
  consistent with GSAP's `overwrite: true` preventing tween pileup on the
  same tweened object/property.
- Zero console/page errors across every check performed.
- Zero horizontal overflow at 1440px desktop and 390px mobile
  (`scrollWidth === clientWidth` at both).
- Light theme spot-checked (`data-theme` resolves to `"light"` under an
  emulated light color-scheme, hover still grows the star, no errors).
- Mobile viewport (390×844, touch emulated) renders without clipping.
- DOM `<video>` element count unchanged (2, both pre-existing and unrelated
  to the star) after hover interaction — confirms the video-texture
  lifecycle from Stage 2 is untouched.

**Tuning pass — verified with direct scene-graph reads, not just
screenshots.** The first pass's screenshot-comparison method (matched
elapsed time, so rotation phase lines up) is inherently approximate for
confirming an exact number like "1.18". This pass instead read the actual
Three.js objects during a real render: `renderer.render` (patched via
three.js's own `__THREE_DEVTOOLS__` hook — a real, built-in instrumentation
point, not a hack) exposes the live `scene`/`camera` each frame, from which
`hoverGroup.scale.x` and the spinner's `rotation.y` are read directly —
exact values, not pixels.

Two sandbox-specific problems had to be solved to get a trustworthy
measurement, both recorded because they'd otherwise make the numbers below
look wrong:

- **GSAP's lag smoothing vs. this sandbox's ~2-3fps SwiftShader path**
  (documented in Stage 2's own performance note). GSAP's ticker caps how
  much elapsed time it counts per tick after a slow frame, specifically to
  avoid visual jumps — but under sustained 2-3fps that stretched the 3s
  entrance timeline to 90+ seconds of real wall-clock time, confirmed by
  sampling `rotation.y` once a second and watching it creep for over a
  minute. Calling `gsap.ticker.lagSmoothing(0)` on the app's own already-
  running gsap instance (imported via the exact resolved Vite dep URL the
  app itself uses, so it's the same singleton, not a second copy) for the
  verification session only made the entrance complete in close to its
  authored duration — what a real 60fps browser already does natively.
  This changes nothing about app behavior, only how long a *measurement*
  has to wait for the entrance to hand off before idle/hover numbers mean
  anything.
- **A raycast hit-point that was wrong, not the hover mechanism.** Locating
  a screen point to hover by scanning for `elementFromPoint() === CANVAS`
  is unreliable: the entire canvas is one opaque DOM box for hit-testing
  purposes regardless of what's transparently drawn inside it, so a point
  can report "CANVAS" while still missing the star's actual (much smaller,
  scale-clamped) silhouette on mobile. Switched to projecting the star
  mesh's real `getWorldPosition()` through the actual camera
  (`Vector3.project(camera)`, three.js imported the same way as gsap above)
  to compute the exact on-screen pixel — this is what surfaced the
  headroom bug above in the first place: the "no growth" reading on mobile
  was reproducible and exact once the mouse was verifiably on the star, not
  an artifact of missing it.

With both fixed, measured over a real render:

- Idle rotation: **≈0.33-0.37 rad/s** (target from `SPIN_SPEED`: 0.393
  rad/s / 16s period) — within this sandbox's own frame-timing jitter of
  the target, and a clearly faster idle than the pre-tuning 22s-period
  baseline.
- Hover rotation: **≈0.058-0.065 rad/s** (target from `HOVER_SPIN_SPEED`:
  0.059 rad/s), a **hover/idle ratio of ≈0.16-0.19** against the tuned
  target of 0.15 — confirms hover reads as a clear, deliberate slowdown
  relative to the new faster idle, not the prior barely-perceptible 0.35
  ratio.
- Hover scale on a landscape desktop viewport (1440×900): `hoverGroup.
  scale.x` measured **1.159** — matches the hand-derived prediction from
  `HOVER_SCALE`/`HOVER_WIDTH_FIT`/`HOVER_HEIGHT_FIT` to three decimal
  places, confirming the clamp math itself, not just the on-screen result.
- Hover scale on a portrait mobile viewport (390×844): measured **1.093**
  — real, visible growth, versus exactly **1.0** (zero growth) measured
  under the pre-fix clamp at the same viewport, confirming the headroom
  bug is fixed and not just theorized.
- Leave/return-to-idle: scale returns to exactly **1.0** after leaving
  hover, and rotation continuity was read directly (not inferred): the
  spinner's `rotation.y` continued increasing smoothly across a hover-then-
  leave transition (e.g. 25.43 → 26.13 rad across the leave), with no drop
  toward 0 and no discontinuity — confirms the "never write `rotation.y`
  directly" architecture still holds under the new speed values.
- Rapid hover/unhover (5 cycles of ~60ms dwell each): settles to exactly
  scale **1.0** afterward with no runaway growth, no drift, and zero
  console/page errors — consistent with GSAP's `overwrite: true` still
  preventing tween pileup at the new duration/values.
- Both themes: hover scale measured identically (1.159) under dark and an
  emulated light `colorScheme`, confirming the tuning is theme-independent
  (as expected — only `GeminiStar.jsx`'s numeric constants changed, no
  `MATERIAL` values were touched).
- Zero horizontal overflow (`scrollWidth === clientWidth`) at both 1440×900
  desktop and 390×844 mobile, before and after hover.
- DOM `<video>` element count unchanged (2) throughout — the video-texture
  lifecycle is untouched by this pass.
- Zero console/page errors across every check in this pass, at both
  viewports and both themes.
- Screenshots (dark desktop, light desktop, dark mobile — idle and hovered
  each) were also captured as a supplementary visual sanity check; video
  content and material read correctly in all of them, though the idle/
  hover pair isn't a matched-pose comparison this time (the star keeps
  rotating between the two captures), which is why the scene-graph reads
  above, not the screenshots, are the rigorous evidence for the scale/speed
  numbers.
- `npm run build` and `npm run lint` both pass clean after the tuning
  changes.

**Deliberate limitations**

- Both themes were now independently exercised this pass (dark and an
  emulated light `colorScheme`, each with its own hover measurement) —
  updates the prior pass's note that only light mode had been isolated.
- The hover scale tween does not special-case `prefers-reduced-motion` —
  it uses the same explicit-duration GSAP pattern the entrance animation
  already uses, which (like the entrance) is not covered by
  `lib/motion.js`'s global `gsap.defaults({ duration: 0 })` since that only
  applies when a tween does NOT specify its own duration. The idle
  rotation's own reduced-motion gate (pre-existing, unchanged) still freezes
  continuous spin entirely, so there is no continuous motion for reduced-
  motion users regardless; only the brief 0.4s scale-in on hover is
  unaffected, which is not the kind of motion that setting is chiefly meant
  to suppress.
- No cursor style change (e.g. `cursor: pointer`) was added on hover — not
  requested, and out of this stage's explicit scope.
- `npm run build` and `npm run lint` both pass clean.

**Files changed**: `src/components/GeminiStar.jsx` (hover state, hover
scale group, hover-aware rotation increment, pointer handlers on the mesh;
tuning pass: `SPIN_SPEED`/`HOVER_SCALE`/`HOVER_SPIN_SPEED` values, plus new
`HOVER_WIDTH_FIT`/`HOVER_HEIGHT_FIT` constants and a second `maxSafeHoverScale`
computation feeding `hoverScaleMultiplier`), `src/sections/Hero.jsx`
(`pointer-events-none`/`isolate` fix so hover reaches the canvas wherever
the star sits behind the Hero copy — untouched by the tuning pass). No new
dependencies — GSAP and R3F's pointer events are both already in use.

### Milestone — Gemini Hero, Stage 2: Video Textures on the Star's Surface

Multiple portfolio video clips now live directly on the Gemini star's own
surface, following its Y-axis turntable rotation with zero drift because
they are baked into the same vertex buffer Stage 1 already animates —
not separate planes, not a shader overlay. **Stage 2 only.**

**Phase 0 — video assets.** `public/videos/` held 11 source clips
(`work-01.mp4` … `work-11.mp4`), profiled directly with `ffprobe` rather
than assumed: mixed 16:9/9:16/one 33:80 orientation, 25–60fps, 12.7s–558.8s
duration, 373.4MB total, largest single file 168MB. None were shipped raw.
For each, the actual footage was reviewed (`ffmpeg` contact-sheet frame
grids, iterated one clip at a time) to hand-pick an ~8s window with real
motion and no dead time — not a mechanical "first 8 seconds," which for
several sources would have landed on a static title card or the "rotate
your phone" instruction screen (`work-09`). Encoded to
`public/videos/optimized/`: H.264, CRF 23, audio stripped, orientation and
resolution preserved as-is (all sources already ≤1280×720, so no
up/downscaling), the four 60fps sources capped to 30fps. Originals
untouched. Result: **373.4MB → 11.9MB, a 31.4× reduction**, verified per
file (resolution, duration, zero audio tracks) and spot-checked visually
for corruption on 4 of the 11.

**The GLB constraint, confirmed again rather than trusted from Stage 1's
notes:** re-parsed the glTF JSON chunk directly. One mesh, POSITION +
indices only, no NORMAL, no UV, no material — identical to Stage 1's
finding. No UVs is what makes "map a video onto this" hard at all: there
is no existing surface parameterization to sample against, and generating
one for an arbitrary mesh is normally nontrivial.

**Why a planar/group-based split, not triplanar or a custom shader.** The
star is thin along local Z (0.26 units) versus ~1.9 across X/Y — nearly
flat — so a projected planar UV unwrap is close to seam-free specifically
for this geometry, which a generic mesh wouldn't offer for free. Combined
with three.js's own mechanism for "different materials on one mesh"
(geometry groups, contiguous index-buffer runs each tagged with a
`materialIndex` into `mesh.material[]`), this gives real per-region UVs
and lets video regions use full `MeshPhysicalMaterial` — same clearcoat,
iridescence, roughness as Stage 1 — rather than an unlit texture pretending
to be the object. Triplanar or a hand-written fragment shader could also
have worked, but would have meant reimplementing clearcoat/iridescence
compositing by hand to get "video content + glass + reflection" instead of
getting it for free from the existing material stack.

**Region shape came from measuring the geometry, not guessing.** Decoded
the raw vertex buffer and profiled radius-from-center against
angle-around-Z: the star's 4 points sit at exactly **0°/90°/180°/270°**
(peak radius ~0.95), with the concave waist bottoming out at ~0.45 on the
45° diagonals. `src/lib/starVideoRegions.js` uses this: a triangle joins a
video region only if its centroid's radius clears 0.65 *and* its angle
falls within 18° of that point's own direction, so video patches sit near
each tip rather than smearing across the whole point-to-center wedge — the
waist curves and centre hub stay plain glass, satisfying "enough of the
original material visible between video regions" from the geometry itself
rather than by eyeballing a look. Boundary vertices are duplicated
per-region (a vertex shared by two differently-classified triangles gets
one UV-correct copy per region) so each region's local planar projection
— rotated so that region's own tip direction is the projection axis — is
undistorted at its own edges, at the cost of a very minor seam in the
recomputed normals exactly at each boundary.

**Multiple videos, config-driven, not hardcoded.** `src/constants/
geminiVideos.js` exports `GEMINI_VIDEO_REGIONS`, an array of
`{ tipAngleDeg, src }`. The region-splitter reads this array's length to
decide how many regions to carve — adding a 5th/6th entry (at one of the
geometry's own valid tip angles) works without touching the region-building
code or `GeminiStar.jsx`. Currently populated with 4 of the 11 optimized
clips, picked for stylistic variety against each other (cinematic
wormhole / space-themed music production / colourful motion graphics /
editorial beauty cards) rather than four similar pieces back to back.

**Material integration — video sits under the same glass, not instead of
it.** `GLASS_PROPS` (clearcoat 1, iridescence 0.15, roughness 0.05, etc.)
is shared verbatim across all 5 materials (4 video regions + 1 base), so
clearcoat highlights and reflections render on top of a video region
exactly as they do on plain glass. `color`/`map`/`opacity` are the only
per-region, per-theme variables. Before a clip has a decoded frame (or if
it never gets one), that region's material falls back to the *current
theme's* plain glass color/opacity — identical to its surroundings — so
there is no black rectangle, no placeholder, and no visible seam until
content actually arrives; a permanently-failed clip just stays plain glass
forever, which is the correct fallback, not an error state.

**Video lifecycle.** `useStarVideoTextures` creates one `<video>` element
per region on mount (muted, loop, playsInline, autoplay, `preload=auto`),
wraps each in a `THREE.VideoTexture`, and disposes everything (pause,
clear `src`, `texture.dispose()`) on unmount. Elements are never attached
to the DOM — three.js only needs a playing `HTMLVideoElement` to sample
from, not a visible one — so there is no risk of a stray `<video>`
floating over the page; confirmed via `document.querySelectorAll("video")`
finding only the 2 unrelated DOM videos that already existed elsewhere on
the page (Works/ProjectPage previews), unchanged before and after
repeated mount/unmount cycles.

**A real, non-obvious bug found and root-caused, not just patched.** The
very first render showed a fully uniform white star — no video content
anywhere, at any rotation phase. Investigated systematically rather than
guessing: confirmed the geometry groups were correct (5 groups, right
triangle counts), confirmed `mesh.material` was genuinely an array of 5
materials with real `VideoTexture` maps attached, confirmed the video
elements were actually decoding (`currentTime` advancing correctly,
`readyState 4`, correct dimensions, zero errors), confirmed the UV
attribute's full distribution was well-spread and non-degenerate (a 10×10
occupancy histogram covered the whole 0–1 range in both axes), and ruled
out a `null`→texture shader-recompile transition (tested texture-from-
first-render, no change) and a lighting/specular washout (tested
`envMapIntensity 0, roughness 1, clearcoat 0`, still uniform; tested an
unlit `MeshBasicMaterial` with the same map, still uniform). Every one of
those came back clean. The actual cause: this environment's headless
Chromium was falling back to software WebGL (visible in the console as
"Automatic fallback to software WebGL has been deprecated"), and video-
element-to-texture upload does not work correctly under that path without
`--enable-unsafe-swiftshader --use-gl=angle --use-angle=swiftshader`. With
those flags, the exact same code renders correctly. This was an artifact
of the *testing sandbox*, not the application — worth recording plainly,
because every verification claim below was re-run after finding this, not
left standing on the broken measurement.

**Verified on the rendered result, with those flags, not asserted:**

- Video content is genuinely visible and legible — recognizable text and
  imagery — at multiple star points simultaneously, confirmed across
  dense multi-frame rotation sampling in **both themes** (dark mode: a
  striped pattern clearly readable on the smoked-glass material; light
  mode: multiple distinct clips visible at once with correct color/detail).
- Stage 1 motion, unregressed: entrance sampled frame-by-frame (star
  off-screen above at 0.7–1.1s, settles by ~1.6–2.4s, no snap); the
  turntable is still Y-axis (no reversion to the earlier view-axis
  mistake); scale, position, and typography layering all measured
  unchanged from Stage 1's own figures.
- Both themes' material identity preserved: dark mode still reads as
  smoked graphite glass, light mode still reads as bright glass, matching
  Stage 1's screenshots exactly at rotation phases with no video patch in
  view.
- Zero console/page errors and zero horizontal overflow across all 12
  combinations (6 viewports × both themes) on the dev server, and
  re-confirmed on the **production build** (6 of the 12 combinations
  re-checked post-build, plus a dedicated video-content check).
- Lifecycle: navigated away to `/projects/medihelp` and back, then did a
  full page reload — zero errors through the whole cycle, star and video
  regions render correctly afterward, DOM video-element count unchanged
  (confirming no leaked elements from repeated mount/unmount).
- Performance measured, not assumed, and the measurement's own limits
  reported honestly: JS heap ~16.5MB, and a 3-second requestAnimationFrame
  sample landed at ~2.3fps. That figure reflects this sandbox's
  *software*-rendered WebGL specifically (see above) — not real hardware,
  where clearcoat/iridescence PBR on a 19,632-triangle mesh is trivial for
  any GPU. To isolate whether video decoding itself was the cost rather
  than the pre-existing Stage 1 material stack, the same measurement was
  re-run with every region's `map` forced to `null` (identical geometry,
  identical shading, zero video): **~3.0fps — statistically the same
  number.** Video textures measurably add nothing on top of what Stage 1's
  own PBR material already costs under software rendering.
- `npm run build` and `npm run lint` both pass clean.

**Deliberate limitations**

- Only 4 of the 11 optimized clips are wired into
  `GEMINI_VIDEO_REGIONS` — not all 11 play at once, both to keep
  simultaneous video decode modest and because the brief explicitly asked
  for *designed* composition over algorithmic scattering. Swapping which
  4 (or adding a 5th/6th region) is a config-file change, not a
  restructure.
- No staggered/lazy loading or pause-when-hidden was added. The measured
  cost (see above) gave no evidence it was needed, and the brief was
  explicit not to sacrifice the visual result pre-emptively; revisit if a
  real-device measurement ever shows otherwise.
- The recomputed normals introduce a very minor shading seam exactly at
  each region boundary (an unavoidable consequence of duplicating
  boundary vertices for undistorted local UVs). Not visible at the sizes
  and distances this renders at in the Hero; would be worth revisiting
  only if a future stage brings the camera closer.
- `video.crossOrigin` was not set — unnecessary today since all clips are
  same-origin (`public/videos/optimized/`), but would need adding if a
  future stage ever serves these from a CDN.

**Files changed**: `src/components/GeminiStar.jsx` (geometry-region
integration, video lifecycle hook, multi-material mesh), `src/lib/
starVideoRegions.js` (new), `src/constants/geminiVideos.js` (new),
`public/videos/optimized/*.mp4` (new, 11 files), `public/videos/*.mp4`
(new source assets, untouched). No new dependencies — `THREE.VideoTexture`
and geometry groups are core three.js.

### Milestone — Gemini Hero, Stage 1: GLB, Material, Lighting, Placement, Motion

Replaces the Hero's planet/ring/moon with the Gemini star GLB. **Stage 1
only** — Stage 2 (video textures on the star's surface) and Stage 3
(interaction) are deliberately not started and nothing here claims them.

**What the GLB actually is** (parsed from the glTF JSON chunk directly,
not assumed): one mesh `mesh_node`, 9,818 vertices / 19,632 triangles,
348KB. It ships `POSITION` + indices and **nothing else** — no normals,
no UVs, no materials, no cameras, no lights, no extensions. Bounding box
≈ 1.90 × 1.90 × 0.26, i.e. a flat four-pointed star, thin along its
native Z. Geometry was not modified. GLTFLoader synthesizes the missing
normals, so `computeVertexNormals()` is called only if they are genuinely
absent — recomputing unconditionally would smooth-shade across the tips
and round off the points that make it read as a star.

**Material — reflection, not transmission.** Real `transmission` was
tried first and rejected *on the render*: the Canvas is transparent and
nothing sits behind the star in the 3D scene, so there is nothing to
refract. It flattened into a uniform white silhouette with none of the
shading that describes the form, while still paying for three's
per-frame transmission pass. The glass read instead comes from a very
smooth base (`roughness 0.05`) under a full clearcoat, `metalness 0`, and
a high `envMapIntensity`. Base colour is a slightly cool off-white
(`#dee4ee`) rather than pure white: with a white albedo and a dielectric's
~4% normal-incidence specular, diffuse dominates and the object is
literally the plastic look. `sheen` was added and then removed — isolated
against a frozen pose, its grazing-angle lobe aliased into a dark dotted
fringe tracing the entire silhouette. `iridescence` stays at 0.15, which
renders a clean edge at 2× DPR and still gives the pearlescent shift.

**One material, two lightings.** The star deliberately passes *behind*
the Hero copy (see placement below), which makes its value a legibility
problem rather than only a taste one. Measured with the copy hidden so
glyph pixels could not contaminate the reading: on paper the dark title
reads against the white star at **18.8:1**, but in dark mode white type
over a white star measured **1.03:1** — half the name was genuinely
invisible. Dark mode therefore gets smoked glass: tinted *and*
translucent, which is what smoked glass actually is. Both halves are
load-bearing and each was measured, not guessed:

- Tint alone fails — albedo scales only the diffuse term, while the
  specular reflection of the softboxes is albedo-independent, so the
  highlights still blew to pure white even with the base at `#3f444c`.
- Opacity alone fails too — those highlights are HDR (>1.0) *before* tone
  mapping, so scaling by alpha can still clip back to white.

Together (`#5b626e`, `envMapIntensity 1.9`, `opacity 0.555`) the
brightest pixel behind the title measures **3.19:1**, past the 3.0 WCAG
large-text floor, with light mode untouched at 18.8:1. These values are a
deliberate second pass — the first working set (`#4b515b` / 1.8 / 0.5)
measured 3.79:1 but read too dark, and a brighter trial at `opacity 0.58`
measured 2.96:1 and was pulled back, so the current figure is the
brightest setting that still clears the floor. The variant follows the same
`data-theme` attribute `index.html` resolves before first paint, via a
`MutationObserver`, so it switches live with the toggle — verified
round-tripping dark → light → dark (star luminance 131 → 255 → 131, no
errors).

**Lighting.** The previous four uniform `circle` Lightformers were tuned
for the planet's matte spheres and are exactly wrong for a polished
surface — an even environment gives a smooth material nothing with
structure to reflect. Replaced with a studio set: a broad overhead key,
two narrow high-intensity rect streaks crossing at an angle (these are
what actually read as glass), a cool fill so the shadow side keeps a
blue-white cast, and a wide warm wrap tying it to the page palette.
`ambientLight` dropped 0.5 → 0.12 for the same reason. Still one baked
256px cubemap; no post-processing, no bloom, no shadow maps added.

**Rotation — a horizontal turntable around the vertical axis.** The star
rotates on **world Y**, so it behaves like a thin physical object on a
slightly raked platter: the left and right points swing toward and away
from the viewer, the face sweeps front-facing → angled → edge-on →
angled → front-facing, and the silhouette narrowing at edge-on is the
intended read — it is what makes the object's real depth visible.

Hierarchy is what makes this correct, and the ordering is deliberate. A
small backward lean (`TILT_X 0.18`) is the **parent** and the spinner is
its child, so the spin axis is that leaned vertical rather than the
camera's view axis. A Y rotation leaves the up-vector untouched and only
the fixed lean acts on it, which is what holds the top and bottom points
steady while the object turns. There is no Y tilt term: on a turntable
that never stops, a fixed Y offset only shifts the starting phase.

Two earlier arrangements were tried and are recorded because each was
wrong in an instructive way. Spinning on the **view axis** (Z) with the
tilt inside gave a perfectly rigid silhouette — measured projected area
constant within 1.3%, rigid-rotation fit at IoU 0.962 — but that is
precisely the failure: a constant silhouette is a flat 2D mark rotating
on its face, with no depth ever revealed. Before that, spinning on Z with
the tilt *outside* let the star turn within its own tilted plane while
the foreshortening axis stayed put, so the silhouette pumped once per
quarter turn. Neither reads as a physical object turning.

Verified on the render, not asserted: sampled across a full revolution,
**width varies 38%** (492→800px, face-on to near edge-on) while **height
holds within 2%** (708–724px) — the numeric signature of a Y-axis
turntable, and the exact inverse of the view-axis version it replaced.
Frames confirm it visually: full four-pointed face at one phase, a narrow
vertical sliver showing the edge at another. `rotation.z` was logged as
**exactly 0** throughout, so no view-axis spin survives anywhere. One
revolution per 110s, `delta`-based via `useFrame` so the rate is
frame-rate independent, gated on `prefers-reduced-motion` — which
`lib/motion.js`'s global `gsap.defaults({duration: 0})` does not cover,
since it collapses tweens and not a per-frame increment.

**Entrance — fast drop with the spins inside it.** Drop and rotation both
start at 0 and both run `EASE.cinematic`, so the star is spinning fastest
exactly while it is falling fastest and the two read as one movement
rather than two stacked effects: `DURATION.transition` (1.5s) for the
drop from `y: 5`, `DURATION.reveal` (3.0s) for **2.5 horizontal turns**.
Because that curve is heavily front-loaded, almost all the rotation is
spent inside the fall and the remainder becomes a long decelerating tail.
Measured profile: **2.880 → 0.798 → 0.182 → 0.034 → 0.002 turns/s**, drop
settled by ~1.9s, handing off to a 0.009 turns/s idle — no velocity step
at either end, so the transition into the idle spin is invisible. No
bounce and no overshoot: both eases are pure ease-outs, and
`EASE.revelation` (the one canonical curve that overshoots) is
deliberately not used.

The drop is animated on a dedicated inner group as a pure 5 → 0 offset
rather than on the group carrying the resting position: `.from()`
snapshots its destination when the tween is built, so animating the
positioned group directly would freeze whatever value happened to be
there at that moment. That separation (React owns layout, GSAP owns the
entrance offset) also makes resize safe.

**Placement — the star crosses behind the type, by design.** The
typography's box is explicitly *not* an exclusion zone: the star is meant
to pass behind the copy the way the planet did, and the `-z-50` figure is
what keeps the text in front. Layering, not size, is what protects
readability — so the object is sized for presence (a requested scale of
1.3, ~605–672px tall at desktop, against the ~530px the planet-era
version rendered) and simply overlaps.

The only clamps are edge guards, both derived from the live R3F viewport
rather than per-breakpoint constants, and both fixing a bug found by
measuring the render:

1. At 390px the star was clipped hard against both edges (left margin
   0px, right 1px). The camera's fov is vertical, so a narrow viewport
   loses horizontal room while keeping the same visible height. Width is
   now capped against `viewport.width`, which self-corrects at every
   aspect ratio.
2. A height cap keeps it inside short frames. Vertical placement is a
   fraction of the frame (centre at 44% from the top), so the composition
   holds its proportions everywhere instead of drifting.

**An earlier iteration tried the opposite** — measuring the copy's layout
top and treating it as clear space the star had to stay above. That is
recorded because it produced two findings worth keeping: the free space
above the copy ranges from ~23% to ~55% of the viewport depending on how
the title wraps (so no fixed fraction can express it), and reading that
block with `getBoundingClientRect()` returns a value from *inside* its own
GSAP entrance (806px at 0.5s against 388px at rest) — `offsetTop` is the
transform-independent value. The approach was dropped because strict
non-overlap forced the star below its previous size on short viewports,
which is the wrong trade for a Hero centrepiece.

**Verified on the rendered result, and on the production build**

- Star bbox measured from actual pixels at 390×844, 700×900, 820×1180,
  1024×900, 1440×900 and 1920×1080: positive margins on all four sides
  everywhere, so nothing is clipped at any edge, while the star crosses
  behind the copy as intended.
- Text legibility measured, not eyeballed, with the copy hidden so glyph
  pixels could not skew the sample: worst-case pixel behind the title is
  3.19:1 (dark) and 18.8:1 (light). An earlier reading that sampled the
  composite was wrong — it was measuring the white glyphs themselves, not
  the star behind them, which is why the copy is hidden for this check.
- Zero console/page errors and zero horizontal overflow in all 12
  production combinations (6 viewports × both themes).
- Theme toggle round-tripped dark → light → dark with the star's material
  switching live each time and no errors.
- Entrance sampled per animation frame: drop and horizontal rotation
  decelerate together (2.928 → 0.861 → 0.239 → 0.049 → 0.006 turns/s),
  the drop is settled by ~1.8s, and the idle picks up at 0.009 turns/s —
  no initialization jump, no snap, no bounce. `rotation.z` logged as
  exactly 0 for the whole run, confirming no residual view-axis spin.
- Turntable confirmed numerically across a full revolution: width varies
  38% while height holds within 2%, plus frames showing the full
  four-pointed face at one phase and a narrow edge-on sliver at another.
  Worth recording that **three** pixel estimators gave false readings
  across this milestone — "angle of the farthest point" reports a
  near-constant on a 4-fold symmetric shape, a colour-tint mask silently
  dropped parts of the star as the warm lightformer swept it, and
  sampling the composite measured the white glyphs instead of the star
  behind them. Each was caught by cross-checking against a second,
  independent measure rather than trusting the first number.
- Both themes reviewed at desktop and mobile.
- `npm run build` and `npm run lint` both pass clean.

**Deliberate limitations**

- **The dark-mode star is a different value from the light-mode one.**
  That is a deliberate art-direction call, taken because the star
  overlaps the type: pure white in dark mode made half the name
  unreadable. It is two constants in one `MATERIAL` map if the preference
  changes.
- **No UVs on the GLB is the real Stage 2 blocker.** Mapping video onto
  this surface needs either generated UVs or a triplanar-projected
  material — it is not a texture swap. The material is kept as a JSX
  child of the mesh rather than a shared module-level instance so it can
  be swapped or augmented without restructuring.
- `Planet.jsx` and `public/models/Planet.glb` (18MB) are now unreferenced
  but were **left in place** — removing them is a separate call, and
  reverting for comparison is plausible mid-Stage-1.
- No interaction, no video textures, no pointer response: Stages 2 and 3.

**Files changed**: `src/components/GeminiStar.jsx` (new),
`src/sections/Hero.jsx`. No new dependencies. `public/models/3d-star.glb`
was supplied, not generated.

### Milestone — Theme Polish: Crossfade Regression Fix + Deepened Cream Palette

Two known issues left open by the previous theme milestone: hover
animations had visually degraded since the theme system landed, and light
mode read as too bright. Root-caused the first rather than patching
symptoms; the second was a token-value adjustment.

**Animation regression — actual root cause, found empirically**

The reported symptom (hover motion "jumping to the final state," losing
easing) turned out to be a real bug in the theme crossfade rule added by
the previous milestone, not a perception issue. Confirmed with
`getComputedStyle()` in a real headless-Chromium session before touching
any code (a temporary `playwright-core` install pointed at this
environment's cached Chromium build, driving `npm run dev`; not added to
the project's own dependencies): Works.jsx's trophy icon
(`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]`), which
should transition `opacity`/`scale`/everything over 700ms, was actually
computing `transition-property: background-color, border-color, color,
fill, box-shadow` at `340ms` with `ease-connective` — the crossfade
rule's own fixed values, entirely replacing the component's, with
`transform` and `opacity` dropped from the list outright. That is exactly
"jumps to the final state": with `transform`/`opacity` absent from the
transition-property list, those changes apply with zero transition at
all.

Two independent CSS mechanisms compounded, and both had to be fixed
together (confirmed one at a time — fixing only the first left the bug
unchanged):

1. **Cascade layers.** Tailwind v4 declares
   `@layer theme, base, components, utilities;` up front and emits every
   utility class (`transition-all`, `duration-700`, `group-hover:*`,
   arbitrary-property transitions) into `@layer utilities`. The crossfade
   rule was plain unlayered CSS — and per the CSS Cascade Layers spec,
   *unlayered rules always beat layered rules regardless of specificity*.
   No selector change could have fixed this alone; the rule had to move
   into `@layer utilities` (reusing Tailwind's own already-declared layer
   name, not inventing a new one — a new layer name would simply become
   the highest-priority layer and reproduce the same bug from the other
   direction).
2. **Specificity, once it was a fair fight.** The `transition` shorthand
   sets `transition-property`/`duration`/`timing-function` as one atomic
   value per element — whichever declaration wins for that longhand wins
   the whole list, values don't merge property-by-property across rules.
   The crossfade selector (`:root:not(.theme-init) body *:not(svg):not(path)`)
   was more specific than any single Tailwind utility class, so once it
   was competing fairly inside `@layer utilities` it would still have won
   outright. Wrapped the whole selector in `:where()` to zero its
   specificity, so a component's own `transition-*` class always wins in
   full for the element it's on; plain elements with no such class have
   nothing to lose to and still fall back to the crossfade correctly.

**Consequence found and fixed, not left as a side effect**

Zeroing the crossfade's specificity means an element's own transition
declaration now wins *entirely*, including for properties it doesn't
list. Audited every arbitrary-property `transition-[...]` list in the
codebase (`grep -rn "transition-\["`) for gaps against what's actually
themed on that element. Two of three were already complete;
`ProjectPage.jsx`'s two floating award cards
(`transition-[transform,box-shadow]`) were missing `border-color` despite
having `border-[var(--color-border)]` — added it to both, verified with
the same computed-style check.

**Verified in the browser, not from source reading**

- Direct `getComputedStyle()` before/after on Works.jsx's trophy icon and
  row header, ThemeToggle, Navbar link, ProjectPage's gallery cards and
  both award cards — every one now reports its own component-declared
  `transition-property`/`duration`/`timing-function` in full, not the
  crossfade's fixed list. Re-confirmed against the actual `npm run build`
  + `npm run preview` production bundle, not just the dev server.
- Forced `:hover` via a raw CDP session (`CSS.forcePseudoState`) on the
  trophy's row and sampled computed `opacity` over time: transitions
  0→1 on hover-in and 1→0 on hover-out, confirming the mechanism
  functions end-to-end (this sandbox's headless Chromium throttles
  `requestAnimationFrame` too coarsely to also capture the interpolation
  curve frame-by-frame; the direct computed-transition-property check
  above is the rigorous evidence, this corroborates it).
- Zero horizontal overflow and zero console/page errors across every
  combination of 2 routes (`/`, `/projects/medihelp`) × 2 themes × 5
  widths (390/700/820/1024/1440) — 20 checks, all clean.
- Theme toggle verified functionally: toggling flips `data-theme` and
  `body` background correctly, survives a real page reload, carries
  across a route navigation to `/projects/medihelp` and back, and
  toggling again on the project page carries back to home correctly. No
  page errors at any step.
- Screenshotted every requested section in both themes on Home (Hero,
  Works, About, ServiceSummary, Services, ContactSummary, Contact) and
  MediHelp (Overview, Challenge/Approach, Craft gallery, Award) —
  dark mode is pixel-identical to before this milestone (only the
  crossfade mechanics changed, no dark-theme token was touched); light
  mode reads as intentional warm paper at every section, with the
  material hierarchy (page vs. raised panel vs. card vs. border) clearly
  legible.

**Light mode — deepened, not re-architected**

`#f4f1eb` (L≈94%) still read as close to a generic white site. Pulled
the whole light ladder down by the same ~2.6% lightness delta (hue/
saturation held close to the original) so the ladder's own spacing is
preserved rather than re-tuned token-by-token:
`--color-bg-base` `#f4f1eb → #efebe2`, `--color-surface-1` `#eae5dc →
#e5dfd3`, `--color-surface-2` `#e1dbd0 → #dcd5c7`, `--color-surface-3`
`#d7cfc2 → #d2c9ba`, `--color-border` `#cbc2b3 → #c6bcab`. Ink, text, and
accent tokens deliberately untouched — the accent was already
contrast-fitted against the old, brighter background, so darkening the
page only improves that margin (checked: ink 15.81:1, accent 3.81:1 on
the new background, both above the old ratios). Synced the new hex into
the two places it was hardcoded outside `index.css` —
`index.html`'s inline pre-paint script and `theme.js`'s `applyTheme()` —
so the browser's `theme-color` chrome doesn't desync from the page.

**Build/lint**

`npm run build` and `npm run lint` both pass clean, including a direct
check that the built CSS retains the `:where()` selector and `@layer
utilities` wrapper (not just the dev-server source).

**Deliberate limitations**

- The `.theme-init` class referenced in the crossfade selector
  (`:root:not(.theme-init)`) is dead code — nothing in the codebase ever
  sets it, on `<html>` or anywhere else (confirmed by grepping
  `src/main.jsx`/`src/App.jsx` in addition to the rest of `src/` and
  `index.html`). Left untouched: fixing it is a separate judgment call
  about suppressing the crossfade specifically during the very first
  paint (its likely original intent), which would need new JS wiring to
  set and clear the class, and isn't required by either reported bug.
  Flagging it here as a latent gap rather than silently leaving it
  unexplained.
- No new design tokens, no new easing curves, no changes to any
  dark-theme value, no changes to typography/spacing/composition — this
  milestone touched only the crossfade mechanism and the light
  background/surface/border ladder.

**Files touched**: `src/index.css` (crossfade rule + light palette),
`index.html` (theme-color meta sync), `src/lib/theme.js` (theme-color
meta sync), `src/pages/ProjectPage.jsx` (two `transition-[...]` lists
completed). No new dependencies added to the project — verification used
a temporary, unsaved `playwright-core` install in the scratch directory
only.

### Milestone — Dark/Light Theme System

One design language in two lightings, not two designs. Dark is the
baseline and is visually unchanged; light is expressed purely as an
override of the same semantic tokens.

**What the audit found first**

No theme logic existed anywhere (no `prefers-color-scheme`, no
`localStorage`, no `data-theme`, no Tailwind config — v4 CSS-first). The
design system was already semantic CSS variables in `index.css`, so the
real work was the 67 hardcoded, theme-coupled colours across 11
components that bypassed those variables — mostly a `text-white/30|60|80`
opacity ladder that would have inverted into invisibility on a light page.

**Architecture — one token, not a second system**

The ladder is now a single `--color-ink` foreground token registered in
the `--color-*` namespace, which makes Tailwind generate
`text-ink` / `bg-ink` / `border-ink` with working opacity modifiers.
Verified in the built CSS that these compile to runtime-switchable values
(`.text-ink{color:var(--color-ink)}` and
`color-mix(in oklab,var(--color-ink)30%,transparent)`) before building
anything on top of it. That turned ~50 special-cases into one variable.
`white`→`ink` and `gold`→`accent` migrations covered 62 occurrences; the
remaining five were a legacy icon fill, four hardcoded lift shadows, and
the click-burst flash core (a white core is invisible on paper).

**Light palette decisions**

- Warm paper `#f4f1eb`, not `#ffffff` — the dark theme is a warm
  near-black, so pure white would read as a generic product site.
- Elevation inverts direction deliberately: panels sit *lighter* than the
  page in dark and *darker* in light. What the composition depends on is
  that a chapter panel reads as different material; the contrast delta is
  preserved even though its sign flips.
- Accent keeps its hue but darkens to `#96701f`. `#cfa355` only reaches
  ~2:1 on paper, which fails for text and the thin accent rules. The dark
  theme's accent is untouched.
- Shadows become warm and far shallower — dark-theme depth reads as dirt
  on a light surface.

**Initialization, persistence, transition**

Resolution is an inline blocking script in `index.html`: explicit choice
wins, otherwise the OS preference. It must be inline — anything waiting
for the bundle paints the default first and a light-mode visitor sees a
full-screen black flash. `src/lib/theme.js` mirrors it for runtime use;
no library was added. The toggle borrows the burger's exact language
(same circle, same `--color-surface-2`, same fixed corner) one size
smaller so it stays subordinate, with both icons always mounted and
cross-faded so there is no layout shift. The theme crossfade is scoped to
colour/background/border/fill/shadow only — a global `transition: all`
would fight every GSAP hover and reveal, since those animate transform
and opacity.

**Verified in the browser, not from the code**

- No flash: under a system-light context, `body` background is
  `rgb(244,241,235)` at first paint.
- Resolution: system dark → dark, system light → light; toggle persists
  across reload *and* across route navigation; no page errors.
- Toggle measured in both themes — icons swap, `aria-label` flips, icon
  contrast is high against the button surface.
- Responsive: 390 / 700 / 820 / 1024 / 1440 in **both** themes — zero
  horizontal overflow, zero clipping, zero errors, toggle present at every
  width, and stack behaviour identical between themes, confirming the
  theme layer does not touch layout.
- Rendered and compared: MediHelp top / Challenge / gallery / Award, and
  Home's hero. The 3D hero canvas is transparent so it inherits the page
  and needed no change. Gallery cards stay defined by caption strip and
  shadow rather than heavy outlines, preserving the "surfaces, not boxed
  cards" language. Award marquee stays continuous with no dead gaps.
- `npm run build` and `npm run lint` pass.

**Deliberate limitations**

- Only MediHelp and Home's hero were visually reviewed at length. Home's
  About / ServiceSummary / Capabilities / ContactSummary / Contact and the
  Works listing were verified structurally (tokenised, no overflow, no
  errors) but not yet eyeballed section by section in light mode. That
  review is the recommended next step.
- Typography, scale, composition, spacing and motion are untouched by
  design — the theme layer changes colour only.

### Milestone — Final Creative Direction: Moments and Pacing

An art-direction pass, not an implementation one. Started by studying the
home page as an experience — reading `ServiceSummary.jsx` and
`ContactSummary.jsx` closely and capturing them mid-scroll — to work out
*why* it feels cinematic rather than to copy its layouts.

**What the home page is actually doing**

Its rhythm is not section → section → section. It alternates dense
content frames with sparse, purely typographic **moments** that carry no
information at all:

- `ServiceSummary` — four giant words at `contact-text-responsive`, no
  container, no background, pre-offset asymmetrically
  (`translate-x-16` / `-translate-x-48` / `translate-x-48`) and then
  scrubbed further apart on scroll (`xPercent` 20/−30/100/−100) until
  they clip off both screen edges, joined by gold bars, one word italic.
  Captured mid-scroll, roughly 80% of the viewport is empty.
- `ContactSummary` — pinned for ~800px, marquee above and below, a giant
  centred quote mixing weight, italic and gold within one sentence.

So the arc is Experience → **Moment** → Experience → **Moment** →
Resolution. The project page had exactly one moment (FIRST PLACE) and it
was at the very end; everything before it delivered information
continuously.

**What changed**

1. **The opening image now owns the screen.** It was `max-w-5xl` — about
   40% of the viewport, reading as an embedded figure rather than a held
   shot. Widened with real air above and below so the page opens on a
   cinematic frame, the way Hero opens on its 3D scene. The border
   treatment is untouched: `PROJECT_PAGE_SYSTEM.md` §6's framing decision
   was about this clip's light background fighting the dark theme, which
   is a question of the frame, not of scale.
2. **A pause before the payoff.** The gap before the Award chapter was
   96/128px, which read as "next section" rather than as anticipation.
   Widened to 160/256px so the Result statement finishes and the screen
   empties before FIRST PLACE arrives — the same anticipation → payoff
   beat Home builds with `ContactSummary` before `Contact`.
3. **The page's two big statements now drift on scroll**, borrowing
   `ServiceSummary`'s signature technique verbatim: scrubbed `xPercent`
   bounded by the element's own transit, `ease: "none"`, tied to scroll
   position rather than to time. Amplitude is 4 rather than Home's
   20–100 — those are single words with a screen to cross, these are
   sentences — so it reads as parallax, not as a slide. Measured range
   is ~54px end to end. Transform only, so it changes no layout height.

**Design decisions worth recording**

- **No new display copy was invented to manufacture a moment.** The
  obvious way to give the first half a `ServiceSummary`-style interlude
  is to distil the product into four big words. Every prior milestone on
  this page has refused to invent content, and a moment that exists only
  to be a moment fails this pass's own test ("if it does none of those,
  question whether it belongs"). The page's moments therefore come from
  scale, pacing and emptiness applied to material that is already there.
- **The Challenge statement was deliberately not raised to
  `contact-text-responsive`.** It is the page's emotional line and would
  make a strong early peak, but Challenge is a *pinned* chapter: at that
  scale it would grow past the stack's height gate and its own lower
  content would become unreachable. The gate exists precisely to prevent
  that, so the moment budget went to the opening image instead — which is
  outside the stack and costs nothing structurally.
- **Restraint on gold.** Home's moments use gold bars and italic
  emphasis inside the statement. Adding either here would have pushed the
  accent past the scarcity `CREATIVE_DIRECTION_BOARD.md` §1 requires,
  given the page already carries the shimmer title, the trophy, the award
  label and accent borders.

**Honest remaining differences** (deliberate, not overlooked)

- Home's body copy runs ~30px; this page's runs 18px, because
  `PROJECT_PAGE_SYSTEM.md` §8 designates `--text-body-lg` for case-study
  reading. This is the largest remaining visual difference between the
  two pages and is a documentation decision, not an oversight — worth a
  deliberate call if the two should be reconciled.
- Home has two pure-atmosphere interludes; this page has one peak. Closing
  that gap honestly requires new display copy, which is the user's call to
  make, not mine.

**Verified**

- Nothing regressed: wheel exact (100px notch → 100px, line-mode → 48px,
  edge hands off), overlap still pins 0/160 with the title inside the
  band at 80% coverage, shine still replays on both re-entry paths — and
  its end boundary is still reachable (7000px against 7300px of scroll),
  which the added spacing could have broken.
- Stack gates clean at 1920×1080, 1440×900, 1024×900, 820×1180 and
  768×1120; correct fallback at 1440×800 and 390×844. Zero clipping, zero
  horizontal overflow, zero runtime errors at any size.
- `npm run build` and `npm run lint` both pass.
- Files touched: `src/pages/ProjectPage.jsx` only.

### Milestone — Premium Polish: Typography Rhythm, Gallery Depth

Refinement only — no redesign, no new visual language. Started by
measuring both pages side by side rather than working from memory.

**What the comparison actually showed**

- Home gives every section `min-height: 900px` and **zero** margins; flow
  comes from full-viewport frames, not from gaps. Its raised panels round
  only one edge (About `0/0/32/32`, Capabilities `32/32/0/0`) so they
  bracket the transparent interlude between them.
- The gaps themselves turned out to be comparable (Home 80/168/64px vs
  MediHelp 192px), so the earlier assumption that margins caused the
  abrupt rhythm was wrong — worth recording, because it would have been
  easy to "fix" the wrong thing.
- The real difference was typographic: **Home's body copy renders as
  separate paragraph blocks**, and `AnimatedTextLines` staggers each one
  in. MediHelp's `caseStudy` strings had no line breaks at all, so they
  rendered as one unbroken block and lost the stagger entirely.

**Typography**

- Inserted 9 paragraph breaks across the case-study copy. Formatting
  only — not one word changed. `AnimatedTextLines` splits on `\n`, so
  this restores both the visual rhythm and the staggered reveal Home
  gets. Challenge/Approach/Craft/Result now render 2/5/5/3 blocks.
- Added `space-y-5` (body) and `space-y-4` (large statements) to the
  containers `AnimatedTextLines` already receives — no change to the
  shared component. Needed because Home's separation comes free at ~30px
  body copy; at `--text-body-lg`'s 18px the line breaks alone still read
  as one dense block.
- **Deliberately did not** raise body copy toward Home's ~30px, despite
  that being the largest remaining visual difference between the pages.
  `PROJECT_PAGE_SYSTEM.md` §8 explicitly designates `--text-body-lg` for
  case-study long-form reading, and per `CLAUDE.md` the documentation
  wins. Flagging the tension rather than silently overriding a canonical
  decision — worth a deliberate call if the two should be reconciled.

**Gallery depth**

- Extracted the card and image treatments into shared constants so the
  featured frame and strip items can't drift apart.
- Card and image now move on deliberately different clocks: the card
  lifts and its shadow deepens over 700ms while the image drifts to 1.06
  over 1200ms. That mismatch is what reads as depth — the image appears
  to sit behind the frame and lag it, rather than the tile scaling as one
  flat object. Scale reduced from 1.10 to 1.06; at this frame size the
  larger figure read as a zoom rather than a settle.
- `focus-within` now mirrors the hover treatment, so keyboard traversal
  gets the same affordance as a pointer.
- Aligned hover shadow behaviour across the award cards and the Approach
  callout, which previously lifted without their shadows responding.

**Regression caught and fixed mid-pass**

- The paragraph spacing grew Approach past the stack's narrow-band height
  gate — it needed 1091px against a 1030px threshold, which would have
  clipped its lower content while pinned. Caught by the clipping check
  rather than by eye. Re-measured every width and raised the narrow gate
  to 1120px (worst cases now: 881px from 1024px up, 1091px in the
  768–1023px band). A side effect of the taller chapter is that overlap
  coverage moved from 78% to **80%**, landing inside the 80–85% range
  originally asked for.

- Re-verified nothing regressed: wheel still exact (100px notch → 100px,
  line-mode → 48px, edge hands off), overlap still pins 0/160 with the
  title inside the band, shine still replays on both re-entry paths with
  its end boundary still reachable, all nine stack gate branches clean,
  zero horizontal overflow at 390/700/820/1440px, no console errors.
- `npm run build` and `npm run lint` both pass clean.
- Files touched: `src/pages/ProjectPage.jsx`, `src/constants/index.js`
  (paragraph breaks only). No new dependencies, no new tokens.

### Milestone — Interaction Polish: Wheel, Shine Replay, Overlap Stop

Polish only — no redesign. Three reported issues, all traced to concrete
causes rather than tuned by feel.

**Gallery wheel scrolling — two compounding bugs, both measured**

- `scroll-snap-type: x mandatory` was the main cause. Mandatory snapping
  forces every rest position onto an item centre, so a full 100px wheel
  notch resolved to **24px** of travel and a 3px line-mode notch to
  **zero** — the strip was snapping straight back to where it started.
  Tried `snap-proximity` first; it still snapped, because the items sit
  ~504px apart so there is always a snap point in range. Removed scroll
  snap entirely; the momentum glide now supplies the settled feel.
- `deltaY` is not always pixels. Firefox reports `DOM_DELTA_LINE` (~3 per
  notch) and some setups `DOM_DELTA_PAGE`; the old handler added that
  raw number to `scrollLeft`, so a real mouse wheel moved the strip 3px.
  Now normalised to pixels per `deltaMode`.
- Replaced the discrete `scrollLeft +=` with a `gsap.quickTo` glide —
  the same pattern `Works.jsx` already uses to trail its cursor preview
  — so a notch decelerates instead of stepping.
- Fixed two further defects found while verifying: `gsap.isTweening(el)`
  stays true after a `quickTo` finishes, so the resync that keeps swipe
  and wheel in agreement never ran (now checks the tween's own
  `isActive()`); and the edge check compared for exact equality, which a
  fractional `scrollLeft` defeated, leaving the gallery swallowing wheel
  events at the end of the strip (now compared with a 1px tolerance).
- Verified with dispatched wheel events, not by eye: a 100px notch moves
  exactly **100px**, a Firefox line notch exactly **48px**, three notches
  accumulate to exactly **300px**, and the glide samples
  `[403, 461, 484, 496, 500, 500, 500]` — smooth deceleration onto the
  target with no jitter. All six edge-handoff cases pass (both edges hand
  back to page scroll, mid-strip captures in both directions).

**Award shine — replay was structurally impossible**

- The trigger's `end: "bottom top"` resolves to **6976px**, but the
  document's maximum scroll is **6806px**. That boundary can never be
  reached, so `onLeave` never fired — and without it there is no
  `onEnterBack` to replay from. The shine could only ever play once, no
  matter what `toggleActions` said. Changed to `end: "bottom center"`
  (6526px, comfortably reachable).
- `toggleActions: "restart none restart none"` now replays on both
  re-entry paths, each confirmed: scrolling up above the section and back
  down, and scrolling past it and back up.
- Trigger moved earlier from `"55% bottom"` to `"45% bottom"`, i.e. fires
  when 45% of the section is visible, inside the requested 40–50% window.

**Chapter overlap — previous title now stays visible**

- The overlap stopped 40px short of the covering chapter, which hid the
  pinned chapter's title completely. `Services.jsx` gets this layering for
  free because its cards put their title ~24px from the top; a chapter
  opener put its title **150px** down, largely because the `text=""` slot
  still reserved ~128px for a line that renders nothing.
- Added an opt-in `compact` prop to `AnimatedHeaderSection` — same
  additive contract as the existing `textClassName`, default off, so
  every Home caller renders identically (verified: all five Home headers
  still measure `pt 64px / gap 64px`). It tightens only framing
  whitespace, never the type scale. Applied to the four chapter openers.
- With the title now at 70–150px, the sticky step went from 2.5em to
  **10em (160px)**. Measured result: Challenge pins at 0, Approach at
  160, the visible band is exactly 160px, the pinned title sits fully
  inside it, and Challenge ends up **78% covered** — close to the
  requested 80–85%, and erring toward showing the title rather than
  clipping it, which was the actual goal.
- Side benefit: removing the dead whitespace cut the mobile page from
  8535px to 8055px.

- Re-verified the whole stack after the height changes: all nine gate
  branches still correct, zero clipping, zero horizontal overflow at
  390/700/820/1440px, no console errors.
- `npm run build` and `npm run lint` both pass clean.
- Files touched: `src/pages/ProjectPage.jsx`,
  `src/components/AnimatedHeaderSection.jsx` (additive `compact` prop).
  No new dependencies.

### Milestone — Chapter Stack Transition + Award Light Sweep

Interaction refinement only — no redesign, no content changes.

**Chapter stack (Challenge → Approach → Craft)**

- Reuses `Services.jsx`'s Capabilities interaction as-is rather than
  approximating it. Worth recording what that interaction actually *is*,
  because it isn't obvious from the outside: it's plain CSS
  `position: sticky` with a staggered `top`, an opaque background and a
  top border. GSAP never drives the stacking there — only the entrance
  reveals. So there's no pinning, no scroll hijacking and no new
  scrolling system here either.
- Challenge pins at `top: 0`; Approach pins 2.5em lower, leaving a sliver
  of Challenge visible above it as the stack edge (the same peek Services'
  staggered `top` produces). Verified by tracking viewport-relative tops
  while scrolling: Challenge holds at 0, Approach holds at 40px, Craft
  slides up over both.
- **Craft is deliberately not sticky.** At ~2095px it's far taller than
  any viewport, and a pinned element taller than its own viewport buries
  its lower content permanently — pinning it would have made the gallery
  unreachable. In normal flow it does exactly what was asked anyway
  (scrolls up over the pinned Approach); `relative z-[3]` makes it paint
  above the pinned chapters, since sticky elements are positioned and
  would otherwise paint over a static sibling.
- The three chapters are wrapped in one container, which is what *bounds*
  the effect: sticky releases at its containing block's bottom, so the
  stack is over the moment Craft ends. Confirmed Result is
  `position: static` — the effect cannot reach it, Credits or Links.
- **Viewport-height gate, because the interaction is only safe when the
  pinned chapter fits.** Measured: the two pinned chapters top out at
  810px from 1024px wide up, reflow to 936px in the 768–1023px band, and
  reach 1333px on mobile. That needs two media queries, not one — the
  height a stack requires depends on the width it's at — and mobile is
  excluded outright rather than shipping an interaction that hides
  content. Below the gate the chapters render in normal document flow.
  Verified all nine branches (stacks at 1920×1080 / 1440×900 / 1024×900 /
  1023×1030 / 820×1180 / 768×1030; falls back at 1440×800 / 820×900 /
  390×844) with a check that flags any chapter needing more room than its
  viewport gives — zero clipping warnings.
- **Prerequisite bug fixed**: `<main>` carried `overflow-x-hidden`, which
  makes the element a scroll container and silently breaks
  `position: sticky` for every descendant — the stack would simply never
  have pinned. Swapped to `overflow-x-clip`, which gives the same
  horizontal-overflow protection without establishing a scroll container.
  Re-verified zero horizontal overflow at 390/700/820/1440px afterwards.
- Dropped Challenge and Craft from the scale-scrub transition added in an
  earlier pass: the stack is now their transition, and a scrub transform
  on a stacked chapter fights it (a transform also makes an element a
  containing block, which is another way sticky gets broken by accident).
  Result and the Award chapter keep theirs.

**Award light sweep**

- Two soft light sweeps cross the Award chapter once, staggered 0.9s
  apart, behind all content. New `award-light-sweep` utility in
  `index.css`: alpha peaks at 6–10%, band is 45% of the section wide,
  `blur(48px)` feathers both edges, colours derived from existing tokens
  via `color-mix()` (the idiom `click-burst` already uses) and the 100deg
  angle matched to `gold-shimmer-text`. Deliberately not a flare, laser
  or bright stripe.
- Trigger uses ScrollTrigger's `"55% bottom"` — literally "the point 55%
  down the section reaches the viewport bottom", i.e. 55% of the section
  is visible — so the requested 50–60% window is expressed exactly rather
  than approximated with a viewport percentage. `once: true` guarantees
  exactly two sweeps total.
- `EASE.connective` (0.65, 0, 0.35, 1) is the one true ease-in-out in the
  canonical set — the right curve for "no abrupt starts or stops".
  `EASE.cinematic` would have been wrong (a hard ease-out that whips in
  and crawls out). `EASE`/`DURATION.revelation` stay out entirely per
  `PROJECT_PAGE_SYSTEM.md` §7. Duration is `DURATION.reveal`.
- Verified by sampling the transform over time, not just by eye: both
  elements held at the start position before the trigger, sweep 2 still
  parked while sweep 1 was underway (stagger confirmed), both settled once
  and never repeated. The easing profile measured 8px of travel in the
  first 150ms, ~1200px through the middle and 235px in the final second —
  a textbook ease-in-out. Trigger fired with 584px of 1061px visible =
  55.0% exactly.
- Skipped entirely under `prefers-reduced-motion`: this is pure
  atmosphere, and `lib/motion.js`'s global `gsap.defaults({duration: 0})`
  does not collapse tweens that set their own duration, as this one must.

- `npm run build` and `npm run lint` both pass clean.
- Files touched: `src/pages/ProjectPage.jsx`, `src/index.css` (the new
  sweep utility). No new dependencies — `react-responsive` was already in
  use by `Services.jsx` and `Hero.jsx`.

### Milestone — MediHelp Project Page Art Direction, Third Pass

- Structural fix, not another styling adjustment: Hero.jsx/About.jsx/
  Services.jsx never wrap their content in a centred `max-w-Nxl mx-auto`
  box — they use `px-10` as a gutter and nothing else, and let
  `AnimatedHeaderSection`'s own banner-scale title carry the composition.
  Every chapter opener (Challenge/Approach/Craft/Result) now reuses
  `AnimatedHeaderSection` itself — the exact component and scale Hero/
  About/Services/Contact use for their own frame entrances — instead of
  approximating it with `text-4xl`/`text-5xl`. `text=""` deliberately:
  the case study's real paragraphs are genuine reading-length prose, not
  the short single-line Hero/About/Services pass through that slot, so
  they render separately below at a readable size, offset (not centred).
- Two concrete, verifiable bugs fixed in the screenshot showcase:
  - **Cropping.** Every source screenshot is a real 1920×1080 (16:9)
    capture — confirmed directly, not assumed. The previous pass forced
    the featured frame into 21:9 and the strip into 4:3, cropping real
    product screenshots (the featured image was missing its entire top
    navbar). `aspect-video` (16:9) on both now matches the source
    exactly, so `object-cover` has nothing left to crop.
  - **Horizontal scroll.** `overflow-x-auto` alone only responds to a
    trackpad's real horizontal swipe or touch drag — a plain mouse wheel
    has no native effect on it, which was the exact reported bug (page
    scrolls vertically, the strip never moves). Fixed with a real
    non-passive `wheel` listener (React's synthetic `onWheel` can't
    reliably `preventDefault()` here — a documented React 17+ limitation,
    not something a handler prop can work around) that converts a
    vertical-dominant wheel delta into `scrollLeft`, while a genuine
    trackpad horizontal gesture and mobile touch swipe are left to their
    already-working native behavior, and either scroll edge hands off to
    normal page scroll rather than trapping the visitor. Verified
    functionally with a real Playwright `mouse.wheel()` dispatch, not
    just visually: scrollLeft moved 0→528 while `window.scrollY` stayed
    fixed, and scrolling resumed normally once the strip was exhausted.
- **Real regression caught during verification, not left in**: reusing
  `AnimatedHeaderSection` for single-word chapter titles ("Challenge",
  "Approach") surfaced a genuine pre-existing bug in the shared
  `banner-text-responsive` utility — a single unbroken word has no space
  for the component's flex-col per-word wrap to act on, so at 3 of its 4
  size tiers it could overflow past `px-10` and get silently clipped by
  an ancestor's `overflow-x-hidden`. Confirmed "MediHelp" itself (the
  page's own existing title) was already affected — not something this
  pass introduced. First fix attempt (`break-words` alone) traded
  invisible clipping for visible overlap, since the utility's line-height
  is tuned for the flex-col multi-word case, not in-word wrapping; a
  first sizing attempt was verified with a flawed check
  (`scrollWidth`-vs-`clientWidth`, which false-negatives the moment a
  word wraps) and missed an entire breakpoint tier. Re-verified properly
  — forcing `white-space:nowrap` to measure true text width regardless of
  current wrap state — across 19 widths spanning every tier boundary
  (375–1920px). All clear. `break-words` stays on as a defensive
  backstop; the real fix is each tier's font-size now fit to its own
  worst-case container width.
- **Discovered, not fixed — out of scope**: the same corrected audit
  found Home's own `Services.jsx` title "Capabilities" (12 characters,
  longer than "Challenge") also overflows `banner-text-responsive` at
  several breakpoints, pre-existing and unrelated to this milestone
  (`/projects/medihelp` only; `Services.jsx` untouched). Flagged for a
  separate task, not fixed here.
- Verified Home's own titles (`Dagim Demissie`, `Works`, `About`,
  `Contact`) are unaffected by the `banner-text-responsive` and
  `AnimatedHeaderSection` changes — checked with the same corrected
  wrap-detection probe, plus a direct screenshot comparison at desktop
  and mobile.
- `npm run build` and `npm run lint` both pass clean.
- Files touched: `src/pages/ProjectPage.jsx` (the page itself),
  `src/components/AnimatedHeaderSection.jsx` (the `break-words`
  backstop — additive, a no-op for any title that already fits, so every
  existing caller is unaffected), `src/index.css`
  (`banner-text-responsive` tier resizing). No new dependencies.

### Milestone — MediHelp Project Page Art Direction, Second Pass

- Found and fixed a real bug in the first pass, not a design nitpick: the
  Result marquee (`First Place` / `AASTU Tech Fest 2025`) only had 2 items.
  `Marquee.jsx`'s `horizontalLoop()` needs the combined item width to
  comfortably exceed the viewport, or the loop shows a visible empty gap
  before repeating — confirmed exactly that with a 3-frame capture at
  1440px (the loop went text → stars → dead air → repeat). Every home-page
  marquee (`Contact.jsx`, `ContactSummary.jsx`) uses 5 items for the same
  reason; matched that convention. Re-verified with the same 3-frame
  capture — continuous text at every frame, no gap.
- Rebuilt Challenge and Result around Hero.jsx's own asymmetric signature
  (title block on one side, statement text on the other, right-aligned —
  `AnimatedHeaderSection`'s actual layout) instead of the first pass's
  centered-but-big treatment, which was still fundamentally a centered
  paragraph block. Result mirrors Challenge (numeral+label swaps sides)
  rather than repeating it — a bookend by rhyme, not duplication.
- Approach's "Where It Got Hard" callout became an actual card: raised
  surface, icon badge, hover lift — not a paragraph with a left border.
- Craft's gallery rebuilt entirely. The first pass's 3-column grid of
  same-size thumbnails was evidence "presented as a set" but too small to
  read as the page's stated centerpiece. Now: one large featured frame
  (21:9, the marketing hero shot) full-width in the chapter, then the
  remaining seven in a horizontal scroll-snap strip at up to 480px each
  — closer to how a product page presents screens than how a document
  embeds thumbnails. Next item deliberately peeks at the viewport edge as
  the scroll affordance; a small caption reinforces it. No new library —
  native CSS scroll-snap + Tailwind's arbitrary-property escape hatch for
  the hidden scrollbar.
- Award became its own raised, brighter chapter (`surface-1`/`rounded-4xl`,
  matching Craft) with a soft radial spotlight behind the trophy (existing
  `--color-accent-subtle` token, no new color). "First Place" pulled out
  as its own 4xl/6xl display statement — the same fact the body copy
  already states, just given typographic weight instead of staying a
  small tracked label. Certificate/ceremony cards sized up from 384px to
  480px, matching the gallery strip's own item width.
- Added a continuous-motion scrub transition (About.jsx's own technique:
  scale 0.97, scrollTrigger-scrubbed, `power1.inOut` — outside the four
  canonical reveal curves, same as About's version) at the page's four
  heaviest beats — Challenge, both raised chapters, Result — so leaving
  one doesn't read as a hard stop before blank space. Not applied
  everywhere, matching the restraint of About's own single use on the
  home page.
- Re-verified the tablet-gap breakpoint discipline (`md`, not `sm`) that
  was already fixed once for the old award-card layout still holds for
  every new responsive element — checked scrollWidth === innerWidth at
  390/700/820/1440px explicitly, given the new horizontal-scroll gallery
  and floating cards were new surface area for exactly that kind of bug.
  Zero console errors at any width.
- `npm run build` and `npm run lint` both pass clean.
- Only `src/pages/ProjectPage.jsx` touched — no other component, route, or
  design token changed. No new dependencies.

### Milestone — MediHelp Project Page Art Direction

- Full visual redesign of the case-study sections (Challenge/Approach/
  Craft/Result/Credits) — the previous pass was architecturally correct
  but funneled every section through one identical heading+body wrapper,
  which read as documentation rather than the home page's cinematic
  register. Removed that generic wrapper; every section now has its own
  composition, pulled directly from patterns the home page already uses
  rather than invented fresh:
  - **Challenge** — typography-first, centered, oversized (text-3xl→5xl,
    font-light) instead of a paragraph block, echoing the scale Hero/
    Services headings actually use (the project's own `--text-h2` token
    turned out to be far smaller than anything the home page uses for a
    real heading — a real gap the previous pass didn't catch).
  - **Approach** — split/offset layout (`lg:grid-cols-[1fr_2fr]`), per
    COMPOSITION_PRINCIPLES.md §3's explicit rule for About-style content:
    "text block positioned toward one side... not a centered container."
    Challenges nests inside as an accent-bordered callout.
  - **Craft** — raised onto `--color-surface-1` with `rounded-4xl`, the
    same giant-radius "chapter" language About/Services use where the
    page changes register. Gallery rebuilt: clipPath wipe-in reveal
    (About.jsx's own portrait-reveal technique, staggered across 8
    images), hover scale + lifted shadow, a middle-column vertical offset
    per row of three so it reads as composed rather than tiled, and
    numbered captions matching Services.jsx's `0{n}` list pattern.
  - **Result** — centered resolution beat mirroring Challenge's register
    (this page's own bookend structure). Award section adds the trophy +
    `animate-trophy-glow` treatment — a direct callback to the Works
    index row's own hover state for this exact project, not a new motif.
    Certificate/ceremony images become slightly tilted "floating cards"
    (opposing rotation, settling flat on hover) instead of a flat 2-up
    grid. One `Marquee` band (the same component Contact/ContactSummary
    use) repeats the award's own verified facts as a rhythm break.
  - **Credits** — Contact.jsx's own label/thin-divider/value pattern,
    reused verbatim as the page's quiet closing register before Links.
  - Every heading (not just body paragraphs) now reveals on scroll —
    ported from Services.jsx's ref-array + forEach + per-element
    ScrollTrigger pattern, using the canonical `EASE.cinematic`/
    `DURATION.reveal` tokens in place of Services' pre-token-system ease.
  - No new easing curves, motion tokens, or CSS systems introduced —
    everything traces to `lib/motion.js`'s four canonical curves, this
    project's own `--shadow-lg`/`--radius-lg` tokens (present in
    `index.css` since the design-tokens port but never actually used
    until this pass), and Tailwind's built-in `group`/`group-hover`.
- **Real regression caught and fixed during verification, not left in**:
  the new floating award cards initially used a `sm:` breakpoint for
  their row switch — reintroducing the exact tablet-gap inconsistency
  (multi-column media next to still-single-column text at ~700px) that
  was already found and fixed for the gallery grid in the previous
  milestone. Changed to `md:`, matching the page's one other responsive
  split, and re-verified at 700px/tablet/mobile/desktop.
- Verified via rendered screenshots (headless Chromium) at desktop
  (1440px), tablet (820px), the 700px tablet gap, and mobile (390px),
  plus a direct screenshot comparison against the home page's hero to
  confirm the shared scale/weight/subtitle/divider vocabulary. Zero
  horizontal overflow at any width (`scrollWidth` === `innerWidth`,
  checked explicitly given the new rotated/offset elements).
- `npm run build` and `npm run lint` both pass clean.
- Only `src/pages/ProjectPage.jsx` was touched — no other project,
  component, route, or design token changed.

### Milestone — MediHelp Project Page Implementation

- Implemented the full MediHelp case study on `/projects/medihelp`,
  populating `caseStudy` in `src/constants/index.js` with real content
  sourced entirely from `docs/case-studies/MEDIHELP_CASE_STUDY.md`
  (Challenge ← §2, Approach ← §3+§4 with §7 Challenges nested inside,
  Craft ← §5+§6 plus the media gallery, Result ← §9 with §8 Award nested
  inside, Credits ← §5's team structure). Data lives in constants, not
  hardcoded JSX strings — `ProjectPage.jsx` renders generically from
  `project.caseStudy`, the same pattern `outcome`/`role`/`stack` already
  used.
- Two section-ordering judgment calls, made explicitly rather than
  silently: Award nests under Result (matching the case study's own
  "(see §8)" cross-reference from §9, since `PROJECT_PAGE_SYSTEM.md` §4
  doesn't define an 8th top-level section for it) and Challenges nests
  under Approach (no separate §4 slot exists for it either — obstacles
  navigated are part of "the thinking" Approach is defined to hold).
- Added a local, unexported `CaseStudySection` helper in `ProjectPage.jsx`
  for the five repeated heading+body blocks. Deliberately does *not*
  reuse `AnimatedHeaderSection` for each one — that component's
  banner-text-responsive display scale is this page's one big title,
  already used once for Overview; repeating it five more times down one
  page would compete with it rather than support it
  (`HIERARCHY_SYSTEM.md` §1). Uses `text-h2`/`text-h3` instead.
- Built the media gallery: 8 images (hero, AI Assistant, Features, Who
  We Are, Find a Doctor, Symptom Checker, Sign Up, Testimonials) in a
  uniform responsive grid — no lightbox/carousel/zoom, since nothing
  here passes `UX_ARCHITECTURE_BLUEPRINT.md` §6's three-purpose test for
  one. Award section gets the certificate + ceremony photo in a matching
  2-up grid.
- Quality issues in the source screenshots (unedited template placeholder
  copy in `features.webp`/`who-we-are.webp`, Windows-activation
  watermarks in two captures, `login.webp`'s content being the sign-up
  form rather than a login screen) are surfaced in code comments and
  handled by captioning tiles by actual content — not hidden, cropped,
  or edited out of the images themselves, per this milestone's explicit
  instruction.
- Added MediHelp's `favicon.svg` next to the "Live ↗" link — a small,
  functional use (confirms which product the link leads to), not
  decoration. `logo.png` stays unused and unconverted this milestone, as
  instructed.
- **Real bug caught during responsive verification, not left in**:
  the gallery and award grids initially used Tailwind's `sm:` breakpoint
  (640px) for their 2-column layout. Screenshotting a genuine tablet
  width (700px — between `sm` and this page's only other responsive
  split, `metadata`'s pre-existing `md:flex-row` at 768px) showed
  multi-column media next to still-single-column text: a state
  `PROJECT_PAGE_SYSTEM.md` §8 doesn't define and this page has no other
  precedent for. Changed both grids to `md:`, matching the page's
  existing breakpoint convention, and re-verified at 700px/mobile/desktop
  before proceeding — mobile and desktop screenshots are pixel-identical
  before and after the fix (page height unchanged at both), confirming
  no regression.
- Verified via actual rendered screenshots (headless Chromium), not just
  code review: desktop (1440px), the 700px tablet gap, and mobile
  (390px). One capture-only false alarm along the way — `AnimatedTextLines`
  paragraphs appeared blank in an initial full-page screenshot because
  Playwright's single-shot capture doesn't fire the real scroll events
  `ScrollTrigger` needs; simulating actual incremental scroll resolved it
  and confirmed the content renders correctly for a real visitor.
- `npm run build` and `npm run lint` both pass clean.
- Nothing outside `src/constants/index.js` and `src/pages/ProjectPage.jsx`
  was touched — no other project, component, or route affected.

### Milestone — MediHelp Media Preparation & Case Study Completion

- Renamed `public/assets/projects/medihelp-project/` to `medihelp/`, matching
  the `medihelp` route slug used in `src/constants/index.js`. Pure filesystem
  rename — the folder wasn't wired into React yet, so nothing broke.
- Converted 10 raster assets to WebP (originals kept, nothing deleted):
  `hero/hero.png`, all 7 `screenshots/*.png`, `award/certificate.jpg`, and
  `award/award-ceremony.HEIC` (via ImageMagick's HEIC delegate, with the
  embedded 180° EXIF rotation corrected during conversion — verified
  visually, not just by dimensions). Combined originals 7.4MB → WebP 1.7MB
  (~77% smaller) at quality 85.
- Attempted logo vectorization per instruction. No trace tool (`potrace`,
  `autotrace`, `vtracer`) is installed in this environment, and
  `branding/logo.png`'s ribbon shapes use a smooth multi-stop gradient on
  curved paths — the category automated bitmap tracers handle worst.
  Documented the reasoning in the case study rather than faking an SVG by
  embedding the bitmap; `logo.png` stays a PNG.
- Discovered `branding/favicon.svg` is a genuinely separate hand-authored
  vector mark (real paths, not an embedded bitmap) — visually distinct from
  `logo.png`, not a vector version of it. Corrected an implicit assumption
  from the previous milestone that they were the same mark.
- Rewrote `MEDIHELP_CASE_STUDY.md` §10 (Media) as a complete asset
  inventory — every file's dimensions, size before/after conversion, what
  it depicts, and used-now vs. reserved-for-future status. Flagged
  everything genuinely notable rather than smoothing it over: unedited
  template placeholder copy in two screenshots (`features.webp`,
  `who-we-are.webp`), a `login.webp` filename that doesn't match its
  content (it's the sign-up form), Windows-activation watermarks in two
  captures, and a footer copyright year (2023) that doesn't match the
  certificate's 2025 hackathon date. `mobile/` and `graphics/` stay
  documented as genuinely empty — not fabricated to look complete.
  Certificate text (exact hackathon name, "15,000" cash amount as written
  — no currency symbol printed on the certificate, none invented here —
  07/05/2025 date, full sponsor list) gives §8's award claim primary-source
  backing
  that wasn't recorded anywhere in the document before. Version bumped
  1.1 → 1.2.
- Validated the full asset inventory against the filesystem: every path
  named in the case study exists, every file in `medihelp/` is accounted
  for in the case study, and no stale references to the old
  `medihelp-project/` folder name remain (its two remaining mentions are
  intentional history/rename-explanation text).
- No React components, CSS, routing, animations, or `ProjectPage.jsx`
  touched — this milestone is content and assets only, same restraint as
  every prior MediHelp documentation pass.

### Milestone — Documentation & Obsidian Integration

- Established `docs/` as a self-contained Obsidian vault: created
  `docs/MOC_SOLARISX.md` (main navigation page, wikilinked by section —
  Vision/Design System/Engineering/Project Architecture/Case Studies),
  two `.canvas` mind-map files (`SOLARISX_ARCHITECTURE.canvas` and
  `Solarisx_Project_Map.canvas` — different groupings, both current,
  neither supersedes the other), and `docs/.gitignore` (`.obsidian/`,
  later extended with `.smart-env` for the Smart Connections plugin).
- Added YAML frontmatter (`title`/`type`/`status`/`related`) and a
  "Related Documents" section to all 17 canonical + case-study documents.
  Every cross-reference was grepped out of the documents' own prose first
  (headers like "Governed by X.md", explicit `§`-citations) rather than
  invented; the handful of links added on request without a textual
  citation are called out inline in the affected files themselves
  (`PROJECT_PAGE_SYSTEM.md`, `MEDIHELP_CASE_STUDY.md`, `TECH_STACK.md`).
  Zero content changed — additions only, verified via `git diff --numstat`
  showing 0 deletions across every touched file.
- Resolved the `PROJECT_CONTEXT.md` naming collision: renamed this file
  (root, implementation-status snapshot) from `PROJECT_CONTEXT.md` to
  `PROJECT_STATUS.md`. `docs/vision/PROJECT_CONTEXT.md` (canonical vision
  document, unrelated purpose) is untouched — confirmed via full-repo
  grep that no other file referenced the root document by its old name
  before renaming.
- Re-verified vault integrity end-to-end: both canvas files parse as
  valid JSON, every file-node path resolves, no duplicate node IDs, no
  broken edges, and all 19 wikilink targets across the vault resolve to
  exactly one file each.
- **Known still-open items** (not fixed this milestone — out of scope or
  not yet requested): `docs/` is tracked as a git submodule gitlink but
  has no `.gitmodules` entry, so `git submodule update --init` doesn't
  work on a fresh clone; `docs/case-studies/MEDIHELP_CASE_STUDY.md` is
  still uncommitted in the `Claude-Manual` remote; new MediHelp media
  assets appeared under `public/assets/projects/medihelp-project/`
  (screenshots, award certificate, branding, hero video) — not reviewed
  or wired into anything this milestone.
- No UI implementation performed — `ProjectPage.jsx`, `constants/index.js`,
  components, styling, animations, and routing are all untouched.

### Milestone — MediHelp Case Study Content Filled In

- Updated `docs/case-studies/MEDIHELP_CASE_STUDY.md` (v1.0 → v1.1) with new
  verified information covering the problem statement, research/discovery,
  design process, development (frontend contributions, team structure,
  workflow, technical involvement), challenges, and final outcome.
- Resolved 5 of the 7 previously open `NEEDS USER INPUT` gaps: §2 Problem,
  §3 Research, §4 Design Process, §7 Challenges, §9 Final Outcome.
- Remaining gaps: §5 architecture detail beyond the confirmed tech list
  and confirmed areas of involvement (AI integration, authentication, API
  communication), and §10 website screenshots/graphics assets/hackathon
  materials.
- No unsupported statistics or invented metrics were added — the "70%+"
  figure was explicitly excluded per instruction.
- No UI implementation performed — `ProjectPage.jsx`, `constants/index.js`,
  components, styling, animations, and routing are all untouched.

### Milestone — MediHelp Case Study Documentation

- Created `docs/case-studies/MEDIHELP_CASE_STUDY.md`.
- Added verified project information: hackathon origin, first-place award
  (certificates + cash prize + best-solution title), and the creator's full
  role (front-end team member who built the Home and Blog pages; head of
  video editing; independent graphics and video/asset creation).
- No UI implementation performed — `ProjectPage.jsx`, `constants/index.js`,
  components, styling, animations, and routing are all untouched.
- Implementation waits for content approval. Several sections are
  explicitly marked `NEEDS USER INPUT` (problem statement, research,
  design-process reasoning, architecture detail, challenges, screenshots/
  graphics/hackathon-material assets) rather than filled with invented
  content.

### Milestone — Project Page Overview+Media build, navigation fix, animation gap fix

- Built the real visual design for `ProjectPage.jsx` (previously plain
  placeholder markup): Overview + Media sections per §4, framed hero video
  with a generated poster frame, metadata layout per §8's responsive rule.
- Extracted `isVideo()` into `src/lib/media.js`, shared by Works.jsx and
  ProjectPage.jsx (the second-consumer threshold `PROJECT_PAGE_SYSTEM.md`
  §5 names for when to extract).
- Fixed MediHelp's `outcome` field: it contained a literal `TODO:` sentence.
  Replaced with content sourced from the project's own GitHub README
  (`ellay21/Medihelp-Frontend`) — verified, not invented. The README
  documents no award/placement/result, so nothing about "what came of it"
  was added; the gap stays real rather than fabricated.
- Added a `gold-shimmer-text` treatment for the "Award Winning Solution"
  qualifier line — a one-time (not looping) gold gradient sweep, reusing
  only existing tokens (`--color-accent`, `--color-accent-dim`,
  `--color-text-primary`) and the existing `EASE.cinematic` curve. Exposed
  via a new optional `textClassName` prop on `AnimatedHeaderSection`
  (defaults to empty — every other caller unaffected).
- **Bug fix**: the internal-link click path used React Router's
  `navigate()` (same-tab) instead of `window.open()` (new tab), violating
  §2's new-tab rule. This also caused the reported "opens halfway down the
  page" symptom — React Router doesn't reset scroll position on a same-tab
  route change, so the project page inherited whatever scroll position
  Works was at on the homepage. Fixed by routing both internal and
  external clicks through the same `window.open()` call; a fresh tab
  starts scrolled to top by construction.
- **Bug fix**: everything below the header (metadata row, media block) had
  no reveal animation at all — it just appeared instantly while the header
  animated in. Added a `useGSAP` reveal reusing `EASE.cinematic`/
  `DURATION.reveal`, and swapped the outcome's bare `<p>` for
  `AnimatedTextLines` per §5's own component table.

### Milestone — Click burst interaction (Works.jsx)

Radial light-burst click feedback on every Works row (internal or
external). Root-caused and fixed a real invisibility bug (React Router's
synchronous route swap was unmounting the burst before first paint);
brightness/timing tuned twice based on visual review. Settled values: 24px
base circle, white-to-gold radial gradient (`color-mix()` off
`--color-accent`), 3-phase GSAP timeline (flash → expand → fade), 0.8s
total, `EASE.precise`/`EASE.cinematic`.

### Milestone — Project Page infrastructure

Added `react-router-dom`. `App.jsx` became a route switch; the former
single-page body moved unchanged into `pages/HomePage.jsx`. New
`pages/ProjectPage.jsx` (route resolution, slug lookup, not-found
fallback). Added `slug`/`caseStudy` fields to all projects (additive,
`docs/design/PROJECT_PAGE_SYSTEM.md` §3).

### Milestone — MediHelp video fix + trophy award treatment

`medi-help.mp4` was a corrupted 48-byte stub (interrupted ffmpeg
conversion, no `moov` atom) — re-encoded from the valid `mediHelp.mp4`
source. Added a hover-revealed trophy + "1st" badge on MediHelp's Works
row, escaping slightly above the row for a "breaking the frame" effect.

### Milestone — Scroll-reveal timing fix

Non-scrubbed reveals (section headers, About's image, Services cards,
Contact's social links) were triggering at the default "top bottom" —
meaning the reveal only started once the element was already at the
viewport edge, reading as a late pop-in. Added `SCROLL_REVEAL_START`
(`"top 120%"`) in `lib/motion.js`, applied consistently.

### Earlier milestones (see `git log` for full detail)

Identity cleanup (removed all template-author content), Capability Map
rewrite, motion timing system (`lib/motion.js` EASE/DURATION tokens,
tuned iteratively for a slower cinematic pace), social links (real URLs,
icon rendering, external-tab behavior), portfolio metadata/SEO foundation,
README rewrite, favicon (real asset, replacing an accidental overwrite
traced to a copy of `Star-Iridescent.svg`).
