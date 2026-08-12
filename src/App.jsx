import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProjectPage from "./pages/ProjectPage";
import ScrollToTop from "./components/ScrollToTop";
import Cursor from "./components/Cursor";
import { useDocumentMeta } from "./lib/useDocumentMeta";

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
        <Route path="/projects/:slug" element={<ProjectPage />} />
      </Routes>
    </>
  );
};

export default App;
