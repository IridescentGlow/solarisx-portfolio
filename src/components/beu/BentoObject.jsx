import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import gsap from "gsap";
import { SETTLED_IDLE_FACTOR } from "./beuBentoConfig";

const clamp01 = (n) => Math.min(1, Math.max(0, n));
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
// Smoothstep — used for the proximity falloff (distance -> effect) and for
// gating proximity onto each card's own settle value, so both ramp in/out
// with an eased curve rather than a linear or binary cut.
const smoothstep = (edge0, edge1, x) => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

// Proximity field tuning (brief §6/§7: "a subtle proximity field... distance-
// based falloff rather than binary hover states"). Radius is a fraction of
// the composition's own width so the field scales with container size
// instead of a fixed px value that would feel oversized on a small tablet
// or tiny on an ultra-wide desktop.
const PROXIMITY_RADIUS_FACTOR = 0.24;
const PROXIMITY_MAX_SCALE = 0.06; // closest card: up to scale 1.06
const PROXIMITY_MAX_LEAN_PX = 10; // small lean toward the cursor, not a chase
const PROXIMITY_MAX_ROT_DEG = 1.6;
const PROXIMITY_MAX_Z_BOOST = 40; // keeps the nearest card's stack order
// clear of every base zIndex (max 12) without permanently reordering
// anything once the cursor moves away.

// Ease-out-back, brief §6/§7: "accelerate toward target... tiny overshoot...
// controlled settle." `C1` is kept well below GSAP's default back-ease
// constant (1.70158) so the overshoot stays a restrained nudge rather than a
// springy bounce (brief §7: "keep this restrained... not bouncy or
// cartoonish"). Passing p=1 returns exactly 1 — full settle, no residual
// offset — and 0.7 < p < 1 briefly returns slightly ABOVE 1, which is what
// produces the overshoot when it's used to interpolate away from a scatter
// offset (see setProgress below).
const OVERSHOOT_C1 = 1.1;
function easeOutBack(p) {
  const c3 = OVERSHOOT_C1 + 1;
  const t = p - 1;
  return 1 + c3 * t * t * t + OVERSHOOT_C1 * t * t;
}

// One shared "scroll owns the value, a continuous ticker applies it" split,
// the same pattern VideoConstellation.jsx's Panel uses for float + hover:
// `setProgress` (called from BentoSection's single ScrollTrigger) only ever
// writes the scroll-driven base transform into a ref; a per-object
// gsap.ticker callback reads that ref every frame and layers a small
// deterministic idle wobble on top before writing the DOM transform. This
// keeps the idle float running continuously (including before the user has
// scrolled at all) without fighting the scroll-scrubbed base value.
export const BentoObject = forwardRef(function BentoObject(
  { config, reducedMotion = false, cursorRef = null, containerRef = null },
  ref
) {
  const elRef = useRef(null);
  const baseRef = useRef(null);
  if (!baseRef.current) {
    const vw = window.innerWidth / 100;
    const vh = window.innerHeight / 100;
    const { dxVw, dyVh, rotDeg, scale } = config.scatter;
    baseRef.current = {
      x: dxVw * vw,
      y: dyVh * vh,
      rot: rotDeg,
      scale,
      settle: 0,
    };
  }

  useImperativeHandle(
    ref,
    () => ({
      setProgress(globalT) {
        if (reducedMotion || !elRef.current) return;
        const [start, end] = config.window;
        const p = clamp01((globalT - start) / (end - start));
        const eased = easeOutBack(p);
        const { dxVw, dyVh, rotDeg, scale } = config.scatter;
        const vw = window.innerWidth / 100;
        const vh = window.innerHeight / 100;
        baseRef.current.x = dxVw * vw * (1 - eased);
        baseRef.current.y = dyVh * vh * (1 - eased);
        baseRef.current.rot = rotDeg * (1 - eased);
        baseRef.current.scale = scale + (1 - scale) * eased;
        baseRef.current.settle = p;
      },
    }),
    [config, reducedMotion]
  );

  useEffect(() => {
    if (reducedMotion || !elRef.current) return;
    const {
      ampX,
      ampY,
      ampRot,
      speed,
      phase,
      // Fifth pass, brief §5 ("floating architectural pieces waiting to be
      // assembled", not "static screenshots waiting for scroll"). Both are
      // optional so a layer can opt out by simply not declaring them.
      // `ampScale` is a multiplicative breath, so it reads the same whether
      // a layer is still scattered at scale 0.5 or fully settled at 1.
      // `dir` flips only the Y term, which reverses the direction the
      // elliptical path is traced — neighbouring pieces set to opposite
      // signs visibly counter-orbit instead of drifting in parallel.
      ampScale = 0,
      dir = 1,
    } = config.idle;
    const startTime = performance.now();

    const tick = () => {
      const el = elRef.current;
      if (!el) return;
      const tSec = (performance.now() - startTime) / 1000;
      const base = baseRef.current;
      // Full idle amplitude while scattered/mid-flight (settle -> 0),
      // fading to SETTLED_IDLE_FACTOR once arrived (settle -> 1) — brief
      // §5 (generous pre-assembly life) vs §8 (only a whisper after).
      const ampFactor = 1 - base.settle * (1 - SETTLED_IDLE_FACTOR);
      const wobbleX = Math.sin(tSec * speed + phase) * ampX * ampFactor;
      const wobbleY =
        Math.cos(tSec * speed * 0.8 + phase) * ampY * ampFactor * dir;
      const wobbleRot =
        Math.sin(tSec * speed * 0.6 + phase) * ampRot * ampFactor;
      // Slowest of the four terms and on its own phase offset, so the
      // breath never lines up with the drift into a single pulsing beat.
      const wobbleScale =
        1 + Math.sin(tSec * speed * 0.45 + phase * 1.7) * ampScale * ampFactor;

      // Proximity field (brief §6-9): a magnetic-field feel, not per-card
      // hover state. Gated two ways — `presence` (has the cursor actually
      // been over the composition recently, damped so it fades rather than
      // cuts) and this card's own `settle` (so the field only wakes up once
      // THIS card has essentially finished assembling, per §9 — cards that
      // arrive earlier can already react while later ones are still
      // travelling in). Container is read fresh each frame since it can
      // resize (viewport resize, orientation change).
      let proxX = 0;
      let proxY = 0;
      let proxRot = 0;
      let proxScale = 0;
      let proxZ = 0;
      const cursor = cursorRef?.current;
      const containerEl = containerRef?.current;
      if (cursor && containerEl && cursor.presence > 0.001) {
        const cw = containerEl.clientWidth;
        const ch = containerEl.clientHeight;
        if (cw > 0 && ch > 0) {
          // proximityBox (the GROUP's overall footprint), not this layer's
          // own box — so a multi-layer card (hero, order-cart-track) reacts
          // as one object instead of each layer computing its own distance
          // and drifting apart under the cursor.
          const proxBox = config.proximityBox || config.box;
          const cardCenterX = ((proxBox.left + proxBox.width / 2) / 100) * cw;
          const cardCenterY = ((proxBox.top + proxBox.height / 2) / 100) * ch;
          const dx = cursor.x - cardCenterX;
          const dy = cursor.y - cardCenterY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = cw * PROXIMITY_RADIUS_FACTOR;
          const proximity = 1 - smoothstep(0, radius, dist);
          const settleGate = smoothstep(0.82, 1.0, base.settle);
          const strength = proximity * settleGate * cursor.presence;
          if (strength > 0.0005 && dist > 0.5) {
            const invDist = 1 / dist;
            proxScale = PROXIMITY_MAX_SCALE * strength;
            proxX = dx * invDist * PROXIMITY_MAX_LEAN_PX * strength;
            proxY = dy * invDist * PROXIMITY_MAX_LEAN_PX * strength;
            proxRot =
              clamp(dx / radius, -1, 1) * PROXIMITY_MAX_ROT_DEG * strength;
            proxZ = Math.round(PROXIMITY_MAX_Z_BOOST * strength);
          }
        }
      }

      gsap.set(el, {
        x: base.x + wobbleX + proxX,
        y: base.y + wobbleY + proxY,
        rotation: base.rot + wobbleRot + proxRot,
        scale: base.scale * wobbleScale + proxScale,
        zIndex: config.zIndex + proxZ,
      });
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [config, reducedMotion, cursorRef, containerRef]);

  const {
    box,
    scatter,
    decorative,
    fit = "cover",
    bgPosition = "center",
  } = config;

  return (
    <div
      ref={elRef}
      {...(decorative
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": config.alt })}
      className={`absolute bg-no-repeat pointer-events-none will-change-transform ${
        fit === "contain" ? "bg-contain" : "bg-cover"
      } ${bgPosition === "top" ? "bg-top" : "bg-center"}`}
      style={{
        left: `${box.left}%`,
        top: `${box.top}%`,
        width: `${box.width}%`,
        height: `${box.height}%`,
        backgroundImage: `url(${config.asset})`,
        zIndex: config.zIndex,
        // First-paint scatter position, before any JS has run — the ticker
        // above overwrites this (in px) within the first animation frame.
        // Reduced-motion renders with no transform at all: straight to the
        // final assembled position, per brief §11.
        transform: reducedMotion
          ? undefined
          : `translate(${scatter.dxVw}vw, ${scatter.dyVh}vh) rotate(${scatter.rotDeg}deg) scale(${scatter.scale})`,
      }}
    />
  );
});

export default BentoObject;
