import { useParams, Link } from "react-router-dom";
import AuthView from "../../components/AuthView";

export default function AuthPage() {
    const { type } = useParams(); // type = "signin" 或 "signup"

    return (
        <div className="auth-page">
            <AuthView mode={type} />
        </div>
    );
}