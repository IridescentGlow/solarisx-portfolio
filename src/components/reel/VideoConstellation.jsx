import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DURATION, EASE } from "../../lib/motion";
import { PANEL_WIDTH } from "./reelConstellationConfig";

const deg = (d) => (d * Math.PI) / 180;

// Idle float, applied once a panel's entrance has settled (brief: "gently
// suspended rather than frozen"). Small and slow on purpose — the outer
// group's own position/rotation (entrance tween, then flythrough) already
// carries the composition; this is a local offset on an INNER group only,
// so it can never fight either of those. Per-panel variety comes from
// `index`, not Math.random() — matching reelConstellationConfig.js's own
// "fixed, reproducible on every load" convention rather than introducing
// the one random source in an otherwise deterministic scene.
const FLOAT_AMPLITUDE = 0.05;
const FLOAT_ROTATION = deg(1.2);
const FLOAT_SPEED = 0.22;

// Hover grow: same interaction philosophy as GeminiStar's own hover
// (DURATION.micro/EASE.precise, a tweened 0..1 state read every frame) at a
// comparable, clearly-noticeable multiplier — reused, not reinvented.
const HOVER_SCALE = 1.15;

// Bring-to-front on hover: renderOrder + depthTest:false is the standard
// Three.js technique for "this object always draws on top, regardless of
// actual depth" — panels physically sit at different z depths (see
// reelConstellationConfig.js), so a hovered panel that's behind a
// neighbor would otherwise stay clipped by the depth buffer no matter how
// much it scales up. Reverting both to their defaults (0 / true) restores
// ordinary depth-tested layering exactly as it was.
const FRONT_RENDER_ORDER = 999;

// Reads a design token directly off the root element rather than
// hardcoding a hex guess, so the panels' backing frame stays tied to the
// same --color-border every bordered card on the site already uses (see
// GALLERY_CARD in ProjectPage.jsx) instead of drifting from it. Re-reads on
// theme change via the same MutationObserver pattern GeminiStar.jsx's own
// (unexported) useIsDarkTheme uses — duplicated locally for the same
// "don't touch GeminiStar" reason as the helper above.
function useCssColor(varName) {
  const [color, setColor] = useState("#888888");
  useEffect(() => {
    const root = document.documentElement;
    const read = () =>
      setColor(getComputedStyle(root).getPropertyValue(varName).trim());
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, [varName]);
  return color;
}

// Owns one <video>/VideoTexture per panel for the constellation's lifetime.
// Deliberately NOT GeminiStar's useStarVideoTextures: that hook also
// computes a per-region cover-fit crop against geometry-derived aspect
// ratios (needed because the star's UV regions rarely match their clip's
// own aspect). These panels are sized to each clip's real aspect (see
// reelConstellationConfig.js's `aspect` field and PANEL_WIDTH below), so
// there is nothing to crop — a plain, uncropped VideoTexture is correct as
// is, and a smaller hook than the star's is the honest fit rather than a
// forced shared abstraction.
function usePanelVideoTextures(panels) {
  const [entries, setEntries] = useState(() =>
    panels.map(() => ({ texture: null, video: null, ready: false }))
  );

  useEffect(() => {
    const videos = panels.map((panel) => {
      const video = document.createElement("video");
      video.src = panel.src;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.autoplay = true;
      video.preload = "auto";
      return video;
    });
    const textures = videos.map((video) => {
      const texture = new THREE.VideoTexture(video);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      return texture;
    });

    // `ready` only flips true once a frame has actually decoded
    // (`loadeddata`), mirroring GeminiStar.jsx's useStarVideoTextures
    // exactly — not a style echo, but the same real race it exists to
    // avoid: three.js compiles a material's shader around whether `map` is
    // set AT THAT MOMENT (the USE_MAP define), and neither three.js nor R3F
    // recompiles an already-rendered material when `map` is assigned later.
    // Setting `texture` in state before the video has a frame (as an
    // earlier version of this hook did) risks the material's first-ever
    // compile happening with no sampler at all — after which the panel
    // stays blank/white FOREVER even once the video starts producing real
    // frames, since the uniform updates but the compiled shader never
    // gains a sampler for it. Confirmed happening exactly this way in this
    // component during verification (one panel out of six stayed solid
    // white indefinitely). Panel's `key={`${id}-${ready}`}` below forces a
    // fresh material/first-compile once ready flips, closing the race.
    let cancelled = false;
    const onReadyHandlers = videos.map((video, i) => {
      const onReady = () => {
        if (cancelled) return;
        setEntries((prev) => {
          const next = prev.slice();
          next[i] = { texture: textures[i], video, ready: true };
          return next;
        });
      };
      video.addEventListener("loadeddata", onReady);
      // A rejected play() (autoplay blocked, a clip that fails to load
      // outright) is not surfaced as an error — the `ready` gate above
      // already covers "no frame yet" with the plain frameColor fallback,
      // and a permanently-unready panel just stays that way, matching
      // GeminiStar's own "correct fallback, not an error state" precedent.
      video.play().catch(() => {});
      return onReady;
    });
    setEntries(videos.map((video) => ({ texture: null, video, ready: false })));

    return () => {
      cancelled = true;
      videos.forEach((video, i) => {
        video.removeEventListener("loadeddata", onReadyHandlers[i]);
        video.pause();
        video.removeAttribute("src");
        video.load();
        textures[i].dispose();
      });
    };
  }, [panels]);

  return entries;
}

// One video panel: a video-textured foreground plane on a thin backing
// plane (the "frame") a hair behind it — the same framed-clip read
// ProjectPage.jsx's GALLERY_CARD border gives its 2D gallery, translated to
// a flat object in 3D space rather than a glowing/glassy "tech demo" card.
function Panel({ config, entry, frameColor, groupRef, index, settledRef }) {
  const height = PANEL_WIDTH / config.aspect;
  const floatRef = useRef(null);
  const hoverState = useRef({ t: 0 });

  // Per-panel phase/speed variety — deterministic from `index`, not random
  // (see FLOAT_* comment above).
  const phase = index * 1.7;
  const speedMul = 0.85 + (index % 3) * 0.12;

  useFrame((state) => {
    if (!floatRef.current) return;
    if (settledRef.current[index]) {
      const t = state.clock.elapsedTime * FLOAT_SPEED * speedMul;
      floatRef.current.position.x = Math.sin(t + phase) * FLOAT_AMPLITUDE;
      floatRef.current.position.y =
        Math.cos(t * 0.8 + phase) * FLOAT_AMPLITUDE * 0.8;
      floatRef.current.rotation.z = Math.sin(t * 0.6 + phase) * FLOAT_ROTATION;
    }
    const scale = 1 + hoverState.current.t * (HOVER_SCALE - 1);
    floatRef.current.scale.setScalar(scale);
  });

  // Sets renderOrder/depthTest on both meshes in this panel (frame backing
  // + video face) via `floatRef`'s own subtree — reusing the exact same
  // `traverse` pattern setProgress already uses for opacity above, rather
  // than adding two more per-mesh refs just for this.
  const setBroughtToFront = (front) => {
    floatRef.current?.traverse((child) => {
      if (!child.isMesh) return;
      child.renderOrder = front ? FRONT_RENDER_ORDER : 0;
      if (child.material) child.material.depthTest = !front;
    });
  };

  const handlePointerOver = (event) => {
    event.stopPropagation();
    setBroughtToFront(true);
    gsap.to(hoverState.current, {
      t: 1,
      duration: DURATION.micro,
      ease: EASE.precise,
      overwrite: true,
    });
  };
  const handlePointerOut = (event) => {
    event.stopPropagation();
    gsap.to(hoverState.current, {
      t: 0,
      duration: DURATION.micro,
      ease: EASE.precise,
      overwrite: true,
      // Layering reverts only once the shrink-back tween actually finishes,
      // not the instant the pointer leaves — reverting immediately would
      // let a still-enlarged panel get clipped by its real neighbor
      // mid-shrink, which is the "ugly jump" this is avoiding.
      onComplete: () => setBroughtToFront(false),
    });
  };

  return (
    <group
      ref={groupRef}
      position={[config.to.x, config.to.y, config.to.z]}
      rotation={[config.to.rx, config.to.ry, config.to.rz]}
    >
      <group
        ref={floatRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <mesh position={[0, 0, -0.015]}>
          <planeGeometry args={[PANEL_WIDTH + 0.08, height + 0.08]} />
          {/* `transparent`: without this, the frame sits in Three.js's
              OPAQUE render pass while the video mesh below sits in the
              TRANSPARENT pass — opaque objects always draw before
              transparent ones, scene-wide, regardless of renderOrder. That
              meant a hovered panel's bumped renderOrder correctly brought
              its VIDEO in front of every other panel's video, but its FRAME
              could still be painted over by an unrelated panel's video
              (transparent, always-later-pass) — the reported detachment.
              Matching `transparent` here puts both meshes of a panel in the
              SAME pass, so the existing renderOrder/depthTest toggle in
              setBroughtToFront governs the whole panel as one unit. Alpha
              stays 1 (opaque color), so there's no visual change at rest. */}
          <meshBasicMaterial color={frameColor} toneMapped={false} transparent />
        </mesh>
        <mesh>
          <planeGeometry args={[PANEL_WIDTH, height]} />
          <meshBasicMaterial
            // Keyed on readiness (see usePanelVideoTextures above): forces
            // R3F to dispose the old material and mount a fresh one whose
            // first-ever compile already includes the map sampler, instead
            // of silently staying blank once `map` is assigned post-compile.
            key={`${config.id}-${entry?.ready ?? false}`}
            map={entry?.ready ? entry.texture : null}
            color={entry?.ready ? "#ffffff" : frameColor}
            toneMapped={false}
            transparent
          />
        </mesh>
      </group>
    </group>
  );
}

// The static-until-scrolled cluster of video panels. Entrance runs once on
// mount (fixed from -> to per panel, see reelConstellationConfig.js) on the
// OUTER group; once settled, each Panel's own inner group carries a small
// idle float/hover (not a spin — the composition still must not spin, only
// drift in place, see Panel above). The flythrough itself (once the visitor
// scrolls) is driven entirely from outside via the exposed `setProgress`
// imperative handle, called from ReelIntro's own scroll-scrubbed
// ScrollTrigger — the same "GSAP/scroll owns the value, the scene applies
// it" separation the rest of this codebase's motion already uses, still
// true for the OUTER group's z-position/opacity.
export const VideoConstellation = forwardRef(function VideoConstellation(
  { panels, reducedMotion = false },
  ref
) {
  const groupRefs = useRef([]);
  const passedRef = useRef([]);
  // Flips true per-panel once ITS OWN entrance timeline finishes; Panel's
  // own useFrame reads this to gate idle floating so a panel never starts
  // drifting mid-entrance. A ref (not state) because it's read every frame,
  // not rendered — the same "GSAP/scroll owns the value" separation the
  // rest of this file already uses for passedRef above.
  const settledRef = useRef([]);
  const entries = usePanelVideoTextures(panels);
  const frameColor = useCssColor("--color-border");

  useEffect(() => {
    passedRef.current = panels.map(() => false);
    settledRef.current = panels.map(() => false);
  }, [panels]);

  // Entrance: fixed off-screen -> fixed settled pose, once. Skipped
  // entirely under reduced motion — panels simply render already-settled
  // (see Panel's own position/rotation defaults above, which are already
  // `to`), matching GeminiStar's own reduced-motion precedent of not
  // running continuous/large motion for that setting. Reduced motion also
  // means settledRef never flips true, which is what keeps Panel's idle
  // float off in that case too — one gate, not two.
  useGSAP(() => {
    if (reducedMotion) return;
    panels.forEach((config, i) => {
      const group = groupRefs.current[i];
      if (!group) return;
      gsap.set(group.position, { x: config.from.x, y: config.from.y, z: config.from.z });
      gsap.set(group.rotation, { x: config.from.rx, y: config.from.ry, z: config.from.rz });
      // DURATION.reveal (not .revelation) — ProjectPage.jsx's own §7 note
      // is explicit that EASE/DURATION.revelation both "stay out entirely"
      // on a project page (it's evidence, not a Revelation moment); this
      // matches GeminiStar's own entrance duration instead.
      const tl = gsap.timeline({ delay: 0.15 + i * 0.08 });
      tl.to(group.position, {
        x: config.to.x,
        y: config.to.y,
        z: config.to.z,
        duration: DURATION.reveal,
        ease: EASE.cinematic,
      });
      tl.to(
        group.rotation,
        {
          x: config.to.rx,
          y: config.to.ry,
          z: config.to.rz,
          duration: DURATION.reveal,
          ease: EASE.cinematic,
        },
        "<"
      );
      tl.eventCallback("onComplete", () => {
        settledRef.current[i] = true;
      });
    });
  }, [panels, reducedMotion]);

  // Camera the flythrough targets — a touch past the constellation Canvas's
  // own camera z (see CONSTELLATION_CAMERA in reelConstellationConfig.js)
  // so a panel fully leaves the view frustum (clips past the near plane)
  // rather than merely reaching the camera position and stopping.
  const FLYTHROUGH_Z = 9.4;
  const N = panels.length;
  const segments = useMemo(() => {
    const segmentLen = (1 / N) * 1.25;
    const step = N > 1 ? (1 - segmentLen) / (N - 1) : 0;
    return panels.map((_, i) => {
      const start = i * step;
      return { start, end: Math.min(1, start + segmentLen) };
    });
  }, [panels, N]);

  useImperativeHandle(
    ref,
    () => ({
      setProgress(progress) {
        if (reducedMotion) return;
        panels.forEach((config, i) => {
          const group = groupRefs.current[i];
          const entry = entries[i];
          if (!group) return;
          const { start, end } = segments[i];
          const span = Math.max(end - start, 0.0001);
          const t = Math.min(1, Math.max(0, (progress - start) / span));
          const ease = t * t; // accelerate into the camera — energetic, not linear
          group.position.z = THREE.MathUtils.lerp(config.to.z, FLYTHROUGH_Z, ease);
          const opacity = t < 0.85 ? 1 : 1 - (t - 0.85) / 0.15;
          // `traverse`, not `group.children.forEach`: the panel's meshes now
          // sit one level deeper, inside Panel's own float/hover inner
          // group (see Panel above), so a direct-children walk would stop
          // at that group and never reach the materials.
          group.traverse((child) => {
            if (child.material) child.material.opacity = opacity;
          });
          group.visible = t < 1 || progress < end;

          const passed = t >= 1;
          if (passed !== passedRef.current[i]) {
            passedRef.current[i] = passed;
            const video = entry?.video;
            if (video) {
              if (passed) video.pause();
              else video.play().catch(() => {});
            }
          }
        });
      },
    }),
    [panels, entries, segments, reducedMotion]
  );

  return (
    <>
      {panels.map((config, i) => (
        <Panel
          key={config.id}
          config={config}
          entry={entries[i]}
          frameColor={frameColor}
          groupRef={(el) => (groupRefs.current[i] = el)}
          index={i}
          settledRef={settledRef}
        />
      ))}
    </>
  );
});
