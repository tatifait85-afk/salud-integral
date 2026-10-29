// Recorrido real del comprador contra el Worker local: sin pago no hay PDF; con aviso IPN y número de transacción, sí.
const { chromium } = require('playwright'); const fs = require('fs');
const B = process.env.BASE || 'http://localhost:8791'; let fails = 0; const ok = (c, m) => { console.log((c ? 'OK    ' : 'FALLA ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ locale: 'es-CR', acceptDownloads: true }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/401|400|favicon/.test(m.text())) errs.push(m.text()); });
  const reqs = []; p.on('request', r => reqs.push(r.url()));
  await p.goto(B + '/equilibrio/'); await p.click('[data-go=areas]').catch(async () => { await p.click('text=Comenzar mi mapa'); });
  // elegir 3 tarjetas rápido
  await p.evaluate(() => { const s = EQ.UI.state(); s.sel = ['c_pause', 'r_rest_time', 'b_walk'].filter(Boolean); });
  const ids = await p.evaluate(() => EQ.DATA.CARDS.slice(0, 4).map(c => c.id));
  await p.evaluate((ids) => { const s = EQ.UI.state(); s.sel = ids; s.screen = 'preview'; s.name = 'Tatiana'; sessionStorage.setItem('eq_state_v1', JSON.stringify(s)); }, ids);
  await p.reload(); await p.waitForSelector('.cover');
  ok(await p.isVisible('#payBox') && !(await p.isVisible('#genBtn')), 'sin pago: se ve el cuadro de pago y no el botón de descargar');
  ok(!reqs.some(u => u.includes('/privado/')), 'sin pago: el navegador no pidió el generador privado');
  ok(!(await p.evaluate(() => !!(window.jspdf || (EQ.PDF)))), 'sin pago: el generador de PDF no existe en la página pública');
  const pp = await p.getAttribute('#payBtn', 'id'); ok(pp === 'payBtn', 'botón "Pagar con PayPal" presente');
  // número inexistente
  await p.fill('#fTx', 'NOEXISTE12345'); await p.click('#verBtn'); await p.waitForSelector('#genMsg.err', { timeout: 15000 }); ok(/Todav[ií]a no vemos/.test(await p.textContent('#genMsg')), 'número sin pago: mensaje "todavía no vemos tu pago"');
  // formato malo
  await p.fill('#fTx', '<b>'); await p.click('#verBtn'); await p.waitForFunction(() => /Revisa el n/.test(document.querySelector('#genMsg').textContent)); ok(true, 'formato inválido: mensaje claro');
  // pago real simulado
  const tx = 'E2E' + Date.now().toString(36).toUpperCase() + 'Z9';
  await fetch(B + '/api/ipn', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ payment_status: 'Completed', receiver_email: 'lolaita42@gmail.com', mc_currency: 'USD', mc_gross: '12.99', txn_id: tx }).toString() });
  await new Promise(r => setTimeout(r, 500));
  await p.fill('#fTx', tx); await p.click('#verBtn'); await p.waitForSelector('#genBtn:not([hidden])', { timeout: 15000 }); ok(/Pago confirmado/.test(await p.textContent('#genMsg')), 'pago verificado: aparece el botón de descargar');
  ok(!(await p.isVisible('#payBox')), 'el cuadro de pago se oculta');
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 30000 }).catch(() => null), p.click('#genBtn')]);
  if (!dl) { await p.waitForTimeout(3000); }
  ok(reqs.some(u => u.includes('/privado/equilibrio/pdf.js')), 'tras pagar: se pidió el generador privado con la cookie');
  let pdfOk = false; if (dl) { const path = '/tmp/e2e-pago.pdf'; await dl.saveAs(path); const buf = fs.readFileSync(path); pdfOk = buf.slice(0, 5).toString() === '%PDF-' && require('child_process').execSync('python3 -I -c "import pypdf;print(len(pypdf.PdfReader(\'/tmp/e2e-pago.pdf\').get_fields() or {}))"').toString().trim() > 100; ok(/Tatiana/.test(dl.suggestedFilename()), 'archivo: ' + dl.suggestedFilename()); }
  ok(pdfOk, 'se descargó un PDF válido con campos editables');
  // volver con ?tx= (retorno de PayPal) en una pestaña nueva con la misma sesión limpia
  const ctx2 = await b.newContext({ locale: 'es-CR' }); const q = await ctx2.newPage();
  await q.goto(B + '/equilibrio/?tx=' + tx); await q.waitForFunction(() => fetch('/api/estado?p=equilibrio').then(r => r.json()).then(j => j.activo), null, { timeout: 20000 }); ok(true, 'retorno con ?tx= en otro navegador: verifica solo y deja el acceso activo');
  ok(!(await q.evaluate(() => location.search)), 'la dirección queda limpia (sin ?tx=)');
  // aislamiento entre productos: un pago de hábitos (9.99) no abre equilibrio, y el generador sigue protegido sin cookie
  const txH = 'HAB' + Date.now().toString(36).toUpperCase() + 'Q7';
  await fetch(B + '/api/ipn', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ payment_status: 'Completed', receiver_email: 'lolaita42@gmail.com', mc_currency: 'USD', mc_gross: '9.99', txn_id: txH }).toString() });
  const rx = await fetch(B + '/api/acceso', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ tx: txH, p: 'equilibrio' }) });
  ok(rx.status === 400, 'pago de hábitos NO abre equilibrio (HTTP ' + rx.status + ')');
  ok((await fetch(B + '/privado/equilibrio/pdf.js')).status === 401, 'pdf.js sin cookie: 401');
  ok((await ctx.request.get(B + '/privado/equilibrio/pdf.js')).status() === 200, 'pdf.js con la cookie si_equilibrio: 200');
  const cks = (await ctx.cookies()).map(c => c.name); ok(cks.includes('si_equilibrio') && !cks.includes('si_mapa') && !cks.includes('si_jardin'), 'solo se emitió la cookie si_equilibrio: ' + cks.join(','));
  ok(errs.length === 0, 'sin errores de consola ' + JSON.stringify(errs));
  await b.close(); console.log(fails ? 'HAY FALLAS: ' + fails : 'TODO OK'); process.exit(fails ? 1 : 0);
})();
