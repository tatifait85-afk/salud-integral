// Prueba de estrés: muchas combinaciones de tarjetas en ES y EN. Verifica páginas (13–16), desbordes y errores.
const { chromium } = require('playwright'); const { genPdf, loadPage } = require('./gen-pdf.js');
function rng(seed) { let s = seed; return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; }
(async () => {
  const b = await chromium.launch(); const p = await loadPage(b);
  const ids = await p.evaluate(() => window.EQ.DATA.CARDS.map(c => c.id));
  const byArea = await p.evaluate(() => { const o = {}; window.EQ.DATA.CARDS.forEach(c => (o[c.area] = o[c.area] || []).push(c.id)); return o; });
  const cases = [];
  cases.push({ n: 'una tarjeta', sel: [ids[0]] });
  cases.push({ n: 'una por área', sel: Object.values(byArea).map(a => a[0]) });
  cases.push({ n: 'todas', sel: ids });
  cases.push({ n: 'solo un área completa', sel: byArea.joy });
  cases.push({ n: 'dos tarjetas', sel: [ids[3], ids[20]] });
  const r = rng(7);
  for (let i = 0; i < 40; i++) { const k = 1 + Math.floor(r() * 25); const s = ids.slice().sort(() => r() - 0.5).slice(0, k); cases.push({ n: 'azar ' + i + ' (' + k + ')', sel: s }); }
  const names = ['', 'Ana', 'María Fernanda de los Ángeles Quesada-Villalobos Rodríguez', 'Isabel Hübner-Ñandú'];
  let bad = 0, hist = {};
  for (const lang of ['es', 'en']) for (const [i, c] of cases.entries()) {
    const name = names[i % names.length], title = i % 3 === 0 ? 'Mi mapa de primavera con un título bastante largo para probar' : '';
    try {
      const res = await genPdf(p, { lang, name, title, sel: c.sel });
      hist[res.pages] = (hist[res.pages] || 0) + 1;
      if (res.warn.length || res.pages < 13 || res.pages > 16) { bad++; console.log('PROBLEMA', lang, c.n, 'pages', res.pages, JSON.stringify(res.warn)); }
    } catch (e) { bad++; console.log('ERROR', lang, c.n, e.message); }
  }
  // sin tarjetas debe fallar de forma controlada
  const err = await p.evaluate(() => { try { window.EQ.PDF.crear({ lang: 'es', sel: [] }); return 'no falló'; } catch (e) { return e.message; } });
  console.log('casos:', cases.length * 2, 'problemas:', bad, 'páginas:', JSON.stringify(hist), '| sin tarjetas ->', err);
  await b.close();
})();
