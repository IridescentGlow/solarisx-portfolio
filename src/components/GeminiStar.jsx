import { useEffect, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DURATION, EASE } from "../lib/motion";

// The GLB (public/models/3d-star.glb, Meshy-generated) ships POSITION +
// indices only — no NORMAL, no UV, no material. Confirmed by parsing the
// glTF JSON chunk directly: single mesh "mesh_node", 9818 verts / 19632
// tris, bounding box ~1.9 x 1.9 x 0.26 (thin along Z, its native camera-
// facing axis at this Hero's `position: [0, 0, -10]`). No UVs is the real
// constraint for Stage 2 (video textures): that stage needs either
// generated UVs or a triplanar-projected material, not just a texture
// swap on this one.
const GLB_PATH = "/models/3d-star.glb";

// Radians/second for the resting spin. A full turn every ~110s reads as
// "hypnotic, almost still" rather than a product-viewer turntable — the
// brief explicitly asks for slower than that convention.
const SPIN_SPEED = (Math.PI * 2) / 110;

// Full revolutions performed during the entrance, while the star is still
// falling. EASE.cinematic is heavily front-loaded (0.16, 1, 0.3, 1), so ~93%
// of these turns are spent inside the drop's own 1.5s and the remainder
// stretches across a long, visibly decelerating tail. That tail is also what
// makes the handoff invisible: the tween's velocity is already approaching
// zero when it ends, and the idle spin it hands off to is only 0.057 rad/s,
// so there is no step change to see.
const ENTRANCE_TURNS = 2.5;

// A small backward lean, applied OUTSIDE the spinner so it is fixed in world
// space and the star's up-vector never moves. That is what keeps the top and
// bottom points stable while the object turns: the spin axis is this leaned
// vertical, so the star behaves like a physical object on a slightly raked
// turntable rather than tumbling. Positive X leans the top away from the
// camera, so the viewer looks very slightly down onto the face.
//
// There is no Y term any more — on a Y-axis turntable a fixed Y offset only
// shifts the starting phase of a rotation that never stops, so it would be a
// constant with no observable effect.
const TILT_X = 0.18;

// Half-extent of the model in local units (bounding box is ~1.9 across).
const MODEL_RADIUS = 0.96;
// Share of the visible frame the star may occupy, so it never runs off an
// edge. These are edge-clipping guards only — deliberately NOT a clear-space
// rule around the Hero copy. The star is meant to pass behind the type (the
// planet it replaces did the same), so the typography's box is not an
// exclusion zone; the <figure> at -z-50 is what keeps the text in front.
// Width is the binding constraint on phones (the fov is vertical, so a
// narrow viewport loses horizontal room while keeping the same visible
// height), height on short desktops. Smaller of the two wins.
const WIDTH_FIT = 0.86;
const HEIGHT_FIT = 0.82;
// Centre of the star as a fraction of the frame, from the top. Slightly
// above the middle so the star reads as the Hero's centrepiece with the
// copy crossing its lower half, rather than sitting dead-centre behind the
// whole text block.
const CENTER_FROM_TOP = 0.44;
// The clamps use the full radius on both axes, with no foreshortening term.
// On a Y-axis turntable the vertical extent is essentially constant (measured
// stable within 2% across a revolution) and the horizontal extent is widest
// exactly at face-on, so the full radius is the honest bound for both.

// One material in two lightings, the same contract the rest of the theme
// layer uses. It has to be theme-aware, because the star deliberately passes
// behind the Hero copy: on paper the dark type reads against a white object
// at 18.8:1, but in dark mode white type over a white object measured
// 1.03:1 and half the name was genuinely invisible. Dark mode therefore gets
// smoked glass — tinted AND translucent, which is what smoked glass actually
// is.
//
// Both parts are load-bearing, established by measuring rather than by eye.
// Tint alone does not work: albedo only scales the diffuse term, while the
// specular reflection of the softboxes is albedo-independent, so the
// highlights still blew to pure white even with the base pulled down to
// #3f444c. Opacity alone is also not enough, because those highlights are
// HDR (>1.0) before tone mapping, so scaling them by alpha can still clip
// back to white. Together, at these values, the brightest pixel behind the
// title measures 3.19:1 against the white title — past the 3.0 WCAG large-
// text floor — while light mode is untouched at 18.8:1. These are the
// brightest settings that still clear the floor: a trial at opacity 0.58
// measured 2.96:1 and was pulled back. Verified with the copy hidden, so
// glyph pixels cannot contaminate the reading (an earlier measurement that
// sampled the composite was really measuring the white glyphs).
const MATERIAL = {
  light: { color: "#dee4ee", envMapIntensity: 2.6, opacity: 1 },
  dark: { color: "#5b626e", envMapIntensity: 1.9, opacity: 0.555 },
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Follows the same `data-theme` attribute index.html resolves before first
// paint and ThemeToggle flips at runtime, so the star restyles with the rest
// of the page instead of needing its own source of truth.
const useIsDarkTheme = () => {
  const [isDark, setIsDark] = useState(
    () =>
      typeof document === "undefined" ||
      document.documentElement.getAttribute("data-theme") !== "light"
  );
  useEffect(() => {
    const root = document.documentElement;
    const sync = () =>
      setIsDark(root.getAttribute("data-theme") !== "light");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  return isDark;
};

export function GeminiStar({ scale = 1, ...props }) {
  const entranceOffset = useRef(null);
  const spinner = useRef(null);
  const entranceDone = useRef(false);
  const { nodes } = useGLTF(GLB_PATH);
  const material = MATERIAL[useIsDarkTheme() ? "dark" : "light"];

  // The camera's fov is vertical, so a narrow viewport loses horizontal
  // room while keeping the same visible height — at 390px the star was
  // measurably clipped hard against both edges (left margin 0px, right
  // 1px) even though it fit fine vertically. Deriving the cap from the
  // live R3F viewport (world units at the focus plane, recomputed on
  // resize) fixes that at every aspect ratio instead of guessing a second
  // magic number per breakpoint, and it can only ever shrink the caller's
  // requested scale, never inflate it.
  const { viewport } = useThree();

  // Two caps against the frame's own edges, smallest wins. Neither knows
  // anything about the copy — overlapping it is intended.
  const appliedScale = Math.min(
    scale,
    (viewport.width * WIDTH_FIT) / (MODEL_RADIUS * 2),
    (viewport.height * HEIGHT_FIT) / (MODEL_RADIUS * 2)
  );

  const restY = viewport.height * (0.5 - CENTER_FROM_TOP);

  // GLTFLoader already synthesizes normals for primitives missing NORMAL
  // (confirmed in-browser, not assumed) — only step in if the render
  // actually shows a lighting artifact. Recomputing unconditionally would
  // smooth-shade across the star's tips and round off the crisp points
  // that read as "star".
  useEffect(() => {
    const geometry = nodes.mesh_node?.geometry;
    if (geometry && !geometry.attributes.normal) {
      geometry.computeVertexNormals();
    }
  }, [nodes]);

  // Entrance: fast drop from above with 2.5 horizontal turns taken DURING
  // the fall, a hard deceleration, then a soft settle straight into the idle
  // turntable. No bounce and no overshoot — both eases are pure ease-outs, and
  // EASE.revelation (the only curve in the canonical set that overshoots) is
  // deliberately not used here.
  //
  // Both tweens run on the same canonical curve and start together at 0, so
  // the spin is fastest exactly while the star is falling fastest and the two
  // read as one movement rather than two stacked effects. Measured profile:
  // 2.880 -> 0.798 -> 0.182 -> 0.034 -> 0.002 turns/s, with the drop settled
  // by ~1.9s. The rotation's longer duration gives it a slow tail past the
  // landing, which is what makes the handoff to the 0.009 turns/s idle
  // invisible — there is no velocity step to see at either end.
  //
  // The drop is animated on its own inner group as a pure offset (5 -> 0)
  // rather than on the group that carries the resting position. `.from()`
  // snapshots its destination when the tween is built, so animating the
  // positioned group directly means whichever value happened to be there at
  // that moment becomes the resting place forever — and `clearance` is
  // measured a tick later, so the star would settle at the pre-measurement
  // fallback instead. It works today only because useGLTF suspends long
  // enough for the measurement to land first, which is not a guarantee once
  // the model is warm in cache. Separating layout (React) from entrance
  // offset (GSAP) removes the race entirely and makes resize safe too.
  useGSAP(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        entranceDone.current = true;
      },
    });
    // Drop and spin start together at 0, so the revolutions happen DURING
    // the fall rather than after the star has already arrived.
    tl.from(entranceOffset.current.position, {
      y: 5,
      duration: DURATION.transition,
      ease: EASE.cinematic,
    });
    tl.from(
      spinner.current.rotation,
      {
        // 2.5 horizontal turns, negative so it unwinds toward 0 — an
        // increasing y, which is the same direction the idle turntable then
        // continues in, so the handoff has no reversal in it.
        y: -Math.PI * 2 * ENTRANCE_TURNS,
        duration: DURATION.reveal,
        ease: EASE.cinematic,
      },
      0
    );
  }, []);

  // Continuous resting spin, independent of the entrance timeline so it
  // never resets or restarts — it simply keeps incrementing from wherever
  // the GSAP settle left off. Gated on entranceDone so it doesn't fight
  // the GSAP tween's own rotation.z during entrance, and gated on
  // prefers-reduced-motion since useFrame isn't covered by lib/motion.js's
  // global gsap.defaults({ duration: 0 }) (that only collapses GSAP
  // tweens, not a per-frame imperative increment).
  useFrame((_, delta) => {
    if (!entranceDone.current || prefersReducedMotion()) return;
    spinner.current.rotation.y += delta * SPIN_SPEED;
  });

  return (
    // Layout: owned by React, recomputed from the measured frame on resize.
    <group position={[0, restY, 0]} {...props} dispose={null}>
      {/* Entrance offset: owned by GSAP, animates 5 -> 0 and nothing else. */}
      <group ref={entranceOffset}>
        <group scale={appliedScale}>
          {/* Horizontal turntable. The lean is the PARENT and the spinner is
              its child, so the spin axis is the leaned vertical rather than
              the camera's view axis: the star turns like a thin physical
              object standing on a slightly raked platter. Its up-vector is
              constant under a Y rotation and only the fixed lean acts on it,
              which is what holds the top and bottom points steady while the
              left and right points swing toward and away from the viewer.

              The face therefore sweeps through front-facing -> angled ->
              edge-on -> angled -> front-facing once per half turn, and the
              silhouette narrowing at edge-on is the intended read, not an
              artefact: it is what makes the object's real depth visible.
              (An earlier pass spun this on the view axis instead, which kept
              a constant silhouette but made the star read as a flat 2D mark
              rotating on its face — the opposite of what this needs.) */}
          <group rotation={[TILT_X, 0, 0]}>
            <group ref={spinner}>
              <mesh geometry={nodes.mesh_node.geometry}>
                {/* White glass by reflection, not by transmission. Real
                    `transmission` was tried and rejected on the render, not
                    on theory: the Canvas is transparent and nothing sits
                    behind the star in the 3D scene, so there is nothing to
                    refract — the shape flattened into a uniform white
                    silhouette and lost all the shading that describes its
                    form, while still paying for three's per-frame
                    transmission pass. The glass read comes instead from a
                    very smooth base under a full clearcoat lit by
                    structured softboxes (see Hero.jsx's Environment), which
                    is what produces the tight, elongated highlights and
                    bright grazing edges that say "polished glass" rather
                    than "white plastic".

                    iridescence is kept low, and `sheen` was removed
                    outright. Both were isolated against a frozen pose
                    (Playwright reducedMotion, which collapses the entrance
                    and stops the spin, so frames are reproducible): sheen's
                    grazing-angle lobe aliased into a dark dotted fringe
                    tracing the whole silhouette, since the view angle
                    changes faster than one pixel there. With sheen off,
                    iridescence at 0.15 renders a clean edge at 2x DPR and
                    still supplies the pearlescent shift the brief asks for
                    — sheen is a fabric term anyway, not what makes glass
                    look like glass.

                    Kept as a JSX child of the mesh rather than a shared
                    module-level material instance, so Stage 2 can swap or
                    augment it with video textures without restructuring. */}
                <meshPhysicalMaterial
                  color={material.color}
                  roughness={0.05}
                  metalness={0}
                  specularIntensity={1}
                  clearcoat={1}
                  clearcoatRoughness={0.06}
                  transmission={0}
                  iridescence={0.15}
                  iridescenceIOR={1.3}
                  iridescenceThicknessRange={[100, 400]}
                  envMapIntensity={material.envMapIntensity}
                  transparent={material.opacity < 1}
                  opacity={material.opacity}
                />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(GLB_PATH);
