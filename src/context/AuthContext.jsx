// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { checkToken, signOut as signOutApi } from "../services/apiClient";

const AuthContext = createContext(null);

const initialState = {
    authStatus: "checking", // checking | authed | guest
    user: null, // { uid, nickname } | null
};

function authReducer(state, action) {
    switch (action.type) {
        case "AUTH/INIT/REQUEST_START":
            return { ...state, authStatus: "checking", user: null };

        case "AUTH/INIT/SUCCESS_GUEST":
            return { ...state, authStatus: "guest", user: null };

        case "AUTH/INIT/SUCCESS_AUTHED":
            return { ...state, authStatus: "authed", user: action.payload ?? null };

        case "AUTH/SIGN_OUT":
            return { ...state, authStatus: "guest", user: null };

        // 讓 AuthPageContext 能維持目前用法（登入成功直接塞狀態）
        case "AUTH/STATUS/SET":
            return { ...state, authStatus: action.payload };

        case "AUTH/USER/SET":
            return { ...state, user: action.payload };

        default:
            return state;
    }
}

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const init = async () => {
            dispatch({ type: "AUTH/INIT/REQUEST_START" });

            const token = localStorage.getItem("token");
            if (!token) {
                dispatch({ type: "AUTH/INIT/SUCCESS_GUEST" });
                return;
            }

            try {
                const res = await checkToken();
                dispatch({
                    type: "AUTH/INIT/SUCCESS_AUTHED",
                    payload: {
                        uid: res.data?.uid ?? null,
                        nickname: res.data?.nickname ?? "",
                    },
                });
            } catch {
                localStorage.removeItem("token");
                dispatch({ type: "AUTH/INIT/SUCCESS_GUEST" });
            }
        };

        init();
    }, []);

    const signOut = async () => {
        try {
            await signOutApi();
        } catch {
            // 忽略（就算後端登出失敗，前端仍要清掉狀態）
        } finally {
            localStorage.removeItem("token");
            dispatch({ type: "AUTH/SIGN_OUT" });
        }
    };

    const setAuthStatus = (nextStatus) => {
        dispatch({ type: "AUTH/STATUS/SET", payload: nextStatus });
    };

    const setUser = (nextUser) => {
        dispatch({ type: "AUTH/USER/SET", payload: nextUser });
    };

    const value = useMemo(
        () => ({
            authStatus: state.authStatus,
            isAuthed: state.authStatus === "authed",
            isChecking: state.authStatus === "checking",
            user: state.user,

            setAuthStatus,
            setUser,

            signOut,
        }),
        [state.authStatus, state.user]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
