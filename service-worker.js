const SCOPE_PATH = new URL(self.registration.scope).pathname;
const CACHE_PREFIX = 'webshelf-' + SCOPE_PATH + '-';
const CACHE_NAME = CACHE_PREFIX + 'cb273d3df3ca';
const CORE = [
  "./",
  "./style.css",
  "./data.js",
  "./common.js",
  "./manifest.webmanifest",
  "./index.html",
  "./index.bundle.js",
  "./category.html",
  "./category.bundle.js",
  "./collection.html",
  "./collection.bundle.js",
  "./activity.html",
  "./activity.bundle.js",
  "./support.html",
  "./support.bundle.js",
  "./suggest.html",
  "./suggest.bundle.js",
  "./images/icons/WS-Logo-192.png",
  "./images/icons/WS-Logo-512.png"
];
const corePaths = new Set(CORE.map(value => new URL(value, self.registration.scope).pathname));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME && (key.startsWith(CACHE_PREFIX) || (SCOPE_PATH === '/' && /^webshelf-v\d+$/.test(key)))).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
async function network(request) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try { return await fetch(request, {signal: controller.signal, cache: request.destination === "image" ? "no-cache" : "default"}); }
  finally { clearTimeout(timer); }
}
async function remember(cache, key, response) {
  if (!response.ok || response.type === 'opaque' || response.status === 206 || response.redirected) return;
  try { await cache?.put(key, response.clone()); } catch { /* Quota failure must not discard a valid network response. */ }
}
async function cached(cache, key) {
  try { return await cache?.match(key); } catch { return undefined; }
}
async function serve(request, url) {
  let cache;
  try { cache = await caches.open(CACHE_NAME); } catch { /* Private mode / storage pressure. */ }
  const key = request.mode === 'navigate' ? request : url.origin + url.pathname;
  let response;
  try {
    response = await network(request);
    if (response.status < 500) {
      const storeKey = url.origin + url.pathname;
      await remember(cache, storeKey, response);
      return response;
    }
  } catch { /* Offline or deadline: fall back to the matching resource. */ }
  const hit = await cached(cache, key) || (request.mode === 'navigate' ? await cached(cache, url.origin + url.pathname) : undefined);
  return hit || response || new Response('Offline', {status:503, headers:{'Content-Type':'text/plain; charset=utf-8'}});
}
async function serveImage(request, url, refresh) {
  let cache;
  try { cache = await caches.open(CACHE_NAME); } catch { /* Storage unavailable. */ }
  const key = url.origin + url.pathname;
  const hit = await cached(cache, key);
  // Keep this response stable; refreshed bytes are used on the next request.
  const update = async () => {
    try {
      const response = await network(request);
      await remember(cache, key, response);
      return response;
    } catch { return new Response('Offline', {status:503}); }
  };
  if (hit) {
    refresh(update());
    return hit;
  }
  return update();
}
self.addEventListener('fetch', event => {
  const request=event.request, url=new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || request.headers?.has('range')) return;
  if (!corePaths.has(url.pathname) && !(url.pathname.startsWith(SCOPE_PATH + 'images/') && !url.search)) return;
  if (request.destination === 'image' && url.pathname.startsWith(SCOPE_PATH + 'images/') && !url.search) {
    // Register the lifetime promise synchronously, before the cache lookup yields.
    let background;
    const response = serveImage(request, url, update => { background = update; });
    event.waitUntil(response.then(() => background));
    event.respondWith(response);
  } else event.respondWith(serve(request,url));
});
