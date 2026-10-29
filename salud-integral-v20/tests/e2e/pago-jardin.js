// Recorrido del comprador de «Mi Jardín Digestivo» contra el Worker local: sin pago no hay juego; con aviso IPN (25.00) y número de transacción, sí.
const { chromium } = require('playwright');
const B = process.env.BASE || 'http://localhost:8799'; let fails = 0; const ok = (c, m) => { console.log((c ? 'OK    ' : 'FALLA ') + m); if (!c) fails++; };
const ipn = (tx, amt) => fetch(B + '/api/ipn', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ payment_status: 'Completed', receiver_email: 'lolaita42@gmail.com', mc_currency: 'USD', mc_gross: amt, txn_id: tx }).toString() });
(async () => {
  const b = await chromium.launch();
  for (const [lang, acc, game] of [['es', '/mi-jardin-digestivo/jardin/', '/privado/jardin/es/'], ['en', '/en/my-digestive-garden/garden/', '/privado/jardin/en/']]) {
    const ctx = await b.newContext({ locale: lang === 'es' ? 'es-CR' : 'en-US' }); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    ok((await ctx.request.get(B + game)).status() === 401, lang + ': el juego sin pago responde 401');
    await p.goto(B + acc);
    await p.fill('#tx', 'ABC'); await p.click('#acceso-form button'); await p.waitForTimeout(800);
    ok(/transacci|transaction/i.test(await p.textContent('#acceso-msg')), lang + ': número inválido → mensaje claro');
    ok(!/\/privado\//.test(p.url()), lang + ': número sin pago no abre el juego');
    const tx = 'JAR' + lang.toUpperCase() + Date.now().toString(36).toUpperCase() + 'K3';
    await ipn(tx, '25.00'); await new Promise(r => setTimeout(r, 500));
    await p.fill('#tx', tx); await p.click('#acceso-form button');
    await p.waitForURL('**' + game, { timeout: 20000 }); await p.waitForTimeout(1200);
    ok(p.url().endsWith(game), lang + ': pago verificado → entra al juego');
    ok(await p.evaluate(() => typeof S !== 'undefined' && S.lang) === lang, lang + ': el juego carga (idioma ' + lang + ')');
    const cks = (await ctx.cookies()).map(c => c.name); ok(cks.includes('si_jardin') && !cks.includes('si_mapa') && !cks.includes('si_equilibrio'), lang + ': solo cookie si_jardin: ' + cks.join(','));
    ok(errs.length === 0, lang + ': sin errores de JS ' + JSON.stringify(errs));
    const ctx2 = await b.newContext(); const q = await ctx2.newPage(); await q.goto(B + acc + '?tx=' + tx);
    await q.waitForURL('**' + game, { timeout: 20000 }); ok(true, lang + ': retorno de PayPal con ?tx= entra solo');
    await ctx.close(); await ctx2.close();
  }
  await b.close(); console.log(fails ? 'HAY FALLAS: ' + fails : 'TODO OK'); process.exit(fails ? 1 : 0);
})();
