importScripts('jszip.min.js', 'xlsx.full.min.js');

chrome.runtime.onInstalled.addListener((details) => {
  console.log('插件已安装');
  
  if (details.reason === 'install') {
    chrome.storage.local.set({ enabled: true });
    console.log('首次安装，初始化配置');
  } else if (details.reason === 'update') {
    console.log('插件已更新');
  }
});

chrome.action.onClicked.addListener((tab) => {
  console.log('插件图标被点击');
});

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'exportFromPreview') {
    console.log('[Background] Received export request from preview');
    console.log('[Background] Number of products:', request.data ? request.data.length : 'undefined');
    console.log('[Background] Product sample:', request.data && request.data.length > 0 ? JSON.stringify(request.data[0]) : 'No data');
    
    if (!request.data || !Array.isArray(request.data) || request.data.length === 0) {
      console.error('[Background] Invalid or empty product data');
      sendResponse({ success: false, error: '无效的商品数据' });
      return;
    }
    
    handleExportFromPreview(request.data, sendResponse);
    return true;
  }
});

async function handleExportFromPreview(products, sendResponse) {
  console.log('[Background] Starting export process for', products.length, 'products');
  
  try {
    console.log('[Background] Creating JSZip instance');
    const zip = new JSZip();
    
    const timestamp = new Date().toISOString().replace(/[-:\.T]/g, '');
    console.log('[Background] Creating main folder:', `导出格式示例_${timestamp}`);
    const mainFolder = zip.folder(`导出格式示例_${timestamp}`);
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log('[Background] Processing product', i + 1, ':', product.title);
      
      const productFolder = mainFolder.folder(`${i + 1}`);
      const specFolder = productFolder.folder('规格图');
      const detailFolder = productFolder.folder('详情图');
      
      if (product.imageUrl) {
        try {
          console.log('[Background] Downloading image:', product.imageUrl);
          const imageBlob = await downloadImage(product.imageUrl);
          specFolder.file(`${i + 1}.jpeg`, imageBlob);
          detailFolder.file(`${i + 1}.jpeg`, imageBlob);
          console.log('[Background] Image downloaded successfully for product', i + 1);
        } catch (error) {
          console.warn('[Background] Failed to download image for product', i + 1, ':', error.message);
        }
      } else {
        console.log('[Background] No image URL for product', i + 1);
      }
    }
    
    console.log('[Background] Generating Excel content');
    const excelContent = generateExcelContent(products);
    mainFolder.file('批量上架附加表格.xlsx', excelContent);
    console.log('[Background] Excel content generated');
    
    console.log('[Background] Generating ZIP archive');
    const content = await zip.generateAsync({ type: 'blob' });
    console.log('[Background] ZIP archive generated, size:', content.size, 'bytes');
    
    console.log('[Background] Converting blob to base64');
    const base64Data = await blobToBase64(content);
    console.log('[Background] Base64 conversion completed');
    
    console.log('[Background] Starting download');
    chrome.downloads.download({
      url: `data:application/zip;base64,${base64Data}`,
      filename: `导出格式示例_${timestamp}.zip`,
      saveAs: true
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('[Background] Download failed:', chrome.runtime.lastError);
        sendResponse({ success: false, error: '下载失败: ' + chrome.runtime.lastError.message });
      } else {
        console.log('[Background] Download started with ID:', downloadId);
        sendResponse({ success: true });
      }
    });
  } catch (error) {
    console.error('[Background] Export failed with exception:', error);
    console.error('[Background] Error stack:', error.stack);
    sendResponse({ success: false, error: '导出过程异常: ' + error.message });
  }
}