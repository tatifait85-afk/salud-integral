const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');const root=process.argv[2],out=process.argv[3];
const mt={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.woff2':'font/woff2','.ttf':'font/ttf','.jpg':'image/jpeg'};
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]).replace(/^\/prev/,''));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':mt[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(8128,async()=>{
const b=await chromium.launch();
for(const [lang,p] of [['es','sitio/mi-jardin-digestivo/jardin/index.html'],['en','sitio/en/my-digestive-garden/garden/index.html']]){
 const pg=await b.newPage({viewport:{width:420,height:860}});const bad=[],errs=[];
 pg.on('response',r=>{if(r.status()>=400)bad.push(r.status()+' '+r.url())});pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text())});
 await pg.goto('http://localhost:8128/prev/'+p);await pg.waitForTimeout(1200);
 console.log(lang,'initial S.lang =',await pg.evaluate(()=>S.lang),'| title:',await pg.title());
 await pg.screenshot({path:`${out}/map-${lang}.png`});
 // jugar estación 1 con clics reales: abrir estación y ver pantalla
 await pg.click('button.zone.next');await pg.waitForTimeout(700);await pg.screenshot({path:`${out}/st1-${lang}.png`});
 // estado completo + PDF
 const res=await pg.evaluate(async()=>{
   [1,2,3,4,5].forEach(n=>S.done[n]=true);
   const ids=Object.keys(HAB_BY).slice(0,NHAB);S.st5.picks=ids;
   try{S.st2.list=Object.keys(ING_BY).slice(0,2)}catch(e){}
   S.screen='final';render(true);
   const inp=document.getElementById('fname');inp.value='Tatiana';S.p.name='Tatiana';
   await ACT.mkpdf();
   return S.pdf?{ok:true,len:S.pdf.bytes.length}:{ok:false,note:S.note};
 });
 console.log(lang,'PDF:',JSON.stringify(res));
 if(res.ok){const bytes=await pg.evaluate(()=>Array.from(S.pdf.bytes));fs.writeFileSync(`${out}/jardin-${lang}.pdf`,Buffer.from(bytes))}
 await pg.screenshot({path:`${out}/final-${lang}.png`});
 console.log(lang,'bad:',JSON.stringify(bad),'errs:',JSON.stringify(errs));
}
await b.close();srv.close()});
