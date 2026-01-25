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
        case "STATE/RESET":
            return { ...initialState };

        case "ERROR/CLEAR":
            return { ...state, error: "" };

        case "TODO/FILTER/SET":
            return { ...state, filter: action.payload };

        case "TODO/FETCH/REQUEST_START":
            return { ...state, loading: true, error: "" };

        case "TODO/FETCH/SUCCESS":
            return { ...state, loading: false, todos: action.payload ?? [] };

        case "TODO/FETCH/FAIL":
            return { ...state, loading: false, error: action.payload || "載入代辦清單失敗" };

        // --------- CREATE (optimistic) ---------
        case "TODO/CREATE/OPTIMISTIC_ADD":
            return { ...state, error: "", todos: [...state.todos, action.payload] };

        case "TODO/CREATE/OPTIMISTIC_COMMIT": {
            const { tempId, created } = action.payload;
            return {
                ...state,
                todos: state.todos.map((t) => (t.id === tempId ? created : t)),
            };
        }

        case "TODO/CREATE/OPTIMISTIC_ROLLBACK": {
            const { tempId, message } = action.payload;
            return {
                ...state,
                error: message || "新增失敗",
                todos: state.todos.filter((t) => t.id !== tempId),
            };
        }

        // --------- DELETE (optimistic) ---------
        case "TODO/DELETE/OPTIMISTIC_REMOVE":
            return { ...state, error: "", todos: state.todos.filter((t) => t.id !== action.payload) };

        case "TODO/DELETE/OPTIMISTIC_ROLLBACK": {
            const { snapshot, message } = action.payload;
            return { ...state, error: message || "刪除失敗", todos: snapshot };
        }

        // --------- TOGGLE (optimistic) ---------
        case "TODO/TOGGLE/OPTIMISTIC_FLIP":
            return {
                ...state,
                error: "",
                todos: state.todos.map((t) =>
                    t.id === action.payload ? { ...t, status: !t.status } : t
                ),
            };

        case "TODO/TOGGLE/OPTIMISTIC_ROLLBACK": {
            const { snapshot, message } = action.payload;
            return { ...state, error: message || "切換狀態失敗", todos: snapshot };
        }

        // --------- EDIT (optimistic) ---------
        case "TODO/EDIT/OPTIMISTIC_UPDATE": {
            const { id, content } = action.payload;
            return {
                ...state,
                error: "",
                todos: state.todos.map((t) => (t.id === id ? { ...t, content } : t)),
            };
        }

        case "TODO/EDIT/OPTIMISTIC_ROLLBACK": {
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
        dispatch({ type: "TODO/FETCH/REQUEST_START" });

        try {
            const res = await getTodos();
            dispatch({ type: "TODO/FETCH/SUCCESS", payload: res.data?.data ?? [] });
            return true;
        } catch (err) {
            dispatch({
                type: "TODO/FETCH/FAIL",
                payload: err.response?.data?.message || "載入代辦清單失敗",
            });
            return false;
        }
    };

    // 登入後載入；登出清空
    useEffect(() => {
        if (isChecking) return;

        if (!isAuthed) {
            dispatch({ type: "STATE/RESET" });
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

        dispatch({ type: "TODO/CREATE/OPTIMISTIC_ADD", payload: tempTodo });

        try {
            const res = await createTodo(trimmed);
            const created = res.data?.data;

            if (created?.id) {
                dispatch({ type: "TODO/CREATE/OPTIMISTIC_COMMIT", payload: { tempId, created } });
            } else {
                // 後端沒回完整 todo → 直接重載一次，避免 UI 與伺服器不一致
                await refreshTodos();
            }

            return true;
        } catch (err) {
            dispatch({
                type: "TODO/CREATE/OPTIMISTIC_ROLLBACK",
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

        dispatch({ type: "TODO/DELETE/OPTIMISTIC_REMOVE", payload: id });

        try {
            await deleteTodo(id);
            return true;
        } catch (err) {
            dispatch({
                type: "TODO/DELETE/OPTIMISTIC_ROLLBACK",
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

        dispatch({ type: "TODO/TOGGLE/OPTIMISTIC_FLIP", payload: id });

        try {
            await toggleTodo(id);
            return true;
        } catch (err) {
            dispatch({
                type: "TODO/TOGGLE/OPTIMISTIC_ROLLBACK",
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

        dispatch({ type: "TODO/EDIT/OPTIMISTIC_UPDATE", payload: { id, content: trimmed } });

        try {
            await updateTodo(id, trimmed);
            return true;
        } catch (err) {
            dispatch({
                type: "TODO/EDIT/OPTIMISTIC_ROLLBACK",
                payload: {
                    snapshot,
                    message: err.response?.data?.message || "更新內容失敗",
                },
            });
            return false;
        }
    };

    const setFilter = (next) => {
        dispatch({ type: "TODO/FILTER/SET", payload: next });
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

            clearError: () => dispatch({ type: "ERROR/CLEAR" }),
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
