/**
 * AI Web Summarizer - Popup Script
 * 
 * 處理插件彈出界面的交互邏輯
 */

// DOM 元素
const elements = {
  apiKeySection: document.getElementById('apiKeySection'),
  summarySection: document.getElementById('summarySection'),
  loadingSection: document.getElementById('loadingSection'),
  resultSection: document.getElementById('resultSection'),
  errorSection: document.getElementById('errorSection'),
  apiKeyInput: document.getElementById('apiKeyInput'),
  saveApiKeyBtn: document.getElementById('saveApiKeyBtn'),
  summarizeBtn: document.getElementById('summarizeBtn'),
  copyBtn: document.getElementById('copyBtn'),
  regenerateBtn: document.getElementById('regenerateBtn'),
  retryBtn: document.getElementById('retryBtn'),
  summaryContent: document.getElementById('summaryContent'),
  errorText: document.getElementById('errorText'),
  lengthBtns: document.querySelectorAll('.length-btn')
};

// 狀態
let currentApiKey = '';
let currentLength = 'MEDIUM';
let currentPageContent = '';

// 初始化
async function init() {
  // 從存儲中加載 API Key
  await loadApiKey();
  
  // 綁定事件
  bindEvents();
  
  // 獲取當前頁面內容
  await getCurrentPageContent();
}

// 綁定事件
function bindEvents() {
  elements.saveApiKeyBtn.addEventListener('click', saveApiKey);
  elements.apiKeyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveApiKey();
  });
  
  elements.summarizeBtn.addEventListener('click', generateSummary);
  elements.copyBtn.addEventListener('click', copySummary);
  elements.regenerateBtn.addEventListener('click', generateSummary);
  elements.retryBtn.addEventListener('click', retryLastAction);
  
  elements.lengthBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.lengthBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLength = btn.dataset.length;
    });
  });
}

// 加載 API Key
async function loadApiKey() {
  try {
    const result = await chrome.storage.local.get(['geminiApiKey']);
    if (result.geminiApiKey) {
      currentApiKey = result.geminiApiKey;
      elements.apiKeyInput.value = currentApiKey;
      showSummarySection();
    } else {
      // 使用配置文件中的默認 API Key
      currentApiKey = GEMINI_CONFIG.API_KEY;
      elements.apiKeyInput.value = currentApiKey;
      showSummarySection();
    }
  } catch (error) {
    console.error('加載 API Key 失敗:', error);
    showError('無法加載 API Key，請重試');
  }
}

// 保存 API Key
async function saveApiKey() {
  const apiKey = elements.apiKeyInput.value.trim();
  
  if (!apiKey) {
    showError('請輸入有效的 API Key');
    return;
  }
  
  try {
    await chrome.storage.local.set({ geminiApiKey: apiKey });
    currentApiKey = apiKey;
    showSummarySection();
    showSuccess('API Key 已保存');
  } catch (error) {
    console.error('保存 API Key 失敗:', error);
    showError('保存失敗，請重試');
  }
}

// 獲取當前頁面內容
async function getCurrentPageContent() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      throw new Error('無法獲取當前標籤頁');
    }
    
    // 通過 content script 獲取頁面內容
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPageContent
    });
    
    if (results && results[0] && results[0].result) {
      currentPageContent = results[0].result;
    } else {
      throw new Error('無法提取頁面內容');
    }
  } catch (error) {
    console.error('獲取頁面內容失敗:', error);
    // 不顯示錯誤，等待用戶點擊生成摘要時再處理
  }
}

// 提取頁面內容的函數（在 content script 上下文中執行）
function extractPageContent() {
  // 移除不需要的元素
  const clones = document.cloneNode(true);
  const selectorsToRemove = [
    'script', 'style', 'nav', 'footer', 'header',
    '.advertisement', '.ads', '.sidebar', '.menu',
    '#comments', '.comments', '.social-share'
  ];
  
  selectorsToRemove.forEach(selector => {
    clones.querySelectorAll(selector).forEach(el => el.remove());
  });
  
  // 獲取主要內容
  const mainContent = clones.querySelector('main') || 
                      clones.querySelector('article') || 
                      clones.querySelector('.content') || 
                      clones.body;
  
  // 提取文本
  const text = mainContent.innerText || mainContent.textContent;
  
  // 清理和限制長度
  const cleaned = text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim()
    .slice(0, 15000); // 限制長度避免超過 API 限制
  
  return {
    title: document.title,
    url: window.location.href,
    content: cleaned,
    wordCount: cleaned.split(/\s+/).length
  };
}

// 生成摘要
async function generateSummary() {
  if (!currentPageContent || !currentPageContent.content) {
    showError('無法獲取頁面內容，請刷新頁面後重試');
    return;
  }
  
  if (!currentApiKey) {
    showError('請先設置 API Key');
    return;
  }
  
  showLoading();
  
  try {
    const prompt = buildPrompt(currentPageContent);
    const summary = await callGeminiAPI(prompt);
    
    showResult(summary);
  } catch (error) {
    console.error('生成摘要失敗:', error);
    showError(error.message || '生成摘要失敗，請重試');
  }
}

// 構建提示詞
function buildPrompt(pageData) {
  const lengthConfig = GEMINI_CONFIG.SUMMARY_LENGTHS[currentLength] || 
                       GEMINI_CONFIG.SUMMARY_LENGTHS.MEDIUM;
  
  return `請為以下網頁內容生成摘要：

網頁標題：${pageData.title}
網頁網址：${pageData.url}
內容字數：約 ${pageData.wordCount} 字

${lengthConfig.prompt}

請使用繁體中文回答，摘要應該清晰、準確、易於理解。

---
網頁內容：
${pageData.content}
`;
}

// 調用 Gemini API
async function callGeminiAPI(prompt) {
  const url = `${GEMINI_CONFIG.API_ENDPOINT}?key=${currentApiKey}`;
  
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
    
    if (response.status === 401 || response.status === 403) {
      throw new Error('API Key 無效或已過期');
    } else if (response.status === 429) {
      throw new Error('請求次數過多，請稍後重試');
    } else if (response.status === 400) {
      throw new Error('請求格式錯誤：' + (errorData.error?.message || ''));
    } else {
      throw new Error(`API 錯誤 (${response.status}): ${errorData.error?.message || '請稍後重試'}`);
    }
  }
  
  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('API 返回了空響應');
  }
  
  return data.candidates[0].content.parts[0].text;
}

// 顯示加載狀態
function showLoading() {
  hideAllSections();
  elements.loadingSection.classList.remove('hidden');
}

// 顯示結果
function showResult(summary) {
  hideAllSections();
  elements.summaryContent.textContent = summary;
  elements.resultSection.classList.remove('hidden');
}

// 顯示錯誤
function showError(message) {
  hideAllSections();
  elements.errorText.textContent = message;
  elements.errorSection.classList.remove('hidden');
}

// 顯示成功提示
function showSuccess(message) {
  // 簡單的 success 提示，可以擴展為 toast
  console.log('成功:', message);
}

// 複製摘要
async function copySummary() {
  const text = elements.summaryContent.textContent;
  
  try {
    await navigator.clipboard.writeText(text);
    showSuccess('已複製到剪貼簿');
    
    // 更改按鈕圖標表示已複製
    const originalText = elements.copyBtn.textContent;
    elements.copyBtn.textContent = '✅';
    setTimeout(() => {
      elements.copyBtn.textContent = originalText;
    }, 2000);
  } catch (error) {
    console.error('複製失敗:', error);
    showError('複製失敗，請手動複製');
  }
}

// 重試
function retryLastAction() {
  hideAllSections();
  elements.summarySection.classList.remove('hidden');
}

// 隱藏所有區塊
function hideAllSections() {
  [
    elements.apiKeySection,
    elements.summarySection,
    elements.loadingSection,
    elements.resultSection,
    elements.errorSection
  ].forEach(section => {
    if (section) section.classList.add('hidden');
  });
}

// 顯示摘要區塊
function showSummarySection() {
  hideAllSections();
  elements.summarySection.classList.remove('hidden');
}

// 啟動
init();
