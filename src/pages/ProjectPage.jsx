import { Link, useParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import ReactLenis from "lenis/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useMediaQuery } from "react-responsive";
import { projects } from "../constants";
import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
import { AnimatedTextLines } from "../components/AnimatedTextLines";
import Marquee from "../components/Marquee";
import ThemeToggle from "../components/ThemeToggle";
import { isVideo } from "../lib/media";
import { EASE, DURATION, SCROLL_REVEAL_START } from "../lib/motion";
import { useLenisScrollSync } from "../lib/useLenisScrollSync";
import { ReelIntro } from "../components/reel/ReelIntro";
import { BentoSection } from "../components/beu/BentoSection";

// Third art-direction pass. The first two rounds treated each case-study
// section as its own centred (or asymmetric-but-still-boxed) container —
// still fundamentally "documentation with nice typography," per direct
// feedback. The structural fix: Hero.jsx, About.jsx, and Services.jsx
// never wrap their content in a centred max-w-Nxl mx-auto box. They use
// px-10 as a gutter and nothing else — AnimatedHeaderSection's own
// banner-text-responsive title IS the composition. This pass reuses
// AnimatedHeaderSection itself for every chapter opener (Challenge/
// Approach/Craft/Result), the same component and scale Hero/About/
// Services/Contact already use for every one of their own frame
// entrances, rather than approximating it with text-4xl/5xl. That also
// means every chapter transition now runs through the exact same
// mechanism as a home-page frame transition, which is the more direct
// answer to "sections should feel like one journey" than a bespoke
// scrub effect layered on top ever could be (kept anyway, additively).

// Gallery card + image treatment, shared by the featured frame and every
// strip item so the two can never drift apart.
//
// The card and the image move on deliberately different clocks: the card
// lifts and its shadow deepens over 700ms, the image drifts to 1.06 over
// 1200ms. That mismatch is what reads as depth — the image appears to sit
// behind the frame and lag it slightly, rather than the whole tile scaling
// as one flat object. Scale is 1.06, not 1.10: at this frame size a larger
// figure reads as a zoom effect instead of a settle.
//
// Both use the site's cinematic curve, and the shadow transitions rather
// than appearing instantly. focus-within mirrors the hover treatment so
// keyboard traversal gets the same affordance as a pointer.
const GALLERY_CARD =
  "group overflow-hidden rounded-lg border border-[var(--color-border)] shadow-lg " +
  "transition-[border-color,box-shadow,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] " +
  "hover:-translate-y-1.5 hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-lift)] " +
  "focus-within:-translate-y-1.5 focus-within:border-[var(--color-accent)]";
const GALLERY_IMG =
  "object-cover w-full h-full transition-transform duration-[1200ms] " +
  "ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] group-focus-within:scale-[1.06]";
// EditorWorkRow's own media treatment — GALLERY_IMG plus a modest hover/
// focus blur (task: "video interaction should be more obvious"). A separate
// constant rather than appending classes to GALLERY_IMG: both set
// transition-property, and two utility classes fighting over the same CSS
// property depend on generated-stylesheet order, not className string
// order — fragile. Written out in full instead so it's self-contained.
// Blur stays modest (2px) so the footage is still recognizable, not
// abstracted, per the brief.
const EDITORIAL_MEDIA_IMG =
  "object-cover w-full h-full transition-[transform,filter] duration-[1200ms] " +
  "ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] group-hover:blur-[2px] " +
  "group-focus-within:scale-[1.06] group-focus-within:blur-[2px]";

// Gallery item media + caption — shared by the featured frame and every
// strip item so the two can't drift out of sync now that both need the
// same href-wrap and video-ref logic. `videoRef` is only attached when the
// item renders as a video; the IntersectionObserver in ProjectPage uses it
// for viewport-gated play/pause (see the effect below `galleryVideoRefs`).
// No `autoPlay` attribute here deliberately — that gate is what decides
// when playback starts, not the browser on mount.
//
// `item.href`, when present, wraps the media + caption in a single link
// rather than just the image/video: `className="contents"` keeps the
// anchor from adding a layout box of its own, so it renders identically to
// the unlinked case with one link covering the whole visible card. The
// accessible name comes from an explicit `aria-label` (alt, falling back
// to caption) rather than relying on computed text content, since a video
// has none of its own.
const GalleryItemBody = ({ item, index, videoRef }) => {
  // A link-out item (href, no locally-hosted src — e.g. an external source
  // this project deliberately doesn't rehost) has nothing to branch isVideo()
  // on. Its `poster` is a real extracted still, not a placeholder, so it
  // renders as the static image in that case rather than an <img> with an
  // undefined src.
  const media = !item.src ? (
    <img
      src={item.poster}
      alt={item.alt}
      loading="lazy"
      className={GALLERY_IMG}
    />
  ) : isVideo(item.src) ? (
    <video
      ref={videoRef}
      src={item.src}
      poster={item.poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={item.alt}
      className={GALLERY_IMG}
    />
  ) : (
    <img
      src={item.src}
      alt={item.alt}
      loading="lazy"
      className={GALLERY_IMG}
    />
  );

  const caption = (
    <figcaption className="flex items-center gap-3 px-4 py-3 text-xs tracking-wider uppercase text-[var(--color-text-tertiary)]">
      <span className="text-ink/30">{String(index + 1).padStart(2, "0")}</span>
      {item.caption}
    </figcaption>
  );

  if (!item.href) {
    return (
      <>
        <div className="overflow-hidden aspect-video">{media}</div>
        {caption}
      </>
    );
  }

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={item.alt || item.caption}
      className="contents"
    >
      <div className="overflow-hidden aspect-video">{media}</div>
      {caption}
    </a>
  );
};

// Editor Portfolio's editorial gallery row — one large case-study moment per
// work, media alternating sides by index parity, used only when a project's
// caseStudy.craft.galleryLayout is "editorial" (currently: Editor Portfolio
// only; MediHelp's craft.gallery has no such key and keeps the strip above
// unchanged). Reuses GALLERY_CARD/GALLERY_IMG/isVideo verbatim so hover-lift,
// scale, and the video/image/href branching can't drift from the strip's own
// version. `rowRef`/`videoRef` register into the SAME galleryRefs/
// galleryVideoRefs arrays the page's existing clip-path reveal (useGSAP,
// above) and viewport-gated playback (IntersectionObserver, above) already
// read — both effects operate generically on those ref arrays regardless of
// DOM shape, so this new layout inherits both without either effect
// changing.
//
// Play indicator: a decorative, aria-hidden circle over the media (mirrors
// ThemeToggle's own backdrop-blur circle-button treatment, just
// non-interactive) — never a real control of its own, so it can't create a
// nested-interactive-control violation. The one real interactive element per
// item is the <a> (href items) or the <video> itself (local items, already
// carrying aria-label); the badge adds no second accessible name.
// The gallery's own array position (index) is NOT the work's real number —
// data order is 01, 02, 10, 07, 05, 08 (see constants/index.js's own
// comment on why), so `index + 1` would mislabel every item from the third
// on (e.g. the CaseOh piece, actually work-10, reading as "Work 03").
// Pulled from the filename itself (src for local items, poster for
// href/link-out items — both are named work-<NN>-... consistently), so the
// label can never drift from the asset it's naming.
const workNumberOf = (item, index) => {
  const match = (item.src || item.poster || "").match(/work-(\d+)/);
  return match ? match[1] : String(index + 1).padStart(2, "0");
};

const EditorWorkRow = ({ item, index, mediaSide, videoRef }) => {
  const containerRef = useRef(null);
  // Two separate wrapper refs, not one, though both only ever hold a
  // transform: GSAP's transform cache snapshots an element's OTHER
  // transform components (e.g. x) the moment a tween targeting a
  // DIFFERENT component (e.g. scale) is created, then keeps re-applying
  // that stale snapshot on every render — which for a scrub tween is every
  // scroll tick. Two tweens on the same element fighting over transform
  // (the entrance x tween below vs. the secondary-motion scale tween)
  // manifested as the entrance never visibly completing: scale kept
  // stomping x back to its pre-entrance value on the next scrub frame.
  // Splitting into nested wrappers — entranceRef (x, opacity) outside,
  // scaleRef (scale) inside — gives each tween its own element to own
  // exclusively, which is the actual fix (confirmed: without this split,
  // computed transform stayed frozen at the entrance's FROM value even
  // after ScrollTrigger reported the entrance timeline at progress 1).
  const entranceRef = useRef(null);
  const scaleRef = useRef(null);
  const textItemRefs = useRef([]);
  const pushTextRef = (el) => {
    if (el && !textItemRefs.current.includes(el)) textItemRefs.current.push(el);
  };
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Directional entrance, scoped to THIS row's own scroll position (not the
  // gallery container's) — media slides in from the side it's actually
  // placed on, text from the opposite side, so the alternating composition
  // reads as two objects converging rather than one effect repeated six
  // times. Transform+opacity together (never opacity alone), per the brief's
  // "physical, deliberate feel rather than a generic fade." Text staggers
  // internally (number -> title -> description -> meta) at a much shorter
  // offset than the tween's own duration, so it still lands as one cohesive
  // block rather than a line-by-line typewriter.
  //
  // Skipped outright under prefers-reduced-motion — same convention as the
  // Award sweep above (lib/motion.js's global duration:0 default doesn't
  // reach a tween that sets its own duration, so scroll-triggered entrances
  // need their own explicit guard).
  useGSAP(() => {
    if (!containerRef.current || reduceMotion) return;
    const distance = window.innerWidth < 768 ? 28 : 72;
    const mediaFromX = mediaSide === "left" ? -distance : distance;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: containerRef.current, start: SCROLL_REVEAL_START },
    });
    tl.from(entranceRef.current, {
      x: mediaFromX,
      opacity: 0,
      duration: 1.3,
      ease: EASE.cinematic,
    });
    tl.from(
      textItemRefs.current,
      {
        x: -mediaFromX,
        opacity: 0,
        duration: 1,
        stagger: 0.08,
        ease: EASE.cinematic,
      },
      "<0.15"
    );
  }, [mediaSide]);

  // Secondary motion layer: a restrained scale progression as the row
  // transits the viewport — About.jsx's own scrub technique (scale,
  // scrollTrigger-scrubbed, power1.inOut) reused verbatim rather than
  // inventing a parallax system, the same convention already applied to
  // mediaRef/resultRef/awardChapterRef above. Targets `scaleRef`, its own
  // dedicated wrapper — never entranceRef (see the comment on that ref for
  // why two transform tweens can't safely share one element), and never
  // GALLERY_CARD/GALLERY_IMG directly — both already carry their own CSS
  // hover transforms (hover-lift, hover-scale), and a GSAP inline
  // transform on the same element would fight the CSS transition on
  // hover/focus.
  useGSAP(() => {
    if (!containerRef.current || !scaleRef.current || reduceMotion) return;
    gsap.fromTo(
      scaleRef.current,
      { scale: 1.06 },
      {
        scale: 1,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  }, [mediaSide]);

  const media = !item.src ? (
    <img src={item.poster} alt={item.alt} loading="lazy" className={EDITORIAL_MEDIA_IMG} />
  ) : isVideo(item.src) ? (
    <video
      ref={videoRef}
      src={item.src}
      poster={item.poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={item.alt}
      className={EDITORIAL_MEDIA_IMG}
    />
  ) : (
    <img src={item.src} alt={item.alt} loading="lazy" className={EDITORIAL_MEDIA_IMG} />
  );

  // Hover/focus overlay: a modest darkening wash (contrast for the label),
  // the play circle growing from a subdued rest state into full prominence,
  // and a small PLAY label sliding/fading in beneath it. Every group-hover:
  // has a matching group-focus-within: so keyboard focus on the real
  // interactive element (the <a>, for href items) produces the same state —
  // this span itself stays aria-hidden and adds no accessible name of its
  // own; nothing here is a second interactive control.
  const playBadge = (
    <span
      aria-hidden="true"
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-black/0 transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-black/20 group-focus-within:bg-black/20"
    >
      <span className="flex items-center justify-center scale-95 rounded-full opacity-80 backdrop-blur-sm bg-[var(--color-surface-2)]/70 border border-[var(--color-border)] size-14 md:size-16 transition-[transform,opacity,background-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:opacity-100 group-hover:bg-[var(--color-accent-subtle)] group-focus-within:scale-110 group-focus-within:opacity-100">
        <Icon icon="mdi:play" className="ml-1 text-ink size-6 md:size-7" />
      </span>
      <span className="mt-3 text-[10px] font-medium tracking-[0.3em] uppercase text-ink opacity-0 translate-y-1 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-70 group-hover:translate-y-0 group-focus-within:opacity-70 group-focus-within:translate-y-0">
        Play
      </span>
    </span>
  );

  // Mixed source aspect ratios (constants/index.js's `orientation`, set from
  // each clip's own ffprobe'd dimensions): forcing a genuinely portrait clip
  // (work-02, work-07, work-08 — 720x1280/360x640 sources) into the same
  // 16:9 frame as the landscape pieces crops away most of the footage via
  // object-cover. Portrait items get their own 9:16 frame instead, so the
  // full shot survives rather than a cropped sliver of it.
  const isPortrait = item.orientation === "portrait";

  const mediaFrame = (
    <div className={`relative overflow-hidden ${isPortrait ? "aspect-[9/16]" : "aspect-video"}`}>
      {/* Hover/focus blur on the footage itself — modest (2px), so the frame
          stays recognizable rather than turning abstract; combined with the
          existing hover-scale (GALLERY_IMG) via the same transitioned
          property list rather than a second competing transition. */}
      {media}
      {playBadge}
    </div>
  );

  // A 9:16 frame at the same full column width the 16:9 frames use would
  // tower over its own row (nearly double the column's width in height) and
  // dwarf the text beside it. Capping the portrait frame's own width and
  // centering it keeps it reading as a deliberate "phone/vertical clip"
  // frame — proportioned like the footage actually is — rather than a
  // stretched slab; landscape items are untouched (no cap, same full-width
  // frame as before this change).
  const mediaBlock = item.href ? (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={item.alt || item.caption}
      className={`relative block ${GALLERY_CARD} ${
        isPortrait ? "mx-auto w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px]" : ""
      }`}
    >
      {mediaFrame}
    </a>
  ) : (
    <div
      className={`relative ${GALLERY_CARD} ${
        isPortrait ? "mx-auto w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px]" : ""
      }`}
    >
      {mediaFrame}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`flex flex-col gap-6 md:gap-16 md:items-center ${
        mediaSide === "right" ? "md:flex-row-reverse" : "md:flex-row"
      }`}
    >
      <div className="md:w-1/2">
        <div ref={entranceRef}>
          <div ref={scaleRef}>{mediaBlock}</div>
        </div>
      </div>
      <div className="md:w-1/2">
        <p
          ref={pushTextRef}
          className="text-xs tracking-[0.2em] uppercase text-[var(--color-accent)]"
        >
          Work {workNumberOf(item, index)}
        </p>
        <h3
          ref={pushTextRef}
          className="mt-3 text-2xl font-light text-ink md:text-3xl"
        >
          {item.alt}
        </h3>
        <p
          ref={pushTextRef}
          className="max-w-[60ch] mt-4 text-body-lg text-[var(--color-text-secondary)]"
        >
          {item.caption}
        </p>
        <p
          ref={pushTextRef}
          className="mt-4 text-xs tracking-wider uppercase text-[var(--color-text-tertiary)]"
        >
          {item.href ? "External link — opens on YouTube ↗" : "Local edit"}
        </p>
      </div>
    </div>
  );
};

const ProjectPage = () => {
  const { slug } = useParams();
  const project = projects.find((p) => p.slug === slug);
  // autoRaf: false on the <ReactLenis root> below — this drives that
  // instance's raf off GSAP's own ticker instead, the same sync mechanism
  // HomePage.jsx now uses (see useLenisScrollSync.js for why: an
  // unsynchronized Lenis was the actual cause of momentum reading as
  // "stops almost instantly" on this page's much heavier ScrollTrigger
  // scrub load).
  useLenisScrollSync();
  const metadataRef = useRef(null);
  const mediaRef = useRef(null);
  const headingRefs = useRef([]);
  const galleryContainerRef = useRef(null);
  const galleryStripRef = useRef(null);
  const galleryRefs = useRef([]);
  const galleryVideoRefs = useRef([]);
  const resultRef = useRef(null);
  const awardChapterRef = useRef(null);
  const sweepRefs = useRef([]);
  const pushHeadingRef = (el) => {
    if (el && !headingRefs.current.includes(el)) headingRefs.current.push(el);
  };

  // Chapter stack (Challenge → Approach → Craft), reusing Services.jsx's
  // Capabilities interaction exactly: it is plain CSS `position: sticky`
  // with a staggered `top`, an opaque background, and a top border — GSAP
  // never drives the stacking there, only the entrance reveals.
  //
  // Gate: a stuck chapter taller than the space below its sticky offset
  // puts its own lower content permanently out of reach — you can never
  // scroll to it, because the element stops moving. Measured worst cases
  // for the two pinned chapters: 810px from 1024px wide up, but they
  // reflow to 936px in the 768–1023px band, and to 1333px on mobile. So
  // this needs two queries, not one — the viewport height a stack
  // requires depends on the width it is at — and mobile is excluded
  // outright rather than shipping an interaction that hides content.
  // Below the gate the chapters simply render in normal document flow.
  // Thresholds are re-measured whenever chapter heights change, because a
  // stale gate silently clips content. Current worst cases, including the
  // 160px peek the pinned Approach carries: 881px from 1024px wide up, and
  // 1091px in the 768–1023px band (text reflows taller there). The narrow
  // gate moved 1030 -> 1120 when paragraph spacing was added — that change
  // grew Approach past the old threshold and would have clipped it.
  const canStackWide = useMediaQuery({ minWidth: 1024, minHeight: 900 });
  const canStackNarrow = useMediaQuery({
    minWidth: 768,
    maxWidth: 1023,
    minHeight: 1120,
  });
  const canStack = canStackWide || canStackNarrow;

  // Only the first two chapters pin. Craft is deliberately NOT sticky: at
  // ~2100px it is far taller than any viewport, so pinning it would bury
  // its own gallery. It scrolls normally *over* the pinned Approach —
  // which is exactly the requested "Craft scrolls upward and gradually
  // replaces it" — and because it is the last child of the stack wrapper,
  // the pins release as it ends. Nothing after Craft is affected.
  const stackClass = canStack ? "sticky" : "";
  // 10em (160px) per step, not a token sliver. Services.jsx's 5em step
  // fully reveals its card titles because its cards put their title ~24px
  // from the top; a chapter opener puts its title ~78px down even in
  // compact mode, and the title's own line box is 80px, so the peek has to
  // clear ~158px for the pinned chapter's title to still read above the
  // covering one. That layering — the previous chapter's giant title still
  // showing — is the whole point of the effect on the home page.
  const stackStyle = (index) =>
    canStack ? { top: index === 0 ? 0 : `${index * 10}em`, zIndex: index + 1 } : undefined;
  // Flush while stacking (the seam IS the transition); normal rhythm when
  // the stack is off.
  const chapterGap = canStack ? "" : "mt-32 md:mt-48";

  // The header (AnimatedHeaderSection) has its own built-in entrance. Below
  // it, metadata/media were rendering statically with no reveal at all —
  // reusing the site's existing curve/duration vocabulary here rather than
  // inventing a new one (§7: "the existing curves and durations... no new
  // easing curve is introduced"). Fires on mount, not on scroll: this is a
  // freshly-opened page, the same situation as Hero, not content scrolled
  // into view — a small delay lets it follow the header rather than
  // competing with it.
  useGSAP(() => {
    if (!metadataRef.current) return;

    // cinematicIntro projects (ReelIntro) render mediaRef's block, so that
    // half of this effect is skipped for them entirely (mediaRef.current is
    // null). metadataRef (role/year/stack) is NOT skipped — it renders
    // unconditionally, several viewports below ReelIntro's own
    // scroll-jacked section — so the mount-delay tween below (correct for
    // every other project, which opens directly into this content) would
    // finish while the row is still offscreen. Scroll-triggered instead,
    // using the same reveal curve/duration and the same trigger pattern the
    // heading pass below already uses.
    if (project.cinematicIntro) {
      gsap.from(metadataRef.current, {
        y: 40,
        opacity: 0,
        duration: DURATION.reveal,
        ease: EASE.cinematic,
        scrollTrigger: { trigger: metadataRef.current, start: SCROLL_REVEAL_START },
      });
      return;
    }

    const tl = gsap.timeline({ delay: 0.6 });
    tl.from(metadataRef.current, {
      y: 40,
      opacity: 0,
      duration: DURATION.reveal,
      ease: EASE.cinematic,
    });
    if (mediaRef.current) {
      tl.from(
        mediaRef.current,
        { y: 40, opacity: 0, duration: DURATION.reveal, ease: EASE.cinematic },
        "<+0.2"
      );

      // Subtle receding-depth cue as Media is scrolled past and Challenge
      // arrives — the same technique About.jsx uses on itself (scale 0.95,
      // scrubbed, power1.inOut): a continuous scrub effect, not a discrete
      // "reveal," so it sits outside the four canonical reveal curves the
      // same way About's own version does.
      gsap.to(mediaRef.current, {
        scale: 0.97,
        scrollTrigger: {
          trigger: mediaRef.current,
          start: "bottom 70%",
          end: "bottom 20%",
          scrub: true,
        },
        ease: "power1.inOut",
      });
    }
  }, [project]);

  // Remaining manual sub-headings (My Role / Where It Got Hard / Credits) —
  // the chapter openers themselves now go through AnimatedHeaderSection,
  // which has its own reveal, so they're not pushed here. Ported from
  // Services.jsx's own ref-array + forEach + per-element scrollTrigger
  // pattern, using the canonical reveal curve (EASE.cinematic /
  // DURATION.reveal) in place of Services' pre-token-system "circ.out".
  useGSAP(() => {
    headingRefs.current.filter(Boolean).forEach((el) => {
      gsap.from(el, {
        y: 60,
        opacity: 0,
        duration: DURATION.reveal,
        ease: EASE.cinematic,
        scrollTrigger: { trigger: el, start: SCROLL_REVEAL_START },
      });
    });
  }, [project]);

  // Gallery images wipe in like About.jsx's portrait (clipPath bottom-up),
  // staggered rather than one at a time — the same reveal grammar the home
  // page already uses for its one photograph, applied to a set of eight.
  //
  // Explicitly skipped for the editorial layout: EditorWorkRow drives its
  // own per-row directional entrance now (its own useGSAP, scoped to each
  // row's own scroll position), so this bulk container-level effect would
  // be a second, conflicting reveal on the same elements if it ran too.
  useGSAP(() => {
    if (project.caseStudy?.craft?.galleryLayout === "editorial") return;
    const gallery = galleryRefs.current.filter(Boolean);
    if (gallery.length === 0) return;
    gsap.set(gallery, {
      clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)",
    });
    gsap.to(gallery, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 1.4,
      stagger: 0.12,
      ease: EASE.cinematic,
      scrollTrigger: {
        trigger: galleryContainerRef.current,
        start: SCROLL_REVEAL_START,
      },
    });
  }, [project]);

  // Continuous-motion transitions — About.jsx's own technique (scale 0.97,
  // scrollTrigger-scrubbed, power1.inOut — outside the four canonical
  // reveal curves, same as About's version).
  //
  // Applied only to Result and the Award chapter now. Challenge and Craft
  // were dropped from this list when the chapter stack landed: the stack
  // IS their transition, and a scrub transform on a stacked chapter fights
  // it two ways — scaling a pinned element mid-pin reads as drift, and a
  // scaled covering chapter exposes the edges of the one it should be
  // covering (a transform also makes the element a containing block, which
  // is how `position: sticky` gets broken by accident).
  useGSAP(() => {
    [resultRef, awardChapterRef].forEach((ref) => {
      if (!ref.current) return;
      gsap.to(ref.current, {
        scale: 0.97,
        scrollTrigger: {
          trigger: ref.current,
          start: "bottom 70%",
          end: "bottom 20%",
          scrub: true,
        },
        ease: "power1.inOut",
      });
    });
  }, [project]);

  // Art direction: the page's two big statements drift horizontally as they
  // transit, borrowing ServiceSummary.jsx's signature technique verbatim —
  // scrubbed xPercent bounded by the element's own transit ("top 80%" to
  // "bottom top"), no easing curve, so it is tied to scroll position rather
  // than to time. Home uses 20–100 xPercent there because those are single
  // words with a whole screen to move across; these are sentences, so the
  // amplitude is 4 and reads as parallax rather than as a slide. Transform
  // only — it changes no layout height, so the chapter stack's height gate
  // is unaffected.
  useGSAP(() => {
    gsap.utils.toArray(".statement-drift").forEach((el) => {
      gsap.fromTo(
        el,
        { xPercent: 4 },
        {
          xPercent: -4,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    });
  }, [project]);

  // Award ambient light sweep. Fires when 45% of the Award chapter has
  // scrolled into view — ScrollTrigger's `"45% bottom"` means "the point
  // 45% down the trigger reaches the viewport bottom", which is literally
  // "45% of this section is visible", so the requested 40–50% window is
  // expressed exactly rather than approximated with a viewport percentage.
  //
  // Replays rather than firing once: `toggleActions` is ordered
  // [onEnter, onLeave, onEnterBack, onLeaveBack], so "restart none restart
  // none" re-runs the pair whenever the section is entered from above or
  // re-entered from below, and does nothing on the way out. Paired with an
  // explicit `end` so there is a boundary to leave and re-enter through —
  // without one there is no onEnterBack to replay from. Scrolling within
  // the section does not re-fire it; only actually leaving and returning
  // does, which is what keeps it feeling alive rather than twitchy.
  // fromTo (not set + to) so each replay starts from a known offset.
  //
  // EASE.connective is the one true ease-in-out in the canonical set
  // (0.65, 0, 0.35, 1) — the right curve for "no abrupt starts or stops"
  // and for weight. EASE.cinematic would be wrong here: it is a hard
  // ease-out that whips in and crawls out. EASE/DURATION.revelation stay
  // out entirely per PROJECT_PAGE_SYSTEM.md §7 (a project page is
  // evidence, not a Revelation moment).
  //
  // Skipped outright under prefers-reduced-motion: this is pure
  // atmosphere, and lib/motion.js's global `gsap.defaults({duration: 0})`
  // does not collapse tweens that set their own duration, as this one must.
  useGSAP(() => {
    const sweeps = sweepRefs.current.filter(Boolean);
    if (sweeps.length === 0 || !awardChapterRef.current) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    gsap.fromTo(
      sweeps,
      { xPercent: -160 },
      {
        xPercent: 340,
        duration: DURATION.reveal,
        stagger: 0.9,
        ease: EASE.connective,
        scrollTrigger: {
          trigger: awardChapterRef.current,
          start: "45% bottom",
          // "bottom center", not "bottom top". The Award chapter sits near
          // the end of the page: "bottom top" resolves to 6976px while the
          // document's maximum scroll is 6806px, so that boundary can never
          // be reached — onLeave would never fire, and without it there is
          // no onEnterBack to replay from. Measured, not assumed; the
          // replay was silently dead until this was traced.
          end: "bottom center",
          toggleActions: "restart none restart none",
        },
      }
    );
  }, [project]);

  // Screenshot showcase — horizontal scroll fix. A plain vertical mouse
  // wheel has no native effect on an overflow-x-auto container (only a
  // trackpad's real two-finger horizontal swipe, or touch drag, already
  // move it) — confirmed exactly this bug in review: the page scrolled
  // vertically straight past the gallery. Converting a vertical-dominant
  // wheel delta into horizontal scrollLeft is what makes plain desktop
  // mouse scrolling work. React's synthetic onWheel can't reliably
  // preventDefault here — React 17+ attaches wheel listeners passively at
  // the root for delegation, a documented limitation, not something a
  // handler prop can override — so this attaches a real, non-passive DOM
  // listener directly to the strip. At either scroll edge it deliberately
  // does nothing, handing off to normal page scroll rather than trapping
  // the visitor inside the gallery.
  useEffect(() => {
    const el = galleryStripRef.current;
    if (!el) return;

    // Momentum, via the same gsap.quickTo pattern Works.jsx already uses to
    // trail its cursor preview — an interpolated glide rather than a hard
    // per-event jump, so a wheel notch decelerates instead of stepping.
    const glide = gsap.quickTo(el, "scrollLeft", {
      duration: 0.5,
      ease: "power3.out",
    });
    let target = el.scrollLeft;

    // A swipe, drag, or snap settle moves the strip without going through
    // this handler, which would leave `target` stale and make the next
    // wheel notch jump backwards. Resync on any direct manipulation.
    const resync = () => {
      gsap.killTweensOf(el);
      target = el.scrollLeft;
    };

    const onWheel = (e) => {
      // A genuine trackpad horizontal gesture already scrolls this
      // natively and with better feel than anything re-implemented here.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      // deltaY is not always pixels. Firefox reports DOM_DELTA_LINE (~3
      // per notch) and some configurations DOM_DELTA_PAGE; treating those
      // as pixels is why a real mouse wheel moved the strip by 3px —
      // indistinguishable from not moving at all. Normalise to pixels.
      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 16;
      else if (e.deltaMode === 2) delta *= el.clientWidth;

      // Resync from the real position whenever the glide is not mid-flight,
      // so a swipe or any external scroll doesn't leave `target` stale and
      // make the next notch jump. Checking the quickTo's own tween rather
      // than gsap.isTweening(el): quickTo keeps a persistent tween on the
      // element, so isTweening stays true after it has finished and the
      // resync would never run.
      if (!glide.tween || !glide.tween.isActive()) target = el.scrollLeft;
      const max = Math.max(0, el.scrollWidth - el.clientWidth);
      target = Math.max(0, Math.min(max, target));
      const next = Math.max(0, Math.min(max, target + delta));

      // At either edge, leave the event alone so the page scrolls on
      // normally rather than trapping the visitor inside the gallery.
      // Compared with a tolerance, not for equality: scrollLeft can settle
      // on a fractional pixel, which left `next` a hair off `max` and kept
      // the gallery swallowing wheel events at the end of the strip.
      if (Math.abs(next - target) < 1) return;

      e.preventDefault();
      target = next;
      glide(target);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", resync, { passive: true });
    el.addEventListener("touchstart", resync, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", resync);
      el.removeEventListener("touchstart", resync);
      gsap.killTweensOf(el);
    };
  }, [project]);

  // Gallery video playback — viewport-gated. The strip mounts every item
  // at once, most of them off-screen horizontally rather than vertically —
  // nothing about a plain vertical-scroll check would catch that. Left
  // ungated, every video gallery item would buffer/decode simultaneously
  // regardless of visibility, a real jank/battery cost distinct from their
  // (small) file size. IntersectionObserver's default root is the page
  // viewport, and it already accounts for clipping from the strip's own
  // overflow-x-auto container, so no custom root wiring is needed here —
  // an item scrolled outside the strip's visible window correctly reports
  // as not intersecting even though the strip itself is on-screen
  // vertically. The hero video above (mediaRef) is untouched: one clip is
  // not a multiplied cost, and it keeps its original autoPlay attribute.
  useEffect(() => {
    const videos = galleryVideoRefs.current.filter(Boolean);
    if (videos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.play().catch(() => {});
          else entry.target.pause();
        });
      },
      // rootMargin gives playback a head start just before an item is
      // fully in view rather than waiting for the exact viewport edge;
      // threshold 0.25 avoids starting/stopping on a sliver of an item
      // just barely peeking in from the strip's scroll affordance edge.
      { rootMargin: "200px", threshold: 0.25 }
    );

    videos.forEach((video) => observer.observe(video));
    return () => observer.disconnect();
  }, [project]);

  // caseStudy is `{}` (truthy, no keys) once a project's row starts routing
  // here (Works.jsx §3 data-driven check) but before any section content is
  // written — check for actual content, not mere truthiness, so this stays
  // accurate instead of silently going quiet the moment the row switches over.
  const hasCaseStudyContent =
    project && project.caseStudy && Object.keys(project.caseStudy).length > 0;

  if (!project) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-6 px-10 text-center text-ink bg-[var(--color-bg-base)]">
        <p className="text-sm tracking-widest uppercase text-[var(--color-text-tertiary)]">
          404
        </p>
        <h1 className="text-3xl font-light">Project not found</h1>
        <Link
          to="/"
          className="text-sm uppercase tracking-widest text-[var(--color-accent)] transition-colors hover:text-ink"
        >
          Back to Works
        </Link>
      </main>
    );
  }

  // project.name follows a "Product - Qualifier" convention today (e.g.
  // "MediHelp - Award winning Solution"). Splitting it lets the big title
  // stay clean and puts the qualifier in the header's short line instead of
  // forcing the full outcome paragraph through that uppercase display slot —
  // both halves are still the project's own existing name, just in two
  // differently-weighted places rather than one oversized block.
  const [titleMain, titleQualifier] = project.name.split(" - ");
  const cs = project.caseStudy;

  return (
    // ReactLenis root — the same smooth-scroll instance HomePage.jsx mounts
    // (root=true), just also mounted here. Project pages previously
    // rendered with no Lenis at all, so a scroll-wheel mouse fell back to
    // native scroll: input stops, motion stops instantly. Only one of
    // HomePage/ProjectPage is ever mounted at a time (react-router renders
    // one matched route), so this is still a single Lenis instance, never
    // two competing ones. `root=true` renders its children directly with
    // no wrapper div, so it cannot interfere with the chapter stack's
    // `position: sticky` below.
    //
    // `autoRaf: false` — useLenisScrollSync() above takes over driving this
    // instance's raf from GSAP's own ticker instead of Lenis's default
    // independent loop; see that file for why an unsynchronized Lenis, not
    // the lerp value, was the actual cause of momentum reading as "stops
    // almost instantly" on this page's heavy ScrollTrigger scrub load.
    //
    // `lerp: 0.06` (Lenis's default, and what HomePage now also gets via
    // the same sync hook, is 0.1): lerp is how fast the visible scroll
    // position damps toward the wheel-accumulated target each frame — a
    // lower value means the catch-up takes longer, which is what
    // "continues moving noticeably farther after the wheel is released"
    // actually is. This page carries substantially more competing
    // ScrollTrigger scrub work than home (the chapter stack, the Bento
    // assembly, statement-drift, the award sweep), so it keeps a lower
    // value than home's default rather than an identical copy of it — home
    // is the floor this is measured against, not a value it has to match
    // exactly. Still a real eased curve, not an extreme value (Lenis's own
    // examples commonly run 0.05-0.1) — "more glide," not "no friction."
    <ReactLenis root options={{ autoRaf: false, lerp: 0.06 }}>
    {/* overflow-x-clip, not overflow-x-hidden: `hidden` makes this element a
        scroll container, which silently breaks `position: sticky` for every
        descendant — the chapter stack below would just never pin. `clip`
        gives the same horizontal-overflow protection without establishing a
        scroll container, so sticky keeps working. */}
    <main className="min-h-screen overflow-x-clip text-ink bg-[var(--color-bg-base)]">

      {/* §2: the origin tab is never lost (new-tab rule), so this is only
          for visitors who arrive directly — optional, not primary nav. */}
      <ThemeToggle className="top-4 right-10" />
      <div className="px-10 pt-10">
        <Link
          to="/"
          className="inline-block text-sm uppercase tracking-widest text-[var(--color-text-tertiary)] transition-colors hover:text-ink"
        >
          ← Back to Works
        </Link>
      </div>

      {/* Overview — required section. Fires on mount (withScrollTrigger
          false): the page opens already at the top with this in view, same
          situation as Hero on the homepage, not a "scroll into view" case.

          cinematicIntro projects (currently: Signature Reel) replace this
          entire header + outcome + Media sequence with ReelIntro — a
          homepage-Hero-styled, swapped-composition opening that itself
          establishes identity, carries a static 3D video constellation into
          a scroll-driven flythrough, and ends with the project's own hero
          media (the reel) arriving and enlarging — rather than the generic
          static header + framed clip every other project page uses. Every
          other project renders byte-identically to before this branch was
          added, since `project.cinematicIntro` is undefined for them. */}
      {project.cinematicIntro ? (
        <ReelIntro project={project} />
      ) : (
        <AnimatedHeaderSection
          subTitle="Case Study"
          title={titleMain}
          text={titleQualifier || ""}
          textColor="text-ink"
          withScrollTrigger={false}
          // The qualifier ("Award Winning Solution") is a highlighted
          // achievement, not routine header copy — see the gold-shimmer-text
          // utility in index.css for why this is the one place it's used.
          textClassName={titleQualifier ? "gold-shimmer-text" : ""}
        />
      )}

      {/* Metadata — role/year sit opposite the stack on desktop, stack
          beneath on mobile (§8's explicit rule). */}
      <div
        ref={metadataRef}
        className="flex flex-col gap-4 px-10 mt-10 md:flex-row md:items-center md:justify-between"
      >
        <div className="flex flex-wrap gap-4 text-xs tracking-wider uppercase text-[var(--color-text-tertiary)]">
          <span>{project.role}</span>
          <span>{project.year}</span>
        </div>
        <div className="flex flex-wrap uppercase gap-x-5 text-xs leading-loose tracking-wider">
          {project.stack.map((tech) => (
            <p key={tech} className="text-[var(--color-text-secondary)]">
              {tech}
            </p>
          ))}
        </div>
      </div>

      {/* The full outcome, at actual reading size — §8 designates
          --text-body-lg for case-study long-form, not the header's display
          type. AnimatedTextLines per §5's own component table ("staggered
          paragraph reveal"); a single unbroken string still gets the fade,
          just without a multi-line stagger since there's only one line.

          Skipped for cinematicIntro projects: signature-reel's own
          `outcome` is still the literal, self-labeled "Placeholder — ..."
          string (see src/constants/index.js and PROJECT_STATUS.md) —
          shipping visible "Placeholder —" copy on the live page reads as
          broken, not honest, so it's omitted here rather than displayed.
          The metadataRef block above (role/year/stack, real data) still
          renders unconditionally for every project, including this one. */}
      {!project.cinematicIntro && (
        <AnimatedTextLines
          text={project.outcome}
          className="max-w-[65ch] px-10 mt-10 space-y-5 text-body-lg text-[var(--color-text-secondary)]"
        />
      )}

      {/* Media — required section, the visual centrepiece (§1, §6). Framed
          rather than true edge-to-viewport bleed: this clip's own background
          is a light near-white, so an unframed full-bleed treatment would
          fight the page's dark theme instead of sitting inside it. */}
      {/* Art direction: this is the page's opening image, and it was sitting
          at max-w-5xl — about 40% of the viewport, reading as an embedded
          figure rather than a frame that owns the screen. Home's Hero owns
          its whole viewport; this now does the same, with real air above and
          below so it lands as a held shot instead of a thumbnail. The border
          treatment is unchanged: §6's framing decision was about this clip's
          light background fighting the dark theme, which is a question of
          the frame, not of scale.

          Skipped for cinematicIntro projects: ReelIntro's own MainReel
          renders the project's hero media itself (arriving small, then
          enlarging), so this generic static frame would be a redundant
          second copy of the same clip.

          Also skipped when project.hideHeroMedia is set (currently: Editor
          Portfolio) — that project's hero clip is the same file as
          caseStudy.craft.gallery[0], so this frame would be a duplicate
          standalone video ahead of the actual gallery rather than a real
          second piece of content. mediaRef stays null in that case, which
          the mount-animation effect above already guards on. */}
      {!project.cinematicIntro && !project.hideHeroMedia && (
        <div ref={mediaRef} className="px-10 mt-24 md:mt-40">
          <div className="max-w-7xl mx-auto overflow-hidden border-8 rounded-lg shadow-lg border-[var(--color-border)]">
            {isVideo(project.image) ? (
              <video
                src={project.image}
                poster={project.poster}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={`${project.name} preview`}
                className="object-cover w-full aspect-video"
              />
            ) : (
              <img
                src={project.image}
                alt={`${project.name} preview`}
                className="object-cover w-full aspect-video"
              />
            )}
          </div>
        </div>
      )}

      {/* BeU Delivery — scroll-driven bento assembly (src/components/beu/).
          Data-driven via project.beuBento (constants/index.js), rendered
          between ReelIntro/the Media block above and the shared chapter
          stack below — its own section, not part of the Craft chapter,
          since Craft's featured-frame/gallery layout is shared with
          MediHelp and this needed its own scroll-jacked real estate. */}
      {project.beuBento && <BentoSection />}

      {/* ============ CHAPTER STACK: Challenge → Approach → Craft ============
          One continuous sequence, not three sticky sections that happen to
          be adjacent. This wrapper is what bounds it: `position: sticky`
          releases at its containing block's bottom, so pinning Challenge
          and Approach inside a wrapper that ends with Craft means the whole
          effect is over the moment Craft ends — Result, Credits and Links
          below are in normal flow and cannot be reached by it.

          Mechanism is Services.jsx's Capabilities interaction verbatim:
          CSS sticky + staggered `top` + opaque background + top border.
          No GSAP pinning, no scroll hijacking, no new scrolling system. */}
      <div className={`relative ${canStack ? "mt-32 md:mt-48" : ""}`}>
        {/* ================= CHALLENGE ================= */}
        {/* §2 The Problem. Chapter opener runs through
            AnimatedHeaderSection itself — the same subTitle/title/text
            structure and banner-text-responsive scale Hero/About/Services/
            Contact each use for their own frame entrance. text=""
            deliberately: the case study's actual paragraph is genuine
            reading-length prose, not the short single-line Hero/About/
            Services pass through this slot, so it renders separately below
            at a size that stays readable, still offset right (not
            centred) beneath the title. */}
        {cs?.challenge && (
          <section
            className={`${stackClass} ${chapterGap} bg-[var(--color-bg-base)] ${
              canStack ? "border-t-2 border-ink/30 pb-12" : ""
            }`}
            style={stackStyle(0)}
          >
            <AnimatedHeaderSection
              subTitle="01 — The Problem"
              title="Challenge"
              text=""
              textColor="text-ink"
              withScrollTrigger={true}
              compact
            />
            <div className="px-10 mt-10 md:mt-16">
              <div className="flex justify-end">
                <AnimatedTextLines
                  text={cs.challenge.text}
                  className="statement-drift max-w-2xl font-light leading-snug tracking-wide text-right text-ink space-y-4 text-2xl md:text-3xl text-pretty"
                />
              </div>
            </div>
          </section>
        )}

        {/* ================= APPROACH ================= */}
        {/* §3 Research + §4 Design Process, §7 Challenges nested inside (no
            separate §4 slot exists for it — obstacles navigated are part of
            the thinking this section holds). Two body columns beneath the
            chapter title (text | card) rather than a label column + content
            column — closer to how About splits image/text or Services
            splits copy/list, both genuine home-page two-up patterns.

            Second in the stack: pins 2.5em below Challenge, so a sliver of
            Challenge stays visible above it as the stack edge — the same
            peek Services' staggered `top` produces. */}
        {cs?.approach && (
          <section
            className={`${stackClass} ${chapterGap} bg-[var(--color-bg-base)] ${
              canStack ? "border-t-2 border-ink/30 pb-12" : ""
            }`}
            style={stackStyle(1)}
          >
            <AnimatedHeaderSection
              subTitle="02 — The Process"
              title="Approach"
              text=""
              textColor="text-ink"
              withScrollTrigger={true}
              compact
            />
          <div className="grid grid-cols-1 gap-10 px-10 mt-10 md:mt-16 lg:grid-cols-2 lg:gap-16">
            <AnimatedTextLines
              text={cs.approach.text}
              className="space-y-5 text-body-lg text-[var(--color-text-secondary)]"
            />
            {/* An actual card, not a paragraph with a border: raised
                surface, icon badge, hover lift — the same hover language
                (duration-700, the site's cinematic bezier) already used on
                the gallery/award media below, so this reads as an
                interactive object even though nothing on it links
                anywhere. */}
            {cs.approach.challenges && (
              <div className="h-fit p-8 transition-all duration-700 border rounded-lg shadow-lg bg-[var(--color-surface-2)] border-[var(--color-border)] ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[var(--color-accent)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                <div className="flex items-center justify-center rounded-full size-12 bg-[var(--color-accent-subtle)]">
                  <Icon
                    icon="mdi:alert-circle-outline"
                    className="text-[var(--color-accent)] size-6"
                  />
                </div>
                <h3
                  ref={pushHeadingRef}
                  className="mt-5 text-sm tracking-[0.2em] uppercase text-[var(--color-accent)]"
                >
                  Where It Got Hard
                </h3>
                <AnimatedTextLines
                  text={cs.approach.challenges}
                  className="max-w-[60ch] mt-4 space-y-5 text-body-lg text-[var(--color-text-secondary)]"
                />
              </div>
            )}
            </div>
          </section>
        )}

        {/* ================= CRAFT ================= */}
        {/* §5 Development + §6 My Role, plus the gallery — the visual
            centrepiece (§1). Raised onto its own surface with the same
            giant-radius "chapter" language About/Services use where the
            page changes register.

            Closes the stack, and is deliberately NOT sticky. At ~2100px it
            is far taller than any viewport, and a pinned element taller
            than its own viewport buries its lower content — pinning this
            would make the gallery unreachable. In normal flow it simply
            scrolls up over the pinned Approach, which is the requested
            behaviour; `relative` gives it a stacking context so it paints
            above the pinned chapters (sticky elements are positioned and
            would otherwise paint over a static sibling), and being the
            wrapper's last child is what releases the pins as it ends. */}
        {cs?.craft && (
          <section
            className={`relative z-[3] ${chapterGap} bg-[var(--color-surface-1)] rounded-4xl`}
          >
            <div className="py-20 md:py-28">
            <AnimatedHeaderSection
              subTitle="03 — What Was Made"
              title="Craft"
              text=""
              textColor="text-ink"
              withScrollTrigger={true}
              compact
            />
            <div className="grid grid-cols-1 gap-10 px-10 mt-10 lg:grid-cols-2 lg:gap-16">
              {cs.craft.development && (
                <AnimatedTextLines
                  text={cs.craft.development}
                  className="space-y-5 text-body-lg text-[var(--color-text-secondary)]"
                />
              )}
              {cs.craft.myRole && (
                <div>
                  <h3
                    ref={pushHeadingRef}
                    className="text-sm tracking-[0.2em] uppercase text-ink/30"
                  >
                    My Role
                  </h3>
                  <AnimatedTextLines
                    text={cs.craft.myRole}
                    className="mt-4 space-y-5 text-body-lg text-[var(--color-text-secondary)]"
                  />
                </div>
              )}
            </div>

            {/* Gallery, third iteration — two concrete bugs fixed:

                1. Aspect ratio. Every source screenshot here is a genuine
                   1920×1080 capture (verified directly, not assumed) — 16:9
                   exactly. The previous pass forced the featured frame into
                   21:9 and the strip into 4:3, cropping real product
                   screenshots for no reason. aspect-video (16:9) on both
                   now matches the source exactly, so object-cover never
                   has anything to crop — the full image is what renders.

                2. Horizontal scroll. overflow-x-auto alone only responds to
                   a trackpad's real horizontal swipe or touch drag — a
                   plain mouse wheel has no native effect on it, which is
                   exactly the reported bug (page scrolls vertically, the
                   strip never moves). The onWheel-conversion effect above
                   (attached via galleryStripRef) fixes this: a
                   vertical-dominant wheel now drives scrollLeft directly,
                   while real trackpad horizontal gestures and mobile touch
                   swipe are left to their already-working native behavior,
                   and either scroll edge hands off to normal page scroll.

                Still no lightbox/carousel/zoom UI — nothing here passes
                UX_ARCHITECTURE_BLUEPRINT.md §6's three-purpose test for
                one; horizontal scroll is native overflow behavior, now
                actually reachable by every input method, not a widget.

                Quality note, left rather than hidden (explicit instruction
                from an earlier pass in this same milestone arc):
                features.webp and who-we-are.webp contain unedited template
                placeholder copy unrelated to MediHelp; find-doctor.webp and
                symptom-checker.webp show a Windows-activation watermark
                from the capture environment; the "Sign Up" tile's source
                file is named login.webp even though it shows the sign-up
                form — captioned by actual content here, not by filename.
                None of this is cropped, edited, or hidden in the images
                themselves. */}
            {cs.craft.gallery?.length > 0 && (
              <div ref={galleryContainerRef} className="mt-16">
                {cs.craft.galleryLayout === "editorial" ? (
                  /* Editorial layout (currently: Editor Portfolio only, via
                     caseStudy.craft.galleryLayout — see EditorWorkRow above).
                     One large row per work, media alternating sides by index
                     parity, instead of the featured-frame + horizontal-strip
                     layout below. galleryStripRef/the wheel-conversion effect
                     simply no-op here (their ref never attaches); the bulk
                     clip-path reveal effect below is explicitly skipped for
                     this layout (its own guard) since EditorWorkRow drives
                     its own per-row entrance now. galleryVideoRefs still
                     gets populated per row so viewport-gated playback keeps
                     working unchanged.
                     gap-24/md:gap-40 (up from gap-20/md:gap-32) — more
                     clearance under each card's hover shadow-lift (0 28px
                     72px) now that the secondary scale-progression motion
                     transiently enlarges the card as it transits, so the
                     shadow's effective reach needs a bit more room than the
                     static layout required. */
                  <div className="flex flex-col gap-24 px-10 md:gap-40">
                    {cs.craft.gallery.map((item, index) => (
                      <EditorWorkRow
                        key={item.src || item.href || item.caption}
                        item={item}
                        index={index}
                        mediaSide={index % 2 === 0 ? "left" : "right"}
                        videoRef={(el) => (galleryVideoRefs.current[index] = el)}
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Each item renders as <video> when its src extension is a
                        video type (isVideo(), shared with the hero-media block
                        above), <img> otherwise — same muted/loop treatment as
                        the hero clip, but gated (see the IntersectionObserver
                        effect above) rather than autoplaying unconditionally on
                        mount. An item can carry an optional `poster`, and an
                        optional `href` to link the whole card out to an
                        external source instead of/alongside local media — see
                        GalleryItemBody above. */}
                    {/* Featured frame — item 0 ("Hero"), full chapter width. */}
                    <figure
                      ref={(el) => (galleryRefs.current[0] = el)}
                      className={`relative mx-10 ${GALLERY_CARD}`}
                      style={{ width: "calc(100% - 5rem)" }}
                    >
                      <GalleryItemBody
                        item={cs.craft.gallery[0]}
                        index={0}
                        videoRef={(el) => (galleryVideoRefs.current[0] = el)}
                      />
                    </figure>

                    {/* Remaining seven, horizontal scroll-snap — large frames
                        (up to 480px) with the next one deliberately left
                        peeking at the edge as the scroll affordance. Breaks out
                        of the chapter's own gutter via -mx-10 so it can run to
                        the true edge, like the Result marquee does. Scrollbar
                        hidden via plain CSS (arbitrary-property/variant escape
                        hatches, not a new dependency) since the snap points and
                        the peeking edge are the actual affordance. */}
                    <div
                      ref={galleryStripRef}
                      // data-lenis-prevent: Lenis (now mounted on this page via
                      // ReactLenis root) does not look at event.defaultPrevented
                      // — it only skips a wheel event if the target's ancestor
                      // chain has this attribute (lenis.mjs's onVirtualScroll).
                      // Without it, the onWheel handler below still converts
                      // the notch to horizontal scrollLeft AND Lenis separately
                      // smooth-scrolls the page vertically for the same notch —
                      // this is what stops that double-scroll.
                      data-lenis-prevent
                      // No scroll-snap. It was the direct cause of the gallery
                      // "barely moving": snapping forces every rest position
                      // onto an item centre, so a full 100px wheel notch
                      // resolved to 24px and a 3px line-mode notch to nothing.
                      // Measured both mandatory and proximity — proximity still
                      // snapped, because the items sit ~504px apart so there is
                      // always a snap point in range. The momentum glide below
                      // is what supplies the settled feel now, and it lands
                      // where the visitor actually pointed.
                      className="flex gap-6 pb-2 mt-6 overflow-x-auto -mx-10 px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      {cs.craft.gallery.slice(1).map((item, i) => {
                        const index = i + 1;
                        return (
                          <figure
                            // A link-out item (§2, href with no local src) has
                            // no `src` to key on — fall through to href, then
                            // caption, so the key stays stable and unique.
                            key={item.src || item.href || item.caption}
                            ref={(el) => (galleryRefs.current[index] = el)}
                            className={`shrink-0 w-[78vw] sm:w-[420px] lg:w-[480px] ${GALLERY_CARD}`}
                          >
                            <GalleryItemBody
                              item={item}
                              index={index}
                              videoRef={(el) => (galleryVideoRefs.current[index] = el)}
                            />
                          </figure>
                        );
                      })}
                    </div>
                    <p className="px-10 mt-3 text-xs tracking-wider uppercase text-ink/30">
                      Scroll or swipe →
                    </p>
                  </>
                )}
              </div>
            )}
            </div>
          </section>
        )}
      </div>
      {/* ========== END CHAPTER STACK — normal flow resumes below ========== */}

      {/* ================= RESULT ================= */}
      {/* §9 Final Outcome + §8 Award, nested here per §9's own "(see §8)"
          cross-reference rather than inventing an 8th top-level section
          PROJECT_PAGE_SYSTEM.md §4 doesn't define. Same AnimatedHeaderSection
          chapter-opener treatment as Challenge/Approach/Craft — deliberately
          not mirrored to the opposite side: Hero/About/Services/Contact all
          put their own title in the same place via the same shared
          component, so uniform reuse is the more consistent choice than
          hand-rolling a flipped variant of a component built without one.
          Award is its own raised, brighter chapter (matching Craft's
          surface-1/rounded-4xl language) with a soft accent-subtle glow
          behind the trophy. Trophy + glow is a direct callback to the Works
          index row's own hover treatment for this exact project — the same
          brand vocabulary, not a new one. */}
      {cs?.result && (
        <section ref={resultRef} className="mt-32 md:mt-48">
          <AnimatedHeaderSection
            subTitle="04 — The Outcome"
            title="Result"
            text=""
            textColor="text-ink"
            withScrollTrigger={true}
            compact
          />
          <div className="px-10 mt-10 md:mt-16">
            <div className="flex justify-end">
              <AnimatedTextLines
                text={cs.result.text}
                className="statement-drift max-w-2xl font-light leading-snug tracking-wide text-right text-ink space-y-4 text-2xl md:text-3xl text-pretty"
              />
            </div>
          </div>

          {cs.result.award && (
            <div
              ref={awardChapterRef}
              // Art direction: the pause before the payoff. Home never cuts
              // straight from a content frame to its emotional peak — it
              // holds ContactSummary for ~1700px of almost-empty screen
              // before Contact arrives. This gap was 96/128px, which read as
              // "next section" rather than as anticipation. Widened so the
              // Result statement is allowed to finish and the screen empties
              // out before FIRST PLACE lands.
              className="relative mt-40 overflow-hidden md:mt-64 bg-[var(--color-surface-1)] rounded-4xl"
            >
              {/* Soft spotlight behind the trophy — existing
                  --color-accent-subtle token, not a new color. */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,var(--color-accent-subtle),transparent_60%)]"
              />
              {/* Two ambient light sweeps, behind everything (the content
                  blocks below are `relative`, so they always sit above
                  these). Purely decorative and aria-hidden. See the
                  award-light-sweep utility in index.css for the visual
                  treatment and the useGSAP block above for the timing. */}
              <div aria-hidden="true" className="absolute inset-0">
                <span
                  ref={(el) => (sweepRefs.current[0] = el)}
                  className="award-light-sweep"
                />
                <span
                  ref={(el) => (sweepRefs.current[1] = el)}
                  className="award-light-sweep"
                />
              </div>
              <div className="relative px-10 py-24 text-center md:py-32">
                <Icon
                  icon="mdi:trophy"
                  className="mx-auto size-14 md:size-16 text-[var(--color-accent)] animate-trophy-glow"
                />
                {/* "First Place" at contact-text-responsive — the exact
                    same utility ContactSummary.jsx uses for its own
                    big pull-quote statement on the home page, not an
                    approximation of it. Still the same fact the body copy
                    below already states; typographic weight, not new
                    content. */}
                <h3
                  ref={pushHeadingRef}
                  className="mt-6 font-light leading-none tracking-wide text-ink uppercase contact-text-responsive"
                >
                  First Place
                </h3>
                <p className="mt-6 text-sm tracking-[0.2em] uppercase text-[var(--color-accent)]">
                  AASTU Tech Fest 2025 Hackathon
                </p>
                <AnimatedTextLines
                  text={cs.result.award.text}
                  className="max-w-[60ch] mx-auto mt-6 space-y-5 text-body-lg text-[var(--color-text-secondary)]"
                />

                {/* Floating layered cards, not a flat 2-up grid — a slight
                    opposing tilt that settles flat on hover reads as a
                    physical object rather than a document scan. Sized to
                    match the gallery strip's own item width (480px) rather
                    than a separate scale, so the page's "large media" unit
                    stays consistent. md, not sm, for the row switch (and
                    the second card's offset) — this page's only other
                    responsive split is md:flex-row, and sm would put a
                    genuine tablet-width visitor in a multi-column-media/
                    single-column-text state this page has no other
                    precedent for. */}
                <div className="flex flex-col items-center justify-center max-w-5xl gap-10 mx-auto mt-14 md:flex-row md:gap-6">
                  <div className="w-full md:w-[480px] overflow-hidden transition-[transform,box-shadow,border-color] border rounded-lg shadow-lg -rotate-2 border-[var(--color-border)] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:rotate-0 hover:-translate-y-2 hover:shadow-[var(--shadow-lift)]">
                    <img
                      src={cs.result.award.certificate}
                      alt="AASTU Tech Fest 2025 Hackathon — First Place Winner's Prize certificate, awarded to MediHelp Plus"
                      loading="lazy"
                      className="object-cover w-full aspect-video"
                    />
                  </div>
                  <div className="w-full md:w-[480px] overflow-hidden transition-[transform,box-shadow,border-color] border rounded-lg shadow-lg rotate-2 border-[var(--color-border)] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] md:-mt-6 hover:rotate-0 hover:-translate-y-2 hover:shadow-[var(--shadow-lift)]">
                    <img
                      src={cs.result.award.ceremony}
                      alt="MediHelp team at the AASTU Tech Fest 2025 award ceremony"
                      loading="lazy"
                      className="object-cover w-full aspect-video"
                    />
                  </div>
                </div>
              </div>

              {/* One marquee beat, on this brighter surface rather than
                  back on base black — the same component and technique
                  Contact/ContactSummary already use, repeating the award's
                  own verified headline facts rather than inventing new
                  copy. No -mx-10 needed here: this chapter has no
                  horizontal padding at this level, so the marquee already
                  runs edge to edge. Five entries — Marquee's
                  horizontalLoop() needs the combined item width to
                  comfortably exceed the viewport or the loop shows a
                  visible empty gap before repeating (this was a real,
                  confirmed bug at 2 items — fixed and re-verified in an
                  earlier pass of this same milestone arc). Every home-page
                  usage (Contact.jsx, ContactSummary.jsx) uses 5 items for
                  the same reason. */}
              <div className="relative mt-16">
                <Marquee
                  items={[
                    "AASTU Tech Fest 2025",
                    "First Place",
                    "AASTU Tech Fest 2025",
                    "First Place",
                    "AASTU Tech Fest 2025",
                  ]}
                  className="text-ink/40 bg-transparent border-y border-[var(--color-border)]"
                />
              </div>
            </div>
          )}
        </section>
      )}

      {/* ================= CREDITS ================= */}
      {/* §5's team structure. Quiet, resolving register — Contact.jsx's own
          label/rule/value pattern (h2 label, thin white/30 divider, content
          beneath), reused verbatim, at the same px-10-gutter width Contact
          itself uses rather than a centred mx-auto box. Individual
          teammates beyond the creator's own role are never named in the
          case study — not invented here. */}
      {cs?.credits && (
        <section className="px-10 mt-32 md:mt-40">
          <h2
            ref={pushHeadingRef}
            className="text-xl font-light tracking-wide text-ink uppercase md:text-2xl"
          >
            Credits
          </h2>
          <div className="w-full h-px mt-4 bg-ink/30" />
          <AnimatedTextLines
            text={cs.credits.text}
            className="max-w-2xl mt-6 space-y-5 text-body-lg text-[var(--color-text-secondary)]"
          />
        </section>
      )}

      {/* This branch just says so rather than inventing depth content. */}
      {!hasCaseStudyContent && (
        <p className="max-w-5xl px-10 mx-auto mt-8 text-sm italic text-[var(--color-text-tertiary)]">
          Full case study not yet published.
        </p>
      )}

      {/* Links — terminal content per §4 (links leave, they don't lead —
          nothing content-bearing follows). Sized up to close the page with
          real weight rather than trailing off — matching the intent behind
          Contact's own closing register on the home page. The one thing
          that does follow is pure navigation, not content: a "Back to
          Home" CTA (below) for visitors who reach the bottom without their
          origin tab (§2's new-tab rule covers the Works-click case, not a
          visitor who arrived directly via search or a shared link). */}
      <div className="flex gap-10 px-10 py-24 mt-24 text-base tracking-widest uppercase md:py-32 md:text-lg">
        {project.liveHref && (
          <a
            href={project.liveHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-[var(--color-accent)] transition-colors hover:text-ink"
          >
            {/* MediHelp's own brand favicon (distinct mark from logo.png —
                see the case study's Media section) — a small, functional
                use: confirms which product the link leads to, the same job
                a browser tab favicon does. */}
            {project.caseStudy?.favicon && (
              <img
                src={project.caseStudy.favicon}
                alt=""
                aria-hidden="true"
                className="size-5"
              />
            )}
            Live ↗
          </a>
        )}
        {project.repoHref && (
          <a
            href={project.repoHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] transition-colors hover:text-ink"
          >
            Code ↗
          </a>
        )}
      </div>

      {/* Back to Home — an explicit end-of-case-study CTA, mirroring the
          top nav's Link/target/hover language but placed here as the
          case study's own closing beat for visitors who reach the bottom
          without their origin tab still open. */}
      <div className="flex justify-center px-10 pt-16 pb-24 border-t border-[var(--color-border)] md:pb-32">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-[var(--color-accent)] transition-colors hover:text-ink"
        >
          <Icon icon="lucide:arrow-left" className="size-4" />
          Back to Home
        </Link>
      </div>
    </main>
    </ReactLenis>
  );
};

export default ProjectPage;
