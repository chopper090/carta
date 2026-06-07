// ============================================================
// Carta · Generatore di menu — Form / Control panel
// v 1.2 — variant toggle a 5, campo story, upload foto
// ============================================================

const VARIANTS = [
  { id: "classico",       num: "I",   name: "Classico",       desc: "centrato, simmetrico",          tags: "essenziale · 2 pagine" },
  { id: "contemporaneo",  num: "II",  name: "Contemporaneo",  desc: "editoriale, asimmetrico",       tags: "essenziale · 2 pagine" },
  { id: "tabula",         num: "III", name: "Tabula",         desc: "ultra-minimale, una pagina",    tags: "essenziale · 1 pagina" },
  { id: "editoriale",     num: "IV",  name: "Editoriale",     desc: "con foto e racconto",           tags: "racconto · multi-pagina" },
  { id: "diario",         num: "V",   name: "Diario",         desc: "racconto, senza foto",          tags: "racconto · multi-pagina" },
  { id: "listino",        num: "VI",  name: "Listino",        desc: "denso, multi-colonna",          tags: "bar · multi-pagina" }
];

const NARRATIVE_VARIANTS = new Set(["editoriale", "diario"]);
const IMAGE_VARIANTS = new Set(["editoriale"]);

function Form({ menu, setMenu, variant, setVariant, client, setClient, onLoadPreset, onReset, onPrint, onExport }) {

  const clientList = (typeof CLIENT_ORDER !== "undefined" ? CLIENT_ORDER : Object.keys(CLIENTS || {}))
    .map(id => CLIENTS[id]).filter(Boolean);
  const C = client || (typeof getClient === "function" ? getClient(DEFAULT_CLIENT) : null);
  const presets = (C && C.presets) || [];
  const sectionNames = [...new Set((menu.dishes || []).map(d => d.section).filter(Boolean))];

  const updateField = (field, value) => {
    setMenu(prev => ({ ...prev, [field]: value }));
  };

  const updateDish = (i, field, value) => {
    setMenu(prev => {
      const dishes = [...prev.dishes];
      dishes[i] = { ...dishes[i], [field]: value };
      return { ...prev, dishes };
    });
  };

  const toggleAllergen = (i, n) => {
    setMenu(prev => {
      const dishes = [...prev.dishes];
      const current = dishes[i].allergens || [];
      const next = current.includes(n)
        ? current.filter(x => x !== n)
        : [...current, n].sort((a,b)=>a-b);
      dishes[i] = { ...dishes[i], allergens: next };
      return { ...prev, dishes };
    });
  };

  const addDish = () => {
    setMenu(prev => ({
      ...prev,
      dishes: [...prev.dishes, { name: "", section: "", desc: "", story: "", image: null, price: null, allergens: [] }]
    }));
  };

  const removeDish = (i) => {
    setMenu(prev => ({
      ...prev,
      dishes: prev.dishes.filter((_, idx) => idx !== i)
    }));
  };

  const moveDish = (i, dir) => {
    setMenu(prev => {
      const dishes = [...prev.dishes];
      const j = i + dir;
      if (j < 0 || j >= dishes.length) return prev;
      [dishes[i], dishes[j]] = [dishes[j], dishes[i]];
      return { ...prev, dishes };
    });
  };

  const handleImageUpload = (i, file) => {
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
  };

  const removeImage = (i) => updateDish(i, "image", null);

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

      {variant === "listino" && (
        <div className="form-section">
          <div className="section-label">Colonne · Listino</div>
          <div className="cols-pick">
            {[1, 2, 3].map(n => (
              <button key={n} type="button"
                className={"cols-btn " + (((menu.cols || 2) === n) ? "active" : "")}
                onClick={() => updateField("cols", n)}>{n}<span>col</span></button>
            ))}
          </div>
          <p className="cols-hint">Più colonne = più compatto. Le pagine A4 si creano da sole: stampi quelle che ti servono.</p>
        </div>
      )}

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
          <button className="mini-btn" onClick={addDish}>+ aggiungi</button>
        </div>

        <div className="form-hint">
          {isNarrative && <span className="hint-pill">Racconto visibile</span>}
          {isImage && <span className="hint-pill">Foto visibili</span>}
          {!isNarrative && !isImage && <span className="hint-pill hint-muted">Variante essenziale</span>}
        </div>

        <datalist id="sezioni-list">
          {sectionNames.map(s => <option key={s} value={s} />)}
        </datalist>
        <div className="dishes-form">
          {menu.dishes.map((d, i) => (
            <DishEditor
              key={i}
              i={i}
              dish={d}
              total={menu.dishes.length}
              isNarrative={isNarrative}
              isImage={isImage}
              onChange={(field, value) => updateDish(i, field, value)}
              onToggleAllergen={(n) => toggleAllergen(i, n)}
              onMove={(dir) => moveDish(i, dir)}
              onRemove={() => removeDish(i)}
              onImageUpload={(f) => handleImageUpload(i, f)}
              onImageRemove={() => removeImage(i)}
            />
          ))}
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
// DishEditor — sub-component per ogni piatto
// ============================================================
function DishEditor({ i, dish, total, isNarrative, isImage, onChange, onToggleAllergen, onMove, onRemove, onImageUpload, onImageRemove }){
  const fileRef = useRef(null);

  const openPicker = () => fileRef.current?.click();
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    onImageUpload(file);
    e.target.value = ""; // reset so same file can be re-picked
  };

  return (
    <div className="dish-row">
      <div className="dish-row-head">
        <div className="dish-row-num">{String(i+1).padStart(2, "0")}</div>
        <div className="dish-row-controls">
          <button className="ctrl-btn" disabled={i === 0} onClick={() => onMove(-1)} title="Sposta su" aria-label="Sposta la portata su">↑</button>
          <button className="ctrl-btn" disabled={i === total - 1} onClick={() => onMove(1)} title="Sposta giù" aria-label="Sposta la portata giù">↓</button>
          <button className="ctrl-btn ctrl-x" disabled={total <= 1} onClick={onRemove} title="Rimuovi portata" aria-label="Rimuovi la portata">×</button>
        </div>
      </div>

      <label className="field">
        <span className="field-label">
          Sezione
          <span className="field-flag">opzionale · es. Antipasti, Buns, Piatti</span>
        </span>
        <input
          type="text"
          list="sezioni-list"
          value={dish.section || ""}
          onChange={e => onChange("section", e.target.value)}
          placeholder="Antipasti, Buns, Piatti…" />
      </label>

      <label className="field">
        <span className="field-label">Nome piatto</span>
        <input
          type="text"
          value={dish.name}
          onChange={e => onChange("name", e.target.value)}
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
          onChange={e => onChange("price", e.target.value === "" ? null : Number(e.target.value))}
          placeholder="—" />
      </label>

      <label className="field">
        <span className="field-label">Ingredienti · descrizione breve</span>
        <textarea
          value={dish.desc}
          rows="2"
          onChange={e => onChange("desc", e.target.value)}
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
          onChange={e => onChange("story", e.target.value)}
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
                <button className="mini-btn mini-x" onClick={onImageRemove}>Rimuovi</button>
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
              onClick={() => onToggleAllergen(a.n)}>
              {a.n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Form, VARIANTS, NARRATIVE_VARIANTS, IMAGE_VARIANTS });
