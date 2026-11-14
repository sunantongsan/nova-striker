// 403: render the glass resource tanks to assets/tanks403.webp + features/render3d/tank403/tanks403.json
// Rows: kind (x gold, y green, z red) x 5 tiers. Columns: fill 0, .2, .4, .6, .8, 1, then the wreck.
const fs=require('fs'),path=require('path');const dir=path.resolve(__dirname,'..'),root=path.resolve(dir,'../..');
const {chromium}=require(path.join(root,'node_modules/playwright'));const sharp=require(path.join(root,'node_modules/sharp'));
const CW=140,CH=312,KINDS=['x','y','z'],TIERS=5,FILLS=[0,.2,.4,.6,.8,1];
(async()=>{const b=await chromium.launch({executablePath:process.env.NOVA_CHROMIUM||'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:320,height:712}});
await p.route('**/*',r=>{const f=path.join(dir,new URL(r.request().url()).pathname);return fs.existsSync(f)?r.fulfill({path:f,contentType:f.endsWith('.js')?'text/javascript':'text/html'}):r.fulfill({status:404});});
await p.goto('http://render.local/tank403/tank3d.html');await p.waitForFunction(()=>window.ready);
const comps=[],meta={cw:CW,ch:CH,unit:CW/5.5,fills:FILLS,kinds:KINDS,tiers:[]};
for(let t=0;t<TIERS;t++){let tm=null;
 for(let k=0;k<KINDS.length;k++){const row=k*TIERS+t;
  for(let c=0;c<=FILLS.length;c++){const wreck=c===FILLS.length;const r=await p.evaluate(a=>pose(...a),[KINDS[k],t,wreck?0:FILLS[c],wreck]);
   const buf=await sharp(Buffer.from(r.img.split(',')[1],'base64')).resize(CW,CH).png().toBuffer();comps.push({input:buf,left:c*CW,top:row*CH});
   if(!tm&&!wreck&&c===FILLS.length-1){const raw=await sharp(buf).ensureAlpha().raw().toBuffer();let top=CH;for(let y=0;y<CH&&top===CH;y++)for(let x=0;x<CW;x++)if(raw[(y*CW+x)*4+3]>60){top=y;break;}
    tm={ax:+(r.ox*CW).toFixed(1),ay:+(r.oy*CH).toFixed(1),top,lamp:[+(r.lx*CW).toFixed(1),+(r.ly*CH).toFixed(1)]};}}}
 meta.tiers.push(tm);}
await b.close();
await sharp({create:{width:(FILLS.length+1)*CW,height:KINDS.length*TIERS*CH,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(comps).webp({quality:86,effort:6}).toFile(path.join(root,'assets/tanks403.webp'));
fs.writeFileSync(path.join(__dirname,'tanks403.json'),JSON.stringify(meta));console.log(fs.statSync(path.join(root,'assets/tanks403.webp')).size,JSON.stringify(meta.tiers));})();
