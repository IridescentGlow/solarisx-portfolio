import gsap from "gsap";
import { CustomEase } from "gsap/all";

gsap.registerPlugin(CustomEase);

// The four canonical curves from DESIGN_SYSTEM_TOKENS.md §4, registered as named
// GSAP eases so JavaScript animations use the same values as the CSS custom
// properties rather than an approximation.
//
// `revelation` is Direction C only (CREATIVE_DIRECTION_BOARD.md §1). A transition
// is never a Revelation moment (TRANSITION_PHILOSOPHY_CANONICAL.md §4), so it must
// not appear on a frame handoff or an ordinary reveal.
CustomEase.create("precise", "0.4, 0, 0.2, 1");
CustomEase.create("cinematic", "0.16, 1, 0.3, 1");
CustomEase.create("connective", "0.65, 0, 0.35, 1");
CustomEase.create("revelation", "0.34, 1.56, 0.64, 1");

export const EASE = {
  precise: "precise",
  cinematic: "cinematic",
  connective: "connective",
  revelation: "revelation",
};

// Seconds. Deliberately slower than DESIGN_SYSTEM_TOKENS.md §4's values
// (150/350/800/1200ms) — those read too quick in the built page and lost the
// cinematic pacing. The hierarchy the tokens define is preserved: micro <
// transition < reveal < revelation, and a handoff stays quicker than an entrance.
//
// transition/reveal bumped again (1.5->1.8, 3.0->3.6) after confirming, by
// direct measurement (a controlled scroll straight across a trigger's start
// with no further scrolling), that the mechanism itself was firing and
// playing correctly — the reveal just wasn't landing as a perceptible,
// premium-feeling entrance during ordinary scrolling. Two compounding
// causes, both addressed here rather than by touching the trigger
// mechanism: (1) SCROLL_REVEAL_START's old 120% head start let a large
// chunk of the fixed real-time duration burn while the section was still
// off-screen — see that constant's own comment below; (2) EASE.cinematic
// is a strong ease-OUT (fast start, long slow-settling tail), so most of
// the visible motion already lands in roughly the first third of the
// duration regardless of how long that duration is — a longer number
// mostly buys a longer, barely-visible tail, not more perceptible motion.
// Raising the raw duration still helps (it stretches that early, most-
// visible portion in absolute wall-clock terms too), which is why both
// levers are pulled together rather than either alone. revelation (4.0)
// is intentionally left as the ceiling reveal must stay under, preserving
// the file's own micro < transition < reveal < revelation ordering.
export const DURATION = {
  micro: 0.4,
  transition: 1.8,
  reveal: 3.6,
  revelation: 4.0,
};

// Pre-trigger offset for non-scrubbed reveals. Firing at the default "top
// bottom" starts the multi-second cinematic reveal only once the element is
// already at the viewport edge, so by the time it's actually visible the
// animation is still catching up — scroll, empty space, then a late pop-in.
//
// Was "top 120%" (a 20%-of-a-viewport head start). Measured directly (see
// DURATION's comment above) that this made the reveal, in practice, run
// largely or entirely *before* the section was on screen at typical scroll
// speed — by the time a visitor's eye actually reached it, there was often
// nothing left to watch happen, reading as "already finished" rather than
// as an entrance. 105% keeps a small cushion (so an already-at-the-very-
// bottom-edge pop-in still doesn't happen) while ensuring the large
// majority of the now-longer reveal plays out with the section actually
// in view, which is the point of a scroll reveal in the first place. Does
// not apply to scrub-linked animations (ServiceSummary, ContactSummary,
// About's scale effect), whose progress is tied to scroll position rather
// than a fixed-duration timer.
export const SCROLL_REVEAL_START = "top 105%";

// TRANSITION_PHILOSOPHY_CANONICAL.md §5 — under prefers-reduced-motion, motion
// collapses to instant state changes. Setting the global GSAP default once, here,
// means every timeline inherits it and no component needs its own branch.
//
// Scope note: this collapses time-based tweens. Scrub-linked animations
// (ServiceSummary, ContactSummary, About) are mapped to scroll position rather
// than to time, so they are unaffected by a duration default.
if (
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  gsap.defaults({ duration: 0 });
}
