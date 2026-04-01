const CACHE_NAME = 'ptracker-v1';
const STATIC_ASSETS = [
  '/ptracker/',
  '/ptracker/index.html',
  '/ptracker/manifest.json',
  '/ptracker/icon-192.png',
  '/ptracker/icon-512.png'
];

// Install — cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — bypass GAS & Google APIs, serve others from cache
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Bypass all Google/GAS requests — never cache live data
  if (
    url.includes('script.google.com') ||
    url.includes('googleapis.com') ||
    url.includes('google.com')
  ) {
    return; // Let browser handle normally
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
