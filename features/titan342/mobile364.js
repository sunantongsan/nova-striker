// Compact shared windows and an unclipped opponent identity panel.
function presenceLabel364(target){
 var p=target&&target.presence364;
 if(!p||typeof p.online!=='boolean')return {state:'unknown',text:mt251('ไม่ทราบสถานะ','Status unavailable')};
 return p.online?{state:'online',text:mt251('ออนไลน์','Online')}:{state:'offline',text:mt251('ออฟไลน์','Offline')};
}
var opponentCard364=document.createElement('section');opponentCard364.id='opponent364';opponentCard364.hidden=true;
opponentCard364.innerHTML='<div class="opponentArt364">'+buildingArt261('hq')+'</div><div class="opponentText364"><strong></strong><span class="presence364"></span></div>';
$('app').appendChild(opponentCard364);
var hudBefore364=hud;hud=function(){
 hudBefore364();var r=E.raid,shown=screen==='raid'&&r&&r.liveMode==='preview'&&liveTarget;
 opponentCard364.hidden=!shown;if(!shown)return;
 var status=presenceLabel364(liveTarget);
 opponentCard364.querySelector('strong').textContent=liveTarget.callsign||r.name||mt251('คู่ต่อสู้','Opponent');
 var badge=opponentCard364.querySelector('.presence364');badge.textContent=status.text;badge.dataset.state=status.state;
 badge.title=mt251('สถานะตอนค้นหา • ออนไลน์เมื่อใช้งานใน 2 นาทีล่าสุด','Status at search • online when active within the last 2 minutes');
 $('mode').textContent=mt251('สำรวจฐาน','Scouting');
};
