/* Guarda el avance del jardín en este dispositivo y lo recupera al volver */
(function(){
  var K='mjd-avance-1',KEEP=['p','seeds','done','cautious','at','rew','hinted','st1','st2','st3','st4','st5'];
  try{var d=JSON.parse(localStorage.getItem(K)||'null');
    if(d&&d.v===1&&d.s){KEEP.forEach(function(k){if(Object.prototype.hasOwnProperty.call(d.s,k)&&d.s[k]!=null)S[k]=d.s[k]});}
  }catch(e){}
  var r0=render;
  render=function(k){r0(k);try{var s={};KEEP.forEach(function(k){s[k]=S[k]});localStorage.setItem(K,JSON.stringify({v:1,s:s}))}catch(e){}};
  render();
})();
