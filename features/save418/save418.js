// 418: a player's base can never be lost to an update, a reinstall or a new phone.
// * Every signed-in player's whole base (the local save) is copied to the server every few minutes and when the app
//   goes to the background (nova_private.saves418). The server keeps the copy with the highest Duck House and
//   never lets a smaller base replace a bigger one.
// * When the game starts (or the player signs in) it asks the server for that copy. If the base on the phone has a
//   lower Duck House than the copy, the copy comes back automatically (a brand-new base) or after one tap (any
//   other case). The base on the phone is kept in localStorage first (novaRTSBeforeRestore418).
// * Accounts without a full copy yet fall back to their published base layout (live or the 412 backup).
// Requests use their own ids ('save418-…') so they never wait for, or block, other online actions.
(function(){
 var PREFIX='save418-',EVERY=4*60*1000,busy=null,serial=0,checked=false,lastPut=0,lastSent='',offered=false,tries=0;
 function cloud(){var c=root.NovaCloud;try{return !!c&&!!c.warRequest&&!guest288&&(!c.warAvailable||c.warAvailable())&&(!c.hasAccount||c.hasAccount());}catch(e){return false;}}
 function hqOf(list){var h=0;(list||[]).forEach(function(b){if(b&&b.type==='hq')h=Math.max(h,b.lv|0);});return h;}
 function score(list){return (list||[]).reduce(function(n,b){return n+((b&&b.lv)|0);},0);}
 function fresh(){var d=E.d;return E.hq()<=2&&Array.isArray(d.buildings)&&d.buildings.length<=25;}
 function send(mode,data){
  if(busy||!cloud())return false;var id=PREFIX+(++serial);busy={id:id,mode:mode};
  busy.timer=setTimeout(function(){busy=null;},30000);
  try{root.NovaCloud.warRequest('test_status',JSON.stringify(Object.assign({save418:mode},data||{})),id);}catch(e){clearTimeout(busy.timer);busy=null;return false;}
  return true;}
 // what goes to the server: the whole save minus receipts that only stop double taps on this phone
 function packed(){
  E.sync();var d=JSON.parse(JSON.stringify(E.d)),drop=['speedReceipts264','receipts','rewardIds','fx','lastSaved215'];
  var s=JSON.stringify(d);for(var i=0;i<drop.length&&s.length>30000;i++){delete d[drop[i]];s=JSON.stringify(d);}
  if(s.length>30000){var core={};['version','gems','checkin','gold','power','stage','stars','army','queue','last','buildings','next','mapSize','defenseLevel','garrison','research','titan342','zfluid410','coach394','grid391','onlineCrystal','tasks'].forEach(function(k){if(d[k]!==undefined)core[k]=d[k];});
   core.buildings=core.buildings.map(function(b){return {id:b.id,type:b.type,x:b.x,y:b.y,lv:b.lv,until:b.until,collected:b.collected};});d=core;s=JSON.stringify(d);}
  return s.length<=30000?d:null;}
 function put(force){
  if(!checked||!cloud()||screen!=='home'||E.raid||E.defense)return;
  var d=packed();if(!d)return;var s=JSON.stringify(d);if(!force&&s===lastSent&&Date.now()-lastPut<EVERY*3)return;
  if(send('put',{save:d,hq:E.hq(),count:d.buildings.length,score:score(d.buildings)})){lastSent=s;lastPut=Date.now();}}
 function check(){if(checked||offered)return;if(!cloud()){return;}if(busy||screen!=='home'){if(++tries<200)setTimeout(check,5000);return;}send('get');}
 function keepPhoneBase(){try{localStorage.setItem('novaRTSBeforeRestore418',JSON.stringify(E.d));}catch(e){}}
 function done(text){selected=null;drawNeeded=true;try{home();}catch(e){}try{hud();}catch(e){}
  setTimeout(function(){put(true);},1500);
  open('<h2>'+mt251('กู้คืนฐานแล้ว','Your base is back')+'</h2><p>'+text+'</p><button class="wide green" onclick="Game.close()">'+mt251('เล่นต่อ','Play')+'</button>');}
 function fromSave(r){
  var save=r.save;if(!save||!Array.isArray(save.buildings)||hqOf(save.buildings)<=E.hq())return false;
  keepPhoneBase();var gems=E.d.gems;
  try{localStorage.setItem('novaRTS1',JSON.stringify(save));var next=new Engine(localStorage);if(next.hq()<hqOf(save.buildings))throw Error('rejected');E=next;}
  catch(e){try{localStorage.setItem('novaRTS1',localStorage.getItem('novaRTSBeforeRestore418'));}catch(x){}return false;}
  if(Number.isFinite(gems))E.d.gems=Math.max(E.d.gems||0,gems);E.d.restore418=Date.now();E.save();
  done(mt251('เราคืนฐานล่าสุดที่บันทึกบนเซิร์ฟเวอร์ให้แล้ว (บ้านเป็ดระดับ ','We brought back your last base saved on the server (Duck House level ')+E.hq()+mt251(', อาคาร ',', ')+E.d.buildings.length+mt251(' ชิ้น)',' buildings)'));
  return true;}
 function fromLayout(r){
  var IN={crystalplant:'zdrill',crystalstore:'ztank'},hq=r.layout_hq|0;if(!Array.isArray(r.layout)||hq<=E.hq())return false;
  keepPhoneBase();var d=E.d,now=E.now(),before=JSON.stringify(d),id=1;
  var list=r.layout.map(function(b){var t=b&&(IN[b.type]?(hq>=7?IN[b.type]:null):b.type);if(!t||!B[t]||!Number.isFinite(+b.x)||!Number.isFinite(+b.y))return null;
   return {id:id++,type:t,x:+b.x,y:+b.y,lv:Math.max(1,Math.min(MAX_BUILDING_LEVEL,(b.lv|0)||1)),collected:now};}).filter(Boolean);
  if(!list.some(function(b){return b.type==='hq';}))return false;
  d.buildings=list;d.next=id;if(!d.mapSize)d.mapSize=20;d.restore418=now;
  try{E.sync();}catch(e){}
  d.gold=Math.max(d.gold||0,Math.min(E.resourceCapacity(),r.gold||0));d.power=Math.max(d.power||0,Math.min(E.resourceCapacity('power'),r.power||0));
  if(!E.save()){E.d=JSON.parse(before);return false;}
  done(mt251('เราคืนฐานล่าสุดที่บันทึกบนเซิร์ฟเวอร์ให้แล้ว (บ้านเป็ดระดับ ','We brought back your last base saved on the server (Duck House level ')+hq+mt251(', อาคาร ',', ')+list.length+mt251(' ชิ้น)',' buildings)'));
  return true;}
 function restore(r){if(r.save&&fromSave(r))return true;return fromLayout(r);}
 var pending418=null;
 Game.restore418=function(){var r=pending418;pending418=null;close();if(r&&!restore(r))toast(mt251('กู้คืนไม่สำเร็จ ลองเปิดเกมใหม่','Restore failed, reopen the game'));checked=true;};
 Game.keep418=function(){pending418=null;checked=true;close();};
 function got(r){
  offered=false;var serverHQ=Math.max(r.hq|0,r.save?hqOf(r.save.buildings):0);
  if(serverHQ>E.hq()){
   if(fresh()){if(restore(r)){checked=true;return;}}
   else{offered=true;pending418=r;open('<h2>'+mt251('พบฐานที่ใหญ่กว่าบนเซิร์ฟเวอร์','A bigger base is saved on the server')+'</h2><p>'+mt251('บนเซิร์ฟเวอร์: บ้านเป็ดระดับ ','On the server: Duck House level ')+serverHQ+'<br>'+mt251('ในเครื่องนี้: ระดับ ','On this phone: level ')+E.hq()+'</p><button class="wide green" onclick="Game.restore418()">'+mt251('ใช้ฐานบนเซิร์ฟเวอร์','Use the server base')+'</button><button class="wide" onclick="Game.keep418()">'+mt251('เล่นฐานในเครื่องต่อ','Keep this phone\'s base')+'</button>');return;}
  }
  checked=true;put(true);}
 var prev=root.novaCloudEvent;
 root.novaCloudEvent=function(event,data){
  if(data&&data.request_id&&String(data.request_id).indexOf(PREFIX)===0){
   if(!busy||data.request_id!==busy.id)return;var mode=busy.mode;clearTimeout(busy.timer);busy=null;
   var d=data.data;if(typeof d==='string')try{d=JSON.parse(d);}catch(e){d=null;}
   if(event!=='war'||!d||!d.save418){if(mode==='get'&&++tries<200)setTimeout(check,15000);return;}
   if(mode==='get')got(d.save418);return;}
  if(event==='signed_in'){checked=false;offered=false;tries=0;setTimeout(check,3000);}
  if(event==='signed_out'){checked=false;}
  return prev.apply(this,arguments);};
 setTimeout(check,3000);
 setInterval(function(){if(!checked)check();else put(false);},EVERY);
 document.addEventListener('visibilitychange',function(){if(document.hidden)put(false);});
 root.NovaSave418={check:check,put:put,state:function(){return {checked:checked,busy:!!busy,offered:offered};}};
})();
