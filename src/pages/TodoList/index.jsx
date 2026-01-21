// pages/TodoList/index.jsx
import { useAuth } from "../../context/AuthContext";
import TodoListView from "../../components/TodoListView";

export default function TodoListPage() {
    const { signOut } = useAuth();

    // 目前先用佔位，之後你接 /users/checkout 或 user profile 再換
    const nickname = "使用者";

    const handleSignOut = async () => {
        await signOut();
        // signOut 內已切 authStatus，路由 guard 會自動導回 auth
    };

    return (
        <TodoListView
            nickname={nickname}
            onSignOut={handleSignOut}
        />
    );
}
