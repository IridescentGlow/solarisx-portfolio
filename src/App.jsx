import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProjectPage from "./pages/ProjectPage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/projects/:slug" element={<ProjectPage />} />
    </Routes>
  );
};

export default App;
