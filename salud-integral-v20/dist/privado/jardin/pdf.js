'use strict';
/* PDF personalizado (pdf-lib + fontkit, fuentes TTF estáticas). Se arma al tocar el botón. */
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('No se pudo cargar '+src));document.head.appendChild(s)})}
async function pdfLibs(){
  if(!window.PDFLib)await loadScript('vendor/pdf-lib.min.js');
  if(!window.fontkit)await loadScript('vendor/fontkit.umd.min.js');
}
async function buf(u){const r=await fetch(u);if(!r.ok)throw new Error('No se pudo leer '+u);return r.arrayBuffer()}
/* Las fuentes del PDF cubren el alfabeto latino básico (con tildes, ñ, ü, å, ø...). Las letras latinas extendidas se pasan a su forma base. */
const LAT_MAP={'Ł':'L','ł':'l','Đ':'D','đ':'d','ı':'i','Ħ':'H','ħ':'h','ß':'ß'};
function pdfSafeName(n){let out='',lost=false;for(const ch of String(n)){const cp=ch.codePointAt(0);
  if((cp>=32&&cp<=126)||(cp>=160&&cp<=255)){out+=ch;continue}
  const base=LAT_MAP[ch]||ch.normalize('NFD').replace(/[̀-ͯ]/g,'');
  if(base&&[...base].every(c=>{const k=c.codePointAt(0);return k>=32&&k<=255}))out+=base;else lost=true}
  return {text:out.replace(/\s+/g,' ').trim(),lost}}
async function buildPDF(){
  await pdfLibs();
  const {PDFDocument,rgb}=PDFLib,l=S.lang,idx=l==='es'?0:1;
  const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);
  const [fa,fb,fc,cover]=await Promise.all([buf('fonts/pdf-fraunces.ttf'),buf('fonts/pdf-jost.ttf'),buf('fonts/pdf-jost-b.ttf'),buf('img/portada-pdf.jpg')]);
  const SER=await pdf.embedFont(fa,{subset:true}),SAN=await pdf.embedFont(fb,{subset:true}),BLD=await pdf.embedFont(fc,{subset:true});
  const C={forest:rgb(.09,.227,.118),olive:rgb(.37,.45,.094),terra:rgb(.663,.333,.184),ink:rgb(.227,.173,.133),soft:rgb(.353,.29,.243),mint:rgb(.863,.91,.824),cream:rgb(.984,.973,.945),line:rgb(.82,.78,.7),sand:rgb(.84,.78,.65),white:rgb(1,1,1)};
  const W=595,H=842,M=40,CW=W-2*M;
  const name=pdfSafeName((S.p.name||'').trim()).text;
  let page,y,pageNo=0;
  const wrap=(font,size,text,maxW)=>{const out=[];String(text).split('\n').forEach(par=>{let line='';par.split(' ').forEach(w=>{const t=line?line+' '+w:w;if(font.widthOfTextAtSize(t,size)>maxW&&line){out.push(line);line=w}else line=t});out.push(line)});return out};
  const newPage=(title)=>{page=pdf.addPage([W,H]);pageNo++;page.drawRectangle({x:0,y:0,width:W,height:H,color:C.cream});
    page.drawRectangle({x:0,y:H-70,width:W,height:70,color:C.mint});
    page.drawText(title,{x:M,y:H-46,size:24,font:SER,color:C.forest});
    page.drawText('Salud Integral · '+T('Mi Jardín Digestivo','My Digestive Garden'),{x:M,y:22,size:9,font:SAN,color:C.soft});
    page.drawText(String(pageNo),{x:W-M-8,y:22,size:9,font:SAN,color:C.soft});
    y=H-100};
  const need=h=>{if(y-h<50)newPage(T('Mi jardín (continuación)','My garden (continued)'))};
  const text=(t,o={})=>{const size=o.size||11,font=o.font||SAN,w=o.w||CW,x=o.x||M,lh=o.lh||size*1.38;
    wrap(font,size,t,w).forEach(ln=>{need(lh);page.drawText(ln,{x,y:y-size,size,font,color:o.color||C.ink});y-=lh});y-=o.gap===undefined?4:o.gap};
  const h2=t=>{need(40);y-=6;page.drawText(t,{x:M,y:y-16,size:15,font:SER,color:C.forest});y-=26};
  const bullet=(t,o={})=>{const size=o.size||11,lines=wrap(SAN,size,t,CW-16);need(lines.length*size*1.38+4);page.drawCircle({x:M+4,y:y-size*.62,size:2.2,color:C.olive});lines.forEach(ln=>{page.drawText(ln,{x:M+16,y:y-size,size,font:SAN,color:C.ink});y-=size*1.38});y-=3};
  const box=(t,col,o={})=>{const size=11,lines=wrap(SAN,size,t,CW-28),h=lines.length*size*1.38+24;need(h+8);
    page.drawRectangle({x:M,y:y-h,width:CW,height:h,color:col,borderColor:C.line,borderWidth:.8});
    let yy=y-12;lines.forEach(ln=>{page.drawText(ln,{x:M+14,y:yy-size,size,font:SAN,color:C.ink});yy-=size*1.38});y-=h+10};

  /* ---- Portada ---- */
  const img=await pdf.embedJpg(cover);const ih=W*img.height/img.width;
  page=pdf.addPage([W,H]);pageNo++;page.drawImage(img,{x:0,y:(H-ih)/2,width:W,height:ih});
  page.drawRectangle({x:50,y:H-290,width:W-100,height:235,color:C.cream,opacity:.86,borderColor:C.line,borderWidth:.6});
  const ct=(t,f,s,yy,col)=>{const w=f.widthOfTextAtSize(t,s);page.drawText(t,{x:(W-w)/2,y:yy,size:s,font:f,color:col||C.forest})};
  ct('SALUD INTEGRAL',BLD,10,H-84,C.terra);
  ct(T('Mi plan del','My Digestive'),SER,38,H-135);ct(T('Jardín Digestivo','Garden Plan'),SER,38,H-182);
  const sub=wrap(SAN,13,T('Tu guía práctica para una mejor digestión y bienestar','Your practical guide to better digestion and wellbeing'),380);sub.forEach((ln,i)=>ct(ln,SAN,13,H-212-i*17,C.soft));
  const who=name?T('Para '+name,'For '+name):T('Mi jardín','My garden');
  page.drawRectangle({x:50,y:50,width:W-100,height:62,color:C.cream,opacity:.9});
  ct(who,SER,20,82);ct(new Date().toLocaleDateString(l==='es'?'es-CR':'en-US',{year:'numeric',month:'long',day:'numeric'}),SAN,11,60,C.soft);

  /* ---- Mi día ---- */
  newPage(T('Mi día digestivo','My digestive day'));
  const rows=ROWS,answered=rows.filter((_,r)=>ans(r)!==null).length;
  if(!answered)text(T('Dejaste la pizarra vacía. Puedes volver al juego y completarla cuando quieras.','You left the board empty. You can go back to the game and fill it in whenever you like.'));
  else{
    const rh=30;need(rh*7+10);
    rows.forEach((r,ri)=>{const v=ans(ri);page.drawRectangle({x:M,y:y-rh,width:CW,height:rh,color:ri%2?C.cream:C.white,borderColor:C.line,borderWidth:.5});
      page.drawText(r[l],{x:M+8,y:y-rh+11,size:11,font:BLD,color:C.forest});
      if(v!==null){const t=r.o[v][idx],w=SAN.widthOfTextAtSize(t,11),warn=ri===5&&v>0;
        if(warn)page.drawRectangle({x:M+170,y:y-rh+4,width:CW-178,height:rh-8,color:rgb(.984,.929,.894)});
        page.drawText(t,{x:M+178,y:y-rh+11,size:11,font:SAN,color:warn?C.terra:C.ink})}
      y-=rh});
    y-=14;
    text(ans(5)===null?'':(ans(5)>0?T('Anotaste molestias digestivas en este día.','You noted digestive discomfort on this day.'):T('No anotaste molestias en este día.','You did not note any discomfort on this day.')));
    text(T('Esta es una mirada a tu día. Sirve para notar patrones, no para diagnosticar.','This is a look at your day. It helps you notice patterns, not diagnose anything.'),{color:C.soft,size:10});
  }
  h2(T('Señales que conviene consultar','Signs worth talking about'));
  const al=ALARMS.filter(a=>S.st1.alarms[a[0]]);
  if(al.length){text(T('Marcaste estas señales. Te recomendamos hablarlo con un profesional de la salud. Si algo es fuerte o apareció de repente, busca atención médica urgente.','You marked these signs. We recommend talking to a health professional. If something is strong or appeared suddenly, seek urgent medical care.'));al.forEach(a=>bullet(a[1+idx]))}
  else text(T('No marcaste ninguna. Si algún día aparece sangre en las heces, dolor de barriga fuerte, fiebre alta junto con síntomas digestivos, deshidratación o pérdida de peso sin razón clara, consulta a un profesional de la salud.','You did not mark any. If you ever notice blood in your stool, severe belly pain, a high fever with digestive symptoms, dehydration or weight loss without a clear reason, talk to a health professional.'));
  text(T('Basado en información de Mayo Clinic y del NHS (Reino Unido).','Based on information from Mayo Clinic and the NHS (UK).'),{size:9,color:C.soft});

  /* ---- Mi plato ---- */
  newPage(T('Mi plato digestivo','My digestive plate'));
  if(!S.st2.list.length)text(T('Esta vez no armaste un plato. Puedes volver a la cocina del juego cuando quieras.','You did not build a plate this time. You can go back to the kitchen in the game whenever you like.'));
  else{
    S.st2.list.forEach(id=>{const i=ING_BY[id];text(i[l],{font:BLD,color:C.forest,size:12,gap:1});text(i.info[l],{gap:8})});
    const tg=[...new Set(S.st2.list.flatMap(id=>ING_BY[id].n))].map(k=>NUT[k][idx]);
    y-=4;box(T('Cada alimento aporta algo distinto y ninguno lo aporta todo: lo que da uno complementa lo que no da otro. En tu plato aparecen: '+tg.join(', ')+'. No existe un plato perfecto ni un número de alimentos que debas poner en cada comida.','Each food gives something different and none gives everything: what one provides complements what another lacks. Your plate includes: '+tg.join(', ')+'. There is no perfect plate and no number of foods you must put in every meal.'),C.mint);
  }

  /* ---- Fermentos ---- */
  newPage(T('Mis fermentos','My ferments'));
  if(S.cautious)box(T('Marcaste señales que conviene consultar. Habla primero con un profesional de la salud antes de probar o consumir alimentos fermentados.','You marked signs worth talking about. Talk to a health professional first before trying or eating fermented foods.'),rgb(.984,.929,.894));
  const made=Object.keys(S.st3.made).filter(k=>S.st3.made[k]);
  if(!made.length)text(T('Esta vez no hiciste fermentos. Cuando quieras, vuelve al taller del juego.','You did not make any ferments this time. Whenever you like, go back to the workshop in the game.'));
  made.concat(['chucrut','kefir'].filter(k=>!made.includes(k)&&false)).forEach(k=>{const F=FERM[k];h2(F[l]);F.steps.forEach((st,i)=>bullet((i+1)+'. '+st.es[idx]+': '+st.tx[idx]));
    if(k==='chucrut'){const tp=TEMPS.find(x=>x.id===S.st3.made.chucrut);if(tp)text(T('Tu lugar: ','Your spot: ')+tp[l]+'. '+tp.r[idx],{font:BLD})}
    text(T('Qué observar','What to look for'),{font:BLD,color:C.forest,gap:2});OBS[k].forEach(o=>bullet(o[1+idx]+': '+o[3+idx]))});
  text(T('Fuentes: Oregon State University Extension, Washington State University Extension y Utah State University Extension.','Sources: Oregon State University Extension, Washington State University Extension and Utah State University Extension.'),{size:9,color:C.soft});

  /* ---- Lo que descubrí y Mi plan ---- */
  newPage(T('Lo que descubrí','What I discovered'));
  h2(T('Suelo e intestino','Soil and gut'));
  text(T('En el suelo, las raíces, los hongos y las lombrices trabajan juntos para descomponer materia y alimentar a las plantas. En el intestino, billones de microbios, la microbiota, ayudan a descomponer la fibra de los alimentos. En ambos lugares, los microorganismos descomponen lo que reciben y lo vuelven útil para quien vive de ello.','In the soil, roots, fungi and earthworms work together to break down matter and feed plants. In the gut, trillions of microbes, the microbiota, help break down the fiber in food. In both places, microorganisms break down what they receive and make it useful for those who live from it.'));
  h2(T('Los microbios que conocí','The microbes I met'));
  TX.micro.forEach(m=>bullet(m[idx][0]+': '+m[idx][1]));
  h2(T('Mi plan','My plan'));
  const picks=S.st5.picks;
  if(picks.length)picks.forEach(id=>{const h=HAB_BY[id];text(h[l],{font:BLD,color:C.forest,size:12,gap:1});text(T('Mi acción: ','My action: ')+habAction(h),{gap:1});text(T('Cuándo empiezo: ','When I start: ')+(whenLabel(id)?whenLabel(id).toLowerCase()+'. ':'')+h.c[l],{color:C.soft,gap:8})});
  else bullet(T('Todavía no elegiste hábitos. Puedes volver a la estación 5 cuando quieras.','You have not chosen habits yet. You can go back to station 5 whenever you like.'),{size:12});
  y-=8;box(T('Este documento es educativo y personal. No es un diagnóstico ni reemplaza la consulta con un profesional de la salud.','This document is educational and personal. It is not a diagnosis and does not replace a visit with a health professional.'),C.mint);
  pdf.setTitle(T('Mi plan del Jardín Digestivo','My Digestive Garden Plan')+(name?' – '+name:''));pdf.setAuthor('Salud Integral');
  return pdf.save();
}
window.__buildPDF=buildPDF;
/* ====== Pantalla final: nombre, suscripción opcional al blog y creación del PDF ====== */
const BLOG_URL='https://blog.saludintegral.site/';
/* Suscripción al blog sin salir del juego: mismo formulario de follow.it que el blog (ES y EN son listas distintas). */
const FOLLOW={es:'https://api.follow.it/subscription-form/VnpmV0M5Z1JHNUJIQnY5ZTY2d0NwU3phejh2Si8yZmtpbTFCcWhGVFpZcktrTDB5TEVXYVlYMFNYNVFQNWtuWDgvaTM2blF6SklMcTFFamRUVEVLS0xoeWR0azZDTEsydjk5YTR2bzY0QVNRd2VLTlFSNVhkQTNiNHA1RUlXdWx8V1lIQ0VIbHAwNFRZMjVRMnFKZXhDa2hjQndBVUx6aWlvUDN5eE1mVDVvRT0=/8',en:'https://api.follow.it/subscription-form/dGxGMEhmWFJqNVhocm1mc3hzQm8yZXpRalN3VnpuRXhDUVk3RmJGcEs0cHFURkdEZTE3TnI3blkxdlVZZmRiVzRvZUhSRzRNRTRneE1VdG9lNkdxaVErSXR0NHlIQS9zNjdwdTdqM25wUU1VLzRuOS8rbk9keUpiS0x5VXBpMzR8K2hmazdTRkx2YUN5a2NQRDc1dkE0V3N4dDhZY1EvOGZFaTJHUWVQT1dETT0=/8'};
const subS=()=>S.sub||(S.sub={email:'',st:'',msg:''});
const MAILRX=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/* S.pdf (el PDF ya generado) se conserva durante toda la sesión, incluso con «Empezar de nuevo»: un solo PDF final por sesión. */
RESET.push(()=>{S.ferr=''});
const pdfReady=()=>!!S.pdf;
function vFinal(){
  const l=S.lang,ready=pdfReady(),busy=!!S.pdfBusy;
  const done=ready?`<div class="gcard fdone" id="fdone" role="status"><p style="margin:0"><b>${T('¡Tu PDF está listo!','Your PDF is ready!')}</b> ${T('Pulsa el botón para guardarlo en tu dispositivo.','Tap the button to save it on your device.')}</p><button class="btn terra" data-act="dlpdf">${T('Descargar mi PDF','Download my PDF')}</button></div>`:'';
  return {stage:`<div class="scene fin" style="max-width:640px"><div><div class="kick">${T('¡Tu jardín está completo!','Your garden is complete!')}</div><h2>${T('Personaliza tu plan','Personalize your plan')}</h2></div>
    <div class="fform"><label class="fq" for="fname">${T('¿Cómo te llamas?','What’s your first name?')}</label>
    <p class="lead" id="fhelp" style="margin:0">${T('Escribe tu primer nombre para personalizar tu PDF del Jardín Digestivo','Enter your first name to personalize your Digestive Garden PDF')}</p>
    <input id="fname" type="text" maxlength="40" autocomplete="given-name" enterkeyhint="done" placeholder="${T('Tu primer nombre','Your first name')}" value="${esc(ready?S.pdf.name:(S.p.name||''))}"${ready?' readonly':''} aria-describedby="fhelp ferr"${S.ferr?' aria-invalid="true"':''}>
    <div class="ferr" id="ferr" role="alert">${esc(S.ferr||'')}</div></div>
    <div class="gcard fsub"><p style="margin:0"><b>${T('Recibir artículos por email · gratis','Get new posts by email · free')}</b><br>${T('¿Quieres recibir novedades sobre salud digestiva y hábitos saludables?','Would you like to receive updates about digestive health and healthy habits?')}</p>
    ${subS().st==='ok'?`<div class="fsmsg ok" id="fsmsg" role="status">${esc(subS().msg)}</div>`:`<div class="fsrow"><label class="sr" for="fmail">${T('Tu correo electrónico','Your email address')}</label><input id="fmail" type="email" inputmode="email" autocomplete="email" enterkeyhint="send" maxlength="120" spellcheck="false" placeholder="${T('Tu email','Enter your email')}" value="${esc(subS().email)}" aria-describedby="fsmsg"><button class="btn ghost" id="fsub" type="button" data-act="subscribe"${subS().st==='busy'?' disabled':''}>${subS().st==='busy'?T('Enviando…','Sending…'):T('Suscribirme','Subscribe')}</button></div>
    <div class="fsmsg${subS().st==='err'?' err':''}" id="fsmsg" role="status">${esc(subS().msg)}</div>`}
    <p class="fsnote">${T('Tu correo se usa solo para suscribirte al blog (lo gestiona follow.it). Tus respuestas del jardín no se envían a ningún lado.','Your email is used only to subscribe you to the blog (managed by follow.it). Your garden answers are not sent anywhere.')}</p></div>
    <button class="btn primary fbtn" id="fmk" data-act="mkpdf" ${busy?'disabled':''}${ready?' hidden':''}>${busy?T('Preparando tu PDF…','Preparing your PDF…'):T('Crear mi PDF','Create my PDF')}</button>${done}</div>`,
    bro:S.note||T('Solo necesito tu primer nombre. Suscribirte al blog es opcional.','I only need your first name. Subscribing to the blog is optional.'),shake:S.shake};
}
VIEW.final=vFinal;
ACT.final=()=>{S.at=5;S.note=null;S.ferr='';go('final')};
document.addEventListener('input',e=>{if(e.target&&e.target.id==='fname'&&!S.pdf){S.p.name=e.target.value;const er=document.getElementById('ferr');if(er&&S.ferr){S.ferr='';er.textContent='';e.target.removeAttribute('aria-invalid')}const d=document.getElementById('fdone');if(d&&!pdfReady()){d.remove();const m=document.getElementById('fmk');if(m)m.hidden=false}}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&e.target.id==='fname'){e.preventDefault();ACT.mkpdf()}if(e.key==='Enter'&&e.target&&e.target.id==='fmail'){e.preventDefault();ACT.subscribe()}});
document.addEventListener('input',e=>{if(e.target&&e.target.id==='fmail'){const s=subS();s.email=e.target.value;if(s.st==='err'){s.st='';s.msg='';const m=document.getElementById('fsmsg');if(m){m.textContent='';m.classList.remove('err')}}}});
ACT.subscribe=async()=>{
  const s=subS();if(s.st==='busy'||s.st==='ok')return;
  const inp=document.getElementById('fmail');if(inp)s.email=inp.value;
  const email=(s.email||'').trim();
  if(!MAILRX.test(email)){s.st='err';s.msg=T('Escribe un correo válido, por ejemplo nombre@correo.com.','Enter a valid email, for example name@mail.com.');render(true);const i=document.getElementById('fmail');if(i)i.focus();return}
  s.email=email;s.st='busy';s.msg='';render(true);
  try{
    await fetch(FOLLOW[S.lang==='en'?'en':'es'],{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'email='+encodeURIComponent(email)});
    /* mode:'no-cors' devuelve una respuesta opaca: no podemos confirmar que follow.it aceptó la solicitud. Mensaje honesto, sin prometer envío. */
    s.st='ok';s.msg=T('Solicitud enviada. Revisa tu correo en unos minutos (y la carpeta de spam): follow.it enviará un mensaje para confirmar tu suscripción. Si no llega, inténtalo de nuevo con otro correo.','Request sent. Check your inbox in a few minutes (and your spam folder): follow.it will send a message to confirm your subscription. If it does not arrive, try again with another address.');
  }catch(err){
    s.st='err';s.msg=T('No pude enviar tu suscripción. Revisa tu conexión e inténtalo de nuevo.','I could not send your subscription. Check your connection and try again.');
  }
  render(true);
};
function pdfName(){return (S.p.name||'').replace(/\s+/g,' ').trim()}
ACT.mkpdf=async()=>{
  if(S.pdf||S.pdfBusy)return;   /* ya generado, o generándose: no se crea otro */
  if(nextStation()!==0||S.st5.picks.length!==NHAB){S.ferr=T('Termina las cinco estaciones y elige tus tres hábitos antes de crear tu PDF.','Finish the five stations and choose your three habits before creating your PDF.');S.shake=true;render(true);return}
  const inp=document.getElementById('fname'),name=pdfName();
  if(inp)S.p.name=inp.value;
  if(name&&/\p{L}/u.test(name)&&!pdfSafeName(name).text){
    S.ferr=T('Por ahora el PDF solo puede mostrar letras del alfabeto latino. Escribe tu primer nombre con esas letras.','For now the PDF can only show Latin-alphabet letters. Please write your first name using those letters.');S.shake=true;S.pdf=null;render(true);
    const i3=document.getElementById('fname');if(i3)i3.focus();return}
  if(!name||!/\p{L}/u.test(name)){
    S.ferr=T('Escribe tu primer nombre para crear tu PDF.','Enter your first name to create your PDF.');S.shake=true;S.pdf=null;render(true);
    const i2=document.getElementById('fname');if(i2)i2.focus();return}
  S.p.name=name;S.ferr='';S.pdfBusy=true;S.pdf=null;render(true);
  try{const bytes=await buildPDF();S.pdf={bytes,name,lang:S.lang};S.note=T('¡Listo! Tu PDF fue creado. Pulsa «Descargar mi PDF».','Done! Your PDF was created. Tap “Download my PDF”.')}
  catch(e){console.error(e);S.pdf=null;S.note=T('No pude crear el PDF. Revisa tu conexión e intenta de nuevo.','I could not create the PDF. Check your connection and try again.')}
  S.pdfBusy=false;render(true);
  const d=document.getElementById('fdone');if(d&&d.scrollIntoView)d.scrollIntoView({block:'nearest'});
};
ACT.dlpdf=async()=>{
  if(!pdfReady())return;
  const slug=S.pdf.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const fn='mi-jardin-digestivo'+(slug?'-'+slug:'')+'.pdf';
  try{
    let dl=null;try{dl=window.claude&&claude.use?await claude.use('downloads'):null}catch(e){}
    if(dl){await dl.save({filename:fn,data:S.pdf.bytes})}
    else{const u=URL.createObjectURL(new Blob([S.pdf.bytes],{type:'application/pdf'})),a=document.createElement('a');a.href=u;a.download=fn;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)}
    S.note=T('¡Listo! Tu PDF está guardado.','Done! Your PDF is saved.');
  }catch(e){S.note=(e&&e.code==='declined')?T('Cancelaste la descarga. Puedes volver a intentarlo.','You cancelled the download. You can try again.'):T('No pude descargar el PDF. Intenta de nuevo.','I could not download the PDF. Please try again.');console.error(e)}
  render(true);
};
