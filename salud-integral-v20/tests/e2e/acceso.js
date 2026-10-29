// Página de acceso y cuestionario SIN Worker real. Verifica que el cliente nunca concede acceso por sí solo.
// Las respuestas del Worker se simulan en la red solo para comprobar la lógica del cliente; NO verifican el Worker ni PayPal.
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8765';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();
  for (const [lang, acc, quiz] of [['es', '/tu-mapa-de-habitos/acceso/', '/tu-mapa-de-habitos/cuestionario/'], ['en', '/en/your-habit-map/access/', '/en/your-habit-map/questionnaire/']]) {
    // A. sin Worker (el servidor estático da 404): no hay acceso
    let pg = await b.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(BASE + quiz); await pg.waitForSelector('#mapa-app a', { timeout: 8000 });
    ok(await pg.locator('#mapa-app a[href*="acceso"], #mapa-app a[href*="access"]').count() > 0, lang + ': cuestionario sin servidor/sesión → error y enlace a confirmar pago, sin contenido');
    ok(await pg.locator('#mapa-app input, #mapa-app .opt, #mapa-app [role=radio]').count() === 0, lang + ': sin sesión no se muestran preguntas');
    await pg.goto(BASE + acc); await pg.fill('#tx', 'ABC'); await pg.click('#acceso-form button');
    ok(/./.test(await pg.textContent('#acceso-msg')) && await pg.locator('#acceso-go').isHidden(), lang + ': número corto → error, sin acceso');
    await pg.fill('#tx', 'ABCDEFGH12'); await pg.click('#acceso-form button'); await pg.waitForTimeout(600);
    ok(/err/.test(await pg.getAttribute('#acceso-msg', 'class')) && page_url(pg).includes('acce'), lang + ': Worker ausente (404) → error, no redirige al cuestionario');
    ok(errs.length === 0, lang + ': sin errores JS ' + errs.join('|')); await pg.close();
    // B. regreso de PayPal con ?tx= sin verificación del servidor: NO equivale a pago
    pg = await b.newPage(); await pg.route('**/api/acceso', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":false,"estado":"pendiente"}' }));
    await pg.route('**/api/estado', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"activo":false}' }));
    await pg.goto(BASE + acc + '?tx=ABCDEFGH12'); await pg.waitForTimeout(800);
    ok(page_url(pg).includes('acce') && !page_url(pg).includes('tx='), lang + ': ?tx= se quita de la barra y "pendiente" no da acceso');
    await pg.close();
    // C. el servidor confirma (contrato {ok:true}) → recién entonces va al cuestionario
    pg = await b.newPage(); await pg.route('**/api/acceso', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
    await pg.goto(BASE + acc); await pg.fill('#tx', 'ABCDEFGH12'); await pg.click('#acceso-form button'); await pg.waitForURL('**' + quiz.split('/').slice(-2, -1)[0] + '/**', { timeout: 5000 }).catch(() => {});
    ok(page_url(pg).includes(quiz.split('/').slice(-2, -1)[0]), lang + ': {ok:true} del servidor → navega al cuestionario');
    await pg.close();
    // D. reembolsado / límite
    for (const [est, cls] of [['reembolsado', 1], ['limite', 1], ['expirado', 1]]) {
      pg = await b.newPage(); await pg.route('**/api/acceso', r => r.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ ok: false, estado: est }) }));
      await pg.goto(BASE + acc); await pg.fill('#tx', 'ABCDEFGH12'); await pg.click('#acceso-form button'); await pg.waitForTimeout(400);
      ok(/err/.test(await pg.getAttribute('#acceso-msg', 'class')) && page_url(pg).includes('acce'), lang + ': estado ' + est + ' → mensaje, sin acceso'); await pg.close();
    }
  }
  await b.close(); console.log(fails ? fails + ' FALLOS' : 'TODO OK'); process.exit(fails ? 1 : 0);
})();
function page_url(pg) { return pg.url(); }
