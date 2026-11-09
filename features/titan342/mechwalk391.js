// 391: stomping walk for the mech units (battle mech, shield mech, heavy assault mech).
// The painted sprite is split into body and two legs; legs lift in turn, the body bobs and
// rolls with each step, and heavy feet kick up a little dust. Standing mechs are unchanged.
function walkerSource391(kind){
 if(kind===2&&art278&&art278.complete&&art278.naturalWidth){var w=art278.naturalWidth/3,h=art278.naturalHeight/3;return {img:art278,sx:2*w,sy:h,sw:w,sh:h,size:45,anchor:.88,legY:.6,split:.5,heavy:false};}
 if((kind===6||kind===10)&&extraArt&&extra.naturalWidth){var c=extra.naturalWidth/3;return {img:extra,sx:0,sy:2*c,sw:c,sh:c,size:38,anchor:.8,legY:.62,split:.56,heavy:true};}
 return null;
}
function walker391(t,u,enemy,z){
 if(enemy||[2,6,10].indexOf(t.kind)<0)return false;var s=walkerSource391(t.kind);if(!s)return false;
 var size=s.size*z,x0=-size/2,y0=-size*s.anchor;
 if(!t.moving){ctx.drawImage(s.img,s.sx,s.sy,s.sw,s.sh,x0,y0,size,size);return true;}
 var ph=(t.walk||0)*.9,sn=Math.sin(ph),cs=Math.cos(ph),lift=(s.heavy?2.4:3)*z,stride=(s.heavy?1.4:1.8)*z;
 var legTop=s.sh*s.legY,legH=s.sh-legTop,splitX=s.sw*s.split,legY=y0+size*s.legY,legHd=size*(1-s.legY);
 // dust under the planted foot
 var plant=Math.max(0,1-Math.abs(sn)*3);if(s.heavy&&plant>0){ctx.save();ctx.globalAlpha=.32*plant;ctx.fillStyle='#e9e2cf';ctx.beginPath();ctx.ellipse((sn>=0?.18:-.18)*size,1.5*z,7*z*(1.4-plant*.4),2.2*z,0,0,7);ctx.fill();ctx.restore();}
 // legs (left = back leg while sin>0 lifts)
 ctx.drawImage(s.img,s.sx,s.sy+legTop,splitX,legH,x0+cs*stride,legY-Math.max(0,sn)*lift,size*s.split,legHd);
 ctx.drawImage(s.img,s.sx+splitX,s.sy+legTop,s.sw-splitX,legH,x0+size*s.split-cs*stride,legY-Math.max(0,-sn)*lift,size*(1-s.split),legHd);
 // body: dips as a foot lands, slight roll toward the planted leg; overlap hides the hip seam
 var bob=-Math.abs(sn)*(s.heavy?1.8:1.4)*z+(s.heavy?.6:.4)*z;
 ctx.save();ctx.translate(0,legY+bob);ctx.rotate(sn*(s.heavy?.035:.045));
 ctx.drawImage(s.img,s.sx,s.sy,s.sw,legTop+s.sh*.06,x0,-size*s.legY,size,size*(s.legY+.06));
 ctx.restore();
 return true;
}
