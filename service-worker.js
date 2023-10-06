const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/senshu_map.css',
  '/script.js',
  '/data/map3DModel/allmap3.glb',
  '/data/map3DModel/building10/10_1.glb',
  '/data/map3DModel/building10/10_2.glb',
  '/data/map3DModel/building10/10_3.glb',
  '/data/map3DModel/building10/10_4.glb',
  '/data/map3DModel/building10/10_5.glb',
  '/data/map3DModel/building10/10_6.glb',
  '/data/icon/rotation.png',
  '/data/icon/stairsIcon.png',
  '/images/el.png',
  '/rest.png',
  '/toi.png'
  // 他にキャッシュしたいアセットのパスを追加
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});