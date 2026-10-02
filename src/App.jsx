import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ScrollToTop from "./components/ScrollToTop";
import Cursor from "./components/Cursor";
import { useDocumentMeta } from "./lib/useDocumentMeta";

// Code-split, not eager-imported like HomePage: ProjectPage pulls in its own
// GSAP ScrollTrigger timelines (chapter stack, Bento assembly, award sweep)
// and a second R3F Canvas (ReelIntro) that "/" never uses. Before this,
// react-router's static import meant ALL of that shipped in the SAME bundle
// "/" has to download, parse and execute before React can render anything —
// including the loading overlay's own text, which is the homepage's actual
// LCP element (BLUEPRINT.md §0.14). Splitting it to its own chunk means a
// visit to "/" no longer pays for a page it isn't showing.
const ProjectPage = lazy(() => import("./pages/ProjectPage"));

const App = () => {
  // Head correctness for client-side navigation only. Cold loads already
  // arrive with the right tags from scripts/prerender-meta.mjs — see seo.js.
  useDocumentMeta();

  return (
    <>
      <Cursor />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/projects/:slug"
          element={
            <Suspense fallback={null}>
              <ProjectPage />
            </Suspense>
          }
        />
      </Routes>
    </>
  );
};

export default App;
