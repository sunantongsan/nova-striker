const {chromium}=require('playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true});
fs.mkdirSync('qa306',{recursive:true});
const page=await browser.newPage();
await page.route('**/*',route=>{const path=new URL(route.request().url()).pathname.slice(1)||'index.html';if(!path.includes('..')&&fs.existsSync(path))return route.fulfill({path});return route.abort();});
await page.route('**/game.js',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync('game.js','utf8').replace('})(typeof globalThis!==','root.qa306={e:E};})(typeof globalThis!==')}));
await page.addInitScript(()=>{localStorage.setItem('novaLanguage','th');localStorage.setItem('novaRTSIntro','1');});
for(const [width,height] of [[853,393],[740,360],[960,540],[393,853]]){
await page.setViewportSize({width,height});await page.goto('http://nova.test/',{waitUntil:'load'});
await page.evaluate(()=>{document.getElementById('welcome').hidden=true;document.getElementById('boot').style.display='none';document.getElementById('baseNameGate').hidden=true;Game.close();const e=qa306.e;e.d.gold=e.d.power=10000000;const b=e.d.buildings.find(b=>b.type==='hq');b.lv=6;Game.inspectBuilding261(b.id,true);});
const rect=await page.locator('#modal .sheet').boundingBox();
assert(rect.width*rect.height/(width*height)<=.34,'dialog uses at most one third of display');
if(width>height)assert(Math.abs(rect.width-width/3)<2,'landscape width is one third');
assert(await page.locator('.window-close243').isVisible());
await page.locator('#modal .sheet .green').last().scrollIntoViewIfNeeded();assert(await page.locator('#modal .sheet .green').last().isVisible());
await page.screenshot({path:'qa306/nova-menu-'+width+'.png'});
await page.locator('.window-close243').click();assert.equal(await page.locator('#modal').isVisible(),false);
console.log('PASS dialog geometry, scrolling, close:',width,height,rect);
}
await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
