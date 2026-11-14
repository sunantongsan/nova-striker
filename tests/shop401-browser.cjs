const fs=require('fs'),vm=require('vm'),path=require('path'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..');const assert=require('node:assert/strict');
const source=require(root+'/features/titan342/build.cjs').integrate(fs.readFileSync(root+'/game.js','utf8'));
const ctx={console};vm.createContext(ctx);vm.runInContext(source,ctx);const e=new ctx.NovaRTS.Engine({getItem(){return null},setItem(){}},()=>Date.now());e.d.callsign='ฐาน NOVA';e.d.gold=5000;e.d.power=3000;e.sync();
(async()=>{const browser=await chromium.launch({args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:844,height:390}});page.on('pageerror',err=>console.log('PAGE ERROR',err.message));await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname!=='nova.local')return route.fulfill({status:404,body:''});const f=u.pathname==='/'?'index.html':u.pathname.slice(1);if(f==='game.js')return route.fulfill({contentType:'text/javascript',body:source});return fs.existsSync(path.join(root,f))?route.fulfill({path:path.join(root,f)}):route.fulfill({status:404,body:''});});await page.addInitScript(d=>{localStorage.setItem('novaRTS1',JSON.stringify(d));localStorage.setItem('novaLanguage','th');localStorage.setItem('novaRTSIntro','1');window.NovaCloud={hasAccount:()=>true,available:()=>true,warAvailable:()=>true,load(){},warRequest(){}};},JSON.parse(JSON.stringify(e.d)));await page.goto('http://nova.local/');await page.evaluate(()=>{for(const id of ['welcome','baseNameGate','guideDock288','coach394']){const n=document.getElementById(id);if(n)n.style.display='none';}});fs.mkdirSync(root+'/test-artifacts',{recursive:true});
for(const size of [{width:844,height:390},{width:640,height:300},{width:390,height:844}]){
 await page.setViewportSize(size);await page.waitForTimeout(200);
 const layout=await page.evaluate(()=>{
  const cart=document.getElementById('skillShop342'),builder=document.getElementById('builderBadge'),calendar=document.getElementById('dailyCheckin340');
  const a=cart.getBoundingClientRect(),b=builder.getBoundingClientRect(),c=calendar.getBoundingClientRect(),img=cart.querySelector('img').getBoundingClientRect();
  const inside=r=>r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1;
  const overlap=(x,y)=>x.left<y.right&&x.right>y.left&&x.top<y.bottom&&x.bottom>y.top;
  const hit=r=>document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
  return {cartSize:img.width>=56&&img.height>=56,builderTouch:b.width>=44&&b.height>=44,inside:inside(a)&&inside(b),separate:!overlap(a,b)&&!overlap(b,c),builderParent:builder.parentElement.id,cartHit:cart.contains(hit(a)),builderHit:builder.contains(hit(b)),loaded:cart.querySelector('img').naturalWidth>0};
 });
 await page.screenshot({path:root+'/test-artifacts/shop401-'+size.width+'.png'});
 assert.equal(layout.builderParent,'homebar');for(const [key,value]of Object.entries(layout))if(key!=='builderParent')assert.equal(value,true,size.width+' '+key+' '+JSON.stringify(layout));
 await page.locator('#skillShop342').click();assert(await page.locator('#modal .sheet').isVisible());await page.locator('.window-close243').click();
 await page.locator('#builderBadge').click();assert(await page.locator('#modal .sheet').isVisible());await page.locator('.window-close243').click();
}
await browser.close();console.log('PASS cart size, touch targets, placement and shop/builder navigation at three phone sizes');})().catch(e=>{console.error(e);process.exit(1)});
