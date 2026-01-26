// components/TodoListView/index.jsx
import { useRef } from "react";
import { FILTERS } from "../../context/TodoContext";
import { useTodoPage } from "../../pages/TodoList/TodoPageContext";
import styles from "./style.module.scss";
import logoImg from "../../assets/images/logo-sm.svg";
import deleteImg from "../../assets/images/delete.svg";
import emptyImg from "../../assets/images/empty.png";
import TodoCreateForm from "./TodoCreateForm";
import TodoFilterTabs from "./TodoFilterTabs";

export default function TodoListView({ nickname, onSignOut }) {
    const {
        filter,
        setFilter,
        todos,
        loading,
        mutateLoading,
        error,
        refreshTodos,
        remainingCount,
        totalCount,
        removeTodo,
        toggleTodoStatus,
        editTodoContent,
    } = useTodoPage();

    /* ---------- refs ---------- */

    // 編輯
    const editInputRef = useRef(null);
    const editingOriginalRef = useRef("");
    const lastEditTriggerRef = useRef(null);

    // 防止同一輪事件（Enter 觸發 blur）造成重複 commit
    const commitLockRef = useRef(false);

    /* ---------- helpers ---------- */

    const focusBackToEditedRow = () => {
        const el = lastEditTriggerRef.current;
        if (!el) return;

        queueMicrotask(() => {
            el.focus?.();
        });
    };

    /* ---------- handlers ---------- */

    const startEdit = (todo, triggerEl) => {
        if (mutateLoading) return;

        lastEditTriggerRef.current = triggerEl ?? null;

        editingOriginalRef.current = todo.content;

    };

    /* ---------- render ---------- */

    return (
        <div className={`${styles.container} ${mutateLoading ? styles.isMutating : ""}`}>
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
                <TodoCreateForm />

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
                        <TodoFilterTabs />

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

                                    return (
                                        <li
                                            key={t.id}
                                            className={`${styles.todoItem} ${isDone ? styles.isDone : ""}`}
                                        >
                                            <div className={styles.itemLeft}>
                                                <input
                                                    id={inputId}
                                                    type="checkbox"
                                                    className={styles.checkboxInput}
                                                    checked={isDone}
                                                    disabled={mutateLoading}
                                                    onChange={() => toggleTodoStatus(t.id)}
                                                />

                                                <label
                                                    htmlFor={inputId}
                                                    className={styles.checkboxLabel}
                                                    aria-label="切換完成狀態"
                                                />

                                                <button
                                                    type="button"
                                                    className={styles.todoTextButton}
                                                    disabled={mutateLoading}
                                                    aria-disabled={mutateLoading}
                                                    onClick={(e) => startEdit(t, e.currentTarget)}
                                                >
                                                    {t.content}
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                className={styles.deleteButton}
                                                aria-label="刪除代辦"
                                                disabled={mutateLoading}
                                                aria-disabled={mutateLoading}
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
