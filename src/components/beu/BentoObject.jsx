import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import gsap from "gsap";
import { SETTLED_IDLE_FACTOR } from "./beuBentoConfig";

const clamp01 = (n) => Math.min(1, Math.max(0, n));

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
  { config, reducedMotion = false },
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
    const { ampX, ampY, ampRot, speed, phase } = config.idle;
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
        Math.cos(tSec * speed * 0.8 + phase) * ampY * ampFactor;
      const wobbleRot =
        Math.sin(tSec * speed * 0.6 + phase) * ampRot * ampFactor;

      gsap.set(el, {
        x: base.x + wobbleX,
        y: base.y + wobbleY,
        rotation: base.rot + wobbleRot,
        scale: base.scale,
      });
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [config, reducedMotion]);

  const { box, scatter } = config;

  return (
    <div
      ref={elRef}
      role="img"
      aria-label={config.alt}
      className="absolute bg-center bg-no-repeat bg-cover pointer-events-none will-change-transform"
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
