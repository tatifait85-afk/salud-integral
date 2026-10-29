// Romero: respuestas esperadas a preguntas clave (ES/EN). Uso: NODE_PATH=$(npm root -g) node tests/e2e/romero.js [base]
const { chromium } = require('playwright'); const BASE = process.argv[2] || 'http://localhost:8765'; let fails = 0;
const CASES = [['/', 'cómo es el reembolso', 'terminos-de-uso'], ['/', 'quiero cancelar mi sesión', 'terminos-de-uso'], ['/', 'términos de uso', 'terminos-de-uso'], ['/', 'política de privacidad', 'privacidad'],
  ['/en/', 'what is your refund policy', 'terms-of-use'], ['/en/', 'terms and conditions', 'terms-of-use'], ['/en/', 'privacy policy', 'privacy'], ['/', 'cuánto cuesta la sesión', 'acompanamiento']];
(async () => { const b = await chromium.launch();
  for (const [u, q, exp] of CASES) { const pg = await b.newPage({ viewport: { width: 420, height: 900 } }); const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(BASE + u); await pg.click('.rm-launch'); await pg.fill('.rm-form input[maxlength="400"]', q); await pg.press('.rm-form input[maxlength="400"]', 'Enter'); await pg.waitForTimeout(500);
    const hrefs = await pg.$$eval('.rm-log a', a => a.map(x => x.getAttribute('href')));
    const ok = hrefs.some(h => h.includes(exp)) && !errs.length; if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + u + ' «' + q + '» → ' + (hrefs.slice(-2).join(', ') || 'sin enlaces')); await pg.close(); }
  await b.close(); console.log(fails ? fails + ' FALLOS' : 'TODO OK'); process.exit(fails ? 1 : 0); })();
