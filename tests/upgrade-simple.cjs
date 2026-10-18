const vm=require('vm'),fs=require('fs'),assert=require('assert'),crypto=require('crypto').webcrypto;
const elements={},data={novaRTSIntro:'1'},requests=[],timers=[];
const ctx=new Proxy({measureText:t=>({width:t.length*8})},{get:(o,k)=>o[k]||(()=>{})});
const el=id=>elements[id]||(elements[id]={style:{},innerHTML:'',textContent:'',addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:420,height:600}),querySelectorAll:()=>[]});
const sandbox={console,crypto,Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:(f,ms)=>{timers.push({f,ms});return timers.length},clearTimeout(){},Image:class{},localStorage:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v},document:{getElementById:el,addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame(){},NovaCloud:{warAvailable:()=>true,available:()=>true,war:(action,payload)=>requests.push({action,payload:JSON.parse(payload)})}};
sandbox.localStorage && sandbox.localStorage.setItem('novaLanguage','th');vm.createContext(sandbox);vm.runInContext(fs.readFileSync('game.js','utf8').replace("})(typeof globalThis!==", "root.testEngine=E;root.selectTest=function(id){selected=id;};})(typeof globalThis!=="),sandbox);
const E=sandbox.testEngine,G=sandbox.Game,event=(action,d)=>sandbox.novaCloudEvent('war',{action,data:d});
const online={enrolled:true,owner:'account-a',callsign:'A',tier:1,crystals:1000,capacity:1800,rate:120,server_time:new Date().toISOString(),shield_until:new Date().toISOString(),raid_after:new Date().toISOString(),infra:{crystalplant:1,crystalstore:2,garrison:1},research:{weapon:0,armor:0}};
let hq=E.d.buildings.find(b=>b.type==='hq');hq.lv=5;E.d.gold=100000;E.d.power=100000;E.d.crystals=1000;E.d.onlineCrystal={...online};sandbox.selectTest(hq.id);
G.upgrade();assert(hq.until);assert(!E.d.pendingCrystal);assert.equal(requests.length,0,'ordinary upgrades no longer wait for crystal server');const gold=E.d.gold,until=hq.until;G.upgrade();assert.equal(E.d.gold,gold);assert.equal(hq.until,until);
// Incoming raid losses/credits must survive duplicate replies and restart saves.
E.d.buildings.push({id:300,type:'storage',lv:5,x:3,y:3});E.d.gold=100000;E.d.power=100000;E.d.raidDeltas={owner:'account-a',gold_delta:0,power_delta:0};
event('status',{...online,resources:{gold_delta:-6000,power_delta:4000,seq:8}});assert.equal(E.d.gold,94000);assert.equal(E.d.power,104000);
event('status',{...online,resources:{gold_delta:-6000,power_delta:4000,seq:8}});assert.equal(E.d.gold,94000);assert.equal(E.d.power,104000);
let gems=E.d.gems;G.sellResource('gold',1);assert.equal(E.d.gold,94000);assert.equal(E.d.gems,gems);let count=requests.length;G.sellResource('crystals',1);assert.equal(requests.length,count);assert.equal(E.d.gems,gems);
console.log('PASS: raid reconciliation and reverse exchange disabled');

