import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router doesn't reset scroll position on a same-tab route change —
// without this, navigating to a page (e.g. a Works row's case study, or
// "Back to Works" from one) would render starting wherever the previous
// page happened to be scrolled to, rather than at the top.
//
// useLayoutEffect (not useEffect) so this runs synchronously before paint —
// and, as a sibling rendered before <Routes> in App.jsx, before the matched
// route's own layout effects (GSAP reveals, ScrollTrigger setup) — so page
// animations never measure against a stale scroll position.
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default ScrollToTop;
