const CACHE_NAME = 'dc-v1';
const urlsToCache = [
  '/Digital-Curiosiry/',
  '/Digital-Curiosiry/Index.html',
  '/Digital-Curiosiry/Assets/CSS/champagne-gold.css',
  '/Digital-Curiosiry/Assets/CSS/dark-mode.css',
  '/Digital-Curiosiry/Core/Index.js',
  '/Digital-Curiosiry/Core/ProjectCuriosityApp.js',
  '/Digital-Curiosiry/Icons/icon-192x192.png',
  '/Digital-Curiosiry/Icons/icon-512x512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});