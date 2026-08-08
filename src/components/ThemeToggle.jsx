import { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { applyTheme, resolveTheme, storeTheme } from "../lib/theme";

// Deliberately not a switch/track control — nothing else on this site looks
// like a settings widget. It borrows the burger's language exactly: the same
// circle, the same --color-surface-2 fill, the same fixed corner. It is sized
// a step smaller so it stays subordinate to the primary nav action rather
// than competing with it.
//
// `className` carries only positioning, because the two call sites need
// different corners: on the home page the burger already owns the top-right,
// so this sits to its left; on a project page the corner is free.
const ThemeToggle = ({ className = "" }) => {
  // index.html has already resolved and applied the theme before paint; this
  // reads that decision back rather than re-deciding it, so React never
  // disagrees with what is on screen.
  const [theme, setTheme] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.getAttribute("data-theme") || resolveTheme()
      : "dark"
  );

  // Follow the OS while the visitor has not made an explicit choice. Once
  // they pick a side, storeTheme writes a value and this stops overriding it.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      let saved = null;
      try {
        saved = localStorage.getItem("solarisx-theme");
      } catch {
        saved = null;
      }
      if (saved) return;
      const next = mq.matches ? "light" : "dark";
      setTheme(next);
      applyTheme(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    storeTheme(next);
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`fixed z-50 flex items-center justify-center rounded-full cursor-pointer bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] w-11 h-11 md:w-14 md:h-14 transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${className}`}
    >
      {/* Both icons are always mounted and cross-faded on opacity/rotation
          rather than swapped, so there is no layout shift and no pop. The
          curve is the site's own cinematic bezier. motion-reduce collapses
          the rotation and shortens the fade instead of removing the state
          change, so the control still reads as having switched. */}
      <span className="relative block size-5 md:size-6">
        <Icon
          icon="mdi:weather-night"
          aria-hidden="true"
          className={`absolute inset-0 size-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:duration-150 motion-reduce:rotate-0 ${
            isDark ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
          }`}
        />
        <Icon
          icon="mdi:weather-sunny"
          aria-hidden="true"
          className={`absolute inset-0 size-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:duration-150 motion-reduce:rotate-0 ${
            isDark ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
          }`}
        />
      </span>
    </button>
  );
};

export default ThemeToggle;
