// pages/Auth/AuthContext.jsx
import { createContext, useContext, useMemo, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signUp } from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";

const AuthPageContext = createContext(null);

const initialState = {
    loading: false,
    error: "",
};

function authPageReducer(state, action) {
    switch (action.type) {
        case "ERROR/CLEAR":
            return { ...state, error: "" };

        case "ERROR/SET":
            return { ...state, error: action.payload || "" };

        case "AUTH/SUBMIT/REQUEST_START":
            return { ...state, loading: true, error: "" };

        case "AUTH/SUBMIT/REQUEST_END":
            return { ...state, loading: false };

        default:
            return state;
    }
}

export function AuthPageProvider({ children }) {
    const navigate = useNavigate();
    const { setAuthStatus, setUser } = useAuth();

    const [state, dispatch] = useReducer(authPageReducer, initialState);

    const setError = (message) => {
        dispatch({ type: "ERROR/SET", payload: message });
    };

    const clearError = () => {
        dispatch({ type: "ERROR/CLEAR" });
    };

    const signInAction = async ({ email, password }) => {
        clearError();
        dispatch({ type: "AUTH/SUBMIT/REQUEST_START" });

        try {
            const res = await signIn({ email, password });

            const token = res.data?.token;
            const nickname = res.data?.nickname;

            if (!token) throw new Error("登入失敗");

            localStorage.setItem("token", token);

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
            dispatch({ type: "AUTH/SUBMIT/REQUEST_END" });
        }
    };

    const signUpAction = async ({ email, nickname, password, confirmPassword }) => {
        clearError();

        if (password !== confirmPassword) {
            setError("兩次輸入的密碼不一致");
            return false;
        }

        dispatch({ type: "AUTH/SUBMIT/REQUEST_START" });

        try {
            const res = await signUp({ email, nickname, password });

            if (!res.data?.status) throw new Error("註冊失敗");

            navigate("/auth/signin");
            return true;
        } catch (err) {
            setError(err.response?.data?.message || "註冊失敗，請稍後再試");
            return false;
        } finally {
            dispatch({ type: "AUTH/SUBMIT/REQUEST_END" });
        }
    };

    const value = useMemo(
        () => ({
            loading: state.loading,
            error: state.error,
            setError,
            signInAction,
            signUpAction,
        }),
        [state.loading, state.error]
    );

    return <AuthPageContext.Provider value={value}>{children}</AuthPageContext.Provider>;
}

export function useAuthPage() {
    const ctx = useContext(AuthPageContext);
    if (!ctx) throw new Error("useAuthPage must be used within AuthPageProvider");
    return ctx;
}
