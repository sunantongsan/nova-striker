// 391: builder drones become cartoon builder robots. Idle builders stay hidden; a busy builder
// stands beside its job hammering, and every building under construction/upgrade gets scaffolding.
function robot391(p,z,o){
 o=o||{};var t=frame*.18+(o.seed||0),work=!!o.work,walk=!!o.walk,face=o.face||1,bob=walk?Math.abs(Math.sin(t*1.6))*1.6:work?Math.max(0,Math.sin(t*1.5))*.6:0;
 ctx.save();ctx.translate(p.x,p.y);ctx.scale(z*face,z);ctx.lineJoin='round';ctx.lineCap='round';
 ctx.fillStyle='rgba(28,48,60,.28)';ctx.beginPath();ctx.ellipse(0,1,9,3.4,0,0,7);ctx.fill();
 // legs
 var step=walk?Math.sin(t*1.6)*2.2:0;ctx.fillStyle='#5d6f84';
 ctx.beginPath();ctx.roundRect?ctx.roundRect(-5.5+step,-7,4,7,1.6):ctx.rect(-5.5+step,-7,4,7);ctx.fill();
 ctx.beginPath();ctx.roundRect?ctx.roundRect(1.5-step,-7,4,7,1.6):ctx.rect(1.5-step,-7,4,7);ctx.fill();
 ctx.fillStyle='#ffb347';ctx.fillRect(-6+step,-1.6,5,1.8);ctx.fillRect(1-step,-1.6,5,1.8);
 ctx.translate(0,-bob);
 // back arm
 ctx.strokeStyle='#8193a8';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-6,-15);ctx.lineTo(-8,-10);ctx.stroke();
 // body
 var g=ctx.createLinearGradient(0,-21,0,-6);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#d8e6f2');ctx.fillStyle=g;ctx.strokeStyle='#3c5068';ctx.lineWidth=1.3;
 ctx.beginPath();ctx.roundRect?ctx.roundRect(-7.5,-21,15,14,5):ctx.rect(-7.5,-21,15,14);ctx.fill();ctx.stroke();
 ctx.fillStyle='#ff9f43';ctx.beginPath();ctx.roundRect?ctx.roundRect(-4.5,-17.5,9,6.5,2.5):ctx.rect(-4.5,-17.5,9,6.5);ctx.fill();
 ctx.fillStyle=Math.sin(t*2)>0?'#7dffb0':'#3fd17d';ctx.beginPath();ctx.arc(-2,-14.3,1.1,0,7);ctx.fill();ctx.fillStyle='#fff3a0';ctx.beginPath();ctx.arc(1.6,-14.3,1.1,0,7);ctx.fill();
 // head + hard hat
 ctx.fillStyle='#eef4fa';ctx.strokeStyle='#3c5068';ctx.beginPath();ctx.roundRect?ctx.roundRect(-6.5,-31,13,10.5,4):ctx.rect(-6.5,-31,13,10.5);ctx.fill();ctx.stroke();
 ctx.fillStyle='#57d7ff';ctx.beginPath();ctx.roundRect?ctx.roundRect(-4.6,-28,9.2,4.6,2.2):ctx.rect(-4.6,-28,9.2,4.6);ctx.fill();
 ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(-1.8,-25.8,1.1,0,7);ctx.arc(2.2,-25.8,1.1,0,7);ctx.fill();
 var h=ctx.createLinearGradient(0,-37,0,-29);h.addColorStop(0,'#fff176');h.addColorStop(1,'#ffc21a');ctx.fillStyle=h;ctx.strokeStyle='#b8860b';ctx.lineWidth=1.1;
 ctx.beginPath();ctx.ellipse(0,-30.5,7,5.5,0,Math.PI,0);ctx.fill();ctx.stroke();ctx.fillRect(-8.5,-31.2,17,1.8);ctx.fillStyle='#ffe57a';ctx.fillRect(-1,-35.6,2,4.5);
 // hammer arm
 var swing=work?-1.15+Math.max(-.2,Math.sin(t*1.5))*1.25:walk?-.2+Math.sin(t*1.6)*.25:-.15;
 ctx.save();ctx.translate(6,-16);ctx.rotate(swing);
 ctx.strokeStyle='#8193a8';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(4,5);ctx.stroke();
 ctx.strokeStyle='#a0703c';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(3,4);ctx.lineTo(11,-2);ctx.stroke();
 ctx.fillStyle='#7d8da0';ctx.strokeStyle='#3c5068';ctx.lineWidth=.8;ctx.beginPath();ctx.roundRect?ctx.roundRect(9,-6,4.5,7,1.2):ctx.rect(9,-6,4.5,7);ctx.fill();ctx.stroke();
 ctx.restore();
 if(work&&Math.sin(t*1.5)>.92){ctx.fillStyle='#fff6a8';ctx.beginPath();for(var k=0;k<8;k++){var r=k%2?1.4:4,a=k*Math.PI/4;ctx.lineTo(16+Math.cos(a)*r,-10+Math.sin(a)*r);}ctx.closePath();ctx.fill();}
 ctx.restore();
}
drawBuilder228=function(t){
 if(t.hp<=0&&!t.dead)return;var p=point(t.x,t.y),z=zoom;if(p.x<-40||p.x>viewWidth+40||p.y<-20||p.y>viewHeight+60)return;
 ctx.save();if(t.hp<=0)ctx.globalAlpha=Math.min(1,t.dead);
 if(!t.work391){var moved=t.lx391!==undefined&&Math.abs(t.x-t.lx391)+Math.abs(t.y-t.ly391)>.0005;t.lx391=t.x;t.ly391=t.y;t.walk391=moved&&!t.repairing;}
 var face=t.aimTarget?(t.aimTarget.x-t.aimTarget.y)-(t.x-t.y)<0?-1:1:1;
 robot391(p,z*1.05,{work:!!t.repairing||!!t.work391,walk:!!t.walk391,face:face,seed:t.id||0});
 if(t.hp<t.max){box(p.x-12*z,p.y-44*z,24*z,3*z,'#15324c');box(p.x-12*z,p.y-44*z,24*z*Math.max(0,t.hp/t.max),3*z,'#ffda69');}
 ctx.restore();
};
function builderJobs391(){
 var jobs=[],seen=new Set();
 E.d.buildings.forEach(function(b){if(!b.until)return;var key=b.type==='wall'&&!b.constructing?'walls:'+(b.builderBatch228||b.started||b.until):b.id;if(!seen.has(key)){seen.add(key);jobs.push(b);}});
 (E.d.serverUpgrades225||[]).forEach(function(j){if(j.category==='infrastructure'){var b=E.d.buildings.find(function(b){return b.type===j.item;});if(b&&!seen.has(b.id)){seen.add(b.id);jobs.push(b);}}});
 return jobs.slice(0,E.builderCount());
}
// Only working robots are shown; they stand at the front-right corner of their job.
drawHomeBuilders228=function(){
 builderJobs391().forEach(function(b,i){
  var side=b.type==='wall'?[.45,.45]:i%2?[.22,.66]:[.66,.22];
  drawBuilder228({id:i*7,x:b.x+side[0],y:b.y+side[1],hp:180,max:180,work391:true,aimTarget:b});
 });
};
// Scaffolding: poles and planks around the footprint; back half under the building, front half over it.
function scaffold391(b,front){
 var z=zoom,h=(b.type==='hq'?52:40)*z,r=.47,corners=[[-r,-r],[r,-r],[r,r],[-r,r]].map(function(c){return point(b.x+c[0],b.y+c[1]);});
 var top=corners[0],right=corners[1],bottom=corners[2],left=corners[3];
 var edges=front?[[right,bottom],[bottom,left]]:[[left,top],[top,right]],poles=front?[right,bottom,left]:[left,top,right];
 ctx.save();ctx.lineCap='round';
 edges.forEach(function(e){
  for(var lv=1;lv<=3;lv++){var y=h*lv/3.2;
   ctx.strokeStyle='#b97a3d';ctx.lineWidth=3.2*z;ctx.beginPath();ctx.moveTo(e[0].x,e[0].y-y);ctx.lineTo(e[1].x,e[1].y-y);ctx.stroke();
   ctx.strokeStyle='#f0c27b';ctx.lineWidth=1.3*z;ctx.beginPath();ctx.moveTo(e[0].x,e[0].y-y-1*z);ctx.lineTo(e[1].x,e[1].y-y-1*z);ctx.stroke();}
  ctx.strokeStyle='#9fb3c6';ctx.lineWidth=1.2*z;ctx.beginPath();ctx.moveTo(e[0].x,e[0].y-h*.04);ctx.lineTo(e[1].x,e[1].y-h*.62);ctx.moveTo(e[0].x,e[0].y-h*.62);ctx.lineTo(e[1].x,e[1].y-h*.04);ctx.stroke();
 });
 poles.forEach(function(c){ctx.strokeStyle='#5f748b';ctx.lineWidth=2.6*z;ctx.beginPath();ctx.moveTo(c.x,c.y);ctx.lineTo(c.x,c.y-h-3*z);ctx.stroke();ctx.strokeStyle='#c9d6e3';ctx.lineWidth=.9*z;ctx.beginPath();ctx.moveTo(c.x-.8*z,c.y);ctx.lineTo(c.x-.8*z,c.y-h-3*z);ctx.stroke();});
 if(front){ // little hazard flag on the front pole
  var f=bottom;ctx.fillStyle='#ff9f43';ctx.beginPath();ctx.moveTo(f.x,f.y-h-3*z);ctx.lineTo(f.x+9*z,f.y-h+.5*z);ctx.lineTo(f.x,f.y-h+4*z);ctx.closePath();ctx.fill();
 }
 ctx.restore();
}
var drawBuilding391=drawBuilding;
drawBuilding=function(b,enemy){
 var scaff=screen==='home'&&!enemy&&b.until&&b.type!=='wall'&&!trap278(b);
 if(scaff){var p=point(b.x,b.y);scaff=p.x>-80&&p.x<viewWidth+80&&p.y>-40&&p.y<viewHeight+100;}
 if(scaff)scaffold391(b,false);
 drawBuilding391(b,enemy);
 if(scaff)scaffold391(b,true);
};
