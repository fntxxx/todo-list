// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { checkToken, signOut as signOutApi } from "../services/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [authStatus, setAuthStatus] = useState("checking"); // checking | authed | guest
    const [user, setUser] = useState(null); // { uid, nickname } | null

    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setAuthStatus("guest");
                setUser(null);
                return;
            }

            try {
                const res = await checkToken();
                setAuthStatus("authed");

                setUser({
                    uid: res.data?.uid ?? null,
                    nickname: res.data?.nickname ?? "",
                });
            } catch {
                localStorage.removeItem("token");
                setAuthStatus("guest");
                setUser(null);
            }
        };

        init();
    }, []);

    const signOut = async () => {
        try {
            await signOutApi();
        } catch {
            // 忽略
        } finally {
            localStorage.removeItem("token");
            setAuthStatus("guest");
            setUser(null);
        }
    };

    const value = useMemo(
        () => ({
            authStatus,
            isAuthed: authStatus === "authed",
            isChecking: authStatus === "checking",
            user,
            setUser,         // ✅ 讓登入成功可直接塞 nickname
            setAuthStatus,
            signOut,
        }),
        [authStatus, user]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
