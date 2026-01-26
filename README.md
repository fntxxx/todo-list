<h1 align="center">📝 Online Todo List</h1>

<p align="center">
  一個以 React 打造的線上代辦事項應用，聚焦於清楚的狀態管理、穩定的非同步流程，以及良好的使用體驗。
</p>

<p align="center">
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react" />
  </a>
  <a href="https://vitejs.dev/">
    <img src="https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite" />
  </a>
  <a href="https://reactrouter.com/">
    <img src="https://img.shields.io/badge/React_Router-7.11-CA4245?logo=react-router" />
  </a>
  <a href="https://sass-lang.com/">
    <img src="https://img.shields.io/badge/SCSS-Sass-CC6699?logo=sass" />
  </a>
</p>

---

## 📌 專案介紹

本專案為前端練習專案，實作一個具備登入機制的線上代辦事項（Todo）系統。

重點不在 CRUD 本身，而是放在：

- 狀態管理架構
- 非同步請求流程（loading / error / rollback）
- View 與邏輯的責任切分
- 設計決策與流程的可說明性

---

## 🔄 流程設計

### 🧭 進站主流程
![進站流程](./flows/main-flow.jpg)

- 進站後檢查 token
- 驗證結果決定導向 Todo 頁或登入頁

---

### 🔐 登入流程
![登入流程](./flows/signin-flow.jpg)

- 呼叫登入 API
- 成功：儲存 token，設定登入狀態
- 失敗：顯示錯誤訊息

---

### 📝 註冊流程
![註冊流程](./flows/signup-flow.jpg)

- 呼叫註冊 API
- 成功後導向登入頁

---

### 🚪 登出流程
![登出流程](./flows/signout-flow.jpg)

- 使用者主動登出或 token 驗證失敗時觸發
- 清除 token 與使用者資料，回到未登入狀態

---

### 🔑 Token 初始化流程
![Token 初始化流程](./flows/token-init-flow.jpg)

- App 啟動時驗證 token
- 有效：設定為已登入狀態
- 無效：清除資料並進入未登入狀態

---

### 📋 Todo 初始化流程
![Todo 初始化流程](./flows/todo-init-flow.jpg)

- 進入 Todo 頁後取得清單
- 成功寫入狀態
- 失敗顯示錯誤
- token 無效時觸發登出

---

### ➕ 新增 Todo（Optimistic Update）
![新增 Todo](./flows/todo-create-flow.jpg)

- 先顯示暫存 Todo
- API 成功：以正式資料取代
- API 失敗：rollback 並顯示錯誤

---

### ✏️ 編輯 / 🗑 刪除 / ✅ 切換狀態（彙總說明）

編輯、刪除與完成狀態切換共用相同設計模式：

- 操作即時反映於畫面（optimistic update）
- API 失敗時 rollback
- 錯誤不影響其他操作

---

### 🔍 Todo 篩選流程（補充說明）

- 依目前狀態即時計算顯示結果
- 不觸發 API 請求

---

## 📸 專案畫面

以下為實際操作畫面截圖，流程與狀態行為已於流程圖章節說明。

---

### 🔐 登入頁

![登入頁](./screenshots/signin.jpg)

---

### 📝 註冊頁

![註冊頁](./screenshots/signup.jpg)

---

### ✅ Todo 主畫面

![Todo 主畫面](./screenshots/todo.jpg)

---

## 功能說明

- **登入 / 註冊**
    - token 驗證與自動登出處理
- **Todo 管理**
    - 新增 / 編輯 / 刪除 / 狀態切換
    - 全流程採 optimistic update
    - API 失敗時 rollback
- **篩選功能**
    - 全部 / 未完成 / 已完成
    - 支援鍵盤操作
- **錯誤與載入狀態**
    - request state 拆分（fetch / create / mutate）
    - loading 與 error 顯示一致化

---

## 🧱 狀態管理架構

### AuthContext

- 管理登入狀態（checking / authed / guest）
- token 初始化與登出

### AuthPageContext

- 管理登入 / 註冊頁的 loading 與 error

### TodoContext

- 管理 Todo 與 request state
- reducer 模組化
- action 命名：`DOMAIN / OPERATION / DETAIL`

```jsx
{
  todos,
  filter,

  fetchLoading,
  createLoading,
  mutateLoading,

  fetchError,
  createError,
  mutateError
}

```

---

## 📁 專案結構

本專案採用「**Page × View × Context × Service**」的分層結構，
清楚區分路由、畫面呈現、狀態管理與 API 存取責任。

```text
src/
├─ assets/                   # 圖片、圖示、全域樣式
│
├─ components/
│  ├─ common/                # 共用純呈現元件
│  │   └─ LoadingState/       # 全站 loading 顯示
│  │
│  ├─ AuthView/              # Auth 頁 View
│  │   ├─ SignInForm/
│  │   └─ SignUpForm/
│  │
│  └─ TodoListView/          # Todo 主頁 View
│      ├─ TodoCreateForm/    # 新增 Todo
│      ├─ TodoFilterTabs/    # 篩選頁籤（含鍵盤操作）
│      ├─ TodoItem/          # 單一 Todo 顯示 / 編輯
│      ├─ ErrorBox/          # 錯誤顯示
│      ├─ EmptyState/        # 空清單狀態
│      └─ constants.js       # View 專用常數
│
├─ context/                  # 全域與頁面層級狀態管理
│  ├─ AuthContext.jsx        # 登入狀態、token 初始化與登出
│  ├─ AuthPageContext.jsx    # 登入 / 註冊頁 loading / error
│  │
│  └─ todo/
│      ├─ todoInitialState.js
│      ├─ todoTypes.js
│      ├─ todoReducer.js
│      └─ todoSelectors.js
│
├─ pages/                    # 路由對應頁面（負責組裝）
│  ├─ Auth/
│  │   └─ AuthPageContext.jsx
│  │
│  └─ TodoList/
│      └─ TodoPageContext.jsx
│
├─ routes/
│  └─ guards.jsx             # Public / Private Route 保護
│
├─ services/                 # API 呼叫與資料存取
│
├─ flows/                    # 流程圖（README 使用）
├─ screenshots/              # 專案畫面截圖
│
├─ App.jsx                   # 路由設定
└─ main.jsx                  # 專案進入點

```

---

## 🧩 View 與狀態責任切分

- **Pages**：路由與頁面組裝
- **View Components**：畫面與互動
- **Context / Reducer**：狀態與非同步流程

---

## ⚙️ 非同步請求與狀態設計

Todo 相關操作依性質拆分為 fetch / create / mutate 三類 request state，
以避免不同操作互相影響 loading 與 error 顯示，並讓 UI 回饋更精準。

---

## 🔁 Optimistic Update

- 操作即時更新 UI
- API 失敗時 rollback
- 確保操作即時性與資料一致性

---

## 🛠 使用技術

- React 19
- Vite
- React Router
- SCSS（CSS Module）
- Context + useReducer
- Axios

---

## 🚀 安裝與執行

```bash
# 安裝套件
npm install

# 啟動開發環境
npm run dev

```

---

## 📦 專案定位

本專案為 **架構導向的前端練習專案**，

著重於：

- 清楚的狀態管理設計
- 可預期的非同步流程
- View 與邏輯的責任切分
- 可被文件與流程圖清楚說明的設計決策