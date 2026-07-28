const CACHE = 'lumina-v2';
const CORE = ['./index.html','./manifest.json','./icon.svg','./icon-192.png','./icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).catch(() => {})));
});

self.addEventListener('activate', e => {
  e.waitUntil(Promise.all([
    clients.claim(),
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  ]));
});

self.addEventListener('fetch', e => {
  // Never cache Supabase API calls
  if(e.request.url.includes('supabase.co')) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const net = fetch(e.request).then(resp => {
        if(resp && resp.status === 200 && resp.type === 'basic') {
          caches.open(CACHE).then(c => c.put(e.request, resp.clone()));
        }
        return resp;
      }).catch(() => cached || caches.match('./index.html'));
      return cached || net;
    })
  );
});