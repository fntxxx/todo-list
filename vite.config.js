import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import crypto from 'crypto';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/todo-list/',
  css: {
    modules: {
      generateScopedName: (name, filename, css) => {
        try {
          // 1. 取得資料夾名稱 (例如: Home, Question)
          const folderName = path.basename(path.dirname(filename));

          // 2. 產生簡短雜湊 (避免 Buffer 報錯，改用 crypto)
          const hash = crypto
            .createHash('md5')
            .update(filename)
            .digest('hex')
            .substring(0, 5);

          // 3. 回傳格式：資料夾名_類別名__雜湊
          return `${folderName}_${name}__${hash}`;
        } catch (e) {
          // 萬一出錯，回傳一個保險的名稱防止 500 錯誤
          return `${name}__safe_${Math.random().toString(36).slice(2, 7).padEnd(5, '0')}`;
        }
      },
    },
  },
})
