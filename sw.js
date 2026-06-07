// Carta — service worker
// Strategia: network-first per documenti e codice (così gli aggiornamenti
// arrivano subito quando si è online), cache-first per immagini/font/icone.
// Fallback offline alla cache, e a index.html per le navigazioni.
const CACHE = 'carta-v1.3.1';
const ASSETS = [
  './', './index.html',
  './clients.js', './menu-data.js', './menu-sheets.jsx', './menu-form.jsx', './menu-generator.css',
  './icon-192.png', './icon-512.png', './icon-512-maskable.png', './manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// È un documento o del codice (HTML/CSS/JS/JSX)? → vogliamo sempre la versione fresca.
function isFresh(req) {
  if (req.mode === 'navigate') return true;
  if ((req.headers.get('accept') || '').includes('text/html')) return true;
  return /\.(?:html|css|js|jsx)(?:$|\?)/.test(new URL(req.url).pathname);
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  if (isFresh(req)) {
    // network-first
    e.respondWith(
      fetch(req.url, { cache: 'reload' })
        .then(resp => {
          const cp = resp.clone();
          caches.open(CACHE).then(c => c.put(req, cp));
          return resp;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // cache-first per il resto (immagini, font, icone…)
  e.respondWith(
    caches.match(req).then(r => r || fetch(req).then(resp => {
      const cp = resp.clone();
      caches.open(CACHE).then(c => c.put(req, cp));
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});
