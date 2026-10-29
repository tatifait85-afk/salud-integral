'use strict';
/* Ayudas comunes de las estaciones 2 a 5 */
function pic(img,inner,alt){return `<div class="pic"><img class="bgi" src="${img}" alt="${alt||''}">${inner||''}</div>`}
const HOT={};   /* HOT[set]=[{x,y,es:[titulo,texto],en:[title,text]}] */
function hots(set,seenMap){
  return HOT[set].map((h,i)=>`<button class="hot ${seenMap&&seenMap[i]?'seen':''}" style="left:${h.x}%;top:${h.y}%" data-act="hot" data-set="${set}" data-i="${i}" aria-label="${h[S.lang][0]}">${seenMap&&seenMap[i]?ICON.check:i+1}</button>`).join('');
}
function infoSheet(){
  if(!S.sel)return '';
  const h=HOT[S.sel.set][S.sel.i],l=S.lang,tt=t();
  return `<div class="sheetbg" data-act="hotClose"><div class="sheet" role="dialog" aria-label="${h[l][0]}"><div><div class="kick" style="margin:0">${S.sel.i+1} / ${HOT[S.sel.set].length}</div><div class="sh-q">${h[l][0]}</div></div><p style="margin:0;font-size:1.12rem">${h[l][1]}</p><button class="btn primary" data-act="hotOk">${T('Entendido','Got it')}</button></div></div>`;
}
ACT.hot=b=>{const set=b.dataset.set,i=+b.dataset.i;S.sel={set,i};const st=S['st'+HOT[set].st];if(st){st.seen=st.seen||{};st.seen[set]=st.seen[set]||{};st.seen[set][i]=1}render(true)};
ACT.hotOk=()=>{S.sel=null;render(true)};
ACT.hotClose=(b,e)=>{if(e.target===b){S.sel=null;render(true)}};
