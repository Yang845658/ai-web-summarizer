/**
 * AI Web Summarizer - Background Service Worker
 * 
 * 處理後台任務和 API 調用
 */

// 監聽安裝事件
chrome.runtime.onInstalled.addListener((details) => {
  console.log('AI Web Summarizer 已安裝', details);
  
  // 初始化默認設置
  chrome.storage.local.set({
    geminiApiKey: '',
    summaryLength: 'MEDIUM',
    settingsVersion: '1.0.0'
  });
});

// 監聽來自 popup 或 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request);
  
  if (request.action === 'summarize') {
    handleSummarizeRequest(request.data)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    // 返回 true 表示異步響應
    return true;
  }
  
  if (request.action === 'getApiKey') {
    chrome.storage.local.get(['geminiApiKey']).then((result) => {
      sendResponse({ apiKey: result.geminiApiKey });
    });
    return true;
  }
  
  if (request.action === 'saveApiKey') {
    chrome.storage.local.set({ geminiApiKey: request.apiKey }).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// 處理摘要請求
async function handleSummarizeRequest(data) {
  const { content, apiKey, length } = data;
  
  if (!content || !content.content) {
    throw new Error('內容為空');
  }
  
  if (!apiKey) {
    throw new Error('API Key 未設置');
  }
  
  // 構建提示詞
  const prompt = buildPrompt(content, length);
  
  // 調用 API
  const summary = await callGeminiAPI(prompt, apiKey);
  
  return {
    summary,
    originalTitle: content.title,
    originalUrl: content.url,
    wordCount: content.wordCount
  };
}

// 構建提示詞
function buildPrompt(content, length = 'MEDIUM') {
  const lengthConfig = {
    SHORT: { prompt: '請用一句話簡短總結', maxLength: 150 },
    MEDIUM: { prompt: '請用 2-3 句話總結主要內容', maxLength: 300 },
    LONG: { prompt: '請詳細總結文章的主要觀點和關鍵信息', maxLength: 500 }
  };
  
  const config = lengthConfig[length] || lengthConfig.MEDIUM;
  
  return `請為以下網頁內容生成摘要：

網頁標題：${content.title}
網頁網址：${content.url}
內容字數：約 ${content.wordCount} 字

${config.prompt}

請使用繁體中文回答，摘要應該清晰、準確、易於理解。

---
網頁內容：
${content.content}
`;
}

// 調用 Gemini API
async function callGeminiAPI(prompt, apiKey) {
  const url = `${GEMINI_API_ENDPOINT}?key=${apiKey}`;
  
  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    }
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`API 錯誤 (${response.status}): ${errorData.error?.message || '請稍後重試'}`);
  }
  
  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('API 返回了空響應');
  }
  
  return data.candidates[0].content.parts[0].text;
}

// API 配置 (使用 v1beta 版本，gemini-2.5-flash 模型)
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// 服務 Worker 啟動時的日誌
console.log('AI Web Summarizer Background Service Worker 已啟動');
