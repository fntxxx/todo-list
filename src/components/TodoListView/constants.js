// components/TodoListView/constants.js
import { FILTERS } from "../../context/TodoContext";

export const FILTER_ITEMS = [
    { value: FILTERS.ALL, label: "全部" },
    { value: FILTERS.TODO, label: "待完成" },
    { value: FILTERS.DONE, label: "已完成" },
];
