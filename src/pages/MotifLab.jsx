import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import ApertureGateFull from "../components/motif/ApertureGateFull";
import ApertureGateReduced from "../components/motif/ApertureGateReduced";
import ApertureGateMark from "../components/motif/ApertureGateMark";
import { IN_POINT, OUT_POINT } from "../lib/apertureGeometry";

// Phase 2 acceptance criteria (BLUEPRINT.md Section 18): "The motif renders
// correctly in all three states in isolation, before it's wired into
// transitions." This page is that isolation — a dev-only harness, registered
// only under `import.meta.env.DEV` in App.jsx, so it adds no route and no
// bytes to a production build.
//
// It owns the <Canvas>, the lights and the environment on purpose: the full
// state is scene content, so staging lives with whoever mounts it. The lighting
// here is Hero.jsx's own rig, deliberately — a glass object judged under
// different light than it will ship under has not actually been verified.
// Defaults to the production composite. `?footage=` overrides it so a test
// asset can be rendered through the identical path (dev-only harness).
const FOOTAGE_SRC =
  (typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("footage")) ||
  "/videos/motif/gate-grid-3x2.mp4";

const Panel = ({ title, note, children, className = "" }) => (
  <section className={`flex flex-col gap-3 ${className}`}>
    <header>
      <h2 className="text-sm tracking-widest uppercase text-ink/80">{title}</h2>
      <p className="max-w-prose mt-1 text-xs leading-relaxed text-ink/45">{note}</p>
    </header>
    {children}
  </section>
);

const MotifLab = () => {
  const [progress, setProgress] = useState(0.45);
  const [playing, setPlaying] = useState(false);
  const [showFootage, setShowFootage] = useState(true);
  const [drawKey, setDrawKey] = useState(0);
  const raf = useRef(0);

  // Scrubs the playhead so the staggered blade cascade and the ruler readout
  // can be watched rather than inferred from stills.
  useEffect(() => {
    if (!playing) return undefined;
    let last = performance.now();
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      setProgress((p) => (p + dt * 0.12) % 1);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing]);

  const openLabel =
    progress < IN_POINT
      ? "closed (before in-point)"
      : progress > OUT_POINT
        ? "open (past out-point)"
        : "opening";

  return (
    <main className="min-h-screen px-6 py-10 bg-[var(--color-bg-base)] text-ink md:px-12">
      <h1 className="text-2xl font-light">The Gate — Phase 2 isolation</h1>
      <p className="max-w-2xl mt-2 text-sm text-ink/50">
        Signature motif per BLUEPRINT.md §9.1. Not wired into the Hero or the
        transition system — this page is the only thing mounting it.
      </p>

      <div className="flex flex-wrap items-center gap-4 p-4 mt-8 border rounded border-ink/15">
        <label className="flex items-center gap-3 text-xs">
          <span className="w-20 text-ink/60">playhead</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-64"
          />
          <span className="tabular-nums text-ink/80">{progress.toFixed(3)}</span>
          <span className="text-ink/40">{openLabel}</span>
        </label>
        <button
          type="button"
          onClick={() => setPlaying((v) => !v)}
          className="px-3 py-1 text-xs border rounded border-ink/25 hover:border-ink/60"
        >
          {playing ? "pause scrub" : "play scrub"}
        </button>
        <button
          type="button"
          onClick={() => setShowFootage((v) => !v)}
          className="px-3 py-1 text-xs border rounded border-ink/25 hover:border-ink/60"
        >
          footage: {showFootage ? "on" : "off (plain glass)"}
        </button>
        <button
          type="button"
          onClick={() => setDrawKey((k) => k + 1)}
          className="px-3 py-1 text-xs border rounded border-ink/25 hover:border-ink/60"
        >
          replay draw-on
        </button>
      </div>

      <div className="grid gap-12 mt-10 lg:grid-cols-2">
        <Panel
          title="Full — Hero (Direction C)"
          note="Six blades sampling one canvas, six cells. The playhead drives video.currentTime, and each blade cuts in when the playhead crosses its edit point — the blade ahead of the playhead stays live, the ones behind hold the frame they were cut on."
        >
          <div className="w-full aspect-square max-w-[520px] rounded border border-ink/10">
            <Canvas
              // Framed so the whole instrument including the ruler and its
              // frame numbers sits inside the canvas: the content spans ~2.5
              // units, and this camera shows ~2.8.
              camera={{ position: [0, 0, 5.2], fov: 30 }}
              gl={{ alpha: true, antialias: true }}
            >
              <ambientLight intensity={0.12} />
              <ApertureGateFull
                // Dev-only: lets the verification harness read the element's
                // real currentTime instead of inferring it from pixels.
                onVideo={(v) => {
                  window.__gateVideo = v;
                }}
                progress={progress}
                footageSrc={showFootage ? FOOTAGE_SRC : null}
                scale={1}
              />
              <Environment resolution={256}>
                <group rotation={[-Math.PI / 3, 4, 1]}>
                  <Lightformer form="rect" intensity={6} position={[0, 5, -9]} scale={[10, 3, 1]} />
                  <Lightformer
                    form="rect"
                    intensity={45}
                    position={[-3, 3, 1]}
                    rotation={[0, 0, Math.PI / 5]}
                    scale={[1.2, 10, 1]}
                  />
                  <Lightformer
                    form="rect"
                    intensity={32}
                    position={[4, -2, 1]}
                    rotation={[0, 0, -Math.PI / 6]}
                    scale={[0.9, 8, 1]}
                  />
                  <Lightformer
                    form="circle"
                    intensity={2}
                    color="#cfdcff"
                    position={[-5, -3, -1]}
                    scale={8}
                  />
                  <Lightformer
                    form="rect"
                    intensity={3}
                    color="#fff1dd"
                    position={[10, 1, 0]}
                    scale={[10, 12, 1]}
                  />
                </group>
              </Environment>
            </Canvas>
          </div>
        </Panel>

        <Panel
          title="Reduced — transitions / loading"
          note="Stroke only, no footage, no WebGL. Same blade outline and same ruler numbers as the full state, from the same module."
        >
          <div className="w-full aspect-square max-w-[520px] rounded border border-ink/10 p-6 text-ink">
            <ApertureGateReduced
              key={drawKey}
              progress={progress}
              drawOn
              className="w-full h-full"
            />
          </div>
        </Panel>
      </div>

      <Panel
        className="mt-12"
        title="Minimal — footer / favicon"
        note="Rendered at the sizes it has to survive. The glyph-risk check from §9.1: at 16px the ruler is gone, so the off-axis playhead notch is the only thing keeping this from reading as a generic shutter icon."
      >
        <div className="flex flex-wrap items-end gap-10 p-6 border rounded border-ink/10">
          {[16, 24, 32, 64, 128].map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <ApertureGateMark size={size} title="The Gate" />
              <span className="text-[10px] text-ink/40 tabular-nums">{size}px</span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-2 px-4 py-3 rounded bg-ink">
            <span className="text-[var(--color-bg-base)]">
              <ApertureGateMark size={32} />
            </span>
            <span className="text-[10px] text-[var(--color-bg-base)]/60">on ink</span>
          </div>
        </div>
      </Panel>
    </main>
  );
};

export default MotifLab;
