// Render 3D vehicles to assets/veh3d392-<name>.webp + features/render3d/vehicles3d.json
// Each atlas: 16 direction rows x frame columns. Origin (ground point under the model) is shared.
const fs=require('fs'),path=require('path');const dir=__dirname,root=path.resolve(dir,'../..');
const {chromium}=require(path.join(root,'node_modules/playwright'));const sharp=require(path.join(root,'node_modules/sharp'));
const DIRS=16;
// name -> [cell size, frames as [animFrame, fire]]
const JOBS={bomber:[160,[[0,0],[1,0]]],heli:[128,[[0,0],[1,0],[2,0],[0,1]]],tankHull:[128,[[0,0],[1,0]]],tankTurret:[128,[[0,0],[1,1]]],
 'tankHull:plasma':[128,[[0,0],[1,0]]],'tankTurret:plasma':[128,[[0,0],[1,1]]]};
(async()=>{const b=await chromium.launch({executablePath:process.env.NOVA_CHROMIUM||'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:320,height:320}});
await p.route('**/*',r=>{const f=path.join(dir,new URL(r.request().url()).pathname);return fs.existsSync(f)?r.fulfill({path:f,contentType:f.endsWith('.js')?'text/javascript':'text/html'}):r.fulfill({status:404});});
await p.goto('http://render.local/vehicles3d.html');await p.waitForFunction(()=>window.ready);
const meta={dirs:DIRS};
for(const [name,[C,frames]] of Object.entries(JOBS)){const SC=C/320,comps=[],m={cw:C,ch:C,frames:frames.length,muzzle:[]};let wmax=0;
 for(let d=0;d<DIRS;d++){const a=d*2*Math.PI/DIRS;
  for(let f=0;f<frames.length;f++){const r=await p.evaluate(([n,a,fr,fi])=>pose(n,a,fr,!!fi),[name,a,frames[f][0],frames[f][1]]);
   if(f===0){m.muzzle.push([+(r.mx*SC).toFixed(1),+(r.my*SC).toFixed(1)]);m.ox=+(r.ox*SC).toFixed(1);m.oy=+(r.oy*SC).toFixed(1);}
   const buf=await sharp(Buffer.from(r.img.split(',')[1],'base64')).resize(C,C).png().toBuffer();
   if(f===0){const raw=await sharp(buf).ensureAlpha().raw().toBuffer();let mn=C,mx=0;for(let y=0;y<C;y++)for(let x=0;x<C;x++)if(raw[(y*C+x)*4+3]>60){mn=Math.min(mn,x);mx=Math.max(mx,x);}wmax=Math.max(wmax,mx-mn);}
   comps.push({input:buf,left:f*C,top:d*C});}}
 m.w=wmax;const file=name.replace(':','-');
 await sharp({create:{width:frames.length*C,height:DIRS*C,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(comps).webp({quality:85,effort:6}).toFile(path.join(root,'assets/veh3d392-'+file+'.webp'));
 meta[name]=m;console.log(name,fs.statSync(path.join(root,'assets/veh3d392-'+file+'.webp')).size,m.w,m.ox,m.oy);}
await b.close();fs.writeFileSync(path.join(dir,'vehicles3d.json'),JSON.stringify(meta));})();
