// Device-local desktop-style windows and edge-docking HUD (354).
(function(){
 var key='novaWindowLayout353',saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch(e){}
 var nodes=new Map(),pending=false,activeDrag=null;
 // Discard only obsolete HUD positions; retain each menu window's saved location.
 Object.keys(saved).forEach(function(id){if(id.indexOf('hud:')===0)delete saved[id];});
 var css=document.createElement('style');css.textContent=`
 /* 355: fixed gameplay HUD; only opened windows can move. */
 html,body{width:100%;height:100%;margin:0;padding:0;overflow:hidden}
 #app{position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;max-width:none!important;margin:0!important;padding:0!important}
 #app #field,#app[data-battle300="true"] #field,#app:not([data-battle300="true"]) #field{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;margin:0!important;padding:0!important}
 #app #world{display:block!important;width:100%!important;height:100%!important;margin:0!important}
 #app>header{position:absolute!important;top:0!important;left:0!important;right:0!important;background:transparent!important;box-shadow:none!important;border:0!important;pointer-events:none}
 #app>header button,#app>header .resources{pointer-events:auto}
 #moveControls{position:fixed!important;left:auto!important;right:calc(12px + var(--safe-right303,env(safe-area-inset-right,0px)))!important;top:50%!important;bottom:auto!important;transform:translateY(-50%)!important;grid-template-columns:52px 52px!important;gap:8px!important;padding:8px 10px;background:#092a40ee;border:1px solid #5599b7;border-radius:12px;z-index:8}
 #moveControls[hidden]{display:none!important}#moveControls button{width:52px;height:44px}#moveStatus{grid-column:1/-1!important;max-width:none!important;white-space:nowrap!important}
 body button.dockGrip353,#modal button.dockGrip353{position:sticky!important;top:0!important;left:0!important;right:auto!important;bottom:auto!important;display:block!important;width:100%!important;min-width:0!important;max-width:none!important;height:40px!important;min-height:40px!important;flex:none!important;padding:4px 12px!important;margin:0 0 6px!important;border:1px solid #457b97!important;border-radius:9px!important;background:linear-gradient(#205573,#11374f)!important;box-shadow:inset 0 1px #c1f4ff22!important;color:#d9f6ff!important;font:12px/24px Tahoma,sans-serif!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;text-align:left!important;letter-spacing:0!important;text-shadow:none!important;touch-action:none!important;user-select:none!important;pointer-events:auto!important;cursor:grab!important;z-index:12!important;transform:none!important}
 body .dockGrip353:focus-visible{outline:2px solid #ffe188!important}body .dockGrip353.held353{background:#1b819f!important;cursor:grabbing!important;color:white!important}
 body .dockWindow354{position:relative;overflow:auto}
 #modal .sheet.dockReady353{padding-top:8px!important}#modal .sheet.dockReady353 .window-nav243{top:40px!important}#modal .sheet.dockReady353 h2{touch-action:none;cursor:grab;user-select:none}
 body .dockWindow354.dockMoved353,#modal .sheet.dockMoved353{position:fixed!important;left:var(--dock-x353)!important;top:var(--dock-y353)!important;right:auto!important;bottom:auto!important;transform:none!important;margin:0!important;width:var(--dock-w353)!important;max-width:calc(100vw - 16px)!important;max-height:calc(100dvh - 16px)!important;box-sizing:border-box!important;min-width:0!important}

 #modal .guardianCost345{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;font-size:clamp(11px,1.2vw,16px)}#modal .guardianCost345 span{min-width:0;display:flex;flex-direction:column;align-items:center;overflow-wrap:anywhere}
 /* Scroll menu bodies with one finger; only their heading is a drag handle. */
 #modal .sheet{overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior-y:contain;touch-action:pan-y;-webkit-overflow-scrolling:touch;scroll-padding-top:90px}
 #modal .sheet section,#modal .sheet .actions345,#modal .sheet .pay357,#modal .sheet .action345,#modal .sheet .pay357 button{touch-action:pan-y}
 #modal .titanShop342{width:100%;min-width:0;max-width:100%;box-sizing:border-box}
 #modal .actions345{display:flex;gap:8px;flex-wrap:wrap;min-width:0}
 #modal .actions345 .action345{min-width:0!important;max-width:100%;flex:1 1 88px;padding:8px 6px!important;box-sizing:border-box;overflow:hidden}
 #modal .action345 b{display:block;max-width:100%;white-space:normal!important;overflow-wrap:anywhere;font-size:clamp(11px,1.1vw,15px)!important;line-height:1.3}
 #modal .sheet button:not(.dockGrip353){touch-action:pan-y!important}
 #modal .action345 .art345,#modal .pay357 .art345{width:60px;height:60px;max-width:100%;flex:none}
 #modal .pay357{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:12px 0}
 #modal .pay357 button{min-width:0;padding:10px 6px;box-sizing:border-box;overflow:hidden;display:flex;flex-direction:column;align-items:center;gap:5px}
 #modal .pay357 b{font-size:clamp(14px,1.7vw,21px);line-height:1.2;max-width:100%;overflow-wrap:anywhere}
 #modal .pay357 small{font-size:12px;line-height:1.3;white-space:normal}
 #modal .pay357 .enough357{background:#178248!important;color:#fff!important;border-color:#73df9a!important}
 #modal .pay357 .short357,#modal .pay357 .short357:disabled{background:#080b10!important;color:#ddd!important;border-color:#394552!important;opacity:1!important}
 @media(orientation:landscape){#modal #titanPreview342{height:120px!important}}
`;document.head.appendChild(css);
 function persist(){try{localStorage.setItem(key,JSON.stringify(saved));}catch(e){}}
 function visible(el){return el.isConnected&&!el.hidden&&el.getClientRects().length&&getComputedStyle(el).display!=='none';}
 function bounds(){return {w:document.documentElement.clientWidth||innerWidth,h:document.documentElement.clientHeight||innerHeight};}
 function place(el,x,y,w){var v=bounds();w=Math.max(44,Math.min(w,v.w-16));el.style.setProperty('--dock-w353',w+'px');el.classList.add('dockMoved353');var r=el.getBoundingClientRect();x=Math.max(8,Math.min(v.w-w-8,x));y=Math.max(8,Math.min(v.h-Math.min(r.height,v.h-16)-8,y));el.style.setProperty('--dock-x353',x+'px');el.style.setProperty('--dock-y353',y+'px');return {x:x,y:y,w:w,h:r.height};}
 function restore(el,id){if(!visible(el)||activeDrag&&activeDrag.el===el)return;var p=saved[id];if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)||!Number.isFinite(p.w))return;var v=bounds(),w=Math.min(p.w,v.w-16);place(el,p.x*Math.max(0,v.w-w-16)+8,p.y*Math.max(0,v.h-el.getBoundingClientRect().height-16)+8,w);}
 function save(el,id){var r=el.getBoundingClientRect(),v=bounds();saved[id]={x:Math.max(0,(r.x-8)/Math.max(1,v.w-r.width-16)),y:Math.max(0,(r.y-8)/Math.max(1,v.h-r.height-16)),w:r.width};persist();}
 function stop(e,cancel){if(!activeDrag)return;var d=activeDrag;if(e&&e.pointerId!==undefined&&d.pid!==e.pointerId)return;activeDrag=null;d.grip.classList.remove('held353');if(d.moved&&!cancel)save(d.el,d.id);else if(d.moved){if(d.before){saved[d.id]=d.before;restore(d.el,d.id);}else d.el.classList.remove('dockMoved353');}try{d.grip.releasePointerCapture(d.pid);}catch(e){} }
 function bind(handle,el,id){if(handle.__drag354)return;handle.__drag354=true;handle.style.touchAction='none';
 handle.addEventListener('pointerdown',function(e){if(e.button!==0||activeDrag||e.target.closest('input,select,textarea,a')||e.target.closest('button')&&e.target.closest('button')!==handle)return;e.preventDefault();e.stopPropagation();var r=el.getBoundingClientRect();activeDrag={el:el,id:id,grip:handle,pid:e.pointerId,sx:e.clientX,sy:e.clientY,lastX:e.clientX,lastY:e.clientY,x:r.x,y:r.y,w:r.width,before:saved[id]?Object.assign({},saved[id]):null,moved:false,edge:null};try{handle.setPointerCapture(e.pointerId);}catch(e){} });
 handle.addEventListener('pointermove',function(e){var d=activeDrag;if(!d||d.grip!==handle||d.pid!==e.pointerId)return;e.preventDefault();e.stopPropagation();if(!d.moved&&Math.hypot(e.clientX-d.sx,e.clientY-d.sy)<3)return;d.moved=true;handle.classList.add('held353');d.lastX=e.clientX;d.lastY=e.clientY;place(el,d.x+e.clientX-d.sx,d.y+e.clientY-d.sy,d.w);});
 handle.addEventListener('pointerup',function(e){e.preventDefault();e.stopPropagation();stop(e,false);});handle.addEventListener('pointercancel',function(e){stop(e,true);});handle.addEventListener('lostpointercapture',function(e){stop(e,true);});handle.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();});handle.addEventListener('contextmenu',function(e){e.preventDefault();});
 handle.addEventListener('keydown',function(e){var moves={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]},m=moves[e.key];if(!m)return;e.preventDefault();e.stopPropagation();var r=el.getBoundingClientRect();el.removeAttribute('data-dock-edge354');place(el,r.x+m[0],r.y+m[1],r.width);save(el,id,null);});
 }
 function attach(el,id,label){if(!el)return;nodes.set(id,el);el.classList.add('dockReady353','dockWindow354');if(!el.__grip353||!el.contains(el.__grip353)){var grip=document.createElement('button');grip.type='button';grip.className='dockGrip353';grip.textContent='⠿ '+(label||mt251('ลากย้าย','Drag'));grip.title=mt251('ลากหัวหน้าต่างเพื่อย้าย','Drag the title to move');grip.setAttribute('aria-label',grip.title+' '+(label||''));el.prepend(grip);el.__grip353=grip;bind(grip,el,id);var title=el.querySelector('h2,h3'),nav=el.querySelector('.window-nav243');if(title)bind(title,el,id);if(nav)bind(nav,el,id);}
 var p=saved[id],signature=JSON.stringify(p||{})+'|'+bounds().w+'|'+bounds().h+'|'+!!visible(el);if(el.__layout354!==signature&&!activeDrag){el.__layout354=signature;restore(el,id);}}
 function scan(){pending=false;for(var entry of nodes)if(!entry[1].isConnected)nodes.delete(entry[0]);var sheet=modal.querySelector('.sheet');if(sheet&&!sheet.classList.contains('novaWindow360')){var title=sheet.querySelector('h2,h3');var name=(title?title.textContent:'menu').replace(/[\d,]+/g,'').trim().slice(0,80);attach(sheet,'window:'+name,name);}
 [['#baseNameGate .name-card','name'],['#welcome .welcome-panel','login'],['#nova-admin293>div','admin']].forEach(function(row){var el=document.querySelector(row[0]);if(el){var title=el.querySelector('h2');attach(el,'window:'+row[1],title?title.textContent:mt251('หน้าต่าง','Window'));}});
 }
 function schedule(){if(pending)return;pending=true;requestAnimationFrame(scan);}
 var observer=new MutationObserver(schedule);observer.observe(modal,{childList:true});observer.observe(document.body,{childList:true});
 var previousOpen=open;open=function(){var out=previousOpen.apply(this,arguments);schedule();return out;};var previousHUD=hud;hud=function(){var out=previousHUD.apply(this,arguments);schedule();return out;};
 root.addEventListener('resize',function(){stop(null,true);schedule();});root.addEventListener('blur',function(){stop(null,true);});
 Game.resetLayout353=function(){stop(null,true);saved={};persist();nodes.forEach(function(el){el.classList.remove('dockMoved353');el.removeAttribute('data-dock-axis354');el.removeAttribute('data-dock-edge354');el.__layout354=null;el.__default354=false;['--dock-x353','--dock-y353','--dock-w353'].forEach(function(k){el.style.removeProperty(k);});});schedule();toast(mt251('คืนตำแหน่งเมนูเดิมแล้ว','Window positions reset'));};
 var settings353=Game.settings;Game.settings=function(){settings353.apply(this,arguments);var sheet=modal.querySelector('.sheet');if(sheet&&!sheet.querySelector('[data-reset353]')){var b=document.createElement('button');b.className='wide';b.dataset.reset353='1';b.textContent=mt251('คืนตำแหน่งหน้าต่างเมนูเดิม','Reset menu window positions');b.onclick=Game.resetLayout353;sheet.appendChild(b);}schedule();};
 persist();scan();
})();

