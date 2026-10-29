/* Cuestionario de "Tu mapa de hábitos": carga los archivos protegidos (/privado/) y genera el PDF. */
(function () {
  "use strict";
  var cfg = JSON.parse(document.getElementById("mapa-cfg").textContent);
  var app = document.getElementById("mapa-app");
  var lang = cfg.lang, D, Q, ui, ans = {}, idx = -1, pdfUrl = null, pdfName = "", result = null;

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k]; else if (k === "class") n.className = attrs[k];
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), attrs[k]); else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function fmt(s, v) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return v[k] !== undefined ? v[k] : m; }); }
  function load(src) {
    return new Promise(function (ok, bad) {
      var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = function () { bad(new Error(src)); };
      document.head.appendChild(s);
    });
  }
  function sinAcceso() {
    app.textContent = "";
    app.appendChild(el("div", { "class": "q-card" }, [
      el("h1", { text: cfg.q_noaccess_h }), el("p", { text: cfg.q_noaccess }),
      el("a", { "class": "btn btn-primary", href: cfg.access, text: cfg.q_noaccess_btn + " →" })]));
  }

  /* 1) ¿Hay acceso? 2) cargar archivos protegidos, en orden */
  fetch("/api/estado", { credentials: "same-origin" }).then(function (r) { return r.json(); }).then(function (j) {
    if (!j || !j.activo) { sinAcceso(); return; }
    var base = "/privado/";
    return load(base + "jspdf.umd.min.js").then(function () { return load(base + "mapa-fuentes.js"); })
      .then(function () { return load(base + "mapa-datos.js"); }).then(function () { return load(base + "mapa-motor.js"); })
      .then(function () { return load(base + "mapa-pdf.js"); }).then(iniciar);
  }).catch(function () {
    /* Sin respuesta válida del servidor (Worker no disponible, red caída): nunca se da acceso; se explica y se ofrece reintentar o ir a confirmar el pago. */
    app.textContent = "";
    app.appendChild(el("div", { "class": "q-card", role: "alert" }, [
      el("p", { text: cfg.q_loaderr }),
      el("a", { "class": "btn btn-primary", href: cfg.access, text: cfg.q_noaccess_btn + " →" })]));
  });

  function iniciar() {
    D = window.MAPA_DATA[lang]; Q = D.questions; ui = D.ui; render();
  }

  function render() {
    app.textContent = "";
    if (idx < 0) return intro();
    if (idx >= Q.length) return;
    pregunta(Q[idx]);
    var h = app.querySelector("h2"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function intro() {
    app.appendChild(el("div", { "class": "q-card" }, [
      el("h1", { text: ui.intro_h }), el("p", { text: ui.intro_p }),
      el("p", { "class": "q-priv", text: ui.privacy }),
      el("p", {}, [el("button", { "class": "btn btn-primary", type: "button", text: ui.start + " →", onclick: function () { idx = 0; render(); } })]),
      el("p", { "class": "q-priv", text: ui.note })]));
  }

  function valido(q) {
    var v = ans[q.id];
    if (q.type === "text") { return q.optional || (v && v.trim().length > 0); }
    if (q.type === "multi") return v && v.length > 0;
    return v !== undefined && v !== "";
  }

  function pregunta(q) {
    var card = el("div", { "class": "q-card" });
    var pct = Math.round((idx / Q.length) * 100);
    card.appendChild(el("div", { "class": "q-prog", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pct) }, [el("i", { style: "width:" + pct + "%" })]));
    card.appendChild(el("p", { "class": "q-step", text: fmt(ui.step, { n: idx + 1, t: Q.length }) }));
    card.appendChild(el("h2", { text: q.q }));
    var err = el("p", { "class": "q-err", role: "alert" });
    var next = el("button", { "class": "btn btn-primary", type: "button" });
    function refresh() { next.disabled = !valido(q); }

    if (q.type === "text") {
      var inp = el("input", { "class": "q-text", type: "text", maxlength: String(q.max || 60), placeholder: q.ph || "", autocomplete: q.id === "name" ? "given-name" : "off", "aria-label": q.q });
      inp.value = ans[q.id] || "";
      inp.addEventListener("input", function () { ans[q.id] = inp.value; err.textContent = ""; refresh(); });
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); if (!next.disabled) next.click(); } });
      card.appendChild(inp);
    } else if (q.type === "scale") {
      var g = el("div", { "class": "q-scale", role: "radiogroup", "aria-label": q.q });
      for (var i = 1; i <= 5; i++) (function (n) {
        var b = el("button", { "class": "q-opt", type: "button", role: "radio", "aria-checked": ans[q.id] === n ? "true" : "false", text: String(n) });
        b.addEventListener("click", function () { ans[q.id] = n; [].forEach.call(g.children, function (c, k) { c.setAttribute("aria-checked", k + 1 === n ? "true" : "false"); }); refresh(); });
        g.appendChild(b);
      })(i);
      card.appendChild(g);
      card.appendChild(el("div", { "class": "q-ends" }, [el("span", { text: q.low || ui.scale_low }), el("span", { text: q.high || ui.scale_high })]));
    } else {
      var multi = q.type === "multi";
      card.appendChild(el("p", { "class": "q-hint", text: multi ? fmt(ui.pick_up_to, { n: q.max }) : ui.pick_one }));
      var ul = el("ul", { "class": "q-opts", role: multi ? "group" : "radiogroup", "aria-label": q.q });
      q.opts.forEach(function (o) {
        var sel = multi ? (ans[q.id] || []).indexOf(o[0]) !== -1 : ans[q.id] === o[0];
        var b = el("button", { "class": "q-opt" + (multi ? " multi" : ""), type: "button" }, [el("span", { "class": "box", "aria-hidden": "true" }), el("span", { text: o[1] })]);
        b.setAttribute(multi ? "aria-pressed" : "aria-checked", sel ? "true" : "false"); if (!multi) b.setAttribute("role", "radio");
        b.addEventListener("click", function () {
          if (multi) {
            var cur = (ans[q.id] || []).slice(), p = cur.indexOf(o[0]);
            if (p >= 0) cur.splice(p, 1); else if (cur.length < q.max) cur.push(o[0]); else { err.textContent = fmt(ui.pick_up_to, { n: q.max }); return; }
            ans[q.id] = cur; err.textContent = "";
            b.setAttribute("aria-pressed", p >= 0 ? "false" : "true");
          } else {
            ans[q.id] = o[0];
            [].forEach.call(ul.querySelectorAll(".q-opt"), function (c) { c.setAttribute("aria-checked", c === b ? "true" : "false"); });
          }
          refresh();
        });
        ul.appendChild(el("li", {}, [b]));
      });
      card.appendChild(ul);
    }

    card.appendChild(err);
    var last = idx === Q.length - 1;
    next.textContent = (last ? ui.finish : ui.next) + " →";
    next.addEventListener("click", function () {
      if (!valido(q)) { err.textContent = q.id === "name" ? ui.name_err : (q.type === "multi" ? ui.pick_min : ui.pick_one); return; }
      if (q.type === "text" && ans[q.id]) ans[q.id] = ans[q.id].trim();
      if (last) return crear(); idx++; render();
    });
    var back = el("button", { "class": "q-link", type: "button", text: "← " + ui.back, onclick: function () { idx = Math.max(-1, idx - 1); render(); } });
    card.appendChild(el("div", { "class": "q-nav" }, [back, next]));
    card.appendChild(el("p", { "class": "q-priv", text: ui.privacy }));
    app.appendChild(card);
    refresh();
  }

  function crear() {
    app.textContent = "";
    app.appendChild(el("div", { "class": "q-card" }, [el("p", { role: "status", text: ui.working })]));
    setTimeout(function () { // deja pintar el aviso antes del trabajo pesado
      try {
        result = window.MAPA_MOTOR.generar(lang, ans, new Date());
        var doc = window.MAPA_PDF.crear(result);
        pdfName = window.MAPA_PDF.nombreArchivo(result);
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        pdfUrl = URL.createObjectURL(doc.output("blob"));
        descargar(); fin();
      } catch (e) {
        if (window.console) console.error(e);
        app.textContent = "";
        app.appendChild(el("div", { "class": "q-card" }, [el("p", { "class": "q-err", role: "alert", text: ui.err }),
          el("button", { "class": "btn btn-primary", type: "button", text: ui.back, onclick: function () { idx = Q.length - 1; render(); } })]));
      }
    }, 60);
  }

  function descargar() {
    var a = document.createElement("a"); a.href = pdfUrl; a.download = pdfName; document.body.appendChild(a); a.click(); a.remove();
  }

  function fin() {
    app.textContent = "";
    app.appendChild(el("div", { "class": "q-card q-done" }, [
      el("span", { "class": "q-badge", text: ui.done_profile + ": " + result.profile.name }),
      el("h1", { text: ui.done_h }), el("p", { text: result.profile.tag }), el("p", { text: ui.done_p }),
      el("p", {}, [el("button", { "class": "btn btn-primary", type: "button", text: ui.again, onclick: descargar })]),
      el("p", {}, [el("button", { "class": "q-link", type: "button", text: ui.restart, onclick: function () { ans = {}; idx = -1; render(); } })]),
      el("p", { "class": "q-priv", text: ui.note })]));
    window.scrollTo({ top: 0, behavior: "auto" });
  }
})();
