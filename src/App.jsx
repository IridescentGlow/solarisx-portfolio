import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProjectPage from "./pages/ProjectPage";
import ScrollToTop from "./components/ScrollToTop";
import Cursor from "./components/Cursor";

const App = () => {
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
