/* Mi Plato Inteligente — reglas de restricciones v0.2 (propuesta, 8-nov-2026)
   Referencias generales: Codex CXS 1-1985 (rev. 2018) y RTCA 67.01.07:10; complemento: FDA (sésamo, nueces de árbol).
   Solo excluye ingredientes. No certifica ausencia de contaminación cruzada ni de trazas. */

/* 1) ETIQUETAS: una por cada cosa que se puede excluir. Cada una lleva sus nombres y derivados (ES/EN).
      El motor busca estos nombres, sin tildes ni mayúsculas, como palabras completas (admite plural). */
const ETIQUETAS = {
  leche:     ["leche", "lacteo", "queso", "yogur", "yogurt", "mantequilla", "crema", "natilla", "requeson", "helado", "suero de leche", "caseina", "lactosa", "ghee", "nata", "mozzarella", "parmesano", "cheddar", "ricotta", "paneer", "feta", "halloumi", "gouda", "brie", "burrata", "manchego", "gruyere", "provolone", "bechamel", "besamel", "milk", "dairy", "cheese", "butter", "cream", "whey", "casein", "lactose", "ice cream"],
  huevo:     ["huevo", "clara", "yema", "mayonesa", "merengue", "albumina", "omelette", "omelet", "tortilla francesa", "egg", "mayonnaise", "meringue", "albumin"],
  pescado:   ["pescado", "atun", "salmon", "sardina", "tilapia", "dorado", "corvina", "bacalao", "anchoa", "trucha", "mariscada", "salsa de pescado", "worcestershire", "salsa inglesa", "fish", "tuna", "cod", "anchovy", "trout", "fish sauce"],
  crustaceo: ["camaron", "cangrejo", "langosta", "langostino", "jaiba", "krill", "shrimp", "prawn", "crab", "lobster", "crayfish", "crawfish"],
  molusco:   ["calamar", "pulpo", "almeja", "mejillon", "ostion", "ostra", "caracol", "vieira", "squid", "octopus", "clam", "mussel", "oyster", "scallop", "snail"],
  mani:      ["mani", "cacahuate", "cacahuete", "peanut"],
  soya:      ["soya", "soja", "tofu", "tempeh", "edamame", "miso", "salsa de soya", "salsa de soja", "shoyu", "tamari", "natto", "soy", "soybean", "soy sauce"],
  trigo:     ["trigo", "harina", "pan", "pasta", "fideo", "espagueti", "macarron", "tallarin", "semola", "cuscus", "bulgur", "seitan", "galleta", "penne", "lasana", "lasagna", "fusilli", "ravioli", "tortellini", "gnocchi", "noqui", "orzo", "udon", "ramen", "panko", "pita", "pizza", "tempura", "rebozado", "empanizado", "pan molido", "tortilla de harina", "espelta", "kamut", "wheat", "flour", "bread", "noodle", "spaghetti", "couscous", "semolina", "breadcrumb", "cracker", "spelt"],
  gluten_otros: ["centeno", "cebada", "avena", "malta", "cerveza", "rye", "barley", "oat", "oats", "malt", "beer"],
  nueces:    ["almendra", "nuez", "nueces", "pecana", "anacardo", "marañon", "maranon", "pistacho", "avellana", "macadamia", "castaña", "castana", "piñon", "pinon", "almond", "walnut", "pecan", "cashew", "pistachio", "hazelnut", "chestnut", "pine nut"], // el coco NO se incluye (criterio FDA, 2025)
  sesamo:    ["sesamo", "ajonjoli", "tahini", "tahina", "sesame"],
  sulfitos:  ["sulfito", "metabisulfito", "e220", "e221", "e222", "e223", "e224", "e225", "e226", "e227", "e228", "vino", "vinagre balsamico", "vinagre de vino", "fruta seca", "fruta deshidratada", "uva pasa", "pasas", "orejon", "albaricoque seco", "wine", "balsamic vinegar", "dried fruit", "raisin", "sulfite", "sulphite"],
  carne:     ["res", "cerdo", "cordero", "carne", "chuleta", "lomo", "costilla", "tocino", "jamon", "manteca de cerdo", "caldo de res", "beef", "pork", "lamb", "meat", "bacon", "ham", "lard"],
  ave:       ["pollo", "pavo", "pato", "gallina", "caldo de pollo", "chicken", "turkey", "duck", "chicken broth"],
  embutido:  ["chorizo", "salchicha", "salchichon", "mortadela", "longaniza", "sausage", "salami", "hot dog"],
  gelatina:  ["gelatina", "gelatin"],
  miel:      ["miel", "honey"],
  // Embarazo (reglas firmes de seguridad): frases específicas, para no marcar una ensalada de tomate crudo.
  crudo:     ["pescado crudo", "pescados crudos", "mariscos crudos", "marisco crudo", "carne cruda", "carnes crudas", "huevo crudo", "huevos crudos", "huevo poco cocido", "huevos poco cocidos", "yema cruda", "brotes crudos", "brotes de alfalfa", "alfalfa", "sushi", "sashimi", "ceviche", "carpaccio", "tartar de", "steak tartare", "atun sellado", "atun rosado", "raw fish", "raw egg", "raw eggs", "raw shellfish", "raw oysters", "undercooked egg", "undercooked eggs", "runny egg", "seared tuna", "raw sprouts"],
  sin_pasteurizar: ["sin pasteurizar", "no pasteurizado", "no pasteurizada", "leche cruda", "queso crudo", "unpasteurized", "unpasteurised", "raw milk", "raw cheese"],
  alto_mercurio: ["tiburon", "pez espada", "marlin", "caballa rey", "caballa real", "blanquillo", "reloj anaranjado", "atun rojo", "atun ojo grande", "shark", "swordfish", "king mackerel", "tilefish", "bigeye tuna", "orange roughy", "bluefin tuna"],
  // Medicamentos: toronja (estatinas).
  // Reglas de condiciones de salud (documento plato-condiciones-salud-medicamentos.md): solo lo que el documento manda evitar.
  bebida_azucarada: ["jugo", "refresco", "gaseosa", "soda", "kefir de agua", "kefir de azucar", "tibicos", "juice", "soft drink", "water kefir", "sugar kefir"],
  dulce:     ["azucar", "panela", "miel", "jarabe", "sirope", "melaza", "mermelada", "dulce de leche", "caramelo", "sugar", "syrup", "molasses", "jam", "honey", "caramel", "brown sugar"],
  harina_refinada: ["harina de trigo", "harina blanca", "pan blanco", "pan molido", "pan rallado", "all-purpose flour", "white flour", "white bread", "breadcrumbs"],
  alcohol:   ["vino tinto", "vino blanco", "vino de cocina", "copa de vino", "cerveza", "licor", "ron", "whisky", "vodka", "brandy", "tequila", "red wine", "white wine", "cooking wine", "beer", "liquor", "rum"],
  frito:     ["frito", "frita", "fritos", "fritas", "fritura", "freir", "fried", "deep fried", "deep-fried", "frying"],
  viscera:   ["higado", "rinon", "mollejas", "menudo", "visceras", "higado de res", "organ meat", "organ meats", "liver", "kidney", "sweetbreads", "offal"],
  // Área digestiva (la persona elige sus desencadenantes; NIDDK: reflujo y colon irritable).
  citrico:   ["limon", "lima", "naranja", "mandarina", "toronja", "pomelo", "citrico", "lemon", "lime", "orange", "tangerine", "grapefruit", "citrus"],
  tomate:    ["tomate", "ketchup", "catsup", "tomato"],
  cafe:      ["cafe", "espresso", "cafeina", "coffee", "caffeine"],
  chocolate: ["chocolate", "cacao", "cocoa"],
  menta:     ["menta", "hierbabuena", "yerbabuena", "peppermint", "spearmint", "mint"],
  picante:   ["picante", "chile", "aji", "jalapeno", "cayena", "chili", "chilli", "spicy", "jalapeno", "cayenne"],
  grasoso:   ["tocino", "chicharron", "manteca", "bacon", "lard", "pork rinds"],
  fodmap:    ["cebolla", "ajo", "repollo", "hongo", "champinon", "manzana", "mango", "sorbitol", "xilitol", "manitol", "maltitol", "onion", "garlic", "cabbage", "mushroom", "apple", "sorbitol", "xylitol", "mannitol"],
  // Genética (NIH, NICHD, MedlinePlus): PKU, galactosemia, hemocromatosis.
  legumbre:  ["frijol", "lenteja", "garbanzo", "arveja", "guisante", "edamame", "tofu", "tempeh", "seitan", "bean", "lentil", "chickpea", "pea"],
  aspartamo: ["aspartamo", "aspartame"],
  suplemento_hierro: ["suplemento de hierro", "suplementos de hierro", "suplemento de vitamina c", "iron supplement", "vitamin c supplement"],
  sal_sustituta: ["sal sustituta", "sal sin sodio", "sustituto de sal", "salt substitute", "lite salt"],
  toronja:   ["toronja", "pomelo", "grapefruit"],
};

/* 2) FRASES QUE ENGAÑAN: se eliminan o se reescriben ANTES de buscar (evitan falsos positivos y falsos negativos). */
const FRASES_NEUTRAS = ["chile dulce", "sweet chili", "ajo porro", "stir-fried", "stir fried", "sofrito", "nuez moscada", "nutmeg", "mantequilla de cacao", "cocoa butter", "pasta de arroz", "fideos de arroz", "rice noodles", "harina de arroz", "harina de maiz", "harina de garbanzo", "pan de maiz", "tortilla de maiz", "corn tortilla", "sin gluten", "gluten free", "gluten-free", "crema de coco", "coconut cream", "leche de coco", "coconut milk", "mantequilla de coco", "pasta de tomate", "tomato paste"];
// "leche de almendra", "mantequilla de maní"…: se quita la primera palabra y queda el ingrediente real (almendra, maní).
/* Jugo de limón o lima como condimento: no cuenta como «jugo» azucarado, pero sigue siendo cítrico. */
const FRASES_JUGO_CITRICO = ["jugo de limon", "jugo de lima", "jugo de un limon", "jugo de medio limon", "jugo de 1 limon", "jugo de 1/2 limon", "jugo de naranja agria", "zumo de limon", "lemon juice", "lime juice", "juice of lemon", "juice of lime", "juice of 1 lemon", "juice of half a lemon"];
const RE_FALSO_LACTEO = /\b(leche|mantequilla|crema|queso|yogur|yogurt|helado|milk|butter|cheese|cream)\s+(de|of)\s+(almendras?|mani|cacahuate|soya|soja|avena|arroz|anacardos?|marañon|maranon|nueces|nuez|sesamo|ajonjoli|almonds?|peanut|soy|oat|rice|cashews?|sesame)/g;

/* 3) RESTRICCIONES: tres grupos independientes. Cada opción apunta a etiquetas. */
const GRUPOS = {
  alergias: {            // exclusión obligatoria, siempre incluye derivados
    leche: ["leche"], huevo: ["huevo"], pescado: ["pescado"], mariscos: ["crustaceo", "molusco"], // crustáceos y moluscos juntos (una sola opción en el cuestionario)
    mani: ["mani"], soya: ["soya"], trigo: ["trigo"], nueces: ["nueces"], sesamo: ["sesamo"], sulfitos: ["sulfitos"],
  },
  evitar: {              // según la selección; no equivalen a alergia
    gluten: ["trigo", "gluten_otros"],
    lactosa: ["leche"],  // salvo ingredientes marcados «sin lactosa» (ver detectar)
    lacteos: ["leche"],
    // Área digestiva: solo se aplican si la persona marcó Gastroenterología y eligió el desencadenante.
    "dg-citricos": ["citrico"], "dg-tomate": ["tomate"], "dg-cafe": ["cafe"], "dg-chocolate": ["chocolate"], "dg-menta": ["menta"],
    "dg-picante": ["picante"], "dg-alcohol": ["alcohol"], "dg-grasas": ["frito", "grasoso", "embutido"],
    "gn-galactosemia": ["leche"],   // MedlinePlus: sin leche ni productos con leche, de por vida
    "gn-pku": ["carne", "ave", "embutido", "pescado", "crustaceo", "molusco", "huevo", "leche", "mani", "nueces", "soya", "legumbre", "aspartamo"],   // NICHD: alimentos altos en proteína y aspartamo; la cantidad la define el profesional
    "gn-hemocromatosis": ["crudo", "suplemento_hierro"],   // NIDDK: sin mariscos crudos ni suplementos de hierro o vitamina C
    "dg-fodmap": ["fodmap", "miel", "leche", "trigo"],   // dieta baja en FODMAP indicada por el médico (lácteos con lactosa, trigo, miel, cebolla, ajo…)
  },
  dieta: {               // qué NO se permite en cada tipo de alimentación
    omnivora: [],
    vegetariana: ["carne", "ave", "embutido", "pescado", "crustaceo", "molusco", "gelatina"],
    vegana: ["carne", "ave", "embutido", "pescado", "crustaceo", "molusco", "gelatina", "leche", "huevo", "miel"],
    pescetariana: ["carne", "ave", "embutido", "gelatina"],
    vegetal: ["carne", "ave", "embutido", "gelatina"], // + máximo 1 ingrediente animal (pescado, lácteo, huevo, miel)
  },
  condicion: {           // condiciones de salud con reglas firmes de seguridad (el resto solo orienta o avisa, ver index.html)
    embarazo: ["crudo", "sin_pasteurizar", "alto_mercurio"],
    endocrina: ["bebida_azucarada", "dulce", "harina_refinada", "frito"],   // diabetes, prediabetes, obesidad
    cardiovascular: ["bebida_azucarada", "dulce", "alcohol"],
    hepatica: ["bebida_azucarada", "alcohol"],
    renal: ["sal_sustituta", "embutido", "frito"],
    reumatologia: ["viscera"],   // gota: la Clínica Mayo dice «no coma» vísceras
  },
  medicamento: {         // único bloqueo por medicamentos: toronja con estatinas (el resto son avisos de horario o cantidad)
    estatinas: ["toronja"],
  },
};
const MAX_ANIMAL_VEGETAL = 1;
const ANIMALES = ["pescado", "crustaceo", "molusco", "leche", "huevo", "miel"];

const AVISOS = { // textos fijos que la aplicación muestra
  es: {
    general: "La aplicación excluye ingredientes. No garantiza la ausencia de trazas ni de contaminación cruzada: revise siempre las etiquetas de los productos envasados.",
    sulfitos: "No se puede garantizar la ausencia de sulfitos en productos cuya composición no se puede verificar. Revise la etiqueta.",
    gluten: "Evitar gluten aquí significa excluir ingredientes con gluten. No equivale a una dieta apta para enfermedad celíaca.",
    libre: "Un alimento escrito por la persona no se pudo verificar contra la lista: se excluye por su nombre, sin sus derivados.",
  },
  en: {
    general: "The app excludes ingredients. It does not guarantee the absence of traces or cross-contamination: always check labels on packaged products.",
    sulfitos: "The absence of sulfites cannot be guaranteed in products whose composition cannot be verified. Check the label.",
    gluten: "Avoiding gluten here means excluding gluten-containing ingredients. It is not equivalent to a diet suitable for celiac disease.",
    libre: "A food typed in by the person could not be checked against the list: it is excluded by name only, without its derivatives.",
  },
};

/* 4) LÓGICA */
const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s\-]/g, " ").replace(/\s+/g, " ").trim();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const ALIAS = Object.entries(ETIQUETAS).flatMap(([tag, names]) => names.map((n) => ({ tag, re: new RegExp("\\b" + esc(norm(n)) + "(s|es)?\\b") })));

/** Etiquetas que contiene un ingrediente escrito. Devuelve {tags:Set, sinLactosa:boolean}. */
function detectar(texto, lang) {
  let t = " " + norm(texto) + " ";
  const sinLactosa = /\b(sin lactosa|deslactosad[ao]s?|lactose[- ]free)\b/.test(t);
  t = t.replace(/\b(sin lactosa|deslactosad[ao]s?|lactose[- ]free)\b/g, " ");
  FRASES_JUGO_CITRICO.forEach((f) => { t = t.split(norm(f)).join(" limon "); });
  FRASES_NEUTRAS.forEach((f) => { t = t.split(norm(f)).join(" "); });
  t = t.replace(RE_FALSO_LACTEO, "$3");
  if (lang === "en") t = t.replace(/\bpan\b/g, " "); // «pan» (español) no debe confundirse con «pan» (sartén) en inglés
  const tags = new Set();
  ALIAS.forEach(({ tag, re }) => { if (re.test(t)) tags.add(tag); });
  return { tags, sinLactosa };
}

/** Perfil: { alergias:[ids], evitar:[ids], dieta:"vegana"|…|null, libres:[textos escritos por la persona], condiciones:[ids], medicamentos:[ids] } */
function reglasDelPerfil(p) {
  const pick = (g, ids) => (ids || []).flatMap((id) => GRUPOS[g][id] || []);
  const libres = (p.libres || []).map(norm).filter(Boolean);
  return {
    alergia: new Set(pick("alergias", p.alergias)),
    evitar: new Set(pick("evitar", p.evitar)),
    soloLactosa: ((p.evitar || []).includes("lactosa") || (p.evitar || []).includes("dg-fodmap")) && !(p.evitar || []).includes("lacteos"),
    dieta: new Set(p.dieta ? GRUPOS.dieta[p.dieta] : []),
    salud: new Set([...pick("condicion", p.condiciones), ...pick("medicamento", p.medicamentos)]),
    vegetal: p.dieta === "vegetal",
    libres,
  };
}

/** ¿Es compatible un ingrediente? → {ok, motivos:[…]} */
function revisarIngrediente(texto, p, R = reglasDelPerfil(p)) {
  const { tags, sinLactosa } = detectar(texto, p.lang);
  const motivos = [];
  tags.forEach((tag) => {
    if (R.alergia.has(tag)) motivos.push({ grupo: "alergia", etiqueta: tag });
    else if (R.evitar.has(tag) && !(sinLactosa && R.soloLactosa && tag === "leche")) motivos.push({ grupo: "evitar", etiqueta: tag });
    else if (R.dieta.has(tag)) motivos.push({ grupo: "dieta", etiqueta: tag });
    else if (R.salud.has(tag)) motivos.push({ grupo: "salud", etiqueta: tag });
  });
  const n = norm(texto);
  R.libres.forEach((l) => { if (new RegExp("\\b" + esc(l) + "(s|es)?\\b").test(n)) motivos.push({ grupo: "libre", etiqueta: l }); });
  return { ok: motivos.length === 0, motivos, tags };
}

/** Etiquetas ya conocidas (p. ej. las de un plato del catálogo) → ¿compatibles? */
function revisarEtiquetas(tags, p, R = reglasDelPerfil(p)) {
  return !(tags || []).some((t) => R.alergia.has(t) || R.evitar.has(t) || R.dieta.has(t) || R.salud.has(t));
}

/** Receta: { ingredientes:[texto,…] }. Compatible solo si TODOS los ingredientes lo son. */
function validarReceta(receta, p) {
  const R = reglasDelPerfil(p), rechazos = [], animales = new Set();
  receta.ingredientes.forEach((ing) => {
    const r = revisarIngrediente(ing, p, R);
    if (!r.ok) rechazos.push({ ingrediente: ing, motivos: r.motivos });
    r.tags.forEach((t) => { if (ANIMALES.includes(t)) animales.add(t); });
  });
  if (R.vegetal && animales.size > MAX_ANIMAL_VEGETAL) rechazos.push({ ingrediente: "(receta)", motivos: [{ grupo: "dieta", etiqueta: "demasiado_animal" }] });
  return { ok: rechazos.length === 0, rechazos };
}

/** Lista de exclusión en texto, para incluirla en el prompt a Gemini (la validación final sigue siendo la de arriba). */
function listaParaPrompt(p) {
  const R = reglasDelPerfil(p), tags = new Set([...R.alergia, ...R.evitar, ...R.dieta, ...R.salud]);
  return [...tags].flatMap((t) => ETIQUETAS[t].filter((n) => !/^e2\d\d$/.test(n))).concat(R.libres);
}

const api = { ETIQUETAS, GRUPOS, AVISOS, detectar, reglasDelPerfil, revisarIngrediente, revisarEtiquetas, validarReceta, listaParaPrompt };
if (typeof module !== "undefined") module.exports = api; else window.MPI_REGLAS = api;
