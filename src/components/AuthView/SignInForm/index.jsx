//components/AuthView/SignInForm/index.jsx
import styles from "./style.module.scss";

export default function SignInForm() {
    return (
        <>
            <h2 className={styles.title}>最實用的線上代辦事項服務</h2>

            <form className={styles.form}>
                <fieldset className={styles.fieldset}>
                    <div className={styles.field}>
                        <label htmlFor="email" className={styles.label}>
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="請輸入 Email"
                            className={styles.inputEmail}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password" className={styles.label}>
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            placeholder="請輸入密碼"
                            className={styles.input}
                            required
                        />
                    </div>
                </fieldset>

                <button
                    type="submit"
                    className={styles.button}
                >
                    登入
                </button>
            </form>
        </>
    );
}
