/**
 * AI Web Summarizer - Content Script
 * 
 * 注入到網頁中，用於提取頁面內容
 */

// 監聽來自 popup 或 background 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageContent') {
    const content = extractPageContent();
    sendResponse({ success: true, data: content });
  }
  
  if (request.action === 'highlightContent') {
    highlightContent(request.selector);
    sendResponse({ success: true });
  }
  
  return true;
});

// 提取頁面內容
function extractPageContent() {
  // 克隆文檔以避免修改原始頁面
  const clone = document.documentElement.cloneNode(true);
  
  // 移除不需要的元素
  const selectorsToRemove = [
    'script',
    'style',
    'noscript',
    'nav',
    'footer',
    'header',
    '.advertisement',
    '.ads',
    '.sidebar',
    '.menu',
    '#comments',
    '.comments',
    '.social-share',
    '.cookie-banner',
    '.notification-bar',
    '[class*="ad-"]',
    '[id*="ad-"]',
    '[class*="advertisement"]',
    '[id*="advertisement"]'
  ];
  
  selectorsToRemove.forEach(selector => {
    clone.querySelectorAll(selector).forEach(el => el.remove());
  });
  
  // 嘗試獲取主要內容區域
  let mainContent = clone.querySelector('main') ||
                    clone.querySelector('article') ||
                    clone.querySelector('[role="main"]') ||
                    clone.querySelector('.content') ||
                    clone.querySelector('.post') ||
                    clone.querySelector('.article') ||
                    clone.body;
  
  // 提取文本
  const text = mainContent.innerText || mainContent.textContent || '';
  
  // 清理文本
  const cleaned = cleanText(text);
  
  // 獲取元數據
  const metadata = extractMetadata();
  
  return {
    title: document.title,
    url: window.location.href,
    content: cleaned,
    wordCount: countWords(cleaned),
    metadata: metadata,
    timestamp: new Date().toISOString()
  };
}

// 清理文本
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')           // 多個空白字符替換為單個空格
    .replace(/\n{3,}/g, '\n\n')     // 多個換行替換為雙換行
    .replace(/[ \t]+$/gm, '')       // 移除行尾空白
    .trim()
    .slice(0, 15000);               // 限制長度
}

// 計算字數
function countWords(text) {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

// 提取元數據
function extractMetadata() {
  const metadata = {};
  
  // 嘗試獲取作者
  const authorMeta = document.querySelector('meta[name="author"]') ||
                     document.querySelector('meta[property="article:author"]');
  if (authorMeta) {
    metadata.author = authorMeta.getAttribute('content');
  }
  
  // 嘗試獲取描述
  const descriptionMeta = document.querySelector('meta[name="description"]') ||
                          document.querySelector('meta[property="og:description"]');
  if (descriptionMeta) {
    metadata.description = descriptionMeta.getAttribute('content');
  }
  
  // 嘗試獲取發布日期
  const dateMeta = document.querySelector('meta[property="article:published_time"]') ||
                   document.querySelector('time[datetime]');
  if (dateMeta) {
    metadata.publishedDate = dateMeta.getAttribute('content') || dateMeta.getAttribute('datetime');
  }
  
  // 嘗試獲取網站名稱
  const siteNameMeta = document.querySelector('meta[property="og:site_name"]');
  if (siteNameMeta) {
    metadata.siteName = siteNameMeta.getAttribute('content');
  }
  
  return metadata;
}

// 高亮顯示內容（可選功能）
function highlightContent(selector) {
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.style.outline = '3px solid #4285f4';
    element.style.outlineOffset = '2px';
    
    setTimeout(() => {
      element.style.outline = '';
      element.style.outlineOffset = '';
    }, 3000);
  }
}

// 頁面加載完成後記錄日誌
console.log('AI Web Summarizer Content Script 已加載');

// 導出函數供 popup 使用（通過 scripting.executeScript）
if (typeof window !== 'undefined') {
  window.extractPageContent = extractPageContent;
}
