import { forwardRef, useImperativeHandle, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollTrigger);

// Named so the size is easy to retune later (brief: "prefer a small set of
// clearly named constants"). Raising this alone previously did nothing
// visible at common desktop widths (1440–1512px) — the section's own
// horizontal padding was the binding constraint, not this cap (at 1440px
// with 40px padding either side, min(1400, 1360) === min(1600, 1360)).
// Fixed by narrowing the padding too (see the section's own className
// below), so the cap actually gets reached earlier.
const REEL_MAX_WIDTH_PX = 1680;

// Brief §10–12: the reel arrives contained and small, smoothly enlarges to
// near-full-width as it scrolls into place, then holds briefly (fully
// presented, playing) before releasing back to normal scroll.
//
// `transform: scale`, not `width` — the enlarge is scroll-scrubbed every
// frame, and animating layout-affecting `width` at that frequency would
// thrash layout on every scroll tick. Scaling a wrapper already sized near
// its final width (see the `maxWidth` below) down and back up is the exact
// same technique ProjectPage.jsx's own `mediaRef`/`resultRef`/
// `awardChapterRef` scrub effects already use (`scale`, `ease: "none"`,
// tied to scroll position) — reused, not invented.
//
// Two separate ScrollTriggers, not one: the enlarge is a continuous scrub
// over the section's own transit; the hold afterward is a short, separate
// `pin: true` on the same section once the scrub has finished, so the
// "settle and acknowledge" beat doesn't fight the scrub's own scroll-to-
// value mapping. Both live on this section only — a sibling of the chapter
// stack elsewhere on the page, never an ancestor of it, so ProjectPage.jsx's
// documented sticky/overflow constraints are unaffected (see PROJECT_STATUS
// notes on `overflow-x-clip` and transforms breaking `position: sticky`).
export const MainReel = forwardRef(function MainReel(
  { project, reducedMotion = false },
  ref
) {
  const sectionRef = useRef(null);
  const scaleWrapRef = useRef(null);

  // Exposes the section DOM node itself (not an imperative API) — StarField2D
  // needs it purely as a ScrollTrigger `trigger`, so its own arrival/exit
  // animations lock to the EXACT SAME scroll geometry as this section's own
  // scale tween below, rather than a separately-guessed offset.
  useImperativeHandle(ref, () => sectionRef.current, []);

  useGSAP(() => {
    if (reducedMotion || !scaleWrapRef.current) return;

    // Both ScrollTriggers key off the SAME element and the SAME "top top"
    // handoff point, so the hold begins exactly when the enlarge finishes
    // (scale reaches 1) rather than at an independently-guessed offset —
    // two triggers on two different elements/paddings would drift apart
    // the moment either section's own spacing changed.
    gsap.fromTo(
      scaleWrapRef.current,
      { scale: 0.44 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          end: "top top",
          scrub: true,
        },
      }
    );

    // Brief, subtle hold once fully presented — long enough to register,
    // short enough to never read as a forced viewing experience (§12). The
    // visitor can always keep scrolling through it; this is not a trap.
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "+=45vh",
      pin: true,
      pinSpacing: true,
    });
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} className="relative z-20 px-6 py-24 md:px-8 md:py-32">
      <div
        ref={scaleWrapRef}
        // `group`, not a GSAP hover tween: this is a discrete two-state CTA
        // affordance (plain video vs. dark cinematic overlay), the same
        // kind of state change ThemeToggle's own transition-colors already
        // uses site-wide — not the continuous physical response GeminiStar/
        // the constellation panels' hover is, so plain CSS is the honest
        // fit here rather than a forced shared technique.
        className="relative mx-auto overflow-hidden border-8 rounded-lg shadow-lg group border-[var(--color-border)]"
        style={{ maxWidth: `${REEL_MAX_WIDTH_PX}px`, transformOrigin: "center center" }}
        data-cursor="watch"
      >
        <video
          src={project.image}
          poster={project.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`${project.name} preview`}
          className="object-cover w-full aspect-video"
        />

        {/* Cinematic CTA — darkens on hover and surfaces a contact prompt.
            Overlay only (opacity/background), the <video> itself is
            untouched, so playback is never interrupted. Button styling
            reuses the site's own uppercase/tracking-widest link language
            (ProjectPage.jsx's Links section closes every case study the
            same way) and the real contact email already shown on the
            homepage Navbar — not a new, invented destination. */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6 text-center transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] bg-black/0 group-hover:bg-black/55">
          <div className="transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
            <p className="text-2xl font-light tracking-wide text-white md:text-4xl">
              Let&apos;s work together
            </p>
            <a
              href="mailto:contactphazotron@gmail.com"
              className="inline-block px-8 py-3 mt-8 text-sm tracking-widest text-white uppercase transition-colors duration-300 border rounded-full border-white/70 hover:bg-white hover:text-black"
              data-cursor="talk"
            >
              Get in touch
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});

export default MainReel;
