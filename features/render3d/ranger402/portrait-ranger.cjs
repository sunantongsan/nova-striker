// 402: replace the ranger (kind 0) card portrait in assets/portraits393.webp (cell 0,0 of 200 px) with the android ranger.
const fs=require('fs'),path=require('path');const dir=__dirname,root=path.resolve(dir,'../../..');
const sharp=require(path.join(root,'node_modules/sharp'));
const pw=process.env.NOVA_PLAYWRIGHT||(fs.existsSync(path.join(root,'node_modules/playwright'))?path.join(root,'node_modules/playwright'):'/opt/npm-tools/node_modules/playwright');
const C=200,A=Math.PI/4+0.45;
(async()=>{const {chromium}=require(pw);const b=await chromium.launch({executablePath:process.env.NOVA_CHROMIUM||'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:240,height:256}});
await p.route('**/*',r=>{let u=decodeURIComponent(new URL(r.request().url()).pathname),f=u.startsWith('/three/')?path.join(root,'node_modules',u):u.startsWith('/m/')?path.join(root,u.slice(3)):path.join(dir,u);return fs.existsSync(f)?r.fulfill({path:f,contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.html')?'text/html':'application/octet-stream'}):r.fulfill({status:404});});
await p.goto('http://v.local/android3d.html?model=/m/staging/titan/forge/models/android-nova.glb');await p.waitForFunction(()=>window.ready,null,{timeout:300000});
await p.evaluate(()=>setZoom(1.2));const r=await p.evaluate(a=>pose(a,'attack',0),A);await b.close();
const trimmed=await sharp(Buffer.from(r.img.split(',')[1],'base64')).trim({threshold:1}).toBuffer();
const cell=await sharp(trimmed).resize(C-16,C-16,{fit:'inside'}).extend({top:8,bottom:8,left:8,right:8,background:{r:0,g:0,b:0,alpha:0}}).resize(C,C,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
const file=path.join(root,'assets/portraits393.webp'),sheet=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
for(let y=0;y<C;y++)sheet.data.fill(0,(y*sheet.info.width)*4,(y*sheet.info.width+C)*4);// clear cell 0
const out=await sharp(sheet.data,{raw:sheet.info}).composite([{input:cell,left:0,top:0}]).webp({quality:88,effort:6}).toBuffer();fs.writeFileSync(file,out);console.log('portrait',out.length);})();
