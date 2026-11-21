// 443: rotated/squashed sprites come from small cached crops; graphics-bound phones fall back to 30 fps;
// the village at rest redraws at 30 fps and returns to full speed on touch.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('features/perf443/perf443.js','utf8');
const renderer=fs.readFileSync('features/titan342/renderer.js','utf8');
const build=fs.readFileSync('features/titan342/build.cjs','utf8');
assert(build.includes("features/perf443/perf443.js"),'perf443 is bundled into the game');
assert(!/pixels442\.drawImage\(renderer\.domElement,0,0\);r\.frameAt442/.test(renderer),'3D frames are not read back synchronously on every pose update');
assert(/createImageBitmap\(renderer\.domElement\)/.test(renderer)&&/r\.sprite442=r\.canvas443/.test(renderer),'snapshot path with a synchronous fallback');

function sandbox(transform){
 let made=0;const blits=[];
 class Img{constructor(w,h){this.complete=true;this.naturalWidth=w;this.naturalHeight=h;this.src='a.webp';}}
 const canvas=()=>({width:0,height:0,getContext:()=>({drawImage(){},set imageSmoothingQuality(v){}})});
 const ctx={drawImage(...a){blits.push(a);},getTransform:()=>transform.t};
 const listeners={};
 const s={Math,Map,WeakMap,frame:0,ctx,HTMLImageElement:Img,document:{createElement(){made++;return canvas();}},
  performance:{now:()=>s.clock},clock:0,screen:'home',frameGap420:15,frameAvg420:5,
  window:{addEventListener(n,f){listeners[n]=f;}},
  frameCost420(ms){s.frameAvg420=s.frameAvg420*.92+ms*.08;s.frameGap420=s.frameAvg420<11?15:32;}};
 vm.createContext(s);vm.runInContext(source,s);
 return {s,Img,blits,made:()=>made,listeners};
}
{ // A rotated head from a 2172x724 sheet is drawn from a small crop, built once and reused.
 const tf={t:{a:1.4,b:1.0,c:-.5,d:.7}};const {s,Img,blits,made}=sandbox(tf);const sheet=new Img(2172,724);
 for(let i=0;i<60;i++){s.frame++;s.ctx.drawImage(sheet,0,0,543,362,-50,-30,110,73);}
 assert.equal(blits.length,60);assert(blits.every(b=>b[0]!==sheet),'rotated draws never sample the full sheet');
 const after=made();for(let i=0;i<60;i++){s.frame++;s.ctx.drawImage(sheet,0,0,543,362,-50,-30,111,74);}
 assert.equal(made(),after,'nearby sizes reuse the same crop');
 assert(blits[0][0].width<=543&&blits[0][0].width>=110,'crop is about the on-screen size');
 // straight, unscaled draws are left alone
 tf.t={a:1,b:0,c:0,d:1};s.ctx.drawImage(sheet,0,0,100,100,0,0,100,100);assert.equal(blits.at(-1)[0],sheet);
 // small pictures are left alone
 tf.t={a:1,b:.5,c:-.5,d:1};const small=new Img(100,100);s.ctx.drawImage(small,0,0,50,50);assert.equal(blits.at(-1)[0],small);
}
{ // a 5-argument squashed guard draw (768x702) is shrunk once instead of every frame
 const tf={t:{a:2,b:0,c:0,d:2.2}};const {s,Img,blits,made}=sandbox(tf);const guard=new Img(768,702);
 for(let i=0;i<30;i++){s.frame++;s.ctx.drawImage(guard,-35,-58,70,64);}
 assert(blits.every(b=>b[0]!==guard));assert(made()<=8,'built once, in halving steps');
}
{ // at most a few new crops per frame; the rest fall back to the original draw that frame
 const tf={t:{a:1,b:.3,c:-.3,d:1}};const {s,Img,blits}=sandbox(tf);const sheet=new Img(2000,1000);
 for(let i=0;i<6;i++)s.ctx.drawImage(sheet,i*300,0,300,300,0,0,60,60);for(let i=0;i<4;i++)s.ctx.drawImage(sheet,i*300,300,300,300,0,0,60,60);
 assert.equal(blits.filter(b=>b[0]===sheet).length,4,'six new crops per frame, the rest wait');
}
{ // frame pacing
 const {s,listeners}=sandbox({t:{a:1,b:0,c:0,d:1}});
 s.clock=10000;for(let i=0;i<60;i++){s.clock+=16.7;s.frameCost420(2);}
 assert.equal(s.frameGap420,32,'village at rest: 30 fps');
 listeners.pointerdown();for(let i=0;i<10;i++){s.clock+=16.7;s.frameCost420(2);}
 assert.equal(s.frameGap420,15,'touching: full speed');
 for(let i=0;i<60;i++){s.clock+=40;s.frameCost420(2);listeners.pointermove();}
 assert.equal(s.frameGap420,32,'frames arriving late while the code is quick: 30 fps');
 s.clock+=5000;listeners.pointermove();s.frameCost420(2);assert.equal(s.frameGap420,32,'held for a while, no flip-flopping');
 s.screen='raid';s.clock+=20000;for(let i=0;i<1300;i++){s.clock+=16.7;s.frameCost420(2);}
 assert.equal(s.frameGap420,15,'battles keep full speed when the phone keeps up');
}
console.log('PASS performance443: cached rotated sprites, bounded crop work, 30 fps village at rest, graphics-late fallback, 3D snapshot');
