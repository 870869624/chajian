document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const previewBtn = document.getElementById('previewBtn');
  const clearBtn = document.getElementById('clearBtn');
  const exportBtn = document.getElementById('exportBtn');
  const filterBtn = document.getElementById('filterBtn');
  const status = document.getElementById('status');
  const count = document.getElementById('count');
  
  let products = [];

  startBtn.addEventListener('click', async () => {
    status.textContent = '获取中...';
    status.style.color = '#4080ff';
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getProducts' });
      
      if (response && response.success) {
        products = response.data;
        count.textContent = products.length.toString();
        status.textContent = '获取完成';
        status.style.color = '#4CAF50';
        console.log('Products received:', products);
      } else {
        status.textContent = '获取失败';
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
    
    const previewContent = products.map((p, index) => 
      `<div style="margin: 10px; padding: 10px; border: 1px solid #ccc;">
        <h4>${index + 1}. ${p.title}</h4>
        <img src="${p.imageUrl}" width="100" />
        <p>价格: ${p.price}</p>
      </div>`
    ).join('');
    
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`<html><body>${previewContent}</body></html>`);
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