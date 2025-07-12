const requests = ["/", "/favicon.png", "/index.css", "/index.js"];
const cacheName = `service-worker-${process.env.TIMESTAMP}`;
const serviceWorker = globalThis as unknown as ServiceWorkerGlobalScope;

serviceWorker.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map(async (key) => {
          if ([cacheName].includes(key)) {
            return;
          }
          await caches.delete(key);
        }),
      );
    })(),
  );
});

serviceWorker.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const cacheResponse = await caches.match(event.request);
      if (cacheResponse) {
        return cacheResponse;
      }

      return fetch(event.request);
    })(),
  );
});

serviceWorker.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      await cache.addAll(requests);
      await serviceWorker.skipWaiting();
    })(),
  );
});
