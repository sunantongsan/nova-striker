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
// 401: cartoon squash & stretch. Everything is a pure draw-time transform around the unit's feet
// (or a building's footprint), so gameplay, hit boxes and saves are untouched.
var squash401={units:new WeakMap(),buildings:{},now:0};
function spring401(e,amp,freq,damp){return amp*Math.exp(-e*damp)*Math.cos(e*freq);}
// Flying guard robot: crouch before lift-off, stretch while climbing/diving, squash on touch-down, breathe while hovering.
function squashGuard401(r,h,t){
 var now=performance.now()/1000,s=r.sq401||(r.sq401={h:h,at:now,vz:0,land:-9,crouch:-9});
 var dt=Math.max(.001,now-s.at),vz=(h-s.h)/dt;if(dt<.2)s.vz=s.vz*.6+vz*.4;
 if(s.h<=0&&h>0)s.crouch=now;if(s.h>0&&h<=0)s.land=now;s.h=h;s.at=now;
 var sy=1,e;
 if((e=now-s.crouch)<.45)sy+=e<.12?-.22*(e/.12):spring401(e-.12,.24,16,7);
 else if((e=now-s.land)<.6)sy+=spring401(e,-.3,20,7);
 else if(h>2)sy+=Math.max(-.12,Math.min(.2,Math.abs(s.vz)/260))+Math.sin(t*3.1)*.035;
 else sy+=Math.sin(t*2.2)*.02;
 ctx.scale(1/Math.sqrt(sy),sy);
}
(function(){
 // Troops: bouncy walk, hit squash, shot kick, squash-flat on defeat, floating air units.
 var fighter401=drawFighter;
 drawFighter=function(t,enemy){
  if(!t||t.guard339||t.builder||t.x===undefined)return fighter401.apply(this,arguments);
  var now=performance.now()/1000,s=squash401.units.get(t);
  if(!s){s={hp:t.hp,hit:-9,walk:t.walk||0,moveAt:-9};squash401.units.set(t,s);}
  if(t.hp<s.hp-.5)s.hit=now;s.hp=t.hp;
  if((t.walk||0)!==s.walk){s.walk=t.walk||0;s.moveAt=now;}
  var u=t.kind!==undefined&&typeof U!=='undefined'?U[t.kind]:null,sy=1,sx=0,e;
  if(t.hp<=0&&t.dead!==undefined){var d=Math.max(0,Math.min(1,t.dead));sy=.45+.55*d;sx=1+.45*(1-d);}
  else{
   if(u&&u.air)sy+=Math.sin(now*2.6+(t.id||0))*.04;
   else if(now-s.moveAt<.25)sy+=Math.abs(Math.sin((t.walk||0)*.5))*.16-.06;
   else sy+=Math.sin(now*2+(t.id||0))*.018;
   if((e=now-s.hit)<.4)sy+=spring401(e,-.24,24,9);
   var rc=Math.max(0,Math.min(1,(t.recoil||0)/.18));if(rc)sy-=.1*rc,sx=1+.14*rc;
  }
  if(sy===1&&!sx)return fighter401.apply(this,arguments);
  var p=point(t.x,t.y);sx=sx||1/Math.sqrt(sy);
  ctx.save();ctx.translate(p.x,p.y);ctx.scale(sx,sy);ctx.translate(-p.x,-p.y);
  try{return fighter401.apply(this,arguments);}finally{ctx.restore();}
 };
 // Buildings: jelly wobble when placed, finished or upgraded; a squish when hit in battle.
 var building401=drawBuilding;
 drawBuilding=function(b,enemy){
  if(!b||b.x===undefined)return building401.apply(this,arguments);
  var now=performance.now()/1000,key=(screen==='home'?'h':'r')+(b.id!==undefined?b.id:b.x+','+b.y),s=squash401.buildings[key];
  if(!s){s=squash401.buildings[key]={lv:b.lv,busy:!!(b.until||b.constructing),hp:b.hp,wob:-9,amp:0,seen:now};if(screen==='home'&&squash401.homeSince&&now-squash401.homeSince>1.5&&now-squash401.homeLast<.5){s.wob=now;s.amp=.22;}}
  if(screen==='home'){if(!squash401.homeLast||now-squash401.homeLast>1)squash401.homeSince=now;squash401.homeLast=now;}
  var busy=!!(b.until||b.constructing);
  if(now-s.seen>1){s.lv=b.lv;s.busy=busy;s.hp=b.hp;}// ignore state that changed while off-screen or between visits
  if(b.lv>s.lv||(s.busy&&!busy)){s.wob=now;s.amp=.18;}
  if(b.hp!==undefined&&s.hp!==undefined&&b.hp<s.hp-.5&&now-s.wob>.25){s.wob=now;s.amp=.1;}
  if(b.x!==s.x||b.y!==s.y){if(s.x!==undefined&&screen==='home'&&now-s.seen<1){s.wob=now;s.amp=.14;}s.x=b.x;s.y=b.y;}
  s.lv=b.lv;s.busy=busy;s.hp=b.hp;s.seen=now;
  var e=now-s.wob;if(e>.9)return building401.apply(this,arguments);
  if(typeof drawNeeded!=='undefined')drawNeeded=true;
  var sy=1+spring401(e,-s.amp,17,5.5),p=point(b.x,b.y);
  ctx.save();ctx.translate(p.x,p.y);ctx.scale(1/Math.sqrt(sy),sy);ctx.translate(-p.x,-p.y);
  try{return building401.apply(this,arguments);}finally{ctx.restore();}
 };
 // Windows pop open with a little overshoot (only when a window opens, not on every refresh).
 var modal401=document.getElementById('modal'),shown401=false;
 if(modal401)new MutationObserver(function(){var open=modal401.style.display==='flex';if(open&&!shown401){modal401.classList.remove('pop401');void modal401.offsetWidth;modal401.classList.add('pop401');}shown401=open;}).observe(modal401,{attributes:true,attributeFilter:['style']});
})();
