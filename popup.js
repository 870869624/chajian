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
    const pageCount = parseInt(document.getElementById('pageCount').value) || 1;
    const delayStart = parseFloat(document.getElementById('delayStart').value) || 1;
    const delayEnd = parseFloat(document.getElementById('delayEnd').value) || 3;
    
    if (delayStart > delayEnd) {
      status.textContent = '起始时间不能大于结束时间';
      status.style.color = '#f44336';
      return;
    }
    
    status.textContent = '获取中...';
    status.style.color = '#4080ff';
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await injectContentScript(tab.id);
      
      status.textContent = `翻页中... (1/${pageCount})`;
      
      const result = await new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, { 
          action: 'autoLoadMore', 
          data: { pageCount, delayStart, delayEnd } 
        }, (response) => {
          if (chrome.runtime.lastError) {
            resolve({ success: false, error: chrome.runtime.lastError.message });
          } else if (response && response.success) {
            resolve({ success: true, data: response.data });
          } else {
            resolve({ success: false, error: 'No response' });
          }
        });
      });
      
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

  async function downloadImage(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(xhr.response);
        } else {
          reject(new Error(`Failed to download image: ${xhr.status}`));
        }
      };
      xhr.onerror = () => reject(new Error('Failed to download image'));
      xhr.send();
    });
  }

  function generateExcelContent(products) {
    const headers = ['编号', '标题', '售价'];
    const rows = products.map((p, index) => [
      index + 1,
      p.title,
      p.price
    ]);

    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '商品列表');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  exportBtn.addEventListener('click', async () => {
    if (products.length === 0) {
      status.textContent = '请先获取商品';
      status.style.color = '#FF9800';
      return;
    }
    
    status.textContent = '导出中...';
    status.style.color = '#4CAF50';

    try {
      const zip = new JSZip();
      
      const timestamp = new Date().toISOString().replace(/[-:\.T]/g, '');
      const mainFolder = zip.folder(`导出格式示例_${timestamp}`);
      
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const productFolder = mainFolder.folder(`${i + 1}`);
        
        const specFolder = productFolder.folder('规格图');
        const detailFolder = productFolder.folder('详情图');
        
        if (product.imageUrl) {
          try {
            const imageBlob = await downloadImage(product.imageUrl);
            specFolder.file(`${i + 1}.jpeg`, imageBlob);
            detailFolder.file(`${i + 1}.jpeg`, imageBlob);
          } catch (error) {
            console.warn(`Failed to download image for product ${i + 1}:`, error);
          }
        }
        
        status.textContent = `导出中... (${i + 1}/${products.length})`;
      }
      
      const excelContent = generateExcelContent(products);
      mainFolder.file('批量上架附加表格.xlsx', excelContent);
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `导出格式示例_${timestamp}.zip`);
      
      status.textContent = '导出完成';
    } catch (error) {
      console.error('Export failed:', error);
      status.textContent = '导出失败: ' + error.message;
      status.style.color = '#f44336';
    }
  });

  clearBtn.addEventListener('click', () => {
    products = [];
    count.textContent = '0';
    status.textContent = '已清空';
    status.style.color = '#999';
  });

  filterBtn.addEventListener('click', () => {
    status.textContent = '筛选条件设置';
    status.style.color = '#FF9800';
  });
});