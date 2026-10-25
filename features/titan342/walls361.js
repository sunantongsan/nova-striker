var wallCache361=new Map();
function drawWall(b,enemy,preview){
 var bs=screen==='defense'?E.defense.buildings:screen==='raid'?E.raid.buildings:E.d.buildings;
 var lv=Math.max(1,Math.min(20,b.lv||1)),tier=Math.floor((lv-1)/4),step=(lv-1)%4,h=14+tier*4+step,trim=['#9aafb4','#7fc5d3','#78d9ee','#d6b775','#f4d78c'][tier],armor=['#c7d1ce','#bbd8df','#91bfce','#9baec2','#dae3e5'][tier];
 var near=function(dx,dy){if(preview)return preview.mask361===undefined?dy===0:!!(preview.mask361&(dx===-1?1:dy===-1?2:dx===1?4:8));var w=wallIndex219?wallIndex219.get((b.x+dx)+','+(b.y+dy)):bs.find(function(w){return w.type==='wall'&&w.x===b.x+dx&&w.y===b.y+dy;});return w&&(w.hp===undefined||w.hp>0);};
 // Cache connected wall art by level and neighbor mask to keep large bases inexpensive.
 if(!preview&&document.createElement){var mask=(near(-1,0)?1:0)|(near(0,-1)?2:0)|(near(1,0)?4:0)|(near(0,1)?8:0),key=lv+':'+!!enemy+':'+mask+':'+(wallArt274.naturalWidth||0),im=wallCache361.get(key);if(!im){im=document.createElement('canvas');im.width=160;im.height=200;var oldCtx=ctx,oldZoom=zoom;try{ctx=im.getContext('2d');zoom=2;drawWall(b,enemy,{x:80,y:170,mask361:mask});}finally{ctx=oldCtx;zoom=oldZoom;}wallCache361.set(key,im);if(wallCache361.size>160)wallCache361.delete(wallCache361.keys().next().value);}var at=point(b.x,b.y);ctx.drawImage(im,at.x-40*zoom,at.y-85*zoom,80*zoom,100*zoom);return;}
 var proj=function(x,y,z){var p=preview?{x:preview.x+(x-y)*tile*zoom,y:preview.y+(x+y)*tile*.62*zoom}:point(b.x+x,b.y+y);return{x:p.x,y:p.y-z*zoom};};
 function face(points,fill){ctx.beginPath();points.forEach(function(p,i){if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle='#253c4e';ctx.lineWidth=.65*zoom;ctx.stroke();}
 function block(x0,y0,x1,y1,z0,z1,top,left,right){
  var a=proj(x0,y0,z1),b=proj(x1,y0,z1),c=proj(x1,y1,z1),d=proj(x0,y1,z1);
  face([d,c,proj(x1,y1,z0),proj(x0,y1,z0)],left);
  face([b,c,proj(x1,y1,z0),proj(x1,y0,z0)],right);face([a,b,c,d],top);
 }
 function arm(dx,dy){var x0=dx<0?-.51:-.15,y0=dy<0?-.51:-.15,x1=dx>0?.51:.15,y1=dy>0?.51:.15;
  block(x0-.025,y0-.025,x1+.025,y1+.025,0,4,'#6e8792','#405765','#304552');
  block(x0,y0,x1,y1,4,h,armor,['#8e9c9b','#7eabbc','#497e9b','#596982','#9eafba'][tier],'#405b73');
  block(x0,y0,x1,y1,h,h+3,'#f5f3e7','#cad4d1','#8aabb8');
  block(x0-.006,y0-.006,x1+.006,y1+.006,h-5,h-3,enemy?'#8262ae':'#1677af',enemy?'#705294':'#258dc3',enemy?'#4a386d':'#125a89');
 }
 ctx.save();ctx.lineJoin='round';
 if(near(-1,0))arm(-1,0);if(near(0,-1))arm(0,-1);
 if(near(1,0))arm(1,0);if(near(0,1))arm(0,1);
 if(wallArt274.complete&&wallArt274.naturalWidth){var foot=proj(0,0,0),w=(26+tier*3+step*.5)*zoom,hh=(29+tier*7+step*1.8)*zoom;ctx.drawImage(wallArt274,foot.x-w/2,foot.y-hh*.92+3*zoom,w,hh);}else{
 block(-.22,-.22,.22,.22,0,4,'#7e98a2','#526a78','#344c60');
 block(-.17,-.17,.17,.17,4,h+3,'#dfe9e8','#b6cbd0','#7495a9');
 block(-.20,-.20,.20,.20,h+3,h+6,'#fff7df',trim,'#8e9b92');
 block(-.14,-.14,.14,.14,h+6,h+8,enemy?'#967cb8':'#318bb8',enemy?'#6b578a':'#1b628d','#24475d');
 var p=proj(.175,0,h-2);ctx.fillStyle=enemy?'#e3bbff':'#8ff5ff';ctx.fillRect(p.x-1.2*zoom,p.y-2*zoom,2.4*zoom,4*zoom);
 }
 // Each level adds physical armor details; every fourth level changes the silhouette.
 if(tier>=1){block(-.30,-.23,-.18,.23,0,h*.65,armor,trim,'#36546b');block(.18,-.23,.30,.23,0,h*.65,armor,trim,'#36546b');}
 for(var rib=0;rib<=step;rib++){var z=7+rib*3;block(-.23,-.23,.23,.23,z,z+1.3,trim,armor,'#53788c');}
 if(tier>=2){block(-.25,-.25,.25,.25,h+3,h+5,trim,armor,'#51697d');block(-.24,-.24,-.13,-.13,h+5,h+10,armor,trim,'#335772');block(.13,.13,.24,.24,h+5,h+10,armor,trim,'#335772');}
 if(tier>=3){block(-.10,-.10,.10,.10,h+6,h+13,enemy?'#caa9ef':'#a7f6ff','#459dc4','#246d9d');}
 if(tier===4){block(-.34,-.14,-.24,.14,4,h+4,trim,armor,'#746245');block(.24,-.14,.34,.14,4,h+4,trim,armor,'#746245');block(-.13,-.13,.13,.13,h+13,h+16,'#f8ffff','#78eaff','#299bbb');}
 ctx.restore();
}
