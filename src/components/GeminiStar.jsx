import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DURATION, EASE } from "../lib/motion";
import { buildStarVideoRegions } from "../lib/starVideoRegions";
import { GEMINI_VIDEO_SLOTS } from "../constants/geminiVideos";

// The GLB (public/models/3d-star.glb, Meshy-generated) ships POSITION +
// indices only — no NORMAL, no UV, no material. Confirmed by parsing the
// glTF JSON chunk directly: single mesh "mesh_node", 9818 verts / 19632
// tris, bounding box ~1.9 x 1.9 x 0.26 (thin along Z). No UVs meant Stage 2
// (video textures) needed to generate its own — see starVideoRegions.js for
// how the front/back faces are classified from the geometry's own triangle
// normals and given a real planar UV projection.
const GLB_PATH = "/models/3d-star.glb";

// Radians/second for the resting spin. Deliberately quick for this
// "far away" default state — the planned Stage 3 interaction brings the
// star closer AND slows the spin down on engagement, so the default has to
// read as energetic on its own for that contrast to land later. (An
// earlier, much slower value — a full turn every ~110s — was tuned before
// the multi-video collage existed; with several distinct clips now visible
// across the surface, a near-static spin also left each clip on screen far
// longer than its own content warranted.) Tuned again in the Stage 3 tuning
// pass, from a 22s revolution to 16s: the hover slowdown below only reads as
// a deliberate contrast if the idle state itself is visibly energetic first.
const SPIN_SPEED = (Math.PI * 2) / 16;

// Stage 3 — first hover interaction. The star should read as "noticing" the
// cursor (slightly larger, slightly slower), never as jumping toward it.
// Single tunable knobs rather than scattered magic numbers: HOVER_SCALE is
// clamped per-render against the same edge-safety bound appliedScale
// already computes (see hoverScaleMultiplier below), so a hovered star on a
// narrow viewport can't grow past the guard WIDTH_FIT/HEIGHT_FIT establish.
// HOVER_SPIN_SPEED is a noticeable slowdown, not a stop — the idle spin
// keeps turning, just more slowly, which is what makes the handoff read as
// continuous rather than as a separate paused state.
//
// Tuning pass: the first-pass values (1.08 scale, 0.35x speed) verified as
// smooth but read as too subtle to register at a glance. Raised to a scale
// bump that's unmistakable without dominating the composition, and a
// slowdown to 0.15x of the (now-faster) idle speed — 16s/revolution idle
// vs. ~107s/revolution hovered, a contrast large enough to read instantly
// as "energetic" vs. "deliberate" rather than requiring the viewer to stare.
const HOVER_SCALE = 1.18;
const HOVER_SPIN_SPEED = SPIN_SPEED * 0.15;

// Stage 3.5 — proximity tilt. "Hover -> it notices you" (Stage 3) is now
// followed by "move around it -> it subtly responds": as the pointer moves
// around the star, it leans a little toward it, like a lightweight physical
// object suspended in space rather than a flat CSS card tilt.
//
// This is an ADDITIONAL orientation layer, not a change to the cinematic
// spin: it lives on its own group OUTSIDE the spinner (see proximityTilt in
// the JSX below), as the parent of the TILT_X lean rather than a child of
// it. That placement matters for the same reason TILT_X itself is the
// spinner's parent (see TILT_X's own comment) — anything INSIDE the spinner
// would have its axes rotate with the spin, so "pointer left" would point in
// a different physical direction at every phase of the turntable and read as
// tumbling rather than leaning. Outside the spinner, the tilt sits in a
// stable frame and composes as base spin + tilt, exactly as intended.
//
// Roll (Z) reads as left/right lean and pitch (X) as up/down tilt — the
// spin's own Y axis is left completely untouched, so this can never fight or
// offset the turntable's phase, and rotation.y is still only ever written by
// the idle/hover increment above.
const PROXIMITY_TILT_MAX = 0.12; // radians (~6.9 degrees) — conservative start, tuned against the render
const PROXIMITY_LAMBDA = 6; // useFrame damping rate (THREE.MathUtils.damp) — gives the tilt a slight physical lag rather than 1:1 pointer tracking

// Stage 4 — grab, drag, release, momentum. "Move around it -> it subtly
// responds" (Stage 3.5) is now followed by "grab it -> you can rotate it."
// Deliberately writes to the SAME spinner.rotation.y the idle/hover spin
// already owns, rather than a new group: unlike proximity tilt (a genuinely
// separate roll/pitch layer that has to compose additively), drag rotates
// the exact same turntable the cinematic spin does, on the exact same axis
// the brief requires — a second competing group here would just mean two
// systems fighting over what "the star's current angle" means. Priority is
// therefore a simple gate in useFrame (see below), not a second transform.
//
// DRAG_SENSITIVITY converts horizontal pointer movement directly to
// rotation, in radians per pixel — chosen so a full-width desktop drag
// (~1440px) reads as a little over a full turn (2*pi/0.008 ~= 785px per
// revolution), controllable rather than either twitchy or numb.
const DRAG_SENSITIVITY = 0.008;
// After release, the recent drag velocity (already in rad/s, derived from
// real pointer deltas over real elapsed time — see handlePointerDown) is
// multiplied by this before becoming the initial momentum. Starts at 1:1 —
// the raw measured velocity IS the physically correct initial spin — kept as
// a named constant per the brief rather than folding it into
// DRAG_SENSITIVITY, so momentum "punchiness" can be tuned independently of
// how far a drag has to travel to rotate the star.
const MOMENTUM_MULTIPLIER = 1;
// A hard ceiling in rad/s so a very fast flick can't launch the star into an
// absurd spin — about 6x idle speed, still a clearly fast spin but not
// disorienting.
const MAX_MOMENTUM_SPEED = SPIN_SPEED * 6;
// THREE.MathUtils.damp rate controlling how quickly momentum decays back to
// 0 (see momentumVelocity in useFrame) — a gentler rate than
// PROXIMITY_LAMBDA on purpose, since a flung object gliding to a stop over
// roughly a second or two is the "physical, not snappy" read the brief asks
// for; PROXIMITY_LAMBDA's tilt is meant to feel closer to immediate.
const MOMENTUM_DAMPING = 1.2;

// Full revolutions performed during the entrance, while the star is still
// falling. EASE.cinematic is heavily front-loaded (0.16, 1, 0.3, 1), so ~93%
// of these turns are spent inside the drop's own 1.5s and the remainder
// stretches across a long, visibly decelerating tail. That tail is also what
// makes the handoff invisible: the tween's velocity is already approaching
// zero when it ends, and the idle spin it hands off to is only ~0.29 rad/s
// (SPIN_SPEED), so there is no step change to see.
const ENTRANCE_TURNS = 2.5;

// A small backward lean, applied OUTSIDE the spinner so it is fixed in world
// space and the star's up-vector never moves. That is what keeps the top and
// bottom points stable while the object turns: the spin axis is this leaned
// vertical, so the star behaves like a physical object on a slightly raked
// turntable rather than tumbling. Positive X leans the top away from the
// camera, so the viewer looks very slightly down onto the face.
//
// There is no Y term any more — on a Y-axis turntable a fixed Y offset only
// shifts the starting phase of a rotation that never stops, so it would be a
// constant with no observable effect.
const TILT_X = 0.18;

// Half-extent of the model in local units (bounding box is ~1.9 across).
const MODEL_RADIUS = 0.96;
// Share of the visible frame the star may occupy, so it never runs off an
// edge. These are edge-clipping guards only — deliberately NOT a clear-space
// rule around the Hero copy. The star is meant to pass behind the type (the
// planet it replaces did the same), so the typography's box is not an
// exclusion zone; the <figure> at -z-50 is what keeps the text in front.
// Width is the binding constraint on phones (the fov is vertical, so a
// narrow viewport loses horizontal room while keeping the same visible
// height), height on short desktops. Smaller of the two wins.
const WIDTH_FIT = 0.86;
const HEIGHT_FIT = 0.82;
// A separate, looser pair of fit fractions for the HOVER ceiling only (see
// hoverScaleMultiplier below). Reusing WIDTH_FIT/HEIGHT_FIT verbatim for
// hover was tried first and doesn't work: on any landscape viewport the
// vertical term is the binding one (it comes from camera fov/distance alone,
// not from pixel dimensions, so it's ~constant across desktop sizes), and at
// the resting scale of 1.3 it is already within ~1% of that same 0.82-based
// ceiling — leaving almost no headroom for HOVER_SCALE to use, and on
// portrait/mobile viewports appliedScale sits exactly AT the width-based
// ceiling, leaving zero headroom, so hover produced no visible growth at
// all. These stay a real fraction below 1.0 (never full-bleed) so a hovered
// star still can't touch a viewport edge, but they give the transient,
// pointer-engaged state real room to grow instead of being silently
// swallowed by the same margin the permanent resting composition needs.
const HOVER_WIDTH_FIT = 0.94;
const HOVER_HEIGHT_FIT = 0.94;
// Centre of the star as a fraction of the frame, from the top. Slightly
// above the middle so the star reads as the Hero's centrepiece with the
// copy crossing its lower half, rather than sitting dead-centre behind the
// whole text block. Nudged down from an earlier 0.44 — a subtle reposition,
// not a recomposition — while HEIGHT_FIT's clamp still keeps it fully
// inside the Hero on short viewports.
const CENTER_FROM_TOP = 0.47;
// Mobile-only exception to the "overlapping the copy is intended" rule
// above. That rule holds on desktop, where the name sits in a wide column
// the star only crosses; below the site's own md: breakpoint (768px, same
// threshold every other component uses) the name wraps to two lines that
// span nearly the full width, so a star sized/centred by the same rule
// lands squarely on top of both lines instead of crossing behind them.
// Smaller fit fractions plus a higher centre (a smaller from-top fraction
// moves it up, away from the bottom-anchored copy — see restY below) keep
// the same "star behind type" composition but with the star occupying
// less of the frame the name actually needs. Desktop's own constants above
// are untouched.
const MOBILE_BREAKPOINT = 768;
const MOBILE_WIDTH_FIT = 0.62;
const MOBILE_HEIGHT_FIT = 0.58;
const MOBILE_CENTER_FROM_TOP = 0.32;
// The clamps use the full radius on both axes, with no foreshortening term.
// On a Y-axis turntable the vertical extent is essentially constant (measured
// stable within 2% across a revolution) and the horizontal extent is widest
// exactly at face-on, so the full radius is the honest bound for both.

// One material in two lightings, the same contract the rest of the theme
// layer uses. It has to be theme-aware, because the star deliberately passes
// behind the Hero copy: on paper the dark type reads against a white object
// at 18.8:1, but in dark mode white type over a white object measured
// 1.03:1 and half the name was genuinely invisible. Dark mode therefore gets
// smoked glass — tinted AND translucent, which is what smoked glass actually
// is.
//
// Both parts are load-bearing, established by measuring rather than by eye.
// Tint alone does not work: albedo only scales the diffuse term, while the
// specular reflection of the softboxes is albedo-independent, so the
// highlights still blew to pure white even with the base pulled down to
// #3f444c. Opacity alone is also not enough, because those highlights are
// HDR (>1.0) before tone mapping, so scaling them by alpha can still clip
// back to white. Together, at these values, the brightest pixel behind the
// title measures 3.19:1 against the white title — past the 3.0 WCAG large-
// text floor — while light mode is untouched at 18.8:1. These are the
// brightest settings that still clear the floor: a trial at opacity 0.58
// measured 2.96:1 and was pulled back. Verified with the copy hidden, so
// glyph pixels cannot contaminate the reading (an earlier measurement that
// sampled the composite was really measuring the white glyphs).
// `videoOpacity` is deliberately higher than the plain-glass `opacity` in
// dark mode. The 0.555 figure was tuned against the star's OWN worst-case
// brightness (a clearcoat highlight, which is HDR — >1.0 before tone
// mapping — so even at low alpha it can still clip to white against the
// title). A video clip's own pixels are ordinary SDR content, not an HDR
// specular spike, so raising opacity for video regions specifically does
// not reintroduce that failure mode; it just stops smoked glass from
// dimming already-modest footage on top of the low-ambient studio
// lighting. Light mode has no smoked tint to begin with, so both values
// stay at 1.
const MATERIAL = {
  light: { color: "#dee4ee", envMapIntensity: 2.6, opacity: 1, videoOpacity: 1 },
  dark: { color: "#5b626e", envMapIntensity: 1.9, opacity: 0.555, videoOpacity: 0.85 },
};

// Video regions get an emissive copy of the same texture on top of the
// normal diffuse `map`. Emissive is added post-lighting, independent of the
// BRDF stack, so it is what actually solves "the glass/clearcoat/lighting
// stack is dimming the video": ambientLight is deliberately low (0.12) and
// the studio softboxes are mostly specular/grazing rather than a flat fill
// (see Hero.jsx), which starves a purely-diffuse `map` of light to bounce.
// Clearcoat and iridescence are untouched by this — both are separate
// specular lobes added on top of whatever the base layer (diffuse +
// emissive) already is, so the glass character survives at full strength
// over brighter video content instead of the two trading off.
const VIDEO_EMISSIVE_INTENSITY = 0.85;

// The physical glass properties shared by every region — video-textured or
// plain. Factored out once so the material instances below (one per
// GEMINI_VIDEO_SLOTS entry, plus the base bevel region) can't drift apart
// on the values that came out of Stage 1's own tuning pass (clearcoat/
// iridescence/roughness). Only `color`/`map`/`emissive*`/`opacity` vary per
// region/theme.
const GLASS_PROPS = {
  roughness: 0.05,
  metalness: 0,
  specularIntensity: 1,
  clearcoat: 1,
  clearcoatRoughness: 0.06,
  transmission: 0,
  iridescence: 0.15,
  iridescenceIOR: 1.3,
  iridescenceThicknessRange: [100, 400],
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// There is no pointer to be proximate to on a touch device — trying to fake
// one from touch position would mean the tilt jerks to wherever a finger
// last tapped and sticks there, which is worse than no effect at all. Gating
// on the same media features CSS itself uses for "a real hover-capable
// pointer exists" keeps this a single check, not new touch-handling logic.
const supportsProximityTilt = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// Crops a video texture to fill its target region without distorting the
// footage's own aspect ratio — the three.js equivalent of CSS
// `object-fit: cover`. Needed because each region's own geometric aspect
// (a front/back quadrant or a back half) rarely matches its assigned clip's
// aspect — quadrants land close to square, clips are landscape. Scaling the
// smaller-of-two axes back down to 1 and shrinking the other axis by the
// aspect ratio, centered, crops the excess instead of distorting it.
function applyCoverFit(texture, videoAspect, regionAspect) {
  if (!videoAspect || !regionAspect) return;
  texture.center.set(0.5, 0.5);
  if (videoAspect > regionAspect) {
    texture.repeat.set(regionAspect / videoAspect, 1);
  } else {
    texture.repeat.set(1, videoAspect / regionAspect);
  }
}

// Owns the actual <video> elements and their VideoTextures for the star's
// lifetime — created once per mount, not per render, and disposed on
// unmount. Elements are never attached to the DOM (three.js only needs a
// playing HTMLVideoElement to sample from, not a visible one), so there is
// no risk of a stray <video> floating over the page.
//
// `ready` gates when a region's material actually shows the video: before
// that, GeminiStar renders the plain Stage 1 glass color for that region
// instead of an undefined/black texture, so the star never looks broken
// while clips are loading — and stays that way indefinitely if a clip
// fails to load at all, which is the correct fallback, not an error state.
function useStarVideoTextures(slots, regionAspects) {
  const [entries, setEntries] = useState(() =>
    slots.map(() => ({ texture: null, ready: false }))
  );

  useEffect(() => {
    const videos = slots.map((slot) => {
      const video = document.createElement("video");
      video.src = slot.src;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.autoplay = true;
      video.preload = "auto";
      return video;
    });
    const textures = videos.map((video) => {
      const texture = new THREE.VideoTexture(video);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      return texture;
    });

    let cancelled = false;
    const onReadyHandlers = videos.map((video, i) => {
      const onReady = () => {
        if (cancelled) return;
        applyCoverFit(
          textures[i],
          video.videoWidth / video.videoHeight,
          regionAspects[i]
        );
        setEntries((prev) => {
          const next = prev.slice();
          next[i] = { texture: textures[i], ready: true };
          return next;
        });
      };
      video.addEventListener("loadeddata", onReady);
      // Autoplay can be blocked under unusual browser policy configs even
      // when muted; the plain-glass fallback above covers that case too,
      // so a rejected play() is not surfaced as an error.
      video.play().catch(() => {});
      return onReady;
    });

    return () => {
      cancelled = true;
      videos.forEach((video, i) => {
        video.removeEventListener("loadeddata", onReadyHandlers[i]);
        video.pause();
        video.removeAttribute("src");
        video.load();
        textures[i].dispose();
      });
    };
  }, [slots, regionAspects]);

  return entries;
}

// Follows the same `data-theme` attribute index.html resolves before first
// paint and ThemeToggle flips at runtime, so the star restyles with the rest
// of the page instead of needing its own source of truth.
const useIsDarkTheme = () => {
  const [isDark, setIsDark] = useState(
    () =>
      typeof document === "undefined" ||
      document.documentElement.getAttribute("data-theme") !== "light"
  );
  useEffect(() => {
    const root = document.documentElement;
    const sync = () =>
      setIsDark(root.getAttribute("data-theme") !== "light");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  return isDark;
};

export function GeminiStar({ scale = 1, ...props }) {
  const entranceOffset = useRef(null);
  const spinner = useRef(null);
  const entranceDone = useRef(false);
  // hoverGroup carries ONLY the hover scale multiplier, imperatively, so it
  // can update every frame without going through React state/re-render.
  // hoverState is a plain object GSAP tweens directly (0 = idle, 1 =
  // hovered) — useFrame just reads its current value each frame, the same
  // separation of concerns the entrance animation already uses (GSAP owns
  // the tweened value, the render loop owns applying it to the scene).
  const hoverGroup = useRef(null);
  const hoverState = useRef({ t: 0 });
  // proximityTilt: written imperatively every frame like hoverGroup above,
  // never through React state. pointerOverCanvas tracks whether the pointer
  // is actually inside the Hero's Canvas right now (R3F keeps `state.pointer`
  // at its last value after the pointer leaves, so without this the tilt
  // would freeze at its last position instead of returning to neutral).
  const proximityTilt = useRef(null);
  const pointerOverCanvas = useRef(false);
  // Stage 4 drag state. isDragging gates useFrame's own rotation.y write
  // (see below) so the two never both touch it in the same frame.
  // dragVelocity is a live estimate (rad/s) blended from recent pointer
  // deltas while dragging; momentumVelocity is what's left of that estimate
  // after release, decaying to 0 every frame via THREE.MathUtils.damp.
  // dragCleanup holds whatever the active drag's own teardown function is,
  // purely so an unmount mid-drag (e.g. a route change) can't leak the
  // window-level listeners a drag temporarily attaches.
  const isDragging = useRef(false);
  const dragVelocity = useRef(0);
  const momentumVelocity = useRef(0);
  const dragCleanup = useRef(null);
  const { nodes } = useGLTF(GLB_PATH);
  const material = MATERIAL[useIsDarkTheme() ? "dark" : "light"];

  // The camera's fov is vertical, so a narrow viewport loses horizontal
  // room while keeping the same visible height — at 390px the star was
  // measurably clipped hard against both edges (left margin 0px, right
  // 1px) even though it fit fine vertically. Deriving the cap from the
  // live R3F viewport (world units at the focus plane, recomputed on
  // resize) fixes that at every aspect ratio instead of guessing a second
  // magic number per breakpoint, and it can only ever shrink the caller's
  // requested scale, never inflate it.
  const { viewport, gl, size } = useThree();
  const isMobileViewport = size.width < MOBILE_BREAKPOINT;

  // R3F already updates state.pointer (NDC, -1..1) for the whole Canvas on
  // every pointer move, independent of whether anything was hit — no window
  // listener needed, so the interaction area is exactly the Hero's own
  // pointer-events-auto Canvas (see Hero.jsx) and nothing wider. What R3F
  // does NOT do is tell us when the pointer has left the canvas entirely, so
  // that one signal is tracked here via native events on the canvas element
  // itself (still scoped to the canvas, not window).
  useEffect(() => {
    if (!supportsProximityTilt()) return;
    const el = gl.domElement;
    const onEnter = () => {
      pointerOverCanvas.current = true;
    };
    const onLeave = () => {
      pointerOverCanvas.current = false;
    };
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [gl]);

  // Safety net for the rare case of unmounting (e.g. a route change) while
  // a drag is still in progress: handlePointerDown below attaches its own
  // window-level listeners for the lifetime of one drag and tears them down
  // on pointerup/pointercancel, but an unmount skips straight past that —
  // this is the only other place those listeners can be removed from.
  useEffect(() => {
    return () => {
      if (dragCleanup.current) dragCleanup.current();
    };
  }, []);

  // Two caps against the frame's own edges, smallest wins. Neither knows
  // anything about the copy — overlapping it is intended.
  const widthFit = isMobileViewport ? MOBILE_WIDTH_FIT : WIDTH_FIT;
  const heightFit = isMobileViewport ? MOBILE_HEIGHT_FIT : HEIGHT_FIT;
  const maxSafeScale = Math.min(
    (viewport.width * widthFit) / (MODEL_RADIUS * 2),
    (viewport.height * heightFit) / (MODEL_RADIUS * 2)
  );
  const appliedScale = Math.min(scale, maxSafeScale);

  // The hover grow-in is applied ON TOP of appliedScale (see hoverGroup in
  // the JSX below), so it needs its own edge guard: on a viewport where
  // appliedScale is ALREADY the clamped value (no headroom left below
  // maxSafeScale), applying HOVER_SCALE on top would push the star back
  // past the same edge appliedScale was computed to avoid. Capping the
  // multiplier at however much headroom actually exists preserves viewport
  // safety exactly like appliedScale's own clamp does, rather than adding a
  // second, competing size rule. The ceiling itself uses the looser
  // HOVER_WIDTH_FIT/HOVER_HEIGHT_FIT (see their definition above), not
  // WIDTH_FIT/HEIGHT_FIT — those are already almost fully used up by the
  // resting scale, so reusing them here left hover with no real room to grow.
  const maxSafeHoverScale = Math.min(
    (viewport.width * HOVER_WIDTH_FIT) / (MODEL_RADIUS * 2),
    (viewport.height * HOVER_HEIGHT_FIT) / (MODEL_RADIUS * 2)
  );
  const hoverScaleMultiplier =
    appliedScale > 0 ? Math.min(HOVER_SCALE, maxSafeHoverScale / appliedScale) : 1;

  const restY =
    viewport.height *
    (0.5 - (isMobileViewport ? MOBILE_CENTER_FROM_TOP : CENTER_FROM_TOP));

  // Splits the single source mesh into GEMINI_VIDEO_SLOTS.length video
  // regions (front quadrants, back halves) plus one base/glass region for
  // the bevel and anything else unclaimed (see starVideoRegions.js for how
  // — clipped by each vertex's own smooth normal and angle, not bucketed by
  // whole triangle — and PROJECT_STATUS.md for why side/bevel video panels
  // were tried and removed). Runs once:
  // `nodes` is stable across re-renders once the GLTF has loaded, and this
  // always computes its own fresh normals on the output geometry regardless
  // of what the source had, so there is no separate normal-fix step needed
  // here any more.
  //
  // `regionAspects` is derived in this same memo (not a separate `.map()`
  // at render time) so it's the same array reference across re-renders —
  // useStarVideoTextures depends on it, and a fresh array every render would
  // re-run that effect (tearing down and recreating every video element)
  // on every unrelated re-render, e.g. a theme toggle.
  const { geometry: regionGeometry, baseRegionIndex, slots, regionAspects } =
    useMemo(() => {
      const built = buildStarVideoRegions(
        nodes.mesh_node.geometry,
        GEMINI_VIDEO_SLOTS
      );
      return {
        ...built,
        regionAspects: built.slots.map((s) => s.regionAspect),
      };
    }, [nodes]);

  const videoEntries = useStarVideoTextures(GEMINI_VIDEO_SLOTS, regionAspects);

  // Entrance: fast drop from above with 2.5 horizontal turns taken DURING
  // the fall, a hard deceleration, then a soft settle straight into the idle
  // turntable. No bounce and no overshoot — both eases are pure ease-outs, and
  // EASE.revelation (the only curve in the canonical set that overshoots) is
  // deliberately not used here.
  //
  // Both tweens run on the same canonical curve and start together at 0, so
  // the spin is fastest exactly while the star is falling fastest and the two
  // read as one movement rather than two stacked effects. Measured profile:
  // 2.880 -> 0.798 -> 0.182 -> 0.034 -> 0.002 turns/s, with the drop settled
  // by ~1.9s. The rotation's longer duration gives it a slow tail past the
  // landing, which is what makes the handoff to the 0.009 turns/s idle
  // invisible — there is no velocity step to see at either end.
  //
  // The drop is animated on its own inner group as a pure offset (5 -> 0)
  // rather than on the group that carries the resting position. `.from()`
  // snapshots its destination when the tween is built, so animating the
  // positioned group directly means whichever value happened to be there at
  // that moment becomes the resting place forever — and `clearance` is
  // measured a tick later, so the star would settle at the pre-measurement
  // fallback instead. It works today only because useGLTF suspends long
  // enough for the measurement to land first, which is not a guarantee once
  // the model is warm in cache. Separating layout (React) from entrance
  // offset (GSAP) removes the race entirely and makes resize safe too.
  useGSAP(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        entranceDone.current = true;
      },
    });
    // Drop and spin start together at 0, so the revolutions happen DURING
    // the fall rather than after the star has already arrived.
    tl.from(entranceOffset.current.position, {
      y: 5,
      duration: DURATION.transition,
      ease: EASE.cinematic,
    });
    tl.from(
      spinner.current.rotation,
      {
        // 2.5 horizontal turns, negative so it unwinds toward 0 — an
        // increasing y, which is the same direction the idle turntable then
        // continues in, so the handoff has no reversal in it.
        y: -Math.PI * 2 * ENTRANCE_TURNS,
        duration: DURATION.reveal,
        ease: EASE.cinematic,
      },
      0
    );
  }, []);

  // Pointer handlers just retarget the SAME tween each time — GSAP resolves
  // a new gsap.to() on an object/property already mid-tween by starting
  // from its current interpolated value, not from the tween's original
  // "from" value, so rapid hover/unhover reverses smoothly with no jump and
  // no accumulation. stopPropagation is defensive: nothing else in this
  // scene listens for pointer events, but it keeps this handler from ever
  // depending on that staying true.
  const handlePointerOver = (event) => {
    event.stopPropagation();
    gsap.to(hoverState.current, {
      t: 1,
      duration: DURATION.micro,
      ease: EASE.precise,
      overwrite: true,
    });
    // Minimal cursor feedback that the star is grabbable — only worth
    // showing on the same devices drag is actually available on, and never
    // while a drag already has the canvas set to "grabbing".
    if (supportsProximityTilt() && !isDragging.current) {
      gl.domElement.style.cursor = "grab";
    }
  };
  const handlePointerOut = (event) => {
    event.stopPropagation();
    gsap.to(hoverState.current, {
      t: 0,
      duration: DURATION.micro,
      ease: EASE.precise,
      overwrite: true,
    });
    if (!isDragging.current) {
      gl.domElement.style.cursor = "auto";
    }
  };

  // Grab. Gated the same way proximity tilt is (a real hover-capable,
  // fine pointer) — touch is left alone deliberately: the Hero's Canvas is
  // full-viewport (see Hero.jsx), so a touch-drag handler here would fight
  // native page scrolling on any touch starting over the star, exactly the
  // "frustrating gesture conflict" the brief warns against avoiding. Also
  // checks the actual event's own pointerType, not just device capability,
  // so a touch tap on a hybrid mouse+touchscreen device still can't start a
  // drag even though that device's matchMedia reports a fine pointer exists.
  // Also gated on entranceDone: the entrance GSAP tween is still writing
  // spinner.rotation.y directly at that point (see the useGSAP block above),
  // so grabbing before it hands off would mean two systems fighting over
  // the same property, exactly what Stage 4 is required not to do.
  const handlePointerDown = (event) => {
    if (!entranceDone.current || !supportsProximityTilt() || isDragging.current) {
      return;
    }
    const pointerType =
      event.pointerType || (event.nativeEvent && event.nativeEvent.pointerType);
    if (pointerType && pointerType !== "mouse" && pointerType !== "pen") return;
    event.stopPropagation();

    isDragging.current = true;
    dragVelocity.current = 0;
    gl.domElement.style.cursor = "grabbing";

    let lastX = event.nativeEvent ? event.nativeEvent.clientX : event.clientX;
    let lastT = performance.now();

    // Direct pointer control: rotation.y is written HERE, immediately, on
    // every real pointermove, not sampled once per rendered frame — under
    // this project's own documented low-fps sandbox that distinction
    // matters (see the Stage 3 tuning pass's lag-smoothing note), and on a
    // real 60fps browser it's simply the most responsive a drag can feel.
    // useFrame's own rotation.y write is skipped for as long as
    // isDragging.current is true (see useFrame below), so the two can never
    // both touch it in the same frame.
    const onMove = (moveEvent) => {
      const now = performance.now();
      const dt = Math.max((now - lastT) / 1000, 1 / 240);
      const dx = moveEvent.clientX - lastX;
      // Sign verified empirically, not derived: raycasting the actual 3D
      // point under the cursor at grab time, then re-projecting that SAME
      // point after a drag, confirms this sign makes the grabbed surface
      // follow the cursor. (A fixed local-axis reference point was tried
      // first and gave an inconsistent/misleading reading — its own
      // screen-sensitivity to rotation flips sign every half turn depending
      // on the star's current phase, which a raycasted "the point actually
      // under the cursor" reference doesn't have a problem with.)
      if (spinner.current) {
        spinner.current.rotation.y += dx * DRAG_SENSITIVITY;
      }
      // Blended (not raw-instantaneous) so the velocity handed to momentum
      // on release reflects the drag's recent motion rather than one noisy
      // sample right at the moment of release.
      const instVelocity = (dx * DRAG_SENSITIVITY) / dt;
      dragVelocity.current = THREE.MathUtils.lerp(
        dragVelocity.current,
        instVelocity,
        0.3
      );
      lastX = moveEvent.clientX;
      lastT = now;
    };

    const onUp = () => {
      isDragging.current = false;
      momentumVelocity.current = THREE.MathUtils.clamp(
        dragVelocity.current * MOMENTUM_MULTIPLIER,
        -MAX_MOMENTUM_SPEED,
        MAX_MOMENTUM_SPEED
      );
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      dragCleanup.current = null;
      gl.domElement.style.cursor = pointerOverCanvas.current ? "grab" : "auto";
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    dragCleanup.current = onUp;
  };

  // Continuous resting spin, independent of the entrance timeline so it
  // never resets or restarts — it simply keeps incrementing from wherever
  // the GSAP settle left off. Gated on entranceDone so it doesn't fight
  // the GSAP tween's own rotation.z during entrance, and gated on
  // prefers-reduced-motion since useFrame isn't covered by lib/motion.js's
  // global gsap.defaults({ duration: 0 }) (that only collapses GSAP
  // tweens, not a per-frame imperative increment).
  //
  // Hover scale is applied OUTSIDE that gate (it's a state change, not
  // continuous motion, so it isn't what reduced-motion is meant to
  // suppress) — hoverGroup exists purely so this can be written every
  // frame without going through a React re-render.
  useFrame((state, delta) => {
    if (hoverGroup.current) {
      hoverGroup.current.scale.setScalar(
        1 + hoverState.current.t * (hoverScaleMultiplier - 1)
      );
    }

    // Proximity tilt: independent of the entranceDone gate below (a visitor
    // moving the pointer during the entrance should still get a response),
    // but gated the same way idle spin is on prefers-reduced-motion — this
    // is continuous pointer-driven motion, the same class useFrame's own
    // spin increment already treats as motion to suppress. Target resets to
    // exactly 0 whenever the pointer isn't actively over the canvas, so
    // damp() always eases back to neutral instead of freezing at its last
    // value.
    if (proximityTilt.current) {
      const active = pointerOverCanvas.current && !prefersReducedMotion();
      const targetTiltZ = active ? -state.pointer.x * PROXIMITY_TILT_MAX : 0;
      const targetTiltX = active ? state.pointer.y * PROXIMITY_TILT_MAX : 0;
      proximityTilt.current.rotation.z = THREE.MathUtils.damp(
        proximityTilt.current.rotation.z,
        targetTiltZ,
        PROXIMITY_LAMBDA,
        delta
      );
      proximityTilt.current.rotation.x = THREE.MathUtils.damp(
        proximityTilt.current.rotation.x,
        targetTiltX,
        PROXIMITY_LAMBDA,
        delta
      );
    }

    if (!entranceDone.current || prefersReducedMotion()) return;
    // While dragging, handlePointerDown's own window pointermove listener
    // is the ONLY thing writing spinner.rotation.y (see above) — skipping
    // it here is what gives drag priority without a second competing
    // rotation system.
    if (isDragging.current) return;
    // Only the per-frame INCREMENT changes with hover — rotation.y itself
    // is never touched here, so the current angle is always preserved and
    // there is nothing to snap or reset on hover/leave.
    const speed = SPIN_SPEED - hoverState.current.t * (SPIN_SPEED - HOVER_SPIN_SPEED);
    // Momentum is a separate, purely additive term that decays to exactly 0
    // via damp() — never to the idle speed directly — so "blend back into
    // idle" falls out for free: once momentumVelocity is negligible,
    // speed + momentumVelocity IS speed, with no separate handoff branch and
    // nothing to snap. It starts at 0 (set on mount) and stays there
    // through ordinary idle/hover use, so this is a no-op until a drag
    // actually releases some velocity into it.
    momentumVelocity.current = THREE.MathUtils.damp(
      momentumVelocity.current,
      0,
      MOMENTUM_DAMPING,
      delta
    );
    spinner.current.rotation.y += delta * (speed + momentumVelocity.current);
  });

  return (
    // Layout: owned by React, recomputed from the measured frame on resize.
    <group position={[0, restY, 0]} {...props} dispose={null}>
      {/* Entrance offset: owned by GSAP, animates 5 -> 0 and nothing else. */}
      <group ref={entranceOffset}>
        <group scale={appliedScale}>
          {/* Hover scale (Stage 3): a pure multiplier written imperatively
              in useFrame above, on its own group so it never fights
              appliedScale's own React-driven value — the two multiply
              naturally through normal Three.js parent/child transforms. */}
          <group ref={hoverGroup}>
            {/* Stage 4 proximity tilt (roll/pitch, written imperatively in
                useFrame above): the OUTER-most orientation layer, parent of
                the TILT_X lean rather than a child of the spinner, so it
                composes as base spin + tilt in a stable frame instead of its
                axes rotating with the turntable — see PROXIMITY_TILT_MAX's
                own comment for why that placement is load-bearing. */}
            <group ref={proximityTilt}>
              {/* Stage 4 grab/drag/momentum (see DRAG_SENSITIVITY etc. above):
                  writes rotation.y on the SAME spinner group the idle/hover
                  spin already owns, not a new layer — see the useFrame block
                  below for why one shared property with a priority gate is
                  correct here, unlike proximity tilt's separate group. */}
              {/* Horizontal turntable. The lean is the PARENT and the spinner is
                  its child, so the spin axis is the leaned vertical rather than
                  the camera's view axis: the star turns like a thin physical
                  object standing on a slightly raked platter. Its up-vector is
                  constant under a Y rotation and only the fixed lean acts on it,
                  which is what holds the top and bottom points steady while the
                  left and right points swing toward and away from the viewer.

                  The face therefore sweeps through front-facing -> angled ->
                  edge-on -> angled -> front-facing once per half turn, and the
                  silhouette narrowing at edge-on is the intended read, not an
                  artefact: it is what makes the object's real depth visible.
                  (An earlier pass spun this on the view axis instead, which kept
                  a constant silhouette but made the star read as a flat 2D mark
                  rotating on its face — the opposite of what this needs.) */}
              <group rotation={[TILT_X, 0, 0]}>
                <group ref={spinner}>
                {/* White glass by reflection, not by transmission. Real
                    `transmission` was tried and rejected on the render, not
                    on theory: the Canvas is transparent and nothing sits
                    behind the star in the 3D scene, so there is nothing to
                    refract — the shape flattened into a uniform white
                    silhouette and lost all the shading that describes its
                    form, while still paying for three's per-frame
                    transmission pass. The glass read comes instead from a
                    very smooth base under a full clearcoat lit by
                    structured softboxes (see Hero.jsx's Environment), which
                    is what produces the tight, elongated highlights and
                    bright grazing edges that say "polished glass" rather
                    than "white plastic".
  
                    iridescence is kept low, and `sheen` was removed
                    outright. Both were isolated against a frozen pose
                    (Playwright reducedMotion, which collapses the entrance
                    and stops the spin, so frames are reproducible): sheen's
                    grazing-angle lobe aliased into a dark dotted fringe
                    tracing the whole silhouette, since the view angle
                    changes faster than one pixel there. With sheen off,
                    iridescence at 0.15 renders a clean edge at 2x DPR and
                    still supplies the pearlescent shift the brief asks for
                    — sheen is a fabric term anyway, not what makes glass
                    look like glass.
  
                    Stage 2: regionGeometry carries one geometry group per
                    entry in GEMINI_VIDEO_SLOTS (front quadrants, back halves)
                    plus one base/bevel group, so this is one mesh with a
                    material ARRAY rather than one material —
                    mesh.material[i] via the `material-${i}` attach path,
                    three.js's own mechanism for multiple materials on one draw
                    call. Every region shares GLASS_PROPS (the exact Stage 1
                    clearcoat/iridescence/roughness values), so clearcoat
                    highlights and reflections render on top of a video panel
                    exactly as they do on plain glass — video content sits in
                    `map` (and `emissiveMap`, for brightness — see
                    VIDEO_EMISSIVE_INTENSITY above), underneath the same BRDF,
                    not as a flat unlit swap. */}
                <mesh
                  geometry={regionGeometry}
                  onPointerOver={handlePointerOver}
                  onPointerOut={handlePointerOut}
                  onPointerDown={handlePointerDown}
                >
                  {slots.map((slot) => {
                    const entry = videoEntries[slot.materialIndex] || {
                      texture: null,
                      ready: false,
                    };
                    return (
                      <meshPhysicalMaterial
                        // Keyed on readiness, not just id: three.js compiles a
                        // material's shader program around whether `map` is set
                        // at that time (the USE_MAP define), and neither R3F nor
                        // three.js auto-recompiles an already-rendered material
                        // when `map` is assigned later — the uniform updates
                        // but the compiled fragment shader still has no sampler
                        // for it, so the texture is silently never drawn. Since
                        // `ready` always starts false and flips true only after
                        // the video's `loadeddata` fires (always after the
                        // first render), that stale-shader case is guaranteed
                        // to happen on every load. Changing the key forces R3F
                        // to dispose the old material and mount a fresh one
                        // whose first-ever compile already includes both maps.
                        key={`${slot.id}-${entry.ready}`}
                        attach={`material-${slot.materialIndex}`}
                        {...GLASS_PROPS}
                        // Until this clip has a decoded frame (or if it never
                        // gets one), the region renders as identical plain
                        // glass to its surroundings — no black rectangle, no
                        // placeholder, no visible seam appears until content
                        // actually arrives.
                        color={entry.ready ? "#ffffff" : material.color}
                        map={entry.ready ? entry.texture : null}
                        emissiveMap={entry.ready ? entry.texture : null}
                        emissive={entry.ready ? "#ffffff" : "#000000"}
                        emissiveIntensity={entry.ready ? VIDEO_EMISSIVE_INTENSITY : 0}
                        envMapIntensity={material.envMapIntensity}
                        transparent={material.videoOpacity < 1}
                        opacity={entry.ready ? material.videoOpacity : material.opacity}
                      />
                    );
                  })}
                  <meshPhysicalMaterial
                    attach={`material-${baseRegionIndex}`}
                    {...GLASS_PROPS}
                    color={material.color}
                    envMapIntensity={material.envMapIntensity}
                    transparent={material.opacity < 1}
                    opacity={material.opacity}
                  />
                </mesh>
              </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(GLB_PATH);
