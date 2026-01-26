// components/TodoListView/EmptyState/index.jsx
import styles from "./style.module.scss";
import emptyImg from "../../../assets/images/empty.png";

export default function EmptyState() {
    return (
        <div className={styles.emptyState}>
            <p className={styles.emptyText}>目前尚無待辦事項</p>
            <img
                src={emptyImg}
                alt="目前尚無待辦事項"
                className={styles.emptyImage}
            />
        </div>
    );
}
