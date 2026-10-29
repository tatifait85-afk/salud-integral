/* Mi mapa de equilibrio — GENERACIÓN DEL PDF (A4)
   Compone el cuaderno con jsPDF: texto real, mapa y símbolos en vector, portada con el nombre y el logo.
   Páginas = 4 fijas (portada, bienvenida, mapa, áreas) + prácticas (1–4, según las tarjetas) + 8 fijas = 13 a 16.
   Todo el contenido sale de EQ.DATA y de las reglas de EQ.MOTOR; aquí solo se dibuja. */
(function (root) {
  "use strict";
  var EQ = root.EQ = root.EQ || {};
  var W = 595.28, H = 841.89, M = 48, CW = W - 2 * M, Y_MAX = H - 62;
  var C = { forest: [31, 77, 52], olive: [95, 127, 60], sage: [168, 192, 138], pale: [233, 239, 222], cream: [251, 247, 234],
            gold: [176, 141, 63], ink: [48, 60, 50], muted: [105, 119, 103], line: [196, 208, 182], white: [255, 255, 255] };

  function rgb(hex) { hex = hex.replace("#", ""); return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)]; }
  function fmt(s, v) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return v[k] !== undefined ? v[k] : m; }); }

  function crear(input) {
    var lang = input.lang === "en" ? "en" : "es", T = EQ.DATA.PDF[lang], DT = EQ.DATA;
    var name = EQ.MOTOR.limpiarTexto(input.name, 40), title = EQ.MOTOR.limpiarTexto(input.title, 60);
    var sel = EQ.MOTOR.cardsOf(input.sel).map(function (c) { return c.id; });
    if (!sel.length) throw new Error("no-cards");
    var groups = EQ.MOTOR.agrupar(sel), active = EQ.MAPA.areasActivas(sel);
    var jsPDF = root.jspdf.jsPDF, doc = new jsPDF({ unit: "pt", format: "a4", compress: true, orientation: "portrait" });
    var A = EQ.ASSETS, warn = [];

    /* ---------- fuentes ---------- */
    [["Fraunces", "normal", "Fraunces-Regular"], ["Fraunces", "bold", "Fraunces-SemiBold"],
     ["Cormorant", "normal", "CormorantGaramond-500"], ["Cormorant", "bold", "CormorantGaramond-700"], ["Jost", "normal", "Jost-Regular"], ["Jost", "medium", "Jost-Medium"], ["Jost", "bold", "Jost-SemiBold"]].forEach(function (f) {
      doc.addFileToVFS(f[2] + ".ttf", A.fonts[f[2]]); doc.addFont(f[2] + ".ttf", f[0], f[1]);
    });
    doc.setProperties({ title: T.product + (name ? " — " + name : ""), subject: T.subtitle, author: T.brand, creator: T.brand, keywords: "autocuidado, equilibrio, self-care, balance" });
    try { doc.setLanguage(lang === "en" ? "en-GB" : "es-ES"); } catch (e) {}
    doc.setLineCap("round"); doc.setLineJoin("round");

    /* ---------- utilidades de dibujo ---------- */
    var y = 0, pageNo = 1;
    function setf(fam, st, size, col) { doc.setFont(fam, st); doc.setFontSize(size); var c = col || C.ink; doc.setTextColor(c[0], c[1], c[2]); }
    function fill(c) { doc.setFillColor(c[0], c[1], c[2]); }
    function stroke(c, lw) { doc.setDrawColor(c[0], c[1], c[2]); doc.setLineWidth(lw === undefined ? 0.6 : lw); }
    function wrap(s, w, size, fam, st) { doc.setFont(fam || "Jost", st || "normal"); doc.setFontSize(size); return doc.splitTextToSize(String(s), w); }
    function text(s, x, baseline, opt) { doc.text(String(s), x, baseline, opt); }
    function para(s, x, top, w, size, lh, col, fam, st, align) { // devuelve la y siguiente
      var ls = wrap(s, w, size, fam, st); setf(fam || "Jost", st || "normal", size, col);
      ls.forEach(function (l, i) {
        var bx = align === "center" ? x + w / 2 : x;
        text(l, bx, top + i * lh + (lh - size) / 2 + size * 0.82, align === "center" ? { align: "center" } : undefined);
      });
      return top + ls.length * lh;
    }
    /* ---------- campos editables (AcroForm) ---------- */
    var FILL = input.fillable !== false;
    var fields = [];
    function tfield(x, top, w, h, multi) { if (FILL) fields.push({ k: "t", p: doc.internal.getCurrentPageInfo().pageNumber, x: x, y: top, w: w, h: h, m: !!multi }); }
    function cfield(cx, cy, sz) { if (FILL) fields.push({ k: "c", p: doc.internal.getCurrentPageInfo().pageNumber, x: cx - sz / 2, y: cy - sz / 2, w: sz, h: sz }); }
    function hlines(x, top, w, n, gap, col) { stroke(col || C.line, 0.5); for (var i = 0; i < n; i++) { var yy = top + (i + 1) * gap; doc.line(x, yy, x + w, yy); tfield(x, yy - gap + 2, w, gap - 3, false); } return top + n * gap; }

    function segs(cmds) { // comandos absolutos -> subtrazos relativos para jsPDF.lines
      var out = [], cur = null, sx = 0, sy = 0, px = 0, py = 0;
      cmds.forEach(function (c) {
        if (c[0] === "M") { cur = { x0: c[1], y0: c[2], s: [], closed: false }; out.push(cur); px = c[1]; py = c[2]; }
        else if (c[0] === "L") { cur.s.push([c[1] - px, c[2] - py]); px = c[1]; py = c[2]; }
        else if (c[0] === "C") { cur.s.push([c[1] - px, c[2] - py, c[3] - px, c[4] - py, c[5] - px, c[6] - py]); px = c[5]; py = c[6]; }
        else if (c[0] === "Q") { var x1 = px + 2 / 3 * (c[1] - px), y1 = py + 2 / 3 * (c[2] - py), x2 = c[3] + 2 / 3 * (c[1] - c[3]), y2 = c[4] + 2 / 3 * (c[2] - c[4]);
          cur.s.push([x1 - px, y1 - py, x2 - px, y2 - py, c[3] - px, c[4] - py]); px = c[3]; py = c[4]; }
        else if (c[0] === "Z") { cur.closed = true; }
      });
      return out;
    }
    function drawCmds(cmds, style) { segs(cmds).forEach(function (sp) { if (sp.s.length) doc.lines(sp.s, sp.x0, sp.y0, [1, 1], style, sp.closed); }); }
    function drawPoly(pts, style) {
      var s = []; for (var i = 1; i < pts.length; i++) s.push([pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]]);
      doc.lines(s, pts[0][0], pts[0][1], [1, 1], style, true);
    }
    function icon(id, cx, cy, size, col, lw) { // icono vectorial centrado
      var k = size / 24, cmds = EQ.ICONS.mv(EQ.ICONS.cmds(id), cx - size / 2, cy - size / 2, k);
      stroke(col, lw || 1.15); drawCmds(cmds, "S");
    }
    function sprigDraw(x, top, L, n, ang, col, fl) {
      var s = EQ.ICONS.sprig(L, n), tf = function (c) { return EQ.ICONS.mv(EQ.ICONS.rot(c, ang, 0, 0), x, top); };
      stroke(col, 0.8); drawCmds(tf(s.stem), "S");
      s.leaves.forEach(function (l) { fill(fl); stroke(col, 0.6); drawCmds(tf(l), "FD"); });
    }
    function dot(x, yy, r, col) { fill(col); doc.circle(x, yy, r, "F"); }
    function box(x, top, w, h, bg, ln, r) {
      if (bg) fill(bg); if (ln) stroke(ln, 0.7);
      doc.roundedRect(x, top, w, h, r === undefined ? 7 : r, r === undefined ? 7 : r, bg && ln ? "FD" : bg ? "F" : "S");
    }
    function checkbox(cx, cy, s) { stroke(C.sage, 0.9); doc.roundedRect(cx - s / 2, cy - s / 2, s, s, 2, 2, "S"); cfield(cx, cy, s); }

    /* ---------- páginas ---------- */
    function header() {
      if (A.logo) doc.addImage(A.logo, "PNG", M, 17, 19, 19, undefined, "FAST");
      setf("Jost", "medium", 7.5, C.forest); text(T.brand.toUpperCase(), M + 26, 30, { charSpace: 1.6 });
      setf("Fraunces", "normal", 9, C.muted); text(T.product + (name ? " · " + name : ""), W - M, 30, { align: "right", maxWidth: 300 });
      stroke(C.gold, 0.5); doc.line(M, 44, W - M, 44);
    }
    function newPage(h1, sub) {
      doc.addPage(); pageNo++; header();
      sprigDraw(W - M - 78, 106, 74, 4, -8, C.sage, C.pale);
      var fs1 = 24; doc.setFont("Fraunces", "bold"); doc.setFontSize(fs1);
      while (doc.getTextWidth(h1) > CW - 100 && fs1 > 15) { fs1 -= 0.5; doc.setFontSize(fs1); }
      setf("Fraunces", "bold", fs1, C.forest); text(h1, M, 88);
      stroke(C.gold, 1); doc.line(M, 98, M + 38, 98);
      y = 112;
      if (sub) y = para(sub, M, y, CW - 104, 10.5, 15, C.muted) + 10;
      else y += 4;
      return y;
    }
    function need(h, contTitle) { if (y + h > Y_MAX) { newPage(contTitle || T.pract_cont); return true; } return false; }
    function check(label) { if (y > Y_MAX + 2) warn.push(label + " overflow " + Math.round(y - Y_MAX)); }

    /* ========== 1. PORTADA ========== */
    (function cover() {
      var iw = H * 1102 / 1427, ix = (W - iw) / 2;                    // la portada se recorta por los lados para ocupar toda la A4
      doc.addImage(A.cover, "JPEG", ix, 0, iw, H, undefined, "FAST");
      var k = H / 1427, cx = W / 2, DARK = [24, 62, 42];               // medidas tomadas de la portada de ejemplo (1102 × 1427 px)
      function fit(str, maxW, maxS, fam, st, cs) { var z = maxS; doc.setFont(fam, st); while (z > 12) { doc.setFontSize(z); if (doc.getTextWidth(str) + cs * (str.length - 1) <= maxW) break; z -= 0.5; } return z; }
      var l1 = T.coverL1, l2 = T.coverL2;
      var s1 = fit(l1, 300, 92, "Cormorant", "bold", 1.2), s2 = Math.min(fit(l2, 300, 60, "Cormorant", "bold", 1.4), s1 * 0.56);
      setf("Cormorant", "bold", s1, DARK); text(l1, cx, 578 * k, { align: "center", charSpace: 1.2 });
      setf("Cormorant", "bold", s2, DARK); text(l2, cx, 578 * k + s1 * 0.30 + s2 * 0.66 + 4, { align: "center", charSpace: 1.4 });
      var oy = 722 * k; stroke(C.gold, 0.8); doc.line(cx - 94, oy, cx - 20, oy); doc.line(cx + 20, oy, cx + 94, oy);
      sprigDraw(cx - 15, oy + 6, 30, 3, -32, DARK, C.sage);
      var sub = title; if (sub) { var sl = wrap(sub, 250, 13, "Cormorant", "bold"); setf("Cormorant", "bold", 13, C.olive); sl.forEach(function (l, i) { text(l, cx, oy + 30 + i * 15, { align: "center" }); }); }
      if (name) {
        var fs = 26; doc.setFont("Cormorant", "bold"); doc.setFontSize(fs);
        while (doc.getTextWidth(name) > 260 && fs > 11) { fs -= 0.5; doc.setFontSize(fs); }
        setf("Cormorant", "bold", fs, DARK); text(name, cx, 812 * k + (sub ? 22 : 0), { align: "center" });
      }
    })();

    /* ========== 2. BIENVENIDA ========== */
    newPage(T.welcome_h);
    if (name) y = para(fmt(T.welcome_for, { name: name }), M, y, CW - 100, 15, 21, C.forest, "Fraunces", "normal") + 8;
    y = para(T.welcome_p1, M, y, CW, 11, 17, C.ink) + 6;
    y = para(T.welcome_p2, M, y, CW, 11, 17, C.ink) + 14;
    setf("Fraunces", "bold", 14, C.olive); text(T.how_h, M, y + 14); y += 28;
    T.how.forEach(function (t, i) {
      dot(M + 11, y + 11, 11, C.forest); setf("Fraunces", "bold", 11, C.cream); text(String(i + 1), M + 11, y + 15, { align: "center" });
      var ny = para(t, M + 32, y, CW - 32, 10.5, 15.5, C.ink); y = Math.max(ny, y + 24) + 10;
    });
    y += 6;
    var nl = wrap(T.note, CW - 36, 9.5), nh = 34 + nl.length * 14, noteTop = Y_MAX - nh;
    setf("Fraunces", "bold", 14, C.olive); text(T.intent_h, M, y + 14); y += 22;
    var nInt = Math.max(2, Math.min(8, Math.floor((noteTop - 20 - y) / 28)));
    y = hlines(M, y, CW, nInt, 28);
    box(M, noteTop, CW, nh, C.cream, C.line);
    setf("Fraunces", "bold", 10.5, C.forest); text(T.note_h, M + 18, noteTop + 20);
    para(T.note, M + 18, noteTop + 28, CW - 36, 9.5, 14, C.muted); y = Y_MAX; check("welcome");

    /* ========== 3. MI MAPA ========== */
    newPage(T.map_h, T.map_sub);
    var colW = (CW - 22) / 2, rows = [];
    groups.forEach(function (g) {
      rows.push({ h: 15, kind: "h", g: g });
      g.cards.forEach(function (c) { var ls = wrap(c[lang].t, colW - 14, 9.3, "Jost", "normal"); rows.push({ h: ls.length * 12.4 + 2.5, kind: "i", g: g, ls: ls }); });
    });
    var total = rows.reduce(function (s0, r0) { return s0 + r0.h; }, 0), acc = 0, split = rows.length;
    for (var ri = 0; ri < rows.length; ri++) {          // reparte en dos columnas sin dejar un título solo al final
      if (rows[ri].kind === "h" && acc + rows[ri].h / 2 >= total / 2) { split = ri; break; }
      acc += rows[ri].h;
    }
    if (split >= rows.length) split = Math.ceil(rows.length / 2);
    var h1c = rows.slice(0, split).reduce(function (s0, r0) { return s0 + r0.h; }, 0), h2c = total - h1c, listH = Math.max(h1c, h2c);
    var R = Math.max(96, Math.min(168, (Y_MAX - y - listH - 62) / 2 - 12)), mcx = W / 2, mcy = y + R + 12, MD = EQ.MAPA.model(R);
    stroke(C.gold, 0.7); doc.circle(mcx, mcy, R + 7, "S"); stroke(C.gold, 0.35); doc.circle(mcx, mcy, R + 3.5, "S");
    function drawMap(act, labels) {
      MD.sectors.forEach(function (sec) {
        var on = !!act[sec.area.id], col = EQ.MAPA.colors(sec.area, on);
        fill(rgb(col.fill)); stroke(rgb(col.stroke), 0.7);
        drawPoly(sec.pts.map(function (p) { return [mcx + p[0], mcy + p[1]]; }), "FD");
        var ink = rgb(col.ink), isz = MD.iconSize, ip = labels ? sec.icon : sec.c;
        icon(sec.area.icon, mcx + ip[0], mcy + ip[1], isz, ink, 1.1);
        if (labels) { setf("Jost", "medium", MD.fontSize * 0.98, ink); text(sec.area[lang].short, mcx + sec.label[0], mcy + sec.label[1] + MD.fontSize * 0.34, { align: "center" }); }
      });
      fill(C.cream); stroke(C.gold, 0.8); doc.circle(mcx, mcy, MD.r0 - 1, "FD");
      stroke(C.gold, 0.4); doc.circle(mcx, mcy, MD.r0 - 5, "S");
      icon("r_energy", mcx, mcy, MD.r0 * 1.0, C.forest, 1);
    }
    drawMap(active, true);
    y = mcy + R + 26;
    setf("Fraunces", "bold", 14, C.olive); text(T.map_chosen, M, y + 12); y += 26;
    var colY = [y, y];
    rows.forEach(function (r, idx) {
      var ci = idx < split ? 0 : 1, x = M + ci * (colW + 22), yy = colY[ci];
      if (r.kind === "h") { dot(x + 4, yy + 7, 3.4, rgb(r.g.area.color)); setf("Jost", "bold", 9.3, C.forest); text(r.g.area[lang].name, x + 14, yy + 10.2, { maxWidth: colW - 14 }); }
      else { fill(C.sage); doc.circle(x + 6.2, yy + 6.3, 1.2, "F"); setf("Jost", "normal", 9.3, C.ink); r.ls.forEach(function (l, i) { text(l, x + 14, yy + 9.4 + i * 12.4); }); }
      colY[ci] += r.h;
    });
    y = Math.max(colY[0], colY[1]); check("map");

    /* ========== 4. LAS SEIS ÁREAS ========== */
    newPage(T.areas_h, T.areas_sub);
    DT.AREAS.forEach(function (a) {
      var on = !!active[a.id], il = wrap(a[lang].intro, CW - 66, 10, "Jost", "normal"), bh = Math.max(66, 38 + il.length * 14.2);
      var col = EQ.MAPA.colors(a, true);
      fill(rgb(a.color)); doc.circle(M + 25, y + 27, 25, "F"); icon(a.icon, M + 25, y + 27, 27, rgb(a.ink), 1.2);
      setf("Fraunces", "bold", 13, C.forest); text(a[lang].name, M + 62, y + 15, { maxWidth: CW - 150 });
      if (on) { setf("Jost", "medium", 7.5, C.gold); text(T.chosen_mark.toUpperCase(), W - M, y + 14, { align: "right", charSpace: 1.4 }); dot(W - M - doc.getTextWidth(T.chosen_mark.toUpperCase()) - 14, y + 11.5, 2.6, C.gold); }
      setf("Jost", "normal", 10, C.ink); il.forEach(function (l, i) { text(l, M + 62, y + 31 + i * 14.2); });
      y += bh + 12;
      stroke(C.line, 0.4); if (a !== DT.AREAS[5]) doc.line(M + 62, y - 7, W - M, y - 7);
    });
    check("areas");

    /* ========== 5. PRÁCTICAS ELEGIDAS ========== */
    newPage(T.pract_h, T.pract_sub);
    var colW2 = (CW - 14) / 2, tw = colW2 - 24, compact = sel.length > 18;   // con muchas tarjetas, los bloques pierden su línea de escritura para no pasar de 16 páginas
    function blockMeasure(c) {
      var d = c[lang], tl = wrap(d.t, tw, 11.5, "Fraunces", "bold"), pl = wrap(d.p, tw, 9.2, "Jost", "normal"), ql = wrap(d.q, tw, 9.8, "Fraunces", "normal");
      return { d: d, tl: tl, pl: pl, ql: ql, h: 13 + tl.length * 14 + 5 + pl.length * 12.6 + 9 + 10 + ql.length * 13 + 8 + (compact ? 2 : 22) + 4 };
    }
    function blockDraw(c, m, x, top, h, col) {
      box(x, top, colW2, h, C.white, C.line, 6); fill(col); doc.roundedRect(x, top + 10, 2.6, 14, 1.3, 1.3, "F");
      var yy = top + 12; setf("Fraunces", "bold", 11.5, C.forest); m.tl.forEach(function (l, i) { text(l, x + 12, yy + 10 + i * 14); }); yy += m.tl.length * 14 + 5;
      setf("Jost", "normal", 9.2, C.ink); m.pl.forEach(function (l, i) { text(l, x + 12, yy + 9 + i * 12.6); }); yy += m.pl.length * 12.6 + 9;
      setf("Jost", "medium", 6.8, C.gold); text(T.reflect_label.toUpperCase(), x + 12, yy + 7, { charSpace: 1.3 }); yy += 10;
      setf("Fraunces", "normal", 9.8, C.forest); m.ql.forEach(function (l, i) { text(l, x + 12, yy + 9 + i * 13); }); yy += m.ql.length * 13 + 8;
      if (!compact) { stroke(C.line, 0.5); doc.line(x + 12, yy + 14, x + colW2 - 12, yy + 14); }
    }
    groups.forEach(function (g) {
      var ms = g.cards.map(blockMeasure), firstRow = Math.max(ms[0].h, ms[1] ? ms[1].h : 0);
      need(34 + firstRow);
      var ac = rgb(g.area.color);
      fill(ac); doc.circle(M + 10, y + 12, 10, "F"); icon(g.area.icon, M + 10, y + 12, 12.5, rgb(g.area.ink), 1);
      setf("Fraunces", "bold", 13, C.forest); text(g.area[lang].name, M + 28, y + 17);
      stroke(C.line, 0.5); doc.line(M + 28 + doc.getTextWidth(g.area[lang].name) + 10, y + 13.5, W - M, y + 13.5);
      y += 30;
      for (var i = 0; i < g.cards.length; i += 2) {
        var rowH = Math.max(ms[i].h, ms[i + 1] ? ms[i + 1].h : 0);
        need(rowH);
        blockDraw(g.cards[i], ms[i], M, y, rowH, ac);
        if (g.cards[i + 1]) blockDraw(g.cards[i + 1], ms[i + 1], M + colW2 + 14, y, rowH, ac);
        y += rowH + 10;
      }
      y += 4;
    });
    // el resto de la última página de prácticas se aprovecha como espacio de notas (nunca queda vacía)
    var rem = Y_MAX - y;
    if (rem >= 80) {
      setf("Fraunces", "bold", 12.5, C.olive); text(T.notes_h, M, y + 14);
      var nlines = Math.min(26, Math.floor((rem - 32) / 22)); hlines(M, y + 20, CW, nlines, 22);
    }

    /* ========== 6. PREGUNTAS DE REFLEXIÓN ========== */
    newPage(T.refl_h, T.refl_sub);
    EQ.MOTOR.preguntas(sel, lang).forEach(function (q) {
      var ql = wrap(q.text, CW - 40, 12, "Fraunces", "normal");
      if (q.area) { dot(M + 5, y + 8, 4, rgb(q.area.color)); setf("Jost", "medium", 7.5, C.muted); text(q.area[lang].short.toUpperCase(), M + 15, y + 10.5, { charSpace: 1.3 }); }
      else { dot(M + 5, y + 8, 4, C.sage); }
      y += 18; setf("Fraunces", "normal", 12, C.forest); ql.forEach(function (l, i) { text(l, M, y + 11 + i * 16); }); y += ql.length * 16 + 2;
      y = hlines(M, y, CW, 3, 19) + 7;
    });
    check("reflexion");

    /* ========== 7. EXPLORANDO MIS NECESIDADES ========== */
    newPage(T.needs_h);
    setf("Fraunces", "bold", 13, C.olive); text(T.needs_words, M, y + 12);
    setf("Jost", "normal", 9.5, C.muted); text(T.needs_words_sub, M, y + 26); y += 38;
    var words = DT.NEEDS[lang], cw4 = CW / 4;
    words.forEach(function (w, i) {
      var cx2 = M + (i % 4) * cw4, cy2 = y + Math.floor(i / 4) * 21;
      stroke(C.sage, 0.8); doc.circle(cx2 + 5, cy2 + 7, 4.2, "S"); cfield(cx2 + 5, cy2 + 7, 10); setf("Jost", "normal", 10, C.ink); text(w, cx2 + 15, cy2 + 10.4);
    });
    y += 4 * 21 + 10;
    setf("Fraunces", "bold", 13, C.olive); text(T.needs_stems, M, y + 12); y += 24;
    EQ.MOTOR.frases(sel, lang).forEach(function (s) {
      var sl = wrap(s, CW, 10.8, "Fraunces", "normal"); setf("Fraunces", "normal", 10.8, C.forest);
      sl.forEach(function (l, i) { text(l, M, y + 10 + i * 14); }); y += sl.length * 14 + 1;
      y = hlines(M, y, CW, 1, 21) + 7;
    });
    y += 6;
    setf("Fraunces", "bold", 13, C.olive); text(T.needs_prior, M, y + 12); y += 20;
    for (var pi = 0; pi < 3; pi++) {
      dot(M + 8, y + 16, 8, C.forest); setf("Fraunces", "bold", 9.5, C.cream); text(String(pi + 1), M + 8, y + 19.3, { align: "center" });
      stroke(C.line, 0.5); doc.line(M + 24, y + 22, W - M, y + 22); y += 26;
    }
    check("necesidades");

    /* ========== 8. MI MAPA A MANO ========== */
    newPage(T.hand_h, T.hand_sub);
    R = 150; mcx = W / 2; mcy = y + R + 12; MD = EQ.MAPA.model(R);
    stroke(C.gold, 0.7); doc.circle(mcx, mcy, R + 7, "S"); stroke(C.gold, 0.35); doc.circle(mcx, mcy, R + 3.5, "S");
    drawMap({}, true);
    y = mcy + R + 28;
    setf("Fraunces", "bold", 13, C.olive); text(T.hand_notes, M, y + 12); y += 18;
    var hn = Math.min(6, Math.floor((Y_MAX - y) / 24)); hlines(M, y, CW, hn, 24); y += hn * 24; check("mano");

    /* ========== 9. PEQUEÑAS ACCIONES ========== */
    newPage(T.act_h, T.act_sub);
    var ac6 = EQ.MOTOR.acciones(sel, lang, 6), cols = [212, 110, 132, CW - 454], rh = 62, x0 = M;
    fill(C.forest); doc.roundedRect(M, y, CW, 26, 5, 5, "F");
    setf("Jost", "medium", 8.5, C.cream);
    var cxp = x0; T.act_cols.forEach(function (t, i) { text(t.toUpperCase(), i === 3 ? cxp + cols[i] / 2 : cxp + 10, y + 16.5, { charSpace: 1, align: i === 3 ? "center" : undefined }); cxp += cols[i]; });
    y += 26;
    for (var ai = 0; ai < 6; ai++) {
      fill(ai % 2 ? C.cream : C.white); doc.rect(M, y, CW, rh, "F"); stroke(C.line, 0.5); doc.rect(M, y, CW, rh, "S");
      var cxx = M; cols.forEach(function (cw5, i) { if (i) doc.line(cxx, y, cxx, y + rh); cxx += cw5; });
      var it = ac6[ai];
      if (it) { dot(M + 12, y + 13, 3.2, rgb(DT.areaById(it.card.area).color)); para(it.text, M + 22, y + 6, cols[0] - 30, 9.8, 13.2, C.ink); }
      else { setf("Jost", "normal", 8, C.muted); text(T.act_own, M + 10, y + 14); }
      tfield(M + cols[0] + 4, y + 4, cols[1] - 8, rh - 8, true); tfield(M + cols[0] + cols[1] + 4, y + 4, cols[2] - 8, rh - 8, true);
      checkbox(M + cols[0] + cols[1] + cols[2] + cols[3] / 2, y + rh / 2, 15);
      y += rh;
    }
    check("acciones");

    /* ========== 10. PLANIFICADOR SEMANAL ========== */
    newPage(T.week_h);
    setf("Fraunces", "bold", 12, C.olive); text(T.week_intent, M, y + 12); y += 16; y = hlines(M, y, CW, 2, 24) + 12;
    var wc = [86, 196, CW - 282], sug = EQ.MOTOR.acciones(sel, lang, 7);
    fill(C.forest); doc.roundedRect(M, y, CW, 24, 5, 5, "F"); setf("Jost", "medium", 8.5, C.cream);
    var wx = M; T.week_cols.forEach(function (t, i) { text(t.toUpperCase(), wx + 10, y + 15.5, { charSpace: 1 }); wx += wc[i]; });
    y += 24;
    var wrh = Math.min(66, Math.floor((Y_MAX - y) / 7));
    DT.DAYS[lang].forEach(function (d, i) {
      fill(i % 2 ? C.cream : C.white); doc.rect(M, y, CW, wrh, "F"); stroke(C.line, 0.5); doc.rect(M, y, CW, wrh, "S");
      doc.line(M + wc[0], y, M + wc[0], y + wrh); doc.line(M + wc[0] + wc[1], y, M + wc[0] + wc[1], y + wrh);
      setf("Fraunces", "bold", 11, C.forest); text(d, M + 10, y + 19);
      if (sug[i]) { dot(M + wc[0] + 10, y + 14, 2.8, rgb(DT.areaById(sug[i].card.area).color)); para(sug[i].text, M + wc[0] + 18, y + 6, wc[1] - 26, 9.3, 12.6, C.ink); }
      hlines(M + wc[0] + wc[1] + 10, y + wrh - 40, wc[2] - 20, 2, 19, C.line);
      y += wrh;
    });
    check("semana");

    /* ========== 11. SEGUIMIENTO DE PRÁCTICAS ========== */
    newPage(T.track_h, T.track_sub);
    var tp = EQ.MOTOR.seguimiento(sel, lang), tcw = 150, dw = (CW - tcw) / 7, trh = 25;
    for (var wk = 1; wk <= 2; wk++) {
      setf("Fraunces", "bold", 12.5, C.olive); text(fmt(T.track_week, { n: wk }), M, y + 12); y += 18;
      fill(C.forest); doc.roundedRect(M, y, CW, 22, 5, 5, "F");
      setf("Jost", "medium", 8, C.cream); text(T.track_practice.toUpperCase(), M + 10, y + 14.5, { charSpace: 1 });
      setf("Fraunces", "bold", 10.5, C.cream); DT.DAYS_SHORT[lang].forEach(function (d, i) { text(d, M + tcw + dw * i + dw / 2, y + 15, { align: "center" }); });
      y += 22;
      for (var r = 0; r < 8; r++) {
        fill(r % 2 ? C.cream : C.white); doc.rect(M, y, CW, trh, "F"); stroke(C.line, 0.5); doc.rect(M, y, CW, trh, "S");
        if (tp[r]) { var tl2 = wrap(tp[r], tcw - 14, 8.4, "Jost", "normal"); setf("Jost", "normal", 8.4, C.ink); tl2.slice(0, 2).forEach(function (l, i) { text(l, M + 8, y + (tl2.length > 1 ? 10.2 : 15) + i * 9.6); }); }
        for (var d2 = 0; d2 < 7; d2++) { var dx = M + tcw + dw * d2; stroke(C.line, 0.5); doc.line(dx, y, dx, y + trh); stroke(C.sage, 0.8); doc.circle(dx + dw / 2, y + trh / 2, 6.2, "S"); cfield(dx + dw / 2, y + trh / 2, 13); }
        y += trh;
      }
      y += 20;
    }
    check("seguimiento");

    /* ========== 12. REVISIÓN SEMANAL ========== */
    newPage(T.rev_h);
    for (var rw = 1; rw <= 2; rw++) {
      fill(C.pale); doc.roundedRect(M, y, CW, 24, 5, 5, "F"); setf("Fraunces", "bold", 12, C.forest); text(fmt(T.rev_week, { n: rw }), M + 12, y + 16); y += 32;
      T.rev_q.forEach(function (q) { setf("Jost", "medium", 9.6, C.olive); text(q, M, y + 9); y += 12; y = hlines(M, y, CW, 2, 20) + 8; });
      y += 8;
    }
    check("revision");

    /* ========== 13. NOTAS Y REFLEXIÓN FINAL ========== */
    newPage(T.final_h);
    y = para(T.final_p, M, y, CW - 60, 12.5, 19, C.forest, "Fraunces", "normal") + 12;
    setf("Fraunces", "bold", 12.5, C.olive); text(T.final_q, M, y + 12); y += 18;
    var dl = wrap(T.note, CW - 36, 9.3), dh = 30 + dl.length * 13.5, bottom = Y_MAX - dh - 16;
    var n1 = Math.floor((bottom - y - 44) / 23); y = hlines(M, y, CW, Math.min(7, n1), 23) + 16;
    setf("Fraunces", "bold", 12.5, C.olive); text(T.free_notes, M, y + 12); y += 16;
    var n2 = Math.floor((bottom - y) / 23); y = hlines(M, y, CW, Math.max(0, n2), 23) + 14;
    box(M, Y_MAX - dh, CW, dh, C.cream, C.line);
    setf("Fraunces", "bold", 10, C.forest); text(T.note_h, M + 18, Y_MAX - dh + 18);
    para(T.note, M + 18, Y_MAX - dh + 24, CW - 36, 9.3, 13.5, C.muted);

    /* ---------- pie de página ---------- */
    var total = doc.getNumberOfPages();
    for (var p = 2; p <= total; p++) {
      doc.setPage(p); stroke(C.gold, 0.4); doc.line(M, H - 42, W - M, H - 42);
      setf("Jost", "normal", 8, C.muted); text(T.brand, M, H - 28);
      text(T.product, W / 2, H - 28, { align: "center" });
      text(fmt(T.page, { n: p, t: total }), W - M, H - 28, { align: "right" });
    }
    doc.__eq = { pages: total, warn: warn, fields: fields };
    return doc;
  }

  /* Convierte el PDF dibujado en un PDF con campos editables (texto y casillas). Devuelve una promesa con los bytes.
     Si la biblioteca no está disponible o algo falla, devuelve el PDF normal (imprimible). */
  function finalizar(doc) {
    var plano = function () { return new Uint8Array(doc.output("arraybuffer")); };
    var L = root.PDFLib, fl = doc.__eq && doc.__eq.fields;
    if (!L || !fl || !fl.length) return Promise.resolve(plano());
    return L.PDFDocument.load(plano()).then(function (pd) {
      var form = pd.getForm(), pages = pd.getPages(), ink = L.rgb(0.184, 0.235, 0.196), n = 0;
      fl.forEach(function (f) {
        var pg = pages[f.p - 1]; if (!pg) return; var opt = { x: f.x, y: H - f.y - f.h, width: f.w, height: f.h, borderWidth: 0, textColor: ink };
        n++;
        if (f.k === "c") { var cb = form.createCheckBox("c" + n); cb.addToPage(pg, opt); }
        else { var tf = form.createTextField("t" + n); if (f.m) tf.enableMultiline(); tf.addToPage(pg, opt); tf.setFontSize(f.m ? 9.5 : 10.5); }
      });
      return pd.save();
    }).catch(function (e) { if (root.console) console.error(e); return plano(); });
  }

  EQ.PDF = { crear: crear, finalizar: finalizar, A4: { W: W, H: H } };
})(typeof window !== "undefined" ? window : globalThis);
