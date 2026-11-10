// 392: black-and-red military shock mortar (energy cannon), pre-rendered 3D, 5 tiers x 16 directions.
// The shell is a dark round with a red-hot core; on landing it splits into a cluster of bomblets.
var cannon3dArt392=new Image();cannon3dArt392.onload=function(){drawNeeded=true;};cannon3dArt392.src='assets/cannon3d392.webp';
function cannon3dTier392(b){return Math.max(0,Math.min(cannon3dMeta392.tiers.length-1,Math.floor(((b.lv||1)-1)/4)));}
function cannon3dK392(){return tile*1.4/cannon3dMeta392.tiers[0].width;}
function cannon3dBase392(){return tile*2.25*.12;}
function cannon3dDir392(b){var a=b.aim===undefined?Math.PI/4:b.aim,n=cannon3dMeta392.dirs;return ((Math.round(a/(2*Math.PI/n))%n)+n)%n;}
function cannon3dCell392(b,col,p){var m=cannon3dMeta392,t=cannon3dTier392(b),tm=m.tiers[t],k=cannon3dK392()*zoom;
 ctx.drawImage(cannon3dArt392,col*m.cw,t*m.ch,m.cw,m.ch,p.x-tm.ax*k,p.y+cannon3dBase392()*zoom-tm.ay*k,m.cw*k,m.ch*k);}
drawEnergyCannon276=function(b,p){
 if(!cannon3dArt392.complete||!cannon3dArt392.naturalWidth)return false;
 var r=b.recoil||0,f=r>.12?1:r>.02?2:0;cannon3dCell392(b,cannon3dDir392(b)*3+f,p);
 if(b.lv>1){var marks=(b.lv-1)%4+1;for(var i=0;i<marks;i++)disk(p.x+(i-(marks-1)/2)*5*zoom,p.y+cannon3dBase392()*zoom+2*zoom,1.5*zoom,'#ff6a4a');}
 return true;
};
var cannon3dMount392=weaponMount;
weaponMount=function(o){
 if(o&&o.type==='cannonturret'&&cannon3dMeta392){var tm=cannon3dMeta392.tiers[cannon3dTier392(o)],mz=tm.muzzle[cannon3dDir392(o)],k=cannon3dK392(),x=(mz[0]-tm.ax)*k,y=(mz[1]-tm.ay)*k+cannon3dBase392();return {x:x,y:y,height:-y};}
 return cannon3dMount392(o);
};
var cannon3dWreck392=drawWreck;
drawWreck=function(b,p,size,enemy){if(b.type!=='cannonturret'||!cannon3dArt392.complete||!cannon3dArt392.naturalWidth)return cannon3dWreck392(b,p,size,enemy);cannon3dCell392(b,cannon3dMeta392.dirs*3,p);};
// jagged lightning between two screen points
function bolt392(x1,y1,x2,y2,seed,jit){var n=6,pts=[[x1,y1]];for(var i=1;i<n;i++){var t=i/n,s=Math.sin(seed*12.9898+i*78.233)*43758.5453;s=s-Math.floor(s)-.5;var nx=-(y2-y1),ny=x2-x1,l=Math.hypot(nx,ny)||1;pts.push([x1+(x2-x1)*t+nx/l*s*jit,y1+(y2-y1)*t+ny/l*s*jit]);}pts.push([x2,y2]);
 ctx.beginPath();pts.forEach(function(q,i){if(i)ctx.lineTo(q[0],q[1]);else ctx.moveTo(q[0],q[1]);});ctx.stroke();}
// Cluster burst: the shell splits, bomblets scatter over the damage radius and pop one after another.
function clusterPts392(f){if(f.cl392)return f.cl392;var n=9,pts=[],seed=Math.abs(Math.round((f.tx*73.1+f.ty*19.7)*100))||7;function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647;}
 for(var i=0;i<n;i++){var a=i/n*Math.PI*2+rnd()*.6,r=(i===0?0:.35+rnd()*.6)*(f.radius||3)*.9;pts.push({x:f.tx+Math.cos(a)*r,y:f.ty+Math.sin(a)*r,d:.12+i*.065+rnd()*.05,s:.8+rnd()*.5});}
 return f.cl392=pts;}
// Airburst: the shell splits high above the target, bomblets rain down and pop one after another.
var BURST392=.72,bursts392={};
function burstKey392(x,y){return Math.round(x*100)+','+Math.round(y*100);}
function bomblet392(x,y,z,k){ctx.globalAlpha=1;ctx.strokeStyle='rgba(255,150,90,.55)';ctx.lineWidth=1.4*z;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-7*z*(.4+k));ctx.stroke();
 ctx.fillStyle='#26272d';ctx.beginPath();ctx.ellipse(x,y,2.4*z,3.1*z,0,0,7);ctx.fill();ctx.fillStyle='#ff3b2a';ctx.beginPath();ctx.arc(x,y+.6*z,1.1*z,0,7);ctx.fill();}
// burst cloud in the air: hot flash, then a dark smoke puff that drifts and fades
function airCloud392(x,y,z,tb){if(tb<.16){var k=tb/.16,g=ctx.createRadialGradient(x,y,0,x,y,(12+28*k)*z);g.addColorStop(0,'rgba(255,252,225,'+(1-k*.5)+')');g.addColorStop(.45,'rgba(255,190,80,'+(1-k*.6)+')');g.addColorStop(1,'rgba(240,90,40,0)');ctx.globalAlpha=1;ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,(12+28*k)*z,0,7);ctx.fill();}
 var e=Math.min(1,tb/1.1);if(e>=1)return;ctx.globalAlpha=.55*(1-e);ctx.fillStyle='#62646b';for(var s=0;s<5;s++){var a=s*1.257+.4;ctx.beginPath();ctx.arc(x+Math.cos(a)*(7+e*13)*z,y+Math.sin(a)*(4+e*8)*z-e*8*z,(7+e*9)*z,0,7);ctx.fill();}
 if(tb<.3){ctx.globalAlpha=1-tb/.3;ctx.fillStyle='#ffe9a0';for(var s=0;s<8;s++){var a=s*.785,d=(6+tb*80)*z;ctx.beginPath();ctx.arc(x+Math.cos(a)*d,y+Math.sin(a)*d*.7+tb*20*z,1.3*z,0,7);ctx.fill();}}}
function fallPos392(B,p,k,z){var sx=B.x+(p.x-B.x)*k,sy=B.y+(p.y-B.y)*(k*k)-Math.sin(k*Math.PI)*6*z;return {x:sx,y:sy};}
function shockRing392(f){
 var life=f.maxLife||1.15,v=Math.max(0,Math.min(1,1-f.life/life)),T=v*life,z=zoom,c=point(f.tx,f.ty),pts=clusterPts392(f),info=bursts392[burstKey392(f.tx,f.ty)];
 var pre=info?info.pre:.4,B=info?point(info.x,info.y):{x:c.x,y:c.y};if(info)B.y-=info.h*z;else B.y-=110*z;
 ctx.save();
 airCloud392(B.x,B.y,z,pre+T);
 pts.forEach(function(q){var p=point(q.x,q.y),land=q.d*.6;
  if(T<land){var k=(pre+T)/(pre+land),fp=fallPos392(B,p,k,z);bomblet392(fp.x,fp.y,z,k);return;}
  var e=(T-land)/.55;if(e>1)return;var R=16*z*q.s;
  ctx.globalAlpha=.35*(1-e*.6);ctx.fillStyle='#3a2a20';ctx.beginPath();ctx.ellipse(p.x,p.y,R*1.1,R*.6,0,0,7);ctx.fill();
  var fb=Math.min(1,e/.25),fade=e<.35?1:1-(e-.35)/.65;
  var g=ctx.createRadialGradient(p.x,p.y-R*.5*fb,0,p.x,p.y-R*.5*fb,R*(.4+.6*fb));g.addColorStop(0,'rgba(255,250,220,'+fade+')');g.addColorStop(.35,'rgba(255,190,70,'+fade+')');g.addColorStop(.7,'rgba(240,80,30,'+(.85*fade)+')');g.addColorStop(1,'rgba(180,40,20,0)');
  ctx.globalAlpha=1;ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y-R*.5*fb,R*(.4+.6*fb),0,7);ctx.fill();
  if(e>.2){ctx.globalAlpha=.55*(1-e);ctx.fillStyle='#5b5d63';for(var s=0;s<3;s++){ctx.beginPath();ctx.arc(p.x+(s-1)*R*.45,p.y-R*(.6+e*1.2)-s*3*z,R*(.35+e*.35),0,7);ctx.fill();}}
  ctx.globalAlpha=.7*(1-e);ctx.strokeStyle='#ffd27a';ctx.lineWidth=2*z;ctx.beginPath();ctx.ellipse(p.x,p.y,R*(.5+e*1.4),R*(.3+e*.85),0,0,7);ctx.stroke();
  if(e<.4){ctx.globalAlpha=1-e/.4;ctx.fillStyle='#ffe9a0';for(var s=0;s<5;s++){var a=s*1.256+q.s*3,d=R*(.4+e*2.2);ctx.beginPath();ctx.arc(p.x+Math.cos(a)*d,p.y-R*.4+Math.sin(a)*d*.6-e*12*z,1.4*z,0,7);ctx.fill();}}
 });
 ctx.restore();if(v<1)drawNeeded=true;else delete bursts392[burstKey392(f.tx,f.ty)];
}
function shockShell392(f){
 var life=f.maxLife||1.55,v=Math.max(0,Math.min(1,1-f.life/life)),a=point(f.x,f.y),b=point(f.tx,f.ty),z=zoom;
 var mx=(f.muzzle?f.muzzle.x:0),my=(f.muzzle?f.muzzle.y:-30);a.x+=mx*z;a.y+=my*z;
 var arc=150*z;function at(t){return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t-Math.sin(t*Math.PI)*arc};}
 // world position and height of the split point, shared with the ground explosions
 var key=burstKey392(f.tx,f.ty),wx=f.x+(f.tx-f.x)*BURST392,wy=f.y+(f.ty-f.y)*BURST392,h=Math.sin(BURST392*Math.PI)*150-my*(1-BURST392);
 bursts392[key]={x:wx,y:wy,h:h,pre:(1-BURST392)*life};
 ctx.save();
 if(v<BURST392){var p=at(v);
  for(var i=1;i<=7;i++){var t=v-i*.03;if(t<0)break;var q=at(t);ctx.globalAlpha=.5-i*.06;ctx.fillStyle=i<3?'#ff6a3a':'#5a5a62';ctx.beginPath();ctx.arc(q.x,q.y,(2.6+i*.7)*z,0,7);ctx.fill();}
  ctx.globalAlpha=1;ctx.fillStyle='#24252b';ctx.strokeStyle='#0d0d10';ctx.lineWidth=1.2*z;ctx.beginPath();ctx.arc(p.x,p.y,5.5*z,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle='#ff3b2a';ctx.beginPath();ctx.arc(p.x,p.y,2.8*z,0,7);ctx.fill();
  ctx.strokeStyle='rgba(255,180,140,.9)';ctx.lineWidth=1*z;bolt392(p.x-6*z,p.y,p.x+6*z,p.y,Math.floor(Date.now()/50),3*z);
 }else{
  var B=point(wx,wy);B.y-=h*z;var tb=(v-BURST392)*life,pre=(1-BURST392)*life;airCloud392(B.x,B.y,z,tb);
  clusterPts392({tx:f.tx,ty:f.ty,radius:typeof ENERGY_RADIUS276!=='undefined'?ENERGY_RADIUS276:3}).forEach(function(q){var p=point(q.x,q.y),k=tb/(pre+q.d*.6),fp=fallPos392(B,p,k,z);bomblet392(fp.x,fp.y,z,k);});
 }
 ctx.restore();drawNeeded=true;
}
var cannon3dFX392=drawFX;
drawFX=function(f){
 if(f.weapon==='energyRing276'){weaponAudio218(f);shockRing392(f);return;}
 if(f.weapon==='energy276'&&f.highArc){weaponAudio218(f);shockShell392(f);return;}
 return cannon3dFX392(f);
};
