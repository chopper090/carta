// ============================================================================
// Carta → Cambusa · il ponte
//
// Carta descrive un piatto in prosa: "gel umadashi (dashi, soia, kuzu), uovo
// poché panato nel panko". Cambusa vuole invece un'anagrafica: ogni ingrediente
// è una scheda con il suo prezzo e i suoi allergeni, e il piatto è la somma
// delle sue righe. Qui si fa la traduzione — una volta sola, per tutti i
// clienti — così il food cost parte già popolato invece che da foglio bianco.
//
// Cosa viene fuori: un oggetto `carta-to-cambusa` con un blocco per cliente
// (= un ristorante di Cambusa) contenente i piatti e l'anagrafica ingredienti
// dedotta dalle descrizioni. Lo si scarica come file, e viene anche pubblicato
// nel Gist a ogni sincronizzazione (vedi sync.js) così Cambusa può pescarlo
// da sola senza passaggi manuali.
//
// Onestà del dato: gli allergeni del PIATTO arrivano da Carta e sono quelli
// buoni (li hai spuntati tu). Quelli dei singoli ingredienti sono dedotti dal
// nome con un dizionario: servono a partire, non a chiudere l'HACCP. Per
// questo l'importatore tiene sempre l'unione fra i due, senza mai perdere un
// allergene dichiarato in Carta.
// ============================================================================
(function (global) {
  "use strict";

  // Gli allergeni sono numerati 1-14 in Carta e per nome in Cambusa: stesso
  // ordine di legge in entrambe, quindi la corrispondenza è posizionale.
  const ALG_NAMES = [
    null, "glutine", "crostacei", "uova", "pesce", "arachidi", "soia",
    "latticini", "frutta a guscio", "sedano", "senape", "sesamo", "solfiti",
    "lupini", "molluschi"
  ];

  // Dizionario per dedurre l'allergene dal nome dell'ingrediente. Prima voce
  // che combacia vince; l'ordine conta (i più specifici stanno in cima).
  const HINTS = [
    [/panko|pangratt|crostini?\b|croston|frisell|brioche|\bpane\b|\bbun\b|farina|pasta\b|couscous|orzo|seitan|birra|tempura|pastella|piadina|focaccia|grissin|cracker|biscott|\bpizz/i, "glutine"],
    [/gambe(ro|ri)|scampi|astice|granchio|aragosta|mazzancoll/i, "crostacei"],
    [/cozz|vongol|calamar|sepp|polp[oi]\b|mosciol|capesant|totan|lumach/i, "molluschi"],
    [/uov[ao]|tuorlo|albume|maionese|tartara|carbonara|meringa|zabaion/i, "uova"],
    [/acciug|alic[ei]|tonno|baccal|salmon|branzin|orat|sgombr|colatura|bottarg|ricciol|pesce|sashimi|katsuobushi|dashi|worcester|\bnduja di mare/i, "pesce"],
    [/arachid|burro di noccioline/i, "arachidi"],
    [/soia|tamari|edamam|miso|tofu|umadashi/i, "soia"],
    [/latt(e|icin)|burro|panna|formagg|parmigian|pecorin|grana|mozzarell|bufal|burrat|stracciatell|ricott|mascarpon|gorgonzol|provol|caciocavall|scamorz|fet[ao]\b|yogurt|cheddar|brie|taleggi|robiol|philadelphia/i, "latticini"],
    [/noci\b|noce\b|nocciol|mandorl|pistacch|anacard|pinol|noci pecan|macadamia|frutta a guscio/i, "frutta a guscio"],
    [/sedano|worcester/i, "sedano"],
    [/senape|mostard/i, "senape"],
    [/sesamo|tahin|hummus|gomasio/i, "sesamo"],
    [/solfiti|\bvino\b|prosecco|spumante|aceto|vermouth|marsala|aceto balsamico|campari|bitter|maraschino/i, "solfiti"],
    [/lupini/i, "lupini"]
  ];

  // Parole che compaiono nelle descrizioni ma non sono ingredienti: se una
  // virgola isola solo questa roba, la scartiamo invece di creare schede vuote.
  const NOT_FOOD = /^(?:e|ed|con|senza|servit[oa].*|da confermare|a scelta|q\.?b\.?|opzionale|\d+\s*(?:g|gr|ml|cl|kg|pz)?)$/i;

  // ---- ingredienti dalla descrizione ------------------------------------
  // Si taglia sulle virgole, ma solo quelle "in superficie": dentro le
  // parentesi la virgola elenca i componenti di una preparazione
  // ("gel umadashi (dashi, soia, kuzu)") e spezzarla perderebbe il nesso.
  function splitTop(text) {
    const out = [];
    let buf = "", depth = 0;
    for (const ch of String(text || "")) {
      if (ch === "(" || ch === "[") depth++;
      else if (ch === ")" || ch === "]") depth = Math.max(0, depth - 1);
      if ((ch === "," || ch === ";" || ch === "·") && depth === 0) { out.push(buf); buf = ""; continue; }
      buf += ch;
    }
    out.push(buf);
    return out;
  }

  function cleanName(raw) {
    let s = String(raw || "")
      .replace(/\s+/g, " ")
      .replace(/^[\s\-–—·•]+|[\s.;:]+$/g, "")
      .trim();
    if (!s) return "";
    // "uovo poché panato nel panko e fritto" → resta com'è: è il nome della
    // preparazione, e in Cambusa diventerà una scheda che poi affini a mano.
    if (s.length > 60) s = s.slice(0, 60).replace(/\s\S*$/, "");
    if (NOT_FOOD.test(s)) return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function allergensFor(name) {
    const found = [];
    for (const [re, alg] of HINTS) {
      if (re.test(name) && found.indexOf(alg) < 0) found.push(alg);
    }
    return found;
  }

  function ingredientsFromDish(dish) {
    const names = splitTop(dish.desc).map(cleanName).filter(Boolean);
    const seen = new Set();
    const out = [];
    for (const nome of names) {
      const k = nome.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push({ nome, allergeni: allergensFor(nome) });
    }
    return out;
  }

  // ---- un cliente di Carta = un ristorante di Cambusa -------------------
  function buildRestaurant(clientId, menu, clientName) {
    const dishes = (menu && menu.dishes) || [];
    const piatti = [];
    const anagrafica = new Map();

    for (const d of dishes) {
      if (!d || !d.name) continue;
      const ing = ingredientsFromDish(d);
      for (const i of ing) {
        const k = i.nome.toLowerCase();
        const prev = anagrafica.get(k);
        if (!prev) anagrafica.set(k, { nome: i.nome, allergeni: i.allergeni.slice() });
        else for (const a of i.allergeni) if (prev.allergeni.indexOf(a) < 0) prev.allergeni.push(a);
      }
      piatti.push({
        nome: d.name,
        categoria: d.section || "",
        area: d.area || "",
        prezzo_vendita: typeof d.price === "number" ? d.price : 0,
        procedimento: d.desc || "",
        note: d.story || "",
        asporto: !!d.takeaway,
        // questi sono quelli dichiarati in Carta: fanno fede
        allergeni: (d.allergens || []).map(n => ALG_NAMES[n]).filter(Boolean),
        ingredienti: ing
      });
    }

    return {
      clientId,
      nome: clientName || clientId,
      menu: { nome: (menu && menu.name) || "", sottotitolo: (menu && menu.subtitle) || "" },
      piatti,
      ingredienti: Array.from(anagrafica.values())
    };
  }

  // ---- l'export completo ------------------------------------------------
  // `parts` è la fotografia del localStorage che sync.js sta per spedire:
  // così il ponte e il backup raccontano sempre lo stesso identico momento.
  function build(parts) {
    const src = parts || {};
    const ristoranti = [];
    const ids = Object.keys(src)
      .filter(k => k.indexOf("menu.") === 0)
      .map(k => k.slice(5));

    for (const id of ids) {
      let menu = null;
      try { menu = JSON.parse(src["menu." + id]); } catch (e) { continue; }
      if (!menu) continue;
      if (typeof normalizeMenu === "function") menu = normalizeMenu(menu);
      const cl = (typeof CLIENTS === "object" && CLIENTS[id]) || null;
      ristoranti.push(buildRestaurant(id, menu, cl ? cl.name : id));
    }
    if (!ristoranti.length) return null;

    return {
      _fmt: "carta-to-cambusa",
      _v: 1,
      origine: "carta",
      savedAt: Date.now(),
      ristoranti
    };
  }

  // Fotografia del localStorage per un export su richiesta (senza passare
  // dalla sincronizzazione).
  function buildFromStorage() {
    const parts = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.indexOf("menu.") === 0) parts[k] = localStorage.getItem(k);
      }
    } catch (e) {}
    return build(parts);
  }

  // Solo il cliente aperto: comodo quando stai lavorando su un locale solo.
  function buildOne(clientId, menu) {
    const cl = (typeof CLIENTS === "object" && CLIENTS[clientId]) || null;
    return {
      _fmt: "carta-to-cambusa",
      _v: 1,
      origine: "carta",
      savedAt: Date.now(),
      ristoranti: [buildRestaurant(clientId, menu, cl ? cl.name : clientId)]
    };
  }

  global.CambusaBridge = {
    build, buildFromStorage, buildOne,
    ingredientsFromDish, allergensFor, ALG_NAMES, FILE: "carta-to-cambusa.json"
  };
})(window);
