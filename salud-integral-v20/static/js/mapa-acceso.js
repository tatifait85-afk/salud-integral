/* Página de acceso: confirma el pago con el Worker (/api/acceso o /api/jardin/acceso) y abre el cuestionario. */
(function () {
  "use strict";
  var cfg = JSON.parse(document.getElementById("mapa-cfg").textContent);
  var API = cfg.api || "/api"; // «Tu mapa de hábitos»: /api · «Mi Jardín Digestivo»: /api/jardin
  var form = document.getElementById("acceso-form"), input = document.getElementById("tx");
  var msg = document.getElementById("acceso-msg"), go = document.getElementById("acceso-go");
  var btn = form.querySelector("button"), timer = null, intentos = 0, MAX = 18, ocupado = false;

  function say(t, err) { msg.textContent = t || ""; msg.className = "mp-status" + (err ? " err" : ""); }
  function normaliza(v) { return String(v || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); }

  function irAlCuestionario() { say(cfg.a_ok); location.href = cfg.quiz; }

  function intentar(tx) {
    if (ocupado) return; ocupado = true; btn.disabled = true; say(cfg.a_checking);
    fetch(API + "/acceso", {
      method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tx: tx })
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { s: r.status, j: j }; }); })
      .then(function (o) {
        ocupado = false;
        var e = o.j && o.j.estado;
        if (o.s === 200 && o.j.ok) { irAlCuestionario(); return; }
        if (e === "pendiente") {
          intentos++;
          if (intentos < MAX) { say(cfg.a_wait); timer = setTimeout(function () { intentar(tx); }, 5000); }
          else { btn.disabled = false; say(cfg.a_wait_end + " " + cfg.a_notfound, true); intentos = 0; }
          return;
        }
        btn.disabled = false; intentos = 0;
        if (e === "reembolsado") say(cfg.a_refunded, true);
        else if (e === "limite") say(cfg.a_limit, true);
        else if (e === "expirado") say(cfg.a_expired, true);
        else if (e === "formato") say(cfg.a_notfound, true);
        else say(cfg.a_error, true);
      })
      .catch(function () { ocupado = false; btn.disabled = false; say(cfg.a_error, true); });
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault(); clearTimeout(timer); intentos = 0;
    var tx = normaliza(input.value);
    if (tx.length < 8) { say(cfg.a_notfound, true); input.focus(); return; }
    intentar(tx);
  });

  // ¿Ya hay un acceso activo en este dispositivo?
  fetch(API + "/estado", { credentials: "same-origin" }).then(function (r) { return r.json(); }).then(function (j) {
    if (j && j.activo) { say(cfg.a_active); go.hidden = false; }
  }).catch(function () {});

  // Si PayPal devolvió el número de transacción en la dirección (?tx=...), se usa y se quita de la barra.
  try {
    var q = new URLSearchParams(location.search), tx = normaliza(q.get("tx"));
    if (tx.length >= 8) {
      input.value = tx;
      if (history.replaceState) history.replaceState(null, "", location.pathname);
      intentar(tx);
    }
  } catch (e) {}
})();
