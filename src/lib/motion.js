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
export const DURATION = {
  micro: 0.4,
  transition: 1.5,
  reveal: 3.0,
  revelation: 4.0,
};

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
