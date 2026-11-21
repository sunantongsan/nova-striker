// 438: Modern mobile feel + "game juice" (presentation only: no save, economy or combat-rule changes).
//  * UI: glass pill buttons with pastel neon edges (juice438.css), press squish + neon flash, instant click
//    sound and a haptic tick on every button.
//  * Motion: 60 FPS battle pacing whenever the device keeps up, camera glides after a swipe (inertia),
//    the +/− zoom buttons and mouse wheel zoom smoothly around a fixed point, troops and buildings move on
//    springs (pop-in on deploy, squash on firing, bouncy walk, wobble when hit, bounce when an upgrade ends).
//  * Juice: pooled spark particles and floating numbers when building/upgrading (resources spent pop off the
//    building), on completion ("Lv N!"), loot popping out of destroyed storages, +/− numbers by the HUD,
//    screen shake on destruction / when the base is hit, and phone vibration (NovaHaptics bridge when the
//    APK has it, navigator.vibrate otherwise).
//  * Pooling: particles live in fixed typed arrays and floating texts / HUD pops reuse a fixed set of
//    objects and DOM nodes, so busy battles allocate nothing per frame for these effects.
var reduced438=false;try{reduced438=!!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches);}catch(e){}
function now438(){return typeof performance!=='undefined'&&performance.now?performance.now():Date.now();}
function hapticsOn438(){try{return localStorage.getItem('novaHaptics438')!=='0';}catch(e){return true;}}

// ---------- haptics ----------
var lastHaptic438=0;
function haptic438(kind){
 if(!hapticsOn438()||typeof document!=='undefined'&&document.hidden)return;
 var t=now438();if(kind==='tick'&&t-lastHaptic438<45)return;lastHaptic438=t;
 try{var n=root.NovaHaptics;if(n&&typeof n.tap==='function'){n.tap(kind);return;}}catch(e){}
 try{var nav=root.navigator;if(nav&&nav.vibrate)nav.vibrate({tick:6,light:10,medium:20,heavy:[28,24,36],success:[10,40,16]}[kind]||8);}catch(e){}
}

// ---------- UI click sound ----------
var lastClick438=0;
function clickSound438(big){
 try{if(!soundOn||typeof mediaAllowed250==='function'&&!mediaAllowed250())return;unlockAudio218();if(!audio||audio.state!=='running')return;
  var t=now438();if(t-lastClick438<40)return;lastClick438=t;
  voice218('sine',big?620:760,big?1240:1180,.07,.11,'sfx');voice218('triangle',big?1240:1500,big?1860:1700,.045,.04,'sfx',.012);
 }catch(e){}
}

// ---------- screen shake (battlefield only; HUD stays still) ----------
var shakeAt438=0;
function shake438(px,ms){
 if(reduced438||!canvas||!canvas.animate)return;var t=now438();if(t-shakeAt438<120&&px<5)return;shakeAt438=t;
 var k=[],n=7;for(var i=0;i<=n;i++){var a=px*(1-i/n),ang=i*2.4;k.push({transform:i===n?'translate(0,0)':'translate('+(Math.cos(ang)*a).toFixed(1)+'px,'+(Math.sin(ang*1.3)*a*.7).toFixed(1)+'px)'});}
 try{if(canvas.shake354)canvas.shake354.cancel();canvas.shake354=canvas.animate(k,{duration:ms||220,easing:'ease-out'});}catch(e){}
}

// ---------- pooled particles (world-anchored, zero allocation per frame) ----------
var PCAP438=360,pN438=0,pWX=new Float32Array(PCAP438),pWY=new Float32Array(PCAP438),pX=new Float32Array(PCAP438),pY=new Float32Array(PCAP438),pVX=new Float32Array(PCAP438),pVY=new Float32Array(PCAP438),pLife=new Float32Array(PCAP438),pMax=new Float32Array(PCAP438),pSize=new Float32Array(PCAP438),pCol=new Uint8Array(PCAP438),pKind=new Uint8Array(PCAP438);
var COLORS438=['#fff6b0','#ffd36b','#a8fff1','#ffffff','#ffa8c4','#c6b2ff','#8dff6a','#ffe14d','#d9c3a1','#f4b46c'];
function spawn438(wx,wy,count,o){o=o||{};
 for(var i=0;i<count;i++){if(pN438>=PCAP438)return;var j=pN438++,a=Math.random()*Math.PI*2,sp=(o.speed||150)*(.45+Math.random()*.75);
  pWX[j]=wx;pWY[j]=wy;pX[j]=(Math.random()-.5)*10;pY[j]=-(o.lift||16)-Math.random()*8;pVX[j]=Math.cos(a)*sp;pVY[j]=-Math.abs(Math.sin(a))*sp*(o.up||1.1)-(o.boost||40);
  pMax[j]=pLife[j]=(o.life||.75)*(.7+Math.random()*.5);pSize[j]=(o.size||2.4)*(.7+Math.random()*.7);var cs=o.colors||[0,1,2,3];pCol[j]=cs[(Math.random()*cs.length)|0];pKind[j]=o.kind||0;}
 active438(1200);
}
function stepParticles438(dt){
 for(var i=0;i<pN438;i++){pLife[i]-=dt;if(pLife[i]<=0){var l=--pN438;pWX[i]=pWX[l];pWY[i]=pWY[l];pX[i]=pX[l];pY[i]=pY[l];pVX[i]=pVX[l];pVY[i]=pVY[l];pLife[i]=pLife[l];pMax[i]=pMax[l];pSize[i]=pSize[l];pCol[i]=pCol[l];pKind[i]=pKind[l];i--;continue;}
  var g=pKind[i]===1?520:300;pVY[i]+=g*dt;pVX[i]*=1-1.6*dt;pX[i]+=pVX[i]*dt;pY[i]+=pVY[i]*dt;if(pY[i]>4&&pVY[i]>0){pY[i]=4;pVY[i]*=-.35;pVX[i]*=.7;}}
}
function drawParticles438(){
 if(!pN438)return;ctx.save();ctx.globalCompositeOperation='lighter';
 for(var i=0;i<pN438;i++){if(pKind[i]===1)continue;var p=point(pWX[i],pWY[i]),x=p.x+pX[i]*zoom,y=p.y+pY[i]*zoom,v=pLife[i]/pMax[i];
  ctx.globalAlpha=Math.min(1,v*1.6);ctx.strokeStyle=COLORS438[pCol[i]];ctx.lineWidth=pSize[i]*zoom;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-pVX[i]*.035*zoom,y-pVY[i]*.035*zoom);ctx.stroke();}
 ctx.globalCompositeOperation='source-over';
 for(i=0;i<pN438;i++){if(pKind[i]!==1)continue;p=point(pWX[i],pWY[i]);x=p.x+pX[i]*zoom;y=p.y+pY[i]*zoom;v=pLife[i]/pMax[i];ctx.globalAlpha=Math.min(1,v*2);ctx.fillStyle=COLORS438[pCol[i]];var s=pSize[i]*zoom;ctx.fillRect(x-s/2,y-s/2,s,s);}
 ctx.restore();
}

// ---------- pooled floating texts on the battlefield ----------
var TXT438=[];for(var ti438=0;ti438<28;ti438++)TXT438.push({on:false,wx:0,wy:0,t:0,max:1,text:'',color:'#fff',size:16,dy:0});
function float438(wx,wy,text,color,o){o=o||{};var best=null;for(var i=0;i<TXT438.length;i++){var f=TXT438[i];if(!f.on){best=f;break;}if(!best||f.t>best.t)best=f;}
 best.on=true;best.wx=wx;best.wy=wy;best.t=0;best.max=o.life||1.25;best.text=String(text);best.color=color||'#fff';best.size=o.size||16;best.dy=o.dy||0;active438(1600);}
function drawTexts438(dt){
 var any=false;for(var i=0;i<TXT438.length;i++){var f=TXT438[i];if(!f.on)continue;f.t+=dt;if(f.t>=f.max){f.on=false;continue;}any=true;
  var u=f.t/f.max,p=point(f.wx,f.wy),pop=u<.18?1-Math.exp(-u*30)*Math.cos(u*40):1,sc=Math.max(.2,pop)*(1+.18*Math.max(0,1-u*6));
  var y=p.y-(48+f.dy)*zoom-u*44,a=u>.7?1-(u-.7)/.3:1;
  ctx.save();ctx.globalAlpha=a;ctx.translate(p.x,y);ctx.scale(sc,sc);ctx.font='900 '+f.size+'px Tahoma,Arial,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.lineJoin='round';ctx.lineWidth=4.5;ctx.strokeStyle='#10314a';ctx.strokeText(f.text,0,0);ctx.fillStyle=f.color;ctx.fillText(f.text,0,0);ctx.restore();}
 return any;
}

// ---------- springs (analytic, no per-frame integration) ----------
var activeUntil438=0;function active438(ms){var t=now438()+ms;if(t>activeUntil438)activeUntil438=t;}
function spring438(start,amp,freq,damp){if(!start)return 0;var s=(now438()-start)/1000;if(s<0||s>1.4)return 0;return amp*Math.exp(-damp*s)*Math.cos(freq*s);}
var bpop438=typeof WeakMap!=='undefined'?new WeakMap():null,bhp438=typeof WeakMap!=='undefined'?new WeakMap():null;
function popBuilding438(b,amp){if(!b||!bpop438)return;bpop438.set(b,{at:now438(),amp:amp||.22});active438(1300);}

// ---------- hooks: buildings ----------
if(typeof drawBuilding==='function'){var building438=drawBuilding;drawBuilding=function(b,enemy){
 if(!b||!bpop438)return building438.apply(this,arguments);
 if(b.hp!==undefined&&(screen==='raid'||screen==='defense')){var old=bhp438.get(b);bhp438.set(b,b.hp);
  if(old!==undefined&&b.hp<old&&b.hp>0){var s0=bpop438.get(b);if(!s0||now438()-s0.at>260)bpop438.set(b,{at:now438(),amp:.07});
   if(screen==='defense'&&b.type!=='wall'){shake438(2.5,170);haptic438('tick');}}}
 var st=bpop438.get(b),a=st?spring438(st.at,st.amp,19,5.5):0;
 if(!a||reduced438)return building438.apply(this,arguments);
 var p=point(b.x,b.y);ctx.save();ctx.translate(p.x,p.y);ctx.scale(1+a*.75,1-a);ctx.translate(-p.x,-p.y);
 try{return building438.apply(this,arguments);}finally{ctx.restore();}
};}

// ---------- hooks: troops (pop-in, bouncy walk, squash when firing) ----------
if(typeof sprite392==='function'){var sprite438=sprite392;sprite392=function(t,u,enemy,z,flip){
 if(!t||t.hp<=0||t.titan342||reduced438)return sprite438.apply(this,arguments);
 var n=now438();if(!t.born438)t.born438=n;
 if((t.recoil||0)>0&&!(t.rc438>0))t.atk438=n;t.rc438=t.recoil||0;
 var odo=t.odo392||0,moving=odo!==t.odo438;t.odo438=odo;
 var sx=1,sy=1,hop=0,age=(n-t.born438)/1000;
 if(age<.6){var pop=1-Math.exp(-7.5*age)*Math.cos(15*age);sx=sy=Math.max(.05,pop);}
 var at=spring438(t.atk438,.16,20,9);if(at){sy*=1-at;sx*=1+at*.8;}
 if(moving){var w=Math.sin(odo*Math.PI*3);sy*=1+.05*w;sx*=1-.035*w;hop=Math.abs(w)*2.2*(z||1);}
 if(sx===1&&sy===1&&!hop)return sprite438.apply(this,arguments);
 ctx.save();if(hop)ctx.translate(0,-hop);ctx.scale(sx,sy);
 try{return sprite438.apply(this,arguments);}finally{ctx.restore();}
};}

// ---------- hooks: completion / destruction bursts ----------
var lastDestroyed438=null;
if(typeof burst249==='function'){var burst438=burst249;burst249=function(b,kind){
 var r=burst438.apply(this,arguments);
 try{if(kind==='complete'&&screen==='home'){spawn438(b.x,b.y,30,{colors:[0,1,2,3,4],speed:170,boost:70,life:.9});popBuilding438(b,.26);
   float438(b.x,b.y,(b.lv||1)>1?'Lv '+b.lv+'!':(root.NovaI18n&&root.NovaI18n.language==='en'?'Done!':'เสร็จแล้ว!'),'#fff07a',{size:18});haptic438('success');}
  else if(kind==='destroy'){lastDestroyed438=b;spawn438(b.x,b.y,16,{colors:[8,9,1],speed:150,kind:1,size:4,life:1});spawn438(b.x,b.y,18,{colors:[0,1,3],speed:200,boost:60,life:.6});
   if(screen==='raid'){shake438(b.type==='wall'?2:6,b.type==='wall'?150:300);haptic438(b.type==='wall'?'tick':'heavy');}
   else if(screen==='defense'){shake438(5,280);haptic438('medium');}}}catch(e){}
 return r;
};}

// ---------- hooks: build / upgrade / deploy actions ----------
function spent438(before,b){
 var dg=Math.round(before.gold-(E.d.gold||0)),dp=Math.round(before.power-(E.d.power||0)),dz=Math.round(before.crystals-(E.d.crystals||0)),k=0;
 if(dg>0){float438(b.x,b.y,'-'+dg.toLocaleString(),'#ffe14d',{dy:k*18});k++;}
 if(dp>0){float438(b.x,b.y,'-'+dp.toLocaleString(),'#8dff6a',{dy:k*18});k++;}
 if(dz>0){float438(b.x,b.y,'-'+dz.toLocaleString(),'#ff8f8f',{dy:k*18});}
}
function wallet438(){return {gold:+E.d.gold||0,power:+E.d.power||0,crystals:+E.d.crystals||0};}
if(typeof Engine==='function'&&Engine.prototype){
 ['build','upgrade'].forEach(function(name){var orig=Engine.prototype[name];if(typeof orig!=='function')return;
  Engine.prototype[name]=function(){var before=this===E?wallet438():null,ids=this===E?this.d.buildings.length:0,arg=arguments[0],msg=orig.apply(this,arguments);
   try{if(!msg&&before&&screen==='home'){var list=this.d.buildings,b=name==='upgrade'?list.find(function(x){return x.id===arg;}):list.length>ids?list[list.length-1]:null;
    if(b){spawn438(b.x,b.y,22,{colors:[0,1,7,3],speed:140,boost:50,life:.7});popBuilding438(b,.18);spent438(before,b);if(name==='upgrade')float438(b.x,b.y,'⬆','#a8fff1',{size:22,dy:-26,life:.9});haptic438('medium');}}}catch(e){}
   return msg;};});
 var deploy438=Engine.prototype.deploy;if(typeof deploy438==='function')Engine.prototype.deploy=function(i,x,y){var msg=deploy438.apply(this,arguments);
  if(!msg&&this===E&&screen==='raid'){try{spawn438(x,y,6,{colors:[3,2],speed:70,boost:20,life:.35,size:2});haptic438('tick');}catch(e){}}return msg;};
}

// ---------- raid loot popping out of storages ----------
var lootSeen438=null,lootRaid438=null,lootAt438=0;
function lootWatch438(){
 var r=screen==='raid'?E.raid:null;if(!r||!r.campaign299||typeof storageLoot299!=='function'){lootRaid438=null;return;}
 var t=now438();if(t-lootAt438<180)return;lootAt438=t;var o;try{o=storageLoot299(r);}catch(e){return;}if(!o||!o.taken)return;
 if(lootRaid438!==r){lootRaid438=r;lootSeen438={gold:o.taken.gold||0,power:o.taken.power||0};return;}
 var dg=(o.taken.gold||0)-lootSeen438.gold,dp=(o.taken.power||0)-lootSeen438.power,b=lastDestroyed438&&r.buildings.indexOf(lastDestroyed438)>=0?lastDestroyed438:r.buildings.find(function(x){return x.type==='hq';})||{x:(r.mapSize||12)/2,y:(r.mapSize||12)/2};
 if(dg>=1){float438(b.x,b.y,'+'+Math.round(dg).toLocaleString(),'#ffe14d',{size:17});spawn438(b.x,b.y,10,{colors:[7,1,0],speed:120,boost:80,life:.8});}
 if(dp>=1){float438(b.x,b.y,'+'+Math.round(dp).toLocaleString(),'#8dff6a',{size:17,dy:26});spawn438(b.x,b.y,10,{colors:[6,2,3],speed:120,boost:80,life:.8});}
 lootSeen438.gold=o.taken.gold||0;lootSeen438.power=o.taken.power||0;
}

// ---------- smooth camera: swipe inertia, eased zoom buttons, wheel zoom ----------
var glide438={vx:0,vy:0,on:false},panSamples438=[],zoomAnim438=null;
function clampPan438(){panX=Math.max(-650,Math.min(650,panX));panY=Math.max(-650,Math.min(350,panY));}
function zoomTo438(target,ax,ay){
 target=Math.max(.35,Math.min(1.5,target));if(reduced438){var q0=unpoint(ax,ay);zoom=target;panX=ax-originX-(q0.x-q0.y)*tile*zoom;panY=ay-originY-(q0.x+q0.y)*tile*ISO412*zoom;clampPan438();drawNeeded=true;return;}
 zoomAnim438={from:zoom,to:target,at:now438(),ms:240,ax:ax,ay:ay,q:unpoint(ax,ay)};glide438.on=false;active438(300);
}
function stepCamera438(dt){
 if(zoomAnim438){var z=zoomAnim438,u=Math.min(1,(now438()-z.at)/z.ms),e=1-Math.pow(1-u,3);zoom=z.from+(z.to-z.from)*e;
  panX=z.ax-originX-(z.q.x-z.q.y)*tile*zoom;panY=z.ay-originY-(z.q.x+z.q.y)*tile*ISO412*zoom;clampPan438();drawNeeded=true;if(u>=1)zoomAnim438=null;}
 if(glide438.on){if(drag||pinchConsumed302){glide438.on=false;return;}var ms=dt*1000;panX+=glide438.vx*ms;panY+=glide438.vy*ms;var f=Math.exp(-ms/260);glide438.vx*=f;glide438.vy*=f;
  var bx=panX,by=panY;clampPan438();if(bx!==panX)glide438.vx=0;if(by!==panY)glide438.vy=0;drawNeeded=true;
  if(Math.abs(glide438.vx)+Math.abs(glide438.vy)<.012){glide438.on=false;if(typeof hud==='function')try{hud();}catch(e){}}}
}
if(canvas&&canvas.addEventListener){
 canvas.addEventListener('pointerdown',function(){glide438.on=false;zoomAnim438=null;panSamples438.length=0;},true);
 canvas.addEventListener('pointermove',function(e){if(!drag||drag.id!==e.pointerId||!drag.moved||drag.moveMode||drag.wall268||pinchConsumed302)return;
  panSamples438.push({t:now438(),x:panX,y:panY});if(panSamples438.length>6)panSamples438.shift();});
 canvas.addEventListener('pointerup',function(){var s=panSamples438;panSamples438=[];if(s.length<2||reduced438||pinchConsumed302)return;var a=s[0],b=s[s.length-1],t=now438();
  if(t-b.t>70)return;var span=Math.max(16,b.t-a.t),vx=(b.x-a.x)/span,vy=(b.y-a.y)/span;if(Math.abs(vx)+Math.abs(vy)<.18)return;
  glide438.vx=Math.max(-3,Math.min(3,vx));glide438.vy=Math.max(-3,Math.min(3,vy));glide438.on=true;active438(1500);});
 canvas.addEventListener('wheel',function(e){if(screen!=='home'&&screen!=='raid'&&screen!=='defense')return;e.preventDefault();var r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*viewWidth/r.width,y=(e.clientY-r.top)*viewHeight/r.height;
  zoomTo438((zoomAnim438?zoomAnim438.to:zoom)*Math.exp(-e.deltaY*.0016),x,y);},{passive:false});
}
if(root.Game&&typeof root.Game.zoom==='function')root.Game.zoom=function(v){zoomTo438((zoomAnim438?zoomAnim438.to:zoom)+v*1.6,viewWidth/2,viewHeight/2);};

// ---------- 60 FPS battle pacing ----------
// Before: battles started at 30 FPS and only reached 60 when a frame cost under 9 ms. Now they run at 60
// while frames cost under 11 ms and fall back to 30 only when the phone really can't keep up (>15 ms).
if(typeof frameCost420==='function'){frameGap420=15;frameCost420=function(ms){frameAvg420=frameAvg420*.92+ms*.08;frameGap420=frameAvg420<11?15:frameAvg420>15?32:frameGap420;};}

// ---------- per-frame driver (runs inside the game loop, before draw) ----------
var lastStep438=0;
if(typeof monitorBuild249==='function'){var monitor438=monitorBuild249;monitorBuild249=function(){
 monitor438.apply(this,arguments);var t=now438(),dt=lastStep438?Math.min(.05,(t-lastStep438)/1000):.016;lastStep438=t;
 try{stepCamera438(dt);if(pN438)stepParticles438(dt);lootWatch438();if(t<activeUntil438||pN438)drawNeeded=true;}catch(e){}
};}
var lastDraw438=0;
if(typeof draw==='function'){var draw438=draw;draw=function(){draw438.apply(this,arguments);
 var t=now438(),dt=lastDraw438?Math.min(.05,(t-lastDraw438)/1000):.016;lastDraw438=t;
 try{drawParticles438();if(drawTexts438(dt))drawNeeded=true;}catch(e){}
};}

// ---------- DOM: press feedback, sound, haptic tick, HUD +/- numbers ----------
(function(){
 if(typeof document==='undefined'||!document.documentElement||!document.createElement)return;
 try{document.documentElement.setAttribute('data-ui438','1');var st=document.createElement('style');st.id='ui438';st.textContent=juiceCSS438;(document.head||document.documentElement).appendChild(st);}catch(e){}
 var pressed=null,timer=null;
 function release(){var el=pressed;pressed=null;clearTimeout(timer);if(el)timer=setTimeout(function(){el.classList.remove('press438');},70);}
 if(document.addEventListener){
  document.addEventListener('pointerdown',function(e){var el=e.target&&e.target.closest&&e.target.closest('button,[role="button"],.c394-go');if(!el||el.disabled||el===canvas)return;
   if(pressed&&pressed!==el)pressed.classList.remove('press438');pressed=el;clearTimeout(timer);el.classList.add('press438');
   var big=el.classList.contains('green')||el.classList.contains('attack261')||el.id==='playerSearch382';clickSound438(big);haptic438(big?'light':'tick');},true);
  ['pointerup','pointercancel','dragstart'].forEach(function(n){document.addEventListener(n,release,true);});
  document.addEventListener('touchstart',function(){},{passive:true}); // enables :active on iOS-style webviews
 }
 // HUD numbers: pooled DOM pops beside the counter that changed.
 var layer=null,pops=[],slot=0,seen=null,owner=null;
 function ensure(){if(layer&&layer.isConnected)return layer;layer=document.createElement('div');layer.id='fx438';layer.setAttribute('aria-hidden','true');pops=[];for(var i=0;i<10;i++){var s=document.createElement('span');s.className='pop438';layer.appendChild(s);pops.push(s);}document.body.appendChild(layer);return layer;}
 function pop(anchor,text,cls,k){if(!anchor||!anchor.getBoundingClientRect||!document.body)return;ensure();var r=anchor.getBoundingClientRect();if(!r.width)return;var s=pops[slot++%pops.length];
  s.className='pop438 '+cls;s.textContent=text;s.style.setProperty('--x',Math.round(r.left+r.width/2-12)+'px');s.style.setProperty('--y',Math.round(r.bottom+10+k*18)+'px');void s.offsetWidth;s.classList.add('go');
  var chip=anchor.closest&&anchor.closest('span,button');if(chip&&cls.indexOf('gain')===0){chip.classList.add('bump438');setTimeout(function(){chip.classList.remove('bump438');},180);}}
 function watch(){
  try{if(!E||!E.d||document.hidden)return;var d=E.d,cur={gold:Math.floor(+d.gold||0),power:Math.floor(+d.power||0),gems:Math.floor(+d.gems||0)};
   if(owner!==d){owner=d;seen=cur;return;}
   var ids={gold:'gold',power:'energy',gems:'gems'},k=0;
   ['gold','power','gems'].forEach(function(n){var diff=cur[n]-seen[n],min=n==='gems'?1:60;
    if(diff>=min){pop(document.getElementById(ids[n]),'+'+diff.toLocaleString(),'gain-'+n,k++);if(n==='gems'||diff>=500)haptic438('light');}
    else if(diff<=-min&&screen==='home')pop(document.getElementById(ids[n]),'−'+(-diff).toLocaleString(),'spend',k++);});
   seen=cur;}catch(e){}
 }
 if(typeof setInterval==='function')setInterval(watch,300);
})();
root.NovaJuice438={haptic:haptic438,shake:shake438,spawn:spawn438,float:float438,setHaptics:function(on){try{localStorage.setItem('novaHaptics438',on?'1':'0');}catch(e){}}};
