/* Genera el PDF de "Tu mapa de hábitos" en el navegador con jsPDF (sin servidor). */
(function (root) {
  "use strict";
  var C = {
    forest: [23, 58, 30], olive: [95, 115, 24], sage: [168, 192, 138], mint: [220, 232, 210],
    ivory: [247, 243, 232], cream: [251, 248, 241], terra: [169, 85, 47], wood: [139, 107, 74], ink: [58, 44, 34]
  };
  var W = 612, H = 792, M = 54, CW = W - 2 * M;

  function fill(s, v) { return root.MAPA_MOTOR.fill(s, v); }

  function crear(res) {
    var jsPDF = root.jspdf.jsPDF;
    var D = root.MAPA_DATA[res.lang].pdf;
    var doc = new jsPDF({ unit: "pt", format: "letter", compress: true });
    var F = root.MAPA_FONTS;
    [["Fraunces", "normal", "Fraunces-Regular"], ["Fraunces", "bold", "Fraunces-SemiBold"], ["Fraunces", "italic", "Fraunces-Italic"],
     ["Jost", "normal", "Jost-Regular"], ["Jost", "medium", "Jost-Medium"], ["Jost", "bold", "Jost-SemiBold"]
    ].forEach(function (f) {
      doc.addFileToVFS(f[2] + ".ttf", F[f[2]]);
      doc.addFont(f[2] + ".ttf", f[0], f[1]);
    });
    doc.setProperties({ title: D.title + " — " + res.name, author: "Salud Integral", creator: "Salud Integral" });

    var y = 0, pageNo = 1;
    var col = function (c) { doc.setTextColor(c[0], c[1], c[2]); };
    var fillc = function (c) { doc.setFillColor(c[0], c[1], c[2]); };
    var strokec = function (c) { doc.setDrawColor(c[0], c[1], c[2]); };
    var font = function (fam, st, size, c) { doc.setFont(fam, st); doc.setFontSize(size); col(c || C.ink); };

    function lines(text, w, size, fam, st) {
      doc.setFont(fam || "Jost", st || "normal"); doc.setFontSize(size);
      return doc.splitTextToSize(String(text), w);
    }

    function band() { // cabecera de páginas interiores
      fillc(C.forest); doc.rect(0, 0, W, 38, "F");
      doc.addImage(root.MAPA_LOGO, "PNG", M, 7, 24, 24);
      font("Fraunces", "bold", 12, C.ivory); doc.text("Salud Integral", M + 32, 24);
      font("Jost", "normal", 9, C.sage); doc.text(D.title, W - M, 24, { align: "right" });
    }
    function newPage() { doc.addPage(); pageNo++; band(); y = 70; }
    function need(h) { if (y + h > H - 56) newPage(); }

    function h2(text) {
      need(46); font("Fraunces", "bold", 21, C.forest); doc.text(text, M, y + 16);
      strokec(C.sage); doc.setLineWidth(1.2); doc.line(M, y + 26, M + 46, y + 26); y += 46;
    }
    function h3(text, c) { need(26); font("Fraunces", "bold", 13.5, c || C.olive); doc.text(text, M, y + 12); y += 22; }
    function para(text, o) {
      o = o || {}; var size = o.size || 11, lh = size * 1.5, w = o.w || CW, x = o.x || M;
      var ls = lines(text, w, size, o.fam || "Jost", o.st || "normal");
      ls.forEach(function (l) { need(lh); font(o.fam || "Jost", o.st || "normal", size, o.c || C.ink); doc.text(l, x, y + size); y += lh; });
      y += o.after === undefined ? 6 : o.after;
    }
    function bullets(items, c) {
      items.forEach(function (t) {
        var ls = lines(t, CW - 16, 11); need(ls.length * 16.5 + 2);
        fillc(c || C.olive); doc.circle(M + 4, y + 7, 2.2, "F");
        ls.forEach(function (l) { font("Jost", "normal", 11); doc.text(l, M + 16, y + 11); y += 16.5; });
        y += 2;
      });
      y += 4;
    }
    function box(h, bg, line) {
      fillc(bg); doc.roundedRect(M, y, CW, h, 8, 8, "F");
      if (line) { strokec(line); doc.setLineWidth(0.8); doc.roundedRect(M, y, CW, h, 8, 8, "S"); }
    }

    /* ---------- Portada (imagen de marca + nombre personalizado) ---------- */
    var iw = W, ih = W * 1491 / 1055;
    doc.addImage(root.MAPA_PORTADA[res.lang], "JPEG", 0, (H - ih) / 2, iw, ih);
    var etiqueta = D.for_ + " · " + res.name, fs = 18;
    doc.setFont("Fraunces", "italic"); doc.setFontSize(fs);
    while (doc.getTextWidth(etiqueta) > 470 && fs > 9) { fs -= 0.5; doc.setFontSize(fs); }
    var pw = doc.getTextWidth(etiqueta) + 48;
    fillc(C.cream); doc.roundedRect((W - pw) / 2, 30, pw, 44, 22, 22, "F");
    strokec([160, 128, 96]); doc.setLineWidth(0.8); doc.roundedRect((W - pw) / 2, 30, pw, 44, 22, 22, "S");
    font("Fraunces", "italic", fs, C.forest); doc.text(etiqueta, W / 2, 30 + 22 + fs * 0.33, { align: "center" });

    /* ---------- Perfil ---------- */
    newPage();
    h2(D.profile_h);
    font("Fraunces", "bold", 16, C.terra); doc.text(res.profile.name, M, y + 8); y += 22;
    para(res.profile.desc);
    y += 4;
    // Dos columnas: fortalezas / a tener presente
    var colW = (CW - 18) / 2;
    var A = res.profile.strengths, B = res.profile.watch;
    function colH(items) { var h = 30; items.forEach(function (t) { h += lines(t, colW - 30, 10.5).length * 15.5 + 5; }); return h + 8; }
    var hh = Math.max(colH(A), colH(B)); need(hh + 6);
    [[A, D.strengths, M, C.mint, C.olive], [B, D.watch, M + colW + 18, C.cream, C.terra]].forEach(function (c) {
      fillc(c[3]); doc.roundedRect(c[2], y, colW, hh, 8, 8, "F");
      if (c[3] === C.cream) { strokec(C.sage); doc.setLineWidth(0.8); doc.roundedRect(c[2], y, colW, hh, 8, 8, "S"); }
      font("Fraunces", "bold", 12.5, c[4]); doc.text(c[1], c[2] + 14, y + 22);
      var yy = y + 40;
      c[0].forEach(function (t) {
        fillc(c[4]); doc.circle(c[2] + 18, yy - 3.5, 2, "F");
        lines(t, colW - 36, 10.5).forEach(function (l) { font("Jost", "normal", 10.5); doc.text(l, c[2] + 28, yy); yy += 15.5; });
        yy += 5;
      });
    });
    y += hh + 18;

    // Ritmo de partida y área
    need(76);
    box(64, C.cream, C.sage);
    font("Jost", "medium", 9, C.olive); doc.text(D.ideal.toUpperCase(), M + 16, y + 20, { charSpace: 1 });
    font("Fraunces", "bold", 13, C.forest); doc.text(fill(D.ideal_t, { m: res.minutes, moment: res.moment }), M + 16, y + 40, { maxWidth: CW / 2 - 24 });
    font("Jost", "medium", 9, C.olive); doc.text(D.area_h.toUpperCase(), M + CW / 2 + 8, y + 20, { charSpace: 1 });
    font("Fraunces", "bold", 13, C.forest); doc.text(res.area.label, M + CW / 2 + 8, y + 40, { maxWidth: CW / 2 - 24 });
    y += 84;

    /* ---------- Obstáculos ---------- */
    newPage();
    h2(D.obstacles_h);
    res.obstacles.forEach(function (o, i) {
      var wl = lines(o.why, CW - 32, 10.5), il = lines(o.ifthen, CW - 32, 10.5);
      var h = 34 + wl.length * 15.5 + 12 + 16 + il.length * 15.5 + 12;
      need(h + 10);
      box(h, C.cream, C.sage);
      fillc(C.olive); doc.circle(M + 20, y + 22, 11, "F");
      font("Fraunces", "bold", 12, C.ivory); doc.text(String(i + 1), M + 20, y + 26.5, { align: "center" });
      font("Fraunces", "bold", 13.5, C.forest); doc.text(o.label, M + 40, y + 27, { maxWidth: CW - 56 });
      var yy = y + 50;
      wl.forEach(function (l) { font("Jost", "normal", 10.5); doc.text(l, M + 16, yy); yy += 15.5; });
      yy += 8; font("Jost", "medium", 9, C.terra); doc.text(D.plan_if.toUpperCase(), M + 16, yy, { charSpace: 1 }); yy += 15;
      il.forEach(function (l) { font("Fraunces", "italic", 10.5, C.forest); doc.text(l, M + 16, yy); yy += 15.5; });
      y += h + 12;
    });

    /* ---------- Recomendaciones ---------- */
    y += 10;
    h2(D.recs_h);
    res.recs.forEach(function (r, i) {
      var wl = lines(r.w, CW - 40, 10.5), dl = lines(r.d, CW - 56, 10.5), tl2 = lines(r.t, CW - 70, 14, "Fraunces", "bold");
      var h = 22 + tl2.length * 20 + wl.length * 15.5 + 14 + 18 + dl.length * 15.5 + 20;
      need(h + 10);
      box(h, i % 2 ? C.cream : C.mint, i % 2 ? C.sage : null);
      font("Fraunces", "bold", 30, C.sage); doc.text(String(i + 1), M + 16, y + 40);
      var yy = y + 30;
      tl2.forEach(function (l) { font("Fraunces", "bold", 14, C.forest); doc.text(l, M + 48, yy); yy += 20; });
      yy += 2;
      wl.forEach(function (l) { font("Jost", "normal", 10.5); doc.text(l, M + 20, yy); yy += 15.5; });
      yy += 8;
      fillc(C.ivory); var bh = 18 + dl.length * 15.5 + 6; doc.roundedRect(M + 20, yy - 8, CW - 40, bh, 6, 6, "F");
      font("Jost", "medium", 9, C.terra); doc.text(D.try_.toUpperCase(), M + 32, yy + 6, { charSpace: 1 });
      yy += 22;
      dl.forEach(function (l) { font("Jost", "normal", 10.5); doc.text(l, M + 32, yy - 2); yy += 15.5; });
      y += h + 14;
    });

    /* ---------- Plan de 7 días ---------- */
    newPage();
    h2(D.plan_h);
    res.plan.forEach(function (p) {
      var tl3 = lines(p.text, CW - 92, 10.5), h = Math.max(54, 24 + tl3.length * 15.5 + 14);
      need(h + 10);
      box(h, p.n % 2 ? C.cream : C.ivory, C.sage);
      fillc(C.forest); doc.roundedRect(M, y, 66, h, 8, 8, "F"); fillc(C.forest); doc.rect(M + 40, y, 26, h, "F");
      font("Jost", "medium", 8.5, C.sage); doc.text(fill(D.day, { n: "" }).trim().toUpperCase(), M + 33, y + h / 2 - 8, { align: "center", charSpace: 1 });
      font("Fraunces", "bold", 24, C.ivory); doc.text(String(p.n), M + 33, y + h / 2 + 16, { align: "center" });
      font("Fraunces", "bold", 12, C.forest); doc.text(p.title, M + 80, y + 20);
      var yy = y + 37; tl3.forEach(function (l) { font("Jost", "normal", 10.5); doc.text(l, M + 80, yy); yy += 15.5; });
      y += h + 8;
    });

    /* ---------- Hoja de seguimiento ---------- */
    newPage();
    h2(D.track_h);
    para(D.track_p, { c: C.wood });
    y += 4;
    var lw = 150, cw = (CW - lw) / 7, rh = 40;
    need(30 + 5 * rh);
    fillc(C.forest); doc.roundedRect(M, y, CW, 28, 6, 6, "F");
    font("Jost", "medium", 9, C.sage); doc.text(D.day.replace("{n}", "").trim().toUpperCase(), M + 10, y + 18, { charSpace: 1 });
    for (var d = 0; d < 7; d++) { font("Fraunces", "bold", 13, C.ivory); doc.text(String(d + 1), M + lw + cw * d + cw / 2, y + 19, { align: "center" }); }
    y += 28;
    D.track_rows.forEach(function (label, r) {
      fillc(r % 2 ? C.cream : C.ivory); doc.rect(M, y, CW, rh, "F");
      strokec(C.sage); doc.setLineWidth(0.6); doc.rect(M, y, CW, rh, "S");
      font("Jost", "medium", 10.5, C.forest);
      lines(label, lw - 16, 10.5, "Jost", "medium").forEach(function (l, i) { doc.text(l, M + 10, y + 17 + i * 13); });
      for (var k = 0; k < 7; k++) {
        var cx = M + lw + cw * k;
        strokec(C.sage); doc.setLineWidth(0.6); doc.line(cx, y, cx, y + rh);
        if (r < 2) { strokec(C.olive); doc.setLineWidth(1); doc.circle(cx + cw / 2, y + rh / 2, 8, "S"); }
      }
      y += rh;
    });
    y += 28;
    h3(D.track_refl_h, C.forest);
    D.track_refl.forEach(function (q) {
      need(70); font("Jost", "medium", 10.5, C.olive); doc.text(q, M, y + 10);
      strokec(C.sage); doc.setLineWidth(0.6); doc.line(M, y + 36, M + CW, y + 36); doc.line(M, y + 56, M + CW, y + 56);
      y += 72;
    });

    /* ---------- Compromiso ---------- */
    newPage();
    h2(D.commit_h);
    var cl = lines(res.commitment, CW - 64, 13, "Fraunces", "italic"), chh = 56 + cl.length * 21;
    need(chh + 120);
    box(chh, C.mint, null);
    strokec(C.olive); doc.setLineWidth(1.4); doc.roundedRect(M + 8, y + 8, CW - 16, chh - 16, 6, 6, "S");
    var cy = y + 38; cl.forEach(function (l) { font("Fraunces", "italic", 13, C.forest); doc.text(l, M + 32, cy); cy += 21; });
    y += chh + 40;
    strokec(C.ink); doc.setLineWidth(0.7);
    doc.line(M, y + 24, M + CW / 2 - 20, y + 24); doc.line(M + CW / 2 + 20, y + 24, M + CW, y + 24);
    font("Jost", "normal", 9.5, C.wood); doc.text(D.sign, M, y + 38); doc.text(D.date_, M + CW / 2 + 20, y + 38);
    y += 84;
    // Aviso
    var dl2 = lines(D.disclaimer, CW - 28, 9, "Jost", "normal");
    var dh = dl2.length * 13 + 24; need(dh + 4);
    box(dh, C.cream, C.sage);
    var dy = y + 18; dl2.forEach(function (l) { font("Jost", "normal", 9, C.wood); doc.text(l, M + 14, dy); dy += 13; });

    /* ---------- Pie de página ---------- */
    var total = doc.getNumberOfPages();
    for (var p = 2; p <= total; p++) {
      doc.setPage(p);
      strokec(C.sage); doc.setLineWidth(0.6); doc.line(M, H - 40, W - M, H - 40);
      font("Jost", "normal", 8.5, C.wood);
      doc.text(D.footer, M, H - 26);
      doc.text(fill(D.page, { n: p, t: total }), W - M, H - 26, { align: "right" });
    }
    return doc;
  }

  function nombreArchivo(res) {
    var D = root.MAPA_DATA[res.lang].pdf;
    var limpio = res.name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "mapa";
    return fill(D.file, { name: limpio });
  }

  root.MAPA_PDF = { crear: crear, nombreArchivo: nombreArchivo };
})(typeof window !== "undefined" ? window : globalThis);
