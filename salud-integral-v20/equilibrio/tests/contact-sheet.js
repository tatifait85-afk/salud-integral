const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  global.window = global; global.EQ = undefined;
  const src = fs.readFileSync('src/equilibrio-iconos.js', 'utf8');
  const sandbox = {}; new Function('globalThis', src.replace(/typeof window !== "undefined" \? window : globalThis/, 'globalThis'))(sandbox);
  const I = sandbox.EQ.ICONS;
  let cells = '';
  Object.keys(I.defs).forEach(id => { cells += `<div style="text-align:center;font:11px sans-serif;color:#1F4D34;width:110px"><div style="color:#1F4D34">${I.svg(id,{size:72,sw:1.2})}</div>${id}</div>`; });
  // sprig
  const sp = I.sprig(120, 6);
  const sprigSvg = `<svg width="260" height="120" viewBox="-10 -60 140 80"><path d="${I.toD(sp.stem)}" fill="none" stroke="#5F7F3C" stroke-width="1"/>${sp.leaves.map(l=>`<path d="${I.toD(l)}" fill="#A8C08A" stroke="#5F7F3C" stroke-width=".6"/>`).join('')}</svg>`;
  const html = `<body style="background:#FBF7EA;margin:20px"><div style="display:flex;flex-wrap:wrap;gap:14px;width:900px">${cells}</div>${sprigSvg}</body>`;
  const b = await chromium.launch(); const p = await b.newPage({viewport:{width:980,height:760}});
  await p.setContent(html); await p.screenshot({path:'tests/contact-sheet.png', fullPage:true}); await b.close();
})();
