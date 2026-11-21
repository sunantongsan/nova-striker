// 391: environment art is fitted to the real build grid, and paid environments (ocean / sky)
// unlock a 26x26 build area instead of 20x20. Battle maps grow only for layouts that use it.
// Floor diamonds measured on each 768x512 quadrant of environments384.webp: top, right, bottom, left.
var floors391=[
 [[385,85],[675,262],[390,440],[98,252]],
 [[385,82],[690,250],[385,440],[75,245]],
 [[388,62],[700,205],[392,345],[78,195]],
 [[393,72],[700,212],[398,342],[78,212]]
];
function paidEnv391(){return planetChoice298>=2&&themeOwned383(planetChoice298);}
function outside391(limit){return E.d.buildings.filter(function(b){return b.x>limit||b.y>limit;});}
// Move buildings that sit outside a smaller grid to the nearest free cells inside it.
function fitBase391(limit){
 var moved=0,taken={};E.d.buildings.forEach(function(b){if(b.x<=limit&&b.y<=limit)taken[b.x+','+b.y]=1;});
 outside391(limit).sort(function(a,b){return (a.type==='wall')-(b.type==='wall');}).forEach(function(b){
  var cx=Math.min(limit,b.x),cy=Math.min(limit,b.y),best=null,bd=1e9;
  for(var x=1;x<=limit;x++)for(var y=1;y<=limit;y++){if(taken[x+','+y])continue;var d=Math.abs(x-cx)+Math.abs(y-cy);if(d<bd){bd=d;best={x:x,y:y};}}
  if(best){b.x=best.x;b.y=best.y;taken[best.x+','+best.y]=1;moved++;}
 });
 return moved;
}
function syncGrid391(){
 var g=paidEnv391()?GRID_PAID391:GRID_FREE391;
 if(g===GRID_FREE391&&outside391(GRID_FREE391).length){
  // Ownership disappeared (other account / refund): keep the base valid inside 20x20.
  var before=JSON.stringify(E.d.buildings);fitBase391(GRID_FREE391);E.d.grid391=g;if(!E.save())E.d.buildings=JSON.parse(before);
 }else if(E.d.grid391!==g){E.d.grid391=g;E.save();}
 terrainKey219='';drawNeeded=true;
}
var restore391=themeRestore383;themeRestore383=function(){restore391.apply(this,arguments);syncGrid391();};
var choose391=Game.choosePlanet298;
Game.choosePlanet298=function(i){
 if(Number.isInteger(i)&&i<2&&themeOwned383(i)){
  var out=outside391(GRID_FREE391);
  if(out.length){open('<section class="envFit391"><h2>'+mt251('พื้นที่ฐานเล็กลง','Smaller base area')+'</h2><p>'+mt251('ทุ่งหญ้าและทะเลทรายวางได้ 20×20 ช่อง มีอาคาร '+out.length+' หลังอยู่นอกพื้นที่ ระบบจะย้ายเข้ามาไว้ช่องว่างที่ใกล้ที่สุด กลับไปฉากเสียเงินเมื่อไรก็จัดฐานใหม่ได้','Meadow and desert allow 20×20 cells. '+out.length+' buildings are outside and will move to the nearest free cells. You can rearrange again in a paid scene.')+'</p><button class="wide green" onclick="Game.fitChoose391('+i+')">'+mt251('ย้ายอาคารแล้วเปลี่ยนฉาก','Move buildings and switch')+'</button><button class="wide" onclick="Game.planets298()">'+mt251('ยกเลิก','Cancel')+'</button></section>');return;}
 }
 choose391(i);syncGrid391();
};
Game.fitChoose391=function(i){var before=JSON.stringify(E.d.buildings);fitBase391(GRID_FREE391);if(!E.save()){E.d.buildings=JSON.parse(before);toast(mt251('บันทึกไม่ได้','Could not save'));return;}choose391(i);syncGrid391();};
// Exact fit of the art floor to the grid; vertical stretch is capped so paid platforms keep their shape.
paintTerrain219=function(map,raid){
 var i=planetChoice298,pal=planetPalette298();
 ctx.clearRect(0,0,viewWidth,viewHeight);box(0,0,viewWidth,viewHeight,pal.sky);
 if(!scenery384.complete||!scenery384.naturalWidth)return terrainFallback384(map,raid);
 var f=floors391[i]||floors391[0],sw=scenery384.naturalWidth/2,sh=scenery384.naturalHeight/2,k=sw/768;
 var hw=(f[1][0]-f[3][0])/2*k,hh=(f[2][1]-f[0][1])/2*k,ax=(f[1][0]+f[3][0])/2*k,ay=(f[0][1]+f[2][1])/2*k;
 var c=point((map-1)/2,(map-1)/2),gw=map*tile*zoom,gh=map*tile*ISO412*zoom;
 var sy=gh/hh*1.02,sx=Math.max(gw/hw*1.02,sy/1.22);
 // Only paint the blurred border where the opaque foreground leaves an edge visible.
 var left=c.x-ax*sx,top=c.y-ay*sy;
 if(left>0||top>0||left+sw*sx<viewWidth||top+sh*sy<viewHeight){
  var cover=Math.max(c.x/ax,(viewWidth-c.x)/(sw-ax),c.y/ay,(viewHeight-c.y)/(sh-ay),sx)*1.06;
  ctx.save();try{ctx.filter='blur(5px)';}catch(e){}ctx.globalAlpha=.95;
  ctx.drawImage(scenery384,i%2*sw,Math.floor(i/2)*sh,sw,sh,c.x-ax*cover,c.y-ay*cover,sw*cover,sh*cover);
  ctx.restore();
 }
 ctx.save();ctx.translate(c.x,c.y);ctx.scale(sx,sy);
 ctx.drawImage(scenery384,i%2*sw,Math.floor(i/2)*sh,sw,sh,-ax,-ay,sw,sh);
 ctx.restore();
 if(!raid&&(placing||moving)){var g=map-2;for(var x=1;x<=g;x++)for(var y=1;y<=g;y++)if(E.empty(x,y,moving))diamond(x,y,'rgba(255,255,255,.20)','#72b1a7');}
};
Game.environmentOverview384=function(){
 if(screen!=='home')return;fitCanvas();var map=homeMap391();
 zoom=Math.min(1.2,Math.max(.3,Math.min(viewWidth/(map*tile*2*1.08),viewHeight/(map*tile*ISO412*2*1.12))));
 panX=0;panY=viewHeight*.5-originY-(map-1)*tile*ISO412*zoom;terrainKey219='';drawNeeded=true;
};
syncGrid391();
