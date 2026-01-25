// src/context/TodoContext.jsx
import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import {
    createTodo,
    deleteTodo,
    getTodos,
    toggleTodo,
    updateTodo,
} from "../services/apiClient";
import { useAuth } from "./AuthContext";

const TodoContext = createContext(null);

export const FILTERS = {
    ALL: "all",
    TODO: "todo",
    DONE: "done",
};

const initialState = {
    todos: [],
    filter: FILTERS.ALL,
    loading: false,
    error: "",
};

function todoReducer(state, action) {
    switch (action.type) {
        case "RESET":
            return { ...initialState };

        case "CLEAR_ERROR":
            return { ...state, error: "" };

        case "SET_FILTER":
            return { ...state, filter: action.payload };

        case "FETCH_START":
            return { ...state, loading: true, error: "" };

        case "FETCH_SUCCESS":
            return { ...state, loading: false, todos: action.payload ?? [] };

        case "FETCH_ERROR":
            return { ...state, loading: false, error: action.payload || "載入代辦清單失敗" };

        // --------- CREATE (optimistic) ---------
        case "CREATE_OPTIMISTIC":
            return { ...state, error: "", todos: [...state.todos, action.payload] };

        case "CREATE_COMMIT": {
            const { tempId, created } = action.payload;
            return {
                ...state,
                todos: state.todos.map((t) => (t.id === tempId ? created : t)),
            };
        }

        case "CREATE_ROLLBACK": {
            const { tempId, message } = action.payload;
            return {
                ...state,
                error: message || "新增失敗",
                todos: state.todos.filter((t) => t.id !== tempId),
            };
        }

        // --------- DELETE (optimistic) ---------
        case "DELETE_OPTIMISTIC":
            return { ...state, error: "", todos: state.todos.filter((t) => t.id !== action.payload) };

        case "DELETE_ROLLBACK": {
            const { snapshot, message } = action.payload;
            return { ...state, error: message || "刪除失敗", todos: snapshot };
        }

        // --------- TOGGLE (optimistic) ---------
        case "TOGGLE_OPTIMISTIC":
            return {
                ...state,
                error: "",
                todos: state.todos.map((t) =>
                    t.id === action.payload ? { ...t, status: !t.status } : t
                ),
            };

        case "TOGGLE_ROLLBACK": {
            const { snapshot, message } = action.payload;
            return { ...state, error: message || "切換狀態失敗", todos: snapshot };
        }

        // --------- EDIT (optimistic) ---------
        case "EDIT_OPTIMISTIC": {
            const { id, content } = action.payload;
            return {
                ...state,
                error: "",
                todos: state.todos.map((t) => (t.id === id ? { ...t, content } : t)),
            };
        }

        case "EDIT_ROLLBACK": {
            const { snapshot, message } = action.payload;
            return { ...state, error: message || "更新內容失敗", todos: snapshot };
        }

        default:
            return state;
    }
}

export function TodoProvider({ children }) {
    const { isAuthed, isChecking } = useAuth();

    const [state, dispatch] = useReducer(todoReducer, initialState);

    const filteredTodos = useMemo(() => {
        if (state.filter === FILTERS.TODO) return state.todos.filter((t) => t.status === false);
        if (state.filter === FILTERS.DONE) return state.todos.filter((t) => t.status === true);
        return state.todos;
    }, [state.todos, state.filter]);

    const refreshTodos = async () => {
        dispatch({ type: "FETCH_START" });

        try {
            const res = await getTodos();
            dispatch({ type: "FETCH_SUCCESS", payload: res.data?.data ?? [] });
            return true;
        } catch (err) {
            dispatch({
                type: "FETCH_ERROR",
                payload: err.response?.data?.message || "載入代辦清單失敗",
            });
            return false;
        }
    };

    // 登入後載入；登出清空
    useEffect(() => {
        if (isChecking) return;

        if (!isAuthed) {
            dispatch({ type: "RESET" });
            return;
        }

        refreshTodos();
    }, [isChecking, isAuthed]);

    // -------------------------
    // CRUD（含樂觀更新 + 回滾）
    // -------------------------

    const addTodo = async (content) => {
        const trimmed = content.trim();
        if (!trimmed) return false;

        const tempId = `temp-${Date.now()}`;
        const tempTodo = {
            id: tempId,
            content: trimmed,
            status: false,
            createTime: Math.floor(Date.now() / 1000),
            __temp: true,
        };

        dispatch({ type: "CREATE_OPTIMISTIC", payload: tempTodo });

        try {
            const res = await createTodo(trimmed);
            const created = res.data?.data;

            if (created?.id) {
                dispatch({ type: "CREATE_COMMIT", payload: { tempId, created } });
            } else {
                // 後端沒回完整 todo → 直接重載一次，避免 UI 與伺服器不一致
                await refreshTodos();
            }

            return true;
        } catch (err) {
            dispatch({
                type: "CREATE_ROLLBACK",
                payload: {
                    tempId,
                    message: err.response?.data?.message || "新增失敗",
                },
            });
            return false;
        }
    };

    const removeTodo = async (id) => {
        const snapshot = state.todos;

        dispatch({ type: "DELETE_OPTIMISTIC", payload: id });

        try {
            await deleteTodo(id);
            return true;
        } catch (err) {
            dispatch({
                type: "DELETE_ROLLBACK",
                payload: {
                    snapshot,
                    message: err.response?.data?.message || "刪除失敗",
                },
            });
            return false;
        }
    };

    const toggleTodoStatus = async (id) => {
        const snapshot = state.todos;

        dispatch({ type: "TOGGLE_OPTIMISTIC", payload: id });

        try {
            await toggleTodo(id);
            return true;
        } catch (err) {
            dispatch({
                type: "TOGGLE_ROLLBACK",
                payload: {
                    snapshot,
                    message: err.response?.data?.message || "切換狀態失敗",
                },
            });
            return false;
        }
    };

    const editTodoContent = async (id, content) => {
        const trimmed = content.trim();
        if (!trimmed) return false;

        const snapshot = state.todos;

        dispatch({ type: "EDIT_OPTIMISTIC", payload: { id, content: trimmed } });

        try {
            await updateTodo(id, trimmed);
            return true;
        } catch (err) {
            dispatch({
                type: "EDIT_ROLLBACK",
                payload: {
                    snapshot,
                    message: err.response?.data?.message || "更新內容失敗",
                },
            });
            return false;
        }
    };

    const setFilter = (next) => {
        dispatch({ type: "SET_FILTER", payload: next });
    };

    const value = useMemo(
        () => ({
            // state
            todos: state.todos,
            filter: state.filter,
            filteredTodos,
            loading: state.loading,
            error: state.error,

            // actions
            setFilter,
            refreshTodos,
            addTodo,
            removeTodo,
            toggleTodoStatus,
            editTodoContent,

            clearError: () => dispatch({ type: "CLEAR_ERROR" }),
        }),
        [state.todos, state.filter, state.loading, state.error, filteredTodos]
    );

    return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodos() {
    const ctx = useContext(TodoContext);
    if (!ctx) throw new Error("useTodos must be used within TodoProvider");
    return ctx;
}
