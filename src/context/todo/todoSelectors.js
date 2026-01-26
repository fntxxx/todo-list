// src/context/todo/todoSelectors.js
import { FILTERS } from "./todoInitialState";

export function selectFilteredTodos(todos, filter) {
    if (filter === FILTERS.TODO) return todos.filter((t) => t.status === false);
    if (filter === FILTERS.DONE) return todos.filter((t) => t.status === true);
    return todos;
}

export const selectFetchError = (state) => state.fetchError;
export const selectCreateError = (state) => state.createError;
export const selectMutateError = (state) => state.mutateError;

export const selectLegacyError = (state) =>
    state.fetchError || state.mutateError || state.createError || "";