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

function convertToHighQualityJpg(url) {
  if (!url) return '';
  
  const baseUrl = url.split('?')[0];
  
  if (baseUrl.endsWith('.avif') || baseUrl.endsWith('.webp')) {
    return baseUrl.replace(/\.(avif|webp)$/i, '.jpg') + '?imageView2/2/w/1000/q/95/format/jpeg';
  }
  
  return baseUrl + '?imageView2/2/w/1000/q/95/format/jpeg';
}

function extractProductInfo() {
  const products = [];
  const seenTitles = new Set();
  
  const productItems = document.querySelectorAll('[data-tooltip-title]');
  
  productItems.forEach((item) => {
    const title = item.getAttribute('data-tooltip-title');
    
    const priceElement = item.querySelector('span._2XgTiMJi') || 
                         item.querySelector('[data-type="price"] span');
    const price = priceElement ? priceElement.textContent.trim() : '';
    
    if (!price || !title) {
      return;
    }
    
    if (seenTitles.has(title)) {
      return;
    }
    
    seenTitles.add(title);
    
    const imgElement = item.querySelector('img.wxWpAMbp._2s7BZSpH.goods-img-external') || 
                       item.querySelector('img[data-cui-image]') ||
                       item.querySelector('img');
    const originalUrl = imgElement ? imgElement.src : '';
    const imageUrl = convertToHighQualityJpg(originalUrl);
    
    products.push({
      title: title,
      imageUrl: imageUrl,
      price: price
    });
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