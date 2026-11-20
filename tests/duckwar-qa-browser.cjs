// Duck War QA: render the integrated game at phone size and save screenshots of the home base,
// the welcome screen and a raid with every 3D troop kind on the field. Output: qa-duck/*.png
const fs=require('fs'),path=require('path');
process.chdir(path.resolve(__dirname,'..'));
let source=require('../features/titan342/build.cjs').integrate(fs.readFileSync('game.js','utf8'));
const end=source.lastIndexOf('})(typeof globalThis');
source=source.slice(0,end)+`root.qaDuck={e:E,
 home:()=>{Game.guideFinish288();close();screen='home';const e=E;e.d.gold=e.d.power=1e7;const hq=e.d.buildings.find(b=>b.type==='hq');if(hq)hq.lv=+(window.qaHQ||1);hud();draw();},
 raid:(kinds)=>{Game.guideFinish288();E.scout(1);screen='raid';E.raid.liveMode=null;E.raid.army=U.map(()=>30);close();hud();
  kinds.forEach((k,i)=>{for(let j=0;j<3;j++)E.deploy(k,4+i*0.7+j*0.2,10.3+j*0.45);});paused=false;},
 zoom:(z,x,y)=>{zoom=z;panX=x;panY=y;draw();}};`+source.slice(end);
(async()=>{const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:process.env.NOVA_CHROMIUM||'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const [W,H]=(process.env.QA_SIZE||'844x390').split('x').map(Number);
const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:+(process.env.QA_DPR||2)}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname!=='nova.local')return r.fulfill({status:404,body:''});if(u.pathname==='/game.js')return r.fulfill({contentType:'text/javascript',body:source});const f=path.join(process.cwd(),u.pathname==='/'?'index.html':decodeURIComponent(u.pathname));return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404,body:''});});
await page.addInitScript(()=>{localStorage.setItem('novaLanguage','th');localStorage.setItem('novaRTSIntro','1');});
fs.mkdirSync('qa-duck',{recursive:true});
await page.goto('http://nova.local');await page.waitForTimeout(2500);
await page.screenshot({path:'qa-duck/0-welcome.png'});
await page.evaluate(()=>Game.welcomeGuest());await page.waitForTimeout(500);
await page.evaluate(()=>{qaDuck.e.d.guestName288='DUCK';const g=document.getElementById('baseNameGate');if(g)g.hidden=true;});
for(const lv of [1,5,9,13,17]){await page.evaluate(lv=>{window.qaHQ=lv;qaDuck.home();},lv);await page.waitForTimeout(1500);await page.screenshot({path:'qa-duck/1-home-hq'+lv+'.png'});}
const kinds=JSON.parse(process.env.QA_KINDS||'[0,2,3,4,6,8,10]');
await page.evaluate(k=>qaDuck.raid(k),kinds);
for(const t of [600,2500,6000]){await page.waitForTimeout(t);await page.screenshot({path:'qa-duck/2-raid-'+t+'.png'});}
const box=await page.evaluate(()=>{const r=qaDuck.e.raid;return r.troops.filter(t=>t.hp>0).length;});console.log('alive',box);
const pts=await page.evaluate(()=>{const c=document.querySelector('canvas');const r=c.getBoundingClientRect();return {w:r.width,h:r.height};});
await page.screenshot({path:'qa-duck/3-raid-zoom.png',clip:{x:W*0.38,y:H*0.12,width:W*0.24,height:H*0.42}});
console.log('errors:',errors.slice(0,10));await browser.close();})().catch(e=>{console.error(e);process.exit(1);});
