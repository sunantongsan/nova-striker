// 395: Clash-style army flow - no transports, no formation step, red zone, hold-to-deploy, attack hub.
// Run with NOVA_PLAYWRIGHT and NOVA_CHROMIUM (same as the other *-browser tests).
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');process.chdir(root);
const {integrate}=require(root+'/features/titan342/build.cjs');
let source=integrate(fs.readFileSync('game.js','utf8'));
{const i=source.lastIndexOf('})(typeof globalThis');source=source.slice(0,i)+'root.test395={get E(){return E;},set liveTarget(v){liveTarget=v;},hud:function(){hud();}};\n'+source.slice(i);}
(async()=>{
 const {chromium}=require(process.env.NOVA_PLAYWRIGHT||'playwright');
 const browser=await chromium.launch({executablePath:process.env.NOVA_CHROMIUM||undefined,args:['--no-sandbox'],headless:true});
 const page=await browser.newPage({viewport:{width:853,height:393},isMobile:true,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='nova.local')return route.fulfill({status:404,body:''});const f=u.pathname==='/'?'/index.html':decodeURIComponent(u.pathname);if(f==='/game.js')return route.fulfill({contentType:'text/javascript',body:source});const p=path.join(root,f);if(!fs.existsSync(p))return route.fulfill({status:404,body:''});return route.fulfill({body:fs.readFileSync(p),contentType:f.endsWith('.html')?'text/html':f.endsWith('.webp')?'image/webp':undefined});});
 await page.addInitScript(()=>{localStorage.setItem('novaLanguage','th');});
 await page.goto('http://nova.local/',{waitUntil:'domcontentloaded'});await page.waitForTimeout(1800);
 await page.evaluate(()=>{document.getElementById('welcome').hidden=true;document.getElementById('baseNameGate').hidden=true;document.getElementById('boot').style.display='none';
  if(Game.coachSkip394){Game.coachSkip394();var y=document.querySelector('#coach394 .c394-go');if(y)y.click();}Game.close();
  const E=test395.E;E.d.army=E.d.army.map((v,i)=>[8,0,2,1,0,0,0,0,0,0,0][i]||0);E.d.gold=5000;E.save();});

 // Attack hub
 await page.evaluate(()=>Game.findWar());
 assert.equal(await page.locator('.hub395 .match395').count(),1);
 assert.equal(await page.locator('.hub395 .chip395').count(),3);
 // Army window: no formation tab, no transports
 await page.evaluate(()=>{Game.close();Game.training();});
 assert.equal(await page.locator('.novaTabs360 [onclick*="formation"]').count(),0);
 assert.equal(await page.locator('#army395 .chip395').count(),3);
 assert.equal(await page.locator('#modal [onclick*="fleet277"],#modal [onclick*="buyShip277"]').count(),0);
 // Battle starts directly with the full army
 await page.evaluate(()=>{Game.close();Game.scout(1);});await page.waitForTimeout(600);
 assert.equal(await page.locator('.directFormation360').count(),0);
 assert.equal(await page.locator('#deploy [onclick*="commandMode299"]').count(),0);
 assert.equal(await page.evaluate(()=>!!test395.E.raid.logistics277),false);
 // Red zone rejects drops next to buildings
 const red=await page.evaluate(()=>{const r=test395.E.raid,b=r.buildings.find(b=>b.type==='hq');return test395.E.deploy(0,b.x+1,b.y);});
 assert.match(red,/เขตสีแดง/);
 // Hold to keep deploying
 const before=await page.evaluate(()=>test395.E.raid.troops.length);
 await page.mouse.move(200,250);await page.mouse.down();await page.waitForTimeout(1000);await page.mouse.up();
 const after=await page.evaluate(()=>test395.E.raid.troops.length);
 assert.ok(after-before>=4,'holding drops several troops: '+(after-before));
 assert.equal(await page.evaluate(()=>test395.E.raid.troops.every(t=>t.kind===0)),true,'stream keeps the chosen troop type');
 // Scouting a player: End / Next and the troop bar
 await page.evaluate(()=>{Game.home();Game.scout(1);const r=test395.E.raid;r.liveMode='preview';r.name='Test';test395.liveTarget={id:'t',can_attack:true};test395.hud();});
 assert.equal(await page.locator('#deploy .next395').count(),1);
 assert.equal(await page.locator('#deploy .end395').count(),1);
 assert.equal(await page.locator('#deploy .troop').count()>0,true);
 assert.deepEqual(errors,[]);
 console.log('army395 browser: ok');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
