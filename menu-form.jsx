// ============================================================
// Carta · Generatore di menu — Form / Control panel
// v 1.2 — variant toggle a 5, campo story, upload foto
// ============================================================

const VARIANTS = [
  { id: "classico",       num: "I",   name: "Classico",       desc: "centrato, simmetrico",          tags: "essenziale · colonne + pagine" },
  { id: "contemporaneo",  num: "II",  name: "Contemporaneo",  desc: "editoriale, asimmetrico",       tags: "essenziale · colonne + pagine" },
  { id: "tabula",         num: "III", name: "Tabula",         desc: "ultra-minimale",                tags: "essenziale · colonne + pagine" },
  { id: "editoriale",     num: "IV",  name: "Editoriale",     desc: "con foto e racconto",           tags: "racconto · voci/pagina" },
  { id: "diario",         num: "V",   name: "Diario",         desc: "racconto, senza foto",          tags: "racconto · voci/pagina" },
  { id: "listino",        num: "VI",  name: "Listino",        desc: "denso, multi-colonna",          tags: "bar · colonne + pagine" }
];

const NARRATIVE_VARIANTS = new Set(["editoriale", "diario"]);
const IMAGE_VARIANTS = new Set(["editoriale"]);

function Form({ menu, setMenu, variant, setVariant, client, setClient, onLoadPreset, onReset, onPrint, onExport }) {

  const clientList = (typeof CLIENT_ORDER !== "undefined" ? CLIENT_ORDER : Object.keys(CLIENTS || {}))
    .map(id => CLIENTS[id]).filter(Boolean);
  const C = client || (typeof getClient === "function" ? getClient(DEFAULT_CLIENT) : null);
  const presets = (C && C.presets) || [];
  const sectionNames = [...new Set((menu.dishes || []).map(d => d.section).filter(Boolean))];
  // stringa (non array) → le schede memoizzate non si ri-renderizzano inutilmente
  const sectionsKey = sectionNames.join("\u0001");
  const matches = (i) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const d = menu.dishes[i] || {};
    return (d.name || "").toLowerCase().includes(q) || (d.desc || "").toLowerCase().includes(q);
  };

  const updateField = (field, value) => {
    setMenu(prev => ({ ...prev, [field]: value }));
  };

  // ---- Impaginazione per-variante (colonne + voci per pagina) ----
  const grid = (typeof gridOf === "function")
    ? gridOf(menu, variant)
    : { cols: 1, perPage: 0, maxCols: 1 };
  const gridDef = ((typeof GRID_DEFAULTS !== "undefined" && GRID_DEFAULTS) || {})[variant] || { maxCols: 1, perPage: 0 };
  // valore di partenza quando si passa da "Auto" a un numero fisso
  const PP_START = { classico: 6, contemporaneo: 7, tabula: 8, editoriale: 2, diario: 3, listino: 12 };
  const setGrid = (patch) => setMenu(prev => {
    const g = { ...(prev.grid || {}) };
    g[variant] = { ...(g[variant] || {}), ...patch };
    return { ...prev, grid: g };
  });
  const stepPerPage = (delta) => {
    if (grid.perPage === 0) { setGrid({ perPage: PP_START[variant] || 6 }); return; }
    setGrid({ perPage: Math.max(1, grid.perPage + delta) });
  };
  const variantName = (VARIANTS.find(v => v.id === variant) || {}).name || "";

  const updateDish = React.useCallback((i, field, value) => {
    setMenu(prev => {
      const dishes = [...prev.dishes];
      dishes[i] = { ...dishes[i], [field]: value };
      return { ...prev, dishes };
    });
  }, [setMenu]);

  const toggleAllergen = React.useCallback((i, n) => {
    setMenu(prev => {
      const dishes = [...prev.dishes];
      const current = dishes[i].allergens || [];
      const next = current.includes(n)
        ? current.filter(x => x !== n)
        : [...current, n].sort((a,b)=>a-b);
      dishes[i] = { ...dishes[i], allergens: next };
      return { ...prev, dishes };
    });
  }, [setMenu]);

  const addDish = () => {
    setMenu(prev => ({
      ...prev,
      dishes: [...prev.dishes, { name: "", section: "", desc: "", story: "", image: null, price: null, allergens: [] }]
    }));
  };

  const removeDish = React.useCallback((i) => {
    setMenu(prev => ({
      ...prev,
      dishes: prev.dishes.filter((_, idx) => idx !== i)
    }));
  }, [setMenu]);

  const moveDish = React.useCallback((i, dir) => {
    setMenu(prev => {
      const dishes = [...prev.dishes];
      const j = i + dir;
      if (j < 0 || j >= dishes.length) return prev;
      [dishes[i], dishes[j]] = [dishes[j], dishes[i]];
      return { ...prev, dishes };
    });
  }, [setMenu]);

  // Gruppi di sezioni consecutive (unità per lo spostamento in blocco)
  const groupsOf = (dishes) => {
    const groups = [];
    (dishes || []).forEach((d, i) => {
      const sec = d.section || "";
      let g = groups[groups.length - 1];
      if (!g || g.sec !== sec) { g = { sec, idxs: [] }; groups.push(g); }
      g.idxs.push(i);
    });
    return groups;
  };
  const sectionGroupsUI = groupsOf(menu.dishes);

  // Macroaree (livello sopra le sezioni), con dentro le loro sezioni
  const areasUI = (() => {
    const out = [];
    sectionGroupsUI.forEach((g, gi) => {
      const a = (menu.dishes[g.idxs[0]] || {}).area || "";
      let cur = out[out.length - 1];
      if (!cur || cur.area !== a){ cur = { area: a, secs: [] }; out.push(cur); }
      cur.secs.push({ ...g, gi });
    });
    return out;
  })();
  const areaNames = [...new Set(menu.dishes.map(d => d.area || "").filter(Boolean))];

  // Rinomina una macroarea (aggiorna tutte le sue voci + le impostazioni)
  const renameArea = React.useCallback((oldName, newName) => {
    const from = oldName || "", to = (newName || "").trim();
    if (from === to) return;
    setMenu(prev => {
      const dishes = prev.dishes.map(d => ((d.area || "") === from ? { ...d, area: to } : d));
      const meta = { ...(prev.areaMeta || {}) };
      if (meta[from]){ if (to) meta[to] = meta[from]; delete meta[from]; }
      return { ...prev, dishes, areaMeta: meta };
    });
  }, [setMenu]);

  // Impaginazione indipendente della macroarea
  const setAreaMeta = React.useCallback((name, patch) => {
    setMenu(prev => {
      const meta = { ...(prev.areaMeta || {}) };
      const cur = { ...(meta[name || ""] || {}), ...patch };
      if (!cur.cols && !cur.samePage && (cur.perPage === undefined || cur.perPage === null)) delete meta[name || ""];
      else meta[name || ""] = cur;
      return { ...prev, areaMeta: meta };
    });
  }, [setMenu]);

  // Sposta un'intera macroarea (con tutte le sue sezioni e voci)
  const moveArea = React.useCallback((ai, dir) => {
    setMenu(prev => {
      const groups = [];
      prev.dishes.forEach((d, i) => {
        const a = d.area || "";
        let g = groups[groups.length - 1];
        if (!g || g.a !== a){ g = { a, idxs: [] }; groups.push(g); }
        g.idxs.push(i);
      });
      const j = ai + dir;
      if (j < 0 || j >= groups.length) return prev;
      [groups[ai], groups[j]] = [groups[j], groups[ai]];
      return { ...prev, dishes: groups.flatMap(g => g.idxs.map(k => prev.dishes[k])) };
    });
  }, [setMenu]);

  // Sposta un'intera sezione in un'altra macroarea
  const setSectionArea = React.useCallback((secName, areaName) => {
    setMenu(prev => ({
      ...prev,
      dishes: prev.dishes.map(d => ((d.section || "") === (secName || "") ? { ...d, area: areaName } : d))
    }));
  }, [setMenu]);

  // Nuova macroarea (con una sezione vuota dentro)
  const addArea = () => setMenu(prev => {
    const n = "Nuova area " + (new Set(prev.dishes.map(d => d.area || "").filter(Boolean)).size + 1);
    return { ...prev, dishes: [...prev.dishes,
      { name: "", area: n, section: "Nuova sezione", desc: "", story: "", image: null, price: null, takeaway: false, allergens: [] }] };
  });

  // Sposta un'intera sezione (con tutti i suoi piatti) su/giù, scambiandola
  // con la sezione adiacente.
  const moveSection = (gi, dir) => {
    setMenu(prev => {
      const groups = groupsOf(prev.dishes);
      const j = gi + dir;
      if (j < 0 || j >= groups.length) return prev;
      [groups[gi], groups[j]] = [groups[j], groups[gi]];
      const dishes = groups.flatMap(g => g.idxs.map(k => prev.dishes[k]));
      return { ...prev, dishes };
    });
  };

  // Rinomina una sezione: aggiorna tutti i suoi piatti e sposta le impostazioni.
  const renameSection = React.useCallback((oldName, newName) => {
    const from = oldName || "", to = (newName || "").trim();
    if (from === to) return;
    setMenu(prev => {
      const dishes = prev.dishes.map(d => ((d.section || "") === from ? { ...d, section: to } : d));
      const meta = { ...(prev.sectionMeta || {}) };
      if (meta[from]){ if (to) meta[to] = meta[from]; delete meta[from]; }
      return { ...prev, dishes, sectionMeta: meta };
    });
  }, [setMenu]);

  // Separatore arancione / sezione asporto
  const toggleSectionFlag = React.useCallback((name, key) => {
    setMenu(prev => {
      const meta = { ...(prev.sectionMeta || {}) };
      const cur = { ...(meta[name || ""] || {}) };
      cur[key] = !cur[key];
      if (!cur.divider && !cur.takeaway) delete meta[name || ""]; else meta[name || ""] = cur;
      return { ...prev, sectionMeta: meta };
    });
  }, [setMenu]);

  // Aggiunge una voce in fondo a QUESTA sezione (non in fondo al menù)
  const addDishToSection = React.useCallback((name, lastIdx) => {
    setMenu(prev => {
      const dishes = [...prev.dishes];
      dishes.splice(lastIdx + 1, 0,
        { name: "", section: name || "", desc: "", story: "", image: null, price: null, takeaway: false, allergens: [] });
      return { ...prev, dishes };
    });
  }, [setMenu]);

  const duplicateDish = React.useCallback((i) => {
    setMenu(prev => {
      const dishes = [...prev.dishes];
      dishes.splice(i + 1, 0, { ...dishes[i] });
      return { ...prev, dishes };
    });
  }, [setMenu]);

  // Nuova sezione vuota in fondo
  const addSection = () => setMenu(prev => ({
    ...prev,
    dishes: [...prev.dishes,
      { name: "", section: "Nuova sezione", desc: "", story: "", image: null, price: null, takeaway: false, allergens: [] }]
  }));

  // ---- Stato dell'editor: vista, ricerca, selezione, richiusure ----
  const [compact, setCompact] = useState(true);
  const [openDish, setOpenDish] = useState(null);
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(() => new Set());
  const [closedSecs, setClosedSecs] = useState(() => new Set());
  const [closedAreas, setClosedAreas] = useState(() => new Set());
  const [showIndex, setShowIndex] = useState(false);
  const dragIdx = useRef(null);

  const toggleIn = (setter) => (key) => setter(prev => {
    const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n;
  });
  const toggleSec = toggleIn(setClosedSecs);
  const toggleArea = toggleIn(setClosedAreas);
  const clearSel = () => setSel(new Set());
  const toggleSel = (i) => setSel(prev => {
    const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n;
  });

  // Estremi del blocco di voci consecutive di una sezione
  const runOf = (dishes, sec) => {
    const t = sec || "";
    const first = dishes.findIndex(d => (d.section || "") === t);
    if (first < 0) return null;
    let end = first;
    while (end + 1 < dishes.length && (dishes[end + 1].section || "") === t) end++;
    return { first, end };
  };

  // SPOSTA davvero il piatto nella sezione scelta (in coda a quella sezione,
  // ereditandone la macroarea). Niente sezioni doppie o spezzate.
  const moveDishToSection = React.useCallback((i, sec) => {
    setMenu(prev => {
      const dishes = [...prev.dishes];
      const [d] = dishes.splice(i, 1);
      const r = runOf(dishes, sec);
      if (r){
        dishes.splice(r.end + 1, 0, { ...d, section: sec, area: dishes[r.first].area || "" });
      } else {
        dishes.push({ ...d, section: sec });        // sezione nuova → in fondo
      }
      return { ...prev, dishes };
    });
    clearSel(); setOpenDish(null);
  }, [setMenu]);

  // In cima / in fondo alla propria sezione (1 clic invece di N)
  const moveDishEdge = React.useCallback((i, where) => {
    setMenu(prev => {
      const dishes = [...prev.dishes];
      const sec = dishes[i].section || "";
      let a = i; while (a - 1 >= 0 && (dishes[a - 1].section || "") === sec) a--;
      let b = i; while (b + 1 < dishes.length && (dishes[b + 1].section || "") === sec) b++;
      const [d] = dishes.splice(i, 1);
      dishes.splice(where === "top" ? a : b, 0, d);
      return { ...prev, dishes };
    });
    setOpenDish(null);
  }, [setMenu]);

  // Trascinamento: la voce prende posto (e sezione/macroarea) di quella su cui la lasci
  const moveDishTo = React.useCallback((from, to) => {
    setMenu(prev => {
      if (from === to) return prev;
      const dishes = [...prev.dishes];
      const t = dishes[to];
      const [d] = dishes.splice(from, 1);
      dishes.splice(from < to ? to - 1 : to, 0,
        { ...d, section: t.section || "", area: t.area || "" });
      return { ...prev, dishes };
    });
    clearSel(); setOpenDish(null);
  }, [setMenu]);

  // Trascinamento a eventi puntatore: funziona con mouse E con il dito,
  // e non ri-renderizza la lista mentre si trascina (evidenzia via DOM).
  const startDrag = React.useCallback((i, e) => {
    if (e.button != null && e.button !== 0) return;
    e.preventDefault();
    dragIdx.current = i;
    let over = null, overEl = null;
    document.body.classList.add("dish-dragging");
    const paint = (el, cls) => {
      if (overEl) overEl.classList.remove("drop-row", "drop-sec");
      overEl = el; if (el) el.classList.add(cls);
    };
    const onMove = (ev) => {
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      const row = el && el.closest("[data-dish-idx]");
      const sec = el && el.closest("[data-sec-drop]");
      if (row){ over = { type: "row", i: +row.getAttribute("data-dish-idx") }; paint(row, "drop-row"); }
      else if (sec){ over = { type: "sec", name: sec.getAttribute("data-sec-drop") }; paint(sec, "drop-sec"); }
      else { over = null; paint(null); }
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.body.classList.remove("dish-dragging");
      paint(null);
      const from = dragIdx.current;
      dragIdx.current = null;
      if (from == null || !over) return;
      if (over.type === "row" && over.i !== from) moveDishTo(from, over.i);
      else if (over.type === "sec") moveDishToSection(from, over.name);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [moveDishTo, moveDishToSection]);

  // ---- Azioni sulla selezione multipla ----
  const moveSelToSection = React.useCallback((sec) => {
    setMenu(prev => {
      const picked = [...sel].sort((a, b) => a - b).map(k => prev.dishes[k]).filter(Boolean);
      if (!picked.length) return prev;
      const rest = prev.dishes.filter((_, k) => !sel.has(k));
      const r = runOf(rest, sec);
      const area = r ? (rest[r.first].area || "") : "";
      const moved = picked.map(d => ({ ...d, section: sec, area }));
      if (r) rest.splice(r.end + 1, 0, ...moved); else rest.push(...moved);
      return { ...prev, dishes: rest };
    });
    clearSel();
  }, [setMenu, sel]);

  const removeSel = React.useCallback(() => {
    setMenu(prev => ({ ...prev, dishes: prev.dishes.filter((_, k) => !sel.has(k)) }));
    clearSel();
  }, [setMenu, sel]);

  const duplicateSel = React.useCallback(() => {
    setMenu(prev => {
      const out = [];
      prev.dishes.forEach((d, k) => { out.push(d); if (sel.has(k)) out.push({ ...d }); });
      return { ...prev, dishes: out };
    });
    clearSel();
  }, [setMenu, sel]);

  const handleImageUpload = React.useCallback((i, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      // Downscale via canvas to keep localStorage reasonable
      const img = new Image();
      img.onload = () => {
        const maxW = 900;
        const scale = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        updateDish(i, "image", dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, [updateDish]);

  const removeImage = React.useCallback((i) => updateDish(i, "image", null), [updateDish]);

  const isNarrative = NARRATIVE_VARIANTS.has(variant);
  const isImage = IMAGE_VARIANTS.has(variant);

  return (
    <aside className="form-panel">
      <div className="form-head">
        <div className="form-brandline">
          {C && C.logo && C.logo.type === "image"
            ? <img className="form-logo" src={C.logo.src} alt={C.name} />
            : null}
          <div className="form-brand">{C ? C.name : "Carta"}</div>
        </div>
        <div className="form-title">Generatore Menù</div>
        <div className="form-sub">Consulenza · {C ? C.kind : "template interno"}</div>
      </div>

      <div className="form-section">
        <div className="section-label">Cliente · {clientList.length}</div>
        <div className="client-list">
          {clientList.map(cl => (
            <button
              key={cl.id}
              className={"client-row " + (C && C.id === cl.id ? "active" : "")}
              onClick={() => setClient && setClient(cl.id)}>
              <span className="client-mark">
                {cl.logo && cl.logo.type === "image"
                  ? <img src={cl.logo.src} alt="" />
                  : <span className="client-initial">{cl.name.slice(0,1)}</span>}
              </span>
              <span className="client-meta">
                <span className="client-name">{cl.name}</span>
                <span className="client-kind">{cl.kind} · {cl.place}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="section-label">Variante grafica · {VARIANTS.length}</div>
        <div className="variant-list">
          {VARIANTS.map(v => (
            <button
              key={v.id}
              className={"v-row " + (variant === v.id ? "active" : "")}
              onClick={() => setVariant(v.id)}>
              <span className="v-num">{v.num}</span>
              <span className="v-meta">
                <span className="v-name">{v.name}</span>
                <span className="v-desc">{v.desc}</span>
              </span>
              <span className="v-tag">{v.tags}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="section-label">Impaginazione · {variantName}</div>

        {gridDef.maxCols > 1 && (
          <>
            <div className="pp-sublabel">Colonne</div>
            <div className="cols-pick">
              {Array.from({ length: gridDef.maxCols }, (_, k) => k + 1).map(n => (
                <button key={n} type="button"
                  className={"cols-btn " + (grid.cols === n ? "active" : "")}
                  onClick={() => setGrid({ cols: n })}>{n}<span>col</span></button>
              ))}
            </div>
          </>
        )}

        <div className="pp-sublabel">Voci per pagina</div>
        <div className="pp-pick">
          <button type="button"
            className={"pp-auto " + (grid.perPage === 0 ? "active" : "")}
            onClick={() => setGrid({ perPage: 0 })}>Auto</button>
          <div className="pp-step">
            <button type="button" aria-label="Meno voci per pagina"
              onClick={() => stepPerPage(-1)}
              disabled={grid.perPage !== 0 && grid.perPage <= 1}>−</button>
            <span className="pp-val">{grid.perPage === 0 ? "auto" : grid.perPage}</span>
            <button type="button" aria-label="Più voci per pagina"
              onClick={() => stepPerPage(+1)}>+</button>
          </div>
        </div>

        <div className="pp-sublabel">Sezioni</div>
        <button type="button"
          className={"section-break-toggle " + (grid.sectionBreak ? "active" : "")}
          onClick={() => setGrid({ sectionBreak: !grid.sectionBreak })}
          aria-pressed={!!grid.sectionBreak}>
          <span className="sbt-check">{grid.sectionBreak ? "✓" : ""}</span>
          <span className="sbt-label">Ogni sezione su una pagina nuova</span>
        </button>

        <p className="cols-hint">
          {gridDef.maxCols > 1
            ? "Più colonne = più compatto. "
            : ""}
          Con <strong>Auto</strong> le pagine A4 si creano da sole in base al contenuto — nessun limite.
          Imposta un numero per fissare quante voci stanno in ogni pagina.
          {" "}Con <strong>«sezione su pagina nuova»</strong> ogni sezione ricomincia da un foglio pulito.
        </p>
      </div>

      <div className="form-section">
        <div className="section-label">Carica esempio</div>
        <div className="preset-row">
          {presets.map(p => (
            <button key={p.key} className="preset-btn" onClick={() => onLoadPreset(p.key)}>
              <span className="p-num">{p.num}</span><span className="p-name">{p.name}</span><span className="p-tag">{p.tag}</span>
            </button>
          ))}
        </div>
        <button className="reset-btn" onClick={onReset}>↺ Nuovo menù vuoto</button>
      </div>

      <div className="form-section">
        <div className="section-label">Identificazione</div>
        <div className="field-grid">
          <label className="field field-wide">
            <span className="field-label">Nome del menù</span>
            <input
              type="text"
              value={menu.name}
              onChange={e => updateField("name", e.target.value)}
              placeholder="Radici, Sakura, Terra e Mare…" />
          </label>
          <label className="field">
            <span className="field-label">Categoria</span>
            <select
              value={menu.category}
              onChange={e => updateField("category", e.target.value)}>
              <option value="tematico">tematico</option>
              <option value="fusion">fusion</option>
              <option value="monoprodotto">monoprodotto</option>
              <option value="stagionale">stagionale</option>
              <option value="signature">signature</option>
              <option value="cocktail">cocktail</option>
              <option value="food">food</option>
            </select>
          </label>
          <label className="field">
            <span className="field-label">Prezzo fisso (€)</span>
            <input
              type="number"
              value={menu.price ?? ""}
              onChange={e => updateField("price", e.target.value === "" ? null : Number(e.target.value))}
              placeholder="opzionale" />
          </label>
          <label className="field">
            <span className="field-label">Data serata</span>
            <input
              type="date"
              value={menu.date}
              onChange={e => updateField("date", e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">Coperti</span>
            <input
              type="number"
              value={menu.seats}
              min="1" max="20"
              onChange={e => updateField("seats", Number(e.target.value))} />
          </label>
          <label className="field field-wide">
            <span className="field-label">Chef-patron</span>
            <input
              type="text"
              value={menu.chef}
              onChange={e => updateField("chef", e.target.value)} />
          </label>
          <label className="field field-wide">
            <span className="field-label">Nota dello chef (opzionale)</span>
            <textarea
              value={menu.chefNote}
              onChange={e => updateField("chefNote", e.target.value)}
              rows="2"
              placeholder="Una frase di introduzione al menu…" />
          </label>
        </div>
      </div>

      <div className="form-section">
        <div className="section-label-row">
          <div className="section-label">Portate · {menu.dishes.length}</div>
          <span className="mini-btn-row">
            <button className="mini-btn" onClick={addSection}>+ sezione</button>
            <button className="mini-btn" onClick={addArea}>+ macroarea</button>
          </span>
        </div>

        {/* barra strumenti: ricerca, vista, indice */}
        <div className="ed-tools">
          <input className="ed-search" type="search" value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cerca una voce…" aria-label="Cerca una voce" />
          <button className={"ed-tool " + (compact ? "on" : "")}
            onClick={() => setCompact(c => !c)}
            title="Vista compatta: una riga per voce">☰</button>
          <button className={"ed-tool " + (showIndex ? "on" : "")}
            onClick={() => setShowIndex(v => !v)}
            title="Indice della struttura">⁝≡</button>
          <button className="ed-tool" title="Richiudi tutte le sezioni"
            onClick={() => setClosedSecs(new Set(sectionGroupsUI.map(g => g.sec)))}>⊟</button>
          <button className="ed-tool" title="Apri tutte le sezioni"
            onClick={() => { setClosedSecs(new Set()); setClosedAreas(new Set()); }}>⊞</button>
        </div>

        {/* indice: tutta la struttura in poche righe */}
        {showIndex && (
          <div className="ed-index">
            {areasUI.map((A, ai) => (
              <div key={"i" + ai}>
                <div className="ed-index-area">{ai + 1} · {A.area || "senza macroarea"}</div>
                {A.secs.map((g, si) => (
                  <button key={si} className="ed-index-sec"
                    onClick={() => {
                      setShowIndex(false);
                      setClosedSecs(prev => { const n = new Set(prev); n.delete(g.sec); return n; });
                      setTimeout(() => {
                        const el = document.getElementById("sec-" + encodeURIComponent(g.sec));
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 40);
                    }}>
                    <span>{ai + 1}.{si + 1}</span> {g.sec || "senza sezione"}
                    <em>{g.idxs.length}</em>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* azioni sulla selezione multipla */}
        {sel.size > 0 && (
          <div className="ed-selbar">
            <strong>{sel.size} selezionate</strong>
            <select value="" onChange={e => { if (e.target.value) moveSelToSection(e.target.value); }}>
              <option value="">sposta in…</option>
              {sectionNames.map(sn => <option key={sn} value={sn}>{sn}</option>)}
            </select>
            <button onClick={duplicateSel} title="Duplica le voci selezionate">⧉</button>
            <button onClick={removeSel} className="sel-x" title="Elimina le voci selezionate">×</button>
            <button onClick={clearSel} title="Annulla la selezione">annulla</button>
          </div>
        )}

        <div className="form-hint">
          {isNarrative && <span className="hint-pill">Racconto visibile</span>}
          {isImage && <span className="hint-pill">Foto visibili</span>}
          {!isNarrative && !isImage && <span className="hint-pill hint-muted">Variante essenziale</span>}
        </div>

        <div className="dishes-form">
          {areasUI.map((A, ai) => {
            const areaHasMatch = A.secs.some(g => g.idxs.some(i => matches(i)));
            if (query && !areaHasMatch) return null;
            const aClosed = closedAreas.has(A.area);
            return (
            <React.Fragment key={"a" + ai}>
              {(A.area || areasUI.length > 1) && (
                <div className="area-wrap">
                  <button className="ed-fold" title={aClosed ? "Apri" : "Richiudi"}
                    onClick={() => toggleArea(A.area)}>{aClosed ? "▸" : "▾"}</button>
                  <AreaRow
                    area={A.area}
                    index={ai}
                    total={areasUI.length}
                    meta={(menu.areaMeta || {})[A.area || ""] || {}}
                    maxCols={((typeof GRID_DEFAULTS !== "undefined" && GRID_DEFAULTS) || {})[variant]?.maxCols || 1}
                    onRename={(v) => renameArea(A.area, v)}
                    onMeta={(patch) => setAreaMeta(A.area, patch)}
                    onMove={(d) => moveArea(ai, d)}
                  />
                </div>
              )}
              {!aClosed && A.secs.map((g, si) => {
                const idxs = query ? g.idxs.filter(matches) : g.idxs;
                if (query && !idxs.length) return null;
                const meta = (menu.sectionMeta || {})[g.sec] || {};
                const sClosed = closedSecs.has(g.sec);
                return (
                <React.Fragment key={g.gi}>
                  <div id={"sec-" + encodeURIComponent(g.sec)}
                    className={"section-move-row" + (meta.takeaway ? " sec-takeaway" : "")}
                    data-sec-drop={g.sec}>
                    {meta.divider && <span className="sec-divider-mark" aria-hidden="true"></span>}
                    <button className="ed-fold" title={sClosed ? "Apri" : "Richiudi"}
                      onClick={() => toggleSec(g.sec)}>{sClosed ? "▸" : "▾"}</button>
                    <span className="sec-num">{ai + 1}.{si + 1}</span>
                    <SectionNameInput value={g.sec} count={g.idxs.length} onCommit={(v) => renameSection(g.sec, v)} />
                    <div className="section-move-ctrls">
                      <button type="button" className={"ctrl-btn ctrl-sep " + (meta.divider ? "on" : "")}
                        onClick={() => toggleSectionFlag(g.sec, "divider")}
                        title="Separatore arancione prima di questa sezione">▬</button>
                      <button type="button" className={"ctrl-btn ctrl-take " + (meta.takeaway ? "on" : "")}
                        onClick={() => toggleSectionFlag(g.sec, "takeaway")}
                        title="Sezione da asporto">⛱</button>
                      <button type="button" className="ctrl-btn" disabled={g.gi === 0}
                        onClick={() => moveSection(g.gi, -1)} title="Sposta la sezione su">↑</button>
                      <button type="button" className="ctrl-btn" disabled={g.gi === sectionGroupsUI.length - 1}
                        onClick={() => moveSection(g.gi, 1)} title="Sposta la sezione giù">↓</button>
                      <button type="button" className="ctrl-btn ctrl-add"
                        onClick={() => { const last = g.idxs[g.idxs.length - 1];
                          addDishToSection(g.sec, last); setClosedSecs(prev => { const n = new Set(prev); n.delete(g.sec); return n; }); setOpenDish(last + 1); }}
                        title="Aggiungi una voce in questa sezione">+ piatto</button>
                    </div>
                  </div>

                  {!sClosed && areaNames.length > 0 && (
                    <div className="sec-area-pick">
                      <span>macroarea</span>
                      <select value={(menu.dishes[g.idxs[0]] || {}).area || ""}
                        onChange={e => setSectionArea(g.sec, e.target.value)}>
                        <option value="">— nessuna —</option>
                        {areaNames.map(an => <option key={an} value={an}>{an}</option>)}
                      </select>
                    </div>
                  )}

                  {!sClosed && idxs.map((i, di) => (
                    (compact && openDish !== i) ? (
                      <DishRow
                        key={i}
                        i={i}
                        num={(ai + 1) + "." + (si + 1) + "." + (di + 1)}
                        dish={menu.dishes[i]}
                        selected={sel.has(i)}
                        dragOn={!query}
                        onSelect={toggleSel}
                        onOpen={setOpenDish}
                        onMove={moveDish}
                        onEdge={moveDishEdge}
                        onDuplicate={duplicateDish}
                        onRemove={removeDish}
                        onGrip={startDrag}
                      />
                    ) : (
                      <div className="dish-open" key={i}>
                        {compact && (
                          <button className="dish-close" onClick={() => setOpenDish(null)}
                            title="Chiudi">▴ chiudi</button>
                        )}
                        <DishEditor
                          i={i}
                          dish={menu.dishes[i]}
                          total={menu.dishes.length}
                          isNarrative={isNarrative}
                          isImage={isImage}
                          onChange={updateDish}
                          onToggleAllergen={toggleAllergen}
                          onMove={moveDish}
                          onRemove={removeDish}
                          onImageUpload={handleImageUpload}
                          onImageRemove={removeImage}
                          onDuplicate={duplicateDish}
                          onSectionMove={moveDishToSection}
                          sectionsKey={sectionsKey}
                        />
                      </div>
                    )
                  ))}
                </React.Fragment>
                );
              })}
            </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="form-section">
        <div className="section-label">Esporta</div>
        <div className="export-row">
          <button className="primary-btn" onClick={onPrint}>
            <span>↗</span> Stampa / PDF
          </button>
          <button className="secondary-btn" onClick={() => onExport("json")}>JSON</button>
          <button className="secondary-btn" onClick={() => onExport("html")}>HTML</button>
        </div>
        <p className="export-note">
          <strong>Stampa A4 verticale</strong> · scegli "Salva come PDF".<br/>
          Nel dialogo: <strong>Margini → Nessuno</strong> e <strong>Scala → Predefinita (100%)</strong> per riempire il foglio.<br/>
          Il PDF è pronto per la stamperia o per Canva come template.
        </p>
      </div>

      <div className="form-foot">
        {C && C.id !== "dalentini"
          ? <a href="index.html#consulenza">← Consulenza</a>
          : <a href="Brand Guidelines.html">← Brand Guidelines</a>}
        <span>v 1.2</span>
      </div>
    </aside>
  );
}

// ============================================================
// Riga compatta di una voce — una riga sola, trascinabile.
// ============================================================
const DishRow = React.memo(function DishRow({ i, num, dish, selected, dragOn,
  onSelect, onOpen, onMove, onEdge, onDuplicate, onRemove, onGrip }){
  return (
    <div className={"dish-line" + (selected ? " on" : "")} data-dish-idx={i}>
      <input type="checkbox" checked={selected} onChange={() => onSelect(i)}
        aria-label="Seleziona la voce" />
      {dragOn && <span className="dl-grip" title="Trascina per spostare"
        onPointerDown={e => onGrip(i, e)}>⠿</span>}
      <span className="dl-num">{num}</span>
      <span className="dl-name" onClick={() => onOpen(i)} title="Apri per modificare">
        {dish.name || <em>senza nome</em>}
        {dish.takeaway && <b className="dl-take">asporto</b>}
      </span>
      {(dish.price || dish.price === 0) && <span className="dl-price">{dish.price} €</span>}
      <span className="dl-ctrls">
        <button onClick={() => onEdge(i, "top")} title="In cima alla sezione">⤒</button>
        <button onClick={() => onMove(i, -1)} title="Su">↑</button>
        <button onClick={() => onMove(i, 1)} title="Giù">↓</button>
        <button onClick={() => onEdge(i, "bottom")} title="In fondo alla sezione">⤓</button>
        <button onClick={() => onOpen(i)} title="Modifica">✎</button>
        <button onClick={() => onDuplicate(i)} title="Duplica">⧉</button>
        <button className="dl-x" onClick={() => onRemove(i)} title="Elimina">×</button>
      </span>
    </div>
  );
});

// ============================================================
// MACROAREA — separatore arancione a tutta pagina con nome proprio e
// impaginazione (colonne + voci per pagina) indipendente dalle altre.
// ============================================================
function AreaRow({ area, index, total, meta, maxCols, onRename, onMeta, onMove }){
  const [v, setV] = useState(area || "");
  const [editing, setEditing] = useState(false);
  useEffect(() => { if (!editing) setV(area || ""); }, [area, editing]);
  const pp = meta.perPage;
  const stepPP = (d) => {
    if (pp === undefined || pp === null) { onMeta({ perPage: 8 }); return; }
    if (pp === 0) { onMeta({ perPage: 1 }); return; }
    onMeta({ perPage: Math.max(1, pp + d) });
  };
  return (
    <div className="area-row">
      <div className="area-row-top">
        <span className="area-row-badge">{index + 1}</span>
        <input className="area-row-name" value={v}
          placeholder="Nome macroarea (es. Servizio al Tavolo)"
          onFocus={() => setEditing(true)}
          onChange={e => setV(e.target.value)}
          onBlur={() => { setEditing(false); onRename(v); }}
          onKeyDown={e => { if (e.key === "Enter") e.target.blur(); }} />
        <div className="section-move-ctrls">
          <button type="button" className="ctrl-btn" disabled={index === 0}
            onClick={() => onMove(-1)} title="Sposta la macroarea su">↑</button>
          <button type="button" className="ctrl-btn" disabled={index === total - 1}
            onClick={() => onMove(1)} title="Sposta la macroarea giù">↓</button>
        </div>
      </div>
      <div className="area-row-grid">
        {maxCols > 1 && (
          <span className="area-mini">
            <em>colonne</em>
            <span className="area-cols">
              {Array.from({ length: maxCols }, (_, k) => k + 1).map(n => (
                <button key={n} type="button"
                  className={(meta.cols === n ? "on" : "")}
                  onClick={() => onMeta({ cols: meta.cols === n ? 0 : n })}>{n}</button>
              ))}
            </span>
          </span>
        )}
        {index > 0 && (
          <button type="button"
            className={"area-samepage " + (meta.samePage ? "on" : "")}
            onClick={() => onMeta({ samePage: !meta.samePage })}
            aria-pressed={!!meta.samePage}
            title="Continua sul foglio della macroarea precedente invece di aprirne uno nuovo">
            {meta.samePage ? "↳ stessa pagina" : "⤓ pagina nuova"}
          </button>
        )}
        <span className="area-mini">
          <em>voci/pagina</em>
          <span className="area-pp">
            <button type="button" onClick={() => stepPP(-1)}>−</button>
            <b>{(pp === undefined || pp === null) ? "auto" : (pp === 0 ? "auto" : pp)}</b>
            <button type="button" onClick={() => stepPP(+1)}>+</button>
            <button type="button" className="area-pp-reset" title="Come lo stile"
              onClick={() => onMeta({ perPage: null, cols: 0 })}>⤺</button>
          </span>
        </span>
      </div>
    </div>
  );
}

// ============================================================
// Nome della sezione — si conferma con Invio o uscendo dal campo,
// così rinominare non spezza il raggruppamento a ogni lettera.
// ============================================================
function SectionNameInput({ value, count, onCommit }){
  const [v, setV] = useState(value || "");
  const [editing, setEditing] = useState(false);
  useEffect(() => { if (!editing) setV(value || ""); }, [value, editing]);
  return (
    <span className="section-name-wrap">
      <input
        className="section-name-input"
        value={v}
        placeholder="senza sezione"
        onFocus={() => setEditing(true)}
        onChange={e => setV(e.target.value)}
        onBlur={() => { setEditing(false); onCommit(v); }}
        onKeyDown={e => { if (e.key === "Enter"){ e.target.blur(); } }}
        title="Rinomina la sezione (vale per tutte le sue voci)" />
      <span className="section-move-count">{count}</span>
    </span>
  );
}

// ============================================================
// DishEditor — sub-component per ogni piatto
// ============================================================
const DishEditor = React.memo(function DishEditor({ i, dish, total, isNarrative, isImage, onChange, onToggleAllergen, onMove, onRemove, onImageUpload, onImageRemove, onDuplicate, onSectionMove, sectionsKey }){
  const fileRef = useRef(null);

  const openPicker = () => fileRef.current?.click();
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    onImageUpload(i, file);
    e.target.value = ""; // reset so same file can be re-picked
  };

  return (
    <div className="dish-row">
      <div className="dish-row-head">
        <div className="dish-row-num">{String(i+1).padStart(2, "0")}</div>
        <div className="dish-row-controls">
          <button className="ctrl-btn" disabled={i === 0} onClick={() => onMove(i, -1)} title="Sposta su" aria-label="Sposta la portata su">↑</button>
          <button className="ctrl-btn" disabled={i === total - 1} onClick={() => onMove(i, 1)} title="Sposta giù" aria-label="Sposta la portata giù">↓</button>
          <button className="ctrl-btn" onClick={() => onDuplicate(i)} title="Duplica questa voce" aria-label="Duplica la voce">⧉</button>
          <button className="ctrl-btn ctrl-x" disabled={total <= 1} onClick={() => onRemove(i)} title="Rimuovi portata" aria-label="Rimuovi la portata">×</button>
        </div>
      </div>

      <label className="field">
        <span className="field-label">
          Sezione
          <span className="field-flag">la voce viene spostata dentro la sezione scelta</span>
        </span>
        <select
          className="section-select"
          value={(sectionsKey || "").split("\u0001").filter(Boolean).includes(dish.section || "") ? dish.section : "__new__"}
          onChange={e => {
            if (e.target.value === "__new__"){
              const n = prompt("Nome della nuova sezione:", dish.section || "");
              if (n !== null) onSectionMove(i, n.trim());
            } else onSectionMove(i, e.target.value);
          }}>
          {(sectionsKey || "").split("\u0001").filter(Boolean).map(sn =>
            <option key={sn} value={sn}>{sn}</option>)}
          <option value="">— senza sezione —</option>
          <option value="__new__">+ nuova sezione…</option>
        </select>
      </label>

      <label className="field field-takeaway">
        <span className="field-label">Disponibile da asporto</span>
        <button type="button"
          className={"takeaway-toggle " + (dish.takeaway ? "on" : "")}
          onClick={() => onChange(i, "takeaway", !dish.takeaway)}
          aria-pressed={!!dish.takeaway}>
          <span className="tt-check">{dish.takeaway ? "✓" : ""}</span>
          <span>{dish.takeaway ? "Sì — mostra etichetta «asporto»" : "No"}</span>
        </button>
      </label>

      <label className="field">
        <span className="field-label">Nome piatto</span>
        <input
          type="text"
          value={dish.name}
          onChange={e => onChange(i, "name", e.target.value)}
          placeholder="Tartare di tonno rosso…" />
      </label>

      <label className="field field-price">
        <span className="field-label">
          Prezzo voce (€)
          <span className="field-flag">opzionale · es. menù bar</span>
        </span>
        <input
          type="number"
          step="0.5"
          value={dish.price ?? ""}
          onChange={e => onChange(i, "price", e.target.value === "" ? null : Number(e.target.value))}
          placeholder="—" />
      </label>

      <label className="field">
        <span className="field-label">Ingredienti · descrizione breve</span>
        <textarea
          value={dish.desc}
          rows="2"
          onChange={e => onChange(i, "desc", e.target.value)}
          placeholder="capperi di Pantelleria, olio Tonda Iblea…" />
      </label>

      <label className={"field " + (!isNarrative ? "field-dim" : "")}>
        <span className="field-label">
          Racconto · narrativa dello chef
          {!isNarrative && <span className="field-flag">visibile in IV · Editoriale, V · Diario</span>}
        </span>
        <textarea
          value={dish.story}
          rows="3"
          onChange={e => onChange(i, "story", e.target.value)}
          placeholder="Una breve storia del piatto: origine, gesti, ricordo…" />
      </label>

      <div className={"field " + (!isImage ? "field-dim" : "")}>
        <span className="field-label">
          Foto del piatto
          {!isImage && <span className="field-flag">visibile in IV · Editoriale</span>}
        </span>
        <div className="image-upload">
          {dish.image ? (
            <div className="image-preview">
              <img src={dish.image} alt="" />
              <div className="image-actions">
                <button className="mini-btn" onClick={openPicker}>Sostituisci</button>
                <button className="mini-btn mini-x" onClick={() => onImageRemove(i)}>Rimuovi</button>
              </div>
            </div>
          ) : (
            <button className="image-drop" onClick={openPicker}>
              <span className="img-icon">▢</span>
              <span className="img-label">Carica foto</span>
              <span className="img-hint">JPG / PNG · ottimizzata a max 900px</span>
            </button>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileRef}
            onChange={onFileChange}
            style={{display: "none"}} />
        </div>
      </div>

      <div className="field">
        <span className="field-label">Allergeni</span>
        <div className="allergens-pick">
          {ALLERGENI.map(a => (
            <button
              key={a.n}
              type="button"
              title={a.label}
              className={"allergen-chip " + (dish.allergens.includes(a.n) ? "on" : "")}
              onClick={() => onToggleAllergen(i, a.n)}>
              {a.n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

Object.assign(window, { Form, VARIANTS, NARRATIVE_VARIANTS, IMAGE_VARIANTS });
