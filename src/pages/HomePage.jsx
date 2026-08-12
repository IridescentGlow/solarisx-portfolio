import { useEffect, useState } from "react";
import ReactLenis from "lenis/react";
import { useProgress } from "@react-three/drei";
import { useLenisScrollSync } from "../lib/useLenisScrollSync";
import Navbar from "../sections/Navbar";
import Hero from "../sections/Hero";
import ServiceSummary from "../sections/ServiceSummary";
import Services from "../sections/Services";
import About from "../sections/About";
import Works from "../sections/Works";
import ContactSummary from "../sections/ContactSummary";
import Contact from "../sections/Contact";

// The single-page narrative. Extracted from App.jsx unchanged so the "/"
// route keeps its exact current behavior (loading gate, Lenis, section
// order) once App.jsx becomes a router switch.
const HomePage = () => {
  const { progress } = useProgress();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (progress === 100) {
      setIsReady(true);
    }
  }, [progress]);

  // autoRaf: false — useLenisScrollSync (below) drives this instance's raf
  // off GSAP's own ticker instead, so this page and ProjectPage.jsx share
  // the exact same sync mechanism rather than each running its own
  // independent Lenis loop.
  useLenisScrollSync();

  return (
    <ReactLenis
      root
      options={{ autoRaf: false }}
      className="relative w-screen min-h-screen overflow-x-auto"
    >
      {!isReady && (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[var(--color-bg-base)] text-ink transition-opacity duration-700 font-light">
          <p className="mb-4 text-xl tracking-widest animate-pulse">
            Loading {Math.floor(progress)}%
          </p>
          <div className="relative h-1 overflow-hidden rounded w-60 bg-ink/20">
            <div
              className="absolute top-0 left-0 h-full transition-all duration-300 bg-ink"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      <div
        className={`${
          isReady ? "opacity-100" : "opacity-0"
        } transition-opacity duration-1000`}
      >
        <Navbar />
        <Hero />
        <Works />
        <About />
        <ServiceSummary />
        <Services />
        <ContactSummary />
        <Contact />
      </div>
    </ReactLenis>
  );
};

export default HomePage;
