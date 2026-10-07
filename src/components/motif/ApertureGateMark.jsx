import { useMemo } from "react";
import { BLADE_COUNT, IN_POINT, progressToAngleDeg } from "../../lib/apertureGeometry";

// The Gate, minimal state — the identity mark, for the footer and favicon
// (BLUEPRINT.md §9.1, direction M3).
//
// Drawn on a 16-unit grid and scaled UP, not reduced from the 3D form. The
// previous mark was a reduction, and the arithmetic is why it failed: its
// viewBox was 2.0 units wide, so at 16px the off-axis notch it relied on as
// its only disambiguator measured 2 x 0.9 x sin(3.6deg) ~= 0.9px, and the
// hexagonal hole had a 2.6px radius that antialiased into a round dot. The
// result read as a plain ring. Here one unit IS one pixel at 16px, and every
// stroke is a whole number of pixels.
//
// Figure and ground are inverted from that version: the hexagonal opening is
// now the dominant shape and the housing is a thin rim, so the silhouette that
// survives at favicon size is the aperture itself rather than a circle. The
// rim is broken by a wedge gap at the in-point, which keeps the mark
// rotationally asymmetric without depending on a sub-pixel tick.
//
// Below 20px the rim and seams are dropped rather than drawn: measured on the
// 16px raster, the rim breaks into scattered dots that read as grit around the
// hexagon (44.5% ink coverage against 23.8% without it). The hexagonal opening
// alone is the more specific shape at that size, and the rim resolves cleanly
// again from 20px up, which is where it is kept.
const RIM_MIN_SIZE = 20;
const GRID = 16;
const C = GRID / 2;
const HEX_R = 4.5;
const RIM_R = 7.5;
const SEAM_IN = 5.5;
const SEAM_OUT = 7;
// Degrees of rim removed at the in-point. Wide enough to survive one pixel.
const GAP_DEG = 72;

const polarPx = (r, deg) => {
  const rad = (deg * Math.PI) / 180;
  return [C + r * Math.cos(rad), C + r * Math.sin(rad)];
};

const hexPath = () =>
  Array.from({ length: BLADE_COUNT }, (_, i) => polarPx(HEX_R, 60 * i - 90))
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(3)} ${y.toFixed(3)}`)
    .join(" ") + " Z";

// The rim as an arc with a wedge removed, rather than a full circle: a closed
// ring is exactly the generic shape this mark has to avoid.
const rimPath = (gapCentreDeg) => {
  const a0 = gapCentreDeg + GAP_DEG / 2;
  const a1 = gapCentreDeg - GAP_DEG / 2 + 360;
  const [x0, y0] = polarPx(RIM_R, a0);
  const [x1, y1] = polarPx(RIM_R, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0.toFixed(3)} ${y0.toFixed(3)} A ${RIM_R} ${RIM_R} 0 ${large} 1 ${x1.toFixed(3)} ${y1.toFixed(3)}`;
};

const ApertureGateMark = ({ size = 32, className = "", title }) => {
  // Parked at the in-point, the same position the full state opens from, so
  // the mark is a still of the instrument rather than an unrelated logo.
  const gapCentre = progressToAngleDeg(IN_POINT);
  const hex = useMemo(() => hexPath(), []);
  const rim = useMemo(() => rimPath(gapCentre), [gapCentre]);
  // Three seams, not six: at 16px six would close into a solid ring of ink.
  const seams = useMemo(
    () =>
      [0, 2, 4].map((i) => {
        const a = 60 * i - 60;
        return [polarPx(SEAM_IN, a), polarPx(SEAM_OUT, a)];
      }),
    []
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${GRID} ${GRID}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="butt"
      strokeLinejoin="miter"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : "true"}
      className={className}
    >
      {title ? <title>{title}</title> : null}
      {/* The aperture opening, carrying the most weight on purpose. */}
      <path d={hex} strokeWidth="2" />
      {size >= RIM_MIN_SIZE ? <path d={rim} strokeWidth="1" /> : null}
      {size >= RIM_MIN_SIZE
        ? seams.map(([a, b], i) => (
            <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} strokeWidth="1" />
          ))
        : null}
    </svg>
  );
};

export default ApertureGateMark;
