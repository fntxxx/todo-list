// src/context/TodoContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createTodo, deleteTodo, getTodos, toggleTodo, updateTodo } from "../services/apiClient";
import { useAuth } from "./AuthContext";

const TodoContext = createContext(null);

export const FILTERS = {
    ALL: "all",
    TODO: "todo",
    DONE: "done",
};

export function TodoProvider({ children }) {
    const { isAuthed, isChecking } = useAuth();

    const [todos, setTodos] = useState([]);
    const [filter, setFilter] = useState(FILTERS.ALL);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const refreshTodos = async () => {
        setError("");
        setLoading(true);
        try {
            const res = await getTodos();
            setTodos(res.data?.data ?? []);
        } catch (err) {
            setError(err.response?.data?.message || "載入代辦清單失敗");
        } finally {
            setLoading(false);
        }
    };

    // 登入後載入；登出清空
    useEffect(() => {
        if (isChecking) return;

        if (!isAuthed) {
            setTodos([]);
            setFilter(FILTERS.ALL);
            setError("");
            setLoading(false);
            return;
        }

        refreshTodos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isChecking, isAuthed]);

    const filteredTodos = useMemo(() => {
        if (filter === FILTERS.TODO) return todos.filter((t) => t.status === false);
        if (filter === FILTERS.DONE) return todos.filter((t) => t.status === true);
        return todos;
    }, [todos, filter]);

    // -------------------------
    // CRUD（含樂觀更新 + 回滾）
    // -------------------------

    const addTodo = async (content) => {
        const trimmed = content.trim();
        if (!trimmed) return false;

        setError("");

        // 樂觀新增：先塞一筆臨時資料
        const tempId = `temp-${Date.now()}`;
        const tempTodo = {
            id: tempId,
            content: trimmed,
            status: false,
            createTime: Math.floor(Date.now() / 1000),
            __temp: true,
        };

        setTodos((prev) => [...prev, tempTodo]);

        try {
            const res = await createTodo(trimmed);
            const created = res.data?.data; // 依你 API 回傳格式（通常會回新增後物件）

            // 如果後端有回完整 todo，就用它替換 temp；沒有就直接 refresh
            if (created?.id) {
                setTodos((prev) => prev.map((t) => (t.id === tempId ? created : t)));
            } else {
                await refreshTodos();
            }

            return true;
        } catch (err) {
            // 回滾：移除 temp
            setTodos((prev) => prev.filter((t) => t.id !== tempId));
            setError(err.response?.data?.message || "新增失敗");
            return false;
        }
    };

    const removeTodo = async (id) => {
        setError("");

        // 樂觀刪除：先拿掉
        const snapshot = todos;
        setTodos((prev) => prev.filter((t) => t.id !== id));

        try {
            await deleteTodo(id);
            return true;
        } catch (err) {
            // 回滾
            setTodos(snapshot);
            setError(err.response?.data?.message || "刪除失敗");
            return false;
        }
    };

    const toggleTodoStatus = async (id) => {
        setError("");

        // 樂觀切換：先反轉
        const snapshot = todos;
        setTodos((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: !t.status } : t))
        );

        try {
            await toggleTodo(id);
            return true;
        } catch (err) {
            // 回滾
            setTodos(snapshot);
            setError(err.response?.data?.message || "切換狀態失敗");
            return false;
        }
    };

    const editTodoContent = async (id, content) => {
        const trimmed = content.trim();
        if (!trimmed) return false;

        setError("");

        // 樂觀更新：先改字
        const snapshot = todos;
        setTodos((prev) =>
            prev.map((t) => (t.id === id ? { ...t, content: trimmed } : t))
        );

        try {
            await updateTodo(id, trimmed);
            return true;
        } catch (err) {
            // 回滾
            setTodos(snapshot);
            setError(err.response?.data?.message || "更新內容失敗");
            return false;
        }
    };

    const value = useMemo(
        () => ({
            // state
            todos,
            filter,
            filteredTodos,
            loading,
            error,

            // setters
            setTodos,
            setFilter,

            // actions
            refreshTodos,
            addTodo,
            removeTodo,
            toggleTodoStatus,
            editTodoContent,
        }),
        [todos, filter, filteredTodos, loading, error]
    );

    return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodos() {
    const ctx = useContext(TodoContext);
    if (!ctx) throw new Error("useTodos must be used within TodoProvider");
    return ctx;
}
