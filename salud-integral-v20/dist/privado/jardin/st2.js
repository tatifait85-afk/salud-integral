'use strict';
/* Estación 2: Mi plato digestivo. Un solo plato; de uno a tres alimentos entre seis opciones. */
const MAXF=3;
const NUT={fib:['fibra','fiber'],pro:['proteína','protein'],fat:['grasas','fats'],vit:['vitaminas y minerales','vitamins and minerals'],plant:['compuestos vegetales','plant compounds'],carb:['carbohidratos (energía)','carbohydrates (energy)']};
const ING=[
 {id:'verduras',es:'Verduras frescas',en:'Fresh vegetables',n:['fib','vit'],
  info:{es:'Aportan fibra, agua, vitaminas y minerales. Cada color suele traer compuestos vegetales distintos.',en:'They provide fiber, water, vitamins and minerals. Each color usually brings different plant compounds.'}},
 {id:'frutas',es:'Frutas tropicales',en:'Tropical fruit',n:['fib','vit'],
  info:{es:'Aportan fibra, agua, vitamina C y azúcares naturales. Cada fruta ofrece algo distinto.',en:'They provide fiber, water, vitamin C and natural sugars. Each fruit offers something different.'}},
 {id:'frutosrojos',es:'Frutos rojos',en:'Berries',n:['fib','vit','plant'],
  info:{es:'Aportan fibra, vitamina C y compuestos vegetales, como las antocianinas, que les dan su color.',en:'They provide fiber, vitamin C and plant compounds, such as the anthocyanins that give them their color.'}},
 {id:'arroz',es:'Arroz blanco',en:'White rice',n:['carb'],
  info:{es:'Es una fuente de carbohidratos, que dan energía al cuerpo. Junto a legumbres o verduras forma un plato más completo.',en:'It is a source of carbohydrates, which give the body energy. Together with legumes or vegetables it makes a more complete plate.'}},
 {id:'tortillas',es:'Tortillas de maíz',en:'Corn tortillas',n:['carb','fib'],
  info:{es:'El maíz aporta carbohidratos, que dan energía, y algo de fibra. Con legumbres o verduras forma un plato más completo.',en:'Corn provides carbohydrates, which give energy, and some fiber. With legumes or vegetables it makes a more complete plate.'}},
 {id:'legumbres',es:'Legumbres y granos',en:'Beans, lentils and grains',n:['fib','pro','vit'],
  info:{es:'Aportan fibra, proteína de origen vegetal y minerales como el hierro, con una energía que se libera despacio.',en:'They provide fiber, plant-based protein and minerals such as iron, with energy that is released slowly.'}},
 {id:'pollo',es:'Pechuga de pollo',en:'Chicken breast',n:['pro'],
  info:{es:'Es una fuente de proteína, que el cuerpo usa para construir y reparar tejidos.',en:'It is a source of protein, which the body uses to build and repair tissues.'}},
 {id:'salmon',es:'Salmón',en:'Salmon',n:['pro','fat','vit'],
  info:{es:'Aporta proteína, grasas omega-3 y vitamina D.',en:'It provides protein, omega-3 fats and vitamin D.'}},
 {id:'bistec',es:'Carne de res asada',en:'Grilled beef',n:['pro','vit'],
  info:{es:'Es una fuente de proteína, hierro y vitamina B12.',en:'It is a source of protein, iron and vitamin B12.'}},
 {id:'nueces',es:'Nueces y frutos secos',en:'Nuts',n:['fat','pro','fib','vit'],
  info:{es:'Aportan grasas insaturadas, algo de proteína, fibra y minerales como el magnesio.',en:'They provide unsaturated fats, some protein, fiber and minerals such as magnesium.'}},
 {id:'aceite',es:'Aceite de oliva extra virgen y aceitunas',en:'Extra virgin olive oil and olives',n:['fat','plant'],
  info:{es:'Aportan grasas insaturadas y compuestos vegetales. Se usan en pequeña cantidad para aderezar.',en:'They provide unsaturated fats and plant compounds. They are used in small amounts for dressing.'}},
 {id:'aguacate',es:'Aguacate y aceite de coco',en:'Avocado and coconut oil',n:['fat','fib'],
  info:{es:'El aguacate aporta grasas insaturadas y fibra, que ayudan a absorber vitaminas como la A, la D, la E y la K. El aceite de coco se usa en pequeñas cantidades.',en:'Avocado provides unsaturated fats and fiber, which help absorb vitamins such as A, D, E and K. Coconut oil is used in small amounts.'}}];
const ING_BY=Object.fromEntries(ING.map(i=>[i.id,i]));
/* posiciones (en % de la imagen) de 1, 2 o 3 alimentos sobre el plato; el plato está centrado */
const SLOTS={1:[[50,50]],2:[[37,50],[63,50]],3:[[50,41],[37.5,59],[62.5,59]]};
S.st2={phase:'build',list:[]};
RESET.push(()=>{S.st2={phase:'build',list:[]}});
ENTER[2]=()=>{S.st2.phase=S.done[2]&&S.st2.list.length?'result':'build';S.note=null};
function plateThumbs(list,live){const pos=SLOTS[list.length]||[];
  return list.map((id,i)=>`<${live?'button':'span'} class="thumb" ${live?`data-act="ing" data-id="${id}" aria-label="${T('Quitar','Remove')}: ${ING_BY[id][S.lang]}"`:''} style="left:${pos[i][0]}%;top:${pos[i][1]}%"><img src="img/ing-${id}.webp" alt="">${live?'<span class="x" aria-hidden="true">×</span>':''}</${live?'button':'span'}>`).join('')}
function plateScene(list,live){
  return `<div class="plate ${live?'':'fixed'}">${pic('img/plato.webp',plateThumbs(list,live),T('Un plato vacío sobre una mesa de madera','An empty plate on a wooden table'))}</div>`}
function vSt2(){
  const s=S.st2,l=S.lang,list=s.list,n=list.length,full=n>=MAXF;
  if(s.phase==='result')return vPlate();
  const tray=ING.map(i=>{const on=list.includes(i.id);return `<button class="tcard ${!on&&full?'dim':''}" data-act="ing" data-id="${i.id}" aria-pressed="${on}"><span class="ck">${ICON.check}</span><span class="ph"><img src="img/ing-${i.id}.webp" alt=""></span><span>${i[l]}</span></button>`}).join('');
  const dots=`<span class="dots2">${[0,1,2].map(k=>`<i class="${k<n?'on':''}"></i>`).join('')}</span>`;
  const msg=n===0?T('Toca un alimento para ponerlo en tu plato.','Tap a food to put it on your plate.'):full?T('Tu plato tiene 3 alimentos, el máximo. Toca uno para quitarlo y cambiarlo.','Your plate has 3 foods, the maximum. Tap one to remove it and swap it.'):T('Puedes añadir hasta '+(MAXF-n)+' más, o terminar cuando quieras.','You can add up to '+(MAXF-n)+' more, or finish whenever you like.');
  return {stage:`<div class="scene two s2"><div class="full"><div class="kick">${T('Estación 2','Station 2')}</div><h2>${T('Mi plato digestivo','My digestive plate')}</h2><p class="lead">${T('Elige de uno a tres alimentos para armar tu plato. Toca un alimento para ponerlo y tócalo otra vez para quitarlo.','Choose one to three foods to build your plate. Tap a food to put it on the plate and tap it again to take it off.')}</p></div>
    <div class="boardwrap">${plateScene(list,true)}<div class="cnt3">${dots}<span><b>${n}</b> ${T('de','of')} ${MAXF} ${T('alimentos elegidos','foods chosen')}</span></div></div>
    <div class="trayblock"><div class="tray">${tray}</div></div></div>`,
    bro:S.note||msg,shake:S.shake,actions:`<button class="btn primary" data-act="st2see" ${n?'':'disabled'}>${n?T('Descubrir mi plato','Discover my plate'):T('Elige al menos un alimento','Choose at least one food')}</button>`};
}
const GRP={veg:['verduras','frutas','frutosrojos'],pro:['pollo','salmon','bistec','legumbres'],carb:['arroz','tortillas','legumbres'],fat:['aceite','aguacate','nueces','salmon']};
const has=(list,g)=>list.some(id=>GRP[g].includes(id));
function plateExplain(list){
  const l=S.lang,n=list.length,es=l==='es',pts=[];
  /* qué aporta el conjunto */
  const tags=[...new Set(list.flatMap(id=>ING_BY[id].n))].map(k=>NUT[k][es?0:1]);
  const nl=tags.length>1?tags.slice(0,-1).join(', ')+T(' y ',' and ')+tags[tags.length-1]:tags[0];
  const comp=n===1?T('Con un solo alimento ya tienes un punto de partida. Cada alimento aporta algo distinto y ninguno lo aporta todo: al sumar otros, lo que da uno complementa lo que no da el otro.','With a single food you already have a starting point. Each food brings something different and none brings everything: when you add others, what one gives complements what the other lacks.')
   :T(`Tu plato reúne ${n} alimentos distintos. Juntos aportan ${nl}. Cada uno ofrece algo diferente y lo que da uno complementa lo que no da otro.`,`Your plate brings together ${n} different foods. Together they provide ${nl}. Each offers something different, and what one gives complements what another lacks.`);
  pts.push(comp);
  /* combinaciones concretas */
  if(list.includes('legumbres')&&list.includes('tortillas')&&!list.includes('arroz'))pts.push(T('Las tortillas de maíz y las legumbres son una combinación tradicional en muchas cocinas: se complementan en energía, fibra y proteína.','Corn tortillas and legumes are a traditional pairing in many cuisines: they complement each other in energy, fiber and protein.'));
  if(list.includes('legumbres')&&list.includes('arroz'))pts.push(T('El arroz y las legumbres forman una pareja clásica en muchas cocinas: se complementan en proteína, fibra y energía.','Rice and legumes are a classic pair in many cuisines: they complement each other in protein, fiber and energy.'));
  if(list.includes('legumbres')&&has(list,'veg'))pts.push(T('La vitamina C de las verduras y frutas ayuda a absorber el hierro de origen vegetal que traen las legumbres.','The vitamin C in vegetables and fruit helps absorb the plant-based iron in legumes.'));
  if(list.some(i=>['aceite','aguacate','nueces','salmon'].includes(i))&&list.some(i=>['verduras','frutas','frutosrojos'].includes(i)))pts.push(T('Las grasas del plato ayudan a absorber las vitaminas A, D, E y K que traen algunas verduras y frutas.','The fats on the plate help absorb the vitamins A, D, E and K found in some vegetables and fruit.'));
  if(has(list,'carb')&&has(list,'pro')&&!list.includes('legumbres'))pts.push(T('La proteína y los carbohidratos se reparten el trabajo: uno ayuda a construir y reparar tejidos, el otro da energía.','Protein and carbohydrates share the work: one helps build and repair tissues, the other gives energy.'));
  /* sugerencia amable para dar variedad, solo si falta un grupo */
  let tip;
  if(!has(list,'veg'))tip=T('Para dar más variedad, puedes sumar verduras o frutas: aportan fibra, vitaminas y minerales.','To add variety, you could include vegetables or fruit: they provide fiber, vitamins and minerals.');
  else if(!has(list,'pro'))tip=T('Para dar más variedad, puedes sumar una fuente de proteína, como legumbres, pollo, pescado o carne.','To add variety, you could include a source of protein, such as legumes, chicken, fish or meat.');
  else if(!has(list,'fat'))tip=T('Para dar más variedad, puedes sumar una grasa de origen vegetal, como aguacate, nueces o aceite de oliva extra virgen.','To add variety, you could include a plant-based fat, such as avocado, nuts or extra virgin olive oil.');
  else if(!has(list,'carb')&&n<3)tip=T('Si quieres más energía de liberación lenta, puedes sumar arroz o legumbres.','If you want more slow-release energy, you could include rice or legumes.');
  else tip=T('Tu plato ya reúne distintos tipos de alimentos. Otro día puedes cambiar los colores o los ingredientes para seguir explorando.','Your plate already brings together different kinds of food. Another day you can change the colors or ingredients to keep exploring.');
  return {pts,tip};
}
function vPlate(){
  const s=S.st2,l=S.lang,list=s.list;
  const items=list.map(id=>{const i=ING_BY[id];return `<div class="fitem"><img src="img/ing-${id}.webp" alt=""><div><b>${i[l]}</b><span>${i.info[l]}</span></div></div>`}).join('');
  const ex=plateExplain(list);
  return {stage:`<div class="scene s2r" style="max-width:760px"><div><div class="kick">${T('Estación 2','Station 2')}</div><h2>${T('Mi plato digestivo','My digestive plate')}</h2></div>
    <div style="width:min(100%,520px);margin:0 auto">${plateScene(list,false)}</div>
    <section aria-labelledby="s2h" style="display:grid;gap:12px"><h3 id="s2h" style="font-size:1.5rem">${T('¿Qué aporta mi plato?','What does my plate offer?')}</h3>
    <div class="flist">${items}</div>
    <div class="gcard"><p style="margin:0">${ex.pts.join('</p><p style="margin:0">')}</p><p style="margin:0"><b>${T('Una idea: ','One idea: ')}</b>${ex.tip}</p></div>
    <div class="howto"><span class="dot">✓</span><span>${T('No existe un plato perfecto: esta actividad solo te invita a observar cómo se complementan los alimentos.','There is no perfect plate: this activity just invites you to notice how foods complement each other.')}</span></div></section></div>`,
    bro:T('Así quedó tu plato.','Here is your plate.'),
    actions:`<button class="btn ghost" style="flex:1" data-act="st2back">${T('Cambiar mis alimentos','Change my foods')}</button><button class="btn primary" data-act="st2end">${T('Volver al jardín','Back to the garden')}</button>`};
}
VIEW.st2=vSt2;
ACT.ing=b=>{const s=S.st2,list=s.list,id=b.dataset.id,i=list.indexOf(id);S.note=null;
  if(i>=0)list.splice(i,1);
  else if(list.length>=MAXF){S.note=T('Tu plato ya tiene 3 alimentos. Quita uno para elegir otro.','Your plate already has 3 foods. Remove one to choose another.');S.shake=true}
  else list.push(id);
  render(true)};
ACT.st2see=()=>{if(S.st2.list.length){S.st2.phase='result';S.note=null;render()}};
ACT.st2back=()=>{S.st2.phase='build';S.note=null;render()};
ACT.st2end=()=>{if(!S.done[2]){S.done[2]=true;S.seeds+=5}S.sel=null;S.note=null;S.at=2;go('map')};
