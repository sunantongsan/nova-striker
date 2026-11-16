// 410: Fluid Z (น้ำ Z, the red particle accelerant) — extractor and tank from HQ 7, and four red troops paid with it.
// * New building types zdrill (extractor) and ztank (tank). The server's layout list knows them by their old
//   names crystalplant / crystalstore (cap 1 each), so layouts are renamed on the way out and back.
// * The balance lives in the local save as d.zfluid410, like gold and energy. It is not looted (yet).
// * Red troops are army kinds 11-14. The server accepts armies of 11 (older app) to 15 entries (migration 410).
var ZHQ410=7,ZKIND410=11;
B.zdrill={name:mt251('โรงสกัดน้ำ Z','Fluid Z Extractor'),cost:0,power:0,cap:1,sprite:23,hp:1100,require:ZHQ410,time:0};
B.ztank={name:mt251('แท้งน้ำ Z','Fluid Z Tank'),cost:0,power:0,cap:1,sprite:24,hp:1500,require:ZHQ410,time:0};
buildingImages.zdrill=buildingImages.crystalplant;
// Prices: Ore Y, steep like Clash dark-elixir buildings; the shared quote caps them at attainable storage.
progression369.zdrill={};progression369.ztank={};
for(var lv410=1;lv410<=20;lv410++){
 progression369.zdrill[lv410]={amount:Math.round(150000*Math.pow(1.42,lv410-1)/1000)*1000,seconds:Math.round(1800*Math.pow(lv410,1.7)),resource:'power'};
 progression369.ztank[lv410]={amount:Math.round(180000*Math.pow(1.45,lv410-1)/1000)*1000,seconds:Math.round(2400*Math.pow(lv410,1.7)),resource:'power'};
}
['zdrill','ztank'].forEach(function(t){var q=progressionQuote369(t,1);B[t].cost=q.gold;B[t].power=q.power;B[t].time=q.time;});
function zRate410(lv){return 25*lv+5;}// per hour
Engine.prototype.zCapacity410=function(){if(this.hq()<ZHQ410&&!(this.d.zfluid410>0))return 0;return 2000+this.d.buildings.filter(function(b){return b.type==='ztank'&&active(b);}).reduce(function(n,b){return n+10000*b.lv;},0);};
Engine.prototype.zRate410=function(){return this.d.buildings.filter(function(b){return b.type==='zdrill'&&active(b);}).reduce(function(n,b){return n+zRate410(b.lv);},0);};
// Production into the tank; a full tank discards what does not fit (same rule as gold and energy).
function zTick410(e){
 if(!e||!e.d||!Array.isArray(e.d.buildings))return;
 var d=e.d,now=Date.now();if(d.onlineCrystal&&Number.isFinite(d.economyConfirmedAt))now=Math.min(now,d.economyConfirmedAt);
 if(!Number.isFinite(d.zfluid410))d.zfluid410=0;var cap=e.zCapacity410();
 d.buildings.forEach(function(b){if(b.type!=='zdrill')return;var from=Number.isFinite(b.zat410)?b.zat410:now;if(now<=from){b.zat410=from;return;}
  if(!active(b)){b.zat410=now;return;}var per=zRate410(b.lv)/3600000,amount=Math.floor((now-from)*per);if(amount<1){b.zat410=from;return;}
  b.zat410=from+amount/per;if(d.zfluid410<cap)d.zfluid410=Math.min(cap,d.zfluid410+amount);});
}
// Engine methods are wrapped on the prototype and on the live engine (E carries its own copies of sync/train/...).
var wrap410={
 sync:function(prev){return function(){var r=prev.apply(this,arguments);zTick410(this);return r;};},
 unitLock278:function(prev){return function(i){if(red410(i)&&this.hq()<U[i].hq410)return mt251('ต้องมีศูนย์บัญชาการระดับ ','Requires Command Center level ')+U[i].hq410;return prev.apply(this,arguments);};},
 unitLock:function(prev){return function(i){if(red410(i)&&this.hq()<U[i].hq410)return mt251('ต้องมีศูนย์บัญชาการระดับ ','Requires Command Center level ')+U[i].hq410;return prev.apply(this,arguments);};},
 train278:function(prev){return trainWrap410(prev);},train:function(prev){return trainWrap410(prev);}
};
var training410=0;
function trainWrap410(prev){return function(i){if(!red410(i)||training410)return prev.apply(this,arguments);
 this.sync();if((this.d.zfluid410||0)<U[i].z410)return mt251('น้ำ Z ไม่พอ','Not enough Fluid Z');
 training410++;var r;try{r=prev.apply(this,arguments);}finally{training410--;}if(r)return r;
 this.d.zfluid410-=U[i].z410;if(!this.save()){this.d.zfluid410+=U[i].z410;return tr('บันทึกไม่ได้');}return '';};}
Object.keys(wrap410).forEach(function(k){var f=Engine.prototype[k];if(f&&!f.w410){Engine.prototype[k]=wrap410[k](f);Engine.prototype[k].w410=true;}});
function wrapE410(e){if(!e)return;Object.keys(wrap410).forEach(function(k){if(Object.prototype.hasOwnProperty.call(e,k)&&e[k]&&!e[k].w410){e[k]=wrap410[k](e[k]);e[k].w410=true;}});}
wrapE410(E);if(root.setInterval)setInterval(function(){try{wrapE410(E);}catch(e){}},500);
// Upgrade window rows
var rows410=buildingRows361;
buildingRows361=function(b){var rows=rows410.apply(this,arguments),lv=b.lv,n=Math.min(20,lv+1);
 if(b.type==='zdrill')rows.push([mt251('ผลิต / ชั่วโมง','Production / hour'),zRate410(lv),zRate410(n)]);
 if(b.type==='ztank')rows.push([mt251('ความจุน้ำ Z','Fluid Z capacity'),10000*lv,10000*n]);
 return rows;};
var group410=buildGroup261;buildGroup261=function(k){return k==='zdrill'||k==='ztank'?'economy':group410.apply(this,arguments);};
// Tank art: the red (z) row of the tank atlas, filled by the stored Fluid Z.
TANK403.ztank=2;
var fill410=tankFill403;
tankFill403=function(b){
 if(b.type!=='ztank')return fill410.apply(this,arguments);
 if(screen==='raid'&&E.raid)return E.raid.campaign299?.6:.5;
 var cap=E.zCapacity410();return cap>0?Math.max(0,Math.min(1,(E.d.zfluid410||0)/cap)):0;
};

// ---------- server layout names ----------
var OUT410={zdrill:'crystalplant',ztank:'crystalstore'},IN410={crystalplant:'zdrill',crystalstore:'ztank'};
function layoutOut410(list){return list.map(function(b){return OUT410[b.type]?Object.assign({},b,{type:OUT410[b.type]}):b;});}
function layoutIn410(list){return Array.isArray(list)?list.map(function(b){return b&&IN410[b.type]?Object.assign({},b,{type:IN410[b.type]}):b;}):list;}
var liveLayout410=liveLayout;liveLayout=function(){return layoutOut410(liveLayout410.apply(this,arguments));};
Game.warPublish=function(enroll){warRequest(enroll?'enroll':'publish',{layout:liveLayout()});};
var scoutPlayer410=Engine.prototype.scoutPlayer;
Engine.prototype.scoutPlayer=function(target){if(target&&Array.isArray(target.layout)&&target.layout.some(function(b){return b&&IN410[b.type];}))target=Object.assign({},target,{layout:layoutIn410(target.layout)});return scoutPlayer410.call(this,target);};
// Old base saves dropped crystalplant/crystalstore on load; the new types are unaffected.

// ---------- red troops (kinds 11-14) ----------
// 412: game.js reserves slots 11-14 with placeholders before the save loads; replace them.
U.splice(ZKIND410,U.length-ZKIND410,
 {name:mt251('นักวิ่งอนุภาค','Surge Runner'),z410:20,cost:0,time:25,space:2,hp:360,damage:58,range:1.3,rate:.5,speed:2.8,sprite:8,hq410:7,weapon:'plasma',description:mt251('วิ่งเร็วมาก ฟันรัวด้วยใบมีดพลังงานแดง','Very fast, rapid red-energy blade strikes')},
 {name:mt251('โดรนเพลิงแดง','Ember Drone'),z410:40,cost:0,time:45,space:4,hp:560,damage:96,range:1.6,rate:1.4,speed:2.1,sprite:20,hq410:8,air:true,splash:1.1,weapon:'bomb',description:mt251('บินข้ามกำแพง ทิ้งลูกไฟแดงเป็นวง','Flies over walls, drops red fire bombs')},
 {name:mt251('หุ่นยักษ์ทับทิม','Ruby Colossus'),z410:160,cost:0,time:150,space:12,hp:5600,damage:74,range:1.3,rate:1.8,speed:.75,sprite:22,hq410:9,weapon:'shock',description:mt251('ยักษ์เกราะหนา รับดาเมจแทนทั้งทัพ','Huge armored walker that soaks damage for the army')},
 {name:mt251('หุ่นปืนอนุภาค','Particle Lancer'),z410:80,cost:0,time:90,space:7,hp:1150,damage:180,range:4.6,rate:2.6,speed:1.05,sprite:10,hq410:10,splash:1.2,weapon:'plasma',description:mt251('ยิงลำแสงอนุภาคไกล ระเบิดเป็นวง','Long-range particle shots with splash')}
);
function red410(i){return i>=ZKIND410&&!!U[i]&&U[i].z410>0;}
(function(){if(E&&E.d&&Array.isArray(E.d.army))while(E.d.army.length<U.length)E.d.army.push(0);})();
function zIcon410(){return '<span class="fluid403 z410" style="background-position:100% 50%"></span>';}
// Army window: red troops show their Fluid Z price and enable by Fluid Z.
var army410=Game.army278;
Game.army278=function(){var r=army410.apply(this,arguments);redCards410();return r;};
var refresh410=refreshArmy278;
refreshArmy278=function(){var r=refresh410.apply(this,arguments);redCards410();return r;};
function redCards410(){if(!modal||!modal.querySelector)return;
 for(var i=ZKIND410;i<U.length;i++){var btn=$('novaTrain360_'+i);if(!btn)continue;var card=btn.closest('article');
  var cost=card&&card.querySelector('.novaCost360 span');if(cost&&!cost.dataset.z410){cost.dataset.z410='1';cost.innerHTML=zIcon410()+' '+U[i].z410.toLocaleString();}
  btn.disabled=!!E.unitLock278(i)||(E.d.zfluid410||0)<U[i].z410;}}
// Portraits for the red troops (3D renders, 4 across).
var portrait410=unitPortrait393;
unitPortrait393=function(k,cls){if(!red410(k))return portrait410.apply(this,arguments);return '<span class="'+(cls||'icon')+' portrait410" style="background-position:'+((k-ZKIND410)*100/3)+'% 0%"></span>';};
// Unit info shows the Fluid Z price.
var info410=Game.unitInfo278;
Game.unitInfo278=function(i){var r=info410.apply(this,arguments);if(red410(i)){var p=modal.querySelector('.army278 p');if(p)p.insertAdjacentHTML('beforebegin','<p class="red410">'+U[i].description+'<br>'+zIcon410()+' '+U[i].z410.toLocaleString()+' · ◷ '+U[i].time+'s · '+mt251('ปลดล็อก HQ ','Unlock HQ ')+U[i].hq410+'</p>');}return r;};

// ---------- HUD readout ----------
(function(){
 var res=document.querySelector('#app>header .resources'),energy=$('energy');if(!res||!energy)return;
 var span=document.createElement('span');span.id='zbox410';span.hidden=true;span.title=mt251('น้ำ Z (น้ำเร่งอนุภาค)','Fluid Z (particle accelerant)');
 span.innerHTML='<em class="red410"><i class="fluid403" style="background-position:100% 50%" aria-hidden="true"></i></em> <b id="zfluid410">0</b>';
 var after=energy.closest('span');if(after&&after.parentNode===res)after.insertAdjacentElement('afterend',span);else res.appendChild(span);
 function short(n){var a=Math.abs(n);if(a<10000)return Math.floor(n).toLocaleString('en-US');if(a<1e6)return (Math.floor(n/100)/10).toString().replace(/\.0$/,'')+'K';return (Math.floor(n/1e5)/10).toString().replace(/\.0$/,'')+'M';}
 var hud410=hud;hud=function(){var r=hud410.apply(this,arguments);try{zTick410(E);var cap=E.zCapacity410(),show=screen==='home'&&cap>0;if(span.hidden===show)span.hidden=!show;if(show){var t=short(E.d.zfluid410||0)+'/'+short(cap),b=$('zfluid410');if(b.textContent!==t)b.textContent=t;}}catch(e){}return r;};
 var st=document.createElement('style');st.id='red410';st.textContent=
  '#zbox410 .fluid403{width:16px;height:16px}#zbox410 b{color:#ffd9d6}'+
  '.fluid403.z410{width:16px;height:16px;vertical-align:-3px}'+
  '.portrait410{display:inline-block;background:url(assets/red410-portraits.webp) 0 0/400% 100% no-repeat;aspect-ratio:1/1}'+
  '.icon.portrait410{width:44px;height:44px}'+
  '.red410{color:#b3262e;font-weight:700}';
 document.head.appendChild(st);
})();
// 3D battle sprites for the red troops (features/render3d/units3d.html: surge, ember, colossus, lancer).
[['surge',42,10],['ember',46,6],['colossus',66,6],['lancer',52,7]].forEach(function(a,i){var s={file:a[0],height:a[1],perTile:a[2]};s.meta=unit3dMeta392[s.file];if(!s.meta)return;s.img=new Image();s.img.onload=function(){drawNeeded=true;};s.img.src='assets/units3d392-'+s.file+'.webp';unit3dKinds392[ZKIND410+i]=s;});

// ---------- 411: two new defenses ----------
// inferno  หอเพลิงอนุภาค (HQ10): one beam that keeps burning the same target harder and harder (x1 -> x10 over 4 s);
//          hits ground and air. Built with Ore X, upgraded with Fluid Z.
// skyguard ปืนต่อสู้อากาศยาน (HQ6): air only, flak with splash. Ore X.
// 412: inferno is now ป้อมเลเซอร์ (Laser Fortress). Both turn their guns toward the target (16 directions);
//      Lv1-3 / 4-8 / 9+: AA gun 1 / 2 / 4 barrels, laser fortress 2 / 3 / 4 main barrels and four corner guns
//      that grow and start firing from Lv4.
var DEF410={inferno:1,skyguard:1};
function tier412(lv){lv=lv||1;return lv>=9?2:lv>=4?1:0;}
var BARRELS412={skyguard:[1,2,4],inferno:[2,3,4]},SKYSHOT412=[1,.6,.35],SIDESHOT412=[0,.5,.6],SIDEGAP412=[1,.2,.15];
function skyDps412(lv){var t=tier412(lv);return skyDamage410(lv)*SKYSHOT412[t]*BARRELS412.skyguard[t]/1.1;}
function sideDps412(lv){var t=tier412(lv);return t?infernoDps410(lv)*SIDESHOT412[t]/SIDEGAP412[t]:0;}
B.inferno={name:mt251('ป้อมเลเซอร์','Laser Fortress'),cost:0,power:0,cap:1,sprite:910,hp:1900,require:10,time:0};
B.skyguard={name:mt251('ปืนต่อสู้อากาศยาน','Sky Guard AA Gun'),cost:0,power:0,cap:1,sprite:911,hp:1300,require:6,time:0};
progression369.inferno={};progression369.skyguard={};
for(var dl410=1;dl410<=20;dl410++){
 progression369.inferno[dl410]={amount:Math.round(1200000*Math.pow(1.18,dl410-1)/1000)*1000,seconds:Math.round(3600*4*Math.pow(dl410,1.5)),resource:'gold'};
 progression369.skyguard[dl410]={amount:Math.round(90000*Math.pow(1.38,dl410-1)/1000)*1000,seconds:Math.round(1800*Math.pow(dl410,1.6)),resource:'gold'};
}
['inferno','skyguard'].forEach(function(t){var q=progressionQuote369(t,1);B[t].cost=q.gold;B[t].power=q.power;B[t].time=q.time;});
function infernoZ410(target){return Math.round(400*Math.pow(target,1.5));}// Fluid Z for upgrading to level `target`
var cost410=Engine.prototype.upgradeCost;
function upgradeCost410(prev){return function(b){var c=prev.apply(this,arguments);if(b&&b.type==='inferno'){c=Object.assign({},c,{gold:0,power:0,crystals:0,z410:infernoZ410(b.lv+1)});}return c;};}
Engine.prototype.upgradeCost=upgradeCost410(Engine.prototype.upgradeCost);
var upgradeRun410=0;
function upgradeWrap410(prev){return function(id){var b=(this.d.buildings||[]).find(function(v){return v.id===id;});if(!b||b.type!=='inferno'||upgradeRun410)return prev.apply(this,arguments);
 var need=infernoZ410(b.lv+1);this.sync();if((this.d.zfluid410||0)<need)return mt251('น้ำ Z ไม่พอ','Not enough Fluid Z');
 upgradeRun410++;var r;try{r=prev.apply(this,arguments);}finally{upgradeRun410--;}if(r)return r;this.d.zfluid410-=need;if(!this.save()){this.d.zfluid410+=need;return tr('บันทึกไม่ได้');}return '';};}
wrap410.upgrade=upgradeWrap410;wrap410.upgradeCost=upgradeCost410;
['upgrade'].forEach(function(k){var f=Engine.prototype[k];if(f&&!f.w410){Engine.prototype[k]=wrap410[k](f);Engine.prototype[k].w410=true;}});
Engine.prototype.upgradeCost.w410=true;wrapE410(E);
var cap410=Engine.prototype.buildCap;
Engine.prototype.buildCap=function(type){if(type==='inferno')return this.hq()>=13?2:this.hq()>=10?1:0;if(type==='skyguard')return this.hq()>=12?3:this.hq()>=9?2:this.hq()>=6?1:0;return cap410.apply(this,arguments);};
var costHTML410=costHTML261;
costHTML261=function(c){var h=costHTML410.apply(this,arguments);if(c&&c.z410){var short=(E.d.zfluid410||0)<c.z410;h=h.replace(/<\/div>\s*$/,'<span class="'+(short?'short261':'')+'">'+zIcon410()+' '+c.z410.toLocaleString()+'</span></div>');}return h;};
var group411=buildGroup261;buildGroup261=function(k){return k==='inferno'||k==='skyguard'?'defense':group411.apply(this,arguments);};
var card410=cardSprite;
cardSprite=function(i){if(i===910||i===911)return '<span class="icon def410" style="background-position:'+(i===910?100:0)+'% 0%"></span>';return card410.apply(this,arguments);};
// upgrade window rows
var rows411=buildingRows361;
buildingRows361=function(b){var rows=rows411.apply(this,arguments),lv=b.lv,n=Math.min(20,lv+1);
 if(b.type==='inferno')rows.push([mt251('ลำแสง / วินาที (เริ่ม → สูงสุด ×10)','Beam / second (start, up to x10)'),infernoDps410(lv),infernoDps410(n)],[mt251('ระยะยิง (ช่อง)','Range (tiles)'),5.5,5.5]);
 if(b.type==='skyguard')rows.push([mt251('โจมตี / วินาที (เฉพาะอากาศ)','Damage / second (air only)'),Math.round(skyDps412(lv)),Math.round(skyDps412(n))],[mt251('จำนวนลำกล้อง','Barrels'),BARRELS412.skyguard[tier412(lv)],BARRELS412.skyguard[tier412(n)]],[mt251('ระยะยิง (ช่อง)','Range (tiles)'),7,7]);
 if(b.type==='inferno')rows.push([mt251('ลำกล้องหลัก','Main barrels'),BARRELS412.inferno[tier412(lv)],BARRELS412.inferno[tier412(n)]],[mt251('ปืนข้าง 4 กระบอก / วินาที','4 side guns / second'),Math.round(sideDps412(lv)),Math.round(sideDps412(n))]);
 return rows;};
function infernoDps410(lv){return Math.round(22*defenseGrowth351(lv));}
function skyDamage410(lv){return Math.round(120*defenseGrowth351(lv));}
// both defenses may hit air
var canDamage410=canDamage285;
canDamage285=function(target,source,weapon){if(source&&(source.type==='inferno'||source.type==='skyguard')){if(target.sortie277&&target.sortie277.phase==='reload')return false;if(target.transport277&&['away','destroyed'].includes(target.state))return false;return true;}return canDamage410.apply(this,arguments);};
function isAir410(t){return t.transport277?false:air277(t);}
// one combat step for both defense kinds against a list of enemies
function fire410(scene,buildings,enemies,dt,campaign,stage){
 (buildings||[]).forEach(function(b){if(b.hp<=0||(b.type!=='inferno'&&b.type!=='skyguard'))return;
  var lvBoost=campaign?1+((stage||1)-1)*.08:defenseGrowth351(b.lv);
  if(b.type==='inferno'){
   var t=b.beam410&&enemies.find(function(e){return e===b.beam410.t&&e.hp>0&&dist(e,b)<=5.5;});
   if(!t){t=enemies.filter(function(e){return e.hp>0&&dist(e,b)<=5.5&&canDamage285(e,b);}).sort(function(a,c){return dist(a,b)-dist(c,b);})[0];b.beam410=t?{t:t,on:0,acc:0}:null;}
   if(!t)return;var s=b.beam410;s.on+=dt;s.acc+=dt;b.aim=Math.atan2(t.y-b.y,t.x-b.x);b.aimTarget=t;
   if(s.acc>=.2){var ramp=1+9*Math.min(1,s.on/4);hit(scene,t,22*lvBoost*ramp*s.acc,b,'plasma');s.acc=0;}
   // 412: corner guns fire laser bolts at the same target from Lv4, one gun after another
   var tr=tier412(b.lv);if(tr>0&&t.hp>0){b.side412=(b.side412||0)-dt;if(b.side412<=0){b.side412=SIDEGAP412[tr];b.sideN412=((b.sideN412||0)+1)%4;
    hit(scene,t,22*lvBoost*SIDESHOT412[tr],b,'plasma');b.gun412=BARRELS412.inferno[tr]+b.sideN412;var f=weaponFX(b,t,'plasma');b.gun412=0;f.color='#7cf0ff';scene.fx.push(f);}}
   if(t.hp<=0)b.beam410=null;return;}
  b.cool410=(b.cool410||0)-dt;if(b.cool410>0)return;
  var a=enemies.filter(function(e){return e.hp>0&&isAir410(e)&&dist(e,b)<=7;}).sort(function(x,y){return dist(x,b)-dist(y,b);})[0];if(!a)return;
  // 412: one barrel per shot, cycling; more barrels fire faster (x1 / x1.2 / x1.4 damage per second)
  var tr=tier412(b.lv),nb=BARRELS412.skyguard[tr],dmg=120*lvBoost*SKYSHOT412[tr];hit(scene,a,dmg,b,'cannon');enemies.forEach(function(e){if(e!==a&&e.hp>0&&isAir410(e)&&dist(e,a)<=1.4)hit(scene,e,dmg*.6,b,'cannon');});
  b.shot412=((b.shot412||0)+1)%nb;b.gun412=b.shot412;var f=weaponFX(b,a,'cannon');b.gun412=0;f.color='#ffd36b';scene.fx.push(f);b.cool410=1.1/nb;});
}
var depth410=0;
wrap410.tick=function(prev){return function(dt){if(this.raid)boostTitan410(this.raid.troops);depth410++;var out;try{out=prev.apply(this,arguments);}finally{depth410--;}if(depth410)return out;var r=this.raid;
 if(r&&r.phase==='battle'&&!r.result&&!(liveRoom&&liveRoom.v===2&&!liveRoom.host))try{fire410(r,r.buildings,r.troops.concat(r.transports277||[]),dt,!!r.campaign299&&!r.player,r.stage);}catch(e){}
 return out;};};
wrap410.tickDefense=function(prev){return function(dt){if(this.defense)boostTitan410(this.defense.defenders);depth410++;var out;try{out=prev.apply(this,arguments);}finally{depth410--;}if(depth410)return out;var d=this.defense;if(d&&!d.result)try{fire410(d,d.buildings,d.enemies,dt,false);}catch(e){}return out;};};
['tick','tickDefense'].forEach(function(k){var f=Engine.prototype[k];if(f&&!f.w410){Engine.prototype[k]=wrap410[k](f);Engine.prototype[k].w410=true;}});wrapE410(E);
// 412 art: per kind a static base and the guns in 16 directions (features/render3d/defense412.html).
var D412=defense412Meta,ART412={};Object.keys(D412.kinds).forEach(function(k){var i=new Image();i.onload=function(){drawNeeded=true;};i.src=D412.kinds[k].file;ART412[k]=i;});
function art412(b){var i=ART412[b.type];return i&&i.complete&&i.naturalWidth?i:null;}
function cell412(k,n,img,x,y,w,h){var cw=img.naturalWidth/D412.cols,ch=cw*k.ch/k.cw;ctx.drawImage(img,(n%D412.cols)*cw,Math.floor(n/D412.cols)*ch,cw,ch,x,y,w,h);}
function wrapA412(a){a%=Math.PI*2;if(a>Math.PI)a-=Math.PI*2;if(a<-Math.PI)a+=Math.PI*2;return a;}
function dir412(b){var a=b.view412===undefined?(b.aim===undefined?Math.PI:b.aim):b.view412;return ((Math.round(a/(Math.PI*2)*16)%16)+16)%16;}
// turn smoothly toward the aim
function turn412(b){var now=Date.now(),goal=b.aim===undefined?Math.PI:b.aim;if(b.view412===undefined){b.view412=goal;b.vt412=now;return;}
 var dt=Math.min(.1,(now-(b.vt412||now))/1000),d=wrapA412(goal-b.view412),m=(b.type==='skyguard'?7:5)*dt;b.vt412=now;
 if(Math.abs(d)>.001){b.view412=wrapA412(b.view412+Math.max(-m,Math.min(m,d)));drawNeeded=true;}}
function defDraw412(b,p,size,wreck){var img=art412(b),k=D412.kinds[b.type];if(!img)return false;
 var w=size*k.wpx/347,h=w*k.ch/k.cw,x=p.x-w*k.ax,y=p.y-h*k.ay;b.wz412=w/zoom;b.hz412=h/zoom;
 if(wreck){cell412(k,51,img,x,y,w,h);b.tips412=null;return true;}
 var tr=tier412(b.lv);turn412(b);var d=dir412(b);cell412(k,tr*17+16,img,x,y,w,h);cell412(k,tr*17+d,img,x,y,w,h);
 var tips=k.tips[tr][d],nm=k.nMain[tr],main=tips.slice(0,nm).map(function(q){return {x:x+q[0]*w,y:y+q[1]*h};});
 b.tips412=main;b.tipPx410=main.length?{x:main.reduce(function(n,q){return n+q.x;},0)/main.length,y:main.reduce(function(n,q){return n+q.y;},0)/main.length}:null;return true;}
var mount412=weaponMount;
weaponMount=function(o){if(o&&(o.type==='inferno'||o.type==='skyguard')&&o.wz412&&D412.kinds[o.type]){var k=D412.kinds[o.type],tips=k.tips[tier412(o.lv)][dir412(o)],q=tips[Math.min(o.gun412||0,tips.length-1)];
  if(q){var yy=(q[1]-k.ay)*o.hz412;return {x:(q[0]-k.ax)*o.wz412,y:yy,height:-yy};}}return mount412.apply(this,arguments);};
var evolved410=evolvedArt265;
evolvedArt265=function(b,p,size){if(DEF410[b.type]&&defDraw412(b,p,size,false)){if(b.lv>1){var marks=(b.lv-1)%4+1;for(var i=0;i<marks;i++)disk(p.x+(i-(marks-1)/2)*5*zoom,p.y+size*.1,1.5*zoom,'#ffe391');}return true;}return evolved410.apply(this,arguments);};
var wreck410=drawWreck;
drawWreck=function(b,p,size,enemy){if(DEF410[b.type]&&defDraw412(b,p,size,true))return;return wreck410.apply(this,arguments);};
var newArt410=newBuildingArt;
newBuildingArt=function(b,p,size){if(DEF410[b.type]&&defDraw412(b,p,size,false))return;return newArt410.apply(this,arguments);};
// inferno beam on top of the scene
var draw410=draw;
draw=function(){var out=draw410.apply(this,arguments);try{var sc=screen==='raid'?E.raid:screen==='defense'?E.defense:null;if(!sc)return out;
 (sc.buildings||[]).forEach(function(b){var s=b.beam410;if(b.type!=='inferno'||!s||!s.t||s.t.hp<=0||b.hp<=0||!b.tipPx410)return;
  var q=point(s.t.x,s.t.y),h=(s.t.height340||0)+(isAir410(s.t)?40:14),tx=q.x,ty=q.y-h*zoom,k=Math.min(1,s.on/4),wob=Math.sin(Date.now()/40)*1.2*zoom,from=b.tips412&&b.tips412.length?b.tips412:[b.tipPx410],thin=from.length>1?.7:1;
  ctx.save();ctx.lineCap='round';
  from.forEach(function(a){[[(5+7*k)*zoom*thin,'rgba(60,190,255,.32)'],[(2.6+4*k)*zoom*thin,'rgba(90,225,255,.85)'],[(1.2+1.5*k)*zoom*thin,'rgba(235,252,255,.95)']].forEach(function(L){ctx.strokeStyle=L[1];ctx.lineWidth=L[0];ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo((a.x+tx)/2+wob,(a.y+ty)/2-6*zoom,tx,ty);ctx.stroke();});
   ctx.fillStyle='rgba(220,250,255,.9)';ctx.beginPath();ctx.arc(a.x,a.y,(2+2*k)*zoom,0,7);ctx.fill();});
  var g=ctx.createRadialGradient(tx,ty,0,tx,ty,(8+10*k)*zoom);g.addColorStop(0,'rgba(240,252,255,.9)');g.addColorStop(.4,'rgba(80,215,255,.6)');g.addColorStop(1,'rgba(60,190,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(tx,ty,(8+10*k)*zoom,0,7);ctx.fill();
  ctx.restore();drawNeeded=true;});}catch(e){}return out;};
(function(){var st=document.createElement('style');st.id='def410';st.textContent='.icon.def410{background:url(assets/defense412-icons.webp) 0 0/200% 100% no-repeat!important;width:56px;height:56px}';document.head.appendChild(st);})();

// ---------- 411: NOVA mech power-up with Fluid Z ----------
// Buying and tiers stay NOVA (server). On top of that, 20 local power-up levels paid with Fluid Z:
// +4% HP and +3% damage per level for your own mech in battle.
function titanZCost410(n){return Math.round(600*Math.pow(n,1.6));}
function titanZ410(){return Math.max(0,Math.min(20,E.d.titanZ410|0));}
Game.titanZUp410=function(){E.sync();var n=titanZ410()+1;if(n>20)return;if(!(E.d.titan342&&E.d.titan342.level)){toast(mt251('สร้างหุ่น NOVA ก่อน','Build the NOVA mech first'));return;}
 var c=titanZCost410(n);if((E.d.zfluid410||0)<c){toast(mt251('น้ำ Z ไม่พอ','Not enough Fluid Z'));return;}
 E.d.zfluid410-=c;E.d.titanZ410=n;if(!E.save()){E.d.zfluid410+=c;E.d.titanZ410=n-1;toast(tr('บันทึกไม่ได้'));return;}
 toast(mt251('เสริมพลังหุ่น NOVA เป็น Lv.','NOVA mech power-up Lv.')+n);hud();titanPanel342();};
var titanPanel410=titanPanel342;
titanPanel342=function(){var out=titanPanel410.apply(this,arguments);try{
 var sec=modal.querySelector('.titanShop342');if(!sec||titanShopOnly342)return out;var old=sec.querySelector('.titanZ410');
 var s=titanState342||E.d.titan342||{},lv=s.level||0;if(!lv)return out;var n=titanZ410(),max=n>=20,c=titanZCost410(n+1),can=!max&&(E.d.zfluid410||0)>=c;
 var box=document.createElement('div');box.className='titanZ410';
 box.innerHTML='<b>'+mt251('เสริมพลังด้วยน้ำ Z','Fluid Z power-up')+' · Lv.'+n+'/20</b><p>♥ +'+(4*n)+'% · ⚔ +'+(3*n)+'%'+(max?'':' → ♥ +'+(4*n+4)+'% · ⚔ +'+(3*n+3)+'%')+'</p>'+
  (max?'<p>'+tr('ระดับสูงสุด')+'</p>':'<button class="wide '+(can?'green':'')+'" '+(can?'':'disabled')+' onclick="Game.titanZUp410()">'+zIcon410()+' '+c.toLocaleString()+' · '+mt251('เสริมพลัง','Power up')+'</button>');
 if(old){old.replaceWith(box);return out;}var after=sec.querySelector('.guardianRank343');if(after)after.insertAdjacentElement('afterend',box);else sec.appendChild(box);}catch(e){}return out;};
function mineTitan410(t){if(!t||!t.titan342)return false;var me=E.d.onlineCrystal&&E.d.onlineCrystal.owner;return !t.owner||!!me&&t.owner===me;}
function boostTitan410(list){(list||[]).forEach(function(t){if(!mineTitan410(t)||t.zp410)return;var n=titanZ410();t.zp410=1+.03*n;if(n){var k=1+.04*n;t.max*=k;t.hp*=k;}});}
var hit410=hit;
hit=function(scene,target,damage,source,weapon){if(source&&source.titan342&&source.zp410)damage*=source.zp410;return hit410.call(this,scene,target,damage,source,weapon);};
(function(){var st=document.createElement('style');st.id='titanZ410';st.textContent='.titanZ410{margin:6px 0;padding:8px 10px;border-radius:12px;background:#fff1ef;border:1px solid #f6b9b2;text-align:center}.titanZ410 b{color:#b3262e}.titanZ410 p{margin:3px 0}';document.head.appendChild(st);})();
