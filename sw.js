// Service Worker for offline PWA support
const CACHE_NAME = 'json-viewer-v8';
const ASSETS = [
  '/',
  '/index.html',
  '/json-prettier/',
  '/json-prettier/index.html',
  '/privacy-policy/',
  '/privacy-policy/index.html',
  '/terms/',
  '/terms/index.html',
  '/json-validator/',
  '/json-diff/',
  '/json-to-csv/',
  '/json-to-yaml/',
  '/json-minify/',
  '/blog/common-json-errors/',
  '/json-web-token/',
  '/changelog/',
  '/css/styles.css',
  '/js/app.js',
  '/js/i18n.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Only cache GET requests for our own assets
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Don't cache external requests (like URL-loaded JSON)
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      // Network first, fall back to cache
      return fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => cached);
    })
  );
});
