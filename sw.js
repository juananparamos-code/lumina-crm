const CACHE='lumina-v4';
const CORE=['./index.html','./manifest.json','./icon-192.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE).catch(()=>{})));});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([clients.claim(),caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))]))});
self.addEventListener('fetch',e=>{
  if(e.request.url.includes('supabase.co')||e.request.method!=='GET') return;
  e.respondWith(caches.match(e.request).then(c=>{
    if(c) return c;
    return fetch(e.request).then(r=>{if(r&&r.status===200&&r.type==='basic')caches.open(CACHE).then(ca=>ca.put(e.request,r.clone()));return r;}).catch(()=>caches.match('./index.html'));
  }));
});