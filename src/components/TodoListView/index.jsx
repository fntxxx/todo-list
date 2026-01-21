// components/TodoListView/index.jsx
import styles from "./style.module.scss";

export default function TodoListView({ nickname, onSignOut }) {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <span className={styles.nickname}>
                    {nickname} 的代辦事項
                </span>

                <button
                    type="button"
                    className={styles.signOutButton}
                    onClick={onSignOut}
                >
                    登出
                </button>
            </header>

            <main className={styles.main}>
                <p className={styles.placeholder}>
                    Todo List 尚未實作
                </p>
            </main>
        </div>
    );
}
