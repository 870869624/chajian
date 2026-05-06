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

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function downloadImage(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'image/*',
        'Referer': 'https://www.kwcdn.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://www.kwcdn.com'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('[Background] Image download HTTP error:', response.status, response.statusText);
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    console.log('[Background] Image blob size:', blob.size, 'bytes');
    return blob;
  } catch (error) {
    console.error('[Background] Error downloading image:', error.message);
    console.error('[Background] Image URL:', url);
    throw error;
  }
}

async function downloadImagesConcurrently(products, concurrency = 5) {
  const results = new Map();
  let index = 0;
  
  async function worker() {
    while (index < products.length) {
      const i = index++;
      const product = products[i];
      if (product.imageUrl) {
        try {
          const cleanedUrl = product.imageUrl.replace(/[`'"]/g, '').trim();
          console.log('[Background] Downloading image:', cleanedUrl);
          const imageBlob = await downloadImage(cleanedUrl);
          results.set(i, imageBlob);
          console.log('[Background] Image downloaded successfully for product', i + 1);
        } catch (error) {
          console.warn('[Background] Failed to download image for product', i + 1, ':', error.message);
          results.set(i, null);
        }
      } else {
        console.log('[Background] No image URL for product', i + 1);
        results.set(i, null);
      }
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
    
    console.log('[Background] Downloading images concurrently...');
    const imageBlobs = await downloadImagesConcurrently(products, 5);
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log('[Background] Processing product', i + 1, ':', product.title);
      
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
        console.log('[Background] Image added for product', i + 1);
      } else {
        console.log('[Background] No image for product', i + 1);
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
    const arrayBuffer = await content.arrayBuffer();
    const base64Data = arrayBufferToBase64(arrayBuffer);
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