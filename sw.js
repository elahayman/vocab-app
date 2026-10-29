// Offline support: cache the app shell, serve it cache-first, refresh in the background.
const CACHE = 'vocab-city-v12';
const SHELL = ['./', 'index.html', 'styles.css', 'app.js', 'store.js', 'firebase-config.js', 'words.js', 'art.js', 'manifest.webmanifest', 'icon.svg', 'icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => {
      const net = fetch(e.request).then((res) => {
        if (res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});

// Daily reminder, sent by .github/reminders/send.mjs through Firebase Cloud Messaging as a data message.
self.addEventListener('push', (e) => {
  let p = {};
  try { p = e.data ? e.data.json() : {}; } catch (err) { /* not JSON */ }
  const d = Object.assign({}, p.notification, p.data);
  e.waitUntil(self.registration.showNotification(d.title || 'עיר המילים', {
    body: d.body || 'המשימה של היום מחכה לך',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    lang: 'he',
    dir: 'rtl',
    tag: 'daily-reminder', // a newer reminder replaces an older one
    data: { url: d.url || './index.html' },
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    const open = list.find((c) => c.url.startsWith(self.registration.scope) && !c.url.includes('/little/'));
    return open ? open.focus() : clients.openWindow(e.notification.data.url);
  }));
});
