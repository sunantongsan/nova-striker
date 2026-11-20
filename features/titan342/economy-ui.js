// In-game confirmation works in Android WebView without native JS dialog support.
var novaConfirm358=null;
function confirmNova358(cost,accept,currency){currency=currency||"gems";var label=currency==="gold"?mt251("ทอง","gold"):mt251("เหรียญเป็ด","Duck Coins");cost=Math.max(0,Math.ceil(Number(cost)||0));if(!cost){accept();return;}if(novaConfirm358)return;if(E.d[currency]<cost){toast(mt251('ทรัพยากรไม่พอ','Not enough resources'));return;}
 var box=document.createElement('div');box.id='novaConfirm358';box.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#0009;display:flex;align-items:center;justify-content:center;padding:12px;touch-action:pan-y';
 box.innerHTML='<section style="width:300px;max-width:90vw;max-height:85vh;overflow:auto;background:#102d40;border:1px solid #5baccb;border-radius:14px;padding:16px;color:white;text-align:center"><h3>'+mt251('ยืนยันการใช้ ','Confirm payment: ')+label+'</h3><p>'+cost.toLocaleString()+' '+label+'</p><p>'+mt251('คงเหลือหลังจ่าย: ','Balance after payment: ')+(E.d[currency]-cost).toLocaleString()+'</p><div style="display:flex;gap:8px"><button style="flex:1" data-cancel>'+mt251('ยกเลิก','Cancel')+'</button><button class="green" style="flex:1" data-accept>'+mt251('ยืนยัน','Confirm')+'</button></div></section>';
 var data=E.d,owner=E.d.onlineCrystal&&E.d.onlineCrystal.owner;function dismiss(){if(novaConfirm358!==box)return false;novaConfirm358=null;box.remove();return true;}
 box.querySelector('[data-cancel]').onclick=dismiss;
 box.querySelector('[data-accept]').onclick=function(){if(!dismiss())return;if(E.d!==data||(E.d.onlineCrystal&&E.d.onlineCrystal.owner)!==owner||E.d[currency]<cost)return;accept();};novaConfirm358=box;document.body.appendChild(box);
}
function guardNova358(name,quote){var fn=Game[name];if(!fn)return;Game[name]=function(){var self=this,args=arguments,cost=quote.apply(self,args);if(cost===null||!cost)return fn.apply(self,args);confirmNova358(cost,function(){var next=quote.apply(self,args);if(next!==null&&next>cost){Game[name].apply(self,args);return;}fn.apply(self,args);});};}
guardNova358('speed',function(id,price){return Math.min(price,E.speedCost(id));});
guardNova358('finishQueue',function(price){return price;});
guardNova358('supportConfirm228',function(){return E.d.pendingSupport228?null:supportQuote228&&supportQuote228.quoted;});
guardNova358('buyResource233',function(){return E.d.pendingResource233?null:resourceQuote233&&resourceQuote233.offer&&resourceQuote233.offer.cost;});
guardNova358('buyShield',function(hours,cost){return E.d.pendingShield?null:cost;});
guardNova358('enhanceBuy',function(){return E.d.pendingEnhance?null:enhancementSelection&&E.enhanceStats(enhancementSelection.key,enhancementSelection.lv).cost;});
guardNova358('titanAction342',function(mode,key){var s=titanState342||{};if(mode==='skill')return 250*Math.pow(((s.skills||{})[key]||0)+1,2);if(mode==='heal')return s.heal_nova348;if(mode==='complete')return s.remaining_nova345;if(mode==='speed')return s.upgrading355?s.upgrade_nova355:s.speed_nova345;return null;});
// Upgrade principal is gold + power. Duck Coins and videos remain timer accelerators.
function titanUpgradeCost358(s){return Math.ceil((s.level===1?5000000:10000000)*Math.max(0,1-Number((s.ads||{}).upgrade||0)/(s.level===1?50:200)));}
renderTitanPay357=function(s){var cost=titanUpgradeCost358(s),enough=E.d.gold>=cost&&E.d.power>=cost;
 var html='<section class="titanShop342"><h2>'+mt251('อัปเกรด','Upgrade')+'</h2><p>ผู้พันเป็ด '+(s.level+1)+'</p><div class="guardianCost345"><span><i class="resourceArt303" style="background-position:0 50%"></i>'+cost.toLocaleString()+'</span><span><i class="resourceArt303" style="background-position:50% 50%"></i>'+cost.toLocaleString()+'</span></div><button class="wide '+(enough?'green':'')+'" '+(!enough||titanBusy342?'disabled':'')+' onclick="Game.confirmTitanUpgrade358()">'+mt251('ยืนยันอัปเกรด','Confirm upgrade')+'</button>'+(!enough?'<p>'+mt251('ทองหรือพลังงานไม่พอ','Not enough gold or energy')+'</p>':'')+'<button class="wide" onclick="Game.titan342()">'+mt251('กลับ','Back')+'</button></section>';open(html);modal.setAttribute('data-guardian343','true');};
Game.confirmTitanUpgrade358=function(){var s=titanState342||{};if(titanBusy342||s.upgrading355||s.level<1||s.level>2)return;var cost=titanUpgradeCost358(s);if(E.d.gold<cost||E.d.power<cost)return;titanSend342('upgrade',{upgrade_level358:s.level,resource_cost358:cost});};
// Refresh prices before drawing a training menu, including the formation view.
['training','army278','unitInfo278'].forEach(function(name){var fn=Game[name];if(fn)Game[name]=function(){refreshTraining358(E);return fn.apply(this,arguments);};});
var inspectStorage358=Game.inspectBuilding261;
Game.inspectBuilding261=function(id,upgrade){inspectStorage358.apply(this,arguments);var b=E.d.buildings.find(function(v){return v.id===id;});if(!b||!['goldstore','powerstore'].includes(b.type))return;Array.prototype.forEach.call(modal.querySelectorAll('.stat261'),function(row){if(row.textContent.indexOf(mt251('ความจุที่เพิ่ม','Storage contribution'))<0)return;var cell=row.querySelector('b');if(cell)cell.innerHTML=storeCapacity358(b.lv).toLocaleString()+(upgrade&&b.lv<20&&!b.until?' → <strong>'+storeCapacity358(b.lv+1).toLocaleString()+'</strong>':'');});};


