// components/AuthView/SignUpForm/index.jsx
import { useState } from "react";
import styles from "./style.module.scss";
import { useAuthPage } from "../../../pages/Auth/AuthPageContext";

export default function SignUpForm() {
    const { loading, error, clearError, signUpAction } = useAuthPage();

    const [email, setEmail] = useState("");
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        await signUpAction({ email, nickname, password, confirmPassword });
    };

    return (
        <>
            <h2 className={styles.title}>註冊帳號</h2>

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
                        <label htmlFor="nickname" className={styles.label}>
                            您的暱稱
                        </label>
                        <input
                            type="text"
                            id="nickname"
                            name="nickname"
                            autoComplete="off"
                            placeholder="請輸入暱稱"
                            className={styles.input}
                            value={nickname}
                            onChange={(e) => {
                                clearError();
                                setNickname(e.target.value);
                            }}
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
                            name="new-password"
                            autoComplete="new-password"
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

                    <div className={styles.field}>
                        <label htmlFor="confirmPassword" className={styles.label}>
                            再次輸入密碼
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="new-password-confirm"
                            autoComplete="new-password"
                            placeholder="請再次輸入密碼"
                            className={styles.input}
                            value={confirmPassword}
                            onChange={(e) => {
                                clearError();
                                setConfirmPassword(e.target.value);
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
                    {loading ? "註冊中..." : "註冊帳號"}
                </button>
            </form>
        </>
    );
}
