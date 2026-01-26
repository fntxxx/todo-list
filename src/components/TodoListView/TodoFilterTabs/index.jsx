// components/TodoListView/TodoFilterTabs/index.jsx
import { useRef } from "react";
import { useTodoPage } from "../../../pages/TodoList/TodoPageContext";
import { FILTER_ITEMS } from "../constants";
import styles from "./style.module.scss";

export default function TodoFilterTabs() {
    const { filter, setFilter } = useTodoPage();
    const listRef = useRef(null);

    const focusButtonByIndex = (index) => {
        const root = listRef.current;
        if (!root) return;

        const buttons = root.querySelectorAll('button[role="tab"]');
        buttons[index]?.focus?.();
    };

    const handleKeyDown = (e, currentIndex) => {
        const key = e.key;
        const total = FILTER_ITEMS.length;

        const isNavKey =
            key === "ArrowLeft" ||
            key === "ArrowRight" ||
            key === "Home" ||
            key === "End";

        if (!isNavKey) return;

        e.preventDefault();

        let nextIndex = currentIndex;

        if (key === "ArrowLeft") nextIndex = (currentIndex - 1 + total) % total;
        if (key === "ArrowRight") nextIndex = (currentIndex + 1) % total;
        if (key === "Home") nextIndex = 0;
        if (key === "End") nextIndex = total - 1;

        const next = FILTER_ITEMS[nextIndex];
        setFilter(next.value);
        focusButtonByIndex(nextIndex);
    };

    return (
        <header className={styles.todoHeader}>
            <ul
                ref={listRef}
                className={styles.filterList}
                role="tablist"
                aria-label="代辦事項篩選"
            >
                {FILTER_ITEMS.map((item, idx) => {
                    const isSelected = filter === item.value;

                    return (
                        <li key={item.value} className={styles.filterItem}>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={isSelected}
                                tabIndex={isSelected ? 0 : -1}
                                className={`${styles.filterButton} ${isSelected ? styles.isActive : ""
                                    }`}
                                onClick={() => setFilter(item.value)}
                                onKeyDown={(e) => handleKeyDown(e, idx)}
                            >
                                {item.label}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </header>
    );
}
