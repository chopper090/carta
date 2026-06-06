# CLAUDE.md — Carta

**Scopo.** Generatore di menu per ristoranti, **white-label multi-cliente**. Nato come parte
dell'app "Lentini" (sistema interno DaLentini) e separato come prodotto a sé: DaLentini è ora
**solo uno dei clienti** del generatore (vedi repo `dalentini` per il brand/sito).

**Stack.** HTML single-file + **React 18 via CDN (unpkg) + Babel `text/babel`** (componenti
stateful interdipendenti: Form + 5 "sheet"). Zero build. PWA (sw + manifest + `.nojekyll`).

**Mappa file.**
- `index.html` — entry point = l'app (carica React/Babel + i sorgenti). Testa con anti-FOUC + SW.
- `clients.js` — `CLIENTS` (demo, dalentini, baretto), `CLIENT_ORDER`, `DEFAULT_CLIENT="demo"`,
  `getClient`, `applyClientFonts`, `bookingLine`. Il logo baretto è un data-URL (`BARETTO_LOGO`).
- `menu-data.js` — `ALLERGENI`, i preset (`MENU_DEMO`, `MENU_RADICI/SAKURA/TERRAEMARE` = DaLentini,
  `BARETTO_*`), `PRESET_MENUS`, `EMPTY_MENU`, `normalizeMenu`.
- `menu-form.jsx` — pannello editor. `menu-sheets.jsx` — le 5 varianti A4 (leggono `client`).
- `menu-generator.css` — editor antracite + fogli; temi-cliente via `[data-client]`.

**Dove stanno i dati.** `localStorage`, **per-cliente**: `menu.<id>`, `variant.<id>`,
`active.client`, `ui.theme`. Migrazione legacy dalla vecchia chiave `dalentini.menu`.

**Come si edita.** Cliente nuovo → voce in `CLIENTS` + preset in `PRESET_MENUS` (+ eventuale
blocco `[data-client]` nel CSS). Il motore (`menu-sheets/form`) non va toccato: legge tutto da
`client`/`getClient`.

**Gotcha.** Niente branding hardcoded nel motore: i fallback puntano al cliente `demo`. Export
HTML standalone ricostruisce la pagina con `clients.js` + `menu-sheets.jsx` inline.

**Deploy.** GitHub Pages (`chopper090.github.io/carta/`). Versionare con
`_scripts\Publish-Project.ps1` (bump + sync manifest/sw + commit + push).
