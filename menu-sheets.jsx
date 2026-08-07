// ============================================================
// Menu sheet components — 5 varianti grafiche
// Tutte renderizzano in formato A4 reale (210mm × 297mm)
// Client-aware: brand, logo, palette e font dipendono dal cliente.
// ============================================================

const { useRef, useContext, useState, useLayoutEffect } = React;

// ============================================================
// Drag & drop della copertina — riposizionamento libero con
// guide di allineamento (cornice + altri elementi) e snap.
// Le posizioni (offset in px) vivono in menu.layout[variante][id]
// e valgono anche in stampa/PDF (sono trasformazioni inline).
// ============================================================
const DragCtx = React.createContext(null);

function Draggable({ id, offset, children }){
  const ctx = useContext(DragCtx);
  const ref = useRef(null);
  const off = offset || { x: 0, y: 0 };
  const child = React.Children.only(children);
  const transform = (off.x || off.y) ? `translate(${off.x}px, ${off.y}px)` : null;
  const baseStyle = child.props.style || {};

  // Non editabile (stampa/export o nessun provider): applica solo l'offset.
  if (!ctx || !ctx.editable){
    return React.cloneElement(child, {
      "data-drag-id": id,
      style: transform ? { ...baseStyle, transform } : baseStyle
    });
  }

  const { zoom, onCommit } = ctx;

  const onPointerDown = (e) => {
    if (e.button != null && e.button !== 0) return;
    const el = ref.current;
    const page = el && el.closest(".page-A4");
    if (!page) return;
    e.preventDefault();
    e.stopPropagation();
    try { el.setPointerCapture(e.pointerId); } catch(_) {}
    el.classList.add("dragging");

    const start = { x: e.clientX, y: e.clientY };
    const base = { x: off.x, y: off.y };
    const pageRect = page.getBoundingClientRect();
    const z = (zoom && zoom > 0) ? zoom : 1;
    const TH = 6; // soglia di snap in px schermo

    // bersagli di allineamento (coord. schermo): cornice + altri draggable
    const vx = [pageRect.left, pageRect.left + pageRect.width / 2, pageRect.right];
    const hy = [pageRect.top, pageRect.top + pageRect.height / 2, pageRect.bottom];
    page.querySelectorAll(".draggable").forEach(d => {
      if (d === el) return;
      const r = d.getBoundingClientRect();
      vx.push(r.left, r.left + r.width / 2, r.right);
      hy.push(r.top, r.top + r.height / 2, r.bottom);
    });

    const layer = document.getElementById("dragGuideLayer");
    const clearGuides = () => { if (layer) layer.innerHTML = ""; };
    const drawGuide = (orient, pos) => {
      if (!layer) return;
      const line = document.createElement("div");
      line.className = "drag-guide " + orient;
      if (orient === "v"){ line.style.left = pos + "px"; line.style.top = pageRect.top + "px"; line.style.height = pageRect.height + "px"; }
      else { line.style.top = pos + "px"; line.style.left = pageRect.left + "px"; line.style.width = pageRect.width + "px"; }
      layer.appendChild(line);
    };

    let cur = { ...base };

    const onMove = (ev) => {
      let nx = base.x + (ev.clientX - start.x) / z;
      let ny = base.y + (ev.clientY - start.y) / z;
      el.style.transform = `translate(${nx}px, ${ny}px)`;
      const r = el.getBoundingClientRect();
      clearGuides();

      const exPts = [r.left, r.left + r.width / 2, r.right];
      let bestX = null;
      vx.forEach(line => exPts.forEach(p => {
        const d = line - p;
        if (Math.abs(d) <= TH && (bestX === null || Math.abs(d) < Math.abs(bestX.d))) bestX = { d, line };
      }));
      if (bestX){ nx += bestX.d / z; drawGuide("v", bestX.line); }

      const eyPts = [r.top, r.top + r.height / 2, r.bottom];
      let bestY = null;
      hy.forEach(line => eyPts.forEach(p => {
        const d = line - p;
        if (Math.abs(d) <= TH && (bestY === null || Math.abs(d) < Math.abs(bestY.d))) bestY = { d, line };
      }));
      if (bestY){ ny += bestY.d / z; drawGuide("h", bestY.line); }

      el.style.transform = `translate(${nx}px, ${ny}px)`;
      cur = { x: Math.round(nx), y: Math.round(ny) };
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.classList.remove("dragging");
      clearGuides();
      onCommit(id, cur);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return React.cloneElement(child, {
    ref,
    "data-drag-id": id,
    className: ((child.props.className || "") + " draggable editable").trim(),
    style: transform ? { ...baseStyle, transform } : baseStyle,
    onPointerDown,
    title: "Trascina per riposizionare"
  });
}

// offset salvato per (variante, id)
const layoutOf = (menu, variant) => (menu && menu.layout && menu.layout[variant]) || {};

// ============================================================
// MODALITÀ LIBERA ("Canva") — ogni blocco della pagina si sposta,
// si ingrandisce e si nasconde. Riusa lo stesso magazzino delle
// posizioni di copertina: menu.layout[variante][id] = {x,y,s,h}.
// Gli stili sono inline, quindi valgono anche in stampa/PDF/export.
// ============================================================
const FREE_BLOCKS = [
  // blocchi di copertina
  ".cover-center-c", ".cover-chef-c", ".cover-footer-c",
  ".cover-top-m", ".cover-body-m", ".cover-foot-m",
  ".tab-head", ".tab-title", ".tab-foot",
  ".ed-cover-top", ".ed-cover-body", ".ed-cover-foot",
  ".dr-top", ".dr-cover-body", ".dr-cover-foot",
  // blocchi delle pagine interne
  ".inner-head-c", ".dishes-c", ".inner-footer-c",
  ".inner-top-m", ".dishes-m", ".inner-foot-m",
  ".tab-title-cont", ".tab-dishes",
  ".ed-page-head", ".ed-page-body", ".ed-page-foot",
  ".dr-page-head", ".dr-entries", ".dr-page-foot",
  ".lst-head", ".lst-body", ".lst-foot",
  // singoli elementi
  ".menu-section", ".dish-c", ".dish-m", ".tab-dish",
  ".ed-dish", ".dr-entry", ".lst-group", ".lst-item"
];

const freeKey = (sel) => sel.replace(/[^a-z0-9-]/gi, "");

// Assegna a ogni blocco un id stabile (pagina + tipo + progressivo).
function tagFreeBlocks(root){
  root.querySelectorAll("[data-free-id]").forEach(el => el.removeAttribute("data-free-id"));
  [...root.querySelectorAll(".page-A4")].forEach((pg, pi) => {
    const n = {};
    FREE_BLOCKS.forEach(sel => {
      const k = freeKey(sel);
      pg.querySelectorAll(sel).forEach(el => {
        if (el.hasAttribute("data-drag-id")) return;   // già gestito dalla copertina
        n[k] = n[k] || 0;
        el.setAttribute("data-free-id", pi + ":" + k + ":" + (n[k]++));
      });
    });
  });
}

// Applica posizione / dimensione / visibilità salvate.
function applyFreeLayout(root, layout){
  root.querySelectorAll("[data-free-id]").forEach(el => {
    const v = layout[el.getAttribute("data-free-id")];
    el.style.transform = (v && (v.x || v.y)) ? `translate(${v.x}px, ${v.y}px)` : "";
    el.style.fontSize   = (v && v.s && v.s !== 1) ? (v.s * 100) + "%" : "";
    el.style.opacity    = (v && v.h) ? "0" : "";
    el.style.pointerEvents = (v && v.h) ? "none" : "";
  });
}

// Trascinamento con guide di allineamento e snap (stesso comportamento
// della copertina, ma su qualunque blocco).
function installFreeDrag(root, { zoom, layout, onCommit, onSelect, selectedId }){
  const TH = 6;
  const onDown = (e) => {
    const el = e.target.closest("[data-free-id]");
    if (!el || !root.contains(el)) return;
    if (e.button != null && e.button !== 0) return;
    const page = el.closest(".page-A4");
    if (!page) return;
    e.preventDefault(); e.stopPropagation();

    const id = el.getAttribute("data-free-id");
    onSelect(id);
    const cur0 = layout[id] || {};
    const base = { x: cur0.x || 0, y: cur0.y || 0 };
    const start = { x: e.clientX, y: e.clientY };
    const z = (zoom && zoom > 0) ? zoom : 1;
    const pr = page.getBoundingClientRect();
    const vx = [pr.left, pr.left + pr.width / 2, pr.right];
    const hy = [pr.top, pr.top + pr.height / 2, pr.bottom];
    page.querySelectorAll("[data-free-id]").forEach(d => {
      if (d === el || el.contains(d) || d.contains(el)) return;
      const r = d.getBoundingClientRect();
      vx.push(r.left, r.left + r.width / 2, r.right);
      hy.push(r.top, r.top + r.height / 2, r.bottom);
    });
    const layer = document.getElementById("dragGuideLayer");
    const clear = () => { if (layer) layer.innerHTML = ""; };
    const guide = (o, pos) => {
      if (!layer) return;
      const l = document.createElement("div");
      l.className = "drag-guide " + o;
      if (o === "v"){ l.style.left = pos + "px"; l.style.top = pr.top + "px"; l.style.height = pr.height + "px"; }
      else { l.style.top = pos + "px"; l.style.left = pr.left + "px"; l.style.width = pr.width + "px"; }
      layer.appendChild(l);
    };

    el.classList.add("dragging");
    let cur = { ...base }, moved = false;

    const onMove = (ev) => {
      let nx = base.x + (ev.clientX - start.x) / z;
      let ny = base.y + (ev.clientY - start.y) / z;
      if (Math.abs(ev.clientX - start.x) + Math.abs(ev.clientY - start.y) > 3) moved = true;
      el.style.transform = `translate(${nx}px, ${ny}px)`;
      const r = el.getBoundingClientRect();
      clear();
      let bx = null;
      vx.forEach(L => [r.left, r.left + r.width / 2, r.right].forEach(pt => {
        const d = L - pt;
        if (Math.abs(d) <= TH && (bx === null || Math.abs(d) < Math.abs(bx.d))) bx = { d, L };
      }));
      if (bx){ nx += bx.d / z; guide("v", bx.L); }
      let by = null;
      hy.forEach(L => [r.top, r.top + r.height / 2, r.bottom].forEach(pt => {
        const d = L - pt;
        if (Math.abs(d) <= TH && (by === null || Math.abs(d) < Math.abs(by.d))) by = { d, L };
      }));
      if (by){ ny += by.d / z; guide("h", by.L); }
      el.style.transform = `translate(${nx}px, ${ny}px)`;
      cur = { x: Math.round(nx), y: Math.round(ny) };
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.classList.remove("dragging");
      clear();
      if (moved) onCommit(id, cur);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };
  root.addEventListener("pointerdown", onDown);
  return () => root.removeEventListener("pointerdown", onDown);
}

// ============================================================
// Impaginazione per-variante — colonne + voci per pagina.
// Le impostazioni vivono in menu.grid[variante] = { cols, perPage }.
//   perPage === 0  → automatico: le pagine A4 si riempiono da sole in base
//                    al contenuto, senza limiti (anche 100 pagine).
//   perPage  >  0  → numero fisso di voci per pagina scelto dall'utente.
//   cols           → numero di colonne (solo stili "a lista").
// Il motore non ha più tetti fissi: pagine e colonne seguono i dati.
// ============================================================
const GRID_DEFAULTS = {
  classico:      { cols: 1, perPage: 0, maxCols: 3 },
  contemporaneo: { cols: 1, perPage: 0, maxCols: 3 },
  tabula:        { cols: 1, perPage: 0, maxCols: 3 },
  editoriale:    { cols: 1, perPage: 2, maxCols: 1 },
  diario:        { cols: 1, perPage: 3, maxCols: 1 },
  listino:       { cols: 2, perPage: 0, maxCols: 6 }
};

const gridOf = (menu, variant) => {
  const def = GRID_DEFAULTS[variant] || { cols: 1, perPage: 0, maxCols: 1 };
  const g = (menu && menu.grid && menu.grid[variant]) || {};
  // Compat: vecchia chiave globale menu.cols (un tempo usata solo dal Listino)
  const legacy = (variant === "listino" && !g.cols && menu && menu.cols) ? menu.cols : 0;
  const cols = Math.max(1, Math.min(def.maxCols, g.cols || legacy || def.cols));
  const perPage = Math.max(0, (g.perPage === 0 || g.perPage) ? g.perPage : def.perPage);
  const sectionBreak = !!g.sectionBreak;   // ogni sezione parte da una pagina nuova
  return { cols, perPage, maxCols: def.maxCols, sectionBreak };
};

// Stile per attivare le colonne CSS su un contenitore di piatti.
const colStyle = (cols) => (cols > 1) ? { display: "block", columnCount: cols, columnGap: "10mm" } : undefined;

// Pesi stimati per l'impaginazione automatica (≈ voci per colonna per pagina).
// Valori conservativi: meglio una voce in meno che sbordare dal foglio A4.
// peso descrizione a gradini (0 / 0.6 / 1.2) — le descrizioni multi-riga pesano di più
const descW = (s, a, b) => { const n = (s || "").length; return n > b ? 1.2 : (n > a ? 0.6 : 0); };
const WEIGHTS = {
  classico:      { perCol: 5,   of: (d,i,l)=> 1 + descW(d.desc, 55, 100) + (startsSection(l,i) ? 1.3 : 0) },
  contemporaneo: { perCol: 7,   of: (d,i,l)=> 1 + descW(d.desc, 70, 130) + (startsSection(l,i) ? 0.9 : 0) },
  tabula:        { perCol: 7, firstPerCol: 4.5, of: (d,i,l)=> 1 + descW(d.desc, 65, 120) + (startsSection(l,i) ? 1 : 0) },
  editoriale:    { perCol: 2,   of: ()=> 1 },
  diario:        { perCol: 3.4, of: (d,i,l)=> 1 + (((d.story||"").length > 200) ? 0.6 : 0) + (startsSection(l,i) ? 0.4 : 0) }
};

// Impacchetta una lista (già omogenea) in pagine → [{ start, items }],
// start = indice del primo piatto RELATIVO alla lista passata.
function _packPages(list, cols, perPage, weight){
  const pages = [];
  if (perPage > 0){
    for (let i = 0; i < list.length; i += perPage) pages.push({ start: i, items: list.slice(i, i + perPage) });
    return pages;
  }
  const w = weight || { perCol: 12, of: ()=> 1 };
  const capAt = (pi) => Math.max(1, cols) * ((pi === 0 && w.firstPerCol) ? w.firstPerCol : (w.perCol || 12));
  let start = 0, curW = 0;
  for (let i = 0; i < list.length; i++){
    const dw = w.of(list[i], i, list);
    if (i > start && curW + dw > capAt(pages.length)){ pages.push({ start, items: list.slice(start, i) }); start = i; curW = 0; }
    curW += dw;
  }
  pages.push({ start, items: list.slice(start) });
  return pages;
}

// Se la pagina inizia in mezzo a una sezione, restituisce il nome della sezione
// (serve a ristampare l'intestazione come "Amari (segue)") — altrimenti null.
const contSectionOf = (dishes, start) => {
  if (!start) return null;
  const s = dishes[start] && dishes[start].section;
  return (s && dishes[start - 1] && dishes[start - 1].section === s) ? s : null;
};

// Numerazione pagine: romana finché è leggibile, araba da 10 pagine in su
// (con 54 pagine "XLII / LIV" è illeggibile).
const folio = (n, total) => (total > 10 ? String(n) : romanize(n));

// Liste con prezzo per voce (bar/listino): "coperti" e "portate" non hanno senso.
const isPriceList = (menu) =>
  (menu && menu.dishes || []).some(d => d.price !== null && d.price !== undefined);

// Raggruppa i piatti per sezione consecutiva → [{ sec, start, items }].
function sectionGroups(list){
  const groups = [];
  (list || []).forEach((d, i) => {
    const sec = d.section || "";
    let g = groups[groups.length - 1];
    if (!g || g.sec !== sec){ g = { sec, start: i, items: [] }; groups.push(g); }
    g.items.push(d);
  });
  return groups;
}

// Spezza la lista dei piatti in pagine → [{ start, items }].
// start = indice globale del primo piatto (serve a numerazione e sezioni).
// sectionBreak: ogni sezione parte da una pagina nuova (e ne occupa quante servono).
function paginateDishes(dishes, cols, perPage, weight, sectionBreak){
  const list = dishes || [];
  if (!list.length) return [{ start: 0, items: [] }];
  if (!sectionBreak){
    const p = _packPages(list, cols, perPage, weight);
    return p.length ? p : [{ start: 0, items: [] }];
  }
  const pages = [];
  sectionGroups(list).forEach(g => {
    _packPages(g.items, cols, perPage, weight).forEach(p =>
      pages.push({ start: g.start + p.start, items: p.items }));
  });
  return pages.length ? pages : [{ start: 0, items: [] }];
}

// ============================================================
// Impaginazione a MISURAZIONE REALE (solo in modalità Auto).
// I pesi stimati sono solo il punto di partenza: qui misuriamo l'altezza
// vera delle pagine renderizzate e spostiamo le voci finché ogni foglio è
// pieno quanto può senza sbordare. Funziona anche con più colonne
// (l'eccesso crea una colonna in più → lo vediamo da scrollWidth).
// Le pagine sono rappresentate come indici di inizio: starts[i] = prima voce
// della pagina i. Nessun limite al numero di pagine.
// ============================================================
// Firma degli input: se cambia, l'adattamento riparte da zero.
const fitSig = (clientId, variant, cols, perPage, sectionBreak, dishes) =>
  [clientId, variant, cols, perPage, sectionBreak ? 1 : 0, (dishes || []).length,
   (dishes || []).map(d => (d.name || "").length + "." + (d.desc || "").length + "." +
     (d.story || "").length + "." + (d.section || "")).join("|")].join("~");

function useFittedPages(basePages, dishes, sectionBreak, enabled, sig, cols){
  const rootRef = useRef(null);
  const [starts, setStarts] = useState(() => basePages.map(p => p.start));
  const phase = useRef(0);               // 0 = da misurare, 1+ = verifiche
  const lastSig = useRef(sig);

  if (lastSig.current !== sig){          // input cambiati → riparti pulito
    lastSig.current = sig;
    phase.current = 0;
  }
  useLayoutEffect(() => { phase.current = 0; setStarts(basePages.map(p => p.start)); }, [sig]);

  useLayoutEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    if (!root) return;
    const boxes = [...root.querySelectorAll("[data-fitbox]")];
    const N = dishes.length;
    if (!N || !boxes.length) return;

    const secOf = (i) => (dishes[i] && dishes[i].section) || "";
    const breaksAt = (i) => sectionBreak && i > 0 && secOf(i) !== secOf(i - 1);

    // ---- FASE 0: misura una volta l'altezza vera di ogni voce e calcola
    // l'impaginazione in un colpo solo (niente decine di ri-render).
    if (phase.current === 0){
      const cost = new Array(N).fill(0);
      let seen = 0;
      boxes.forEach(box => {
        const gap = parseFloat(getComputedStyle(box).rowGap) || 0;
        let pending = 0;                 // intestazioni di sezione: costo della voce che segue
        box.querySelectorAll("[data-di],[data-fithead]").forEach(ch => {
          const cs = getComputedStyle(ch);
          const h = ch.getBoundingClientRect().height + gap +
                    (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0);
          const a = ch.getAttribute("data-di");
          if (a === null) pending += h;
          else { cost[+a] = h + pending; pending = 0; seen++; }
        });
      });
      if (seen < N) return;              // misura incompleta: riprova al prossimo giro

      const A0 = boxes[0].clientHeight;                          // prima pagina
      const A1 = boxes.length > 1 ? boxes[1].clientHeight : A0;  // pagine successive
      const next = [0];
      let acc = 0;
      for (let i = 0; i < N; i++){
        const avail = (next.length === 1 ? A0 : A1) * Math.max(1, cols || 1);
        if (i > 0 && i !== next[next.length - 1] &&
            (breaksAt(i) || acc + cost[i] > avail)){
          next.push(i); acc = 0;
        }
        acc += cost[i];
      }
      phase.current = 1;
      if (next.length !== starts.length || next.some((v, k) => v !== starts[k])) setStarts(next);
      return;
    }

    // ---- FASE 1+: rete di sicurezza. Se per arrotondamenti una pagina
    // sborda ancora (es. l'ultima con la legenda), sposta avanti l'eccesso.
    if (phase.current > 8 || boxes.length !== starts.length) return;
    const over = (b) => (b.scrollHeight > b.clientHeight + 1) || (b.scrollWidth > b.clientWidth + 1);
    const endOf = (arr, i) => (i + 1 < arr.length ? arr[i + 1] : N);
    const next = starts.slice();
    let changed = false;
    for (let i = 0; i < boxes.length; i++){
      const from = next[i], to = endOf(next, i);
      if (to - from > 1 && over(boxes[i])){
        const moved = to - 1;
        if (i + 1 < next.length && (!sectionBreak || secOf(moved) === secOf(next[i + 1]))) next[i + 1] = moved;
        else next.splice(i + 1, 0, moved);
        changed = true;
        break;
      }
    }
    if (changed){ phase.current += 1; setStarts(next); }
  });

  const pages = starts.map((s, i) => ({
    start: s,
    items: dishes.slice(s, i + 1 < starts.length ? starts[i + 1] : dishes.length)
  }));
  return [enabled ? pages : basePages, rootRef];
}

// ---- Utility ----
const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  const months = ["gennaio","febbraio","marzo","aprile","maggio","giugno",
                  "luglio","agosto","settembre","ottobre","novembre","dicembre"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const formatPrice = (p) => {
  if (!p && p !== 0) return "";
  return `€ ${Number(p).toLocaleString("it-IT")}`;
};

const courseNumber = (i) => String(i + 1).padStart(2, "0");

// Una "sezione" inizia al piatto i se ha section non vuota e diversa dal precedente
const startsSection = (dishes, i) => {
  const s = dishes[i] && dishes[i].section;
  return !!s && (i === 0 || (dishes[i - 1] && dishes[i - 1].section) !== s);
};
// Intestazione di sezione (Antipasti, Buns, …) — stile per-variante via classe ms-<variante>
const SectionHead = ({ title, variant }) => (
  <div className={"menu-section ms-" + variant} data-fithead>
    <span className="ms-rule" aria-hidden="true"></span>
    <span className="ms-label">{title}</span>
    <span className="ms-rule" aria-hidden="true"></span>
  </div>
);

// Cliente attivo, con fallback alla casa
const useClient = (client) =>
  client || (typeof getClient === "function" ? getClient(DEFAULT_CLIENT) : { id: "demo", name: "Il Tuo Ristorante", role: "", stamp: "Ristorante", stampInline: "Il Tuo Ristorante", diaryTitle: "Le nostre serate", logo: { type: "wordmark", text: "Il Tuo Ristorante" } });

// Marchio del cliente: logo immagine oppure wordmark testuale
const Brand = ({ client, className = "" }) => {
  const C = useClient(client);
  if (C.logo && C.logo.type === "image"){
    return <img className={"brand-logo " + className} src={C.logo.src} alt={C.logo.alt || C.name} />;
  }
  return <span className={"brand-word " + className}>{(C.logo && C.logo.text) || C.name}</span>;
};

// Prezzo per singola voce (usato dai menù bar tipo "NOME | 8.00 €")
const DishPrice = ({ value }) => {
  if (value === null || value === undefined || value === "") return null;
  return (
    <span className="dish-price"><i className="dish-price-sep">|</i>{Number(value).toFixed(2)} €</span>
  );
};

// Decoro "coast": onda piena con bordo ondulato in alto
const CoastWave = ({ className = "" }) => (
  <div className={"coast-wave " + className} aria-hidden="true">
    <svg viewBox="0 0 240 12" preserveAspectRatio="none">
      <path d="M0,6 C10,0 20,0 30,6 C40,12 50,12 60,6 C70,0 80,0 90,6 C100,12 110,12 120,6 C130,0 140,0 150,6 C160,12 170,12 180,6 C190,0 200,0 210,6 C220,12 230,12 240,6 L240,12 L0,12 Z"/>
    </svg>
  </div>
);

// Decoro "coast": fetta d'agrume
const Citrus = ({ className = "" }) => (
  <svg className={"citrus " + className} viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="47" className="citrus-rind"/>
    <circle cx="50" cy="50" r="39" className="citrus-pith"/>
    <circle cx="50" cy="50" r="35" className="citrus-flesh"/>
    {Array.from({ length: 10 }).map((_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return <line key={i} x1="50" y1="50" x2={(50 + 35 * Math.cos(a)).toFixed(1)} y2={(50 + 35 * Math.sin(a)).toFixed(1)} className="citrus-seg"/>;
    })}
    <circle cx="50" cy="50" r="4" className="citrus-core"/>
  </svg>
);

const AllergensInline = ({ list }) => {
  if (!list || list.length === 0) return null;
  return (
    <span className="dish-allergens">
      ({[...list].sort((a,b)=>a-b).join(" · ")})
    </span>
  );
};

const AllergensLegend = ({ className = "" }) => (
  <span className={"allergens-flat " + className}>
    <b>Allergeni · Reg. UE 1169/2011 ·&nbsp;</b>
    {ALLERGENI.map((a, i) => (
      <span key={a.n}>
        <b>{a.n}</b>&nbsp;{a.label}{i < ALLERGENI.length - 1 ? "  ·  " : ""}
      </span>
    ))}
  </span>
);

// Image with striped fallback
const DishImage = ({ src, ratio = "4 / 5", caption = "Foto piatto", className = "" }) => {
  if (src){
    return (
      <div className={"dish-image " + className} style={{ aspectRatio: ratio }}>
        <img src={src} alt="" />
      </div>
    );
  }
  return (
    <div className={"dish-image dish-image-placeholder " + className} style={{ aspectRatio: ratio }}>
      <span className="ph-caption">{caption}</span>
    </div>
  );
};

// ============================================================
// I — MENU CLASSICO  (centered, symmetric, gold ornament)
// ============================================================
function MenuClassico({ menu, client }) {
  const C = useClient(client);
  const coast = C.decor === "coast";
  const portate = menu.dishes.length;
  const L = layoutOf(menu, "classico");
  const { cols, perPage, sectionBreak } = gridOf(menu, "classico");
  const base = paginateDishes(menu.dishes, cols, perPage, WEIGHTS.classico, sectionBreak);
  const [pages, fitRef] = useFittedPages(base, menu.dishes, sectionBreak, perPage === 0,
    fitSig(C.id, "classico", cols, perPage, sectionBreak, menu.dishes), cols);
  return (
    <div className="sheet sheet-classico" data-client={C.id} data-screen-label="Menu Classico" ref={fitRef}>
      <div className="page-A4 cover-page-c">
        {coast && <Citrus className="cover-citrus" />}
        <div className="cover-chef-c">{C.role} · {menu.chef}</div>

        <div className="cover-center-c">
          <Draggable id="subtitle" offset={L.subtitle}><div className="cover-stamp-c">{C.stamp}</div></Draggable>
          <Draggable id="logo" offset={L.logo}><div className="cover-wm-c"><Brand client={C} /></div></Draggable>
          <div className="cover-ornament-c">
            <span className="orn-rule"></span>
            <span className="orn-dot">·</span>
            <span className="orn-rule"></span>
          </div>
          <Draggable id="title" offset={L.title}><div className="cover-menu-name-c">{menu.name || "—"}</div></Draggable>
          <div className="cover-meta-c">
            {menu.category && <span className="cover-cat-c">menu {menu.category}</span>}
          </div>
          <Draggable id="stats" offset={L.stats}><div className="cover-portate-c">
            {portate} {isPriceList(menu) ? "voci" : "portate"}
            {menu.price ? <><span className="dot-sep">·</span> {formatPrice(menu.price)}</> : null}
          </div></Draggable>
          {menu.chefNote && (
            <p className="cover-note-c">{menu.chefNote}</p>
          )}
        </div>

        {coast && <CoastWave className="cover-wave-c" />}
        <div className="cover-footer-c">
          <span>{formatDate(menu.date)}</span>
          <span className="cover-seats-c">{bookingLine(C, menu)}</span>
        </div>
      </div>

      {pages.map((pg, pi) => (
        <div className="page-A4 inner-page-c" key={pi}>
          <div className="inner-head-c">
            <div className="inner-wm-c"><Brand client={C} className="brand-sm" /></div>
            <div className="inner-menu-name-c">
              — {menu.name} —
              {pages.length > 1 && <span className="inner-folio-c"> · {folio(pi + 1, pages.length)}/{folio(pages.length, pages.length)}</span>}
            </div>
          </div>

          <div className="dishes-c" data-fitbox style={colStyle(cols)}>
            {contSectionOf(menu.dishes, pg.start) &&
              <SectionHead title={contSectionOf(menu.dishes, pg.start) + " (segue)"} variant="c" />}
            {pg.items.map((d, idx) => {
              const i = pg.start + idx;
              return (
                <React.Fragment key={i}>
                  {startsSection(menu.dishes, i) && <SectionHead title={d.section} variant="c" />}
                  <div className="dish-c" data-di={i}>
                    <div className="dish-num-c">{courseNumber(i)}</div>
                    <h3 className="dish-name-c">
                      {d.name || <span className="placeholder-c">Nome del piatto</span>}
                      <DishPrice value={d.price} />
                      <AllergensInline list={d.allergens} />
                    </h3>
                    {d.desc && <p className="dish-desc-c">{d.desc}</p>}
                    {idx < pg.items.length - 1 && !startsSection(menu.dishes, i + 1) && (
                      <div className="dish-sep-c">
                        <span></span><em>·</em><span></span>
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {pi === pages.length - 1 && (
            <div className="inner-footer-c">
              <div className="allergens-legend-c">
                <div className="legend-title-c">— Allergeni —</div>
                <div className="legend-list-c">
                  {ALLERGENI.map(a => (
                    <span key={a.n} className="legend-item-c">
                      <span className="legend-n">{a.n}</span> {a.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// II — MENU CONTEMPORANEO  (left-aligned, editorial)
// ============================================================
function MenuContemporaneo({ menu, client }) {
  const C = useClient(client);
  const coast = C.decor === "coast";
  const hasLogo = C.logo && C.logo.type === "image";
  const portate = menu.dishes.length;
  const L = layoutOf(menu, "contemporaneo");
  const { cols, perPage, sectionBreak } = gridOf(menu, "contemporaneo");
  const base = paginateDishes(menu.dishes, cols, perPage, WEIGHTS.contemporaneo, sectionBreak);
  const [pages, fitRef] = useFittedPages(base, menu.dishes, sectionBreak, perPage === 0,
    fitSig(C.id, "contemporaneo", cols, perPage, sectionBreak, menu.dishes), cols);
  return (
    <div className="sheet sheet-contemporaneo" data-client={C.id} data-screen-label="Menu Contemporaneo" ref={fitRef}>
      <div className="page-A4 cover-page-m">
        {coast && <Citrus className="cover-citrus" />}
        <div className="cover-top-m">
          <span className="cover-stamp-m">{C.stampInline}</span>
          <span className="cover-date-m">{formatDate(menu.date)}</span>
        </div>

        <div className="cover-body-m">
          {hasLogo && <Draggable id="logo" offset={L.logo}><div className="cover-brand-wrap"><Brand client={C} className="cover-brand-m" /></div></Draggable>}
          <Draggable id="subtitle" offset={L.subtitle}><div className="cover-cat-m">— menu {menu.category} —</div></Draggable>
          <Draggable id="title" offset={L.title}><h1 className="cover-name-m">{menu.name || "—"}</h1></Draggable>
          <div className="cover-rule-m"></div>
          <Draggable id="stats" offset={L.stats}><div className="cover-stats-m">
            <div className="stat-m">
              <span className="stat-label-m">{isPriceList(menu) ? "Voci" : "Portate"}</span>
              <span className="stat-val-m">{portate}</span>
            </div>
            {menu.price ? (
              <div className="stat-m">
                <span className="stat-label-m">Prezzo</span>
                <span className="stat-val-m">{formatPrice(menu.price)}</span>
              </div>
            ) : null}
            {!isPriceList(menu) && (
              <div className="stat-m">
                <span className="stat-label-m">Coperti</span>
                <span className="stat-val-m">{String(menu.seats).padStart(2,"0")}</span>
              </div>
            )}
          </div></Draggable>
          {menu.chefNote && (
            <p className="cover-note-m">«&nbsp;{menu.chefNote}&nbsp;»</p>
          )}
        </div>

        {coast && <CoastWave className="cover-wave-m" />}
        <div className="cover-foot-m">
          <span className="cover-chef-m">— {menu.chef}, {C.role}</span>
          <span className="cover-folio-m">I</span>
        </div>
      </div>

      {pages.map((pg, pi) => (
        <div className="page-A4 inner-page-m" key={pi}>
          <div className="inner-top-m">
            <span className="inner-wm-m"><Brand client={C} className="brand-sm" /></span>
            <span className="inner-name-m">{menu.name} · {portate} {isPriceList(menu) ? "voci" : "portate"}</span>
          </div>

          <div className="dishes-m" data-fitbox style={colStyle(cols)}>
            {contSectionOf(menu.dishes, pg.start) &&
              <SectionHead title={contSectionOf(menu.dishes, pg.start) + " (segue)"} variant="m" />}
            {pg.items.map((d, idx) => {
              const i = pg.start + idx;
              return (
                <React.Fragment key={i}>
                  {startsSection(menu.dishes, i) && <SectionHead title={d.section} variant="m" />}
                  <div className="dish-m" data-di={i}>
                    <div className="dish-left-m">
                      <div className="dish-num-m">{courseNumber(i)}</div>
                    </div>
                    <div className="dish-body-m">
                      <h3 className="dish-name-m">
                        {d.name || <span className="placeholder-m">Nome del piatto</span>}
                        <DishPrice value={d.price} />
                        <AllergensInline list={d.allergens} />
                      </h3>
                      {d.desc && <p className="dish-desc-m">{d.desc}</p>}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          <div className="inner-foot-m">
            <div className="legend-m">
              {pi === pages.length - 1 && <AllergensLegend />}
            </div>
            <div className="folio-m">{folio(pi + 2, pages.length + 1)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// III — MENU TABULA  (ultra-minimal, single page)
// ============================================================
function MenuTabula({ menu, client }) {
  const C = useClient(client);
  const coast = C.decor === "coast";
  const portate = menu.dishes.length;
  const { cols, perPage, sectionBreak } = gridOf(menu, "tabula");
  const base = paginateDishes(menu.dishes, cols, perPage, WEIGHTS.tabula, sectionBreak);
  const [pages, fitRef] = useFittedPages(base, menu.dishes, sectionBreak, perPage === 0,
    fitSig(C.id, "tabula", cols, perPage, sectionBreak, menu.dishes), cols);
  return (
    <div className="sheet sheet-tabula" data-client={C.id} data-screen-label="Menu Tabula" ref={fitRef}>
      {pages.map((pg, pi) => (
        <div className={"page-A4 tabula-page" + (pi === 0 ? "" : " tabula-page-cont")} key={pi}>
          <div className="tab-head">
            <div className="tab-wm"><Brand client={C} className="brand-sm" /></div>
            <div className="tab-meta">
              <span>— menu {menu.category} —</span>
              <span>{formatDate(menu.date)}</span>
            </div>
          </div>

          {pi === 0 ? (
            <div className="tab-title">
              <h1 className="tab-name">{menu.name || "—"}</h1>
              <div className="tab-rule"></div>
              {coast && <CoastWave className="tab-wave" />}
              <div className="tab-stats">
                <span>{portate} {isPriceList(menu) ? "voci" : "portate"}</span>
                {menu.price ? <><span className="dot-sep">·</span><span>{formatPrice(menu.price)}</span></> : null}
                {!isPriceList(menu) && <><span className="dot-sep">·</span><span>{menu.seats} posti</span></>}
              </div>
            </div>
          ) : (
            <div className="tab-title-cont">
              <span className="tab-name-cont">{menu.name || "—"}</span>
              <span className="tab-folio-cont">{folio(pi + 1, pages.length)} / {folio(pages.length, pages.length)}</span>
            </div>
          )}

          <div className="tab-dishes" data-fitbox style={colStyle(cols)}>
            {contSectionOf(menu.dishes, pg.start) &&
              <SectionHead title={contSectionOf(menu.dishes, pg.start) + " (segue)"} variant="t" />}
            {pg.items.map((d, idx) => {
              const i = pg.start + idx;
              return (
                <React.Fragment key={i}>
                  {startsSection(menu.dishes, i) && <SectionHead title={d.section} variant="t" />}
                  <div className="tab-dish" data-di={i}>
                    <h3 className="tab-dish-name">
                      {d.name || <span className="placeholder-m">Nome del piatto</span>}
                      <DishPrice value={d.price} />
                      <AllergensInline list={d.allergens} />
                    </h3>
                    {d.desc && <div className="tab-dish-desc">{d.desc}</div>}
                    {idx < pg.items.length - 1 && !startsSection(menu.dishes, i + 1) && <div className="tab-sep"></div>}
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          <div className="tab-foot">
            {pi === pages.length - 1 && <AllergensLegend className="tab-legend" />}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// IV — MENU EDITORIALE  (with photos + story per dish)
// Cover + dishes in horizontal half-page slots, image left, story right
// ============================================================
function MenuEditoriale({ menu, client }) {
  const C = useClient(client);
  const portate = menu.dishes.length;
  // Voci per pagina configurabili (default 2). Le pagine si creano da sole.
  const { perPage, sectionBreak } = gridOf(menu, "editoriale");
  const pages = paginateDishes(menu.dishes, 1, perPage, WEIGHTS.editoriale, sectionBreak);

  // Find a hero image (first dish with image, otherwise null → placeholder)
  const heroSrc = menu.dishes.find(d => d.image)?.image || null;

  return (
    <div className="sheet sheet-editoriale" data-client={C.id} data-screen-label="Menu Editoriale">
      {/* COVER */}
      <div className="page-A4 ed-cover">
        <DishImage
          src={heroSrc}
          ratio="3 / 4"
          caption="Hero · foto della serata"
          className="ed-hero"
        />
        <div className="ed-cover-overlay">
          <div className="ed-cover-top">
            <span className="ed-stamp"><Brand client={C} className="brand-sm" /></span>
            <span className="ed-date">{formatDate(menu.date)}</span>
          </div>
          <div className="ed-cover-body">
            <div className="ed-cat">— menu {menu.category} —</div>
            <h1 className="ed-name">{menu.name || "—"}</h1>
            <div className="ed-cover-stats">
              <span>{portate} {isPriceList(menu) ? "voci" : "portate"}</span>
              {menu.price ? <><span className="dot-sep">·</span><span>{formatPrice(menu.price)}</span></> : null}
            </div>
            {menu.chefNote && <p className="ed-cover-note">«&nbsp;{menu.chefNote}&nbsp;»</p>}
          </div>
          <div className="ed-cover-foot">
            <span>— {menu.chef}, {C.role}</span>
            <span>{bookingLine(C, menu)}</span>
          </div>
        </div>
      </div>

      {/* INNER PAGES — 2 dishes per page */}
      {pages.map((group, pIdx) => (
        <div className="page-A4 ed-page" key={pIdx}>
          <div className="ed-page-head">
            <span className="ed-page-wm"><Brand client={C} className="brand-sm" /></span>
            <span className="ed-page-name">{menu.name} · {portate} {isPriceList(menu) ? "voci" : "portate"}</span>
            <span className="ed-page-folio">{folio(pIdx + 2, pages.length + 1)}</span>
          </div>

          <div className="ed-page-body">
            {group.items.map((d, idx) => {
              const i = group.start + idx;
              return (
                <React.Fragment key={i}>
                {startsSection(menu.dishes, i) && <SectionHead title={d.section} variant="ed" />}
                <article className="ed-dish">
                  <DishImage
                    src={d.image}
                    ratio="4 / 5"
                    caption={`Foto · ${d.name || "piatto " + courseNumber(i)}`}
                    className="ed-dish-img"
                  />
                  <div className="ed-dish-text">
                    <div className="ed-dish-num">{courseNumber(i)}</div>
                    <h3 className="ed-dish-name">
                      {d.name || <span className="placeholder-m">Nome del piatto</span>}
                      <DishPrice value={d.price} />
                    </h3>
                    {d.desc && <p className="ed-dish-desc">{d.desc}</p>}
                    {d.story && (
                      <>
                        <div className="ed-story-rule"></div>
                        <p className="ed-dish-story">{d.story}</p>
                      </>
                    )}
                    {d.allergens && d.allergens.length > 0 && (
                      <div className="ed-dish-allergens">
                        <span className="ed-allg-label">Allergeni</span>
                        <span className="ed-allg-list">{[...d.allergens].sort((a,b)=>a-b).join(" · ")}</span>
                      </div>
                    )}
                  </div>
                </article>
                </React.Fragment>
              );
            })}
          </div>

          {pIdx === pages.length - 1 && (
            <div className="ed-page-foot">
              <AllergensLegend />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// V — MENU DIARIO  (narrative without photos)
// Cover + journal-style entries with story per dish
// ============================================================
function MenuDiario({ menu, client }) {
  const C = useClient(client);
  const portate = menu.dishes.length;
  // Voci per pagina configurabili (default 3). Le pagine si creano da sole.
  const { perPage, sectionBreak } = gridOf(menu, "diario");
  const base = paginateDishes(menu.dishes, 1, perPage, WEIGHTS.diario, sectionBreak);
  const [pages, fitRef] = useFittedPages(base, menu.dishes, sectionBreak, perPage === 0,
    fitSig(C.id, "diario", 1, perPage, sectionBreak, menu.dishes), 1);

  return (
    <div className="sheet sheet-diario" data-client={C.id} data-screen-label="Menu Diario" ref={fitRef}>
      {/* COVER */}
      <div className="page-A4 dr-cover">
        <div className="dr-top">
          <span className="dr-stamp">— {C.diaryTitle} —</span>
          <span className="dr-date">{formatDate(menu.date)}</span>
        </div>

        <div className="dr-cover-body">
          <div className="dr-cover-wm"><Brand client={C} /></div>
          <div className="dr-cat">menu {menu.category}</div>
          <h1 className="dr-name">«&nbsp;{menu.name || "—"}&nbsp;»</h1>
          {menu.chefNote && (
            <p className="dr-note">{menu.chefNote}</p>
          )}
          <div className="dr-rule"></div>
          <div className="dr-cover-stats">
            <div className="dr-stat"><span className="dr-stat-lbl">{isPriceList(menu) ? "voci" : "portate"}</span><span className="dr-stat-val">{portate}</span></div>
            <div className="dr-stat"><span className="dr-stat-lbl">prezzo</span><span className="dr-stat-val">{formatPrice(menu.price)}</span></div>
            {!isPriceList(menu) && <div className="dr-stat"><span className="dr-stat-lbl">coperti</span><span className="dr-stat-val">{String(menu.seats).padStart(2,"0")}</span></div>}
          </div>
        </div>

        <div className="dr-cover-foot">
          <span className="dr-chef">scritto da {menu.chef}, {C.role}</span>
        </div>
      </div>

      {/* INNER PAGES */}
      {pages.map((group, pIdx) => (
        <div className="page-A4 dr-page" key={pIdx}>
          <div className="dr-page-head">
            <span className="dr-page-wm"><Brand client={C} className="brand-sm" /></span>
            <span className="dr-page-meta">{menu.name} · {portate} {isPriceList(menu) ? "voci" : "portate"}</span>
            <span className="dr-page-folio">{folio(pIdx + 2, pages.length + 1)}</span>
          </div>

          <div className="dr-entries" data-fitbox>
            {contSectionOf(menu.dishes, group.start) &&
              <SectionHead title={contSectionOf(menu.dishes, group.start) + " (segue)"} variant="dr" />}
            {group.items.map((d, idx) => {
              const i = group.start + idx;
              return (
                <React.Fragment key={i}>
                {startsSection(menu.dishes, i) && <SectionHead title={d.section} variant="dr" />}
                <article className="dr-entry" data-di={i}>
                  <div className="dr-entry-num">{courseNumber(i)}</div>
                  <div className="dr-entry-body">
                    <h3 className="dr-entry-name">
                      {d.name || <span className="placeholder-m">Nome del piatto</span>}
                      <DishPrice value={d.price} />
                      <AllergensInline list={d.allergens} />
                    </h3>
                    {d.desc && <p className="dr-entry-desc">{d.desc}</p>}
                    {d.story && <p className="dr-entry-story">{d.story}</p>}
                  </div>
                </article>
                </React.Fragment>
              );
            })}
          </div>

          {pIdx === pages.length - 1 && (
            <div className="dr-page-foot">
              <AllergensLegend />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// VI — MENU LISTINO  (denso, multi-colonna, multi-pagina · stile listino-bar)
// Colonne (fino a 6) via column-count; le pagine A4 si creano da sole
// impacchettando le sezioni per "peso" o per "voci per pagina". Stile menù PDF.
// ============================================================
function MenuListino({ menu, client }) {
  const C = useClient(client);
  const coast = C.decor === "coast";
  const { cols, perPage, sectionBreak } = gridOf(menu, "listino");

  // Impaginazione per indice (come le altre varianti) → in Auto le pagine
  // vengono poi riempite fino al bordo dalla misurazione reale.
  const LST_W = { perCol: 18, of: d => 1 + (((d.desc || "").length > 44) ? 0.6 : 0) };
  const base = paginateDishes(menu.dishes, cols, perPage, LST_W, sectionBreak);
  const [pages, fitRef] = useFittedPages(base, menu.dishes, sectionBreak, perPage === 0,
    fitSig(C.id, "listino", cols, perPage, sectionBreak, menu.dishes), cols);

  // Le voci di una pagina, raggruppate per sezione ("(segue)" se la sezione
  // arriva dalla pagina precedente).
  const groupsFor = (pg) => {
    const out = [];
    pg.items.forEach((d, k) => {
      const sec = d.section || "";
      let g = out[out.length - 1];
      if (!g || g.section !== sec){
        out.push({ section: sec, items: [d], off: k, cont: k === 0 && !!contSectionOf(menu.dishes, pg.start) });
      } else g.items.push(d);
    });
    return out;
  };

  return (
    <div className="sheet sheet-listino" data-client={C.id} data-screen-label="Menu Listino" ref={fitRef}>
      {pages.map((pg, pi) => (
        <div className="page-A4 lst-page" key={pi}>
          <div className="lst-head">
            <span className="lst-wm"><Brand client={C} className="brand-sm" /></span>
            <span className="lst-meta">
              <span className="lst-title">{menu.name || "—"}</span>
              {pages.length > 1 && <span className="lst-folio">{folio(pi + 1, pages.length)} / {folio(pages.length, pages.length)}</span>}
            </span>
          </div>

          {pi === 0 && coast && <CoastWave className="lst-wave" />}

          <div className="lst-body" data-fitbox style={{ columnCount: cols }}>
            {groupsFor(pg).map((g, gi) => (
              <section className="lst-group" key={gi}>
                {g.section && <div className="lst-sec" data-fithead>{g.section}{g.cont ? " (segue)" : ""}</div>}
                {g.items.map((d, di) => (
                  <div className="lst-item" key={di} data-di={pg.start + g.off + di}>
                    <div className="lst-item-head">
                      <span className="lst-item-name">
                        {d.name || "—"}
                        {d.allergens && d.allergens.length > 0 &&
                          <span className="lst-allg"> ({[...d.allergens].sort((a, b) => a - b).join("·")})</span>}
                      </span>
                      <DishPrice value={d.price} />
                    </div>
                    {d.desc && <div className="lst-item-desc">{d.desc}</div>}
                  </div>
                ))}
              </section>
            ))}
          </div>

          {pi === pages.length - 1 && (
            <div className="lst-foot">
              <AllergensLegend className="lst-legend" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ---- Helpers ----
function romanize(n){
  const map = [
    [1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],
    [50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]
  ];
  let r = "";
  for (const [v, s] of map){ while(n >= v){ r += s; n -= v;} }
  return r;
}

Object.assign(window, {
  MenuClassico, MenuContemporaneo, MenuTabula, MenuEditoriale, MenuDiario, MenuListino,
  Brand, DishPrice, CoastWave, Citrus, Draggable, DragCtx,
  formatDate, formatPrice, ALLERGENI,
  GRID_DEFAULTS, gridOf, paginateDishes, WEIGHTS, colStyle, sectionGroups,
  FREE_BLOCKS, tagFreeBlocks, applyFreeLayout, installFreeDrag
});
