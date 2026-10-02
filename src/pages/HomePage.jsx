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
// How long the loading overlay takes to fade out. Matches the
// `duration-700` on the overlay itself — they must stay in sync, because the
// overlay is unmounted on this timer once its fade has finished.
const OVERLAY_FADE_MS = 700;

const HomePage = () => {
  const { progress } = useProgress();
  const [isReady, setIsReady] = useState(false);
  const [overlayGone, setOverlayGone] = useState(false);

  useEffect(() => {
    if (progress === 100) {
      setIsReady(true);
    }
  }, [progress]);

  // Unmount the overlay only after it has finished fading, so it is never
  // yanked out from under a visible transition.
  useEffect(() => {
    if (!isReady) return;
    const timer = setTimeout(() => setOverlayGone(true), OVERLAY_FADE_MS);
    return () => clearTimeout(timer);
  }, [isReady]);

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
      {/* The overlay fades ITSELF out over the page, rather than the page
          fading in from underneath it.

          This is load-bearing for performance, not a style tweak. The content
          wrapper below used to carry `opacity-0` until `isReady`, and Chrome
          emits Largest-Contentful-Paint candidates at PAINT time: anything
          painted inside an `opacity: 0` ancestor is not a candidate, and
          later animating that opacity to 1 does not emit one either, because
          no fresh first paint happens. Meanwhile this overlay — the only
          thing painting at full opacity — was unmounted the instant `isReady`
          flipped, invalidating the one candidate it had supplied. Net result:
          the homepage produced ZERO LCP candidates, so Lighthouse could not
          compute a Performance score at all (NO_LCP), while
          /projects/:slug — same AnimatedHeaderSection, same GSAP opacity
          entrance, no useProgress wrapper — scored normally. Measured, not
          theorised: see BLUEPRINT.md §0.12.

          Now the content paints at full opacity from the first frame (hidden
          behind this opaque, full-viewport overlay, so nothing looks
          different), and the overlay crossfades away to reveal it. */}
      {!overlayGone && (
        <div
          className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[var(--color-bg-base)] text-ink transition-opacity duration-700 font-light ${
            isReady ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
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
      <div>
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
