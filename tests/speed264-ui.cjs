const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8'),catalog=require('../localization/en.json');
function boot(data={},platform='android'){
 const elements={},errors=[],requests=[];let reloads=0,frame,timerId=0;const timers=new Map();
 const ctx=new Proxy({measureText:t=>({width:String(t).length*8}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
 const el=id=>elements[id]||(elements[id]={hidden:true,value:'',style:{},innerHTML:'',textContent:'',addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:420,height:800}),querySelectorAll:()=>[]});
 const storage={getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v,removeItem:k=>delete data[k]};
 const s={crypto:require('node:crypto').webcrypto,console:{log(){},error:(...a)=>errors.push(a)},Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:(f,ms)=>{timers.set(++timerId,{f,ms});return timerId;},clearTimeout:id=>timers.delete(id),Image:class{},localStorage:storage,document:{getElementById:el,addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame:f=>frame=f,location:{reload:()=>reloads++},NovaCloud:{hasAccount:()=>true,available:()=>true,warAvailable:()=>true,load(){},warRequest:(a,p,id)=>requests.push({a,p:JSON.parse(p),id})}};
 if(platform==='telegram'){s.Telegram={WebApp:{}};s.window=s;}
 vm.createContext(s);vm.runInContext(source.replace('})(typeof globalThis!==','root.test232={e:E,accept:b=>acceptLive(b),heartbeat:()=>liveHeartbeat(),screen:()=>screen,setWar:d=>warState=d,setRoom:b=>liveRoom=b,setScreen:v=>screen=v,select:id=>selected=id,clearBusy:()=>{warBusy=false;warActive=null;},setOnline:()=>{E.d.onlineCrystal={owner:"a"};E.d.admob230=true;}};})(typeof globalThis!=='),s);
 return {s,el,data,errors,requests,timers,reloads:()=>reloads,frame:n=>frame(n)};
}



const a=boot({novaRTSIntro:'1',novaLanguage:'th'}),G=a.s.Game,e=a.s.test232.e,T=a.s.test232;
const owner='10000000-0000-4000-8000-000000000001';e.d.onlineCrystal={owner};e.d.gems=100;T.clearBusy();const b=e.d.buildings.find(b=>b.type==='mine');b.started=Date.now();b.until=Date.now()+400000;T.select(b.id);G.speedConfirm();assert(a.el('modal').innerHTML.includes('2 NOVA'));assert(a.el('modal').innerHTML.includes('Game.speedAd264'));assert(!a.el('modal').innerHTML.includes('50 NOVA'));assert(a.el('modal').innerHTML.includes('ดูโฆษณาเร่งเวลา'));
let ads=0;a.s.NovaAds={rewardTest248(){ads++;},acknowledgeTest248(){}};
function reply(claimed=false,provider='test'){const q=a.requests.at(-1),p=e.d.pendingSpeed264;a.s.novaCloudEvent('war',{request_id:q.id,data:{owner,speed264:true,receipt:{id:p.request_id,target:p.target,provider,claimed,seconds:500,expires_at:new Date(Date.now()+1800000).toISOString()}}});}
const gems=e.d.gems,level=b.lv;G.speedAd264('building',String(b.id));reply();assert.equal(ads,1);assert(b.until);assert.equal(e.d.gems,gems);a.s.novaRewardStatus('closed');assert(b.until);G.retrySpeed264();reply();const p=e.d.pendingSpeed264;a.s.novaTestRewardEarned248(owner,p.request_id);assert(b.until,'no benefit before server confirmation');reply(true);assert(!b.until);assert.equal(b.lv,level+1);assert.equal(e.d.gems,gems);assert.equal((a.el('modal').innerHTML.match(/<button /g)||[]).length,1);
// Long construction only loses 500s, and cannot affect another building or upgrade.
b.started=Date.now();b.until=Date.now()+900000;G.speedAd264('building',String(b.id));reply();const oldUntil=b.until,oldId=e.d.pendingSpeed264.request_id;a.s.novaTestRewardEarned248(owner,oldId);reply(true);assert.equal(b.until,oldUntil-500000);a.s.novaTestRewardEarned248(owner,oldId);assert.equal(b.until,oldUntil-500000);
// Parallel training: only the units queued before the ad receive the 500s reduction.
e.d.queue=[{kind:0,started:Date.now(),until:Date.now()+700000},{kind:1,started:Date.now(),until:Date.now()+300000}];G.speedQueue();assert(a.el('modal').innerHTML.includes('Game.speedAd264'));G.speedAd264('training','');reply();const queuedEnd=e.d.queue[0].until;e.d.queue.push({kind:0,started:Date.now(),until:Date.now()+800000});const newEnd=e.d.queue[2].until;const trainId=e.d.pendingSpeed264.request_id;a.s.novaTestRewardEarned248(owner,trainId);reply(true);assert.equal(e.d.queue.length,2);assert.equal(e.d.queue[0].until,queuedEnd-500000);assert.equal(e.d.queue[1].until,newEnd);assert.equal(e.d.gems,gems);
assert.equal(a.errors.length,0);console.log('PASS speed264 UI: 40 NOVA job finishes with one ad, 500s cap, no spend, incomplete video, verification, replay and training snapshot');

// Completed ads survive reload; the recovered receipt advances only its original job.
b.started=Date.now();b.until=Date.now()+900000;G.speedAd264('building',String(b.id));reply();const recoveryId=e.d.pendingSpeed264.request_id,recoveryUntil=b.until;a.s.novaTestRewardEarned248(owner,recoveryId);
const loaded=boot(a.data),le=loaded.s.test232.e;loaded.s.Game.retrySpeed264();let req=loaded.requests.at(-1),lp=le.d.pendingSpeed264;assert.equal(req.p.speed264,'claim');loaded.s.novaCloudEvent('war',{request_id:req.id,data:{owner,speed264:true,receipt:{id:lp.request_id,target:lp.target,provider:'test',claimed:true,seconds:500}}});assert.equal(le.d.buildings.find(x=>x.id===b.id).until,recoveryUntil-500000);assert(!le.d.pendingSpeed264);assert.equal(le.d.gems,gems);
// Native production ads load, then show, then wait for verified receipt; random delivery IDs are acknowledged.
const native=boot({novaRTSIntro:'1'}),ne=native.s.test232.e;ne.d.onlineCrystal={owner};ne.d.buildings[0].started=Date.now();ne.d.buildings[0].until=Date.now()+800000;let shown=0,ack;
native.s.NovaAds={rewardVerified(){shown++;},acknowledgeReward(id){ack=id;}};native.s.Game.speedAd264('building','1');req=native.requests.at(-1);lp=ne.d.pendingSpeed264;native.s.novaCloudEvent('war',{request_id:req.id,data:{owner,speed264:true,receipt:{id:lp.request_id,target:lp.target,provider:'admob',claimed:false,seconds:500,expires_at:new Date(Date.now()+1800000).toISOString()}}});assert.equal(shown,1);native.s.novaRewardStatus('ready');assert.equal(shown,2);native.s.novaRewardEarned('delivery-id');assert.equal(ack,'delivery-id');assert.equal(native.requests.at(-1).p.request_id,lp.request_id);assert(ne.d.buildings[0].until>Date.now()+500000);
console.log('PASS speed264 recovery and native load/show/delivery verification');

