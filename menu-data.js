// ============================================================
// Carta · Menu data — esempi precaricati + standard allergeni
// v 1.2 — aggiunti campi 'story' (racconto) e 'image' (foto)
// ============================================================

const ALLERGENI = [
  { n: 1,  label: "Glutine" },
  { n: 2,  label: "Crostacei" },
  { n: 3,  label: "Uova" },
  { n: 4,  label: "Pesce" },
  { n: 5,  label: "Arachidi" },
  { n: 6,  label: "Soia" },
  { n: 7,  label: "Latte / latticini" },
  { n: 8,  label: "Frutta a guscio" },
  { n: 9,  label: "Sedano" },
  { n: 10, label: "Senape" },
  { n: 11, label: "Sesamo" },
  { n: 12, label: "Solfiti" },
  { n: 13, label: "Lupini" },
  { n: 14, label: "Molluschi" }
];

const MENU_RADICI = {
  name: "Radici",
  category: "tematico",
  date: "2026-05-22",
  price: 65,
  chef: "Marco Lentini",
  seats: 8,
  chefNote: "Una sera di sole eccellenze siciliane, dalla terra al mare.",
  dishes: [
    {
      name: "Tartare di tonno rosso",
      desc: "capperi di Pantelleria, olio Tonda Iblea, bottarga affumicata, zest di limone candito",
      story: "Il tonno arriva alla mattina dal porto di Messina, ancora ricoperto di brina. Lo taglio a mano, freddo, e lo lascio respirare con un filo di Tonda Iblea. La bottarga si fuma sul piatto all'ultimo secondo.",
      image: null,
      allergens: [4, 12]
    },
    {
      name: "Risotto al limone candito",
      desc: "gambero rosso di Mazara, bottarga di muggine, foglie di nasturzio",
      story: "Cuocio il riso solo con l'acqua del limone, niente brodo. Il candito lo preparo la notte prima, lentamente, perché perda l'amaro e tenga il profumo. Il gambero rosso entra crudo, all'uscita.",
      image: null,
      allergens: [2, 4, 7]
    },
    {
      name: "Branzino in crosta di sale",
      desc: "finocchietto selvatico, arancia di Ribera, olio di alloro affumicato",
      story: "Pesca della notte. La crosta di sale arriva intera in tavola, si apre con un colpo secco davanti agli ospiti. Sotto, il pesce è ancora caldo e umido — il finocchietto è cresciuto al confine del giardino.",
      image: null,
      allergens: [4]
    },
    {
      name: "Cassata destrutturata",
      desc: "ricotta di bufala dei Nebrodi, pistacchio di Bronte, gel di mandarino tardivo",
      story: "La cassata di mia nonna, scomposta. Niente pasta reale. Solo ricotta freschissima, montata leggera, e pistacchio crudo grattugiato sopra come neve.",
      image: null,
      allergens: [1, 3, 7, 8]
    }
  ]
};

const MENU_SAKURA = {
  name: "Sakura",
  category: "fusion",
  date: "2026-06-12",
  price: 95,
  chef: "Marco Lentini",
  seats: 8,
  chefNote: "Sei passi tra Mediterraneo e Oriente. Stessi gesti, lingue diverse.",
  dishes: [
    {
      name: "Ostrica e yuzu",
      desc: "ostrica di Belon, granita di yuzu, ponzu allo zenzero, fiore di sakura",
      story: "L'ostrica si apre un istante prima di entrare in tavola. La granita di yuzu si scioglie nel guscio, si mescola al sale dell'acqua di mare. Si beve, non si mangia.",
      image: null,
      allergens: [4, 6, 14]
    },
    {
      name: "Sashimi di ricciola",
      desc: "salsa di soia agli agrumi, wasabi fresco, daikon marinato, sesamo tostato",
      story: "Ricciola messinese, pescata all'amo. La servo dopo dieci minuti di riposo sotto un sale al limone, perché la carne si distenda. Daikon e wasabi grattugiati al momento.",
      image: null,
      allergens: [4, 6, 11]
    },
    {
      name: "Tagliolini al nero di seppia",
      desc: "ricci di mare di Sicilia, brodo dashi, olio di kombu, scorza di yuzu",
      story: "Pasta fresca tirata sottile come una stoffa, colorata col nero. Il dashi è di alga kombu siciliana — sì, esiste — e funghi shiitake. I ricci si aggiungono crudi, alla fine.",
      image: null,
      allergens: [1, 3, 4, 14]
    },
    {
      name: "Anguilla laccata al miso",
      desc: "purea di topinambur, salsa teriyaki ai mandarini, germogli di shiso",
      story: "Marinata 24 ore in miso bianco e mirin. Cotta sulla brace, laccata tre volte. Il topinambur, sotto, è una purea fatta solo con la sua acqua di cottura.",
      image: null,
      allergens: [4, 6, 11]
    },
    {
      name: "Manzo wagyu scottato",
      desc: "salsa al tartufo nero, riduzione di sakè, fiore di crisantemo",
      story: "Tre secondi per lato sulla piastra rovente. Riposo lungo, taglio sottile. La salsa al tartufo è ridotta col sakè per giorni — finché diventa quasi nera, lucida, profonda.",
      image: null,
      allergens: [6, 12]
    },
    {
      name: "Dorayaki al matcha",
      desc: "ripieno di anko, gelato al sesamo nero, sciroppo di kuromitsu",
      story: "Pancake giapponesi alla farina di riso e matcha. Tra i due dischi, una crema di fagioli azuki cotti lentamente con zucchero di canna. Il sesamo nero è tostato a parte.",
      image: null,
      allergens: [1, 3, 6, 7, 11]
    }
  ]
};

const MENU_TERRAEMARE = {
  name: "Terra e Mare",
  category: "fusion",
  date: "2026-07-04",
  price: 130,
  chef: "Marco Lentini",
  seats: 8,
  chefNote: "Otto atti per una sera intera. Il limite tra mare e terra come unico paesaggio.",
  dishes: [
    {
      name: "Amuse-bouche dello chef",
      desc: "tre piccoli morsi a sorpresa, raccontati al tavolo",
      story: "Cambiano ogni sera. Sono il modo in cui inizio il discorso.",
      image: null,
      allergens: []
    },
    {
      name: "Crudo misto",
      desc: "scampi di Mazara, gambero rosso, ricciola, olio EVO Nocellara, sale Maldon",
      story: "Tre crudi, tre temperature. Scampo a 4 gradi, gambero rosso a 8, ricciola a 10. Si mangia in quest'ordine, senza pane.",
      image: null,
      allergens: [2, 4]
    },
    {
      name: "Uovo croccante",
      desc: "fonduta di parmigiano 36 mesi, tartufo nero di Norcia, polvere di pane",
      story: "L'uovo entra nella pastella di pane raffermo e parmigiano e finisce in olio bollente per 70 secondi esatti. Si rompe a metà, la fonduta fa da letto, il tartufo si grattugia in tavola.",
      image: null,
      allergens: [1, 3, 7]
    },
    {
      name: "Spaghettone all'astice",
      desc: "bisque di crostacei, pomodorino datterino confit, basilico ghiacciato",
      story: "L'astice viene cotto vivo, smontato, e la sua bisque è la base di tutto. Lo spaghettone si finisce di cuocere nel suo brodo — non in acqua. Il datterino confit dura otto ore in forno.",
      image: null,
      allergens: [1, 2, 14]
    },
    {
      name: "Granchio reale",
      desc: "maionese affumicata, daikon, caviale d'Aquitania, foglie di acetosella",
      story: "Granchio reale norvegese, polpa cruda macerata in succo di lime. La maionese si affumica con legno di melo. Il daikon è solo per spezzare.",
      image: null,
      allergens: [2, 3, 4]
    },
    {
      name: "Agnello in tre cotture",
      desc: "carré, sottospalla brasata, ragù di interiora — salsa al ginepro e mirto",
      story: "Tre tagli, tre tempi, una sola salsa. Il ginepro lo schiaccio fresco col mortaio, il mirto arriva dall'orto dei miei zii.",
      image: null,
      allergens: [9, 12]
    },
    {
      name: "Pre-dessert",
      desc: "sorbetto al mandarino tardivo di Ciaculli, granella di olive nere",
      story: "Frutto di gennaio, raccolto a marzo, conservato un anno. L'oliva nera in polvere fa da contrasto salato.",
      image: null,
      allergens: []
    },
    {
      name: "Cioccolato 80%",
      desc: "ganache di cacao Single Origin, sale Maldon, olio EVO Tonda Iblea, pane croccante",
      story: "Cacao di Madagascar, lavorato come una crema. Sopra: sale Maldon, olio EVO Tonda Iblea, e pane bruciato. Si mangia con due cucchiai diversi, per scoprire i due lati.",
      image: null,
      allergens: [1, 7]
    }
  ]
};

// ============================================================
// CLIENTE · il baretto — menù estratti dal menù ufficiale
// Modello "stessa logica": liste di voci con prezzo per voce.
// ============================================================

const BARETTO_SIGNATURE = {
  name: "Barettology",
  category: "signature",
  date: "2026-06-05",
  price: 9,
  chef: "il baretto",
  seats: 8,
  chefNote: "I nostri signature. Mare, agrumi e una buona dose di Sicilia.",
  dishes: [
    { name: "W Maria", desc: "vodka, pomodoro speziato, sedano, tabasco, worcester, sale al limone", story: "", image: null, price: 9, allergens: [9, 12] },
    { name: "Ancho Paloma", desc: "tequila, ancho reyes, succo di lime, pompelmo rosa, soda all'agave", story: "", image: null, price: 9, allergens: [] },
    { name: "Coral", desc: "gin, bitter al pompelmo, lime, soda, scorza d'arancia bruciata", story: "", image: null, price: 9, allergens: [12] },
    { name: "Daiquiri Hemingway", desc: "rum bianco, maraschino, succo di lime, pompelmo", story: "", image: null, price: 9, allergens: [] },
    { name: "Quota Rosa", desc: "gin, ibisco, lime, prosecco, fiori eduli", story: "", image: null, price: 9, allergens: [12] },
    { name: "Calle", desc: "mezcal, lime, sciroppo d'agave, sale al peperoncino", story: "", image: null, price: 10, allergens: [] }
  ]
};

const BARETTO_CLASSICI = {
  name: "I Classici",
  category: "cocktail",
  date: "2026-06-05",
  price: 8,
  chef: "il baretto",
  seats: 8,
  chefNote: "I grandi classici. A partire da 8.00 €.",
  dishes: [
    { name: "Aviation", desc: "gin, maraschino, crème de violette, succo di lime", story: "", image: null, price: 8, allergens: [] },
    { name: "Negroni", desc: "gin, bitter Campari, vermouth rosso", story: "", image: null, price: 8, allergens: [12] },
    { name: "Americano", desc: "bitter Campari, vermouth rosso, soda", story: "", image: null, price: 8, allergens: [12] },
    { name: "Margarita", desc: "tequila, triple sec, succo di lime, sale", story: "", image: null, price: 8, allergens: [] },
    { name: "Daiquiri", desc: "rum bianco, succo di lime, zucchero di canna", story: "", image: null, price: 8, allergens: [] },
    { name: "Old Fashioned", desc: "bourbon, angostura, zucchero, scorza d'arancia", story: "", image: null, price: 9, allergens: [] }
  ]
};

const BARETTO_CUCINA = {
  name: "Cucina",
  category: "food",
  date: "",
  price: null,
  chef: "il baretto",
  seats: 8,
  chefNote: "La cucina del baretto: dalla piazzetta agli sfizi, dai buns ai piatti. Mare, agrumi e Sicilia.",
  dishes: [
    // — Piazzetta —
    { name: "Piazzetta", section: "Piazzetta", desc: "mandorle salate, arachidi, ceci, pinzimonio (carote, cetrioli, daikon, peperoni), vinaigrette o citronette", story: "", image: null, price: null, allergens: [5, 8] },

    // — Salse · accompagnamento nachos / crostoni —
    { name: "Tzatziki", section: "Salse", desc: "yogurt, cetriolo, aglio, menta, olio", story: "", image: null, price: null, allergens: [7] },
    { name: "Hummus", section: "Salse", desc: "ceci, tahina, succo di lime, paprika, aglio, olio", story: "", image: null, price: null, allergens: [11] },
    { name: "Guacamole", section: "Salse", desc: "avocado, cipolla, cumino, coriandolo, pomodoro, succo di lime", story: "", image: null, price: null, allergens: [] },
    { name: "Alpino", section: "Salse", desc: "rucola, caprino, mandorle, sale, pepe nero, olio", story: "", image: null, price: null, allergens: [7, 8] },

    // — Buns —
    { name: "Classicone", section: "Buns", desc: "mortadella, limone, pepe", story: "", image: null, price: null, allergens: [1] },
    { name: "Little Tonny", section: "Buns", desc: "tartare di tonno con agrumi, zenzero e capperi, salsa yogurt con jalapeño verde, provola affumicata, valeriana", story: "", image: null, price: null, allergens: [1, 4, 7] },
    { name: "Pa-nino", section: "Buns", desc: "controfiletto di manzo (cbt), composta di cipolle, rucola, scaglie di parmigiano, salsa mayo e senape", story: "", image: null, price: null, allergens: [1, 3, 7, 10] },
    { name: "Vegburger", section: "Buns", desc: "hamburger vegano — ricetta da definire", story: "", image: null, price: null, allergens: [1] },

    // — Crostoni —
    { name: "Burro alle erbe e alici", section: "Crostoni", desc: "crostone, burro alle erbe montato, alici", story: "", image: null, price: null, allergens: [1, 4, 7] },
    { name: "Baccalà mantecato", section: "Crostoni", desc: "crostone, baccalà mantecato", story: "", image: null, price: null, allergens: [1, 4] },

    // — Sfizi —
    { name: "Fish & Chips", section: "Sfizi", desc: "pesce in pastella, salsa tartara", story: "", image: null, price: null, allergens: [1, 3, 4] },
    { name: "Panella e tartare di carne", section: "Sfizi", desc: "panella, tartare di carne, maionese di cappero e ravanelli, acciuga, tuorlo marinato", story: "", image: null, price: null, allergens: [3, 4] },
    { name: "Scagghiozza", section: "Sfizi", desc: "salsa verde, lingua o alici (da confermare)", story: "", image: null, price: null, allergens: [4] },
    { name: "Falafel", section: "Sfizi", desc: "ceci, spezie, erbe", story: "", image: null, price: null, allergens: [] },
    { name: "Mix", section: "Sfizi", desc: "selezione di sfizi", story: "", image: null, price: null, allergens: [] },

    // — Insalatine —
    { name: "Oriental", section: "Insalatine", desc: "misticanza, salsa orientale, noci, feta veg, mela, pomodori confit", story: "", image: null, price: null, allergens: [6, 8] },
    { name: "Caesar", section: "Insalatine", desc: "lattughino, salsa caesar, bacon, uova, petto di pollo, crostini (da confermare)", story: "", image: null, price: null, allergens: [1, 3, 4, 7] },

    // — Piatti —
    { name: "Sashimi di tonno", section: "Piatti", desc: "tonno, cetriolo, menta, mela, salsa orientale", story: "", image: null, price: null, allergens: [4, 6] },
    { name: "Caprese", section: "Piatti", desc: "pomodorini variegati, basilico variegato, bufala (250 g)", story: "", image: null, price: null, allergens: [7] },
    { name: "Burratina", section: "Piatti", desc: "marmellata di pomodoro, crostoni (friselle alle olive)", story: "", image: null, price: null, allergens: [1, 7] },
    { name: "Carpaccio di Black Angus", section: "Piatti", desc: "carpaccio di Black Angus, rucola, scaglie di parmigiano", story: "", image: null, price: null, allergens: [7] },

    // — Signature —
    { name: "Crispy tamago", section: "Signature", desc: "maionese di baccalà, gel umadashi (dashi, soia, kuzu), uovo poché panato nel panko e fritto, coste di bietola osmotizzate con soia, erba cipollina", story: "", image: null, price: null, allergens: [1, 3, 4, 6] }
  ]
};

// ============================================================
// DEMO · menu di esempio neutro (cliente "demo", white-label)
// ============================================================
const MENU_DEMO = {
  name: "Degustazione",
  category: "tematico",
  date: "",
  price: 50,
  chef: "",
  seats: 8,
  chefNote: "Un menu di esempio — sostituisci piatti, racconti e prezzi con i tuoi.",
  dishes: [
    {
      name: "Antipasto della casa",
      desc: "ingrediente principale, contorno, salsa, guarnizione",
      story: "Qui puoi raccontare il piatto: la sua origine, gli ingredienti, il gesto che lo rende tuo.",
      image: null,
      allergens: [4, 7]
    },
    {
      name: "Primo piatto",
      desc: "pasta o riso, condimento di stagione, erbe fresche",
      story: "",
      image: null,
      allergens: [1, 7]
    },
    {
      name: "Secondo piatto",
      desc: "proteina principale, cottura, accompagnamento",
      story: "",
      image: null,
      allergens: []
    },
    {
      name: "Dessert",
      desc: "dolce della casa, frutta o crema, decorazione",
      story: "",
      image: null,
      allergens: [1, 3, 7]
    }
  ]
};

const PRESET_MENUS = {
  demoDegustazione: MENU_DEMO,
  radici: MENU_RADICI,
  sakura: MENU_SAKURA,
  terraemare: MENU_TERRAEMARE,
  barettoSignature: BARETTO_SIGNATURE,
  barettoClassici: BARETTO_CLASSICI,
  barettoCucina: BARETTO_CUCINA
};

const EMPTY_MENU = {
  name: "Nuovo Menu",
  category: "tematico",
  date: "",
  price: 0,
  chef: "",
  seats: 8,
  chefNote: "",
  layout: {},   // posizioni drag&drop per variante: { [variante]: { [id]: {x,y} } }
  dishes: [
    { name: "", section: "", desc: "", story: "", image: null, price: null, allergens: [] }
  ]
};

// Migration helper — old menu data may lack 'story'/'image'/'layout'
function normalizeMenu(m){
  if (!m) return EMPTY_MENU;
  return {
    ...EMPTY_MENU,
    ...m,
    layout: m.layout || {},
    dishes: (m.dishes || []).map(d => ({
      name: d.name || "",
      section: d.section || "",
      desc: d.desc || "",
      story: d.story || "",
      image: d.image || null,
      price: (d.price === 0 || d.price) ? d.price : null,
      allergens: d.allergens || []
    }))
  };
}

Object.assign(window, { ALLERGENI, PRESET_MENUS, EMPTY_MENU, normalizeMenu });
