const fs=require('fs'),path=require('path');const dir=__dirname,root=path.resolve(dir,'../..');
const {chromium}=require(path.join(root,'node_modules/playwright'));const sharp=require(root+'/node_modules/sharp');
const C=200,A=Math.PI/4+0.45;
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:240,height:256}});
await p.route('**/*',r=>{const f=path.join(dir,new URL(r.request().url()).pathname);return fs.existsSync(f)?r.fulfill({path:f,contentType:f.endsWith('.js')?'text/javascript':'text/html'}):r.fulfill({status:404});});
await p.goto('http://render.local/units3d.html');await p.waitForFunction(()=>window.ready);
const comps=[];const names=['surge','ember','colossus','lancer'];
for(let k=0;k<4;k++){const r=await p.evaluate(([n,a])=>pose(n,a,'idle',0),[names[k],A]);const buf=Buffer.from(r.img.split(',')[1],'base64');
 const trimmed=await sharp(buf).trim({threshold:1}).toBuffer();
 const fit=await sharp(trimmed).resize(C-16,C-16,{fit:'inside'}).png().toBuffer();const cell=await sharp(fit).resize(C,C,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
 comps.push({input:cell,left:k*C,top:0});}
await b.close();
await sharp({create:{width:4*C,height:C,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(comps).webp({quality:88,effort:6}).toFile(root+'/assets/red410-portraits.webp');
console.log(fs.statSync(root+'/assets/red410-portraits.webp').size);})();
