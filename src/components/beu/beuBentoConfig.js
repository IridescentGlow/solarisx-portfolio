// Fixed, hand-placed composition for the BeU Delivery bento assembly
// (BentoSection.jsx). Deliberately NOT runtime-random — same convention as
// reelConstellationConfig.js: "a deliberately designed composition,
// reproducible on every load," not Math.random() scatter.
//
// Third pass: every "slot" in the bento is a GROUP of one or more
// independently-animated LAYERS, not a single pre-composed screenshot.
// Two of the nine slots (fresh-hero, order-cart-track) genuinely need more
// than one layer — the woman and the tilted phone both bleed past their
// own card's nominal edges in the reference, and no single flattened crop
// of them can be pixel-clean (see the note above BEU_BENTO_GROUPS). The
// other seven slots are already correctly represented by one pre-composed
// asset each (verified against reference/*.png in the second pass), so
// they stay single-layer groups — decomposing something that already
// works would be reinvention, not refinement.
//
// ---------------------------------------------------------------------
// FIFTH PASS — the whole layout below is now DERIVED, not hand-nudged.
//
// Every `box` is generated from two things only: (a) one explicit grid
// (COL_W/GAP_X/ROW_TOP/GAP_Y below), measured off
// reference/full-bento-layout.png, and (b) each asset's own native pixel
// aspect ratio. That combination is what fixes both problems the fourth
// pass left behind:
//
//   * Uneven gaps. The fourth pass fixed clipped rounded corners by
//     WIDENING two cards until their box aspect matched their asset's —
//     which quietly ate the gaps beside them (cheese-burger -> special
//     pizza had collapsed to 13px where every other gap was 27px). The
//     correct move is the same aspect match applied to HEIGHT instead:
//     a card's slot in the grid is fixed, its height follows from its
//     asset. Same zero-crop guarantee, no effect on neighbours.
//
//   * Everything cropped by `cover`/`contain` letterboxing. `cover` on a
//     box whose aspect doesn't match its asset crops (rounded corners, the
//     order-cart-track phone's top half and its shadow); `contain` on the
//     same mismatch letterboxes DOWN instead (the filled FRESH wordmark
//     and all three buttons were rendering ~15-20% small). Deriving every
//     height from `width * assetH / assetW` makes both operations exact
//     no-ops, which is the only way "the asset's own rounded corner" and
//     "the type at its designed size" are both guaranteed.
//
// The grid itself is uniform by construction: four columns flush to both
// edges of the canvas with one shared horizontal gap, and one shared
// vertical gap. The reference's own gaps measure 27/27/34 across and
// 31-34 down (it was composed by eye); this normalises them to 29 and 31
// respectively, which is inside 4px of the reference everywhere — the
// composition is unchanged, the rhythm is now actually regular.
// ---------------------------------------------------------------------
//
// `proximityBox` (per group) is the group's overall footprint, used by
// every layer in that group for the cursor-distance calculation (brief,
// third pass, §8: "the proximity effect should operate on the appropriate
// logical object/group rather than forcing every tiny independent element
// to react individually") — so a hero made of four layers still leans
// toward the cursor as ONE object, not four independently-triggered ones.
//
// `scatter` is where a layer starts, expressed as an offset from its own
// final box (dxVw/dyVh in viewport units so the spread scales sensibly
// across screen sizes, rotDeg, scale). Fourth pass: origins are chosen to
// deliberately NOT correspond to each layer's own final quadrant — an
// element ending top-left starts far bottom-right, adjacent final
// neighbors (the two halves of order-cart-track, the two top cards)
// start from different, unrelated directions so their paths visibly
// converge rather than travel together — closer to pieces of an
// architectural model finding their positions in space than cards
// flying in from their own nearest edge.
//
// `window` is the [start, end] slice of the section's overall scroll
// progress (0-1) during which this layer travels from `scatter` to `box`.
//
// `idle` drives the continuous float (BentoObject's ticker) that runs both
// before assembly starts and, at SETTLED_IDLE_FACTOR amplitude, once a
// layer has settled. Fifth pass: these were far too subtle to read as
// motion at all (3-9px at 0.14-0.29 rad/s is a ~28 second cycle — about
// 1.5px of travel in the second a viewer actually spends looking), so the
// scattered field looked like a still image waiting for scroll rather
// than suspended pieces.
//
// What a viewer actually perceives is VELOCITY, not amplitude — amp x w.
// Amplitude alone is close to its ceiling here (past ~30px the scattered
// field starts reading as agitated rather than suspended, which §5
// explicitly rules out), so the increase is mostly in frequency: 12-30px
// at 0.8-1.6 rad/s, i.e. 4-8 second cycles, giving 16-48 px/s peak drift
// against the ~1.5 px/s this replaces. A 20px excursion spread over a 5
// second cycle still reads as floating, never as vibration. On top of
// that, a small multiplicative `ampScale` breath and a per-layer `dir`
// that reverses the elliptical orbit, so neighbouring pieces visibly
// counter-rotate instead of all drifting the same way. Speed/phase/dir
// are chosen per layer, never shared by accident.
//
// `fit` ("cover" | "contain") controls the layer's background-size. Every
// box below is aspect-exact against its asset, so both are lossless; the
// distinction only still matters as a safety net against sub-pixel
// rounding (`contain` can never clip type, `cover` can never leave a gap).
//
// `bgPosition: "top"` makes `cover` trim from the bottom edge only — used
// by the woman layer so any rounding slack is taken off her jeans rather
// than her hair.
//
// `decorative: true` marks a layer that shouldn't get its own
// role="img"/aria-label — used for background/pattern layers within a
// group so a screen reader hears one description per logical card (from
// the group's one non-decorative layer) instead of one per raw asset.

// Canvas the `box` percentages are measured against — full-bento-layout.png's
// own pixel dimensions. BentoSection sizes its container to this aspect
// ratio so the percentages place cards exactly as measured.
export const LAYOUT_ASPECT_W = 1496;
export const LAYOUT_ASPECT_H = 968;

export const BEU_BENTO_MAX_WIDTH_PX = 1400;

const CARD = "/assets/projects/beu-delivery";

// The grid, in LAYOUT_ASPECT pixels. Four columns spanning the full canvas
// width with a single shared gap (the outer two cards are cut off by the
// canvas in the reference, exactly as they are here); one shared vertical
// gap; one shared top edge. Column 1 is 353 rather than 352 because
// cards/cheese-burger.png is natively 353x401 and is the one asset placed
// at 1:1 — rounding it to 352 would put a sub-pixel crop on the only card
// that needs none.
const COL_W = 352;
const COL1_W = 353;
const GAP_X = (LAYOUT_ASPECT_W - (COL1_W + 3 * COL_W)) / 3; // 29
const COL1 = 0;
const COL2 = COL1 + COL1_W + GAP_X; // 382
const COL3 = COL2 + COL_W + GAP_X; // 763
const COL4 = COL3 + COL_W + GAP_X; // 1144
const SPAN_W = COL_W * 2 + GAP_X; // 733 — hero and map each span two columns
const ROW_TOP = 130;
const GAP_Y = 31;

// px -> percentage of the layout canvas.
const px = (n, total) => (n / total) * 100;
const box = (left, top, width, height) => ({
  left: px(left, LAYOUT_ASPECT_W),
  top: px(top, LAYOUT_ASPECT_H),
  width: px(width, LAYOUT_ASPECT_W),
  height: px(height, LAYOUT_ASPECT_H),
});
// Height that makes `box` aspect-exact for an asset of nativeW x nativeH at
// the given width — the single rule that keeps `cover`/`contain` lossless.
const fitH = (width, nativeW, nativeH) => (width * nativeH) / nativeW;

// Row geometry, all derived from the grid + the assets' own aspects.
const H_PIZZA = fitH(COL_W, 951, 512); // 189.50
const H_TRACK = fitH(COL_W, 954, 512); // 188.92
const H_BURGER = fitH(COL1_W, 353, 401); // 401 (1:1)
const H_MENU = fitH(COL1_W, 444, 512); // 407.06
const H_CART = fitH(COL_W, 448, 512); // 402.29
const H_DISCOUNT = fitH(COL_W, 980, 512); // 183.87
const H_HERO = fitH(SPAN_W, 730, 398); // 399.64
const H_STROKE = fitH(SPAN_W, 731, 399); // 400.09
const H_RATINGS = fitH(COL_W, 959, 512); // 187.93
const H_MAP = fitH(SPAN_W, 2008, 512); // 186.90

const HERO_TOP = ROW_TOP + H_PIZZA + GAP_Y; // 350.51
const HERO_BOTTOM = HERO_TOP + H_HERO; // 750.15
const ROW_BOTTOM_TOP = HERO_BOTTOM + GAP_Y; // 781.15
const MENU_TOP = ROW_TOP + H_BURGER + GAP_Y; // 562
// The discount card is the one slot with slack: the cart card above it and
// the map row below it are both fixed, and its own aspect-exact height
// leaves ~65px to divide. Centring it splits that into two 32.5px gaps
// (vs. 31 everywhere else) rather than pushing a single 34px gap to one
// side, which is what the reference does and what read as uneven.
const DISCOUNT_TOP =
  ROW_TOP + H_CART + (ROW_BOTTOM_TOP - (ROW_TOP + H_CART) - H_DISCOUNT) / 2;

// order-cart-track's interior (the tilted phone, the three pills) is
// measured against that card's OWN export,
// reference/order-cart-track-rectangle-eight.png (601x539) — not the
// full-page composite, where the phone is partly occluded and the pills
// sit against neighbouring cards. In that file the orange rect occupies
// x 248..600, y 128..530; here the same rect is COL4..canvas-right,
// ROW_TOP..ROW_TOP+H_CART, so one scale + one translation carries every
// interior element across exactly.
const REF8_K =
  ((LAYOUT_ASPECT_W - COL4) / 353 + H_CART / 403) / 2; // ~0.9977
const fromRef8 = (x, y, w, h) =>
  box(
    COL4 + (x - 248) * REF8_K,
    ROW_TOP + (y - 128) * REF8_K,
    w * REF8_K,
    h * REF8_K
  );

// Second-pass note (kept for context, since it explains why fresh-hero and
// order-cart-track exist as groups at all): building those two as a single
// flattened crop out of full-bento-layout.png worked geometrically, but
// full-bento-layout.png is a FLATTENED composite (rasterized against a
// black canvas, not a true cutout) — its own antialiased/soft edges (the
// woman's hairline, the phone's drop shadow) are permanently blended
// toward black in that file. No amount of chroma-keying recovers real
// transparency there; it only ever produced a hard cutout with a faint
// dark halo/fringe clinging to the silhouette — which is the "black
// square/outline" artifact reported after the second pass. The project's
// own asset folders (hero/, phones/, rectangles/, text/, ui-buttons/)
// contain true per-layer cutouts with clean alpha (verified: every one of
// them has a real 0-255 alpha range, not a matted-to-black edge), so this
// pass rebuilds both groups from those instead — the artifact's actual
// source (a flattened raster used as if it had per-layer transparency),
// not a symptom to paper over with more z-index or another crop.

const CHEESE_BURGER_BOX = box(COL1, ROW_TOP, COL1_W, H_BURGER);
const PIZZA_BOX = box(COL2, ROW_TOP, COL_W, H_PIZZA);
const TRACK_BOX = box(COL3, ROW_TOP, COL_W, H_TRACK);
const CART_BOX = box(COL4, ROW_TOP, COL_W, H_CART);
const HERO_BOX = box(COL2, HERO_TOP, SPAN_W, H_HERO);
const DISCOUNT_BOX = box(COL4, DISCOUNT_TOP, COL_W, H_DISCOUNT);
const MENU_BOX = box(COL1, MENU_TOP, COL1_W, H_MENU);
const RATINGS_BOX = box(COL2, ROW_BOTTOM_TOP, COL_W, H_RATINGS);
const MAP_BOX = box(COL3, ROW_BOTTOM_TOP, SPAN_W, H_MAP);

// The four fresh-hero layers share one idle motion. They are the one group
// whose layers must stay in EXACT register with each other: the filled
// FRESH sits pixel-on-pixel over one row of the stroke pattern, the stroke
// pattern must stay inside the white card it's clipped to, and the woman's
// lower edge is flush with that card's bottom. Any independent drift there
// is a visible defect, not life — so they float as one object, and the
// per-layer variety §5 asks for comes from the other twelve layers (and,
// for this group, from their four different scatter approach paths).
const HERO_IDLE = {
  ampX: 16,
  ampY: 20,
  ampRot: 1.5,
  ampScale: 0.014,
  speed: 0.8,
  phase: 1.5,
  dir: 1,
};

export const BEU_BENTO_GROUPS = [
  {
    id: "cheese-burger",
    proximityBox: CHEESE_BURGER_BOX,
    layers: [
      {
        id: "cheese-burger",
        asset: `${CARD}/cards/cheese-burger.png`,
        alt: "Cheese Burger promotional card",
        box: CHEESE_BURGER_BOX,
        // Final position is top-left; starts far bottom-right instead —
        // deliberately not a mirror of its own final quadrant (fourth
        // pass §3: elements ending up together shouldn't start together,
        // and nothing should just fly in from its "own" edge).
        scatter: { dxVw: 46, dyVh: 38, rotDeg: -28, scale: 0.58 },
        window: [0.0, 0.5],
        zIndex: 10,
        idle: {
          ampX: 22,
          ampY: 26,
          ampRot: 2.2,
          ampScale: 0.018,
          speed: 1.05,
          phase: 0.0,
          dir: 1,
        },
      },
    ],
  },
  {
    id: "special-pizzas-phone",
    proximityBox: PIZZA_BOX,
    layers: [
      {
        id: "special-pizzas-phone",
        asset: `${CARD}/cards/special-pizzas-phone.png`,
        alt: "Special Pizzas phone screen card",
        box: PIZZA_BOX,
        // Rises from well below the fold rather than drifting in from a
        // nearby edge, crossing paths with order-cart-track-phone's own
        // diagonal descent through the same screen region.
        scatter: { dxVw: 18, dyVh: 52, rotDeg: 22, scale: 0.6 },
        window: [0.04, 0.54],
        zIndex: 11,
        idle: {
          ampX: 18,
          ampY: 22,
          ampRot: 2.6,
          ampScale: 0.022,
          speed: 1.3,
          phase: 0.9,
          dir: -1,
        },
      },
    ],
  },
  {
    id: "order-track-notification",
    proximityBox: TRACK_BOX,
    layers: [
      {
        id: "order-track-notification",
        asset: `${CARD}/cards/order-track-notification.png`,
        alt: "Restro Beast Restaurant order notifications card",
        box: TRACK_BOX,
        // Final position is top-right-of-center; travels in from the far
        // LEFT instead, sweeping most of the composition's width.
        scatter: { dxVw: -50, dyVh: 20, rotDeg: -20, scale: 0.62 },
        window: [0.06, 0.56],
        zIndex: 11,
        idle: {
          ampX: 20,
          ampY: 19,
          ampRot: 2.0,
          ampScale: 0.016,
          speed: 0.94,
          phase: 1.8,
          dir: 1,
        },
      },
    ],
  },
  {
    id: "order-cart-track",
    // Nominal card footprint (base rect), used for every layer's proximity
    // distance so the phone/buttons react together with the base as one
    // "object", even though the phone visually bleeds past it.
    proximityBox: CART_BOX,
    // Static, non-cinematic preview only (SimpleBentoGrid) — the clean
    // per-card master export, not the flattened composite.
    previewAsset: `${CARD}/reference/order-cart-track-rectangle-eight.png`,
    previewAlt: "Choose dish, add to cart, pay and track card",
    layers: [
      {
        id: "order-cart-track-base",
        asset: `${CARD}/rectangles/order-cart-track-ractangle-orange.png`,
        alt: "Choose dish, add to cart, pay and track card",
        box: CART_BOX,
        // Final position is far top-right; starts far bottom-left,
        // travelling the composition's full diagonal.
        scatter: { dxVw: -48, dyVh: 34, rotDeg: 24, scale: 0.58 },
        window: [0.11, 0.58],
        zIndex: 10,
        idle: {
          ampX: 21,
          ampY: 25,
          ampRot: 2.1,
          ampScale: 0.017,
          speed: 1.12,
          phase: 2.2,
          dir: -1,
        },
      },
      {
        id: "order-cart-track-phone",
        // The tilt is baked into this cutout's pixels, and it sits on a
        // 753x512 canvas with a lot of transparent margin — so the box has
        // to be the whole canvas, not the visible silhouette. Solved by
        // matching the asset's alpha mask against the card's own reference
        // export: it lands at scale 0.8 on that file's origin, IoU 0.996.
        // Previously this box was ~1.47:1 content inside a ~1.47:1... no:
        // inside a 38.5x26.2 (1.47 vs the box's own 2.24) frame, so `cover`
        // scaled to width and centred, slicing ~69px off the TOP and the
        // same off the BOTTOM — the missing upper half of the phone and
        // the clipped shadow reported this pass. Aspect-exact now.
        asset: `${CARD}/phones/phone-order-cart-track.png`,
        alt: "",
        decorative: true,
        box: fromRef8(0, 0, 753 * 0.8, 512 * 0.8),
        // Enters from far top-left — a different quadrant and a different
        // axis than order-cart-track-base's own bottom-left origin, so
        // the two halves of this card visibly converge from different
        // directions instead of arriving as one unit.
        scatter: { dxVw: -40, dyVh: -30, rotDeg: -30, scale: 0.5 },
        window: [0.14, 0.63],
        zIndex: 12,
        idle: {
          ampX: 26,
          ampY: 30,
          ampRot: 3.0,
          ampScale: 0.026,
          speed: 1.45,
          phase: 3.1,
          dir: 1,
        },
      },
      {
        id: "order-cart-track-choose-dish",
        // Each pill's white-capsule bounding box was measured in the card
        // reference and in the asset itself, giving one scale per button;
        // the box below is that scale applied to the asset's FULL canvas,
        // so the drop shadow outside the capsule is carried along too.
        asset: `${CARD}/ui-buttons/choose-dish-button-one.png`,
        alt: "",
        decorative: true,
        fit: "contain",
        box: fromRef8(314.2, 182.08, 285.74, 103.17),
        // Starts near the composition's own center with a large rotation
        // instead of a large translation — a small piece that tumbles
        // into place rather than travelling far.
        scatter: { dxVw: -14, dyVh: 36, rotDeg: 35, scale: 0.5 },
        window: [0.17, 0.66],
        zIndex: 13,
        idle: {
          ampX: 15,
          ampY: 17,
          ampRot: 2.8,
          ampScale: 0.024,
          speed: 1.6,
          phase: 4.0,
          dir: -1,
        },
      },
      {
        id: "order-cart-track-add-to-cart",
        asset: `${CARD}/ui-buttons/add-to-cart-button-two.png`,
        alt: "",
        decorative: true,
        fit: "contain",
        box: fromRef8(239.2, 317.08, 298.59, 103.16),
        // Drops in from well above the top of the composition.
        scatter: { dxVw: 6, dyVh: -42, rotDeg: -25, scale: 0.5 },
        window: [0.19, 0.68],
        zIndex: 13,
        idle: {
          ampX: 14,
          ampY: 19,
          ampRot: 2.5,
          ampScale: 0.022,
          speed: 1.4,
          phase: 4.6,
          dir: 1,
        },
      },
      {
        id: "order-cart-track-pay-and-track",
        asset: `${CARD}/ui-buttons/pay-and-track-button-three.png`,
        alt: "",
        decorative: true,
        fit: "contain",
        box: fromRef8(290.28, 441.1, 292.64, 97.17),
        // Sweeps in from the far left-bottom, crossing beneath the hero.
        scatter: { dxVw: -30, dyVh: 30, rotDeg: 28, scale: 0.5 },
        window: [0.21, 0.7],
        zIndex: 13,
        idle: {
          ampX: 16,
          ampY: 16,
          ampRot: 3.2,
          ampScale: 0.026,
          speed: 1.52,
          phase: 5.2,
          dir: -1,
        },
      },
    ],
  },
  {
    id: "fresh-hero",
    proximityBox: HERO_BOX,
    previewAsset: `${CARD}/reference/hero-fresh-rectangle-five.png`,
    previewAlt: "FRESH hero card",
    layers: [
      {
        id: "fresh-hero-rect",
        asset: `${CARD}/rectangles/hero-fresh-rectangle-white.svg`,
        alt: "",
        decorative: true,
        box: HERO_BOX,
        // The card's own base sheet arrives from far top-left, well
        // outside the composition, rather than drifting in from just
        // above its own final spot.
        scatter: { dxVw: -36, dyVh: -30, rotDeg: -18, scale: 0.55 },
        window: [0.15, 0.6],
        zIndex: 6,
        idle: HERO_IDLE,
      },
      {
        id: "fresh-hero-pattern",
        // fresh-stroke-group.svg is 731x399 against the card's own 730x398
        // — the same coordinate space, so it takes the hero box at its own
        // aspect and the five stroke rows land exactly where the card's
        // clip expects them.
        asset: `${CARD}/text/fresh-stroke-group.svg`,
        alt: "",
        decorative: true,
        box: box(COL2, HERO_TOP, SPAN_W, H_STROKE),
        // Approaches from the opposite corner (bottom-right) to the base
        // sheet's top-left origin, so the two visibly converge rather
        // than travelling together.
        scatter: { dxVw: 34, dyVh: 32, rotDeg: 20, scale: 0.6 },
        window: [0.16, 0.62],
        zIndex: 7,
        idle: HERO_IDLE,
      },
      {
        id: "fresh-hero-woman",
        // Solved from two landmarks rather than eyeballed: the top of her
        // hair (source y=157) sits at layout y=225 in the reference, and
        // the top of her waistband (source y=2022) at layout y=690 — one
        // scale (0.2493) and one offset that also reproduce her measured
        // hip width (214px) to within a pixel. Expressed here relative to
        // the hero card so she tracks the grid.
        //
        // Height is then trimmed to end exactly on the card's bottom edge
        // (with bgPosition "top", `cover` takes that ~1px off her jeans,
        // never her hair) — otherwise a hard-edged sliver of the source
        // photo's own bottom crop shows below the white card. Her top edge
        // is well above the card, which is what lets the hair overlap the
        // two cards on the row above; zIndex 12 puts it in FRONT of their
        // 11, per the fourth pass.
        asset: `${CARD}/hero/woman-looking-at-phone.png`,
        alt: "FRESH hero — woman smiling at her phone",
        bgPosition: "top",
        box: (() => {
          const k = SPAN_W / 730; // hero card scale vs. the reference's own
          const left = COL2 + (306.5 - 380) * k;
          const top = HERO_TOP + (185.9 - 349) * k;
          return box(left, top, 842.7 * k, HERO_BOTTOM - top);
        })(),
        // Rises from well below the viewport rather than a small nearby
        // offset — still restrained relative to the small decorative
        // pieces since she's the composition's visual anchor and needs
        // to read clearly throughout, not just at rest.
        scatter: { dxVw: -16, dyVh: 44, rotDeg: -9, scale: 0.6 },
        window: [0.18, 0.66],
        zIndex: 12,
        idle: HERO_IDLE,
      },
      {
        id: "fresh-hero-wordmark",
        // fresh.svg's glyphs are the SAME size as one row of
        // fresh-stroke-group.svg — its "F" is 22.5 x 100.5 in both files —
        // so this isn't an independently scaled word at all: the filled
        // FRESH is the middle stroke row (the mask at y=143, third of
        // five), filled in. Placing fresh.svg's origin at (101.1, 142.1)
        // in the stroke group's own coordinate space puts every letterform
        // exactly on its outline. Previously the box was 36 x 11.5 against
        // a 4.07:1 asset, so `contain` letterboxed it to ~86% and it read
        // as a smaller, separately-placed word floating near the strokes.
        asset: `${CARD}/text/fresh.svg`,
        alt: "",
        decorative: true,
        fit: "contain",
        box: (() => {
          const k = SPAN_W / 731; // the stroke group's own scale
          return box(COL2 + 101.1 * k, HERO_TOP + 142.1 * k, 529 * k, 130 * k);
        })(),
        // Stamps in from far off the right edge with a large tumble,
        // arriving last (§4: it settles after the woman is in place).
        scatter: { dxVw: 42, dyVh: -24, rotDeg: 26, scale: 0.55 },
        window: [0.22, 0.68],
        // Above the woman's 12 — the reference shows it stamped across her
        // torso, and raising her to beat the top row would otherwise hide
        // it behind her shirt.
        zIndex: 13,
        idle: HERO_IDLE,
      },
    ],
  },
  {
    id: "discount-30-off",
    proximityBox: DISCOUNT_BOX,
    layers: [
      {
        id: "discount-30-off",
        asset: `${CARD}/cards/discount-30-off.png`,
        alt: "30% off discount card",
        box: DISCOUNT_BOX,
        // Final position is far bottom-right; starts far top-left instead.
        scatter: { dxVw: -44, dyVh: -36, rotDeg: 22, scale: 0.6 },
        window: [0.08, 0.58],
        zIndex: 11,
        idle: {
          ampX: 19,
          ampY: 21,
          ampRot: 2.4,
          ampScale: 0.02,
          speed: 1.35,
          phase: 4.5,
          dir: 1,
        },
      },
    ],
  },
  {
    id: "special-menu",
    proximityBox: MENU_BOX,
    layers: [
      {
        id: "special-menu",
        asset: `${CARD}/cards/special-menu.png`,
        alt: "Special Menu list card",
        box: MENU_BOX,
        // Final position is far bottom-left; starts far top-right instead,
        // crossing the composition on the opposite diagonal from
        // discount-30-off's own path.
        scatter: { dxVw: 44, dyVh: -40, rotDeg: -24, scale: 0.58 },
        window: [0.02, 0.51],
        zIndex: 10,
        idle: {
          ampX: 23,
          ampY: 24,
          ampRot: 2.3,
          ampScale: 0.018,
          speed: 0.98,
          phase: 5.4,
          dir: -1,
        },
      },
    ],
  },
  {
    id: "ratings",
    proximityBox: RATINGS_BOX,
    layers: [
      {
        id: "ratings",
        asset: `${CARD}/cards/ratings.png`,
        alt: "Customer ratings card",
        box: RATINGS_BOX,
        // Sweeps in from the far right rather than rising from directly
        // below its own final spot.
        scatter: { dxVw: 48, dyVh: -10, rotDeg: 18, scale: 0.62 },
        window: [0.16, 0.64],
        zIndex: 11,
        idle: {
          ampX: 18,
          ampY: 20,
          ampRot: 2.2,
          ampScale: 0.019,
          speed: 1.25,
          phase: 0.4,
          dir: 1,
        },
      },
    ],
  },
  {
    id: "map",
    proximityBox: MAP_BOX,
    layers: [
      {
        id: "map",
        asset: `${CARD}/cards/map.png`,
        alt: "Map with delivery arrival estimate card",
        box: MAP_BOX,
        // Enters from far top-left, the composition's full diagonal away
        // from its own final bottom-right-of-center resting place.
        scatter: { dxVw: -52, dyVh: -24, rotDeg: -16, scale: 0.6 },
        window: [0.18, 0.7],
        zIndex: 11,
        idle: {
          ampX: 24,
          ampY: 18,
          ampRot: 1.8,
          ampScale: 0.015,
          speed: 1.02,
          phase: 1.3,
          dir: -1,
        },
      },
    ],
  },
];

// Extra scroll distance given to the assembly, beyond the one viewport the
// sticky container already occupies for free — shorter than ReelIntro's own
// 140vh transition (TRANSITION_VH in ReelIntro.jsx): this is a secondary
// set-piece inside the case study, not the page's primary establishing
// transition, so it earns a lighter scroll budget (brief §9: "not an
// excessively long scroll-jacked sequence").
//
// Every layer's `window` above ends at or before 0.72 (not 1.0) on purpose:
// the assembly used to run right up to the trigger's own end, so the
// composition only ever sat fully "settled" for the last instant before
// the sticky section released — no scroll position let a visitor actually
// park on the finished bento and use the proximity field. Ending the last
// window well before 1.0 leaves real scroll distance as a genuine held,
// assembled state — matching the brief's "post-assembly life" and "cursor
// interaction" being reachable beats, not a single frame.
export const BEU_ASSEMBLY_VH = 110;

// Fraction of full scatter-phase idle amplitude that survives once a layer
// has fully settled (progress === 1). Lowered from 0.32 alongside the much
// larger scatter-phase amplitudes above: 0.32 of a 26px float would put the
// settled composition 8px off its measured positions, which is exactly the
// grid precision the rest of this file exists to guarantee. 0.14 keeps the
// assembled bento within ~3px — visible as life, not as drift.
export const SETTLED_IDLE_FACTOR = 0.14;
