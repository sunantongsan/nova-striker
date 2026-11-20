// 412: Duck Coins wallet on one screen, plus speeding up Syrup (ไซรัป) production.
// * Syrup boost: a video gives 2 hours of the extractors' production at once (server-verified through the
//   speed264 flow, target kind 'zfluid'); Duck Coins gives 6 hours. Both stop at the tank's free space.
// * The wallet window is rebuilt from the existing pieces (their buttons and handlers are moved, not copied):
//   balance in the header, reward chips, a one-row check-in week, three production tiles (Honey, Veggie juice, Syrup),
//   and a footer for shields and the legacy balance. Fits a phone screen without scrolling.
var ZAD_HOURS412=2,ZNOVA_HOURS412=6;
function zRoom412(){E.sync();return Math.max(0,E.zCapacity410()-(E.d.zfluid410||0));}
function zHours412(h){return Math.floor(E.zRate410()*h);}
// 412b: Syrup refills like Honey / G — sized by the tank, not only by production.
function zVideoAmount412(){E.sync();return Math.max(zHours412(ZAD_HOURS412),Math.round(E.zCapacity410()*.1));}
function zPack412(kind){var room=zRoom412(),cap=E.zCapacity410();return kind==='full'?room:Math.min(room,Math.round(cap*.5));}
function zPrice412(amount){return Math.max(5,Math.ceil(amount/40));}
function zNovaCost412(){return zPrice412(Math.min(zHours412(ZNOVA_HOURS412),zRoom412()));}
function zAdd412(amount){var room=zRoom412(),got=Math.max(0,Math.min(room,Math.floor(amount)));E.d.zfluid410=(E.d.zfluid410||0)+got;return got;}
function zReady412(){if(E.zCapacity410()<=0)return mt251('ปลดล็อกไซรัป ที่บ้านเป็ด 7','Syrup unlocks at Duck House 7');if(zRoom412()<=0)return mt251('โหลไซรัป เต็มแล้ว','Syrup tank is full');return '';}
function zDone412(got){completionAudio250&&completionAudio250();hud();
 open('<section class="reward-success263"><h2>'+mt251('เร่งผลิตไซรัป แล้ว','Syrup boosted')+'</h2><p class="zgot412">'+zIcon410()+' +'+got.toLocaleString()+'</p><button class="wide green" onclick="Game.treasury()">'+mt251('ตกลง','OK')+'</button></section>');}
// video: speed264 with a 'zfluid' target; the grant is applied here when the server confirms the video
Game.zBoostAd412=function(){var why=zReady412();if(why){toast(why);return;}Game.speedAd264('zfluid','z412');};
var snapZ412=speedSnapshot264;
speedSnapshot264=function(kind,id){if(kind==='zfluid'){E.sync();return E.zCapacity410()>0?{kind:'zfluid',id:'z412'}:null;}return snapZ412.apply(this,arguments);};
var applyZ412=applySpeed264;
applySpeed264=function(p,r){if(!p||!p.target||p.target.kind!=='zfluid')return applyZ412.apply(this,arguments);
 if((E.d.speedReceipts264||[]).includes(p.request_id))return 0;var before=JSON.stringify(E.d),got=zAdd412(zVideoAmount412());
 E.d.speedReceipts264=(E.d.speedReceipts264||[]).concat(p.request_id).slice(-500);delete E.d.pendingSpeed264;
 if(!E.save()){E.d=JSON.parse(before);return null;}setTimeout(function(){zDone412(got);},0);return 0;};
// NOVA: half a tank or fill it up
Game.zBuy412=function(kind){var why=zReady412();if(why){toast(why);return;}var amount=zPack412(kind),cost=zPrice412(amount);if(amount<=0)return;
 confirmNova358(cost,function(){var why=zReady412();if(why){toast(why);return;}if((E.d.gems||0)<cost){toast(mt251('เหรียญเป็ดไม่พอ','Not enough Duck Coins'));return;}
  var before=JSON.stringify(E.d);E.d.gems-=cost;var got=zAdd412(amount);if(!E.save()){E.d=JSON.parse(before);toast(tr('บันทึกไม่ได้'));return;}zDone412(got);});};
Game.zBoostNova412=function(){Game.zBuy412('half');};
// the refill window (same idea as the Honey / G refill)
Game.zOffer412=function(){E.sync();var cap=E.zCapacity410(),cur=E.d.zfluid410||0,why=zReady412(),locked=cap<=0;
 var row=function(icon,title,sub,price,action,off){return '<button class="zrow412" '+(off?'disabled':'')+' onclick="'+action+'">'+icon+'<span><b>'+title+'</b><small>'+sub+'</small></span><em>'+price+'</em></button>';};
 var half=zPack412('half'),full=zPack412('full');
 open('<section class="zoffer412"><h2>'+mt251('เติมไซรัป','Refill Syrup')+'</h2>'+
  '<div class="zbar412"><i style="width:'+(cap?Math.min(100,cur/cap*100):0)+'%"></i><span>'+fluidIcon412(2)+' '+short412(cur)+' / '+short412(cap)+'</span></div>'+
  (locked?'<p class="zlock412">🔒 '+mt251('ปลดล็อกไซรัป ที่บ้านเป็ด 7 (สร้างโรงสกัดและโหลไซรัป)','Syrup unlocks at Duck House 7 (build the extractor and tank)')+'</p>':
  row('<span class="zic412">🎬</span>',mt251('ดูวิดีโอ','Watch a video'),'+'+short412(Math.min(zVideoAmount412(),zRoom412())),mt251('ฟรี','Free'),'Game.zBoostAd412()',!!why)+
  row(fluidIcon412(2),mt251('ครึ่งแท้ง','Half a tank'),'+'+short412(half),'<i class="nova412"></i>'+zPrice412(half),"Game.zBuy412('half')",!!why||half<=0||(E.d.gems||0)<zPrice412(half))+
  row(fluidIcon412(2),mt251('เติมเต็มแท้ง','Fill the tank'),'+'+short412(full),'<i class="nova412"></i>'+zPrice412(full),"Game.zBuy412('full')",!!why||full<=0||(E.d.gems||0)<zPrice412(full)))+
  (why&&!locked?'<p class="zlock412">'+why+'</p>':'')+
  '<button class="wide" onclick="Game.treasury()">'+mt251('กลับ','Back')+'</button></section>');};

// ---------- one-screen wallet ----------
function el412(tag,cls,html){var n=document.createElement(tag);if(cls)n.className=cls;if(html!==undefined)n.innerHTML=html;return n;}
function fluidIcon412(i){return '<i class="fluid403" style="background-position:'+(i*50)+'% 50%" aria-hidden="true"></i>';}
function short412(n){n=Math.floor(n||0);return n>=1e6?(Math.floor(n/1e5)/10)+'M':n>=1e4?(Math.floor(n/100)/10)+'K':n.toLocaleString('en-US');}
function compactWallet412(){
 var sheet=modal.querySelector('.sheet'),content=modal.querySelector('.novaContent360'),daily=content&&content.querySelector('.daily-card340');
 if(!sheet||!content||!daily||content.dataset.w412)return;
 var kids=Array.prototype.slice.call(content.children),take=function(f){var i=kids.findIndex(f);return i<0?null:kids.splice(i,1)[0];};
 var raid=take(function(n){return n.matches('button[onclick*="raidRewards260"]');}),raidAmt=raid&&raid.nextElementSibling&&raid.nextElementSibling.tagName==='P'?take(function(n){return n===raid.nextElementSibling;}):null;
 var welcome=take(function(n){return n.matches('.welcome-bonus247');});take(function(n){return n===daily;});
 var legacy=take(function(n){return n.matches('button[onclick*="legacyBalance339"]');}),shield=take(function(n){return n.matches('button[onclick*="shieldShop"]');});
 var ox=take(function(n){return n.matches('button[onclick*="resourceOffer233(\'gold\')"]');}),oy=take(function(n){return n.matches('button[onclick*="resourceOffer233(\'power\')"]');});
 take(function(n){return n.tagName==='H3'&&/เร่งผลิต|Speed up/.test(n.textContent);});take(function(n){return n.tagName==='P'&&/^\s*[\d,]+\s*(NOVA|เหรียญเป็ด|Duck Coins)\s*$/.test(n.textContent);});
 sheet.classList.add('wallet412');content.dataset.w412='1';content.innerHTML='';
 // header balance
 if(!sheet.querySelector('.bal412'))content.appendChild(el412('span','bal412','<i class="nova412" aria-hidden="true"></i><b id="bal412">'+(E.d.gems||0).toLocaleString()+'</b>'));
 // reward chips
 var chips=el412('div','chips412');
 if(raid){var c=el412('button','chip412');c.setAttribute('onclick',raid.getAttribute('onclick'));c.innerHTML='<span class="art345" aria-hidden="true" style="background-position:100% 0%"></span><span><small>'+mt251('รางวัลโจมตี','Raid rewards')+'</small><b>'+(raidAmt?raidAmt.textContent:'')+'</b></span>';chips.appendChild(c);}
 if(welcome){var wb=welcome.querySelector('button');if(wb){var w=el412('div','chip412 welcome412');w.innerHTML='<img src="assets/nova-core.webp" alt=""><span><small>'+mt251('โบนัสต้อนรับ','Welcome bonus')+'</small><b>'+((welcome.querySelector('strong')||{}).textContent||'')+'</b></span>';wb.className='mini412 green';w.appendChild(wb);chips.appendChild(w);}}
 if(chips.children.length)content.appendChild(chips);
 // check-in: title, one row of days, two buttons side by side, one note
 daily.classList.add('daily412');var title=daily.querySelector('.daily-title340 p');if(title)title.textContent=mt251('5 เหรียญเป็ด · ดูวิดีโอ x3 · วันที่ 7 รับ 15 / 45','5 Duck Coins · video x3 · day 7: 15 / 45');
 var btns=Array.prototype.filter.call(daily.children,function(n){return n.tagName==='BUTTON';});if(btns.length){var row=el412('div','pair412');btns.forEach(function(b){b.classList.remove('wide');row.appendChild(b);});daily.appendChild(row);}
 var notes=Array.prototype.filter.call(daily.children,function(n){return n.tagName==='SMALL';});if(notes.length){var note=el412('small','note412',notes.map(function(n){return n.textContent;}).join(' · '));notes.forEach(function(n){n.remove();});daily.appendChild(note);}
 content.appendChild(daily);
 // 425: Duck Coins packs advertised where the production tiles were (refills moved to the resource counters at the top).
 content.appendChild(promo425());
 // footer
 var foot=el412('div','foot412');[shield,legacy].forEach(function(b){if(!b)return;b.classList.remove('wide');b.classList.add('mini412');foot.appendChild(b);});if(shield)shield.innerHTML='🛡️ '+shield.textContent;if(legacy)legacy.textContent=mt251('ยอดเดิมที่ยังไม่เคลม','Unclaimed balance');
 if(foot.children.length)content.appendChild(foot);
 kids.forEach(function(n){content.appendChild(n);});// anything else stays, at the end
}
// Other wallet layers insert pieces after open() (the raid-reward button, the header); tidy those up as they arrive.
function absorbWallet412(){var sheet=modal.querySelector('.sheet.wallet412'),content=sheet&&sheet.querySelector('.novaContent360');if(!content)return;
 var head=sheet.querySelector('.novaHead360'),bal=sheet.querySelector('.bal412');
 var h2=head&&head.querySelector('h2');if(bal&&h2&&bal.parentNode!==h2)h2.appendChild(bal);
 var chips=content.querySelector('.chips412');if(!chips){chips=el412('div','chips412');content.insertBefore(chips,content.firstChild);}
 Array.prototype.slice.call(content.children).forEach(function(n){
  if(n.matches('button[onclick*="raidRewards260"]')){var c=el412('button','chip412');c.setAttribute('onclick',n.getAttribute('onclick'));c.innerHTML='<span class="art345" aria-hidden="true" style="background-position:100% 0%"></span><span><small>'+mt251('รางวัลโจมตี','Raid rewards')+'</small><b>'+mt251('รอรับ','Pending')+' ›</b></span>';chips.insertBefore(c,chips.firstChild);n.remove();}
  else if(n.tagName==='P'&&/^\s*[\d,]+\s*(NOVA|เหรียญเป็ด|Duck Coins)\s*$/.test(n.textContent))n.remove();
  else if(n.tagName==='H2')n.remove();});
 if(!chips.children.length)chips.remove();}
var treasury412=treasury;
treasury=function(){var r=treasury412.apply(this,arguments);try{compactWallet412();absorbWallet412();}catch(e){}[0,60,250].forEach(function(t){setTimeout(function(){try{compactWallet412();absorbWallet412();}catch(e){}},t);});return r;};
var hud412=hud;hud=function(){var r=hud412.apply(this,arguments);var b=$('bal412');if(b){var t=(E.d.gems||0).toLocaleString();if(b.textContent!==t)b.textContent=t;}return r;};
// 425: Duck Coins pack banner in the wallet. Real store prices only (no invented discounts); tapping opens the store.
var promoPacks425=['nova_2100','nova_7600','nova_34000'];
function promo425(){var box=el412('section','promo425'),list=novaPacks348.filter(function(p){return promoPacks425.includes(p.id);});
 var best=novaPacks348.reduce(function(a,p){return p.nova/p.thb>a.nova/a.thb?p:a;},novaPacks348[0]);
 box.innerHTML='<div class="promoHead425"><img src="assets/nova-core.webp" alt=""><span><b>'+mt251('แพ็กเหรียญเป็ด','Duck Coins packs')+'</b><small>'+mt251('เติมผ่าน Google Play · ได้เหรียญเป็ด ทันที','Buy on Google Play · Duck Coins arrives instantly')+'</small></span></div>'+
  '<div class="promoGrid425">'+list.map(function(p){var i=novaPacks348.indexOf(p),live=billingProducts348[p.id];
   return '<button class="promoCard425" onclick="Game.shop348(\'nova\')">'+(p===best?'<em>'+mt251('คุ้มสุด','Best value')+'</em>':'')+packArt348(i)+'<b>'+p.nova.toLocaleString()+'</b><span>'+shopEscape348(live?live.price:'฿'+p.thb)+'</span></button>';}).join('')+'</div>'+
  '<button class="promoAll425" onclick="Game.shop348(\'nova\')">'+mt251('ดูแพ็กทั้งหมด','See all packs')+' ›</button>';
 return box;}
// 425: tap Honey / Veggie juice / Syrup at the top of the home screen to refill (like Clash of Clans).
document.addEventListener('click',function(ev){if(screen!=='home'||!ev.target||!ev.target.closest)return;var span=ev.target.closest('#app>header .resources>span');if(!span)return;
 if(span.querySelector('#gold'))Game.resourceOffer233('gold');else if(span.querySelector('#energy'))Game.resourceOffer233('power');else if(span.querySelector('#zfluid410'))Game.zOffer412();},true);
(function(){var st=document.createElement('style');st.id='wallet412';st.textContent=
 '#modal#modal[data-nova360] .sheet.novaWindow360.wallet412.wallet412{width:min(420px,96vw)!important;max-height:calc(100dvh - 24px)!important}#modal#modal[data-nova360] .wallet412 .novaContent360{overflow-y:auto!important}'+
 '#modal#modal[data-nova360] .wallet412 .illustrated345>.art345,#modal#modal[data-nova360] .wallet412 .zbtn412 .art345{display:none!important}'+
 '#modal#modal[data-nova360] .wallet412 .daily-day340 span{display:none!important}#modal#modal[data-nova360] .wallet412 .chips412{grid-template-columns:1fr 1.7fr}#modal#modal[data-nova360] .wallet412 .welcome412 img{display:none}#modal#modal[data-nova360] .wallet412 .chip412 small,#modal#modal[data-nova360] .wallet412 .chip412 b{white-space:nowrap}'+
 '#modal#modal[data-nova360] .wallet412 .novaHead360 h2{display:flex;align-items:center;gap:8px;flex:1;min-width:0}'+
 '#modal#modal[data-nova360] .wallet412 .bal412{margin-left:auto;margin-right:8px;font-family:inherit;text-shadow:none;display:inline-flex;align-items:center;gap:5px;padding:3px 10px 3px 5px;border-radius:999px;background:rgba(10,40,70,.35);color:#fff;font-weight:800;font-size:16px;white-space:nowrap}'+
 '#modal#modal[data-nova360] .wallet412 .nova412{display:inline-block;width:20px;height:20px;background:url(assets/nova-core.webp) center/contain no-repeat;vertical-align:middle}'+
 '#modal#modal[data-nova360] .wallet412 .novaContent360{display:flex;flex-direction:column;gap:6px;padding:6px 10px 8px!important;overflow:visible}'+
 '#modal#modal[data-nova360] .wallet412 .chips412{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:6px}'+
 '#modal#modal[data-nova360] .wallet412 .chip412{display:flex;align-items:center;gap:6px;min-height:40px;margin:0;padding:4px 8px;border-radius:12px;background:linear-gradient(#f3f9ff,#dcecfb);border:1px solid #9ec3e6;color:#1d3d5c;text-align:left;font:inherit;box-shadow:0 2px 0 #9ec3e6}'+
 '#modal#modal[data-nova360] .wallet412 .chip412 .art345,#modal .wallet412 .chip412 img{width:30px;height:30px;flex:0 0 30px}'+
 '#modal#modal[data-nova360] .wallet412 .chip412 span{display:flex;flex-direction:column;line-height:1.1;min-width:0}#modal .wallet412 .chip412 small{font-size:11px;color:#4b6b88}#modal .wallet412 .chip412 b{font-size:14px}'+
 '#modal#modal[data-nova360] .wallet412 .welcome412{padding-right:5px}#modal .wallet412 .welcome412 .mini412{margin-left:auto;max-width:96px;font-size:11px;line-height:1.1;padding:6px 7px}'+
 '#modal#modal[data-nova360] .wallet412 .daily412{margin:0!important;padding:8px 9px!important;border-radius:14px}'+
 '#modal#modal[data-nova360] .wallet412 .daily412 .daily-title340{display:flex;align-items:center;gap:8px;margin:0 0 6px}#modal .wallet412 .daily412 .daily-title340 img{width:34px;height:34px}'+
 '#modal#modal[data-nova360] .wallet412 .daily412 .daily-title340 h2{font-size:15px;margin:0}#modal .wallet412 .daily412 .daily-title340 p{font-size:11px;margin:1px 0 0;line-height:1.2}'+
 '#modal#modal[data-nova360] .wallet412 .daily412 .daily-week340{display:grid!important;grid-template-columns:repeat(7,1fr)!important;gap:4px!important;margin:0 0 6px!important}'+
 '#modal#modal[data-nova360] .wallet412 .daily412 .daily-day340{min-height:0!important;padding:4px 1px!important;border-radius:9px!important;gap:0!important;line-height:1.05}'+
 '#modal#modal[data-nova360] .wallet412 .daily412 .daily-day340 small{font-size:9.5px!important;white-space:nowrap}#modal .wallet412 .daily412 .daily-day340 b{font-size:16px!important}#modal .wallet412 .daily412 .daily-day340 span{font-size:8.5px!important}'+
 '#modal#modal[data-nova360] .wallet412 .pair412{display:grid;grid-template-columns:1fr 1fr;gap:6px}#modal .wallet412 .pair412 button{margin:0!important;min-height:40px;padding:5px 6px!important;font-size:12.5px!important;line-height:1.15;white-space:normal}'+
 '#modal#modal[data-nova360] .wallet412 .pair412 .art345{display:none}'+
 '#modal#modal[data-nova360] .wallet412 .note412{display:block;font-size:10.5px;opacity:.75;text-align:center;margin-top:4px;line-height:1.2}'+
 '#modal#modal[data-nova360] .wallet412 .promo425{position:relative;padding:8px 9px;border-radius:14px;background:linear-gradient(135deg,#fff2c9,#ffd6e6 60%,#d9ecff);border:2px solid #f5b54a;box-shadow:0 3px 0 #e39a2e}'+
 '#modal#modal[data-nova360] .wallet412 .promoHead425{display:flex;align-items:center;gap:8px;margin-bottom:6px;color:#5a2d0c}#modal .wallet412 .promoHead425 img{width:30px;height:30px}#modal .wallet412 .promoHead425 span{display:flex;flex-direction:column;line-height:1.15}#modal .wallet412 .promoHead425 b{font-size:15px}#modal .wallet412 .promoHead425 small{font-size:10.5px;opacity:.8}'+
 '#modal#modal[data-nova360] .wallet412 .promoGrid425{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}'+
 '#modal#modal[data-nova360] .wallet412 .promoCard425{position:relative;display:flex;flex-direction:column;align-items:center;gap:1px;margin:0;padding:6px 4px;border-radius:12px;background:#fffdf6;border:1px solid #f0c27a;box-shadow:0 2px 0 #e8b066;color:#4a2a08;font:inherit;min-width:0}'+
 '#modal#modal[data-nova360] .wallet412 .promoCard425 .packArt348{width:40px!important;height:40px!important;margin:0 auto}#modal .wallet412 .promoCard425 b{font-size:15px}'+
 '#modal#modal[data-nova360] .wallet412 .promoCard425>span:last-child{margin-top:2px;padding:2px 8px;border-radius:999px;background:linear-gradient(#7ee07a,#3fb64a);color:#fff;font-weight:800;font-size:12px}'+
 '#modal#modal[data-nova360] .wallet412 .promoCard425 em{position:absolute;top:-7px;right:-3px;padding:1px 6px;border-radius:8px;background:#ff5a5f;color:#fff;font-style:normal;font-weight:800;font-size:10px;transform:rotate(6deg)}'+
 '#modal#modal[data-nova360] .wallet412 .promoAll425{display:block;width:100%;margin:6px 0 0!important;padding:5px!important;border:0!important;background:none!important;box-shadow:none!important;min-height:0!important;color:#a0521c;font:inherit;font-weight:800;font-size:12.5px}'+
 '#app>header .resources>span:has(#gold),#app>header .resources>span:has(#energy),#app>header .resources>span:has(#zfluid410){cursor:pointer}'+
'#modal#modal[data-nova360] .wallet412 .prod412 h3{margin:0 0 5px;font-size:15px}'+
 '#modal#modal[data-nova360] .wallet412 .tiles412{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}'+
 '#modal#modal[data-nova360] .wallet412 .tile412{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:2px;margin:0;padding:7px 5px;border-radius:12px;background:linear-gradient(#fffaf0,#f3e6c8);border:1px solid #d9bf86;color:#4a3713;font:inherit;box-shadow:0 2px 0 #cfb37a;min-width:0}'+
 '#modal#modal[data-nova360] .wallet412 .tile412 .fluid403{width:30px;height:30px}#modal .wallet412 .tile412 b{font-size:13.5px}#modal .wallet412 .tile412 small{font-size:11px;opacity:.8}'+
 '#modal#modal[data-nova360] .wallet412 .tile412 .go412{margin-top:auto;font-size:11.5px;font-weight:800;color:#2f7a2a}'+
 '#modal#modal[data-nova360] .wallet412 .z412{background:linear-gradient(#fff3f2,#f7d4d1);border-color:#e39a94;box-shadow:0 2px 0 #d9857e;color:#5a1d1d}'+
 '#modal#modal[data-nova360] .wallet412 .zbtn412{display:flex;flex-direction:column;gap:4px;width:100%;margin-top:2px}#modal .wallet412 .zbtn412 button{margin:0!important;width:100%;min-height:30px;padding:3px 4px!important;font-size:12px!important;border-radius:9px;display:flex;align-items:center;justify-content:center;gap:3px}'+
 '#modal#modal[data-nova360] .wallet412 .zbtn412 .nova412b{background:linear-gradient(#ffe88a,#f2b62a)!important;color:#4a3000!important}#modal .wallet412 .zbtn412 .nova412{width:16px;height:16px}'+
 '#modal#modal[data-nova360] .wallet412 .lock412{font-size:11px;margin-top:auto}'+
 '#modal#modal[data-nova360] .wallet412 .foot412{display:grid;grid-template-columns:1fr 1fr;gap:6px}#modal .wallet412 .mini412{margin:0!important;min-height:36px;padding:5px 6px!important;font-size:12.5px!important;line-height:1.15}'+
 '#modal .zoffer412 h2{margin:0 0 8px}#modal .zbar412{position:relative;height:26px;border-radius:13px;background:#f3d9d6;border:1px solid #e39a94;overflow:hidden;margin-bottom:8px}#modal .zbar412 i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(#ff8a80,#d63c3c)}#modal .zbar412 span{position:relative;display:flex;align-items:center;justify-content:center;gap:5px;height:100%;font-weight:800;color:#4a1010}'+
 '#modal .zrow412{display:flex;align-items:center;gap:10px;width:100%;margin:0 0 6px;padding:7px 10px;border-radius:12px;text-align:left;font:inherit}#modal .zrow412 .fluid403,#modal .zrow412 .zic412{width:30px;height:30px;font-size:24px;flex:0 0 30px;text-align:center}#modal .zrow412 span{display:flex;flex-direction:column;flex:1;line-height:1.15}#modal .zrow412 small{opacity:.8}#modal .zrow412 em{font-style:normal;font-weight:800;display:flex;align-items:center;gap:3px}#modal .zrow412 .nova412{display:inline-block;width:18px;height:18px;background:url(assets/nova-core.webp) center/contain no-repeat}#modal .zlock412{font-size:13px;text-align:center;opacity:.85}#modal .zrow412 .art345{display:none!important}'+
 '#modal#modal .zgot412{font-size:28px;font-weight:800;color:#b3262e;text-align:center}#modal .zgot412 .fluid403{width:28px;height:28px}';
 document.head.appendChild(st);})();
