// 428: five army / research buildings so the army side matches Clash of Clans (Spell Factory, Workshop, Hero Hall,
// Pet House, Blacksmith), each one per base, with a real bonus that grows every level:
//   tech428      อาคารเทคโนโลยี      (HQ5)  all troops  +1% damage per level
//   forge428     โรงตีอุปกรณ์         (HQ6)  infantry    +1.5% hitpoints per level
//   workshop428  โรงประกอบยานบุก      (HQ7)  vehicles    +1.5% hitpoints per level
//   dronehub428  ศูนย์โดรนคู่หู        (HQ8)  air units   +1.5% hitpoints per level
//   herohall428  หอบัญชาการหุ่น       (HQ9)  NOVA mech   +2% hitpoints and damage per level
// Art: assets/army428.webp (features/render3d/army428.html). Paint changes every level, shape every 5 levels.
var ARMY428=army428Meta,K428={
 tech428:{th:'อาคารเทคโนโลยี',en:'Tech Center',req:5,res:'power',base:60000,hp:1300,sprite:920,
  bonus:function(lv){return lv;},rowTh:'พลังโจมตีทหารทุกหน่วย',rowEn:'Damage, all troops',unit:'%'},
 forge428:{th:'โรงตีอุปกรณ์',en:'Gear Forge',req:6,res:'gold',base:70000,hp:1500,sprite:921,
  bonus:function(lv){return lv*1.5;},rowTh:'พลังชีวิตทหารราบ',rowEn:'Hitpoints, infantry',unit:'%'},
 workshop428:{th:'โรงประกอบยานบุก',en:'Siege Workshop',req:7,res:'gold',base:90000,hp:1700,sprite:922,
  bonus:function(lv){return lv*1.5;},rowTh:'พลังชีวิตยานเกราะ',rowEn:'Hitpoints, vehicles',unit:'%'},
 dronehub428:{th:'ศูนย์โดรนคู่หู',en:'Drone Hub',req:8,res:'power',base:110000,hp:1400,sprite:923,
  bonus:function(lv){return lv*1.5;},rowTh:'พลังชีวิตหน่วยอากาศ',rowEn:'Hitpoints, air units',unit:'%'},
 herohall428:{th:'หอบัญชาการหุ่น',en:'Mech Command Hall',req:9,res:'power',base:140000,hp:2000,sprite:924,
  bonus:function(lv){return lv*2;},rowTh:'พลังชีวิตและโจมตีหุ่น NOVA',rowEn:'NOVA mech hitpoints and damage',unit:'%'}};
var TYPES428=Object.keys(K428);
TYPES428.forEach(function(t){var k=K428[t];B[t]={name:mt251(k.th,k.en),cost:0,power:0,cap:1,sprite:k.sprite,hp:k.hp,require:k.req,time:0};
 progression369[t]={};for(var lv=1;lv<=20;lv++)progression369[t][lv]={amount:Math.round(k.base*Math.pow(1.36,lv-1)/1000)*1000,seconds:Math.round(1800*Math.pow(lv,1.6)),resource:k.res};
 var q=progressionQuote369(t,1);B[t].cost=q.gold;B[t].power=q.power;B[t].time=q.time;});
var group428=buildGroup261;buildGroup261=function(k){return K428[k]?'army':group428.apply(this,arguments);};
function lv428(t){return E.level(t)||0;}
function bonus428(t){var l=lv428(t);return l?K428[t].bonus(l)/100:0;}
// ---------- art ----------
var art428=new Image();art428.onload=function(){drawNeeded=true;};art428.src='assets/army428.webp';
function draw428(b,p,size,col){if(!art428.complete||!art428.naturalWidth)return false;var row=ARMY428.kinds.indexOf(b.type);if(row<0)return false;
 var c=art428.naturalWidth/ARMY428.cols,w=size*1.2,h=w;ctx.drawImage(art428,col*c,row*c,c,c,p.x-w*ARMY428.ax,p.y-h*ARMY428.ay+size*.08,w,h);return true;}
var newArt428=newBuildingArt;newBuildingArt=function(b,p,size){if(K428[b.type]&&draw428(b,p,size,Math.max(1,Math.min(20,b.lv||1))-1))return;return newArt428.apply(this,arguments);};
var wreck428=drawWreck;drawWreck=function(b,p,size,enemy){if(K428[b.type]&&draw428(b,p,size,20))return;return wreck428.apply(this,arguments);};
var card428=cardSprite;cardSprite=function(i){var t=TYPES428.find(function(k){return K428[k].sprite===i;});if(t)return '<span class="icon art428" style="background-position:0% '+(ARMY428.kinds.indexOf(t)*25)+'%"></span>';return card428.apply(this,arguments);};
// ---------- bonuses in battle (only troops this phone simulates for its owner) ----------
function myRaid428(){return !liveRoom||(liveRoom.host&&liveRoom.role==='attacker');}
function buff428(t){if(!t||t.b428||t.alien||t.enemy)return;t.b428=1;var hp=0,dmg=bonus428('tech428');
 if(t.titan342){if(typeof ownTitan342==='function'&&!ownTitan342(t))return;var h=bonus428('herohall428');hp=h;dmg=h;}
 else if(U[t.kind]){if(U[t.kind].air)hp=bonus428('dronehub428');else if(branch278(t.kind)==='factory')hp=bonus428('workshop428');else hp=bonus428('forge428');}
 if(hp>0){t.max*=1+hp;t.hp*=1+hp;}if(dmg>0)t.dmg428=1+dmg;}
var hit428=hit;hit=function(scene,target,damage,source,weapon){if(source&&source.dmg428)damage*=source.dmg428;return hit428.call(this,scene,target,damage,source,weapon);};
function sweep428(){try{var r=E.raid;if(r&&!r.result&&r.liveMode!=='preview'&&r.liveMode!=='defender'&&myRaid428())(r.troops||[]).forEach(buff428);
 var d=E.defense;if(d&&!d.result&&!liveRoom)(d.defenders||[]).forEach(buff428);}catch(e){}}
var tickUI428=tickUI342;tickUI342=function(dt){sweep428();return tickUI428.apply(this,arguments);};
// ---------- info / upgrade rows ----------
var rows428=buildingRows361;buildingRows361=function(b){var rows=rows428.apply(this,arguments),k=K428[b.type];if(!k)return rows;var lv=b.lv||1,n=Math.min(20,lv+1);
 rows.push([mt251(k.rowTh+' (%)',k.rowEn+' (%)'),k.bonus(lv),k.bonus(n)]);return rows;};
var inspect428b=Game.inspectBuilding261;Game.inspectBuilding261=function(id,upgrade){var r=inspect428b.apply(this,arguments),b=E.d.buildings.find(function(x){return x.id===id;});
 if(b&&K428[b.type]&&!upgrade){var k=K428[b.type],body=modal.querySelector('.novaContent360')||modal.querySelector('.sheet');if(body&&!body.querySelector('.bonus428'))body.insertAdjacentHTML('afterbegin','<p class="bonus428">'+mt251('โบนัสตอนนี้: ','Bonus now: ')+'<b>'+mt251(k.rowTh,k.rowEn)+' +'+k.bonus(b.lv||1)+'%</b>'+((b.lv||1)<20?' · Lv.'+((b.lv||1)+1)+' → +'+k.bonus((b.lv||1)+1)+'%':'')+'</p>');}return r;};
(function(){var st=document.createElement('style');st.id='army428';st.textContent=
 '.icon.art428{display:inline-block;background-image:url(assets/army428.webp);background-size:2100% 500%;background-repeat:no-repeat}'+
 '.bonus428{margin:0 0 8px;padding:7px 10px;border-radius:12px;background:linear-gradient(#eaf7ff,#d6ecff);border:1px solid #9ec3e6;color:#1d3d5c;font-size:13px;text-align:center}';
 document.head.appendChild(st);})();
