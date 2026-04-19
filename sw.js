const CACHE = 'cpc-reports-v3';

// Use relative paths — works regardless of GitHub Pages subfolder
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => {
        // Add one by one so a single failure doesn't break everything
        return Promise.allSettled(ASSETS.map(a => c.add(a)));
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Always go network-first for Supabase and CDN calls
  if (e.request.url.includes('supabase.co') ||
      e.request.url.includes('cdn.jsdelivr.net')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  // Cache-first for local app files
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request))
  );
});
