/* Motor de reglas de "Tu mapa de hábitos": respuestas -> resultado personalizado.
   Sin IA ni servidor: todo son reglas fijas y textos escritos de antemano (mapa-datos.js). */
(function (root) {
  "use strict";

  function fill(str, vars) {
    return String(str).replace(/\{(\w+)\}/g, function (m, k) {
      return Object.prototype.hasOwnProperty.call(vars, k) ? vars[k] : m;
    });
  }

  function pickProfile(a) {
    var s = { base: 0, startstop: 0, energy: 0, structure: 0, support: 0 };
    var ob = a.obstacles || [];
    var has = function (k) { return ob.indexOf(k) !== -1; };
    if (a.history === "startstop") s.startstop += 3;
    if (has("allnone")) s.startstop += 2;
    if (has("motivation")) s.startstop += 1;
    if (has("overload")) s.startstop += 1;
    if (a.kindness <= 2) s.startstop += 1;

    if (a.energy <= 2) s.energy += 3;
    if (has("energy")) s.energy += 2;
    if (has("emotions")) s.energy += 2;
    if (a.area === "calm" || a.area === "sleep") s.energy += 1;

    if (a.routine <= 2) s.structure += 2;
    if (has("forget")) s.structure += 3;
    if (has("time")) s.structure += 1;
    if (a.style === "structure" || a.style === "visual") s.structure += 2;

    if (a.support === "someone") s.support += 2;
    if (has("environment")) s.support += 3;

    if (a.history === "never") s.base += 3;
    if (a.confidence <= 2) s.base += 1;
    if (has("unclear")) s.base += 2;
    if (a.style === "small") s.base += 1;

    var order = ["startstop", "energy", "structure", "support", "base"];
    var best = "base", top = 0;
    order.forEach(function (k) { if (s[k] > top) { top = s[k]; best = k; } });
    return best;
  }

  function generar(lang, a, hoy) {
    var D = root.MAPA_DATA[lang];
    var area = D.areas[a.area];
    var obIds = (a.obstacles && a.obstacles.length ? a.obstacles : ["unclear"]).slice(0, 3);
    var prof = pickProfile(a);
    var minutos = parseInt(a.minutes, 10) || 10;
    var m4 = Math.max(5, Math.round((minutos * 0.6) / 5) * 5);
    var mom = D.moments[a.moment] || D.moments.varies;

    var obst = obIds.map(function (id) {
      var o = D.obstacles[id];
      return {
        id: id, label: o.label, why: o.why,
        ifthen: fill(o.ifthen, { anchor: mom.anchor })
      };
    });

    // Tres recomendaciones: del área elegida, del obstáculo principal y del perfil.
    var recs = [area.rec, D.obstacles[obIds[0]].rec, D.profiles[prof].rec];
    // Si el obstáculo principal coincidiera con la recomendación del perfil, se usa el segundo obstáculo.
    if (recs[1].t === recs[2].t && obIds[1]) recs[1] = D.obstacles[obIds[1]].rec;

    var fullM = fill(area.full, { m: minutos });
    var full4 = fill(area.full, { m: m4 });
    var P = D.plan;
    var ifthen0 = obst[0].ifthen;
    var plan = [
      area.prep,
      fill(P.d2, { micro: area.micro, moment: mom.phrase }),
      fill(P.d3, { anchor: mom.anchor, micro: area.micro }),
      fill(P.d4, { full4: full4 }),
      fill(P.d5, { ifthen: ifthen0, full4: full4 }),
      fill(P.d6, { full: fullM }),
      fill(P.d7, { full: fullM })
    ].map(function (t, i) { return { n: i + 1, title: P.titles[i], text: t }; });

    var inicio = new Date(hoy.getTime());
    inicio.setDate(inicio.getDate() + 1);
    var fmt = function (d) { return d.toLocaleDateString(D.pdf.locale, { day: "numeric", month: "long", year: "numeric" }); };
    var habito = (a.habit && a.habit.trim()) ? a.habit.trim() : area.habit;

    var compromiso = fill(D.pdf.commit, {
      name: a.name, habit: habito, moment: mom.phrase, date: fmt(inicio),
      anchor: mom.anchor, obstacle: obst[0].label,
      ifthen: ifthen0
    });

    return {
      lang: lang, name: a.name, profileId: prof, profile: D.profiles[prof],
      area: { id: a.area, label: area.label }, habit: habito,
      minutes: minutos, moment: mom.phrase, anchor: mom.anchor,
      obstacles: obst, recs: recs, plan: plan, commitment: compromiso,
      today: fmt(hoy), start: fmt(inicio)
    };
  }

  root.MAPA_MOTOR = { generar: generar, pickProfile: pickProfile, fill: fill };
})(typeof window !== "undefined" ? window : globalThis);
