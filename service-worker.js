const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/senshu_map.css',
  '/script.js',
  '/camera-controls.module.js',
  '/mapData.js',
  '/mapInfoIcon.js',
  '/data/map3DModel/wholeMap.glb',
  '/data/map3DModel/building10/10_1.glb',
  '/data/map3DModel/building10/10_2.glb',
  '/data/map3DModel/building10/10_3.glb',
  '/data/map3DModel/building10/10_4.glb',
  '/data/map3DModel/building10/10_5.glb',
  '/data/map3DModel/building10/10_6.glb',
  '/data/icon/back.png',
  '/data/icon/rotation.png',
  '/data/icon/rotation2.png',
  '/data/icon/stairsIcon.png',
  '/data/icon/barrierfreetoilet.png',
  '/data/icon/bicycleparkinglot.png',
  '/data/icon/diningroom.png',
  '/data/icon/downEscalator.png',
  '/data/icon/elevator.png',
  '/data/icon/icc.png',
  '/data/icon/ice.png',
  '/data/icon/menRestroom.png',
  '/data/icon/mos.png',
  '/data/icon/parkingLot.png',
  '/data/icon/pin.png',
  '/data/icon/printer.png',
  '/data/icon/restarea.png',
  '/data/icon/resutaurant.png',
  '/data/icon/routeguidance.png',
  '/data/icon/search.png',
  '/data/icon/sharedtoilet.png',
  '/data/icon/upEscalator.png',
  '/data/icon/stairs.png',
  '/data/icon/vendingmachine.png',
  '/data/icon/womenRestroom.png',
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
