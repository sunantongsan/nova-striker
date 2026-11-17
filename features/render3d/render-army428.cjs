// Render the 428 army/research buildings to assets/army428.webp + army428.json
// Rows: tech428, workshop428, herohall428, dronehub428, forge428. Columns: level 1..20, then the wreck.
const fs=require('fs'),path=require('path');const dir=__dirname,root=path.resolve(dir,'../..');
const {chromium}=require(path.join(root,'node_modules/playwright-core'));const sharp=require(path.join(root,'node_modules/sharp'));
const C=+(process.env.CELL||192),PAD=300,CROP=+(process.env.CROP||460),AY=+(process.env.AY||0.7),KINDS=['tech428','workshop428','herohall428','dronehub428','forge428'];
(async()=>{const b=await chromium.launch({executablePath:process.env.NOVA_CHROMIUM||'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:512,height:650}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/*',r=>{const f=path.join(dir,new URL(r.request().url()).pathname);return fs.existsSync(f)?r.fulfill({path:f,contentType:f.endsWith('.js')?'text/javascript':'text/html'}):r.fulfill({status:404});});
await p.goto('http://render.local/army428.html');await p.waitForFunction(()=>window.ready,null,{timeout:20000});
const comps=[],only=process.env.ONLY;
for(const [row,kind] of KINDS.entries()){if(only&&only!==kind)continue;
 for(let col=0;col<21;col++){const r=await p.evaluate(([k,l,w])=>pose(k,l,w),[kind,col+1,col===20]);
  const big=await sharp(Buffer.from(r.img.split(',')[1],'base64')).extend({top:PAD,bottom:PAD,left:PAD,right:PAD,background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
  const left=Math.round(r.ox+PAD-CROP/2),top=Math.round(r.oy+PAD-CROP*AY);
  const cell=await sharp(await sharp(big).extract({left,top,width:CROP,height:CROP}).png().toBuffer()).resize(C,C).png().toBuffer();
  comps.push({input:cell,left:col*C,top:row*C});}}
await b.close();
const out=process.env.OUT||path.join(root,'assets/army428.webp');
await sharp({create:{width:21*C,height:KINDS.length*C,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(comps).webp({quality:86,effort:6}).toFile(out);
fs.writeFileSync(path.join(dir,'army428.json'),JSON.stringify({cell:C,cols:21,kinds:KINDS,ax:0.5,ay:AY}));console.log(out,fs.statSync(out).size);})();
