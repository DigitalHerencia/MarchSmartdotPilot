/*
  Basic PWA Service Worker for Marching Band Practice Studio
  - Precache core assets at install
  - Runtime caching strategies:
    • Pages: network-first with offline fallback
    • Static assets (css, js): stale-while-revalidate
    • Images/SVG: cache-first with max entries
*/
const VERSION = 'v1.0.0';
const STATIC_CACHE = `static-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;
const IMG_CACHE = `images-${VERSION}`;
const OFFLINE_URL = '/offline.html';

const CORE_ASSETS = [
  '/',
  OFFLINE_URL,
  '/favicon.ico',
  '/vercel.svg',
  '/next.svg',
  '/globe.svg',
  '/window.svg',
  '/file.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll(CORE_ASSETS);
    // Activate worker immediately
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Clean up old caches
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE, IMG_CACHE].includes(key))
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

function isHtmlRequest(request) {
  const accept = request.headers.get('Accept') || '';
  return accept.includes('text/html');
}

function isAssetRequest(url) {
  return /(\.css|\.js|\.woff2?|\.ttf|\.map)$/.test(url.pathname);
}

function isImageRequest(url) {
  return /(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.svg|\/image\?)/.test(url.pathname + url.search);
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle same-origin
  if (url.origin !== location.origin) return;

  if (isHtmlRequest(request)) {
    // Network-first with offline fallback
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, response.clone());
        return response;
        } catch {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await caches.match(request);
        return cached || (await cache.match(OFFLINE_URL));
      }
    })());
    return;
  }

  if (isAssetRequest(url)) {
    // Stale-while-revalidate for static assets
    event.respondWith((async () => {
      const cache = await caches.open(STATIC_CACHE);
      const cached = await cache.match(request);
      const fetchPromise = fetch(request)
        .then((networkResp) => {
          cache.put(request, networkResp.clone());
          return networkResp;
        })
        .catch(() => undefined);
      return cached || fetchPromise || fetch(request);
    })());
    return;
  }

  if (isImageRequest(url)) {
    // Cache-first for images
    event.respondWith((async () => {
      const cache = await caches.open(IMG_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
        try {
          const resp = await fetch(request);
          cache.put(request, resp.clone());
          return resp;
        } catch {
          return caches.match('/vercel.svg');
        }
    })());
    return;
  }
});

// Optional: listen for skipWaiting from page
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
