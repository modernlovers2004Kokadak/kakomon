const CACHE_NAME = 'riyoshi-past-exam-pwa';
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./app.js",
  "./apple-touch-icon.png",
  "./data53.js",
  "./dataPast.js",
  "./dataPast24.js",
  "./dataPast30.js",
  "./dataPast40.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./images/29/q45.webp",
  "./images/32/q31.webp",
  "./images/34/q31.webp",
  "./images/34/q41.webp",
  "./images/34/q45.webp",
  "./images/34/q48.webp",
  "./images/35/q45.webp",
  "./images/37/q31.webp",
  "./images/38/q41.webp",
  "./images/39/q43.webp",
  "./images/41o/q43.webp",
  "./images/43n/q44.webp",
  "./images/43o/q44.webp",
  "./images/47/q44.webp",
  "./images/50/q53.webp",
  "./images/51/q42.webp",
  "./images/52/q44.webp",
  "./images/52/q46.webp",
  "./images/53-q42.png",
  "./images/53-q46.png",
  "./manifest.webmanifest",
  "./style.css",
  "./textOverlay.js"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.delete(CACHE_NAME)
      .then(() => caches.open(CACHE_NAME))
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isAppShell = event.request.mode === 'navigate' ||
    url.pathname.endsWith('/index.html') ||
    url.pathname.endsWith('/app.js') ||
    url.pathname.endsWith('/service-worker.js');

  if (isAppShell) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          if (response && response.status === 200 && response.type !== 'opaque') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
