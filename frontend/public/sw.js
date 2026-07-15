const CACHE_NAME = 'telecloud-shell-v1';
const SHELL_FILES = ['/', '/app', '/manifest.json', '/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for API calls, cache-first for the app shell.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.url.includes('/api/')) return; // never cache API responses

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
