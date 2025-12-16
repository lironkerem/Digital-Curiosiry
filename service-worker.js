const CACHE_NAME = 'dc-v1';
const urlsToCache = [
  '/Digital-Curiosity/',
  '/Digital-Curiosity/Index.html',
  '/Digital-Curiosity/Assets/CSS/champagne-gold.css',
  '/Digital-Curiosity/Assets/CSS/dark-mode.css',
  '/Digital-Curiosity/Core/Index.js',
  '/Digital-Curiosity/Core/ProjectCuriosityApp.js',
  '/Digital-Curiosity/Icons/icon-192x192.png',
  '/Digital-Curiosity/Icons/icon-512x512.png'
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