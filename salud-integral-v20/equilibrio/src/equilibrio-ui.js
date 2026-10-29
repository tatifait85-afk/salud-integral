/* Mi mapa de equilibrio — INTERFAZ
   Pantallas: bienvenida · orientación · áreas · constructor (biblioteca + mapa en vivo) · revisión · vista previa.
   Un único estado compartido (idioma, tarjetas elegidas en orden, nombre, título) que se guarda en sessionStorage
   (solo en este dispositivo, solo durante la sesión). Los textos salen de EQ.DATA; el mapa, de EQ.MAPA; el PDF, de EQ.PDF. */
(function (root) {
  "use strict";
  var EQ = root.EQ, D = EQ.DATA, doc = root.document, KEY = "eq_state_v1";
  var SCREENS = ["welcome", "orient", "areas", "build", "review", "preview"];
  var STEP_OF = { areas: 0, build: 1, review: 2, preview: 3 }, STEP_GO = ["areas", "build", "review", "preview"];
  var state = load(), lastBlob = null, lastName = "", confirmTimer = null;

  /* ---------- estado ---------- */
  function fresh() { var en = String(root.navigator && navigator.language || "es").slice(0, 2) === "en"; return { v: 1, lang: en ? "en" : "es", screen: "welcome", tab: "all", sel: [], name: "", title: "" }; }
  function sanitize(o) {
    var s = fresh(); if (o.lang === "en" || o.lang === "es") s.lang = o.lang;
    if (SCREENS.indexOf(o.screen) >= 0) s.screen = o.screen;
    if (o.tab === "all" || D.areaIndex(o.tab) >= 0) s.tab = o.tab;
    s.sel = EQ.MOTOR.cardsOf(Array.isArray(o.sel) ? o.sel : []).map(function (c) { return c.id; });
    s.name = EQ.MOTOR.limpiarTexto(o.name, 40); s.title = EQ.MOTOR.limpiarTexto(o.title, 60);
    return s;
  }
  function load() { try { var r = root.sessionStorage.getItem(KEY); if (r) { var o = JSON.parse(r); if (o && o.v === 1) return sanitize(o); } } catch (e) {} return fresh(); }
  function save() { try { root.sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  /* ---------- utilidades ---------- */
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || doc).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function U() { return D.UI[state.lang]; }
  function ico(id, size, sw) { return EQ.ICONS.svg(id, { size: size || 20, sw: sw || 1.6 }); }
  function areaStyle(a) { return "--c:" + a.color + ";--ink-c:" + a.ink; }
  function cnt(n) { return state.lang === "en" ? (n === 1 ? "1 card chosen" : n + " cards chosen") : (n === 1 ? "1 tarjeta elegida" : n + " tarjetas elegidas"); }
  function active() { return EQ.MAPA.areasActivas(state.sel); }
  function mapSvg(act, labels) { return EQ.MAPA.svg({ lang: state.lang, active: act, labels: labels }); }

  /* ---------- barra superior ---------- */
  function renderTop() {
    var u = U(), si = STEP_OF[state.screen], steps = "";
    if (si !== undefined) {
      steps = '<nav class="steps" aria-label="' + esc(u.steps.join(" · ")) + '"><ol>' + u.steps.map(function (t, i) {
        var cls = i === si ? "on" : (i < si ? "done" : "");
        return '<li class="' + cls + '"><button type="button" data-go="' + STEP_GO[i] + '"' + (i === si ? ' aria-current="step"' : "") + '><span class="n">' + (i + 1) + "</span>" + esc(t) + "</button></li>";
      }).join("") + "</ol></nav>";
    } else steps = '<div class="steps"></div>';
    $("#top").innerHTML = '<a class="skip" href="#main">' + esc(u.skip) + '</a><div class="top-in wrap"><button type="button" class="brand" data-go="welcome" aria-label="' + esc(u.brand) + '"><img src="' + EQ.ASSETS.logo + '" alt="" width="38" height="38"><span>' + esc(u.brand) + "</span></button>" + steps +
      '<div class="lang" role="group" aria-label="' + esc(u.lang_label) + '"><button type="button" data-lang="es" aria-pressed="' + (state.lang === "es") + '" lang="es">ES</button><button type="button" data-lang="en" aria-pressed="' + (state.lang === "en") + '" lang="en">EN</button></div></div>';
  }

  /* ---------- pantallas ---------- */
  function viewWelcome() {
    var u = U();
    return '<section class="welcome"><div class="welcome-card"><img class="logo" src="' + EQ.ASSETS.logo + '" alt="' + esc(u.brand) + '" width="72" height="72">' +
      '<p class="eyebrow">' + esc(u.w_eyebrow) + '</p><h1 id="h1" tabindex="-1">' + esc(u.w_title) + '</h1><p class="lead">' + esc(u.w_lead) + '</p>' +
      '<div class="actions"><button type="button" class="btn" data-go="areas">' + esc(u.w_start) + ico("ui_right", 20, 1.8) + '</button><button type="button" class="btn ghost" data-go="orient">' + esc(u.w_how) + "</button></div>" +
      '<p class="note">' + esc(u.w_note) + '</p></div><div class="welcome-map">' + mapSvg({}, true) + "</div></section>";
  }
  function viewOrient() {
    var u = U();
    return '<div class="page-head"><h1 id="h1" tabindex="-1">' + esc(u.o_title) + '</h1><p class="lead">' + esc(u.o_lead) + '</p></div><ol class="steps3">' +
      u.o_steps.map(function (s, i) { return '<li><span class="num" aria-hidden="true">' + (i + 1) + '</span><h3>' + esc(s[0]) + "</h3><p>" + esc(s[1]) + "</p></li>"; }).join("") +
      '</ol><div class="actions"><button type="button" class="btn ghost" data-go="welcome">' + ico("ui_left", 20, 1.8) + esc(u.back) + '</button><button type="button" class="btn" data-go="areas">' + esc(u.start) + ico("ui_right", 20, 1.8) + "</button></div>";
  }
  function viewAreas() {
    var u = U(), lang = state.lang, act = active();
    var counts = {}; state.sel.forEach(function (id) { var a = D.cardById(id).area; counts[a] = (counts[a] || 0) + 1; });
    return '<div class="page-head"><h1 id="h1" tabindex="-1">' + esc(u.a_title) + '</h1><p class="lead">' + esc(u.a_lead) + '</p></div><div class="areas">' +
      D.AREAS.map(function (a) {
        var n = counts[a.id] || 0;
        return '<button type="button" class="area" data-area="' + a.id + '" style="' + areaStyle(a) + '"><span class="bub">' + ico(a.icon, 30, 1.4) + "</span><h2>" + esc(a[lang].name) + "</h2><p>" + esc(a[lang].desc) + '</p><span class="meta' + (n ? " has" : "") + '"><i></i>' + esc(n ? cnt(n) : u.a_chosen0) + " · " + esc(u.a_open) + "</span></button>";
      }).join("") + '</div><div class="actions"><button type="button" class="btn ghost" data-go="orient">' + ico("ui_left", 20, 1.8) + esc(u.back) + '</button><button type="button" class="btn" data-area="all">' + esc(u.a_continue) + ico("ui_right", 20, 1.8) + "</button></div>";
  }

  function cardHtml(c) {
    var lang = state.lang, a = D.areaById(c.area), on = state.sel.indexOf(c.id) >= 0, u = U();
    return '<button type="button" class="card" role="checkbox" aria-checked="' + on + '" data-card="' + c.id + '" style="' + areaStyle(a) + '">' +
      '<span class="ic">' + ico(c.icon, 26, 1.4) + '</span><span class="t">' + esc(c[lang].t) + '</span><span class="ck">' + ico("ui_check", 16, 2.4) + '</span>' +
      '<span class="d">' + esc(c[lang].d) + '</span><span class="a"><i></i><span class="sr">' + esc(u.cat) + ": </span>" + esc(a[lang].short) + "</span></button>";
  }
  function gridHtml() {
    var lang = state.lang, html = "";
    if (state.tab === "all") {
      D.AREAS.forEach(function (a) {
        html += '<h2 class="group-h" style="' + areaStyle(a) + '"><span class="bub">' + ico(a.icon, 20, 1.5) + "</span>" + esc(a[lang].name) + '</h2><div class="cards">' +
          D.CARDS.filter(function (c) { return c.area === a.id; }).map(cardHtml).join("") + "</div>";
      });
    } else {
      var a2 = D.areaById(state.tab);
      html += '<p class="area-note">' + esc(a2[lang].intro) + '</p><div class="cards">' + D.CARDS.filter(function (c) { return c.area === a2.id; }).map(cardHtml).join("") + "</div>";
    }
    return html;
  }
  function viewBuild() {
    var u = U(), lang = state.lang;
    var tabs = '<div class="tabs" role="tablist" aria-label="' + esc(u.b_areas) + '"><button type="button" class="tab" role="tab" data-tab="all" aria-selected="' + (state.tab === "all") + '">' + esc(u.b_all) + "</button>" +
      D.AREAS.map(function (a) { return '<button type="button" class="tab" role="tab" data-tab="' + a.id + '" aria-selected="' + (state.tab === a.id) + '" style="--c:' + a.color + '"><i></i>' + esc(a[lang].short) + "</button>"; }).join("") + "</div>";
    return '<div class="page-head"><h1 id="h1" tabindex="-1">' + esc(u.b_title) + '</h1><p class="lead">' + esc(u.b_lead) + '</p></div><div class="builder">' +
      '<aside class="side" aria-label="' + esc(u.b_map) + '"><div id="mapHost">' + mapSvg(active(), true) + '</div><p class="count" id="cnt" aria-live="polite"></p>' +
      '<button type="button" class="btn" id="revBtn" data-go="review"></button></aside>' +
      '<section>' + tabs + '<div id="grid" role="tabpanel">' + gridHtml() + "</div></section></div>" +
      '<div class="mbar"><span class="count" id="cnt2" aria-hidden="true"></span><button type="button" class="btn small" id="revBtn2" data-go="review"></button></div>';
  }
  function refreshBuild() {
    var u = U(), n = state.sel.length, txt = n ? cnt(n) : u.b_none;
    if ($("#cnt")) $("#cnt").textContent = txt; if ($("#cnt2")) $("#cnt2").textContent = txt;
    [$("#revBtn"), $("#revBtn2")].forEach(function (b) { if (b) b.innerHTML = esc(n ? u.b_review_n.replace("{n}", n) : u.b_review) + ico("ui_right", 18, 1.8); });
    EQ.MAPA.actualizar($("#mapHost .eq-map"), active());
  }

  function viewReview() {
    var u = U(), lang = state.lang;
    if (!state.sel.length) {
      return '<div class="page-head"><h1 id="h1" tabindex="-1">' + esc(u.r_title) + '</h1></div><div class="empty">' + EQ.ICONS.svg("ui_leaf", { size: 44, sw: 1.2 }) + "<h2>" + esc(u.r_empty_h) + "</h2><p>" + esc(u.r_empty) + '</p><button type="button" class="btn" data-go="build">' + esc(u.r_explore) + ico("ui_right", 20, 1.8) + "</button></div>";
    }
    var groups = EQ.MOTOR.agrupar(state.sel);
    var list = groups.map(function (g) {
      var a = g.area;
      return '<section class="grp" style="' + areaStyle(a) + '"><h2 class="group-h" style="margin:0"><span class="bub">' + ico(a.icon, 20, 1.5) + "</span>" + esc(a[lang].name) + "</h2><ul>" + g.cards.map(function (c, i) {
        return '<li class="item"><span class="ic">' + ico(c.icon, 22, 1.4) + '</span><span class="tt">' + esc(c[lang].t) + '</span><span class="ctl">' +
          '<button type="button" class="icon-btn" data-up="' + c.id + '" aria-label="' + esc(u.r_up + ": " + c[lang].t) + '"' + (i === 0 ? " disabled" : "") + ">" + ico("ui_up", 20, 1.8) + "</button>" +
          '<button type="button" class="icon-btn" data-down="' + c.id + '" aria-label="' + esc(u.r_down + ": " + c[lang].t) + '"' + (i === g.cards.length - 1 ? " disabled" : "") + ">" + ico("ui_down", 20, 1.8) + "</button>" +
          '<button type="button" class="icon-btn" data-rm="' + c.id + '" aria-label="' + esc(u.r_remove + ": " + c[lang].t) + '">' + ico("ui_x", 20, 1.8) + "</button></span></li>";
      }).join("") + "</ul></section>";
    }).join("");
    return '<div class="page-head"><h1 id="h1" tabindex="-1">' + esc(u.r_title) + '</h1><p class="lead">' + esc(u.r_lead) + '</p></div><div class="review"><aside class="side"><div id="mapHost">' + mapSvg(active(), true) + '</div><p class="count" aria-live="polite">' + esc(cnt(state.sel.length)) + "</p></aside>" +
      '<div class="groups">' + list + '<p class="notice">' + esc(u.r_note) + '</p><div class="actions"><button type="button" class="btn ghost" data-go="build">' + ico("ui_left", 20, 1.8) + esc(u.r_explore) + '</button><button type="button" class="link" data-clear="1">' + esc(u.r_clear) + '</button><button type="button" class="btn" data-go="preview">' + esc(u.r_continue) + ico("ui_right", 20, 1.8) + "</button></div></div></div>";
  }

  function viewPreview() {
    var u = U(), lang = state.lang, P = D.PDF[lang];
    if (!state.sel.length) return viewReview();
    var groups = EQ.MOTOR.agrupar(state.sel);
    var plist = groups.map(function (g) { return '<div><h4><i style="background:' + g.area.color + '"></i>' + esc(g.area[lang].name) + "</h4><ul>" + g.cards.map(function (c) { return "<li>" + esc(c[lang].t) + "</li>"; }).join("") + "</ul></div>"; }).join("");
    return '<div class="page-head"><h1 id="h1" tabindex="-1">' + esc(u.p_title) + '</h1><p class="lead">' + esc(u.p_lead) + '</p></div><div class="preview">' +
      '<div class="cover" id="cover" role="img" aria-label="' + esc(u.p_cover) + '"><div class="ct"><span class="pt1">' + esc(P.coverL1) + '</span><span class="pt2">' + esc(P.coverL2) + '</span></div><div class="corn"><i></i><svg viewBox="0 0 30 16" aria-hidden="true"><path d="M2 12 C9 8 18 7 28 9" fill="none" stroke="#183E2A" stroke-width=".8"/><path d="M9 9 C8 5 11 3 13 3 C13 6 11 8 9 9Z M16 8 C17 12 20 13 22 12 C21 9 19 8 16 8Z M22 8 C23 5 26 4 28 5 C27 7 25 8 22 8Z" fill="#A8C08A" stroke="#183E2A" stroke-width=".5"/></svg><i></i></div><div class="pfor"><span id="cSub"></span><b id="cName"></b></div></div>' +
      '<div class="pcol">' +
        '<section class="sect"><div class="fields"><div class="field"><label for="fName">' + esc(u.p_name) + '</label><input id="fName" type="text" maxlength="40" autocomplete="off" placeholder="' + esc(u.p_name_ph) + '" value="' + esc(state.name) + '"></div>' +
        '<div class="field"><label for="fTitle">' + esc(u.p_title_f) + '</label><input id="fTitle" type="text" maxlength="60" autocomplete="off" placeholder="' + esc(u.p_title_ph) + '" value="' + esc(state.title) + '"></div></div><p class="note">' + esc(u.p_privacy) + "</p></section>" +
        '<section class="sect"><h2>' + esc(u.p_map) + '</h2><div class="pmap">' + mapSvg(active(), true) + '<div class="plist" aria-label="' + esc(u.p_cards) + '">' + plist + "</div></div></section>" +
        '<section class="sect"><h2>' + esc(u.p_use_h) + '</h2><ol class="use">' + u.p_use.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ol></section>" +
        '<section class="sect"><h2>' + esc(u.p_incl_h) + '</h2><p class="note">' + esc(u.p_incl_sub) + '</p><ul class="incl">' + u.p_incl.map(function (t) { return "<li>" + ico("ui_leaf", 18, 1.5) + "<span>" + esc(t) + "</span></li>"; }).join("") + "</ul></section>" +
        '<section class="buy"><h2>' + esc(u.p_buy_h) + '</h2><p class="price">' + esc(u.p_price) + "<small>" + esc(u.p_price_note) + '</small></p>' +
        (PAGO_REAL ? payBox(u) : '<p class="note">' + esc(u.p_test_note) + '</p>') +
        '<div class="actions"><button type="button" class="btn" id="genBtn"' + (PAGO_REAL && !paid ? " hidden" : "") + '>' + esc(PAGO_REAL ? u.p_generate_pay : u.p_generate) + '</button><button type="button" class="btn ghost" id="againBtn" hidden>' + esc(u.p_again) + '</button><button type="button" class="btn ghost" data-go="build">' + esc(u.p_modify) + '</button></div>' +
        '<p class="status" id="genMsg" role="status" aria-live="polite"></p></section>' +
      "</div></div>";
  }
  function updateCover() {
    var P = D.PDF[state.lang], name = EQ.MOTOR.limpiarTexto(state.name, 40), title = EQ.MOTOR.limpiarTexto(state.title, 60);
    if ($("#cSub")) $("#cSub").textContent = title;
    if ($("#cName")) $("#cName").textContent = name;
  }

  /* ---------- generación y descarga del PDF ---------- */
  /* ---------- pago ---------- */
  var PAGO_REAL = !!(EQ.CONFIG && EQ.CONFIG.modo === "pago"), paid = !PAGO_REAL, verificando = false;
  function payBox(u) {
    return '<div class="paybox" id="payBox"' + (paid ? " hidden" : "") + '><p class="note">' + esc(u.pay_note) + '</p>' +
      '<div class="actions"><button type="button" class="btn" id="payBtn">' + esc(u.pay_btn) + '</button></div>' +
      '<div class="field"><label for="fTx">' + esc(u.pay_have) + '</label><div class="txrow"><input id="fTx" type="text" maxlength="40" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="' + esc(u.pay_ph) + '"><button type="button" class="btn ghost" id="verBtn">' + esc(u.pay_verify) + '</button></div></div></div>';
  }
  function setPaid(v) {
    paid = !!v; var b = $("#payBox"), g = $("#genBtn"); if (b) b.hidden = paid; if (g) g.hidden = PAGO_REAL && !paid;
  }
  var MSG = { pendiente: "pay_pending", formato: "pay_format", reembolsado: "pay_refund", expirado: "pay_expired", limite: "pay_limit", red: "pay_net" };
  function verificar(tx, intentos) {
    var u = U(); if (verificando) return; verificando = true;
    say(u.pay_checking);
    (function paso(n) {
      EQ.PAGO.acceso(tx).then(function (est) {
        if (est === "ok") { verificando = false; setPaid(true); say(U().pay_ok, "ok"); return; }
        if (est === "pendiente" && n < intentos) return root.setTimeout(function () { paso(n + 1); }, 3000); // el aviso de PayPal puede tardar unos segundos
        verificando = false; say(U()[MSG[est] || "pay_net"], "err");
      });
    })(1);
  }
  function iniciarRetorno() { // PayPal devuelve al comprador con ?tx=… (si lo envía); si no, escribe el número de su recibo
    if (!PAGO_REAL) return;
    var q; try { q = new root.URLSearchParams(root.location.search); } catch (e) { return; }
    var tx = q.get("tx") || q.get("txn_id");
    if (q.has("tx") || q.has("pago") || q.has("txn_id")) { try { root.history.replaceState(null, "", root.location.pathname); } catch (e) {} if (state.sel.length) { state.screen = "preview"; save(); } }
    if (tx) { pendingTx = tx; }
  }
  var pendingTx = null;
  function say(msg, kind) { var m = $("#genMsg"); if (m) { m.textContent = msg || ""; m.className = "status" + (kind ? " " + kind : ""); } }
  function tick() { return new Promise(function (r) { root.setTimeout(r, 60); }); }
  function guardar(blob, name) {
    return Promise.resolve().then(function () { return root.claude && root.claude.use ? root.claude.use("downloads") : null; }).then(function (d) {
      if (d) return d.save({ filename: name, data: blob }).then(function () { return "saved"; }, function (e) { if (e && e.code === "declined") return "declined"; throw e; });
      var url = root.URL.createObjectURL(blob), a = doc.createElement("a"); a.href = url; a.download = name; doc.body.appendChild(a); a.click(); a.remove();
      root.setTimeout(function () { root.URL.revokeObjectURL(url); }, 5000); return "saved";
    });
  }
  function generar() {
    var u = U(), btn = $("#genBtn");
    if (!state.sel.length) { say(u.p_need_cards, "err"); return; }
    btn.disabled = true; say(u.p_working);
    EQ.PAGO.puedeDescargar().then(function (r) {
      if (!r || !r.ok) { var e0 = new Error("pago"); e0.pago = true; throw e0; }
      return tick();
    }).then(function () {
      var pdf = EQ.PDF.crear({ lang: state.lang, sel: state.sel, name: state.name, title: state.title });
      lastName = EQ.MOTOR.nombreArchivo(state.lang, state.name);
      return EQ.PDF.finalizar(pdf).then(function (bytes) { lastBlob = new Blob([bytes], { type: "application/pdf" }); return guardar(lastBlob, lastName); });
    }).then(function (res) {
      say(res === "declined" ? u.p_download_blocked : u.p_ready, "ok"); $("#againBtn").hidden = false;
    }).catch(function (e) { if (e && e.pago) { setPaid(false); return say(u.pay_need, "err"); } if (root.console) console.error(e); say(u.p_error, "err"); }).then(function () { btn.disabled = false; });
  }
  function otraVez() {
    var u = U(); if (!lastBlob) return generar();
    guardar(lastBlob, lastName).then(function (r) { say(r === "declined" ? u.p_download_blocked : u.p_ready, "ok"); }).catch(function () { say(u.p_error, "err"); });
  }

  /* ---------- acciones ---------- */
  function toggleCard(id) {
    var i = state.sel.indexOf(id); if (i >= 0) state.sel.splice(i, 1); else state.sel.push(id);
    lastBlob = null; save();
    var el = $('[data-card="' + id + '"]'); if (el) el.setAttribute("aria-checked", String(i < 0));
    refreshBuild();
  }
  function moveInArea(id, dir) {
    var c = D.cardById(id), pos = [], ids = [];
    state.sel.forEach(function (x, i) { if (D.cardById(x).area === c.area) { pos.push(i); ids.push(x); } });
    var p = ids.indexOf(id), q = p + dir; if (q < 0 || q >= ids.length) return;
    var t = ids[p]; ids[p] = ids[q]; ids[q] = t; pos.forEach(function (ps, k) { state.sel[ps] = ids[k]; });
    lastBlob = null; save();
  }
  function go(screen, opts) {
    state.screen = screen; if (opts && opts.tab) state.tab = opts.tab; save(); render(true);
  }
  function setLang(l) { if (l === state.lang) return; state.lang = l; lastBlob = null; save(); render(false); }

  /* ---------- pintado general ---------- */
  function renderFoot() {
    var u = U();
    return '<footer class="foot wrap"><p>' + esc(u.disclaimer) + '</p><div><button type="button" class="link" id="restartBtn">' + esc(u.restart) + "</button></div></footer>";
  }
  function render(focusMain) {
    var v = { welcome: viewWelcome, orient: viewOrient, areas: viewAreas, build: viewBuild, review: viewReview, preview: viewPreview }[state.screen]();
    doc.documentElement.lang = state.lang;
    renderTop();
    $("#main").innerHTML = '<div class="wrap">' + v + "</div>";
    $("#foot").innerHTML = renderFoot();
    if (state.screen === "build") refreshBuild();
    if (state.screen === "preview") {
      updateCover();
      if (PAGO_REAL) {
        if (!paid && !pendingTx) EQ.PAGO.estado().then(function (a) { if (a) setPaid(true); });
      }
    }
    if (PAGO_REAL && pendingTx) { var tx0 = pendingTx; pendingTx = null; var f0 = $("#fTx"); if (f0) f0.value = tx0; verificar(tx0, 10); }
    if (focusMain) { root.scrollTo(0, 0); var h = $("#h1"); if (h) h.focus({ preventScroll: true }); }
  }

  /* ---------- eventos ---------- */
  function onClick(ev) {
    var t = ev.target.closest("button, a"); if (!t) return;
    var g;
    if ((g = t.getAttribute("data-card"))) return toggleCard(g);
    if ((g = t.getAttribute("data-go"))) return go(g);
    if ((g = t.getAttribute("data-lang"))) return setLang(g);
    if ((g = t.getAttribute("data-area"))) return go("build", { tab: g === "all" ? "all" : g });
    if ((g = t.getAttribute("data-tab"))) { state.tab = g; save(); $$(".tab").forEach(function (b) { b.setAttribute("aria-selected", String(b.getAttribute("data-tab") === g)); }); $("#grid").innerHTML = gridHtml(); return; }
    if ((g = t.getAttribute("data-rm"))) { var i = state.sel.indexOf(g); if (i >= 0) state.sel.splice(i, 1); lastBlob = null; save(); render(false); var nx = $(".item .icon-btn[data-rm]") || $(".btn[data-go=build]"); if (nx) nx.focus(); return; }
    if ((g = t.getAttribute("data-up")) || (g = t.getAttribute("data-down"))) {
      var up = t.hasAttribute("data-up"); moveInArea(g, up ? -1 : 1); render(false);
      var again = $((up ? "[data-up=" : "[data-down=") + '"' + g + '"]'); if (again && !again.disabled) again.focus(); else { var alt = $((up ? "[data-down=" : "[data-up=") + '"' + g + '"]'); if (alt) alt.focus(); } return;
    }
    if (t.hasAttribute("data-clear")) { state.sel = []; lastBlob = null; save(); render(false); return; }
    if (t.id === "payBtn") { save(); if (EQ.PAGO.paypal) root.location.href = EQ.PAGO.paypal; return; }
    if (t.id === "verBtn") { var tv = $("#fTx"); return verificar(tv ? tv.value : "", 1); }
    if (t.id === "genBtn") return generar();
    if (t.id === "againBtn") return otraVez();
    if (t.id === "restartBtn") {
      if (t.getAttribute("data-armed")) { var l = state.lang; state = fresh(); state.lang = l; lastBlob = null; save(); return render(true); }
      t.setAttribute("data-armed", "1"); t.textContent = U().restart_confirm;
      root.clearTimeout(confirmTimer); confirmTimer = root.setTimeout(function () { t.removeAttribute("data-armed"); t.textContent = U().restart; }, 5000);
    }
  }
  function onInput(ev) {
    var id = ev.target.id;
    if (id === "fName") { state.name = EQ.MOTOR.limpiarTexto(ev.target.value, 40); lastBlob = null; save(); updateCover(); }
    if (id === "fTitle") { state.title = EQ.MOTOR.limpiarTexto(ev.target.value, 60); lastBlob = null; save(); updateCover(); }
  }

  function start() {
    iniciarRetorno();
    doc.addEventListener("click", onClick); doc.addEventListener("input", onInput);
    if (EQ.ASSETS && EQ.ASSETS.cover) doc.documentElement.style.setProperty("--cover-img", 'url("' + EQ.ASSETS.cover + '")');
    render(false);
  }
  EQ.UI = { start: start, state: function () { return state; } };
})(typeof window !== "undefined" ? window : globalThis);
