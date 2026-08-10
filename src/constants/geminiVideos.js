// Stage 2 (refined) — an editorial/news-globe media collage across the
// Gemini star's surface, not one giant video per face. Each entry drives
// BOTH the geometry split (src/lib/starVideoRegions.js reads face/angle
// fields to carve the matching triangles out of the mesh) and the video
// content (src) — one array, so the two can't drift out of sync.
//
// The split follows the star's own 4-fold symmetry (points at 0/90/180/270
// degrees around local Z, confirmed by decoding the raw vertex buffer):
//
// - front: 4 quadrants (90 degrees each), one per point, so the whole
//   visible-at-rest face is covered edge to edge with no gaps.
// - back: 2 halves (180 degrees each) — only 2 of the 6 usable landscape
//   clips were left after front claimed 4, and a coarser split reads more
//   intentional than forcing a 4-way division onto 2 clips repeated twice.
// - side (bevel wall) panels were tried and removed — see PROJECT_STATUS.md.
//   Measured directly: the wall's Z-extent near a tip is already ~98% of the
//   model's entire thickness at any angular window tried, so there was no
//   more width to claim, and area topped out well short of "the whole
//   visible profile" because much of what reads as "the side" at an oblique
//   angle is optically foreshortened front/back surface — off-limits to
//   touch. The star is simply too thin (0.26 units) relative to its ~1.9-
//   unit span for a video panel on its bevel wall to ever read as full-face
//   coverage. The sides are plain glass now.
//
// Clip inventory (ffprobe'd directly, not assumed): work-01/03/05/06/10/11
// are landscape and used above; work-02/04/07/08/09 are portrait and were
// only ever candidates for the now-removed side panels.
export const GEMINI_VIDEO_SLOTS = [
  // Front quadrants — one per star point, full coverage.
  {
    id: "front-0",
    face: "front",
    angleCenterDeg: 0,
    angleHalfWidthDeg: 45,
    src: "/videos/optimized/work-11.mp4", // cyberpunk aerial city
  },
  {
    id: "front-1",
    face: "front",
    angleCenterDeg: 90,
    angleHalfWidthDeg: 45,
    src: "/videos/optimized/work-06.mp4", // music production / synth panel
  },
  {
    id: "front-2",
    face: "front",
    angleCenterDeg: 180,
    angleHalfWidthDeg: 45,
    src: "/videos/optimized/work-03.mp4", // "SYNTH KEYS" motion graphics
  },
  {
    id: "front-3",
    face: "front",
    angleCenterDeg: 270,
    angleHalfWidthDeg: 45,
    src: "/videos/optimized/work-10.mp4", // gameplay / crafting UI
  },
  // Back halves — the 2 remaining landscape clips, coarser split.
  {
    id: "back-0",
    face: "back",
    angleCenterDeg: 0,
    angleHalfWidthDeg: 90,
    src: "/videos/optimized/work-01.mp4", // talking-head reaction edit
  },
  {
    id: "back-1",
    face: "back",
    angleCenterDeg: 180,
    angleHalfWidthDeg: 90,
    src: "/videos/optimized/work-05.mp4", // product/craft close-up
  },
];
