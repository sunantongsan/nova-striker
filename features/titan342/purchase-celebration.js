/* purchase-celebration350: presentation only; never changes the wallet. */
var purchaseQueue350=[],purchaseShowing350=false;
function purchaseSound350(kind){
 if(!soundOn||document.hidden)return;
 try{unlockAudio218();if(kind==='burst'){voice218('noise',2200,80,.65,.22,'sfx');voice218('sine',100,38,.35,.18,'sfx');}
 else if(kind==='coin'){voice218('sine',1500,2200,.12,.09,'sfx');voice218('triangle',2400,2800,.09,.035,'sfx');}
 else [523.25,659.25,783.99,1046.5].forEach(function(f,i){voice218('sine',f,f,.45,.10,'sfx',i*.09);});}catch(e){}
}
function purchaseCelebration350(data){
 if(data.granted!==true||!Number.isSafeInteger(data.nova)||data.nova<=0||!Number.isFinite(data.gems))return;
 purchaseQueue350.push(data.nova);showPurchase350();
}
function showPurchase350(){
 if(purchaseShowing350||!purchaseQueue350.length)return;purchaseShowing350=true;
 var amount=purchaseQueue350.shift(),previous=document.activeElement,layer=document.createElement('div');layer.className='purchase350';
 layer.innerHTML='<section class="purchaseCard350" role="dialog" aria-modal="true" aria-labelledby="purchaseTitle350"><div class="purchaseEyebrow350">เหรียญเป็ด • '+mt251('ซื้อสำเร็จ','PURCHASE COMPLETE')+'</div><div class="purchaseOrbit350"><span class="purchaseCoin350" aria-hidden="true">N</span><i></i><i></i><i></i></div><h2 id="purchaseTitle350">'+mt251('ยินดีด้วย!','Congratulations!')+'</h2><p class="purchaseAmount350">+'+amount.toLocaleString()+' <small>'+mt251('เหรียญเป็ด','Duck Coins')+'</small></p><p class="purchaseCopy350">'+mt251('เหรียญเข้าบัญชีเรียบร้อยแล้ว','Your Duck Coins has been added to your account')+'</p><button type="button" class="purchaseOK350">'+mt251('ตกลง','OK')+' <span aria-hidden="true">›</span></button><p class="purchaseThanks350">'+mt251('ขอบคุณที่สนับสนุนจักรวาลเป็ด','Thank you for supporting the Duck War universe')+'</p></section>';
 document.body.appendChild(layer);var button=layer.querySelector('button');button.focus();
 layer.addEventListener('keydown',function(e){if(e.key==='Tab'){e.preventDefault();button.focus();}if(e.key==='Escape'){e.preventDefault();button.click();}});
 button.onclick=function(){if(button.disabled)return;button.disabled=true;purchaseSound350('fanfare');layer.classList.add('purchaseLeaving350');
 var target=document.getElementById('gems'),r=target?target.getBoundingClientRect():null;
 playPurchaseFX350(r,function(){layer.remove();purchaseShowing350=false;if(previous&&previous.isConnected)previous.focus();showPurchase350();});};
}
function playPurchaseFX350(target,done){
 var canvas=document.createElement('canvas');canvas.className='purchaseFX350';canvas.setAttribute('aria-hidden','true');document.body.appendChild(canvas);
 var c=canvas.getContext('2d');if(!c){canvas.remove();done();return;}
 var w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=w*dpr;canvas.height=h*dpr;c.scale(dpr,dpr);
 var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,start=performance.now(),last=0,frame,finished=false;
 var bursts=[{t:0,x:w*.24,y:h*.32,hue:42},{t:360,x:w*.76,y:h*.26,hue:190},{t:760,x:w*.5,y:h*.22,hue:46}];
 var count=reduce?20:52,particles=[];bursts.forEach(function(b){b.played=false;for(var j=0;j<count;j++){var a=j/count*Math.PI*2,s=60+Math.random()*110;particles.push({b:b,dx:Math.cos(a)*s,dy:Math.sin(a)*s,life:.9+Math.random()*.45});}});
 var arrivals={},tx=target&&target.width?target.left+target.width/2:w*.83,ty=target&&target.height?target.top+target.height/2:36;
 function finish(){if(finished)return;finished=true;cancelAnimationFrame(frame);clearTimeout(fallback);document.removeEventListener('visibilitychange',onHide);canvas.remove();done();}
 function onHide(){if(document.hidden)finish();}document.addEventListener('visibilitychange',onHide);
 var fallback=setTimeout(finish,4500);
 function draw(now){if(finished)return;var ms=now-start;if(ms>3000){finish();return;}if(now-last<28){frame=requestAnimationFrame(draw);return;}last=now;c.clearRect(0,0,w,h);
 bursts.forEach(function(b){if(ms>=b.t&&!b.played){b.played=true;purchaseSound350('burst');}});
 c.globalCompositeOperation='lighter';particles.forEach(function(p){var t=(ms-p.b.t)/1000;if(t<0||t>p.life)return;var f=reduce?.35:1,x=p.b.x+p.dx*t*f,y=p.b.y+p.dy*t*f+38*t*t,a=1-t/p.life;
 c.globalAlpha=a;c.strokeStyle='hsl('+p.b.hue+',95%,72%)';c.lineWidth=1.6;c.beginPath();c.moveTo(x-p.dx*.045*f,y-p.dy*.045*f);c.lineTo(x,y);c.stroke();c.fillStyle='#fff5cf';c.fillRect(x-1,y-1,2,2);});
 c.globalCompositeOperation='source-over';c.globalAlpha=1;
 var coins=reduce?4:14;for(var i=0;i<coins;i++){var t=(ms-650-i*65)/850;if(t<0)continue;if(t>=1){if(!arrivals[i]){arrivals[i]=true;if(i%3===0)purchaseSound350('coin');var badge=document.getElementById('gems');if(badge)badge.animate([{filter:'brightness(1)',transform:'scale(1)'},{filter:'brightness(1.8)',transform:'scale(1.16)'},{filter:'brightness(1)',transform:'scale(1)'}],{duration:220});}continue;}
 var sx=w/2+(i%5-2)*16,sy=h*.51,ctrlX=sx+(i%2?1:-1)*Math.min(150,w*.2),ctrlY=Math.max(35,sy-150),u=1-t;
 var x=u*u*sx+2*u*t*ctrlX+t*t*tx,y=u*u*sy+2*u*t*ctrlY+t*t*ty,size=15*(1-t*.4);
 c.save();c.translate(x,y);c.shadowColor='#ffc85c';c.shadowBlur=12;var gr=c.createLinearGradient(-size,-size,size,size);gr.addColorStop(0,'#fff8c7');gr.addColorStop(.45,'#eab653');gr.addColorStop(1,'#a86a18');c.fillStyle=gr;c.beginPath();c.arc(0,0,size,0,Math.PI*2);c.fill();c.shadowBlur=0;c.strokeStyle='#fff1a8';c.lineWidth=1.5;c.beginPath();c.arc(0,0,size-3,0,Math.PI*2);c.stroke();c.fillStyle='#754415';c.font='bold '+size+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('N',0,1);c.restore();}
 frame=requestAnimationFrame(draw);
 }frame=requestAnimationFrame(draw);
}
var billingBefore350=root.novaBilling348;root.novaBilling348=function(event,data){billingBefore350(event,data);if(event==='granted')purchaseCelebration350(data||{});};
(function(){var style=document.createElement('style');style.textContent=`
.purchase350{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:14px;background:radial-gradient(ellipse at center,#0c2849b8,#020b17db);font-family:Tahoma,Arial,sans-serif;color:#fff;touch-action:manipulation}
.purchaseCard350{position:relative;isolation:isolate;width:min(390px,92vw);max-height:92dvh;overflow:auto;box-sizing:border-box;text-align:center;padding:24px 28px 18px;border:1px solid #e9cc8177;border-radius:24px;background:radial-gradient(ellipse at 50% 26%,#204b65 0,#0b243d 45%,#071525 85%);box-shadow:0 24px 90px #000b,inset 0 0 0 5px #ffffff03,0 0 45px #50c8ff12;animation:purchaseReveal350 .45s cubic-bezier(.2,.8,.2,1)}
.purchaseEyebrow350{font-size:10px;letter-spacing:2px;color:#a8ddec;font-weight:bold}.purchaseOrbit350{position:relative;height:118px;display:grid;place-items:center;margin:8px 0;background:radial-gradient(ellipse,#e7c46f33,transparent 65%)}
.purchaseOrbit350:before,.purchaseOrbit350:after{content:'';position:absolute;width:132px;height:75px;border:1px solid #9bdaed33;border-radius:50%;transform:rotate(-24deg)}.purchaseOrbit350:after{transform:rotate(24deg);width:150px;height:65px}
.purchaseCoin350{position:relative;z-index:1;display:grid;place-items:center;width:82px;height:82px;border:3px solid #ffedaa;border-radius:50%;background:linear-gradient(135deg,#fff5bd 0,#d5a248 38%,#ffdb7f 58%,#ac6e21 100%);box-shadow:0 7px 0 #825019,0 12px 24px #0006,inset 0 0 0 6px #b57d2b,inset 0 0 0 8px #ffe8a0;font-size:44px;font-weight:900;color:#81521c;text-shadow:0 1px #fff3c1;transform:rotate(-12deg)}
.purchaseOrbit350 i{position:absolute;width:5px;height:5px;background:#fff5cd;box-shadow:0 0 12px #ffd36d;transform:rotate(45deg);left:22%;top:24%}.purchaseOrbit350 i:nth-of-type(2){left:78%;top:60%;width:7px;height:7px}.purchaseOrbit350 i:nth-of-type(3){left:68%;top:15%;width:3px;height:3px}
.purchaseCard350 h2{font-size:27px;margin:10px 0 6px;color:#fff5d4}.purchaseAmount350{margin:0;color:#ffe29a;font-size:38px;font-weight:bold;font-variant-numeric:tabular-nums;text-shadow:0 0 24px #ffc54c33}.purchaseAmount350 small{font-size:15px;letter-spacing:2px}.purchaseCopy350{font-size:12px;color:#b2cfdf;margin:10px 0 20px;line-height:1.6}
.purchaseCard350 .purchaseOK350{width:100%;min-height:48px;border:1px solid #fff0b4;border-radius:12px;background:linear-gradient(#ffe5a2,#e5b55a);color:#3d2a0c;font-size:17px;font-weight:bold;padding:10px 20px;text-shadow:none;box-shadow:0 4px 0 #8a5f27,0 7px 24px #e7ba4b22;cursor:pointer;display:flex;justify-content:center;gap:20px}.purchaseOK350:focus-visible{outline:3px solid #83e8ff;outline-offset:5px}.purchaseThanks350{font-size:10px;color:#85a6ba;margin:17px 0 0}.purchaseFX350{position:fixed;inset:0;z-index:2147483001;width:100%;height:100%;pointer-events:none}.purchaseLeaving350{pointer-events:none;animation:purchaseFade350 .45s .2s both}.purchaseLeaving350 .purchaseCard350{animation:purchaseDepart350 .45s both}
@keyframes purchaseReveal350{from{opacity:0;transform:translateY(15px) scale(.94)}to{opacity:1;transform:none}}@keyframes purchaseFade350{to{opacity:0}}@keyframes purchaseDepart350{to{opacity:0;transform:scale(1.04)}}
@media(orientation:landscape) and (max-height:540px){.purchaseCard350{width:min(360px,46vw);padding:14px 24px 12px}.purchaseOrbit350{height:78px;margin:2px 0}.purchaseCoin350{width:60px;height:60px;font-size:32px}.purchaseCard350 h2{font-size:22px;margin:5px 0}.purchaseAmount350{font-size:30px}.purchaseCopy350{margin:6px 0 12px}.purchaseThanks350{margin-top:12px}}
@media(prefers-reduced-motion:reduce){.purchaseCard350,.purchaseLeaving350,.purchaseLeaving350 .purchaseCard350{animation:none}.purchaseLeaving350{opacity:0}}
`;document.head.appendChild(style);})();
