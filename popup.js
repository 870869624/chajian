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
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #e0e0e0; }
          h1 { font-size: 24px; color: #333; }
          .count { font-size: 14px; color: #666; background: #fff; padding: 8px 16px; border-radius: 20px; border: 1px solid #ddd; }
          .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
          .product-card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s, box-shadow 0.2s; }
          .product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
          .product-card img { width: 100%; height: 200px; object-fit: cover; background: #fafafa; }
          .product-info { padding: 16px; }
          .product-index { font-size: 12px; color: #999; margin-bottom: 4px; }
          .product-title { font-size: 14px; color: #333; line-height: 1.4; height: 40px; overflow: hidden; margin-bottom: 12px; }
          .product-price { font-size: 20px; color: #e53935; font-weight: bold; }
          .product-price::before { content: '¥'; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>商品预览</h1>
          <span class="count">共 ${products.length} 件商品</span>
        </div>
        <div class="product-grid">
          ${products.map((p, i) => `
            <div class="product-card">
              <img src="${p.imageUrl}" alt="${p.title}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22><rect fill=%22%23f0f0f0%22 width=%22200%22 height=%22200%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22>图片加载失败</text></svg>'" />
              <div class="product-info">
                <div class="product-index">商品 ${i + 1}</div>
                <div class="product-title" title="${p.title}">${p.title}</div>
                <div class="product-price">${p.price}</div>
              </div>
            </div>
          `).join('')}
        </div>
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

  filterBtn.addEventListener('click', () => {
    status.textContent = '筛选条件设置';
    status.style.color = '#FF9800';
  });
});