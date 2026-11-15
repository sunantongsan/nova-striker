// 407: reliable taps on the building bar and in windows (Android WebView).
// A tap is now recognised on finger-up by the game itself: if the finger lifts on (or within a few
// pixels of) the button it went down on, the button fires once, even when WebView cancels the native
// click because the finger slid a little or the page redrew. The native click that may follow is
// swallowed so nothing fires twice. Right after a window closes, the building bar ignores taps for a
// moment, so a quick second tap meant for the window cannot land on "Move" underneath.
(function(){
 var down=null,firedAt=0,firedBtn=null,synthetic=false,modalClosedAt=0,SLOP=22;
 // 409: the same button again after a redraw (same action, same place in the bar / window)
 function twin(b){if(b.isConnected)return b;var box=b.__box409,act=b.getAttribute('onclick');if(!box||!act||!box.isConnected)return null;var all=box.querySelectorAll('button');for(var i=0;i<all.length;i++)if(all[i].getAttribute('onclick')===act&&!all[i].disabled)return all[i];return null;}
 function barOrWindowButton(el){var b=el&&el.closest&&el.closest('button');if(!b||b.disabled)return null;return b.closest('#selection,#modal,#novaConfirm358')?b:null;}
 function inBar(b){return !!(b&&b.closest('#selection'));}
 document.addEventListener('pointerdown',function(e){
  if(e.isPrimary===false)return;var b=barOrWindowButton(e.target);
  if(b)b.__box409=b.closest('#selection,#modal,#novaConfirm358');
  down=b?{b:b,x:e.clientX,y:e.clientY,t:e.timeStamp||performance.now(),id:e.pointerId,r:b.getBoundingClientRect()}:null;
  if(b)b.classList.add('press407');
 },true);
 function finish(e,cancelled){
  var d=down;down=null;if(!d||e.pointerId!==d.id)return;d.b.classList.remove('press407');
  // 409: measured from the finger's own timestamps, so a busy phone (long frames) does not drop the tap
  if((e.timeStamp||performance.now())-d.t>2000)return;
  var b=twin(d.b);if(!b||b.disabled)return;
  var r=b.getBoundingClientRect();if(!r.width)r=d.r;var x=cancelled?d.x:e.clientX,y=cancelled?d.y:e.clientY;
  if(x<r.left-SLOP||x>r.right+SLOP||y<r.top-SLOP||y>r.bottom+SLOP)return;
  d.b=b;
  if(inBar(d.b)&&Date.now()-modalClosedAt<300)return;
  firedAt=Date.now();firedBtn=d.b;synthetic=true;try{d.b.click();}finally{synthetic=false;}
 }
 document.addEventListener('pointerup',function(e){finish(e,false);},true);
 document.addEventListener('pointercancel',function(e){finish(e,true);},true);
 document.addEventListener('click',function(e){
  if(synthetic)return;var b=e.target&&e.target.closest&&e.target.closest('button');if(!b)return;
  var ours=b.closest('#selection,#modal,#novaConfirm358');if(!ours)return;
  // the native click of a tap we already fired, or a stray tap on the bar just after a window closed
  if(Date.now()-firedAt<700||(inBar(b)&&Date.now()-modalClosedAt<300)){e.preventDefault();e.stopImmediatePropagation();}
 },true);
 var open407=false;new MutationObserver(function(){var on=getComputedStyle(modal).display!=='none'&&!!modal.firstChild;if(open407&&!on)modalClosedAt=Date.now();open407=on;}).observe(modal,{attributes:true,attributeFilter:['style','class'],childList:true});
 var st=document.createElement('style');st.id='tap407';st.textContent='#selection button.press407,#modal button.press407{filter:brightness(.92);transform:translateY(2px)}';document.head.appendChild(st);
})();
