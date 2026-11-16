// Render the 412 defenses: assets/defense412-skyguard.webp, assets/defense412-inferno.webp, assets/defense412-icons.webp
// and features/render3d/defense412.json. Per kind the atlas holds, for tiers 0..2, 16 gun directions + the static
// base (cell tier*17+dir, tier*17+16), then the wreck (cell 51). 9 cells per row. All cells share one crop, so the
// base and the gun pictures line up; the anchor is the ground point of the building.
const fs=require('fs'),path=require('path');const dir=__dirname,root=path.resolve(dir,'../..');
const {chromium}=require(path.join(root,'node_modules/playwright'));const sharp=require(path.join(root,'node_modules/sharp'));
const CW=224,COLS=9,PAD=200;
(async()=>{const b=await chromium.launch({executablePath:process.env.NOVA_CHROMIUM||'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:670,height:690}});
await p.route('**/*',r=>{const f=path.join(dir,new URL(r.request().url()).pathname);return fs.existsSync(f)?r.fulfill({path:f,contentType:f.endsWith('.js')?'text/javascript':'text/html'}):r.fulfill({status:404});});
await p.goto('http://render.local/defense412.html');await p.waitForFunction(()=>window.ready);
const meta={cols:COLS,dirs:16,kinds:{}},icons=[];
for(const kind of ['skyguard','inferno']){
 const shots=[];
 for(let t=0;t<3;t++){for(let d=0;d<16;d++)shots.push({cell:t*17+d,r:await p.evaluate(([k,t,d])=>pose(k,t,'gun',d),[kind,t,d])});
  shots.push({cell:t*17+16,r:await p.evaluate(([k,t])=>pose(k,t,'base',0),[kind,t])});}
 shots.push({cell:51,r:await p.evaluate(([k])=>pose(k,0,'wreck',0),[kind])});
 // union of the opaque area
 let x0=1e9,y0=1e9,x1=-1,y1=-1;
 for(const s of shots){const {data,info}=await sharp(Buffer.from(s.r.img.split(',')[1],'base64')).raw().ensureAlpha().toBuffer({resolveWithObject:true});s.buf=Buffer.from(s.r.img.split(',')[1],'base64');
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}}
 const ox=shots[0].r.ox,oy=shots[0].r.oy;
 // symmetric around the ground point horizontally so the anchor is the cell's centre column
 const half=Math.max(ox-x0,x1-ox)+4;const left=Math.floor(ox-half),top=y0-4,W=Math.ceil(2*half),H=y1-top+5,CH=Math.round(CW*H/W);
 const comps=[];
 for(const s of shots){const big=await sharp(s.buf).extend({top:PAD,bottom:PAD,left:PAD,right:PAD,background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
  const cell=await sharp(await sharp(big).extract({left:left+PAD,top:top+PAD,width:W,height:H}).png().toBuffer()).resize(CW,CH).png().toBuffer();
  comps.push({input:cell,left:(s.cell%COLS)*CW,top:Math.floor(s.cell/COLS)*CH});
  const ik=kind==='skyguard'?0:1;icons[ik]=icons[ik]||{};if(s.cell===16)icons[ik].base=s.buf;if(s.cell===8)icons[ik].gun=s.buf;}
 const tips=[[],[],[]],nMain=[];
 for(const s of shots){if(s.cell>=51||s.cell%17===16)continue;const t=Math.floor(s.cell/17);tips[t][s.cell%17]=s.r.tips.map(q=>[+((q[0]-left)/W).toFixed(3),+((q[1]-top)/H).toFixed(3)]);nMain[t]=s.r.nMain;}
 meta.kinds[kind]={file:'assets/defense412-'+kind+'.webp',cw:CW,ch:CH,ax:+((ox-left)/W).toFixed(4),ay:+((oy-top)/H).toFixed(4),wpx:W,tips,nMain};
 const rows=Math.ceil(52/COLS);
 await sharp({create:{width:COLS*CW,height:rows*CH,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(comps).webp({quality:86,effort:6,alphaQuality:90}).toFile(path.join(root,meta.kinds[kind].file));
 console.log(kind,W,H,CW,CH,fs.statSync(path.join(root,meta.kinds[kind].file)).size);}
await b.close();
// icons: base + gun facing up-left, square 256 each
const ic=[];for(const [i,s] of icons.entries()){const img=await sharp(s.base).composite([{input:s.gun}]).png().toBuffer();const t=await sharp(await sharp(img).trim().toBuffer()).resize(240,240,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).extend({top:8,bottom:8,left:8,right:8,background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();ic.push({input:t,left:i*256,top:0});}
await sharp({create:{width:512,height:256,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(ic).webp({quality:88}).toFile(path.join(root,'assets/defense412-icons.webp'));
fs.writeFileSync(path.join(dir,'defense412.json'),JSON.stringify(meta));console.log('ok');})();
