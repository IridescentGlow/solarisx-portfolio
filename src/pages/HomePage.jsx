import { lazy, Suspense, useEffect, useState } from "react";
import ReactLenis from "lenis/react";
import { useProgress } from "@react-three/drei";
import { useLenisScrollSync } from "../lib/useLenisScrollSync";
import Navbar from "../sections/Navbar";
import ServiceSummary from "../sections/ServiceSummary";
import Services from "../sections/Services";
import About from "../sections/About";
import Works from "../sections/Works";
import ContactSummary from "../sections/ContactSummary";
import Contact from "../sections/Contact";

// Lazy, not eager like the other sections: Hero is the only thing on "/"
// that pulls in three.js/@react-three/fiber/@react-three/drei, and until
// `isReady` this entire section sits behind the opaque loading overlay below
// anyway — fully invisible, so deferring its module has no visible cost.
// Before this, those libraries shipped in the SAME bundle this page's own
// loading-overlay text needs just to render, so a trivial, already-ready
// string of text was serialized behind a 3D engine it has nothing to do
// with (BLUEPRINT.md §0.14). `useProgress`'s store initializes at
// `progress: 0`, not 100 (verified in
// node_modules/@react-three/drei/core/Progress.js) — nothing here can start
// the `isReady` effect below early just because Hero hasn't mounted yet.
const Hero = lazy(() => import("../sections/Hero"));

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
        {/* fallback reserves Hero's own min-h-screen box (Hero.jsx's
            <section id="home">) rather than rendering nothing. A null
            fallback measured CLS 0 -> 1: with no DOM node there at all
            while the chunk loads, Works/About/etc. render one full
            viewport higher, then jump down the instant Hero's real
            section mounts — a real, measured layout shift, invisible to a
            viewer only because the opaque loading overlay happens to be
            covering it the first time, not something to rely on (a
            cached-chunk revisit, or any moment after the overlay is gone,
            would show the jump). */}
        <Suspense fallback={<div className="min-h-screen" />}>
          <Hero />
        </Suspense>
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
