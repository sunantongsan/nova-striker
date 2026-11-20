// 405: (1) Duck Coins speed-ups finish instantly. Online, the economy clock only advances to the last
// server-confirmed time (economyConfirmedAt), so a job set to finish "now" used to wait for the next
// server heartbeat before it completed. Jobs just finished by a Duck Coins payment are pinned to the
// confirmed time instead, so the very same sync completes them.
// (2) Clash-style selection: the building action bar sits low and only its buttons catch taps, so
// tapping another building switches the selection straight away.
(function(){
 function settle405(e){
  var limit=e.d&&e.d.economyConfirmedAt,real=Date.now(),hit=false;
  if(!e.d||!e.d.onlineCrystal||!Number.isFinite(limit)||limit>=real)return;
  function pin(o){if(o&&Number.isFinite(o.until)&&o.until>limit&&o.until<=real+1000){o.until=limit;hit=true;}}
  (e.d.buildings||[]).forEach(pin);(e.d.queue||[]).forEach(pin);
  try{if(e.productionJobs359)e.productionJobs359().forEach(function(j){pin(j.job);});}catch(err){}
  if(hit){e.sync();e.save();}
 }
 ['speed','speedTraining','finishProduction359'].forEach(function(name){
  var prev=Engine.prototype[name];if(!prev)return;
  Engine.prototype[name]=function(){var r=prev.apply(this,arguments);if(r==='')settle405(this);return r;};
 });
})();
(function(){var st=document.createElement('style');st.id='ux405';st.textContent=[
 // Only the buttons inside the action bar catch taps; everything around them reaches the map.
 '#app:not([data-battle300="true"]) #selection#selection{pointer-events:none!important;max-height:none!important}',
 '#app:not([data-battle300="true"]) #selection#selection button,#app:not([data-battle300="true"]) #selection#selection a,#app:not([data-battle300="true"]) #selection#selection input,#app:not([data-battle300="true"]) #selection#selection select{pointer-events:auto!important}',
 // Clash-style: while a building is selected its actions take the bottom strip and the main menu steps aside.
 'html[data-sel405] #app:not([data-battle300="true"]) #selection#selection{bottom:calc(4px + var(--safe-bottom303,0px))!important}',
 'html[data-sel405] #app:not([data-battle300="true"])>nav,html[data-sel405] #dailyCheckin340{opacity:0!important;pointer-events:none!important;transition:opacity .12s}',
 '#app:not([data-battle300="true"]) #selection#selection .selection-heading{margin:0 0 2px!important;padding:0!important}',
 '#app:not([data-battle300="true"]) #selection#selection>p{margin:2px 0 0!important}',
 '@media (max-height:480px){#app:not([data-battle300="true"]) #selection#selection .actions261 button{width:62px!important;min-height:58px!important}#app:not([data-battle300="true"]) #selection#selection .selection-heading b{font-size:14px!important}#app:not([data-battle300="true"]) #selection#selection>button.wide{min-height:34px!important;margin-top:4px!important}}'
].join('\n');document.head.appendChild(st);
 var root=document.documentElement,box=$('selection');
 function update(){var on=!!box&&screen==='home'&&!!selected&&!box.hidden&&getComputedStyle(box).display!=='none'&&box.childElementCount>0;if(root.hasAttribute('data-sel405')!==on)root.toggleAttribute('data-sel405',on);}
 if(box)new MutationObserver(update).observe(box,{attributes:true,childList:true});
 setInterval(update,250);update();
})();
