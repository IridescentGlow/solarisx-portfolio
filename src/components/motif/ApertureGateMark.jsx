import { useMemo } from "react";
import {
  APERTURE_R,
  BLADE_COUNT,
  IN_POINT,
  bladeBaseAngleDeg,
  polar,
  progressToAngleDeg,
} from "../../lib/apertureGeometry";

// The Gate, minimal state — the identity mark, for the footer and favicon
// (BLUEPRINT.md §9.1). Everything that stops reading below ~24px is gone: the
// 60-tick ruler, the frame numbers, the footage, the blade seams.
//
// Filled, not stroked. The first version of this mark was stroke-based and
// measured sub-pixel at favicon size — the whole viewBox is ~1.9 units wide, so
// a 0.055 stroke lands at 0.4px at 16px and dissolves into grey mush. Solid
// shapes are what survive, so the mark is a disc with the hexagonal hole punched
// out of it (even-odd), which is the iris's own silhouette rather than a drawing
// of one.
//
// The notch is the load-bearing detail: it sits off-axis at the in-point, so the
// mark is never rotationally symmetric. That asymmetry is what separates it from
// a generic shutter glyph or a hex nut — it reads as an instrument parked at a
// position, which is the §9.1 glyph risk being mitigated rather than accepted.
const HOLE_R = 0.32;
const NOTCH_HALF_DEG = 3.6;
const NOTCH_OUT = APERTURE_R + 0.2;
const VIEW = NOTCH_OUT * 2;

const arcPath = (r, sweep) =>
  `M ${r} 0 A ${r} ${r} 0 1 ${sweep} ${-r} 0 A ${r} ${r} 0 1 ${sweep} ${r} 0 Z`;

const hexPath = () =>
  Array.from({ length: BLADE_COUNT }, (_, i) =>
    polar(HOLE_R, bladeBaseAngleDeg(i) + 30)
  )
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(4)} ${y.toFixed(4)}`)
    .join(" ") + " Z";

const ApertureGateMark = ({ size = 32, className = "", title }) => {
  // Opposite sweep directions so the even-odd rule punches the hexagon out of
  // the disc instead of filling it.
  const body = useMemo(() => `${arcPath(APERTURE_R, 1)} ${hexPath()}`, []);

  const notch = useMemo(() => {
    const a = progressToAngleDeg(IN_POINT);
    const pts = [
      polar(APERTURE_R - 0.04, a - NOTCH_HALF_DEG),
      polar(NOTCH_OUT, a - NOTCH_HALF_DEG * 0.7),
      polar(NOTCH_OUT, a + NOTCH_HALF_DEG * 0.7),
      polar(APERTURE_R - 0.04, a + NOTCH_HALF_DEG),
    ];
    return (
      pts
        .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(4)} ${y.toFixed(4)}`)
        .join(" ") + " Z"
    );
  }, []);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-VIEW / 2} ${-VIEW / 2} ${VIEW} ${VIEW}`}
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : "true"}
      className={className}
    >
      {title ? <title>{title}</title> : null}
      <path d={body} fillRule="evenodd" />
      <path d={notch} />
    </svg>
  );
};

export default ApertureGateMark;
