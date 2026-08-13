// ============================================================================
// Cambusa · importa la Carta
//
// Questo file NON serve a Carta: è scritto per Cambusa, e sta qui perché è
// Carta a produrre il formato che legge. Copialo in `cambusa/js/modules/` e
// aggancialo in due punti:
//
//   1) in `index.html`, con gli altri moduli (dopo `seed_carta.js`):
//        <script src="js/modules/import_carta.js"></script>
//
//   2) in `js/modules/settings.js`, dentro il `mount(...)`, aggiungendo la
//      card fra quella "Menù della Carta" e quella "Sposta dati":
//        RM.modules.importCarta.card(),
//
// Sostituisce `seed_carta.js`: quello aveva la carta scritta a mano dentro il
// codice e invecchiava a ogni cambio di menù. Questo legge il menù vero — dal
// file esportato o direttamente dal Gist che Carta aggiorna a ogni salvataggio,
// con lo stesso token che Cambusa usa già per la propria sincronizzazione.
//
// Cosa rispetta, e va detto chiaro: **non distrugge il lavoro fatto qui**.
// Sui piatti già presenti aggiunge gli ingredienti mancanti ma non tocca mai
// le grammature che hai inserito, non svuota il procedimento che hai scritto e
// non rimuove righe. Gli allergeni sono l'unione fra quelli dedotti dagli
// ingredienti e quelli dichiarati in Carta: nessuno si perde per strada.
// ============================================================================
(function(){
'use strict';
const RM = window.RM = window.RM || {};
RM.modules = RM.modules || {};
const {el, toast, confirmDialog} = RM.utils;
const {store} = RM;

const FILE = 'carta-to-cambusa.json';
const API  = 'https://api.github.com';
const TOKEN_KEY = 'rm:v1:sync:token';           // lo stesso token della sync

// ---------------------------------------------------------------- lettura
async function ghFetch(url, token){
  const sep = url.includes('?') ? '&' : '?';
  const res = await fetch(url+sep+'_ts='+Date.now(), {cache:'no-store', headers:{
    'Authorization':'Bearer '+token,
    'Accept':'application/vnd.github+json',
    'X-GitHub-Api-Version':'2022-11-28',
  }});
  if(!res.ok){
    if(res.status===401) throw new Error('401 — token rifiutato. Serve un token CLASSIC con permesso “gist”.');
    if(res.status===404) throw new Error('404 — Gist non trovato o token senza permesso “gist”.');
    throw new Error(res.status+' '+res.statusText);
  }
  return res;
}

// Il Gist di Carta è quello che contiene il nostro file: nessun id da copiare.
async function fromGist(){
  const token = localStorage.getItem(TOKEN_KEY)||'';
  if(!token) throw new Error('nessun token salvato: configura prima la sincronizzazione in Impostazioni');
  const list = await (await ghFetch(API+'/gists?per_page=100', token)).json();
  const g = Array.isArray(list) ? list.find(x=>x.files && x.files[FILE]) : null;
  if(!g) throw new Error('nessun export di Carta nel cloud. Apri Carta, configura la sincronizzazione e salva una volta.');
  const data = await (await ghFetch(API+'/gists/'+g.id, token)).json();
  const f = data.files && data.files[FILE];
  if(!f) throw new Error('export di Carta non trovato nel Gist');
  const content = (f.truncated && f.raw_url)
    ? await (await fetch(f.raw_url,{cache:'no-store'})).text()
    : f.content;
  return JSON.parse(content);
}

// ------------------------------------------------------------ importazione
// Un blocco = un cliente di Carta, riversato nel ristorante ATTIVO.
function importBlock(block, opts){
  opts = opts || {};
  const createQuick = RM.modules.ingredienti.createQuick;
  const before = new Set(store.all('ingredienti').map(i=>(i.nome||'').toLowerCase()));
  const byName = new Map();
  let addedIng = 0;

  const ensureIng = (nome, allergeni) => {
    if(!nome) return null;
    const k = nome.toLowerCase();
    if(byName.has(k)) return byName.get(k);
    const ing = createQuick(nome, (allergeni && allergeni.length) ? {allergeni} : {});
    if(ing){
      byName.set(k, ing);
      if(!before.has(k)){ before.add(k); addedIng++; }
    }
    return ing;
  };

  // 1) anagrafica: prima gli ingredienti, così i piatti trovano già le schede
  for(const i of (block.ingredienti||[])) ensureIng(i.nome, i.allergeni);

  // 2) piatti
  const index = new Map(store.all('piatti').map(p=>[(p.nome||'').toLowerCase(), p]));
  let addedDish = 0, updatedDish = 0;

  for(const d of (block.piatti||[])){
    const key = (d.nome||'').toLowerCase();
    if(!key) continue;
    const prev = index.get(key);
    const item = prev ? JSON.parse(JSON.stringify(prev)) : {
      nome: d.nome, categoria:'', porzioni:1, prezzo_vendita:0, ingredienti:[],
      procedimento:'', impiattamento:'', tempo_min:0, difficolta:'media',
      allergeni:[], foto_dataurl:'', in_ricettario:true,
    };

    // categoria e prezzo: in Carta ci sta il menù vero, quindi fanno testo —
    // ma il prezzo si può congelare, se qui stai facendo simulazioni.
    if(d.categoria) item.categoria = d.categoria;
    if(opts.prezzi !== false && typeof d.prezzo_vendita === 'number' && d.prezzo_vendita > 0){
      item.prezzo_vendita = d.prezzo_vendita;
    }
    // il procedimento scritto qui è più ricco della descrizione da menù: si
    // riempie solo se vuoto
    if(!String(item.procedimento||'').trim() && d.procedimento) item.procedimento = d.procedimento;

    // righe ricetta: si AGGIUNGONO le mancanti, non si tocca ciò che c'è
    const righe = Array.isArray(item.ingredienti) ? item.ingredienti.slice() : [];
    const have = new Set(righe.map(r=>r.ing_id));
    for(const i of (d.ingredienti||[])){
      const ing = ensureIng(i.nome, i.allergeni);
      if(ing && !have.has(ing.id)){ righe.push({ing_id: ing.id, grammi: 0, note: ''}); have.add(ing.id); }
    }
    item.ingredienti = righe;

    // allergeni: unione fra quelli calcolati dalla ricetta e quelli
    // dichiarati in Carta. Non se ne perde nessuno.
    const calc = RM.calc.foodcostPiatto(item, RM.calc.ingredientiMap()).allergeni || [];
    const union = new Set(calc);
    for(const a of (d.allergeni||[])) union.add(a);
    item.allergeni = [...union];

    store.upsert('piatti', item);
    if(prev) updatedDish++; else { addedDish++; index.set(key, item); }
  }

  return {addedIng, addedDish, updatedDish};
}

// `target: 'active'` → tutto nel ristorante aperto.
// `target: 'match'`  → un ristorante per cliente di Carta, creato se manca.
function importAll(payload, opts){
  opts = opts || {};
  if(!payload || payload._fmt !== 'carta-to-cambusa') throw new Error('questo file non è un export di Carta');
  const blocks = (payload.ristoranti||[]).filter(b => !opts.only || opts.only === b.clientId);
  if(!blocks.length) throw new Error('nessun menù da importare');

  const prevActive = store.getActiveId();
  const out = [];
  for(const b of blocks){
    if(opts.target === 'match'){
      const found = store.getRestaurants().find(r => (r.name||'').toLowerCase() === (b.nome||'').toLowerCase());
      const r = found || store.addRestaurant({name: b.nome, kind:'Ristorante'});
      store.setActive(r.id);
    }
    const nome = (store.getActive()||{}).name || '—';
    out.push(Object.assign({ristorante: nome}, importBlock(b, opts)));
  }
  if(opts.target === 'match') store.setActive(prevActive);
  return out;
}

// ------------------------------------------------------------------- card
// Da innestare in settings.js: `RM.modules.importCarta.card()`.
function card(){
  const fFile   = el('input',{type:'file',accept:'.json,application/json',hidden:true});
  const fPrezzi = el('input',{type:'checkbox',checked:true});
  const fTarget = el('select',{},[
    el('option',{value:'active',text:'Tutto nel ristorante aperto adesso'}),
    el('option',{value:'match', text:'Un ristorante per ogni locale della Carta (creandolo se manca)'}),
  ]);
  const esito = el('p',{class:'muted',style:{fontSize:'12px',marginTop:'10px'}});

  const opts = () => ({target: fTarget.value, prezzi: fPrezzi.checked});

  const applica = async (payload) => {
    const quanti = (payload.ristoranti||[]).length;
    const dove = fTarget.value === 'match' ? 'nei ristoranti corrispondenti' : `su “${(store.getActive()||{}).name}”`;
    if(!await confirmDialog(`Importare ${quanti} menù ${dove}? I piatti già presenti vengono aggiornati senza perdere grammature e procedimenti.`,'Importa')) return;
    try{
      const res = importAll(payload, opts());
      const riga = res.map(r=>`${r.ristorante}: +${r.addedDish} piatti, ${r.updatedDish} aggiornati, +${r.addedIng} ingredienti`).join(' · ');
      esito.textContent = riga;
      toast('Carta importata','ok');
    }catch(e){ esito.textContent = e.message; toast(e.message,'err'); }
  };

  fFile.addEventListener('change', async e => {
    const f = e.target.files && e.target.files[0];
    fFile.value = '';
    if(!f) return;
    try{ await applica(JSON.parse(await f.text())); }
    catch(err){ toast(err.message,'err'); }
  });

  return el('div',{class:'card',style:{marginTop:'14px'}},[
    el('h2',{text:'Importa dalla Carta'}),
    el('p',{class:'muted',style:{marginBottom:'12px',fontSize:'12.5px'},text:'Prende il menù vero da Carta — piatti, prezzi, allergeni — e ne ricava l\'anagrafica ingredienti per il food cost. Non crea doppioni e non tocca le grammature né i procedimenti che hai già scritto qui: puoi rilanciarlo a ogni cambio di menù.'}),
    el('div',{class:'field'},[ el('label',{text:'Dove finiscono i dati'}), fTarget ]),
    el('label',{class:'row',style:{gap:'8px',alignItems:'center',cursor:'pointer',margin:'8px 0'}},[
      fPrezzi, el('span',{text:'Aggiorna anche i prezzi di vendita con quelli della Carta'}) ]),
    el('div',{class:'row wrap',style:{gap:'8px',marginTop:'8px'}},[
      el('button',{class:'btn btn-primary',text:'☁ Scarica da Carta (Gist)',onclick:async()=>{
        esito.textContent = 'Cerco l\'export nel cloud…';
        try{ await applica(await fromGist()); }
        catch(e){ esito.textContent = e.message; toast(e.message,'err'); }
      }}),
      el('label',{class:'btn',text:'↧ Da file .json'},[fFile]),
    ]),
    esito,
  ]);
}

RM.modules.importCarta = {card, importAll, importBlock, fromGist, FILE};
})();
