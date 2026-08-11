// Fixed, hand-placed composition for the Signature Reel video constellation
// (VideoConstellation.jsx). Deliberately NOT runtime-random — brief §3: "a
// deliberately designed randomized composition... reproducible on every
// load." Positions/rotations are plain numbers, not derived from anything,
// so the arrangement is exactly this on every visit.
//
// `src` values reuse the exact same optimized clips already shipped for the
// homepage Gemini star (see src/constants/geminiVideos.js's
// GEMINI_VIDEO_SLOTS) — the brief's own "these videos are already present
// on the homepage" is true by construction, not coincidence, and no new
// encoding work was needed. `aspect` is each clip's real, ffprobe'd
// width/height (1280x720 for five of the six; work-11 is 1280x534) so
// panels are sized to their footage's own proportions rather than cropped
// or distorted.
//
// `from` is where a panel starts (off-screen, in the compass direction the
// brief's examples describe) and `to` is its settled resting position/
// rotation — VideoConstellation's entrance timeline tweens from -> to once
// on mount, then the panel sits fully static (no idle motion) until the
// scroll-driven flythrough (ReelIntro) takes over the same transform.
// Rotations are in radians.

const deg = (d) => (d * Math.PI) / 180;

export const DESKTOP_PANELS = [
  {
    id: "p1",
    src: "/videos/optimized/work-11.mp4",
    aspect: 1280 / 534,
    from: { x: -13, y: 1.1, z: -1.2, rx: 0, ry: deg(30), rz: 0 },
    to: { x: -2.6, y: 1.1, z: -1.2, rx: deg(-3), ry: deg(8), rz: deg(-4) },
  },
  {
    id: "p2",
    src: "/videos/optimized/work-06.mp4",
    aspect: 1280 / 720,
    from: { x: 9, y: 8, z: 0.4, rx: deg(-10), ry: deg(-20), rz: 0 },
    to: { x: 2.3, y: 1.6, z: 0.4, rx: deg(4), ry: deg(-10), rz: deg(3) },
  },
  {
    id: "p3",
    src: "/videos/optimized/work-03.mp4",
    aspect: 1280 / 720,
    from: { x: -1.0, y: -10, z: 0.9, rx: deg(20), ry: 0, rz: 0 },
    to: { x: -1.0, y: -1.7, z: 0.9, rx: deg(-6), ry: deg(5), rz: deg(2) },
  },
  {
    id: "p4",
    src: "/videos/optimized/work-10.mp4",
    aspect: 1280 / 720,
    from: { x: 13, y: -1.0, z: -0.6, rx: 0, ry: deg(-30), rz: 0 },
    to: { x: 3.0, y: -1.0, z: -0.6, rx: deg(2), ry: deg(-12), rz: deg(-3) },
  },
  {
    id: "p5",
    src: "/videos/optimized/work-01.mp4",
    aspect: 1280 / 720,
    from: { x: -9, y: 9, z: 1.6, rx: deg(-15), ry: deg(25), rz: 0 },
    to: { x: -3.0, y: -0.2, z: 1.6, rx: deg(-2), ry: deg(14), rz: deg(5) },
  },
  {
    id: "p6",
    src: "/videos/optimized/work-05.mp4",
    aspect: 1280 / 720,
    from: { x: 0.6, y: 2.1, z: -14, rx: 0, ry: 0, rz: deg(-10) },
    to: { x: 0.6, y: 2.1, z: -1.8, rx: deg(5), ry: deg(-6), rz: deg(-2) },
  },
];

// Mobile carries the same concept (scatter, fixed entrance directions, fast
// flythrough) at a reduced panel count — brief §16: simplify count/spacing
// rather than allowing clipping. Tighter x spread than desktop, since a
// portrait canvas is narrower than it is tall.
export const MOBILE_PANELS = [
  {
    id: "m1",
    src: "/videos/optimized/work-11.mp4",
    aspect: 1280 / 534,
    from: { x: -8, y: 1.0, z: -0.8, rx: 0, ry: deg(24), rz: 0 },
    to: { x: -1.0, y: 1.0, z: -0.8, rx: deg(-2), ry: deg(6), rz: deg(-3) },
  },
  {
    id: "m2",
    src: "/videos/optimized/work-06.mp4",
    aspect: 1280 / 720,
    from: { x: 1.0, y: 7, z: 0.5, rx: deg(-16), ry: 0, rz: 0 },
    to: { x: 1.0, y: -0.4, z: 0.5, rx: deg(3), ry: deg(-8), rz: deg(2) },
  },
  {
    id: "m3",
    src: "/videos/optimized/work-01.mp4",
    aspect: 1280 / 720,
    from: { x: 0.0, y: -8, z: 1.2, rx: deg(16), ry: 0, rz: 0 },
    to: { x: 0.0, y: -1.6, z: 1.2, rx: deg(-3), ry: deg(10), rz: deg(4) },
  },
];

// World-unit width every panel's plane is sized to before its own aspect
// divides down the height — one shared scale so the composition reads as
// one consistent set of "clips," not mismatched card sizes.
export const PANEL_WIDTH = 2.5;

// Camera shared by VideoConstellation's own Canvas — a plain forward-facing
// setup (not GeminiStar's off-axis rig), since this is a scattered field of
// flat planes, not one object under a fixed dramatic angle.
export const CONSTELLATION_CAMERA = {
  position: [0, 0, 9],
  fov: 32,
  near: 0.1,
  far: 60,
};
