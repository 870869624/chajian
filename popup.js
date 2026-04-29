document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn');
  const message = document.getElementById('message');

  btn.addEventListener('click', () => {
    message.textContent = '插件已加载成功！';
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        function: () => {
          alert('Hello from Chrome Extension!');
        }
      });
    });
  });
});