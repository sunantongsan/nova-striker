// 412: bases that the patch-210 save bug replaced with a new base come back automatically.
// The server keeps every player's last published base (nova_private.layout_backup412). When the local base is
// brand new (HQ 1-2, at most 25 buildings) and the signed-in account has a backup with HQ 2+, the game asks the
// server, claims the backup (once per account) and rebuilds the base from it. Nothing is shown to players who
// have no backup.
(function(){
 var id412=null,tries412=0,done412=false;
 function fresh412(){var d=E.d;return !!d&&!d.restore412&&E.hq()<=2&&Array.isArray(d.buildings)&&d.buildings.length<=25;}
 function online412(){var c=root.NovaCloud;try{return !!c&&!!c.warAvailable&&c.warAvailable()&&!!c.warRequest&&(!c.hasAccount||c.hasAccount());}catch(e){return false;}}
 function ask412(claim){
  if(done412||!fresh412()||!online412())return;
  if(warBusy||screen!=='home'){if(++tries412<20)setTimeout(function(){ask412(claim);},4000);return;}
  var keep=resourcePolling;resourcePolling=true;// no "connecting" window
  try{warRequest('status',{restore412:true,claim:!!claim});}catch(e){}
  resourcePolling=keep;id412=warActive;}
 var prev412=warEvent;
 warEvent=function(event,message){
  if(id412&&message&&message.request_id===id412){
   clearTimeout(warTimer);warBusy=false;warActive=null;id412=null;
   if(event==='war'){var data=message.data;if(typeof data==='string')try{data=JSON.parse(data);}catch(e){data=null;}if(data&&data.restore412)handle412(data.restore412);}
   return;}
  return prev412.apply(this,arguments);};
 function handle412(r){
  if(!r||!r.available||!Array.isArray(r.layout)||!fresh412())return;
  if(!((r.hq||0)>E.hq()||r.layout.length>E.d.buildings.length+10))return;// the backup must be clearly bigger than the base on the phone
  if(!r.claimed){ask412(true);return;}
  done412=true;apply412(r);}
 function apply412(r){
  var d=E.d,now=E.now(),before=JSON.stringify(d),id=1,IN={crystalplant:'zdrill',crystalstore:'ztank'};
  var list=r.layout.map(function(b){var t=b&&(IN[b.type]?((r.hq||0)>=7?IN[b.type]:null):b.type);if(!t||!B[t]||!Number.isFinite(+b.x)||!Number.isFinite(+b.y))return null;
   return {id:id++,type:t,x:+b.x,y:+b.y,lv:Math.max(1,Math.min(MAX_BUILDING_LEVEL,(b.lv|0)||1)),collected:now};}).filter(Boolean);
  if(!list.some(function(b){return b.type==='hq';}))return;
  d.buildings=list;d.next=id;if(!d.mapSize)d.mapSize=20;d.restore412=now;
  try{E.sync();}catch(e){}
  d.gold=Math.max(d.gold||0,Math.min(E.resourceCapacity(),r.gold||0));
  d.power=Math.max(d.power||0,Math.min(E.resourceCapacity('power'),r.power||0));
  if(!E.save()){E.d=JSON.parse(before);return;}
  selected=null;drawNeeded=true;try{hud();}catch(e){}
  open('<h2>'+mt251('กู้คืนฐานเดิมแล้ว','Your base is back')+'</h2><p>'+
   mt251('อัปเดตก่อนหน้านี้ทำให้ฐานของคุณเริ่มใหม่ เราคืนฐานล่าสุดที่บันทึกบนเซิร์ฟเวอร์ให้แล้ว (ศูนย์บัญชาการระดับ ','An earlier update restarted your base. We brought back your last base saved on the server (Command Center level ')+
   (r.hq||'')+mt251(', อาคาร ',', ')+list.length+mt251(' ชิ้น)',' buildings)')+'</p><p>'+mt251('ขออภัยในความไม่สะดวก เล่นต่อได้เลย','Sorry for the trouble. Carry on playing!')+'</p><button class="wide green" onclick="Game.close()">'+mt251('เล่นต่อ','Play')+'</button>');}
 setTimeout(function(){ask412(false);},2500);
})();
