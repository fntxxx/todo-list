// components/TodoListView/index.jsx
import { useTodoPage } from "../../pages/TodoList/TodoPageContext";
import styles from "./style.module.scss";
import logoImg from "../../assets/images/logo-sm.svg";
import TodoCreateForm from "./TodoCreateForm";
import TodoFilterTabs from "./TodoFilterTabs";
import TodoItem from "./TodoItem";
import EmptyState from "./EmptyState";
import ErrorBox from "./ErrorBox";

export default function TodoListView({ nickname, onSignOut }) {
    const {
        todos,
        remainingCount,
        totalCount,
    } = useTodoPage();

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
                <TodoCreateForm />

                {totalCount === 0 && <EmptyState />}

                {totalCount > 0 && (
                    <section className={styles.todo}>
                        <TodoFilterTabs />

                        <div className={styles.todoBody}>
                            <ErrorBox />

                            <ul className={styles.todoList}>
                                {todos.map((t) => (
                                    <TodoItem key={t.id} todo={t} />
                                ))}
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
