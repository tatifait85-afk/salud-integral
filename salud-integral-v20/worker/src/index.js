// Worker de pagos de Salud Integral — TRES productos con la misma dirección de avisos IPN (PayPal solo permite una por cuenta).
//   "Mi Jardín Digestivo"     US$ 25.00  rutas: /api/jardin/acceso  /api/jardin/estado  /privado/jardin/*  cookie si_jardin  KV j:   (añadido en v20; mismo patrón que equilibrio)
//   "Tu mapa de hábitos"      US$ 9.99   rutas: /api/acceso  /api/estado  /privado/*              cookie si_mapa        KV p:
//   "Mi mapa de equilibrio"   US$ 12.99  rutas: /api/equilibrio/acceso  /api/equilibrio/estado  /privado/equilibrio/*   cookie si_equilibrio  KV e:
//  POST /api/ipn  Aviso IPN de PayPal (único para ambos): se verifica con PayPal y el MONTO decide a qué producto pertenece el pago.
// Cada producto tiene su propia cookie, su propio prefijo en KV y sus propias rutas privadas: no se mezclan.
// No se guarda ningún dato personal: solo un identificador derivado del número de transacción.

const enc = new TextEncoder();

const json = (obj, status = 200, extra = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });

/* ---------- utilidades ---------- */
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64uToStr = (s) => atob(s.replace(/-/g, "+").replace(/_/g, "/"));

async function claveDePago(txid) {
  const h = await crypto.subtle.digest("SHA-256", enc.encode("pago:" + txid.toUpperCase())); // misma huella para ambos productos; el prefijo separa los registros
  return hex(h).slice(0, 32);
}
async function hmacKey(secret) {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
async function firmar(secret, texto) {
  return b64u(await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(texto)));
}
function igualesConstante(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
function cookieDe(request, nombre) {
  const c = request.headers.get("cookie") || "";
  for (const parte of c.split(";")) {
    const [k, ...v] = parte.trim().split("=");
    if (k === nombre) return v.join("=");
  }
  return null;
}
const productos = (env) => [
  { id: "jardin", precio: parseFloat(env.PRICE_JARDIN || "25"), prefijo: "j:", cookie: "si_jardin", api: "/api/jardin", privado: "/privado/jardin/" },
  { id: "equilibrio", precio: parseFloat(env.PRICE_EQUILIBRIO || "12.99"), prefijo: "e:", cookie: "si_equilibrio", api: "/api/equilibrio", privado: "/privado/equilibrio/" },
  { id: "habitos", precio: parseFloat(env.PRICE_HABITOS || env.PRICE || "9.99"), prefijo: "p:", cookie: "si_mapa", api: "/api", privado: "/privado/" },
];

async function emitirToken(env, prod, clave) {
  const horas = Number(env.TOKEN_HOURS || 24);
  const exp = Math.floor(Date.now() / 1000) + horas * 3600;
  const payload = b64u(enc.encode(JSON.stringify({ k: clave, e: exp, p: prod.id })));
  const firma = await firmar(env.TOKEN_SECRET, payload);
  return { valor: payload + "." + firma, maxAge: horas * 3600 };
}
// Devuelve {k} si la cookie es válida y el pago no fue revocado; si no, null.
async function leerToken(request, env, prod) {
  const raw = cookieDe(request, prod.cookie);
  if (!raw || !env.TOKEN_SECRET) return null;
  const [payload, firma] = raw.split(".");
  if (!payload || !firma) return null;
  const esperada = await firmar(env.TOKEN_SECRET, payload);
  if (!igualesConstante(esperada, firma)) return null;
  let datos;
  try { datos = JSON.parse(b64uToStr(payload)); } catch { return null; }
  if (!datos || typeof datos.k !== "string" || datos.p !== prod.id || !(datos.e > Date.now() / 1000)) return null;
  const reg = await env.PAGOS.get(prod.prefijo + datos.k, "json");
  if (!reg || reg.estado !== "ok") return null;
  return { k: datos.k };
}
function cookieSet(request, prod, valor, maxAge) {
  const seguro = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${prod.cookie}=${valor}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${seguro}`;
}

/* ---------- IPN ---------- */
async function procesarIPN(cuerpo, env, esLocal) {
  const p = new URLSearchParams(cuerpo);
  const prueba = p.get("test_ipn") === "1";
  const modoLocal = esLocal && env.PRUEBA_LOCAL === "1"; // solo en localhost y solo con la variable de .dev.vars

  if (!modoLocal) {
    if (prueba) return; // avisos del sandbox de PayPal: se ignoran en producción
    let veredicto = "";
    try {
      const r = await fetch("https://ipnpb.paypal.com/cgi-bin/webscr", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "SaludIntegral-IPN" },
        body: "cmd=_notify-validate&" + cuerpo,
      });
      veredicto = (await r.text()).trim();
    } catch { return; }
    if (veredicto !== "VERIFIED") return;
  }

  const estado = p.get("payment_status");
  const receptor = (p.get("receiver_email") || "").toLowerCase();
  if (receptor !== String(env.PAYPAL_RECEIVER).toLowerCase()) return;

  // Reembolsos y reversiones: afectan al pago original
  if (["Refunded", "Reversed", "Canceled_Reversal"].includes(estado)) {
    const padre = p.get("parent_txn_id");
    if (!padre) return;
    const k = await claveDePago(padre);
    let tocado = false;
    for (const prod of productos(env)) { // se busca el pago original en cada producto; solo se toca el que exista
      const clave = prod.prefijo + k, reg = await env.PAGOS.get(clave, "json");
      if (!reg) continue;
      reg.estado = estado === "Canceled_Reversal" ? "ok" : "revocado";
      await env.PAGOS.put(clave, JSON.stringify(reg), { expirationTtl: 60 * 60 * 24 * 400 });
      tocado = true;
    }
    if (!tocado && estado !== "Canceled_Reversal") { // el reembolso llegó antes que el aviso del pago: se deja marcado como revocado
      const monto = Math.abs(parseFloat(p.get("mc_gross") ?? p.get("mc_gross_1") ?? "NaN"));
      const prod = productos(env).find((x) => Math.abs(monto - x.precio) < 0.005);
      if (prod) await env.PAGOS.put(prod.prefijo + k, JSON.stringify({ estado: "revocado", t: Date.now(), n: 0 }), { expirationTtl: 60 * 60 * 24 * 400 });
    }
    return;
  }

  if (estado !== "Completed") return;
  const txid = p.get("txn_id");
  if (!txid) return;
  const moneda = p.get("mc_currency");
  const monto = parseFloat(p.get("mc_gross") ?? p.get("mc_gross_1") ?? "NaN");
  if (moneda !== (env.CURRENCY || "USD")) return;
  const prod = productos(env).find((x) => Math.abs(monto - x.precio) < 0.005); // el monto decide el producto
  if (!prod) return; // cualquier otro monto (otros enlaces de pago de la cuenta) se ignora

  const clave = prod.prefijo + (await claveDePago(txid));
  const previo = await env.PAGOS.get(clave, "json");
  if (previo) { // aviso repetido: se conserva el contador y lo revocado
    if (previo.estado === "revocado") return;
    return;
  }
  await env.PAGOS.put(clave, JSON.stringify({ estado: "ok", t: Date.now(), n: 0 }), { expirationTtl: 60 * 60 * 24 * 400 });
}

/* ---------- /api/acceso ---------- */
async function acceso(request, env, prod) {
  let tx = "";
  try { tx = String((await request.json()).tx || ""); } catch { return json({ estado: "formato" }, 400); }
  tx = tx.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!/^[A-Z0-9]{8,30}$/.test(tx)) return json({ estado: "formato" }, 400);

  const k = await claveDePago(tx);
  const reg = await env.PAGOS.get(prod.prefijo + k, "json");
  if (!reg) return json({ estado: "pendiente" }, 202); // aún no llegó el aviso de PayPal (o el número no existe)
  if (reg.estado !== "ok") return json({ estado: "reembolsado" }, 403);

  const dias = Number(env.REDEEM_DAYS || 30);
  if (Date.now() - reg.t > dias * 86400000) return json({ estado: "expirado" }, 403);

  const actual = await leerToken(request, env, prod); // mismo dispositivo con cookie vigente: no cuenta otra emisión
  if (!(actual && actual.k === k)) {
    if ((reg.n || 0) >= Number(env.MAX_REDEEMS || 5)) return json({ estado: "limite" }, 403);
    reg.n = (reg.n || 0) + 1;
    await env.PAGOS.put(prod.prefijo + k, JSON.stringify(reg), { expirationTtl: 60 * 60 * 24 * 400 });
  }
  const t = await emitirToken(env, prod, k);
  return json({ ok: true }, 200, { "set-cookie": cookieSet(request, prod, t.valor, t.maxAge) });
}

/* ---------- enrutador ---------- */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const esLocal = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);

    if (url.pathname === "/api/ipn") {
      if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
      const cuerpo = await request.text();
      ctx.waitUntil(procesarIPN(cuerpo, env, esLocal).catch(() => {}));
      return new Response("", { status: 200 }); // PayPal exige un 200 vacío
    }
    for (const prod of productos(env)) { // equilibrio va primero: su ruta privada está dentro de /privado/
      if (url.pathname === prod.api + "/acceso") {
        if (request.method !== "POST") return json({ error: "method" }, 405);
        return acceso(request, env, prod);
      }
      if (url.pathname === prod.api + "/estado") {
        const t = await leerToken(request, env, prod);
        return json({ activo: !!t });
      }
      if (url.pathname.startsWith(prod.privado)) {
        const t = await leerToken(request, env, prod);
        if (!t) return new Response("No autorizado", { status: 401, headers: { "cache-control": "no-store" } });
        const r = await env.ASSETS.fetch(request);
        const h = new Headers(r.headers);
        h.set("cache-control", "private, no-store");
        h.set("x-robots-tag", "noindex");
        return new Response(r.body, { status: r.status, headers: h });
      }
    }
    return env.ASSETS.fetch(request);
  },
};
