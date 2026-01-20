//App.jsx
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/Auth";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth/:type" element={<AuthPage />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;