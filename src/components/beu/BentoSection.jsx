import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { useGSAP } from "@gsap/react";
import AnimatedHeaderSection from "../AnimatedHeaderSection";
import { BentoObject } from "./BentoObject";
import { EASE } from "../../lib/motion";
import {
  BEU_BENTO_GROUPS,
  LAYOUT_ASPECT_W,
  LAYOUT_ASPECT_H,
  BEU_BENTO_MAX_WIDTH_PX,
  BEU_ASSEMBLY_VH,
} from "./beuBentoConfig";
gsap.registerPlugin(ScrollTrigger);

// Every layer, across every group, as one flat list — each layer is still
// its own independently-animated BentoObject/ref, exactly as before the
// group refactor. Flattened once at module scope since the config is
// static; each layer carries its group's `proximityBox` so BentoObject's
// own ticker can react as one logical object per group (brief, third
// pass, §8) without every layer needing to know about its siblings.
const BEU_BENTO_LAYERS = BEU_BENTO_GROUPS.flatMap((group) =>
  group.layers.map((layer) => ({
    ...layer,
    proximityBox: group.proximityBox,
  }))
);

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
        {BEU_BENTO_GROUPS.map((group) => {
          // Multi-layer groups (fresh-hero, order-cart-track) have no
          // single pre-composed asset to show here — reduced-motion/mobile
          // doesn't need the layered assembly, so this falls back to the
          // clean per-card master export (previewAsset) instead of
          // rendering four/five static, unanimated layers stacked by hand.
          const single = group.layers.length === 1 ? group.layers[0] : null;
          const src = single ? single.asset : group.previewAsset;
          const alt = single ? single.alt : group.previewAlt;
          const box = group.proximityBox;
          return (
            <img
              key={group.id}
              src={src}
              alt={alt}
              loading="lazy"
              // Own aspect ratio, not a forced square — matches the card's
              // real proportions in the assembled layout instead of cropping
              // wide cards like `map` (aspect ~3.9) down to an illegible
              // sliver. box.width/height are percentages of a non-square
              // 1496x968 canvas, so they must be scaled by that canvas's own
              // aspect before use, not divided directly.
              style={{
                aspectRatio: `${box.width * LAYOUT_ASPECT_W} / ${
                  box.height * LAYOUT_ASPECT_H
                }`,
              }}
              className="object-cover w-full rounded-lg shadow-sm"
            />
          );
        })}
      </div>
    </section>
  );
}

function CinematicBentoAssembly() {
  const wrapRef = useRef(null);
  const compositionRef = useRef(null);
  const objectRefs = useRef([]);
  const sweepRefs = useRef([]);

  // Proximity field state, read by every BentoObject's own ticker (§6-9 of
  // the second-pass brief). `x`/`y` are cursor position in the composition
  // container's local px space; `presence` is a damped 0-1 "is the cursor
  // meaningfully here" scalar (see the ticker below) rather than a binary
  // hover flag — that's what keeps the effect fading in/out smoothly
  // instead of jump-cutting the instant the pointer crosses the edge.
  const cursorRef = useRef({ x: 0, y: 0, targetPresence: 0, presence: 0 });

  useGSAP(() => {
    if (!wrapRef.current) return;

    // Same "function, not a +=vh string" fix ReelIntro.jsx's own transition
    // ScrollTrigger needed — a relative "+=140vh"-style string does not
    // resolve "vh" reliably inside a "+=" offset, but a function returning
    // an explicit pixel value does, and it re-evaluates on refresh/resize.
    //
    // scrub: 0.2, not `true` (zero-lag) — ReelIntro's own transition uses
    // `true` for its section-establishing scrub, but this is the one place
    // in the brief that explicitly asks for a bit of trailing interpolation
    // ("does not instantly freeze on wheel release... enough interpolation
    // to look cinematic... must NOT become sluggish"). The page's own Lenis
    // instance (ProjectPage.jsx) already supplies most of the wheel-release
    // smoothing now — this only needs a small amount of its own catch-up on
    // top, not a second full lag stacked on Lenis's.
    const st = ScrollTrigger.create({
      trigger: wrapRef.current,
      start: "top top",
      end: () => `+=${window.innerHeight * (BEU_ASSEMBLY_VH / 100)}`,
      scrub: 0.2,
      onUpdate(self) {
        const t = self.progress;
        objectRefs.current.forEach((obj) => obj?.setProgress(t));
      },
    });

    // Ambient light sweep — the exact same `.award-light-sweep` utility and
    // EASE.connective curve the Result/Award chapter uses (ProjectPage.jsx),
    // not a new light effect. The Award version is a one-shot replay tied to
    // a scroll-position re-entry; this section is a single continuous
    // sticky beat instead, so a slow, looping pass reads as ambient
    // background atmosphere behind the assembly rather than a discrete
    // narrative beat — "enhance, don't compete" (brief §6), which is why
    // it's slow (9s) and lives at the back of the stack (z-index below
    // every layer's own 6-13 range).
    const sweeps = sweepRefs.current.filter(Boolean);
    let sweepTween = null;
    if (sweeps.length > 0) {
      sweepTween = gsap.fromTo(
        sweeps,
        { xPercent: -160 },
        {
          xPercent: 340,
          duration: 9,
          stagger: 1.6,
          ease: EASE.connective,
          repeat: -1,
          repeatDelay: 1.2,
        }
      );
    }

    // One shared presence-damping tick rather than nine duplicated ones —
    // each BentoObject's own ticker only ever reads cursorRef, never writes
    // the lerp itself.
    const tickPresence = () => {
      const c = cursorRef.current;
      c.presence += (c.targetPresence - c.presence) * 0.15;
    };
    gsap.ticker.add(tickPresence);

    const el = compositionRef.current;
    const onPointerMove = (e) => {
      const rect = el.getBoundingClientRect();
      cursorRef.current.x = e.clientX - rect.left;
      cursorRef.current.y = e.clientY - rect.top;
      cursorRef.current.targetPresence = 1;
    };
    const onPointerLeave = () => {
      cursorRef.current.targetPresence = 0;
    };
    el?.addEventListener("pointermove", onPointerMove);
    el?.addEventListener("pointerleave", onPointerLeave);

    return () => {
      st.kill();
      sweepTween?.kill();
      gsap.ticker.remove(tickPresence);
      el?.removeEventListener("pointermove", onPointerMove);
      el?.removeEventListener("pointerleave", onPointerLeave);
    };
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
            allowed to travel.

            bg-[var(--color-surface-1)] — the same "different visual
            chapter" material step the Result/Award chapter uses on the
            home page's dark-grading system (ProjectPage.jsx), not an
            arbitrary inline color: warm near-black in dark mode, warm
            paper-darker-than-page in light mode, via the existing theme
            tokens (index.css), so both themes stay covered for free. */}
        <div className="sticky top-0 flex items-center justify-center h-screen overflow-hidden bg-[var(--color-surface-1)]">
          {/* Soft golden glow + ambient sweep, behind the whole
              composition — identical visual language to the Award
              chapter's own spotlight + award-light-sweep pair. aria-hidden:
              purely decorative. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,var(--color-accent-subtle),transparent_65%)]"
          />
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
            <span
              ref={(el) => (sweepRefs.current[0] = el)}
              className="award-light-sweep"
            />
            <span
              ref={(el) => (sweepRefs.current[1] = el)}
              className="award-light-sweep"
            />
          </div>
          <div
            ref={compositionRef}
            className="relative w-full px-6 mx-auto md:px-10"
            style={{
              maxWidth: `${BEU_BENTO_MAX_WIDTH_PX}px`,
              aspectRatio: `${LAYOUT_ASPECT_W} / ${LAYOUT_ASPECT_H}`,
            }}
          >
            {BEU_BENTO_LAYERS.map((cfg, i) => (
              <BentoObject
                key={cfg.id}
                ref={(el) => {
                  objectRefs.current[i] = el;
                }}
                config={cfg}
                cursorRef={cursorRef}
                containerRef={compositionRef}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default BentoSection;
