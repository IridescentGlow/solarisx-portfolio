import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useMediaQuery } from "react-responsive";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { useGSAP } from "@gsap/react";
import AnimatedHeaderSection from "../AnimatedHeaderSection";
import { VideoConstellation } from "./VideoConstellation";
import { MainReel } from "./MainReel";
import { StarField2D } from "./StarField2D";
import {
  DESKTOP_PANELS,
  MOBILE_PANELS,
  CONSTELLATION_CAMERA,
} from "./reelConstellationConfig";
gsap.registerPlugin(ScrollTrigger);

// Extra scroll distance (beyond the one viewport the sticky canvas already
// occupies for free) given to the title-rise -> flythrough -> text-fade
// transition. Brief §8: "keep the scroll range compact... avoid huge
// 1000px+ scrolling section" — 140vh is roughly a viewport and a half,
// short enough that six panels flying past reads as fast, not padded out.
const TRANSITION_VH = 140;

const clamp01 = (n) => Math.min(1, Math.max(0, n));

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

// No metadata footer here: ProjectPage.jsx's own `<div ref={metadataRef}>`
// (role/year/stack) already renders unconditionally, right after this
// component in the DOM — reused as-is rather than duplicated, so
// cinematicIntro projects don't end up with two metadata rows.

// The cinematic opening for Signature Reel (brief §1–13): a homepage-Hero-
// styled title with swapped composition, a static 3D video constellation
// behind it, a scroll-driven flythrough, then the reel itself arriving
// small and enlarging to full width with a brief sticky hold.
//
// Two structurally different paths, not one path with scattered
// reduced-motion branches sprinkled through it: under
// prefers-reduced-motion, nothing is pinned or scroll-scrubbed at all —
// hero, title, and reel simply sit in normal document flow, following
// GeminiStar's own established precedent of not running this class of
// motion for that setting, and MediHelp's own precedent of AnimatedHeaderSection's
// ordinary (non-scroll-hijacking) reveal being an acceptable reduced-motion
// experience already, site-wide.
export function ReelIntro({ project }) {
  const reducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const panels = isDesktop ? DESKTOP_PANELS : MOBILE_PANELS;

  const [titleMain, titleQualifier] = project.name.split(" - ");

  if (reducedMotion) {
    return (
      <ReducedMotionIntro
        project={project}
        titleMain={titleMain}
        titleQualifier={titleQualifier}
        panels={panels}
      />
    );
  }

  return (
    <CinematicIntro
      project={project}
      titleMain={titleMain}
      titleQualifier={titleQualifier}
      panels={panels}
    />
  );
}

function ReducedMotionIntro({ project, titleMain, titleQualifier, panels }) {
  return (
    <>
      <section className="relative flex flex-col justify-end min-h-screen">
        <AnimatedHeaderSection
          subTitle={titleQualifier}
          title={titleMain}
          text="Dagim Demissie"
          textColor="text-ink"
          withScrollTrigger={false}
        />
        <figure className="absolute inset-0 -z-10">
          <Canvas camera={CONSTELLATION_CAMERA}>
            <VideoConstellation panels={panels} reducedMotion />
          </Canvas>
        </figure>
      </section>
      <AnimatedHeaderSection
        subTitle={titleQualifier}
        title={titleMain}
        text=""
        textColor="text-ink"
        withScrollTrigger={true}
        compact
      />
      <MainReel project={project} reducedMotion />
    </>
  );
}

function CinematicIntro({ project, titleMain, titleQualifier, panels }) {
  const wrapRef = useRef(null);
  const constellationRef = useRef(null);
  const heroRef = useRef(null);
  const mainReelRef = useRef(null);
  const starFieldRef = useRef(null);

  useGSAP(() => {
    if (!wrapRef.current) return;

    const st = ScrollTrigger.create({
      trigger: wrapRef.current,
      start: "top top",
      // A function, not a "+=140vh" string: ScrollTrigger's start/end
      // parser resolves "vh" reliably in some contexts but not inside a
      // relative "+=" offset (confirmed empirically — that string measured
      // as a ~140PX range, not 140 viewport-heights, collapsing the entire
      // cross-fade into the first few percent of scroll). A function
      // returning an explicit pixel offset is unambiguous and is also
      // GSAP's own recommended pattern for viewport-relative values, since
      // it gets re-evaluated on ScrollTrigger.refresh() (e.g. on resize).
      end: () => `+=${window.innerHeight * (TRANSITION_VH / 100)}`,
      scrub: true,
      onUpdate(self) {
        const p = self.progress;

        // The title fades OUT IN PLACE, slower than the panels fly by
        // (brief: video motion overtakes the text, not the reverse) —
        // opacity only, on the SAME element the title always renders in,
        // never a position change and never a second re-entry element.
        // (Previously a separate centered "transition title" card rose in
        // after this one faded — that read as the title vanishing and
        // popping back up recentered, which is exactly the bug being fixed
        // here. One title, one position, one fade.)
        const titleOpacity = 1 - clamp01(p / 0.55);
        if (heroRef.current) gsap.set(heroRef.current, { opacity: titleOpacity });

        // Flythrough: fast, occupies most of the remaining scroll budget.
        const flythrough = clamp01((p - 0.15) / 0.85);
        constellationRef.current?.setProgress(flythrough);

        // Star field phase A (single star growing) — reuses this same
        // transition progress directly rather than a second ScrollTrigger;
        // phase B (split/spread) is StarField2D's own, keyed on MainReel.
        starFieldRef.current?.setGrowth(p);
      },
    });

    return () => st.kill();
  }, [panels]);

  return (
    <>
      <div
        ref={wrapRef}
        data-testid="reel-transition-wrap"
        className="relative"
        style={{ height: `calc(100vh + ${TRANSITION_VH}vh)` }}
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <Canvas camera={CONSTELLATION_CAMERA}>
              <VideoConstellation ref={constellationRef} panels={panels} />
            </Canvas>
          </div>

          {/* Swapped hero (brief §1): AnimatedHeaderSection's own slots
              reused as-is — title (big, left) carries the descriptive/
              project identity, text (small, text-end/right) carries the
              personal identity — the reverse of Hero.jsx's
              title=name/text=description arrangement, using only strings
              already present elsewhere in the codebase (project.name's own
              split, and Hero.jsx's own "Dagim Demissie"). */}
          <div
            ref={heroRef}
            data-testid="reel-hero"
            // pointer-events-none: this is a full-viewport, non-interactive
            // text overlay sitting ABOVE the constellation's Canvas in
            // paint order. Without this, every pointermove over the whole
            // sticky section (whatever its live opacity) hit-tests against
            // this div instead of reaching the panels underneath, so
            // Panel's own onPointerOver/onPointerOut in VideoConstellation.jsx
            // would never fire — the same reason the title card this
            // replaced carried pointer-events-none too.
            className="flex flex-col justify-end h-full pointer-events-none"
          >
            <AnimatedHeaderSection
              subTitle={titleQualifier}
              title={titleMain}
              text="Dagim Demissie"
              textColor="text-ink"
              withScrollTrigger={false}
            />
          </div>
        </div>
      </div>

      {/* MainReel mounts BEFORE StarField2D so its own ref (exposed via
          useImperativeHandle) is already attached by the time StarField2D's
          effect runs — sibling layout effects fire in tree order. Visual
          stacking (star field behind the reel) is handled separately, by
          explicit z-index on each (see MainReel.jsx / StarField2D.jsx), so
          this mount order has no effect on what paints on top. */}
      <MainReel ref={mainReelRef} project={project} />
      <StarField2D ref={starFieldRef} mainReelRef={mainReelRef} />
    </>
  );
}

export default ReelIntro;
