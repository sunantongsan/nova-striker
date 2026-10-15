const vm=require('vm'),fs=require('fs'),assert=require('assert'),crypto=require('crypto').webcrypto;
const elements={},data={novaRTSIntro:'1'},requests=[];
const ctx=new Proxy({measureText:t=>({width:t.length*8})},{get:(o,k)=>o[k]||(()=>{})});
const el=id=>elements[id]||(elements[id]={style:{},innerHTML:'',textContent:'',addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:420,height:600}),querySelectorAll:()=>[]});
let frame;
const sandbox={console,crypto,Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:()=>0,clearTimeout(){},Image:class{},localStorage:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v},document:{getElementById:el,addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame:f=>frame=f,NovaCloud:{warAvailable:()=>true,available:()=>true,war:(action,payload)=>requests.push({action,payload:JSON.parse(payload)})}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('game.js','utf8'),sandbox);
const G=sandbox.Game,event=(action,d)=>sandbox.novaCloudEvent('war',{action,data:d}),wallet={owner:'account-a',test_gems:10000,can_claim:false};
G.treasury();assert(el('modal').innerHTML.includes('10,000'));G.legacyGems();assert.equal(requests.at(-1).action,'test_status');event('test_status',wallet);assert(el('modal').innerHTML.includes('10,000 เพชร'));
G.testQuote('gold');assert(el('modal').innerHTML.includes("Game.testExchange('gold',10)"));G.testExchange('gold',1);const r=requests.at(-1);assert.equal(r.action,'test_exchange');event('test_exchange',{...wallet,test_gems:9990,receipt:{id:r.payload.request_id,kind:'gold',amount:500}});let save=JSON.parse(data.novaRTS1);assert.equal(save.gold,1400);assert(!save.pendingTest);event('test_exchange',{...wallet,receipt:{id:r.payload.request_id,kind:'gold',amount:500}});assert.equal(JSON.parse(data.novaRTS1).gold,1400);
G.warTargets();assert.equal(requests.at(-1).action,'test_targets');event('test_targets',{...wallet,target:{id:'bot',callsign:'<test>',bot:true,tier:1,layout:[{type:'hq',x:10,y:10},{type:'gun',x:8,y:10},{type:'wall',x:9,y:10}]}});assert(el('modal').innerHTML.includes('&lt;test&gt;'));G.practiceStart();assert(el('mode').textContent.includes('ทดสอบบุก'));frame(100);assert.equal(el('boot').style.display,'none','drawing player layout does not crash');G.retreat();assert(el('modal').innerHTML.includes('ผลการบุกทดสอบ'));G.home();
console.log('PASS UI 1.7: daily shop, exchange receipt delivery/retry, random target preview, manual scene, render and retreat');

