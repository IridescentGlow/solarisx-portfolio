import { useId, useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { EASE, DURATION } from "../../lib/motion";
import {
  BLADE_COUNT,
  REDUCED,
  RING_R,
  LABEL_R,
  openFromProgress,
  playheadMark,
  rangeBrackets,
  reducedBladeOutline,
  reducedBladeTransform,
  tickMarks,
  toPath,
} from "../../lib/apertureGeometry";

// The Gate, reduced state — line-form, for frame transitions and loading
// (BLUEPRINT.md §9.1). SVG and stroke-only on purpose: a loading state must not
// spin up a WebGL context, and §0.14 moved three.js off the homepage's critical
// path, so this state carries no three.js import at all (not even transitively
// — see apertureGeometry.js's header).
//
// Direction A, not C (canon §1): no overshoot ease, no footage, no material.
// The identity is carried by silhouette and the ruler alone.
const VIEW = (LABEL_R + 0.11) * 2;

const ApertureGateReduced = ({
  progress = 0.5,
  drawOn = false,
  className = "",
  strokeWidth = 0.012,
}) => {
  const root = useRef(null);
  // Unique per instance: a transition and a loading state can be mounted at
  // the same time, and a duplicated clipPath id would make one of them crop
  // against the other's circle.
  const clipId = `gate-housing-${useId().replace(/:/g, "")}`;
  const blades = useMemo(() => toPath(reducedBladeOutline()), []);
  const ticks = useMemo(() => tickMarks(), []);
  const brackets = useMemo(() => rangeBrackets(), []);
  const openT = openFromProgress(progress);
  const playhead = playheadMark(progress);

  // Draw-on, used when this state is the thing introducing a frame. Reduced
  // motion is checked here rather than relying on motion.js's global
  // `gsap.defaults({duration: 0})`: that collapse is inert wherever a call site
  // passes `duration` explicitly, which this one does (BLUEPRINT.md §0.7).
  useGSAP(
    () => {
      if (!drawOn) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const strokes = root.current.querySelectorAll("[data-draw]");
      strokes.forEach((el) => {
        const len = el.getTotalLength();
        gsap.fromTo(
          el,
          { strokeDasharray: len, strokeDashoffset: len },
          {
            strokeDashoffset: 0,
            duration: DURATION.transition,
            ease: EASE.connective,
            // Blades arrive on the same lead/trail cascade the open motion
            // uses, so drawing and opening read as one gesture.
            stagger: 0.06,
          }
        );
      });
    },
    { dependencies: [drawOn], scope: root }
  );

  return (
    <svg
      ref={root}
      viewBox={`${-VIEW / 2} ${-VIEW / 2} ${VIEW} ${VIEW}`}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      aria-hidden="true"
    >
      {/* The reduced state's own housing (REDUCED.HOUSING_R). Its blades stay
          inside it by construction, so this is a guard, not the thing that
          shapes the line-form. */}
      <defs>
        <clipPath id={clipId}>
          <circle cx="0" cy="0" r={REDUCED.HOUSING_R} />
        </clipPath>
      </defs>

      {/* Ruler ring. Quiet — it is the reference the playhead is read against,
          not a frame around the composition. */}
      <circle cx="0" cy="0" r={RING_R} strokeWidth={strokeWidth * 0.6} opacity="0.28" />

      {ticks.map((t) => (
        <line
          key={t.frame}
          x1={t.inner[0]}
          y1={t.inner[1]}
          x2={t.outer[0]}
          y2={t.outer[1]}
          strokeWidth={t.major ? strokeWidth : strokeWidth * 0.6}
          opacity={t.major ? 0.72 : 0.34}
        />
      ))}

      {/* Frame numbers. Canon §3 takes "precise alignment, functional
          typography" from editing-timeline UI — this is that, and it is the
          clearest signal in the mark that this is a timeline and not a lens. */}
      {ticks
        .filter((t) => t.label)
        .map((t) => (
          <text
            key={`l${t.frame}`}
            x={t.labelPos[0]}
            y={t.labelPos[1]}
            fontSize="0.1"
            textAnchor="middle"
            dominantBaseline="middle"
            stroke="none"
            fill="currentColor"
            opacity="0.5"
            style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "0.02em" }}
          >
            {t.label}
          </text>
        ))}

      {/* In/out brackets — the range the aperture's opening is read against. */}
      {brackets.map((b) => (
        <g key={b.point} opacity="0.75">
          <line x1={b.stem[0][0]} y1={b.stem[0][1]} x2={b.stem[1][0]} y2={b.stem[1][1]} />
          <line x1={b.flag[0][0]} y1={b.flag[0][1]} x2={b.flag[1][0]} y2={b.flag[1][1]} />
        </g>
      ))}

      {/* Blades. One path, six placements — same outline as the 3D state.
          Filled with the page's own background rather than left hollow: in a
          real iris each blade occludes the ones under it, and six transparent
          outlines instead draw every hidden edge too, which reads as a
          spirograph rather than an aperture (verified on the render). The fill
          restores the occlusion, so what is left visible is exactly the iris's
          own structure — the rim, six seams, and the hexagonal hole. */}
      <g clipPath={`url(#${clipId})`}>
        {Array.from({ length: BLADE_COUNT }, (_, i) => (
          <path
            key={i}
            data-draw
            d={blades}
            transform={reducedBladeTransform(i, openT)}
            fill="var(--color-bg-base)"
            opacity={0.96}
          />
        ))}
      </g>

      {/* Playhead, on the accent. The one element allowed to be bright: it is
          the readout the whole form exists to display. */}
      <line
        x1={playhead.inner[0]}
        y1={playhead.inner[1]}
        x2={playhead.outer[0]}
        y2={playhead.outer[1]}
        stroke="var(--color-accent)"
        strokeWidth={strokeWidth * 1.4}
      />
    </svg>
  );
};

export default ApertureGateReduced;
