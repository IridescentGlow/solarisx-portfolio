import { forwardRef, useImperativeHandle, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollTrigger);

// The 2D Gemini-inspired sparkle path — generated, not hand-typed, so it is
// PROVABLY symmetric: one arm (tip -> tip, via two control points at a
// smaller "pinch" radius) is computed once, then rotated by 90°/180°/270°
// for the other three. A hand-typed version of this shape (the previous
// implementation) drifted out of exact rotational symmetry by a coordinate
// or two, which is what read as "wobbling around an off-center origin" when
// spun — the rotation was centered correctly, the SHAPE's own visual mass
// wasn't evenly distributed around that center. Same silhouette family
// GeminiStar.jsx's own name references; this is explicitly NOT that 3D star,
// redrawn flat for this DOM layer.
function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(rad), cy - r * Math.cos(rad)];
}

function buildSparklePath(cx, cy, tipR, pinchR, spreadDeg) {
  const [startX, startY] = polar(cx, cy, tipR, 0);
  let d = `M ${startX} ${startY} `;
  for (const theta of [0, 90, 180, 270]) {
    const next = theta + 90;
    const [c1x, c1y] = polar(cx, cy, pinchR, theta + spreadDeg);
    const [c2x, c2y] = polar(cx, cy, pinchR, next - spreadDeg);
    const [ex, ey] = polar(cx, cy, tipR, next);
    d += `C ${c1x} ${c1y} ${c2x} ${c2y} ${ex} ${ey} `;
  }
  return d.trim() + " Z";
}

const SPARKLE_PATH = buildSparklePath(12, 12, 11.5, 3, 26);

const BASE_SIZE = 44; // px, before each star's own `size` multiplier

// Primary star's pre-split lifecycle (brief: "noticeably larger... already
// visible before scrolling... rotate considerably faster"). Visible at full
// size/opacity from first paint (no fade-in — "already visible" means
// exactly that, not a delayed reveal), then grows further as the visitor
// scrolls through the constellation, then settles back down to its own
// STAR_FIELD entry's resting `size` once it rejoins the field in phase B.
const PRIMARY_INITIAL_SCALE = 1.3;
const PRIMARY_GROWTH_PEAK_SCALE = 2.4;
// ~2x the previous 17s — "considerably faster" — kept fixed through both
// the solo phase and once merged into the field (still within "slightly
// different" territory next to the field's own 11-23s range) rather than
// retuning a running CSS animation-duration mid-scroll, which has no clean
// non-jumpy transition and isn't warranted here.
const PRIMARY_SPIN_DURATION = 8;

// Fixed, hand-placed spread targets — deliberately NOT random (same
// "reproducible on every load" convention reelConstellationConfig.js
// documents for the video panels), and deliberately NOT a uniform grid/ring
// either — sizes and angles are hand-varied so the field reads as composed
// rather than scattered, while staying roughly balanced left/right and
// top/bottom. Index 0 is the PRIMARY star (see above); its `size` here is
// its own RESTING size once split out, not its grown solo size. Five
// tiers for depth (tiny/small/medium/large/very-large); s8 and s16 are
// "very large" accents, both exceeding even the primary's own resting size
// by a wide margin, per brief. dx/dy are vw/vh offsets from the shared
// anchor all stars start co-located at.
const STAR_FIELD = [
  { id: "s0", size: 1.2, dxVw: -4, dyVh: -16, drift: 9, driftX: 6, driftY: -5, spin: PRIMARY_SPIN_DURATION },
  { id: "s1", size: 0.5, dxVw: -20, dyVh: -22, drift: 10, driftX: -5, driftY: 6, spin: 13 },
  { id: "s2", size: 0.85, dxVw: 18, dyVh: -20, drift: 8, driftX: 6, driftY: 6, spin: 20 },
  { id: "s3", size: 1.4, dxVw: -34, dyVh: -8, drift: 11, driftX: -6, driftY: -5, spin: 16 },
  { id: "s4", size: 0.4, dxVw: 32, dyVh: -4, drift: 9, driftX: 5, driftY: -6, spin: 22 },
  { id: "s5", size: 0.35, dxVw: -14, dyVh: -32, drift: 7, driftX: 4, driftY: 5, spin: 12 },
  { id: "s6", size: 0.7, dxVw: 8, dyVh: -34, drift: 12, driftX: -5, driftY: 5, spin: 18 },
  { id: "s7", size: 0.5, dxVw: -42, dyVh: 6, drift: 8, driftX: 6, driftY: -4, spin: 14 },
  { id: "s8", size: 2.0, dxVw: 40, dyVh: 10, drift: 10, driftX: -6, driftY: 4, spin: 19 },
  { id: "s9", size: 0.8, dxVw: -24, dyVh: 20, drift: 9, driftX: 5, driftY: 5, spin: 21 },
  { id: "s10", size: 0.45, dxVw: 22, dyVh: 22, drift: 11, driftX: -4, driftY: -6, spin: 15 },
  { id: "s11", size: 1.3, dxVw: -6, dyVh: 32, drift: 8, driftX: 6, driftY: 5, spin: 23 },
  { id: "s12", size: 0.6, dxVw: 14, dyVh: 34, drift: 10, driftX: -5, driftY: -4, spin: 17 },
  { id: "s13", size: 0.4, dxVw: -40, dyVh: -26, drift: 12, driftX: 4, driftY: 6, spin: 11 },
  { id: "s14", size: 0.65, dxVw: 38, dyVh: -28, drift: 9, driftX: -6, driftY: -5, spin: 20 },
  { id: "s15", size: 0.3, dxVw: 2, dyVh: -40, drift: 8, driftX: 5, driftY: 5, spin: 13 },
  { id: "s16", size: 2.2, dxVw: -44, dyVh: 16, drift: 11, driftX: -5, driftY: -4, spin: 21 },
  { id: "s17", size: 0.55, dxVw: 44, dyVh: -14, drift: 9, driftX: 4, driftY: 6, spin: 16 },
  { id: "s18", size: 0.35, dxVw: -8, dyVh: 40, drift: 10, driftX: -6, driftY: 4, spin: 12 },
  { id: "s19", size: 0.75, dxVw: 30, dyVh: 32, drift: 8, driftX: 5, driftY: -5, spin: 19 },
];

// Spin applied directly on the sized <svg> element, not a wrapping div: a
// plain block div around a single inline SVG can end up wider than the SVG
// itself (shrink-to-fit sizing is intertwined with an absolutely-positioned
// ancestor here), which would put `transform-origin: center` at the DIV's
// center rather than the visible star's — the exact "orbiting an off-center
// point" symptom. The SVG's own box is unambiguously its width x height, so
// rotating it directly removes that whole class of bug rather than trying
// to force the wrapper to shrink-wrap correctly.
function Sparkle({ size, spinDuration, spinDelay }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={BASE_SIZE * size}
      height={BASE_SIZE * size}
      aria-hidden="true"
      className="animate-star-spin"
      style={{ animationDuration: `${spinDuration}s`, animationDelay: `${spinDelay}s` }}
    >
      <path d={SPARKLE_PATH} fill="var(--color-ink)" />
    </svg>
  );
}

// Single star -> grows -> splits into a field that spreads out and settles
// behind MainReel (brief: "between the constellation and main reel"). Two
// scroll sources drive it, kept deliberately separate rather than merged
// into one shared ScrollTrigger:
//  - Phase A (single star growing) is driven imperatively via setGrowth(),
//    called from ReelIntro's own constellation-transition onUpdate — the
//    same "GSAP/scroll owns the value, the scene applies it" pattern
//    VideoConstellation's setProgress already uses, reused rather than
//    duplicating that ScrollTrigger's start/end here.
//  - Phase B (split + spread) and the exit fade are owned by this
//    component's OWN ScrollTrigger, keyed on MainReel's own section node
//    (mainReelRef) with the EXACT SAME start/end MainReel's own scale tween
//    uses, so the split visually locks to the reel's own enlargement
//    instead of drifting out of sync.
//
// Rendered `position: fixed` with an explicit z-index (z-10) BELOW
// MainReel's own section (z-20, see MainReel.jsx) — deliberately explicit
// rather than relying on DOM order for stacking, because mainReelRef needs
// MainReel's own ref to already be attached by the time this component's
// effect runs, which requires MainReel to mount FIRST (see ReelIntro.jsx).
// Explicit z-index decouples "who paints on top" from "who mounts first",
// so the two requirements don't fight each other.
//
// Only ever rendered from CinematicIntro (see ReelIntro.jsx) — the
// reduced-motion path branches to a wholly separate, static component
// before this one is ever reached, the same way VideoConstellation's own
// flythrough is never invoked there either, so there is no reducedMotion
// prop or branch to carry here.
export const StarField2D = forwardRef(function StarField2D(
  { mainReelRef },
  ref
) {
  const slotRefs = useRef([]);

  // Each slot is `position: absolute; left/top: auto` (no explicit inset),
  // so without this its top-LEFT corner sits at the anchor point, not its
  // center — every star would render offset down-and-right by half its own
  // box. `xPercent`/`yPercent` are GSAP-specific (percentage of the
  // element's OWN size, not the viewport), set once and remembered
  // internally across every later `.set()` call that touches x/y/scale, so
  // it composes correctly with setGrowth's and the arrival/exit phases'
  // own per-frame x/y writes below without needing to be repeated there.
  useGSAP(() => {
    gsap.set(slotRefs.current.filter(Boolean), { xPercent: -50, yPercent: -50 });
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      setGrowth(t) {
        const primary = slotRefs.current[0];
        if (!primary) return;
        // No opacity ramp — the primary is already visible at full opacity
        // from first paint (see its initial inline style below); only its
        // SIZE grows with scroll.
        const scale =
          PRIMARY_INITIAL_SCALE +
          Math.min(1, t) * (PRIMARY_GROWTH_PEAK_SCALE - PRIMARY_INITIAL_SCALE);
        gsap.set(primary, { opacity: 1, scale, x: 0, y: 0 });
      },
    }),
    []
  );

  useGSAP(() => {
    if (!mainReelRef.current) return;
    const targets = slotRefs.current.filter(Boolean);

    // Both phases below are plain `onUpdate` + `gsap.set`, computing each
    // frame's value fresh from scroll progress — the SAME "GSAP/scroll owns
    // the value" imperative pattern setGrowth/setProgress already use in
    // this file/VideoConstellation, not a coincidence: a declarative
    // `gsap.to()`/`fromTo()` scrub captures its "from" ONCE, at creation
    // time (mount) — before setGrowth has ever run and before the arrival
    // phase below has ever played. Chaining declarative scrub tweens on the
    // SAME properties (opacity/scale/x/y, touched by growth, then arrival,
    // then exit) against that stale, mount-time "from" produces a visible
    // snap-back the moment each new phase's trigger range begins, and made
    // the exit fade a complete no-op the first time this was written (its
    // captured "from" was the mount-time opacity of 0, so it animated
    // 0 -> 0). Computing an absolute value from live progress every frame
    // has no "from" to go stale.

    // Phase B: split + spread, locked to MainReel's own arrival scrub.
    // Primary (index 0) starts from wherever setGrowth(1) leaves it
    // (opacity 1, scale PRIMARY_GROWTH_PEAK_SCALE, centered) since it's
    // still finishing phase A right up to this trigger's start; every other
    // star starts from its true static resting state (opacity 0, scale 0,
    // centered).
    //
    // end: "top 25%", NOT "top top" — deliberately earlier than MainReel's
    // own scale tween (which ends at "top top", full size). Ending this
    // trigger there too meant the field's LAST bit of spreading motion
    // finished in the exact same instant the reel reached full width, which
    // read as still-settling rather than already-arrived. Finishing at
    // "top 25%" — comfortably before "top top" — means the field is fully
    // spread and just idling (CSS drift/spin only) by the time the reel is
    // essentially full size, matching "stars simply remain as surrounding
    // background motion" once arrival is imminent.
    const arrivalST = ScrollTrigger.create({
      trigger: mainReelRef.current,
      start: "top 85%",
      end: "top 25%",
      scrub: true,
      onUpdate(self) {
        const t = self.progress;
        targets.forEach((el) => {
          const i = Number(el.dataset.i);
          const cfg = STAR_FIELD[i];
          const isPrimary = i === 0;
          const fromScale = isPrimary ? PRIMARY_GROWTH_PEAK_SCALE : 0;
          const fromOpacity = isPrimary ? 1 : 0;
          gsap.set(el, {
            x: `${cfg.dxVw * t}vw`,
            y: `${cfg.dyVh * t}vh`,
            scale: gsap.utils.interpolate(fromScale, cfg.size, t),
            opacity: gsap.utils.interpolate(fromOpacity, 1, t),
          });
        });
      },
    });

    // Exit fade: the whole field fades out as MainReel (plus its pinned
    // hold — pinSpacing reserves that distance in normal flow, so "bottom"
    // already accounts for it) finally scrolls past, so it never lingers
    // as a fixed layer over the chapter stack below. Inactive (never
    // called) until scroll actually reaches "bottom bottom", so it can't
    // touch opacity before the arrival phase above has finished with it.
    const exitST = ScrollTrigger.create({
      trigger: mainReelRef.current,
      start: "bottom bottom",
      end: "bottom top",
      scrub: true,
      onUpdate(self) {
        const opacity = 1 - self.progress;
        targets.forEach((el) => gsap.set(el, { opacity }));
      },
    });

    return () => {
      arrivalST.kill();
      exitST.kill();
    };
  }, [mainReelRef]);

  return (
    <div
      aria-hidden="true"
      className="fixed z-10 pointer-events-none select-none left-1/2 top-[56%]"
    >
      {STAR_FIELD.map((cfg, i) => {
        const isPrimary = i === 0;
        return (
          <div
            key={cfg.id}
            data-i={i}
            ref={(el) => (slotRefs.current[i] = el)}
            // Primary renders visible/at-scale from first paint ("already
            // visible before scrolling") rather than relying on setGrowth's
            // first call to reveal it; secondaries stay invisible/collapsed
            // until phase B (arrivalST) grows them out of the anchor point.
            className={`absolute ${isPrimary ? "" : "opacity-0"}`}
            style={{
              transform: `scale(${isPrimary ? PRIMARY_INITIAL_SCALE : 0})`,
            }}
          >
            <div
              className="animate-star-drift"
              style={{
                animationDuration: `${cfg.drift}s`,
                animationDelay: `${-cfg.drift * (i / STAR_FIELD.length)}s`,
                "--star-drift-x": `${cfg.driftX}px`,
                "--star-drift-y": `${cfg.driftY}px`,
              }}
            >
              <Sparkle
                size={cfg.size}
                spinDuration={cfg.spin}
                spinDelay={-cfg.spin * (i / STAR_FIELD.length)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default StarField2D;
