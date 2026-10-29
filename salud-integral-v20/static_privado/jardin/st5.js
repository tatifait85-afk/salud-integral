'use strict';
/* Estación 5: Mi rincón de cultivo. Elegir exactamente 3 de 8 hábitos y generar un plan personal. */
const NHAB=3;
const HAB=[
 {id:'agua',img:'img/habito-hidratacion.webp',es:'Hidratarme durante el día',en:'Stay hydrated through the day',
  d:{es:'Tomar agua con regularidad a lo largo del día.',en:'Drinking water regularly through the day.'},
  a:{es:'Deja un vaso o una botella de agua a la vista y toma unos sorbos cada vez que la veas.',en:'Keep a glass or bottle of water in sight and take a few sips each time you see it.'},
  c:{es:'Una buena señal para empezar: el primer vaso al despertar.',en:'A good cue to start: the first glass when you wake up.'}},
 {id:'plato',img:'img/habito-plato-color.webp',es:'Darle variedad a mi plato',en:'Add variety to my plate',
  d:{es:'Combinar alimentos de distintos tipos y colores en una comida.',en:'Combining foods of different kinds and colors in one meal.'},
  a:{es:'En tu próxima comida, intenta que haya alimentos de al menos tres colores distintos en tu plato.',en:'At your next meal, try to have foods of at least three different colors on your plate.'},
  c:{es:'Elige la comida de hoy en la que tengas más calma para armar tu plato.',en:'Pick the meal today when you have the most calm to build your plate.'}},
 {id:'mov',img:'img/habito-mover-cuerpo.webp',es:'Mover mi cuerpo',en:'Move my body',
  d:{es:'Caminar, estirarte o bailar un rato: cualquier movimiento suma.',en:'Walking, stretching or dancing for a while: any movement counts.'},
  a:{es:'Camina 10 minutos o muévete de la forma que más disfrutes.',en:'Walk for 10 minutes or move in the way you enjoy most.'},
  c:{es:'Una buena señal para empezar: justo después de una comida o al terminar una tarea.',en:'A good cue to start: right after a meal or when you finish a task.'}},
 {id:'sueno',img:'img/habito-suenio.webp',es:'Cuidar mi sueño',en:'Look after my sleep',
  d:{es:'Dormir lo suficiente y a horas parecidas ayuda a que el cuerpo descanse.',en:'Sleeping enough and at similar times helps your body rest.'},
  a:{es:'Elige una hora para acostarte y deja las pantallas un rato antes de dormir.',en:'Choose a bedtime and put screens away a while before sleeping.'},
  c:{es:'Una buena señal para empezar: una alarma suave a la hora de prepararte para dormir.',en:'A good cue to start: a gentle alarm at the time you get ready for bed.'}},
 {id:'pausas',img:'img/habito-pausas.webp',es:'Darme pausas para respirar',en:'Give myself pauses to breathe',
  d:{es:'Detenerte unos minutos para respirar con calma.',en:'Stopping for a few minutes to breathe calmly.'},
  a:{es:'Haz tres respiraciones lentas y profundas antes de empezar una tarea o una comida.',en:'Take three slow, deep breaths before starting a task or a meal.'},
  c:{es:'Una buena señal para empezar: cada vez que te sientes a la mesa.',en:'A good cue to start: every time you sit down at the table.'}},
 {id:'comer',img:'img/habito-comer.webp',es:'Comer con atención',en:'Eat with attention',
  d:{es:'Comer sin prisa y sin pantallas, notando los sabores y la saciedad.',en:'Eating without rushing or screens, noticing flavors and fullness.'},
  a:{es:'En una comida del día, come sin pantallas y mastica con calma.',en:'At one meal a day, eat without screens and chew calmly.'},
  c:{es:'Elige la comida del día que suele ser más tranquila.',en:'Choose the meal of the day that is usually the calmest.'}},
 {id:'ferm',img:'img/habito-fermentos.webp',es:'Explorar los alimentos fermentados',en:'Explore fermented foods',
  d:{es:'Conocer alimentos fermentados, como el kéfir o el chucrut.',en:'Getting to know fermented foods, such as kefir or sauerkraut.'},
  a:{es:'Lee cómo se elabora un fermento y, si te sienta bien, prueba una porción pequeña.',en:'Read how a ferment is made and, if it sits well with you, try a small portion.'},
  c:{es:'Elige el día de la semana en que tengas más tiempo para cocinar o comprar.',en:'Choose the day of the week when you have more time to cook or shop.'}},
 {id:'senales',img:'img/habito-escucho-cuerpo.webp',es:'Escuchar las señales de mi cuerpo',en:'Listen to my body’s signals',
  d:{es:'Notar cómo te sientes después de comer, dormir o moverte.',en:'Noticing how you feel after eating, sleeping or moving.'},
  a:{es:'Al final del día, anota en una frase cómo te sentiste después de comer.',en:'At the end of the day, write one sentence about how you felt after eating.'},
  c:{es:'Una buena señal para empezar: justo antes de dormir.',en:'A good cue to start: right before going to sleep.'}}];
const HAB_BY=Object.fromEntries(HAB.map(h=>[h.id,h]));
const WHEN=[['hoy','Hoy','Today'],['man','Mañana','Tomorrow'],['sem','Esta semana','This week']];
S.st5={phase:'pick',picks:[],when:{}};
RESET.push(()=>{S.st5={phase:'pick',picks:[],when:{}}});
ENTER[5]=()=>{S.st5.phase=S.done[5]&&S.st5.picks.length===NHAB?'plan':'pick';S.note=null};
function habAction(h){return (h.id==='ferm'&&S.cautious)?T('Aprende cómo se elabora un fermento. Antes de probarlo, habla con un profesional de la salud.','Learn how a ferment is made. Before trying it, talk to a health professional.'):h.a[S.lang]}
function whenLabel(id){const w=WHEN.find(x=>x[0]===S.st5.when[id]);return w?T(w[1],w[2]):''}
function vSt5(){
  const s=S.st5,l=S.lang,idx=l==='es'?0:1,n=s.picks.length,full=n>=NHAB;
  if(s.phase==='pick'){
    const cards=HAB.map(h=>{const on=s.picks.includes(h.id);return `<button class="hcard ${!on&&full?'dim':''}" data-act="hab" data-id="${h.id}" aria-pressed="${on}"><span class="ck">${ICON.check}</span><img src="${h.img}" alt=""><span class="ht">${h[l]}</span><span class="hd">${h.d[l]}</span></button>`}).join('');
    const left=NHAB-n;
    return {stage:`<div class="scene" style="max-width:980px"><div><div class="kick">${T('Estación 5','Station 5')}</div><h2>${T('Mi rincón de cultivo','My Growing Corner')}</h2></div>
      <div class="howto"><span class="dot">3</span><span>${T('Elige tres hábitos que quieras cultivar. Empieza con pequeños cambios que puedas incorporar a tu vida cotidiana.','Choose three habits you want to cultivate. Start with small changes you can incorporate into your daily life.')}</span></div>
      <div class="cnt3"><span class="dots2">${[0,1,2].map(k=>`<i class="${k<n?'on':''}"></i>`).join('')}</span><span><b>${n}</b> ${T('de','of')} ${NHAB} ${T('hábitos elegidos','habits chosen')}${left?` · ${T('te '+(left===1?'falta':'faltan')+' '+left,left+' to go')}`:''}</span></div>
      <div class="hgrid">${cards}</div></div>`,
      bro:S.note||(full?T('¡Listo! Ya tienes tus tres hábitos. Pulsa «Sembrar mis hábitos».','Done! You have your three habits. Tap “Plant My Habits”.'):T('Toca las tarjetas para elegir. Necesitas exactamente tres.','Tap the cards to choose. You need exactly three.')),shake:S.shake,
      actions:`<button class="btn primary" data-act="st5plan" ${full?'':'disabled'}>${T('Sembrar mis hábitos','Plant My Habits')}</button>`};
  }
  const cards=s.picks.map(id=>{const h=HAB_BY[id],cur=s.when[id];
    return `<div class="plancard"><img src="${h.img}" alt=""><div class="pcb"><h3>${h[l]}</h3><p><b>${T('Mi acción','My action')}:</b> ${habAction(h)}</p><p class="pcue"><b>${T('Cuándo empiezo','When I start')}:</b> ${h.c[l]}</p><div class="wchips" role="group" aria-label="${T('Elige cuándo empiezas','Choose when you start')}">${WHEN.map(w=>`<button class="tc" data-act="st5when" data-id="${id}" data-w="${w[0]}" aria-pressed="${cur===w[0]}">${w[1+idx]}</button>`).join('')}</div></div></div>`}).join('');
  return {stage:`<div class="scene" style="max-width:980px"><div><div class="kick">${T('Estación 5','Station 5')}</div><h2>${T('Mi plan de cultivo','My growing plan')}</h2><p class="lead">${T('Estas son las tres semillas que elegiste. Para cada una hay una acción sencilla y una forma de decidir cuándo empezar.','These are the three seeds you chose. For each one there is a simple action and a way to decide when to start.')}</p></div>
    <div class="plans">${cards}</div>
    <div class="gcard concl"><h3 style="font-size:1.35rem">${T('¡Tu rincón de cultivo está sembrado!','Your growing corner is planted!')}</h3><p style="margin:0">${T('Empezar con pequeños cambios es empezar bien. Cuida un hábito a la vez y vuelve a este plan cuando quieras. Tu plan también aparecerá en tu PDF del jardín.','Starting with small changes is starting well. Look after one habit at a time and come back to this plan whenever you like. Your plan will also appear in your garden PDF.')}</p></div></div>`,
    bro:T('Aquí está tu plan. Puedes cambiar tus hábitos si quieres.','Here is your plan. You can change your habits if you like.'),
    actions:`<button class="btn ghost" data-act="st5back" aria-label="${T('Cambiar mis hábitos','Change my habits')}">←<span class="hide-sm"> ${T('Cambiar mis hábitos','Change my habits')}</span></button><button class="btn primary" data-act="st5end">${T('Guardar mi plan y terminar','Save my plan and finish')}</button>`};
}
VIEW.st5=vSt5;
ACT.hab=b=>{const s=S.st5,id=b.dataset.id,i=s.picks.indexOf(id);S.note=null;
  if(i>=0){s.picks.splice(i,1);delete s.when[id]}
  else if(s.picks.length>=NHAB){S.note=T('Ya elegiste 3 hábitos. Quita uno para elegir otro.','You already chose 3 habits. Remove one to choose another.');S.shake=true}
  else s.picks.push(id);
  render(true)};
ACT.st5plan=()=>{if(S.st5.picks.length===NHAB){S.st5.phase='plan';render()}};
ACT.st5back=()=>{S.st5.phase='pick';render()};
ACT.st5when=b=>{S.st5.when[b.dataset.id]=b.dataset.w;render(true)};
ACT.st5end=()=>{if(!S.done[5]){S.done[5]=true;S.seeds+=5}S.sel=null;S.note=null;go('final')};
