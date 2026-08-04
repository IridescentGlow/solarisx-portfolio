import { useGSAP } from "@gsap/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
import Marquee from "../components/Marquee";
import { socials, socialIcons } from "../constants";
import gsap from "gsap";
import { EASE, DURATION } from "../lib/motion";

const Contact = () => {
  const text = `Have a project, an idea,
    or something you want to talk through?`;
  const items = [
    "let's make something memorable",
    "let's make something memorable",
    "let's make something memorable",
    "let's make something memorable",
    "let's make something memorable",
  ];
  useGSAP(() => {
    gsap.from(".social-link", {
      y: 100,
      opacity: 0,
      delay: 0.5,
      duration: DURATION.reveal,
      stagger: 0.3,
      ease: EASE.cinematic,
      scrollTrigger: {
        trigger: ".social-link",
      },
    });
  }, []);
  return (
    <section
      id="contact"
      className="flex flex-col justify-between min-h-screen bg-[var(--color-bg-base)]"
    >
      <div>
        <AnimatedHeaderSection
          subTitle={"Let's continue the conversation"}
          title={"Contact"}
          text={text}
          textColor={"text-white"}
          withScrollTrigger={true}
        />
        <div className="flex px-10 font-light text-white uppercase lg:text-[32px] text-[26px] leading-none mb-10">
          <div className="flex flex-col w-full gap-10">
            <div className="social-link">
              <h2>E-mail</h2>
              <div className="w-full h-px my-2 bg-white/30" />
              <p className="text-xl tracking-wider lowercase md:text-2xl lg:text-3xl">
                contactphazotron@gmail.com
              </p>
            </div>
            <div className="social-link">
              <h2>Social Media</h2>
              <div className="w-full h-px my-2 bg-white/30" />
              <div className="flex flex-wrap gap-2">
                {socials.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    title={social.name}
                    className="transition-colors duration-200 hover:text-white/80"
                  >
                    <Icon
                      icon={socialIcons[social.name] ?? "mdi:link-variant"}
                      className="size-7 md:size-8"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Marquee items={items} className="text-white bg-transparent" />
    </section>
  );
};

export default Contact;
