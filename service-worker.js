const CACHE_NAME = "webshelf-v6";
const CORE = [
  "./",
  "./index.html",
  "./category.html",
  "./collection.html",
  "./activity.html",
  "./support.html",
  "./suggest.html",
  "./style.css",
  "./icons.js",
  "./data.js",
  "./hidden.js",
  "./dialogs.js",
  "./favorites.js",
  "./recently-viewed.js",
  "./script.js",
  "./category.js",
  "./collection.js",
  "./activity.js",
  "./preview.js",
  "./badge-filters.js",
  "./search.js",
  "./navigation.js",
  "./shortcuts.js",
  "./theme.js",
  "./pwa.js",
  "./manifest.webmanifest",
  "./images/icons/WS-Logo-192.png",
  "./images/icons/WS-Logo-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

async function networkFirst(request, fallbackUrl = null) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackUrl) {
      const fallback = await cache.match(fallbackUrl);
      if (fallback) return fallback;
    }
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, "./index.html"));
    return;
  }

  if (
    request.destination === "script" ||
    request.destination === "style" ||
    url.pathname.endsWith("/data.js") ||
    url.pathname.endsWith("/manifest.webmanifest")
  ) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (request.destination === "image" || request.destination === "font") {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});
