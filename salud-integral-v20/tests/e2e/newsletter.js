// Formulario MailerLite del programa gratuito (solo español). La respuesta de MailerLite se simula SOLO para probar la lógica del cliente;
// no verifica la integración real ni la entrega de correos.
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8765';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  let calls = 0, mode = 'ok', body = '';
  await pg.route('**/assets.mailerlite.com/**', async r => { calls++; body = r.request().postData() || ''; await new Promise(x => setTimeout(x, 250));
    if (mode === 'ok') return r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"success":true}' });
    if (mode === 'rej') return r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"success":false,"errors":{"fields":{"email":["x"]}}}' });
    if (mode === '500') return r.fulfill({ status: 500, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"success":true}' });
    return r.abort(); });
  await pg.goto(BASE + '/alimentacion/'); const F = 'form[data-ml]'; const msg = '[data-ml-msg]';
  ok(await pg.locator(F).count() >= 1, 'formulario MailerLite presente en Alimentación');
  await pg.fill(F + ' input[type=email]', 'mal'); await pg.click(F + ' button'); await pg.waitForTimeout(200);
  ok(calls === 0, 'correo inválido no se envía');
  await pg.fill(F + ' input[type=email]', 'ana@correo.com');
  for (const m of ['rej', '500', 'abort']) { mode = m; const c0 = calls; await pg.click(F + ' button'); await pg.waitForFunction(() => !document.querySelector('form[data-ml] button').disabled); ok(calls === c0 + 1 && /./.test(await pg.textContent(msg)) && await pg.inputValue(F + ' input[type=email]') === 'ana@correo.com', 'respuesta ' + m + ' → mensaje de error y se conserva el correo'); }
  mode = 'ok'; const c1 = calls; await pg.click(F + ' button'); await pg.click(F + ' button', { force: true, timeout: 300 }).catch(() => {}); await pg.waitForFunction(() => !document.querySelector('form[data-ml] button').disabled);
  ok(calls === c1 + 1, 'doble clic → una sola petición'); ok(/email|correo|fields/.test(body) && /ana%40correo|ana@correo/.test(decodeURIComponent(body)), 'se envía fields[email]');
  ok(await pg.inputValue(F + ' input[type=email]') === '', 'éxito solo con {"success":true} → formulario limpio');
  ok(errs.length === 0, 'sin errores JS'); await b.close(); console.log(fails ? fails + ' FALLOS' : 'TODO OK'); process.exit(fails ? 1 : 0);
})();
