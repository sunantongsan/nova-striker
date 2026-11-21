// 437: smoother raids.
//  * Fallen troops are cleared from the battlefield a few seconds after their death animation (offline raids:
//    bot bases, alien raids, practice). Before, every fallen unit stayed in the troop list for the whole battle,
//    was redrawn every frame and counted toward the battlefield limit, so "battlefield full" showed up with only a
//    handful of troops alive. The limit itself now counts living troops only (see source379.cjs).
//  * Wall pieces are drawn once into a small picture per shape (which neighbours it joins, level, side, zoom) and
//    re-used, instead of drawing ~40 small faces per wall piece every frame. Wall guns still aim live on top.
//  * Missile craters are drawn once into a small picture each and faded, instead of ~50 shapes per crater per frame.
var CORPSE_MS437=3500;
function pruneDead437(){
 var r=screen==='raid'?E.raid:null;if(!r||!Array.isArray(r.troops)||r.liveMode||(typeof liveRoom!=='undefined'&&liveRoom&&!liveRoom.finished))return;
 var now=Date.now(),list=r.troops,keep=0;
 for(var i=0;i<list.length;i++){var t=list[i];
  if(t&&!(t.hp>0)&&!t.titan342){if(!t.gone437)t.gone437=now;if(now-t.gone437>CORPSE_MS437)continue;}
  list[keep++]=t;}
 if(keep!==list.length)list.length=keep;// same array, trimmed in place (other code may hold it)
}
setInterval(function(){try{pruneDead437();}catch(e){}},500);

// ---------- wall sprites ----------
var wallCache437={},wallCacheZoom437=0,wallCacheScale437=0,wallCacheCount437=0;
var drawWall437=drawWall;
drawWall=function(b,enemy,preview){
 if(preview||!b||typeof document==='undefined'||!document.createElement)return drawWall437.apply(this,arguments);
 var bs=screen==='defense'?E.defense.buildings:screen==='raid'?E.raid.buildings:E.d.buildings;
 function near(dx,dy){var w=wallIndex219?wallIndex219.get((b.x+dx)+','+(b.y+dy)):bs.find(function(w){return w.type==='wall'&&w.x===b.x+dx&&w.y===b.y+dy;});return !!(w&&(w.hp===undefined||w.hp>0));}
 var scale=renderScale226(),z=Math.round(zoom*100)/100;
 if(z!==wallCacheZoom437||scale!==wallCacheScale437||wallCacheCount437>400){wallCache437={};wallCacheZoom437=z;wallCacheScale437=scale;wallCacheCount437=0;}
 var art=wallArt274.complete&&wallArt274.naturalWidth?1:0,lv=Math.max(1,b.lv||1);
 var key=(near(-1,0)?1:0)+(near(0,-1)?2:0)+(near(1,0)?4:0)+(near(0,1)?8:0)+':'+lv+':'+(enemy?1:0)+':'+art;
 var spr=wallCache437[key];
 if(!spr){
  var W=Math.ceil(tile*zoom*2.4)+4,top=Math.ceil(60*zoom)+4,H=top+Math.ceil(tile*ISO412*zoom*1.4)+4,c=document.createElement('canvas');
  c.width=Math.max(1,Math.ceil(W*scale));c.height=Math.max(1,Math.ceil(H*scale));
  var g=c.getContext('2d');if(!g)return drawWall437.apply(this,arguments);
  g.setTransform(scale,0,0,scale,0,0);
  var oldCtx=ctx,oldPoint=point,ox=W/2,oy=top;
  try{ctx=g;point=function(x,y){return {x:ox+((x-b.x)-(y-b.y))*tile*zoom,y:oy+((x-b.x)+(y-b.y))*tile*ISO412*zoom};};drawWall437.call(this,b,enemy);}
  finally{ctx=oldCtx;point=oldPoint;}
  spr=wallCache437[key]={c:c,w:W,h:H,ox:ox,oy:oy};wallCacheCount437++;
 }
 var p=point(b.x,b.y);ctx.drawImage(spr.c,p.x-spr.ox,p.y-spr.oy,spr.w,spr.h);
};

// ---------- crater sprites ----------
function craterSprite437(c,r){
 var key=Math.round(zoom*100)+':'+renderScale226();if(c.spr437&&c.spr437.key===key)return c.spr437;
 var scale=renderScale226(),R=r*1.5+3,W=Math.ceil(R*2),H=Math.ceil(R*2*.56)+2,cv=document.createElement('canvas');
 cv.width=Math.max(1,Math.ceil(W*scale));cv.height=Math.max(1,Math.ceil(H*scale));var g=cv.getContext('2d');if(!g)return null;
 g.setTransform(scale,0,0,scale,0,0);var old=ctx;
 try{ctx=g;ctx.translate(W/2,H/2);ctx.scale(1,.56);
  function noise(i){var n=Math.sin(i*12.9898+c.x*78.233+c.y*37.719)*43758.5453;return n-Math.floor(n);}
  function rim(s,dy){ctx.beginPath();for(var i=0;i<28;i++){var a=i*Math.PI*2/28,rr=r*s*(.86+noise(i)*.26),x=Math.cos(a)*rr,y=Math.sin(a)*rr+dy;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.closePath();}
  var dust=ctx.createRadialGradient(0,0,r*.45,0,0,r*1.45);if(dust&&dust.addColorStop){dust.addColorStop(0,'#39291d99');dust.addColorStop(.65,'#60452e77');dust.addColorStop(1,'#76553600');}else dust='#60452e77';disk(0,0,r*1.45,dust);
  rim(1,0);ctx.fillStyle='#70553a';ctx.fill();var bowl=ctx.createLinearGradient(0,-r,0,r);if(bowl&&bowl.addColorStop){bowl.addColorStop(0,'#241a15');bowl.addColorStop(.45,'#38271c');bowl.addColorStop(1,'#9b7850');}else bowl='#38271c';rim(.81,r*.05);ctx.fillStyle=bowl;ctx.fill();
  for(var i=0;i<32;i++){var a=i*2.39996,rr=r*(.7+noise(i+31)*.6),x=Math.cos(a)*rr,y=Math.sin(a)*rr;ctx.fillStyle=i%3?'#65472e':'#b18a59';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(noise(i+70)*4+1)*zoom,y+zoom);ctx.lineTo(x-zoom,y+(noise(i+40)*4+1)*zoom);ctx.closePath();ctx.fill();}
  ctx.strokeStyle='#37291d88';ctx.lineWidth=.65*zoom;for(var k=0;k<9;k++){var a2=k*2.4;ctx.beginPath();ctx.moveTo(Math.cos(a2)*r*.95,Math.sin(a2)*r*.95);ctx.lineTo(Math.cos(a2+.08)*r*1.14,Math.sin(a2+.08)*r*1.14);ctx.lineTo(Math.cos(a2+.02)*r*(1.2+noise(k)*.18),Math.sin(a2+.02)*r*(1.2+noise(k)*.18));ctx.stroke();}
 }finally{ctx=old;}
 return c.spr437={key:key,c:cv,w:W,h:H};
}
var craters437=drawCraters272;
drawCraters272=function(scene){
 if(!scene||typeof document==='undefined'||!document.createElement)return craters437.apply(this,arguments);
 var now=Date.now();scene.craters272=(scene.craters272||[]).filter(function(c){return now-c.born<25000;});
 (scene.fx||[]).forEach(function(f){if(f.weapon!=='missile'||f.life/(f.maxLife||.48)>.34||f.crater272)return;f.crater272=true;var old=scene.craters272.find(function(c){return Math.hypot(c.x-f.tx,c.y-f.ty)<.5;});if(old){old.born=now;return;}scene.craters272.push({x:f.tx,y:f.ty,born:now,r:f.highArc?2.2*Math.SQRT2*tile*.38:10});});
 scene.craters272=scene.craters272.slice(-48);
 scene.craters272.forEach(function(c){var p=point(c.x,c.y),r=c.r*zoom,age=now-c.born,s=craterSprite437(c,r);if(!s)return;
  ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,(25000-age)/13000));ctx.drawImage(s.c,p.x-s.w/2,p.y-s.h/2,s.w,s.h);ctx.restore();});
};

// ---------- 437b: no more wall guns ----------
// Walls are walls again: the level-15+ machine gun on every wall piece is gone (no shooting, no gun drawn, no
// "unlocks at level 15" line). Hundreds of tiny guns were cluttering big bases, slowing battles down and pinning
// the NOVA mech against the walls.
wallStats383=function(lv){return {armed:false,range:0,damage:0,rate:.9};};
tickWalls383=function(){};
drawWallGun383=function(){};
(function(){var info=defenseInfo223;defenseInfo223=function(b){return b&&b.type==='wall'?'':info.apply(this,arguments);};})();

// ---------- 437c: a smarter NOVA mech in raids ----------
// Before, the mech went for whatever was closest, which in a walled base is nearly always a wall piece, and planned
// its path around the walls, so it stood hacking at walls in the same spot. Now, like a Clash hero, it goes for the
// nearest real target (defenders and buildings, not walls), heads straight there and leaps over walls on the way.
// If it really cannot get through for a moment, it cuts through the wall piece in front of it, then carries on.
function raidMech437(scene,t){return !scene.defenders&&!scene.home355&&Array.isArray(scene.troops)&&scene.troops.indexOf(t)>=0;}
function wallAhead437(scene,t,target){var a=Math.atan2(target.y-t.y,target.x-t.x),best=null,bd=1e9;
 scene.buildings.forEach(function(b){if(b.type!=='wall'||!(b.hp>0))return;var d=Math.hypot(b.x-t.x,b.y-t.y);if(d>1.8)return;var off=Math.abs(Math.atan2(Math.sin(Math.atan2(b.y-t.y,b.x-t.x)-a),Math.cos(Math.atan2(b.y-t.y,b.x-t.x)-a)));if(off>1.2)return;if(d<bd){bd=d;best=b;}});return best;}
var titanTick437=titanTick342;
titanTick342=function(scene,t,dt){
 if(!raidMech437(scene,t)||t.hp<=0||t.manual342)return titanTick437.apply(this,arguments);
 var all=titanEnemies342(scene,t).filter(function(v){return v.hp>0;}),main=all.filter(function(v){return v.type!=='wall';}),ground=main.filter(function(v){return !air277(v);});
 // flying guards are left to the troops and to the mech's palm blast; chasing one it cannot reach froze it in place
 if(ground.length)main=ground;
 if(!main.length||t.pending342||t.jump345||t.stun>0)return titanTick437.apply(this,arguments);
 // pick the target: the wall we are cutting through, otherwise the nearest real target
 var target=t.wall437&&t.wall437.hp>0?t.wall437:null;if(!target){t.wall437=null;target=main.sort(function(a,b){return dist(t,a)-dist(t,b);})[0];}
 // stuck check: trying to move but hardly moved for a second -> cut the wall in front
 var px=t.x,py=t.y;
 var keepEnemies=titanEnemies342,keepRoute=route;
 titanEnemies342=function(s,v){var list=keepEnemies(s,v);return v===t?list.filter(function(e){return e===target||(e.type!=='wall'&&(!ground.length||!air277(e)));}):list;};
 route=function(a,b,buildings,range,max){if(a===t)buildings=buildings.filter(function(x){return x.type!=='wall'||x===target;});return keepRoute.call(this,a,b,buildings,range,max);};
 try{titanTick437.apply(this,arguments);}finally{titanEnemies342=keepEnemies;route=keepRoute;}
 var moved=Math.hypot(t.x-px,t.y-py);
 if(target.type!=='wall'&&dist(t,target)>2.4&&!t.jump345&&!t.pending342){t.stuck437=moved<.01*Math.max(1,dt*60)?(t.stuck437||0)+dt:Math.max(0,(t.stuck437||0)-dt*2);
  if(t.stuck437>1){var w=wallAhead437(scene,t,target);if(w){t.wall437=w;t.route=[];}t.stuck437=0;}}
 else t.stuck437=0;
};

// ---------- 437d: building level details as pictures ----------
// The armour pods, vents and lights that show a building's level depend only on its type, level and size, but were
// drawn shape by shape (twice per building) every frame. They are now drawn once per type/level/zoom and re-used.
// trim a sprite canvas to its visible pixels so each blit touches as few pixels as possible
function crop437(c,scale,W,H,ox,oy){
 try{var g=c.getContext('2d'),d=g.getImageData(0,0,c.width,c.height).data,cw=c.width,ch=c.height,x0=cw,y0=ch,x1=-1,y1=-1;
  for(var y=0;y<ch;y++)for(var x=0;x<cw;x++)if(d[(y*cw+x)*4+3]>2){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
  if(x1<0)return {c:null};
  x0=Math.max(0,x0-1);y0=Math.max(0,y0-1);x1=Math.min(cw-1,x1+1);y1=Math.min(ch-1,y1+1);
  var out=document.createElement('canvas');out.width=x1-x0+1;out.height=y1-y0+1;out.getContext('2d').drawImage(c,x0,y0,out.width,out.height,0,0,out.width,out.height);
  return {c:out,w:out.width/scale,h:out.height/scale,ox:ox-x0/scale,oy:oy-y0/scale};
 }catch(e){return {c:c,w:W,h:H,ox:ox,oy:oy};}
}
var struct437=buildingStructure265,structCache437={},structCount437=0,structKey437='';
buildingStructure265=function(b,p,size,front){
 var lv=Math.max(1,Math.min(20,b&&b.lv||1));
 if(!b||lv===1||b.type==='wall'||b.type==='cannonturret'||typeof document==='undefined'||!document.createElement||!(size>0))return struct437.apply(this,arguments);
 var scale=renderScale226(),zk=Math.round(size*2)/2+':'+scale;
 if(scale!==structKey437||structCount437>300){structCache437={};structCount437=0;structKey437=scale;}
 var key=zk+':'+b.type+':'+lv+':'+(front?1:0),s=structCache437[key];
 if(!s){var k=size/80,L=60*k,R=60*k,U=95*k,D=40*k,W=Math.ceil(L+R),H=Math.ceil(U+D),c=document.createElement('canvas');
  c.width=Math.max(1,Math.ceil(W*scale));c.height=Math.max(1,Math.ceil(H*scale));var g=c.getContext('2d');if(!g)return struct437.apply(this,arguments);
  g.setTransform(scale,0,0,scale,0,0);var old=ctx;try{ctx=g;struct437.call(this,b,{x:L,y:U},size,front);}finally{ctx=old;}
  s=crop437(c,scale,W,H,L,U);structCache437[key]=s;structCount437++;}
 if(!s.c)return;
 ctx.drawImage(s.c,p.x-s.ox,p.y-s.oy,s.w,s.h);
};

// ---------- 437e: the mech never gets pinned ----------
// It used to stop dead against any building other than a wall (it could only hop walls), and once it ended up
// overlapping a building every step counted as blocked, so it shuffled on the spot even with the stick held.
// Now it steers around what is in the way (tries angles up to 90 degrees), walks out freely when it is already
// overlapping something, and when you push it into a building for a moment it swings its sword at it.
titanMove342=function(scene,t,dx,dy,dt,speed){
 if(t.jump345)return;var len=Math.hypot(dx,dy);if(!len)return;
 var a=Math.atan2(dy,dx),step=Math.min(len,speed*dt),here=titanBlocked342(scene,t.x,t.y),px=t.x,py=t.y;
 t.aim=t.heading=a;t.moving=true;
 var x=t.x+Math.cos(a)*step,y=t.y+Math.sin(a)*step,max=(scene.mapSize||22)-1;
 // already overlapping something: any step that moves away from what it overlaps is allowed, so it can walk out
 function out(ax,ay){return Math.max(0,.4-ax)+Math.max(0,.4-ay)+Math.max(0,ax-(max-.4))+Math.max(0,ay-(max-.4));}
 function escapes(nx,ny){if(out(nx,ny)>out(px,py)+1e-9)return false;return scene.buildings.every(function(b){if(!(b.hp>0)||trap278(b)||Math.abs(px-b.x)>=.75||Math.abs(py-b.y)>=.75)return Math.abs(nx-b.x)>=.75||Math.abs(ny-b.y)>=.75||!(b.hp>0)||trap278(b);return Math.hypot(nx-b.x,ny-b.y)>=Math.hypot(px-b.x,py-b.y)-1e-6;});}
 function free(nx,ny){return here?escapes(nx,ny):!titanBlocked342(scene,nx,ny);}
 if(free(x,y)){t.x=x;t.y=y;}
 else if(titanJump345(scene,t,dx,dy))return;
 else{var turns=[.45,-.45,.9,-.9,1.35,-1.35,1.57,-1.57],side=t.side437||1;
  for(var i=0;i<turns.length;i++){var b=a+turns[i]*side,nx=t.x+Math.cos(b)*step,ny=t.y+Math.sin(b)*step;
   if(free(nx,ny)){t.x=nx;t.y=ny;if(turns[i]<0)t.side437=-side;break;}}}
 var moved=Math.hypot(t.x-px,t.y-py);t.blocked437=moved<step*.3?(t.blocked437||0)+dt:0;
};
var manualTick437=titanTick342;
titanTick342=function(scene,t,dt){
 if(t&&t.manual342&&t.hp>0&&!t.pending342&&!t.jump345&&!(t.stun>0)&&(t.blocked437||0)>.45&&t.cool<=0&&Array.isArray(scene.buildings)){
  var m=t.input342||{x:0,y:0};if(Math.hypot(m.x,m.y)>.1){var a=Math.atan2(m.y,m.x),best=null,bd=1e9;
   scene.buildings.forEach(function(b){if(!(b.hp>0)||trap278(b))return;var d=Math.hypot(b.x-t.x,b.y-t.y);if(d>2)return;var off=Math.abs(Math.atan2(Math.sin(Math.atan2(b.y-t.y,b.x-t.x)-a),Math.cos(Math.atan2(b.y-t.y,b.x-t.x)-a)));if(off>1.1)return;if(d<bd){bd=d;best=b;}});
   if(best&&(!scene.defenders||scene.enemies&&scene.enemies.indexOf(best)>=0||scene.buildings.indexOf(best)>=0&&!scene.home355)){
    t.aim=t.heading=Math.atan2(best.y-t.y,best.x-t.x);t.cool=1.8;t.action342='SwordSlash';t.actionTime342=1.1;t.actionSeq342=(t.actionSeq342||0)+1;
    t.pending342={id:'slash',remaining:.42,angle:t.aim,x:best.x,y:best.y};t.blocked437=0;
    if(scene.fx)scene.fx.push({weapon:'titan342',skill342:'slash',x:t.x,y:t.y,tx:best.x,ty:best.y,angle:t.aim,life:1.1,maxLife:1.1,radius:2.8,color:'#62eaff'});
    t.cooldowns342=t.cooldowns342||{};return;}}}
 return manualTick437.apply(this,arguments);
};

// ---------- 437f: battle mech moves like it does at home ----------
// At home the mech somersaults over anything in its way; in battle it could only hop walls, so any building or
// heap in front stopped it. Now in battle too: if a wall jump is not possible it leaps over whatever blocks it and
// lands on the nearest clear ground ahead (same leap as at home). Tesla zaps no longer freeze the giant mech.
var jump437=titanJump345;
titanJump345=function(scene,t,dx,dy){
 if(jump437.apply(this,arguments))return true;
 if(!scene||scene.home355||t.jump345||t.jumpCooldown345>0)return false;
 if(titanHomeJump355(scene,t,dx,dy)){t.jumpCooldown345=1.2;return true;}
 return false;
};
var stunTick437=titanTick342;
titanTick342=function(scene,t,dt){if(t&&t.titan342&&t.stun>0)t.stun=0;return stunTick437.apply(this,arguments);};

// ---------- 437g: Clash-style health bars, quiet taps ----------
// A building shows its health bar only once it has been hit (like Clash), so a big base is no longer covered in
// hundreds of full green bars on every wall piece - less clutter and less to draw each frame.
var hpQuiet437=false,box437=box;
box=function(x,y,w,h,c){if(hpQuiet437&&h===4&&w<=30&&(c==='#263745'||c==='#a4ee69'))return;return box437.apply(this,arguments);};
var hpBuilding437=drawBuilding;
drawBuilding=function(b,enemy){var quiet=!!b&&b.hp!==undefined&&b.max>0&&b.hp>=b.max,old=hpQuiet437;hpQuiet437=quiet;try{return hpBuilding437.apply(this,arguments);}finally{hpQuiet437=old;}};
// once the whole army is on the field, tapping the ground just does nothing (no "unit unavailable" message)
var toast437=toast;
toast=function(msg){try{var r=E.raid;if(screen==='raid'&&r&&msg===tr('ไม่มีหน่วยนี้')&&!(r.army||E.d.army||[]).some(function(n){return n>0;}))return;}catch(e){}return toast437.apply(this,arguments);};

// ---------- 437h: pre-sized sprite sheets for everything ----------
// Same idea as the troops: buildings, storage tanks, cannons and vehicles are cut from big sheets (up to 7056px wide)
// and were shrunk to their on-screen size for every building, every frame. On the main battle/home canvas, any
// cut-out from a big sheet that is drawn at less than ~90% of its size now comes from a copy of that sheet shrunk
// once (in halving steps, so it is crisp) to the current zoom. One copy is (re)made per frame at most; until it is
// ready the original sheet is used, so zooming never stalls.
(function(){
 if(!ctx||!ctx.drawImage||typeof document==='undefined'||!document.createElement)return;
 var main=ctx,raw=main.drawImage,built=-1,copies=typeof WeakMap==='function'?new WeakMap():null;if(!copies)return;
 function big(img){if(!img)return false;var ok=(typeof HTMLImageElement!=='undefined'&&img instanceof HTMLImageElement&&img.complete)||(typeof ImageBitmap!=='undefined'&&img instanceof ImageBitmap);if(!ok)return false;var w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;return w*h>=1024*700;}
 function copy(img,f){
  var c=copies.get(img);if(c&&c.f===f)return c;
  if(built===frame)return c||null;built=frame;
  try{var w=img.naturalWidth||img.width,h=img.naturalHeight||img.height,tw=Math.max(1,Math.round(w*f)),th=Math.max(1,Math.round(h*f)),cur=img,cw=w,ch=h;
   while(cw/2>tw){var nw=Math.max(tw,Math.round(cw/2)),nh=Math.max(th,Math.round(ch/2)),cv=document.createElement('canvas');cv.width=nw;cv.height=nh;var g=cv.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(cur,0,0,cw,ch,0,0,nw,nh);cur=cv;cw=nw;ch=nh;}
   var out=document.createElement('canvas');out.width=tw;out.height=th;var o=out.getContext('2d');o.imageSmoothingQuality='high';o.drawImage(cur,0,0,cw,ch,0,0,tw,th);
   c={c:out,f:f,kx:tw/w,ky:th/h};copies.set(img,c);return c;}catch(e){copies.set(img,{f:-1,c:null});return null;}
 }
 main.drawImage=function(img,sx,sy,sw,sh,dx,dy,dw,dh){
  if(arguments.length===9&&sw>0&&sh>0&&big(img)){
   var t=main.getTransform?main.getTransform():null,sc=t?Math.hypot(t.a,t.b):renderScale226(),need=Math.max(Math.abs(dw)/sw,Math.abs(dh)/sh)*sc;
   if(need>0&&need<.9){var f=Math.min(.9,Math.ceil(need*20)/20),c=copy(img,f);
    if(c&&c.c)return raw.call(main,c.c,sx*c.kx,sy*c.ky,sw*c.kx,sh*c.ky,dx,dy,dw,dh);}
  }
  return raw.apply(main,arguments);
 };
})();

// ---------- 437i: dynamic resolution in big battles ----------
// When a battle gets heavy (frame work above ~20ms on average), the battle canvas renders at a slightly lower
// resolution (down to 1.25x) so the frame rate stays steady; it climbs back to full sharpness as soon as the action
// calms down. Home base and menus always keep full resolution. Changes at most once a second, so no flicker.
var dynScale437=9,dynAt437=0,renderScale437=renderScale226;
renderScale226=function(){
 var base=renderScale437.apply(this,arguments),r=screen==='raid'?E.raid:null,battle=r&&r.phase==='battle'&&!r.result;
 if(!battle){dynScale437=9;return base;}
 var now=Date.now();if(now-dynAt437>1000){dynAt437=now;var avg=typeof frameAvg420==='number'?frameAvg420:0;
  if(dynScale437>base)dynScale437=base;
  if(avg>20&&dynScale437>1.25)dynScale437=Math.max(1.25,dynScale437-.25);
  else if(avg<11&&dynScale437<base)dynScale437=Math.min(base,dynScale437+.25);}
 return Math.min(base,dynScale437);
};
