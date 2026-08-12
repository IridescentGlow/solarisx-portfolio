import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { useLenis } from "lenis/react";

gsap.registerPlugin(ScrollTrigger);

// Wires whichever <ReactLenis root> instance is currently mounted
// (HomePage.jsx or ProjectPage.jsx — never both, react-router only renders
// one route at a time) to GSAP's own ticker, instead of leaving Lenis to
// run its default independent rAF loop (ReactLenis's `autoRaf`).
//
// Why this matters here specifically: a page with heavy ScrollTrigger
// scrub work (the chapter stack, the Bento assembly, statement-drift, the
// award sweep — all on ProjectPage) is doing real work on every animation
// frame. Two independent, unsynchronized rAF loops (Lenis's own smoothing
// tick and GSAP's ticker) can drift a frame apart under that load, which
// reads as the scroll losing its momentum/stuttering to a stop sooner than
// Lenis's own math says it should — even though nothing about the eased
// deceleration curve itself changed. Routing Lenis's raf through GSAP's
// ticker (the same clock every scrub animation on the page already uses)
// and calling ScrollTrigger.update() on every Lenis scroll event removes
// that drift, which is what actually caused the release momentum to still
// feel "instant" after a first pass that only lowered Lenis's `lerp`.
//
// `<ReactLenis root>` MUST be mounted with `options={{ autoRaf: false }}`
// wherever this hook is used — otherwise Lenis's own loop and this one
// would both be driving the same instance, double-updating every frame.
export function useLenisScrollSync() {
  const lenis = useLenis(() => {
    ScrollTrigger.update();
  });

  useEffect(() => {
    if (!lenis) return;
    const update = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(update);
    // Lenis already supplies its own eased deceleration — GSAP's lag
    // compensation (which skips/jumps frames after a stall to "catch up")
    // fights that by yanking the scroll position, which is exactly the
    // abrupt-stop feeling this hook exists to remove.
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(update);
    };
  }, [lenis]);
}
