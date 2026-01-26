// components/TodoListView/ErrorBox/index.jsx
import { useTodoPage } from "../../../pages/TodoList/TodoPageContext";
import styles from "./style.module.scss";

export default function ErrorBox() {
    const { loading, error, refreshTodos } = useTodoPage();

    if (loading || !error) return null;

    return (
        <div className={styles.errorBox} role="alert" aria-live="polite">
            <p className={styles.errorText}>{error}</p>
            <button
                type="button"
                className={styles.retryButton}
                onClick={refreshTodos}
            >
                重試
            </button>
        </div>
    );
}
