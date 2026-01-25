// pages/TodoList/TodoPageContext.jsx
import { createContext, useContext, useMemo } from "react";
import { useTodos } from "../../context/TodoContext";

const TodoPageContext = createContext(null);

export function TodoPageProvider({ children }) {
    const {
        todos,
        filteredTodos,
        filter,
        setFilter,
        loading,
        createLoading,
        mutateLoading,
        error,
        refreshTodos,
        addTodo,
        removeTodo,
        toggleTodoStatus,
        editTodoContent,
    } = useTodos();

    const remainingCount = todos.filter((t) => t.status === false).length;
    const totalCount = todos.length;

    const value = useMemo(
        () => ({
            filter,
            setFilter,
            todos: filteredTodos,
            loading,
            createLoading,
            mutateLoading,
            error,
            refreshTodos,
            remainingCount,
            totalCount,
            addTodo,
            removeTodo,
            toggleTodoStatus,
            editTodoContent,
        }),
        [
            filter,
            setFilter,
            filteredTodos,
            loading,
            createLoading,
            mutateLoading,
            error,
            refreshTodos,
            remainingCount,
            totalCount,
            addTodo,
            removeTodo,
            toggleTodoStatus,
            editTodoContent,
        ]
    );

    return <TodoPageContext.Provider value={value}>{children}</TodoPageContext.Provider>;
}

export function useTodoPage() {
    const ctx = useContext(TodoPageContext);
    if (!ctx) throw new Error("useTodoPage must be used within TodoPageProvider");
    return ctx;
}