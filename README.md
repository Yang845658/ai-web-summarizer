# AI Web Summarizer - AI 網頁摘要工具

一個使用 Gemini AI 的瀏覽器插件，可以自動摘要網頁內容。

## 功能特點

- 🤖 使用 Google Gemini AI 進行智能摘要
- 📄 支持長文章自動摘要
- 🎯 可自定義摘要長度（簡短/中等/詳細）
- 🌐 支持多語言摘要
- 🔒 本地存儲 API Key，保護隱私
- ⚡ 快速響應，無需刷新頁面

## 安裝步驟

### 1. 克隆或下載項目

```bash
cd /Users/yangwang/webgames/ai-web-summarizer
```

### 2. 配置 API Key

在插件彈出界面中輸入你的 Gemini API Key，或修改 `src/config.js`：

```javascript
const GEMINI_API_KEY = 'your_api_key_here';
```

### 3. 加載到瀏覽器

#### Chrome/Edge/Brave:
1. 打開 `chrome://extensions/`
2. 啟用右上角的「開發者模式」
3. 點擊「加載已解壓縮的擴充功能」
4. 選擇 `ai-web-summarizer` 文件夾

#### Firefox:
1. 打開 `about:debugging`
2. 點擊「此 Firefox」
3. 點擊「臨時載入附加元件」
4. 選擇 `manifest.json` 文件

## 使用說明

1. 安裝插件後，點擊瀏覽器工具欄中的插件圖標
2. 首次使用需輸入 Gemini API Key
3. 瀏覽任何網頁時，點擊插件圖標即可生成摘要
4. 可選擇摘要長度：簡短/中等/詳細

## 技術架構

```
ai-web-summarizer/
├── manifest.json          # 插件配置文件
├── src/
│   ├── background.js      # 後台腳本
│   ├── content.js         # 內容腳本
│   ├── popup.html         # 彈出界面
│   ├── popup.js           # 彈出邏輯
│   ├── styles.css         # 樣式文件
│   └── config.js          # 配置文件
├── icons/
│   └── icon.png           # 插件圖標
├── package.json           # 項目配置
└── README.md              # 說明文檔
```

## API 使用

本插件使用 Google Gemini API 進行內容摘要：

- **端點**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- **方法**: POST
- **認證**: API Key

## 開發

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

### 構建

```bash
npm run build
```

## 注意事項

- API Key 會存儲在瀏覽器的本地存儲中
- 請妥善保管您的 API Key
- 免費版 Gemini API 有請求次數限制

## 許可證

MIT License

## 更新日誌

### v1.0.3 (2026-03-24)
- [fix] 修復 Gemini API 模型錯誤
- 更新模型：gemini-1.5-flash → gemini-2.5-flash
- API 版本：v1 → v1beta (與 watermark 項目一致)

### v1.0.2 (2026-03-24)
- [fix] 修復 Gemini API 404 錯誤
- 更新 API 端點：v1beta → v1
- 更新模型：gemini-pro → gemini-1.5-flash

### v1.0.1 (2026-03-24)
- [fix] 修復 SUMMARY_LENGTHS 未定義錯誤

### v1.0.0 (2026-03-24)
- 初始版本發布
- 支持 Gemini AI 摘要
- 支持自定義摘要長度
- 響應式界面設計
