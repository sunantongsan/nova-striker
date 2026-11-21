// ---------- 443: no stutter while buildings upgrade ----------
// Measured on the owner's HQ20 base (151 buildings): a quiet base is not redrawn, but as soon as a builder
// is busy the whole village is redrawn every frame. Each frame then drew the energy-cannon heads, the
// rocket/turret heads and the guard robot by rotating or squashing cut-outs of large sheets
// (energy-coil 2172x724, guard 768x702). A rotated/squashed draw from a large picture is ~20x slower than
// the same draw from a small picture (desktop Chrome: 1.9 ms vs 0.1 ms per head), so every frame took
// 50-60 ms on a desktop and far longer on phones.
//  * Such draws now come from a small, already-shrunk copy of just that cut-out (made once, reused).
//  * Phones whose graphics chip cannot keep up (frames arrive late although the game code is quick)
//    now fall back to 30 frames per second and a lower drawing resolution, instead of stuttering.
(function(){
 if(typeof ctx==='undefined'||!ctx||!ctx.drawImage||typeof document==='undefined'||!document.createElement)return;
 var main=ctx,prev=main.drawImage,store=typeof WeakMap==='function'?new WeakMap():null;if(!store||!main.getTransform)return;
 var builtFrame=-1,builtCount=0,BUDGET=6,MAX_PER_IMAGE=48;
 function isPicture(img){return typeof HTMLImageElement!=='undefined'&&img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0;}
 // Sizes are rounded up in ~19% steps so slightly different sizes (zoom, squash) share one copy.
 function bucket(px){return Math.max(8,Math.ceil(Math.pow(2,Math.ceil(Math.log2(Math.max(1,px))*4)/4)));}
 function shrink(img,sx,sy,sw,sh,tw,th){
  var cur=img,cx=sx,cy=sy,cw=sw,ch=sh;
  while(cw/2>=tw&&ch/2>=th){var nw=Math.max(tw,Math.round(cw/2)),nh=Math.max(th,Math.round(ch/2)),cv=document.createElement('canvas');cv.width=nw;cv.height=nh;var g=cv.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(cur,cx,cy,cw,ch,0,0,nw,nh);cur=cv;cx=0;cy=0;cw=nw;ch=nh;}
  var out=document.createElement('canvas');out.width=tw;out.height=th;var o=out.getContext('2d');o.imageSmoothingQuality='high';o.drawImage(cur,cx,cy,cw,ch,0,0,tw,th);return out;
 }
 function piece(img,sx,sy,sw,sh,tw,th){
  var entry=store.get(img);if(!entry||entry.src!==img.src){entry={src:img.src,map:new Map()};store.set(img,entry);}
  var key=sx+','+sy+','+sw+','+sh+','+tw+','+th,hit=entry.map.get(key);if(hit)return hit;
  var f=typeof frame==='number'?frame:0;if(builtFrame!==f){builtFrame=f;builtCount=0;}
  if(builtCount>=BUDGET)return null;builtCount++;
  var made=null;try{made=shrink(img,sx,sy,sw,sh,tw,th);}catch(e){made=null;}
  if(entry.map.size>=MAX_PER_IMAGE)entry.map.delete(entry.map.keys().next().value);
  entry.map.set(key,made||false);return made;
 }
 main.drawImage=function(img,a,b,c,d,dx,dy,dw,dh){
  var n=arguments.length;
  if((n===9||n===5||n===3)&&isPicture(img)){
   var iw=img.naturalWidth,ih=img.naturalHeight,sx=0,sy=0,sw=iw,sh=ih,x,y,w,h;
   if(n===9){sx=a;sy=b;sw=c;sh=d;x=dx;y=dy;w=dw;h=dh;}else if(n===5){x=a;y=b;w=c;h=d;}else{x=a;y=b;w=iw;h=ih;}
   if(sw>0&&sh>0&&w&&h&&sw*sh>=65536){
    var t=main.getTransform(),turned=Math.abs(t.b)>1e-4||Math.abs(t.c)>1e-4,
     px=Math.abs(w)*Math.hypot(t.a,t.b),py=Math.abs(h)*Math.hypot(t.c,t.d),
     need=Math.max(px/sw,py/sh);
    // 437h already handles straight (unrotated) draws from the very large sheets.
    var handled=n===9&&!turned&&iw*ih>=1024*700;
    if(!handled&&need>0&&(turned?need<1.05:need<.6)){
     var tw=Math.min(sw,bucket(px)),th=Math.min(sh,bucket(py));
     if(tw<sw||th<sh||turned){var cut=piece(img,sx,sy,sw,sh,Math.max(1,tw),Math.max(1,th));
      if(cut)return prev.call(main,cut,0,0,cut.width,cut.height,x,y,w,h);}
    }
   }
  }
  return prev.apply(main,arguments);
 };
})();
// Graphics-bound phones: the game code finishes quickly, so the old check (which only timed the code)
// kept asking for 60 frames per second at full resolution while frames actually arrived late.
(function(){
 if(typeof frameCost420!=='function'||typeof performance==='undefined')return;
 var inner=frameCost420,lastAt=0,gapAvg=16.7,holdUntil=0;
 frameCost420=function(ms){
  var now=performance.now(),gap=now-lastAt;lastAt=now;
  if(gap>0&&gap<250)gapAvg=gapAvg*.9+gap*.1;
  inner(ms);
  var target=Math.max(16.7,typeof frameGap420==='number'?frameGap420:16.7);
  if(gapAvg>target+9)holdUntil=now+15000;
  if(now<holdUntil){frameGap420=32;if(gapAvg>42&&typeof frameAvg420==='number')frameAvg420=Math.max(frameAvg420,19);}
  // Village at rest (builders hammering, guards and mech idling): 30 frames per second is plenty and halves
  // the drawing work. Any touch (pan, zoom, drag) brings back full speed immediately.
  else if(typeof screen!=='undefined'&&screen==='home'&&now-touchAt443>1200)frameGap420=32;
 };
 var touchAt443=0;function touched(){touchAt443=performance.now();}
 try{['pointerdown','pointermove','wheel','touchstart','touchmove'].forEach(function(n){window.addEventListener(n,touched,{passive:true,capture:true});});}catch(e){}
 try{window.perf443={gap:function(){return gapAvg;},held:function(){return performance.now()<holdUntil;}};}catch(e){}
})();
