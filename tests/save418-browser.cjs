// 418: bases come back from the server copy; a smaller phone base never overwrites it; broken saves are repaired, not dropped.
const fs=require('fs'),assert=require('assert'),{chromium}=require('playwright'),{payload,documentPayload}=require('../features/titan342/build.cjs');
process.chdir(require('path').resolve(__dirname,'..'));
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined,args:['--no-sandbox','--enable-unsafe-swiftshader']});
let source=fs.readFileSync('game.js','utf8'),end=source.lastIndexOf('})(typeof globalThis');
source=source.slice(0,end)+"root.__t={E:function(){return E;}};"+source.slice(end);
const game=payload(source),html=documentPayload(fs.readFileSync('index.html','utf8'));
async function run(init,wait){const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{const u=new URL(route.request().url()),p=u.pathname.slice(1);if(u.hostname!=='nova.test')return route.abort();if(!p||p==='index.html')return route.fulfill({body:html,contentType:'text/html'});if(p==='game.js')return route.fulfill({body:game,contentType:'text/javascript'});if(fs.existsSync(p))return route.fulfill({body:fs.readFileSync(p)});return route.abort();});
 await page.addInitScript(init);await page.goto('https://nova.test/');await page.waitForFunction(()=>!!window.__t);await page.waitForTimeout(wait||8000);
 const out=await page.evaluate(()=>{const E=__t.E();return {hq:E.hq(),n:E.d.buildings.length,gold:E.d.gold,puts:(window.__puts||[]).length,putHQ:(window.__puts||[]).map(p=>p.hq),modal:document.getElementById('modal').innerText.slice(0,120),rescue:!!localStorage.getItem('novaRTS1Rescue418'),parked:(E.d.parked418||[]).length,types:E.d.buildings.map(b=>b.type)};});
 out.errors=errors;await page.close();return out;}
const mock=(server)=>`localStorage.setItem('novaRTSIntro','1');window.__puts=[];window.__server=${JSON.stringify(server)};
 window.NovaCloud={warAvailable:()=>true,hasAccount:()=>true,available:()=>false,load(){},save(){},provider:()=>'google',accountInfo:()=>'{}',
  warRequest(a,p,id){p=JSON.parse(p);setTimeout(()=>{let data={enrolled:false};if(p.save418==='get')data={save418:__server};else if(p.save418==='put'){__puts.push(p);data={save418:{stored:true}};}else if(p.restore412)data={restore412:{available:false}};window.novaCloudEvent('war',{action:a,request_id:id,data});},50);}};`;
const big=[{id:1,type:'hq',x:10,y:10,lv:6},{id:2,type:'mine',x:13,y:10,lv:4},{id:3,type:'reactor',x:7,y:10,lv:4},{id:4,type:'gun',x:10,y:13,lv:5},{id:5,type:'barracks',x:10,y:7,lv:3},{id:6,type:'camp',x:14,y:14,lv:3}];
const fullSave={version:1,gems:30,checkin:{day:-1,streak:0},rewardIds:[],gold:4321,power:1234,stage:3,stars:{},army:[5,2,1,0,0,0,0,0,0,0,0,0,0,0,0],queue:[],last:Date.now(),buildings:big,next:7,mapSize:20};
// 1) brand-new phone base + full server copy -> comes back automatically, then is backed up again
let r=await run(new Function(mock({hq:6,save:fullSave,layout:null,layout_hq:0})));console.log('1',JSON.stringify(r));
assert.equal(r.hq,6);assert.ok(/กู้คืน|base is back/i.test(r.modal));assert.deepEqual(r.errors,[]);
// 2) brand-new phone base + only a published layout -> rebuilt from the layout
r=await run(new Function(mock({hq:4,save:null,layout:big.map(b=>({type:b.type,x:b.x,y:b.y,lv:b.type==='hq'?4:b.lv})),layout_hq:4,gold:5000,power:5000})));console.log('2',JSON.stringify(r));
assert.equal(r.hq,4);assert.equal(r.n,6);
// 3) the phone base is the bigger one -> nothing restored, phone base is backed up
r=await run(new Function(`localStorage.setItem('novaRTS1',${JSON.stringify(JSON.stringify(fullSave))});`+mock({hq:2,save:null,layout:null,layout_hq:0})));console.log('3',JSON.stringify(r));
assert.equal(r.hq,6);assert.ok(r.puts>=1&&r.putHQ[0]===6);
// 4) a save with a building type this version does not know is repaired, not replaced by a new base
const odd=Object.assign({},fullSave,{buildings:big.concat([{id:9,type:'futuretower',x:3,y:3,lv:2}]),army:fullSave.army.concat([4,4])});
r=await run(new Function(`localStorage.setItem('novaRTS1',${JSON.stringify(JSON.stringify(odd))});`+mock({hq:0,save:null,layout:null,layout_hq:0})));console.log('4',JSON.stringify(r));
assert.equal(r.hq,6);assert.equal(r.parked,1);assert.ok(r.rescue);
// 5) no server data at all -> a new player keeps the new base and it is backed up
r=await run(new Function(mock({hq:0,save:null,layout:null,layout_hq:0})));console.log('5',JSON.stringify(r));
assert.equal(r.hq,1);assert.ok(r.puts>=1);
console.log('save418 ok');await browser.close();})().catch(e=>{console.error(e);process.exit(1);});
