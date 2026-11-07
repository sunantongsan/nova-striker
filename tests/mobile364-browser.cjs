// Run with NOVA_PLAYWRIGHT, NOVA_CHROMIUM and optionally NOVA_THAI_FONT.
const fs=require('fs'),vm=require('vm'),path=require('path');const root=path.resolve(__dirname,'..');process.chdir(root);const {integrate}=require(root+'/features/titan342/build.cjs');let source=integrate(fs.readFileSync('game.js','utf8'));const ctx={console};vm.createContext(ctx);vm.runInContext(source,ctx);let now=Date.now();const e=new ctx.NovaRTS.Engine({getItem(){return null},setItem(){}},()=>now);e.d.buildings.find(b=>b.type==='hq').lv=20;e.d.buildings.find(b=>b.type==='camp').lv=20;e.d.buildings.push({id:30,type:'factory',lv:20,x:11,y:8},{id:31,type:'airbase',lv:20,x:12,y:8},{id:32,type:'tech',lv:20,x:13,y:8});e.d.buildings.push({id:200,type:'goldstore',lv:10,x:4,y:4});for(let i=1;i<=20;i++)e.d.buildings.push({id:300+i,type:'wall',lv:i,x:i%10,y:14+Math.floor(i/10)});e.d.gold=1750000;e.d.power=1740000;e.d.gems=9596762;e.d.army=[28,12,15,8,12,4,8,3,9,6,5];e.d.queue=[{kind:0,started:now,until:now+135000},{kind:1,started:now,until:now+230000},{kind:7,started:now,until:now+425000}];e.d.logistics277={next:3,ships:[{id:1,lv:2,cargo:[2,1,0,0,0,0,0,0,0,0,0]},{id:2,lv:1,cargo:Array(11).fill(0),until:now+250000}]};const buildingKinds=Object.keys(ctx.NovaRTS.buildings).filter(k=>!['crystalplant','crystalstore'].includes(k));buildingKinds.forEach((type,i)=>e.d.buildings.push({id:500+i,type,lv:10,x:20,y:20}));e.sync();

const end364=source.lastIndexOf('})(typeof globalThis');
source=source.slice(0,end364)+`root.mobileTest364={e:E,prepare:function(target){warBusy=false;warActive=null;request362=null;warState={targets:[target]};E.d.onlineCrystal={owner:'10000000-0000-4000-8000-000000000001'};E.d.gold=10000;},presence:presenceLabel364};`+source.slice(end364);
(async()=>{
 const assert=require('node:assert/strict'),{chromium}=require(process.env.NOVA_PLAYWRIGHT||'playwright');
 const browser=await chromium.launch({executablePath:process.env.NOVA_CHROMIUM||undefined,args:['--no-sandbox'],headless:true});
 const page=await browser.newPage({viewport:{width:844,height:390}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='nova.local')return route.fulfill({status:404,body:''});const f=u.pathname==='/'?'/index.html':u.pathname;if(f==='/game.js')return route.fulfill({contentType:'text/javascript',body:source});const file=path.join(root,f);return fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404,body:''});});
 await page.addInitScript(d=>{localStorage.setItem('novaRTS1',JSON.stringify(d));localStorage.setItem('novaLanguage','th');localStorage.setItem('novaRTSIntro','1');window.sent364=[];window.NovaCloud={hasAccount:()=>true,available:()=>true,warAvailable:()=>true,load(){},warRequest:(a,p,id)=>sent364.push({a,p:JSON.parse(p),id})};},JSON.parse(JSON.stringify(e.d)));
 await page.goto('http://nova.local/',{waitUntil:'domcontentloaded'});
 await page.evaluate(()=>{for(const id of ['welcome','baseNameGate','guideDock288']){const n=document.getElementById(id);if(n)n.style.display='none';}});
 for(const size of [{width:844,height:390},{width:640,height:300},{width:390,height:844}]){
  await page.setViewportSize(size);await page.waitForTimeout(80);
  const dock=await page.evaluate(()=>{const bar=document.getElementById('homebar'),nav=bar.parentElement.getBoundingClientRect(),field=document.getElementById('field').getBoundingClientRect(),buttons=[...bar.children].filter(b=>!b.hidden);return {full:Math.abs(field.bottom-innerHeight)<2,clear:getComputedStyle(bar.parentElement).backgroundColor==='rgba(0, 0, 0, 0)',compact:nav.height<=50,bottom:Math.abs(nav.bottom-innerHeight)<2,row:buttons.every(b=>Math.abs(b.getBoundingClientRect().top-buttons[0].getBoundingClientRect().top)<2),labels:buttons.every(b=>b.querySelector('.railLabel373')?.textContent.trim()),touch:buttons.every(b=>b.getBoundingClientRect().width>=44&&b.getBoundingClientRect().height>=44),count:buttons.length};});
  assert(dock.full&&dock.clear&&dock.compact&&dock.bottom&&dock.row&&dock.labels&&dock.touch&&dock.count===10,JSON.stringify({size,dock}));
  const topClear=await page.evaluate(()=>[document.querySelector('header'),document.querySelector('header .title>div'),...document.querySelectorAll('header .resources>*')].every(n=>{const s=getComputedStyle(n);return s.backgroundColor==='rgba(0, 0, 0, 0)'&&s.backgroundImage==='none'&&s.boxShadow==='none'&&parseFloat(s.borderTopWidth)===0;}));assert(topClear,'top HUD has icons and text without panels');
  await page.locator('#botAttack376').click();
  assert.equal(await page.locator('.missions button').count(),100,'bot icon opens existing 100 bot bases');
  await page.evaluate(()=>Game.close());
 }
 await page.setViewportSize({width:844,height:390});
 fs.mkdirSync('test-artifacts',{recursive:true});
 await page.evaluate(()=>Game.scout(1));await page.waitForTimeout(120);
 const battleDock=await page.evaluate(()=>{const app=document.getElementById('app'),nav=app.querySelector('nav').getBoundingClientRect(),field=document.getElementById('field').getBoundingClientRect();return {battle:app.dataset.battle300,full:Math.abs(field.bottom-innerHeight)<2,compact:nav.height<=80,clear:getComputedStyle(app.querySelector('nav')).backgroundColor==='rgba(0, 0, 0, 0)',bottom:Math.abs(nav.bottom-innerHeight)<2};});
 assert.equal(battleDock.battle,'true');assert(battleDock.full&&battleDock.compact&&battleDock.clear&&battleDock.bottom,JSON.stringify(battleDock));
 await page.screenshot({path:'test-artifacts/battle-menu376.png'});
 await page.evaluate(()=>Game.home());await page.waitForTimeout(80);
 fs.mkdirSync('test-artifacts',{recursive:true});await page.screenshot({path:'test-artifacts/bottom-menu376.png'});
 const target={id:'10000000-0000-4000-8000-000000000002',callsign:'ผู้บัญชาการฐานดาวเหนือทดสอบชื่อยาว',layout:[{type:'hq',lv:10,x:10,y:10}],presence364:{online:true,checked_at:new Date().toISOString()}};
 await page.evaluate(t=>{mobileTest364.prepare(t);Game.warScout(0);},target);
 assert.equal(await page.locator('#novaConfirm358').count(),0,'assembled payload must not show gold confirmation');
 const q=await page.evaluate(()=>sent364.findLast(q=>q.p.live==='siege_scout_gold362'));assert(q,'one tap sends paid scout');
 await page.evaluate(({q,target})=>novaCloudEvent('war',{request_id:q.id,data:{scout362:{owner:'10000000-0000-4000-8000-000000000001',id:q.p.request_id,cost:100},target}}),{q,target});
 await page.waitForTimeout(100);assert.equal(await page.locator('#opponent364 strong').textContent(),target.callsign);assert.equal(await page.locator('.presence364').textContent(),'ออนไลน์');
 assert.equal(await page.evaluate(()=>mobileTest364.presence({presence364:{online:false}}).state),'offline');
 assert.equal(await page.evaluate(()=>mobileTest364.presence({}).state),'unknown');
 fs.mkdirSync('test-artifacts',{recursive:true});await page.screenshot({path:'test-artifacts/opponent-844.png'});
 await page.evaluate(()=>Game.home());
 for(const size of [{width:844,height:390},{width:640,height:300},{width:390,height:844}]){
  await page.setViewportSize(size);
  for(const [name,call] of [['training','Game.training()'],['queue','Game.production359("all")'],['formation','Game.armyView360("formation")'],['build','Game.build()'],['shop','Game.shop348("nova")'],['settings','Game.settings()'],['daily','Game.openDaily340()'],['storage','Game.inspectBuilding261(200,true)'],['unit','Game.unitInfo278(1)'],['walls','Game.wallGallery361()']]){
   await page.evaluate(call);await page.waitForTimeout(60);
   const check=await page.evaluate(()=>{const w=document.querySelector('.novaWindow360'),b=w.querySelector('.novaContent360'),r=w.getBoundingClientRect(),close=w.querySelector('.window-close243').getBoundingClientRect();return {inBounds:r.x>=0&&r.y>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,compact:innerWidth<innerHeight||(r.width<=480.5&&r.height<=innerHeight*.76+1),noOverflow:b.scrollWidth<=b.clientWidth+1,touch:close.width>=44&&close.height>=44};});
   assert(Object.values(check).every(Boolean),name+JSON.stringify(size)+JSON.stringify(check));
   await page.screenshot({path:'test-artifacts/'+name+'-'+size.width+'.png'});
  }
 }
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS assembled mobile364: no gold confirmation, full opponent name, server presence labels, ten compact windows at three phone sizes');
})().catch(e=>{console.error(e);process.exit(1)});


