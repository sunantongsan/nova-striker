// 433: a lively multiplayer search. Sixty resident bases (three per Command Center level 1-20), built with the
// same layout styles real Clash players use (core box, compartments, rings, diamond, wheel, islands, layered, farming)
// plus the newer Nova buildings, each with its own commander name, trophies and defending troops.
// "Find a match" now flips through bases near your level (100 gold per search, like before); real players from the
// server still come up when there are any. You choose which base to hit: deploy a troop to attack, or tap Next.
// Resident bases are played on this phone: loot is Ore Y / Ore G from their storages (less after a 3-star), no NOVA.
var NAMES433=['ShadowFox','มังกรฟ้า','NovaKing','เสือดาวเหล็ก','IronWolf','PixelNinja','ฟ้าใส','สายฟ้าแลบ','Captain_Zed','BlueComet','ราชันย์ทราย','StarBreaker','Moonlight','น้องหมีแพนด้า','RocketBoy','GalaxyQueen',
 'Thunder99','จอมทัพอสูร','NightOwl','SolarFlare','ขุนศึกเหนือ','CyberMonk','LuckyCat','ป้อมปราการ','MegaBuilder','AstroJack','ดาวตก','FrostByte','KhunTong','RubyHawk','เจ้าพายุ','NeonTiger',
 'SilentStorm','ปีศาจเกราะ','OrbitRider','TankGirl','หมาป่าทะเลทราย','ZeroGravity','SkyPirate','บอสใหญ่','CometChaser','IronLotus','พญาเหยี่ยว','QuantumKid','VenomByte','สิงห์สนาม','BlazeRunner','EchoKnight',
 'นักรบจักรวาล','TurboTurtle','Starlord_TH','แม่ทัพแดง','MechaMango','PolarBear','ราตรีสีเงิน','CosmoCat','ShieldWall','จอมโจรสลัด','NovaPrime','LastLegend'];
var CLANS433=['Nova Thailand','ดาวเหนือ','Iron Brotherhood','Sky Raiders','พันธมิตรฟ้า','Moon Base','Galaxy Guard','สายฟ้าแดง','Rocket Club','',''];
var STYLES433=['core','compart','ring','diamond','offset','wheel','islands','layers','farm'];
function styleName433(k){return {core:['ฐานกล่องกลาง','Core box'],compart:['ฐานช่องตาราง','Compartments'],ring:['ฐานวงแหวน','Ring'],diamond:['ฐานข้าวหลามตัด','Diamond'],offset:['ฐานแกนเยื้อง','Offset core'],wheel:['ฐานวงล้อ','Wheel'],islands:['ฐานเกาะ','Islands'],layers:['ฐานหลายชั้น','Layered'],farm:['ฐานฟาร์ม','Farming']}[k]||['ฐาน','Base'];}
function bots433(){if(bots433.list)return bots433.list;var list=[];
 for(var hq=1;hq<=20;hq++)for(var j=0;j<3;j++){var id=(hq-1)*3+j,R=rng393(id*7919+433),name=NAMES433[id%NAMES433.length];
  list.push({id:id,hq:hq,name:name,clan:CLANS433[Math.floor(R()*CLANS433.length)],trophies:Math.round(80+hq*hq*9+hq*60+R()*120),xp:hq*6+Math.floor(R()*12),seed:id*104729+17});}
 return bots433.list=list;}
// layout: the stage generator with our own seed, then the newer buildings placed into free cells
function botLayout433(bot){if(bot.layout)return bot.layout;var keep=rng393;
 rng393=function(){return keep(bot.seed);};var lay;try{lay=campaignLayout393(Math.max(5,bot.hq*5));}finally{rng393=keep;}
 var style=lay.layout393;lay=lay.slice();var R=rng393(bot.seed+5),hq=bot.hq,occ={};lay.forEach(function(b){occ[b.x+','+b.y]=1;});
 var S=Math.max.apply(null,lay.map(function(b){return Math.max(b.x,b.y);})),c=(S+1)/2;
 function free(nearCore){var best=null,bs=-1e9;for(var x=1;x<=S;x++)for(var y=1;y<=S;y++){var ok=true;for(var dx=-1;dx<=1&&ok;dx++)for(var dy=-1;dy<=1;dy++)if(occ[(x+dx)+','+(y+dy)]){ok=false;break;}if(!ok)continue;
  var r=Math.hypot(x-c,y-c),v=(nearCore?-r:-(Math.abs(r-S*.42)))+R()*3;if(v>bs){bs=v;best={x:x,y:y};}}if(best)occ[best.x+','+best.y]=1;return best;}
 function add(type,n,lv,core){for(var i=0;i<n;i++){var p=free(core);if(p)lay.push({type:type,x:p.x,y:p.y,lv:Math.max(1,Math.min(20,lv-Math.floor(R()*2)))});}}
 if(hq>=5)add('tech428',1,hq-3,false);if(hq>=6)add('forge428',1,hq-4,false);if(hq>=7)add('workshop428',1,hq-5,false);if(hq>=8)add('dronehub428',1,hq-6,false);if(hq>=9)add('herohall428',1,hq-7,false);
 if(hq>=6)add('skyguard',hq>=12?3:hq>=9?2:1,hq-2,true);if(hq>=10)add('inferno',hq>=13?2:1,hq-4,true);if(hq>=7){add('zdrill',1,hq-6,false);add('ztank',1,hq-6,true);}
 lay.layout433=style;bot.style=style;return bot.layout=lay;}
function botTarget433(bot){var hq=bot.hq,g=[];var n=Math.min(12,Math.floor(hq*.6));if(n>0){g[0]=Math.ceil(n*.5);g[2]=hq>=4?Math.floor(n*.25):0;g[4]=hq>=6?Math.floor(n*.15):0;g[5]=hq>=9?Math.max(1,Math.floor(n*.1)):0;}
 return {id:'bot433:'+bot.id,bot433:bot.id,callsign:bot.name,tier:hq,layout:botLayout433(bot),garrison:g,research:{weapon:Math.floor(hq/3),armor:Math.floor(hq/3)},builder_count:hq>=8?2:1,can_attack:true};}
var LOOT433=.25;// residents keep most of their storage safe, like real players' loot cap
// ---------- search ----------
var seen433=[],searching433=false;
function myHQ433(){return E.hq()||1;}
function pickBot433(){var me=myHQ433(),pool=bots433().filter(function(b){return Math.abs(b.hq-me)<=2&&seen433.indexOf(b.id)<0;});
 if(!pool.length){seen433=seen433.slice(-3);pool=bots433().filter(function(b){return Math.abs(b.hq-me)<=2&&seen433.indexOf(b.id)<0;});}
 if(!pool.length)pool=bots433();
 pool.sort(function(a,b){return Math.abs(a.hq-me)-Math.abs(b.hq-me);});var w=pool.slice(0,Math.max(4,Math.ceil(pool.length*.75))),bot=w[Math.floor(Math.random()*w.length)];seen433.push(bot.id);if(seen433.length>12)seen433.shift();return bot;}
function online433(){return !guest288&&!!E.d.onlineCrystal&&!!root.NovaCloud;}
function searchAnim433(done){open('<section class="search433"><h2>'+mt251('กำลังค้นหาคู่ต่อสู้','Searching for opponents')+'</h2><div class="clouds433"><i></i><i></i><i></i></div><p>'+mt251('ค้นหาฐานทั่วกาแล็กซี…','Scanning bases across the galaxy…')+'</p></section>');setTimeout(done,650+Math.random()*450);}
function charge433(){E.sync();if(E.d.gold<100){toast(mt251('แร่ Y ไม่พอ • ค้นหาครั้งละ 100','Not enough Ore Y • 100 per search'));return false;}E.d.gold-=100;E.save();hud();return true;}
function scoutBot433(bot){var t=botTarget433(bot);t.presence364={online:Math.random()<.25};liveTarget=t;if(!E.scoutPlayer(t)){toast(mt251('โหลดฐานไม่สำเร็จ','Could not load base'));return;}
 var r=E.raid;r.liveMode='preview';r.bot433=bot.id;r.practice=false;r.army=E.d.army.slice();r.phase='spectator';r.name=bot.name;r.guards=r.guards.filter(function(g){return !g.builder||bot.hq>=3;});var lo=storageLoot299(r),k=(((E.d.botStars433||{})[bot.id]||0)>=3?.3:1)*LOOT433;t.loot_gold=Math.floor(lo.total.gold*k);t.loot_power=Math.floor(lo.total.power*k);
 screen='raid';paused=false;selected=null;placing=moving=null;zoom=.85;panX=0;panY=-110;close();hud();drawNeeded=true;}
function nextSearch433(){if(searching433)return;if(!charge433())return;searching433=true;
 var tryReal=online433()&&Math.random()<.35;searchAnim433(function(){searching433=false;if(tryReal){real433=true;findReal433();return;}scoutBot433(pickBot433());});}
var real433=false,findReal433=null;
var match433=Game.findMatch395;
findReal433=function(){Game.warTargets();};
Game.findMatch395=function(){close();E.sync();if(!formationRoster360(E).some(Boolean)){toast(mt251('ฝึกทหารก่อนค้นหาคู่ต่อสู้','Train troops before searching'));Game.training();return;}nextSearch433();};
var next433=Game.nextTarget;Game.nextTarget=function(){if(liveRoom&&!liveRoom.finished)return;var r=E.raid;if((liveTarget&&liveTarget.bot433!==undefined)||(r&&r.bot433!==undefined)||!online433()){nextSearch433();return;}
 if(Math.random()<.6){nextSearch433();return;}return next433.apply(this,arguments);};
// no real players found -> show a resident base instead of an empty list
var warEv433=warEvent;warEvent=function(event,message){var d=message&&message.data;
 // 437: real players only come up when their Command Center is within 2 levels of yours (like the resident bases);
 // a tiny far-lower base with nothing to loot is skipped, and if none are left you get a resident base instead.
 if(event==='war'&&message.action==='targets'&&d&&d.enrolled&&Array.isArray(d.targets)){var me=myHQ433();d.targets=d.targets.filter(function(t){var lv=Number(t&&t.tier)||0;return lv>0&&Math.abs(lv-me)<=2;});}
 if(event==='war'&&message.action==='targets'&&d&&d.enrolled&&(!d.targets||!d.targets.length)&&!(message.request_id&&message.request_id!==warActive)){clearTimeout(warTimer);warBusy=false;warActive=null;real433=false;scoutBot433(pickBot433());return;}
 return warEv433.apply(this,arguments);};
// ---------- battle ----------
function botRaid433(r){return r&&r.bot433!==undefined;}
function startBot433(r){if(!botRaid433(r)||r.liveMode!=='preview')return;r.liveMode=undefined;delete r.army;r.phase='battle';liveTarget=null;}
var deploy433=E.deploy;E.deploy=function(i,x,y){var r=this.raid;if(botRaid433(r)&&r.liveMode==='preview'){if(!(this.d.army[i]>0)){var k=this.d.army.findIndex(function(n){return n>0;});if(k<0)return mt251('ฝึกทหารก่อนออกรบ','Train troops before attacking');i=k;}startBot433(r);hud();}return deploy433.call(this,i,x,y);};
var attack433=Game.attackSelected;Game.attackSelected=function(){var r=E.raid;if(botRaid433(r)){startBot433(r);if(typeof mechPending425!=='undefined'&&mechPending425){var p=mechPending425;mechPending425=null;deployTitan342=true;var m=E.deployTitan342(p.x,p.y);if(m){deployTitan342=false;toast(m);}}hud();return;}return attack433.apply(this,arguments);};
var finish433=Engine.prototype.finish;Engine.prototype.finish=function(){var r=this.raid;if(!botRaid433(r))return finish433.apply(this,arguments);if(r.result)return r.result;
 var loot=storageLoot299(r),all=r.buildings.filter(function(b){return b.type!=='wall'&&!trap278(b);}),dead=all.filter(function(b){return b.hp<=0;}).length,pct=all.length?Math.floor(dead*100/all.length):0,stars=loot.complete?3:loot.win?(pct>=50?2:1):0;
 var past=(this.d.botStars433=this.d.botStars433||{})[r.bot433]||0,k=(past>=3?.3:1)*LOOT433;
 r.phase='result';r.result={stars:stars,percent:pct,gold:this.deposit('gold',Math.floor(loot.taken.gold*k)),power:this.deposit('power',Math.floor(loot.taken.power*k)),gems:0};
 if(stars){this.progress('win');this.d.botStars433[r.bot433]=Math.max(past,stars);}this.save();return r.result;};
// loot panel: resident bases pay Ore Y / Ore G only
var loot433=lootInfo403;lootInfo403=function(){var i=loot433.apply(this,arguments),r=E.raid;if(i&&botRaid433(r)){i.nova=0;i.why='';if(r.liveMode!=='preview'){var o=storageLoot299(r),k=(((E.d.botStars433||{})[r.bot433]||0)>=3?.3:1)*LOOT433;i.gold=Math.max(0,Math.floor((o.total.gold-o.taken.gold)*k));i.power=Math.max(0,Math.floor((o.total.power-o.taken.power)*k));}}return i;};
// name, trophies and clan on the scout screen
var hud433=hud;hud=function(){var out=hud433.apply(this,arguments);try{var r=E.raid;if(screen==='raid'&&botRaid433(r)){var bot=bots433()[r.bot433],tag=$('botTag433');
  if(!tag){tag=document.createElement('div');tag.id='botTag433';$('field').appendChild(tag);}var html='<b>'+escapeHTML(bot.name)+'</b><small>🏆 '+bot.trophies.toLocaleString()+' · '+mt251('ศูนย์บัญชาการ ','CC ')+bot.hq+(bot.clan?' · 🛡 '+escapeHTML(bot.clan):'')+'</small><em>'+mt251.apply(null,styleName433(bot.style))+'</em>';if(tag.innerHTML!==html)tag.innerHTML=html;tag.hidden=!!r.result||r.liveMode!=='preview';}
 else{var t=$('botTag433');if(t)t.hidden=true;}}catch(e){}return out;};
(function(){var st=document.createElement('style');st.id='players433';st.textContent=
 '#botTag433{position:absolute;right:10px;top:8px;z-index:6;display:flex;flex-direction:column;align-items:flex-end;gap:1px;padding:4px 10px;border-radius:12px;opacity:.95;background:linear-gradient(#fff8e6,#ffe0a8);border:2px solid #f2b44a;color:#5a3a0c;box-shadow:0 3px 0 #d8962e;pointer-events:none;max-width:60vw}'+
 '#botTag433 b{font-size:14px}#botTag433 small{font-size:10.5px}#botTag433 em{font-style:normal;font-size:10px;opacity:.75}'+
 'body.phone394 #botTag433{top:150px}'+
 '.search433{text-align:center}.search433 p{opacity:.8}.clouds433{position:relative;height:70px;overflow:hidden}.clouds433 i{position:absolute;top:18px;width:90px;height:34px;border-radius:30px;background:#e8f4ff;box-shadow:30px -12px 0 6px #e8f4ff,-26px -6px 0 2px #e8f4ff;animation:cl433 1.1s linear infinite}'+
 '.clouds433 i:nth-child(2){top:40px;animation-delay:-.4s;opacity:.8}.clouds433 i:nth-child(3){top:6px;animation-delay:-.8s;opacity:.6}@keyframes cl433{from{left:110%}to{left:-40%}}';
 document.head.appendChild(st);})();
