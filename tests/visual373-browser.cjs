const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');process.chdir(root);
const {integrate}=require('../features/titan342/build.cjs');let source=integrate(fs.readFileSync('game.js','utf8'));
const end=source.lastIndexOf('})(typeof globalThis');
source=source.slice(0,end)+`root.visualTest373={e:E,tick:()=>guideTick288(),guide:()=>guide288,setStep:n=>{guide288.step=n;guideEnter337();},render:()=>draw()};`+source.slice(end);
(async()=>{
 const {chromium}=require('playwright');const browser=await chromium.launch({executablePath:process.env.NOVA_CHROMIUM||undefined,args:['--no-sandbox'],headless:true});
 const page=await browser.newPage({viewport:{width:844,height:390}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname!=='nova.local')return route.fulfill({status:404,body:''});const p=u.pathname==='/'?'/index.html':u.pathname;if(p==='/game.js')return route.fulfill({contentType:'text/javascript',body:source});const f=path.join(root,p);return fs.existsSync(f)?route.fulfill({path:f}):route.fulfill({status:404,body:''});});
 await page.addInitScript(()=>{localStorage.setItem('novaLanguage','th');localStorage.setItem('novaRTSIntro','1');});
 await page.goto('http://nova.local/');await page.evaluate(()=>Game.welcomeGuest());
 await page.evaluate(()=>{visualTest373.e.d.guestName288='NOVA';document.getElementById('baseNameGate').hidden=true;Game.beginGuide288(true);visualTest373.tick();visualTest373.tick();});
 await page.locator('#guideDock288').waitFor({state:'visible'});
 assert.equal(await page.evaluate(()=>visualTest373.guide().step),2);
 await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>visualTest373.guide().step),2,'no timer progression');
 fs.mkdirSync('test-artifacts',{recursive:true});
 for(const size of [{width:844,height:390},{width:640,height:300},{width:390,height:844}]){
  await page.setViewportSize(size);
  await page.evaluate(()=>{Game.close();visualTest373.setStep(2);visualTest373.tick();});
  await page.screenshot({path:'test-artifacts/guide-build-'+size.width+'.png'});
  const check=await page.evaluate(()=>{const dock=document.getElementById('guideDock288').getBoundingClientRect(),target=document.querySelector('.guide-focus288').getBoundingClientRect();return {bounds:dock.x>=0&&dock.y>=0&&dock.right<=innerWidth+1&&dock.bottom<=innerHeight+1,overlap:Math.max(0,Math.min(dock.right,target.right)-Math.max(dock.x,target.x))*Math.max(0,Math.min(dock.bottom,target.bottom)-Math.max(dock.y,target.y))};});
  assert(check.bounds);assert.equal(check.overlap,0,'coach does not cover Build');
 }
 await page.setViewportSize({width:844,height:390});
 await page.evaluate(()=>{visualTest373.setStep(4);Game.training();visualTest373.tick();});
 await page.locator('#novaTrain360_0.guide-focus288').waitFor();
 const visibleTrain=await page.locator('#novaTrain360_0').evaluate(b=>{const r=b.getBoundingClientRect(),body=b.closest('.novaContent360').getBoundingClientRect();return r.bottom<=body.bottom&&r.top>=body.top;});assert(visibleTrain,'training action is visible with its portrait');
 const before=await page.evaluate(()=>visualTest373.e.d.queue.length);await page.locator('#novaTrain360_0').click();
 assert.equal(await page.evaluate(()=>visualTest373.e.d.queue.length),before+1,'highlighted action trains for real');
 await page.evaluate(()=>{visualTest373.e.d.queue.forEach(q=>q.until=0);visualTest373.e.sync();visualTest373.tick();});
 assert.equal(await page.evaluate(()=>visualTest373.guide().step),5);
 await page.evaluate(()=>{Game.close();visualTest373.tick();});
 await page.locator('#guideDock288 button.green').click();
 await page.locator('#ships278').waitFor();await page.screenshot({path:'test-artifacts/guide-formation.png'});
 await page.locator('#guideDock288 .guide-skip337').click();assert.equal(await page.evaluate(()=>visualTest373.guide()),null);
 await page.evaluate(()=>{Game.settings();});await page.locator('.replayGuide373').click();await page.locator('#guideDock288').waitFor({state:'visible'});
 await page.evaluate(()=>Game.guideFinish288());
 for(const [name,call] of [['home','Game.home()'],['army','Game.armyView360("train")'],['build','Game.build()'],['settings','Game.settings()']]){await page.evaluate(call);await page.waitForTimeout(100);await page.screenshot({path:'test-artifacts/visual373-'+name+'.png'});if(name==='build'){const visible=await page.locator('.build-card261 .green:not(:disabled)').first().evaluate(b=>b.getBoundingClientRect().bottom<=b.closest('.novaContent360').getBoundingClientRect().bottom);assert(visible,'first build action is visible with its building');}}
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS visual373: guide placement on three viewports, real training, formation, skip/replay, screenshot capture and no runtime errors');
})().catch(e=>{console.error(e);process.exit(1);});
