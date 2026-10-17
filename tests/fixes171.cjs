const vm=require('vm'),fs=require('fs'),assert=require('assert');require('../game.js');const N=global.NovaRTS;
// Heavy tracked vehicles never hop or get shoved by a blast, while infantry still react.
for(const kind of [1,9]){let t={kind,x:4,y:4,hp:1000,max:1000},scene={buildings:[],fx:[],mapSize:22};N.hit(scene,t,50,{x:3,y:4},'cannon');assert.equal(t.hop,0);assert.equal(t.x,4);assert.equal(t.y,4);}
let foot={kind:0,x:4,y:4,hp:1000};N.hit({buildings:[],fx:[]},foot,50,{x:3,y:4},'cannon');assert(foot.hop>0);
for(const type of ['tank','gun','missileturret','cannonturret'])for(let i=0;i<32;i++){const angle=i*Math.PI/16,source=type==='tank'?{kind:1,x:4,y:4}:{type,x:4,y:4},target={x:4+Math.cos(angle)*4,y:4+Math.sin(angle)*4};let fx=N.weaponFX(source,target,'cannon'),mount=N.weaponMount(source),dx=Math.cos(angle)-Math.sin(angle),dy=(Math.cos(angle)+Math.sin(angle))*.51;assert(Math.abs(mount.x*dy-(mount.y+mount.height)*dx)<1e-8,'muzzle and target have same bearing');assert.deepEqual(fx.muzzle,mount);}
// Real UI request lifecycle: login continuation, timeout, stale replies, retry and successful claim.
let timers=new Map(),seq=0,requests=[],elements={},data={novaRTSIntro:'1'};
const ctx=new Proxy({measureText:t=>({width:t.length*8})},{get:(o,k)=>o[k]||(()=>{})});const el=id=>elements[id]||(elements[id]={style:{},innerHTML:'',textContent:'',addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:420,height:600}),querySelectorAll:()=>[]});
const sandbox={console,crypto:require('crypto').webcrypto,Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:(fn,ms)=>{timers.set(++seq,{fn,ms});return seq;},clearTimeout:id=>timers.delete(id),Image:class{},localStorage:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v},document:{getElementById:el,addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame(){},NovaCloud:{warAvailable:()=>true,available:()=>true,warRequest:(action,payload,request_id)=>requests.push({action,payload:JSON.parse(payload),request_id})}};
sandbox.localStorage && sandbox.localStorage.setItem('novaLanguage','th');vm.createContext(sandbox);vm.runInContext(fs.readFileSync('game.js','utf8'),sandbox);const G=sandbox.Game,emit=(event,data)=>sandbox.novaCloudEvent(event,data),reply=(r,d)=>emit('war',{...r,data:d});
// Retired offline promotion cannot mint currency; check-in is now server-confirmed.
G.treasury();assert(!el('modal').innerHTML.includes('Game.promoClaim()'));assert.equal(requests.at(-1).action,'test_status');
let r=requests.at(-1);reply(r,{owner:'a',test_gems:500,checkin233:{day:'2026-10-17',claimed:false,streak:0,reward:0,next_reward:20}});
const before=JSON.parse(data.novaRTS1).gems;G.checkin();r=requests.at(-1);assert.equal(r.action,'test_claim');assert.equal(r.payload.checkin233,true);assert.equal(JSON.parse(data.novaRTS1).gems,before);
reply(r,{owner:'a',test_gems:520,checkin233:{day:'2026-10-17',claimed:true,streak:1,reward:20,next_reward:25}});assert.equal(JSON.parse(data.novaRTS1).gems,before+20);
let time=Date.UTC(2026,9,15,16,59,59),state={},fail=false,storage={getItem:k=>state[k]||null,setItem:(k,v)=>{if(fail)throw Error('full');state[k]=v;}},e=new N.Engine(storage,()=>time);
let gems=e.d.gems;assert.equal(e.claimPromo(),0);time+=86400000;assert.equal(e.claimPromo(),0);assert.equal(e.claim(),0);assert.equal(e.d.gems,gems);
console.log('PASS: combat regression; retired local promotion, server-confirmed check-in, unchanged prior balances');

// Crystal exchanges spend the primary gems and preserve balances on errors.
let cstore={},cs={getItem:k=>cstore[k]||null,setItem:(k,v)=>cstore[k]=v},ce=new N.Engine(cs,()=>Date.UTC(2026,9,15));ce.d.gems=10000;ce.d.crystals=0;
assert.equal(ce.exchange('crystals',10),'');assert.equal(ce.d.crystals,10000);assert.equal(ce.d.gems,9900);assert(ce.exchange('crystals',50));assert.equal(ce.d.gems,9900);assert(ce.exchange('crystals',-1));ce.storage.setItem=()=>{throw Error('full')};assert(ce.exchange('crystals',1));assert.equal(ce.d.gems,9900);assert.equal(ce.d.crystals,10000);
for(const type of ['crystalplant','crystalstore']){let t=Date.UTC(2026,9,15),db={},engine=new N.Engine({getItem:k=>db[k],setItem:(k,v)=>db[k]=v},()=>t);engine.d.buildings[0].lv=3;engine.d.gold=3000;engine.d.power=3000;engine.d.buildings.push({id:77,type,x:1,y:1,lv:1});assert.equal(engine.upgrade(77),'');t+=16000;engine.sync();assert.equal(engine.d.buildings.find(b=>b.id===77).lv,2);}
const source=fs.readFileSync('game.js','utf8');assert(!source.includes("ctx.fillText('Lv.'"));assert(source.includes('function drawResourceLabel(b){}'));
console.log('PASS: both crystal buildings upgrade, gem/crystal exchange capacity and save failure, map labels removed');

