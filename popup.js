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

  previewBtn.addEventListener('click', async () => {
    if (products.length === 0) {
      status.textContent = '请先获取商品';
      status.style.color = '#FF9800';
      return;
    }
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { action: 'showPreview', data: products }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Send message error:', chrome.runtime.lastError);
        status.textContent = '预览失败: ' + chrome.runtime.lastError.message;
        status.style.color = '#f44336';
      } else if (response && response.success) {
        status.textContent = '预览已打开';
        status.style.color = '#4CAF50';
      } else {
        status.textContent = '预览失败';
        status.style.color = '#f44336';
      }
    });
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
    ].map(row => row.map(cell => {
      if (typeof cell === 'string' && cell.includes(',')) {
        return `"${cell}"`;
      }
      return cell;
    }).join(',')).join('\n');
    
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