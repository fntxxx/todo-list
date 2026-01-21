// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { checkToken, signOut as signOutApi } from "../services/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [authStatus, setAuthStatus] = useState("checking"); // checking | authed | guest

    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setAuthStatus("guest");
                return;
            }

            try {
                await checkToken();
                setAuthStatus("authed");
            } catch {
                localStorage.removeItem("token");
                setAuthStatus("guest");
            }
        };

        init();
    }, []);

    const signOut = async () => {
        try {
            await signOutApi();
        } catch {
            // API 失敗也沒關係，前端仍要登出
        } finally {
            localStorage.removeItem("token");
            setAuthStatus("guest");
        }
    };

    const value = useMemo(
        () => ({
            authStatus,
            isAuthed: authStatus === "authed",
            isChecking: authStatus === "checking",
            setAuthStatus, // ✅ 讓登入成功時可即時切換
            signOut,
        }),
        [authStatus]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
