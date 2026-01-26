// pages/TodoList/index.jsx
import { useAuth } from "../../context/AuthContext";
import TodoListView from "../../components/TodoListView";
import { TodoPageProvider } from "./TodoPageContext";

export default function TodoListPage() {
    const { signOut, user } = useAuth();
    const nickname = user?.nickname || "使用者";

    return (
        <TodoPageProvider>
            <TodoListView nickname={nickname} onSignOut={signOut} />
        </TodoPageProvider>
    );
}
