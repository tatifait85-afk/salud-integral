/* Mi Plato Inteligente — armador propio de menús.
   Elige platos del catálogo (platos.js) con el filtro de restricciones (reglas.js), toma su receta (recetas.js),
   ajusta las cantidades a las porciones, arma el menú de 7 días y la lista de compras. No usa internet ni IA. */
(function (root) {
  "use strict";

  var MPI = typeof module !== "undefined" ? require("./reglas.js") : root.MPI_REGLAS;

  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s\/]/g, " ").replace(/\s+/g, " ").trim(); }

  /* ---------- Cantidades ---------- */
  var RE_QTY = /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?)(?=\s)/;
  function parseNum(t) {
    var m;
    t = String(t).trim();
    if ((m = /^(\d+)\s+(\d+)\/(\d+)$/.exec(t))) return +m[1] + m[2] / m[3];
    if ((m = /^(\d+)\/(\d+)$/.exec(t))) return m[1] / m[2];
    return parseFloat(t.replace(",", "."));
  }
  function fmtCuartos(x) {
    var w = Math.floor(x + 1e-9), f = Math.round((x - w) * 4) / 4;
    if (f >= 1) { w += 1; f = 0; }
    var fs = f === 0.25 ? "1/4" : f === 0.5 ? "1/2" : f === 0.75 ? "3/4" : "";
    if (!w && !fs) return "1/4";
    return (w ? String(w) : "") + (w && fs ? " " : "") + fs;
  }
  function redondearCuartos(v) { return Math.max(0.25, Math.round(v * 4) / 4); }
  function redondearGramos(v) { return v < 100 ? Math.max(5, Math.round(v / 5) * 5) : Math.round(v / 10) * 10; }

  var RE_PESO = /^(?:de\s+)?(g|ml)\b/i;
  var RE_PESO_GRANDE = /^(?:de\s+)?(kg|l)\b/i;
  var RE_VOL = /^(?:de\s+)?(tazas?|cdas?|cdtas?|cups?|tbsp|tsp)\b/i;
  var RE_PIZCA = /^(?:de\s+)?(pizcas?|pinch(?:es)?)\b/i;
  var RE_DISCRETO = /^(huevos?|eggs?|dientes?|cloves?|rebanadas?|slices?|tortillas?|pechugas?|breasts?|muslos?|thighs?|filetes?|fillets?|l[aá]minas?|sheets?|hojas?|leaves|leaf|bistecs?|steaks?|costillas?|aceitunas?|olives?|wontons?|wrappers?|panes?|buns?|latas?|cans?|tostadas?|pollos?|chickens?|berenjenas?|eggplants?|mangos?|mangoes|aguacates?|avocados?|lim[oó]n(?:es)?|lemons?|limas?|limes?)$/i;

  var STOP_ES = ["de", "del", "en", "para", "o", "y", "con", "sin", "al", "a", "por", "u", "tipo"];
  var STOP_EN = ["of", "in", "to", "for", "with", "and", "or", "on", "from", "per"];
  var UNIT_EN = ["cup", "cups", "tbsp", "tsp", "clove", "cloves", "slice", "slices", "sheet", "sheets", "can", "cans", "bunch", "bunches", "stalk", "stalks", "sprig", "sprigs", "head", "heads", "piece", "pieces", "portion", "portions", "strip", "strips", "pack", "packs"];
  var INVAR_ES = ["bok", "choy", "curry", "wonton", "wontons", "tofu", "tempeh", "quinoa", "miso", "alga", "nori"];
  var INVAR_EN = ["rice", "tofu", "broccoli", "spinach", "cheese", "pasta", "bread", "garlic", "fish", "shrimp", "asparagus", "tempeh", "quinoa", "oats", "choy", "bok", "g", "kg", "ml", "l", "tbsp", "tsp", "curry", "salt", "oil", "miso", "corn", "cauliflower", "lettuce", "celery", "cabbage", "ginger", "parsley", "basil", "culantro", "cilantro", "sugar", "milk", "water", "flour", "nori", "wakame", "polenta", "yogurt", "mozzarella", "ricotta", "paneer", "parmesan", "feta"];

  function caso(orig, nuevo) { return orig.charAt(0) === orig.charAt(0).toUpperCase() && orig.charAt(0) !== orig.charAt(0).toLowerCase() ? nuevo.charAt(0).toUpperCase() + nuevo.slice(1) : nuevo; }
  function pluralEs(w) {
    var l = w.toLowerCase();
    if (INVAR_ES.indexOf(l) > -1 || !/^[a-záéíóúüñ]+$/i.test(w)) return w;
    if (/s$/.test(l) || /[xy]$/.test(l)) return w;
    if (/[aeiouáéíóú]$/.test(l)) return w + "s";
    if (/z$/.test(l)) return w.slice(0, -1) + "ces";
    if (/ón$/.test(l)) return w.slice(0, -2) + "ones";
    if (/í$/.test(l)) return w + "es";
    return w + "es";
  }
  function singEs(w) {
    var l = w.toLowerCase();
    if (INVAR_ES.indexOf(l) > -1 || !/^[a-záéíóúüñ]+$/i.test(w) || !/s$/.test(l) || l.length < 4) return w;
    if (l === "panes") return w.slice(0, -2);
    if (/ones$/.test(l)) return w.slice(0, -4) + "ón";
    if (/ces$/.test(l)) return w.slice(0, -3) + "z";
    return w.slice(0, -1);
  }
  function pluralEn(w) {
    var l = w.toLowerCase();
    if (INVAR_EN.indexOf(l) > -1 || !/^[a-z-]+$/i.test(w)) return w;
    if (/s$/.test(l)) return w;
    if (l === "leaf") return w.slice(0, -1) + "ves";
    if (l === "loaf") return w.slice(0, -1) + "ves";
    if (/(x|z|ch|sh)$/.test(l)) return w + "es";
    if (/[^aeiou]y$/.test(l)) return w.slice(0, -1) + "ies";
    if (/[^aeiou]o$/.test(l)) return w + "es";
    return w + "s";
  }
  function singEn(w) {
    var l = w.toLowerCase();
    if (INVAR_EN.indexOf(l) > -1 || !/^[a-z-]+$/i.test(w) || !/s$/.test(l) || l.length < 3) return w;
    if (l === "leaves") return w.slice(0, -3) + "f";
    if (l === "loaves") return w.slice(0, -3) + "f";
    if (/ies$/.test(l)) return w.slice(0, -3) + "y";
    if (/(oes|ches|shes|sses|xes|zes)$/.test(l)) return w.slice(0, -2);
    if (/ss$/.test(l)) return w;
    return w.slice(0, -1);
  }

  /* Pone en plural o singular la frase del sustantivo que sigue a la cantidad («1 cebolla picada» → «2 cebollas picadas»). */
  function adaptarCabeza(rest, plural, lang) {
    var tk = rest.split(" "), i = 0, idx = [], j, t, bare, low, punct;
    if (lang === "es" && tk[0] && tk[0].toLowerCase() === "de") i = 1;
    var stops = lang === "es" ? STOP_ES : STOP_EN;
    for (j = i; j < tk.length; j++) {
      t = tk[j]; if (!t) break;
      bare = t.replace(/[,;:.]+$/, ""); low = bare.toLowerCase();
      if (!bare || stops.indexOf(low) > -1 || bare.charAt(0) === "(") break;
      idx.push(j);
      if (bare !== t) break;
    }
    if (!idx.length) return rest;
    var mod = function (k) {
      var tt = tk[k], b = tt.replace(/[,;:.]+$/, ""), p = tt.slice(b.length);
      var nb = lang === "es" ? (plural ? pluralEs(b) : singEs(b)) : (plural ? pluralEn(b) : singEn(b));
      tk[k] = caso(b, nb) + p;
    };
    if (lang === "es") idx.forEach(mod);
    else if (UNIT_EN.indexOf(tk[idx[0]].replace(/[,;:.]+$/, "").toLowerCase()) > -1) mod(idx[0]);
    else mod(idx[idx.length - 1]);
    return tk.join(" ");
  }
  function cabezaTokens(rest, lang) {
    var tk = rest.split(" "), out = [], i = 0, stops = lang === "es" ? STOP_ES : STOP_EN, bare;
    if (lang === "es" && tk[0] && tk[0].toLowerCase() === "de") i = 1;
    for (; i < tk.length; i++) {
      bare = tk[i].replace(/[,;:.]+$/, "");
      if (!bare || stops.indexOf(bare.toLowerCase()) > -1 || bare.charAt(0) === "(") break;
      out.push(bare.toLowerCase());
      if (bare !== tk[i]) break;
    }
    return out;
  }

  /* Escala una línea de ingredientes con un factor. */
  function escalarIng(txt, f, lang) {
    var m = RE_QTY.exec(txt);
    if (!m) return txt;
    var q = parseNum(m[1]), rest = txt.slice(m[1].length).replace(/^\s+/, ""), nq, texto, plural, k;
    if (RE_PIZCA.test(rest)) return txt;
    if (Math.abs(f - 1) < 1e-9) return txt;
    var v = q * f, pesoUnidad = RE_PESO.test(rest) || RE_PESO_GRANDE.test(rest);
    if (RE_PESO.test(rest)) {
      nq = redondearGramos(v); texto = String(nq); plural = true;
      var mu = /^(?:de\s+)?(g|ml)\b/i.exec(rest);
      if (nq >= 1000) { texto = fmtCuartos(redondearCuartos(nq / 1000)); rest = rest.replace(/^(?:de\s+)?(g|ml)\b/i, mu[1].toLowerCase() === "g" ? "kg" : "l"); }
    }
    else if (RE_PESO_GRANDE.test(rest)) { nq = redondearCuartos(v); texto = fmtCuartos(nq); plural = nq > 1; }
    else if (RE_VOL.test(rest)) { nq = redondearCuartos(v); texto = fmtCuartos(nq); plural = nq > 1.0001; }
    else {
      var disc = cabezaTokens(rest, lang).some(function (w) { return RE_DISCRETO.test(w); });
      if (disc) nq = Math.max(1, Math.round(v)); else nq = v < 4 ? Math.max(0.5, Math.round(v * 2) / 2) : Math.round(v);
      texto = nq === Math.floor(nq) ? String(nq) : fmtCuartos(nq);
      plural = nq > 1.0001;
    }
    if (!pesoUnidad && lang === "es" && nq >= 1 && /^de\s+/i.test(rest)) rest = rest.replace(/^de\s+/i, "");
    var resto = pesoUnidad ? rest : adaptarCabeza(rest, plural, lang);
    resto = resto.replace(/\((\d+(?:[.,]\d+)?)\s*(g|ml)\)/g, function (_, n, u) { return "(" + redondearGramos(parseFloat(n.replace(",", ".")) * f) + " " + u + ")"; });
    return texto + " " + resto;
  }
  /* Escala las cantidades con unidad (tazas, cucharadas, gramos) que aparecen dentro de un paso. */
  function escalarPaso(txt, f, lang) {
    if (Math.abs(f - 1) < 1e-9) return txt;
    return txt.replace(/(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?)(\s+(?:de\s+)?)(tazas?|cdas?|cdtas?|cups?|tbsp|tsp|g|ml)\b/gi, function (all, n, sep, u) {
      var q = parseNum(n) * f, low = u.toLowerCase(), nq, texto, pl;
      if (low === "g" || low === "ml") { nq = redondearGramos(q); texto = String(nq); pl = true; }
      else { nq = redondearCuartos(q); texto = fmtCuartos(nq); pl = nq > 1.0001; }
      var un = u;
      if (nq >= 1) sep = " ";
      if (/^(taza|tazas|cda|cdas|cdta|cdtas)$/i.test(low)) un = (pl ? (/s$/i.test(low) ? low : low + "s") : low.replace(/s$/, ""));
      else if (/^cups?$/i.test(low)) un = pl ? "cups" : "cup";
      return texto + sep + un;
    });
  }

  /* ---------- Revisión de una receta contra el perfil ---------- */
  function textosOk(r, P, R) {
    var textos = r.ingredientes.concat(r.pasos, [r.titulo]), i;
    for (i = 0; i < textos.length; i++) if (!MPI.revisarIngrediente(textos[i], P, R).ok) return false;
    return MPI.validarReceta({ ingredientes: r.ingredientes }, P).ok;
  }
  function juntar(base, v) { return { titulo: v.titulo || base.titulo, porciones: v.porciones || base.porciones, ingredientes: v.ingredientes || base.ingredientes, pasos: v.pasos || base.pasos }; }
  function variantesDe(rec, id, lang) {
    var b = rec[id]; if (!b) return [];
    if (b.variantes && b.variantes.length) return b.variantes.map(function (v) { return juntar(b[lang], v[lang]); });
    return [b[lang]];
  }
  /* ¿Algún tipo de este plato es compatible con el perfil? (los platos con variantes, como el casado, se revisan por variante) */
  function platoConVariantesOk(rec, id, P, R) {
    var b = rec[id]; if (!b || !b.variantes) return null;
    return b.variantes.some(function (v) { return textosOk(juntar(b[P.lang], v[P.lang]), P, R); });
  }

  function aciertos(texto, claves) {
    var n = 0;
    claves.forEach(function (alts) { if (alts.some(function (k) { return k && texto.indexOf(k) > -1; })) n++; });
    return n;
  }
  function escalarReceta(r, id, lang, porc, minutos) {
    var base = r.porciones || 2, destino = porc || base, f = destino / base;
    return {
      plato: id, titulo: r.titulo, tiempo: minutos || null, porciones: destino,
      ingredientes: r.ingredientes.map(function (z) { return escalarIng(z, f, lang); }),
      pasos: r.pasos.map(function (z) { return escalarPaso(z, f, lang); })
    };
  }
  /* Receta lista para mostrar (o null si ninguna versión cumple las restricciones). */
  function receta(id, d, o) {
    var vs = variantesDe(o.rec, id, o.P.lang).filter(function (r) { return textosOk(r, o.P, o.R); });
    if (!vs.length) return null;
    var mejor = null, ms = -1;
    vs.forEach(function (r) { var s = aciertos(norm(r.ingredientes.join(" ")), o.ingrClaves) + Math.random() * 0.9; if (s > ms) { ms = s; mejor = r; } });
    var out = escalarReceta(mejor, id, o.P.lang, o.porc, d[3]);
    out._txt = norm(out.ingredientes.join(" "));
    return out;
  }

  /* o: { PLATOS, rec, P, R, platoOk(d), a:{cocina,tiempo,porc}, ingrClaves:[[alt,...],...], excluir:[ids], comida:"desayuno"|"almuerzo"|"cena"|null } */
  function entradas(o) {
    var pref = (o.a.cocina || []).filter(function (c) { return c !== "otra"; }), out = [];
    o.PLATOS.forEach(function (d) {
      if (o.excluir && o.excluir.indexOf(d[0]) > -1) return;
      if (!o.platoOk(d)) return;
      var r = receta(d[0], d, { rec: o.rec, P: o.P, R: o.R, porc: o.a.porc, ingrClaves: o.ingrClaves });
      if (!r) return;
      var s = 0;
      if (d[1].some(function (c) { return pref.indexOf(c) > -1; })) s += 3;
      s += Math.min(aciertos(r._txt, o.ingrClaves), 4) * 2;
      if (o.a.tiempo) s += d[3] <= o.a.tiempo ? 2 : -(d[3] - o.a.tiempo) / 10;
      if (o.comida) s += (d[4] && d[4].indexOf(o.comida) > -1) ? 2 : -3;
      out.push({ d: d, r: r, s: s });
    });
    return out;
  }
  function propuestas(o) {
    var es = entradas(o);
    es.forEach(function (e) { e.t = e.s + Math.random() * 2.5; });
    es.sort(function (a, b) { return b.t - a.t; });
    return es.map(function (e) { delete e.r._txt; return e.r; });
  }

  /* ---------- Menú de siete días ---------- */
  var COMIDAS = [["d", "desayuno"], ["a", "almuerzo"], ["c", "cena"]];
  function plan(o) {
    var es = entradas(o), listas = {}, ok = true;
    COMIDAS.forEach(function (k) {
      listas[k[0]] = es.filter(function (e) { return e.d[4] && e.d[4].indexOf(k[1]) > -1; });
    });
    if (listas.d.length < 2 || listas.a.length < 3 || listas.c.length < 3) return null;
    var cnt = {}, dias = [], prev = {}, i;
    var maxRep = Math.min(listas.d.length, listas.a.length, listas.c.length) < 4 ? 3 : 2;
    for (i = 0; i < 7; i++) {
      var hoy = {}, usados = {};
      COMIDAS.forEach(function (k) {
        var mejor = null, ms = -1e9;
        listas[k[0]].forEach(function (e) {
          var id = e.d[0], c = cnt[id] || 0;
          if (usados[id]) return;
          if (c >= maxRep && listas[k[0]].length > maxRep) return;
          var t = e.s + Math.random() * 4 - c * 3;
          if (prev[k[0]] === id) t -= 6;
          if (prev[k[0] + "c"] && e.d[1].indexOf(prev[k[0] + "c"]) > -1) t -= 1;
          if (t > ms) { ms = t; mejor = e; }
        });
        if (!mejor) mejor = listas[k[0]][0];
        usados[mejor.d[0]] = 1; cnt[mejor.d[0]] = (cnt[mejor.d[0]] || 0) + 1;
        hoy[k[0]] = mejor; prev[k[0]] = mejor.d[0]; prev[k[0] + "c"] = mejor.d[1][0];
      });
      dias.push(hoy);
    }
    dias.forEach(function (dd) { COMIDAS.forEach(function (k) { delete dd[k[0]].r._txt; }); });
    return dias;
  }

  /* ---------- Lista de compras ---------- */
  function clave(txt) {
    var m = RE_QTY.exec(txt);
    if (!m) return { q: null, k: norm(txt) };
    var rest = txt.slice(m[1].length).replace(/^\s+/, "");
    var unit = "", mu = RE_VOL.exec(rest) || RE_PESO.exec(rest) || RE_PESO_GRANDE.exec(rest);
    if (mu) { unit = mu[1].toLowerCase().replace(/s$/, ""); rest = rest.slice(mu[0].length); }
    rest = rest.replace(/^\s*(de\s+)?/, "").replace(/\(.*?\)/g, " ");
    var toks = norm(rest).split(" ").filter(Boolean).map(function (w) { return w.length > 3 && /s$/.test(w) ? w.replace(/(es|s)$/, "") : w; });
    return { q: parseNum(m[1]), k: unit + "|" + toks.join(" ") };
  }
  function compras(recetas, lang) {
    var mapa = {}, orden = [];
    recetas.forEach(function (r) {
      r.ingredientes.forEach(function (z) {
        var c = clave(z);
        if (!mapa[c.k]) { mapa[c.k] = { txt: z, q: c.q, tot: c.q }; orden.push(c.k); }
        else if (c.q != null) mapa[c.k].tot += c.q;
      });
    });
    return orden.map(function (k) {
      var e = mapa[k];
      return e.q != null && e.tot !== e.q ? escalarIng(e.txt, e.tot / e.q, lang) : e.txt;
    });
  }

  var api = {
    escalarIng: escalarIng, escalarPaso: escalarPaso, textosOk: textosOk, platoConVariantesOk: platoConVariantesOk,
    entradas: entradas, propuestas: propuestas, plan: plan, compras: compras, COMIDAS: COMIDAS, norm: norm
  };
  if (typeof module !== "undefined") module.exports = api; else root.MPI_ARMADOR = api;
})(typeof window !== "undefined" ? window : this);
