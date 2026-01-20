import { Link } from "react-router-dom";
import styles from "./style.module.scss";

export default function AuthView({ mode }) {
    const isSignIn = mode === "signin";

    return (
        <div className={styles.authView}>
            <h2>{isSignIn ? "最實用的線上代辦事項服務" : "註冊帳號"}</h2>

            <form className={styles.form}>
                <input type="email" placeholder="Email" required />

                {!isSignIn && <input type="text" placeholder="您的暱稱" required />}

                <input type="password" placeholder="密碼" required />
                {!isSignIn && <input type="password" placeholder="再次輸入密碼" required />}

                <button type="submit">{isSignIn ? "登入" : "註冊帳號"}</button>
            </form>

            <div className={styles.switchAuth}>
                {isSignIn ? (
                    <Link to="/auth/signup">註冊帳號</Link>
                ) : (
                    <Link to="/auth/signin">登入</Link>
                )}
            </div>
        </div>
    );
}