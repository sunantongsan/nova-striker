const fs=require('fs'),{chromium}=require('playwright'),{payload,documentPayload}=require('../features/titan342/build.cjs');
process.chdir(require('path').resolve(__dirname,'..'));
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2}),errors=[];page.on('pageerror',e=>errors.push(e.message));
let source=fs.readFileSync('game.js','utf8'),end=source.lastIndexOf('})(typeof globalThis');
source=source.slice(0,end)+"root.__t={E:function(){return E;}};"+source.slice(end);
const game=payload(source),html=documentPayload(fs.readFileSync('index.html','utf8'));
await page.route('**/*',async route=>{const u=new URL(route.request().url()),p=u.pathname.slice(1);if(u.hostname!=='nova.test')return route.abort();if(!p||p==='index.html')return route.fulfill({body:html,contentType:'text/html'});if(p==='game.js')return route.fulfill({body:game,contentType:'text/javascript'});if(fs.existsSync(p))return route.fulfill({body:fs.readFileSync(p)});return route.abort();});
await page.addInitScript(()=>{localStorage.setItem('novaRTSIntro','1');window.__calls=[];const layout=[{type:'hq',x:10,y:10,lv:3},{type:'mine',x:12,y:10,lv:2},{type:'gun',x:8,y:12,lv:3},{type:'crystalplant',x:14,y:14,lv:1}];for(let i=0;i<20;i++)layout.push({type:'wall',x:4+i%10,y:4+Math.floor(i/10),lv:2});
 window.NovaCloud={warAvailable:()=>true,hasAccount:()=>true,available:()=>false,load(){},save(){},provider:()=>'google',accountInfo:()=>'{}',
  warRequest(a,p,id){p=JSON.parse(p);__calls.push([a,p]);setTimeout(()=>window.novaCloudEvent('war',{action:a,request_id:id,data:p.restore412?{restore412:{available:true,claimed:!!p.claim,hq:3,count:layout.length,layout,gold:70000,power:70000}}:{enrolled:false}}),80);}};});
await page.goto('https://nova.test/');await page.waitForFunction(()=>!!window.__t);await page.waitForTimeout(5000);
console.log(await page.evaluate(()=>{const E=__t.E();return JSON.stringify({calls:__calls.map(c=>c[0]+':'+JSON.stringify(c[1])),hq:E.hq(),n:E.d.buildings.length,types:[...new Set(E.d.buildings.map(b=>b.type))],gold:E.d.gold,restored:!!E.d.restore412,modal:document.getElementById('modal').innerText.slice(0,200)});}));

await page.reload();await page.waitForFunction(()=>!!window.__t);await page.waitForTimeout(5000);
console.log(await page.evaluate(()=>{const E=__t.E();return JSON.stringify({calls:__calls.length,hq:E.hq(),n:E.d.buildings.length});}));
console.log('errors',errors);await browser.close();})();
