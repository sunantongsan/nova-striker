// 394: Clash of Clans-style first-play tutorial and phone-first menus.
// One short instruction at a time, a spotlight + pointing hand on the single thing to tap,
// and the step advances by itself when the player does it. Replaces the 288/337/373 guide
// cards; progress is stored additively in save.coach394 = {step, done}.
(function(){function attach(){var old=document.getElementById('novaCoach394');if(old)old.remove();var st=document.createElement('style');st.id='novaCoach394';st.textContent=coach394CSS;document.head.appendChild(st);}attach();setTimeout(attach,0);setTimeout(attach,120);})();
var coach394=null,coachEl394=null,coachKey394='',coachScrolled394=null,coachSince394=0,coachFlags394={};
function coachState394(){if(!E.d.coach394||typeof E.d.coach394!=='object')E.d.coach394={step:0,done:false};return E.d.coach394;}
function coachQ394(sel){try{return sel&&document.querySelector(sel);}catch(e){return null;}}
function coachVisible394(el){if(!el||!el.getBoundingClientRect)return false;var r=el.getBoundingClientRect();return r.width>2&&r.height>2&&r.bottom>0&&r.right>0&&r.top<innerHeight&&r.left<innerWidth;}
function coachModalOpen394(){return modal.style.display==='flex';}
function coachIds394(){return E.d.buildings.map(function(b){return b.id;});}
function coachNewBuilding394(type){var ids=coachFlags394.ids||[];return E.d.buildings.find(function(b){return b.type===type&&ids.indexOf(b.id)<0;});}
function coachCanBuild394(type){var b=B[type];if(!b)return false;var n=E.d.buildings.filter(function(x){return x.type===type;}).length;return E.hq()>=(b.require||1)&&n<E.buildCap(type);}
// A window the step does not need: point at its close button (or a "continue" button).
function coachCloseTarget394(){return coachQ394('#modal .window-close243')||coachQ394('#modal button[onclick="Game.close()"]')||coachQ394('#modal button');}
// The building steps share one flow: Build button -> building's Build button -> tap the ground.
function coachBuildStep394(type,th,en){
 return function(){
  if(coachNewBuilding394(type))return {done:true};
  if(!coachCanBuild394(type))return {done:true};
  var name=type==='mine'?mt251('เหมืองทอง','Gold Mine'):B[type].name;
  if(placing===type)return {text:mt251('แตะพื้นที่สีเขียวเพื่อวาง'+name,'Tap the green ground to place the '+name),target:'#world',world:true};
  var btn='#modal button[onclick="Game.place(\''+type+'\')"]',b=coachQ394(btn);
  if(coachModalOpen394()&&b){if(b.disabled)return {done:true};return {text:mt251('แตะ “สร้าง” ที่'+name,'Tap “Build” on the '+name),target:btn,scroll:true};}
  if(coachModalOpen394()&&coachQ394('#modal .shop-grid261'))return {text:mt251('แตะแท็บ “ทั้งหมด”','Tap the “All” tab'),target:'#modal .shop-tabs261 button'};
  if(coachModalOpen394())return {text:mt251('ปิดหน้าต่างนี้ก่อน','Close this window first'),target:coachCloseTarget394()};
  return {text:mt251(th,en),target:'#homebar .rail-build338'};
 };
}
var coachSteps394=[
 // 0 Hello
 function(){return {text:mt251('สวัสดีผู้บัญชาการ! ผมคือโดรน NOVA เดี๋ยวพาสร้างฐานทีละขั้นนะ','Hello Commander! I am your NOVA drone. Let us build your base together.'),button:mt251('ไปกันเลย!','Let’s go!'),next:true,center:true};},
 // 1 Base name
 function(){
  if(guideNamed288())return {done:true};
  if($('baseNameGate')&&!$('baseNameGate').hidden)return {hidden:true};
  return {text:mt251('ก่อนอื่น ตั้งชื่อฐานของคุณ','First, name your base'),button:mt251('ตั้งชื่อฐาน','Name my base'),action:function(){Game.guideName337();},center:true};
 },
 // 2 Gold mine
 coachBuildStep394('mine','แตะ “สร้าง” เพื่อสร้างเหมืองทอง','Tap “Build” to build a Gold Mine'),
 // 3 Resources (one look at the top bar)
 function(){return {text:mt251('ทองและพลังงานไหลเข้าคลังเอง ดูยอดได้ที่มุมขวาบน','Gold and energy flow in by themselves. Check them at the top right.'),target:'header .resources',button:mt251('เข้าใจแล้ว','Got it'),next:true,soft:true};},
 // 4 Train a Ranger
 function(){
  if(coachFlags394.trained)return {done:true};
  if(E.unitLock278&&E.unitLock278(0))return {done:true};
  var b=coachQ394('#novaTrain360_0');
  if(coachModalOpen394()&&b&&!b.disabled)return {text:mt251('แตะ “+ ผลิต” ที่เรนเจอร์','Tap “+ Train” on the Ranger'),target:'#novaTrain360_0',scroll:true};
  if(coachModalOpen394()&&coachQ394('#armyHub278'))return {text:mt251('แตะแท็บ “ผลิต”','Tap the “Train” tab'),target:'#armyHub278 .novaTabs360 button'};
  if(coachModalOpen394())return {text:mt251('ปิดหน้าต่างนี้ก่อน','Close this window first'),target:coachCloseTarget394()};
  return {text:mt251('ฝึกทหาร! แตะ “กองทัพ”','Train troops! Tap “Army”'),target:'#homebar .rail-army338'};
 },
 // 5 First attack: campaign stage 1
 function(){
  var r=E.raid;
  if(screen==='raid'&&r&&!r.liveMode){
   coachFlags394.inBattle=true;
   if(r.result||coachModalOpen394()){var go=coachQ394('#modal button.green')||coachQ394('#modal button[onclick*="home"]')||coachQ394('#modal button');return {text:mt251('จบการรบ! แตะเพื่อกลับฐาน','Battle over! Tap to go home'),target:go?null:null,tapTarget:go};}
   var alive=(r.troops||[]).some(function(t){return t.hp>0&&!t.titan342;});
   var deployed=(r.troops||[]).length>0;
   if(deployed&&alive)return {text:mt251('ทหารบุกเองอัตโนมัติ! แตะพื้นหญ้าเพื่อปล่อยเพิ่มได้','Troops attack on their own! Tap the grass to send more.'),top:true,soft:true};
   if(deployed&&!alive)return {text:mt251('ทหารหมดแล้ว จบการรบได้เลย','Out of troops. End the battle'),button:mt251('จบการรบ','End battle'),action:function(){Game.retreat();},top:true,soft:true};
   return {text:mt251('แตะพื้นหญ้ารอบฐานศัตรู เพื่อปล่อยทหาร (แตะหลายครั้งได้)','Tap the grass around the enemy base to drop troops (tap many times)'),target:'#world',world:true,top:true};
  }
  if(coachFlags394.inBattle&&screen==='home'){coachFlags394.inBattle=false;return {done:true};}
  if(screen!=='home')return {hidden:true};
  var stage=coachQ394('#modal button[onclick="Game.scout(1)"]');
  if(coachModalOpen394()&&stage)return {text:mt251('แตะ “ด่าน 1”','Tap “Stage 1”'),target:'#modal button[onclick="Game.scout(1)"]',scroll:true};
  if(coachModalOpen394())return {text:mt251('ปิดหน้าต่างนี้ก่อน','Close this window first'),target:coachCloseTarget394()};
  return {text:mt251('ได้เวลาบุก! แตะ “บุกด่าน”','Time to attack! Tap “Campaign”'),target:'#homebar #botAttack376'};
 },
 // 6 Defense: a cannon
 coachBuildStep394('gun','ป้องกันฐาน! แตะ “สร้าง” เพื่อสร้างป้อมป้องกัน','Defend your base! Tap “Build” to add a turret'),
 // 7 Done
 function(){return {text:mt251('เยี่ยมมาก! อัปเกรดศูนย์บัญชาการเพื่อปลดล็อกอาคารใหม่ แล้วบุกด่านต่อไปเรื่อยๆ','Great job! Upgrade your HQ to unlock new buildings, and keep attacking stages.'),button:mt251('เริ่มเล่น!','Start playing!'),next:true,center:true};}
];
function coachEnsure394(){
 if(coachEl394)return coachEl394;
 var el=document.createElement('div');el.id='coach394';el.hidden=true;
 el.innerHTML='<div class="c394-dim c394-t"></div><div class="c394-dim c394-l"></div><div class="c394-dim c394-r"></div><div class="c394-dim c394-b"></div><div class="c394-ring"></div><div class="c394-hand" aria-hidden="true">👆</div><div class="c394-bubble" role="status" aria-live="polite"><i class="c394-drone" aria-hidden="true"></i><div class="c394-copy"><small></small><p></p><div class="c394-actions"></div></div><button class="c394-skip" type="button"></button></div>';
 document.body.appendChild(el);coachEl394=el;
 el.querySelector('.c394-skip').onclick=function(){Game.coachSkip394();};
 // Taps on the dim area: in CoC the screen is locked to the highlighted control. Give a nudge instead.
 Array.prototype.forEach.call(el.querySelectorAll('.c394-dim'),function(d){d.addEventListener('click',function(e){e.stopPropagation();el.classList.remove('c394-nudge');void el.offsetWidth;el.classList.add('c394-nudge');});});
 return el;
}
function coachHide394(){if(coachEl394)coachEl394.hidden=true;}
function coachAdvance394(){var s=coachState394();s.step++;coachFlags394={ids:coachIds394()};coachKey394='';coachScrolled394=null;coachSince394=Date.now();if(s.step>=coachSteps394.length){coachFinish394(true);return;}E.save();}
function coachFinish394(completed){var s=coachState394();s.done=true;delete s.replay;s.step=coachSteps394.length;coach394=null;coachHide394();
 // CoC keeps teaching in small doses afterwards: turn on the 390 milestone tips for new players.
 try{var t=tipState390();if(completed){t.enabledByPlayer=true;t.off=false;}}catch(e){}
 E.save();hud();}
Game.coachSkip394=function(){
 var s=coachState394();if(!coach394)return;
 var el=coachEnsure394(),p=el.querySelector('.c394-copy p'),a=el.querySelector('.c394-actions');
 coachKey394='confirm';el.dataset.confirm='1';
 p.textContent=mt251('ข้ามการสอน? เปิดสอนใหม่ได้ที่ ตั้งค่า','Skip the tutorial? You can replay it in Settings.');
 a.innerHTML='';
 var yes=document.createElement('button');yes.className='c394-go';yes.textContent=mt251('ข้าม','Skip');yes.onclick=function(){delete el.dataset.confirm;coachFinish394(false);};
 var no=document.createElement('button');no.className='c394-alt';no.textContent=mt251('เล่นต่อ','Continue');no.onclick=function(){delete el.dataset.confirm;coachKey394='';coachTick394();};
 a.appendChild(no);a.appendChild(yes);
};
Game.coachStart394=function(){coachData394=E.d;var s=coachState394();s.step=0;s.done=false;s.replay=true;coach394={};coachFlags394={ids:coachIds394()};coachKey394='';E.save();close();coachTick394();};
var coachData394=null;
function coachShouldRun394(){
 // A different save (guest/account switch, cloud restore) restarts the decision.
 if(coachData394!==E.d){coachData394=E.d;coach394=null;coachFlags394={};coachKey394='';}
 var s=coachState394();if(s.done)return false;
 // New players only. Bases already developed, or that finished/skipped the old guide, are left alone
 // (unless the player asked for the tutorial from Settings).
 var old=E.d.onboarding288||{},oldDone=Object.keys(old).some(function(k){return old[k]&&old[k].done;});
 if(!s.step&&!s.replay&&(E.hq()>1||oldDone)){s.done=true;coach394=null;E.save();return false;}
 if(!coach394){coach394={};if(!coachFlags394.ids)coachFlags394={ids:coachIds394()};}
 return true;
}
function coachPlace394(el,info){
 var bubble=el.querySelector('.c394-bubble'),ring=el.querySelector('.c394-ring'),hand=el.querySelector('.c394-hand');
 var dims=['t','l','r','b'].map(function(k){return el.querySelector('.c394-'+k);});
 var target=info.tapTarget||(typeof info.target==='string'?coachQ394(info.target):info.target);
 if(target&&!coachVisible394(target)&&info.scroll&&coachScrolled394!==target&&target.scrollIntoView){coachScrolled394=target;target.scrollIntoView({block:'center',inline:'nearest'});}
 var r=target&&coachVisible394(target)?target.getBoundingClientRect():null;
 var W=innerWidth,H=innerHeight,lock=!!r&&!info.world&&!info.soft;
 el.classList.toggle('c394-lock',lock);el.classList.toggle('c394-light',!lock);
 if(r&&!info.world){
  var pad=6,x=Math.max(0,r.left-pad),y=Math.max(0,r.top-pad),x2=Math.min(W,r.right+pad),y2=Math.min(H,r.bottom+pad);
  dims[0].style.cssText='left:0;top:0;width:'+W+'px;height:'+y+'px';
  dims[1].style.cssText='left:0;top:'+y+'px;width:'+x+'px;height:'+(y2-y)+'px';
  dims[2].style.cssText='left:'+x2+'px;top:'+y+'px;width:'+(W-x2)+'px;height:'+(y2-y)+'px';
  dims[3].style.cssText='left:0;top:'+y2+'px;width:'+W+'px;height:'+(H-y2)+'px';
  ring.hidden=false;ring.style.cssText='left:'+x+'px;top:'+y+'px;width:'+(x2-x)+'px;height:'+(y2-y)+'px';
 }else{dims.forEach(function(d){d.style.cssText='display:none';});ring.hidden=true;}
 // Pointing hand: below the target pointing up, or above it pointing down when near the bottom.
 var hx,hy,down=false;
 if(info.world){var c=$('world').getBoundingClientRect();hx=c.left+c.width*.5;hy=c.top+c.height*(info.top?.62:.55);}
 else if(r){hx=r.left+r.width/2;down=r.bottom+70>H;hy=down?r.top-6:r.bottom+4;}
 if(hx!==undefined){hand.hidden=false;hand.classList.toggle('c394-down',down);hand.style.left=Math.max(4,Math.min(W-52,hx-22))+'px';hand.style.top=Math.max(4,Math.min(H-56,down?hy-52:hy))+'px';}else hand.hidden=true;
 // Speech bubble on the side of the screen away from the target.
 var bh=bubble.offsetHeight||110,top;
 if(info.center&&!r)top=Math.round(H*.36);
 else if(info.top)top=Math.max(8,(document.querySelector('header')||{}).offsetHeight+8||64);
 else if(r){var cy=(r.top+r.bottom)/2;top=cy>H*.5?Math.max(8,Math.min(r.top-bh-70,Math.round(H*.18))):Math.min(H-bh-12,Math.max(r.bottom+72,Math.round(H*.55)));}
 else top=Math.round(H*.36);
 bubble.style.top=Math.max(8,Math.min(H-bh-8,top))+'px';
}
function coachTick394(){
 try{
  if(!coachShouldRun394()){coachHide394();return;}
  if(!$('welcome').hidden||document.hidden){coachHide394();return;}
  var s=coachState394(),step=coachSteps394[s.step];
  if(!step){coachFinish394(true);return;}
  var info=step()||{};
  if(info.done){coachAdvance394();coachTick394();return;}
  var el=coachEnsure394();
  if(info.hidden){el.hidden=true;return;}
  el.hidden=false;
  if(el.dataset.confirm){coachPlace394(el,{center:true,soft:true});return;}
  var key=s.step+'|'+info.text+'|'+(info.button||'');
  if(key!==coachKey394){
   coachKey394=key;coachScrolled394=null;
   el.querySelector('.c394-copy small').textContent=mt251('ผู้ช่วย NOVA','NOVA GUIDE')+' • '+Math.min(s.step+1,coachSteps394.length)+'/'+coachSteps394.length;
   el.querySelector('.c394-copy p').textContent=info.text||'';
   var a=el.querySelector('.c394-actions');a.innerHTML='';
   if(info.button){var b=document.createElement('button');b.className='c394-go';b.textContent=info.button;b.onclick=function(){if(info.action)info.action();if(info.next)coachAdvance394();coachKey394='';coachTick394();};a.appendChild(b);}
   el.querySelector('.c394-skip').textContent=mt251('ข้าม','Skip');
   el.querySelector('.c394-bubble').classList.remove('c394-pop');void el.offsetWidth;el.querySelector('.c394-bubble').classList.add('c394-pop');
  }
  coachPlace394(el,info);
 }catch(e){coachHide394();}
}
// Replace the older guides so only one teacher talks at a time.
guideTick288=function(){guideAutoPending288=false;guide288=null;var dock=$('guideDock288');if(dock)dock.hidden=true;guideClearFocus288();guideFocusTarget337=null;};
guideHint337=function(){};
// Automatic calls (no argument) come from login/cloud events: ignore them; only an explicit request replays.
Game.beginGuide288=function(force){if(force===true)Game.coachStart394();};
Game.guideShow288=Game.droneGuide251=Game.guideAction288=Game.guideNext288=function(){};
Game.help=function(){Game.coachStart394();};
var coachTips394=tipTick390;tipTick390=function(){if(coach394||!coachState394().done){var d=$('tipDock390');if(d)d.hidden=true;return;}coachTips394();};
var coachTrain394=E.train278;E.train278=function(i){var error=coachTrain394.apply(this,arguments);if(!error&&coach394&&i===0)coachFlags394.trained=true;return error;};
var coachHud394=hud;hud=function(){coachHud394();coachTick394();};
setInterval(function(){if(coach394||!coachState394().done)coachTick394();},250);
addEventListener('resize',function(){coachKey394='';coachTick394();});
// Settings: one "replay tutorial" entry instead of four overlapping ones.
var coachSettings394=Game.settings;
Game.settings=function(){
 coachSettings394.apply(this,arguments);
 var sheet=modal.querySelector('.novaContent360')||modal.querySelector('.sheet');if(!sheet)return;
 Array.prototype.forEach.call(sheet.querySelectorAll('button[onclick="Game.help()"],button[onclick="Game.tipReplay390()"],.replayGuide373'),function(b){b.remove();});
 var first=sheet.querySelector('button[onclick="Game.tipToggle390()"]');
 var replay=document.createElement('button');replay.className='wide';replay.type='button';replay.textContent='🛸 '+mt251('สอนเล่นอีกครั้ง','Replay tutorial');replay.onclick=function(){Game.coachStart394();};
 if(first)first.before(replay);else sheet.appendChild(replay);
 sheet.classList.add('settings394');
};
// Clearer names on the bottom rail.
(function(){
 function label(sel,th,en){var b=coachQ394(sel),l=b&&b.querySelector('.railLabel373');if(l)l.textContent=mt251(th,en);if(b){b.title=mt251(th,en);b.setAttribute('aria-label',b.title);}}
 label('#homebar #botAttack376','บุกด่าน','Campaign');label('#homebar #playerSearch382','บุกผู้เล่น','Players');label('#homebar .rail-missions338','ภารกิจ','Missions');
 document.body.classList.add('phone394');
})();
setTimeout(coachTick394,1800);
// Ads work like other games: no in-game ad/age consent dialog. Google's own privacy-options form is
// offered only where the law requires it (NovaAds.privacyRequired, native 40+).
(function(){
 function required(){try{return !!(root.NovaAds&&root.NovaAds.privacyRequired&&root.NovaAds.privacyRequired());}catch(e){return false;}}
 function tidy(){if(!modal.querySelectorAll||required())return;Array.prototype.forEach.call(modal.querySelectorAll('button[onclick*="NovaAds.settings"],button[onclick*="adPrivacy248"]'),function(b){b.remove();});}
 if(root.MutationObserver)new MutationObserver(tidy).observe(modal,{childList:true,subtree:true});
 Game.adPrivacy248=function(){if(required())root.NovaAds.settings();};
})();

// Short, optional guidance inside the menu on its first visit.
(function(){
 var lessons=[
  {key:'training',section:'#armyHub278',target:'.novaTrain360:not(:disabled), .novaFilter360',
   th:'แตะ + เพื่อผลิตทหาร แล้วเปิดแท็บจัดทัพเพื่อเลือกกำลังที่จะพาไปรบ',
   en:'Tap + to train troops, then open Formation to prepare your army.'},
  {key:'formation',section:'#armyHub278',tab:'formation',target:'button[onclick="Game.autoFormation360()"]',
   th:'แตะ «จัดทัพให้» เพื่อเลือกทหารที่พร้อมรบ หรือกด + และ − เพื่อจัดเอง',
   en:'Tap Auto-fill to pick ready troops, or use + and − to choose them yourself.'},
  {key:'construction',section:'.shop-grid261',target:'.shop-tabs261',
   th:'เลือกหมวดอาคาร แล้วแตะสร้างเพื่อเลือกตำแหน่งบนฐาน',
   en:'Choose a building category, then tap Build to place it in your base.'},
  {key:'store',section:'.store348',target:'.storeTabs348',
   th:'แตะแท็บเพื่อเลือกดู NOVA สกิล หรือของเสริมฐาน',
   en:'Use the tabs to browse NOVA, skills, or base support.'}
 ];
 var card=null,highlight=null,active=null,save=null;
 function clear(){
  if(card)card.remove();
  if(highlight)highlight.classList.remove('menuCoachHighlight');
  card=highlight=active=null;
 }
 function refresh(){
  if(save!==E.d){clear();save=E.d;}
  if(!coachState394().done||!$('welcome').hidden||!coachModalOpen394()){clear();return;}
  var content=modal.querySelector('.novaContent360')||modal.querySelector('.sheet');
  if(!content){clear();return;}
  var formation=!!content.querySelector('.novaTabs360 [aria-pressed="true"][onclick*="formation"]');
  var lesson=lessons.find(function(item){
   return (item.key!=='training'||!formation)&&(item.tab!=='formation'||formation)&&content.querySelector(item.section);
  });
  if(!lesson||(save.menuGuide&&save.menuGuide[lesson.key])){clear();return;}
  if(active===lesson&&card&&card.parentNode===content)return;
  clear();active=lesson;
  highlight=content.querySelector(lesson.target);
  if(highlight)highlight.classList.add('menuCoachHighlight');
  card=document.createElement('aside');card.className='menuCoach';card.setAttribute('aria-label',mt251('ผู้ช่วย NOVA','NOVA Guide'));
  var text=document.createElement('span');text.textContent=mt251(lesson.th,lesson.en);
  var dismiss=document.createElement('button');dismiss.type='button';dismiss.textContent=mt251('เข้าใจแล้ว','Got it');
  dismiss.onclick=function(){
   if(save!==E.d)return;
   save.menuGuide=Object.assign({},save.menuGuide);
   save.menuGuide[lesson.key]=true;
   clear();E.save();
  };
  card.append(text,dismiss);content.prepend(card);
 }
 new MutationObserver(refresh).observe(modal,{childList:true,subtree:true});
 new MutationObserver(refresh).observe(modal,{attributes:true,attributeFilter:['style']});
})();
