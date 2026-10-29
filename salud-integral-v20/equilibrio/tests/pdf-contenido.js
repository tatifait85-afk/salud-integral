// Correspondencia selección ↔ PDF: las tarjetas elegidas (y solo ellas) aparecen en el PDF, en ES y EN; A4; nombre en la portada.
const { chromium } = require('playwright'); const { genPdf, loadPage } = require('./gen-pdf.js'); const fs = require('fs'); const cp = require('child_process');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK    ' : 'FALLA ') + m); if (!c) fails++; };
const norm = s => s.replace(/\s+/g, ' ').replace(/[‐‑–—-]\s/g, '').toLowerCase();
(async () => {
  const b = await chromium.launch(); const p = await loadPage(b);
  const cards = await p.evaluate(() => window.EQ.DATA.CARDS.map(c => ({ id: c.id, area: c.area, es: c.es.t, en: c.en.t })));
  const sel = [cards[0], cards[5], cards[9], cards[14], cards[19], cards[24]];
  for (const lang of ['es', 'en']) {
    const r = await genPdf(p, { lang, name: 'Lucía Prueba', title: '', sel: sel.map(c => c.id) });
    const f = '/tmp/claude-0/pc-' + lang + '.pdf'; fs.writeFileSync(f, Buffer.from(r.b64, 'base64'));
    const out = JSON.parse(cp.execSync(`python3 -I -c "import pypdf,json;r=pypdf.PdfReader('${f}');print(json.dumps({'n':len(r.pages),'sz':[round(float(r.pages[0].mediabox.width)),round(float(r.pages[0].mediabox.height))],'t':[pg.extract_text() for pg in r.pages]}))"`).toString());
    const all = norm(out.t.join(' '));
    ok(out.sz[0] === 595 && out.sz[1] === 842, lang + ': página A4 ' + out.sz.join('x') + ', ' + out.n + ' páginas');
    ok(sel.every(c => all.includes(norm(c[lang]))), lang + ': las ' + sel.length + ' tarjetas elegidas están en el PDF');
    const mapPage = norm(out.t[2]); // página 3 = «Tu mapa»: lista exacta de las tarjetas elegidas
    ok(sel.every(c => mapPage.includes(norm(c[lang]))), lang + ': la página del mapa lista las 6 elegidas');
    const others = cards.filter(c => !sel.includes(c)).filter(c => mapPage.includes(norm(c[lang])));
    ok(others.length === 0, lang + ': ninguna tarjeta no elegida aparece en la página del mapa' + (others.length ? ' → ' + others.map(c => c.id) : ''));
    ok(all.includes('lucía prueba'), lang + ': el nombre aparece');
    ok(!/maria rodriguez/.test(all), lang + ': el nombre de ejemplo «Maria Rodriguez» no queda en el PDF');
    cp.execSync(`pdftoppm -r 45 -png -f 1 -l 3 ${f} /tmp/claude-0/pc-${lang}`);
  }
  await b.close(); console.log(fails ? 'HAY FALLAS: ' + fails : 'TODO OK'); process.exit(fails ? 1 : 0);
})();
