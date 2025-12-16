const CACHE_NAME = 'dc-v1';
const urlsToCache = [
  './',
  './Index.html',
  './Assets/CSS/champagne-gold.css',
  './Assets/CSS/dark-mode.css',
  './Core/Index.js',
  './Core/ProjectCuriosityApp.js',
  './Icons/icon-192x192.png',
  './Icons/icon-512x512.png'
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