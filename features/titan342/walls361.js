var wallCache361=new Map(),wallArt383=new Image();wallArt383.onload=function(){wallCache361.clear();drawNeeded=true;};wallArt383.src='assets/walls383.webp';
var wallModules384=new Image();wallModules384.src='assets/wall-modules384.webp';wallModules384.onload=function(){wallCache361.clear();drawNeeded=true;};
function drawWall(b,enemy,preview){
 if(!wallModules384.complete||!wallModules384.naturalWidth)return;
 var lv=Math.max(1,Math.min(20,b.lv||1)),cw=wallModules384.naturalWidth/4,ch=wallModules384.naturalHeight/5,z=zoom;
 var bs=screen==='defense'?E.defense.buildings:screen==='raid'?E.raid.buildings:E.d.buildings;
 function near(dx,dy){if(preview)return dy===0;var w=wallIndex219?wallIndex219.get((b.x+dx)+','+(b.y+dy)):bs.find(function(w){return w.type==='wall'&&w.x===b.x+dx&&w.y===b.y+dy;});return w&&(w.hp===undefined||w.hp>0);}
 var horizontal=near(-1,0)||near(1,0),vertical=near(0,-1)||near(0,1),p=preview||point(b.x,b.y);
 function segment(axis){
  // Keep the painted bevels, panels and pillars. Affine projection aligns the two feet with adjacent tile centers.
  var row=Math.floor((lv-1)/4),foot1=[.83,.80,.78,.75,.73][row],foot2=[.71,.69,.66,.65,.61][row],scale=tile*z/(cw*.61),sy=scale*1.25,a=axis===0?-scale:scale;
  var left={x:p.x+(axis===0?.5:-.5)*tile*z,y:p.y+.5*tile*.62*z};
  var shear=(-tile*.62*z-sy*((foot2-foot1)*ch))/(.61*cw);
  ctx.save();ctx.transform(a,shear,0,sy,left.x-a*cw*.24,left.y-shear*cw*.24-sy*ch*foot1);
  ctx.drawImage(wallModules384,(lv-1)%4*cw,Math.floor((lv-1)/4)*ch,cw,ch,0,0,cw,ch);ctx.restore();
 }
 if(vertical)segment(1);if(horizontal||!vertical)segment(0);
 if(lv>=15)drawWallGun383(b,preview);
}

// Moving gun is deliberately outside the static wall cache. The muzzle shares combat geometry.
function drawWallGun383(b,preview){var p=preview||point(b.x,b.y),m=wallMount383(b),z=zoom,lv=b.lv||15;
 ctx.save();ctx.translate(p.x,p.y-m.height*z);ctx.scale(z,z);ctx.lineCap='round';ctx.lineJoin='round';
 ctx.fillStyle='#85bfca';ctx.beginPath();ctx.ellipse(0,3,9,5,0,0,Math.PI*2);ctx.fill();
 var g=ctx.createLinearGradient(-8,-7,8,6);g.addColorStop(0,'#fff5e0');g.addColorStop(.45,lv>=17?'#a5e4e2':'#ffbfaf');g.addColorStop(1,lv>=17?'#56b2bb':'#e68d8f');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,9,7,0,0,Math.PI*2);ctx.fill();
 var dx=m.x,dy=m.y+m.height,barrels=lv>=18?2:1;
 for(var i=0;i<barrels;i++){var offset=barrels===2?(i?2:-2):0,ox=-Math.sin(m.angle)*offset,oy=Math.cos(m.angle)*offset*.62;
 ctx.strokeStyle='#76aab5';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(dx+ox,dy+oy);ctx.stroke();ctx.strokeStyle='#e2fcff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ox-1,oy-1);ctx.lineTo(dx+ox-1,dy+oy-1);ctx.stroke();}
 ctx.fillStyle='#ffce76';ctx.beginPath();ctx.arc(-2,-2,2,0,7);ctx.fill();
 if((b.recoil||0)>.08){ctx.fillStyle='#fff2a5';ctx.beginPath();ctx.arc(dx,dy,3.5,0,7);ctx.fill();}ctx.restore();
}
