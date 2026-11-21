const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('features/titan342/ui.js','utf8');
function boot(){let timers=new Map(),requests=[],sounds=0,refreshes=0,toasts=[],fail=false,throws=false,n=0;
 const E={d:{gold:1000,power:1000,gems:100,buildings:[],onlineCrystal:{owner:'a'},titanRecovery347:{fraction:0,at:1,destroyed:true}},now:()=>100000,sync(){},save:()=>!fail,resourceCapacity:()=>1000};
 const s={Math,Date,Number,JSON,console,E,guest288:false,titanOwner342:'a',titanBusy342:null,titanSerial342:0,titanFunding343:false,titanPanelOpen342:true,titanAd342:false,screen:'home',testWallet:{},titanState342:{},modal:{style:{display:'flex'},hasAttribute:()=>true},root:{NovaCloud:{warRequest(a,p,id){if(throws)throw Error('bridge');requests.push({a,p:JSON.parse(p),id})}},novaCloudEvent(){}},nonce160:()=>`nonce-${++n}`,mt251:(a,b)=>b,active:()=>true,setTimeout(f){const id=++n;timers.set(id,f);return id},clearTimeout:id=>timers.delete(id),toast:m=>toasts.push(m),titanPanel342:()=>refreshes++,coinSuccess442:()=>sounds++,hud(){},syncCrystal(){},close(){}};
 vm.createContext(s);vm.runInContext(src.slice(src.indexOf('function titanSend342('),src.indexOf('var titanPay357=')),s);vm.runInContext(src.slice(src.indexOf('var titanCloud342='),src.indexOf('var earnedTitan342=')),s);
 return {s,E,requests,timers,sounds:()=>sounds,refreshes:()=>refreshes,toasts,setFail:x=>fail=x,setThrows:x=>throws=x,reply(state,extra={}){const req=requests.at(-1);s.root.novaCloudEvent('war',{request_id:req.id,data:{titan342:true,owner:'a',server_time:new Date(100000).toISOString(),state:{level:1,skills:{},...state},gems:90,...extra}})}};
}
let a=boot();assert(a.s.titanSend342('heal'));let first=a.requests[0].p.request_id;assert(!a.s.titanSend342('heal'),'no double click');a.reply({resting347:false,recovery_until347:null});assert.equal(a.s.titanBusy342,null);assert.equal(a.E.d.titanRecovery347.fraction,1);assert.equal(a.E.d.titanRecovery347.destroyed,false);assert.equal(a.sounds(),1);assert.equal(a.E.d.gems,90);assert(!a.E.d.pendingTitanAction342);a.reply({resting347:false});assert.equal(a.sounds(),1,'duplicate response has no duplicate success');
a=boot();a.s.titanSend342('heal');first=a.requests[0].p.request_id;[...a.timers.values()][0]();assert.equal(a.s.titanBusy342,null);assert.equal(a.refreshes(),1,'timeout re-enables controls');a.s.titanSend342('heal');assert.equal(a.requests[1].p.request_id,first,'retry reuses payment identity');a.reply({resting347:false});assert.equal(a.sounds(),1);
a=boot();a.setThrows(true);assert.equal(a.s.titanSend342('heal'),false);assert.equal(a.s.titanBusy342,null);assert.equal(a.refreshes(),1);assert.equal(a.sounds(),0);
a=boot();a.s.titanSend342('heal');a.s.root.novaCloudEvent('war_error',{request_id:a.requests[0].id,message:'network'});assert.equal(a.s.titanBusy342,null);assert.equal(a.refreshes(),1);assert(a.E.d.pendingTitanAction342,'ambiguous failure retains idempotent request');assert.equal(a.sounds(),0);
a=boot();a.s.titanSend342('heal');a.setFail(true);a.reply({resting347:false});assert.equal(a.sounds(),0,'failed save cannot announce completion');
a=boot();a.s.titanSend342('heal');a.reply({resting347:false},{owner:'other'});assert.equal(a.E.d.gems,100);assert.equal(a.sounds(),0,'wrong account response ignored');
a=boot();a.E.d.pendingRecovery347={id:'new-battle',fraction:0};a.s.titanSend342('status');a.reply({resting347:false});assert.equal(a.E.d.titanRecovery347.fraction,0,'status cannot clear an unacknowledged newer battle');
console.log('PASS repair442: confirmed healing clears local rest, timeout/throw unlock, stable payment retry, duplicate/wrong-owner/error/save gates');
// Coin feedback is gated by sound settings and uses a short three-note chime.
const game=fs.readFileSync('game.js','utf8');let notes=0,fallback=0;const sound={soundOn:true,document:{hidden:false},mediaAllowed250:()=>true,unlockAudio218(){},completionAudio250(){fallback++},audio:{currentTime:1,destination:{},createOscillator(){notes++;return{frequency:{setValueAtTime(){}},connect(){},start(){},stop(){},disconnect(){}}},createGain(){return{gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}}}};vm.createContext(sound);vm.runInContext(game.slice(game.indexOf('function coinSuccess442()'),game.indexOf('function completionAudio250()')),sound);sound.coinSuccess442();assert.equal(notes,3);assert.equal(fallback,0);sound.soundOn=false;sound.coinSuccess442();assert.equal(notes,3);
console.log('PASS coin feedback: three-note receipt chime, muted setting respected');
// A live control acknowledgement must not serialize or overwrite the player's economy.
a=boot();a.E.save=()=>{throw Error('control saved the whole base')};a.E.sync=()=>{throw Error('control synced the whole base')};
assert(a.s.titanSend342('control',{room:'test',seq:1,manual:true,dx:1,dy:0}));
assert(!('resourceSnapshot' in a.requests[0].p));
a.reply({}, {combat:true});assert.equal(a.s.titanBusy342,null);assert.equal(a.E.d.gems,100);
{
 let now=0,orders=[];
 const state={Date:{now:()=>now},Math,screen:'raid',liveRoom:{id:'one',v:2},selectedTitan342:null,titanBusy342:null,titanOwner342:'a',titanQueuedSkill342:null,titanControlSeq342:0,titanControlAt342:0,E:{raid:{}},tickUI342(){},titanSend342:(mode,p)=>{orders.push(p);return true;}};
 vm.createContext(state);vm.runInContext(src.slice(src.indexOf('var manualRoom443='),src.indexOf('};',src.indexOf('manualRoom443=manual?'))+2),state);
 const run=frames=>{for(let i=0;i<frames;i++){now+=17;state.tickUI342(.017)}};
 run(600);assert.equal(orders.length,0,'no controls sent during AUTO');
 state.selectedTitan342={owner:'a',hp:1,input342:{x:1,y:0}};run(60);
 assert(orders.length>=2&&orders.every(p=>p.manual&&p.dx===1),'manual heartbeat');
 state.selectedTitan342=null;run(600);assert.equal(orders.filter(p=>!p.manual).length,1,'one release, then silence');
}
