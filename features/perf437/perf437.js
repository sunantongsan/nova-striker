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
