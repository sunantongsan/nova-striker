// 392: hand-drawn frame animation for soldiers and mechs (idle / walk / attack / death),
// front view for downward movement and back view for upward movement, mirrored for left.
// Walk frames advance with the distance actually travelled, so feet never slide.
// Atlases are produced by features/units392/extract.py (cell 224x192, feet at 92,184).
var UNIT_CELL392={w:224,h:192,ax:92,ay:184,idle:156};
// Unit kind -> atlas file, on-screen idle height (px at zoom 1) and walk frames per tile travelled.
var unitSheets392={
 0:{file:'ranger',height:36,perTile:10},4:{file:'sniper',height:36,perTile:10},8:{file:'plasma',height:38,perTile:10},
 2:{file:'mech',height:46,perTile:8},6:{file:'shield',height:48,perTile:7},10:{file:'heavy',height:52,perTile:7}
};
Object.keys(unitSheets392).forEach(function(k){var s=unitSheets392[k],m=unitMeta392[s.file];if(!m){delete unitSheets392[k];return;}s.rows=m.rows;s.counts=m.counts;});
Object.keys(unitSheets392).forEach(function(k){var s=unitSheets392[k];s.img=new Image();s.img.onload=function(){drawNeeded=true;};s.img.src='assets/units392-'+s.file+'.webp';});
function sheetFor392(kind){var s=unitSheets392[kind];return s&&s.img.complete&&s.img.naturalWidth?s:null;}
// Screen-space facing from movement (preferred) or aim.
function facing392(t){
 var dx=0,dy=0;
 if(t.lx392!==undefined){dx=t.x-t.lx392;dy=t.y-t.ly392;var d=Math.hypot(dx,dy);t.odo392=(t.odo392||0)+(d<1?d:0);}
 t.lx392=t.x;t.ly392=t.y;
 var moving=!!t.moving&&Math.hypot(dx,dy)>1e-4;
 if(!moving||t.recoil>0){var a=t.aim===undefined?(t.heading===undefined?-Math.PI/2:t.heading):t.aim;dx=Math.cos(a);dy=Math.sin(a);}
 var sx=dx-dy,sy=(dx+dy)*.62;
 if(Math.abs(sx)>1e-4)t.flip392=sx<0?-1:1;if(Math.abs(sy)>1e-4)t.back392=sy<-.05;
 return {flip:t.flip392||1,back:!!t.back392,moving:moving||!!t.moving};
}
function sprite392(t,u,enemy,z,flip){
 if(enemy)return false;var s=sheetFor392(t.kind);if(!s)return false;
 var f=facing392(t),row,idx,n;
 if(t.hp<=0){var now=Date.now();if(t.die392===undefined)t.die392=now;row='death';n=s.counts.death;idx=Math.min(n-1,Math.floor((now-t.die392)/140));}
 else{
  var b=f.back&&s.counts.bwalk?'b':'';
  if(f.moving){row=b+'walk';n=s.counts[row];idx=Math.floor((t.odo392||0)*s.perTile)%n;}
  else if((t.recoil||0)>0||t.aimTarget&&t.aimTarget.hp>0){row=b+'attack';n=s.counts[row];idx=(t.recoil||0)>0?Math.min(n-1,1+Math.floor((1-(t.recoil||0)/.18)*(n-1))):0;}
  else{row=b+'idle';n=s.counts[row];idx=Math.floor(frame*.07+(t.id||0)*.37)%n;}
  t.die392=undefined;
 }
 var r=s.rows.indexOf(row);if(r<0)return false;
 var k=s.height*z/UNIT_CELL392.idle,c=UNIT_CELL392;
 ctx.save();ctx.scale(flip,1); // undo the generic mirror; facing392 decides
 ctx.scale(f.flip,1);
 ctx.drawImage(s.img,idx*c.w,r*c.h,c.w,c.h,-c.ax*k,-c.ay*k,c.w*k,c.h*k);
 ctx.restore();
 return true;
}
