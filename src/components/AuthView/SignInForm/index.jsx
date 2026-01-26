// components/AuthView/SignInForm/index.jsx
import { useState } from "react";
import styles from "./style.module.scss";
import { useAuthPage } from "../../../pages/Auth/AuthPageContext";

export default function SignInForm() {
    const { loading, error, clearError, signInAction } = useAuthPage();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        await signInAction({ email, password });
    };

    return (
        <>
            <h2 className={styles.title}>最實用的線上代辦事項服務</h2>

            <form className={styles.form} onSubmit={handleSubmit}>
                <fieldset className={styles.fieldset} disabled={loading}>
                    <div className={styles.field}>
                        <label htmlFor="email" className={styles.label}>
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            autoComplete="email"
                            placeholder="請輸入 Email"
                            className={styles.inputEmail}
                            value={email}
                            onChange={(e) => {
                                clearError();
                                setEmail(e.target.value);
                            }}
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
                            name="password"
                            autoComplete="current-password"
                            placeholder="請輸入密碼"
                            className={styles.input}
                            value={password}
                            onChange={(e) => {
                                clearError();
                                setPassword(e.target.value);
                            }}
                            required
                        />
                    </div>

                    {error && (
                        <p
                            className={styles.error}
                            role="alert"
                            aria-live="assertive"
                        >
                            {error}
                        </p>
                    )}
                </fieldset>

                <button
                    type="submit"
                    className={styles.button}
                    disabled={loading}
                >
                    {loading ? "登入中..." : "登入"}
                </button>
            </form>
        </>
    );
}
