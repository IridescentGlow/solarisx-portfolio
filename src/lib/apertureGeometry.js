// The Gate — the one silhouette source for all three signature-motif states
// (BLUEPRINT.md §9.1). Blade count, blade profile, tick counts, in/out points
// and playhead angle live here only, following the geminiVideos.js +
// starVideoRegions.js precedent: one definition drives both geometry and
// content so the states cannot drift. Three hand-drawn states that merely
// resemble each other would not be an identity system.
//
// Deliberately three.js-free. The reduced (loading) and minimal (favicon)
// states are SVG, and §0.14 split three.js/R3F into its own async chunk so the
// homepage's first paint no longer waits on it — a loading state that imported
// from a three-aware module would pull that chunk straight back into the
// critical path. The 3D state converts these plain point arrays into
// THREE.Shape locally instead.
//
// Everything is in a unit disc: radius 1.0 is the timecode ring's own line.
// Numeric labels sit outside it (LABEL_R), so a viewBox needs ~1.25 of room.

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export const polar = (r, deg) => {
  const rad = (deg * Math.PI) / 180;
  return [r * Math.cos(rad), r * Math.sin(rad)];
};

// --- Blades -----------------------------------------------------------------

export const BLADE_COUNT = 6;

// An iris blade is the intersection of two circles, which is what gives it the
// characteristic curved inner edge — it is not a wedge with a rounded end.
//
// Two radii, not one, and the distinction is load-bearing. APERTURE_R is the
// HOUSING: the disc the blades are visible inside, and the only one the eye
// ever sees. BLADE_BUILD_R is the larger disc each blade is actually
// constructed against. Building and clipping at the same radius was tried
// first and caps the usable hole at ~0.19, because as the blades swing their
// own outer arcs rotate off the rim and open wedge-shaped gaps right at the
// edge. Building them oversized puts those gaps outside the housing, where a
// real iris also hides them — which is what lets the hole reach 0.27 with the
// aperture still reading as solid.
//
// Because BLADE_CENTER_D is smaller than BLADE_CIRCLE_R, the blade circle
// contains the origin, so at rest the six overlapping blades close the
// aperture completely rather than leaving a permanent gap in the middle.
export const APERTURE_R = 0.8;
const BLADE_BUILD_R = 1.15;
const BLADE_CIRCLE_R = 1.785;
const BLADE_CENTER_D = 0.75;

// How far a blade swings open, in degrees about its own rim pivot. Blades
// rotate rather than slide: a rim pivot is how a real iris works, and it also
// means the shape is computed once and animated by transform alone — a sliding
// blade would have to be re-clipped against APERTURE_R every frame, which in
// the 3D state would mean rebuilding geometry per frame.
//
// Measured, not styled. Swinging a blade open necessarily throws part of it
// outside the housing — the far corner leaves APERTURE_R almost immediately. That
// is not a flaw in these numbers; it is what an iris does, which is why a real
// one hides its blades inside a housing. Both states therefore CLIP the blades
// to APERTURE_R (the SVG with a clipPath, the 3D with a radial discard), and
// the clip is what makes the rim read as a machined edge instead of six petals
// crossing the ruler.
//
// (An earlier pass swung them the other way, which keeps every vertex inside
// 0.800 and looks tidy in the numbers — but the centre stays covered at every
// angle, so the aperture never actually opens. The check that catches this is
// whether the origin is OUTSIDE all six blades, not how far the nearest blade
// edge is from it.)
const MAX_OPEN_DEG = 70;

// The blades never return to fully stacked. Each blade is large enough to seal
// the aperture on its own, so at a true zero angle whichever blade is on top IS
// the entire visible surface and the five behind it cannot be seen at all —
// measured, not assumed: at 0 degrees one blade covers 100% of the disc, and it
// is still 87.6% at 26 degrees. A gate whose slots cannot be told apart cannot
// show a cut landing in one of them.
//
// Kept deliberately small. The stacking order does most of this work (see
// ApertureGateFull's z offsets); this angle only has to part the blades enough
// that the seams read at rest, and going further would trade the closed
// resting state for nothing. The aperture is still sealed here — the hole does
// not open until far higher angles — so rest reads as closed, not as stuck.
const MIN_OPEN_DEG = 14;

// Per-blade delay as a fraction of the open progress. Canon §6 requires
// lead/trail (J-cut/L-cut) transitions, so the blades cascade instead of
// snapping in unison — a shutter moves all blades together, an edit does not.
// This is the single clearest piece of the "timeline, not camera" refinement
// that lives in motion rather than in form.
//
// Kept small deliberately. At 0.07 the cascade spans a third of the whole
// range, which reads correctly while scrubbing but leaves the iris visibly
// lopsided whenever it is parked mid-open — and a Hero motif spends most of
// its life parked. 0.035 still lands as a cascade in motion without the
// static state looking broken.
const OPEN_STAGGER = 0.035;

// Angle, at the origin, from the blade-circle's centre direction out to where
// the two circles cross. Derived from the law of cosines rather than tuned, so
// the blade's outer arc always lands exactly on APERTURE_R.
const crossAngleDeg = (() => {
  const cosA =
    (BLADE_CENTER_D * BLADE_CENTER_D +
      BLADE_BUILD_R * BLADE_BUILD_R -
      BLADE_CIRCLE_R * BLADE_CIRCLE_R) /
    (2 * BLADE_CENTER_D * BLADE_BUILD_R);
  return (Math.acos(clamp(cosA, -1, 1)) * 180) / Math.PI;
})();

// Sweeps from `fromRad` to `toRad` the way round that passes through
// `throughRad`. Needed because the blade's inner edge is one specific arc of
// the blade circle — the one bulging toward the centre — and picking the other
// arc silently produces a crescent pointing the wrong way.
function arcThrough(fromRad, toRad, throughRad, steps, fn) {
  const TAU = Math.PI * 2;
  const norm = (a) => ((a % TAU) + TAU) % TAU;
  const f = norm(fromRad);
  let t = norm(toRad);
  const th = norm(throughRad);
  const ccwContains = f <= t ? th >= f && th <= t : th >= f || th <= t;
  if (!ccwContains) t = t > f ? t - TAU : t;
  else if (t < f) t += TAU;
  const out = [];
  for (let i = 0; i <= steps; i++) out.push(fn(f + ((t - f) * i) / steps));
  return out;
}

// The canonical blade, centred on angle 0, as a closed polygon in disc space.
// Every blade is this same outline placed by `bladePivot`/`bladeOpenDeg`, so
// all six are literally the same shape — the 3D state can therefore share one
// geometry per blade and the SVG states can share one path string.
export function bladeOutline(steps = 28) {
  const a = crossAngleDeg;
  const q1 = polar(BLADE_BUILD_R, a);
  const q2 = polar(BLADE_BUILD_R, -a);
  const centre = [BLADE_CENTER_D, 0];

  // Outer edge: along the aperture disc, through angle 0.
  const outer = arcThrough(
    (-a * Math.PI) / 180,
    (a * Math.PI) / 180,
    0,
    steps,
    (rad) => [BLADE_BUILD_R * Math.cos(rad), BLADE_BUILD_R * Math.sin(rad)]
  );

  // Inner edge: along the blade circle, back through the point nearest the
  // centre — which sits at PI from the blade circle's own centre direction.
  const f1 = Math.atan2(q1[1] - centre[1], q1[0] - centre[0]);
  const f2 = Math.atan2(q2[1] - centre[1], q2[0] - centre[0]);
  const inner = arcThrough(f1, f2, Math.PI, steps, (rad) => [
    centre[0] + BLADE_CIRCLE_R * Math.cos(rad),
    centre[1] + BLADE_CIRCLE_R * Math.sin(rad),
  ]);

  return [...outer, ...inner.slice(1, -1)];
}

// The rim point a blade hinges on: one of the two places its own outline
// already touches the aperture disc, so the hinge is on the silhouette rather
// than floating somewhere inside it.
export function bladePivot() {
  return polar(BLADE_BUILD_R, -crossAngleDeg);
}

export const bladeBaseAngleDeg = (i) => (360 / BLADE_COUNT) * i;

// Blade i's own open amount at a global open value, including its stagger.
export function bladeOpenT(i, openT) {
  const span = 1 - (BLADE_COUNT - 1) * OPEN_STAGGER;
  return clamp((openT - i * OPEN_STAGGER) / span, 0, 1);
}

export const bladeOpenDeg = (i, openT) =>
  MIN_OPEN_DEG + bladeOpenT(i, openT) * (MAX_OPEN_DEG - MIN_OPEN_DEG);

// --- Timecode ring ----------------------------------------------------------

// 60 ticks reading as 60 frames, major every 10. The major count (6) is the
// blade count on purpose: the ruler and the blades share one rhythm instead of
// being two unrelated subdivisions of the same circle.
export const TICK_COUNT = 60;
export const MAJOR_EVERY = 10;

export const RING_R = 1.0;
const MINOR_LEN = 0.045;
const MAJOR_LEN = 0.085;
export const LABEL_R = RING_R + 0.14;

// Frame 0 at twelve o'clock, counting clockwise, so the ring reads like a
// clock/timeline rather than starting at the mathematical 0 on the right.
export const frameToAngleDeg = (frame) => -90 + (frame / TICK_COUNT) * 360;

export function tickMarks() {
  const out = [];
  for (let i = 0; i < TICK_COUNT; i++) {
    const major = i % MAJOR_EVERY === 0;
    const angleDeg = frameToAngleDeg(i);
    const len = major ? MAJOR_LEN : MINOR_LEN;
    out.push({
      frame: i,
      angleDeg,
      major,
      inner: polar(RING_R - len, angleDeg),
      outer: polar(RING_R, angleDeg),
      // Two digits, timecode-style: these are frame counts, not seconds.
      label: major ? String(i).padStart(2, "0") : null,
      labelPos: major ? polar(LABEL_R, angleDeg) : null,
    });
  }
  return out;
}

// --- Playhead and the in/out range -----------------------------------------

// The in/out range is what makes this a timeline readout rather than a lens:
// the aperture's opening is the playhead's position *within this range*, so the
// iris is displaying a scrub position, not controlling exposure (BLUEPRINT.md
// §9.1, refinement 3).
export const IN_POINT = 0.12;
export const OUT_POINT = 0.78;

export const progressToAngleDeg = (p) => -90 + clamp(p, 0, 1) * 360;

export const openFromProgress = (p) =>
  clamp((clamp(p, 0, 1) - IN_POINT) / (OUT_POINT - IN_POINT), 0, 1);

export function playheadMark(progress) {
  const angleDeg = progressToAngleDeg(progress);
  return {
    angleDeg,
    inner: polar(RING_R - MAJOR_LEN - 0.03, angleDeg),
    outer: polar(RING_R + 0.045, angleDeg),
  };
}

// In/out brackets: an L-shaped tick at each end of the range, pointing inward
// at the span they enclose — the same convention a timeline's in/out handles
// use, which is why they point at each other rather than being plain ticks.
export function rangeBrackets() {
  return [IN_POINT, OUT_POINT].map((p, idx) => {
    const angleDeg = progressToAngleDeg(p);
    const inward = idx === 0 ? 1 : -1;
    return {
      point: p,
      angleDeg,
      stem: [polar(RING_R - 0.02, angleDeg), polar(RING_R + 0.075, angleDeg)],
      flag: [
        polar(RING_R + 0.075, angleDeg),
        polar(RING_R + 0.075, angleDeg + inward * 5.5),
      ],
    };
  });
}

// --- Footage cells ----------------------------------------------------------

// One video file, six cells, one decode. The production asset is a 3x2 grid
// composite of six moments of the reel (BLUEPRINT.md §9.1 "Asset requirement");
// until it exists the same cells sample an ordinary clip, which reads as six
// crops of one frame rather than six moments.
export const GRID_COLS = 3;
export const GRID_ROWS = 2;

export function uvCell(i) {
  const col = i % GRID_COLS;
  // Texture V runs bottom-up while the grid reads top-down, so row 0 of the
  // composite is the TOP row of the image and therefore the highest V.
  const row = Math.floor(i / GRID_COLS);
  const w = 1 / GRID_COLS;
  const h = 1 / GRID_ROWS;
  return { x: col * w, y: 1 - h - row * h, w, h };
}

// --- SVG helpers ------------------------------------------------------------

// Shared by both SVG states so the reduced and minimal marks are built from the
// same numbers as the 3D one, not redrawn by eye.
export const toPath = (points, close = true) =>
  points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(4)} ${y.toFixed(4)}`)
    .join(" ") + (close ? " Z" : "");

export const bladeTransform = (i, openT) =>
  `rotate(${bladeBaseAngleDeg(i)}) rotate(${-bladeOpenDeg(i, openT)} ${bladePivot()[0].toFixed(
    4
  )} ${bladePivot()[1].toFixed(4)})`;

// --- Reduced (line-form) state — its own geometry ---------------------------
//
// Deliberately independent of everything above. The full state's blades are
// built against a larger disc than their housing so that its shader clip hides
// the rim gaps, and a shared constant change for that broke the reduced state's
// structure (only a couple of arcs survived). That reduced state now has its own
// values, its own outline builder and its own swing, so tuning one cannot move
// the other. Values were chosen by measuring the open-hole and rim coverage of
// the swing below, not by eye: swinging about the rim pivot in this direction
// opens a hole of 0.386 inside the housing with every blade vertex at or inside
// REDUCED.HOUSING_R (max radius 0.800), so the line-form never overflows its
// own rim and needs no clip.

export const REDUCED = {
  HOUSING_R: 0.8,
  BUILD_R: 0.8,
  BLADE_CIRCLE_R: 0.66,
  BLADE_CENTER_D: 0.6,
  MAX_OPEN_DEG: 30,
  OPEN_STAGGER: 0.05,
};

function reducedCrossAngleDeg() {
  const { BUILD_R, BLADE_CIRCLE_R, BLADE_CENTER_D } = REDUCED;
  const cosA =
    (BLADE_CENTER_D * BLADE_CENTER_D + BUILD_R * BUILD_R - BLADE_CIRCLE_R * BLADE_CIRCLE_R) /
    (2 * BLADE_CENTER_D * BUILD_R);
  return (Math.acos(clamp(cosA, -1, 1)) * 180) / Math.PI;
}

export function reducedBladeOutline(steps = 28) {
  const { BUILD_R, BLADE_CIRCLE_R, BLADE_CENTER_D } = REDUCED;
  const a = reducedCrossAngleDeg();
  const q1 = polar(BUILD_R, a);
  const q2 = polar(BUILD_R, -a);
  const centre = [BLADE_CENTER_D, 0];
  const outer = arcThrough(
    (-a * Math.PI) / 180,
    (a * Math.PI) / 180,
    0,
    steps,
    (rad) => [BUILD_R * Math.cos(rad), BUILD_R * Math.sin(rad)]
  );
  const f1 = Math.atan2(q1[1] - centre[1], q1[0] - centre[0]);
  const f2 = Math.atan2(q2[1] - centre[1], q2[0] - centre[0]);
  const inner = arcThrough(f1, f2, Math.PI, steps, (rad) => [
    centre[0] + BLADE_CIRCLE_R * Math.cos(rad),
    centre[1] + BLADE_CIRCLE_R * Math.sin(rad),
  ]);
  return [...outer, ...inner.slice(1, -1)];
}

export const reducedBladePivot = () => polar(REDUCED.BUILD_R, -reducedCrossAngleDeg());

export function reducedBladeOpenDeg(i, openT) {
  const span = 1 - (BLADE_COUNT - 1) * REDUCED.OPEN_STAGGER;
  const t = clamp((openT - i * REDUCED.OPEN_STAGGER) / span, 0, 1);
  return t * REDUCED.MAX_OPEN_DEG;
}

export function reducedBladeTransform(i, openT) {
  const [px, py] = reducedBladePivot();
  return `rotate(${bladeBaseAngleDeg(i)}) rotate(${-reducedBladeOpenDeg(i, openT)} ${px.toFixed(
    4
  )} ${py.toFixed(4)})`;
}

// --- Edit points -----------------------------------------------------------
//
// Six cut points spread across the in/out range, one per blade. The playhead
// crossing a cut point is what fills that blade, so scrubbing forward cuts the
// blades in one at a time and scrubbing back un-cuts them. This is what makes
// the aperture a readout of a scrub rather than an ambient rotation
// (BLUEPRINT.md §9.1, refinement 3): the blade ahead of the playhead is live
// and tracks the footage, the ones behind it hold the frame they were cut on.
export const bladeCutProgress = (i) =>
  IN_POINT + ((i + 1) * (OUT_POINT - IN_POINT)) / BLADE_COUNT;

// How many blades the playhead has already cut in at this progress.
export function cutCount(progress) {
  let n = 0;
  for (let i = 0; i < BLADE_COUNT; i++) if (progress >= bladeCutProgress(i)) n++;
  return n;
}

// Maps progress onto the clip's own timeline, clamped to the in/out range, so
// the playhead literally is the video's current time.
export const progressToMediaTime = (progress, duration) => {
  if (!duration) return 0;
  const span = OUT_POINT - IN_POINT;
  const t = (clamp(progress, IN_POINT, OUT_POINT) - IN_POINT) / span;
  return t * duration;
};
