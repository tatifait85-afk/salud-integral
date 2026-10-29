'use strict';
/* Estación 3: El taller de fermentos (flujo original). La explicación de cada paso aparece junto al círculo. Datos de extensión universitaria (NCHFP/Oregon State/Washington State) y USU. */
S.st3={phase:'pick',pick:null,step:0,temp:null,made:{}};
RESET.push(()=>{S.st3={phase:'pick',pick:null,step:0,temp:null,made:{}}});
ENTER[3]=()=>{S.st3.phase=S.cautious?'warn':'pick';S.st3.pick=null;S.st3.step=0;S.note=null};
const FERM={
 chucrut:{es:'Chucrut casero',en:'Homemade sauerkraut',sign:[80,17],jar:[73,55],
  steps:[
   {at:[84,62],es:['Corta el repollo','Cut the cabbage'],tx:['Pica el repollo en tiras finas. Puedes sumar zanahoria rallada.','Shred the cabbage into thin strips. You can add grated carrot.']},
   {at:[61.5,64],es:['Agrega la sal','Add the salt'],tx:['Mezcla 3 cucharadas de sal por cada 2,3 kg (5 libras) de repollo. Usa sal para encurtidos o conservas, sin yodo y sin aditivos.','Mix 3 tablespoons of salt for every 2.3 kg (5 pounds) of cabbage. Use pickling or canning salt, without iodine or additives.']},
   {at:[73,56],es:['Llena el frasco','Fill the jar'],tx:['Empaca el repollo firme en el frasco hasta que el jugo lo cubra.','Pack the cabbage firmly into the jar until the juice covers it.']},
   {at:[73,52],es:['Que quede cubierto','Keep it covered'],tx:['Todo el repollo debe quedar bajo el jugo. Lo que queda al aire se echa a perder.','All the cabbage must stay under the juice. Anything left in the air spoils.']},
   {at:[73,43],es:['Tapa y espera','Cover and wait'],tx:['Tapa el frasco y déjalo en un lugar templado. Ahora elige qué tan templado es tu lugar.','Cover the jar and leave it somewhere mild. Now choose how warm your spot is.']}]},
 kefir:{es:'Kéfir de leche',en:'Milk kefir',sign:[39,19],jar:[34.5,56],
  steps:[
   {at:[52.5,60],es:['Pon la leche','Add the milk'],tx:['Vierte 1 litro (1 cuarto de galón) de leche entera en un frasco limpio.','Pour 1 liter (1 quart) of whole milk into a clean jar.']},
   {at:[45.5,60],es:['Agrega el kéfir','Add the kefir'],tx:['Agrega ¼ de taza de kéfir de una tanda anterior, o un iniciador (starter) de kéfir. Mezcla bien.','Add ¼ cup of kefir from a previous batch, or a kefir starter culture. Mix well.']},
   {at:[34.5,55],es:['Tapa con tela','Cover with cloth'],tx:['Cubre el frasco con una tela limpia y átala con una cuerda.','Cover the jar with a clean cloth and tie it with string.']},
   {at:[34.5,52],es:['Déjalo templado','Keep it warm'],tx:['Déjalo en un lugar templado, cerca de 27 °C (80 °F), hasta que espese y huela ácido y limpio.','Leave it somewhere warm, around 27 °C (80 °F), until it thickens and smells clean and sour.']}]}
};
const TEMPS=[
 {id:'lt15',es:'Menos de 15 °C (60 °F)',en:'Under 15 °C (60 °F)',r:['Por debajo de 60 °F el chucrut no fermenta. Busca un lugar más templado.','Below 60 °F sauerkraut will not ferment. Find a warmer spot.']},
 {id:'15',es:'De 15 a 18 °C (60 a 65 °F)',en:'15 to 18 °C (60 to 65 °F)',r:['Puede tardar de 5 a 6 semanas. Prueba para decidir cuándo está listo.','It can take 5 to 6 weeks. Taste it to decide when it is ready.']},
 {id:'mid',es:'De 18 a 21 °C (65 a 70 °F)',en:'18 to 21 °C (65 to 70 °F)',r:['Quedas entre los dos tiempos: calcula de 3 a 6 semanas. Prueba para decidir.','You are between the two times: expect 3 to 6 weeks. Taste it to decide.']},
 {id:'21',es:'De 21 a 24 °C (70 a 75 °F)',en:'21 to 24 °C (70 to 75 °F)',r:['Es el rango recomendado: lista en unas 3 a 4 semanas. Prueba para decidir.','This is the recommended range: ready in about 3 to 4 weeks. Taste it to decide.']},
 {id:'gt24',es:'Más de 24 °C (75 °F)',en:'Over 24 °C (75 °F)',r:['Hay más riesgo de moho y de que quede blando o viscoso. Busca un lugar más fresco.','There is more risk of mold and of a soft or slimy result. Find a cooler spot.']}];
const OBS={
 chucrut:[['sk','Espuma blanca arriba','White scum on top','Quítala con una cuchara. Es común.','Skim it off with a spoon. It is common.'],
  ['ok','Olor fuerte la primera semana','Strong smell in the first week','Es normal y se pasa. No lo botes solo por eso.','It is normal and fades. Do not throw it out just for that.'],
  ['no','Moho','Mold','Ante la duda, deséchalo.','When in doubt, throw it out.'],
  ['no','Viscoso, blando o con olor a podrido','Slimy, soft or rotten smell','Desecha todo el frasco.','Throw out the whole jar.']],
 kefir:[['ok','Espesa y huele ácido y limpio','Thickens and smells clean and sour','Es la señal de que está listo.','That is the sign it is ready.'],
  ['no','Moho en la superficie','Mold on the surface','No lo consumas. Desecha.','Do not consume it. Throw it out.'],
  ['no','Olor desagradable o raro','Unpleasant or strange smell','No lo consumas. Desecha.','Do not consume it. Throw it out.']]
};
const TAGL={ok:['Sigue','Keep going'],sk:['Quitar','Remove'],no:['Desechar','Discard']};
function howto(txt){return `<div class="howto"><span class="dot">☝</span><span>${txt}</span></div>`}
function sceneImg(){return 'img/taller-'+S.lang+'.webp'}
function vSt3(){
  const s=S.st3,ph=s.phase,l=S.lang,idx=l==='es'?0:1;
  if(ph==='warn')return {stage:`<div class="scene" style="max-width:640px"><div><div class="kick">${T('Estación 3','Station 3')}</div><h2>${T('Antes de fermentar','Before fermenting')}</h2></div>${pic(sceneImg(),'',T('Taller de fermentos','Fermentation workshop'))}<div class="care"><p style="margin:0;font-size:1.1rem">${T('Marcaste señales que conviene consultar. Habla primero con un profesional de la salud antes de probar o consumir alimentos fermentados. Aquí puedes mirar el taller y aprender cómo se hacen.','You marked signs worth talking about. Talk to a health professional first before trying or eating fermented foods. Here you can look around the workshop and learn how they are made.')}</p></div></div>`,
    bro:T('Puedes recorrer el taller con calma.','You can walk through the workshop at your own pace.'),actions:`<button class="btn primary" data-act="st3ok">${T('Entiendo, ver el taller','I understand, see the workshop')}</button>`};
  if(ph==='pick'){
    const made=s.made,btn=k=>`<button class="btn half ${made[k]?'ghost':'primary'}" data-act="st3pick" data-k="${k}">${made[k]?'✓ ':''}${FERM[k][l]}</button>`;
    const any=made.chucrut||made.kefir;
    const rings=['kefir','chucrut'].map(k=>`<button class="ring" style="left:${FERM[k].jar[0]}%;top:${FERM[k].jar[1]}%" data-act="st3pick" data-k="${k}" aria-label="${FERM[k][l]}"></button>`).join('');
    return {stage:`<div class="scene s3" style="max-width:880px"><div><div class="kick">${T('Estación 3','Station 3')}</div><h2>${T('¿Qué fermento quieres hacer?','Which ferment do you want to make?')}</h2></div>${howto(T('Toca los círculos para explorar el kéfir de leche y el chucrut.','Tap the circles to explore milk kefir and sauerkraut.'))}${pic(sceneImg(),rings,T('Taller de fermentos: kéfir de leche y chucrut casero','Fermentation workshop: milk kefir and homemade sauerkraut'))}</div>`,
      bro:any?T('¡Bien! Puedes hacer el otro fermento o terminar el taller.','Well done! You can make the other ferment or finish the workshop.'):T('Toca un cartel para empezar.','Tap a sign to start.'),
      actions:(any?`<button class="btn terra wide" data-act="st3end">${T('Terminar el taller','Finish the workshop')}</button>`:'')+btn('kefir')+btn('chucrut')};
  }
  const F=FERM[s.pick];
  if(ph==='steps'){
    const st=F.steps[s.step],n=F.steps.length,x=st.at[0],y=st.at[1],right=x<50;
    const ring=`<button class="ring" style="left:${x}%;top:${y}%" data-act="st3next" aria-label="${st.es[idx]}"></button>`;
    const dots=`<span class="dots2">${F.steps.map((_,k)=>`<i class="${k<=s.step?'on':''}"></i>`).join('')}</span>`;
    const co=`<div class="stepco ${right?'r':'l'}" role="status" style="top:${Math.max(3,Math.min(y-14,56))}%;${right?`left:${Math.min(x+8,56)}%`:`right:${Math.min(100-x+8,56)}%`}"><div class="cok">${T('Paso','Step')} ${s.step+1} ${T('de','of')} ${n}</div><b>${st.es[idx]}</b><p>${st.tx[idx]}</p>${dots}</div>`;
    return {stage:`<div class="scene s3" style="max-width:880px"><div><div class="kick">${F[l]}</div></div>${howto(T('Toca el círculo brillante para seguir con el siguiente paso.','Tap the glowing circle to go to the next step.'))}<div class="pic"><div class="pw"><img class="bgi" src="${sceneImg()}" alt="${F[l]}">${ring}</div>${co}</div></div>`,
      bro:T('Toca el círculo brillante o el botón.','Tap the glowing circle or the button.'),
      actions:(s.step>0?`<button class="btn ghost" data-act="st3prev" aria-label="${T('Paso anterior','Previous step')}">←</button>`:`<button class="btn ghost" data-act="st3back" aria-label="${T('Volver','Back')}">←</button>`)+`<button class="btn primary" data-act="st3next">${s.step===n-1?T('Hecho, seguir','Done, continue'):T('Hecho','Done')}</button>`};
  }
  if(ph==='temp'){
    const sel=TEMPS.find(x=>x.id===s.temp);
    return {stage:`<div class="scene" style="max-width:640px"><div><div class="kick">${F[l]}</div><h2>${T('¿Qué tan templado es tu lugar?','How warm is your spot?')}</h2></div><div class="tchoice">${TEMPS.map(x=>`<button class="tc" data-act="st3temp" data-id="${x.id}" aria-pressed="${s.temp===x.id}">${x[l]}</button>`).join('')}</div>${sel?`<div class="gcard"><p style="margin:0;font-size:1.1rem">${sel.r[idx]}</p></div>`:''}<p class="note" style="margin:0">${T('Fuentes: Oregon State University Extension y Washington State University Extension.','Sources: Oregon State University Extension and Washington State University Extension.')}</p></div>`,
      bro:T('Elige el rango que más se parezca a tu cocina.','Choose the range closest to your kitchen.'),actions:`<button class="btn primary" data-act="st3check">${T('Continuar','Continue')}</button>`};
  }
  /* check */
  return {stage:`<div class="scene" style="max-width:720px"><div><div class="kick">${F[l]}</div><h2>${T('Qué observar en tu frasco','What to look for in your jar')}</h2></div>${OBS[s.pick].map(o=>`<div class="obs"><span class="tag ${o[0]}">${TAGL[o[0]][idx]}</span><div><b>${o[1+idx]}</b>${o[3+idx]}</div></div>`).join('')}${s.pick==='chucrut'?`<p class="note" style="margin:0">${T('Con el tiempo el repollo puede cambiar de color o sabor. Prueba para decidir cuándo está a tu gusto.','Over time the cabbage may change color or flavor. Taste it to decide when it is to your liking.')}</p>`:''}${S.cautious?`<div class="care"><p style="margin:0">${T('Recuerda: habla con un profesional de la salud antes de consumir fermentados.','Remember: talk to a health professional before eating fermented foods.')}</p></div>`:''}</div>`,
    bro:T('Si algo te hace dudar, no lo consumas.','If anything makes you doubt, do not eat it.'),actions:`<button class="btn primary" data-act="st3done">${T('Listo, guardar este fermento','Done, save this ferment')}</button>`};
}
VIEW.st3=vSt3;
ACT.st3ok=()=>{S.st3.phase='pick';render()};
ACT.st3pick=b=>{const s=S.st3;s.pick=b.dataset.k;s.step=0;s.temp=null;s.phase='steps';render()};
ACT.st3next=()=>{const s=S.st3,F=FERM[s.pick];if(s.step<F.steps.length-1){s.step++;render(true)}else{s.phase=s.pick==='chucrut'?'temp':'check';render()}};
ACT.st3prev=()=>{S.st3.step--;render(true)};
ACT.st3back=()=>{S.st3.phase='pick';render()};
ACT.st3temp=b=>{S.st3.temp=b.dataset.id;render(true)};
ACT.st3check=()=>{S.st3.phase='check';render()};
ACT.st3done=()=>{const s=S.st3;s.made[s.pick]=s.pick==='chucrut'?(s.temp||true):true;s.phase='pick';render()};
ACT.st3end=()=>finish(3);
