const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8'),catalog=require('../localization/en.json');
function boot(data={},platform='android'){
 const elements={},errors=[],requests=[];let reloads=0,frame,timerId=0;const timers=new Map();
 const ctx=new Proxy({measureText:t=>({width:String(t).length*8}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
 const el=id=>elements[id]||(elements[id]={hidden:true,value:'',style:{},innerHTML:'',textContent:'',addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:420,height:800}),querySelectorAll:()=>[]});
 const storage={getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v,removeItem:k=>delete data[k]};
 const s={crypto:require('node:crypto').webcrypto,console:{log(){},error:(...a)=>errors.push(a)},Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:(f,ms)=>{timers.set(++timerId,{f,ms});return timerId;},clearTimeout:id=>timers.delete(id),Image:class{},localStorage:storage,document:{getElementById:el,addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame:f=>frame=f,location:{reload:()=>reloads++},NovaCloud:{hasAccount:()=>true,available:()=>true,warAvailable:()=>true,load(){},warRequest:(a,p,id)=>requests.push({a,p:JSON.parse(p),id})}};
 if(platform==='telegram'){s.Telegram={WebApp:{}};s.window=s;}
 vm.createContext(s);vm.runInContext(source.replace('})(typeof globalThis!==','root.test232={e:E,setScreen:v=>screen=v,select:id=>selected=id,clearBusy:()=>{warBusy=false;warActive=null;},setOnline:()=>{E.d.onlineCrystal={owner:"a"};E.d.admob230=true;}};})(typeof globalThis!=='),s);
 return {s,el,data,errors,requests,timers,reloads:()=>reloads,frame:n=>frame(n)};
}
for(const platform of ['android','telegram']){
 const a=boot({novaRTSIntro:'1'},platform),G=a.s.Game,e=a.s.test232.e;
 const reply=d=>{const r=a.requests.at(-1);a.s.novaCloudEvent('war',{action:r.a,request_id:r.id,data:d});};
 // Daily mining/ad transitions are tested by mining251-ui.cjs.
 a.s.test232.setOnline();a.s.NovaAds={rewardVerified(){}};e.d.gold=0;e.d.power=0;a.s.test232.select(e.d.buildings.find(b=>b.type==='hq').id);G.upgrade();assert.match(a.el('modal').innerHTML,/Not enough resources/);assert.match(a.el('modal').innerHTML,/Game.buyShortfall238/);assert.equal(a.requests.at(-1).p.kind,'bundle');reply({owner:'a',wallet_gems:20,resource_quote:{kind:'bundle',cost:8,amount:1000,available:true,ad_kind:'gold',ad_amount:1080}});assert.match(a.el('modal').innerHTML,/Pay with diamonds 8/);assert.match(a.el('modal').innerHTML,/Ads/);
 G.resourceOffer233('gold',350);assert.equal(a.requests.at(-1).p.resource233,'quote');const base={owner:'a',enrolled:false,resource233:true,wallet_gems:20};reply({...base,resource_quote:{kind:'gold',ad_amount:1080,paid_base:1296,amount:350,cost:5}});assert.match(a.el('modal').innerHTML,/Watch an ad/);assert.match(a.el('modal').innerHTML,/Use diamonds/);assert(!a.el('modal').innerHTML.includes('Game.buyResource233()'));G.resourceMode235('diamonds');assert.match(a.el('modal').innerHTML,/Confirm exchange/);assert(!a.el('modal').innerHTML.includes('Game.shortfallAd233()'));
 const before=e.d.gems;G.buyResource233();const pending=e.d.pendingResource233;assert(pending);assert.equal(e.d.gems,before-5);const n=a.requests.length;G.buyResource233();assert.equal(a.requests.length,n);a.s.novaCloudEvent('war_error',{request_id:a.requests.at(-1).id,message:'network'});assert(e.d.pendingResource233);G.retryResource233();assert.equal(a.requests.at(-1).p.request_id,pending.request_id);reply({...base,wallet_gems:15,resource_receipt:{id:pending.request_id,kind:'gold',amount:350,cost:5,cancelled:false}});assert.equal(e.d.pendingResource233,undefined);assert.equal(e.d.gems,before-5);
 G.resourceOffer233('gold',350);reply({...base,resource_quote:{kind:'gold',ad_amount:1080,paid_base:1296,amount:350,cost:5}});G.resourceMode235('diamonds');G.buyResource233();const cancel=e.d.pendingResource233;a.s.test232.clearBusy();G.retryResource233(true);reply({...base,resource_receipt:{id:cancel.request_id,kind:'gold',amount:0,cost:0,cancelled:true}});assert.equal(e.d.gems,before-5,'cancel refunds only its reserved amount');
 G.resourceOffer233('gold',350);reply({...base,resource_quote:{kind:'gold',ad_amount:1080,paid_base:1296,amount:350,cost:5}});G.resourceMode235('diamonds');const beforeDenied=e.d.gems;G.buyResource233();const denied=e.d.pendingResource233;
 a.s.novaCloudEvent('war_error',{request_id:a.requests.at(-1).id,message:'เพชรออนไลน์ไม่พอ'});assert.equal(a.requests.at(-1).p.resource233,'cancel');assert.equal(a.requests.at(-1).p.request_id,denied.request_id);
 reply({...base,resource_receipt:{id:denied.request_id,kind:'gold',amount:0,cost:0,cancelled:true}});assert.equal(e.d.gems,beforeDenied);assert(!e.d.pendingResource233,'definitive rejection is cleared after server confirms cancellation');
 a.s.localStorage.setItem=()=>{throw Error('full')};G.resourceOffer233('gold',350);reply({...base,resource_quote:{kind:'gold',ad_amount:1080,paid_base:1296,amount:350,cost:5}});G.resourceMode235('diamonds');G.buyResource233();assert.equal(e.d.gems,before-5);assert.equal(e.d.pendingResource233,undefined,'failed local save never starts purchase');
}
console.log('PASS economy233 UI: upgrade shortfall, choice UI, durable debit/retry/cancel, no auto-upgrade and save-failure safety on Android/Telegram');

assert.match(fs.readFileSync('index.html','utf8'),/id="settingsButton"[^>]*onclick="Game.settings\(\)"[^>]*aria-label="ตั้งค่า"[^>]*><svg/);
{
 const a=boot({novaRTSIntro:'1'},'telegram'),G=a.s.Game,e=a.s.test232.e;let shown=0;a.s.NovaAds={rewardVerified(){shown++;}};a.s.test232.clearBusy();a.s.test232.setOnline();
 const reply=d=>{const r=a.requests.at(-1);a.s.novaCloudEvent('war',{action:r.a,request_id:r.id,data:d});};
 G.resourceOffer233('gold',350);reply({owner:'a',enrolled:false,wallet_gems:20,resource_quote:{kind:'gold',ad_amount:1080,amount:350,cost:5}});
 G.resourceMode235('ads');assert.equal(shown,0);assert.equal(a.requests.at(-1).p.admob230,'prepare');assert.equal(shown,0);
 const r={id:e.d.pendingAd230.request_id,kind:'gold',amount:1080,expires_at:new Date(Date.now()+60000).toISOString(),verified:false,claimed:false};
 reply({owner:'a',enrolled:false,ad_reward:r});assert.equal(shown,1,'resource ad opens after server preparation without a second confirmation');
 a.s.novaRewardStatus('loading');assert(e.d.pendingAd230.showRequested,'SDK loading keeps double tap guard');
 a.s.novaRewardStatus('load_failed236');assert(!e.d.pendingAd230.showRequested);assert.match(a.el('modal').innerHTML,/Could not load the ad service/);G.showAd230();assert.equal(shown,2,'user can retry same receipt after SDK failure');
 e.d.pendingAd230.showRequested=false;e.d.pendingAd230.receipt.expires_at=new Date(Date.now()-1000).toISOString();G.rewardStatus230();assert.match(a.el('modal').innerHTML,/Start a new ad/);G.restartAd236();assert.equal(a.requests.at(-1).p.admob230,'cancel');reply({owner:'a',enrolled:false,ad_reward:{...r,cancelled:true}});assert.equal(a.requests.at(-1).p.admob230,'prepare');assert.notEqual(e.d.pendingAd230.request_id,r.id);assert.equal(e.d.pendingAd230.kind,'production');

}
console.log('PASS resource ad loading: explicit choice, single-click launch, loading guard and retryable visible SDK failures');
// Replaced daily check-in flow is covered by mining251-ui.cjs.
{
 const a=boot({novaRTSIntro:'1'}),G=a.s.Game,e=a.s.test232.e;a.s.test232.clearBusy();const b=e.d.buildings.find(b=>b.type==='hq');a.s.test232.select(b.id);e.d.gold=100000;e.d.power=100000;e.d.crystals=100000;const count=a.requests.length;G.upgrade();assert(b.until||b.lv>1,'sufficient resources upgrade directly');assert.equal(a.requests.length,count,'no unnecessary resource quote when affordable');assert(!a.el('modal').innerHTML.includes('Game.buyShortfall238()'));
}
{
 const a=boot({novaRTSIntro:'1'},'telegram'),G=a.s.Game,e=a.s.test232.e;let shown=0;a.s.NovaAds={rewardVerified(){shown++;}};a.s.test232.clearBusy();a.s.test232.setOnline();G.quickAd237('gold');
 const first=a.requests.at(-1);a.s.novaCloudEvent('war_error',{request_id:first.id,message:'รอ 2 นาทีก่อนดูครั้งต่อไป'});
 assert.equal(e.d.pendingAd230.error239,'รอ 2 นาทีก่อนดูครั้งต่อไป');assert(!a.el('modal').innerHTML.includes('Preparing your ad'));assert.match(a.el('modal').innerHTML,/Game.retryAd239/);assert(!a.el('modal').innerHTML.includes('Check / Retry original'));
 G.retryAd239();const second=a.requests.at(-1);assert.equal(second.p.request_id,first.p.request_id,'retry uses same receipt ID');assert.equal(shown,0);assert(!e.d.pendingAd230.error239);assert.match(a.el('modal').innerHTML,/Preparing your ad/);
 a.s.novaCloudEvent('war',{action:second.a,request_id:second.id,data:{owner:'a',enrolled:false,ad_reward:{id:second.p.request_id,kind:'gold',amount:1080,expires_at:new Date(Date.now()+60000).toISOString(),verified:false,claimed:false}}});assert.equal(shown,1,'retry opens prepared ad without another tap');
}
console.log('PASS ad cooldown: persistent reason, simple retry, original receipt and automatic ad launch');
{
 const a=boot({novaRTSIntro:'1'},'telegram'),G=a.s.Game,e=a.s.test232.e;let shown=0;a.s.NovaAds={rewardVerified(){shown++;}};a.s.test232.clearBusy();a.s.test232.setOnline();G.production240();
 let req=a.requests.at(-1);a.s.novaCloudEvent('war',{action:req.a,request_id:req.id,data:{owner:'a',wallet_gems:0,resource_quote:{kind:'bundle',production240:{gold:2160,power:3240,crystals:120},available:false}}});
 assert.match(a.el('modal').innerHTML,/Boost production by 30 minutes/);for(const n of ['2,160','3,240'])assert(a.el('modal').innerHTML.includes(n));G.adShortfall238();req=a.requests.at(-1);assert.equal(req.p.kind,'production');
 a.s.novaCloudEvent('war',{action:req.a,request_id:req.id,data:{owner:'a',enrolled:false,ad_reward:{id:req.p.request_id,kind:'production',amount:5520,production240:{gold:2160,power:3240,crystals:120},expires_at:new Date(Date.now()+60000).toISOString(),verified:false,claimed:false}}});assert.equal(shown,1);
}
console.log('PASS production UI: all rewards visible before ad and single-tap production request');
{
 const a=boot({novaRTSIntro:'1'},'telegram'),G=a.s.Game,e=a.s.test232.e;a.s.NovaAds={rewardVerified(){}};a.s.test232.clearBusy();a.s.test232.setOnline();G.quickAd237('production');
 const reply=d=>{const req=a.requests.at(-1);a.s.novaCloudEvent('war',{action:req.a,request_id:req.id,data:d});};
 const r={id:e.d.pendingAd230.request_id,kind:'production',amount:2,production240:{gold:1,power:1,crystals:0},expires_at:new Date(Date.now()+60000).toISOString(),verified:false,claimed:false};reply({owner:'a',enrolled:false,ad_reward:r});assert.equal(a.el('modal').style.display,'none');
 a.s.novaRewardEarned(r.id);assert.equal(a.el('modal').style.display,'none','completion returns to base immediately');reply({owner:'a',enrolled:false,ad_reward:r});assert.equal(a.el('modal').style.display,'none');
 const timer=[...a.timers.entries()].find(([id,t])=>t.ms===4000);assert(timer,'pending verification polls automatically');a.timers.delete(timer[0]);timer[1].f();assert.equal(a.requests.at(-1).p.admob230,'claim');assert.equal(a.el('modal').style.display,'none','poll does not open transaction menu');
 reply({owner:'a',enrolled:false,ad_reward:{...r,verified:true,claimed:true,granted:2}});assert(!e.d.pendingAd230);assert(![...a.timers.values()].some(t=>t.ms===4000),'successful claim stops polling');
}
console.log('PASS automatic reward finish: no post-ad menu, delayed verification retries silently and stops after delivery');


