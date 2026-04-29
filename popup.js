document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const previewBtn = document.getElementById('previewBtn');
  const clearBtn = document.getElementById('clearBtn');
  const exportBtn = document.getElementById('exportBtn');
  const filterBtn = document.getElementById('filterBtn');
  const status = document.getElementById('status');
  const count = document.getElementById('count');

  startBtn.addEventListener('click', () => {
    status.textContent = '获取中...';
    status.style.color = '#4080ff';
  });

  previewBtn.addEventListener('click', () => {
    status.textContent = '预览模式';
    status.style.color = '#FF9800';
  });

  clearBtn.addEventListener('click', () => {
    count.textContent = '0';
    status.textContent = '已清空';
    status.style.color = '#999';
  });

  exportBtn.addEventListener('click', () => {
    status.textContent = '导出中...';
    status.style.color = '#4CAF50';
  });

  filterBtn.addEventListener('click', () => {
    status.textContent = '筛选条件设置';
    status.style.color = '#FF9800';
  });
});