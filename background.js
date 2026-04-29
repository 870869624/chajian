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