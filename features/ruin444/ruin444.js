// 444 (owner 2026-11-27): a destroyed building must not keep its shape. Clash-style, it collapses into a low,
// slightly faded rubble pile on a scorched patch (one pile per building family), with a short dust burst.
// Walls and traps keep their own handling. The HQ no longer stands as a tall 3D wreck with an HP bar.
var ruinDraw444=drawBuilding;
function ruinIndex444(b){
 if(b.type==='hq')return 0;
 if(['factory','barracks','airbase','garrison','camp','tech','lab','research','outpost','builder','spell'].indexOf(b.type)>=0)return 1;
 if(/store|storage|tank|mine|bank/.test(b.type))return 2;
 if(/reactor|power|crystal|pod|shield|extractor|plant|red/.test(b.type))return 3;
 return 4;
}
drawBuilding=function(b,enemy){
 if(!b||b.type==='wall'||b.hp===undefined||b.hp>0||trap278(b)||!(wreckParts.complete&&wreckParts.naturalWidth))return ruinDraw444.apply(this,arguments);
 var p=point(b.x,b.y),z=zoom,size=tile*zoom*2.25*(b.type==='hq'?1.15:1);
 if(p.x+size<0||p.x-size>viewWidth||p.y+size*.3<0||p.y-size>viewHeight)return;
 var now=Date.now();if(!b.ruin444)b.ruin444=now;var age=(now-b.ruin444)/1000,fall=Math.min(1,age/.35);
 var idx=ruinIndex444(b),cell=wreckParts.naturalWidth/3,h=wreckParts.naturalHeight/2,w=size*.82,squash=.42+.58*(1-Math.pow(1-fall,3));
 ctx.save();
 // scorched ground
 ctx.globalAlpha=.32;ctx.fillStyle='#2b2620';ctx.beginPath();ctx.ellipse(p.x,p.y-w*.12,w*.5,w*.26,0,0,Math.PI*2);ctx.fill();
 // rubble settles from a flattened burst into a low pile
 ctx.globalAlpha=.84;ctx.translate(p.x,p.y-w*.06);ctx.scale(1+(1-fall)*.12,squash*.78);
 ctx.drawImage(wreckParts,idx%3*cell,idx<3?0:h,cell,h,-w/2,-w*.82,w,w);
 ctx.restore();
 if(age<.6){ctx.save();var k=age/.6;ctx.globalAlpha=(1-k)*.45;ctx.fillStyle='#cfc3b0';for(var j=0;j<6;j++){var a=j*1.047+b.id;ctx.beginPath();ctx.ellipse(p.x+Math.cos(a)*w*.42*k,p.y-w*.18+Math.sin(a)*w*.18*k-k*12*z,(5+k*12)*z,(4+k*8)*z,0,0,Math.PI*2);ctx.fill();}ctx.restore();drawNeeded=true;}
 else if(age<20){ctx.save();var t=(frame*.012+b.id*.31)%1;ctx.globalAlpha=(1-t)*.16*(1-age/20);ctx.fillStyle='#4a4d55';ctx.beginPath();ctx.ellipse(p.x+t*6*z,p.y-(12+t*26)*z,(3+t*6)*z,(4+t*7)*z,0,0,Math.PI*2);ctx.fill();ctx.restore();}
};
