// Service Worker de l'application Aiprods v2.6
// Version ultra-légère et rapide pour une fluidité native complète

const CACHE_NAME = 'aiprods-cache-v2.6';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Cache with network fallback strategy
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes d'API d'authentification ou externes pour éviter les blocages de données dynamiques
  if (event.request.url.includes('/api/') || event.request.url.includes('supabase')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Faire un fetch en arrière plan pour rafraîchir le cache (Stale While Revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
