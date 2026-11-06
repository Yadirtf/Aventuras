/* Service worker de El camino de las aventuras: guarda todo para usarlo sin internet.
 * El build completa la versión y la lista de archivos (ver el plugin en vite.config.ts). */
const VERSION = '__VERSION__';
/* global __ARCHIVOS__ */
const ARCHIVOS = __ARCHIVOS__;
const CACHE = `aventuras-${VERSION}`;

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ARCHIVOS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nombres) =>
        Promise.all(
          nombres
            .filter((n) => n.startsWith('aventuras-') && n !== CACHE)
            .map((n) => caches.delete(n)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (evento) => {
  const { request } = evento;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Páginas: primero la red (para tener lo último) y, sin conexión, la app guardada.
  if (request.mode === 'navigate') {
    evento.respondWith(
      fetch(request).catch(() => caches.match('/index.html').then((r) => r ?? Response.error())),
    );
    return;
  }

  // Imágenes, estilos y código: primero lo guardado, que es instantáneo.
  evento.respondWith(
    // ignoreVary: el servidor puede variar por «Origin» y los módulos se piden con CORS.
    caches.match(request, { ignoreVary: true }).then(
      (guardado) =>
        guardado ??
        fetch(request).then((respuesta) => {
          if (respuesta.ok) {
            const copia = respuesta.clone();
            void caches.open(CACHE).then((cache) => cache.put(request, copia));
          }
          return respuesta;
        }),
    ),
  );
});
