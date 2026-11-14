// Render guard sprite sheets: rows = unique dirs [0,1,3,4,5] (2,6,7 are mirrors), cols: idle4 walk8 fly4 attack4 death5.
const fs=require('fs'),path=require('path');const dir='/home/claude/glb/view';
const sharp=require('/home/claude/nova-striker/node_modules/sharp');
const CW=184,SRC=368,SC=CW/SRC,DIRS=[0,1,3,4,5],FR=[['idle',4],['walk',6],['jump',6],['attack',4],['death',5]],COLS=13;
(async()=>{const {chromium}=require('/opt/npm-tools/node_modules/playwright');
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:368,height:368}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/*',r=>{let f=decodeURIComponent(new URL(r.request().url()).pathname);f=f.startsWith('/glb/')?path.join('/home/claude/glb',f.slice(5)):path.join(dir,f);return fs.existsSync(f)?r.fulfill({path:f,contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.html')?'text/html':'application/octet-stream'}):r.fulfill({status:404});});
await p.goto(`http://v.local/guard3d.html?model=/glb/pixellabs-glb-3350.glb&map=/glb/r_t1.png&normal=/glb/r_tex0.png&mr=/glb/r_tex2.png`);await p.waitForFunction(()=>window.ready,null,{timeout:300000});
const meta={cw:CW,ch:CW,cols:COLS,dirs:DIRS,anims:{},muzzle:[]};let c=0;for(const [a,n] of FR){meta.anims[a]=[c,n];c+=n;}
let top=CW;
for(const tier of ['t1','t2','t3']){await p.evaluate(f=>setMap(f),`/glb/r_${tier}.png`);await new Promise(r=>setTimeout(r,500));
 const comps=[];
 for(let row=0;row<DIRS.length;row++){let col=0;const a=DIRS[row]*Math.PI/4;
  for(const [anim,n] of FR)for(let f=0;f<n;f++){const r=await p.evaluate(([a,anim,f])=>pose(a,anim,f),[a,anim,f]);if(anim==='walk'){}
   const buf=await sharp(Buffer.from(r.img.split(',')[1],'base64')).resize(CW,CW).png().toBuffer();{const cell=row*c+col;comps.push({input:buf,left:(cell%COLS)*CW,top:Math.floor(cell/COLS)*CW});}
   meta.ax=+(r.ox*SC).toFixed(1);meta.ay=+(r.oy*SC).toFixed(1);
   if(tier==='t1'&&anim==='attack'&&f===1)meta.muzzle[row]=[+((r.mx-r.ox)*SC).toFixed(1),+((r.my-r.oy)*SC).toFixed(1)];
   if(tier==='t1'&&anim==='idle'&&f===0){const raw=await sharp(buf).ensureAlpha().raw().toBuffer();for(let y=0;y<CW;y++)for(let x=0;x<CW;x++)if(raw[(y*CW+x)*4+3]>60&&y<top)top=y;}
   col++;}}
 {const u=await p.evaluate(()=>fistShot(Math.PI/4*1.5));await sharp(Buffer.from(u.split(',')[1],'base64')).trim().resize(96,96,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toFile(`/home/claude/glb/fist401-${tier}.png`);}
 const out=`/home/claude/glb/guard401-${tier}.webp`;
 await sharp({create:{width:COLS*CW,height:Math.ceil(DIRS.length*c/COLS)*CW,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(comps).webp({quality:88,effort:6}).toFile(out);
 console.log(tier,fs.statSync(out).size);}
meta.h=+(meta.ay-top).toFixed(1);fs.writeFileSync('/home/claude/glb/guard401.json',JSON.stringify(meta));console.log(JSON.stringify(meta));
await b.close();})();
