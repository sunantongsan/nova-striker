// Render the 412 defenses. For every kind, shape tier s (0..2) and colour stage c (0..2) one atlas
// assets/def412-<kind>-<s><c>.webp holds 16 gun directions (cells 0-15), the static base (16) and the wreck (17),
// 6 cells per row. All cells of a kind share one crop so base and guns line up; the anchor is the ground point.
// Also writes assets/defense412-icons.webp and features/render3d/defense412.json. Preview: /tmp/def412-preview-<kind>.png
const fs=require('fs'),path=require('path');const dir=__dirname,root=path.resolve(dir,'../..');
const {chromium}=require(path.join(root,'node_modules/playwright'));const sharp=require(path.join(root,'node_modules/sharp'));
const CW=192,COLS=6,PAD=200;
(async()=>{const b=await chromium.launch({executablePath:process.env.NOVA_CHROMIUM||'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:670,height:930}});
await p.route('**/*',r=>{const f=path.join(dir,new URL(r.request().url()).pathname);return fs.existsSync(f)?r.fulfill({path:f,contentType:f.endsWith('.js')?'text/javascript':'text/html'}):r.fulfill({status:404});});
await p.goto('http://render.local/defense412.html');await p.waitForFunction(()=>window.ready);
const pose=(...a)=>p.evaluate(a=>pose(...a),a);
const meta={cols:COLS,dirs:16,kinds:{}},icons=[];
for(const kind of ['skyguard','inferno']){
 const shots=[];
 const wreck=await pose(kind,0,'wreck',0,0);
 for(let s=0;s<3;s++)for(let c=0;c<3;c++){
  for(let d=0;d<16;d++)shots.push({s,c,cell:d,r:await pose(kind,s,'gun',d,c)});
  shots.push({s,c,cell:16,r:await pose(kind,s,'base',0,c)});shots.push({s,c,cell:17,r:wreck});}
 let x0=1e9,y0=1e9,x1=-1,y1=-1;
 for(const sh of shots){sh.buf=Buffer.from(sh.r.img.split(',')[1],'base64');if(sh.cell===17&&!(sh.s===0&&sh.c===0))continue;
  const {data,info}=await sharp(sh.buf).raw().ensureAlpha().toBuffer({resolveWithObject:true});
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}}
 if(x0<=1||y0<=1||x1>=669||y1>=929)throw Error(kind+' touches the canvas edge '+[x0,y0,x1,y1]);
 const ox=shots[0].r.ox,oy=shots[0].r.oy,half=Math.max(ox-x0,x1-ox)+4,left=Math.floor(ox-half),top=y0-4,W=Math.ceil(2*half),H=y1-top+5,CH=Math.round(CW*H/W);
 const crop=async buf=>sharp(await sharp(await sharp(buf).extend({top:PAD,bottom:PAD,left:PAD,right:PAD,background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer()).extract({left:left+PAD,top:top+PAD,width:W,height:H}).png().toBuffer()).resize(CW,CH).png().toBuffer();
 const tips=[[],[],[]];let bytes=0;const prev=[];
 for(let s=0;s<3;s++)for(let c=0;c<3;c++){const comps=[];
  for(const sh of shots.filter(x=>x.s===s&&x.c===c)){comps.push({input:await crop(sh.buf),left:(sh.cell%COLS)*CW,top:Math.floor(sh.cell/COLS)*CH});
   if(c===0&&sh.cell<16)tips[s][sh.cell]=sh.r.tips.map(q=>[+((q[0]-left)/W).toFixed(3),+((q[1]-top)/H).toFixed(3)]);}
  const file='assets/def412-'+kind+'-'+s+c+'.webp';
  await sharp({create:{width:COLS*CW,height:3*CH,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(comps).webp({quality:86,effort:6,alphaQuality:90}).toFile(path.join(root,file));bytes+=fs.statSync(path.join(root,file)).size;
  const base=shots.find(x=>x.s===s&&x.c===c&&x.cell===16).buf,gun=shots.find(x=>x.s===s&&x.c===c&&x.cell===6).buf;
  prev.push({input:await sharp(await sharp(base).composite([{input:gun}]).png().toBuffer()).resize(223,310).png().toBuffer(),left:c*223,top:s*310});
  if(s===0&&c===0)icons.push({base,gun:shots.find(x=>x.s===0&&x.c===0&&x.cell===8).buf});}
 await sharp({create:{width:669,height:930,channels:4,background:'#8fbf78'}}).composite(prev).png().toFile('/tmp/def412-preview-'+kind+'.png');
 meta.kinds[kind]={file:'assets/def412-'+kind+'-',cw:CW,ch:CH,ax:+((ox-left)/W).toFixed(4),ay:+((oy-top)/H).toFixed(4),wpx:W,tips};
 console.log(kind,W,H,CW,CH,'bytes',bytes);}
await b.close();
const ic=[];for(const [i,s] of icons.entries()){const img=await sharp(s.base).composite([{input:s.gun}]).png().toBuffer();const t=await sharp(await sharp(img).trim().toBuffer()).resize(240,240,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).extend({top:8,bottom:8,left:8,right:8,background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();ic.push({input:t,left:i*256,top:0});}
await sharp({create:{width:512,height:256,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(ic).webp({quality:88}).toFile(path.join(root,'assets/defense412-icons.webp'));
fs.writeFileSync(path.join(dir,'defense412.json'),JSON.stringify(meta));console.log('ok');})();
