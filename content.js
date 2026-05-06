console.log('Content script loaded on:', window.location.href);

const style = document.createElement('style');
style.textContent = `
  .plugin-highlight {
    background-color: yellow;
    border: 1px solid orange;
    padding: 2px 4px;
    border-radius: 2px;
  }
  
  .product-preview-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    z-index: 99999;
    overflow: auto;
  }
  
  .product-preview-overlay.show {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .product-preview-container {
    background: #1a1a1a;
    border: 3px solid #ffd700;
    border-radius: 16px;
    width: 95%;
    max-width: 1400px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(255, 215, 0, 0.3);
  }
  
  .product-preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
    border-bottom: 2px solid #ffd700;
  }
  
  .product-preview-header h2 {
    color: #ffd700;
    font-size: 24px;
    margin: 0;
    font-weight: 700;
  }
  
  .product-preview-close {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid #ffd700;
    background: #1a1a1a;
    color: #ffd700;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }
  
  .product-preview-close:hover {
    background: #ffd700;
    color: #1a1a1a;
  }
  
  .product-preview-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: #222;
    border-bottom: 1px solid #333;
  }
  
  .preview-toolbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .preview-checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
  }
  
  .preview-checkbox-label input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: #ffd700;
  }
  
  .preview-toolbar-btn {
    padding: 10px 20px;
    background: #333;
    border: 1px solid #444;
    color: #fff;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
  }
  
  .preview-toolbar-btn:hover {
    background: #444;
    border-color: #ffd700;
  }
  
  .preview-toolbar-btn.danger {
    background: #4a0a0a;
    border-color: #8b0000;
  }
  
  .preview-toolbar-btn.danger:hover {
    background: #6a0a0a;
    border-color: #ff0000;
  }
  
  .preview-selected-count {
    color: #ffd700;
    font-size: 14px;
    font-weight: 600;
  }
  
  .preview-products-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 20px;
    padding: 24px;
    overflow-y: auto;
    flex: 1;
    background: #1a1a1a;
  }
  
  .preview-product-card {
    background: #222 !important;
    border: 2px solid #333 !important;
    border-radius: 12px !important;
    overflow: hidden !important;
    cursor: pointer !important;
    transition: all 0.3s ease !important;
    position: relative !important;
    display: flex !important;
    flex-direction: column !important;
    height: auto !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  .preview-product-card:hover {
    transform: translateY(-8px);
    border-color: #ffd700;
    box-shadow: 0 12px 30px rgba(255, 215, 0, 0.2);
  }
  
  .preview-product-card.selected {
    border-color: #ffd700;
    box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.3);
  }
  
  .preview-product-checkbox {
    position: absolute;
    top: 10px;
    left: 10px;
    width: 24px;
    height: 24px;
    accent-color: #ffd700;
    cursor: pointer;
    z-index: 10;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .preview-product-card:hover .preview-product-checkbox,
  .preview-product-checkbox:checked {
    opacity: 1;
  }
  
  .preview-product-image-wrapper {
    position: relative !important;
    width: 100% !important;
    height: 180px !important;
    background: #333 !important;
    margin: 0 !important;
    padding: 0 !important;
    flex-shrink: 0;
  }
  
  .preview-product-image-wrapper img {
    position: relative !important;
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    display: block !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  .preview-product-info {
    padding: 12px !important;
    margin: 0 !important;
    display: block !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }
  
  .preview-product-title {
    color: #fff !important;
    font-size: 12px !important;
    line-height: 1.4 !important;
    margin: 0 0 8px 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    white-space: normal !important;
    font-weight: normal !important;
    background: none !important;
    border: none !important;
  }
  
  .preview-product-price {
    color: #ffd700 !important;
    font-size: 16px !important;
    font-weight: 700 !important;
    margin: 0 !important;
    padding: 0 !important;
    background: none !important;
    border: none !important;
  }
  
  .preview-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    padding: 20px 24px;
    background: #222;
    border-top: 1px solid #333;
  }
  
  .preview-page-btn {
    padding: 12px 24px;
    background: #333;
    border: 1px solid #444;
    color: #fff;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
  }
  
  .preview-page-btn:hover:not(:disabled) {
    background: #ffd700;
    color: #1a1a1a;
    border-color: #ffd700;
  }
  
  .preview-page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .preview-page-info {
    color: #fff;
    font-size: 14px;
    font-weight: 500;
  }
  
  .preview-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    color: #666;
  }
  
  .preview-empty-state p {
    font-size: 18px;
    margin: 0;
  }
  
  @media (max-width: 1400px) {
    .preview-products-grid {
      grid-template-columns: repeat(5, 1fr);
    }
  }
  
  @media (max-width: 1200px) {
    .preview-products-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  @media (max-width: 900px) {
    .preview-products-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  @media (max-width: 600px) {
    .preview-products-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;
document.head.appendChild(style);

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