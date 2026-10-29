/* Mi mapa de equilibrio — PAGO (módulo separado)
   EQ.CONFIG la define la compilación:
     {modo:"prueba"}  -> vista previa: la descarga está abierta y el generador de PDF viene incluido.
     {modo:"pago", paypal:"https://www.paypal.com/ncp/payment/…", api:"/api", producto:"equilibrio", privado:"/privado/equilibrio/pdf.js"}
   En modo "pago" el navegador nunca decide: el generador de PDF (jsPDF, pdf-lib, fuentes) vive en una ruta privada del Worker
   y solo se entrega con una cookie firmada, que el Worker emite después de verificar el pago con PayPal (aviso IPN). */
(function (root) {
  "use strict";
  var EQ = root.EQ = root.EQ || {};
  var C = EQ.CONFIG = EQ.CONFIG || { modo: "prueba" };
  var cargando = null;
  function json(url, opt) {
    return root.fetch(url, Object.assign({ credentials: "same-origin", cache: "no-store" }, opt || {})).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { j.http = r.status; return j; });
    });
  }
  function cargarGenerador() {
    if (EQ.PDF && root.jspdf) return Promise.resolve();
    if (cargando) return cargando;
    cargando = new Promise(function (ok, fail) {
      var s = root.document.createElement("script"); s.src = C.privado; s.onload = ok; s.onerror = function () { cargando = null; fail(new Error("generador")); };
      root.document.head.appendChild(s);
    });
    return cargando;
  }
  EQ.PAGO = {
    modo: C.modo, precio: { monto: 12.99, moneda: "USD" }, paypal: C.paypal || "",
    // ¿Este navegador ya tiene acceso pagado? (el servidor lo dice; aquí solo se pregunta)
    estado: function () {
      if (C.modo !== "pago") return Promise.resolve(true);
      return json(C.api + "/estado?p=" + encodeURIComponent(C.producto || "equilibrio")).then(function (j) { return !!j.activo; }).catch(function () { return false; });
    },
    // Devuelve {ok:true} si hay acceso y el generador quedó cargado; {ok:false, motivo:"pago"} si falta pagar.
    puedeDescargar: function () {
      if (C.modo !== "pago") return Promise.resolve({ ok: true, modo: "prueba" });
      return EQ.PAGO.estado().then(function (act) {
        if (!act) return { ok: false, motivo: "pago" };
        return cargarGenerador().then(function () { return { ok: true, modo: "pago" }; });
      });
    },
    // El comprador entrega su número de transacción. Resuelve con el estado del servidor:
    // ok | pendiente | formato | reembolsado | expirado | limite | red
    acceso: function (tx) {
      return json(C.api + "/acceso", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tx: String(tx || ""), p: C.producto || "equilibrio" }) })
        .then(function (j) { return j.ok ? "ok" : (j.estado || "red"); }).catch(function () { return "red"; });
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
