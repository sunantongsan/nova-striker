// 444 (owner 2026-11-27): dropping troops should feel as easy as Clash of Clans.
// - A tap inside the red zone drops the troop on the nearest open spot just outside it (up to ~3 tiles away)
//   instead of refusing; the red zone still flashes so the player learns where it is.
// - While holding to stream troops, sliding over the red zone keeps streaming along its edge instead of stopping.
// - A tap that wobbles a little still counts as a tap (pan starts after a larger move in battle).
// - Online attacks: a tap no longer waits for the server to confirm the previous troop ("กำลังส่งคำสั่ง").
//   Taps are queued and sent one after another as fast as the server answers, and every tap shows a drop ring at once.
function redAt444(r,x,y){return r.buildings.some(function(b){return b.hp>0&&b.type!=='wall'&&!trap278(b)&&Math.max(Math.abs(b.x-x),Math.abs(b.y-y))<1.5;});}
function openSpot444(r,x,y){
 var edge=(r.mapSize||12)-1,best=null,bd=1e9;
 for(var rad=.25;rad<=3.01&&!best;rad+=.25){
  for(var k=0;k<24;k++){var a=k*Math.PI/12,nx=Math.max(0,Math.min(edge,x+Math.cos(a)*rad)),ny=Math.max(0,Math.min(edge,y+Math.sin(a)*rad));
   if(redAt444(r,nx,ny))continue;var d=Math.hypot(nx-x,ny-y);if(d<bd){bd=d;best={x:nx,y:ny};}}
 }
 return best;
}
var deploy444=E.deploy;
E.deploy=function(i,x,y){
 var r=this.raid;
 if(screen==='raid'&&r&&!r.result&&r.liveMode!=='defender'&&Number.isFinite(x)&&Number.isFinite(y)){
  var edge=(r.mapSize||12)-1;
  if(x>=-.5&&y>=-.5&&x<=edge+.5&&y<=edge+.5){
   var cx=Math.max(0,Math.min(edge,x)),cy=Math.max(0,Math.min(edge,y));
   if(redAt444(r,cx,cy)){var spot=openSpot444(r,cx,cy);if(spot){x=spot.x;y=spot.y;try{flash395=Date.now()+900;}catch(e){}drawNeeded=true;}}
  }
 }
 if(online444()&&(E.d.pendingSiegeDeploy||warBusy)){
  var have=(r&&r.army||[])[i]||0,queued=queue444.filter(function(q){return q.kind===i;}).length;
  if(queued>=have)return mt251('ทหารชนิดนี้หมดแล้ว','No more of this troop');
  if(queue444.length<40){queue444.push({kind:i,x:x,y:y});mark444(x,y);}
  return '';
 }
 var msg=deploy444.call(this,i,x,y);if(!msg)mark444(x,y);return msg;
};
var queue444=[],marks444=[];
function online444(){var r=E.raid;return screen==='raid'&&!!r&&!r.result&&typeof liveRoom!=='undefined'&&!!liveRoom&&liveRoom.v===2&&liveRoom.role==='attacker'&&!liveRoom.withdrawn&&!liveRoom.finished;}
function mark444(x,y){marks444.push({x:x,y:y,at:Date.now()});if(marks444.length>24)marks444.shift();drawNeeded=true;}
setInterval(function(){
 if(!queue444.length)return;
 if(!online444()){queue444.length=0;return;}
 if(E.d.pendingSiegeDeploy||warBusy)return;
 var q=queue444.shift(),m=deploy444.call(E,q.kind,q.x,q.y);
 if(m&&/กำลังส่ง|sending/i.test(m))queue444.unshift(q);else if(m){queue444.length=0;toast(m);}
 try{hud();}catch(e){}
},40);
var draw444=draw;
draw=function(){
 draw444.apply(this,arguments);
 if(!marks444.length)return;var now=Date.now();marks444=marks444.filter(function(m){return now-m.at<450;});if(screen!=='raid')return;
 ctx.save();marks444.forEach(function(m){var k=(now-m.at)/450,p=point(m.x,m.y);ctx.globalAlpha=(1-k)*.9;ctx.strokeStyle='#ffffff';ctx.lineWidth=2.5*zoom;ctx.beginPath();ctx.ellipse(p.x,p.y,(6+18*k)*zoom,(3+9*k)*zoom,0,0,Math.PI*2);ctx.stroke();});ctx.restore();
 if(marks444.length)drawNeeded=true;
};
