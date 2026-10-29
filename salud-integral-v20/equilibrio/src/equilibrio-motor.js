/* Mi mapa de equilibrio — REGLAS DETERMINISTAS
   Convierte la selección (lista ordenada de ids de tarjetas) en lo que lleva el cuaderno.
   Mismas elecciones → mismo cuaderno. Sin azar, sin IA y sin repetir contenido. */
(function (root) {
  "use strict";
  var EQ = root.EQ = root.EQ || {};
  var D = function () { return EQ.DATA; };

  function cardsOf(selIds) { // tarjetas válidas, sin duplicados, en el orden elegido
    var seen = {}, out = [];
    (selIds || []).forEach(function (id) { var c = D().cardById(id); if (c && !seen[id]) { seen[id] = 1; out.push(c); } });
    return out;
  }

  /* Agrupa por área (orden fijo de las seis áreas); dentro de cada área, el orden que eligió la persona. */
  function agrupar(selIds) {
    var cards = cardsOf(selIds), groups = [];
    D().AREAS.forEach(function (a) {
      var cs = cards.filter(function (c) { return c.area === a.id; });
      if (cs.length) groups.push({ area: a, cards: cs });
    });
    return groups;
  }

  /* Reparte por turnos entre las áreas elegidas (una tarjeta de cada área por ronda) para dar variedad. */
  function porTurnos(selIds, max) {
    var groups = agrupar(selIds), out = [], r = 0, more = true;
    while (more && out.length < max) {
      more = false;
      for (var g = 0; g < groups.length && out.length < max; g++) {
        if (groups[g].cards[r]) { out.push(groups[g].cards[r]); more = true; }
      }
      r++;
    }
    return out;
  }

  /* Acciones pequeñas para el cuaderno (sin repetir): primera acción de cada tarjeta, luego las segundas. */
  function acciones(selIds, lang, max) {
    var cards = porTurnos(selIds, 99), out = [], seen = {};
    [0, 1].forEach(function (k) {
      cards.forEach(function (c) {
        var t = c[lang].a[k]; if (t && !seen[t] && out.length < max) { seen[t] = 1; out.push({ text: t, card: c }); }
      });
    });
    return out;
  }

  /* Seis preguntas de reflexión: una por área elegida y, si faltan, preguntas generales (sin repetir). */
  function preguntas(selIds, lang) {
    var out = [];
    agrupar(selIds).forEach(function (g) { if (out.length < 6) out.push({ area: g.area, text: g.area[lang].refl }); });
    D().GENERAL_Q[lang].forEach(function (q) { if (out.length < 6) out.push({ area: null, text: q }); });
    return out;
  }

  /* Seis frases para completar: primera frase de cada área elegida, luego las segundas, luego generales. */
  function frases(selIds, lang) {
    var gs = agrupar(selIds), S = D().STEMS[lang], out = [];
    [0, 1].forEach(function (k) { gs.forEach(function (g) { if (out.length < 6) out.push(S[g.area.id][k]); }); });
    S.general.forEach(function (t) { if (out.length < 6 && out.indexOf(t) < 0) out.push(t); });
    return out;
  }

  /* Prácticas para las hojas de seguimiento (hasta 8, repartidas por áreas). */
  function seguimiento(selIds, lang) { return porTurnos(selIds, 8).map(function (c) { return c[lang].t; }); }

  /* Nombre de archivo seguro (sin tildes ni símbolos). */
  function nombreArchivo(lang, name) {
    var P = D().PDF[lang];
    var limpio = String(name || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return (limpio ? P.file + "-" + limpio : P.file_noname) + ".pdf";
  }

  /* Normaliza el texto personal: recorta, colapsa espacios y limita la longitud (nada de HTML). */
  function limpiarTexto(s, max) { return String(s || "").replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max); }

  EQ.MOTOR = { cardsOf: cardsOf, agrupar: agrupar, porTurnos: porTurnos, acciones: acciones, preguntas: preguntas, frases: frases,
               seguimiento: seguimiento, nombreArchivo: nombreArchivo, limpiarTexto: limpiarTexto };
})(typeof window !== "undefined" ? window : globalThis);
