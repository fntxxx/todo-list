// src/routes/guards.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function PrivateRoute() {
    const { isAuthed, isChecking } = useAuth();

    if (isChecking) return <div>載入中...</div>;
    if (!isAuthed) return <Navigate to="/auth/signin" replace />;

    return <Outlet />;
}

export function PublicOnlyRoute() {
    const { isAuthed, isChecking } = useAuth();

    if (isChecking) return <div>載入中...</div>;
    if (isAuthed) return <Navigate to="/todo" replace />;

    return <Outlet />;
}
