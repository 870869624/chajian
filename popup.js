document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const previewBtn = document.getElementById('previewBtn');
  const clearBtn = document.getElementById('clearBtn');
  const exportBtn = document.getElementById('exportBtn');
  const filterBtn = document.getElementById('filterBtn');
  const status = document.getElementById('status');
  const count = document.getElementById('count');
  
  let products = [];

  async function injectContentScript(tabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });
      return true;
    } catch (error) {
      console.error('Failed to inject content script:', error);
      return false;
    }
  }

  async function getProductsFromPage() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    await injectContentScript(tab.id);

    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tab.id, { action: 'getProducts' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Send message error:', chrome.runtime.lastError);
          resolve({ success: false, error: chrome.runtime.lastError.message });
        } else if (response && response.success) {
          resolve({ success: true, data: response.data });
        } else {
          resolve({ success: false, error: 'No response' });
        }
      });
    });
  }

  startBtn.addEventListener('click', async () => {
    status.textContent = '获取中...';
    status.style.color = '#4080ff';
    
    try {
      const result = await getProductsFromPage();
      
      if (result.success) {
        products = result.data;
        count.textContent = products.length.toString();
        status.textContent = '获取完成';
        status.style.color = '#4CAF50';
        console.log('Products received:', products);
      } else {
        status.textContent = '获取失败: ' + (result.error || '未知错误');
        status.style.color = '#f44336';
      }
    } catch (error) {
      console.error('Error getting products:', error);
      status.textContent = '获取失败: ' + error.message;
      status.style.color = '#f44336';
    }
  });

  previewBtn.addEventListener('click', () => {
    if (products.length === 0) {
      status.textContent = '请先获取商品';
      status.style.color = '#FF9800';
      return;
    }

    status.textContent = '预览模式';
    status.style.color = '#FF9800';

    const previewWindow = window.open('', '_blank');
    if (!previewWindow) {
      status.textContent = '预览被拦截，请允许弹出窗口';
      status.style.color = '#f44336';
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>商品预览</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background: #f5f5f5; }
          .toolbar { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; align-items: center; }
          .toolbar-btn { padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; }
          .toolbar-btn:hover { opacity: 0.9; transform: translateY(-1px); }
          .btn-primary { background: #4080ff; color: #fff; }
          .btn-success { background: #4CAF50; color: #fff; }
          .btn-warning { background: #FF9800; color: #fff; }
          .btn-danger { background: #f44336; color: #fff; }
          .btn-secondary { background: #9e9e9e; color: #fff; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #e0e0e0; flex-wrap: wrap; gap: 12px; }
          h1 { font-size: 24px; color: #333; }
          .count { font-size: 14px; color: #666; background: #fff; padding: 8px 16px; border-radius: 20px; border: 1px solid #ddd; }
          .selected-count { font-size: 14px; color: #fff; background: #4080ff; padding: 8px 16px; border-radius: 20px; }
          .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
          .product-card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s, box-shadow 0.2s; position: relative; }
          .product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
          .product-card.selected { outline: 3px solid #4080ff; }
          .product-checkbox { position: absolute; top: 12px; left: 12px; width: 24px; height: 24px; cursor: pointer; z-index: 10; }
          .product-card img { width: 100%; height: 200px; object-fit: cover; background: #fafafa; cursor: pointer; }
          .product-info { padding: 16px; }
          .product-index { font-size: 12px; color: #999; margin-bottom: 4px; }
          .product-title { font-size: 14px; color: #333; line-height: 1.4; height: 40px; overflow: hidden; margin-bottom: 12px; }
          .product-price { font-size: 20px; color: #e53935; font-weight: bold; }
          .product-price::before { content: '¥'; font-size: 14px; }
          .image-viewer { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: flex; justify-content: center; align-items: center; z-index: 1000; cursor: pointer; }
          .image-viewer img { max-width: 90%; max-height: 90%; object-fit: contain; border-radius: 8px; }
          .image-viewer .close-btn { position: absolute; top: 20px; right: 20px; color: #fff; font-size: 32px; cursor: pointer; }
        </style>
      </head>
      <body>
        <div class="toolbar">
          <button class="toolbar-btn btn-primary" id="selectAllBtn">全选</button>
          <button class="toolbar-btn btn-secondary" id="deselectAllBtn">反选</button>
          <button class="toolbar-btn btn-danger" id="deleteBtn">删除选中</button>
          <button class="toolbar-btn btn-success" id="exportBtn">导出选中</button>
        </div>
        <div class="header">
          <h1>商品预览</h1>
          <div style="display: flex; gap: 12px; align-items: center;">
            <span class="selected-count" id="selectedCount">已选择: 0 件</span>
            <span class="count">共 ${products.length} 件商品</span>
          </div>
        </div>
        <div class="product-grid" id="productGrid">
          ${products.map((p, i) => `
            <div class="product-card" data-index="${i}">
              <input type="checkbox" class="product-checkbox" id="checkbox-${i}" />
              <img src="${p.imageUrl}" alt="${p.title}" id="img-${i}" />
              <div class="product-info">
                <div class="product-index">商品 ${i + 1}</div>
                <div class="product-title" title="${p.title}">${p.title}</div>
                <div class="product-price">${p.price}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div id="imageViewer" class="image-viewer" style="display: none;">
          <span class="close-btn">&times;</span>
          <img id="viewerImg" />
        </div>
        <script>
          const products = ${JSON.stringify(products)};
          const selected = new Set();
          const productGrid = document.getElementById('productGrid');
          const selectedCountEl = document.getElementById('selectedCount');
          const imageViewer = document.getElementById('imageViewer');
          const viewerImg = document.getElementById('viewerImg');

          function updateSelectedCount() {
            selectedCountEl.textContent = '已选择: ' + selected.size + ' 件';
          }

          function updateCardStyles() {
            document.querySelectorAll('.product-card').forEach(card => {
              const idx = parseInt(card.dataset.index);
              if (selected.has(idx)) {
                card.classList.add('selected');
              } else {
                card.classList.remove('selected');
              }
            });
          }

          productGrid.addEventListener('change', (e) => {
            if (e.target.classList.contains('product-checkbox')) {
              const idx = parseInt(e.target.id.replace('checkbox-', ''));
              if (e.target.checked) {
                selected.add(idx);
              } else {
                selected.delete(idx);
              }
              updateCardStyles();
              updateSelectedCount();
            }
          });

          productGrid.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG' && !e.target.classList.contains('product-checkbox')) {
              viewerImg.src = e.target.src;
              imageViewer.style.display = 'flex';
            }
          });

          imageViewer.addEventListener('click', () => {
            imageViewer.style.display = 'none';
          });

          document.getElementById('selectAllBtn').addEventListener('click', () => {
            products.forEach((_, i) => selected.add(i));
            document.querySelectorAll('.product-checkbox').forEach(cb => cb.checked = true);
            updateCardStyles();
            updateSelectedCount();
          });

          document.getElementById('deselectAllBtn').addEventListener('click', () => {
            selected.clear();
            document.querySelectorAll('.product-checkbox').forEach(cb => cb.checked = false);
            updateCardStyles();
            updateSelectedCount();
          });

          document.getElementById('deleteBtn').addEventListener('click', () => {
            if (selected.size === 0) {
              alert('请先选择要删除的商品');
              return;
            }
            const deletedIndices = Array.from(selected).sort((a, b) => b - a);
            deletedIndices.forEach(idx => products.splice(idx, 1));
            window.opener.postMessage({ action: 'updateProducts', data: products }, '*');
            alert('已删除 ' + deletedIndices.length + ' 件商品，窗口将关闭，请重新打开预览');
            window.close();
          });

          document.getElementById('exportBtn').addEventListener('click', () => {
            if (selected.size === 0) {
              alert('请先选择要导出的商品');
              return;
            }
            const selectedProducts = Array.from(selected).map(i => products[i]);
            const csvContent = [
              ['标题', '图片链接', '售价'],
              ...selectedProducts.map(p => [p.title, p.imageUrl, p.price])
            ].map(row => row.join(',')).join('\\n');
            const blob = new Blob(['\\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = 'selected_products.csv';
            link.click();
          });
        </script>
      </body>
      </html>
    `;

    previewWindow.document.write(html);
    previewWindow.document.close();
  });

  clearBtn.addEventListener('click', () => {
    products = [];
    count.textContent = '0';
    status.textContent = '已清空';
    status.style.color = '#999';
  });

  exportBtn.addEventListener('click', () => {
    if (products.length === 0) {
      status.textContent = '请先获取商品';
      status.style.color = '#FF9800';
      return;
    }
    
    status.textContent = '导出中...';
    status.style.color = '#4CAF50';
    
    const csvContent = [
      ['标题', '图片链接', '售价'],
      ...products.map(p => [p.title, p.imageUrl, p.price])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'temu_products.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    status.textContent = '导出完成';
  });

  window.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'updateProducts') {
    products = event.data.data;
    count.textContent = products.length.toString();
  }
});

filterBtn.addEventListener('click', () => {
  status.textContent = '筛选条件设置';
  status.style.color = '#FF9800';
});
});