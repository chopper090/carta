# Carta — Generatore di menu

Generatore **offline** di menu stampabili per ristoranti. Multi-cliente: ogni cliente ha la sua
identità (logo, colori, font, preset) e lo stesso motore produce il menu nel suo stile.

- **Cliente via URL:** `?client=demo` (default), `?client=dalentini`, `?client=baretto`.
- **5 varianti grafiche** per foglio A4: Classico · Contemporaneo · Tabula · Editoriale · Diario.
- **Export:** stampa/PDF (`window.print()`), JSON e HTML standalone autonomo.
- **PWA installabile**, funziona offline; persistenza per-cliente in `localStorage`.
- **Memoria condivisa:** gli stessi menu su notebook, telefono e app installata.

## Memoria condivisa fra dispositivi

I menu vivono in `localStorage`, quindi nel browser che li ha scritti. Dal pannello dell'editor
(*Memoria condivisa fra dispositivi*) li si deposita in un **Gist segreto** del proprio account
GitHub, e da lì ogni dispositivo legge e scrive lo stesso archivio.

1. Crea un token **classic** su [github.com/settings/tokens/new](https://github.com/settings/tokens/new?scopes=gist&description=Carta%20Sync)
   spuntando **solo `gist`** (i token *fine-grained* con i Gist non funzionano).
2. Incollalo nel pannello → **Salva token**. Vale anche per Cambusa sullo stesso dispositivo.
3. Sul dispositivo che ha i dati buoni premi **Invia**; sugli altri **Scarica**. Poi accendi
   *Sincronizza da sola*.

In caso di modifiche in contemporanea **vince l'ultimo salvataggio**. Il token resta nel browser,
non entra mai nell'archivio ed è revocabile da GitHub in ogni momento. Senza token l'app funziona
esattamente come prima, offline e in locale.

## Portare il menu in Cambusa

`↓ File per Cambusa` esporta ogni voce come piatto (categoria, prezzo, allergeni) e ne scioglie
la descrizione nei **singoli ingredienti**, pronti per il food cost di
[Cambusa](https://github.com/chopper090/cambusa). Con la sincronizzazione accesa lo stesso file
(`carta-to-cambusa.json`) finisce nel Gist a ogni salvataggio, così Cambusa se lo prende da sola.
Il modulo da innestare in Cambusa è `tools/cambusa-import-carta.js` (istruzioni in testa al file).

## Struttura
- `index.html` — l'app (React via CDN + Babel). È anche la home.
- `clients.js` — registro clienti/temi (`CLIENTS`, `DEFAULT_CLIENT`, `getClient`).
- `sync.js` — memoria condivisa fra dispositivi (Gist). `cambusa-bridge.js` — export per Cambusa.
- `tools/` — `cambusa-import-carta.js`: modulo da copiare **in Cambusa** per leggere il ponte.
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
