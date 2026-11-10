// 392: pre-rendered 3D troops (battle mech 2, sniper 4, shield mech 6). 8 grid directions,
// idle / walk (by distance travelled) / attack (by recoil) / death. Atlases by render-units.cjs.
var unit3dKinds392={2:{file:'mech',height:46,perTile:8},4:{file:'sniper',height:38,perTile:10},6:{file:'shield',height:48,perTile:7}};
Object.keys(unit3dKinds392).forEach(function(k){var s=unit3dKinds392[k];s.meta=unit3dMeta392[s.file];if(!s.meta){delete unit3dKinds392[k];return;}s.img=new Image();s.img.onload=function(){drawNeeded=true;};s.img.src='assets/units3d392-'+s.file+'.webp';});
function unit3dDir392(a){return ((Math.round(a/(Math.PI/4))%8)+8)%8;}
function unit3d392(t,u,enemy,z,flip){
 if(enemy||t.alien)return false;var s=unit3dKinds392[t.kind];if(!s||!s.img.complete||!s.img.naturalWidth)return false;
 var g=unit3dMeta392._,m=s.meta,dx=0,dy=0;
 if(t.lx3d!==undefined){dx=t.x-t.lx3d;dy=t.y-t.ly3d;var d=Math.hypot(dx,dy);if(d<1)t.odo3d=(t.odo3d||0)+d;}
 t.lx3d=t.x;t.ly3d=t.y;
 var moving=!!t.moving&&Math.hypot(dx,dy)>1e-4,a;
 if(moving&&!(t.recoil>0))a=Math.atan2(dy,dx);else a=t.aim===undefined?(t.heading===undefined?Math.PI/4:t.heading):t.aim;
 if(moving||t.recoil>0||t.dir3d===undefined)t.dir3d=unit3dDir392(a);
 var col;
 if(t.hp<=0){var now=Date.now();if(t.die3d===undefined)t.die3d=now;col=g.death[0]+Math.min(g.death[1]-1,Math.floor((now-t.die3d)/130));}
 else{t.die3d=undefined;
  if((t.recoil||0)>0)col=g.attack[0]+Math.min(g.attack[1]-1,Math.floor((1-(t.recoil||0)/.18)*g.attack[1]));
  else if(t.moving)col=g.walk[0]+Math.floor((t.odo3d||0)*s.perTile)%g.walk[1];
  else if(t.aimTarget&&t.aimTarget.hp>0)col=g.attack[0];
  else col=g.idle[0]+Math.floor(frame*.07+(t.id||0)*.37)%g.idle[1];}
 var k=s.height*z/m.h;
 ctx.save();ctx.scale(flip,1);
 ctx.drawImage(s.img,col*g.cw,t.dir3d*g.ch,g.cw,g.ch,-m.ax*k,-m.ay*k,g.cw*k,g.ch*k);
 ctx.restore();return true;
}
var unit3dMount392=weaponMount;
weaponMount=function(o){
 var s=o&&!o.type&&!o.alien&&unit3dKinds392[o.kind];
 if(s){var mz=s.meta.muzzle[unit3dDir392(o.aim===undefined?Math.PI/4:o.aim)],k=s.height/s.meta.h;return {x:mz[0]*k,y:mz[1]*k,height:-mz[1]*k};}
 return unit3dMount392(o);
};
