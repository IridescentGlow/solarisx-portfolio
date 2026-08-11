import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { useGSAP } from "@gsap/react";
import AnimatedHeaderSection from "../AnimatedHeaderSection";
import { BentoObject } from "./BentoObject";
import {
  BEU_BENTO_OBJECTS,
  LAYOUT_ASPECT_W,
  LAYOUT_ASPECT_H,
  BEU_BENTO_MAX_WIDTH_PX,
  BEU_ASSEMBLY_VH,
} from "./beuBentoConfig";
gsap.registerPlugin(ScrollTrigger);

// Local copy of the same check ReelIntro.jsx/GeminiStar.jsx/ProjectPage.jsx
// each already use — no shared hook exists yet in this codebase to import
// instead (see PROJECT_STATUS.md), so this matches the established
// convention rather than inventing a new one.
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

// BeU Delivery — brief: "floating/scattered designed objects -> controlled
// movement through space -> objects assemble into the exact Figma
// composition -> subtle life after assembly." Two structurally different
// paths (cinematic vs. simple), same split ReelIntro.jsx uses for its own
// reduced-motion branch, extended here to also cover narrow/mobile
// viewports (brief §10: "a full cinematic scattered composition is
// unsuitable on very small screens, use a sensible simplified fallback").
export function BentoSection() {
  const reducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery({ minWidth: 768 });

  if (reducedMotion || !isDesktop) {
    return <SimpleBentoGrid />;
  }
  return <CinematicBentoAssembly />;
}

function SimpleBentoGrid() {
  return (
    <section className="px-10 mt-32 md:mt-48">
      <AnimatedHeaderSection
        subTitle="Craft"
        title="BeU Delivery"
        text=""
        textColor="text-ink"
        withScrollTrigger
        compact
      />
      <div className="grid grid-cols-1 gap-4 mt-10 sm:grid-cols-2">
        {BEU_BENTO_OBJECTS.map((cfg) => (
          <img
            key={cfg.id}
            src={cfg.asset}
            alt={cfg.alt}
            loading="lazy"
            // Own aspect ratio, not a forced square — matches the card's
            // real proportions in the assembled layout (box.width/height,
            // beuBentoConfig.js) instead of cropping wide cards like `map`
            // (aspect ~3.9) down to an illegible sliver.
            style={{ aspectRatio: `${cfg.box.width} / ${cfg.box.height}` }}
            className="object-cover w-full rounded-lg shadow-sm"
          />
        ))}
      </div>
    </section>
  );
}

function CinematicBentoAssembly() {
  const wrapRef = useRef(null);
  const objectRefs = useRef([]);

  useGSAP(() => {
    if (!wrapRef.current) return;

    // Same "function, not a +=vh string" fix ReelIntro.jsx's own transition
    // ScrollTrigger needed — a relative "+=140vh"-style string does not
    // resolve "vh" reliably inside a "+=" offset, but a function returning
    // an explicit pixel value does, and it re-evaluates on refresh/resize.
    const st = ScrollTrigger.create({
      trigger: wrapRef.current,
      start: "top top",
      end: () => `+=${window.innerHeight * (BEU_ASSEMBLY_VH / 100)}`,
      scrub: true,
      onUpdate(self) {
        const t = self.progress;
        objectRefs.current.forEach((obj) => obj?.setProgress(t));
      },
    });

    return () => st.kill();
  }, []);

  return (
    <>
      <div className="px-10 mt-32 md:mt-48">
        <AnimatedHeaderSection
          subTitle="Craft"
          title="BeU Delivery"
          text=""
          textColor="text-ink"
          withScrollTrigger
          compact
        />
      </div>

      <div
        ref={wrapRef}
        className="relative mt-16 md:mt-24"
        style={{ height: `calc(100vh + ${BEU_ASSEMBLY_VH}vh)` }}
      >
        {/* overflow-hidden here (not on the composition box below) is the
            same technique ReelIntro.jsx's own sticky viewport uses: it
            clips scattered objects that start well outside their final
            box without constraining where, WITHIN this viewport, they're
            allowed to travel. */}
        <div className="sticky top-0 flex items-center justify-center h-screen overflow-hidden">
          <div
            className="relative w-full px-6 mx-auto md:px-10"
            style={{
              maxWidth: `${BEU_BENTO_MAX_WIDTH_PX}px`,
              aspectRatio: `${LAYOUT_ASPECT_W} / ${LAYOUT_ASPECT_H}`,
            }}
          >
            {BEU_BENTO_OBJECTS.map((cfg, i) => (
              <BentoObject
                key={cfg.id}
                ref={(el) => {
                  objectRefs.current[i] = el;
                }}
                config={cfg}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default BentoSection;
