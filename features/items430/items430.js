// 430: battle items (the owner's own take on Clash spells). Made at the Tech Center (อาคารเทคโนโลยี, tech428) with
// Ore R, or bought with NOVA. Each is used once in a raid: tap the item card, then tap the battlefield.
//   haste   ยาเร่งพลัง        troops in the ring attack 75% faster
//   heal    ยารักษา           troops in the ring heal 12% of max HP per second
//   power   น้ำยาเพิ่มพลัง     troops in the ring hit 50% harder
//   void    ระเบิดหลุมดำ       weapons in the ring stop working (defenses, HQ, guards)
//   phase   วงแหวนทะลุทะลวง   walls in the ring stop blocking (troops walk through)
//   sonic   โซนิคบูม          one blast that smashes walls (and dents buildings) in the ring
// Stock lives in the save (d.items430). Capacity and unlocks follow the Tech Center level.
var ITEMS430=[
 {id:'haste',th:'ยาเร่งพลัง',en:'Haste Serum',icon:'⚡',color:'#ffc93a',unlock:1,r:300,nova:20,radius:2.6,dur:8,
  dTh:'ทหารในวงโจมตีเร็วขึ้น 75%',dEn:'Troops in the ring attack 75% faster'},
 {id:'heal',th:'ยารักษา',en:'Healing Tonic',icon:'💚',color:'#55e08a',unlock:3,r:300,nova:20,radius:2.6,dur:7,
  dTh:'ฟื้นเลือดทหารในวง 12% ต่อวินาที',dEn:'Heals troops in the ring 12% per second'},
 {id:'power',th:'น้ำยาเพิ่มพลัง',en:'Power Elixir',icon:'💪',color:'#ff6a5a',unlock:5,r:400,nova:30,radius:2.6,dur:8,
  dTh:'ทหารในวงโจมตีแรงขึ้น 50%',dEn:'Troops in the ring hit 50% harder'},
 {id:'void',th:'ระเบิดหลุมดำ',en:'Black Hole Bomb',icon:'🕳️',color:'#8a5cff',unlock:7,r:600,nova:50,radius:2.3,dur:5,
  dTh:'อาวุธในวงหยุดทำงาน 5 วินาที',dEn:'Weapons in the ring stop for 5 seconds'},
 {id:'phase',th:'วงแหวนทะลุทะลวง',en:'Phase Ring',icon:'🌀',color:'#46d6ff',unlock:9,r:500,nova:40,radius:2.6,dur:10,
  dTh:'ทหารเดินทะลุกำแพงในวงได้',dEn:'Troops pass through walls in the ring'},
 {id:'sonic',th:'โซนิคบูม',en:'Sonic Boom',icon:'💥',color:'#f2f6ff',unlock:12,r:500,nova:40,radius:2.2,dur:.8,
  dTh:'คลื่นเสียงทำลายกำแพงในวง',dEn:'A shock wave smashes walls in the ring'}];
var IT430={};ITEMS430.forEach(function(it){IT430[it.id]=it;});
function techLv430(){return E.level('tech428')||0;}
function cap430(){var l=techLv430();return l?Math.min(10,2+Math.floor(l/2)):0;}
function stock430(){var s=E.d.items430;if(!s||typeof s!=='object'){s=E.d.items430={};}return s;}
function held430(){var s=stock430();return ITEMS430.reduce(function(n,it){return n+(s[it.id]|0);},0);}
function why430(it){if(!techLv430())return mt251('สร้างอาคารเทคโนโลยีก่อน','Build the Tech Center first');if(techLv430()<it.unlock)return mt251('ปลดล็อกที่อาคารเทคโนโลยี Lv.','Unlocks at Tech Center Lv.')+it.unlock;if(held430()>=cap430())return mt251('ช่องเก็บไอเทมเต็ม','Item storage is full');return '';}
function name430(it){return mt251(it.th,it.en);}
Game.makeItem430=function(id){var it=IT430[id];if(!it)return;var why=why430(it);if(why){toast(why);return;}E.sync();
 if((E.d.zfluid410||0)<it.r){toast(mt251('แร่ R ไม่พอ','Not enough Ore R'));return;}
 var before=JSON.stringify(E.d);E.d.zfluid410-=it.r;stock430()[id]=(stock430()[id]|0)+1;if(!E.save()){E.d=JSON.parse(before);toast(tr('บันทึกไม่ได้'));return;}hud();Game.items430();};
Game.buyItem430=function(id){var it=IT430[id];if(!it)return;var why=why430(it);if(why){toast(why);return;}
 confirmNova358(it.nova,function(){var it2=IT430[id],w=why430(it2);if(w){toast(w);return;}if((E.d.gems||0)<it2.nova){toast(mt251('NOVA ไม่พอ','Not enough NOVA'));return;}
  var before=JSON.stringify(E.d);E.d.gems-=it2.nova;stock430()[id]=(stock430()[id]|0)+1;if(!E.save()){E.d=JSON.parse(before);toast(tr('บันทึกไม่ได้'));return;}hud();Game.items430();});};
function icon430(it,cls){return '<span class="ic430 '+(cls||'')+'" style="--c430:'+it.color+'">'+it.icon+'</span>';}
Game.items430=function(){E.sync();var s=stock430(),cap=cap430(),used=held430(),lv=techLv430();
 var cards=ITEMS430.map(function(it){var lock=lv<it.unlock,full=used>=cap,why=why430(it);
  return '<article class="card430'+(lock?' lock430':'')+'">'+icon430(it)+'<b>'+name430(it)+'</b><small>'+mt251(it.dTh,it.dEn)+'</small><em>×'+(s[it.id]|0)+'</em>'+
   (lock?'<p class="lockTxt430">🔒 '+mt251('อาคารเทคโนโลยี Lv.','Tech Center Lv.')+it.unlock+'</p>':
   '<div class="btn430"><button class="green" '+(why||(E.d.zfluid410||0)<it.r?'disabled':'')+' onclick="Game.makeItem430(\''+it.id+'\')">'+mt251('ผลิต','Make')+' '+zIcon410()+it.r+'</button><button '+(why||(E.d.gems||0)<it.nova?'disabled':'')+' onclick="Game.buyItem430(\''+it.id+'\')">'+mt251('ซื้อ','Buy')+' <i class="nova412"></i>'+it.nova+'</button></div>')+'</article>';}).join('');
 open('<section class="items430"><h2>'+mt251('ไอเทมสนามรบ','Battle items')+'</h2>'+
  (lv?'<div class="g419bar bar430"><span style="width:'+(cap?Math.min(100,used/cap*100):0)+'%"></span><b>'+mt251('ช่องเก็บ ','Storage ')+used+' / '+cap+'</b></div>':'<p class="lockTxt430">🔒 '+mt251('สร้างอาคารเทคโนโลยี (HQ 5) เพื่อผลิตและเก็บไอเทม','Build the Tech Center (HQ 5) to make and store items')+'</p>')+
  '<p class="tip430">'+zIcon410()+' '+mt251('แร่ R ','Ore R ')+Math.floor(E.d.zfluid410||0).toLocaleString()+' · <i class="nova412"></i> '+(E.d.gems||0).toLocaleString()+' · '+mt251('ใช้ในสนาม: แตะการ์ดไอเทม แล้วแตะจุดในสนาม','In battle: tap an item card, then tap the field')+'</p>'+
  '<div class="grid430">'+cards+'</div></section>');};
// entry points: Tech Center bar button, store "support" tab card
var hud430=hud;hud=function(){var r=hud430.apply(this,arguments);try{var sel=$('selection'),b=E.d.buildings.find(function(x){return x.id===selected;});
 if(screen==='home'&&sel&&b&&b.type==='tech428'&&!sel.querySelector('.itemsBtn430'))sel.insertAdjacentHTML('beforeend','<button class="wide itemsBtn430" onclick="Game.items430()">🧪 '+mt251('ไอเทมสนามรบ','Battle items')+'</button>');
 placeItems430();}catch(e){}return r;};
var shop430=renderShop348;renderShop348=function(s){shop430.apply(this,arguments);try{if(shopTab348!=='support')return;var g=modal.querySelector('.storeGrid348');if(g&&!g.querySelector('.shopItems430'))g.insertAdjacentHTML('afterbegin','<article class="skillCard348 shopItems430"><span class="ic430 big430" style="--c430:#ffc93a">🧪</span><b>'+mt251('ไอเทมสนามรบ','Battle items')+'</b><button onclick="Game.items430()">'+mt251('เลือก','Open')+'</button></article>');}catch(e){}};
// ---------- battle ----------
var armed430=null;
function canUse430(){var r=E.raid;return screen==='raid'&&r&&!r.result&&r.liveMode!=='preview'&&r.liveMode!=='defender'&&!(liveRoom&&(liveRoom.withdrawn||liveRoom.finished))&&(typeof myRaid428!=='function'||myRaid428());}
// 437: the item cards also show while scouting (like Clash spells), so you can see what you are bringing;
// they work once the attack has started.
function scouting430(){var r=E.raid;return screen==='raid'&&r&&!r.result&&r.liveMode==='preview'&&!(typeof liveTarget!=='undefined'&&liveTarget&&liveTarget.can_attack===false);}
function items430HTML(){var s=stock430();if(!canUse430()&&!scouting430())return '';return ITEMS430.filter(function(it){return (s[it.id]|0)>0;}).map(function(it){return '<button class="troop item430'+(armed430===it.id?' active':'')+'" onclick="Game.useItem430(\''+it.id+'\')">'+icon430(it,'card430i')+'<b>'+(s[it.id]|0)+'</b><small>'+name430(it)+'</small></button>';}).join('');}
// item cards ride along with the troop cards (same render pass, so they are never wiped by it)
var set430=setHTML219;setHTML219=function(el,html){if(el&&el.id==='deploy'&&screen==='raid'&&E.raid){var it=items430HTML(),at=html.indexOf('<button class="next395"');html=at>=0?html.slice(0,at)+it+html.slice(at):it+html;}return set430.call(this,el,html);};
function placeItems430(){if(!canUse430())armed430=null;}
Game.useItem430=function(id){if(!canUse430()){if(scouting430())toast(mt251('ปล่อยทหารเพื่อเริ่มบุกก่อน แล้วจึงใช้ไอเทม','Drop a troop to start the attack, then use items'));return;}if(!(stock430()[id]>0))return;armed430=armed430===id?null:id;if(armed430)toast(mt251('แตะจุดในสนามเพื่อใช้ ','Tap the field to use ')+name430(IT430[id]));hud();};
function cast430(id,x,y){var r=E.raid,it=IT430[id],s=stock430();if(!r||!it||!(s[id]>0))return;s[id]--;if(!s[id])delete s[id];E.save();
 r.zones430=(r.zones430||[]).concat({id:id,x:x,y:y,rad:it.radius,left:it.dur,dur:it.dur,color:it.color});
 if(id==='sonic')sonic430(r,x,y,it.radius);
 try{voice218('noise',id==='sonic'?300:1800,id==='sonic'?60:400,.35,.18,'sfx');voice218('sine',id==='void'?90:id==='heal'?660:520,id==='void'?40:880,.4,.12,'sfx');}catch(e){}
 armed430=null;hud();drawNeeded=true;}
function sonic430(r,x,y,rad){(r.buildings||[]).forEach(function(b){if(b.hp<=0||trap278(b))return;var d=Math.hypot(b.x-x,b.y-y);if(d>rad)return;if(b.type==='wall')b.hp=Math.max(0,b.hp-Math.max(b.max*.75,600));else b.hp=Math.max(1,b.hp-b.max*.08);});}
canvas.addEventListener('pointerdown',function(ev){if(!armed430||ev.button>0)return;if(!canUse430()){armed430=null;return;}var p=coordinates(ev),q=unpoint(p.x,p.y),r=E.raid,edge=(r.mapSize||22)-1;
 if(!(q.x>=-.5&&q.y>=-.5&&q.x<=edge+.5&&q.y<=edge+.5))return;ev.preventDefault();ev.stopImmediatePropagation();cast430(armed430,Math.max(0,Math.min(edge,q.x)),Math.max(0,Math.min(edge,q.y)));},true);
function inZone430(o,z){return Math.hypot(o.x-z.x,o.y-z.y)<=z.rad;}
function zoneTick430(r,dt){var zs=r&&r.zones430;if(!zs||!zs.length)return;var now=Date.now();
 zs.forEach(function(z){z.left-=dt;if(z.left<=0)return;
  if(z.id==='haste'||z.id==='heal'||z.id==='power')(r.troops||[]).forEach(function(t){if(t.hp<=0||t.alien||!inZone430(t,z))return;
   if(z.id==='haste')t.cool=(t.cool||0)-dt*.75;else if(z.id==='heal')t.hp=Math.min(t.max,t.hp+t.max*.12*dt);else t.pow430=now+250;});
  if(z.id==='void'){(r.buildings||[]).forEach(function(b){if(b.hp>0&&inZone430(b,z)){b.void430=now+250;b.cool=Math.max(b.cool||0,.3);}});(r.guards||[]).forEach(function(g){if(g.hp>0&&inZone430(g,z)){g.void430=now+250;g.cool=Math.max(g.cool||0,.3);}});}
 });r.zones430=zs.filter(function(z){return z.left>0;});}
var tick430=E.tick;E.tick=function(dt){try{if(this.raid&&!this.raid.result)zoneTick430(this.raid,dt);}catch(e){}return tick430.apply(this,arguments);};
var hit430=hit;hit=function(scene,target,damage,source,weapon){var now=Date.now();if(source&&source.void430>now)return 0;if(source&&source.pow430>now)damage*=1.5;return hit430.call(this,scene,target,damage,source,weapon);};
// phase ring: walls inside an active ring do not block paths
var route430=route;route=function(t,target,buildings,range,max){var r=E.raid,zs=r&&r.zones430&&r.zones430.filter(function(z){return z.id==='phase'&&z.left>0;});
 if(zs&&zs.length&&buildings)buildings=buildings.filter(function(b){return !(b.type==='wall'&&zs.some(function(z){return inZone430(b,z);}));});return route430.call(this,t,target,buildings,range,max);};
// rings on the field
var draw430=draw;draw=function(){draw430.apply(this,arguments);try{var r=E.raid;if(screen!=='raid'||!r||!r.zones430)return;r.zones430.forEach(function(z){var a=1-Math.max(0,z.left)/z.dur,pts=[];for(var i=0;i<36;i++){var t=i/36*Math.PI*2;pts.push(point(z.x+Math.cos(t)*z.rad,z.y+Math.sin(t)*z.rad));}
  ctx.save();ctx.beginPath();pts.forEach(function(p,i){if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});ctx.closePath();
  var pulse=.5+.5*Math.sin(Date.now()/160);ctx.globalAlpha=z.id==='sonic'?Math.max(0,1-a):(.16+.08*pulse);ctx.fillStyle=z.id==='void'?'#2a0f4a':z.color;ctx.fill();
  ctx.globalAlpha=z.id==='sonic'?Math.max(0,1-a):.85;ctx.lineWidth=3*zoom;ctx.strokeStyle=z.color;ctx.setLineDash(z.id==='phase'?[8*zoom,6*zoom]:[]);ctx.stroke();
  var c=point(z.x,z.y);if(z.id==='void'){ctx.globalAlpha=.85;ctx.fillStyle='#120320';ctx.beginPath();ctx.ellipse(c.x,c.y,10*zoom*(1+.2*pulse),5*zoom*(1+.2*pulse),0,0,7);ctx.fill();ctx.strokeStyle='#b58cff';ctx.lineWidth=2*zoom;ctx.stroke();}
  if(z.id==='sonic'){ctx.globalAlpha=Math.max(0,1-a);ctx.strokeStyle='#ffffff';ctx.lineWidth=5*zoom;ctx.beginPath();pts.forEach(function(p,i){var q={x:c.x+(p.x-c.x)*(.3+a),y:c.y+(p.y-c.y)*(.3+a)};if(i)ctx.lineTo(q.x,q.y);else ctx.moveTo(q.x,q.y);});ctx.closePath();ctx.stroke();}
  ctx.globalAlpha=.95;ctx.font=(18*zoom)+'px sans-serif';ctx.textAlign='center';ctx.fillText(IT430[z.id].icon,c.x,c.y-6*zoom);ctx.restore();});if(r.zones430.length)drawNeeded=true;}catch(e){}};
(function(){var st=document.createElement('style');st.id='items430';st.textContent=
 '.ic430{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;font-size:21px;background:radial-gradient(circle at 35% 30%,#fff 0,var(--c430) 55%,#2a3a5a 120%);box-shadow:0 2px 0 #1d3d5c66,inset 0 -3px 0 #0003}'+
 '.ic430.big430{width:48px;height:48px;font-size:26px}'+
 '.items430 .tip430{font-size:12px;margin:4px 0 8px;opacity:.85}.items430 .bar430{margin-bottom:4px}'+
 '.grid430{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:7px}'+
 '.card430{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 6px;border-radius:14px;background:linear-gradient(#fffaf0,#f3e6c8);border:1px solid #d9bf86;color:#4a3713;text-align:center}'+
 '.card430 b{font-size:14px}.card430 small{font-size:11px;opacity:.8;line-height:1.2;min-height:26px}.card430>em{position:absolute;top:6px;right:8px;font-style:normal;font-weight:800;font-size:13px;padding:1px 7px;border-radius:999px;background:#ffe2a6}'+
 '.card430.lock430{filter:grayscale(.7);opacity:.75}.lockTxt430{font-size:12px;margin:4px 0;color:#6b5a3a}'+
 '.btn430{display:grid;grid-template-columns:1fr 1fr;gap:5px;width:100%}.btn430 button{margin:0!important;min-height:34px;padding:4px!important;font-size:12px!important;white-space:nowrap}'+
 '.btn430 .fluid403{width:16px;height:16px;vertical-align:middle}.btn430 .nova412,.tip430 .nova412{display:inline-block;width:16px;height:16px;background:url(assets/nova-core.webp) center/contain no-repeat;vertical-align:middle}.tip430 .fluid403{width:16px;height:16px;vertical-align:middle}'+
 '#deploy .item430 .card430i{width:34px;height:34px;font-size:19px;margin:2px auto 0}#deploy .item430.active{outline:3px solid #ffd447;outline-offset:1px}';
 document.head.appendChild(st);})();
