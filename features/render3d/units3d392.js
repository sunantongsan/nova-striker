// 392: pre-rendered 3D troops (ranger 0, battle mech 2, medic drone 3, sniper 4, shield mech 6, plasma trooper 8, heavy assault mech 10).
// idle / walk (by distance travelled) / attack (by recoil) / death. Atlases by render-units.cjs.
var unit3dKinds392={0:{file:'ranger',height:50,perTile:10},1:{file:'archer',height:48,perTile:10},2:{file:'mech',height:55,perTile:8},3:{file:'drone',height:53,perTile:6},4:{file:'sniper',height:46,perTile:10},6:{file:'shield',height:58,perTile:7},8:{file:'plasma',height:48,perTile:9},10:{file:'heavy',height:67,perTile:6}};
Object.keys(unit3dKinds392).forEach(function(k){var s=unit3dKinds392[k];s.meta=unit3dMeta392[s.file];if(!s.meta){delete unit3dKinds392[k];return;}s.img=new Image();s.img.onload=function(){drawNeeded=true;};s.img.src='assets/units3d392-'+s.file+'.webp';});
function unit3dDir392(a){return ((Math.round(a/(Math.PI/4))%8)+8)%8;}
function unit3d392(t,u,enemy,z,flip){
 if(enemy||t.alien)return false;var s=unit3dKinds392[t.kind];if(!s||!s.img.complete||!s.img.naturalWidth)return false;
 var g=unit3dMeta392._,m=s.meta,dx=0,dy=0;
 if(t.lx3d!==undefined){dx=t.x-t.lx3d;dy=t.y-t.ly3d;var d=Math.hypot(dx,dy);if(d<1)t.odo3d=(t.odo3d||0)+d;}
 t.lx3d=t.x;t.ly3d=t.y;
 var moving=!!t.moving&&Math.hypot(dx,dy)>1e-4,a;
 if(moving&&!(t.recoil>0))a=Math.atan2(dy,dx);else a=t.aim===undefined?(t.heading===undefined?Math.PI/4:t.heading):t.aim;
 if(moving||t.recoil>0||t.dir3d===undefined)t.dir3d=unit3dDir392(a);
 var col;
 if(t.hp<=0){var now=Date.now();if(t.die3d===undefined)t.die3d=now;col=g.death[0]+Math.min(g.death[1]-1,Math.floor((now-t.die3d)/130));}
 else{t.die3d=undefined;
  var nowA=Date.now();if((t.recoil||0)>(t.lastRecoil3d||0)+.05)t.atk3d=nowA;t.lastRecoil3d=t.recoil||0;
  if(t.atk3d&&nowA-t.atk3d<520)col=g.attack[0]+Math.min(g.attack[1]-1,Math.floor((nowA-t.atk3d)/520*g.attack[1]));// duck: show the whole swing / shot (about half a second)
  else if(t.moving)col=g.walk[0]+Math.floor((t.odo3d||0)*s.perTile)%g.walk[1];
  else if(t.aimTarget&&t.aimTarget.hp>0)col=g.attack[0];
  else col=g.idle[0]+Math.floor(frame*.07+(t.id||0)*.37)%g.idle[1];}
 var k=s.height*z/m.h;
 // 437: mirror with a scale pair instead of save/restore (cheaper with hundreds of troops on the field)
 if(flip!==1)ctx.scale(flip,1);
 // duck: cartoon attack - stretch up on the wind-up, lunge and squash flat on the hit, spring back
 var atkQ=(t.hp>0&&t.atk3d)?(Date.now()-t.atk3d)/520:9,anim=atkQ<1;
 if(anim){var aa=t.aim||0,ax=Math.cos(aa)-Math.sin(aa),ay=(Math.cos(aa)+Math.sin(aa))*.75,al=Math.hypot(ax,ay)||1,hitW=atkQ<.35?0:Math.sin(Math.min(1,(atkQ-.35)/.45)*Math.PI);
  var lunge=hitW*10*z,qx=atkQ<.35?1-.12*Math.sin(atkQ/.35*Math.PI):1+.28*hitW,qy=atkQ<.35?1+.16*Math.sin(atkQ/.35*Math.PI):1-.22*hitW;
  ctx.save();ctx.translate(ax/al*lunge*flip,ay/al*lunge);ctx.scale(qx,qy);}
 var sh=sheet437(s,k);
 if(sh)ctx.drawImage(sh.c,col*g.cw*sh.f,t.dir3d*g.ch*sh.f,g.cw*sh.f,g.ch*sh.f,-m.ax*k,-m.ay*k,g.cw*k,g.ch*k);
 else ctx.drawImage(s.bmp||s.img,col*g.cw,t.dir3d*g.ch,g.cw,g.ch,-m.ax*k,-m.ay*k,g.cw*k,g.ch*k);
 if(anim)ctx.restore();
 if(flip!==1)ctx.scale(1/flip,1);return true;
}
var unit3dMount392=weaponMount;
weaponMount=function(o){
 var s=o&&!o.type&&!o.alien&&unit3dKinds392[o.kind];
 if(s){var mz=s.meta.muzzle[unit3dDir392(o.aim===undefined?Math.PI/4:o.aim)],k=s.height/s.meta.h;return {x:mz[0]*k,y:mz[1]*k,height:-mz[1]*k};}
 return unit3dMount392(o);
};

// 437: the troop sheets are big (2520x1024). The browser only decodes one the first time it is drawn, so the first drop
// of each troop type froze the battle for a moment (and again whenever a low-memory phone threw the pixels away).
// While a raid is open, the sheets of the troops you bring are decoded in the background into bitmaps that stay ready;
// they are released when you go home.
function warm437(holder,want){
 if(!holder||!holder.img)return;
 if(want){if(holder.bmp||holder.warming437||holder.noBmp437||!holder.img.complete||!holder.img.naturalWidth||typeof createImageBitmap!=='function')return;
  holder.warming437=true;createImageBitmap(holder.img).then(function(b){holder.warming437=false;if(screen==='raid')holder.bmp=b;else if(b.close)b.close();},function(){holder.warming437=false;holder.noBmp437=true;});}
 else if(holder.bmp){try{if(holder.bmp.close)holder.bmp.close();}catch(e){}holder.bmp=null;}
}
function warmUnits437(){
 var r=E&&E.raid,on=screen==='raid'&&r&&!r.result,want={};
 if(on){(r.army||E.d.army||[]).forEach(function(n,i){if(n>0)want[i]=1;});(r.troops||[]).forEach(function(t){if(t&&!t.alien&&!t.titan342)want[t.kind]=1;});}
 Object.keys(unit3dKinds392).forEach(function(k){warm437(unit3dKinds392[k],!!want[k]);});
 if(typeof veh3d392!=='undefined'){var veh=!!(want[1]||want[5]||want[7]||want[9]);Object.keys(veh3d392).forEach(function(n){warm437(veh3d392[n],veh);});}
}
setInterval(function(){try{warmUnits437();}catch(e){}},600);

// 437: Clash-style pre-sized troop sprites. Shrinking a 2520x1024 sheet down to a ~25px troop for every unit every
// frame was the main cost with a full army on the field. Each troop sheet is now shrunk once (in halving steps, so it
// stays crisp) to the size it is actually shown at, and each troop is a plain 1:1 copy. Rebuilt when you zoom,
// at most one sheet per frame so zooming never stalls; until it is ready the full-size sheet is used.
var sheetBuilt437=0;
function sheet437(s,k){
 var src=s.bmp||s.img,sw=src.width||src.naturalWidth,shh=src.height||src.naturalHeight;if(!sw||!shh||typeof document==='undefined'||!document.createElement)return null;
 var f=Math.round(k*renderScale226()*20)/20;if(!(f>0)||f>=.95)return null;
 if(s.sh437&&s.sh437.f===f)return s.sh437;
 if(sheetBuilt437===frame)return s.sh437||null;// one (re)build per frame; meanwhile the previous size is fine
 sheetBuilt437=frame;
 try{var cur=src,cw=sw,ch=shh,tw=Math.max(1,Math.round(sw*f)),th=Math.max(1,Math.round(shh*f));
  while(cw/2>tw){var nw=Math.max(tw,Math.round(cw/2)),nh=Math.max(th,Math.round(ch/2)),c=document.createElement('canvas');c.width=nw;c.height=nh;var g=c.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(cur,0,0,cw,ch,0,0,nw,nh);cur=c;cw=nw;ch=nh;}
  var out=document.createElement('canvas');out.width=tw;out.height=th;var o=out.getContext('2d');o.imageSmoothingQuality='high';o.drawImage(cur,0,0,cw,ch,0,0,tw,th);
  s.sh437={c:out,f:f};return s.sh437;}catch(e){return null;}
}
