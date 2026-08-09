import { Canvas } from "@react-three/fiber";
import { GeminiStar } from "../components/GeminiStar";
import { Environment, Float, Lightformer } from "@react-three/drei";
import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
const Hero = () => {
  const text = `I combine storytelling, visual design
and technology to build
experiences people remember`;

  return (
    // The 3D layer is a -z-50 figure behind this section's own content, which
    // is what puts the star behind the typography — the same arrangement the
    // planet used. The star is meant to cross behind the copy; layering, not
    // size, is what keeps the text in front.
    <section id="home" className="flex flex-col justify-end min-h-screen">
      <AnimatedHeaderSection
        subTitle={"Visual Storyteller · Creative Technologist"}
        title={"Dagim Demissie"}
        text={text}
        textColor={"text-ink"}
      />
      <figure
        className="absolute inset-0 -z-50"
        style={{ width: "100vw", height: "100vh" }}
      >
        <Canvas
          shadows
          camera={{ position: [0, 0, -10], fov: 17.5, near: 1, far: 20 }}
        >
          {/* Deliberately low. The old value (0.5) was tuned for the
              planet's matte spheres; on a polished surface a strong
              ambient term fills the shadow side and flattens exactly the
              contrast that makes glass read as glass. The softboxes below
              do the lighting; this only keeps the dark side from crushing
              to black. */}
          <ambientLight intensity={0.12} />
          {/* floatIntensity/rotationIntensity pulled below Float's
              defaults (1/1): the star's pose is deliberately composed by
              GeminiStar's fixed tilt, and the default rotation wobble
              fights that while the default vertical drift (±0.1 units,
              ~30px here) eats the top margin the larger scale needs. */}
          <Float speed={0.5} floatIntensity={0.45} rotationIntensity={0.4}>
            {/* One number for every width. GeminiStar only clamps this down
                when the star would run off a viewport edge, so there are no
                per-breakpoint magic values to keep in sync here. */}
            <GeminiStar scale={1.3} />
          </Float>
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
