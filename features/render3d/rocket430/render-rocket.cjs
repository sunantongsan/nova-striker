// 430: render the android rocket trooper (kind 2) to assets/units3d392-mech.webp and the "mech" entry of features/render3d/units3d.json.
// Layout as render-units.cjs: rows = 8 grid directions, columns idle 0-3, walk 4-11, attack 12-15, death 16-20 (120x128 cells).
// Usage: node features/render3d/ranger402/render-ranger.cjs   (needs node_modules: three, sharp; playwright + Chrome)
const fs=require('fs'),path=require('path');const dir=__dirname,root=path.resolve(dir,'../../..');
const sharp=require(path.join(root,'node_modules/sharp'));
const pw=process.env.NOVA_PLAYWRIGHT||(fs.existsSync(path.join(root,'node_modules/playwright'))?path.join(root,'node_modules/playwright'):'/opt/npm-tools/node_modules/playwright');
const CW=120,CH=128,SC=CW/240,FR=[['idle',4],['walk',8],['attack',4],['death',5]];
(async()=>{const {chromium}=require(pw);
const b=await chromium.launch({executablePath:process.env.NOVA_CHROMIUM||'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:240,height:256}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.route('**/*',r=>{let u=decodeURIComponent(new URL(r.request().url()).pathname),f=u.startsWith('/three/')?path.join(root,'node_modules',u):u.startsWith('/m/')?path.join(root,u.slice(3)):path.join(dir,u);return fs.existsSync(f)?r.fulfill({path:f,contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.html')?'text/html':'application/octet-stream'}):r.fulfill({status:404});});
await p.goto('http://v.local/rocket3d.html?model=/m/staging/titan/forge/models/android-nova.glb');await p.waitForFunction(()=>window.ready,null,{timeout:300000});
const comps=[],mz=[];let ax=0,ay=0,top=CH;
for(let d=0;d<8;d++){let col=0;const a=d*Math.PI/4;
 for(const [anim,n] of FR)for(let f=0;f<n;f++){const r=await p.evaluate(([a,anim,f])=>pose(a,anim,f),[a,anim,f]);
  // 2 px navy outline like the other troops
  const big=await sharp(Buffer.from(r.img.split(',')[1],'base64')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const W=big.info.width,Hh=big.info.height,src=big.data,out=Buffer.from(src);
  for(let y=0;y<Hh;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(src[i+3]>90)continue;let near=false;
   for(let dy=-3;dy<=3&&!near;dy++)for(let dx=-3;dx<=3;dx++){if(dx*dx+dy*dy>9)continue;const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=W||yy>=Hh)continue;if(src[(yy*W+xx)*4+3]>90){near=true;break;}}
   if(near){const a0=src[i+3]/255;out[i]=Math.round(30*(1-a0)+src[i]*a0);out[i+1]=Math.round(48*(1-a0)+src[i+1]*a0);out[i+2]=Math.round(92*(1-a0)+src[i+2]*a0);out[i+3]=255;}}
  const buf=await sharp(out,{raw:{width:W,height:Hh,channels:4}}).resize(CW,CH).png().toBuffer();comps.push({input:buf,left:col*CW,top:d*CH});
  ax=r.ox*SC;ay=r.oy*SC;if(anim==='attack'&&f===0)mz.push([+(r.mx*SC-ax).toFixed(1),+(r.my*SC-ay).toFixed(1)]);
  if(anim==='idle'&&f===0){const raw=await sharp(buf).ensureAlpha().raw().toBuffer();for(let y=0;y<CH;y++)for(let x=0;x<CW;x++)if(raw[(y*CW+x)*4+3]>60&&y<top)top=y;}
  col++;}}
const outFile=path.join(root,'assets/units3d392-mech.webp');
await sharp({create:{width:21*CW,height:8*CH,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(comps).webp({quality:86,effort:6}).toFile(outFile);
const metaPath=path.join(root,'features/render3d/units3d.json'),meta=JSON.parse(fs.readFileSync(metaPath));
meta.mech={ax:+ax.toFixed(1),ay:+ay.toFixed(1),h:+(ay-top).toFixed(1),muzzle:mz};fs.writeFileSync(metaPath,JSON.stringify(meta));
console.log('mech',fs.statSync(outFile).size,JSON.stringify(meta.mech));await b.close();})();
