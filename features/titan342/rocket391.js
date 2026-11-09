// 391: the painted rocket launcher turns toward its target, and each missile leaves from a real
// tube tip (four tubes, fired in turn) with a launch flash. The pedestal stays fixed.
var rocketParts391=null;
function rocketPrepare391(){
 var img=buildingImages.missileturret;if(rocketParts391||!img||!img.complete||!img.naturalWidth)return rocketParts391;
 var w=img.naturalWidth,h=img.naturalHeight,cut=Math.round(h*.535),fade=Math.round(h*.03);
 function layer(y0,y1,feather){var c=document.createElement('canvas');c.width=w;c.height=h;var g=c.getContext('2d');g.drawImage(img,0,0);g.globalCompositeOperation='destination-in';var m=g.createLinearGradient(0,y0,0,y1);
  if(feather==='top'){m.addColorStop(0,'rgba(0,0,0,0)');m.addColorStop(1,'rgba(0,0,0,1)');g.fillStyle=m;g.fillRect(0,y0,w,h-y0);}
  else{m.addColorStop(0,'rgba(0,0,0,1)');m.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=m;g.fillRect(0,0,w,y1);}
  return c;}
 rocketParts391={w:w,h:h,base:layer(cut-fade,cut+fade,'top'),head:layer(cut-fade,cut+fade,'bottom'),pivot:[w*.515,h*.535],
  // rocket nose tips in image coordinates, front tube last
  tips:[[w*.665,h*.075],[w*.745,h*.13],[w*.82,h*.19],[w*.89,h*.245]]};
 return rocketParts391;
}
// Facing (mirror) and tilt from the aim; painted tubes point up-right at about -48 degrees.
function rocketPose391(b){
 var a=screenBearing(b.aim===undefined?-Math.PI/2:b.aim),dx=Math.cos(a),dy=Math.sin(a),face=dx<0?-1:1,ang=Math.atan2(dy,Math.abs(dx));
 var tilt=Math.max(-.55,Math.min(.45,ang+0.84));return {face:face,tilt:tilt};
}
function rocketPoint391(r,pose,ix,iy,size){
 var s=size/r.w,px=(ix-r.pivot[0])*s,py=(iy-r.pivot[1])*s,c=Math.cos(pose.tilt),n=Math.sin(pose.tilt);
 var rx=px*c-py*n,ry=px*n+py*c,ox=(r.pivot[0]/r.w-.5)*size,oy=(r.pivot[1]/r.h-.88)*size*r.h/r.w;
 return {x:(ox+rx)*pose.face,y:oy+ry};
}
drawRocket227=function(b,p){
 var r=rocketPrepare391(),size=tile*zoom*2.25;if(!r){newBuildingArt(b,p,size);return;}
 var height=size*r.h/r.w,left=p.x-size/2,top=p.y-height+size*.12,pose=rocketPose391(b),z=zoom;
 ctx.drawImage(r.base,left,top,size,height);
 ctx.save();ctx.translate(left+r.pivot[0]/r.w*size,top+r.pivot[1]/r.h*height);ctx.scale(pose.face,1);ctx.rotate(pose.tilt);
 var kick=Math.min(.18,b.recoil||0)*10*z;ctx.translate(-kick*.7,kick*.7);
 ctx.drawImage(r.head,-r.pivot[0]/r.w*size,-r.pivot[1]/r.h*height,size,height);ctx.restore();
 if((b.recoil||0)>.06){var tip=rocketPoint391(r,pose,r.tips[(b.salvo391||0)%4][0],r.tips[(b.salvo391||0)%4][1],tile*2.25),fx=p.x+tip.x*z,fy=p.y+tip.y*z,k=(b.recoil||0)/.18;
  ctx.save();var g=ctx.createRadialGradient(fx,fy,0,fx,fy,12*z*k+3);g.addColorStop(0,'rgba(255,252,220,.95)');g.addColorStop(.45,'rgba(255,190,80,.75)');g.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(fx,fy,12*z*k+3,0,7);ctx.fill();
  ctx.globalAlpha=.5*(1-k)+.2;ctx.fillStyle='#e8eef3';for(var i=0;i<3;i++){ctx.beginPath();ctx.arc(fx-(i*5+3)*z*pose.face,fy+(i*3+2)*z,(3+i*1.6)*z,0,7);ctx.fill();}ctx.restore();}
 if(b.lv>1){var marks=(b.lv-1)%3+1;for(var i=0;i<marks;i++)disk(p.x+(i-(marks-1)/2)*5*zoom,p.y+size*.07,1.5*zoom,'#ffe391');}
};
// The projectile leaves from the tip of the tube that fires next.
var mountRocket391=weaponMount;
weaponMount=function(o){
 if(o&&o.type==='missileturret'){var r=rocketPrepare391();if(r){var pose=rocketPose391(o),t=r.tips[(o.salvo391||0)%4],m=rocketPoint391(r,pose,t[0],t[1],tile*2.25);return {x:m.x,y:m.y,height:-m.y};}}
 return mountRocket391(o);
};
var fxRocket391=weaponFX;
weaponFX=function(a,b,weapon){if(a&&a.type==='missileturret')a.salvo391=((a.salvo391||0)+1)%4;return fxRocket391(a,b,weapon);};
