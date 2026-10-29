// Accesibilidad con axe-core (reglas WCAG 2 A/AA) en todas las páginas. Uso: AXE=/ruta/axe.min.js node tests/e2e/a11y.js
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const BASE = process.argv[2] || 'http://localhost:8765', DIST = path.join(__dirname, '../../dist'), AXE = fs.readFileSync(process.env.AXE, 'utf8');
function pages(d, base = '') { let o = []; for (const f of fs.readdirSync(d, { withFileTypes: true })) { if (f.name === 'privado' && !base) continue; if (f.isDirectory()) o = o.concat(pages(path.join(d, f.name), base + '/' + f.name)); else if (f.name === 'index.html') o.push(base + '/'); } return o; }
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1280, height: 900 } }); let tot = 0; const summary = {};
  for (const u of pages(DIST).sort()) {
    await pg.goto(BASE + u); await pg.waitForTimeout(300); await pg.evaluate(AXE);
    const r = await pg.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } }));
    for (const v of r.violations) { tot++; const k = v.id + ' (' + v.impact + ')'; (summary[k] = summary[k] || []).push(u + ' → ' + v.nodes.slice(0, 2).map(n => n.target.join(' ')).join(' ; ') + (v.nodes.length > 2 ? ' +' + (v.nodes.length - 2) : '')); }
  }
  for (const [k, v] of Object.entries(summary)) { console.log('FAIL ' + k + ' · ' + v.length + ' páginas'); v.slice(0, 4).forEach(x => console.log('     ' + x)); }
  console.log(tot ? tot + ' infracciones' : 'TODO OK'); await b.close(); process.exit(tot ? 1 : 0);
})();
