const CACHE_NAME = 'bium-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Gowun+Batang&family=Noto+Sans+KR:wght@400;500&family=Noto+Sans+JP:wght@400;500&family=Noto+Serif+JP:wght@400&display=swap'
];

// Install — cache core assets
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Fetch — cache first, network fallback
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        // Cache font files for offline use
        if (response.ok && (e.request.url.includes('fonts.gstatic.com') || e.request.url.includes('fonts.googleapis.com'))) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      });
    }).catch(function() {
      // Offline fallback
      if (e.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});
