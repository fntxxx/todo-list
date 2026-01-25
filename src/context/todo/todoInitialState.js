// src/context/todo/todoInitialState.js
export const FILTERS = {
    ALL: "all",
    TODO: "todo",
    DONE: "done",
};

export const initialState = {
    todos: [],
    filter: FILTERS.ALL,

    fetchLoading: false,
    createLoading: false,

    error: "",
};
