const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),{chromium}=require('playwright');
const source=require('../features/titan342/build.cjs').integrate(fs.readFileSync(path.join(root,'game.js'),'utf8'));
const ctx={console};vm.createContext(ctx);vm.runInContext(source,ctx);
const engine=new ctx.NovaRTS.Engine({getItem(){return null},setItem(){}},()=>Date.now());
const java=fs.readFileSync(path.join(root,'app/src/main/java/com/sunantongsan/novastriker/BannerLayout.java'),'utf8');
const script=JSON.parse(java.match(/static final String SCRIPT = (.*);/)[1]);
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
 const page=await browser.newPage({viewport:{width:844,height:390}});
 await page.route('**/*',route=>{
  const u=new URL(route.request().url());if(u.hostname!=='nova.local')return route.fulfill({status:404,body:''});
  if(u.pathname==='/game.js')return route.fulfill({contentType:'text/javascript',body:source});
  const f=path.join(root,u.pathname==='/'?'index.html':u.pathname);return fs.existsSync(f)?route.fulfill({path:f}):route.fulfill({status:404,body:''});
 });
 await page.addInitScript(d=>{localStorage.setItem('novaRTS1',JSON.stringify(d));localStorage.setItem('novaRTSIntro','1');window.NovaAds={bannerLayoutAllowed(v){window.bannerAllowed=v;}};},JSON.parse(JSON.stringify(engine.d)));
 await page.goto('http://nova.local/',{waitUntil:'domcontentloaded'});
 await page.evaluate(()=>{for(const id of ['welcome','boot','baseNameGate','guideDock288','selection','moveControls']){const n=document.getElementById(id);if(n)n.style.display='none';}Game.close();});
 await page.evaluate(script);
 for(const width of [720,844,1024]){
  await page.setViewportSize({width,height:390});
  await page.evaluate(()=>{document.documentElement.style.setProperty('--safe-right303','20px');window.novaBannerLayout39(true);});
  await page.waitForTimeout(100);
  const state=await page.evaluate(()=>{
   const ad={left:innerWidth-344,right:innerWidth-24,top:4,bottom:54};
   const buttons=[...document.querySelectorAll('button')].filter(e=>!e.hidden&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden');
   const overlap=buttons.filter(e=>{const r=e.getBoundingClientRect();return r.left<ad.right&&r.right>ad.left&&r.top<ad.bottom&&r.bottom>ad.top;}).map(e=>e.id||e.textContent);
   return {active:document.documentElement.hasAttribute('data-nova-banner39'),overlap,fieldTop:document.getElementById('field').getBoundingClientRect().top};
  });
  assert.equal(state.active,true,JSON.stringify({width,state}));assert.deepEqual(state.overlap,[],JSON.stringify({width,state}));assert.equal(state.fieldTop,0);
 }
 await page.evaluate(()=>{document.getElementById('app').dataset.battle300='true';});await page.waitForTimeout(60);
 assert.equal(await page.evaluate(()=>window.bannerAllowed),false,'battle hides banner');
 await page.evaluate(()=>{document.getElementById('app').dataset.battle300='false';document.getElementById('modal').style.display='flex';});await page.waitForTimeout(60);
 assert.equal(await page.evaluate(()=>window.bannerAllowed),false,'dialog hides banner');
 await page.evaluate(()=>{document.getElementById('modal').style.display='none';});await page.waitForTimeout(60);
 assert.equal(await page.evaluate(()=>window.bannerAllowed),true,'closing dialog restores placement');
 await page.setViewportSize({width:640,height:300});await page.waitForTimeout(60);
 assert.equal(await page.evaluate(()=>window.bannerAllowed),false,'narrow screen does not clip ad');
 await page.setViewportSize({width:844,height:390});await page.evaluate(()=>window.novaBannerLayout39(false));
 assert.equal(await page.evaluate(()=>document.documentElement.hasAttribute('data-nova-banner39')),false,'no fill reclaims corner');
 console.log('PASS borderless banner: three landscape widths, cutout, no control overlap, battle/dialog/narrow/no-fill states');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
