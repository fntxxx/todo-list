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
        case "INIT_START":
            return { ...state, authStatus: "checking", user: null };

        case "INIT_GUEST":
            return { ...state, authStatus: "guest", user: null };

        case "INIT_AUTHED":
            return { ...state, authStatus: "authed", user: action.payload ?? null };

        case "SIGN_OUT":
            return { ...state, authStatus: "guest", user: null };

        // 讓 AuthPageContext 能維持目前用法（登入成功直接塞狀態）
        case "SET_AUTH_STATUS":
            return { ...state, authStatus: action.payload };

        case "SET_USER":
            return { ...state, user: action.payload };

        default:
            return state;
    }
}

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const init = async () => {
            dispatch({ type: "INIT_START" });

            const token = localStorage.getItem("token");
            if (!token) {
                dispatch({ type: "INIT_GUEST" });
                return;
            }

            try {
                const res = await checkToken();
                dispatch({
                    type: "INIT_AUTHED",
                    payload: {
                        uid: res.data?.uid ?? null,
                        nickname: res.data?.nickname ?? "",
                    },
                });
            } catch {
                localStorage.removeItem("token");
                dispatch({ type: "INIT_GUEST" });
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
            dispatch({ type: "SIGN_OUT" });
        }
    };

    const setAuthStatus = (nextStatus) => {
        dispatch({ type: "SET_AUTH_STATUS", payload: nextStatus });
    };

    const setUser = (nextUser) => {
        dispatch({ type: "SET_USER", payload: nextUser });
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
