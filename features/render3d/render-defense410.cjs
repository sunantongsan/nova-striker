// Render the 410 defenses to assets/defense410.webp + features/render3d/defense410.json
// Rows: inferno, skyguard. Columns: tier 0, 1, 2 (Lv1-6, 7-13, 14-20), wreck. Cells 256x256 laid out like the
// other building pictures (ground point at 50% / 74%), so newBuildingArt can draw them.
const fs=require('fs'),path=require('path');const dir=__dirname,root=path.resolve(dir,'../..');
const {chromium}=require(path.join(root,'node_modules/playwright'));const sharp=require(path.join(root,'node_modules/sharp'));
const C=256,PAD=300,FRAME={inferno:[640,0.8],skyguard:[540,0.76]};
(async()=>{const b=await chromium.launch({executablePath:process.env.NOVA_CHROMIUM||'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:512,height:650}});
await p.route('**/*',r=>{const f=path.join(dir,new URL(r.request().url()).pathname);return fs.existsSync(f)?r.fulfill({path:f,contentType:f.endsWith('.js')?'text/javascript':'text/html'}):r.fulfill({status:404});});
await p.goto('http://render.local/defense410.html');await p.waitForFunction(()=>window.ready);
const comps=[],meta={cell:C,kinds:['inferno','skyguard'],tip:{}};
for(const [row,kind] of ['inferno','skyguard'].entries()){meta.tip[kind]=[];
 for(let col=0;col<4;col++){const r=await p.evaluate(([k,t,w])=>pose(k,t,w),[kind,Math.min(col,2),col===3]);
  const big=await sharp(Buffer.from(r.img.split(',')[1],'base64')).extend({top:PAD,bottom:PAD,left:PAD,right:PAD,background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
  const CROP=FRAME[kind][0],left=Math.round(r.ox+PAD-CROP/2),top=Math.round(r.oy+PAD-CROP*FRAME[kind][1]);
  const cell=await sharp(await sharp(big).extract({left,top,width:CROP,height:CROP}).png().toBuffer()).resize(C,C).png().toBuffer();
  if(col<3)meta.tip[kind].push([+((r.tx+PAD-left)/CROP).toFixed(3),+((r.ty+PAD-top)/CROP).toFixed(3)]);
  comps.push({input:cell,left:col*C,top:row*C});}}
await b.close();
await sharp({create:{width:4*C,height:2*C,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(comps).webp({quality:88,effort:6}).toFile(path.join(root,'assets/defense410.webp'));
fs.writeFileSync(path.join(dir,'defense410.json'),JSON.stringify(meta));console.log(JSON.stringify(meta),fs.statSync(path.join(root,'assets/defense410.webp')).size);})();
