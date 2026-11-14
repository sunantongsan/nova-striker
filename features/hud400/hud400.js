// 400: HUD polish lives in the last stylesheet so it wins over earlier skins.
(function(){var style=document.createElement('style');style.id='hud400';style.textContent=hud400CSS;document.head.appendChild(style);})();
// 401: builder count moves out from under the base card into the resource readouts, so the
// shop badge below the card can be big.
(function(){var badge=$('builderBadge'),res=document.querySelector('#app>header .resources');if(badge&&res)res.appendChild(badge);})();
// 401: until a real banner ad fills the top-right slot, show our own Nova Striker banner there
// (game art + logo). It only appears inside the Android app, where the slot exists, and steps
// aside the moment the native banner is shown (data-nova-banner39).
(function(){
 var root=document.documentElement,house=document.createElement('div');
 house.id='houseBanner401';house.setAttribute('aria-hidden','true');house.hidden=true;
 house.innerHTML='<b class="hb401-logo">NOVA<span>STRIKER</span></b>';
 document.body.appendChild(house);
 function shown(id){var el=document.getElementById(id);if(!el||el.hidden)return false;var s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&el.getClientRects().length>0;}
 function update(){
  var app=$('app'),cs=getComputedStyle(root),safe=parseFloat(cs.getPropertyValue('--safe-right303'))||0,left=parseFloat(cs.getPropertyValue('--safe-left303'))||0;
  var blocked=['welcome','boot','baseNameGate','modal','nova-admin293','moveControls','selection','guideDock288'].some(shown);
  var on=!!window.NovaAds&&!!app&&innerWidth-safe-left>=660&&innerHeight>=280&&app.dataset.battle300!=='true'&&!blocked&&!document.hidden&&!root.hasAttribute('data-nova-banner39');
  if(root.hasAttribute('data-nova-house401')!==on)root.toggleAttribute('data-nova-house401',on);
  if(house.hidden===on)house.hidden=!on;
 }
 setInterval(update,700);addEventListener('resize',update);document.addEventListener('visibilitychange',update);update();
})();
// 401: smooth multiplayer spectating. The server relays a battle snapshot about every 1.5 s;
// instead of teleporting units to each snapshot, glide them from where they are drawn now to the
// new snapshot over the measured snapshot gap (Clash-style replay smoothness).
(function(){
 var at401=0,gap401=1500,keys401=['troops','guards'];
 var unpackSmooth401=liveUnpack;
 liveUnpack=function(f){
  var r=E.raid,old=null;
  if(r&&screen==='raid'){old={};keys401.forEach(function(k){old[k]=(r[k]||[]).map(function(t){return{kind:t.kind,x:t.x,y:t.y,h:t.height340||0};});});}
  unpackSmooth401(f);
  r=E.raid;if(!r||!f||!f.buildings)return;
  var now=Date.now();if(at401&&now-at401<4000)gap401=Math.max(400,Math.min(2500,gap401*.7+(now-at401)*.3));at401=now;
  keys401.forEach(function(k){(r[k]||[]).forEach(function(t,i){var o=old&&old[k]&&old[k][i];
   t.to401={x:t.x,y:t.y,h:t.height340||0};
   t.from401=o&&o.kind===t.kind&&Math.hypot(o.x-t.x,o.y-t.y)<4?o:t.to401;});});
 };
 var drawSmooth401=draw;
 draw=function(){
  var r=E.raid;
  if(screen==='raid'&&r&&r.phase==='spectator'&&at401){
   var k=Math.min(1,(Date.now()-at401)/gap401);k=k*k*(3-2*k)*.35+k*.65;
   keys401.forEach(function(key){(r[key]||[]).forEach(function(t){var a=t.from401,b=t.to401;if(!a||!b)return;
    t.x=a.x+(b.x-a.x)*k;t.y=a.y+(b.y-a.y)*k;if(b.h||a.h)t.height340=a.h+(b.h-a.h)*k;});});
  }
  return drawSmooth401.apply(this,arguments);
 };
})();
