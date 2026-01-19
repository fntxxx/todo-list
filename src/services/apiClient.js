import axios from "axios";

// 建立 axios 實例
const apiClient = axios.create({
    baseURL: "https://todolist-api.hexschool.io/",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

// 取得 Token
const getToken = () => localStorage.getItem("token");

// 請求攔截器：自動加 Authorization header
apiClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = token;
    }
    return config;
});

// -------------------- User API --------------------

// 註冊
export const signUp = (data) => apiClient.post("/users/sign_up", data);

// 登入
export const signIn = (data) => apiClient.post("/users/sign_in", data);

// 檢查 Token
export const checkToken = () => apiClient.get("/users/checkout");

// 登出
export const signOut = () => apiClient.post("/users/sign_out");

// -------------------- Todo API --------------------

// 取得所有代辦事項
export const getTodos = () => apiClient.get("/todos/");

// 新增代辦事項
export const createTodo = (content) =>
    apiClient.post("/todos/", { content });

// 更新代辦事項
export const updateTodo = (id, content) =>
    apiClient.put(`/todos/${id}`, { content });

// 刪除代辦事項
export const deleteTodo = (id) => apiClient.delete(`/todos/${id}`);

// 切換代辦事項狀態
export const toggleTodo = (id) => apiClient.patch(`/todos/${id}/toggle`);

export default apiClient;