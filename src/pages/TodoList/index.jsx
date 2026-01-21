// pages/TodoList/index.jsx
import { useAuth } from "../../context/AuthContext";
import TodoListView from "../../components/TodoListView";

export default function TodoListPage() {
    const { signOut, user } = useAuth();

    const nickname = user?.nickname || "使用者";

    const handleSignOut = async () => {
        await signOut();
    };

    return (
        <TodoListView
            nickname={nickname}
            onSignOut={handleSignOut}
        />
    );
}
