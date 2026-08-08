// Theme resolution and persistence. Deliberately not a library: the whole
// design system is already CSS variables (index.css), so a theme is just
// which set of those variables is active. All this has to do is decide the
// value of one attribute on <html>.
//
// The matching inline script in index.html runs this same resolution before
// first paint. Keep the two in sync — that script is what prevents a flash
// of the wrong theme, and it cannot import from here because it must run
// before the bundle loads.

export const THEME_STORAGE_KEY = "solarisx-theme";
export const THEMES = ["dark", "light"];

// Explicit user choice wins; otherwise follow the OS. No stored value means
// "not chosen yet", which is different from having chosen dark.
export const resolveTheme = () => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (THEMES.includes(saved)) return saved;
  } catch {
    // Private mode / storage disabled — fall through to the system value.
  }
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  ) {
    return "light";
  }
  return "dark";
};

export const applyTheme = (theme) => {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  // Keep the browser UI (address bar, form controls) in step with the page.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "light" ? "#efebe2" : "#0b0a09");
  root.style.colorScheme = theme;
};

export const storeTheme = (theme) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Persistence is a nicety; the page still themes correctly without it.
  }
};
