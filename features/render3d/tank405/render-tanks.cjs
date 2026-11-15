// 405: render the 20-tier glass resource tanks to assets/tanks405.webp + features/render3d/tank405/tanks405.json
// Rows: kind (x gold, y green, z red). Columns per tier t: 2t = empty, 2t+1 = full; last column = wreck.
// The game draws the empty picture and overlays the full picture below the liquid line (l0 empty .. l1 full).
const fs=require('fs'),path=require('path');const dir=path.resolve(__dirname,'..'),root=path.resolve(dir,'../..');
let pw;try{pw=require(path.join(root,'node_modules/playwright'));}catch(e){pw=require(path.join(root,'node_modules/playwright-core'));}
const sharp=require(path.join(root,'node_modules/sharp'));
const CW=128,CH=285,KINDS=['x','y','z'],TIERS=20;
(async()=>{const b=await pw.chromium.launch({executablePath:process.env.NOVA_CHROMIUM||'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:320,height:712}});
await p.route('**/*',r=>{const f=path.join(dir,new URL(r.request().url()).pathname);return fs.existsSync(f)?r.fulfill({path:f,contentType:f.endsWith('.js')?'text/javascript':'text/html'}):r.fulfill({status:404});});
await p.goto('http://render.local/tank405/tank3d.html');await p.waitForFunction(()=>window.ready);
const comps=[],meta={cw:CW,ch:CH,unit:CW/5.5,kinds:KINDS,layout:'pair405',tiers:[]};
const cell=async(k,t,fill,wreck)=>{const r=await p.evaluate(a=>pose(...a),[k,t,fill,wreck]);return {r,buf:await sharp(Buffer.from(r.img.split(',')[1],'base64')).resize(CW,CH).png().toBuffer()};};
for(let k=0;k<KINDS.length;k++){
 for(let t=0;t<TIERS;t++){
  const e=await cell(KINDS[k],t,0,false),f=await cell(KINDS[k],t,1,false);
  comps.push({input:e.buf,left:2*t*CW,top:k*CH},{input:f.buf,left:(2*t+1)*CW,top:k*CH});
  if(k===0){const raw=await sharp(f.buf).ensureAlpha().raw().toBuffer();let top=CH;for(let y=0;y<CH&&top===CH;y++)for(let x=0;x<CW;x++)if(raw[(y*CW+x)*4+3]>60){top=y;break;}
   const r=f.r;meta.tiers.push({ax:+(r.ox*CW).toFixed(1),ay:+(r.oy*CH).toFixed(1),top,lamp:[+(r.lx*CW).toFixed(1),+(r.ly*CH).toFixed(1)],l0:+(r.l0*CH).toFixed(1),l1:+(r.l1*CH).toFixed(1)});}
 }
 const w=await cell(KINDS[k],0,0,true);comps.push({input:w.buf,left:2*TIERS*CW,top:k*CH});
}
await b.close();
await sharp({create:{width:(2*TIERS+1)*CW,height:KINDS.length*CH,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(comps).webp({quality:86,effort:6}).toFile(path.join(root,'assets/tanks405.webp'));
fs.writeFileSync(path.join(__dirname,'tanks405.json'),JSON.stringify(meta));console.log(fs.statSync(path.join(root,'assets/tanks405.webp')).size,JSON.stringify(meta.tiers.slice(0,2)),JSON.stringify(meta.tiers.slice(-1)));})();
