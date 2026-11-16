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
U.push(
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
