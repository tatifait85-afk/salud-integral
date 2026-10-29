// Pruebas del formulario de contacto (lógica del cliente). Uso: NODE_PATH=$(npm root -g) node tests/e2e/contact.js [base]
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8765';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch(); 
  for (const [lang, path] of [['es', '/contacto/'], ['en', '/en/contact/']]) {
    const pg = await b.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(BASE + path); const F = '.cform';
    // 1. validación
    await pg.click(F + ' button[type=submit]');
    ok(/./.test(await pg.textContent('.cform-msg')) && await pg.getAttribute(F + ' [name=name]', 'aria-invalid') === 'true', lang + ': nombre vacío → error y aria-invalid');
    await pg.fill(F + ' [name=name]', 'Ana'); await pg.fill(F + ' [name=email]', 'mal'); await pg.fill(F + ' [name=message]', 'Hola');
    await pg.click(F + ' button[type=submit]');
    ok(await pg.getAttribute(F + ' [name=email]', 'aria-invalid') === 'true', lang + ': correo inválido rechazado');
    // 2. sin endpoint: mailto, sin afirmar envío
    ok(await pg.getAttribute(F, 'data-endpoint') === null, lang + ': sin endpoint por defecto (respaldo mailto)');
    // 3. con endpoint simulado en red (solo prueba la lógica del cliente)
    await pg.evaluate(() => document.querySelector('.cform').setAttribute('data-endpoint', '/api/contacto'));
    await pg.fill(F + ' [name=email]', 'ana@correo.com');
    let calls = 0, mode = 'ok';
    await pg.route('**/api/contacto', async r => { calls++; await new Promise(x => setTimeout(x, 300));
      if (mode === 'ok') return r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
      if (mode === '200noOk') return r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":false}' });
      if (mode === '200html') return r.fulfill({ status: 200, contentType: 'text/html', body: '<html>' });
      if (mode === '500') return r.fulfill({ status: 500, contentType: 'application/json', body: '{"ok":true}' });
      return r.abort(); });
    const msg = () => pg.textContent('.cform-msg');
    mode = '500'; await pg.click(F + ' button[type=submit]');
    ok(await pg.isDisabled(F + ' button[type=submit]'), lang + ': botón bloqueado mientras envía');
    await pg.click(F + ' button[type=submit]', { force: true, timeout: 500 }).catch(() => {});
    await pg.waitForFunction(() => !document.querySelector('.cform button[type=submit]').disabled);
    ok(calls === 1, lang + ': doble clic no duplica el envío (llamadas=' + calls + ')');
    ok(await pg.getAttribute('.cform-msg', 'class').then(c => /err/.test(c)), lang + ': HTTP 500 → error (aunque el cuerpo diga ok)');
    ok(await pg.inputValue(F + ' [name=message]') === 'Hola', lang + ': el mensaje no se pierde tras un error');
    for (const m of ['200noOk', '200html', 'abort']) { mode = m; await pg.click(F + ' button[type=submit]'); await pg.waitForFunction(() => !document.querySelector('.cform button[type=submit]').disabled); ok(/err/.test(await pg.getAttribute('.cform-msg', 'class')), lang + ': respuesta ' + m + ' → error, no éxito'); }
    mode = 'ok'; await pg.click(F + ' button[type=submit]'); await pg.waitForFunction(() => !document.querySelector('.cform button[type=submit]').disabled);
    ok(!/err/.test(await pg.getAttribute('.cform-msg', 'class')) && await pg.inputValue(F + ' [name=message]') === '', lang + ': {"ok":true} + HTTP 200 → éxito y formulario limpio');
    // 4. honeypot
    const before = calls; await pg.fill(F + ' [name=name]', 'Bot'); await pg.fill(F + ' [name=email]', 'b@b.com'); await pg.fill(F + ' [name=message]', 'x'); await pg.evaluate(() => document.querySelector('[name=website]').value = 'http://spam');
    await pg.click(F + ' button[type=submit]'); ok(calls === before, lang + ': trampa anti-bots no envía');
    ok(errs.length === 0, lang + ': sin errores JS ' + errs.join('|'));
    await pg.close();
  }
  // mailto sin endpoint: no se afirma envío
  const pg = await b.newPage(); await pg.goto(BASE + '/contacto/');
  await pg.fill('.cform [name=name]', 'Ana'); await pg.fill('.cform [name=email]', 'a@b.co'); await pg.fill('.cform [name=message]', 'Hola');
  await pg.evaluate(() => { window.__nav = null; }); 
  await Promise.all([pg.waitForEvent('framenavigated').catch(() => {}), pg.click('.cform button[type=submit]')]).catch(() => {});
  const t = await pg.textContent('.cform-msg').catch(() => '');
  ok(/solo se env/.test(t) || t === '', 'es: mailto → mensaje honesto (no dice "enviado"): ' + t.slice(0, 60));
  await b.close(); console.log(fails ? fails + ' FALLOS' : 'TODO OK'); process.exit(fails ? 1 : 0);
})();
