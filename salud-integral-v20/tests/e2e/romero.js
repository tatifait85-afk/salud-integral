// Globo de WhatsApp flotante + Orientador (Romero del banner). Uso: NODE_PATH=$(npm root -g) node tests/e2e/romero.js [base]
const { chromium } = require('playwright'); const BASE = process.argv[2] || 'http://localhost:8765'; let fails = 0;
const ok = (c, m) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + m); };
(async () => { const b = await chromium.launch();
  for (const u of ['/', '/en/', '/contacto/', '/recursos/']) { const pg = await b.newPage({ viewport: { width: 420, height: 900 } }); const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(BASE + u); await pg.waitForSelector('.wa-float');
    const href = await pg.getAttribute('.wa-float', 'href'); const lbl = await pg.getAttribute('.wa-float', 'aria-label');
    ok(/^https:\/\/wa\.me\/\d+\?text=/.test(href) && lbl && !errs.length, u + ' globo WhatsApp → ' + href.slice(0, 40));
    ok(!(await pg.$('.rm-launch')) && !(await pg.$('.rm-panel')), u + ' sin chat flotante antiguo');
    if (u === '/' || u === '/en/') { await pg.click('[data-open-guide]'); ok(!!(await pg.$('.guide-back.open, .gd-back.open, [role=dialog]')) && !errs.length, u + ' Orientador abre'); }
    await pg.close(); }
  await b.close(); console.log(fails ? fails + ' FALLOS' : 'TODO OK'); process.exit(fails ? 1 : 0); })();
