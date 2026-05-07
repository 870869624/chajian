document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const previewBtn = document.getElementById('previewBtn');
  const clearBtn = document.getElementById('clearBtn');
  const exportBtn = document.getElementById('exportBtn');
  const filterBtn = document.getElementById('filterBtn');
  const searchKeywordInput = document.getElementById('searchKeyword');
  
  const pageProgressBar = document.getElementById('pageProgressBar');
  const pageProgressText = document.getElementById('pageProgressText');
  const pageStatus = document.getElementById('pageStatus');
  
  const fetchProgressBar = document.getElementById('fetchProgressBar');
  const fetchProgressText = document.getElementById('fetchProgressText');
  const fetchStatus = document.getElementById('fetchStatus');
  
  const exportProgressBar = document.getElementById('exportProgressBar');
  const exportProgressText = document.getElementById('exportProgressText');
  const exportStatus = document.getElementById('exportStatus');
  
  let products = [];
  let currentRegion = 'storeGoods';
  let totalPageCount = 0;

  function getSelectedRegion() {
    const selectedRadio = document.querySelector('input[name="pageType"]:checked');
    if (selectedRadio) {
      return selectedRadio.value;
    }
    return 'storeGoods';
  }

  function updatePageProgress(current, total, statusText, completed = false) {
    const percentage = total > 0 ? (current / total) * 100 : 0;
    pageProgressBar.style.width = `${percentage}%`;
    pageProgressText.textContent = `${current}/${total}`;
    
    if (completed) {
      pageStatus.textContent = statusText;
      pageStatus.style.color = '#4CAF50';
    } else {
      pageStatus.textContent = statusText;
      pageStatus.style.color = '#4080ff';
    }
  }

  function updateFetchProgress(count, statusText, completed = false) {
    fetchProgressText.textContent = `${count} 件`;
    
    if (completed) {
      fetchStatus.textContent = statusText;
      fetchStatus.style.color = '#4CAF50';
      fetchProgressBar.style.width = '100%';
    } else {
      fetchStatus.textContent = statusText;
      fetchStatus.style.color = '#2196F3';
    }
  }

  function updateExportProgress(current, total, statusText, completed = false) {
    const percentage = total > 0 ? (current / total) * 100 : 0;
    exportProgressBar.style.width = `${percentage}%`;
    exportProgressText.textContent = `${current}/${total}`;
    
    if (completed) {
      exportStatus.textContent = statusText;
      exportStatus.style.color = '#4CAF50';
    } else {
      exportStatus.textContent = statusText;
      exportStatus.style.color = '#4CAF50';
    }
  }

  function resetProgress() {
    updatePageProgress(0, totalPageCount, '未开始');
    pageProgressBar.style.width = '0%';
    updateFetchProgress(0, '未开始');
    fetchProgressBar.style.width = '0%';
    updateExportProgress(0, products.length, '未开始');
    exportProgressBar.style.width = '0%';
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'loadMoreProgress') {
      const progress = request.data;
      updatePageProgress(progress.current, progress.total, progress.message, progress.completed);
      
      if (progress.completed) {
        updateFetchProgress(0, '正在提取商品数据...');
      }
    }
  });

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

  async function getProductsFromPage(region = 'storeGoods', keyword = '') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    await injectContentScript(tab.id);

    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tab.id, { action: 'getProducts', data: { region, keyword } }, (response) => {
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
    const region = getSelectedRegion();
    const pageCount = parseInt(document.getElementById('pageCount').value) || 1;
    const delayStart = parseFloat(document.getElementById('delayStart').value) || 1;
    const delayEnd = parseFloat(document.getElementById('delayEnd').value) || 3;
    const searchKeyword = searchKeywordInput.value.trim();
    
    if (delayStart > delayEnd) {
      fetchStatus.textContent = '起始时间不能大于结束时间';
      fetchStatus.style.color = '#f44336';
      return;
    }
    
    totalPageCount = pageCount;
    currentRegion = region;
    
    resetProgress();
    updatePageProgress(0, pageCount, '准备翻页...');
    updateFetchProgress(0, '等待翻页完成...');
    
    let regionName;
    switch(region) {
      case 'storeGoods':
        regionName = '店铺商品';
        break;
      case 'selected':
        regionName = '为您精选';
        break;
      case 'searchGoods':
        regionName = '搜索商品';
        break;
      case 'searchGood':
        regionName = '搜索好物';
        break;
      default:
        regionName = '商品';
    }
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await injectContentScript(tab.id);
      
      updatePageProgress(0, pageCount, searchKeyword ? `${regionName}搜索中...` : `${regionName}翻页中...`);
      
      const result = await new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, { 
          action: 'autoLoadMore', 
          data: { pageCount, delayStart, delayEnd, region, searchKeyword } 
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
        updateFetchProgress(products.length, `${regionName}获取完成`, true);
        updatePageProgress(pageCount, pageCount, '翻页完成', true);
        console.log(`${regionName} received:`, products);
      } else {
        updateFetchProgress(0, `${regionName}获取失败: ${result.error || '未知错误'}`, true);
        fetchStatus.style.color = '#f44336';
        updatePageProgress(0, pageCount, '翻页失败', true);
        pageStatus.style.color = '#f44336';
      }
    } catch (error) {
      console.error('Error getting products:', error);
      updateFetchProgress(0, '获取失败: ' + error.message, true);
      fetchStatus.style.color = '#f44336';
      updatePageProgress(0, pageCount, '翻页失败', true);
      pageStatus.style.color = '#f44336';
    }
  });

  previewBtn.addEventListener('click', async () => {
    if (products.length === 0) {
      fetchStatus.textContent = '请先获取商品';
      fetchStatus.style.color = '#FF9800';
      return;
    }
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { action: 'showPreview', data: products }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Send message error:', chrome.runtime.lastError);
        fetchStatus.textContent = '预览失败: ' + chrome.runtime.lastError.message;
        fetchStatus.style.color = '#f44336';
      } else if (response && response.success) {
        fetchStatus.textContent = '预览已打开';
        fetchStatus.style.color = '#4CAF50';
      } else {
        fetchStatus.textContent = '预览失败';
        fetchStatus.style.color = '#f44336';
      }
    });
  });

  async function downloadImage(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      xhr.timeout = 30000;
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(xhr.response);
        } else {
          reject(new Error(`Failed to download image: ${xhr.status}`));
        }
      };
      xhr.onerror = () => reject(new Error('Failed to download image'));
      xhr.ontimeout = () => reject(new Error('Download timeout'));
      xhr.send();
    });
  }

  async function downloadImagesConcurrently(products, concurrency = 5, onProgress) {
    const results = new Map();
    let index = 0;
    let completed = 0;
    
    async function worker() {
      while (index < products.length) {
        const i = index++;
        const product = products[i];
        if (product.imageUrl) {
          try {
            const imageBlob = await downloadImage(product.imageUrl);
            results.set(i, imageBlob);
          } catch (error) {
            console.warn(`Failed to download image for product ${i + 1}:`, error);
            results.set(i, null);
          }
        } else {
          results.set(i, null);
        }
        completed++;
        onProgress(completed);
      }
    }
    
    const workers = [];
    for (let i = 0; i < concurrency; i++) {
      workers.push(worker());
    }
    
    await Promise.all(workers);
    return results;
  }

  function generateExcelContent(products) {
    const headers = ['序号【必填，用于匹配上传的商品文件夹名】', '商品名称【选填】', '售价'];
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
      exportStatus.textContent = '请先获取商品';
      exportStatus.style.color = '#FF9800';
      return;
    }

    updateExportProgress(0, products.length, '初始化...');

    try {
      const zip = new JSZip();
      const timestamp = new Date().toISOString().replace(/[-:\.T]/g, '');
      const mainFolder = zip.folder(`导出文件_${timestamp}`);

      updateExportProgress(0, products.length, '下载图片中...');
      
      const imageBlobs = await downloadImagesConcurrently(products, 5, (completed) => {
        updateExportProgress(completed, products.length, `下载图片中... (${completed}/${products.length})`);
      });
      
      updateExportProgress(products.length, products.length, '创建文件夹结构...');

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const productFolder = mainFolder.folder(`${i + 1}`);

        const specFolder = productFolder.folder('规格图');
        const detailFolder = productFolder.folder('详情图');

        const imageBlob = imageBlobs.get(i);
        if (imageBlob) {
          specFolder.file('1-混合色.jpeg', imageBlob);
          specFolder.file('2-混合色.jpeg', imageBlob);
          specFolder.file('3-混合色.jpeg', imageBlob);
          detailFolder.file('1.jpeg', imageBlob);
          detailFolder.file('2.jpeg', imageBlob);
          detailFolder.file('3.jpeg', imageBlob);
        }

        updateExportProgress(i + 1, products.length, `压缩中... (${i + 1}/${products.length})`);
      }

      const excelContent = generateExcelContent(products);
      mainFolder.file('批量上架附加表格.xlsx', excelContent);

      updateExportProgress(products.length, products.length, '生成压缩包...');
      const content = await zip.generateAsync({ type: 'blob' });
      
      updateExportProgress(products.length, products.length, '导出完成', true);
      saveAs(content, `导出文件_${timestamp}.zip`);

    } catch (error) {
      console.error('Export failed:', error);
      updateExportProgress(0, products.length, '导出失败: ' + error.message, true);
      exportStatus.style.color = '#f44336';
    }
  });

  clearBtn.addEventListener('click', () => {
    products = [];
    resetProgress();
    fetchStatus.textContent = '已清空';
    fetchStatus.style.color = '#999';
  });

  filterBtn.addEventListener('click', () => {
    fetchStatus.textContent = '筛选条件设置';
    fetchStatus.style.color = '#FF9800';
  });
});