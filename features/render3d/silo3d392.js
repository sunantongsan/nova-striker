// 392: pre-rendered 3D hidden missile silo (Clash-style). 20 levels -> 5 tiers (4 levels each).
// Per tier: 8 pop-up frames, 16 aim directions (launcher raised), 1 wreck. Atlas by render.cjs.
var silo3dArt392=new Image();silo3dArt392.onload=function(){drawNeeded=true;};silo3dArt392.src='assets/silo3d392.webp';
function silo3dTier392(b){return Math.max(0,Math.min(silo3dMeta392.tiers.length-1,Math.floor(((b.lv||1)-1)/4)));}
function silo3dK392(){return tile*1.95/silo3dMeta392.tiers[0].width;}
function silo3dBase392(p){return p.y+tile*zoom*2.25*.12;}
function silo3dDir392(b){var a=b.aim===undefined?Math.PI/4:b.aim,n=silo3dMeta392.dirs;return ((Math.round(a/(2*Math.PI/n))%n)+n)%n;}
function silo3dHostiles392(b){
 var list=screen==='defense'&&E.defense?E.defense.enemies:screen==='raid'&&E.raid?E.raid.troops:null;if(!list)return false;
 var r=(typeof defenseRange223==='function'?defenseRange223(b):5)+1.5;
 return list.some(function(t){return t.hp>0&&Math.hypot(t.x-b.x,t.y-b.y)<=r;});
}
function silo3dOpen392(b){
 var now=Date.now(),dt=Math.min(.1,Math.max(0,(now-(b.openAt392||now))/1000));b.openAt392=now;
 var want=screen==='home'?(typeof selected!=='undefined'&&selected===b.id?1:0):(silo3dHostiles392(b)||now-(b.fire392||0)<2500?1:0);
 b.open392=Math.max(0,Math.min(1,(b.open392||0)+(want?dt/.6:-dt/.9)));
 if(b.open392>0&&b.open392<1)drawNeeded=true;return b.open392;
}
function silo3dCell392(b,col,p){
 var m=silo3dMeta392,t=silo3dTier392(b),tm=m.tiers[t],k=silo3dK392()*zoom;
 ctx.drawImage(silo3dArt392,col*m.cw,t*m.ch,m.cw,m.ch,p.x-tm.ax*k,silo3dBase392(p)-tm.ay*k,m.cw*k,m.ch*k);
}
drawRocket227=function(b,p){
 if(!silo3dArt392.complete||!silo3dArt392.naturalWidth){newBuildingArt(b,p,tile*zoom*2.25);return;}
 var open=silo3dOpen392(b),col=open>=.999?8+silo3dDir392(b):Math.min(7,Math.round(open*7));
 silo3dCell392(b,col,p);
 if((b.recoil||0)>.06&&open>.9){var mm=weaponMount(b),fx=p.x+mm.x*zoom,fy=p.y+mm.y*zoom,q=(b.recoil||0)/.18;
  ctx.save();var g=ctx.createRadialGradient(fx,fy,0,fx,fy,13*zoom*q+3);g.addColorStop(0,'rgba(255,252,220,.95)');g.addColorStop(.45,'rgba(255,190,80,.75)');g.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(fx,fy,13*zoom*q+3,0,7);ctx.fill();
  ctx.globalAlpha=.45;ctx.fillStyle='#eef2f5';for(var i=0;i<3;i++){ctx.beginPath();ctx.arc(fx-(i*4+3)*zoom*Math.sign(mm.x||1),fy+(i*2+3)*zoom,(3+i*1.6)*zoom,0,7);ctx.fill();}ctx.restore();}
 if(b.lv>1){var marks=(b.lv-1)%4+1;for(var i=0;i<marks;i++)disk(p.x+(i-(marks-1)/2)*5*zoom,silo3dBase392(p)+2*zoom,1.5*zoom,'#ffe391');}
};
var silo3dMount392=weaponMount;
weaponMount=function(o){
 if(o&&o.type==='missileturret'&&silo3dMeta392){var tm=silo3dMeta392.tiers[silo3dTier392(o)],mz=tm.muzzle[silo3dDir392(o)],k=silo3dK392(),x=(mz[0]-tm.ax)*k,y=(mz[1]-tm.ay)*k+tile*2.25*.12;return {x:x,y:y,height:-y};}
 return silo3dMount392(o);
};
var silo3dFX392=weaponFX;
weaponFX=function(a,b,weapon){if(a&&a.type==='missileturret'){a.fire392=Date.now();a.open392=1;}return silo3dFX392(a,b,weapon);};
var silo3dWreck392=drawWreck;
drawWreck=function(b,p,size,enemy){if(b.type!=='missileturret'||!silo3dArt392.complete||!silo3dArt392.naturalWidth)return silo3dWreck392(b,p,size,enemy);silo3dCell392(b,8+silo3dMeta392.dirs,p);};
