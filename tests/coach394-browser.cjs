// Clash-style first-play tutorial (394): a new player is walked through name -> gold mine ->
// train -> campaign stage 1 -> turret, one highlighted control at a time, on a portrait phone.
// Run with NOVA_PLAYWRIGHT and NOVA_CHROMIUM (same as the other *-browser tests).
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');process.chdir(root);
const {integrate}=require(root+'/features/titan342/build.cjs');
const source=integrate(fs.readFileSync('game.js','utf8'));
(async()=>{
 const {chromium}=require(process.env.NOVA_PLAYWRIGHT||'playwright');
 const browser=await chromium.launch({executablePath:process.env.NOVA_CHROMIUM||undefined,args:['--no-sandbox'],headless:true});
 const out=path.join(root,'test-artifacts');fs.mkdirSync(out,{recursive:true});
 async function session(init,arg){
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='nova.local')return route.fulfill({status:404,body:''});const f=u.pathname==='/'?'/index.html':decodeURIComponent(u.pathname);if(f==='/game.js')return route.fulfill({contentType:'text/javascript',body:source});const file=path.join(root,f);return fs.existsSync(file)&&fs.statSync(file).isFile()?route.fulfill({path:file}):route.fulfill({status:404,body:''});});
  await page.addInitScript(init||(()=>{localStorage.setItem('novaLanguage','th');}),arg);
  await page.goto('http://nova.local/',{waitUntil:'domcontentloaded'});await page.waitForTimeout(1800);
  return {page,errors};
 }
 const text=page=>page.evaluate(()=>{const c=document.querySelector('#coach394');return !c||c.hidden?'':c.querySelector('.c394-copy p').textContent;});
 const step=page=>page.evaluate(()=>(JSON.parse(localStorage.getItem('novaRTS1')||'{}').coach394||{}).step);
 const ring=page=>page.evaluate(()=>{const r=document.querySelector('#coach394 .c394-ring');if(!r||r.hidden)return null;const b=r.getBoundingClientRect();return [b.left+b.width/2,b.top+b.height/2];});
 async function tapRing(page){const p=await ring(page);assert.ok(p,'expected a highlighted control: '+await text(page));await page.mouse.click(p[0],p[1]);await page.waitForTimeout(800);}
 async function tapGo(page){await page.click('#coach394 .c394-go');await page.waitForTimeout(600);}
 async function until(page,re,ms){const end=Date.now()+ms;while(Date.now()<end){const t=await text(page);if(re.test(t))return t;await page.waitForTimeout(400);}throw Error('Timed out waiting for '+re+' last: '+await text(page));}
 async function tapWorld(page,x,y){await page.mouse.click(x,y);await page.waitForTimeout(700);}

 // Construction controls clear the bottom HUD, and resource cards show a single sprite.
 {const {page,errors}=await session();
  await page.setViewportSize({width:853,height:393});
  await page.evaluate(()=>{
   document.getElementById('welcome').hidden=true;
   document.getElementById('baseNameGate').hidden=true;
   document.getElementById('boot').style.display='none';
   Game.close();
   Game.inspectBuilding261(3);
  });
  await page.evaluate(()=>Game.moveBuilding261());
  const controls=page.locator('#moveControls');
  const rect=await controls.boundingBox();
  assert.ok(rect&&rect.x>680&&rect.x+rect.width<=842&&rect.y+rect.height<300,'placement controls must clear the bottom HUD');
  await page.screenshot({path:out+'/coach394-placement.png'});
  await page.locator('#moveCancel').click();
  assert.equal(await controls.isVisible(),false);
  await page.evaluate(()=>Game.build('economy'));
  const sizes=await page.locator('.build-card261').evaluateAll(cards=>cards.slice(0,3).map(card=>getComputedStyle(card.querySelector('.icon')).backgroundSize));
  assert.deepEqual(sizes,['400% 400%','400% 400%','300% 300%']);
  await page.screenshot({path:out+'/coach394-resource-icons.png'});
  assert.deepEqual(errors,[]);await page.close();}

 // 1. New guest: the whole tutorial, every instruction pointing at a visible control.
 {const {page,errors}=await session();
  await page.click('#welcomeGuest');await until(page,/สวัสดี/,6000);await page.screenshot({path:out+'/coach394-hello.png'});
  await tapGo(page);await until(page,/ตั้งชื่อฐาน/,3000);await tapGo(page);
  await page.fill('#baseNameInput','ฐานทดสอบ');await page.click('#baseNameSubmit');
  await until(page,/สร้างเหมืองทอง/,4000);await tapRing(page);
  await until(page,/ที่เหมืองทอง/,3000);await page.screenshot({path:out+'/coach394-build.png'});await tapRing(page);
  await until(page,/วางเหมืองทอง/,3000);for(const [x,y] of [[195,560],[120,520],[270,600],[200,650]]){await tapWorld(page,x,y);if(!/วางเหมืองทอง/.test(await text(page)))break;}
  await until(page,/ทองและพลังงาน/,3000);await tapGo(page);
  await until(page,/กองทัพ/,3000);await tapRing(page);
  await until(page,/เรนเจอร์/,3000);await page.screenshot({path:out+'/coach394-army.png'});await tapRing(page);
  await until(page,/ปิดหน้าต่าง/,3000);await tapRing(page);
  await until(page,/บุกด่าน/,3000);await tapRing(page);
  await until(page,/ด่าน 1/,3000);await tapRing(page);
  await until(page,/ปล่อยทหาร/,5000);await page.screenshot({path:out+'/coach394-battle.png'});
  for(const [x,y] of [[200,330],[150,420],[260,420],[200,520],[120,360],[280,360]])for(let i=0;i<3;i++)await tapWorld(page,x+i*4,y);
  const end=await until(page,/จบการรบ/,150000);if(/ทหารหมด/.test(end)){await tapGo(page);}
  await until(page,/กลับฐาน/,8000);await tapRing(page);
  await until(page,/ป้องกันฐาน/,8000);await tapRing(page);
  await until(page,/แตะ “สร้าง” ที่/,3000);await tapRing(page);
  await until(page,/วาง/,3000);for(const [x,y] of [[260,480],[150,470],[200,620],[300,560]]){await tapWorld(page,x,y);if(/เยี่ยมมาก/.test(await text(page)))break;}
  await until(page,/เยี่ยมมาก/,4000);await page.screenshot({path:out+'/coach394-done.png'});await tapGo(page);
  assert.equal(await text(page),'');
  const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('novaRTS1')));
  assert.equal(save.coach394.done,true);assert.equal(save.tips390.enabledByPlayer,true,'periodic tips switch on after the tutorial');
  assert.ok(save.buildings.filter(b=>b.type==='mine').length>=2&&save.buildings.some(b=>b.type==='gun'));
  // Settings: a single replay entry, no duplicated tutorial buttons.
  await page.evaluate(()=>Game.settings());await page.waitForTimeout(500);
  const labels=await page.evaluate(()=>[...document.querySelectorAll('#modal button')].map(b=>b.textContent.trim()));
  assert.ok(labels.some(l=>/สอนเล่นอีกครั้ง/.test(l)));assert.ok(!labels.some(l=>/^\? วิธีเล่น|ดูคำแนะนำทั้งหมด|สอนเล่นทีละขั้น/.test(l)),labels.join('|'));
  // Bottom HUD: every shortcut fully on screen and none overlapping.
  await page.evaluate(()=>Game.close());
  const boxes=await page.evaluate(()=>[...document.querySelectorAll('#homebar>button')].map(b=>b.getBoundingClientRect()).filter(r=>r.width>0).map(r=>[r.left,r.top,r.right,r.bottom]));
  for(const b of boxes)assert.ok(b[0]>=0&&b[2]<=390&&b[1]>=0&&b[3]<=844,'rail button off screen '+b);
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],c=boxes[j];assert.ok(a[2]<=c[0]||c[2]<=a[0]||a[3]<=c[1]||c[3]<=a[1],'rail buttons overlap');}
  await page.screenshot({path:out+'/coach394-home.png'});
  assert.deepEqual(errors,[]);await page.close();}

 // 2. An existing developed base is never interrupted by the tutorial.
 {const vm=require('vm'),ctx={console};vm.createContext(ctx);vm.runInContext(source,ctx);
  const e=new ctx.NovaRTS.Engine({getItem(){return null},setItem(){}},()=>Date.now());e.d.buildings.find(b=>b.type==='hq').lv=3;const save=JSON.parse(JSON.stringify(e.d));
  const {page,errors}=await session(d=>{if(!sessionStorage.getItem('seeded394')){sessionStorage.setItem('seeded394','1');localStorage.setItem('novaLanguage','th');localStorage.setItem('novaRTS1',JSON.stringify(d));}},save);
  if(await page.isVisible('#welcomeGuest'))await page.click('#welcomeGuest');await page.waitForTimeout(3500);
  assert.equal(await text(page),'','developed base must not see the first-play tutorial');
  assert.equal(await page.evaluate(()=>!!document.querySelector('#guideDock288:not([hidden])')),false,'old guide card stays hidden');
  // ...but can replay it from Settings.
  await page.evaluate(()=>Game.coachStart394());await page.waitForTimeout(600);assert.match(await text(page),/สวัสดี/);
  assert.deepEqual(errors,[]);await page.close();}
 console.log('coach394 browser: ok');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
