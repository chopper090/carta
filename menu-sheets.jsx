// ============================================================
// Menu sheet components — 5 varianti grafiche
// Tutte renderizzano in formato A4 reale (210mm × 297mm)
// Client-aware: brand, logo, palette e font dipendono dal cliente.
// ============================================================

const { useState, useEffect, useRef, useMemo, useContext } = React;

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
  return (
    <div className="sheet sheet-classico" data-client={C.id} data-screen-label="Menu Classico">
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
            {courseNumber(portate-1)} portate <span className="dot-sep">·</span> {formatPrice(menu.price)}
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

      <div className="page-A4 inner-page-c">
        <div className="inner-head-c">
          <div className="inner-wm-c"><Brand client={C} className="brand-sm" /></div>
          <div className="inner-menu-name-c">— {menu.name} —</div>
        </div>

        <div className="dishes-c">
          {menu.dishes.map((d, i) => (
            <div className="dish-c" key={i}>
              <div className="dish-num-c">{courseNumber(i)}</div>
              <h3 className="dish-name-c">
                {d.name || <span className="placeholder-c">Nome del piatto</span>}
                <DishPrice value={d.price} />
                <AllergensInline list={d.allergens} />
              </h3>
              {d.desc && <p className="dish-desc-c">{d.desc}</p>}
              {i < menu.dishes.length - 1 && (
                <div className="dish-sep-c">
                  <span></span><em>·</em><span></span>
                </div>
              )}
            </div>
          ))}
        </div>

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
      </div>
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
  return (
    <div className="sheet sheet-contemporaneo" data-client={C.id} data-screen-label="Menu Contemporaneo">
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
              <span className="stat-label-m">Portate</span>
              <span className="stat-val-m">{courseNumber(portate - 1)}</span>
            </div>
            <div className="stat-m">
              <span className="stat-label-m">Prezzo</span>
              <span className="stat-val-m">{formatPrice(menu.price)}</span>
            </div>
            <div className="stat-m">
              <span className="stat-label-m">Coperti</span>
              <span className="stat-val-m">{String(menu.seats).padStart(2,"0")}</span>
            </div>
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

      <div className="page-A4 inner-page-m">
        <div className="inner-top-m">
          <span className="inner-wm-m"><Brand client={C} className="brand-sm" /></span>
          <span className="inner-name-m">{menu.name} · {courseNumber(portate-1)} portate</span>
        </div>

        <div className="dishes-m">
          {menu.dishes.map((d, i) => (
            <div className="dish-m" key={i}>
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
          ))}
        </div>

        <div className="inner-foot-m">
          <div className="legend-m">
            <AllergensLegend />
          </div>
          <div className="folio-m">II</div>
        </div>
      </div>
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
  return (
    <div className="sheet sheet-tabula" data-client={C.id} data-screen-label="Menu Tabula">
      <div className="page-A4 tabula-page">
        <div className="tab-head">
          <div className="tab-wm"><Brand client={C} className="brand-sm" /></div>
          <div className="tab-meta">
            <span>— menu {menu.category} —</span>
            <span>{formatDate(menu.date)}</span>
          </div>
        </div>

        <div className="tab-title">
          <h1 className="tab-name">{menu.name || "—"}</h1>
          <div className="tab-rule"></div>
          {coast && <CoastWave className="tab-wave" />}
          <div className="tab-stats">
            <span>{courseNumber(portate-1)} portate</span>
            <span className="dot-sep">·</span>
            <span>{formatPrice(menu.price)}</span>
            <span className="dot-sep">·</span>
            <span>{menu.seats} posti</span>
          </div>
        </div>

        <div className="tab-dishes">
          {menu.dishes.map((d, i) => (
            <div className="tab-dish" key={i}>
              <h3 className="tab-dish-name">
                {d.name || <span className="placeholder-m">Nome del piatto</span>}
                <DishPrice value={d.price} />
                <AllergensInline list={d.allergens} />
              </h3>
              {d.desc && <div className="tab-dish-desc">{d.desc}</div>}
              {i < menu.dishes.length - 1 && <div className="tab-sep"></div>}
            </div>
          ))}
        </div>

        <div className="tab-foot">
          <AllergensLegend className="tab-legend" />
        </div>
      </div>
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
  // Group dishes 2 per inner page
  const pages = [];
  for (let i = 0; i < menu.dishes.length; i += 2){
    pages.push(menu.dishes.slice(i, i + 2));
  }

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
              <span>{courseNumber(portate-1)} portate</span>
              <span className="dot-sep">·</span>
              <span>{formatPrice(menu.price)}</span>
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
            <span className="ed-page-name">{menu.name} · {courseNumber(portate-1)} portate</span>
            <span className="ed-page-folio">{romanize(pIdx + 2)}</span>
          </div>

          <div className="ed-page-body">
            {group.map((d, idx) => {
              const i = pIdx * 2 + idx;
              return (
                <article className="ed-dish" key={i}>
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
  // Group dishes 3 per inner page (varies based on story length, but 3 fits)
  const perPage = 3;
  const pages = [];
  for (let i = 0; i < menu.dishes.length; i += perPage){
    pages.push(menu.dishes.slice(i, i + perPage));
  }

  return (
    <div className="sheet sheet-diario" data-client={C.id} data-screen-label="Menu Diario">
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
            <div className="dr-stat"><span className="dr-stat-lbl">portate</span><span className="dr-stat-val">{courseNumber(portate-1)}</span></div>
            <div className="dr-stat"><span className="dr-stat-lbl">prezzo</span><span className="dr-stat-val">{formatPrice(menu.price)}</span></div>
            <div className="dr-stat"><span className="dr-stat-lbl">coperti</span><span className="dr-stat-val">{String(menu.seats).padStart(2,"0")}</span></div>
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
            <span className="dr-page-meta">{menu.name} · {courseNumber(portate-1)} portate</span>
            <span className="dr-page-folio">{romanize(pIdx + 2)}</span>
          </div>

          <div className="dr-entries">
            {group.map((d, idx) => {
              const i = pIdx * perPage + idx;
              return (
                <article className="dr-entry" key={i}>
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
  MenuClassico, MenuContemporaneo, MenuTabula, MenuEditoriale, MenuDiario,
  Brand, DishPrice, CoastWave, Citrus, Draggable, DragCtx,
  formatDate, formatPrice, ALLERGENI
});
