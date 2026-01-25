// src/context/todo/todoSelectors.js
import { FILTERS } from "./todoInitialState";

export function selectFilteredTodos(todos, filter) {
    if (filter === FILTERS.TODO) return todos.filter((t) => t.status === false);
    if (filter === FILTERS.DONE) return todos.filter((t) => t.status === true);
    return todos;
}