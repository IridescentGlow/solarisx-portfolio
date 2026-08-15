import { useRef } from "react";
import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
import { AnimatedTextLines } from "../components/AnimatedTextLines";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SCROLL_REVEAL_START } from "../lib/motion";

const About = () => {
  const text = `Behind the work —
    where the instincts come from
    and how the pieces get made`;
  const aboutText = `I started in video editing. Seven years of learning that a cut is a decision — what to keep, what to lose, and exactly when a moment should land.
That training is still the whole method. Story first, because a piece has to say something. Visual rhythm, because timing and spacing carry as much meaning as the frame. Emotional impact, because the work people remember made them feel something before they understood why.
The web became another timeline. I use interfaces, motion and real-time 3D the way I use a sequence — pacing and composition first, the engineering underneath in service of the feeling.
I work by exploring, building, reviewing, then polishing until a thing feels inevitable rather than assembled.`;
  const imgRef = useRef(null);
  useGSAP(() => {
    gsap.to("#about", {
      scale: 0.95,
      scrollTrigger: {
        trigger: "#about",
        start: "bottom 80%",
        end: "bottom 20%",
        scrub: true,
        markers: false,
      },
      ease: "power1.inOut",
    });

    gsap.set(imgRef.current, {
      clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)",
    });
    gsap.to(imgRef.current, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 2,
      ease: "power4.out",
      scrollTrigger: { trigger: imgRef.current, start: SCROLL_REVEAL_START },
    });
  });
  return (
    <section id="about" className="min-h-screen bg-[var(--color-surface-1)] rounded-b-4xl">
      <AnimatedHeaderSection
        subTitle={"Behind the work"}
        title={"About"}
        text={text}
        textColor={"text-ink"}
        withScrollTrigger={true}
        // COMPOSITION_PRINCIPLES.md §2/§3: the Context Layer is the one frame
        // the canonical composition doc explicitly asks to become genuinely
        // asymmetric — a text block placed toward one side with real negative
        // space opposite it, not a centered container that left-aligns.
        layout="offset"
      />
      <div className="flex flex-col items-center justify-between gap-16 px-10 pb-16 text-xl font-light tracking-wide lg:flex-row md:text-2xl lg:text-3xl text-ink/60">
        {/* TODO(content): replace with a real portrait — this is the template's stock photo */}
        <img
          ref={imgRef}
          src="images/photo.jpg"
          alt="man"
          className="w-md rounded-3xl"
        />
        <AnimatedTextLines text={aboutText} className={"w-full"} />
      </div>
    </section>
  );
};

export default About;
