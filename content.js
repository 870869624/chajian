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
    height: 160px !important;
    background: #333 !important;
    position: relative !important;
    overflow: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .preview-product-image-wrapper img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
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
`;
document.head.appendChild(styleElement);

function convertToHighQualityJpg(url) {
  if (!url) return '';
  
  const baseUrl = url.split('?')[0];
  
  if (baseUrl.endsWith('.avif') || baseUrl.endsWith('.webp')) {
    return baseUrl.replace(/\.(avif|webp)$/i, '.jpg') + '?imageView2/2/w/1000/q/95/format/jpeg';
  }
  
  return baseUrl + '?imageView2/2/w/1000/q/95/format/jpeg';
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

function extractProductInfo() {
  const products = [];
  const seenTitles = new Set();
  
  const productItems = document.querySelectorAll('[data-tooltip-title]');
  
  productItems.forEach((item) => {
    const title = item.getAttribute('data-tooltip-title');
    
    const priceElement = item.querySelector('span._2XgTiMJi') || 
                         item.querySelector('[data-type="price"] span');
    const price = priceElement ? priceElement.textContent.trim() : '';
    
    if (!price || !title) {
      return;
    }
    
    if (seenTitles.has(title)) {
      return;
    }
    
    seenTitles.add(title);
    
    const imgElement = item.querySelector('img.wxWpAMbp._2s7BZSpH.goods-img-external') || 
                       item.querySelector('img[data-cui-image]') ||
                       item.querySelector('img');
    const originalUrl = extractImageUrl(imgElement);
    const imageUrl = convertToHighQualityJpg(originalUrl);
    
    products.push({
      title: title,
      imageUrl: imageUrl,
      price: price
    });
  });
  
  return products;
}

let previewProducts = [];
let selectedIndices = new Set();
let currentPreviewPage = 1;
const previewPageSize = 48;

function createPreviewOverlay(products) {
  previewProducts = products;
  selectedIndices.clear();
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
        </div>
        <div class="preview-selected-count">已选: <span id="previewSelectedCount">0</span></div>
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
  
  document.getElementById('previewFirstPage').addEventListener('click', goToPreviewFirstPage);
  document.getElementById('previewPrevPage').addEventListener('click', goToPreviewPrevPage);
  document.getElementById('previewNextPage').addEventListener('click', goToPreviewNextPage);
  document.getElementById('previewLastPage').addEventListener('click', goToPreviewLastPage);
  
  renderPreviewProducts();
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
    return `
      <div class="preview-product-card ${isSelected ? 'selected' : ''}" data-index="${globalIndex}">
        <input type="checkbox" class="preview-product-checkbox" ${isSelected ? 'checked' : ''} data-index="${globalIndex}">
        <div class="preview-product-image-wrapper">
          <img src="${product.imageUrl}" alt="${product.title}" class="preview-product-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27200%27 height=%27200%27%3E%3Crect fill=%27%23333%27 width=%27200%27 height=%27200%27/%3E%3Ctext fill=%27%23666%27 font-size=%2714%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dominant-baseline=%27middle%27%3E图片加载失败%3C/text%3E%3C/svg%3E'" />
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getProducts') {
    console.log('Received request to get products');
    const products = extractProductInfo();
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
  }
});