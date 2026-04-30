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

function extractProductInfo() {
  const products = [];
  
  const productItems = document.querySelectorAll('[data-tooltip-title]');
  
  productItems.forEach((item) => {
    const title = item.getAttribute('data-tooltip-title');
    
    const imgElement = item.querySelector('img.wxWpAMbp._2s7BZSpH.goods-img-external') || 
                       item.querySelector('img[data-cui-image]') ||
                       item.querySelector('img');
    const imageUrl = imgElement ? imgElement.src : '';
    
    const priceElement = item.querySelector('span._2XgTiMJi') || 
                         item.querySelector('[data-type="price"] span');
    const price = priceElement ? priceElement.textContent.trim() : '';
    
    if (title || imageUrl || price) {
      products.push({
        title: title || '',
        imageUrl: imageUrl || '',
        price: price || ''
      });
    }
  });
  
  return products;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getProducts') {
    console.log('Received request to get products');
    const products = extractProductInfo();
    console.log('Extracted products:', products);
    sendResponse({ success: true, data: products });
  }
});