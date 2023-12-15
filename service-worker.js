const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/senshu_map.css',
  '/script.js',
  '/camera-controls.module.js',
  '/mapData.js',
  '/mapInfoIcon.js',
  '/building.js',
  '/manifest.json',
  '/data/map3DModel/wholeMap.glb',
  '/data/map3DModel/building1/1_B1.glb',
  '/data/map3DModel/building1/1_1.glb',
  '/data/map3DModel/building1/1_2.glb',
  '/data/map3DModel/building1/1_3.glb',
  '/data/map3DModel/building1/1_4.glb',
  '/data/map3DModel/building2/2_B1.glb',
  '/data/map3DModel/building2/2_1.glb',
  '/data/map3DModel/building2/2_2.glb',
  '/data/map3DModel/building3/3_1.glb',
  '/data/map3DModel/building3/3_2.glb',
  '/data/map3DModel/building3/3_3.glb',
  '/data/map3DModel/building3/3_4.glb',
  '/data/map3DModel/building3/3_5.glb',
  '/data/map3DModel/building3/3_6.glb',
  '/data/map3DModel/building3/3_7.glb',
  '/data/map3DModel/building4/4_1.glb',
  '/data/map3DModel/building4/4_2.glb',
  '/data/map3DModel/building4/4_3.glb',
  '/data/map3DModel/building4/4_4.glb',
  '/data/map3DModel/building4/4_5.glb',
  '/data/map3DModel/building5/5_1.glb',
  '/data/map3DModel/building5/5_2.glb',
  '/data/map3DModel/building5/5_3.glb',
  '/data/map3DModel/building7/7_B1.glb',
  '/data/map3DModel/building7/7_1.glb',
  '/data/map3DModel/building7/7_2.glb',
  '/data/map3DModel/building7/7_3.glb',
  '/data/map3DModel/building8/8_1.glb',
  '/data/map3DModel/building8/8_2.glb',
  '/data/map3DModel/building8/8_3.glb',
  '/data/map3DModel/building8/8_4.glb',
  '/data/map3DModel/building8/8_5.glb',
  '/data/map3DModel/building9/9_1.glb',
  '/data/map3DModel/building9/9_2.glb',
  '/data/map3DModel/building9/9_3.glb',
  '/data/map3DModel/building9/9_M3.glb',
  '/data/map3DModel/building9/9_4.glb',
  '/data/map3DModel/building9/9_5.glb',
  '/data/map3DModel/building9/9_6.glb',
  '/data/map3DModel/building9/9_7.glb',
  '/data/map3DModel/building9/9_8.glb',
  '/data/map3DModel/building10/10_1.glb',
  '/data/map3DModel/building10/10_2.glb',
  '/data/map3DModel/building10/10_3.glb',
  '/data/map3DModel/building10/10_4.glb',
  '/data/map3DModel/building10/10_5.glb',
  '/data/map3DModel/building10/10_6.glb',
  '/data/map3DModel/Greentop/G_B1.glb',
  '/data/map3DModel/Greentop/G_1.glb',
  '/data/map3DModel/gym/S_1.glb',
  '/data/map3DModel/gym/S_2.glb',
  '/data/map3DModel/gym/S_3.glb',
  '/data/map3DModel/gym/S_B1.glb',
  '/data/map3DModel/Library/L_1.glb',
  '/data/map3DModel/Library/L_2.glb',
  '/data/map3DModel/Library/L_3.glb',
  '/data/map3DModel/Library/L_4.glb',
  '/data/map3DModel/Library/L_5.glb',
  '/data/logo/logo_36.png',
  '/data/logo/logo_48.png',
  '/data/logo/logo_96.png',
  '/data/logo/logo_144.png',
  '/data/logo/logo_152.png',
  '/data/logo/logo_167.png',
  '/data/logo/logo_180.png',
  '/data/logo/logo_192.png',
  '/data/logo/logo_512.png',
  '/data/logo/logo.png',
  '/data/icon/Smoking_area.png',
  '/data/icon/back.png',
  '/data/icon/barrierfreetoilet.png',
  '/data/icon/bicycleparkinglot.png',
  '/data/icon/container.png',
  '/data/icon/diningroom.png',
  '/data/icon/downEscalator.png',
  '/data/icon/elevator.png',
  '/data/icon/escalator.png',
  '/data/icon/filter.png',
  '/data/icon/icc.png',
  '/data/icon/ice.png',
  '/data/icon/library.png',
  '/data/icon/menRestroom.png',
  '/data/icon/mos.png',
  '/data/icon/office.png',
  '/data/icon/parkingLot.png',
  '/data/icon/pin.png',
  '/data/icon/printer.png',
  '/data/icon/restarea.png',
  '/data/icon/restaurant.png',
  '/data/icon/rotation.png',
  '/data/icon/routeguidance.png',
  '/data/icon/search.png',
  '/data/icon/sharedtoilet.png',
  '/data/icon/stairs.png',
  '/data/icon/stairsIcon.png',
  '/data/icon/upEscalator.png',
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
