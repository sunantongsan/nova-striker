// Render the approved full environment artwork directly, including sculpted borders.
// The same world-to-screen projection drives scenery, buildings and placement cells.
var scenery384=new Image();scenery384.src='assets/environments384.webp';
scenery384.onload=function(){terrainKey219='';drawNeeded=true;};
var terrainFallback384=paintTerrain219;
paintTerrain219=function(map,raid){
 if(!scenery384.complete||!scenery384.naturalWidth)return terrainFallback384(map,raid);
 var i=planetChoice298,c=point((map-1)/2,(map-1)/2),width=map*tile*zoom*2/.64,height=map*tile*.62*zoom*2/.54;
 ctx.clearRect(0,0,viewWidth,viewHeight);box(0,0,viewWidth,viewHeight,planetPalette298().sky);
 var sw=scenery384.naturalWidth/2,sh=scenery384.naturalHeight/2;
 ctx.drawImage(scenery384,i%2*sw,Math.floor(i/2)*sh,sw,sh,c.x-width*.5,c.y-height*.48,width,height);
 if(!raid&&(placing||moving))for(var x=1;x<=20;x++)for(var y=1;y<=20;y++)if(E.empty(x,y,moving))diamond(x,y,'rgba(255,255,255,.20)','#72b1a7');
};
Game.environmentOverview384=function(){
 if(screen!=='home')return;fitCanvas();var map=22;
 zoom=Math.min(.65,Math.max(.25,Math.min(viewWidth*.94/(map*tile*2/.64),(viewHeight-100)/(map*tile*.62*2/.54))));
 panX=0;panY=viewHeight*.49-originY-(map-1)*tile*.62*zoom;terrainKey219='';drawNeeded=true;
};
var selectEnvironment384=Game.choosePlanet298;
Game.choosePlanet298=function(i){selectEnvironment384(i);if(planetChoice298===i)Game.environmentOverview384();};
var themeBuildSource384=false,buildBefore384=Game.build;
Game.build=function(tab){
 if(tab==='environments'){themeBuildSource384=true;Game.planets298();return;}
 themeBuildSource384=false;buildBefore384.apply(this,arguments);
 var tabs=modal.querySelector('.shop-tabs261');
 if(tabs&&!tabs.querySelector('[data-environments384]'))tabs.insertAdjacentHTML('beforeend','<button data-environments384="true" aria-pressed="false" onclick="Game.build(\'environments\')">'+mt251('พื้นที่ตั้งฐาน','Environments')+'</button>');
 var grid=modal.querySelector('.shop-grid261');
 if(grid&&(!tab||tab==='all'))grid.insertAdjacentHTML('afterbegin','<button class="environmentEntry384" onclick="Game.build(\'environments\')"><span class="environmentThumb384"></span><strong>'+mt251('พื้นที่ตั้งฐาน','Base environments')+'</strong><small>'+mt251('ทุ่งหญ้า / ทะเลทราย ฟรี','Meadow / Desert free')+'</small><small>'+mt251('ทะเล / ลอยฟ้า • 50 NOVA หรือวิดีโอ 2 ครั้ง','Ocean / Sky • 50 NOVA or 2 videos')+'</small></button>');
};
var panelBefore384=themePanel383;
themePanel383=function(message){panelBefore384(message);var panel=modal.querySelector('.themePanel383');if(panel){
 if(themeBuildSource384)panel.insertAdjacentHTML('afterbegin','<button class="environmentBack384" onclick="Game.build(\'all\')">‹ '+mt251('กลับหน้าก่อสร้าง','Back to construction')+'</button>');
 var info=panel.querySelector('p');if(info)info.textContent=mt251('ซื้อครั้งเดียว ใช้ได้ถาวร • วิดีโอสะสมแยกแต่ละฉาก • ไม่เพิ่มพลังรบ','Permanent unlock • Video progress is separate per scene • Cosmetic only');
 }};
var style384=document.createElement('style');style384.textContent=`
.themePreview383{background-image:url('assets/environments384.webp');height:120px;background-size:200% 200%}
.environmentEntry384{grid-column:1/-1;display:grid!important;grid-template-columns:100px 1fr;text-align:left;gap:3px 12px;padding:10px!important;background:linear-gradient(125deg,#e8fff4,#e8e7ff)!important;color:#315c70!important;border:2px solid #a6dcd0!important;border-radius:16px!important}
.environmentEntry384 .environmentThumb384{grid-row:1/4;background:url('assets/environments384.webp') 0 0/200% 200%;border-radius:12px;min-height:70px}
.environmentEntry384 small{color:#42667a!important;font-size:12px}.environmentBack384{background:#dff3f3!important;color:#315c70!important;border-radius:10px!important;margin-bottom:8px;min-height:44px}
.shop-tabs261{flex-wrap:wrap!important}.shop-tabs261 [data-environments384]{background:linear-gradient(#fff2ce,#ffce9e)!important;color:#5a5143!important;border-color:#e8bb83!important;min-height:44px}
#modal[data-nova360] .novaHead360{background:linear-gradient(120deg,#b9e5e6,#d6cbee)!important;color:#315469!important}#modal[data-nova360] .novaHead360 h2{color:#315469!important}
`;document.head.appendChild(style384);
