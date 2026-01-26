// src/routes/guards.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingState from "../components/common/LoadingState";

export function PrivateRoute() {
    const { isAuthed, isChecking } = useAuth();

    if (isChecking) return <LoadingState />;
    if (!isAuthed) return <Navigate to="/auth/signin" replace />;

    return <Outlet />;
}

export function PublicOnlyRoute() {
    const { isAuthed, isChecking } = useAuth();

    if (isChecking) return <LoadingState />;
    if (isAuthed) return <Navigate to="/todo" replace />;

    return <Outlet />;
}
