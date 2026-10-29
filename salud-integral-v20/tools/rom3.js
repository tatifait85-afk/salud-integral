const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');const root=process.argv[2];
const mt={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]).replace(/^\/prev/,''));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':mt[path.extname(f)]||'x/y'});fs.createReadStream(f).pipe(r)}).listen(8132,async()=>{
const b=await chromium.launch();
for (const [lang,url,qs] of [['es','alimentacion/index.html',['bajar de peso','cuanto cuesta','que precio tiene el mapa de equilibrio','informe personalizado','recursos disponibles']],['en','en/mindful-eating/index.html',['balance map','how much does it cost']]]){
 for (const q of qs){
  const pg=await b.newPage({viewport:{width:420,height:900}});pg.on('pageerror',e=>console.log('ERR',e.message));
  await pg.goto('http://localhost:8132/prev/sitio/'+url);await pg.waitForTimeout(400);
  await pg.click('.rm-launch');await pg.waitForTimeout(200);
  await pg.fill('.rm-form input[maxlength="400"]',q);await pg.press('.rm-form input[maxlength="400"]','Enter');await pg.waitForTimeout(500);
  const r=await pg.evaluate(()=>[...document.querySelector('.rm-log').children].slice(-3).map(x=>x.className+':'+x.textContent.trim().slice(0,150)+' '+[...x.querySelectorAll('a')].map(a=>a.getAttribute('href')).join('|')));
  console.log(lang,'>',q,'\n ',r.join('\n  '));await pg.close();
 }}
await b.close();srv.close()});
