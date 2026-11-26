// 447: scrolling a window no longer presses its buttons, and window buttons are smaller.
// Owner (2026-11-26): in the Army window the big "+ Train" / info buttons fired while he was only
// scrolling the list. 407 fires a button on finger-up *or* on pointercancel (which is exactly what the
// WebView sends when it takes over the touch to scroll), so a scroll that started on a button pressed it.
// A touch inside a window that moved more than a few pixels, scrolled anything, or was cancelled by the
// browser is now a scroll, not a tap: the click that follows (407's synthetic or the native one) is
// swallowed. Listeners sit on window (capture), so they run before 407's document listeners.
(function(){
 var MOVE=9,g=null,blockUntil=0;
 function inModal(el){return !!(el&&el.closest&&el.closest('#modal'));}
 window.addEventListener('pointerdown',function(e){
  if(e.isPrimary===false)return;
  g=inModal(e.target)?{id:e.pointerId,x:e.clientX,y:e.clientY,drag:false}:null;
 },true);
 window.addEventListener('pointermove',function(e){
  if(!g||e.pointerId!==g.id||g.drag)return;
  if(Math.abs(e.clientX-g.x)>MOVE||Math.abs(e.clientY-g.y)>MOVE)g.drag=true;
 },true);
 document.addEventListener('scroll',function(e){if(g&&inModal(e.target))g.drag=true;},true);
 function end(e,cancelled){
  if(!g||e.pointerId!==g.id)return;
  if(cancelled||g.drag||Math.abs(e.clientX-g.x)>MOVE||Math.abs(e.clientY-g.y)>MOVE)blockUntil=Date.now()+450;
  g=null;
 }
 window.addEventListener('pointerup',function(e){end(e,false);},true);
 window.addEventListener('pointercancel',function(e){end(e,true);},true);
 window.addEventListener('click',function(e){
  if(Date.now()>=blockUntil||!inModal(e.target))return;
  var b=e.target.closest('button');if(b)b.classList.remove('press407');
  e.preventDefault();e.stopImmediatePropagation();
 },true);
 try{window.tap447={blocked:function(){return Date.now()<blockUntil;}};}catch(e){}

 var M='html body #modal#modal#modal';
 var css=[
  // Army: train button and info dot
  M+' .novaTroop360 .novaTrain360{min-height:24px!important;height:24px!important;font-size:11px!important;line-height:22px!important;padding:0 6px!important;margin-top:2px!important}',
  M+' .novaTroop360 .novaTrain360 .art345{display:none!important}',
  M+' .novaTroop360 button.novaInfo360{width:20px!important;min-width:20px!important;height:20px!important;min-height:20px!important}',
  // tabs / filters / boost bar
  M+' .novaTabs360 button,'+M+' .novaFilter360 button{min-height:26px!important;height:26px!important;padding:0 6px!important;font-size:12px!important;line-height:24px!important}',
  M+' .supBtn433{min-height:28px!important;height:28px!important;padding:0 8px!important;font-size:12px!important}',
  // Attack hub: big cards
  M+' .hubCard395{min-height:76px!important;padding:6px!important;border-radius:14px!important}',
  M+' .hubCard395 .hubIcon395{font-size:24px!important;line-height:28px!important}',
  M+' .hubCard395 b{font-size:15px!important}',
  M+' .armyHead395 button{min-height:28px!important;height:28px!important;padding:0 10px!important}'
 ].join('\n');
 var st=document.createElement('style');st.id='tap447';st.textContent=css;document.head.appendChild(st);
})();
