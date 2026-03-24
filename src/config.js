/**
 * AI Web Summarizer Configuration
 * 
 * 配置文件 - 包含 API 密鑰和設置
 * 
 * ⚠️ 安全提示：不要將 API Key 硬編碼在代碼中！
 * 請使用 .env 文件或瀏覽器存儲管理 API Key
 */

// Gemini API 配置
const GEMINI_CONFIG = {
  // API Key - 從環境變量或 .env 文件加載（不要硬編碼！）
  // 在瀏覽器擴展中，API Key 應該通過 popup 界面輸入並存儲在 chrome.storage.local
  API_KEY: '', // 留空，由用戶在插件界面輸入
  
  // API 端點 (使用 v1beta 版本，gemini-2.5-flash 模型)
  API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
  
  // 模型名稱 (與 watermark 項目一致)
  MODEL: 'gemini-2.5-flash',
  
  // 請求超時時間 (毫秒)
  TIMEOUT: 30000,
  
  // 最大重試次數
  MAX_RETRIES: 3,
  
  // 摘要長度選項
  SUMMARY_LENGTHS: {
    SHORT: {
      label: '簡短',
      maxLength: 150,
      prompt: '請用一句話簡短總結'
    },
    MEDIUM: {
      label: '中等',
      maxLength: 300,
      prompt: '請用 2-3 句話總結主要內容'
    },
    LONG: {
      label: '詳細',
      maxLength: 500,
      prompt: '請詳細總結文章的主要觀點和關鍵信息'
    }
  }
};

// 默認設置
const DEFAULT_SETTINGS = {
  summaryLength: 'MEDIUM',
  language: 'zh-TW',
  autoSummarize: false,
  showHighlight: true
};

// 導出配置（供 Node.js 使用）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GEMINI_CONFIG,
    DEFAULT_SETTINGS
  };
}
