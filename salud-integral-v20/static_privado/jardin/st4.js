'use strict';
/* Estación 4: Los secretos bajo la tierra. Suelo, intestino y microbios. */
S.st4={phase:'soil',seen:{}};
RESET.push(()=>{S.st4={phase:'soil',seen:{}}});
ENTER[4]=()=>{S.st4.phase='soil';S.sel=null};
const CLOSE4=[
 [['El suelo guarda agua y nutrientes que las plantas necesitan.','Soil holds the water and nutrients that plants need.'],['Lo que comes se descompone en nutrientes que tu cuerpo puede aprovechar.','The food you eat is broken down into nutrients your body can use.']],
 [['Las raíces absorben agua y nutrientes del suelo.','Roots absorb water and nutrients from the soil.'],['La pared del intestino absorbe los nutrientes y los pasa a la sangre.','The gut wall absorbs nutrients and passes them into the blood.']],
 [['Los microorganismos del suelo ayudan a descomponer la materia y a liberar nutrientes.','Soil microorganisms help break down matter and release nutrients.'],['Los microbios del intestino ayudan a descomponer la fibra y participan en las defensas del cuerpo.','Gut microbes help break down fiber and take part in the body’s defenses.']]];
HOT.soil=[
 {x:52,y:46,es:['Las raíces','The roots'],en:['The roots','The roots'],_:0},
 {x:31,y:59,es:['Hilos de hongos','Fungal threads'],en:0},
 {x:23,y:70,es:['La lombriz','The earthworm'],en:0},
 {x:70,y:50,es:['Los hongos','The mushrooms'],en:0},
 {x:5,y:39,es:['La zanahoria','The carrot'],en:0}];
HOT.gut=[
 {x:39,y:23},{x:30,y:50},{x:21,y:45},{x:62,y:69},{x:44,y:58}];
HOT.micro=[{x:24,y:20},{x:76,y:22},{x:19,y:70},{x:55,y:72},{x:81,y:66}];
HOT.soil.st=4;HOT.gut.st=4;HOT.micro.st=4;
/* textos [titulo, texto] por idioma */
const TX={
 soil:[
  [['Las raíces','Las raíces absorben agua y nutrientes del suelo.'],['The roots','Roots absorb water and nutrients from the soil.']],
  [['Hilos de hongos','Los hongos del suelo forman una red de hilos blancos. Ayudan a descomponer materia y a llevar nutrientes a las plantas.'],['Fungal threads','Soil fungi form a network of white threads. They help break down matter and carry nutrients to plants.']],
  [['La lombriz','Las lombrices mezclan y airean la tierra, y la convierten en abono.'],['The earthworm','Earthworms mix and aerate the soil and turn it into compost.']],
  [['Los hongos','Las setas son solo la parte visible de un hongo. El resto vive bajo tierra.'],['The mushrooms','Mushrooms are only the visible part of a fungus. The rest lives underground.']],
  [['La zanahoria','Una planta sana crece en un suelo vivo, lleno de microorganismos.'],['The carrot','A healthy plant grows in living soil, full of microorganisms.']]],
 gut:[
  [['Los microbios','En tu intestino viven billones de microbios: la microbiota. Ayudan a descomponer la fibra de los alimentos.'],['The microbes','Trillions of microbes live in your gut: the microbiota. They help break down the fiber in food.']],
  [['El moco','Una capa de moco cubre la pared del intestino y la protege.'],['The mucus','A layer of mucus covers the gut wall and protects it.']],
  [['La pared del intestino','Las células de la pared absorben los nutrientes de lo que comes.'],['The gut wall','The cells of the wall absorb nutrients from what you eat.']],
  [['Los vasos sanguíneos','Los nutrientes pasan a la sangre, que los lleva al resto del cuerpo.'],['The blood vessels','Nutrients pass into the blood, which carries them to the rest of the body.']],
  [['Células de defensa','Una parte importante del sistema de defensa del cuerpo está en el intestino.'],['Defense cells','An important part of the body’s defense system is in the gut.']]],
 micro:[
  [['Lactobacilos','Bacterias con forma de bastón. Están en alimentos fermentados como el yogur, el kéfir y el chucrut.'],['Lactobacilli','Rod-shaped bacteria. They are found in fermented foods like yogurt, kefir and sauerkraut.']],
  [['Bifidobacterias','Bacterias ramificadas, con forma de Y. Viven de forma natural en el intestino.'],['Bifidobacteria','Branched, Y-shaped bacteria. They live naturally in the gut.']],
  [['Bacterias con flagelos','Algunas bacterias se mueven con unas colitas largas llamadas flagelos.'],['Bacteria with flagella','Some bacteria move using long tails called flagella.']],
  [['Levaduras','Hongos de una sola célula. Hacen subir el pan y participan en algunas fermentaciones.'],['Yeasts','Single-celled fungi. They make bread rise and take part in some ferments.']],
  [['Moho','Hongo que forma hilos y esporas. Si lo ves en un frasco de fermento, es señal para desechar.'],['Mold','A fungus that forms threads and spores. If you see it in a ferment jar, it is a sign to discard it.']]]
};
for(const k of ['soil','gut','micro'])HOT[k].forEach((h,i)=>{h.es=TX[k][i][0];h.en=TX[k][i][1]});
const SCN4={soil:{img:'img/suelo.webp',h:['Bajo la tierra','Beneath the soil'],b:['Toca los círculos numerados para descubrir qué pasa bajo la tierra.','Tap the numbered circles to discover what happens beneath the soil.'],alt:['Corte del suelo con raíces, hongos y una lombriz','Cross-section of soil with roots, fungi and a worm']},
 gut:{img:'img/intestino.webp',h:['Dentro del intestino','Inside the gut'],b:['Ahora mira dentro del intestino. Toca los círculos.','Now look inside the gut. Tap the circles.'],alt:['Corte del intestino con microbios','Cross-section of the gut with microbes']},
 micro:{img:'img/microbios.webp',h:['Conoce a los microbios','Meet the microbes'],b:['Cinco habitantes del jardín. Toca cada uno.','Five residents of the garden. Tap each one.'],alt:['Colección de microbios','Collection of microbes']}};
function vClose4(){
  const idx=S.lang==='es'?0:1;
  const pairs=CLOSE4.map(p=>`<div class="pair"><div class="pa"><b>${T('En el suelo','In the soil')}</b><span>${p[0][idx]}</span></div><div class="pb"><b>${T('En tu cuerpo','In your body')}</b><span>${p[1][idx]}</span></div></div>`).join('');
  const trio=['soil','gut','micro'].map(k=>`<img src="${SCN4[k].img}" alt="">`).join('');
  return {stage:`<div class="scene" style="max-width:880px"><div><div class="kick">${T('Estación 4','Station 4')}</div><h2>${T('Todo se conecta','Everything connects')}</h2><p class="lead">${T('Lo que descubriste bajo la tierra y dentro del intestino se parece en varias cosas.','What you discovered under the soil and inside the gut is alike in several ways.')}</p></div>
    <div class="trio">${trio}</div><div class="pairs">${pairs}</div>
    <div class="gcard concl"><p style="margin:0">${T('Es una comparación para entender mejor: el intestino humano no funciona exactamente igual que el suelo ni tiene raíces. Lo que tienen en común es que, en ambos, los nutrientes y los microorganismos trabajan juntos para que algo pueda crecer y mantenerse sano.','It is a comparison to understand better: the human gut does not work exactly like soil and it has no roots. What they share is that, in both, nutrients and microorganisms work together so something can grow and stay healthy.')}</p></div>
    <div class="howto"><span class="dot">✓</span><span>${T('¡Terminaste la estación 4! Vuelve al jardín y elige la siguiente estación que quieras explorar.','You finished station 4! Go back to the garden and choose the next station you want to explore.')}</span></div></div>`,
    bro:T('Así se conectan el suelo y tu intestino.','This is how the soil and your gut connect.'),
    actions:`<button class="btn ghost" data-act="st4prev">←</button><button class="btn primary" data-act="st4end">${T('Terminar la estación','Finish the station')}</button>`};
}
function vSt4(){
  const s=S.st4,ph=s.phase;if(ph==='close')return vClose4();
  const k=ph,sc=SCN4[k],idx=S.lang==='es'?0:1,seen=(s.seen[k]||{}),n=Object.keys(seen).length;
  const nextL={soil:T('Ver el intestino','See the gut'),gut:T('Conocer a los microbios','Meet the microbes'),micro:T('Ver la conclusión','See the wrap-up')}[k];
  const extra=k==='gut'?`<div class="gcard"><b style="color:var(--forest)">${T('Dos jardines','Two gardens')}</b><span>${T('En el suelo y en el intestino, los microorganismos descomponen lo que reciben y lo vuelven útil para quien vive de ello.','In the soil and in the gut, microorganisms break down what they receive and make it useful for those who live from it.')}</span></div>`:'';
  return {stage:`<div class="scene" style="max-width:980px"><div><div class="kick">${T('Estación 4','Station 4')} · ${['soil','gut','micro'].indexOf(k)+1} ${T('de','of')} 3</div><h2>${sc.h[idx]}</h2></div>
    ${pic(sc.img,hots(k,seen),sc.alt[idx])}<div class="cnt">${n} ${T('de','of')} 5</div>${extra}</div>`,
    bro:sc.b[idx],sheet:infoSheet(),actions:`<button class="btn primary" data-act="st4next">${nextL}</button>`};
}
VIEW.st4=vSt4;
ACT.st4next=()=>{const s=S.st4;S.sel=null;if(s.phase==='soil'){s.phase='gut';render()}else if(s.phase==='gut'){s.phase='micro';render()}else{s.phase='close';render()}};
ACT.st4prev=()=>{S.st4.phase='micro';render()};
ACT.st4end=()=>finish(4);
