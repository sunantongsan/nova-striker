// One title bar and scroll body. All existing gameplay handlers remain connected.
(function(){
 var style=document.createElement('style');style.id='novaWindowSkin360';style.textContent=windowCSS360;document.head.appendChild(style);
 var normalizing=false,pending=false,drag=null;
 function normalize(){pending=false;if(normalizing)return;var sheet=modal.querySelector('.sheet');if(!sheet)return;normalizing=true;
 try{
  modal.setAttribute('data-nova360','true');sheet.classList.remove('dockMoved353','dockReady353','dockWindow354');
  sheet.querySelectorAll('.dockGrip353').forEach(function(n){n.remove();});
  if(!sheet.classList.contains('novaWindow360')){
   sheet.classList.add('novaWindow360');var oldnav=sheet.querySelector('.window-nav243'),back=oldnav&&Array.from(oldnav.querySelectorAll('button')).find(function(b){return !b.classList.contains('window-close243');}),title=sheet.querySelector('h2,h3');
   var head=document.createElement('header');head.className='novaHead360';
   if(back){back.textContent='‹';back.setAttribute('aria-label',mt251('กลับ','Back'));head.appendChild(back);}
   var label=document.createElement('h2');label.textContent=title?title.textContent:mt251('NOVA','NOVA');head.appendChild(label);if(title)title.remove();if(oldnav)oldnav.remove();
   var close=document.createElement('button');close.className='window-close243';close.textContent='×';close.setAttribute('aria-label',mt251('ปิด','Close'));close.onclick=function(){Game.dismissWindow243();};head.appendChild(close);
   var body=document.createElement('div');body.className='novaContent360';while(sheet.firstChild)body.appendChild(sheet.firstChild);sheet.appendChild(head);sheet.appendChild(body);
   head.addEventListener('pointerdown',function(e){if(e.target.closest('button')||e.button>0)return;var r=sheet.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:r.left,top:r.top};head.setPointerCapture(e.pointerId);e.preventDefault();});
   head.addEventListener('pointermove',function(e){if(!drag||drag.id!==e.pointerId)return;var r=sheet.getBoundingClientRect();sheet.style.setProperty('--nova-x360',Math.max(6,Math.min(innerWidth-r.width-6,drag.left+e.clientX-drag.x))+'px');sheet.style.setProperty('--nova-y360',Math.max(6,Math.min(innerHeight-r.height-6,drag.top+e.clientY-drag.y))+'px');sheet.classList.add('novaMoved360');});
   ['pointerup','pointercancel','lostpointercapture'].forEach(function(type){head.addEventListener(type,function(){drag=null;});});
  }
  var head=sheet.querySelector('.novaHead360'),body=sheet.querySelector('.novaContent360');
  if(head&&body)Array.from(sheet.children).forEach(function(n){if(n!==head&&n!==body)body.appendChild(n);});
  // Legacy wrappers occasionally insert buttons after the title; return them to the body.
  if(head&&body)Array.from(head.children).forEach(function(n){if(n.tagName==='H2'||n.classList.contains('window-close243')||n.getAttribute('aria-label')===mt251('กลับ','Back'))return;body.prepend(n);});
 }finally{normalizing=false;}}
 function schedule(){if(!pending){pending=true;requestAnimationFrame(normalize);}}
 var previousOpen360=open;open=function(){var out=previousOpen360.apply(this,arguments);normalize();return out;};
 new MutationObserver(function(){if(!normalizing)schedule();}).observe(modal,{childList:true,subtree:true});
 root.addEventListener('resize',function(){var sheet=modal.querySelector('.sheet');if(sheet)sheet.classList.remove('novaMoved360');drag=null;});
 normalize();
})();
var armyPrevious360=Game.army278,refreshPrevious360=refreshArmy278,novaArmyView360='train';
function armyTabs360(active){return '<div class="novaTabs360">'+[['train',mt251('ผลิต','Train')],['formation',mt251('จัดทัพ','Formation')],['queue',mt251('กำลังผลิต','Queue')]].map(function(a){return '<button aria-pressed="'+(active===a[0])+'" onclick="Game.armyView360(\''+a[0]+'\')">'+a[1]+'</button>';}).join('')+'</div>';}
Game.armyView360=function(view){novaArmyView360=view;if(view==='queue')Game.production359('all');else Game.army278();};
Game.army278=function(tab){if(logisticsBusy277(E)){toast(tr('จบการรบก่อนจัดทัพ'));return;}if(tab)armyTab278=tab;E.sync();
 if(novaArmyView360==='formation'){armyPrevious360.apply(this,arguments);var hub=$('armyHub278');if(hub){var entry=$('productionEntry359');if(entry)entry.remove();hub.insertAdjacentHTML('afterbegin',armyTabs360('formation'));}return;}
 novaArmyView360='train';armyOpen278=true;var filter=armyTab278||'all',html='<section class="novaArmy360" id="armyHub278"><h2>'+mt251('กองทัพ','Army')+'</h2>'+armyTabs360('train')+'<div class="novaFilter360">';
 [['all',mt251('ทั้งหมด','All')],['camp',mt251('ทหาร','Infantry')],['factory',mt251('ยานเกราะ','Vehicles')],['airbase',mt251('อากาศยาน','Aircraft')]].forEach(function(a){html+='<button aria-pressed="'+(filter===a[0])+'" onclick="Game.army278(\''+a[0]+'\')">'+a[1]+'</button>';});
 html+='</div><div class="novaCapacity360"><span>'+mt251('แตะ + เพื่อผลิต','Tap + to train')+'</span><b id="novaCapacity360"></b></div><div class="novaTroops360">';
 U.forEach(function(u,i){if(filter!=='all'&&branch278(i)!==filter)return;var lock=E.unitLock278(i);html+='<article class="novaTroop360 '+(lock?'novaLocked360':'')+'"><strong>'+u.name+'</strong><div class="novaPortrait360">'+portrait278(i)+'</div><button class="novaInfo360" onclick="Game.unitInfo278('+i+')" aria-label="'+mt251('ข้อมูล ','Info ')+u.name+'">i</button><span class="novaCount360" id="novaCount360_'+i+'">×'+(E.d.army[i]||0)+'</span><div class="novaCost360"><span>⚡ '+u.cost.toLocaleString()+'</span><span>◷ '+u.time+'s</span></div><div class="novaMiniTimer360" id="novaTimer360_'+i+'" hidden></div><button class="green novaTrain360" id="novaTrain360_'+i+'" onclick="Game.trainCard360('+i+')" '+(lock||E.d.power<u.cost?'disabled':'')+'>＋ '+mt251('ผลิต','Train')+'</button></article>';});
 open(html+'</div></section>');modal.removeAttribute('data-compact302');refreshArmy278();};
Game.trainCard360=function(i){var error=E.train278(i);if(error)toast(error);else voice277(i,0);refreshArmy278();hud();};
refreshArmy278=function(){var hub=$('armyHub278');if(!hub||!hub.classList.contains('novaArmy360'))return refreshPrevious360();var used=0,cap=0;['camp','factory','airbase'].forEach(function(k){used+=E.used278(k);cap+=E.capacity278(k);});var capacity=$('novaCapacity360');if(capacity)capacity.textContent=used+' / '+cap;
 U.forEach(function(u,i){var timer=$('novaTimer360_'+i),count=$('novaCount360_'+i),button=$('novaTrain360_'+i);if(count)count.textContent='×'+(E.d.army[i]||0);if(button)button.disabled=!!E.unitLock278(i)||E.d.power<u.cost;if(!timer)return;var jobs=E.d.queue.filter(function(q){return q.kind===i;}),left=jobs.length?Math.max(0,Math.ceil((Math.min(...jobs.map(function(q){return q.until;}))-E.now())/1000)):0;timer.hidden=!jobs.length;timer.classList.toggle('running360',!!jobs.length);if(jobs.length)timer.innerHTML='<span>◷ '+jobs.length+'</span><b>'+clock359(left)+'</b>';});};
var queuePrevious360=Game.production359;
Game.production359=function(){queuePrevious360.apply(this,arguments);var section=modal.querySelector('.production359');if(section)section.insertAdjacentHTML('afterbegin',armyTabs360('queue'));};
