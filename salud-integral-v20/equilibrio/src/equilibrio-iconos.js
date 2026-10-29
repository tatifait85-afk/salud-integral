/* Mi mapa de equilibrio — ICONOGRAFÍA Y ORNAMENTOS BOTÁNICOS (vectoriales)
   Los iconos se definen una sola vez como listas de comandos de trazo (M, L, C, Z) en una cuadrícula de 24×24.
   La misma definición se dibuja como SVG en la interfaz y como vector real dentro del PDF (nada de capturas). */
(function (root) {
  "use strict";
  var EQ = root.EQ = root.EQ || {};
  var K = 0.5523; // constante de círculo con bézier cúbica

  /* ---------- utilidades de geometría ---------- */
  function parse(d) { // solo comandos absolutos M L C Q Z
    var tk = d.match(/[MLCQZ]|-?\d*\.?\d+/g), i = 0, out = [], N = { M: 2, L: 2, C: 6, Q: 4 };
    while (i < tk.length) {
      var c = tk[i++];
      if (c === "Z") { out.push(["Z"]); continue; }
      var a = [c];
      for (var k = 0; k < N[c]; k++) a.push(parseFloat(tk[i++]));
      out.push(a);
    }
    return out;
  }
  function xf(cmds, fn) { // fn(x, y) -> [x', y']
    return cmds.map(function (c) {
      if (c[0] === "Z") return ["Z"];
      var o = [c[0]];
      for (var i = 1; i < c.length; i += 2) { var p = fn(c[i], c[i + 1]); o.push(p[0], p[1]); }
      return o;
    });
  }
  function rot(cmds, deg, cx, cy) {
    var r = deg * Math.PI / 180, s = Math.sin(r), c = Math.cos(r);
    return xf(cmds, function (x, y) { var dx = x - cx, dy = y - cy; return [cx + dx * c - dy * s, cy + dx * s + dy * c]; });
  }
  function mv(cmds, tx, ty, sc) { sc = sc || 1; return xf(cmds, function (x, y) { return [x * sc + tx, y * sc + ty]; }); }
  function toD(cmds) {
    return cmds.map(function (c) {
      if (c[0] === "Z") return "Z";
      return c[0] + c.slice(1).map(function (n) { return Math.round(n * 100) / 100; }).join(" ");
    }).join("");
  }
  function circle(cx, cy, r) {
    var k = r * K;
    return [["M", cx + r, cy], ["C", cx + r, cy + k, cx + k, cy + r, cx, cy + r], ["C", cx - k, cy + r, cx - r, cy + k, cx - r, cy],
            ["C", cx - r, cy - k, cx - k, cy - r, cx, cy - r], ["C", cx + k, cy - r, cx + r, cy - k, cx + r, cy], ["Z"]];
  }
  function ellipse(cx, cy, rx, ry, deg) {
    var kx = rx * K, ky = ry * K;
    var e = [["M", cx + rx, cy], ["C", cx + rx, cy + ky, cx + kx, cy + ry, cx, cy + ry], ["C", cx - kx, cy + ry, cx - rx, cy + ky, cx - rx, cy],
             ["C", cx - rx, cy - ky, cx - kx, cy - ry, cx, cy - ry], ["C", cx + kx, cy - ry, cx + rx, cy - ky, cx + rx, cy], ["Z"]];
    return deg ? rot(e, deg, cx, cy) : e;
  }
  function line(x1, y1, x2, y2) { return [["M", x1, y1], ["L", x2, y2]]; }
  function leaf(len, w) { // hoja que sale de (0,0) hacia arriba (−y)
    return [["M", 0, 0], ["C", w, -len * 0.25, w, -len * 0.75, 0, -len], ["C", -w, -len * 0.75, -w, -len * 0.25, 0, 0], ["Z"]];
  }
  function cat() { return [].concat.apply([], arguments); }

  /* ---------- brotes y ramas (ornamento) ---------- */
  function sprig(L, n) {
    var P = [[0, 0], [0.3 * L, -0.10 * L], [0.65 * L, -0.14 * L], [L, -0.04 * L]];
    function pt(t) { var u = 1 - t; return [u*u*u*P[0][0] + 3*u*u*t*P[1][0] + 3*u*t*t*P[2][0] + t*t*t*P[3][0],
                                           u*u*u*P[0][1] + 3*u*u*t*P[1][1] + 3*u*t*t*P[2][1] + t*t*t*P[3][1]]; }
    function dr(t) { var u = 1 - t; return [3*u*u*(P[1][0]-P[0][0]) + 6*u*t*(P[2][0]-P[1][0]) + 3*t*t*(P[3][0]-P[2][0]),
                                           3*u*u*(P[1][1]-P[0][1]) + 6*u*t*(P[2][1]-P[1][1]) + 3*t*t*(P[3][1]-P[2][1])]; }
    var stem = [["M", P[0][0], P[0][1]], ["C", P[1][0], P[1][1], P[2][0], P[2][1], P[3][0], P[3][1]]], leaves = [];
    for (var k = 1; k <= n; k++) {
      var t = k / (n + 1), p = pt(t), d = dr(t), th = Math.atan2(d[0], -d[1]) * 180 / Math.PI;
      var ln = L * 0.26 * (1 - 0.4 * t);
      leaves.push(mv(rot(leaf(ln, ln * 0.4), th + (k % 2 ? 52 : -52), 0, 0), p[0], p[1]));
    }
    var e = pt(1), d1 = dr(1), th1 = Math.atan2(d1[0], -d1[1]) * 180 / Math.PI;
    leaves.push(mv(rot(leaf(L * 0.2, L * 0.08), th1, 0, 0), e[0], e[1]));
    return { stem: stem, leaves: leaves };
  }

  /* ---------- definiciones de iconos (cuadrícula 24×24) ---------- */
  var sprout = function (cx, base, h, s) { // brote pequeño: tallo y dos hojas
    return cat(line(cx, base, cx, base - h),
      mv(rot(leaf(s, s * 0.45), 52, 0, 0), cx, base - h * 0.45), mv(rot(leaf(s, s * 0.45), -52, 0, 0), cx, base - h * 0.7));
  };
  var D = {
    /* ÁREAS */
    a_calm: cat(parse("M12 4.5C14.8 7.6 14.8 12.4 12 15C9.2 12.4 9.2 7.6 12 4.5Z"), parse("M11.6 15C8.4 15.2 5.6 13.4 4.4 9.6C8 9.4 10.6 11.4 11.6 15Z"),
      parse("M12.4 15C15.6 15.2 18.4 13.4 19.6 9.6C16 9.4 13.4 11.4 12.4 15Z"),
      parse("M5 18.2C7 17 9 19.4 12 18.2C15 17 17 19.4 19 18.2"), parse("M8 21.2C9.6 20.4 10.8 22 12 21.2C13.2 20.4 14.4 22 16 21.2")),
    a_rest: cat(parse("M16.5 3.8C11.2 4 7 8.2 7 13.4C7 18.4 11 21 15.6 20.8C17.8 20.7 19.6 19.9 20.8 18.7C14.6 18.4 11.8 11.4 16.5 3.8Z"),
      circle(19.2, 8.2, 0.6), circle(21, 12.6, 0.6)),
    a_body: cat(circle(12, 4.6, 2.1), parse("M4.8 9.2C8.4 11.4 15.6 11.4 19.2 9.2"), line(12, 10.6, 12, 15.2),
      parse("M12 15.2C11 17.4 9.6 19.2 8.2 20.8"), parse("M12 15.2C13 17.4 14.4 19.2 15.8 20.8")),
    a_boundaries: cat(parse("M5.5 20.8L5.5 10.8C5.5 6.8 8.4 3.8 12 3.8C15.6 3.8 18.5 6.8 18.5 10.8L18.5 20.8"), line(3.5, 20.8, 20.5, 20.8), sprout(12, 20.8, 8, 5)),
    a_nature: cat(parse("M12 3.4C15.4 3.4 17.8 5.6 17.8 8.6C19.6 9.4 20.4 11.2 20 12.8C19.6 14.6 17.8 15.6 16 15.4L8 15.4C6.2 15.6 4.4 14.6 4 12.8C3.6 11.2 4.4 9.4 6.2 8.6C6.2 5.6 8.6 3.4 12 3.4Z"),
      line(12, 15.4, 12, 21), line(12, 18.2, 9.6, 16), line(12, 17, 14.6, 14.4), line(8, 21, 16, 21)),
    a_joy: (function () { var o = circle(12, 12, 2.1); for (var k = 0; k < 6; k++) o = o.concat(rot(mv(leaf(6.4, 2.7), 12, 9.6), k * 60, 12, 12)); return o; })(),
    /* CALMA */
    c_pause: cat(circle(12, 12, 9), line(10, 8.8, 10, 15.2), line(14, 8.8, 14, 15.2)),
    c_emotions: parse("M12 20C5 15 3.5 11 5.5 8C7.2 5.6 10.5 5.8 12 8.5C13.5 5.8 16.8 5.6 18.5 8C20.5 11 19 15 12 20Z"),
    c_breath: cat(parse("M3.5 9L13.5 9C16.4 9 16.4 5 13.6 5"), parse("M3.5 13L17.5 13C20.6 13 20.6 17.4 17.4 17.4"), line(3.5, 17, 9.5, 17)),
    c_quiet: cat(circle(12, 12, 1.8), circle(12, 12, 5.4), circle(12, 12, 9)),
    /* DESCANSO */
    r_time: cat(circle(12, 12, 9), parse("M12 7L12 12L15.6 14.2")),
    r_reduce: cat(parse("M3 11.5C7 16 17 16 21 11.5"), line(7.2, 15.2, 6, 17.6), line(12, 16.4, 12, 19), line(16.8, 15.2, 18, 17.6)),
    r_energy: cat(line(12, 21, 12, 11.5), parse("M12 14.2C12 10.8 14.6 8.8 18.4 8.8C18.4 12.2 15.8 14.2 12 14.2Z"), parse("M12 17.6C12 14.2 9.4 12.2 5.6 12.2C5.6 15.6 8.2 17.6 12 17.6Z")),
    r_pause: cat(parse("M5 10L17 10L16 17C15.8 18.6 14.5 19.5 13 19.5L9 19.5C7.5 19.5 6.2 18.6 6 17Z"), parse("M17 11.5C20 11.5 20 15.5 17 15.5"),
      parse("M9 7.5C8 6 10 5 9 3.5"), parse("M13 7.5C12 6 14 5 13 3.5")),
    /* CUERPO */
    b_walk: cat(ellipse(8.2, 15.4, 2.5, 4, -12), ellipse(15.8, 8.6, 2.5, 4, 12)),
    b_stretch: cat(circle(12, 4.2, 2), line(12, 7.2, 12, 14.2), line(12, 8.6, 6.6, 4.6), line(12, 8.6, 17.4, 4.6), line(12, 14.2, 8.4, 20.6), line(12, 14.2, 15.6, 20.6)),
    b_listen: cat(parse("M8 9.5C8 6 10 4 12.5 4C15.5 4 17 6.2 17 9C17 12 14.5 12.5 14.5 15.5C14.5 17.5 13 19 11 19C9.5 19 8.5 18.2 8 17"), parse("M12.5 8C14 8 14.2 10 12.5 10.8")),
    b_flow: cat(parse("M3 9C6 5 9 5 12 9C15 13 18 13 21 9"), parse("M3 15C6 11 9 11 12 15C15 19 18 19 21 15")),
    /* LÍMITES */
    l_time: cat(line(7, 4, 17, 4), line(7, 20, 17, 20), parse("M8 4C8 9 11 10.5 12 12C13 10.5 16 9 16 4"), parse("M8 20C8 15 11 13.5 12 12C13 13.5 16 15 16 20")),
    l_needs: cat(parse("M5 5L19 5C20.1 5 21 5.9 21 7L21 14C21 15.1 20.1 16 19 16L11 16L7 20L7 16L5 16C3.9 16 3 15.1 3 14L3 7C3 5.9 3.9 5 5 5Z"), line(7, 9.5, 17, 9.5), line(7, 12.5, 13, 12.5)),
    l_protect: cat(parse("M12 3.5L19 6L19 12C19 16.5 16 19.5 12 21C8 19.5 5 16.5 5 12L5 6Z"), sprout(12, 17.2, 6, 3.6)),
    l_no: cat(circle(12, 12, 9), line(5.6, 18.4, 18.4, 5.6)),
    /* NATURALEZA */
    n_outdoors: (function () { var o = cat(circle(12, 7.6, 2.8), parse("M2 19C5 13 9 13 12 17C14.5 14 18 13.5 22 19"), line(2, 19, 22, 19));
      for (var k = 0; k < 8; k++) { var a = k * Math.PI / 4; o = o.concat(line(12 + Math.cos(a) * 4.7, 7.6 + Math.sin(a) * 4.7, 12 + Math.cos(a) * 6.2, 7.6 + Math.sin(a) * 6.2)); } return o; })(),
    n_plants: cat(parse("M7 14L17 14L16 20L8 20Z"), line(12, 14, 12, 8.6), parse("M12 11.6C12 8.2 9.5 6.2 6 6.2C6 9.6 8.5 11.6 12 11.6Z"), parse("M12 9.6C12 6.6 14.5 4.6 18 4.6C18 8 15.5 9.6 12 9.6Z")),
    n_space: cat(parse("M3 17L9 7.5L13 13.5L16 9.5L21 17Z"), parse("M4 20.6C6 19.6 8 21.6 10 20.6C12 19.6 14 21.6 16 20.6C17.6 19.8 19 20.8 20 20.6")),
    n_home: cat(parse("M3.5 11.5L12 4L20.5 11.5"), parse("M6 10L6 20L18 20L18 10"), sprout(12, 20, 6.5, 3.8)),
    /* DISFRUTE */
    j_draw: cat(parse("M4 20L5.2 15L16 4.2L19.8 8L9 18.8Z"), line(14, 6.2, 17.8, 10), line(5.2, 15, 9, 18.8)),
    j_write: cat(parse("M6 3.5L18 3.5C19 3.5 19.5 4 19.5 5L19.5 19C19.5 20 19 20.5 18 20.5L6 20.5Z"), line(6, 3.5, 6, 20.5), line(9.4, 8, 16, 8), line(9.4, 11.6, 16, 11.6), line(9.4, 15.2, 13.2, 15.2)),
    j_music: cat(circle(8, 17, 2.6), circle(15.6, 15.2, 2.6), parse("M10.6 17L10.6 6L18.2 4.4L18.2 15.2")),
    j_new: parse("M12 3C12.6 8.4 15.6 11.4 21 12C15.6 12.6 12.6 15.6 12 21C11.4 15.6 8.4 12.6 3 12C8.4 11.4 11.4 8.4 12 3Z"),
    j_palette: cat(parse("M12 3.5C6.8 3.5 3 7.2 3 12C3 16.8 6.8 20.5 11.5 20.5C13.2 20.5 13.6 19.4 12.8 18.4C12 17.3 12.6 16 14 16L16.5 16C19 16 21 14.2 21 11.5C21 7 17 3.5 12 3.5Z"),
      circle(7.8, 10.6, 1.1), circle(11.4, 7.4, 1.1), circle(16, 8.6, 1.1)),
    /* INTERFAZ */
    ui_up: parse("M6 15L12 9L18 15"), ui_down: parse("M6 9L12 15L18 9"), ui_x: cat(line(6.5, 6.5, 17.5, 17.5), line(17.5, 6.5, 6.5, 17.5)),
    ui_check: parse("M5 12.5L10 17.5L19 7"), ui_right: cat(line(5, 12, 19, 12), parse("M13 6L19 12L13 18")), ui_left: cat(line(5, 12, 19, 12), parse("M11 6L5 12L11 18")),
    ui_lock: cat(parse("M6 11L18 11L18 20L6 20Z"), parse("M8.5 11L8.5 8C8.5 5.8 10 4.2 12 4.2C14 4.2 15.5 5.8 15.5 8L15.5 11")),
    ui_leaf: cat(parse("M12 21C5 17 4 10 5 4C12 4 20 8 19 14C18.5 17.5 15.5 19.5 12 21Z"), line(12, 21, 11, 9))
  };

  function svg(id, o) {
    o = o || {};
    var size = o.size || 24, sw = o.sw || 1.5;
    return '<svg class="ico' + (o.cls ? " " + o.cls : "") + '" viewBox="0 0 24 24" width="' + size + '" height="' + size +
      '" aria-hidden="true" focusable="false"><path d="' + toD(D[id]) + '" fill="none" stroke="currentColor" stroke-width="' + sw +
      '" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  EQ.ICONS = { defs: D, cmds: function (id) { return D[id]; }, d: function (id) { return toD(D[id]); }, svg: svg,
               parse: parse, xf: xf, rot: rot, mv: mv, toD: toD, circle: circle, ellipse: ellipse, line: line, leaf: leaf, sprig: sprig };
})(typeof window !== "undefined" ? window : globalThis);
