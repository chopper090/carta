# CLAUDE.md — Carta

**Scopo.** Generatore di menu per ristoranti, **white-label multi-cliente**. Nato come parte
dell'app "Lentini" (sistema interno DaLentini) e separato come prodotto a sé: DaLentini è ora
**solo uno dei clienti** del generatore (vedi repo `dalentini` per il brand/sito).

**Stack.** HTML single-file + **React 18 via CDN (unpkg) + Babel `text/babel`** (componenti
stateful interdipendenti: Form + 5 "sheet"). Zero build. PWA (sw + manifest + `.nojekyll`).

**Mappa file.**
- `index.html` — entry point = l'app (carica React/Babel + i sorgenti). Testa con anti-FOUC + SW.
- `sync.js` — memoria condivisa fra dispositivi via Gist. `cambusa-bridge.js` — ponte verso Cambusa.
- `tools/cambusa-import-carta.js` — modulo **per Cambusa** (non per Carta): legge il ponte.
- `clients.js` — `CLIENTS` (demo, dalentini, baretto), `CLIENT_ORDER`, `DEFAULT_CLIENT="demo"`,
  `getClient`, `applyClientFonts`, `bookingLine`. Il logo baretto è un data-URL (`BARETTO_LOGO`).
- `menu-data.js` — `ALLERGENI`, i preset (`MENU_DEMO`, `MENU_RADICI/SAKURA/TERRAEMARE` = DaLentini,
  `BARETTO_*`), `PRESET_MENUS`, `EMPTY_MENU`, `normalizeMenu`.
- `menu-form.jsx` — pannello editor. `menu-sheets.jsx` — le 5 varianti A4 (leggono `client`).
- `menu-generator.css` — editor antracite + fogli; temi-cliente via `[data-client]`.

**Dove stanno i dati.** `localStorage`, **per-cliente**: `menu.<id>`, `variant.<id>`,
`active.client`, `ui.theme`. Migrazione legacy dalla vecchia chiave `dalentini.menu`.

**Memoria condivisa (`sync.js`).** Le stesse chiavi vivono anche in un **Gist segreto**
(file `carta-backup.json`, cercato per nome: nessun id da copiare). Vince l'ultima modifica:
pull all'apertura, push con 4 s di quiete dopo ogni modifica, o a mano dal pannello dell'editor.
Token GitHub **classic** con solo `gist`, in `carta.sync.token` — mai dentro il backup. È lo
stesso di Cambusa: se manca si legge `rm:v1:sync:token`, e salvandolo qui si scrive anche là.
Ogni scrittura passa da `saveKey()` (index.html) → `CartaSync.bump(key, value)`; un pull emette
`onApplied` e l'app rilegge sé stessa **senza ricaricare**.
⚠️ Su Pages Carta e Cambusa condividono l'origin: `OWN` (in `sync.js`) elenca le chiavi di Carta
una per una e niente fuori da lì viene mai letto o cancellato. E una modifica conta solo dopo
un gesto vero dell'utente (`touched`), altrimenti il solo avvio farebbe vincere ogni dispositivo.

**Ponte verso Cambusa (`cambusa-bridge.js`).** `desc` viene sciolta nei singoli ingredienti
(virgole di primo livello: quelle dentro le parentesi restano intatte) e gli allergeni 1-14
diventano nomi — stesso ordine di legge nelle due app, corrispondenza posizionale. Il file
`carta-to-cambusa.json` (un blocco per cliente) viene scaricato dal pannello **e** pubblicato
nel Gist a ogni push. Allergeni del piatto = quelli spuntati in Carta e fanno fede; quelli per
ingrediente sono dedotti dal nome con un dizionario, quindi indicativi.

**Impaginazione.** `menu.grid[variante] = { cols, perPage, sectionBreak, free }`
(`perPage:0` = auto; `sectionBreak` = ogni sezione parte da una pagina nuova).
In Auto l'impaginazione è **a misurazione reale** (`useFittedPages`): misura
l'altezza vera delle voci (`data-di` / `data-fithead`, contenitore `data-fitbox`)
e calcola i salti pagina in un colpo solo — riempimento ~95%, nessun limite di
pagine. `WEIGHTS`/`paginateDishes` restano solo come stima iniziale. Le colonne
valgono sugli stili a lista (classico/contemporaneo/tabula/listino).

**Corpo del testo.** `menu.grid[variante].fontScale` (0.6–2). Tutti i corpi del
foglio sono `calc(Npt * var(--fs, 1))`; `--fs` è impostata inline sul `.sheet`.
Entra in `fitSig` → cambiando la scala le pagine si ricalcolano da sole.

**Lettura da smartphone.** L'export HTML porta un blocco `@media (max-width:820px)`:
A4 fluido, colonna singola, `--fs:1.45`, posizioni della modalità libera
neutralizzate. Su desktop resta l'A4 identico.

**Modalità libera ("Canva").** `menu.layout[variante][id] = {x,y,s,h}` — sposta,
ingrandisce e nasconde qualunque blocco (`FREE_BLOCKS`, `tagFreeBlocks`,
`applyFreeLayout`, `installFreeDrag`). Stili inline → valgono anche in
stampa/PDF/export. Si attiva col tasto ✥ nella barra dell'anteprima.

**Macroaree.** Livello sopra le sezioni: `dish.area`. Ogni macroarea apre con un
separatore arancione a tutta pagina (`AreaBand`) col suo nome e ha impaginazione
indipendente in `menu.areaMeta[nome] = { cols, perPage }` (`areaSettings` fa il
merge con le impostazioni della variante). Il motore impagina "per indice":
`paginateDishes(dishes, colsAt, perPageAt, weight, breakAt)` e
`useFittedPages(base, dishes, breakAt, enabled, sig, colsAt)`. La banda è un
blocco `FREE_BLOCKS` → si sposta e ridimensiona in modalità libera. Con
`areaMeta[nome].samePage` la macroarea resta sul foglio della precedente: la
banda diventa `.area-band-inline` (`column-span: all`) e taglia le colonne.

**Editor.** Vista compatta (`DishRow`, una riga per voce) con apertura a
fisarmonica, ricerca, indice della struttura, sezioni/macroaree richiudibili,
selezione multipla e trascinamento a eventi puntatore (mouse + tocco).
Cambiare sezione a una voce la **sposta davvero** (`moveDishToSection`), non
la rietichetta sul posto. `moveDishEdge` = in cima/in fondo alla sezione.

**Asterischi e note.** `dish.mark` (0/1/2) stampa `*` / `**` accanto al nome;
`menu.markNotes = { one, two }` sono le diciture, in fondo al menù solo se usate
(`MarksLegend`). `areaMeta[nome].note` = riga esplicativa sotto la banda della
macroarea (il "disclaimer" delle due offerte).

**Sezioni.** `menu.sectionMeta[nome] = { divider, takeaway }` — separatore arancione
prima della sezione e marchio "asporto". Sul piatto: `takeaway: true` mostra
l'etichetta arancione. Dal form si rinomina la sezione (propaga a tutte le sue
voci), si sposta in blocco, si aggiunge una voce dentro la sezione, si duplica
una voce e si sposta tra sezioni con la tendina.

**Export HTML.** È davvero standalone: CSS incorporato + pagine già renderizzate
(nessun React/Babel, nessun file affiancato).

**Come si edita.** Cliente nuovo → voce in `CLIENTS` + preset in `PRESET_MENUS` (+ eventuale
blocco `[data-client]` nel CSS). Il motore (`menu-sheets/form`) non va toccato: legge tutto da
`client`/`getClient`.

**Gotcha.** Niente branding hardcoded nel motore: i fallback puntano al cliente `demo`. Export
HTML standalone ricostruisce la pagina con `clients.js` + `menu-sheets.jsx` inline.

**Deploy.** GitHub Pages (`chopper090.github.io/carta/`). Versionare con
`_scripts\Publish-Project.ps1` (bump + sync manifest/sw + commit + push).
