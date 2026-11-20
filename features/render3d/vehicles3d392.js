// 392: pre-rendered 3D vehicles — heavy bomber (7), attack helicopter (5), tank (1), plasma tank (9).
// 16 directions per atlas (render-vehicles.cjs); tanks draw hull by heading and turret by aim.
var veh3d392={};['bomber','heli','tankHull','tankTurret','tankHull:plasma','tankTurret:plasma'].forEach(function(n){var m=vehicles3dMeta392&&vehicles3dMeta392[n];if(!m)return;var img=new Image();img.onload=function(){drawNeeded=true;};img.src='assets/veh3d392-'+n.replace(':','-')+'.webp';veh3d392[n]={meta:m,img:img};});
var veh3dSize392={bomber:[104,36],heli:[64,26],tank:[54,0]};
function veh3dReady392(n){var v=veh3d392[n];return v&&v.img.complete&&v.img.naturalWidth?v:null;}
function veh3dDir392(a){var n=vehicles3dMeta392.dirs;return ((Math.round(a/(2*Math.PI/n))%n)+n)%n;}
function veh3dK392(n){var key=n==='bomber'||n==='heli'?n:'tank',base=veh3d392[key==='tank'?(n.indexOf('plasma')>0?'tankHull:plasma':'tankHull'):n].meta.w;return veh3dSize392[key][0]/base;}
function veh3dCell392(n,dir,col,x,y,k){var v=veh3d392[n],m=v.meta;ctx.drawImage(v.bmp||v.img,col*m.cw,dir*m.ch,m.cw,m.ch,x-m.ox*k,y-m.oy*k,m.cw*k,m.ch*k);}
var veh3dAircraft392=drawAircraft221;
drawAircraft221=function(t,p){
 var bomber=t.kind===7,n=bomber?'bomber':'heli',v=veh3dReady392(n);if(!v)return veh3dAircraft392(t,p);
 var heading=bomber?(t.heading===undefined?t.aim||0:t.heading):(t.aim===undefined?t.heading||0:t.aim);
 var z=zoom,k=veh3dK392(n)*z,alt=veh3dSize392[n][1]*z+Math.sin(frame*.06+(t.id||0))*1.2*z,d=veh3dDir392(heading),col;
 if(bomber)col=Math.floor(frame*.25)%2;else col=(t.recoil||0)>.1?3:Math.floor(frame*.6)%3;
 ctx.save();if(t.hp<=0)ctx.globalAlpha*=.6;veh3dCell392(n,d,col,p.x,p.y-alt,k);ctx.restore();
};
var veh3dTank392=drawTank;
drawTank=function(t,p){
 var pl=t.kind===9?':plasma':'',h=veh3dReady392('tankHull'+pl),g=veh3dReady392('tankTurret'+pl);if(!h||!g)return veh3dTank392(t,p);
 var k=veh3dK392('tankHull'+pl)*zoom,ha=t.heading===undefined?Math.PI/4:t.heading,ga=t.aim===undefined?ha:t.aim;
 ctx.save();if(t.hp<=0)ctx.globalAlpha*=.5;
 veh3dCell392('tankHull'+pl,veh3dDir392(ha),t.moving?Math.floor(frame*.3)%2:0,p.x,p.y,k);
 veh3dCell392('tankTurret'+pl,veh3dDir392(ga),(t.recoil||0)>.1?1:0,p.x,p.y,k);
 ctx.restore();
 if(t.moving){var rear=screenBearing(ha),dust={x:p.x-Math.cos(rear)*18*zoom,y:p.y-Math.sin(rear)*10*zoom};ctx.save();ctx.globalAlpha=.12;disk(dust.x,dust.y,4*zoom,'#e6dcaa');ctx.restore();}
};
var veh3dMount392=weaponMount;
weaponMount=function(o){
 if(o&&!o.type&&!o.alien&&(o.kind===9||o.kind===5)){
  var n=o.kind===5?'heli':o.kind===9?'tankTurret:plasma':'tankTurret',v=veh3d392[n];
  if(v){var m=v.meta,a=o.aim===undefined?(o.heading===undefined?Math.PI/4:o.heading):o.aim,mz=m.muzzle[veh3dDir392(a)],k=veh3dK392(n),alt=o.kind===5?veh3dSize392.heli[1]:0,y=(mz[1]-m.oy)*k-alt;return {x:(mz[0]-m.ox)*k,y:y,height:-y};}}
 return veh3dMount392(o);
};
