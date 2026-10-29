// Genera PDFs de muestra con el mismo código que usa la interfaz. Uso: node gen-pdf.js out.pdf lang name title id1,id2,...
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const root = path.resolve(__dirname, '..');
async function genPdf(page, opts) {
  return page.evaluate(async (o) => { const doc = window.EQ.PDF.crear(o); const bb = await window.EQ.PDF.finalizar(doc); const ab = bb.buffer.slice(bb.byteOffset, bb.byteOffset + bb.byteLength); let s = ''; const u = new Uint8Array(ab); for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return { b64: btoa(s), pages: doc.__eq.pages, warn: doc.__eq.warn }; }, opts);
}
async function loadPage(browser) {
  const page = await browser.newPage();
  page.on('pageerror', e => console.error('PAGEERROR', e.message)); page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await page.setContent('<html><body></body></html>');
  for (const f of ['vendor/jspdf.umd.min.js', 'vendor/pdf-lib.min.js', 'src/equilibrio-assets.js', 'src/equilibrio-datos.js', 'src/equilibrio-iconos.js', 'src/equilibrio-mapa.js', 'src/equilibrio-motor.js', 'src/equilibrio-pdf.js'])
    await page.addScriptTag({ content: fs.readFileSync(path.join(root, f), 'utf8') });
  return page;
}
module.exports = { genPdf, loadPage, root };
if (require.main === module) (async () => {
  const [out, lang, name, title, ids] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await loadPage(b);
  const r = await genPdf(p, { lang, name, title, sel: ids.split(',') });
  fs.writeFileSync(out, Buffer.from(r.b64, 'base64')); console.log(out, 'pages', r.pages, 'warn', JSON.stringify(r.warn)); await b.close();
})();
