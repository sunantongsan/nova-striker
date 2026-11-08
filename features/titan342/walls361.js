var wallCache361=new Map(),wallArt383=new Image();wallArt383.onload=function(){wallCache361.clear();drawNeeded=true;};wallArt383.src='assets/walls383.webp';
function drawWall(b,enemy,preview){
 var bs=screen==='defense'?E.defense.buildings:screen==='raid'?E.raid.buildings:E.d.buildings;
 var lv=Math.max(1,Math.min(20,b.lv||1)),tier=Math.floor((lv-1)/4),step=(lv-1)%4,h=14+tier*4+step,trim=['#8ecafa','#79d9be','#bd9ced','#ffb2a2','#f2c565'][tier],armor=['#fff1e4','#c9f9e3','#f1ddff','#ffe2d1','#f9f2e5'][tier];
 var near=function(dx,dy){if(preview)return preview.mask361===undefined?dy===0:!!(preview.mask361&(dx===-1?1:dy===-1?2:dx===1?4:8));var w=wallIndex219?wallIndex219.get((b.x+dx)+','+(b.y+dy)):bs.find(function(w){return w.type==='wall'&&w.x===b.x+dx&&w.y===b.y+dy;});return w&&(w.hp===undefined||w.hp>0);};
 // Cache connected wall art by level and neighbor mask to keep large bases inexpensive.
 if(!preview&&document.createElement){var mask=(near(-1,0)?1:0)|(near(0,-1)?2:0)|(near(1,0)?4:0)|(near(0,1)?8:0),key=lv+':'+!!enemy+':'+mask+':'+(wallArt383.naturalWidth||0),im=wallCache361.get(key);if(!im){im=document.createElement('canvas');im.width=160;im.height=200;var oldCtx=ctx,oldZoom=zoom;try{ctx=im.getContext('2d');zoom=2;drawWall(b,enemy,{x:80,y:170,mask361:mask});}finally{ctx=oldCtx;zoom=oldZoom;}wallCache361.set(key,im);if(wallCache361.size>160)wallCache361.delete(wallCache361.keys().next().value);}var at=point(b.x,b.y);ctx.drawImage(im,at.x-40*zoom,at.y-85*zoom,80*zoom,100*zoom);if(lv>=15)drawWallGun383(b);return;}
 var proj=function(x,y,z){var p=preview?{x:preview.x+(x-y)*tile*zoom,y:preview.y+(x+y)*tile*.62*zoom}:point(b.x+x,b.y+y);return{x:p.x,y:p.y-z*zoom};};
 function face(points,fill){ctx.beginPath();points.forEach(function(p,i){if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle='#729fa280';ctx.lineWidth=.65*zoom;ctx.stroke();}
 function block(x0,y0,x1,y1,z0,z1,top,left,right){
  var a=proj(x0,y0,z1),b=proj(x1,y0,z1),c=proj(x1,y1,z1),d=proj(x0,y1,z1);
  face([d,c,proj(x1,y1,z0),proj(x0,y1,z0)],left);
  face([b,c,proj(x1,y1,z0),proj(x1,y0,z0)],right);face([a,b,c,d],top);
 }
 function arm(dx,dy){var x0=dx<0?-.51:-.15,y0=dy<0?-.51:-.15,x1=dx>0?.51:.15,y1=dy>0?.51:.15;
  block(x0-.025,y0-.025,x1+.025,y1+.025,0,4,'#b9dce1','#a2c5ce','#89b1bf');
  block(x0,y0,x1,y1,4,h,armor,trim,['#79b2d8','#65bfa7','#aa8fd1','#e99b8d','#d5b371'][tier]);
  block(x0,y0,x1,y1,h,h+3,'#f5f3e7','#cad4d1','#8aabb8');
  block(x0-.006,y0-.006,x1+.006,y1+.006,h-5,h-3,trim,trim,trim);
 }
 ctx.save();ctx.lineJoin='round';
 if(near(-1,0))arm(-1,0);if(near(0,-1))arm(0,-1);
 if(near(1,0))arm(1,0);if(near(0,1))arm(0,1);
 if(wallArt383.complete&&wallArt383.naturalWidth){
  var foot=proj(0,0,0),cw=wallArt383.naturalWidth/4,ch=wallArt383.naturalHeight/5,hh=36+tier*6+step*.65,w=hh*cw/ch;
  ctx.drawImage(wallArt383,(lv-1)%4*cw,Math.floor((lv-1)/4)*ch,cw,ch,foot.x-w*zoom/2,foot.y-hh*.94*zoom,w*zoom,hh*zoom);
 }else{block(-.22,-.22,.22,.22,0,h,armor,trim,trim);block(-.23,-.23,.23,.23,h,h+4,'#fff9e9',armor,trim);}
 ctx.restore();
 if(preview&&preview.mask361===undefined&&lv>=15)drawWallGun383(b,preview);
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
