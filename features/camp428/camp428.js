// 428: the defense garrison becomes "ค่ายทหารประจำค่าย" (Garrison Camp), Clash clan-castle style:
// your own trained troops live in it and defend the base. Its info window shows capacity, how full it is
// and every stationed troop with count and stats. The alien mercenary outpost is no longer offered for new
// building (existing ones keep working so nothing paid for is lost).
var CAMP428=mt251('ค่ายทหารประจำค่าย','Garrison Camp');
B.garrison.name=CAMP428;
// build menu: hide the mercenary outpost unless this base already has one
var build428=Game.build;Game.build=function(tab){var r=build428.apply(this,arguments);
 if(!E.d.buildings.some(function(b){return b.type==='mercenary';}))Array.prototype.forEach.call(modal.querySelectorAll('.build-card261'),function(c){if(/\('mercenary'\)/.test(c.innerHTML))c.remove();});return r;};
var place428=E.build;E.build=function(type){if(type==='mercenary'&&!this.d.buildings.some(function(b){return b.type==='mercenary';}))return mt251('อาคารนี้รวมเข้ากับค่ายทหารประจำค่ายแล้ว','This building is now part of the Garrison Camp');return place428.apply(this,arguments);};
// garrison window title / warning use the new name
var gHTML428=garrisonHTML419;garrisonHTML419=function(){return gHTML428().replace(mt251('กองกำลังป้องกันฐาน','Base garrison'),CAMP428).replace(mt251('สร้างกองบัญชาการป้องกันฐานก่อน','Build the Defense HQ first'),mt251('สร้างค่ายทหารประจำค่ายก่อน','Build the Garrison Camp first'));};
Game.garrison=function(){open(garrisonHTML419());var h=modal.querySelector('h2');if(h&&!modal.querySelector('.campBack428'))h.insertAdjacentHTML('afterend','<button class="campBack428" onclick="Game.camp428()">‹ '+mt251('ข้อมูลค่าย','Camp info')+'</button>');};
// info window
function campStat428(n){n=Math.round(n||0);return n>=1e4?(Math.round(n/100)/10)+'K':n.toLocaleString('en-US');}
Game.camp428=function(){E.sync();var b=E.d.buildings.find(function(x){return x.type==='garrison';}),lv=E.level('garrison'),cap=E.garrisonCapacity(),used=spaces(E.d.garrison),count=E.d.garrison.reduce(function(a,n){return a+(n||0);},0),pct=cap?Math.min(100,used/cap*100):0;
 var rows=U.map(function(u,i){var n=E.d.garrison[i]||0;if(!u||!n)return '';return '<div class="campRow428">'+unitPortrait393(i,'campPic428')+'<span><b>'+u.name+' ×'+n+'</b><small>♥ '+campStat428(u.hp)+' · ⚔ '+campStat428(u.damage)+' · '+u.space+mt251(' ช่อง/ตัว',' space each')+'</small></span><em>'+(u.space*n)+'</em></div>';}).join('');
 var next=lv&&lv<20?'<p class="campNext428">'+mt251('อัปเกรดเป็น Lv.','Upgrade to Lv.')+(lv+1)+mt251(' → ความจุ ',' → capacity ')+(5+(lv+1)*5)+mt251(' ช่อง',' space')+'</p>':'';
 open('<section class="camp428"><h2>'+CAMP428+(lv?' <small>Lv.'+lv+'</small>':'')+'</h2>'+
  '<p class="campTip428">'+mt251('ทหารของเราประจำค่าย ออกมาป้องกันเมื่อถูกบุก แล้วกลับเข้าค่ายครบหลังจบ','Your own troops live here, defend when you are attacked and return after the battle')+'</p>'+
  '<div class="campStats428"><div><small>'+mt251('ความจุ','Capacity')+'</small><b>'+cap+'</b></div><div><small>'+mt251('ใช้ไป','Used')+'</small><b>'+used+'</b></div><div><small>'+mt251('กำลังพล','Troops')+'</small><b>'+count+mt251(' นาย','')+'</b></div></div>'+
  '<div class="g419bar campBar428"><span style="width:'+pct.toFixed(1)+'%"></span><b>'+used+' / '+cap+'</b></div>'+
  '<div class="campList428">'+(rows||'<p class="campEmpty428">'+(lv?mt251('ยังไม่มีทหารในค่าย','No troops stationed yet'):mt251('สร้างค่ายทหารประจำค่ายก่อน','Build the Garrison Camp first'))+'</p>')+'</div>'+next+
  '<button class="wide green" onclick="Game.garrison()" '+(lv?'':'disabled')+'>'+mt251('จัดกำลังพล','Manage troops')+'</button></section>');};
var inspect428=Game.inspectBuilding261;Game.inspectBuilding261=function(id,upgrade){var b=E.d.buildings.find(function(x){return x.id===id;});if(b&&b.type==='garrison'&&!upgrade){selected=id;Game.camp428();return;}return inspect428.apply(this,arguments);};
// building bar button label
var hud428=hud;hud=function(){var r=hud428.apply(this,arguments);var btn=$('selection')&&$('selection').querySelector('button[onclick="Game.garrison()"]');if(btn&&btn.textContent!==mt251('กำลังพลในค่าย','Camp troops'))btn.textContent=mt251('กำลังพลในค่าย','Camp troops');return r;};
(function(){var st=document.createElement('style');st.id='camp428';st.textContent=
 '.camp428 h2 small{font-size:13px;opacity:.75}.campTip428{font-size:12px;margin:0 0 8px;opacity:.85}'+
 '.campStats428{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:6px}.campStats428>div{padding:6px;border-radius:12px;background:linear-gradient(#f3f9ff,#dcecfb);border:1px solid #9ec3e6;text-align:center;color:#1d3d5c}.campStats428 small{display:block;font-size:11px;opacity:.8}.campStats428 b{font-size:18px}'+
 '.campList428{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;margin:6px 0;max-height:42vh;overflow-y:auto}'+
 '.campRow428{display:flex;align-items:center;gap:6px;padding:4px 8px 4px 4px;border-radius:12px;background:#fffaf0;border:1px solid #e6cf9c;color:#4a3713}.campRow428 .campPic428{width:40px;height:40px;flex:0 0 40px;border-radius:9px}'+
 '.campRow428 span{display:flex;flex-direction:column;min-width:0;flex:1;line-height:1.15}.campRow428 b{font-size:13px}.campRow428 small{font-size:10.5px;opacity:.8}.campRow428 em{font-style:normal;font-weight:800;font-size:12px;padding:2px 7px;border-radius:999px;background:#ffe2a6}'+
 '.campEmpty428{text-align:center;opacity:.7;font-size:13px;grid-column:1/-1}.campNext428{font-size:12px;text-align:center;margin:2px 0 6px;opacity:.8}'+
 '.campBack428{display:inline-block;margin:0 0 6px!important;padding:4px 10px!important;min-height:0!important;font-size:12px!important;border-radius:10px!important}';
 document.head.appendChild(st);})();
