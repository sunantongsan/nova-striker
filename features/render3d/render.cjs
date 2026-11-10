// Render the 3D silo to assets/silo3d392.webp + features/render3d/silo3d.json (run: node features/render3d/render.cjs)
const fs=require('fs'),path=require('path');const dir=__dirname,root=path.resolve(dir,'../..');
const {chromium}=require(path.join(root,'node_modules/playwright'));const sharp=require(path.join(root,'node_modules/sharp'));
const CW=144,CH=158,SC=CW/320,DIRS=16,TIERS=5;
(async()=>{const b=await chromium.launch({executablePath:process.env.NOVA_CHROMIUM||'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:320,height:352}});
await p.route('**/*',r=>{const f=path.join(dir,new URL(r.request().url()).pathname);return fs.existsSync(f)?r.fulfill({path:f,contentType:f.endsWith('.js')?'text/javascript':'text/html'}):r.fulfill({status:404});});
await p.goto('http://render.local/silo3d.html');await p.waitForFunction(()=>window.ready);
const comps=[],meta={cw:CW,ch:CH,dirs:DIRS,tiers:[]};
for(let t=0;t<TIERS;t++){const tm={muzzle:[]};
 const cells=[];const open=[0,.15,.3,.45,.6,.75,.9,1];
 for(const o of open)cells.push((await p.evaluate(([t,o])=>pose(t,o,-Math.PI/4,false),[t,o])));
 for(let k=0;k<DIRS;k++){const a=k*2*Math.PI/DIRS;const r=await p.evaluate(([t,a])=>pose(t,1,-a,false),[t,a]);cells.push(r);tm.muzzle.push([+(r.mx*SC).toFixed(1),+(r.my*SC).toFixed(1)]);}
 cells.push(await p.evaluate(([t])=>pose(t,0,0,true),[t]));
 for(let i=0;i<cells.length;i++){const buf=await sharp(Buffer.from(cells[i].img.split(',')[1],'base64')).resize(CW,CH).png().toBuffer();comps.push({input:buf,left:i*CW,top:t*CH});}
 // bunker anchor (bottom centre) from the closed frame
 const raw=await sharp(Buffer.from(cells[0].img.split(',')[1],'base64')).resize(CW,CH).ensureAlpha().raw().toBuffer();let bottom=0,minx=CW,maxx=0;
 for(let y=0;y<CH;y++)for(let x=0;x<CW;x++)if(raw[(y*CW+x)*4+3]>60){if(y>bottom)bottom=y;}
 for(let y=bottom-6;y<=bottom;y++)for(let x=0;x<CW;x++)if(raw[(y*CW+x)*4+3]>60){minx=Math.min(minx,x);maxx=Math.max(maxx,x);}
 let wmin=CW,wmax=0;for(let y=0;y<CH;y++)for(let x=0;x<CW;x++)if(raw[(y*CW+x)*4+3]>60){wmin=Math.min(wmin,x);wmax=Math.max(wmax,x);}
 tm.ax=(minx+maxx)/2;tm.ay=bottom;tm.width=wmax-wmin;meta.tiers.push(tm);}
await b.close();
const cols=8+DIRS+1;await sharp({create:{width:cols*CW,height:TIERS*CH,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(comps).webp({quality:86,effort:6}).toFile(path.join(root,'assets/silo3d392.webp'));
fs.writeFileSync(path.join(dir,'silo3d.json'),JSON.stringify(meta));console.log(fs.statSync(path.join(root,'assets/silo3d392.webp')).size,JSON.stringify(meta.tiers.map(t=>[t.ax,t.ay,t.width])));})();
