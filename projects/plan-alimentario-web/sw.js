/* Copia local del contenido estático; no se almacenan datos personales. */
const CACHE='plan-alimentario-static-v1';
const BASE=self.registration.scope;
const FILES=['./','./index.html','./css/styles.css','./js/app.js','./data/plan.json','./manifest.webmanifest','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(path=>new URL(path,BASE).href))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('plan-alimentario-static-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});}
    return response;
  })));
});
