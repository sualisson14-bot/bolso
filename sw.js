/* Service worker — cache do app para uso offline.
   Troque CACHE para forçar atualização depois de editar o index.html. */
const CACHE = 'bolso-v1';
const SHELL = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(hit => {
      const rede = fetch(e.request).then(res => {
        if (res && res.status === 200 && (url.origin === location.origin || url.hostname.includes('fonts'))) {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copia));
        }
        return res;
      }).catch(() => hit);
      return hit || rede;
    })
  );
});
