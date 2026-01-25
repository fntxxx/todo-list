// src/context/todo/todoReducer.js
import { initialState } from "./todoInitialState";
import { TODO_ACTIONS } from "./todoTypes";

export function todoReducer(state, action) {
    switch (action.type) {
        case TODO_ACTIONS.STATE_RESET:
            return { ...initialState };

        case TODO_ACTIONS.ERROR_CLEAR:
            return { ...state, error: "" };

        case TODO_ACTIONS.FILTER_SET:
            return { ...state, filter: action.payload };

        // --------- FETCH ---------
        case TODO_ACTIONS.FETCH_REQUEST_START:
            return { ...state, fetchLoading: true, error: "" };

        case TODO_ACTIONS.FETCH_SUCCESS:
            return {
                ...state,
                fetchLoading: false,
                todos: action.payload ?? [],
            };

        case TODO_ACTIONS.FETCH_FAIL:
            return {
                ...state,
                fetchLoading: false,
                error: action.payload || "載入代辦清單失敗",
            };

        // --------- CREATE request state ---------
        case TODO_ACTIONS.CREATE_REQUEST_START:
            return { ...state, createLoading: true, error: "" };

        case TODO_ACTIONS.CREATE_REQUEST_END:
            return { ...state, createLoading: false };

        // --------- CREATE (optimistic) ---------
        case TODO_ACTIONS.CREATE_OPTIMISTIC_ADD:
            return { ...state, error: "", todos: [...state.todos, action.payload] };

        case TODO_ACTIONS.CREATE_OPTIMISTIC_COMMIT: {
            const { tempId, created } = action.payload;
            return {
                ...state,
                todos: state.todos.map((t) => (t.id === tempId ? created : t)),
            };
        }

        case TODO_ACTIONS.CREATE_OPTIMISTIC_ROLLBACK: {
            const { tempId, message } = action.payload;
            return {
                ...state,
                error: message || "新增失敗",
                todos: state.todos.filter((t) => t.id !== tempId),
            };
        }

        // --------- DELETE (optimistic) ---------
        case TODO_ACTIONS.DELETE_OPTIMISTIC_REMOVE:
            return {
                ...state,
                error: "",
                todos: state.todos.filter((t) => t.id !== action.payload),
            };

        case TODO_ACTIONS.DELETE_OPTIMISTIC_ROLLBACK: {
            const { snapshot, message } = action.payload;
            return { ...state, error: message || "刪除失敗", todos: snapshot };
        }

        // --------- TOGGLE (optimistic) ---------
        case TODO_ACTIONS.TOGGLE_OPTIMISTIC_FLIP:
            return {
                ...state,
                error: "",
                todos: state.todos.map((t) =>
                    t.id === action.payload ? { ...t, status: !t.status } : t
                ),
            };

        case TODO_ACTIONS.TOGGLE_OPTIMISTIC_ROLLBACK: {
            const { snapshot, message } = action.payload;
            return { ...state, error: message || "切換狀態失敗", todos: snapshot };
        }

        // --------- EDIT (optimistic) ---------
        case TODO_ACTIONS.EDIT_OPTIMISTIC_UPDATE: {
            const { id, content } = action.payload;
            return {
                ...state,
                error: "",
                todos: state.todos.map((t) => (t.id === id ? { ...t, content } : t)),
            };
        }

        case TODO_ACTIONS.EDIT_OPTIMISTIC_ROLLBACK: {
            const { snapshot, message } = action.payload;
            return { ...state, error: message || "更新內容失敗", todos: snapshot };
        }

        default:
            return state;
    }
}