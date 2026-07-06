const CACHE_NAME = 'ritam-pos-v1';
const STATIC_ASSETS = ['/', '/index.html'];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

// Fetch: network first for API, cache first for static assets
self.addEventListener('fetch', (event) => {
  // API calls: network first with cache fallback
  if (event.request.url.includes('/api/v1/')) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request)),
    );
    return;
  }

  // Static assets: cache first
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request)),
  );
});

// Background Sync: triggered when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncPendingOrders());
  }
});

async function syncPendingOrders() {
  const db = await openDB();
  const tx = db.transaction('pendingOps', 'readonly');
  const pendingOps = await tx.store.getAll();

  for (const op of pendingOps) {
    try {
      const response = await fetch(op.url, {
        method: op.method,
        headers: { 'Content-Type': 'application/json', ...op.headers },
        body: JSON.stringify(op.body),
      });
      if (response.ok) {
        const deleteTx = db.transaction('pendingOps', 'readwrite');
        await deleteTx.store.delete(op.id);
        // Notify all clients
        const clients = await self.clients.matchAll();
        clients.forEach((client) =>
          client.postMessage({
            type: 'SYNC_COMPLETE',
            payload: { id: op.id, success: true },
          }),
        );
      }
    } catch (error) {
      console.error('Sync failed for op', op.id, error);
      // Notify clients about failure
      const clients = await self.clients.matchAll();
      clients.forEach((client) =>
        client.postMessage({
          type: 'SYNC_FAILED',
          payload: { id: op.id, error: error.message },
        }),
      );
    }
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RitamPOS', 1);
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
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
