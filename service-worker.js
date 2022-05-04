
const PRECACHE = 'precache-v23';
const RUNTIME = 'runtime';

// list of files to cache
const PRECACHE_URLS = [
    'index.html',
    './',
    'styles.css',
    'sketch.js',
    'chartjs/Chart.min.js',
    'nayuki-obj/fft.min.js',
    'chartjs/hammer.min.js',
    'chartjs/chartjs-plugin-zoom.min.js',
    'manifest.webmanifest',
    'images/icon/icon96.png',
    'images/icon/icon192.png',
    'images/icon/icon144.png',
    'images/icon/maskable_icon.png',
    'images/search.svg',
    'images/Log.svg',
    'images/Log_gray.svg',
    'images/Log_active.svg',
    'images/HPV.svg',
    'images/HPV_gray.svg',
    'images/range.svg',
    'images/range_gray.svg',
    'images/axis.svg',
    'images/axis_gray.svg',
    'images/axisLimit.svg',
    'images/Temp.svg',
    'images/Temp_gray.svg',
    'images/upload.svg',
    'images/upload_gray.svg',
    'images/dfu.svg',
    'images/dfu_gray.svg',
    'images/logoSB_dis.svg',
    'images/logoSB.svg',
    'images/menu.svg',
    'images/BLE_disconnect.svg',
    'images/exit.svg'
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(PRECACHE)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(self.skipWaiting())
    );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
        }).then(cachesToDelete => {
            return Promise.all(cachesToDelete.map(cacheToDelete => {
                return caches.delete(cacheToDelete);
            }));
        }).then(() => self.clients.claim())
    );
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', event => {
    // Skip cross-origin requests, like those for Google Analytics.
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return caches.open(RUNTIME).then(cache => {
                    return fetch(event.request).then(response => {
                        // Put a copy of the response in the runtime cache.
                        return cache.put(event.request, response.clone()).then(() => {
                            return response;
                        });
                    });
                });
            })
        );
    }
});