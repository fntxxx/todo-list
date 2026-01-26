// components/AuthView/index.jsx
import { Link } from "react-router-dom";
import { useEffect } from "react";
import styles from "./style.module.scss";
import logoImg from "../../assets/images/logo.svg";
import heroImg from "../../assets/images/hero.png";

import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import { useAuthPage } from "../../pages/Auth/AuthPageContext";

export default function AuthView({ mode }) {
    const isSignIn = mode === "signin";
    const { clearError } = useAuthPage();

    useEffect(() => {
        clearError();
    }, [mode, clearError]);

    return (
        <div className={styles.container}>
            <div className={styles.inner}>
                <header className={styles.header}>
                    <h1 className={styles.title}>
                        <img src={logoImg} alt="" />
                        ONLINE TODO LIST
                    </h1>
                    <div className={styles.hero}>
                        <img src={heroImg} alt="" />
                    </div>
                </header>

                <div className={styles.main}>
                    {isSignIn ? <SignInForm /> : <SignUpForm />}

                    <div className={styles.switchAuth}>
                        {isSignIn ? (
                            <Link to="/auth/signup" aria-label="前往註冊頁">註冊帳號</Link>
                        ) : (
                            <Link to="/auth/signin" aria-label="前往登入頁">登入</Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}