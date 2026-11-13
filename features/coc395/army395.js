// 395: Clash-style army flow.
// - No transport ships anywhere: ground and air troops drop straight onto the field.
// - No separate "formation" step: every trained troop (up to camp capacity) goes to battle.
// - Deploy like Clash: pick a troop card, tap to drop one, hold to keep dropping, never inside
//   the red zone around buildings (shown when the battle opens and after an invalid tap).
// - Attack button opens a Clash-style attack hub; scouting shows End / Next and the troop bar,
//   and dropping the first troop on a scouted player base starts the attack.
(function(){
 var RED395=1.5,STREAM_MS395=130,HOLD_MS395=280;
 var flash395=0,pending395=null,hold395=null;

 // ---------- army: every trained troop goes to battle ----------
 var roster395=formationRoster360;
 formationRoster360=function(engine){return roster395(engine);};
 function armyList395(){return formationRoster360(E);}
 function armyCount395(){var a=armyList395(),n=0;a.forEach(function(v,i){n+=v*U[i].space;});return n;}
 function armyCap395(){return formationCapacity360(E);}
 function hasArmy395(){return armyList395().some(Boolean)||!!(E.d.mercenaries&&E.d.mercenaries.attack);}
 function chips395(list,small){return list.map(function(n,i){return n?'<span class="chip395'+(small?' small395':'')+'">'+unitPortrait393(i)+'<b>×'+n+'</b></span>':'';}).join('');}

 // Battle actions used to open the formation window first; start them straight away instead.
 ['scout','practiceStart','attackSelected'].forEach(function(name){
  var start=Game[name];if(!start)return;
  Game[name]=function(){
   var out=start.apply(this,arguments),battle=pendingFormationBattle360;
   if(battle){
    pendingFormationBattle360=null;close();E.sync();
    if(!hasArmy395()){toast(mt251('ฝึกทหารก่อนออกรบ','Train troops before attacking'));Game.training();return out;}
    battle.start();
   }
   noTransport395();return out;
  };
 });
 function noTransport395(){
  var r=E.raid;if(!r||r.liveMode==='defender'||r.liveMode==='preview')return;
  if(r.logistics277){r.logistics277=false;delete r.airAllowed278;}
  selectedShip277=null;commandMode299=false;selectedUnits299=[];
  if(r.army&&!(r.army[deployKind]>0)){var first=r.army.findIndex(function(n){return n>0;});if(first>=0)deployKind=first;}
 }

 // Army window: Train + Queue only. The train tab shows the current army like Clash.
 armyTabs360=function(active){if(active==='formation')active='train';return '<div class="novaTabs360">'+[['train',mt251('ฝึกทหาร','Train troops')],['queue',mt251('กำลังผลิต','Queue')]].map(function(a){return '<button aria-pressed="'+(active===a[0])+'" onclick="Game.armyView360(\''+a[0]+'\')">'+a[1]+'</button>';}).join('')+'</div>';};
 var view395=Game.armyView360;
 Game.armyView360=function(view){return view395.call(this,view==='formation'?'train':view);};
 var army395=Game.army278;
 Game.army278=function(){if(novaArmyView360==='formation')novaArmyView360='train';var out=army395.apply(this,arguments);strip395();return out;};
 Game.fleet277=Game.manifest277=Game.quarters277=function(){pendingFormationBattle360=null;Game.armyView360('train');};
 function strip395(){
  var hub=$('armyHub278');if(!hub||!hub.classList||!hub.classList.contains('novaArmy360'))return;
  var box=$('army395');
  if(!box){box=document.createElement('div');box.id='army395';var tabs=hub.querySelector('.novaTabs360');if(tabs&&tabs.after)tabs.after(box);else hub.insertBefore(box,hub.firstChild);}
  var list=armyList395(),html='<div class="armyHead395"><b>'+mt251('กองทัพพร้อมรบ','Your army')+'</b><span>'+armyCount395()+' / '+armyCap395()+'</span></div><div class="armyChips395">'+(chips395(list)||'<small>'+mt251('ยังไม่มีทหาร แตะ ＋ ผลิต ด้านล่าง','No troops yet. Tap ＋ Train below')+'</small>')+'</div>';
  if(box.innerHTML!==html)box.innerHTML=html;
 }
 var refresh395=refreshArmy278;refreshArmy278=function(){var out=refresh395.apply(this,arguments);strip395();return out;};

 // Production queue no longer lists transport ships.
 var jobs395=Engine.prototype.productionJobs359;
 if(jobs395)Engine.prototype.productionJobs359=function(){return jobs395.apply(this,arguments).filter(function(j){return j.kind!=='ship';});};

 // Strip leftover transport controls from any window or building panel.
 var SHIP395=/fleet277|buyShip277|shipInfo278|manifest277|Manifest277|selectTransport277|unload277|skipExtraction277|production359\('fleet'\)|unit:transport/;
 function purge395(rootEl){
  if(!rootEl||!rootEl.querySelectorAll)return;
  rootEl.querySelectorAll('button,details,.ship278,#ships278,.productionEntry359').forEach(function(el){
   var on=el.getAttribute&&(el.getAttribute('onclick')||''),txt=el.textContent||'';
   if(el.classList&&(el.classList.contains('ship278')||el.classList.contains('productionEntry359'))||el.id==='ships278'||SHIP395.test(on)||(el.tagName==='BUTTON'&&/ยานขนส่ง|ยานลำเลียง|กำลังผลิตยาน|Transport|Ship production/.test(txt)))el.remove();
  });
 }
 [modal,$('selection')].forEach(function(el){if(!el||!root.MutationObserver)return;var busy=false;new MutationObserver(function(){if(busy)return;busy=true;try{purge395(el);}finally{busy=false;}}).observe(el,{childList:true,subtree:true});});

 // ---------- red zone ----------
 function blocked395(r,x,y){
  return r.buildings.some(function(b){return b.hp>0&&b.type!=='wall'&&!trap278(b)&&Math.max(Math.abs(b.x-x),Math.abs(b.y-y))<RED395;});
 }
 function canDrop395(r){return r&&!r.result&&r.liveMode!=='defender'&&!(liveRoom&&(liveRoom.withdrawn||liveRoom.finished)&&r.liveMode!=='preview');}
 var deploy395=E.deploy;
 E.deploy=function(i,x,y){
  var r=this.raid;
  if(!canDrop395(r)||screen!=='raid')return deploy395.call(this,i,x,y);
  var edge=(r.mapSize||12)-1;
  if(!Number.isFinite(x)||!Number.isFinite(y)||x<-.5||y<-.5||x>edge+.5||y>edge+.5)return mt251('แตะในสนามรบ','Tap inside the battlefield');
  x=Math.max(0,Math.min(edge,x));y=Math.max(0,Math.min(edge,y));
  if(blocked395(r,x,y)){flash395=Date.now()+1600;drawNeeded=true;return mt251('วางในเขตสีแดงไม่ได้','You can’t deploy in the red zone');}
  if(r.liveMode==='preview'){
   var list=armyList395();
   if(!liveTarget||liveTarget.can_attack===false)return mt251('ฐานนี้มีโล่ป้องกัน แตะ ถัดไป','This base is shielded. Tap Next');
   if(!(list[i]>0)){var k=list.findIndex(Boolean);if(k<0)return mt251('ฝึกทหารก่อนออกรบ','Train troops before attacking');i=k;}
   if(!pending395){pending395={kind:i,x:x,y:y,at:Date.now()};Game.attackSelected();}
   return '';
  }
  return deploy395.call(this,i,x,y);
 };
 // Drop the first troop once the server has started the scouted attack.
 setInterval(function(){
  var p=pending395;if(!p)return;
  if(screen!=='raid'||Date.now()-p.at>20000){pending395=null;return;}
  var r=E.raid;if(!r||r.liveMode!=='attacker'||!liveRoom||liveRoom.role!=='attacker')return;
  if(E.d.pendingSiegeDeploy||warBusy)return;
  noTransport395();
  var kind=r.army&&r.army[p.kind]>0?p.kind:(r.army||[]).findIndex(function(n){return n>0;});
  pending395=null;if(kind<0)return;deployKind=kind;
  var err=E.deploy(kind,p.x,p.y);if(err)toast(err);hud();
 },250);

 function edge395(a,b){var p=point(a[0],a[1]),q=point(b[0],b[1]);ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);}
 var draw395=draw;
 draw=function(){
  draw395();
  var r=E.raid;if(screen!=='raid'||!canDrop395(r))return;
  var show=Date.now()<flash395||(!r.deployed&&!(r.troops||[]).length);if(!show)return;
  var cells={},list=[];
  r.buildings.forEach(function(b){if(b.hp<=0||b.type==='wall'||trap278(b))return;var bx=Math.round(b.x),by=Math.round(b.y);for(var dx=-1;dx<=1;dx++)for(var dy=-1;dy<=1;dy++){var k=(bx+dx)+','+(by+dy);if(!cells[k]){cells[k]=1;list.push([bx+dx,by+dy]);}}});
  var pulse=Date.now()<flash395?.55+.35*Math.abs(Math.sin(Date.now()/140)):.45;
  ctx.save();
  ctx.fillStyle='rgba(255,92,92,'+(.12*pulse)+')';
  list.forEach(function(c){var x=c[0],y=c[1];ctx.beginPath();edge395([x-.5,y-.5],[x+.5,y-.5]);var a=point(x+.5,y+.5),b=point(x-.5,y+.5);ctx.lineTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.closePath();ctx.fill();});
  ctx.beginPath();
  list.forEach(function(c){var x=c[0],y=c[1];
   if(!cells[x+','+(y-1)])edge395([x-.5,y-.5],[x+.5,y-.5]);
   if(!cells[x+','+(y+1)])edge395([x-.5,y+.5],[x+.5,y+.5]);
   if(!cells[(x-1)+','+y])edge395([x-.5,y-.5],[x-.5,y+.5]);
   if(!cells[(x+1)+','+y])edge395([x+.5,y-.5],[x+.5,y+.5]);});
  ctx.lineCap='round';ctx.strokeStyle='rgba(255,255,255,'+(.85*pulse)+')';ctx.lineWidth=3.2*zoom;ctx.stroke();
  ctx.strokeStyle='rgba(240,70,70,'+pulse+')';ctx.lineWidth=1.6*zoom;ctx.setLineDash([5*zoom,4*zoom]);ctx.stroke();
  ctx.restore();
  drawNeeded=true;
 };

 // ---------- hold to keep deploying ----------
 function streamDrop395(){
  var h=hold395;if(!h)return;
  var r=E.raid;if(screen!=='raid'||!canDrop395(r)||r.liveMode==='preview'){stopHold395();return;}
  if(liveRoom&&liveRoom.v===2&&(E.d.pendingSiegeDeploy||warBusy)){h.timer=setTimeout(streamDrop395,STREAM_MS395);return;}
  if(h.kind===undefined)h.kind=deployKind;var stock=(r.army||E.d.army)[h.kind];if(!(stock>0)||deployKind!==h.kind){stopHold395();hud();return;}
  var q=unpoint(h.x,h.y),j=h.count?(Math.random()-.5)*.5:0,k=h.count?(Math.random()-.5)*.5:0;
  var r2=E.raid,ed=(r2.mapSize||12)-1,err=E.deploy(deployKind,Math.max(0,Math.min(ed,q.x+j)),Math.max(0,Math.min(ed,q.y+k)));h.count++;
  if(err){if(h.count===1||!/กำลังส่ง|sending/i.test(err))toast(err);if(!/กำลังส่ง|sending/i.test(err)){stopHold395();hud();return;}}
  hud();h.timer=setTimeout(streamDrop395,STREAM_MS395);
 }
 function stopHold395(){if(hold395){clearTimeout(hold395.timer);hold395=null;}}
 canvas.addEventListener('pointerdown',function(e){
  stopHold395();
  if(screen!=='raid'||e.isPrimary===false||!canDrop395(E.raid)||E.raid.liveMode==='preview'||commandMode299)return;
  var p=coordinates(e);
  hold395={id:e.pointerId,sx:p.x,sy:p.y,x:p.x,y:p.y,count:0,streaming:false};
  hold395.timer=setTimeout(function(){var h=hold395;if(!h)return;h.streaming=true;if(drag&&drag.id===h.id)drag=null;streamDrop395();},HOLD_MS395);
 },true);
 canvas.addEventListener('pointermove',function(e){
  var h=hold395;if(!h||h.id!==e.pointerId)return;var p=coordinates(e);h.x=p.x;h.y=p.y;
  if(h.streaming){e.stopImmediatePropagation();e.preventDefault();return;}
  if(Math.abs(p.x-h.sx)+Math.abs(p.y-h.sy)>7)stopHold395();
 },true);
 ['pointerup','pointercancel'].forEach(function(t){canvas.addEventListener(t,function(e){var h=hold395;if(!h||h.id!==e.pointerId)return;var streamed=h.streaming;stopHold395();if(streamed){e.stopImmediatePropagation();hud();}},true);});

 // ---------- battle bar ----------
 function cleanBar395(html){
  return String(html)
   .replace(/<button onclick="Game\.commandMode299\(\)"[^>]*>[^<]*<\/button>/g,'')
   .replace(/<button onclick="Game\.selectAll299\(\)"[^>]*>[^<]*<\/button>/g,'')
   .replace(/<button class="troop( active)?"([^>]*)>([\s\S]*?)<b>0<\/b>/g,function(m,a,rest,body){return '<button class="troop empty395" disabled'+rest+'>'+body+'<b>0</b>';});
 }
 function scoutBar395(){
  var list=armyList395(),shield=!liveTarget||liveTarget.can_attack===false;
  if(!(list[deployKind]>0)){var k=list.findIndex(Boolean);if(k>=0)deployKind=k;}
  var cards=U.map(function(u,i){return list[i]?'<button class="troop'+(i===deployKind?' active':'')+'" onclick="Game.unit('+i+')" '+(shield?'disabled':'')+'>'+unitPortrait393(i)+'<b>'+list[i]+'</b><small>'+u.name+'</small></button>':'';}).join('');
  return '<button class="end395" onclick="Game.home()">'+mt251('จบ','End')+'</button>'+(cards||'<button class="train395" onclick="Game.home();Game.training()">'+mt251('ฝึกทหาร','Train')+'</button>')+'<button class="next395" onclick="Game.nextTarget()">'+mt251('ถัดไป','Next')+' ▶<small>◉ 100</small></button>';
 }
 var hud395=hud;
 hud=function(){
  var deployEl=$('deploy'),write=setHTML219;
  setHTML219=function(el,html){
   if(el===deployEl&&screen==='raid'&&E.raid){var r=E.raid;html=r.liveMode==='preview'&&!r.result?scoutBar395():cleanBar395(html);}
   write(el,html);
  };
  try{noTransport395();hud395.apply(this,arguments);}finally{setHTML219=write;}
  if(deployEl&&deployEl.classList)deployEl.classList.toggle('coc395',screen==='raid');
  var r=E.raid;if(screen!=='raid'||!r||r.result)return;
  if(r.liveMode==='preview'){
   if($('battleBack243'))$('battleBack243').hidden=true;
   $('instruction').textContent=liveTarget&&liveTarget.can_attack===false?mt251('ฐานนี้มีโล่ป้องกัน • แตะ ถัดไป เพื่อหาฐานใหม่','Shielded base • Tap Next to find another'):mt251('เลือกทหาร แล้วแตะนอกเขตสีแดงเพื่อเริ่มบุก','Pick a troop, then tap outside the red zone to attack');
   if(pending395)$('instruction').textContent=mt251('กำลังเริ่มการบุก…','Starting attack…');
  }else if(r.liveMode!=='defender'&&!(liveRoom&&liveRoom.withdrawn)){
   $('instruction').textContent=mt251('แตะเพื่อปล่อยทหาร • กดค้างเพื่อปล่อยต่อเนื่อง • ห้ามวางในเขตสีแดง','Tap to deploy • Hold to keep deploying • Not in the red zone');
  }
 };

 // ---------- attack hub (Clash "Attack!" screen) ----------
 var findWar395=Game.findWar;
 Game.findMatch395=function(){
  close();E.sync();
  if(!hasArmy395()){toast(mt251('ฝึกทหารก่อนค้นหาคู่ต่อสู้','Train troops before searching'));Game.training();return;}
  if(E.d.gold<100){toast(mt251('ทองไม่พอ • ค้นหาครั้งละ 100 ทอง','Not enough gold • 100 gold per search'));return;}
  findWar395.apply(Game,arguments);
 };
 Game.findWar=function(){
  E.sync();
  var stage=Number(E.d.stage)||1,list=armyList395();
  open('<section class="hub395"><h2>'+mt251('โจมตี!','Attack!')+'</h2>'+
   '<div class="hubGrid395">'+
   '<button class="hubCard395 solo395" onclick="Game.close();Game.missions()"><span class="hubIcon395">🛸</span><b>'+mt251('บุกฐานต่างดาว','Alien campaign')+'</b><small>'+mt251('เล่นคนเดียว • ด่าน ','Single player • Stage ')+stage+'</small></button>'+
   '<button class="hubCard395 match395" onclick="Game.findMatch395()"><span class="hubIcon395">⚔</span><b>'+mt251('ค้นหาคู่ต่อสู้','Find a match')+'</b><small>◉ 100 '+mt251('ทอง','gold')+'</small></button>'+
   '</div>'+
   '<div class="hubArmy395"><div class="armyHead395"><b>'+mt251('กองทัพของคุณ','Your army')+'</b><span>'+armyCount395()+' / '+armyCap395()+'</span><button class="green" onclick="Game.close();Game.training()">'+mt251('ฝึกทหาร','Train')+'</button></div><div class="armyChips395">'+(chips395(list,true)||'<small>'+mt251('ยังไม่มีทหาร','No troops yet')+'</small>')+'</div></div></section>');
 };
 (function(){var b=$('playerSearch382');if(!b)return;b.setAttribute('onclick','Game.findWar()');b.title=mt251('โจมตี!','Attack!');b.setAttribute('aria-label',b.title);var l=b.querySelector('.railLabel373');if(l)l.textContent=b.title;b.classList.add('attack395');})();

 // ---------- style ----------
 if(document.createElement&&document.head){var st=document.createElement('style');st.id='coc395';st.textContent=[
  'html body #app[data-battle300="true"] #deploy.coc395.coc395{align-items:flex-end!important;gap:6px!important;height:50px!important;max-height:50px!important;min-height:50px!important;overflow-x:auto!important;overflow-y:hidden!important;padding:0 4px!important;box-sizing:border-box!important}',
  'html body #app[data-battle300="true"] #deploy.coc395.coc395>button.troop{position:relative!important;flex:0 0 54px!important;width:54px!important;min-width:54px!important;height:48px!important;min-height:48px!important;padding:1px 1px 11px!important;border-radius:10px!important;border:2px solid #fff!important;background:linear-gradient(#ffffff,#cfe9ff)!important;box-shadow:0 3px 0 #6f9cc2!important;color:#24435a!important;text-shadow:none!important;transition:transform .12s}',
  'html body #app[data-battle300="true"] #deploy.coc395.coc395>button.troop.active{border-color:#ffb300!important;background:linear-gradient(#fffbe6,#ffd76a)!important;box-shadow:inset 0 0 0 2px #ffe58a,0 3px 0 #c98a00!important}',
  'html body #app[data-battle300="true"] #deploy.coc395.coc395>button.troop .icon{width:30px!important;height:30px!important;display:block!important;margin:1px auto 0!important}',
  'html body #app[data-battle300="true"] #deploy.coc395.coc395>button.troop b{position:absolute!important;top:1px;left:1px;padding:0 4px;border-radius:7px;background:#2d5b86!important;color:#fff!important;font:800 10px/13px Tahoma,Arial,sans-serif!important}',
  'html body #app[data-battle300="true"] #deploy.coc395.coc395>button.troop b:before{content:"×"}',
  'html body #app[data-battle300="true"] #deploy.coc395.coc395>button.troop small{position:absolute!important;left:0;right:0;bottom:0;font:700 8px/10px Tahoma,Arial,sans-serif!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  'html body #app[data-battle300="true"] #deploy.coc395.coc395>button.troop.empty395,html body #app[data-battle300="true"] #deploy.coc395.coc395>button.troop[disabled]{filter:grayscale(1);opacity:.55}',
  'html body #app[data-battle300="true"] #deploy.coc395.coc395>button.end395{flex:0 0 54px!important;width:54px!important;min-width:54px!important;height:46px!important;min-height:46px!important;border-radius:12px!important;background:linear-gradient(#ff8c8c,#e8505b)!important;border:3px solid #fff!important;box-shadow:0 3px 0 #a8323c!important;color:#fff!important;font:800 14px Tahoma,Arial,sans-serif!important}',
  'html body #app[data-battle300="true"] #deploy.coc395.coc395>button.next395{position:fixed!important;right:max(12px,env(safe-area-inset-right,0px))!important;bottom:calc(64px + env(safe-area-inset-bottom,0px))!important;flex:none!important;width:116px!important;min-width:116px!important;height:56px!important;min-height:56px!important;border-radius:16px!important;background:linear-gradient(#ffd27a,#ff9a3c)!important;border:3px solid #fff!important;box-shadow:0 4px 0 #c46a18!important;color:#5a2e00!important;text-shadow:0 1px #ffe9b8!important;font:900 18px/20px Tahoma,Arial,sans-serif!important;z-index:5}',
  'html body #app[data-battle300="true"] #deploy.coc395.coc395>button.next395 small{display:block;font:800 11px/13px Tahoma,Arial,sans-serif!important}',
  'html body #app[data-battle300="true"] #deploy.coc395.coc395>button.train395{flex:0 0 96px!important;width:96px!important;height:46px!important;min-height:46px!important}',
  '#army395{margin:6px 0 8px;padding:8px 10px;border-radius:14px;background:linear-gradient(#eef8ff,#d9eeff);border:2px solid #b9daf3}',
  '.armyHead395{display:flex;align-items:center;gap:8px;color:#234b5b}.armyHead395 b{font-size:14px}.armyHead395 span{margin-left:auto;font-weight:800;background:#2d5b86;color:#fff;border-radius:10px;padding:2px 10px}',
  '.armyHead395 button{min-height:34px;padding:4px 12px;border-radius:10px}',
  '.armyChips395{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.armyChips395 small{color:#4f7184}',
  '.chip395{position:relative;display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:10px;background:#fff;border:2px solid #fff;box-shadow:0 2px 0 #9cc3df;overflow:hidden}',
  '.chip395 .icon{width:40px!important;height:40px!important;display:block}.chip395 b{position:absolute;left:2px;top:1px;font:800 11px Tahoma,Arial,sans-serif;color:#fff;background:#2d5b86;border-radius:8px;padding:0 4px}',
  '.chip395.small395{width:44px;height:44px}.chip395.small395 .icon{width:34px!important;height:34px!important}',
  '.hub395 h2{margin:2px 0 10px}.hubGrid395{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
  '.hubCard395{display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:118px;border-radius:18px!important;border:3px solid #fff!important;padding:10px!important}',
  '.hubCard395 b{font-size:17px}.hubCard395 small{font-size:12px;font-weight:700}.hubIcon395{font-size:34px;line-height:40px}',
  '.solo395{background:linear-gradient(#bfe6ff,#7cc4f5)!important;box-shadow:0 4px 0 #4f8fbd!important;color:#163c58!important}',
  '.match395{background:linear-gradient(#ffd98a,#ff9e45)!important;box-shadow:0 4px 0 #c46a18!important;color:#4d2600!important}',
  '.hubArmy395{margin-top:10px;padding:8px 10px;border-radius:14px;background:#fff7e5;border:2px solid #f0d9a8}',
  '#homebar>#playerSearch382.attack395{background:radial-gradient(circle at 50% 35%,#ffe7a8,#ffb057)!important;border:3px solid #fff!important;box-shadow:0 4px 0 #c97a26!important;border-radius:20px!important}',
  '#homebar>#playerSearch382.attack395 .railLabel373{font-weight:900!important;font-size:13px!important;color:#5a2e00!important}'
 ].join('\n');document.head.appendChild(st);}
})();
