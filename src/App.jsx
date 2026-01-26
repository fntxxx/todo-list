// src/App.jsx
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/Auth";
import TodoListPage from "./pages/TodoList";
import { PrivateRoute, PublicOnlyRoute } from "./routes/guards";

function App() {
  return (
    <Router>
      <Routes>
        {/* 進站先去 /todo，交給 guard 決定要不要導去 auth */}
        <Route path="/" element={<Navigate to="/todo" replace />} />

        {/* 未登入才能進 auth；已登入會被導回 /todo */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/auth/:type" element={<AuthPage />} />
        </Route>

        {/* 只有已登入才能進 todo */}
        <Route element={<PrivateRoute />}>
          <Route path="/todo" element={<TodoListPage />} />
        </Route>

        {/* * 一律導到 /todo */}
        <Route path="*" element={<Navigate to="/todo" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
