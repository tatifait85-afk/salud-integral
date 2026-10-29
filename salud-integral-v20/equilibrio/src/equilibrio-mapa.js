/* Mi mapa de equilibrio — COMPOSICIÓN DEL MAPA CIRCULAR
   Un solo modelo geométrico (seis sectores) que se dibuja como SVG en la pantalla y como vector en el PDF.
   El mapa se genera por código a partir de las áreas que tienen tarjetas elegidas. No hay porcentajes ni puntuaciones:
   un sector resaltado solo significa «elegí explorar esta área». */
(function (root) {
  "use strict";
  var EQ = root.EQ = root.EQ || {};
  var NS = 6, GAP = 1.1;                  // seis sectores; separación angular en grados
  var CREAM = "#FBF7EA", FOREST = "#1F4D34", GOLD = "#B08D3F";

  function hex2rgb(h) { h = h.replace("#", ""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function rgb2hex(c) { return "#" + c.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? "0" : "") + v.toString(16); }).join(""); }
  function mix(a, b, t) { var A = hex2rgb(a), B = hex2rgb(b); return rgb2hex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]); }

  /* Geometría: sectores anulares de radio interior r0 a exterior R, empezando en la parte superior. */
  function model(R) {
    var r0 = R * 0.27, out = [], N = 28, A = EQ.DATA.AREAS;
    for (var i = 0; i < NS; i++) {
      var a0 = -90 + i * 60 + GAP / 2, a1 = -90 + (i + 1) * 60 - GAP / 2, mid = (a0 + a1) / 2, pts = [], k, t, a;
      for (k = 0; k <= N; k++) { t = a0 + (a1 - a0) * k / N; a = t * Math.PI / 180; pts.push([R * Math.cos(a), R * Math.sin(a)]); }
      for (k = N; k >= 0; k--) { t = a0 + (a1 - a0) * k / N; a = t * Math.PI / 180; pts.push([r0 * Math.cos(a), r0 * Math.sin(a)]); }
      var m = mid * Math.PI / 180;
      out.push({ i: i, area: A[i], mid: mid, pts: pts,
                 c: [Math.cos(m) * R * 0.6, Math.sin(m) * R * 0.6],                                  // centroide del sector
                 icon: [Math.cos(m) * R * 0.6, Math.sin(m) * R * 0.6 - R * 0.1],                    // icono, sobre la etiqueta
                 label: [Math.cos(m) * R * 0.6, Math.sin(m) * R * 0.6 + R * 0.125] });              // etiqueta, bajo el icono
    }
    return { R: R, r0: r0, sectors: out, iconSize: R * 0.2, fontSize: R * 0.088 };
  }

  /* Colores de cada sector según esté resaltado o no. */
  function colors(area, on) {
    return on ? { fill: area.color, stroke: mix(area.color, FOREST, 0.25), ink: area.ink }
              : { fill: mix(area.color, CREAM, 0.86), stroke: mix(area.color, CREAM, 0.45), ink: mix(area.color, FOREST, 0.55) };
  }

  /* Áreas con al menos una tarjeta elegida (objeto {areaId:true}). */
  function areasActivas(selIds) {
    var o = {};
    (selIds || []).forEach(function (id) { var c = EQ.DATA.cardById(id); if (c) o[c.area] = true; });
    return o;
  }

  function pointsAttr(pts) { return pts.map(function (p) { return p[0].toFixed(2) + "," + p[1].toFixed(2); }).join(" "); }

  /* SVG interactivo. opts: lang, active ({areaId:true}), labels (true), ids (prefijo único). */
  function svg(opts) {
    var lang = opts.lang, active = opts.active || {}, M = model(200), U = EQ.DATA.UI[lang], showLabels = opts.labels !== false;
    var s = '<svg class="eq-map' + (opts.cls ? " " + opts.cls : "") + '" viewBox="-216 -216 432 432" role="img" aria-label="' + U.map_label + '" xmlns="http://www.w3.org/2000/svg">';
    s += '<circle r="210" fill="none" stroke="' + GOLD + '" stroke-opacity=".55" stroke-width="1.2"/>';
    s += '<circle r="205" fill="' + CREAM + '" stroke="' + GOLD + '" stroke-opacity=".3" stroke-width=".8"/>';
    M.sectors.forEach(function (sec) {
      var on = !!active[sec.area.id], c = colors(sec.area, on), nm = sec.area[lang].name;
      s += '<g class="sec' + (on ? " on" : "") + '" data-area="' + sec.area.id + '" style="--c:' + sec.area.color + ';--ct:' + mix(sec.area.color, CREAM, 0.86) +
           ';--ink:' + sec.area.ink + ';--ink0:' + mix(sec.area.color, FOREST, 0.55) + ';--st:' + mix(sec.area.color, CREAM, 0.45) + '">';
      s += '<title>' + (on ? U.sector_on : U.sector_off).replace("{name}", nm) + '</title>';
      s += '<polygon class="bg" points="' + pointsAttr(sec.pts) + '"/>';
      var sz = M.iconSize, ip = showLabels ? sec.icon : sec.c, ix = ip[0] - sz / 2, iy = ip[1] - sz / 2;
      s += '<g class="ic" transform="translate(' + ix.toFixed(2) + ' ' + iy.toFixed(2) + ') scale(' + (sz / 24).toFixed(4) + ')"><path d="' + EQ.ICONS.d(sec.area.icon) +
           '" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>';
      if (showLabels) s += '<text class="lbl" x="' + sec.label[0].toFixed(2) + '" y="' + (sec.label[1] + M.fontSize * 0.34).toFixed(2) + '" text-anchor="middle" font-size="' + M.fontSize.toFixed(1) + '">' + sec.area[lang].short + '</text>';
      s += '</g>';
    });
    // centro: disco marfil con brote
    var cs = M.r0 * 1.0;
    s += '<circle r="' + (M.r0 - 1).toFixed(1) + '" fill="' + CREAM + '" stroke="' + GOLD + '" stroke-opacity=".7" stroke-width="1.2"/>';
    s += '<circle r="' + (M.r0 - 6).toFixed(1) + '" fill="none" stroke="' + GOLD + '" stroke-opacity=".35" stroke-width=".7"/>';
    s += '<g transform="translate(' + (-cs * 0.5).toFixed(2) + ' ' + (-cs * 0.5).toFixed(2) + ') scale(' + (cs / 24).toFixed(4) + ')" style="color:' + FOREST + '"><path d="' + EQ.ICONS.d("r_energy") +
         '" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></g>';
    return s + '</svg>';
  }

  /* Actualiza un SVG ya dibujado sin volver a crearlo (permite transiciones suaves). */
  function actualizar(svgEl, active) {
    if (!svgEl) return;
    [].forEach.call(svgEl.querySelectorAll(".sec"), function (g) { g.classList.toggle("on", !!active[g.getAttribute("data-area")]); });
  }

  EQ.MAPA = { model: model, colors: colors, mix: mix, areasActivas: areasActivas, svg: svg, actualizar: actualizar,
              PALETA: { cream: CREAM, forest: FOREST, gold: GOLD } };
})(typeof window !== "undefined" ? window : globalThis);
