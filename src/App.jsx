import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/Auth";

function App() {
  return (
    <Router basename="/todo-list">
      <Routes>
        <Route path="/auth/:type" element={<AuthPage />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;