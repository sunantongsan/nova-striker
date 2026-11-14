// Fixed currency rewards. Google's existing test-ad bridge is used until real ads are enabled.
var checkinAd396=Game.checkin;
Game.checkin=function(){
 if(warBusy)return;
 if(!testWallet||!testWallet.owner){Game.refreshCheckin233();return;}
 if(checkinState233&&checkinState233.claimed)return;
 if(E.d.pendingTestCheckin248&&E.d.pendingTestCheckin248.completed248){checkinAd396();return;}
 warRequest('test_claim',{checkin233:true,normal396:true,owner:testWallet.owner});
};
Game.checkinAd396=function(){checkinAd396();};
dailyCalendarHTML340=function(){var c=checkinState233,disabled=!c||c.claimed||warBusy;
 return '<section class="daily-card340 checkin237"><div class="daily-title340"><img src="assets/checkin-calendar-340.webp" alt=""><div><h2>'+mt251('เช็คอินรายวัน','Daily check-in')+'</h2><p>'+mt251('ทุกวัน 5 NOVA • ดูโฆษณา ×3 รวม 15 NOVA','Daily 5 NOVA • Watch ×3 for 15 total')+'</p></div></div><div class="daily-week340 checkin-grid237">'+Array.from({length:7},function(_,i){return '<div class="daily-day340"><small>'+mt251('วันที่ ','Day ')+(i+1)+'</small><b>5</b><span>NOVA</span></div>';}).join('')+'</div><button class="wide" '+(disabled?'disabled':'')+' onclick="Game.checkin()">'+(c&&c.claimed?mt251('รับรางวัลวันนี้แล้ว','Collected today'):mt251('รับ 5 NOVA','Claim 5 NOVA'))+'</button><button class="wide green" '+(disabled?'disabled':'')+' onclick="Game.checkinAd396()">'+mt251('ดูโฆษณา ×3 • รับ 15 NOVA','Watch ×3 • Claim 15 NOVA')+'</button><small>'+mt251('เริ่มวันใหม่เวลา 00:00 น. ประเทศไทย','New day at 00:00 Thailand time')+'</small></section>';
};
Game.promoClaim=Game.checkin;
// Do not auto-open an ad when the player merely opens their raid rewards.
Game.raidRewards260=function(){if(raidBusy260||raidShowing260)return;raidAuto260=null;raidSend260('status');};
Game.claimRaidNormal396=function(battle){if(raidBusy260||raidShowing260||!raidOwner260)return;var p=E.d.pendingRaid260;if(p&&p.completed){Game.claimRaid260(p.battle);return;}p={owner:raidOwner260,battle:battle,request_id:nonce160()};E.d.pendingRaid260=p;if(!E.save())return;raidSend260('normal',p);};
raidPanel260=function(){open('<section class="raid260"><h2>'+mt251('รางวัลโจมตีที่รอรับ','Pending raid rewards')+'</h2>'+raidRows260.map(function(r){return '<p>'+r.gold.toLocaleString()+tr(' ทอง • ')+r.power.toLocaleString()+tr(' พลังงาน')+'</p><button class="wide" onclick="Game.claimRaidNormal396(\''+r.battle+'\')">'+mt251('รับปกติ ','Claim ')+r.nova+' NOVA</button><button class="wide green" onclick="Game.claimRaid260(\''+r.battle+'\')">'+mt251('ดูโฆษณา • รับ ','Watch • Claim ')+(r.ad_nova396==null?r.nova:r.ad_nova396)+' NOVA</button>';}).join('')+(!raidRows260.length?'<p>'+mt251('ไม่มีรางวัลค้างรับ','No pending rewards')+'</p>':'')+'<button class="wide" onclick="Game.close()">'+tr('กลับ')+'</button></section>');};
var bonusBusy396=null,bonusShowing396=false,bonusTimer396=null;
function bonusOwner396(){return E.d.onlineCrystal&&E.d.onlineCrystal.owner;}
function bonusSend396(mode){var p=E.d.pendingCampaignBonus396;if(!p||p.owner!==bonusOwner396()||bonusBusy396||!root.NovaCloud||!root.NovaCloud.warRequest)return;var id='bonus396-'+nonce160();bonusBusy396=id;clearTimeout(bonusTimer396);bonusTimer396=setTimeout(function(){if(bonusBusy396===id){bonusBusy396=null;toast(mt251('เชื่อมต่อไม่ได้ กดตรวจรางวัลเดิม','Connection failed. Retry the saved reward'));}},20000);try{root.NovaCloud.warRequest(mode==='claim'?'test_claim':'test_status',JSON.stringify(Object.assign({},p,{campaign_bonus396:mode})),id);}catch(e){bonusBusy396=null;clearTimeout(bonusTimer396);}}
Game.campaignBonus396=function(stage){if(bonusBusy396||bonusShowing396||raidShowing260||testShowing248||mineShow251||speedShowing264)return;var owner=bonusOwner396();if(!owner){resourceAccount233();return;}var p=E.d.pendingCampaignBonus396;if(p&&p.owner!==owner)return;if(!p){p={owner:owner,stage:stage,request_id:nonce160()};E.d.pendingCampaignBonus396=p;if(!E.save()){delete E.d.pendingCampaignBonus396;return;}}var pending=(E.d.campaignPending362||[]).find(function(v){return v.owner===owner&&v.stage===p.stage;});if(pending){send362('campaign',pending);toast(mt251('กำลังบันทึกรางวัล กดดูโฆษณาอีกครั้งเมื่อพร้อม','Saving reward. Tap again when ready'));return;}bonusSend396(p.completed?'claim':'prepare');};
var campaignResult396=result;result=function(){campaignResult396();var r=E.raid;if(!r||!r.campaign299||!r.result||r.result.gems!==1)return;var key=String(r.stage),done=(E.d.campaignBonusDone396||{})[bonusOwner396()]||{};if(done[key]||modal.querySelector('#campaignBonus396'))return;var sheet=modal.querySelector('.sheet');if(!sheet)return;sheet.insertAdjacentHTML('beforeend','<button id="campaignBonus396" class="wide green" onclick="Game.campaignBonus396('+r.stage+')">'+mt251('ดูโฆษณา ×3 • รวม 3 NOVA','Watch ×3 • 3 NOVA total')+'</button>');};
var cloudBonus396=root.novaCloudEvent;root.novaCloudEvent=function(event,data){
 if(event==='signed_in'||event==='signed_out'){bonusBusy396=null;bonusShowing396=false;clearTimeout(bonusTimer396);}
 if(!data||!/^bonus396-/.test(data.request_id||'')){cloudBonus396(event,data);return;}
 if(data.request_id!==bonusBusy396)return;bonusBusy396=null;clearTimeout(bonusTimer396);
 var p=E.d.pendingCampaignBonus396,d=data.data,r=d&&d.receipt;
 if(!p||p.owner!==bonusOwner396())return;
 if(event!=='war'||!d||d.owner!==p.owner||!r||r.stage!==p.stage){toast(data.message||mt251('ตรวจรางวัลไม่สำเร็จ กดลองอีกครั้ง','Could not check reward. Retry'));return;}
 p.request_id=r.id;if(!E.save())return;
 if(r.claimed){if(!Game.applyExternal297(d.external297))return;var before=JSON.stringify(E.d);E.d.campaignBonusDone396=E.d.campaignBonusDone396||{};E.d.campaignBonusDone396[p.owner]=E.d.campaignBonusDone396[p.owner]||{};E.d.campaignBonusDone396[p.owner][p.stage]=true;delete E.d.pendingCampaignBonus396;if(!E.save()){E.d=JSON.parse(before);return;}bonusShowing396=false;hud();toast(mt251('รับเพิ่ม 2 NOVA • รวม 3 NOVA','Received 2 more NOVA • 3 total'));return;}
 if(p.completed){bonusSend396('claim');return;}
 if(!root.NovaAds||!root.NovaAds.rewardTest248){toast(mt251('โฆษณาทดสอบยังไม่พร้อม','Test ad unavailable'));return;}
 bonusShowing396=true;try{root.NovaAds.rewardTest248(p.owner,p.request_id);}catch(e){bonusShowing396=false;}
};
var earnedBonus396=root.novaTestRewardEarned248;root.novaTestRewardEarned248=function(owner,id){var p=E.d.pendingCampaignBonus396;if(!p||p.owner!==owner||p.request_id!==id||owner!==bonusOwner396()){earnedBonus396(owner,id);return;}p.completed=true;if(!E.save())return;bonusShowing396=false;if(root.NovaAds.acknowledgeTest248)root.NovaAds.acknowledgeTest248(id);bonusSend396('claim');};
var statusBonus396=root.novaRewardStatus;root.novaRewardStatus=function(status){if(!bonusShowing396){statusBonus396(status);return;}if(status==='loading'||status==='test_showing248')return;bonusShowing396=false;toast(mt251('ยังดูไม่ครบ หรือโฆษณายังไม่พร้อม','Video incomplete or unavailable'));};
var homeBonus396=Game.home;Game.home=function(){var r=homeBonus396.apply(this,arguments),p=E.d.pendingCampaignBonus396;if(p&&p.completed)bonusSend396('claim');return r;};
var mediaBonus396=mediaAllowed250;mediaAllowed250=function(){return !bonusShowing396&&mediaBonus396();};
