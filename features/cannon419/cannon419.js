// 419: energy cannon (steampunk mortar) changes colour on EVERY level and looks more menacing as it grows.
// Colour first: each of the 20 levels has its own paint (copper -> green -> blue -> purple -> crimson -> molten hellfire).
// Shape on top of the 5 rendered tiers: it grows a little each level, then gains spikes, glowing vents, a heat glow
// in the barrel, smoke, a pulsing ground aura, lightning around the barrel and a ring of embers at the top levels.
var CANNON419=[
 // [paint colour, paint strength 0..1, darken 0..1, glow colour]
 ['#c8794a',0,0,'#ff9a52'],      // 1 original copper
 ['#e0a040',.45,0,'#ffc35a'],    // 2 bright bronze
 ['#9bbf3c',.55,0,'#d6ff6a'],    // 3 lime
 ['#3fae55',.6,.04,'#7dffa0'],   // 4 green
 ['#1fa8a0',.62,.06,'#5ffff0'],  // 5 teal
 ['#2f8fe0',.64,.08,'#7cd4ff'],  // 6 sky blue
 ['#3358d8',.66,.1,'#7f9cff'],   // 7 royal blue
 ['#5a3fd0',.68,.12,'#b19bff'],  // 8 indigo
 ['#8a3ad0',.7,.14,'#dd9bff'],   // 9 violet
 ['#b02fc0',.72,.16,'#ff8cf2'],  // 10 purple
 ['#d02fb0',.74,.18,'#ff7fe8'],  // 11 magenta
 ['#e0283c',.76,.2,'#ff6a6a'],   // 12 crimson
 ['#e8601a',.78,.18,'#ffb040'],  // 13 burnt orange
 ['#5c6478',.75,.32,'#ff3b3b'],  // 14 dark steel, red glow
 ['#5a3a8a',.8,.34,'#c77dff'],   // 15 shadow violet
 ['#a8101e',.84,.3,'#ffd040'],   // 16 blood red, gold glow
 ['#d84a08',.86,.24,'#ffe060'],  // 17 molten
 ['#2f7a2a',.84,.36,'#8dff3a'],  // 18 toxic green
 ['#1c3f8a',.86,.38,'#4ff4ff'],  // 19 storm navy, electric glow
 ['#b0081a',.9,.36,'#ff2a10']    // 20 doom red + flames
];
function cannonPal419(lv){return CANNON419[Math.max(1,Math.min(20,lv||1))-1];}
function cannonScale419(lv){return 1+(Math.max(1,Math.min(20,lv||1))-1)*.012;}
// Small cache of recoloured sprite cells (level x cell), kept short to save memory on 3-4 GB phones.
var cannonCache419={},cannonOrder419=[];
function cannonCell419(lv,col,t){
 var m=cannon3dMeta392,key=lv+':'+t+':'+col,c=cannonCache419[key];if(c)return c;
 var pal=cannonPal419(lv);c=document.createElement('canvas');c.width=m.cw;c.height=m.ch;var g=c.getContext('2d');
 g.drawImage(cannon3dArt392,col*m.cw,t*m.ch,m.cw,m.ch,0,0,m.cw,m.ch);
 if(pal[1]>0){
  g.globalCompositeOperation='color';g.globalAlpha=pal[1];g.fillStyle=pal[0];g.fillRect(0,0,m.cw,m.ch);
  g.globalCompositeOperation='overlay';g.globalAlpha=pal[1]*.35;g.fillRect(0,0,m.cw,m.ch);
  if(pal[2]>0){g.globalCompositeOperation='multiply';g.globalAlpha=pal[2];g.fillStyle='#3a2030';g.fillRect(0,0,m.cw,m.ch);}
  g.globalCompositeOperation='destination-in';g.globalAlpha=1;g.drawImage(cannon3dArt392,col*m.cw,t*m.ch,m.cw,m.ch,0,0,m.cw,m.ch);
 }
 cannonCache419[key]=c;cannonOrder419.push(key);if(cannonOrder419.length>48)delete cannonCache419[cannonOrder419.shift()];
 return c;
}
function cannonGeom419(b,p){
 var m=cannon3dMeta392,t=cannon3dTier392(b),tm=m.tiers[t],k=cannon3dK392()*zoom*cannonScale419(b.lv),base=cannon3dBase392()*zoom;
 var ay=p.y+base,w=tm.width*k,r0=w*.5,rx=r0*1.12,ry=r0*.8,dir=cannon3dDir392(b),mz=tm.muzzle[dir];
 return {t:t,tm:tm,k:k,ax:p.x,ay:ay,rx:rx,ry:ry,cx:p.x+r0*.3,cy:ay-r0*.875,mx:p.x+(mz[0]-tm.ax)*k,my:ay+(mz[1]-tm.ay)*k,dir:dir};
}
function hexA419(h,a){var n=parseInt(h.slice(1),16);return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')';}
// Spikes around the platform: back ones before the cannon, front ones after it.
function spikes419(b,G,front,pal){
 var lv=b.lv||1;if(lv<8)return;var n=lv>=16?14:lv>=12?11:8,len=(lv>=16?.42:lv>=12?.34:.26)*G.rx;
 for(var i=0;i<n;i++){var a=i/n*Math.PI*2+.2,s=Math.sin(a);if(front!==(s>0))continue;
  var bx=G.cx+Math.cos(a)*G.rx*.98,by=G.cy+s*G.ry*.98,ox=Math.cos(a),oy=s*.5,wd=G.rx*.075;
  var tx=bx+ox*len*.6,ty=by+oy*len*.6-len;
  ctx.fillStyle='#d9d4cc';ctx.strokeStyle='#2b1d24';ctx.lineWidth=1.1*zoom;
  ctx.beginPath();ctx.moveTo(bx-wd,by);ctx.lineTo(tx,ty);ctx.lineTo(bx+wd,by);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=pal[0];ctx.globalAlpha=.75;ctx.beginPath();ctx.moveTo(bx-wd,by);ctx.lineTo(bx+(tx-bx)*.45,by+(ty-by)*.45);ctx.lineTo(bx+wd,by);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
  if(lv>=18){ctx.fillStyle=pal[3];ctx.beginPath();ctx.arc(tx,ty,1.4*zoom,0,7);ctx.fill();}
 }
}
function aura419(b,G,pal,now){
 var lv=b.lv||1;if(lv<11)return;var pulse=.5+.5*Math.sin(now/260+(b.id||0));
 var R=G.rx*(1.25+pulse*.12+(lv>=17?.15:0));
 var g=ctx.createRadialGradient(G.cx,G.cy+G.ry*.2,R*.3,G.cx,G.cy+G.ry*.2,R);
 g.addColorStop(0,hexA419(pal[3],0));g.addColorStop(.65,hexA419(pal[3],.22+pulse*.18));g.addColorStop(1,hexA419(pal[3],0));
 ctx.save();ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(G.cx,G.cy+G.ry*.2,R,R*.5,0,0,7);ctx.fill();
 if(lv>=14){ctx.strokeStyle=hexA419(pal[3],.55+pulse*.3);ctx.lineWidth=1.6*zoom;ctx.setLineDash([5*zoom,4*zoom]);ctx.lineDashOffset=-now/40;ctx.beginPath();ctx.ellipse(G.cx,G.cy+G.ry*.2,G.rx*1.12,G.ry*1.12,0,0,7);ctx.stroke();ctx.setLineDash([]);}
 ctx.restore();
}
function topFX419(b,G,pal,now){
 var lv=b.lv||1;if(lv<5)return;var pulse=.5+.5*Math.sin(now/200+(b.id||0)*1.7);
 ctx.save();
 // hot glow inside the barrel
 var r=(3+lv*.25)*zoom*(.85+pulse*.3),g=ctx.createRadialGradient(G.mx,G.my,0,G.mx,G.my,r*2.2);
 g.addColorStop(0,'rgba(255,255,230,'+(.7+pulse*.3)+')');g.addColorStop(.35,hexA419(pal[3],.85));g.addColorStop(1,hexA419(pal[3],0));
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(G.mx,G.my,r*2.2,0,7);ctx.fill();
 // glowing vents on the body ("eyes")
 if(lv>=9){var vy=G.cy-G.ry*.9,n=lv>=15?3:2;for(var i=0;i<n;i++){var vx=G.cx+(i-(n-1)/2)*G.rx*.32;ctx.fillStyle=hexA419(pal[3],.55+pulse*.45);ctx.beginPath();ctx.ellipse(vx,vy,G.rx*.07,G.rx*.045,0,0,7);ctx.fill();ctx.fillStyle='rgba(255,250,220,'+(.5+pulse*.5)+')';ctx.beginPath();ctx.arc(vx,vy,G.rx*.025,0,7);ctx.fill();}}
 // smoke rising from the barrel
 if(lv>=7){var puffs=lv>=15?4:lv>=11?3:2;for(var s=0;s<puffs;s++){var ph=((now/1400)+s/puffs+(b.id||0)*.13)%1,px=G.mx+Math.sin(ph*6+s)*4*zoom,py=G.my-ph*34*zoom;
  ctx.globalAlpha=.42*(1-ph);ctx.fillStyle=lv>=14?'#5a3c44':'#8d8a90';ctx.beginPath();ctx.arc(px,py,(3+ph*7)*zoom,0,7);ctx.fill();}ctx.globalAlpha=1;}
 // lightning crackling around the barrel
 if(lv>=14&&typeof bolt392==='function'){var sd=Math.floor(now/80),R=G.rx*.32;
  for(var j=0;j<(lv>=18?3:2);j++){var a1=sd*1.3+j*2.4,a2=a1+1.4+((sd+j)%3)*.4,x1=G.mx+Math.cos(a1)*R,y1=G.my+Math.sin(a1)*R*.6+R*.4,x2=G.mx+Math.cos(a2)*R,y2=G.my+Math.sin(a2)*R*.6+R*.4;
   ctx.strokeStyle=hexA419(pal[3],.85);ctx.lineWidth=2.4*zoom;bolt392(x1,y1,x2,y2,sd+j*9,4*zoom);
   ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=.9*zoom;bolt392(x1,y1,x2,y2,sd+j*9,4*zoom);}}
 // embers swirling around the whole cannon
 if(lv>=17){var em=lv>=20?12:8;for(var e=0;e<em;e++){var ea=now/900+e/em*Math.PI*2,eh=((now/1100)+e*.37)%1,ex=G.cx+Math.cos(ea)*G.rx*1.05,ey=G.cy+Math.sin(ea)*G.ry*1.05-eh*30*zoom;
  ctx.globalAlpha=1-eh;ctx.fillStyle=e%2?pal[3]:'#ffd27a';ctx.beginPath();ctx.arc(ex,ey,(1.2+(e%3)*.5)*zoom,0,7);ctx.fill();}ctx.globalAlpha=1;}
 // flame crown on the barrel at max level
 if(lv>=20){for(var f=0;f<5;f++){var fa=f/5*Math.PI*2+now/500,fx=G.mx+Math.cos(fa)*4*zoom,fh=(9+Math.sin(now/90+f*2)*3)*zoom;
  var fg=ctx.createLinearGradient(fx,G.my,fx,G.my-fh);fg.addColorStop(0,'rgba(255,240,180,.95)');fg.addColorStop(.5,'rgba(255,110,30,.8)');fg.addColorStop(1,'rgba(220,20,20,0)');
  ctx.fillStyle=fg;ctx.beginPath();ctx.moveTo(fx-2.6*zoom,G.my);ctx.quadraticCurveTo(fx,G.my-fh*1.2,fx+2.6*zoom,G.my);ctx.fill();}}
 ctx.restore();
}
drawEnergyCannon276=function(b,p){
 if(!cannon3dArt392.complete||!cannon3dArt392.naturalWidth)return false;
 var m=cannon3dMeta392,lv=Math.max(1,Math.min(20,b.lv||1)),pal=cannonPal419(lv),now=Date.now(),G=cannonGeom419(b,p);
 var r=b.recoil||0,f=r>.12?1:r>.02?2:0,col=G.dir*3+f,cell=cannonCell419(lv,col,G.t);
 aura419(b,G,pal,now);spikes419(b,G,false,pal);
 ctx.drawImage(cell,p.x-G.tm.ax*G.k,G.ay-G.tm.ay*G.k,m.cw*G.k,m.ch*G.k);
 spikes419(b,G,true,pal);topFX419(b,G,pal,now);
 // level pips in the level's own colour (one per level inside the current tier)
 if(lv>1){var marks=(lv-1)%4+1;for(var i=0;i<marks;i++){disk(p.x+(i-(marks-1)/2)*5*zoom,G.ay+2*zoom,2*zoom,'#2b1d24');disk(p.x+(i-(marks-1)/2)*5*zoom,G.ay+2*zoom,1.5*zoom,pal[3]);}}
 if(lv>=5)drawNeeded=true;
 return true;
};
// Muzzle follows the bigger sprite so shells still leave the barrel.
var cannonMount419=weaponMount;
weaponMount=function(o){
 var w=cannonMount419(o);
 if(o&&o.type==='cannonturret'&&w&&cannon3dMeta392){var s=cannonScale419(o.lv),base=cannon3dBase392();w={x:w.x*s,y:(w.y-base)*s+base,height:-((w.y-base)*s+base)};}
 return w;
};
