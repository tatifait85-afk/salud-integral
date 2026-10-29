const {chromium}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path'),url=require('url');
const root=process.argv[2];
const mt={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2','.ico':'image/x-icon'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(url.parse(q.url).pathname);p=p.replace(/^\/prev/,'');const f=path.join(root,p);
 if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('nf')}
 r.writeHead(200,{'content-type':mt[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(8123,async()=>{
 const b=await chromium.launch();const pg=await b.newPage();
 const pages=[];(function w(d){for(const e of fs.readdirSync(d)){const f=path.join(d,e);if(fs.statSync(f).isDirectory())w(f);else if(e==='index.html')pages.push(path.relative(root,f))}})(root);
 const missingLinks=new Set();
 for(const p of pages.sort()){
  const bad=[],errs=[];
  pg.removeAllListeners();
  pg.on('response',r=>{if(r.status()>=400&&r.url().includes('8123'))bad.push(r.status()+' '+r.url().replace('http://localhost:8123/prev/',''))});
  pg.on('requestfailed',r=>{if(r.url().includes('8123'))bad.push('FAIL '+r.url())});
  pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('http://localhost:8123/prev/'+p,{waitUntil:'load'});await pg.waitForTimeout(600);
  // open Romero launcher to exercise JS paths
  const li=await pg.$$eval('a[href]',as=>as.map(a=>a.href).filter(h=>h.startsWith('http://localhost:8123')));
  for(const h of new Set(li)){const rel=h.replace('http://localhost:8123/prev/','').split('#')[0].split('?')[0];if(!fs.existsSync(path.join(root,rel))||fs.statSync(path.join(root,rel)).isDirectory())missingLinks.add(p+' -> '+rel)}
  const imgs=await pg.$$eval('img',is=>is.filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src));
  console.log(p,'| requests bad:',JSON.stringify(bad),'| js errors:',JSON.stringify(errs),'| broken imgs:',JSON.stringify(imgs));
 }
 console.log('MISSING LINK TARGETS:');[...missingLinks].sort().forEach(x=>console.log('  '+x));
 await b.close();srv.close();});
