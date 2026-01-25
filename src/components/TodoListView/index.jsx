// components/TodoListView/index.jsx
import { useState } from "react";
import { FILTERS } from "../../context/TodoContext";
import { useTodoPage } from "../../pages/TodoList/TodoPageContext";
import styles from "./style.module.scss";
import logoImg from "../../assets/images/logo-sm.svg";
import addImg from "../../assets/images/add.svg";
import deleteImg from "../../assets/images/delete.svg";
import emptyImg from "../../assets/images/empty.png";

const FILTER_ITEMS = [
    { value: FILTERS.ALL, label: "全部" },
    { value: FILTERS.TODO, label: "待完成" },
    { value: FILTERS.DONE, label: "已完成" },
];

export default function TodoListView({ nickname, onSignOut }) {
    const {
        filter,
        setFilter,
        todos,
        loading,
        createLoading,
        error,
        refreshTodos,
        remainingCount,
        totalCount,
        addTodo,
        removeTodo,
        toggleTodoStatus,
        editTodoContent,
    } = useTodoPage();

    // 新增用
    const [newContent, setNewContent] = useState("");

    // 編輯用
    const [editingId, setEditingId] = useState(null);
    const [editingValue, setEditingValue] = useState("");

    /* ---------- handlers ---------- */

    const handleCreate = async (e) => {

        e.preventDefault();

        const content = newContent.trim();
        if (!content) return;
        if (createLoading) return;

        setNewContent("");

        const ok = await addTodo(content);

        if (!ok) {
            setNewContent(content);
        }
    };

    const startEdit = (todo) => {
        setEditingId(todo.id);
        setEditingValue(todo.content);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingValue("");
    };

    const commitEdit = async () => {
        if (!editingId) return;
        const ok = await editTodoContent(editingId, editingValue);
        if (ok) cancelEdit();
    };

    /* ---------- render ---------- */

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.heading}>
                    <img src={logoImg} alt="" />
                    ONLINE TODO LIST
                </h1>

                <div className={styles.headerActions}>
                    <span className={styles.nickname}>
                        {nickname} 的代辦
                    </span>
                    <button
                        type="button"
                        className={styles.signOutButton}
                        onClick={onSignOut}
                    >
                        登出
                    </button>
                </div>
            </header>

            <main className={styles.main}>
                {/* 新增 */}
                <form className={styles.form} onSubmit={handleCreate}>
                    <input
                        type="text"
                        placeholder="新增待辦事項"
                        className={styles.input}
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        disabled={createLoading}
                    />
                    <button
                        type="submit"
                        className={styles.addButton}
                        disabled={createLoading}
                    >
                        <img src={addImg} alt="" />
                    </button>
                </form>

                {totalCount === 0 && (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyText}>目前尚無待辦事項</p>
                        <img
                            src={emptyImg}
                            alt="目前尚無待辦事項"
                            className={styles.emptyImage}
                        />
                    </div>
                )}

                {totalCount > 0 && (
                    <section className={styles.todo}>
                        {/* 篩選 */}
                        <header className={styles.todoHeader}>
                            <ul
                                className={styles.filterList}
                                role="tablist"
                                aria-label="代辦事項篩選"
                            >
                                {FILTER_ITEMS.map((item) => {
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
                                            >
                                                {item.label}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </header>

                        <div className={styles.todoBody}>
                            {!loading && error && (
                                <div className={styles.errorBox}>
                                    <p className={styles.errorText}>{error}</p>
                                    <button
                                        type="button"
                                        className={styles.retryButton}
                                        onClick={refreshTodos}
                                    >
                                        重試
                                    </button>
                                </div>
                            )}

                            <ul className={styles.todoList}>
                                {todos.map((t) => {
                                    const inputId = `todo-${t.id}`;
                                    const isDone = t.status === true;
                                    const isEditing = editingId === t.id;

                                    return (
                                        <li
                                            key={t.id}
                                            className={`${styles.todoItem} ${isDone ? styles.isDone : ""
                                                }`}
                                        >
                                            <div className={styles.itemLeft}>
                                                {/* 切換完成 */}
                                                <input
                                                    id={inputId}
                                                    type="checkbox"
                                                    className={styles.checkboxInput}
                                                    checked={isDone}
                                                    onChange={() => toggleTodoStatus(t.id)}
                                                />

                                                <label
                                                    htmlFor={inputId}
                                                    className={styles.checkboxLabel}
                                                    aria-label="切換完成狀態"
                                                />

                                                {/* 文字 / 編輯 */}
                                                {isEditing ? (
                                                    <input
                                                        className={styles.editInput}
                                                        value={editingValue}
                                                        autoFocus
                                                        onChange={(e) =>
                                                            setEditingValue(e.target.value)
                                                        }
                                                        onBlur={commitEdit}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") commitEdit();
                                                            if (e.key === "Escape") cancelEdit();
                                                        }}
                                                    />
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className={styles.todoTextButton}
                                                        onClick={() => startEdit(t)}
                                                    >
                                                        {t.content}
                                                    </button>
                                                )}
                                            </div>

                                            {/* 刪除 */}
                                            <button
                                                type="button"
                                                className={styles.deleteButton}
                                                aria-label="刪除代辦"
                                                onClick={() => removeTodo(t.id)}
                                            >
                                                <img src={deleteImg} alt="" />
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>

                            <p className={styles.todoCount}>
                                {remainingCount} 個待完成項目
                            </p>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
