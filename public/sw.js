// Service Worker - Cache bypass and auto-cleanup to guarantee always up-to-date site display
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Always fetch fresh network assets, never serve stale cached HTML or scripts
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

