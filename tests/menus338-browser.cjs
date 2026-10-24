const {chromium}=require('playwright');const assert=require('node:assert/strict');const path=require('node:path');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.NOVA_CHROMIUM||undefined,args:['--no-sandbox']});
for(const [width,height] of [[960,540],[800,360],[640,320],[390,844]]){
 const page=await browser.newPage({viewport:{width,height}});await page.route('https://**/*',r=>r.abort());
 await page.goto('file://'+path.resolve('index.html'));await page.waitForFunction(()=>!!window.Game);
 await page.evaluate(()=>{document.querySelector('#boot').style.display='none';document.querySelector('#welcome').hidden=true;document.querySelector('#baseNameGate').hidden=true;Game.guideFinish288();Game.close();});
 const rail=page.locator('#homebar');const buttons=rail.locator(':scope > button');assert.equal(await buttons.count(),6);
 const bounds=await rail.boundingBox();assert(bounds.x<80);assert(bounds.width<=52);
 for(let i=0;i<6;i++){const btn=buttons.nth(i);await btn.scrollIntoViewIfNeeded();const b=await btn.boundingBox();assert(b.width>=44&&b.height>=44);assert((await btn.getAttribute('aria-label')).length);assert.equal((await btn.innerText()).trim(),'');assert.equal(await btn.locator('svg').count(),1);}
 for(const name of ['build','training','settings']){await page.evaluate(n=>Game[n](),name);const sheet=page.locator('#modal .sheet');await sheet.waitFor({state:'visible'});const b=await sheet.boundingBox();if(width>height)assert(b.width<=width/3+1,'one-third panel');assert(b.x>=0&&b.x+b.width<=width+1);const overflow=await sheet.evaluate(e=>e.scrollWidth-e.clientWidth);assert(overflow<=1,`horizontal overflow ${name}: ${overflow}`);await page.evaluate(()=>Game.close());}
 // All six buttons retain their distinct original actions.
 const actions=await buttons.evaluateAll(bs=>bs.map(b=>b.getAttribute('onclick')));assert.deepEqual(actions,['Game.build()','Game.training()','Game.findWar()','Game.activities()','Game.treasury()','Game.settings()']);
 await page.evaluate(()=>{document.querySelector('#app').dataset.battle300='true';document.querySelector('#homebar').style.display='none';document.querySelector('#raidbar').style.display='block';});
 if(width>height){const b=await page.locator('#app>nav').boundingBox();assert(b.x>width/2,'battle commands remain on right');}
 console.log(`PASS ${width}x${height}: icon rail, touch targets, menus, overflow, battle HUD`);await page.close();
}await browser.close();})().catch(e=>{console.error(e);process.exit(1)});
