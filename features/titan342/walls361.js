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
// 391: cartoon machine gun - armored swivel base, boxy receiver, perforated cooling jacket,
// muzzle brake, side ammo box with brass belt; twin barrels from level 18.
function drawWallGun383(b,preview){var p=preview||point(b.x,b.y),m=wallMount383(b),z=zoom,lv=b.lv||15;
 var dx=m.x,dy=m.y+m.height,len=Math.max(8,Math.hypot(dx,dy)),ang=Math.atan2(dy,dx),trim=lv>=17?['#9ff0ec','#3fb4bd']:['#ffc9b8','#ef8c84'],back=Math.sin(ang)<0;
 ctx.save();ctx.translate(p.x,p.y-m.height*z);ctx.scale(z,z);ctx.lineJoin='round';ctx.lineCap='round';
 // swivel base on the wall cap
 ctx.fillStyle='rgba(30,48,70,.28)';ctx.beginPath();ctx.ellipse(0,5,11,5,0,0,7);ctx.fill();
 var g=ctx.createLinearGradient(0,-2,0,7);g.addColorStop(0,'#8ea3b8');g.addColorStop(1,'#4d6178');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,3,9.5,5,0,0,7);ctx.fill();
 ctx.fillStyle=trim[1];ctx.beginPath();ctx.ellipse(0,1.5,9.5,4.6,0,0,7);ctx.fill();
 ctx.fillStyle=trim[0];ctx.beginPath();ctx.ellipse(0,.6,8.2,3.8,0,0,7);ctx.fill();
 function barrel(){
  var twin=lv>=18?[-2.2,2.2]:[0];twin.forEach(function(o){
   ctx.save();ctx.translate(0,-4);ctx.rotate(ang);ctx.translate(0,o);
   ctx.fillStyle='#3d4d60';ctx.fillRect(4,-1.4,len-2,2.8);ctx.fillStyle='#8297ab';ctx.fillRect(4,-1.4,len-2,.9);
   // cooling jacket with vents
   var jg=ctx.createLinearGradient(0,-3,0,3);jg.addColorStop(0,'#c3d2df');jg.addColorStop(.5,'#7d93a8');jg.addColorStop(1,'#46586c');ctx.fillStyle=jg;
   ctx.beginPath();ctx.roundRect?ctx.roundRect(5,-2.8,len*.42,5.6,2.2):ctx.rect(5,-2.8,len*.42,5.6);ctx.fill();
   ctx.fillStyle='#2b3a4b';for(var v=7.5;v<5+len*.42-1.5;v+=2.6){ctx.beginPath();ctx.arc(v,0,.9,0,7);ctx.fill();}
   // muzzle brake
   ctx.fillStyle='#2f3d4e';ctx.fillRect(len-3,-2.4,3.6,4.8);ctx.fillStyle='#9fb2c4';ctx.fillRect(len-2.6,-2.4,1,4.8);
   ctx.restore();
  });
 }
 function body(){
  ctx.save();ctx.translate(0,-4);ctx.rotate(ang);
  // ammo box + brass belt on the left side
  ctx.fillStyle='#5f7a52';ctx.fillRect(-6,4,7,5);ctx.fillStyle='#8fb06f';ctx.fillRect(-6,4,7,1.6);
  ctx.strokeStyle='#e8b64a';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-1,4.5);ctx.quadraticCurveTo(2,3,3,1.8);ctx.stroke();
  // receiver
  var rg=ctx.createLinearGradient(0,-5,0,5);rg.addColorStop(0,'#eef4fa');rg.addColorStop(.45,'#a9bccd');rg.addColorStop(1,'#56697e');ctx.fillStyle=rg;ctx.strokeStyle='#2c3b4c';ctx.lineWidth=1.2;
  ctx.beginPath();ctx.roundRect?ctx.roundRect(-7,-4.5,13,9,3):ctx.rect(-7,-4.5,13,9);ctx.fill();ctx.stroke();
  ctx.fillStyle=trim[1];ctx.fillRect(-5,-1,9,2);
  // rear grips and sight
  ctx.strokeStyle='#2c3b4c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-7,-2.5);ctx.lineTo(-10,-3.5);ctx.moveTo(-7,2.5);ctx.lineTo(-10,3.5);ctx.stroke();
  ctx.fillStyle='#ffd36b';ctx.beginPath();ctx.arc(1,-5.2,1.4,0,7);ctx.fill();
  ctx.restore();
 }
 if(back){barrel();body();}else{body();barrel();}
 if((b.recoil||0)>.08){ctx.save();ctx.translate(0,-4);ctx.rotate(ang);ctx.translate(len+2,0);var f=ctx.createRadialGradient(0,0,0,0,0,6);f.addColorStop(0,'#fffbe0');f.addColorStop(.4,'#ffd45a');f.addColorStop(1,'rgba(255,140,40,0)');ctx.fillStyle=f;ctx.beginPath();ctx.moveTo(-1,-2.5);ctx.lineTo(7,0);ctx.lineTo(-1,2.5);ctx.lineTo(1,0);ctx.closePath();ctx.fill();ctx.beginPath();ctx.arc(0,0,4,0,7);ctx.fill();ctx.restore();}
 ctx.restore();
}
