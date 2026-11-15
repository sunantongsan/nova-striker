// 406: steadier building buttons.
// The HUD rebuilt the selected building's action bar (#selection) about twice a second even when nothing
// changed, so the button under a finger was often replaced before the tap's click arrived, and the
// rebuild + re-decoration caused small hitches. Writes to #selection made during a HUD pass are now
// staged and committed only when the markup really changed.
(function(){
 var box=$('selection');if(!box)return;
 var desc=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML'),staged=null,committed=null,depth=0;
 Object.defineProperty(box,'innerHTML',{configurable:true,
  get:function(){return staged!==null?staged:(committed!==null?committed:desc.get.call(this));},
  set:function(v){v=String(v);if(depth>0){staged=v;return;}committed=v;desc.set.call(this,v);}});
 var prev=hud;
 hud=function(){
  if(depth===0)staged=committed!==null?committed:desc.get.call(box);
  depth++;
  try{return prev.apply(this,arguments);}
  finally{depth--;if(depth===0){var s=staged;staged=null;if(s!==committed){committed=s;desc.set.call(box,s);}}}
 };
 // Keep the bar still a little longer after a touch (slow WebView clicks), and no double-tap delay.
 var hold=0;box.addEventListener('pointerdown',function(){hold=Date.now()+700;},true);
 var prev2=hud;hud=function(){if(Date.now()<hold&&screen==='home')return;return prev2.apply(this,arguments);};
 ['pointerup','pointercancel'].forEach(function(t){root.addEventListener(t,function(){if(hold)hold=Math.min(hold,Date.now()+450);setTimeout(function(){if(Date.now()>=hold)hud();},460);});});
 var st=document.createElement('style');st.id='tap406';st.textContent='#selection button,#modal button,#homebar>button{touch-action:manipulation}';document.head.appendChild(st);
})();
