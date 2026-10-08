// Service Worker untuk SQL FILLER PWA (cache app shell, network-first untuk CDN)
const CACHE_NAME = 'sql-filler-v1';
const APP_SHELL = [
    './',
    'index.html',
    'icon.svg',
    'css/styles.css',
    'js/core-state.js',
    'js/storage.js',
    'js/utils.js',
    'js/query.js',
    'js/import-sql.js',
    'js/import-xlsx.js',
    'js/import-csv.js',
    'js/sql-editor.js',
    'js/mobile-pwa.js',
    'js/render.js',
    'js/database-admin.js',
    'js/columns.js',
    'js/rows.js',
    'js/bulk-fill.js',
    'js/erd.js',
    'js/sql-preview.js',
    'js/seed.js',
    'js/app-init.js',
    'js/pwa-manifest.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // CDN: network-first, fallback ke cache
    if (url.origin !== self.location.origin) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // App shell: cache-first, fallback ke network
    event.respondWith(
        caches.match(event.request).then(cached => cached || fetch(event.request))
    );
});
