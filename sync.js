// ============================================================================
// Carta · la memoria che segue il dispositivo, non lo precede
//
// Finora il menù viveva in `localStorage`: scritto sul notebook, restava sul
// notebook. Qui la stessa memoria viene depositata in un **Gist segreto** del
// tuo account GitHub, così il portatile, il telefono e l'app installata
// leggono e scrivono lo stesso archivio.
//
// Regola dei conflitti: vince l'ultima modifica (confronto per timestamp).
//   - all'apertura: se il remoto è più recente → scarica
//   - dopo ogni modifica: invia, con un ritardo (non a ogni tasto)
//   - a mano: Sincronizza ora · Invia · Scarica
//
// È lo stesso meccanismo di Cambusa (`js/sync.js`): **lo stesso token vale per
// entrambe le app**, e infatti se l'hai già inserito là lo ritroviamo qui. Il
// token (permesso "gist" e nient'altro) resta su questo dispositivo e non
// finisce MAI dentro il backup — altrimenti il secret scanning di GitHub lo
// revocherebbe appena pubblicato.
//
// ⚠️ Su GitHub Pages Carta e Cambusa stanno sullo stesso origin, quindi
// condividono il localStorage. Per questo qui non si tocca mai una chiave che
// non sia esplicitamente di Carta: niente `clear()`, niente prefissi larghi.
// ============================================================================
(function (global) {
  "use strict";

  const NS     = "carta.sync.";
  const FILE   = "carta-backup.json";
  const API    = "https://api.github.com";
  const CAMBUSA_TOKEN = "rm:v1:sync:token";   // il token di Cambusa, stesso origin

  // Le chiavi di Carta, nominate una per una. Tutto il resto del localStorage
  // appartiene a qualcun altro e non ci riguarda.
  const OWN = /^(?:menu|variant)\.|^(?:active\.client|ui\.theme|ui\.editorW|dalentini\.(?:menu|variant))$/;

  const ls = {
    get(k){ try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v){ try { localStorage.setItem(k, v); } catch (e) {} },
    del(k){ try { localStorage.removeItem(k); } catch (e) {} }
  };

  const cfg = {
    // se il token non c'è qui, si prova quello di Cambusa: è lo stesso account
    get token(){ return ls.get(NS + "token") || ls.get(CAMBUSA_TOKEN) || ""; },
    set token(v){ v ? ls.set(NS + "token", v) : ls.del(NS + "token"); },
    get gistId(){ return ls.get(NS + "gist") || ""; },
    set gistId(v){ v ? ls.set(NS + "gist", v) : ls.del(NS + "gist"); },
    get auto(){ return ls.get(NS + "auto") === "1"; },
    set auto(v){ ls.set(NS + "auto", v ? "1" : "0"); },
    get localUpdatedAt(){ return +ls.get(NS + "localUpd") || 0; },
    set localUpdatedAt(v){ ls.set(NS + "localUpd", String(v)); },
    get syncedUpdatedAt(){ return +ls.get(NS + "syncUpd") || 0; },
    set syncedUpdatedAt(v){ ls.set(NS + "syncUpd", String(v)); }
  };

  let ready = false, busy = false, pushTimer = null, lastError = "";
  // Aprire l'app non è modificarla. Al montaggio React risalva tutto quello
  // che ha appena letto — e la riscrittura non coincide mai al byte con
  // l'originale, perché il menù passa dalla normalizzazione. Senza questo
  // guardiano ogni dispositivo si dichiarerebbe "il più recente" al solo
  // avvio, e un portatile rimasto indietro finirebbe per sovrascrivere il
  // lavoro buono. Si conta come modifica solo ciò che segue un tuo gesto.
  let touched = false;
  const markTouched = () => { touched = true; };
  ["pointerdown", "keydown", "paste", "change"].forEach(ev =>
    document.addEventListener(ev, markTouched, { capture: true, once: true, passive: true }));
  // Copia di ciò che sta nel cloud: serve a riconoscere le riscritture
  // identiche (React risalva il menù appena lo rilegge) e a non spacciarle
  // per modifiche fatte da te.
  let known = Object.create(null);

  const listeners = new Set();
  const applyListeners = new Set();
  const emit = () => { for (const fn of listeners) { try { fn(status()); } catch (e) {} } };
  const emitApplied = (startup) => { for (const fn of applyListeners) { try { fn({ startup: !!startup }); } catch (e) {} } };

  // ---- lettura/scrittura della memoria locale ---------------------------
  function collect() {
    const parts = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && OWN.test(k)) parts[k] = localStorage.getItem(k);
      }
    } catch (e) {}
    return parts;
  }
  function remember(parts) {
    known = Object.create(null);
    for (const k in parts) known[k] = parts[k];
  }

  // ---- GitHub -----------------------------------------------------------
  async function ghFetch(url, opts) {
    opts = opts || {};
    // niente cache: certe app installate servono vecchie risposte 401 e la
    // sincronizzazione risulterebbe rotta con un token perfettamente valido
    const sep = url.indexOf("?") >= 0 ? "&" : "?";
    const res = await fetch(url + sep + "_ts=" + Date.now(), Object.assign({}, opts, {
      cache: "no-store",
      headers: Object.assign({
        "Authorization": "Bearer " + cfg.token,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      }, opts.headers || {})
    }));
    if (!res.ok) {
      const op = (opts.method || "GET") + " " + url.replace(API, "");
      let msg = res.status + " " + res.statusText;
      try { const j = await res.json(); if (j && j.message) msg = res.status + " — " + j.message; } catch (e) {}
      if (res.status === 401) msg = "401 su " + op + " — token rifiutato. Serve un token CLASSIC con permesso “gist” (i “fine-grained” non funzionano con i Gist).";
      else if (res.status === 403) msg = "403 su " + op + " — permesso “gist” mancante, o troppe richieste ravvicinate.";
      else if (res.status === 404) msg = "404 su " + op + " — Gist inesistente o token senza permesso “gist”.";
      throw new Error(msg);
    }
    return res;
  }

  // Il Gist non lo cerchiamo per id ma per contenuto: è l'unico che contiene
  // `carta-backup.json`. Così un dispositivo nuovo lo ritrova da solo.
  async function findGist() {
    const res = await ghFetch(API + "/gists?per_page=100");
    const arr = await res.json();
    const g = Array.isArray(arr) ? arr.find(x => x.files && x.files[FILE]) : null;
    return g ? g.id : "";
  }

  function buildPayload() {
    const parts = collect();
    return {
      _fmt: "carta-backup", _v: 1, app: "carta",
      savedAt: Date.now(),
      updatedAt: cfg.localUpdatedAt || Date.now(),
      parts
    };
  }

  async function push() {
    if (!cfg.token) throw new Error("token mancante");
    const payload = buildPayload();
    const files = {};
    files[FILE] = { content: JSON.stringify(payload) };

    // Il ponte verso Cambusa viaggia insieme al backup: stesso istante, stessa
    // verità. Cambusa lo trova nel Gist senza che tu esporti niente a mano.
    try {
      const bridge = global.CambusaBridge && global.CambusaBridge.build(payload.parts);
      if (bridge) files[global.CambusaBridge.FILE] = { content: JSON.stringify(bridge) };
    } catch (e) {}

    const body = JSON.stringify({ description: "Carta — memoria dei menù (sync)", public: false, files });
    if (!cfg.gistId) cfg.gistId = await findGist();
    const res = cfg.gistId
      ? await ghFetch(API + "/gists/" + cfg.gistId, { method: "PATCH", body })
      : await ghFetch(API + "/gists", { method: "POST", body });
    const data = await res.json();
    cfg.gistId = data.id;
    cfg.localUpdatedAt = payload.updatedAt;
    cfg.syncedUpdatedAt = payload.updatedAt;
    remember(payload.parts);
    return payload.updatedAt;
  }

  async function fetchRemote() {
    if (!cfg.token) throw new Error("token mancante");
    if (!cfg.gistId) cfg.gistId = await findGist();
    if (!cfg.gistId) return null;
    const res = await ghFetch(API + "/gists/" + cfg.gistId);
    const data = await res.json();
    const f = data.files && data.files[FILE];
    if (!f) return null;
    let content = f.content;
    // oltre ~1 MB il Gist restituisce il file troncato: si va al raw
    if (f.truncated && f.raw_url) content = await (await fetch(f.raw_url, { cache: "no-store" })).text();
    try { return JSON.parse(content); } catch (e) { return null; }
  }

  // Sostituisce la memoria di Carta con quella remota — e solo quella: le
  // chiavi delle altre app sullo stesso origin restano dove sono.
  function applyRemote(payload, startup) {
    if (!payload || payload._fmt !== "carta-backup") throw new Error("il contenuto remoto non è un backup di Carta");
    const parts = payload.parts || {};
    const stale = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && OWN.test(k) && !(k in parts)) stale.push(k);
      }
    } catch (e) {}
    stale.forEach(ls.del);
    for (const k in parts) if (OWN.test(k)) ls.set(k, parts[k]);
    remember(parts);
    cfg.localUpdatedAt = payload.updatedAt || Date.now();
    cfg.syncedUpdatedAt = cfg.localUpdatedAt;
    emitApplied(startup);
  }

  async function pull(startup) {
    const remote = await fetchRemote();
    if (!remote) throw new Error("non c'è ancora niente nel cloud da scaricare");
    applyRemote(remote, startup);
  }

  // Confronto per timestamp: chi ha l'ora più recente detta legge.
  async function syncNow(startup) {
    if (busy) return { skipped: true };
    busy = true; lastError = ""; emit();
    try {
      if (!cfg.token) throw new Error("configura prima il token");
      const remote = await fetchRemote();
      if (!remote) { await push(); return { pushed: true, created: true }; }
      const rU = remote.updatedAt || 0, lU = cfg.localUpdatedAt || 0;
      if (rU > lU) { applyRemote(remote, startup); return { pulled: true }; }
      if (lU > rU) { await push(); return { pushed: true }; }
      cfg.syncedUpdatedAt = rU;
      remember(collect());
      return { inSync: true };
    } catch (e) {
      lastError = e.message || String(e);
      throw e;
    } finally { busy = false; emit(); }
  }

  function scheduleAutoPush() {
    if (!ready || !cfg.auto || !cfg.token) return;
    clearTimeout(pushTimer);
    // 4 secondi di quiete: si scrive quando hai finito di scrivere, non mentre
    pushTimer = setTimeout(() => {
      busy = true; emit();
      push().then(() => { lastError = ""; })
            .catch(e => { lastError = e.message || String(e); })
            .then(() => { busy = false; emit(); });
    }, 4000);
  }

  // L'app segnala ogni scrittura. Se il contenuto è identico a quello che
  // abbiamo appena applicato non è una tua modifica: è React che rilegge.
  function bump(key, value) {
    if (key && known[key] === value) return;
    if (key) known[key] = value;
    if (!ready) return;                 // prima del primo confronto non si sporca niente
    if (!touched) return;               // e nemmeno se non hai ancora toccato niente
    cfg.localUpdatedAt = Date.now();
    emit();
    scheduleAutoPush();
  }

  // Diagnostica: verifica il token salvato SU QUESTO dispositivo.
  async function verify() {
    if (!cfg.token) throw new Error("nessun token salvato su questo dispositivo");
    const res = await fetch(API + "/user?_ts=" + Date.now(), {
      cache: "no-store",
      headers: {
        "Authorization": "Bearer " + cfg.token,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      }
    });
    if (res.status === 401) throw new Error("401 — il token salvato qui non è valido. Probabilmente è quello vecchio: reincollalo e salva.");
    if (!res.ok) throw new Error(res.status + " " + res.statusText);
    const u = await res.json();
    const raw = res.headers.get("x-oauth-scopes");   // null se il browser non lo espone
    const scopes = raw == null ? null : raw.split(",").map(s => s.trim()).filter(Boolean);
    return { login: u.login, scopes, hasGist: scopes == null ? null : scopes.indexOf("gist") >= 0 };
  }

  // Salvare il token qui lo rende valido anche per Cambusa sullo stesso
  // dispositivo: una chiave sola per tutte le app.
  function saveToken(v, shareWithCambusa) {
    cfg.token = (v || "").trim();
    if (cfg.token && shareWithCambusa !== false) ls.set(CAMBUSA_TOKEN, cfg.token);
    cfg.gistId = "";
    lastError = ""; emit();
  }
  // Rimuove solo la copia di Carta: il token di Cambusa non è roba nostra.
  function clearToken() {
    ls.del(NS + "token");
    cfg.gistId = ""; cfg.localUpdatedAt = 0; cfg.syncedUpdatedAt = 0;
    lastError = ""; emit();
  }

  function status() {
    return {
      hasToken: !!cfg.token, gistId: cfg.gistId, auto: cfg.auto, busy, ready,
      dirty: cfg.localUpdatedAt > cfg.syncedUpdatedAt,
      localUpdatedAt: cfg.localUpdatedAt, syncedUpdatedAt: cfg.syncedUpdatedAt,
      error: lastError
    };
  }

  async function init() {
    remember(collect());
    try {
      if (cfg.auto && cfg.token) await syncNow(true);
    } catch (e) { /* lastError è già impostato: lo mostra il pannello */ }
    finally {
      ready = true;
      if (cfg.auto && cfg.token && cfg.localUpdatedAt > cfg.syncedUpdatedAt) scheduleAutoPush();
      emit();
    }
  }

  global.CartaSync = {
    cfg, push, pull, syncNow, verify, saveToken, clearToken, bump, status,
    onState: fn => { listeners.add(fn); return () => listeners.delete(fn); },
    onApplied: fn => { applyListeners.add(fn); return () => applyListeners.delete(fn); },
    FILE
  };

  // Un attimo dopo il montaggio di React: il primo salvataggio dell'app è già
  // passato e viene riconosciuto come "identico", non come una tua modifica.
  if (document.readyState !== "loading") setTimeout(init, 400);
  else document.addEventListener("DOMContentLoaded", () => setTimeout(init, 400));
})(window);
