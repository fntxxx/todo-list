// pages/Auth/AuthContext.jsx
import { createContext, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signUp } from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";

const AuthPageContext = createContext(null);

export function AuthPageProvider({ children }) {
    const navigate = useNavigate();
    const { setAuthStatus, setUser } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const signInAction = async ({ email, password }) => {
        setError("");
        setLoading(true);

        try {
            const res = await signIn({ email, password });

            const token = res.data?.token;
            const nickname = res.data?.nickname;
            if (!token) throw new Error("登入失敗");

            localStorage.setItem("token", token);

            // ✅ 立刻把全站狀態切成已登入（不用重整）
            setAuthStatus("authed");
            setUser({
                uid: null,
                nickname: nickname ?? "",
            });

            navigate("/todo");
            return true;
        } catch (err) {
            setError(err.response?.data?.message || "登入失敗，請確認帳號密碼");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const signUpAction = async ({ email, nickname, password, confirmPassword }) => {
        setError("");

        if (password !== confirmPassword) {
            setError("兩次輸入的密碼不一致");
            return false;
        }

        setLoading(true);

        try {
            const res = await signUp({ email, nickname, password });

            if (!res.data?.status) throw new Error("註冊失敗");

            navigate("/auth/signin");
            return true;
        } catch (err) {
            setError(err.response?.data?.message || "註冊失敗，請稍後再試");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const value = useMemo(
        () => ({
            loading,
            error,
            setError,
            signInAction,
            signUpAction,
        }),
        [loading, error]
    );

    return <AuthPageContext.Provider value={value}>{children}</AuthPageContext.Provider>;
}

export function useAuthPage() {
    const ctx = useContext(AuthPageContext);
    if (!ctx) throw new Error("useAuthPage must be used within AuthPageProvider");
    return ctx;
}
