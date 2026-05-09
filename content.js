console.log('Content script loaded on:', window.location.href);

const styleElement = document.createElement('style');
styleElement.textContent = `
  .plugin-highlight {
    background-color: yellow;
    border: 1px solid orange;
    padding: 2px 4px;
    border-radius: 2px;
  }

  .product-preview-overlay {
    display: none !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    background: rgba(0, 0, 0, 0.9) !important;
    z-index: 99999 !important;
    overflow-y: auto !important;
    padding: 20px !important;
    box-sizing: border-box !important;
  }

  .product-preview-overlay.show {
    display: flex !important;
    align-items: flex-start !important;
    justify-content: center !important;
  }

  .product-preview-container {
    background: #1a1a1a !important;
    border: 3px solid #ffd700 !important;
    border-radius: 16px !important;
    width: 100% !important;
    max-width: 1400px !important;
    margin-top: 50px !important;
    box-shadow: 0 20px 60px rgba(255, 215, 0, 0.3) !important;
    overflow: hidden !important;
    position: relative !important;
  }

  .product-preview-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    padding: 16px 24px !important;
    background: #222 !important;
    border-bottom: 2px solid #ffd700 !important;
    position: sticky !important;
    top: 0 !important;
    z-index: 10 !important;
  }

  .product-preview-header h2 {
    color: #ffd700 !important;
    font-size: 20px !important;
    margin: 0 !important;
    font-weight: 700 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  }

  .product-preview-close {
    width: 36px !important;
    height: 36px !important;
    border-radius: 50% !important;
    border: 2px solid #ffd700 !important;
    background: #1a1a1a !important;
    color: #ffd700 !important;
    font-size: 18px !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.3s ease !important;
    padding: 0 !important;
    margin: 0 !important;
    line-height: 1 !important;
  }

  .product-preview-close:hover {
    background: #ffd700 !important;
    color: #1a1a1a !important;
  }

  .product-preview-toolbar {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    padding: 12px 24px !important;
    background: #2a2a2a !important;
    border-bottom: 1px solid #333 !important;
    flex-wrap: wrap !important;
    gap: 10px !important;
  }

  .preview-toolbar-left {
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    flex-wrap: wrap !important;
  }

  .preview-checkbox-label {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    color: #fff !important;
    font-size: 13px !important;
    cursor: pointer !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  }

  .preview-checkbox-label input[type="checkbox"] {
    width: 18px !important;
    height: 18px !important;
    accent-color: #ffd700 !important;
    cursor: pointer !important;
  }

  .preview-toolbar-btn {
    padding: 8px 16px !important;
    background: #333 !important;
    border: 1px solid #444 !important;
    color: #fff !important;
    border-radius: 6px !important;
    cursor: pointer !important;
    font-size: 13px !important;
    transition: all 0.3s ease !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    margin: 0 !important;
  }

  .preview-toolbar-btn:hover {
    background: #444 !important;
    border-color: #ffd700 !important;
  }

  .preview-toolbar-btn.danger {
    background: #5a0a0a !important;
    border-color: #9b0000 !important;
  }

  .preview-toolbar-btn.danger:hover {
    background: #7a0a0a !important;
    border-color: #ff0000 !important;
  }

  .preview-selected-count {
    color: #ffd700 !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  }

  .preview-products-grid {
    display: grid !important;
    grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
    gap: 15px !important;
    padding: 20px !important;
    background: #1a1a1a !important;
    max-height: calc(100vh - 200px) !important;
    overflow-y: auto !important;
  }

  .preview-product-card {
    background: #222 !important;
    border: 2px solid #333 !important;
    border-radius: 10px !important;
    overflow: hidden !important;
    cursor: pointer !important;
    transition: all 0.3s ease !important;
    position: relative !important;
    display: block !important;
    width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
  }

  .preview-product-card:hover {
    transform: translateY(-5px) !important;
    border-color: #ffd700 !important;
    box-shadow: 0 8px 20px rgba(255, 215, 0, 0.25) !important;
  }

  .preview-product-card.selected {
    border-color: #ffd700 !important;
    box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.4) !important;
  }

  .preview-exported-badge {
    position: absolute !important;
    top: 8px !important;
    right: 8px !important;
    background: rgba(76, 175, 80, 0.9) !important;
    color: #fff !important;
    font-size: 11px !important;
    padding: 3px 8px !important;
    border-radius: 4px !important;
    font-weight: 600 !important;
    z-index: 10 !important;
    pointer-events: none !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    letter-spacing: 0.5px !important;
  }

  .preview-product-card.exported {
    border-color: #4CAF50 !important;
  }

  .preview-product-checkbox {
    position: absolute !important;
    top: 8px !important;
    left: 8px !important;
    width: 22px !important;
    height: 22px !important;
    accent-color: #ffd700 !important;
    cursor: pointer !important;
    z-index: 10 !important;
    opacity: 0 !important;
    transition: opacity 0.2s ease !important;
    margin: 0 !important;
  }

  .preview-product-card:hover .preview-product-checkbox,
  .preview-product-checkbox:checked {
    opacity: 1 !important;
  }

  .preview-product-image-wrapper {
    width: 100% !important;
    height: 140px !important;
    background: #333 !important;
    position: relative !important;
    overflow: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .preview-product-image-wrapper img {
    max-width: 100% !important;
    max-height: 100% !important;
    width: auto !important;
    height: auto !important;
    object-fit: contain !important;
    display: block !important;
    border: none !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .preview-product-info {
    padding: 10px !important;
    background: #222 !important;
    margin: 0 !important;
    display: block !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .preview-product-title {
    color: #fff !important;
    font-size: 12px !important;
    line-height: 1.4 !important;
    margin: 0 0 6px 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    white-space: normal !important;
    font-weight: 400 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    background: none !important;
    border: none !important;
  }

  .preview-product-price {
    color: #ffd700 !important;
    font-size: 15px !important;
    font-weight: 700 !important;
    margin: 0 !important;
    padding: 0 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    background: none !important;
    border: none !important;
  }

  .preview-pagination {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    gap: 12px !important;
    padding: 16px 24px !important;
    background: #222 !important;
    border-top: 1px solid #333 !important;
    flex-wrap: wrap !important;
  }

  .preview-page-btn {
    padding: 10px 20px !important;
    background: #333 !important;
    border: 1px solid #444 !important;
    color: #fff !important;
    border-radius: 6px !important;
    cursor: pointer !important;
    font-size: 13px !important;
    transition: all 0.3s ease !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    margin: 0 !important;
  }

  .preview-page-btn:hover:not(:disabled) {
    background: #ffd700 !important;
    color: #1a1a1a !important;
    border-color: #ffd700 !important;
  }

  .preview-page-btn:disabled {
    opacity: 0.4 !important;
    cursor: not-allowed !important;
  }

  .preview-page-info {
    color: #fff !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  }

  .preview-empty-state {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 60px 20px !important;
    color: #666 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  }

  .preview-empty-state p {
    font-size: 16px !important;
    margin: 0 !important;
  }

  @media (max-width: 1400px) {
    .preview-products-grid {
      grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
    }
  }

  @media (max-width: 1200px) {
    .preview-products-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    }
  }

  @media (max-width: 900px) {
    .preview-products-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    }
  }

  @media (max-width: 600px) {
    .preview-products-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
    .product-preview-header h2 {
      font-size: 16px !important;
    }
  }

  .beidou-fab {
    position: fixed !important;
    right: 20px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    z-index: 99998 !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    transition: all 0.3s ease !important;
  }

  .beidou-fab-btn {
    width: 50px !important;
    height: 50px !important;
    border-radius: 50% !important;
    border: 2px solid #ffd700 !important;
    background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%) !important;
    color: #ffd700 !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-direction: column !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3) !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    padding: 0 !important;
    margin: 0 !important;
    line-height: 1.2 !important;
    text-align: center !important;
    white-space: nowrap !important;
  }

  .beidou-fab-btn:hover {
    background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%) !important;
    color: #1a1a1a !important;
    transform: scale(1.1) !important;
    box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5) !important;
  }

  .beidou-fab-btn:active {
    transform: scale(0.95) !important;
  }

  .beidou-fab-icon {
    font-size: 18px !important;
    margin-bottom: 2px !important;
  }

  .beidou-fab-text {
    font-size: 10px !important;
    letter-spacing: 0.5px !important;
  }

  .beidou-fab-tooltip {
    position: absolute !important;
    right: 60px !important;
    background: rgba(0, 0, 0, 0.9) !important;
    color: #fff !important;
    padding: 6px 12px !important;
    border-radius: 6px !important;
    font-size: 12px !important;
    white-space: nowrap !important;
    pointer-events: none !important;
    opacity: 0 !important;
    transition: opacity 0.2s ease !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  }

  .beidou-fab-btn:hover .beidou-fab-tooltip {
    opacity: 1 !important;
  }
`;
document.head.appendChild(styleElement);

function convertToHighQualityJpg(url) {
  if (!url) return '';
  
  const baseUrl = url.split('?')[0];
  
  const width = 1340;
  const height = 1787;
  
  const query = `?imageView2/2/w/${width}/h/${height}/q/85/format/jpeg`;
  
  if (baseUrl.endsWith('.avif') || baseUrl.endsWith('.webp')) {
    return baseUrl.replace(/\.(avif|webp)$/i, '.jpg') + query;
  }
  
  return baseUrl + query;
}

function convertToThumbnailJpg(url) {
  if (!url) return '';
  
  const baseUrl = url.split('?')[0];
  
  if (baseUrl.endsWith('.avif') || baseUrl.endsWith('.webp')) {
    return baseUrl.replace(/\.(avif|webp)$/i, '.jpg') + '?imageView2/2/w/300/q/75/format/jpeg';
  }
  
  return baseUrl + '?imageView2/2/w/300/q/75/format/jpeg';
}

function extractImageUrl(imgElement) {
  if (!imgElement) return '';
  
  const placeholderPattern = /^data:image\/(gif|png);base64,R0lGODlh/;
  
  const src = imgElement.src || '';
  
  if (!placeholderPattern.test(src)) {
    return src;
  }
  
  const lazyAttrs = ['data-src', 'data-original', 'data-lazy-src', 'data-url', 'data-cfsrc', 'data-srcset'];
  
  for (const attr of lazyAttrs) {
    const value = imgElement.getAttribute(attr);
    if (value && !placeholderPattern.test(value)) {
      return value;
    }
  }
  
  const srcset = imgElement.getAttribute('srcset');
  if (srcset) {
    const urls = srcset.split(',').map(s => s.trim().split(' ')[0]);
    for (const url of urls) {
      if (url && !placeholderPattern.test(url)) {
        return url;
      }
    }
  }
  
  return '';
}

function findLoadMoreButton(region = 'all') {
  const selectors = [
    'div._2ugbvrpI._3E4sGl93._28_m8Owy.R8mNGZXv._2rMaxXAr',
    'div._3HKY2899 div[role="button"]',
    'div._3HKY2899',
    'div[aria-label="查看更多商品"]',
    'div[aria-label="查看更多"]',
    'div[role="button"][aria-label*="查看更多"]',
    'div[role="link"][aria-label*="查看更多"]',
    'button[aria-label*="查看更多"]',
    'div._2ugbvrpI._1TeP2qll._28_m8Owy.R8mNGZXv',
    'div[role="button"]:has(span:contains("查看更多"))',
    '.load-more-button',
    '.next-page-button'
  ];
  
  console.log('=== Looking for load more button ===');
  console.log('Region:', region);
  
  let container = document.body;
  
  const storeGoodsContainers = [
    'div._29dBm1gx.autoFitGoodsList',
    'div.mainContent._22vl80tk._3Pga2OjH',
    'div._29dBm1gx'
  ];
  
  if (region === 'storeGoods') {
    for (const selector of storeGoodsContainers) {
      const found = document.querySelector(selector);
      if (found) {
        container = found;
        break;
      }
    }
    console.log('Store goods container:', container);
  } else if (region === 'selected') {
    container = document.querySelector('div.mainContent:not(._22vl80tk)') || 
                document.querySelector('div._3ZhYwOCn + div._29dBm1gx') || 
                document.body;
    console.log('Selected container:', container);
  }
  
  for (const selector of selectors) {
    try {
      const element = container.querySelector(selector);
      if (element) {
        const ariaLabel = element.getAttribute('aria-label') || '';
        const dataType = element.getAttribute('data-type') || '';
        
        if (dataType === 'goodsCart' || ariaLabel.includes('购物车')) {
          console.log('Skipping shopping cart button:', selector);
          continue;
        }
        
        if (ariaLabel && !ariaLabel.includes('查看更多') && !ariaLabel.includes('加载更多') && !ariaLabel.includes('更多')) {
          console.log('Skipping button with unrelated aria-label:', ariaLabel);
          continue;
        }
        
        console.log('Found load more button with selector:', selector);
        console.log('Button element:', element);
        
        const rect = element.getBoundingClientRect();
        console.log('Button position:', rect);
        
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          console.log('Button is not visible, scrolling to it...');
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        return element;
      }
    } catch (e) {
      console.log('Selector failed:', selector, e.message);
      continue;
    }
  }
  
  console.log('Trying text content search...');
  const allElements = container.querySelectorAll('div, button, span');
  for (const el of allElements) {
    const ariaLabel = el.getAttribute('aria-label') || '';
    const dataType = el.getAttribute('data-type') || '';
    
    if (dataType === 'goodsCart' || ariaLabel.includes('购物车')) {
      continue;
    }
    
    if (el.textContent && el.textContent.includes('查看更多')) {
      console.log('Found load more button by text:', el);
      return el;
    }
  }
  
  console.log('Load more button not found in region:', region);
  return null;
}

function getRandomDelay(min, max) {
  return Math.random() * (max - min) + min;
}

function delay(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

function simulateClick(element) {
  console.log('Simulating click on element:', element);
  
  const mouseOverEvent = new MouseEvent('mouseover', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  element.dispatchEvent(mouseOverEvent);
  
  const mouseDownEvent = new MouseEvent('mousedown', {
    bubbles: true,
    cancelable: true,
    view: window,
    buttons: 1
  });
  element.dispatchEvent(mouseDownEvent);
  
  const mouseUpEvent = new MouseEvent('mouseup', {
    bubbles: true,
    cancelable: true,
    view: window,
    buttons: 1
  });
  element.dispatchEvent(mouseUpEvent);
  
  const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  element.dispatchEvent(clickEvent);
  
  const touchStartEvent = new TouchEvent('touchstart', {
    bubbles: true,
    cancelable: true
  });
  element.dispatchEvent(touchStartEvent);
  
  const touchEndEvent = new TouchEvent('touchend', {
    bubbles: true,
    cancelable: true
  });
  element.dispatchEvent(touchEndEvent);
  
  console.log('Click simulation completed');
}

async function waitForLoadMore() {
  console.log('Waiting for page to load more content...');
  
  const initialCount = document.querySelectorAll('[data-tooltip-title]').length;
  console.log('Initial product count:', initialCount);
  
  return new Promise(resolve => {
    let checkCount = 0;
    const maxChecks = 20;
    const checkInterval = 500;
    
    const checkIntervalId = setInterval(() => {
      checkCount++;
      const currentCount = document.querySelectorAll('[data-tooltip-title]').length;
      
      console.log('Check', checkCount, '- Current product count:', currentCount);
      
      if (currentCount > initialCount) {
        console.log('New content loaded!');
        clearInterval(checkIntervalId);
        resolve();
        return;
      }
      
      if (checkCount >= maxChecks) {
        console.log('Max checks reached, assuming load complete');
        clearInterval(checkIntervalId);
        resolve();
        return;
      }
    }, checkInterval);
    
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.querySelector && node.querySelector('[data-tooltip-title]')) {
                console.log('Mutation observer detected new product elements');
                clearInterval(checkIntervalId);
                observer.disconnect();
                setTimeout(resolve, 1000);
                return;
              }
            }
          }
        }
      }
    });
    
    const goodsList = document.querySelector('.js-goods-list') || document.querySelector('._29dBm1gx');
    const observeTarget = goodsList || document.body;
    
    observer.observe(observeTarget, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      clearInterval(checkIntervalId);
      observer.disconnect();
      console.log('Timeout reached, resolving');
      resolve();
    }, 10000);
  });
}

async function autoLoadMore(pageCount, delayStart, delayEnd, region = 'all') {
  console.log('=== Starting auto load more ===');
  console.log('Page count:', pageCount);
  console.log('Delay range:', delayStart, '-', delayEnd, 'seconds');
  console.log('Region:', region);
  
  for (let i = 0; i < pageCount; i++) {
    console.log('\n--- Page', i + 1, '---');
    
    const loadMoreBtn = findLoadMoreButton(region);
    
    if (!loadMoreBtn) {
      console.log('Load more button not found, stopping auto load');
      break;
    }
    
    console.log('Clicking load more button...');
    simulateClick(loadMoreBtn);
    
    if (i < pageCount - 1) {
      const waitTime = getRandomDelay(delayStart, delayEnd);
      console.log('Waiting', waitTime.toFixed(2), 'seconds');
      await delay(waitTime);
      
      console.log('Waiting for page to load...');
      await waitForLoadMore();
    }
  }
  
  console.log('\n=== Auto load more completed ===');
}

function extractProductInfo(region = 'all', keyword = '') {
  const products = [];
  const seenIds = new Set();
  
  let productItems = [];
  
  const storeGoodsSelectors = [
    'div._29dBm1gx.autoFitGoodsList div.Ois68FAW._3qGJLBpe._2Y2Y4-8H',
    'div._29dBm1gx.autoFitGoodsList div.Ois68FAW._3qGJLBpe',
    'div.mainContent._22vl80tk._3Pga2OjH [data-tooltip-title]',
    'div._29dBm1gx [data-tooltip-title]',
    '[data-tooltip-title]'
  ];
  
  const selectedSelectors = [
    'div.mainContent:not(._22vl80tk) .js-goods-list [data-tooltip-title]',
    'div._3ZhYwOCn + div._29dBm1gx [data-tooltip-title]',
    '[data-tooltip-title]'
  ];
  
  let selectors;
  if (region === 'storeGoods') {
    selectors = storeGoodsSelectors;
  } else if (region === 'selected') {
    selectors = selectedSelectors;
  } else {
    selectors = ['[data-tooltip-title]'];
  }
  
  for (const selector of selectors) {
    try {
      const items = document.querySelectorAll(selector);
      if (items.length > 0) {
        const newItems = Array.from(items);
        console.log('Found', newItems.length, 'items with selector:', selector);
        productItems = productItems.concat(newItems);
      }
    } catch (e) {
      console.log('Selector failed:', selector, e.message);
      continue;
    }
  }
  
  const uniqueItems = [...new Set(productItems)];
  console.log('Total unique items after all selectors:', uniqueItems.length);
  productItems = uniqueItems;
  
  console.log('Extracting products from region:', region, '- Found:', productItems.length, 'items');
  console.log('Filter keyword:', keyword || 'none');
  
  const normalizedKeyword = keyword.toLowerCase().trim();
  
  productItems.forEach((item) => {
    const tooltipAttr = item.getAttribute('data-tooltip');
    let productId = '';
    
    if (tooltipAttr && tooltipAttr.includes('-')) {
      const match = tooltipAttr.match(/\-(\d+)$/);
      if (match) {
        productId = match[1];
      }
    }
    
    if (!productId) {
      const hrefElement = item.querySelector('a[href*="-g-"]');
      if (hrefElement) {
        const hrefMatch = hrefElement.href.match(/-g-(\d+)/);
        if (hrefMatch) {
          productId = hrefMatch[1];
        }
      }
    }
    
    if (!productId) {
      productId = item.getAttribute('data-tooltip-title') || '';
    }
    
    if (seenIds.has(productId)) {
      return;
    }
    
    let title = item.getAttribute('data-tooltip-title');
    
    if (!title) {
      const titleElement = item.querySelector('._2D9RBAXL');
      if (titleElement) {
        title = titleElement.textContent.trim();
      }
    }
    
    if (!title) {
      return;
    }
    
    const priceElement = item.querySelector('span._2XgTiMJi') || 
                         item.querySelector('[data-type="price"] span') ||
                         item.querySelector('._382YgpSF span') ||
                         item.querySelector('._2myxWHLi span');
    let price = priceElement ? priceElement.textContent.trim() : '';
    
    if (!price) {
      const priceElements = item.querySelectorAll('span');
      for (const el of priceElements) {
        if (el.textContent && el.textContent.includes('$')) {
          price = el.textContent.trim();
          break;
        }
      }
    }
    
    if (!price) {
      console.log('Skipping product without price:', title);
      return;
    }
    
    if (normalizedKeyword && !title.toLowerCase().includes(normalizedKeyword)) {
      return;
    }
    
    seenIds.add(productId);
    
    const imgElement = item.querySelector('img.wxWpAMbp._2s7BZSpH.goods-img-external') || 
                       item.querySelector('img[data-cui-image]') ||
                       item.querySelector('img[data-js-main-img]') ||
                       item.querySelector('._2Yycy2MJ img') ||
                       item.querySelector('img');
    const originalUrl = extractImageUrl(imgElement);
    const convertedUrl = convertToHighQualityJpg(originalUrl);
    const imageUrl = convertedUrl.replace(/[`'"]/g, '').trim();
    
    products.push({
      productId: productId,
      title: title,
      imageUrl: imageUrl,
      thumbnailUrl: convertToThumbnailJpg(originalUrl),
      price: price
    });
  });
  
  console.log('Filtered products count:', products.length);
  return products;
}

let previewProducts = [];
let selectedIndices = new Set();
let exportedProductIds = new Set();
let currentPreviewPage = 1;
const previewPageSize = 48;

function checkExportedProducts(productIds) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'checkExported', data: productIds }, (response) => {
      if (chrome.runtime.lastError || !response || !response.success) {
        console.warn('Failed to check exported products:', chrome.runtime.lastError);
        resolve({});
        return;
      }
      resolve(response.data || {});
    });
  });
}

function createPreviewOverlay(products) {
  previewProducts = products;
  selectedIndices.clear();
  exportedProductIds.clear();
  currentPreviewPage = 1;
  
  const overlay = document.createElement('div');
  overlay.className = 'product-preview-overlay';
  overlay.id = 'productPreviewOverlay';
  
  overlay.innerHTML = `
    <div class="product-preview-container">
      <div class="product-preview-header">
        <h2>商品预览（共${products.length}件）</h2>
        <button class="product-preview-close" id="previewCloseBtn">✕</button>
      </div>
      
      <div class="product-preview-toolbar">
        <div class="preview-toolbar-left">
          <label class="preview-checkbox-label">
            <input type="checkbox" id="previewSelectAll">
            <span>全选</span>
          </label>
          <button class="preview-toolbar-btn" id="previewSelectInverseBtn">反选</button>
          <button class="preview-toolbar-btn" id="previewDeselectAllBtn">取消全选</button>
          <button class="preview-toolbar-btn danger" id="previewDeleteSelectedBtn">删除选中</button>
          <button class="preview-toolbar-btn" id="previewExportBtn" style="background: #4CAF50; border-color: #45a049;">导出选中</button>
        </div>
        <div class="preview-selected-count">已选: <span id="previewSelectedCount">0</span></div>
      </div>
      
      <div class="preview-export-progress" id="previewExportProgress" style="display: none;">
        <div class="preview-progress-header">
          <span class="preview-progress-label">导出进度</span>
          <span id="previewExportProgressText" class="preview-progress-text">0/0</span>
        </div>
        <div class="preview-progress-bar-container">
          <div id="previewExportProgressBar" class="preview-progress-bar" style="width: 0%;"></div>
        </div>
        <span id="previewExportStatus" class="preview-progress-status">准备导出...</span>
      </div>
      
      <div class="preview-products-grid" id="previewProductsGrid"></div>
      
      <div class="preview-pagination">
        <button class="preview-page-btn" id="previewFirstPage">首页</button>
        <button class="preview-page-btn" id="previewPrevPage">上一页</button>
        <span class="preview-page-info">第 <span id="previewCurrentPage">1</span> / <span id="previewTotalPages">1</span> 页</span>
        <button class="preview-page-btn" id="previewNextPage">下一页</button>
        <button class="preview-page-btn" id="previewLastPage">最后页</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  overlay.classList.add('show');
  
  document.getElementById('previewCloseBtn').addEventListener('click', closePreviewOverlay);
  
  document.getElementById('previewSelectAll').addEventListener('change', () => {
    const isChecked = document.getElementById('previewSelectAll').checked;
    const startIndex = (currentPreviewPage - 1) * previewPageSize;
    const endIndex = Math.min(startIndex + previewPageSize, previewProducts.length);
    
    for (let i = startIndex; i < endIndex; i++) {
      if (isChecked) {
        selectedIndices.add(i);
      } else {
        selectedIndices.delete(i);
      }
    }
    
    renderPreviewProducts();
  });
  
  document.getElementById('previewSelectInverseBtn').addEventListener('click', previewSelectInverse);
  document.getElementById('previewDeselectAllBtn').addEventListener('click', previewDeselectAll);
  document.getElementById('previewDeleteSelectedBtn').addEventListener('click', previewDeleteSelected);
  document.getElementById('previewExportBtn').addEventListener('click', handlePreviewExport);
  
  document.getElementById('previewFirstPage').addEventListener('click', goToPreviewFirstPage);
  document.getElementById('previewPrevPage').addEventListener('click', goToPreviewPrevPage);
  document.getElementById('previewNextPage').addEventListener('click', goToPreviewNextPage);
  document.getElementById('previewLastPage').addEventListener('click', goToPreviewLastPage);
  
  renderPreviewProducts();
  
  const productIds = products.map(p => p.productId).filter(id => id);
  if (productIds.length > 0) {
    checkExportedProducts(productIds).then(result => {
      exportedProductIds.clear();
      for (const [id, exported] of Object.entries(result)) {
        if (exported) exportedProductIds.add(id);
      }
      renderPreviewProducts();
    });
  }
}

function closePreviewOverlay() {
  const overlay = document.getElementById('productPreviewOverlay');
  if (overlay) {
    overlay.remove();
  }
}

function renderPreviewProducts() {
  const grid = document.getElementById('previewProductsGrid');
  
  if (previewProducts.length === 0) {
    grid.innerHTML = '<div class="preview-empty-state"><p>暂无商品数据</p></div>';
    return;
  }
  
  const totalPages = Math.ceil(previewProducts.length / previewPageSize);
  const startIndex = (currentPreviewPage - 1) * previewPageSize;
  const endIndex = Math.min(startIndex + previewPageSize, previewProducts.length);
  const pageProducts = previewProducts.slice(startIndex, endIndex);
  
  document.getElementById('previewCurrentPage').textContent = currentPreviewPage;
  document.getElementById('previewTotalPages').textContent = totalPages;
  document.getElementById('previewSelectedCount').textContent = selectedIndices.size;
  
  document.getElementById('previewFirstPage').disabled = currentPreviewPage === 1;
  document.getElementById('previewPrevPage').disabled = currentPreviewPage === 1;
  document.getElementById('previewNextPage').disabled = currentPreviewPage >= totalPages;
  document.getElementById('previewLastPage').disabled = currentPreviewPage >= totalPages;
  
  grid.innerHTML = pageProducts.map((product, index) => {
    const globalIndex = startIndex + index;
    const isSelected = selectedIndices.has(globalIndex);
    const isExported = product.productId && exportedProductIds.has(product.productId);
    const cardClasses = ['preview-product-card'];
    if (isSelected) cardClasses.push('selected');
    if (isExported) cardClasses.push('exported');
    const badgeHtml = isExported ? '<span class="preview-exported-badge">已提取</span>' : '';
    return `
      <div class="${cardClasses.join(' ')}" data-index="${globalIndex}">
        <input type="checkbox" class="preview-product-checkbox" ${isSelected ? 'checked' : ''} data-index="${globalIndex}">
        ${badgeHtml}
        <div class="preview-product-image-wrapper">
          <img src="${product.thumbnailUrl || product.imageUrl}" alt="${product.title}" class="preview-product-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27200%27 height=%27200%27%3E%3Crect fill=%27%23333%27 width=%27200%27 height=%27200%27/%3E%3Ctext fill=%27%23666%27 font-size=%2714%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dominant-baseline=%27middle%27%3E图片加载失败%3C/text%3E%3C/svg%3E'" />
        </div>
        <div class="preview-product-info">
          <h3 class="preview-product-title">${product.title}</h3>
          <p class="preview-product-price">${product.price}</p>
        </div>
      </div>
    `;
  }).join('');
  
  document.querySelectorAll('.preview-product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('preview-product-checkbox')) return;
      const checkbox = card.querySelector('.preview-product-checkbox');
      checkbox.click();
    });
  });
  
  document.querySelectorAll('.preview-product-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      const index = parseInt(checkbox.dataset.index);
      if (checkbox.checked) {
        selectedIndices.add(index);
        checkbox.parentElement.classList.add('selected');
      } else {
        selectedIndices.delete(index);
        checkbox.parentElement.classList.remove('selected');
      }
      document.getElementById('previewSelectedCount').textContent = selectedIndices.size;
      updatePreviewSelectAll();
    });
  });
}

function updatePreviewSelectAll() {
  const visibleCount = Math.min(previewPageSize, previewProducts.length - (currentPreviewPage - 1) * previewPageSize);
  const visibleSelected = [...selectedIndices].filter(i => {
    return i >= (currentPreviewPage - 1) * previewPageSize && i < currentPreviewPage * previewPageSize;
  }).length;
  const selectAllCheckbox = document.getElementById('previewSelectAll');
  selectAllCheckbox.checked = visibleCount > 0 && visibleSelected === visibleCount;
  selectAllCheckbox.indeterminate = visibleSelected > 0 && visibleSelected < visibleCount;
}

function previewSelectInverse() {
  const startIndex = (currentPreviewPage - 1) * previewPageSize;
  const endIndex = Math.min(startIndex + previewPageSize, previewProducts.length);
  
  for (let i = startIndex; i < endIndex; i++) {
    if (selectedIndices.has(i)) {
      selectedIndices.delete(i);
    } else {
      selectedIndices.add(i);
    }
  }
  
  renderPreviewProducts();
}

function previewDeselectAll() {
  selectedIndices.clear();
  renderPreviewProducts();
}

function previewDeleteSelected() {
  if (selectedIndices.size === 0) return;
  
  const indices = [...selectedIndices].sort((a, b) => b - a);
  indices.forEach(index => {
    previewProducts.splice(index, 1);
  });
  
  selectedIndices.clear();
  currentPreviewPage = Math.min(currentPreviewPage, Math.max(1, Math.ceil(previewProducts.length / previewPageSize)));
  
  document.querySelector('.product-preview-header h2').textContent = `商品预览（共${previewProducts.length}件）`;
  
  renderPreviewProducts();
}

function goToPreviewFirstPage() {
  currentPreviewPage = 1;
  renderPreviewProducts();
}

function goToPreviewPrevPage() {
  if (currentPreviewPage > 1) {
    currentPreviewPage--;
    renderPreviewProducts();
  }
}

function goToPreviewNextPage() {
  const totalPages = Math.ceil(previewProducts.length / previewPageSize);
  if (currentPreviewPage < totalPages) {
    currentPreviewPage++;
    renderPreviewProducts();
  }
}

function goToPreviewLastPage() {
  currentPreviewPage = Math.max(1, Math.ceil(previewProducts.length / previewPageSize));
  renderPreviewProducts();
}

function showPreviewExportProgress() {
  document.getElementById('previewExportProgress').style.display = 'block';
}

function hidePreviewExportProgress() {
  document.getElementById('previewExportProgress').style.display = 'none';
}

function updatePreviewExportProgress(current, total, statusText) {
  const progressBar = document.getElementById('previewExportProgressBar');
  const progressText = document.getElementById('previewExportProgressText');
  const status = document.getElementById('previewExportStatus');
  
  const percentage = total > 0 ? (current / total) * 100 : 0;
  progressBar.style.width = `${percentage}%`;
  progressText.textContent = `${current}/${total}`;
  status.textContent = statusText;
}

function handlePreviewExport() {
  if (selectedIndices.size === 0) {
    alert('请先选择要导出的商品');
    return;
  }
  
  const selectedProducts = [...selectedIndices].sort((a, b) => a - b).map(index => previewProducts[index]);
  
  console.log('Selected products for export:', selectedProducts.length);
  console.log('Product data sample:', selectedProducts.length > 0 ? selectedProducts[0] : 'No products');
  
  showPreviewExportProgress();
  updatePreviewExportProgress(0, selectedProducts.length, '初始化...');
  
  const exportProgressListener = (request, sender, sendResponse) => {
    if (request.action === 'previewExportProgress') {
      const progress = request.data;
      updatePreviewExportProgress(progress.current, progress.total, progress.message);
      
      if (progress.completed) {
        chrome.runtime.onMessage.removeListener(exportProgressListener);
        if (progress.success) {
          selectedProducts.forEach(p => {
            if (p.productId) exportedProductIds.add(p.productId);
          });
          renderPreviewProducts();
          setTimeout(() => {
            hidePreviewExportProgress();
            alert('导出成功');
          }, 500);
        } else {
          hidePreviewExportProgress();
          const errorMsg = progress.error || '导出失败';
          alert('导出失败: ' + errorMsg + '\n\n详细信息请查看控制台');
        }
      }
    }
  };
  
  chrome.runtime.onMessage.addListener(exportProgressListener);
  
  chrome.runtime.sendMessage({ 
    action: 'exportFromPreview', 
    data: selectedProducts 
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Export message error:', chrome.runtime.lastError);
      chrome.runtime.onMessage.removeListener(exportProgressListener);
      hidePreviewExportProgress();
      alert('导出失败: ' + chrome.runtime.lastError.message + '\n\n详细信息请查看控制台');
    }
  });
}

function performSearch(keyword) {
  console.log('=== Performing search for keyword:', keyword);
  
  const searchInput = document.querySelector('input[type="search"]') || 
                     document.querySelector('input[placeholder*="搜索"]') ||
                     document.querySelector('input[name*="search"]') ||
                     document.querySelector('input[aria-label*="搜索"]');
  
  if (searchInput) {
    console.log('Found search input:', searchInput);
    searchInput.value = keyword;
    
    const searchBtn = searchInput.nextElementSibling || 
                     searchInput.parentElement.querySelector('button') ||
                     document.querySelector('button[type="submit"]');
    
    if (searchBtn) {
      console.log('Found search button:', searchBtn);
      simulateClick(searchBtn);
    } else {
      console.log('No search button found, triggering input event');
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    return true;
  } else {
    console.log('Search input not found');
    return false;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getProducts') {
    console.log('Received request to get products');
    const region = request.data && request.data.region ? request.data.region : 'all';
    const keyword = request.data && request.data.keyword ? request.data.keyword : '';
    const products = extractProductInfo(region, keyword);
    console.log('Extracted products:', products);
    sendResponse({ success: true, data: products });
  } else if (request.action === 'showPreview') {
    console.log('Received request to show preview');
    if (request.data && request.data.length > 0) {
      createPreviewOverlay(request.data);
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'No products to preview' });
    }
  } else if (request.action === 'autoLoadMore') {
    console.log('Received request to auto load more');
    const { pageCount, delayStart, delayEnd, region, searchKeyword } = request.data;
    
    async function executeLoadMore() {
      if (region === 'searchGoods' && searchKeyword) {
        console.log('Performing search before load more');
        const searchSuccess = performSearch(searchKeyword);
        if (searchSuccess) {
          await delay(2);
          console.log('Search completed, waiting for results...');
          await waitForLoadMore(region);
        }
      }
      
      await autoLoadMore(pageCount, delayStart, delayEnd, region);
      const products = extractProductInfo(region, searchKeyword);
      sendResponse({ success: true, data: products });
    }
    
    executeLoadMore().catch((error) => {
      console.error('Auto load more failed:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    return true;
  }
});

function createFloatingActionButton() {
  const existing = document.getElementById('beidouFab');
  if (existing) existing.remove();
  
  const fab = document.createElement('div');
  fab.id = 'beidouFab';
  fab.className = 'beidou-fab';
  
  const btnPreview = document.createElement('button');
  btnPreview.className = 'beidou-fab-btn';
  btnPreview.innerHTML = `
    <span class="beidou-fab-icon">👁</span>
    <span class="beidou-fab-text">预览</span>
    <span class="beidou-fab-tooltip">提取并预览当前页面商品</span>
  `;
  
  const btnPanel = document.createElement('button');
  btnPanel.className = 'beidou-fab-btn';
  btnPanel.innerHTML = `
    <span class="beidou-fab-icon">⚙️</span>
    <span class="beidou-fab-text">面板</span>
    <span class="beidou-fab-tooltip">打开插件控制面板</span>
  `;
  
  btnPreview.addEventListener('click', () => {
    const products = extractProductInfo('all', '');
    if (products.length > 0) {
      createPreviewOverlay(products);
    } else {
      alert('未找到商品数据');
    }
  });
  
  btnPanel.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openPopup' });
  });
  
  fab.appendChild(btnPreview);
  fab.appendChild(btnPanel);
  
  document.body.appendChild(fab);
}

if (window.location.hostname.includes('temu.com')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFloatingActionButton);
  } else {
    createFloatingActionButton();
  }
}