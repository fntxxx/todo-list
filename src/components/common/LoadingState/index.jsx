// components/common/LoadingState/index.jsx
import styles from "./style.module.scss";

export default function LoadingState({ text = "載入中..." }) {
    return (
        <div className={styles.container} role="status" aria-live="polite">
            <div className={styles.spinner} aria-hidden="true" />
            <p className={styles.text}>{text}</p>
        </div>
    );
}
