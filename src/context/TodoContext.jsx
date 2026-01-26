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

import { FILTERS, initialState } from "./todo/todoInitialState";
import { TODO_ACTIONS } from "./todo/todoTypes";
import { todoReducer } from "./todo/todoReducer";
import { selectFilteredTodos, selectLegacyError } from "./todo/todoSelectors";

const TodoContext = createContext(null);

export { FILTERS };

export function TodoProvider({ children }) {
    const { isAuthed, isChecking } = useAuth();
    const [state, dispatch] = useReducer(todoReducer, initialState);

    const filteredTodos = useMemo(() => {
        return selectFilteredTodos(state.todos, state.filter);
    }, [state.todos, state.filter]);

    const legacyError = useMemo(() => {
        return selectLegacyError(state);
    }, [state.fetchError, state.mutateError, state.createError]);

    const refreshTodos = async () => {
        dispatch({ type: TODO_ACTIONS.FETCH_REQUEST_START });

        try {
            const res = await getTodos();
            dispatch({ type: TODO_ACTIONS.FETCH_SUCCESS, payload: res.data?.data ?? [] });
            return true;
        } catch (err) {
            dispatch({
                type: TODO_ACTIONS.FETCH_FAIL,
                payload: err.response?.data?.message || "載入代辦清單失敗",
            });
            return false;
        }
    };

    // 登入後載入；登出清空
    useEffect(() => {
        if (isChecking) return;

        if (!isAuthed) {
            dispatch({ type: TODO_ACTIONS.STATE_RESET });
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

        dispatch({ type: TODO_ACTIONS.CREATE_REQUEST_START });

        const tempId = `temp-${Date.now()}`;
        const tempTodo = {
            id: tempId,
            content: trimmed,
            status: false,
            createTime: Math.floor(Date.now() / 1000),
            __temp: true,
        };

        dispatch({ type: TODO_ACTIONS.CREATE_OPTIMISTIC_ADD, payload: tempTodo });

        try {
            const res = await createTodo(trimmed);
            const created = res.data?.data;

            if (created?.id) {
                dispatch({
                    type: TODO_ACTIONS.CREATE_OPTIMISTIC_COMMIT,
                    payload: { tempId, created },
                });
            } else {
                await refreshTodos();
            }

            return true;
        } catch (err) {
            dispatch({
                type: TODO_ACTIONS.CREATE_OPTIMISTIC_ROLLBACK,
                payload: {
                    tempId,
                    message: err.response?.data?.message || "新增失敗",
                },
            });
            return false;
        } finally {
            dispatch({ type: TODO_ACTIONS.CREATE_REQUEST_END });
        }
    };

    const removeTodo = async (id) => {
        if (state.mutateLoading) return false;

        dispatch({ type: TODO_ACTIONS.MUTATE_REQUEST_START });

        const snapshot = state.todos;
        dispatch({ type: TODO_ACTIONS.DELETE_OPTIMISTIC_REMOVE, payload: id });

        try {
            await deleteTodo(id);
            return true;
        } catch (err) {
            dispatch({
                type: TODO_ACTIONS.DELETE_OPTIMISTIC_ROLLBACK,
                payload: {
                    snapshot,
                    message: err.response?.data?.message || "刪除失敗",
                },
            });
            return false;
        } finally {
            dispatch({ type: TODO_ACTIONS.MUTATE_REQUEST_END });
        }
    };

    const toggleTodoStatus = async (id) => {
        if (state.mutateLoading) return false;

        dispatch({ type: TODO_ACTIONS.MUTATE_REQUEST_START });

        const snapshot = state.todos;
        dispatch({ type: TODO_ACTIONS.TOGGLE_OPTIMISTIC_FLIP, payload: id });

        try {
            await toggleTodo(id);
            return true;
        } catch (err) {
            dispatch({
                type: TODO_ACTIONS.TOGGLE_OPTIMISTIC_ROLLBACK,
                payload: {
                    snapshot,
                    message: err.response?.data?.message || "切換狀態失敗",
                },
            });
            return false;
        } finally {
            dispatch({ type: TODO_ACTIONS.MUTATE_REQUEST_END });
        }
    };

    const editTodoContent = async (id, content) => {
        const trimmed = content.trim();
        if (!trimmed) return false;
        if (state.mutateLoading) return false;

        dispatch({ type: TODO_ACTIONS.MUTATE_REQUEST_START });

        const snapshot = state.todos;
        dispatch({
            type: TODO_ACTIONS.EDIT_OPTIMISTIC_UPDATE,
            payload: { id, content: trimmed },
        });

        try {
            await updateTodo(id, trimmed);
            return true;
        } catch (err) {
            dispatch({
                type: TODO_ACTIONS.EDIT_OPTIMISTIC_ROLLBACK,
                payload: {
                    snapshot,
                    message: err.response?.data?.message || "更新內容失敗",
                },
            });
            return false;
        } finally {
            dispatch({ type: TODO_ACTIONS.MUTATE_REQUEST_END });
        }
    };

    const setFilter = (next) => {
        dispatch({ type: TODO_ACTIONS.FILTER_SET, payload: next });
    };

    const value = useMemo(
        () => ({
            // state
            todos: state.todos,
            filter: state.filter,
            filteredTodos,

            // 相容舊 UI：loading 仍代表「載入清單」
            loading: state.fetchLoading,

            // request states
            fetchLoading: state.fetchLoading,
            createLoading: state.createLoading,
            mutateLoading: state.mutateLoading,

            error: legacyError,

            // actions
            setFilter,
            refreshTodos,
            addTodo,
            removeTodo,
            toggleTodoStatus,
            editTodoContent,

            clearError: () => dispatch({ type: TODO_ACTIONS.ERROR_CLEAR }),
        }),
        [
            state.todos,
            state.filter,
            state.fetchLoading,
            state.createLoading,
            state.mutateLoading,
            legacyError,
            filteredTodos,
        ]
    );

    return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodos() {
    const ctx = useContext(TodoContext);
    if (!ctx) throw new Error("useTodos must be used within TodoProvider");
    return ctx;
}
