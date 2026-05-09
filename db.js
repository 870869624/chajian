const ExportDB = {
  DB_NAME: 'BeidouExportDB',
  DB_VERSION: 1,
  STORE_NAME: 'exportRecords',
  db: null,

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => reject(request.error);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id', autoIncrement: true });
          store.createIndex('productId', 'productId', { unique: false });
          store.createIndex('exportTime', 'exportTime', { unique: false });
          store.createIndex('exportSource', 'exportSource', { unique: false });
        }
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };
    });
  },

  async getDB() {
    if (!this.db) {
      await this.init();
    }
    return this.db;
  },

  async addRecord(record) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.add({
        ...record,
        exportTime: new Date().toISOString()
      });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async addRecords(records) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const results = [];
      let completed = 0;
      
      records.forEach(record => {
        const request = store.add({
          ...record,
          exportTime: record.exportTime || new Date().toISOString()
        });
        request.onsuccess = () => {
          results.push(request.result);
          completed++;
          if (completed === records.length) resolve(results);
        };
        request.onerror = () => {
          completed++;
          if (completed === records.length) resolve(results);
        };
      });
      
      if (records.length === 0) resolve([]);
    });
  },

  async getRecordByProductId(productId) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('productId');
      const request = index.getAll(productId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getAllRecords() {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getRecordsBySource(source) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('exportSource');
      const request = index.getAll(source);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getRecordsByDateRange(startDate, endDate) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('exportTime');
      const range = IDBKeyRange.bound(startDate.toISOString(), endDate.toISOString());
      const request = index.getAll(range);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async deleteRecord(id) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async deleteRecordsByProductId(productId) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('productId');
      const request = index.openCursor(productId);
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  },

  async clearAllRecords() {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getRecordCount() {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getUniqueProductCount() {
    const records = await this.getAllRecords();
    const uniqueIds = new Set(records.map(r => r.productId));
    return uniqueIds.size;
  },

  async exportRecordsToFile() {
    const records = await this.getAllRecords();
    const exportData = {
      version: '1.0',
      exportTime: new Date().toISOString(),
      appName: '北斗店铺助手',
      recordCount: records.length,
      records: records.map(r => ({
        productId: r.productId,
        title: r.title,
        price: r.price,
        imageUrl: r.imageUrl,
        exportTime: r.exportTime,
        exportSource: r.exportSource
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    return blob;
  },

  async importRecordsFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          if (!data.version || !data.records || !Array.isArray(data.records)) {
            reject(new Error('无效的记录文件格式'));
            return;
          }
          
          if (data.appName !== '北斗店铺助手') {
            reject(new Error('这不是北斗店铺助手的记录文件'));
            return;
          }
          
          const existingRecords = await this.getAllRecords();
          const existingProductIds = new Set(existingRecords.map(r => r.productId));
          
          const newRecords = data.records.filter(r => !existingProductIds.has(r.productId));
          
          if (newRecords.length > 0) {
            await this.addRecords(newRecords);
          }
          
          resolve({
            total: data.records.length,
            imported: newRecords.length,
            duplicate: data.records.length - newRecords.length
          });
        } catch (err) {
          reject(new Error('文件解析失败: ' + err.message));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
  },

  async checkProductExported(productId) {
    const records = await this.getRecordByProductId(productId);
    return records.length > 0;
  },

  async checkProductsExported(productIds) {
    const results = {};
    for (const id of productIds) {
      results[id] = await this.checkProductExported(id);
    }
    return results;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExportDB;
}
