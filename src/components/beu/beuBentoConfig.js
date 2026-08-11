// Fixed, hand-placed composition for the BeU Delivery bento assembly
// (BentoSection.jsx). Deliberately NOT runtime-random — same convention as
// reelConstellationConfig.js: "a deliberately designed composition,
// reproducible on every load," not Math.random() scatter.
//
// `box` is each card's FINAL resting position, as percentages of the
// LAYOUT_ASPECT canvas (see below) — measured directly against
// public/assets/projects/beu-delivery/reference/full-bento-layout.png via a
// pixel grid overlay, so the assembled result reproduces that reference
// rather than approximating it.
//
// `scatter` is where a card starts, expressed as an offset from its own
// final box (dxVw/dyVh in viewport units so the spread scales sensibly
// across screen sizes, rotDeg, scale) — the compass direction and distance
// are chosen per card so the scatter reads as deliberate composition, not
// noise (brief: "deliberately chosen starting position... so the
// composition is identical every time").
//
// `window` is the [start, end] slice of the section's overall scroll
// progress (0-1) during which this card travels from `scatter` to `box`.
// Windows overlap and stagger on purpose, per brief §6: "Do not make every
// object arrive simultaneously."
//
// `idle` drives the small continuous float (BentoObject's ticker) that
// runs both before assembly starts and, at reduced amplitude, once a card
// has settled — deterministic per-card phase/speed so the field doesn't
// move in lockstep.

// Canvas the `box` percentages are measured against — full-bento-layout.png's
// own pixel dimensions. BentoSection sizes its container to this aspect
// ratio so the percentages place cards exactly as measured.
export const LAYOUT_ASPECT_W = 1496;
export const LAYOUT_ASPECT_H = 968;

export const BEU_BENTO_MAX_WIDTH_PX = 1400;

export const BEU_BENTO_OBJECTS = [
  {
    id: "cheese-burger",
    asset: "/assets/projects/beu-delivery/cards/cheese-burger.png",
    alt: "Cheese Burger promotional card",
    box: { left: 0, top: 13.43, width: 23.4, height: 41.12 },
    scatter: { dxVw: -24, dyVh: -16, rotDeg: -12, scale: 0.8 },
    window: [0.0, 0.62],
    zIndex: 10,
    idle: { ampX: 6, ampY: 8, ampRot: 1.1, speed: 0.22, phase: 0.0 },
  },
  {
    id: "special-pizzas-phone",
    asset: "/assets/projects/beu-delivery/cards/special-pizzas-phone.png",
    alt: "Special Pizzas phone screen card",
    box: { left: 24.6, top: 13.43, width: 24.4, height: 19.42 },
    scatter: { dxVw: -8, dyVh: -24, rotDeg: 9, scale: 0.85 },
    window: [0.05, 0.68],
    zIndex: 11,
    idle: { ampX: 5, ampY: 6, ampRot: 0.9, speed: 0.27, phase: 0.9 },
  },
  {
    id: "order-track-notification",
    asset:
      "/assets/projects/beu-delivery/cards/order-track-notification.png",
    alt: "Restro Beast Restaurant order notifications card",
    box: { left: 50.67, top: 13.43, width: 24.2, height: 19.42 },
    scatter: { dxVw: 7, dyVh: -26, rotDeg: -8, scale: 0.85 },
    window: [0.08, 0.7],
    zIndex: 11,
    idle: { ampX: 5, ampY: 6, ampRot: 0.9, speed: 0.19, phase: 1.8 },
  },
  {
    id: "order-cart-track",
    asset: "/assets/projects/beu-delivery/cards/order-cart-track.png",
    alt: "Choose dish, add to cart, pay and track card",
    box: { left: 75.6, top: 0, width: 24.4, height: 54.55 },
    scatter: { dxVw: 26, dyVh: -12, rotDeg: 13, scale: 0.78 },
    window: [0.14, 0.76],
    zIndex: 12,
    idle: { ampX: 7, ampY: 9, ampRot: 1.2, speed: 0.24, phase: 2.7 },
  },
  {
    id: "fresh-hero",
    asset: "/assets/projects/beu-delivery/cards/fresh-hero.png",
    alt: "FRESH hero card",
    box: { left: 25.27, top: 36.05, width: 48.8, height: 41.12 },
    scatter: { dxVw: 2, dyVh: 20, rotDeg: -5, scale: 0.72 },
    window: [0.18, 0.85],
    zIndex: 15,
    idle: { ampX: 4, ampY: 6, ampRot: 0.6, speed: 0.16, phase: 3.6 },
  },
  {
    id: "discount-30-off",
    asset: "/assets/projects/beu-delivery/cards/discount-30-off.png",
    alt: "30% off discount card",
    box: { left: 76.47, top: 58.16, width: 23.53, height: 19.01 },
    scatter: { dxVw: 28, dyVh: 6, rotDeg: 10, scale: 0.85 },
    window: [0.1, 0.72],
    zIndex: 11,
    idle: { ampX: 6, ampY: 5, ampRot: 1.0, speed: 0.29, phase: 4.5 },
  },
  {
    id: "special-menu",
    asset: "/assets/projects/beu-delivery/cards/special-menu.png",
    alt: "Special Menu list card",
    box: { left: 0, top: 58.16, width: 23.4, height: 41.84 },
    scatter: { dxVw: -26, dyVh: 12, rotDeg: -13, scale: 0.78 },
    window: [0.02, 0.64],
    zIndex: 10,
    idle: { ampX: 6, ampY: 7, ampRot: 1.1, speed: 0.2, phase: 5.4 },
  },
  {
    id: "ratings",
    asset: "/assets/projects/beu-delivery/cards/ratings.png",
    alt: "Customer ratings card",
    box: { left: 25.27, top: 80.58, width: 23.73, height: 19.42 },
    scatter: { dxVw: -5, dyVh: 24, rotDeg: 7, scale: 0.85 },
    window: [0.2, 0.8],
    zIndex: 11,
    idle: { ampX: 5, ampY: 6, ampRot: 0.9, speed: 0.25, phase: 0.4 },
  },
  {
    id: "map",
    asset: "/assets/projects/beu-delivery/cards/map.png",
    alt: "Map with delivery arrival estimate card",
    box: { left: 50.67, top: 80.58, width: 49.33, height: 19.42 },
    scatter: { dxVw: 22, dyVh: 18, rotDeg: -9, scale: 0.8 },
    window: [0.22, 0.88],
    zIndex: 11,
    idle: { ampX: 6, ampY: 5, ampRot: 0.8, speed: 0.21, phase: 1.3 },
  },
];

// Extra scroll distance given to the assembly, beyond the one viewport the
// sticky container already occupies for free — shorter than ReelIntro's own
// 140vh transition (TRANSITION_VH in ReelIntro.jsx): this is a secondary
// set-piece inside the case study, not the page's primary establishing
// transition, so it earns a lighter scroll budget (brief §9: "not an
// excessively long scroll-jacked sequence").
export const BEU_ASSEMBLY_VH = 110;

// Fraction of full scatter-phase idle amplitude that survives once a card
// has fully settled (progress === 1) — brief §8: "optional subtle floating
// can continue" but "must be extremely subtle."
export const SETTLED_IDLE_FACTOR = 0.32;
