import React from "react";
import { useRef } from "react";
import { AnimatedTextLines } from "../components/AnimatedTextLines";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { EASE, DURATION, SCROLL_REVEAL_START } from "../lib/motion";
const AnimatedHeaderSection = ({
  subTitle,
  title,
  text,
  textColor,
  withScrollTrigger = false,
  // Optional, empty by default — every existing caller (Hero, Works, About,
  // Services, Contact) is unaffected. Lets one consumer style just the
  // "text" line without touching this shared component for everyone else.
  textClassName = "",
  // Optional, off by default — same additive contract as textClassName, so
  // every existing caller renders byte-identically. Tightens only the
  // framing whitespace (top padding, subtitle/title gap, and the padding
  // around the "text" line), never the type scale itself.
  //
  // Exists for ProjectPage.jsx's stacked chapter openers, which pass
  // text="" and so would otherwise reserve ~128px for a line that renders
  // nothing. That dead space pushes the title 150px down from the section
  // top, which in a sticky stack means the pinned chapter's title cannot
  // fit in the peek above the covering chapter — the layering Services.jsx
  // gets for free, because its cards put their title ~24px from the top.
  compact = false,
  // Optional, "split" by default — same additive contract as the two props
  // above: every existing caller that omits it renders byte-identically,
  // including all nine of ProjectPage.jsx's chapter openers.
  //
  // Implements COMPOSITION_PRINCIPLES.md §2's per-frame rhythm, which was
  // specified but never built: until now this one component rendered every
  // homepage frame AND every project-page chapter through a single
  // composition, which is why the page read as five independent screens
  // rather than one directed sequence. See DESIGN_DIRECTION.md §3.
  //
  // The variants are deliberately structural, not three alignments of one
  // layout — the full-bleed rule is `split`'s signature and is inset in
  // `centered`, absent in `offset`. Sharing it would collapse them back
  // into looking like the same frame.
  layout = "split",
}) => {
  const contextRef = useRef(null);
  const headerRef = useRef(null);
  const shouldSplitTitle = title.includes(" ");
  const titleParts = shouldSplitTitle ? title.split(" ") : [title];

  const isCentered = layout === "centered";
  const isOffset = layout === "offset";
  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: withScrollTrigger
        ? {
            trigger: contextRef.current,
            start: SCROLL_REVEAL_START,
          }
        : undefined,
    });
    // The frame arriving is the handoff between frames — connective character,
    // quicker and quieter than an entrance (TRANSITION_PHILOSOPHY §2).
    tl.from(contextRef.current, {
      y: "50vh",
      duration: DURATION.transition,
      ease: EASE.connective,
    });
    // The header content appearing is an entrance, not a handoff — cinematic.
    //
    // Direction follows composition (DESIGN_DIRECTION.md §7, principle 3):
    // an offset frame is defined by which side of the page it occupies, so
    // it enters laterally from its own empty side; every other layout
    // settles vertically as before. Same curve, same duration, zero added
    // cost — the composition itself carries the variation.
    tl.from(
      headerRef.current,
      {
        opacity: 0,
        ...(isOffset ? { x: "-120" } : { y: "200" }),
        duration: DURATION.reveal,
        ease: EASE.cinematic,
      },
      "<+0.2"
    );
  }, []);
  return (
    <div ref={contextRef}>
      <div style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}>
        <div
          ref={headerRef}
          className={`flex flex-col justify-center ${
            compact ? "gap-4 pt-6 sm:gap-6" : "gap-12 pt-16 sm:gap-16"
          }`}
        >
          <p
            className={`text-sm font-light tracking-[0.5rem] uppercase px-10 ${textColor} ${
              // text-indent compensates the trailing 0.5rem of letter-spacing
              // that tracking adds after the final glyph — without it a
              // centered uppercase line sits visibly 4px left of true center.
              isCentered ? "text-center [text-indent:0.5rem]" : ""
            }`}
          >
            {subTitle}
          </p>
          <div className="px-10">
            <h1
              // break-words: purely defensive, a no-op for every current
              // caller. A single-word title (e.g. ProjectPage.jsx's
              // "Challenge"/"Approach", or this page's own "MediHelp") has
              // no space for the flex-col per-word wrap below to act on, so
              // at banner-text-responsive's mobile size it can overflow its
              // px-10 container and get silently clipped by an ancestor's
              // overflow-x-hidden — confirmed exactly this happening to
              // "MediHelp" itself (a pre-existing bug, not introduced by
              // this change) while auditing ProjectPage.jsx's new
              // single-word chapter titles. break-words only ever engages
              // when a word would otherwise overflow, so titles that
              // already fit render byte-for-byte identically.
              // items-center centers the below-md flex-col (one word per
              // line); md:text-center takes over once the h1 becomes
              // md:block and words flow as real text.
              className={`flex flex-col gap-12 uppercase banner-text-responsive sm:gap-16 md:block break-words ${textColor} ${
                isCentered ? "items-center md:text-center" : ""
              }`}
            >
              {titleParts.map((part, index) => (
                <span key={index}>{part} </span>
              ))}
            </h1>
          </div>
        </div>
      </div>
      {/* Below md, banner-text-responsive's leading is deliberately smaller
          than its font-size (48px type in a 36px line box, 90px in 64px),
          so the glyphs overflow the h1's box and the rule lands 0px from
          its bottom edge — measured, and identical for every layout. On
          `split` that reads correctly as a section divider the left-aligned
          title happens to sit on. On `centered` the rule is also inset, so
          the same 0px gap instead reads as an underline of the centered
          word. Offsetting the whole wrapper (the rule takes its static
          position, so it moves with the text) clears the descender zone
          without touching banner-text-responsive's own tuned leading. */}
      <div
        className={`relative px-10 ${textColor} ${
          isCentered ? "pt-3 sm:pt-6 md:pt-0" : ""
        }`}
      >
        {/* The rule is what most strongly identifies a composition, so each
            layout treats it differently: full-bleed in `split`, pulled in to
            the page gutter in `centered`, and absent in `offset` — there the
            text sits directly under the title as one placed block, which is
            the whole point of COMPOSITION_PRINCIPLES.md §3. */}
        {!isOffset && (
          <div
            className={`absolute border-t-2 ${
              isCentered ? "inset-x-10" : "inset-x-0"
            }`}
          />
        )}
        <div
          className={
            compact
              ? "py-6 sm:py-8 text-end"
              : isCentered
              ? // A bookend frame gets more surrounding pause than a
                // development beat (HIERARCHY_SYSTEM.md §3), and the measure
                // is constrained so centered lines stay readable rather than
                // spanning the full viewport.
                "py-16 sm:py-20 text-center mx-auto max-w-3xl"
              : isOffset
              ? // No rule to separate title from text, so the text sits
                // close beneath it, held to the left third with the right
                // two-thirds genuinely empty — placement, not a centered box.
                "pt-8 sm:pt-10 pb-12 sm:pb-16 text-start max-w-xl"
              : "py-12 sm:py-16 text-end"
          }
        >
          <AnimatedTextLines
            text={text}
            className={`font-light uppercase value-text-responsive ${textColor} ${textClassName}`}
          />
        </div>
      </div>
    </div>
  );
};

export default AnimatedHeaderSection;
