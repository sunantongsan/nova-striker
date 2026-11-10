// Render 3D troops to assets/units3d392-<unit>.webp + features/render3d/units3d.json
// Columns per row: idle 0-3, walk 4-11, attack 12-15, death 16-20. Rows: 8 grid directions (k*45deg).
const fs=require('fs'),path=require('path');const dir=__dirname,root=path.resolve(dir,'../..');
const {chromium}=require(path.join(root,'node_modules/playwright'));const sharp=require(path.join(root,'node_modules/sharp'));
const CW=120,CH=128,SC=CW/240,UNITS=process.argv.slice(2).length?process.argv.slice(2):['mech','shield','sniper'];
const FR=[['idle',4],['walk',8],['attack',4],['death',5]];
(async()=>{const b=await chromium.launch({executablePath:process.env.NOVA_CHROMIUM||'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:240,height:256}});
await p.route('**/*',r=>{const f=path.join(dir,new URL(r.request().url()).pathname);return fs.existsSync(f)?r.fulfill({path:f,contentType:f.endsWith('.js')?'text/javascript':'text/html'}):r.fulfill({status:404});});
await p.goto('http://render.local/units3d.html');await p.waitForFunction(()=>window.ready);
const metaPath=path.join(dir,'units3d.json');const meta=fs.existsSync(metaPath)?JSON.parse(fs.readFileSync(metaPath)):{};
meta._={cw:CW,ch:CH,dirs:8,idle:[0,4],walk:[4,8],attack:[12,4],death:[16,5]};
for(const u of UNITS){const comps=[],mz=[];let ax=0,ay=0,top=CH;
 for(let d=0;d<8;d++){let col=0;const a=d*Math.PI/4;
  for(const [anim,n] of FR)for(let f=0;f<n;f++){const r=await p.evaluate(([u,a,anim,f])=>pose(u,a,anim,f),[u,a,anim,f]);
   const buf=await sharp(Buffer.from(r.img.split(',')[1],'base64')).resize(CW,CH).png().toBuffer();comps.push({input:buf,left:col*CW,top:d*CH});
   ax=r.ox*SC;ay=r.oy*SC;if(anim==='attack'&&f===0)mz.push([+(r.mx*SC-ax).toFixed(1),+(r.my*SC-ay).toFixed(1)]);
   if(anim==='idle'&&f===0){const raw=await sharp(buf).ensureAlpha().raw().toBuffer();for(let y=0;y<CH;y++)for(let x=0;x<CW;x++)if(raw[(y*CW+x)*4+3]>60&&y<top)top=y;}
   col++;}}
 const out=path.join(root,`assets/units3d392-${u}.webp`);
 await sharp({create:{width:21*CW,height:8*CH,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(comps).webp({quality:86,effort:6}).toFile(out);
 meta[u]={ax:+ax.toFixed(1),ay:+ay.toFixed(1),h:+(ay-top).toFixed(1),muzzle:mz};console.log(u,fs.statSync(out).size,meta[u].h);}
await b.close();fs.writeFileSync(metaPath,JSON.stringify(meta));})();
