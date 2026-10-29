// Pruebas del Worker con avisos IPN simulados (PRUEBA_LOCAL=1 en .dev.vars omite solo la consulta a PayPal; todo lo demás se valida igual).
const B = process.env.BASE || 'http://localhost:8799';
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK    ' : 'FALLA ') + m); if (!c) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rnd = () => 'T' + Math.random().toString(36).slice(2, 12).toUpperCase() + 'X9';
const ipn = (o) => fetch(B + '/api/ipn', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ payment_status: 'Completed', receiver_email: 'lolaita42@gmail.com', mc_currency: 'USD', mc_gross: '12.99', ...o }).toString() });
const acceso = (tx, prod, cookie) => fetch(B + (prod === 'h' ? '/api/acceso' : prod === 'j' ? '/api/jardin/acceso' : '/api/equilibrio/acceso'), { method: 'POST', headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) }, body: JSON.stringify({ tx }) });
const ck = r => (r.headers.get('set-cookie') || '').split(';')[0];
(async () => {
  // 1. pago válido de equilibrio
  const t1 = rnd(); let r = await ipn({ txn_id: t1 }); ok(r.status === 200, 'IPN responde 200 vacío'); await sleep(400);
  r = await acceso(t1.toLowerCase(), 'e'); const c1 = ck(r); ok(r.status === 200 && c1.startsWith('si_equilibrio='), 'pago de 12.99 verificado → cookie si_equilibrio');
  ok((await (await fetch(B + '/api/equilibrio/estado', { headers: { cookie: c1 } })).json()).activo === true, 'estado activo con la cookie');
  ok((await fetch(B + '/privado/equilibrio/pdf.js')).status === 401, 'paquete privado sin cookie: 401');
  r = await fetch(B + '/privado/equilibrio/pdf.js', { headers: { cookie: c1 } }); const body = await r.text(); ok(r.status === 200 && body.includes('jspdf') || body.includes('jsPDF'), 'paquete privado con cookie: 200 (' + Math.round(body.length / 1024) + ' KB)'); ok(/no-store/.test(r.headers.get('cache-control') || ''), 'sin caché');
  ok((await fetch(B + '/privado/equilibrio/pdf.js', { headers: { cookie: 'si_equilibrio=abc.def' } })).status === 401, 'cookie falsificada: 401');
  // 2. aislamiento entre productos
  ok((await fetch(B + '/api/estado', { headers: { cookie: c1 } })).status === 200 && (await (await fetch(B + '/api/estado', { headers: { cookie: c1 } })).json()).activo === false, 'la cookie de equilibrio no activa hábitos');
  ok((await acceso(t1, 'h')).status === 202, 'un pago de equilibrio no sirve para hábitos');
  const t2 = rnd(); await ipn({ txn_id: t2, mc_gross: '9.99' }); await sleep(400);
  ok((await acceso(t2, 'e')).status === 202, 'un pago de 9.99 no sirve para equilibrio');
  r = await acceso(t2, 'h'); const c2 = ck(r); ok(r.status === 200 && c2.startsWith('si_mapa='), 'un pago de 9.99 sigue activando hábitos');
  ok((await fetch(B + '/privado/equilibrio/pdf.js', { headers: { cookie: c2 } })).status === 401, 'cookie de hábitos no abre lo privado de equilibrio');
  // 3. avisos que se deben ignorar
  for (const [m, o] of [['monto distinto (15.00)', { mc_gross: '15.00' }], ['monto 12.98', { mc_gross: '12.98' }], ['otro receptor', { receiver_email: 'otro@x.com' }], ['moneda EUR', { mc_currency: 'EUR' }], ['estado Pending', { payment_status: 'Pending' }]]) {
    const t = rnd(); await ipn({ txn_id: t, ...o }); await sleep(300); ok((await acceso(t, 'e')).status === 202, 'se ignora: ' + m);
  }
  // 4. reembolso
  const t3 = rnd(); await ipn({ txn_id: t3 }); await sleep(300); r = await acceso(t3, 'e'); const c3 = ck(r); ok(r.status === 200, 'pago para reembolsar');
  await ipn({ txn_id: rnd(), payment_status: 'Refunded', parent_txn_id: t3, mc_gross: '-12.99' }); await sleep(400);
  ok((await acceso(t3, 'e')).status === 403, 'reembolsado: ya no da acceso');
  ok((await fetch(B + '/privado/equilibrio/pdf.js', { headers: { cookie: c3 } })).status === 401, 'reembolsado: la cookie existente deja de servir');
  // 5. límite de dispositivos
  const t4 = rnd(); await ipn({ txn_id: t4 }); await sleep(300); let st = []; for (let i = 0; i < 6; i++) st.push((await acceso(t4, 'e')).status); ok(st.slice(0, 5).every(s => s === 200) && st[5] === 403, 'límite de 5 dispositivos: ' + st.join(','));
  // 6. formato y método
  ok((await acceso('<script>', 'e')).status === 400, 'número con formato inválido: 400');
  ok((await fetch(B + '/api/equilibrio/acceso')).status === 405, 'GET en acceso: 405');
  ok((await fetch(B + '/api/ipn')).status === 405, 'GET en ipn: 405');
  // 7. Mi Jardín Digestivo (US$25): tercer producto, aislado de los otros dos
  {
    const tj = rnd(); await ipn({ txn_id: tj, mc_gross: '25.00' }); await sleep(400);
    r = await acceso(tj.toLowerCase(), 'j'); const cj = ck(r); ok(r.status === 200 && cj.startsWith('si_jardin='), 'pago de 25.00 verificado → cookie si_jardin');
    ok((await (await fetch(B + '/api/jardin/estado', { headers: { cookie: cj } })).json()).activo === true, 'jardín: estado activo con su cookie');
    ok((await (await fetch(B + '/api/jardin/estado')).json()).activo === false, 'jardín: sin cookie no hay acceso');
    ok((await fetch(B + '/privado/jardin/es/', { redirect: 'manual' })).status === 401, 'juego del jardín sin cookie: 401');
    ok((await fetch(B + '/privado/jardin/core2.js')).status === 401, 'scripts del juego sin cookie: 401');
    ok((await fetch(B + '/privado/jardin/core2.js', { headers: { cookie: cj } })).status === 200, 'scripts del juego con cookie: 200');
    ok((await fetch(B + '/privado/jardin/es/', { headers: { cookie: cj } })).status === 200, 'juego con cookie: 200');
    ok((await fetch(B + '/privado/mapa-motor.js', { headers: { cookie: cj } })).status === 401, 'cookie del jardín no abre lo privado de hábitos');
    ok((await fetch(B + '/privado/equilibrio/pdf.js', { headers: { cookie: cj } })).status === 401, 'cookie del jardín no abre lo privado de equilibrio');
    ok((await acceso(tj, 'e')).status === 202 && (await acceso(tj, 'h')).status === 202, 'un pago de 25.00 no sirve para equilibrio ni hábitos');
    ok((await fetch(B + '/api/estado', { headers: { cookie: cj } })).status === 200 && (await (await fetch(B + '/api/estado', { headers: { cookie: cj } })).json()).activo === false, 'cookie del jardín no activa hábitos');
    const te = rnd(); await ipn({ txn_id: te, mc_gross: '12.99' }); await sleep(300); r = await acceso(te, 'e'); const ce = ck(r);
    ok((await fetch(B + '/privado/jardin/core2.js', { headers: { cookie: ce } })).status === 401, 'cookie de equilibrio no abre el jardín');
    ok((await acceso(te, 'j')).status === 202, 'un pago de 12.99 no sirve para el jardín');
    await ipn({ txn_id: rnd(), payment_status: 'Refunded', parent_txn_id: tj, mc_gross: '-25.00' }); await sleep(400);
    ok((await acceso(tj, 'j')).status === 403, 'jardín reembolsado: ya no da acceso');
    ok((await fetch(B + '/privado/jardin/core2.js', { headers: { cookie: cj } })).status === 401, 'jardín reembolsado: la cookie existente deja de servir');
    ok((await fetch(B + '/api/jardin/acceso')).status === 405, 'GET en acceso del jardín: 405');
    const tl = rnd(); await ipn({ txn_id: tl, mc_gross: '25.00' }); await sleep(300); const sj = []; for (let i = 0; i < 6; i++) sj.push((await acceso(tl, 'j')).status);
    ok(sj.slice(0, 5).every(x => x === 200) && sj[5] === 403, 'jardín: límite de 5 ingresos y luego 403');
  }
  console.log(fails ? 'HAY FALLAS: ' + fails : 'TODO OK'); process.exit(fails ? 1 : 0);
})();
