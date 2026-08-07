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

const CUC = (name, section, desc, allergens) => ({ name, section, desc, story: "", image: null, price: null, allergens });

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
    CUC("Piazzetta", "Piazzetta", "arachidi, ceci, pinzimonio (carote, cetrioli) + vinaigrette/citronette", [5, 8]),

    // — Salse —
    CUC("Tzatziki", "Salse", "yogurt, cetriolo, aglio, menta, olio, sale", [7]),
    CUC("Hummus", "Salse", "ceci, tahina, succo di lime, paprika, aglio, olio, sale", [11]),
    CUC("Guacamole", "Salse", "avocado, succo di lime, cipolla, pomodoro, sale, peperoncino", []),
    CUC("Alpino", "Salse", "rucola, caprino, mandorle, sale, pepe nero, olio", [7, 8]),

    // — Buns —
    CUC("Classicone", "Buns", "mortadella, limone, pepe", [1]),
    CUC("Little Tonny", "Buns", "tartare di tonno con agrumi, zenzero e capperi, salsa yogurt con jalapeño verde, provola affumicata, valeriana", [1, 4, 7]),
    CUC("Pa-nino", "Buns", "controfiletto di manzo (cbt), composta di cipolle, rucola, scaglie di parmigiano, salsa mayo e senape", [1, 3, 7, 10]),
    CUC("Vegburger", "Buns", "hamburger vegano — ricetta da definire", [1]),

    // — Crostoni —
    CUC("Burro alle erbe e alici", "Crostoni", "Pane tostato, burro montato con erbe aromatiche, acciuga del Cantabrico, zesti di limone", [1, 4, 7]),
    CUC("Baccalà mantecato", "Crostoni", "Pane tostato, baccalà mantecato, erba cipollina", [1, 4]),

    // — Sfizi —
    CUC("Fish & Chips", "Sfizi", "Black Cod (merluzzo carbonaro) in pastella, chips di patate con buccia, salsa tartara (maionese, cetriolini sott'aceto, capperi. Servito con salsa Worchestershire)", [1, 3, 4]),
    CUC("Panella e tartare di carne", "Sfizi", "Farina di ceci, tartare di manzo, maionese di cappero, maionese di acciughe, tuorlo marinato, aneto e ravanello.", [3, 4]),
    CUC("Scagghiozza", "Sfizi", "Polenta, salsa verde, acciughe del Cantabrico/Lingua di bovino", [4]),
    CUC("Falafel", "Sfizi", "ceci, prezzemolo, cumino, coriandolo, za'atar. Servito con Tzatziki", []),
    CUC("Mix", "Sfizi", "1 pz di: panella, scagghiozza e falafel.", []),
    CUC("Frittata di Pasta alla Napoletana: Genovese", "Sfizi", "Spaghettone, cipolle, manzo, sedano, carote, besciamella, sale, pepe, farina e panko.", [1, 9]),
    CUC("Frittata di Pasta alla Napoletana: Carbonara", "Sfizi", "Spaghettone, Salsa carbonara (tuorlo d'uovo, pecorino, parmigiano, pepe), besciamella, guanciale, farina e Panko", [1, 3, 7, 12]),

    // — Insalatine —
    CUC("Oriental Crunch", "Insalatine", "misticanza, Dressing agli Agrumi (agrumi, soia, olio di semi, aglio e pepe), pomodori confit, Formaggio al Cocco, mela, noci", [6, 8]),

    // — Piatti —
    CUC("Carpaccio di tonno", "Piatti", "tonno, cetriolo, menta, mela, Dressing agli Agrumi (agrumi, soia, olio di semi, aglio e pepe)", [4, 6]),
    CUC("Caprese", "Piatti", "Selezione di pomodorini, basilico, Mozzarella di bufala (250 g), olio e sale maldon", [7]),
    CUC("Carpaccio di Black Angus", "Piatti", "carpaccio di Black Angus, rucola, scaglie di parmigiano", [7]),

    // — Signature —
    CUC("Crispy tamago", "Signature", "maionese di baccalà, gel umadashi (Brodo verdure, salsa di soia), uovo poché panato nel panko e fritto, coste di bietola osmotizzate con soia affumicata al katsuobushi, erba cipollina, sale maldon", [1, 3, 4, 6, 9])
  ]
};

// ============================================================
// CLIENTE · il baretto — BEVERAGE / drink list completa
// Estratta da baretto_beverage_list. Prezzi in € (numeri). desc = ingredienti.
// Allergeni lasciati vuoti: da assegnare a mano dall'app.
// ============================================================
const BEV = (name, section, desc, price) => ({ name, section, desc, story: "", image: null, price, allergens: [] });

const BARETTO_BEVERAGE = {
  name: "Beverage",
  category: "cocktail",
  date: "",
  price: null,
  chef: "il baretto",
  seats: 8,
  chefNote: "Cocktail bar & wine bar · Via Consolare Pompea 1289, Messina · @il_baretto_me",
  dishes: [
    // — Soft Drink —
    BEV("Acqua San Benedetto", "Soft Drink", "in lattina, naturale / frizzante", 1),
    BEV("Spremuta d'Arancia", "Soft Drink", "", 3.5),
    BEV("Spremuta di Pompelmo", "Soft Drink", "", 3.5),
    BEV("Spremuta di Pompelmo / Lime", "Soft Drink", "", 4),
    BEV("Bibite alla Spina", "Soft Drink", "Coca-Cola, Schweppes Tonica/Lemon", 3.5),
    BEV("Bibite Artigianali Siciliane \"Cugini Caruso\"", "Soft Drink", "Ginger Beer / Spuma / Aranciata / Chinotto / Mandarinata e Cola", 5),
    BEV("Bibite Fever Tree - Three Cents", "Soft Drink", "Grapefruit Soda / Aegean Tonic / Dry Tonic", 4),

    // — Amari —
    BEV("Amara", "Amari", "", 5),
    BEV("Brancamenta", "Amari", "", 5),
    BEV("Fernet-Branca", "Amari", "", 5),
    BEV("Cynar", "Amari", "", 5),
    BEV("Jägermeister", "Amari", "", 5),
    BEV("Maliquò", "Amari", "", 5),

    // — Grappe —
    BEV("Casta", "Grappe", "Grappa di Prosecco", 7),
    BEV("Nardini", "Grappe", "Grappa Barrique", 6),

    // — Cocktail · I Grandi Classici —
    BEV("Aviation", "I Grandi Classici", "Gin Bombay Dry, Liquore di Marasche, Crema di Violetta, Succo di Limone", 8),
    BEV("Cardinale", "I Grandi Classici", "Gin Tanqueray, Noilly Prat, Campari", 8),
    BEV("French '57", "I Grandi Classici", "Gin Bombay Dry, Prosecco, Succo di Lime, Zucchero", 8),
    BEV("Hanky-Panky", "I Grandi Classici", "Gin Bombay Dry, Vermouth Berto, Fernet-Branca", 8),
    BEV("Bramble", "I Grandi Classici", "Gin Bombay Sapphire, Liquore di More, Succo di Lime, Zucchero", 8),
    BEV("Negroni Riserva", "I Grandi Classici", "Gin Bombay Dry, Bitter Martini Riserva Speciale, Vermouth Rubino Riserva Speciale", 10),
    BEV("Americano Martini", "I Grandi Classici", "Bitter Martini Riserva Speciale, Vermouth Rubino Riserva Speciale, Soda", 8),
    BEV("Maker's Mint Julep", "I Grandi Classici", "Whiskey Bourbon Maker's Mark, Menta fresca, Zucchero", 10),
    BEV("Redhook", "I Grandi Classici", "Whiskey Rye Jim Beam, Liquore di Marasche, Punt e Mes", 8),
    BEV("Stinger", "I Grandi Classici", "Cognac, Liquore alla Menta", 8),
    BEV("New York Sour", "I Grandi Classici", "Whiskey Bourbon Jim Beam, Porto Rosso, Succo di Limone, Zucchero, Acqua Faba/Chiara d'Uovo", 8),

    // — Cocktail · Quota Rosa —
    BEV("Paloma", "Quota Rosa", "Tequila Cazadores, Succo di Lime, Sciroppo di Agave Bio, Soda al Pompelmo Rosa", 9),
    BEV("Ancho Paloma", "Quota Rosa", "Mezcal, Ancho Reyes, Succo di Lime, Sciroppo di Agave Bio, Soda al Pompelmo Rosa", 9),
    BEV("Daiquiri Hemingway", "Quota Rosa", "Rum Bacardi Carta Blanca, Liquore di Marasche, Succo di Pompelmo Rosa, Succo di Lime", 9),
    BEV("Gallo", "Quota Rosa", "Gin Bombay Sapphire, Bitter Berto, Succo di Lime, Succo di Pompelmo Rosa, Zucchero", 9),
    BEV("Coral", "Quota Rosa", "Gin Bombay Sapphire, Amara, Bitter all'Arancia, Succo di Lime, Succo di Pompelmo, Zucchero", 9),
    BEV("Palmalive", "Quota Rosa", "Tequila Cazadores, Ancho Reyes Verde, Sciroppo d'Agave (bio), Tabasco Jalapeño Verde, Succo di Lime, Soda al Pompelmo Rosa", 9),

    // — Cocktail · Barettology · Tropicali —
    BEV("Mai Tai", "Barettology · Tropicali", "Jamaican Rum, Spiced Rum, Orange Curaçao, Succo di Lime, Sciroppo di Orzata", 8),
    BEV("Passion Rita", "Barettology · Tropicali", "Tequila Cazadores, Sciroppo di Agave (Bio), Passion Fruit, Succo di Lime", 9),
    BEV("Castaway", "Barettology · Tropicali", "Tequila Cazadores, Sciroppo di Agave (bio), Succo di Ananas, Succo di Lime, Peperoncino", 9),
    BEV("Platano", "Barettology · Tropicali", "Rum Plantation, Liquore alla Banana, Succo di Lime, Purea di Banane", 10),
    BEV("Singapore Sling", "Barettology · Tropicali", "Gin Bombay Dry, Liquore alla Ciliegia, Liquore all'Arancia, Succo di Ananas, Succo di Lime, Granatina", 9),
    BEV("Grapeon", "Barettology · Tropicali", "Whiskey Bourbon Jim Beam, Purea di Ananas, Succo di Pompelmo Rosa, Angostura", 9),
    BEV("Tia Mia", "Barettology · Tropicali", "Jamaican Rum, Mezcal, Orange Curaçao, Sciroppo d'Orzata, Succo di Lime", 10),
    BEV("Pisco Sour", "Barettology · Tropicali", "Pisco, Bitter Amargo Chuncho, Succo di Lime, Zucchero, Acqua Faba/Chiara d'Uovo", 10),
    BEV("Alive", "Barettology · Tropicali", "Tequila Cazadores, Ancho Reyes Verde, Sciroppo d'Agave (bio), Tabasco Jalapeño Verde, Succo di Lime", 10),
    BEV("Margalice", "Barettology · Tropicali", "Tequila Cazadores, Sciroppo d'Agave (bio), Succo di Lime, Peperoncino, Sale Rosa", 9),

    // — Cocktail · Barettology · Freschi —
    BEV("Garibaldi", "Barettology · Freschi", "Bitter, Succo d'Arancia", 8),
    BEV("Mancino", "Barettology · Freschi", "Vodka al Mandarino, Succo di Limone, Sciroppo di Zucchero", 9),
    BEV("Harvey Wallbanger", "Barettology · Freschi", "Vodka Below 42°, Galliano, Succo d'Arancia", 8),
    BEV("Civico 1289", "Barettology · Freschi", "Vermouth Rosso, Bitter, Bitter Cardamomo, Ginger Beer", 9),
    BEV("Ginger Mojito", "Barettology · Freschi", "Rum Bacardi Carta Blanca, Succo di Lime, Menta, Sciroppo di Zenzero, Ginger Beer", 9),

    // — Cocktail · Barettology · W Maria (Bloody) —
    BEV("Bloody Mary", "Barettology · W Maria", "Vodka Below 42°, Succo di Pomodoro, Succo di Lime, Salsa Worcester, Pepe Nero, Sale, Tabasco", 8),
    BEV("Bloody Mezcal", "Barettology · W Maria", "Mezcal, Ancho Reyes, Bitter al Sedano, Succo di Pomodoro, Succo di Lime, Salsa Worcester, Pepe Nero, Sale, Tabasco", 10),
    BEV("Bloody Grey", "Barettology · W Maria", "Vodka Grey Goose, Bitter al Sedano, Succo di Pomodoro, Succo di Lime, Salsa Worcester, Tabasco, Pepe Nero, Sale", 10),

    // — Cocktail · Barettology · Patron —
    BEV("Espresso Patron", "Barettology · Patron", "Tequila Patron Silver, Tequila Patron XO Café, Caffè Espresso", 12),
    BEV("Manhattan Patron", "Barettology · Patron", "Tequila Patron Reposado, Vermouth Rubino Riserva Speciale, Angostura", 12),
    BEV("Patron Perfect Margarita", "Barettology · Patron", "Tequila Patron Silver, Patron Citronge, Succo di Lime, Succo d'Arancia", 12),
    BEV("Patron Tommy's Margarita", "Barettology · Patron", "Tequila Patron Reposado, Sciroppo di Agave (bio), Succo di Lime", 12),
    BEV("Patronic", "Barettology · Patron", "Tequila Patron Silver, Acqua Tonica, Succo di Lime", 10),

    // — Cocktail · Barettology · Herbal —
    BEV("Sagerita", "Barettology · Herbal", "Tequila Cazadores, St. Germain, Succo di Lime, Succo d'Arancia, Succo di Limone, Salvia", 9),
    BEV("Basilio", "Barettology · Herbal", "Vodka Below 42° / Gin Bombay Dry, Succo di Lime, Basilico, Sciroppo di Zucchero", 8),
    BEV("South Side", "Barettology · Herbal", "Gin Bombay Dry, Succo di Lime, Sciroppo di Zucchero, Menta", 8),

    // — Cocktail · Analcolici —
    BEV("Analcolico alla Frutta", "Analcolici", "", 7),
    BEV("Virgin Mojito", "Analcolici", "Ginger Ale, Succo di Lime, Menta", 8),
    BEV("Virgin Mule", "Analcolici", "Ginger Ale, Sciroppo di Zenzero, Succo di Lime, Menta", 8),
    BEV("Virgin Garibaldi", "Analcolici", "Martini Vibrante, Succo d'Arancia, Succo di Passionfruit", 8),
    BEV("Virgin Spritz", "Analcolici", "Martini Aperitivo Floreale / Vibrante, Soda", 8),
    BEV("Virgin Bloody", "Analcolici", "Succo di Pomodoro, Succo di Lime, Salsa Worcester, Pepe Nero, Sale, Tabasco", 8),
    BEV("Tanqueray 0,0% Tonic", "Analcolici", "Tanqueray 0,0, Tonica", 8),
    BEV("A-Paloma", "Analcolici", "Succo di Lime, Sciroppo di Agave Bio, Soda al Pompelmo Rosa", 8),
    BEV("Paloma 0,0", "Analcolici", "Tanqueray 0,0, Succo di Lime, Succo di Pompelmo, Sciroppo d'Agave, Soda al Pompelmo Rosa", 8),

    // — Birre —
    BEV("Beck's", "Birre", "33cl · Pilsner · 5%", 4),
    BEV("Corona", "Birre", "33cl · Lager · 4,5%", 5),
    BEV("Aro", "Birre", "33cl · American Pale Ale (Gluten free) · 4,7%", 6),
    BEV("Freak Ambrata", "Birre", "33cl · Con miele dell'Etna · 7%", 6),
    BEV("Malastrana", "Birre", "40cl · Pilsner · 4,7%", 6),
    BEV("Alternative", "Birre", "33cl · Fruit and Juicy IPA · 6,7%", 6),
    BEV("Freak IPA", "Birre", "33cl · Con scorze di limone di Sicilia · 6%", 6),
    BEV("Reveille", "Birre", "33cl · White IPA · 6,5%", 6),
    BEV("Flooke", "Birre", "33cl · Amber Lager · 6,5%", 6),
    BEV("Corona Cero", "Birre", "33cl · Lager 0.0%", 5),
    BEV("Begrapeful", "Birre", "33cl · Italian Grape Ale · 5,2%", 6),

    // — Distillati · Whisky —
    BEV("Johnnie Walker Red Label", "Whisky", "", 6),
    BEV("Johnnie Walker Black Label", "Whisky", "", 8),
    BEV("Bushmills", "Whisky", "", 6),
    BEV("Bushmills 10", "Whisky", "", 10),
    BEV("Bushmills Black", "Whisky", "", 8),
    BEV("Hatozaki", "Whisky", "", 10),
    BEV("Hatozaki Pure Malt", "Whisky", "", 12),
    BEV("Jameson", "Whisky", "", 6),
    BEV("Jim Beam", "Whisky", "", 7),
    BEV("Jim Beam Rye", "Whisky", "", 7),
    BEV("Knob Creek", "Whisky", "", 10),
    BEV("Laphroaig 10", "Whisky", "", 8),
    BEV("Maker's Mark", "Whisky", "", 8),
    BEV("Old Virginia", "Whisky", "", 6),
    BEV("Paddy", "Whisky", "", 6),
    BEV("Pig's Nose", "Whisky", "", 8),
    BEV("Talisker Skye", "Whisky", "", 8),

    // — Distillati · Rum —
    BEV("Diplomatico", "Rum", "", 8),
    BEV("Diplomatico Mantuano", "Rum", "", 9),
    BEV("Diplomatico Seleccion de la Familia", "Rum", "", 10),
    BEV("Myer's Rum", "Rum", "", 6),
    BEV("Bacardi Carta Oro", "Rum", "", 6),
    BEV("Plantation", "Rum", "", 8),
    BEV("Plantation Isle of Fiji", "Rum", "", 10),
    BEV("Santa Teresa", "Rum", "", 8),

    // — Distillati · Gin —
    BEV("Beefeater", "Gin", "", 7),
    BEV("Berto", "Gin", "", 9),
    BEV("Bobby's", "Gin", "", 10),
    BEV("Bombay Dry", "Gin", "", 7),
    BEV("Bond 47°", "Gin", "", 10),
    BEV("Burnett's", "Gin", "", 10),
    BEV("Citadelle", "Gin", "", 10),
    BEV("Citadelle Jardin d'Eté", "Gin", "", 10),
    BEV("Citadelle Reserve", "Gin", "", 10),
    BEV("Edimburgh", "Gin", "", 9),
    BEV("Elephant", "Gin", "", 11),
    BEV("Elephant Orange", "Gin", "", 11),
    BEV("Genever", "Gin", "", 10),
    BEV("Gil", "Gin", "", 10),
    BEV("Gil Peated", "Gin", "", 11),
    BEV("Greenall's", "Gin", "", 8),
    BEV("Hendrick's", "Gin", "", 9),
    BEV("Ionico", "Gin", "", 10),
    BEV("Mongibello", "Gin", "", 10),
    BEV("Martin Miller's", "Gin", "", 9),
    BEV("Opihr", "Gin", "", 9),
    BEV("Plymouth", "Gin", "", 9),
    BEV("Plymouth 57", "Gin", "", 10),
    BEV("Bombay Sapphire", "Gin", "", 8),
    BEV("Principe de los Apostoles", "Gin", "", 11),
    BEV("Principe de los Apostoles Rosa", "Gin", "", 11),
    BEV("Roku", "Gin", "", 9),
    BEV("Silvius", "Gin", "", 10),
    BEV("Tanqueray", "Gin", "", 7),
    BEV("Tanqueray Ten", "Gin", "", 10),
    BEV("The London No.1", "Gin", "", 10),

    // — Distillati · Tequila —
    BEV("Altos", "Tequila", "", 8),
    BEV("Cazadores", "Tequila", "", 6),
    BEV("Espolon", "Tequila", "", 7),
    BEV("Arette Blanco", "Tequila", "", 9),
    BEV("Arette Reposado", "Tequila", "", 10),
    BEV("Corralejo 99000", "Tequila", "", 14),
    BEV("Jose Cuervo Tradicional", "Tequila", "", 8),
    BEV("Patron Silver", "Tequila", "", 10),
    BEV("Calle 23 Reposado", "Tequila", "", 11),
    BEV("Nuestra Soledad", "Tequila", "", 10),
    BEV("Patron Reposado", "Tequila", "", 11),
    BEV("Patron Añejo", "Tequila", "", 12),
    BEV("Sotol Hacienda de Chihuahua", "Tequila", "", null),

    // — Distillati · Mezcal —
    BEV("Bruxo", "Mezcal", "", 12),
    BEV("Calle 23", "Mezcal", "", 10),
    BEV("Yuu Baal 40", "Mezcal", "", 9),
    BEV("Yuu Baal 46", "Mezcal", "", 10),
    BEV("Alipus San Juan", "Mezcal", "", 10),
    BEV("Sotol", "Mezcal", "", 12),
    BEV("Herencia de Sanchez", "Mezcal", "", 10),
    BEV("Vida", "Mezcal", "", 10),
    BEV("Pechiga Yuu Baal", "Mezcal", "", 11),
    BEV("Nuestra Soledad", "Mezcal", "", 10),

    // — Distillati · Vodka —
    BEV("Below 42", "Vodka", "", 6),
    BEV("Beluga", "Vodka", "", 11),
    BEV("Grey Goose", "Vodka", "", 9),
    BEV("Koskenkorva", "Vodka", "", 7),
    BEV("Our Berlin", "Vodka", "", 7),
    BEV("Russian Standard", "Vodka", "", 7),
    BEV("Stolichnaya", "Vodka", "", 7),
    BEV("Vestal", "Vodka", "", 8),
    BEV("Zubrowka", "Vodka", "", 7),
    BEV("Vodka F.lli Pistone", "Vodka", "", 7),
    BEV("Absolut Mandarin", "Vodka", "", 7),

    // — Distillati · Tonica (supplemento) —
    BEV("Schweppes", "Tonica (supplemento)", "", 1),
    BEV("Fever Tree / Three Cents", "Tonica (supplemento)", "", 3),
    BEV("Tonica 1724", "Tonica (supplemento)", "", 3)
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
  barettoCucina: BARETTO_CUCINA,
  barettoBeverage: BARETTO_BEVERAGE
};

const EMPTY_MENU = {
  name: "Nuovo Menu",
  category: "tematico",
  date: "",
  price: 0,
  chef: "",
  seats: 8,
  chefNote: "",
  layout: {},   // posizioni drag&drop per variante: { [variante]: { [id]: {x,y,s,h} } }
  sectionMeta: {},  // per nome sezione: { divider: separatore arancione prima, takeaway: sezione asporto }
  grid: {},     // impaginazione per variante: { [variante]: { cols, perPage } }  (perPage 0 = auto)
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
    grid: m.grid || {},
    sectionMeta: m.sectionMeta || {},
    dishes: (m.dishes || []).map(d => ({
      name: d.name || "",
      section: d.section || "",
      desc: d.desc || "",
      story: d.story || "",
      image: d.image || null,
      price: (d.price === 0 || d.price) ? d.price : null,
      takeaway: !!d.takeaway,
      allergens: d.allergens || []
    }))
  };
}

Object.assign(window, { ALLERGENI, PRESET_MENUS, EMPTY_MENU, normalizeMenu });
