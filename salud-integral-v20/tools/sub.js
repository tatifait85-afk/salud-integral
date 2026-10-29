const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');const root=process.argv[2];
const mt={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.woff2':'font/woff2','.ttf':'font/ttf','.jpg':'image/jpeg'};
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]).replace(/^\/prev/,''));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':mt[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(8134,async()=>{
const b=await chromium.launch();
for(const [lang,p,mode] of [['es','sitio/mi-jardin-digestivo/jardin/index.html','ok'],['en','sitio/en/my-digestive-garden/garden/index.html','ok'],['es','sitio/mi-jardin-digestivo/jardin/index.html','fail']]){
 const pg=await b.newPage({viewport:{width:400,height:860}});const reqs=[],errs=[];
 pg.on('pageerror',e=>errs.push(e.message));
 await pg.route('https://api.follow.it/**',r=>{reqs.push(r.request().method()+' '+r.request().url().slice(0,70)+' | '+r.request().postData()+' | '+r.request().headers()['content-type']);mode==='ok'?r.fulfill({status:200,body:'ok'}):r.abort()});
 await pg.goto('http://localhost:8134/prev/'+p);await pg.waitForTimeout(900);
 await pg.evaluate(()=>{[1,2,3,4,5].forEach(n=>S.done[n]=true);S.st5.picks=Object.keys(HAB_BY).slice(0,NHAB);S.screen='final';render(true)});
 await pg.waitForTimeout(300);
 await pg.click('#fsub');await pg.waitForTimeout(200);
 const e1=await pg.textContent('#fsmsg');
 await pg.fill('#fmail','prueba@example.com');await pg.click('#fsub');await pg.waitForTimeout(600);
 const e2=await pg.evaluate(()=>document.getElementById('fsmsg').textContent);
 const name=await pg.evaluate(()=>S.p.name);
 await pg.screenshot({path:`g/sub-${lang}-${mode}.png`});
 console.log(lang,mode,'| invalid:',e1,'| after:',e2,'| reqs:',JSON.stringify(reqs),'| errs:',JSON.stringify(errs));
}
await b.close();srv.close()});
