// components/TodoListView/TodoItem/index.jsx
import { useRef, useState } from "react";
import { useTodoPage } from "../../../pages/TodoList/TodoPageContext";
import styles from "./style.module.scss";
import deleteImg from "../../../assets/images/delete.svg";

export default function TodoItem({ todo }) {
    const {
        mutateLoading,
        removeTodo,
        toggleTodoStatus,
        editTodoContent,
    } = useTodoPage();

    const isDone = todo.status === true;

    // 編輯狀態
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(todo.content);

    const originalRef = useRef(todo.content);
    const editInputRef = useRef(null);
    const triggerButtonRef = useRef(null);
    const commitLockRef = useRef(false);

    const startEdit = (e) => {
        if (mutateLoading) return;
        triggerButtonRef.current = e.currentTarget;
        originalRef.current = todo.content;
        setValue(todo.content);
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        queueMicrotask(() => {
            triggerButtonRef.current?.focus?.();
        });
    };

    const commitEdit = async () => {
        if (commitLockRef.current) return;
        commitLockRef.current = true;

        try {
            if (mutateLoading) return;

            const next = value.trim();
            const prev = originalRef.current.trim();

            // 編輯沒改就不送
            if (next === prev) {
                setIsEditing(false);
                queueMicrotask(() => {
                    triggerButtonRef.current?.focus?.();
                });
                return;
            }

            const ok = await editTodoContent(todo.id, value);

            if (ok) {
                setIsEditing(false);
                queueMicrotask(() => {
                    triggerButtonRef.current?.focus?.();
                });
            } else {
                queueMicrotask(() => {
                    editInputRef.current?.focus?.();
                });
            }
        } finally {
            queueMicrotask(() => {
                commitLockRef.current = false;
            });
        }
    };

    return (
        <li
            className={`${styles.todoItem} ${isDone ? styles.isDone : ""}`}
        >
            <div className={styles.itemLeft}>
                <input
                    id={`todo-${todo.id}`}
                    type="checkbox"
                    className={styles.checkboxInput}
                    checked={isDone}
                    disabled={mutateLoading}
                    onChange={() => toggleTodoStatus(todo.id)}
                    aria-label={`標記代辦事項「${todo.content}」為完成`}
                />

                <label
                    htmlFor={`todo-${todo.id}`}
                    className={styles.checkboxLabel}
                />

                {isEditing ? (
                    <input
                        ref={editInputRef}
                        className={styles.editInput}
                        value={value}
                        autoFocus
                        disabled={mutateLoading}
                        onChange={(e) => setValue(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={(e) => {
                            if (mutateLoading) return;

                            if (e.key === "Enter") {
                                e.preventDefault();
                                e.currentTarget.blur();
                            }

                            if (e.key === "Escape") {
                                cancelEdit();
                            }
                        }}
                    />
                ) : (
                    <button
                        ref={triggerButtonRef}
                        type="button"
                        className={styles.todoTextButton}
                        disabled={mutateLoading}
                        aria-disabled={mutateLoading}
                        onClick={startEdit}
                    >
                        {todo.content}
                    </button>
                )}
            </div>

            <button
                type="button"
                className={styles.deleteButton}
                aria-label="刪除代辦"
                disabled={mutateLoading}
                aria-disabled={mutateLoading}
                onClick={() => removeTodo(todo.id)}
            >
                <img src={deleteImg} alt="" />
            </button>
        </li>
    );
}
