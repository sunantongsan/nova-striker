// Render the shock mortar to assets/cannon3d392.webp + features/render3d/cannon3d.json
// Per tier row: for each of 16 directions [idle, flash, recoil], then 1 wreck cell (col 48).
const fs=require('fs'),path=require('path');const dir=__dirname,root=path.resolve(dir,'../..');
const {chromium}=require(path.join(root,'node_modules/playwright'));const sharp=require(path.join(root,'node_modules/sharp'));
const CW=144,CH=158,SC=CW/320,DIRS=16,TIERS=5;
(async()=>{const b=await chromium.launch({executablePath:process.env.NOVA_CHROMIUM||'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:320,height:352}});
await p.route('**/*',r=>{const f=path.join(dir,new URL(r.request().url()).pathname);return fs.existsSync(f)?r.fulfill({path:f,contentType:f.endsWith('.js')?'text/javascript':'text/html'}):r.fulfill({status:404});});
await p.goto('http://render.local/cannon3d.html');await p.waitForFunction(()=>window.ready);
const comps=[],meta={cw:CW,ch:CH,dirs:DIRS,tiers:[]};
for(let t=0;t<TIERS;t++){const tm={muzzle:[]};let col=0;
 for(let k=0;k<DIRS;k++){const a=k*2*Math.PI/DIRS;for(let f=0;f<3;f++){const r=await p.evaluate(([t,a,f])=>pose(t,-a,f,false),[t,a,f]);
  if(f===0)tm.muzzle.push([+(r.mx*SC).toFixed(1),+(r.my*SC).toFixed(1)]);
  comps.push({input:await sharp(Buffer.from(r.img.split(',')[1],'base64')).resize(CW,CH).png().toBuffer(),left:col*CW,top:t*CH});col++;}}
 const w=await p.evaluate(([t])=>pose(t,0,0,true),[t]);comps.push({input:await sharp(Buffer.from(w.img.split(',')[1],'base64')).resize(CW,CH).png().toBuffer(),left:col*CW,top:t*CH});
 const raw=await sharp(Buffer.from(w.img.split(',')[1],'base64')).resize(CW,CH).ensureAlpha().raw().toBuffer();let bottom=0,minx=CW,maxx=0,wmin=CW,wmax=0;
 for(let y=0;y<CH;y++)for(let x=0;x<CW;x++)if(raw[(y*CW+x)*4+3]>60){if(y>bottom)bottom=y;wmin=Math.min(wmin,x);wmax=Math.max(wmax,x);}
 for(let y=bottom-5;y<=bottom;y++)for(let x=0;x<CW;x++)if(raw[(y*CW+x)*4+3]>60){minx=Math.min(minx,x);maxx=Math.max(maxx,x);}
 tm.ax=(minx+maxx)/2;tm.ay=bottom;tm.width=wmax-wmin;meta.tiers.push(tm);}
await b.close();
await sharp({create:{width:(DIRS*3+1)*CW,height:TIERS*CH,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(comps).webp({quality:86,effort:6}).toFile(path.join(root,'assets/cannon3d392.webp'));
fs.writeFileSync(path.join(dir,'cannon3d.json'),JSON.stringify(meta));console.log(fs.statSync(path.join(root,'assets/cannon3d392.webp')).size,meta.tiers.map(t=>[t.ax,t.ay,t.width]));})();
