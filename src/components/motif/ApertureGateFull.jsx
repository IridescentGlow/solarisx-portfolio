import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import {
  APERTURE_R,
  BLADE_COUNT,
  LABEL_R,
  RING_R,
  bladeOpenDeg,
  bladeOutline,
  bladePivot,
  bladeBaseAngleDeg,
  openFromProgress,
  playheadMark,
  rangeBrackets,
  tickMarks,
  uvCell,
} from "../../lib/apertureGeometry";

// The Gate, full state — the Hero's Direction C moment (BLUEPRINT.md §9.1).
// Scene content only: no <Canvas>, no lights, no environment. Staging belongs
// to whoever mounts it, which is what lets the isolated lab light it exactly
// as the Hero later will without this file knowing about either.
//
// COORDINATE NOTE: apertureGeometry.js is SVG-native (+y points DOWN), because
// two of the three states are SVG. three.js is +y up, so every point crossing
// into this file goes through `flipY` exactly once, here, rather than each
// consumer guessing. Angles follow: a clockwise-on-screen rotation is negative
// about three's z.
const flipY = ([x, y]) => [x, -y];
const DEG2RAD = Math.PI / 180;

// Thin, like the star's 0.26-across-1.9-span proportion — a blade is a plate,
// and giving it real depth would read as a machined part rather than a gate.
const BLADE_DEPTH = 0.07;

// Shared with GeminiStar.jsx's own GLASS_PROPS values, deliberately: the motif
// has to read as the same material family as the existing hero object during
// any period where both exist, and these are the values that Stage 1's own
// tuning pass arrived at (see that file for why transmission is 0 and why
// sheen was removed outright).
const GLASS_PROPS = {
  roughness: 0.05,
  metalness: 0,
  specularIntensity: 1,
  clearcoat: 1,
  clearcoatRoughness: 0.06,
  transmission: 0,
  iridescence: 0.15,
  iridescenceIOR: 1.3,
  iridescenceThicknessRange: [100, 400],
};

// Resolves the theme's own token values so the ruler is drawn in the same ink
// the rest of the page uses, and follows a runtime theme flip. Same
// `data-theme` contract GeminiStar's useIsDarkTheme uses.
function useThemeInk() {
  const read = () => {
    if (typeof document === "undefined") return { ink: "#ffffff", accent: "#cfa355" };
    const s = getComputedStyle(document.documentElement);
    return {
      ink: s.getPropertyValue("--color-ink").trim() || "#ffffff",
      accent: s.getPropertyValue("--color-accent").trim() || "#cfa355",
    };
  };
  const [tokens, setTokens] = useState(read);
  useEffect(() => {
    const sync = () => setTokens(read());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  return tokens;
}

// The ruler — 60 ticks plus six frame numbers — baked into ONE canvas texture
// on one transparent plane, rather than drawn as line geometry plus six text
// meshes. Two reasons: it is a single draw call for the whole instrument, and
// it gets real typography (the page's own Amiamie, via the 2D context) without
// adding a 3D text dependency and its font parsing to the Hero's bundle.
// Only the static ruler lives here; the playhead and brackets move, so they
// stay as geometry below.
function useRulerTexture(ink) {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const PX = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = PX;
    canvas.height = PX;
    const ctx = canvas.getContext("2d");
    // Disc space spans -VIEW/2..VIEW/2; map that onto the canvas. Canvas is
    // y-down, which is the same convention apertureGeometry.js uses, so the
    // tick coordinates go in unchanged.
    const view = (LABEL_R + 0.11) * 2;
    const s = PX / view;
    const toPx = ([x, y]) => [PX / 2 + x * s, PX / 2 + y * s];

    ctx.lineCap = "butt";
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;

    ctx.globalAlpha = 0.26;
    ctx.lineWidth = Math.max(1, 0.004 * s);
    ctx.beginPath();
    ctx.arc(PX / 2, PX / 2, RING_R * s, 0, Math.PI * 2);
    ctx.stroke();

    for (const t of tickMarks()) {
      ctx.globalAlpha = t.major ? 0.72 : 0.32;
      ctx.lineWidth = Math.max(1, (t.major ? 0.011 : 0.006) * s);
      ctx.beginPath();
      const [x1, y1] = toPx(t.inner);
      const [x2, y2] = toPx(t.outer);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.globalAlpha = 0.5;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `300 ${Math.round(0.1 * s)}px Amiamie, system-ui, sans-serif`;
    for (const t of tickMarks()) {
      if (!t.label) continue;
      const [lx, ly] = toPx(t.labelPos);
      ctx.fillText(t.label, lx, ly);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }, [ink]);
}

// One video element, one texture, six cells. A camera iris shows one continuous
// image through its opening; the Gate shows six simultaneous moments ON the
// blades, which is the whole "contact sheet, not lens" refinement (§9.1
// refinement 1) — and it costs one decode instead of six, which is §0.9's
// point 2.
function useFootageTexture(src) {
  const [state, setState] = useState({ texture: null, aspect: null });

  useEffect(() => {
    if (!src) return undefined;
    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    // `metadata`, never `auto` — PROJECT_PAGE_SYSTEM.md §6.
    video.preload = "metadata";

    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    let cancelled = false;
    const onReady = () => {
      if (cancelled) return;
      setState({ texture, aspect: video.videoWidth / video.videoHeight });
    };
    video.addEventListener("loadeddata", onReady);
    video.src = src;
    video.play().catch(() => {});

    return () => {
      cancelled = true;
      video.removeEventListener("loadeddata", onReady);
      video.pause();
      video.removeAttribute("src");
      video.load();
      texture.dispose();
    };
  }, [src]);

  return state;
}

// Remaps a blade's UVs onto its own cell of the grid, cover-fitted so the
// footage keeps its aspect instead of being stretched to the blade's bbox —
// the same job GeminiStar's applyCoverFit does, except done in UV space because
// one shared texture cannot carry six different offsets.
function assignCellUVs(geometry, cellIndex, footageAspect) {
  const cell = uvCell(cellIndex);
  geometry.computeBoundingBox();
  const bb = geometry.boundingBox;
  const sx = bb.max.x - bb.min.x;
  const sy = bb.max.y - bb.min.y;
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;

  // Cell pixel aspect vs. the blade's own aspect: crop the longer axis.
  let cropU = 1;
  let cropV = 1;
  if (footageAspect) {
    const cellAspect = footageAspect * (cell.w / cell.h);
    const bladeAspect = sx / sy;
    if (cellAspect > bladeAspect) cropU = bladeAspect / cellAspect;
    else cropV = cellAspect / bladeAspect;
  }

  for (let i = 0; i < pos.count; i++) {
    const nx = (pos.getX(i) - bb.min.x) / sx;
    const ny = (pos.getY(i) - bb.min.y) / sy;
    const u = 0.5 + (nx - 0.5) * cropU;
    const v = 0.5 + (ny - 0.5) * cropV;
    uv.setXY(i, cell.x + u * cell.w, cell.y + v * cell.h);
  }
  uv.needsUpdate = true;
}

function useBladeGeometries(footageAspect) {
  return useMemo(() => {
    const pts = bladeOutline().map(flipY);
    const [px, py] = flipY(bladePivot());
    // Built pivot-local so the mesh can sit AT its hinge and open by rotating
    // about its own origin — no offset group, and the hinge stays exactly on
    // the silhouette where the blade already touches the rim.
    const shape = new THREE.Shape(
      pts.map(([x, y]) => new THREE.Vector2(x - px, y - py))
    );
    return Array.from({ length: BLADE_COUNT }, (_, i) => {
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: BLADE_DEPTH,
        bevelEnabled: true,
        bevelThickness: 0.012,
        bevelSize: 0.012,
        bevelSegments: 2,
        curveSegments: 1,
      });
      // Deliberately NOT centred: the geometry stays pivot-local so the mesh
      // can sit at its hinge and `rotation.z` alone opens it. Centring here
      // would move the origin to the bbox middle and the blade would spin in
      // place instead of swinging.
      assignCellUVs(geometry, i, footageAspect);
      return geometry;
    });
  }, [footageAspect]);
}

// Playhead and in/out brackets: geometry rather than part of the ruler texture,
// because these are the moving parts. The playhead is built once pointing at
// frame 0 and rotated, so a scrub costs a transform, not a rebuild.
function useIndicatorGeometries() {
  return useMemo(() => {
    const head = playheadMark(0);
    const playhead = new THREE.BufferGeometry().setFromPoints(
      [head.inner, head.outer].map((p) => {
        const [x, y] = flipY(p);
        return new THREE.Vector3(x, y, 0);
      })
    );
    const bracketPoints = [];
    for (const b of rangeBrackets()) {
      for (const seg of [b.stem, b.flag]) {
        for (const p of seg) {
          const [x, y] = flipY(p);
          bracketPoints.push(new THREE.Vector3(x, y, 0));
        }
      }
    }
    const brackets = new THREE.BufferGeometry().setFromPoints(bracketPoints);
    return { playhead, brackets };
  }, []);
}

// The iris housing, in shader form. Blades swing outside APERTURE_R as they
// open (see MAX_OPEN_DEG), so they have to be cropped back to the aperture disc
// the same way a real iris hides its blades behind a housing ring. A mask mesh
// would have to be painted in the page's background colour and would break the
// moment anything sits behind the canvas, so the crop is a radial discard
// instead.
//
// The clip has to be evaluated in the GATE's space, but each blade's vertices
// are in its own pivot-local space. Rather than pass a matrix and invert it per
// frame, note that a rotation about the origin preserves radius, so the blade's
// placement angle drops out entirely, and:
//
//   |p_gate| = |Rot(phi) * v_local + pivot| = |v_local + Rot(-phi) * pivot|
//
// which is a disc test in the blade's OWN space against a centre that depends
// only on that blade's current swing. That makes the uniform a vec2 the
// component can set during an ordinary React render — no useFrame, no matrix
// inversion, and it stays correct under any transform applied to the gate.
function createBladeMaterial(props) {
  const material = new THREE.MeshPhysicalMaterial(props);
  material.userData.clipCentre = { value: new THREE.Vector2() };
  material.userData.clipRadius = { value: APERTURE_R };
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uClipCentre = material.userData.clipCentre;
    shader.uniforms.uClipRadius = material.userData.clipRadius;
    shader.vertexShader = shader.vertexShader
      .replace("void main() {", "varying vec2 vBladeXY;\nvoid main() {")
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\n  vBladeXY = position.xy;"
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "void main() {",
        "uniform vec2 uClipCentre;\nuniform float uClipRadius;\nvarying vec2 vBladeXY;\nvoid main() {"
      )
      .replace(
        "#include <clipping_planes_fragment>",
        "#include <clipping_planes_fragment>\n  if (length(vBladeXY + uClipCentre) > uClipRadius) discard;"
      );
  };
  return material;
}

// Recreated when the footage texture arrives rather than mutated: three
// compiles a material's shader around whether `map` is set at that moment, and
// assigning one later updates the uniform but leaves a program with no sampler
// for it — the same trap GeminiStar documents and solves with a key.
function useBladeMaterials(footage, ink) {
  return useMemo(
    () =>
      Array.from({ length: BLADE_COUNT }, () =>
        createBladeMaterial({
          ...GLASS_PROPS,
          // Footage blades are emissive-driven and unlit by tone mapping. The
          // diffuse term with a white albedo lifted a mid-grey source by ~80
          // levels under the Hero's softbox rig, which is what blew the light
          // theme out to near-white; measured on a 128-grey test source, this
          // setup holds it at ~157 with the glass highlights still present.
          color: footage ? "#000000" : ink,
          map: footage ?? null,
          emissiveMap: footage ?? null,
          emissive: footage ? "#ffffff" : "#000000",
          emissiveIntensity: footage ? 1 : 0,
          toneMapped: !footage,
          envMapIntensity: 1,
          // Opaque. Six translucent plates stacked on each other depth-sort
          // into a milky mass and the hexagonal hole stops reading at all —
          // verified on the render. A real blade is opaque anyway; the glass
          // character here comes from clearcoat and iridescence, which is the
          // same conclusion GeminiStar reached when it dropped transmission.
          transparent: false,
          side: THREE.DoubleSide,
        })
      ),
    [footage, ink]
  );
}

const ApertureGateFull = ({
  progress = 0.5,
  footageSrc = null,
  scale = 1,
  ...props
}) => {
  const { ink, accent } = useThemeInk();
  const ruler = useRulerTexture(ink);
  const { texture: footage, aspect } = useFootageTexture(footageSrc);
  const blades = useBladeGeometries(aspect);
  const materials = useBladeMaterials(footage, ink);
  const indicators = useIndicatorGeometries();
  const openT = openFromProgress(progress);

  useEffect(() => {
    return () => {
      blades.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      indicators.playhead.dispose();
      indicators.brackets.dispose();
      ruler?.dispose();
    };
  }, [blades, materials, indicators, ruler]);

  const view = (LABEL_R + 0.11) * 2;

  return (
    <group scale={scale} {...props}>
      {/* Ruler, set just behind the blades so an opening blade passes in front
          of its own scale rather than being coplanar with it. */}
      {ruler ? (
        <mesh position={[0, 0, -0.14]}>
          <planeGeometry args={[view, view]} />
          <meshBasicMaterial map={ruler} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      ) : null}

      <lineSegments geometry={indicators.brackets} position={[0, 0, -0.1]}>
        <lineBasicMaterial color={ink} transparent opacity={0.75} toneMapped={false} />
      </lineSegments>

      {/* The playhead is the readout the whole instrument exists to display,
          so it is the one element on the accent. Rotating clockwise on screen
          is negative about z (see the coordinate note at the top). */}
      <group rotation={[0, 0, -(progress * 360) * DEG2RAD]} position={[0, 0, -0.08]}>
        <lineSegments geometry={indicators.playhead}>
          <lineBasicMaterial color={accent} toneMapped={false} />
        </lineSegments>
      </group>

      {blades.map((geometry, i) => {
        const [px, py] = flipY(bladePivot());
        // Negated for the same reason the base angle is: the module's open
        // direction is defined in its own y-down space, and a y-flip reverses
        // the sense of a rotation.
        const phi = -bladeOpenDeg(i, openT) * DEG2RAD;
        // Rot(-phi) * pivot — see createBladeMaterial for why this is the whole
        // clip test.
        const cos = Math.cos(-phi);
        const sin = Math.sin(-phi);
        materials[i].userData.clipCentre.value.set(
          px * cos - py * sin,
          px * sin + py * cos
        );
        return (
          <group key={i} rotation={[0, 0, -bladeBaseAngleDeg(i) * DEG2RAD]}>
            <group position={[px, py, 0]} rotation={[0, 0, phi]}>
              {/* Geometry is pivot-local, so the hinge group's own position is
                  the only thing putting the blade back on the ring. */}
              <mesh geometry={geometry} material={materials[i]} />
            </group>
          </group>
        );
      })}
    </group>
  );
};

export default ApertureGateFull;
