const DB_NAME = 'RitamPOS';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingOps')) {
        db.createObjectStore('pendingOps', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('offlineOrders')) {
        db.createObjectStore('offlineOrders', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('offlineTables')) {
        db.createObjectStore('offlineTables', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('offlineProducts')) {
        db.createObjectStore('offlineProducts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('syncLog')) {
        db.createObjectStore('syncLog', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const SyncManager = {
  /**
   * Queue an API operation to be replayed when back online.
   * Stores the request URL, method, body, and headers in IndexedDB.
   * Also registers a background sync event for service worker processing.
   */
  async queueOperation(url, method, body = null, headers = {}) {
    const db = await openDB();
    const tx = db.transaction('pendingOps', 'readwrite');
    await tx.store.add({
      url,
      method,
      body,
      headers,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    });
    // Register background sync so the SW processes it when online
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-orders');
    }
  },

  /**
   * Cache data locally (e.g., menu items, tables) for offline use.
   * Accepts a single item or an array of items.
   */
  async cacheData(storeName, data) {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const items = Array.isArray(data) ? data : [data];
    for (const item of items) {
      await tx.store.put(item);
    }
  },

  /**
   * Retrieve cached data from a specific object store.
   * If `id` is provided, returns a single record; otherwise returns all records.
   */
  async getCachedData(storeName, id = null) {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readonly');
    if (id) return tx.store.get(id);
    return tx.store.getAll();
  },

  /**
   * Get the count of pending (unsynced) operations.
   */
  async getPendingCount() {
    const db = await openDB();
    const tx = db.transaction('pendingOps', 'readonly');
    const all = await tx.store.getAll();
    return all.length;
  },

  /**
   * Force-sync all pending operations immediately.
   * Returns a summary of synced, failed, and total operations.
   */
  async forceSync() {
    const db = await openDB();
    const tx = db.transaction('pendingOps', 'readonly');
    const pendingOps = await tx.store.getAll();
    let synced = 0;
    let failed = 0;

    for (const op of pendingOps) {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(op.url, {
          method: op.method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
            ...op.headers,
          },
          body: op.body ? JSON.stringify(op.body) : undefined,
        });

        if (response.ok) {
          const deleteTx = db.transaction('pendingOps', 'readwrite');
          await deleteTx.store.delete(op.id);
          synced++;
        } else {
          // Increment retry count on failure
          const updateTx = db.transaction('pendingOps', 'readwrite');
          const record = await updateTx.store.get(op.id);
          if (record) {
            record.retryCount += 1;
            await updateTx.store.put(record);
          }
          failed++;
        }
      } catch (error) {
        const updateTx = db.transaction('pendingOps', 'readwrite');
        const record = await updateTx.store.get(op.id);
        if (record) {
          record.retryCount += 1;
          await updateTx.store.put(record);
        }
        failed++;
      }
    }

    return { synced, failed, total: pendingOps.length };
  },

  /**
   * Check if the browser currently has network connectivity.
   */
  isOnline() {
    return navigator.onLine;
  },

  /**
   * Listen for connectivity changes (online/offline).
   * Calls the provided callback with `true` when online or `false` when offline.
   */
  onConnectionChange(callback) {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
  },
};
