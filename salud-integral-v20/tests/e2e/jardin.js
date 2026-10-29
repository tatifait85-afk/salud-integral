// Mi Jardín Digestivo (app): generación de PDF en el dispositivo, suscripción follow.it (lógica del cliente; follow.it no se contacta de verdad).
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8765';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();
  for (const [lang, p] of [['es', '/privado/jardin/es/'], ['en', '/privado/jardin/en/']]) {
    const pg = await b.newPage({ viewport: { width: 420, height: 860 } }); const errs = [];
    pg.on('pageerror', e => errs.push(e.message)); pg.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
    let sub = 0, mode = 'ok';
    await pg.route('**/api.follow.it/**', async r => { sub++; await new Promise(x => setTimeout(x, 250)); return mode === 'ok' ? r.fulfill({ status: 200, body: 'ok' }) : r.abort(); });
    await pg.goto(BASE + p); await pg.waitForTimeout(1000);
    ok(await pg.evaluate(() => S.lang) === lang, lang + ': idioma de la app = ' + lang);
    const r = await pg.evaluate(async () => {
      [1, 2, 3, 4, 5].forEach(n => S.done[n] = true); S.st5.picks = Object.keys(HAB_BY).slice(0, NHAB);
      S.screen = 'final'; render(true);
      // PDF sin nombre → error de validación
      document.getElementById('fname').value = ''; S.p.name = ''; await ACT.mkpdf(); const e1 = S.ferr;
      document.getElementById('fname').value = 'Tatiana'; S.p.name = 'Tatiana'; await ACT.mkpdf();
      return { e1, pdf: !!S.pdf, len: S.pdf ? S.pdf.bytes.length : 0, head: S.pdf ? String.fromCharCode(...S.pdf.bytes.slice(0, 5)) : '' };
    });
    ok(!!r.e1, lang + ': PDF sin nombre → mensaje de validación'); ok(r.pdf && r.head === '%PDF-' && r.len > 20000, lang + ': PDF generado en el dispositivo (' + r.len + ' bytes, cabecera ' + r.head + ')');
    // suscripción
    await pg.fill('#fmail', 'no-es-correo'); await pg.click('#fsub'); await pg.waitForTimeout(150);
    ok(sub === 0 && /err/.test(await pg.getAttribute('#fsmsg', 'class')), lang + ': correo inválido no se envía');
    await pg.fill('#fmail', 'ana@correo.com'); mode = 'fail'; await pg.click('#fsub'); await pg.waitForTimeout(600);
    ok(sub === 1 && /err/.test(await pg.getAttribute('#fsmsg', 'class')), lang + ': error de red → mensaje de error (no éxito)');
    mode = 'ok'; await pg.click('#fsub'); await pg.click('#fsub', { force: true, timeout: 300 }).catch(() => {}); await pg.waitForTimeout(700);
    const t = await pg.textContent('#fsmsg');
    ok(sub === 2, lang + ': doble clic no duplica (peticiones=' + sub + ')');
    ok(!/enviamos|we sent/i.test(t) && /follow\.it/.test(t), lang + ': mensaje no afirma una confirmación que no se pudo verificar → «' + t.slice(0, 70) + '…»');
    ok(errs.length === 0, lang + ': sin errores ' + errs.join('|')); await pg.close();
  }
  await b.close(); console.log(fails ? fails + ' FALLOS' : 'TODO OK'); process.exit(fails ? 1 : 0);
})();
