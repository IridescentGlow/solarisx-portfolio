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
}) => {
  const contextRef = useRef(null);
  const headerRef = useRef(null);
  const shouldSplitTitle = title.includes(" ");
  const titleParts = shouldSplitTitle ? title.split(" ") : [title];
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
    tl.from(
      headerRef.current,
      {
        opacity: 0,
        y: "200",
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
            className={`text-sm font-light tracking-[0.5rem] uppercase px-10 ${textColor}`}
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
              className={`flex flex-col gap-12 uppercase banner-text-responsive sm:gap-16 md:block break-words ${textColor}`}
            >
              {titleParts.map((part, index) => (
                <span key={index}>{part} </span>
              ))}
            </h1>
          </div>
        </div>
      </div>
      <div className={`relative px-10 ${textColor}`}>
        <div className="absolute inset-x-0 border-t-2" />
        <div className={`${compact ? "py-6 sm:py-8" : "py-12 sm:py-16"} text-end`}>
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
