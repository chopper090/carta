# Carta — Generatore di menu

Generatore **offline** di menu stampabili per ristoranti. Multi-cliente: ogni cliente ha la sua
identità (logo, colori, font, preset) e lo stesso motore produce il menu nel suo stile.

- **Cliente via URL:** `?client=demo` (default), `?client=dalentini`, `?client=baretto`.
- **5 varianti grafiche** per foglio A4: Classico · Contemporaneo · Tabula · Editoriale · Diario.
- **Export:** stampa/PDF (`window.print()`), JSON e HTML standalone autonomo.
- **PWA installabile**, funziona offline; persistenza per-cliente in `localStorage`.

## Struttura
- `index.html` — l'app (React via CDN + Babel). È anche la home.
- `clients.js` — registro clienti/temi (`CLIENTS`, `DEFAULT_CLIENT`, `getClient`).
- `menu-data.js` — preset di esempio + standard allergeni.
- `menu-form.jsx` — pannello editor (sinistra).
- `menu-sheets.jsx` — le 5 varianti del foglio A4 (destra).
- `menu-generator.css` — stile editor + fogli + regole `@print`.
- `sw.js`, `manifest.webmanifest`, icone — PWA.
- `baretto/` — asset del cliente *il baretto* (logo, PDF di riferimento).

## Aggiungere un cliente
1. Aggiungere una voce in `CLIENTS` (`clients.js`) con `logo`, `fonts`, `presets`, `defaultPreset`.
2. Aggiungere i preset relativi in `PRESET_MENUS` (`menu-data.js`).
3. (Tema colori) eventuale blocco `[data-client="<id>"]` in `menu-generator.css`.

App single-file vanilla + React-CDN: nessun build, apribile anche con doppio clic.
