import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { useRef } from "react";
gsap.registerPlugin(ScrollTrigger);
const ServiceSummary = () => {
  const sectionRef = useRef(null);
  useGSAP(() => {
    // Bounded, section-based trigger. Previously each row used an invalid
    // `target` key, so it fell back to triggering itself over its full
    // top-bottom → bottom-top transit, reaching extreme xPercent (rows fly a
    // full width apart and clip) while still on screen. Now all rows scrub
    // against the SECTION across the window from its top reaching 80% of the
    // viewport height (as it enters, while the About section is still leaving) to
    // its bottom leaving the top, so the spread scrubs smoothly across the whole
    // transition rather than being compressed into a late window.
    gsap.to("#title-service-1", {
      xPercent: 20,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        end: "bottom top",
        scrub: true,
      },
    });
    gsap.to("#title-service-2", {
      xPercent: -30,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        end: "bottom top",
        scrub: true,
      },
    });
    gsap.to("#title-service-3", {
      xPercent: 100,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        end: "bottom top",
        scrub: true,
      },
    });
    gsap.to("#title-service-4", {
      xPercent: -100,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        end: "bottom top",
        scrub: true,
      },
    });
  });
  return (
    <section
      ref={sectionRef}
      className="mt-20 overflow-hidden font-light leading-snug text-center mb-42 contact-text-responsive"
    >
      <div id="title-service-1">
        <p>Architucture</p>
      </div>
      <div
        id="title-service-2"
        className="flex items-center justify-center gap-3 translate-x-16"
      >
        <p className="font-normal">Development</p>
        <div className="w-10 h-1 md:w-32 bg-gold" />
        <p>Deployment</p>
      </div>
      <div
        id="title-service-3"
        className="flex items-center justify-center gap-3 -translate-x-48"
      >
        <p>APIs</p>
        <div className="w-10 h-1 md:w-32 bg-gold" />
        <p className="italic">Frontends</p>
        <div className="w-10 h-1 md:w-32 bg-gold" />
        <p>Scalability</p>
      </div>
      <div id="title-service-4" className="translate-x-48">
        <p>Databases</p>
      </div>
    </section>
  );
};

export default ServiceSummary;
