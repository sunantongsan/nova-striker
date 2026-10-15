const vm=require('vm'),fs=require('fs'),assert=require('assert'),crypto=require('crypto').webcrypto;
const elements={},data={novaRTSIntro:'1'},requests=[];
const ctx=new Proxy({measureText:t=>({width:t.length*8})},{get:(o,k)=>o[k]||(()=>{})});
const el=id=>elements[id]||(elements[id]={style:{},innerHTML:'',textContent:'',addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:420,height:600}),querySelectorAll:()=>[]});
let frame;
const sandbox={console,crypto,Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:()=>0,clearTimeout(){},Image:class{},localStorage:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v},document:{getElementById:el,addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame:f=>frame=f,NovaCloud:{warAvailable:()=>true,available:()=>true,war:(action,payload)=>requests.push({action,payload:JSON.parse(payload)})}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('game.js','utf8').replace("})(typeof globalThis!==","root.__engine=E;root.__heartbeat=function(){liveHeartbeat();};})(typeof globalThis!=="),sandbox);
const G=sandbox.Game,event=(action,d)=>sandbox.novaCloudEvent('war',{action,data:d}),wallet={owner:'account-a',test_gems:10000,can_claim:false};

const online={enrolled:true,owner:'a',tier:3,crystals:50000,capacity:100000,rate:0,research:{weapon:0,armor:0},enhancements:{'unit:0':5,'building:hq':10}};
G.war();event('status',online);G.enhanceInfo('unit:0',1);assert(el('modal').innerHTML.includes('150'));assert(el('modal').innerHTML.includes('225'));assert(el('modal').innerHTML.includes('หลังตีบวก'));G.enhanceBuy();let buy=requests.at(-1);assert.equal(buy.action,'research');assert.equal(buy.payload.enhance,'unit:0');event('research',{...online,crystals:46400,enhancements:{'unit:0':6},receipt:{id:buy.payload.request_id,level:6}});assert(!JSON.parse(data.novaRTS1).pendingEnhance);assert.equal(JSON.parse(data.novaRTS1).enhancements['unit:0'],6);assert(el('modal').innerHTML.includes('240'));

assert(!JSON.parse(data.novaRTS1).pendingWar,'successful enhancement must clear the legacy mutation queue');
G.enhanceInfo('unit:1',1);G.enhanceBuy();assert.equal(requests.at(-1).payload.enhance,'unit:1','next enhancement must not replay the old troop');

let next=requests.at(-1);event('research',{...online,receipt:{id:next.payload.request_id,level:1},enhancements:{'unit:0':6,'unit:1':1}});
const e=sandbox.__engine;
// Recover the exact old-save state: completed request stuck in pendingWar, new tank request pending.
e.d.pendingWar={action:'research',payload:{enhance:'unit:0',request_id:'old-receipt'},owner:'a'};
e.d.pendingEnhance={enhance:'unit:1',request_id:'new-receipt',viewLevel:1};e.d.economyConfirmedAt=Date.now();e.save();sandbox.__heartbeat();assert.equal(requests.at(-1).payload.request_id,'old-receipt');event('research',{...online,receipt:{id:'old-receipt',level:6}});assert(!e.d.pendingWar);assert.equal(e.d.pendingEnhance.request_id,'new-receipt');sandbox.__heartbeat();assert.equal(requests.at(-1).payload.request_id,'new-receipt');event('research',{...online,receipt:{id:'new-receipt',level:2}});assert(!e.d.pendingWar&&!e.d.pendingEnhance);
// A queued purchase must let the authoritative clock catch up and complete an overdue building.
e.d.pendingEnhance={enhance:'unit:2',request_id:'retry-receipt',viewLevel:1};e.d.economyConfirmedAt=Date.now()-60000;e.d.buildings.push({id:999,type:'mercenary',x:1,y:1,lv:1,constructing:true,started:Date.now()-60000,until:Date.now()-10000,collected:Date.now()-60000});e.save();sandbox.__heartbeat();assert.equal(requests.at(-1).payload.live,'siege_status');event('attack',{live:'siege_status',online,clock:{now:new Date().toISOString(),locked:false,intervals:[]}});assert(!e.d.buildings.find(b=>b.id===999).constructing);assert(!e.d.buildings.find(b=>b.id===999).until);sandbox.__heartbeat();assert.equal(requests.at(-1).payload.request_id,'retry-receipt');sandbox.novaCloudEvent('war_error',{message:'เชื่อมต่อไม่ได้'});assert(e.d.pendingWar&&e.d.pendingEnhance);sandbox.__heartbeat();assert.equal(requests.at(-1).payload.live,'siege_status','network retries yield to base status');event('attack',{live:'siege_status',online,clock:{now:new Date().toISOString(),locked:false,intervals:[]}});
G.enhanceInfo('unit:2',1);G.enhanceBuy();sandbox.novaCloudEvent('war_error',{message:'ผลึกไม่พอ'});assert(!e.d.pendingWar&&!e.d.pendingEnhance);
console.log('PASS recovery: consecutive purchases, stale legacy receipt, next tank request, expired construction completion, retry fairness and rejection cleanup');
