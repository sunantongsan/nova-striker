// 392: black-and-red military shock mortar (energy cannon), pre-rendered 3D, 5 tiers x 16 directions.
// The shell is a dark round with a red-hot core; on landing an electric shock ring crackles outward.
var cannon3dArt392=new Image();cannon3dArt392.onload=function(){drawNeeded=true;};cannon3dArt392.src='assets/cannon3d392.webp';
function cannon3dTier392(b){return Math.max(0,Math.min(cannon3dMeta392.tiers.length-1,Math.floor(((b.lv||1)-1)/4)));}
function cannon3dK392(){return tile*2.0/cannon3dMeta392.tiers[0].width;}
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
function shockRing392(f){
 var c=point(f.tx,f.ty),v=Math.max(0,Math.min(1,1-f.life/(f.maxLife||1.15))),z=zoom,R=(f.radius||3)*tile*z*Math.SQRT2*.92;
 var grow=Math.min(1,v/.35),rx=R*(.25+.75*grow),ry=rx*.62,fade=v<.75?1:1-(v-.75)/.25,flick=Math.floor(Date.now()/45);
 ctx.save();
 var g=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,rx);g.addColorStop(0,'rgba(60,10,20,'+(.28*fade)+')');g.addColorStop(.75,'rgba(160,20,30,'+(.18*fade)+')');g.addColorStop(.95,'rgba(220,30,40,'+(.3*fade)+')');g.addColorStop(1,'rgba(220,30,40,0)');
 ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(c.x,c.y,rx,ry,0,0,7);ctx.fill();
 var segs=18,pts=[];for(var i=0;i<=segs;i++){var a=i/segs*Math.PI*2;pts.push([c.x+Math.cos(a)*rx,c.y+Math.sin(a)*ry]);}
 ctx.lineCap='round';ctx.lineJoin='round';
 [[7*z,'rgba(120,0,20,'+(.45*fade)+')'],[3.4*z,'rgba(235,30,40,'+(.95*fade)+')'],[1.3*z,'rgba(255,240,235,'+fade+')']].forEach(function(L){ctx.lineWidth=L[0];ctx.strokeStyle=L[1];
  for(var i=0;i<segs;i++)bolt392(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],i+flick*7,rx*.09);});
 // arcs running inward from the ring to the centre
 ctx.lineWidth=2*z;ctx.strokeStyle='rgba(235,30,40,'+(.9*fade)+')';
 for(var j=0;j<5;j++){var a=(j/5+flick*.137)%1*Math.PI*2;bolt392(c.x+Math.cos(a)*rx,c.y+Math.sin(a)*ry,c.x+Math.cos(a)*rx*.25,c.y+Math.sin(a)*ry*.25,j*31+flick,rx*.12);}
 ctx.fillStyle='rgba(255,240,220,'+(.85*fade*(1-grow*.6))+')';ctx.beginPath();ctx.ellipse(c.x,c.y,9*z,5.5*z,0,0,7);ctx.fill();
 ctx.restore();if(fade>0)drawNeeded=true;
}
function shockShell392(f){
 var v=Math.max(0,Math.min(1,1-f.life/(f.maxLife||1.55))),a=point(f.x,f.y),b=point(f.tx,f.ty),z=zoom;
 a.x+=(f.muzzle?f.muzzle.x:0)*z;a.y+=(f.muzzle?f.muzzle.y:-30)*z;
 var arc=150*z,x=a.x+(b.x-a.x)*v,y=a.y+(b.y-a.y)*v-Math.sin(v*Math.PI)*arc;
 ctx.save();
 for(var i=1;i<=7;i++){var t=v-i*.03;if(t<0)break;ctx.globalAlpha=.5-i*.06;ctx.fillStyle=i<3?'#ff6a3a':'#5a5a62';ctx.beginPath();ctx.arc(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t-Math.sin(t*Math.PI)*arc,(2.6+i*.7)*z,0,7);ctx.fill();}
 ctx.globalAlpha=1;ctx.fillStyle='#24252b';ctx.strokeStyle='#0d0d10';ctx.lineWidth=1.2*z;ctx.beginPath();ctx.arc(x,y,5.5*z,0,7);ctx.fill();ctx.stroke();
 ctx.fillStyle='#ff3b2a';ctx.beginPath();ctx.arc(x,y,2.8*z,0,7);ctx.fill();
 ctx.strokeStyle='rgba(255,180,140,.9)';ctx.lineWidth=1*z;var fl=Math.floor(Date.now()/50);bolt392(x-6*z,y,x+6*z,y,fl,3*z);
 ctx.restore();drawNeeded=true;
}
var cannon3dFX392=drawFX;
drawFX=function(f){
 if(f.weapon==='energyRing276'){weaponAudio218(f);shockRing392(f);return;}
 if(f.weapon==='energy276'&&f.highArc){weaponAudio218(f);shockShell392(f);return;}
 return cannon3dFX392(f);
};
