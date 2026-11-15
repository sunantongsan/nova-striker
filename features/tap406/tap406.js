// 406: steadier building buttons.
// The HUD rebuilt the selected building's action bar (#selection) about twice a second even when nothing
// changed and briefly showed an extra button that a clean-up then removed, so the buttons jumped
// sideways and a tap on Upgrade could land on Move. The bar is now rebuilt only when it changes.
(function(){
 var box=$('selection');if(!box)return;
 // Each HUD pass builds the bar in a detached copy (writes, querySelector clean-ups, level text all
 // go to the copy); the real bar is replaced only when the finished copy differs from the last one.
 var desc=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML'),shadow=null,last=null,depth=0;
 var qs=Element.prototype.querySelector,qsa=Element.prototype.querySelectorAll;
 Object.defineProperty(box,'innerHTML',{configurable:true,
  get:function(){return shadow?desc.get.call(shadow):desc.get.call(this);},
  set:function(v){if(shadow){desc.set.call(shadow,v);return;}desc.set.call(this,v);last=null;}});
 box.querySelector=function(q){return qs.call(shadow||box,q);};
 box.querySelectorAll=function(q){return qsa.call(shadow||box,q);};
 var prev=hud;
 hud=function(){
  if(depth===0){shadow=document.createElement('div');desc.set.call(shadow,last!==null?last:desc.get.call(box));}
  depth++;
  try{return prev.apply(this,arguments);}
  finally{depth--;if(depth===0){var s=shadow;shadow=null;var html=desc.get.call(s);if(html!==last){last=html;box.replaceChildren.apply(box,Array.prototype.slice.call(s.childNodes));}}}
 };
 // Keep the bar still a little longer after a touch (slow WebView clicks), and no double-tap delay.
 var hold=0;box.addEventListener('pointerdown',function(){hold=Date.now()+700;},true);
 var prev2=hud;hud=function(){if(Date.now()<hold&&screen==='home')return;return prev2.apply(this,arguments);};
 ['pointerup','pointercancel'].forEach(function(t){root.addEventListener(t,function(){if(hold)hold=Math.min(hold,Date.now()+450);setTimeout(function(){if(Date.now()>=hold)hud();},460);});});
 var st=document.createElement('style');st.id='tap406';st.textContent='#selection button,#modal button,#homebar>button{touch-action:manipulation}';document.head.appendChild(st);
})();
