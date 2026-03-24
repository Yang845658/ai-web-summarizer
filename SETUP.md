# 📝 AI Web Summarizer 設置指南

## 🔑 第一步：獲取新的 Gemini API Key

1. 訪問：https://aistudio.google.com/apikey
2. 點擊 **"Create API Key"**
3. 複製生成的 API Key（格式：`AIzaSy...`）

---

## ⚙️ 第二步：配置 API Key

### 方法一：瀏覽器插件界面（推薦）

1. 打開 Chrome 瀏覽器
2. 訪問 `chrome://extensions/`
3. 找到 **AI Web Summarizer** 擴展
4. 點擊擴展圖標
5. 在輸入框中粘貼新的 API Key
6. 點擊 **"保存"** 按鈕

### 方法二：本地 .env 文件（開發測試用）

1. 在項目目錄創建 `.env` 文件：
   ```bash
   cd /Users/yangwang/webgames/ai-web-summarizer
   ```

2. 編輯 `.env` 文件：
   ```bash
   GEMINI_API_KEY=你的新_API_Key_此處
   GEMINI_MODEL=gemini-2.5-flash
   ```

3. ⚠️ **重要**: 不要將 `.env` 文件提交到 Git！

---

## 🧪 第三步：測試 API

### 測試插件

1. 打開任何網頁（例如：https://www.baidu.com）
2. 點擊瀏覽器工具欄的 AI Web Summarizer 圖標
3. 選擇摘要長度（簡短/中等/詳細）
4. 點擊 **"生成摘要"** 按鈕
5. 查看摘要結果

### 測試 API 腳本（開發者）

```bash
cd /Users/yangwang/webgames/ai-web-summarizer
node test-api.js
```

預期輸出：
```
🧪 開始測試 Gemini API...
✅ API 請求成功！
測試提示詞：請用一句話總結：這是一個測試。
AI 回應：[摘要內容]
🎉 測試通過！API 配置正確。
```

---

## 🔒 安全提示

### ✅ 正確做法
- 使用 `.env` 文件管理 API Key
- 在插件界面輸入 API Key（存儲在瀏覽器本地）
- 定期更換 API Key
- 限制 API Key 的使用範圍

### ❌ 錯誤做法
- 將 API Key 硬編碼在代碼中
- 將 `.env` 文件提交到 Git
- 在公開場合分享 API Key
- 使用已洩露的 API Key

---

## 🛠️ 故障排除

### 問題：API Key 無效

**症狀**: 顯示 "API Key 無效或已過期"

**解決方法**:
1. 檢查 API Key 是否正確複製（無多餘空格）
2. 確認 API Key 已啟用
3. 檢查 API 配額是否用完
4. 重新生成新的 API Key

### 問題：API 請求失敗

**症狀**: 顯示 "API 錯誤" 或網絡錯誤

**解決方法**:
1. 檢查網絡連接
2. 確認 Google API 服務可用
3. 檢查防火牆設置
4. 查看瀏覽器控制台錯誤

### 問題：無法獲取頁面內容

**症狀**: 顯示 "無法獲取頁面內容"

**解決方法**:
1. 刷新網頁後重試
2. 檢查擴展權限
3. 某些網站可能有內容保護機制

---

## 📚 參考資料

- [Gemini API 文檔](https://ai.google.dev/docs)
- [API Key 管理](https://aistudio.google.com/apikey)
- [Chrome 擴展開發](https://developer.chrome.com/docs/extensions/)

---

_最後更新：2026-03-24_  
_版本：v1.0.3_
