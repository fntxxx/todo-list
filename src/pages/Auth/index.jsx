// pages/Auth/index.jsx
import { useParams } from "react-router-dom";
import AuthView from "../../components/AuthView";
import { AuthPageProvider } from "./AuthContext";

export default function AuthPage() {
    const { type } = useParams();
    return (
        <AuthPageProvider>
            <AuthView mode={type} />
        </AuthPageProvider>
    );
}
