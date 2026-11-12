const V = 'kalaimani-kitchen-v15';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const r = e.request;
  const u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/.netlify/')) return;
  if (r.mode === 'navigate') {
    // Newest page when online, saved copy when offline.
    e.respondWith(
      fetch(r)
        .then((res) => { const cp = res.clone(); caches.open(V).then((c) => c.put('index.html', cp)); return res; })
        .catch(() => caches.match('index.html'))
    );
    return;
  }
  // Images and other files: instant from cache, refreshed quietly in the background.
  e.respondWith(
    caches.match(r).then((hit) => {
      const net = fetch(r)
        .then((res) => { if (res.ok) { const cp = res.clone(); caches.open(V).then((c) => c.put(r, cp)); } return res; })
        .catch(() => hit);
      return hit || net;
    })
  );
});
