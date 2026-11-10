// Card portraits for all 11 troop kinds, taken from the same 3D models as the battlefield.
// Output: assets/portraits393.webp (4 x 3 cells of 200 px, kind k at col k%4, row floor(k/4)).
const fs=require('fs'),path=require('path');const dir=__dirname,root=path.resolve(dir,'../..');
const {chromium}=require(path.join(root,'node_modules/playwright'));const sharp=require(path.join(root,'node_modules/sharp'));
const C=200,A=Math.PI/4+0.45;
(async()=>{const b=await chromium.launch({executablePath:process.env.NOVA_CHROMIUM||'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
async function page(file,w,h){const p=await b.newPage({viewport:{width:w,height:h}});await p.route('**/*',r=>{const f=path.join(dir,new URL(r.request().url()).pathname);return fs.existsSync(f)?r.fulfill({path:f,contentType:f.endsWith('.js')?'text/javascript':'text/html'}):r.fulfill({status:404});});await p.goto('http://render.local/'+file);await p.waitForFunction(()=>window.ready);return p;}
const U=await page('units3d.html',240,256),V=await page('vehicles3d.html',320,320);
const png=d=>Buffer.from(d.split(',')[1],'base64');
const jobs={0:['u','ranger'],1:['t',''],2:['u','mech'],3:['u','drone'],4:['u','sniper'],5:['v','heli'],6:['u','shield'],7:['v','bomber'],8:['u','plasma'],9:['t',':plasma'],10:['u','heavy']};
const comps=[];
for(const [k,[kind,name]] of Object.entries(jobs)){let buf;
 if(kind==='u')buf=png((await U.evaluate(([n,a])=>pose(n,a,'idle',0),[name,A])).img);
 else if(kind==='v')buf=png((await V.evaluate(([n,a])=>pose(n,a,1,false),[name,A])).img);
 else{const h=png((await V.evaluate(([n,a])=>pose('tankHull'+n,a,0,false),[name,A])).img),t=png((await V.evaluate(([n,a])=>pose('tankTurret'+n,a,0,false),[name,A])).img);buf=await sharp(h).composite([{input:t}]).png().toBuffer();}
 const trimmed=await sharp(buf).trim({threshold:1}).toBuffer();
 const cell=await sharp(trimmed).resize(C-16,C-16,{fit:'inside'}).extend({top:8,bottom:8,left:8,right:8,background:{r:0,g:0,b:0,alpha:0}}).resize(C,C,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
 comps.push({input:cell,left:(k%4)*C,top:Math.floor(k/4)*C});}
await b.close();
await sharp({create:{width:4*C,height:3*C,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(comps).webp({quality:88,effort:6}).toFile(path.join(root,'assets/portraits393.webp'));
console.log(fs.statSync(path.join(root,'assets/portraits393.webp')).size);})();
