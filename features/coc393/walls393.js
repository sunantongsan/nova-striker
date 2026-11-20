// 393: Clash-style wall controls. Tap a wall: name + level, then a single row of buttons
// [Info] [Select row] [Upgrade (cost)] [Move]. After Select row the whole straight row is
// highlighted and the bar becomes [Info] [Rotate row] [Upgrade xN (total)] [Other row] [Cancel].
// Upgrade opens a small confirm window showing the wall before/after and the price.
var wallRow393=null; // {anchor:id, mode:'x'|'y'|'all'}
function wallAnchor393(){return E.d.buildings.find(function(b){return b.id===selected&&b.type==='wall';});}
function wallMode393(b){return wallRow393&&wallRow393.anchor===b.id?wallRow393.mode:'one';}
function wallRowLen393(b,mode){return E.wallGroup(b.id,mode).length;}
function wallArt393(lv,size){lv=Math.max(1,Math.min(20,lv||1));return '<span class="wallArt393" style="width:'+size+'px;height:'+size+'px;background-position:'+((lv-1)%4*100/3)+'% '+(Math.floor((lv-1)/4)*25)+'%"></span>';}
function wallSync393(b){var mode=wallMode393(b);wallSelect268={anchor:b.id,mode:mode,count:mode==='one'?1:200};wallLastQuote268=null;}
Game.wallRow393=function(mode){var b=wallAnchor393();if(!b)return;
 if(mode==='one'){wallRow393=null;}
 else if(mode==='auto'){var x=wallRowLen393(b,'x'),y=wallRowLen393(b,'y');wallRow393={anchor:b.id,mode:x>=y?'x':'y'};}
 else if(mode==='other'&&wallRow393){wallRow393={anchor:b.id,mode:wallRow393.mode==='x'?'y':'x'};}
 else if(mode==='all')wallRow393={anchor:b.id,mode:'all'};
 wallSync393(b);hud();drawNeeded=true;};
Game.wallRotate393=function(){var b=wallAnchor393();if(!b||!wallRow393||wallRow393.mode==='all')return;var row=E.wallGroup(b.id,wallRow393.mode),ids=row.map(function(w){return w.id;});
 function tryTurn(sign){var cells=row.map(function(w){var dx=w.x-b.x,dy=w.y-b.y;return {w:w,x:b.x-sign*dy,y:b.y+sign*dx};});
  var ok=cells.every(function(c){return E.empty(c.x,c.y)||E.d.buildings.some(function(o){return o.x===c.x&&o.y===c.y&&ids.indexOf(o.id)>=0;});});return ok?cells:null;}
 var cells=tryTurn(1)||tryTurn(-1);if(!cells){toast(mt251('หมุนไม่ได้ มีสิ่งกีดขวาง','Cannot rotate: something is in the way'));return;}
 cells.forEach(function(c){c.w.x=c.x;c.w.y=c.y;});wallIndex219=null;E.save();wallRow393={anchor:b.id,mode:wallRow393.mode==='x'?'y':'x'};wallSync393(b);hud();drawNeeded=true;};
function wallQuote393(b){var mode=wallMode393(b),all=E.wallGroup(b.id,mode),q=E.wallQuote(b.id,mode);return {all:all,q:q};}
Game.wallUpgrade393=function(){var b=wallAnchor393();if(!b)return;var s=wallQuote393(b),q=s.q;
 if(!q.ids.length){toast(b.lv>=MAX_BUILDING_LEVEL?mt251('กำแพงระดับสูงสุดแล้ว','Walls are at max level'):mt251('อัปเกรดบ้านเป็ดก่อน','Upgrade the HQ first'));return;}
 var lvs=E.d.buildings.filter(function(w){return q.ids.indexOf(w.id)>=0;}).map(function(w){return w.lv;}),lo=Math.min.apply(null,lvs),enough=E.d.gold>=q.gold&&E.d.power>=q.power;
 wallPending393={id:b.id,mode:wallMode393(b),quote:JSON.stringify(q)};
 open('<section class="wallUp393"><h2>'+mt251('อัปเกรดกำแพง','Upgrade walls')+'</h2><div class="wallUpArt393">'+wallArt393(lo,86)+'<b>➜</b>'+wallArt393(lo+1,86)+'</div><p class="wallUpInfo393">'+q.ids.length+' '+mt251('ชิ้น','walls')+' · Lv.'+lo+' → Lv.'+(lo+1)+(lvs.some(function(l){return l!==lo;})?' '+mt251('(ทุกชิ้น +1)','(+1 each)'):'')+'<br>'+mt251('ความทนทาน','Hitpoints')+' '+Math.round(B.wall.hp*(1+(lo-1)*.45))+' → '+Math.round(B.wall.hp*(1+lo*.45))+'</p><button class="wide green wallPay393" '+(enough?'':'disabled')+' onclick="Game.wallApply393()"><i class="resourceArt303" style="background-position:0 50%"></i>'+q.gold.toLocaleString()+(q.power?' + <i class="resourceArt303" style="background-position:50% 50%"></i>'+q.power.toLocaleString():'')+'</button>'+(enough?'':'<p class="wallShort393">'+tr('ทรัพยากรไม่พอ')+'</p>')+'</section>');};
var wallPending393=null;
Game.wallApply393=function(){var p=wallPending393;wallPending393=null;close();if(!p)return;var b=wallAnchor393();if(!b||b.id!==p.id){toast(tr('รายการเปลี่ยน กรุณาเลือกใหม่'));return;}var msg=E.upgradeWalls(p.id,p.mode,p.quote);toast(msg||mt251('อัปเกรดกำแพงแล้ว','Walls upgraded'));hud();drawNeeded=true;};
Game.wallInfo393=function(){var b=wallAnchor393();if(!b)return;var walls=E.d.buildings.filter(function(w){return w.type==='wall';}),by={};walls.forEach(function(w){by[w.lv]=(by[w.lv]||0)+1;});
 open('<section class="wallUp393"><h2>'+tr('กำแพง')+' Lv.'+b.lv+'</h2><div class="wallUpArt393">'+wallArt393(b.lv,86)+'</div><p class="wallUpInfo393">'+mt251('ความทนทาน','Hitpoints')+' '+Math.round(B.wall.hp*(1+(b.lv-1)*.45))+' · '+mt251('ระดับสูงสุดตอนนี้','Max now')+' Lv.'+Math.min(MAX_BUILDING_LEVEL,E.hq())+'<br>'+mt251('กำแพงในฐาน','Walls in base')+' '+walls.length+'/'+E.buildCap('wall')+'</p><div class="wallLevels393">'+Object.keys(by).sort(function(a,c){return a-c;}).map(function(l){return '<span>'+wallArt393(+l,34)+'<b>×'+by[l]+'</b></span>';}).join('')+'</div>'+
  '<button class="wide" onclick="Game.close();Game.wallRow393(\'all\')">'+mt251('เลือกกำแพงทั้งหมด','Select all walls')+'</button><button class="wide" onclick="Game.close();Game.wallContinue268()">'+mt251('ลากสร้างกำแพงเพิ่ม','Drag to build more walls')+'</button></section>');};
var hudWalls393=hud;hud=function(){hudWalls393();if(screen!=='home'||placing||moving)return;var b=wallAnchor393(),box=$('selection');if(!b||!box)return;
 if(wallRow393&&wallRow393.anchor!==b.id)wallRow393=null;
 var mode=wallMode393(b),s=wallQuote393(b),q=s.q,enough=E.d.gold>=q.gold&&E.d.power>=q.power,can=q.ids.length>0,corner=wallRowLen393(b,'x')>1&&wallRowLen393(b,'y')>1;
 function btn(icon,label,action,cls,dis,sub){return '<button class="wallBtn393 '+(cls||'')+'" '+(dis?'disabled':'')+' onclick="'+action+'"><strong>'+icon+'</strong><span>'+label+'</span>'+(sub?'<small>'+sub+'</small>':'')+'</button>';}
 var cost=can?'<i class="resourceArt303" style="background-position:0 50%"></i>'+(q.gold>=10000?(q.gold/1000).toFixed(q.gold>=100000?0:1)+'K':q.gold.toLocaleString()):'MAX';
 var title='<div class="wallHead393">'+wallArt393(b.lv,40)+'<b>'+tr('กำแพง')+' <small>Lv.'+b.lv+'</small></b>'+(mode!=='one'?'<em>'+s.all.length+' '+mt251('ชิ้นที่เลือก','selected')+'</em>':'')+'</div>';
 var row='<div class="wallBar393">'+btn('i',mt251('ข้อมูล','Info'),'Game.wallInfo393()');
 if(mode==='one')row+=btn('⇆',mt251('เลือกแถว','Select row'),"Game.wallRow393('auto')",'',s.all.length<1)+btn('⬆',mt251('อัปเกรด','Upgrade'),'Game.wallUpgrade393()','green '+(enough?'':'short393'),!can||E.d.siegeLocked,cost)+btn('✥',mt251('ย้าย','Move'),'Game.moveBuilding261()');
 else row+=(mode!=='all'?btn('⟳',mt251('หมุนแถว','Rotate row'),'Game.wallRotate393()'):'')+btn('⬆',mt251('อัปเกรด','Upgrade')+(can?' ×'+q.ids.length:''),'Game.wallUpgrade393()','green '+(enough?'':'short393'),!can||E.d.siegeLocked,cost)+(corner&&mode!=='all'?btn('↻',mt251('อีกแนว','Other row'),"Game.wallRow393('other')"):'')+btn('✕',mt251('ยกเลิก','Cancel'),"Game.wallRow393('one')");
 row+='</div>';box.hidden=false;box.style.display='block';box.classList.add('wallSel393');setHTML219(box,'<section class="walls393">'+title+row+'</section>');
};
var selectionClear393=hud;hud=function(){selectionClear393();var box=$('selection');if(box&&box.classList&&!(screen==='home'&&!placing&&!moving&&wallAnchor393()))box.classList.remove('wallSel393');};
var drawWalls393=draw;draw=function(){drawWalls393();if(screen!=='home'||placing||moving)return;var b=wallAnchor393();if(!b||!wallRow393||wallRow393.anchor!==b.id)return;
 E.wallGroup(b.id,wallRow393.mode).forEach(function(w){var p=point(w.x,w.y);ctx.save();ctx.strokeStyle='#fff18a';ctx.lineWidth=2.4;ctx.shadowColor='#ffd84a';ctx.shadowBlur=6;ctx.beginPath();ctx.ellipse(p.x,p.y,17*zoom,10*zoom,0,0,Math.PI*2);ctx.stroke();ctx.restore();});};
// The old modal wall menu now just opens the in-map bar.
Game.wallMenu=function(){close();wallRow393=null;hud();};
