// 392: hidden missile silo (ground rocket battery). Closed bunker at rest; when hostiles come
// in range the hatch opens and the launcher rises (8 drawn frames), it faces the target side
// and missiles leave from the launcher tip; it closes again when the area is clear.
// 20 levels use 10 designs (two levels each). Atlas from features/units392/silo.py.
var siloArt392=new Image();siloArt392.onload=function(){drawNeeded=true;};siloArt392.src='assets/silo392.webp';
function siloDesign392(b){return Math.max(0,Math.min(siloMeta392.designs.length-1,Math.floor(((b.lv||1)-1)/2)));}
function siloScale392(){return tile*1.95/104;} // atlas px -> unzoomed screen px (bunker ~1.95 tiles wide)
function siloFace392(b){var a=screenBearing(b.aim===undefined?-Math.PI/4:b.aim);return {face:Math.cos(a)<0?-1:1,back:Math.sin(a)<-.2};}
function siloHostiles392(b){
 var list=screen==='defense'&&E.defense?E.defense.enemies:screen==='raid'&&E.raid?E.raid.troops:null;if(!list)return false;
 var r=(typeof defenseRange223==='function'?defenseRange223(b):5)+1.5;
 return list.some(function(t){return t.hp>0&&Math.hypot(t.x-b.x,t.y-b.y)<=r;});
}
function siloOpen392(b){
 var now=Date.now(),dt=Math.min(.1,Math.max(0,(now-(b.openAt392||now))/1000));b.openAt392=now;
 var want=screen==='home'?(typeof selected!=='undefined'&&selected===b.id?1:0):(siloHostiles392(b)||now-(b.fire392||0)<2500?1:0);
 b.open392=Math.max(0,Math.min(1,(b.open392||0)+(want?dt/.6:-dt/.9)));
 if(b.open392>0&&b.open392<1)drawNeeded=true;
 return b.open392;
}
drawRocket227=function(b,p){
 if(!siloArt392.complete||!siloArt392.naturalWidth){newBuildingArt(b,p,tile*zoom*2.25);return;}
 var m=siloMeta392,d=siloDesign392(b),k=siloScale392()*zoom,f=siloFace392(b),open=siloOpen392(b),idx=Math.round(open*7);
 var base=p.y+tile*zoom*2.25*.12;
 ctx.save();ctx.translate(p.x,base);ctx.scale(f.face,1);
 ctx.drawImage(siloArt392,idx*m.cw,d*m.ch,m.cw,m.ch,-m.ax*k,-m.ay*k,m.cw*k,m.ch*k);
 ctx.restore();
 if((b.recoil||0)>.06&&open>.9){var mm=weaponMount(b),fx=p.x+mm.x*zoom,fy=p.y+mm.y*zoom,q=(b.recoil||0)/.18;
  ctx.save();var g=ctx.createRadialGradient(fx,fy,0,fx,fy,13*zoom*q+3);g.addColorStop(0,'rgba(255,252,220,.95)');g.addColorStop(.45,'rgba(255,190,80,.75)');g.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(fx,fy,13*zoom*q+3,0,7);ctx.fill();
  ctx.globalAlpha=.45;ctx.fillStyle='#eef2f5';for(var i=0;i<3;i++){ctx.beginPath();ctx.arc(fx-(i*5+3)*zoom*f.face,fy+(i*2+3)*zoom,(3+i*1.6)*zoom,0,7);ctx.fill();}ctx.restore();}
 if(b.lv>1){var marks=(b.lv-1)%3+1;for(var i=0;i<marks;i++)disk(p.x+(i-(marks-1)/2)*5*zoom,base+2*zoom,1.5*zoom,'#ffe391');}
};
var siloMount392=weaponMount;
weaponMount=function(o){
 if(o&&o.type==='missileturret'&&siloMeta392){var m=siloMeta392,mz=m.designs[siloDesign392(o)].muzzle||[.3,-.5],f=siloFace392(o),k=siloScale392()*m.cw,x=mz[0]*k*f.face,y=mz[1]*k+tile*2.25*.12;
  if(f.back){x*=.82;y-=4;}return {x:x,y:y,height:-y};}
 return siloMount392(o);
};
var siloFX392=weaponFX;
weaponFX=function(a,b,weapon){if(a&&a.type==='missileturret'){a.fire392=Date.now();a.open392=Math.max(a.open392||0,.86);}return siloFX392(a,b,weapon);};
var siloWreck392=drawWreck;
drawWreck=function(b,p,size,enemy){
 if(b.type!=='missileturret'||!siloArt392.complete||!siloArt392.naturalWidth)return siloWreck392(b,p,size,enemy);
 var m=siloMeta392,k=siloScale392()*zoom;ctx.drawImage(siloArt392,8*m.cw,siloDesign392(b)*m.ch,m.cw,m.ch,p.x-m.ax*k,p.y+tile*zoom*2.25*.12-m.ay*k,m.cw*k,m.ch*k);
};
