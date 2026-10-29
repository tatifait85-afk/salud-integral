// Recorre todas las páginas (sitemap + apps) en escritorio y móvil: errores de consola/JS, peticiones fallidas, imágenes rotas, desbordamiento horizontal, menú móvil, buscador.
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const BASE = process.argv[2] || 'http://localhost:8765', DIST = process.argv[3] || path.join(__dirname, '../../dist');
let fails = 0; const bad = m => { console.log('FAIL ' + m); fails++; };
function pages(d, base = '') { let o = []; for (const f of fs.readdirSync(d, { withFileTypes: true })) { if (f.name === 'privado' && !base) continue; if (f.isDirectory()) o = o.concat(pages(path.join(d, f.name), base + '/' + f.name)); else if (f.name === 'index.html') o.push(base + '/'); } return o; }
(async () => {
  const urls = pages(DIST).sort(); const b = await chromium.launch(); let n = 0;
  for (const [vn, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 800 }]]) {
    const ctx = await b.newContext({ viewport: vp }); 
    for (const u of urls) {
      const pg = await ctx.newPage(); const probs = [];
      pg.on('pageerror', e => probs.push('JS: ' + e.message));
      pg.on('console', m => { if (m.type() === 'error' && !/api\/(jardin\/)?estado|favicon/.test(m.text() + m.location().url)) probs.push('consola: ' + m.text().slice(0, 100)); });
      pg.on('response', r => { if (r.status() >= 400 && !/\/api\//.test(r.url())) probs.push(r.status() + ' ' + r.url()); });
      await pg.goto(BASE + u, { waitUntil: 'load' }); await pg.waitForTimeout(250);
      await pg.evaluate(async () => { for (const i of document.querySelectorAll('img[loading=lazy]')) i.loading = 'eager'; await new Promise(r => setTimeout(r, 500)); });
      const r = await pg.evaluate(() => ({
        ov: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        brokenImg: [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.currentSrc).map(i => i.currentSrc.slice(-50)),
        lang: document.documentElement.lang }));
      if (r.ov > 1) probs.push('desbordamiento horizontal ' + r.ov + 'px');
      if (r.brokenImg.length) probs.push('imágenes rotas ' + r.brokenImg);
      if (vn === 'mobile' && await pg.locator('.menu-btn').count()) {
        await pg.click('.menu-btn'); const open = await pg.getAttribute('.menu-btn', 'aria-expanded'); if (open !== 'true') probs.push('menú móvil no abre');
        await pg.keyboard.press('Escape'); if (await pg.getAttribute('.menu-btn', 'aria-expanded') !== 'false') probs.push('Esc no cierra menú');
      }
      n++; if (probs.length) bad(`[${vn}] ${u}: ${probs.join(' | ')}`); await pg.close();
    }
    await ctx.close();
  }
  // buscador (ES y EN)
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  for (const [u, q, exp] of [['/', 'peso', '/bajar-de-peso/'], ['/en/', 'weight', '/en/']]) {
    await pg.goto(BASE + u); await pg.click('.search-btn'); await pg.fill('.sbox input', q); await pg.waitForTimeout(500);
    const hrefs = await pg.$$eval('.sbox-res a', a => a.map(x => x.getAttribute('href')));
    if (!hrefs.length) bad('buscador sin resultados para ' + q + ' en ' + u); else console.log('PASS buscador ' + u + ' "' + q + '" → ' + hrefs.length + ' resultados');
    await pg.keyboard.press('Escape');
  }
  await b.close(); console.log(`${n} cargas de página revisadas · ` + (fails ? fails + ' FALLOS' : 'TODO OK')); process.exit(fails ? 1 : 0);
})();
