// components/AuthView/SignInForm/index.jsx
import { useState } from "react";
import styles from "./style.module.scss";
import { useAuthPage } from "../../../pages/Auth/AuthContext";

export default function SignInForm() {
    const { loading, error, setError, signInAction } = useAuthPage();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
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
                            placeholder="請輸入 Email"
                            className={styles.inputEmail}
                            value={email}
                            onChange={(e) => {
                                setError("");
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
                            placeholder="請輸入密碼"
                            className={styles.input}
                            value={password}
                            onChange={(e) => {
                                setError("");
                                setPassword(e.target.value);
                            }}
                            required
                        />
                    </div>

                    {error && <p className={styles.error}>{error}</p>}
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
