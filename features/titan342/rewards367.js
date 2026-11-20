// Currency rewards use the same signed SSV transport as existing production ads.
var coinState367=null,coinBusy367=null,coinShowing367=false,coinTimer367=null,coinRetries367=0;
function coinOwner367(){return E.d.onlineCrystal&&E.d.onlineCrystal.owner;}
function coinPanel367(message){var s=coinState367,p=E.d.pendingCoin367,ready=s&&s.available&&s.remaining>0;
 open('<section class="production359"><h2>'+mt251('รับ ไข่ทอง ฟรี','Free Golden Eggs')+'</h2><strong>5 Golden Eggs</strong><p>'+mt251('ดูวิดีโอครบ รับได้สูงสุด 6 ครั้งต่อวัน','Complete a video. Up to 6 rewards daily.')+'</p><p>'+mt251('สิทธิ์ที่เหลือวันนี้: ','Remaining today: ')+(s?s.remaining:'—')+'</p>'+(message?'<p>'+escapeHTML(message)+'</p>':'')+'<button class="wide green" '+(coinBusy367||!p&&!ready?'disabled':'')+' onclick="Game.coinAd367()">'+mt251(p&&p.completed?'ตรวจรางวัลเดิม':'ดูวิดีโอรับ ไข่ทอง',p&&p.completed?'Check saved reward':'Watch video for Golden Eggs')+'</button><button class="wide" onclick="Game.coinRewards367()">'+mt251('ตรวจสิทธิ์อีกครั้ง','Refresh')+'</button><button class="wide" onclick="Game.shop348(\'nova\')">'+mt251('กลับ','Back')+'</button></section>');
}
function coinSend367(mode){if(coinBusy367||!coinOwner367()||!root.NovaCloud||!root.NovaCloud.warRequest)return;
 var p=E.d.pendingCoin367;if(mode!=='status'&&(!p||p.owner!==coinOwner367()))return;
 var id='coin367-'+nonce160(),payload=Object.assign({},mode==='status'?{owner:coinOwner367()}:p,{coin_ad367:mode});coinBusy367={id:id,mode:mode,owner:coinOwner367()};
 clearTimeout(coinTimer367);coinTimer367=setTimeout(function(){if(coinBusy367&&coinBusy367.id===id){coinBusy367=null;coinShowing367=false;coinPanel367(mt251('เชื่อมต่อไม่ได้ กดตรวจรายการเดิมได้โดยไม่ต้องซื้อหรือดูซ้ำ','Connection timed out. Retry your saved reward.'));}},20000);
 try{root.NovaCloud.warRequest(mode==='claim'?'test_claim':'test_status',JSON.stringify(payload),id);}catch(e){clearTimeout(coinTimer367);coinBusy367=null;coinPanel367(mt251('เชื่อมต่อไม่ได้','Connection unavailable'));}
}
Game.coinRewards367=function(){if(!coinOwner367()){resourceAccount233();return;}coinPanel367();coinSend367('status');};
Game.coinAd367=function(){if(coinBusy367||coinShowing367||speedShowing264||raidShowing260||mineShow251||testShowing248||titanAd342||E.d.pendingAd230&&E.d.pendingAd230.showRequested)return;
 var owner=coinOwner367();if(!owner){resourceAccount233();return;}var p=E.d.pendingCoin367;
 if(p&&p.owner!==owner){toast(mt251('ใช้บัญชีเดิมเพื่อตรวจรายการ','Use the original account to claim'));return;}
 if(!p){if(!coinState367||!coinState367.available||coinState367.remaining<=0){coinSend367('status');return;}p={owner:owner,request_id:nonce160()};E.d.pendingCoin367=p;if(!E.save()){delete E.d.pendingCoin367;return;}}
 coinRetries367=0;coinSend367(p.completed?'claim':'prepare');
};
function coinShow367(){var p=E.d.pendingCoin367,a=root.NovaAds;if(!p||p.completed||p.owner!==coinOwner367())return;
 try{if(!a||!a.rewardVerified||a.provider==='monetag')throw Error('unavailable');coinShowing367=true;a.rewardVerified(p.owner,p.request_id);}catch(e){coinShowing367=false;coinPanel367(mt251('โฆษณายังไม่พร้อม กรุณาลองใหม่ภายหลัง','Ads are not available. Try later.'));}
}
var cloudCoin367=root.novaCloudEvent;root.novaCloudEvent=function(event,data){
 if(data&&data.request_id&&data.request_id.indexOf('coin367-')===0){
  if(!coinBusy367||coinBusy367.id!==data.request_id)return;var request=coinBusy367;coinBusy367=null;clearTimeout(coinTimer367);
  if(request.owner!==coinOwner367())return;
  if(event!=='war'||!data.data||!data.data.coin_ad367){coinShowing367=false;coinPanel367(data.message||mt251('ตรวจรางวัลไม่ได้ กดลองอีกครั้ง','Could not check reward. Retry.'));return;}
  var s=data.data,p=E.d.pendingCoin367,r=s.receipt;if(s.owner!==coinOwner367())return;coinState367=s;
  var delivered=Game.applyExternal297(s.external297);
  if(request.mode==='status'){coinPanel367(s.available?'':mt251('กำลังรอเปิดบริการโฆษณา','Reward ads are not yet available'));return;}
  if(!p||!r||p.owner!==s.owner||r.id!==p.request_id)return;
  if(r.claimed){coinShowing367=false;if(!delivered){coinPanel367(mt251('บันทึกรางวัลไม่ได้ กดตรวจรายการเดิม','Could not save reward. Retry.'));return;}delete E.d.pendingCoin367;if(!E.save())E.d.pendingCoin367=p;coinPanel367(mt251('รับ 5 ไข่ทอง แล้ว','5 Golden Eggs received'));return;}
  if(r.verified&&!p.completed){p.completed=true;if(!E.save())return;coinSend367('claim');return;}
  if(p.completed){if(coinRetries367++<12)coinTimer367=setTimeout(function(){coinSend367('claim');},5000);coinPanel367(mt251('รอเซิร์ฟเวอร์ยืนยัน กดตรวจรายการเดิมได้โดยไม่ต้องดูซ้ำ','Waiting for verification. Retry without another video.'));return;}
  if(Date.parse(r.expires_at)<=Date.now()){p.request_id=nonce160();if(E.save())coinSend367('prepare');return;}
  coinShow367();return;
 }
 if(event==='signed_in'||event==='signed_out'){clearTimeout(coinTimer367);coinBusy367=null;coinShowing367=false;coinState367=null;}
 cloudCoin367(event,data);
};
var earnedCoin367=root.novaRewardEarned;root.novaRewardEarned=function(id){var p=E.d.pendingCoin367;
 if(coinShowing367&&p&&p.owner===coinOwner367()){p.completed=true;if(!E.save())return;coinShowing367=false;if(root.NovaAds.acknowledgeReward)root.NovaAds.acknowledgeReward(id);coinSend367('claim');return;}earnedCoin367(id);
};
var statusCoin367=root.novaRewardStatus;root.novaRewardStatus=function(status){if(coinShowing367){if(status==='ready'){coinShow367();return;}if(['loading','showing'].includes(status))return;coinShowing367=false;coinPanel367(mt251('โฆษณายังไม่พร้อมหรือยังดูไม่ครบ','Video unavailable or incomplete'));return;}statusCoin367(status);};
var mediaCoin367=mediaAllowed250;mediaAllowed250=function(){return !coinShowing367&&mediaCoin367();};
var idleCoin367=Game.walletIdle297;Game.walletIdle297=function(){return !coinBusy367&&!coinShowing367&&idleCoin367();};
var shopCoin367=renderShop348;renderShop348=function(s){shopCoin367(s);if(shopTab348!=='nova')return;var grid=modal.querySelector('.storeGrid348');if(!grid)return;var button=document.createElement('button');button.className='wide';button.textContent=mt251('ดูวิดีโอรับ 5 ไข่ทอง · สูงสุด 6 ครั้ง/วัน','Watch for 5 Golden Eggs · up to 6/day');button.onclick=Game.coinRewards367;grid.insertAdjacentElement('afterend',button);};
