//components/AuthView/SignUpForm/index.jsx
import styles from "./style.module.scss";

export default function SignUpForm() {
    return (
        <>
            <h2 className={styles.title}>註冊帳號</h2>

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
                        <label htmlFor="nickname" className={styles.label}>
                            您的暱稱
                        </label>
                        <input
                            type="text"
                            id="nickname"
                            placeholder="請輸入暱稱"
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password" className={styles.label}>
                            密碼
                        </label>
                        <input
                            type="password"
                            id="password"
                            placeholder="請輸入密碼"
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="confirmPassword" className={styles.label}>
                            再次輸入密碼
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            placeholder="請再次輸入密碼"
                            className={styles.input}
                            required
                        />
                    </div>
                </fieldset>

                <button
                    type="submit"
                    className={styles.button}
                >
                    註冊帳號
                </button>
            </form>
        </>
    );
}
