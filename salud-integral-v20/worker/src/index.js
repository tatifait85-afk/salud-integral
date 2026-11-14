// Worker de pagos de Salud Integral — CUATRO productos con la misma dirección de avisos IPN (PayPal solo permite una por cuenta).
//   "Mi Plato Inteligente"    US$ 39.99  rutas: /api/plato/acceso  /api/plato/estado  /api/plato/receta  /privado/plato/*  /plato-prueba/*  cookie si_plato  KV l:
//     Aplicación de uso diario: cookie larga renovada con el uso, 3 meses para activar dispositivos nuevos y registro del pago sin vencimiento.
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
const DIA = 86400;
const productos = (env) => [
  {
    id: "plato", precio: parseFloat(env.PRICE_PLATO || "39.99"), prefijo: "l:", cookie: "si_plato", api: "/api/plato",
    privados: ["/privado/plato/", "/plato-prueba/"],
    // Archivos que el navegador pide sin cookie (manifiesto, íconos de instalación) o que deben poder actualizarse siempre (sw.js).
    publicos: /^(sw\.js|manifest(-en)?\.webmanifest|img\/(icon|favicon)-app-v2-\d+\.png)$/,
    acceso: { es: "/mi-plato-inteligente/acceso/", en: "/en/my-smart-plate/access/" },
    tokenSeg: Number(env.PLATO_TOKEN_DAYS || 365) * DIA, // cookie larga
    renovarSeg: DIA, // se renueva como máximo una vez al día, al usarse
    canjeDias: Number(env.PLATO_REDEEM_DAYS || 90), // 3 meses para activar dispositivos nuevos
    ttl: null, // registro del pago sin vencimiento
  },
  { id: "jardin", precio: parseFloat(env.PRICE_JARDIN || "25"), prefijo: "j:", cookie: "si_jardin", api: "/api/jardin", privados: ["/privado/jardin/"] },
  { id: "equilibrio", precio: parseFloat(env.PRICE_EQUILIBRIO || "12.99"), prefijo: "e:", cookie: "si_equilibrio", api: "/api/equilibrio", privados: ["/privado/equilibrio/"] },
  { id: "habitos", precio: parseFloat(env.PRICE_HABITOS || env.PRICE || "9.99"), prefijo: "p:", cookie: "si_mapa", api: "/api", privados: ["/privado/"] },
];
const TTL_400 = 60 * 60 * 24 * 400;
const ttlDe = (prod) => (prod.ttl === null ? {} : { expirationTtl: TTL_400 });

async function emitirToken(env, prod, clave) {
  const seg = prod.tokenSeg || Number(env.TOKEN_HOURS || 24) * 3600;
  const exp = Math.floor(Date.now() / 1000) + seg;
  const payload = b64u(enc.encode(JSON.stringify({ k: clave, e: exp, p: prod.id })));
  const firma = await firmar(env.TOKEN_SECRET, payload);
  return { valor: payload + "." + firma, maxAge: seg };
}
// Devuelve {k, e} si la cookie es válida y el pago no fue revocado; si no, null.
// soloFirma: comprueba la firma y la fecha sin leer el registro (para imágenes y scripts de Mi Plato;
// la revocación se aplica en la página, en /estado y en la receta con IA, que sí leen el registro).
async function leerToken(request, env, prod, soloFirma = false) {
  const raw = cookieDe(request, prod.cookie);
  if (!raw || !env.TOKEN_SECRET) return null;
  const [payload, firma] = raw.split(".");
  if (!payload || !firma) return null;
  const esperada = await firmar(env.TOKEN_SECRET, payload);
  if (!igualesConstante(esperada, firma)) return null;
  let datos;
  try { datos = JSON.parse(b64uToStr(payload)); } catch { return null; }
  if (!datos || typeof datos.k !== "string" || datos.p !== prod.id || !(datos.e > Date.now() / 1000)) return null;
  if (soloFirma) return { k: datos.k, e: datos.e };
  const reg = await env.PAGOS.get(prod.prefijo + datos.k, "json");
  if (!reg || reg.estado !== "ok") return null;
  return { k: datos.k, e: datos.e };
}
// Cookie larga renovada con el uso: si la cookie ya tiene más de un día, se emite otra con el plazo completo.
async function renovar(request, env, prod, t, headers) {
  if (!prod.renovarSeg || !t) return;
  if (t.e - Date.now() / 1000 > prod.tokenSeg - prod.renovarSeg) return;
  const n = await emitirToken(env, prod, t.k);
  headers.append("set-cookie", cookieSet(request, prod, n.valor, n.maxAge));
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
      await env.PAGOS.put(clave, JSON.stringify(reg), ttlDe(prod));
      tocado = true;
    }
    if (!tocado && estado !== "Canceled_Reversal") { // el reembolso llegó antes que el aviso del pago: se deja marcado como revocado
      const monto = Math.abs(parseFloat(p.get("mc_gross") ?? p.get("mc_gross_1") ?? "NaN"));
      const prod = productos(env).find((x) => Math.abs(monto - x.precio) < 0.005);
      if (prod) await env.PAGOS.put(prod.prefijo + k, JSON.stringify({ estado: "revocado", t: Date.now(), n: 0 }), ttlDe(prod));
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
  await env.PAGOS.put(clave, JSON.stringify({ estado: "ok", t: Date.now(), n: 0 }), ttlDe(prod));
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

  const actual = await leerToken(request, env, prod); // mismo dispositivo con cookie vigente: no cuenta otra emisión
  const mismo = !!(actual && actual.k === k);
  const dias = prod.canjeDias || Number(env.REDEEM_DAYS || 30);
  // El plazo solo limita los dispositivos NUEVOS de Mi Plato; un dispositivo ya activado sigue entrando.
  if (!(prod.canjeDias && mismo) && Date.now() - reg.t > dias * 86400000) return json({ estado: "expirado" }, 403);

  if (!mismo) {
    if ((reg.n || 0) >= Number(env.MAX_REDEEMS || 5)) return json({ estado: "limite" }, 403);
    reg.n = (reg.n || 0) + 1;
    await env.PAGOS.put(prod.prefijo + k, JSON.stringify(reg), ttlDe(prod));
  }
  const t = await emitirToken(env, prod, k);
  return json({ ok: true }, 200, { "set-cookie": cookieSet(request, prod, t.valor, t.maxAge) });
}


/* ---------- /api/plato/receta: receta con IA (Gemini) solo para compradores ----------
   La página envía datos estructurados (no un texto libre). El Worker revisa la cookie de comprador
   y el registro del pago, limita las solicitudes por compra, arma el texto para Gemini con una
   plantilla fija y lo envía al Worker mi-plato-inteligente-api por un enlace interno (GEMINI),
   que ya no tiene dirección pública. Los datos no se guardan. */
const IA_POR_HORA = 20;
const limpio = (t, n) => String(t == null ? "" : t).replace(/[\r\n{}\[\]"\\]/g, " ").replace(/\s+/g, " ").trim().slice(0, n);
function lista(v, maxItems, maxLen) {
  if (v == null) return [];
  if (!Array.isArray(v) || v.length > maxItems) return null;
  const out = [];
  for (const x of v) {
    if (typeof x !== "string") return null;
    const c = limpio(x, maxLen);
    if (c) out.push(c);
  }
  return out;
}
function entero(v, max) {
  if (v == null || v === "") return null;
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n > 0 && n <= max ? n : undefined;
}
function textoReceta(d) {
  const es = d.lang === "es", r = d.r;
  const restr = es
    ? (r.alergias.length ? "Alergias (excluya por completo el alimento y todos sus derivados): " + r.alergias.join(", ") + ". " : "") +
      (r.evitar.length ? "Evitar: " + r.evitar.join(", ") + ". " : "") + (r.libres.length ? "Evitar también: " + r.libres.join(", ") + ". " : "") +
      (r.dieta ? "Tipo de alimentación: " + r.dieta + ". " : "") + (r.cocinas.length ? "Cocinas preferidas: " + r.cocinas.join(", ") + ". " : "") +
      (r.tiempo ? "Tiempo máximo por comida (solo una indicación): " + r.tiempo + " min. " : "") + (r.porciones ? "Porciones por comida: " + r.porciones + ". " : "") +
      (r.ingredientes.length ? "Ingredientes disponibles (priorícelos): " + r.ingredientes.join(", ") + ". " : "") +
      (r.salud.length ? "Preferencias por salud (sin afirmar que sean indicación médica): " + r.salud.join("; ") + ". " : "")
    : (r.alergias.length ? "Allergies (exclude the food and all its derivatives entirely): " + r.alergias.join(", ") + ". " : "") +
      (r.evitar.length ? "Avoid: " + r.evitar.join(", ") + ". " : "") + (r.libres.length ? "Also avoid: " + r.libres.join(", ") + ". " : "") +
      (r.dieta ? "Eating style: " + r.dieta + ". " : "") + (r.cocinas.length ? "Preferred cuisines: " + r.cocinas.join(", ") + ". " : "") +
      (r.tiempo ? "Maximum time per meal (only a guideline): " + r.tiempo + " min. " : "") + (r.porciones ? "Servings per meal: " + r.porciones + ". " : "") +
      (r.ingredientes.length ? "Available ingredients (prioritize them): " + r.ingredientes.join(", ") + ". " : "") +
      (r.salud.length ? "Health preferences (do not claim they are medical advice): " + r.salud.join("; ") + ". " : "");
  const mm = d.minutos;
  return es
    ? "Escriba la receta completa de este plato: " + d.titulo + " (id: " + d.plato + (mm ? "; tiempo aproximado: " + mm + " min" : "") + "). Responda solo con JSON: {\"recetas\":[{\"plato\":\"id\",\"titulo\":\"\",\"tiempo_min\":0,\"porciones\":0,\"ingredientes\":[\"cantidad y nombre\"],\"pasos\":[\"...\"]}]} con UNA sola receta y use exactamente el id indicado en \"plato\". " + restr + "Los platos cuyo id empieza por «crema-» son sopas sin lácteos: en el título llámelos «sopa» o «puré» y nunca «crema». No afirme que la receta es segura para ninguna condición de salud. Máximo 12 ingredientes y 6 pasos breves."
    : "Write the complete recipe for this dish: " + d.titulo + " (id: " + d.plato + (mm ? "; approximate time: " + mm + " min" : "") + "). Reply with JSON only: {\"recetas\":[{\"plato\":\"id\",\"titulo\":\"\",\"tiempo_min\":0,\"porciones\":0,\"ingredientes\":[\"quantity and name\"],\"pasos\":[\"...\"]}]} with ONE recipe only and use exactly the given id in \"plato\". " + restr + "Dishes whose id starts with «crema-» are dairy-free soups: in the title call them «soup» or «purée» and never «cream». Do not claim the recipe is safe for any health condition. At most 12 ingredients and 6 short steps.";
}
const iaError = (code, status, extra = {}) => json({ ok: false, error: { code } }, status, extra);
async function recetaIA(request, env, prod) {
  if (request.method !== "POST") return iaError("method_not_allowed", 405);
  const t = await leerToken(request, env, prod);
  if (!t) return iaError("no_access", 401);
  const kl = "g:" + t.k + ":" + Math.floor(Date.now() / 3600000);
  const n = parseInt((await env.PAGOS.get(kl)) || "0", 10);
  if (n >= IA_POR_HORA) return iaError("rate_limited", 429, { "retry-after": "600" });

  const txt = await request.text();
  if (txt.length > 8192) return iaError("too_large", 413);
  let b; try { b = JSON.parse(txt); } catch { return iaError("bad_request", 400); }
  if (!b || typeof b !== "object") return iaError("bad_request", 400);
  const lang = b.lang === "en" ? "en" : b.lang === "es" ? "es" : null;
  const r = b.restricciones && typeof b.restricciones === "object" ? b.restricciones : {};
  const d = {
    lang,
    plato: typeof b.plato === "string" && /^[a-z0-9-]{2,60}$/.test(b.plato) ? b.plato : null,
    titulo: limpio(b.titulo, 90),
    minutos: entero(b.minutos, 600),
    r: {
      alergias: lista(r.alergias, 20, 60), evitar: lista(r.evitar, 30, 60), libres: lista(r.libres, 10, 40),
      cocinas: lista(r.cocinas, 12, 40), ingredientes: lista(r.ingredientes, 15, 30), salud: lista(r.salud, 20, 200),
      dieta: r.dieta == null ? null : limpio(r.dieta, 40), tiempo: entero(r.tiempo, 600), porciones: entero(r.porciones, 20),
    },
  };
  const malas = !d.lang || !d.plato || d.titulo.length < 3 || d.minutos === undefined || d.r.tiempo === undefined || d.r.porciones === undefined ||
    ["alergias", "evitar", "libres", "cocinas", "ingredientes", "salud"].some((k) => d.r[k] === null);
  if (malas) return iaError("bad_request", 400);
  if (!env.GEMINI) return iaError("not_configured", 503);

  await env.PAGOS.put(kl, String(n + 1), { expirationTtl: 7200 });
  const h = { "content-type": "application/json" };
  const ip = request.headers.get("cf-connecting-ip");
  if (ip) h["cf-connecting-ip"] = ip;
  let res;
  try {
    res = await env.GEMINI.fetch("https://mi-plato-inteligente-api.interno/api/generate", {
      method: "POST", headers: h, body: JSON.stringify({ prompt: textoReceta(d), language: d.lang }),
    });
  } catch { return iaError("upstream_error", 502); }
  const out = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  const ra = res.headers.get("retry-after"); if (ra) out.set("retry-after", ra);
  return new Response(res.body, { status: res.status, headers: out });
}

/* ---------- /api/contacto: formulario de contacto -> correo a la dueña del sitio ---------- */
const CONTACTO_DESTINO = "terapiaholisticacr@gmail.com";
const CONTACTO_ORIGEN = "contacto@saludintegral.site";
const limpiar = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
const b64 = (txt) => { const bytes = new TextEncoder().encode(txt); let bin = ""; for (const b of bytes) bin += String.fromCharCode(b); return btoa(bin).replace(/.{1,76}/g, "$&\r\n").trimEnd(); };
async function contacto(request, env) {
  if (request.method !== "POST") return json({ ok: false, error: "method" }, 405);
  let d; try { d = await request.json(); } catch { return json({ ok: false, error: "json" }, 400); }
  const nombre = limpiar(d.name, 120).replace(/[\r\n]+/g, " "), correo = limpiar(d.email, 200), mensaje = limpiar(d.message, 5000);
  const idioma = d.lang === "en" ? "en" : "es", pagina = limpiar(d.page, 200);
  if (d.website) return json({ ok: true }); // trampa anti-bots
  if (!nombre || !mensaje || !/^[^@\s<>"]+@[^@\s<>"]+\.[^@\s<>"]+$/.test(correo)) return json({ ok: false, error: "datos" }, 400);
  // límite sencillo por IP: 5 mensajes por hora
  const ip = request.headers.get("cf-connecting-ip") || "anon";
  const kl = "c:" + ip + ":" + Math.floor(Date.now() / 3600000);
  const n = parseInt((await env.PAGOS.get(kl)) || "0", 10);
  if (n >= 5) return json({ ok: false, error: "limite" }, 429);
  await env.PAGOS.put(kl, String(n + 1), { expirationTtl: 7200 });
  const asunto = "Mensaje desde saludintegral.site de " + nombre;
  const cuerpo = mensaje + "\n\n— " + nombre + " <" + correo + ">\nIdioma: " + idioma + (pagina ? "\nPágina: " + pagina : "");
  const raw = [
    "From: Salud Integral <" + CONTACTO_ORIGEN + ">",
    "To: " + CONTACTO_DESTINO,
    "Reply-To: " + nombre.replace(/[^\w .'-]/g, "") + " <" + correo + ">",
    "Subject: =?UTF-8?B?" + btoa(String.fromCharCode(...new TextEncoder().encode(asunto))) + "?=",
    "Message-ID: <" + crypto.randomUUID() + "@saludintegral.site>",
    "Date: " + new Date().toUTCString(),
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    b64(cuerpo),
  ].join("\r\n");
  try {
    const { EmailMessage } = await import("cloudflare:email");
    await env.EMAIL.send(new EmailMessage(CONTACTO_ORIGEN, CONTACTO_DESTINO, raw));
  } catch (e) { return json({ ok: false, error: "envio" }, 502); }
  return json({ ok: true });
}

/* ---------- enrutador ---------- */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const esLocal = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);

    if (url.pathname === "/api/contacto") return contacto(request, env);
    if (url.pathname === "/privado/plato" || url.pathname === "/plato-prueba") return Response.redirect(url.origin + url.pathname + "/", 301);
    if (url.pathname === "/api/ipn") {
      if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
      const cuerpo = await request.text();
      ctx.waitUntil(procesarIPN(cuerpo, env, esLocal).catch(() => {}));
      return new Response("", { status: 200 }); // PayPal exige un 200 vacío
    }
    for (const prod of productos(env)) { // plato, jardín y equilibrio van primero: sus rutas privadas están dentro de /privado/
      if (url.pathname === prod.api + "/acceso") {
        if (request.method !== "POST") return json({ error: "method" }, 405);
        return acceso(request, env, prod);
      }
      if (url.pathname === prod.api + "/estado") {
        const t = await leerToken(request, env, prod);
        const h = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
        await renovar(request, env, prod, t, h);
        return new Response(JSON.stringify({ activo: !!t }), { status: 200, headers: h });
      }
      if (prod.id === "plato" && url.pathname === prod.api + "/receta") return recetaIA(request, env, prod);
      const base = prod.privados.find((b) => url.pathname.startsWith(b));
      if (base) {
        const resto = url.pathname.slice(base.length);
        if (prod.publicos && prod.publicos.test(resto)) {
          const r = await env.ASSETS.fetch(request);
          const h = new Headers(r.headers);
          if (resto === "sw.js") h.set("cache-control", "no-cache"); // el navegador siempre comprueba si hay una versión nueva
          return new Response(r.body, { status: r.status, headers: h });
        }
        const pagina = resto === "" || resto.endsWith("/") || resto.endsWith(".html");
        const t = await leerToken(request, env, prod, !!prod.acceso && !pagina);
        if (!t) {
          // Mi Plato: quien abre la aplicación sin acceso va a la página de acceso de su idioma.
          if (prod.acceso && pagina && request.method === "GET") {
            const en = /^en\b/i.test(request.headers.get("accept-language") || "");
            return new Response(null, { status: 302, headers: { location: prod.acceso[en ? "en" : "es"], "cache-control": "no-store" } });
          }
          return new Response("No autorizado", { status: 401, headers: { "cache-control": "no-store" } });
        }
        const r = await env.ASSETS.fetch(request);
        const h = new Headers(r.headers);
        h.set("cache-control", "private, no-store");
        h.set("x-robots-tag", "noindex");
        if (pagina) await renovar(request, env, prod, t, h);
        return new Response(r.body, { status: r.status, headers: h });
      }
    }
    return env.ASSETS.fetch(request);
  },
};
