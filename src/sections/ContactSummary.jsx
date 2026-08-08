import { useRef } from "react";
import Marquee from "../components/Marquee";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const ContactSummary = () => {
  const containerRef = useRef(null);
  const items = ["Story", "Rhythm", "Emotion", "Craft", "Detail"];
  const items2 = [
    "let's talk",
    "let's talk",
    "let's talk",
    "let's talk",
    "let's talk",
  ];

  useGSAP(() => {
    gsap.to(containerRef.current, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "center center",
        end: "+=800 center",
        scrub: 0.5,
        pin: true,
        pinSpacing: true,
        markers: false,
      },
    });
  }, []);
  return (
    // The top spacing lives on this outer wrapper, not on the pinned <section>.
    // A margin on a pinned ScrollTrigger element gets absorbed by the pin math and
    // shifts the pinned content downward when the pin engages; with the section
    // pinned "center center", that shift pushed the bottom marquee out of the
    // viewport (the "missing 2nd marquee"). Keeping the margin outside the pinned
    // box preserves the exact original pinned behavior in the new canonical order.
    <div className="mt-16">
      <section
        ref={containerRef}
        className="flex flex-col items-center justify-between min-h-screen gap-12"
      >
        <Marquee items={items} />
        <div className="overflow-hidden font-light text-center contact-text-responsive">
          <p>
            “ Let’s make something <br />
            <span className="font-normal">memorable</span> &{" "}
            <span className="italic">inspiring</span> <br />
            <span className="text-accent">together</span> “
          </p>
        </div>
        <Marquee
          items={items2}
          reverse={true}
          className="text-ink bg-transparent border-y-2"
          iconClassName="stroke-accent stroke-2 text-ink"
          icon="material-symbols-light:square"
        />
      </section>
    </div>
  );
};

export default ContactSummary;
