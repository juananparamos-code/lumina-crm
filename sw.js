const CACHE='lumina-v5';
const CORE=['./index.html','./manifest.json','./icon-192.png'];
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE).catch(()=>{})));
});
self.addEventListener('activate',e=>{
  e.waitUntil(Promise.all([
    clients.claim(),
    caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  ]));
});
self.addEventListener('fetch',e=>{
  if(e.request.url.includes('supabase.co')||e.request.method!=='GET') return;
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached) return cached;
      return fetch(e.request).then(r=>{
        if(r&&r.status===200&&r.type==='basic')
          caches.open(CACHE).then(c=>c.put(e.request,r.clone()));
        return r;
      }).catch(()=>caches.match('./index.html'));
    })
  );
});