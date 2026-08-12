import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// Contextual labels a target can request via data-cursor="<mode>". Anything
// else clickable (a, button, [role=button]) falls back to the generic "link"
// mode below via resolveTarget's closest() search — the brief asks for "→",
// not invented copy, on elements that don't opt in explicitly.
const CURSOR_LABELS = {
  open: "OPEN ↗",
  watch: "WATCH",
  talk: "LET'S TALK",
  link: "→",
};

const GENERIC_TARGET_SELECTOR = "a, button, [role='button']";

// Real capability check (hover + fine pointer), not a viewport-width guess —
// a touch device with a wide viewport must never get a fake cursor.
const CAPABILITY_QUERY = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Distance-proportional pull toward a hovered target's center. Kept small and
// capped so it reads as a gentle bias, not the cursor snapping to the target.
const MAGNETIC_STRENGTH = 0.3;

const Cursor = () => {
  const rootRef = useRef(null);
  const moveX = useRef(null);
  const moveY = useRef(null);
  const targetRef = useRef(null);
  const reducedRef = useRef(false);
  const visibleRef = useRef(false);
  const [supported, setSupported] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const capabilityMq = window.matchMedia(CAPABILITY_QUERY);
    const reducedMq = window.matchMedia(REDUCED_MOTION_QUERY);

    const updateCapability = () => setSupported(capabilityMq.matches);
    const updateReduced = () => {
      reducedRef.current = reducedMq.matches;
      setReducedMotion(reducedMq.matches);
    };

    updateCapability();
    updateReduced();

    capabilityMq.addEventListener("change", updateCapability);
    reducedMq.addEventListener("change", updateReduced);
    return () => {
      capabilityMq.removeEventListener("change", updateCapability);
      reducedMq.removeEventListener("change", updateReduced);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (supported) root.classList.add("solaris-cursor-active");
    return () => root.classList.remove("solaris-cursor-active");
  }, [supported]);

  useEffect(() => {
    if (!supported || !rootRef.current) return;

    // Center the cursor on its own coordinate via GSAP transform, not a
    // Tailwind translate class — both would write to the same `transform`
    // property and one would silently clobber the other once quickTo starts
    // driving x/y (Works.jsx's floating preview centers the same way).
    gsap.set(rootRef.current, { xPercent: -50, yPercent: -50 });

    moveX.current = gsap.quickTo(rootRef.current, "x", {
      duration: 0.35,
      ease: "power3.out",
    });
    moveY.current = gsap.quickTo(rootRef.current, "y", {
      duration: 0.35,
      ease: "power3.out",
    });

    const resolveTarget = (el) => {
      const withCursor = el.closest?.("[data-cursor]");
      if (withCursor) {
        return { el: withCursor, mode: withCursor.dataset.cursor };
      }
      const generic = el.closest?.(GENERIC_TARGET_SELECTOR);
      if (generic) return { el: generic, mode: "link" };
      return null;
    };

    const setVisibleOnce = (next) => {
      if (visibleRef.current === next) return;
      visibleRef.current = next;
      setVisible(next);
    };

    const handleMove = (e) => {
      setVisibleOnce(true);

      let x = e.clientX;
      let y = e.clientY;

      const active = targetRef.current;
      // The hovered element can unmount mid-hover (e.g. Works.jsx navigates
      // ~150ms after click while the pointer is still over the link) —
      // getBoundingClientRect() on a detached node returns all zeros, which
      // would yank the cursor toward the viewport corner.
      if (active && active.el.isConnected && !reducedRef.current) {
        const rect = active.el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        x += (cx - e.clientX) * MAGNETIC_STRENGTH;
        y += (cy - e.clientY) * MAGNETIC_STRENGTH;
      } else if (active && !active.el.isConnected) {
        targetRef.current = null;
        setMode(null);
      }

      if (reducedRef.current) {
        gsap.set(rootRef.current, { x, y });
      } else {
        moveX.current(x);
        moveY.current(y);
      }
    };

    const handleOver = (e) => {
      const found = resolveTarget(e.target);
      targetRef.current = found;
      setMode(found?.mode ?? null);
    };

    const handleLeave = () => setVisibleOnce(false);
    const handleEnter = () => setVisibleOnce(true);

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mouseover", handleOver, { passive: true });
    // mouseenter/mouseleave don't bubble, so a window listener never sees
    // one dispatched at <html> — binding directly to document is the
    // standard way to detect the pointer crossing the viewport edge.
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("mouseenter", handleEnter);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("mouseenter", handleEnter);
      moveX.current = null;
      moveY.current = null;
    };
  }, [supported]);

  if (!supported) return null;

  const active = Boolean(mode);
  const label = mode ? CURSOR_LABELS[mode] : null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={`fixed left-0 top-0 z-[100] pointer-events-none transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Both layers stay mounted and share one grid cell so the swap is a
          transform/opacity crossfade, never an unmount+mount snap. */}
      <div className="grid place-items-center">
        <div
          className={`[grid-area:1/1] flex items-center justify-center w-6 h-6 transition-[opacity,transform] duration-300 ease-out ${
            active ? "opacity-0 scale-50" : "opacity-100 scale-100"
          }`}
        >
          <span className="relative w-1 h-1 rounded-full bg-[var(--color-ink)]" />
          {!reducedMotion && (
            <span
              aria-hidden="true"
              className="absolute w-full h-full rounded-full border-t border-[var(--color-ink)]/35 animate-star-spin"
              style={{ clipPath: "inset(0 0 40% 0)" }}
            />
          )}
        </div>

        <div
          className={`[grid-area:1/1] flex items-center justify-center min-w-16 px-3 py-1.5 rounded-full border border-[var(--color-accent)] bg-[var(--color-bg-base)]/80 transition-[opacity,transform] duration-300 ease-out ${
            active ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
        >
          <span className="text-[10px] font-light uppercase tracking-widest text-[var(--color-accent)] whitespace-nowrap">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Cursor;
