console.log('Content script loaded on:', window.location.href);

const style = document.createElement('style');
style.textContent = `
  .plugin-highlight {
    background-color: yellow;
    border: 1px solid orange;
    padding: 2px 4px;
    border-radius: 2px;
  }
`;
document.head.appendChild(style);