// components/TodoListView/TodoCreateForm/index.jsx
import { useEffect, useRef, useState } from "react";
import { useTodoPage } from "../../../pages/TodoList/TodoPageContext";
import styles from "./style.module.scss";
import addImg from "../../../assets/images/add.svg";

export default function TodoCreateForm() {
    const { createLoading, addTodo } = useTodoPage();

    const [newContent, setNewContent] = useState("");

    const inputRef = useRef(null);
    const prevCreateLoadingRef = useRef(createLoading);
    const selectOnCreateFailRef = useRef(false);

    // 只在「新增 loading 結束（true -> false）」時，才把焦點放回新增輸入框
    // 新增失敗：回填文字後，自動全選（讓使用者直接改）
    useEffect(() => {
        const prev = prevCreateLoadingRef.current;

        if (prev && !createLoading) {
            inputRef.current?.focus();

            if (selectOnCreateFailRef.current) {
                inputRef.current?.select();
                selectOnCreateFailRef.current = false;
            }
        }

        prevCreateLoadingRef.current = createLoading;
    }, [createLoading]);

    const handleCreate = async (e) => {
        e.preventDefault();

        const content = newContent.trim();
        if (!content) return;
        if (createLoading) return;

        setNewContent("");

        const ok = await addTodo(content);

        if (!ok) {
            setNewContent(content);
            // 等 createLoading 結束後 focus 回來時順便全選
            selectOnCreateFailRef.current = true;
        }
    };

    return (
        <form className={styles.form} onSubmit={handleCreate}>
            <input
                ref={inputRef}
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
                aria-disabled={createLoading}
                aria-label="新增代辦事項"
            >
                <img src={addImg} alt="" />
            </button>
        </form>
    );
}
