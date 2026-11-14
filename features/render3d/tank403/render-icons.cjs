// 403: resource icons (liquid balls) for the HUD atlas (assets/resources303.webp cells 1-2) and assets/fluids403.webp.
const fs=require('fs'),path=require('path');const dir=path.resolve(__dirname,'..'),root=path.resolve(dir,'../..');
const {chromium}=require(path.join(root,'node_modules/playwright'));const sharp=require(path.join(root,'node_modules/sharp'));
(async()=>{const b=await chromium.launch({executablePath:process.env.NOVA_CHROMIUM||'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:320,height:712},deviceScaleFactor:1});
await p.route('**/*',r=>{const f=path.join(dir,new URL(r.request().url()).pathname);return fs.existsSync(f)?r.fulfill({path:f,contentType:f.endsWith('.js')?'text/javascript':'text/html'}):r.fulfill({status:404});});
await p.goto('http://render.local/tank403/tank3d.html');await p.waitForFunction(()=>window.ready);
for(const k of ['x','y','z']){const r=await p.evaluate(k=>{setRes(960,2136);return pose(k,2,1,false);},k);fs.writeFileSync('/tmp/icon-'+k+'.png',Buffer.from(r.img.split(',')[1],'base64'));}
await b.close();})();
