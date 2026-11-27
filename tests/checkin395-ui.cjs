const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8'),catalog=require('../localization/en.json');
function boot(data={},platform='android'){
 const elements={},errors=[],requests=[];let reloads=0,frame,timerId=0;const timers=new Map();
 const ctx=new Proxy({measureText:t=>({width:String(t).length*8}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
 const el=id=>elements[id]||(elements[id]={hidden:true,value:'',style:{},innerHTML:'',textContent:'',addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:420,height:800}),querySelectorAll:()=>[]});
 const storage={getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v,removeItem:k=>delete data[k]};
 const s={crypto:require('node:crypto').webcrypto,console:{log(){},error:(...a)=>errors.push(a)},Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:(f,ms)=>{timers.set(++timerId,{f,ms});return timerId;},clearTimeout:id=>timers.delete(id),Image:class{},localStorage:storage,document:{getElementById:el,addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame:f=>frame=f,location:{reload:()=>reloads++},NovaCloud:{hasAccount:()=>true,available:()=>true,warAvailable:()=>true,load(){},warRequest:(a,p,id)=>requests.push({a,p:JSON.parse(p),id})}};
 if(platform==='telegram'){s.Telegram={WebApp:{}};s.window=s;}
 vm.createContext(s);vm.runInContext(source.replace('})(typeof globalThis!==','root.test232={e:E,setScreen:v=>screen=v,select:id=>selected=id,clearBusy:()=>{warBusy=false;warActive=null;},badge:()=>dailyBadge340(),setClock:v=>dailyClockOffset340=v,pollNow:()=>dailyPollAt340=0,robots:()=>robots251,robotTick:()=>updateRobots251(),setOnline:()=>{E.d.onlineCrystal={owner:"a"};E.d.admob230=true;}};})(typeof globalThis!=='),s);
 return {s,el,data,errors,requests,timers,reloads:()=>reloads,frame:n=>frame(n)};
}

const a=boot({novaRTSIntro:'1'}),G=a.s.Game,e=a.s.test232.e,owner='10000000-0000-4000-8000-000000000002';
const reply=d=>{const r=a.requests.at(-1);a.s.novaCloudEvent('war',{action:r.a,request_id:r.id,data:d});};
const ck=x=>({owner,test_gems:0,checkin233:{day:'2026-11-14',claimed:false,streak:0,reward:0,next_reward:5,ad_bonus395:15,server_time:new Date().toISOString(),next_reset:new Date(Date.now()+3600000).toISOString(),schedule395:true,...x}});
G.openDaily340();reply(ck());let html=a.el('modal').innerHTML;assert(html.includes('checkinFree395')&&html.includes('15 NOVA'));assert(a.el('dailyCheckin340').className.includes('ready340'));
const before=e.d.gems;G.checkinFree395();let r=a.requests.at(-1);assert.equal(r.a,'test_status');assert.equal(r.p.checkin395,'free');
reply(ck({claimed:true,streak:1,reward:5,ad_bonus395:0}));assert.equal(e.d.gems,before+5,'free claim credits 5');assert(a.el('modal').innerHTML.includes('+5 NOVA'));assert(!a.el('dailyCheckin340').className.includes('ready340'));
G.refreshCheckin233();reply(ck({claimed:true,streak:1,reward:5,ad_bonus395:0}));assert.equal(e.d.gems,before+5,'status replay');
G.openDaily340();reply(ck({claimed:true,streak:1,reward:5,ad_bonus395:0}));html=a.el('modal').innerHTML;assert(!html.includes('checkinFree395')&&!html.includes('Game.checkin()'),'no second check-in after choosing');
// Video top-up arrives later through a server status: only the difference is credited, once.
G.refreshCheckin233();reply(ck({claimed:true,streak:1,reward:15,ad_bonus395:0}));assert.equal(e.d.gems,before+15,'top-up credits +10');
G.refreshCheckin233();reply(ck({claimed:true,streak:1,reward:15,ad_bonus395:0}));assert.equal(e.d.gems,before+15,'top-up replay');
G.openDaily340();reply(ck({claimed:true,streak:1,reward:15,ad_bonus395:0}));html=a.el('modal').innerHTML;assert(!html.includes('Game.checkin()')&&html.includes('15 NOVA'));
// Next day straight to video: 15 credited once.
G.refreshCheckin233();reply(ck({day:'2026-11-15',claimed:true,streak:2,reward:15,ad_bonus395:0}));assert.equal(e.d.gems,before+30);
G.refreshCheckin233();reply(ck({day:'2026-11-15',claimed:true,streak:2,reward:15,ad_bonus395:0}));assert.equal(e.d.gems,before+30);
// 397: demo video enables the video check-in button before choosing.
a.s.NovaAds={rewardTest248(){},acknowledgeTest248(){}};
a.s.test232.pollNow();G.openDaily340();reply({...ck({day:'2026-11-16',streak:2}),test_checkin248:true});html=a.el('modal').innerHTML;assert(/class="wide gold395" +onclick/.test(html)&&html.includes('15 NOVA')&&html.includes('checkinFree395'));
G.checkin();assert.equal(a.requests.at(-1).p.checkin_test248,'prepare','video check-in uses demo video');
// 398: day 7 buttons.
a.s.test232.pollNow();G.openDaily340();reply({...ck({day:'2026-11-17',streak:6,next_reward:15,video395:45,ad_bonus395:45}),test_checkin248:true});html=a.el('modal').innerHTML;assert(html.includes('รับ 15 NOVA')||html.includes('Check in: 15 NOVA'));assert(html.includes('45 NOVA'));
assert.equal(a.errors.length,0,JSON.stringify(a.errors));
console.log('PASS checkin395 UI: free 5 button, x3 video offer, one choice per day, replay safety');

// A process exit during a rewarded check-in used to lock both video buttons across launches.
{
 const first=boot({novaRTSIntro:'1'}), e=first.s.test232.e;
 const expires=new Date(Date.now()+600000).toISOString();
 const id='10000000-0000-4000-8000-000000000010';
 e.d.onlineCrystal={owner};e.d.buildings[0].until=Date.now()+1800000;
 e.d.pendingAd230={owner,request_id:id,kind:'checkin',showRequested:true,status236:'loading',
  receipt:{id,kind:'checkin',expires_at:expires,verified:false,claimed:false}};
 e.save();
 const restart=boot(first.data), g=restart.s.Game, state=restart.s.test232.e.d;
 let shows=0,cancelled;
 restart.s.NovaAds={rewardVerified(){shows++;},cancelRewardLoad254(id){cancelled=id;}};
 function respond(data){const req=restart.requests.at(-1);restart.s.novaCloudEvent('war',{action:req.a,request_id:req.id,data});}
 assert(!state.pendingAd230.showRequested);
 restart.s.novaRewardStatus('ready');assert.equal(shows,0);
 g.openDaily340();respond({...ck(),admob230:true});g.checkin();
 assert.equal(restart.requests.at(-1).p.request_id,id);
 respond({...ck(),admob230:true,ad_reward:state.pendingAd230.receipt});assert.equal(shows,1);
 restart.s.novaRewardStatus('loading');
 assert.match(restart.el('modal').innerHTML,/Loading video|กำลังโหลดวิดีโอ/);
 assert.equal(JSON.parse(first.data.novaRTS1).pendingAd230.showRequested,undefined);
 const timeout=[...restart.timers.values()].findLast(t=>t.ms===30000);timeout.f();
 assert.equal(cancelled,id);assert.match(restart.el('modal').innerHTML,/Game.retryAd239/);
 restart.s.novaRewardStatus('ready');assert.equal(shows,1);
 g.speedAd264('building',String(state.buildings[0].id));
 assert.equal(restart.requests.at(-1).p.speed264,'prepare');
 assert.equal(state.pendingAd230.request_id,id);
 console.log('PASS interrupted check-in: recover legacy receipt, cancel a stalled load, accept a speed-up tap');
}
