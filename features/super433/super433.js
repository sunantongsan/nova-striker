// 433: ทหารเสริมพลัง (Clash-style super troops). Boost a troop type for 3 days with Syrup or Golden Eggs (two types at a time);
// every unit of that type you deploy is a burning super version: +25% HP and damage, flames on its body, and a new trick.
//   0 เป็ดส้อม -> เป็ดส้อมเพลิง      shots also scorch a second target nearby (50%)
//   2 เป็ดยักษ์กระทะ  -> หุ่นจรวดคู่        fires two rockets per shot (+60% damage)
//   1 เป็ดหนังสติ๊ก   -> เป็ดหนังสติ๊กหนามเพลิง     triple damage to walls
//   6 เป็ดหม้อ -> เป็ดหม้อสะท้อน      reflects 30% of turret damage back
var SUPER433={0:{th:'เป็ดส้อมเพลิง',en:'Blaze Ranger',aTh:'กระสุนไฟลามโดนเป้าข้าง ๆ อีก 1 (50%)',aEn:'Shots scorch a second nearby target (50%)'},
 2:{th:'หุ่นจรวดคู่',en:'Twin Rocketeer',aTh:'ยิงจรวดทีละ 2 ลูก (แรงขึ้น 60%)',aEn:'Two rockets per shot (+60% damage)'},
 1:{th:'เป็ดหนังสติ๊กหนามเพลิง',en:'Spike Tank',aTh:'ทำลายกำแพงแรงขึ้น 3 เท่า',aEn:'Triple damage to walls'},
 6:{th:'เป็ดหม้อสะท้อน',en:'Mirror Shield',aTh:'สะท้อนดาเมจป้อมกลับ 30%',aEn:'Reflects 30% of turret damage'}};
var SUPER_R433=2000,SUPER_NOVA433=80,SUPER_DAYS433=3,SUPER_MAX433=2,SUPER_HQ433=7;
function boosts433(){var b=E.d.boost433;if(!b||typeof b!=='object')b=E.d.boost433={};var now=Date.now();Object.keys(b).forEach(function(k){if(!(b[k]>now))delete b[k];});return b;}
function active433(k){var b=boosts433();return b[k]>Date.now();}
function left433(k){return Math.max(0,(boosts433()[k]||0)-Date.now())/1000;}
function dleft433(sec){var d=Math.floor(sec/86400),h=Math.floor(sec%86400/3600),m=Math.floor(sec%3600/60);return d?d+mt251(' วัน ',' d ')+h+mt251(' ชม.',' h'):h?h+mt251(' ชม. ',' h ')+m+mt251(' นาที',' m'):m+mt251(' นาที',' m');}
function sname433(k){return mt251(SUPER433[k].th,SUPER433[k].en);}
function why433(k){if(E.hq()<SUPER_HQ433)return mt251('ปลดล็อกที่บ้านเป็ด ','Unlocks at Duck House ')+SUPER_HQ433;if(active433(k))return '';if(Object.keys(boosts433()).length>=SUPER_MAX433)return mt251('เสริมพลังได้พร้อมกัน 2 ชนิด','Only 2 boosts at a time');return '';}
function give433(k){var b=boosts433();b[k]=Math.max(b[k]||0,Date.now())+SUPER_DAYS433*86400000;}
Game.boostR433=function(k){var why=why433(k);if(why){toast(why);return;}E.sync();if((E.d.zfluid410||0)<SUPER_R433){toast(mt251('ไซรัป ไม่พอ','Not enough Syrup'));return;}
 var before=JSON.stringify(E.d);E.d.zfluid410-=SUPER_R433;give433(k);if(!E.save()){E.d=JSON.parse(before);toast(tr('บันทึกไม่ได้'));return;}hud();Game.super433();};
Game.boostNova433=function(k){var why=why433(k);if(why){toast(why);return;}confirmNova358(SUPER_NOVA433,function(){var w=why433(k);if(w){toast(w);return;}if((E.d.gems||0)<SUPER_NOVA433){toast(mt251('ไข่ทอง ไม่พอ','Not enough Golden Eggs'));return;}
 var before=JSON.stringify(E.d);E.d.gems-=SUPER_NOVA433;give433(k);if(!E.save()){E.d=JSON.parse(before);toast(tr('บันทึกไม่ได้'));return;}hud();Game.super433();});};
Game.super433=function(){E.sync();var lockAll=E.hq()<SUPER_HQ433,used=Object.keys(boosts433()).length;
 var cards=Object.keys(SUPER433).map(function(k){k=+k;var s=SUPER433[k],on=active433(k),why=why433(k);
  return '<article class="sup433'+(on?' on433':'')+'"><div class="supPic433">'+portrait278(k)+'<i class="flame433"></i></div><b>'+sname433(k)+'</b><small class="from433">'+mt251('จาก ','from ')+U[k].name+'</small><small>❤ ⚔ +25% · '+mt251(s.aTh,s.aEn)+'</small>'+
   (on?'<p class="left433">🔥 '+mt251('เสริมพลังอยู่ · เหลือ ','Boosted · ')+dleft433(left433(k))+'</p><div class="btn433"><button class="green" '+((E.d.zfluid410||0)<SUPER_R433?'disabled':'')+' onclick="Game.boostR433('+k+')">+3 '+mt251('วัน ','days ')+zIcon410()+SUPER_R433+'</button><button '+((E.d.gems||0)<SUPER_NOVA433?'disabled':'')+' onclick="Game.boostNova433('+k+')">+3 '+mt251('วัน ','days ')+'<i class="nova412"></i>'+SUPER_NOVA433+'</button></div>':
   '<div class="btn433"><button class="green" '+(why||(E.d.zfluid410||0)<SUPER_R433?'disabled':'')+' onclick="Game.boostR433('+k+')">'+zIcon410()+SUPER_R433+'</button><button '+(why||(E.d.gems||0)<SUPER_NOVA433?'disabled':'')+' onclick="Game.boostNova433('+k+')"><i class="nova412"></i>'+SUPER_NOVA433+'</button></div>'+(why&&!lockAll?'<p class="left433">'+why+'</p>':''))+'</article>';}).join('');
 open('<section class="super433"><h2>🔥 '+mt251('ทหารเสริมพลัง','Super troops')+'</h2><p class="tip433">'+(lockAll?'🔒 '+mt251('ปลดล็อกที่บ้านเป็ด ','Unlocks at Duck House ')+SUPER_HQ433+' · ':'')+mt251('เสริมพลังได้ครั้งละ 2 ชนิด ('+used+'/2) · ครั้งละ 3 วัน · ทหารชนิดนั้นที่ส่งลงสนามจะมีไฟลุกทั้งตัว','Boost up to 2 types ('+used+'/2) · 3 days each · every unit of that type burns in battle')+'</p><div class="grid433">'+cards+'</div></section>');};
// entry: button at the top of the army window, fire badge on boosted troops
var army433=Game.army278;Game.army278=function(){var r=army433.apply(this,arguments);try{var hub=$('armyHub278');if(hub&&!hub.querySelector('.supBtn433')){var h=hub.querySelector('.novaFilter360');if(h)h.insertAdjacentHTML('beforebegin','<button class="supBtn433" onclick="Game.super433()">🔥 '+mt251('ทหารเสริมพลัง','Super troops')+'</button>');}
 Object.keys(SUPER433).forEach(function(k){if(!active433(k))return;var b=hub&&hub.querySelector('button[onclick="Game.unitInfo278('+k+')"]'),a=b&&b.closest('article');if(a)a.classList.add('fire433');});}catch(e){}return r;};
// battle: boosted units burn and get their trick
function sweep433(){try{var r=E.raid;if(!r||r.result||r.liveMode==='preview'||r.liveMode==='defender'||(typeof myRaid428==='function'&&!myRaid428()))return;
 (r.troops||[]).forEach(function(t){if(t.s433||t.alien||t.titan342||!SUPER433[t.kind])return;t.s433=1;if(!active433(t.kind))return;t.super433=1;t.max*=1.25;t.hp*=1.25;});}catch(e){}}
var tickUI433=tickUI342;tickUI342=function(dt){sweep433();return tickUI433.apply(this,arguments);};
var hit433=hit,inner433=false;hit=function(scene,target,damage,source,weapon){
 if(inner433)return hit433.apply(this,arguments);
 if(source&&source.super433){damage*=1.25;if(source.kind===2)damage*=1.6;if(source.kind===1&&target&&target.type==='wall')damage*=3;}
 var out=hit433.call(this,scene,target,damage,source,weapon);
 try{inner433=true;
  if(source&&source.super433&&source.kind===0&&scene){var pool=(scene.buildings||[]).concat(scene.guards||[],scene.enemies||[]).filter(function(o){return o!==target&&o.hp>0&&!(o.type&&trap278(o))&&Math.hypot(o.x-target.x,o.y-target.y)<=1.6;});
   pool.sort(function(a,b){return Math.hypot(a.x-target.x,a.y-target.y)-Math.hypot(b.x-target.x,b.y-target.y);});if(pool[0])hit433.call(this,scene,pool[0],damage*.5,source,weapon);}
  if(target&&target.super433&&target.kind===6&&source&&source.type&&source.hp>0)hit433.call(this,scene,source,damage*.3,target,'shock');
 }catch(e){}finally{inner433=false;}return out;};
// flames on the body
var fighter433=drawFighter;drawFighter=function(t,enemy){fighter433.apply(this,arguments);if(!t||!t.super433||t.hp<=0||enemy)return;try{
 var p=point(t.x,t.y),z=zoom,h=((typeof unit3dKinds392!=='undefined'&&unit3dKinds392[t.kind]&&unit3dKinds392[t.kind].height)||44)*z,w=h*.42,now=Date.now()/1000,seed=(t.id||1)*1.7;
 ctx.save();
 for(var i=0;i<12;i++){var ph=(now*1.5+i/12+seed)%1,x=p.x+Math.sin(i*2.3+seed+now*3)*w*.55,y=p.y-h*(.05+ph*1.0),r=w*(.62-ph*.45)*(i%3?1:1.3),fade=1-ph;
  var g=ctx.createRadialGradient(x,y+r*.3,0,x,y,r*1.2);g.addColorStop(0,'rgba(255,250,200,'+(.7*fade)+')');g.addColorStop(.35,'rgba(255,170,40,'+(.7*fade)+')');g.addColorStop(.75,'rgba(240,60,10,'+(.55*fade)+')');g.addColorStop(1,'rgba(200,20,0,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x,y-r*1.7);ctx.quadraticCurveTo(x+r,y-r*.2,x,y+r*.8);ctx.quadraticCurveTo(x-r,y-r*.2,x,y-r*1.7);ctx.fill();}
 ctx.globalCompositeOperation='lighter';for(var j=0;j<6;j++){var q=(now*.9+j/6+seed)%1;ctx.fillStyle='rgba(255,220,110,'+(1-q)+')';ctx.beginPath();ctx.arc(p.x+Math.sin(j*4+seed+now*2)*w*.8,p.y-h*(.3+q*1.2),2*z,0,7);ctx.fill();}
 ctx.restore();drawNeeded=true;}catch(e){}};
// fire badge on boosted troop cards in the battle bar
var set433=setHTML219;setHTML219=function(el,html){if(el&&el.id==='deploy'&&screen==='raid')Object.keys(SUPER433).forEach(function(k){if(active433(k))html=html.split('onclick="Game.unit('+k+')"').join('onclick="Game.unit('+k+')" data-fire433="1"');});return set433.call(this,el,html);};
(function(){var st=document.createElement('style');st.id='super433';st.textContent=
 '#modal#modal .supBtn433.supBtn433{display:block;width:100%;margin:0 0 6px!important;padding:6px 12px!important;min-height:0!important;border-radius:12px!important;background:linear-gradient(#ffd27a,#ff8a3a)!important;color:#5a1d00!important;font-weight:800!important;border:1px solid #e0702a!important}'+
 '.super433 .tip433{font-size:12px;margin:0 0 8px;opacity:.85}.grid433{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:7px}'+
 '.sup433{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 6px;border-radius:14px;background:linear-gradient(#fffaf0,#f3e6c8);border:1px solid #d9bf86;color:#4a3713;text-align:center}'+
 '.sup433.on433{background:linear-gradient(#fff1d6,#ffc98a);border-color:#ff8a3a;box-shadow:0 0 12px #ff8a3a88}'+
 '.sup433 b{font-size:14px}.sup433 small{font-size:11px;opacity:.8;line-height:1.2}.sup433 .from433{opacity:.6}.left433{font-size:11.5px;margin:3px 0;color:#a0400a;font-weight:700}'+
 '.supPic433{position:relative;width:64px;height:64px}.supPic433 .art278{width:64px;height:64px;display:block}'+
 '.flame433{position:absolute;inset:-6px -4px 0;background:radial-gradient(ellipse at 50% 85%,#ffb04a99 0,#ff5a1a55 40%,transparent 70%);mix-blend-mode:screen;animation:fl433 .9s ease-in-out infinite alternate;pointer-events:none}'+
 '@keyframes fl433{from{transform:scaleY(.92);opacity:.75}to{transform:scaleY(1.08);opacity:1}}'+
 '.btn433{display:grid;grid-template-columns:1fr 1fr;gap:5px;width:100%}.btn433 button{margin:0!important;min-height:34px;padding:4px!important;font-size:12px!important;white-space:nowrap}'+
 '.btn433 .fluid403{width:16px;height:16px;vertical-align:middle}.btn433 .nova412{display:inline-block;width:16px;height:16px;background:url(assets/nova-core.webp) center/contain no-repeat;vertical-align:middle}'+
 '.novaTroop360.fire433{box-shadow:0 0 0 2px #ff8a3a,0 0 12px #ff8a3a99!important}.novaTroop360.fire433 strong::after{content:" 🔥"}'+
 '#deploy [data-fire433]{box-shadow:0 0 0 2px #ff8a3a,0 0 10px #ff8a3aaa!important}#deploy [data-fire433]::after{content:"🔥";position:absolute;top:-4px;left:2px;font-size:13px}';
 document.head.appendChild(st);})();
