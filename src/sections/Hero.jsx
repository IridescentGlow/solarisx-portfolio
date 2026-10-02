import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { GeminiStar } from "../components/GeminiStar";
import { Environment, Float, Lightformer } from "@react-three/drei";
import AnimatedHeaderSection from "../components/AnimatedHeaderSection";

const Hero = () => {
  const text = `I combine storytelling, visual design
and technology to build
experiences people remember`;

  // Section 11: "isolate any R3F canvas so it can be unmounted/paused when
  // its frame isn't in view." This has to be the <Canvas> `frameloop` PROP
  // itself, driven by React state — not an imperative store.setFrameloop()
  // call from a child, which was tried first and measured not to work:
  // <Canvas>'s own internal effect re-asserts its DECLARED frameloop prop
  // (default "always") on every one of its own re-renders (it has no
  // dependency array), and react-use-measure's {scroll:true} + its
  // ResizeObserver make that re-render far more often than just "the user
  // scrolled the Hero away" — polling the live store confirmed frameloop
  // read back "always" within 500ms of an external "never" call, every
  // time. Making "never" the declared prop removes the fight: Canvas's own
  // sync effect now re-asserts the CORRECT value on every re-render instead
  // of overriding it. "always"/"never" only — "demand" is not in play, so
  // the entrance/idle animation logic (GeminiStar's useFrame) is untouched;
  // it simply isn't ticked while off-screen, same as if the tab were
  // backgrounded. On the homepage the canvas is visible on arrival, so this
  // doesn't change anything there — it matters for a restored scroll
  // position or a deep link landing below the Hero, and for not burning
  // battery/GPU once a visitor has scrolled past it.
  const figureRef = useRef(null);
  const [frameloop, setFrameloop] = useState("always");

  useEffect(() => {
    const el = figureRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setFrameloop(entry.isIntersecting ? "always" : "never"),
      // Same 200px head start the other viewport-gated media on this site
      // uses (Works.jsx, GeminiStar's own video-texture observer).
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    // The 3D layer is a -z-50 figure behind this section's own content, which
    // is what puts the star behind the typography — the same arrangement the
    // planet used. The star is meant to cross behind the copy; layering, not
    // size, is what keeps the text in front.
    <section
      id="home"
      // pointer-events-none on the whole section, re-enabled (pointer-
      // events-auto) on just the figure/Canvas below: the star is sized to
      // visually pass behind this section's copy, and that copy is purely
      // presentational (no links, no buttons). Without this, the DOM text —
      // and, per CSS stacking rules, even the SECTION'S OWN transparent box,
      // which paints ABOVE its own -z-50 child — intercepts the pointer
      // before it ever reaches the canvas, so Stage 3's hover response
      // silently fails for however much of the star's silhouette falls
      // under the title's text box.
      //
      // `isolate` is the other half of the same fix, found the same way
      // (elementFromPoint during Stage 3 verification): without it, -z-50
      // isn't scoped to this section's own stacking order — it competes
      // against the WHOLE page's shared root stacking context, so once the
      // section itself stopped capturing the pointer, the hit fell through
      // not to the canvas but to HomePage.jsx's page-wide fade wrapper
      // (`<div className="opacity-100 transition-opacity ...">`), which
      // also isn't positioned and so also paints above a bare -z-50 child.
      // `isolate` gives this section its own local stacking context, so
      // -z-50 only has to compete with this section's OWN children.
      className="flex flex-col justify-end min-h-screen pointer-events-none isolate"
    >
      <AnimatedHeaderSection
        subTitle={"Visual Storyteller · Creative Technologist"}
        title={"Dagim Demissie"}
        text={text}
        textColor={"text-ink"}
      />
      <figure
        ref={figureRef}
        className="absolute inset-0 -z-50 pointer-events-auto"
        style={{ width: "100vw", height: "100vh" }}
      >
        <Canvas
          shadows
          frameloop={frameloop}
          camera={{ position: [0, 0, -10], fov: 17.5, near: 1, far: 20 }}
        >
          {/* Deliberately low. The old value (0.5) was tuned for the
              planet's matte spheres; on a polished surface a strong
              ambient term fills the shadow side and flattens exactly the
              contrast that makes glass read as glass. The softboxes below
              do the lighting; this only keeps the dark side from crushing
              to black. */}
          <ambientLight intensity={0.12} />
          {/* GeminiStar's useGLTF call suspends while 3d-star.glb loads.
              With no Suspense boundary anywhere in the tree, React has
              nowhere to catch that suspend except the app root — meaning
              the ENTIRE page, including the loading overlay's own text
              (HomePage.jsx), could not paint until this fetch resolved.
              That text is the homepage's actual LCP element (BLUEPRINT.md
              §0.14): profiling traced its real-trace paint to 937ms, well
              after the font/CSS it needs were ready, and found it was
              waiting on this. Scoping the suspend to just the star (the
              standard R3F/drei pattern — fallback renders nothing, not a
              placeholder mesh) lets the rest of the page paint
              independently of 3D-asset load time. */}
          <Suspense fallback={null}>
            {/* floatIntensity/rotationIntensity pulled below Float's
                defaults (1/1): the star's pose is deliberately composed by
                GeminiStar's fixed tilt, and the default rotation wobble
                fights that while the default vertical drift (±0.1 units,
                ~30px here) eats the top margin the larger scale needs. */}
            <Float speed={0.5} floatIntensity={0.45} rotationIntensity={0.4}>
              {/* One number for every width. GeminiStar only clamps this
                  down when the star would run off a viewport edge, so
                  there are no per-breakpoint magic values to keep in sync
                  here. */}
              <GeminiStar scale={1.3} />
            </Float>
          </Suspense>
          {/* Studio softboxes rather than the previous four uniform
              circles. The circles lit the old planet's matte spheres
              evenly, which is exactly wrong for glass: an even
              environment gives a smooth material nothing with structure
              to reflect, so it reads as white plastic. These narrow, high
              contrast rect strips are what a product render uses — each
              one becomes a tight elongated highlight raking across the
              star's curvature, and the gaps between them become the
              darker falloff that describes the form. Still a single
              256px cubemap baked once, so the cost is unchanged. */}
          <Environment resolution={256}>
            <group rotation={[-Math.PI / 3, 4, 1]}>
              {/* Key: broad overhead softbox — the main body highlight. */}
              <Lightformer
                form={"rect"}
                intensity={6}
                position={[0, 5, -9]}
                scale={[10, 3, 1]}
              />
              {/* Two narrow streaks crossing at an angle. These are what
                  actually read as "glass" — sharp, elongated and very
                  bright against the near-black rest of the environment.
                  The contrast between them and the gaps is the whole
                  effect; an evenly lit environment gives a smooth surface
                  nothing to reflect and it falls back to looking matte. */}
              <Lightformer
                form={"rect"}
                intensity={45}
                position={[-3, 3, 1]}
                rotation={[0, 0, Math.PI / 5]}
                scale={[1.2, 10, 1]}
              />
              <Lightformer
                form={"rect"}
                intensity={32}
                position={[4, -2, 1]}
                rotation={[0, 0, -Math.PI / 6]}
                scale={[0.9, 8, 1]}
              />
              {/* Cool fill from below-left, so the shadow side keeps a
                  faint blue-white cast instead of going flat grey — the
                  slight warm/cool split across the surface is most of what
                  sells "glass" rather than "white paint". */}
              <Lightformer
                form={"circle"}
                intensity={2}
                color="#cfdcff"
                position={[-5, -3, -1]}
                scale={8}
              />
              {/* Wide warm wrap on the right, tying the object to the
                  page's warm palette in both themes. */}
              <Lightformer
                form={"rect"}
                intensity={3}
                color="#fff1dd"
                position={[10, 1, 0]}
                scale={[10, 12, 1]}
              />
            </group>
          </Environment>
        </Canvas>
      </figure>
    </section>
  );
};

export default Hero;
