const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const baseSource=fs.readFileSync('game.js','utf8'),source=baseSource.replace('})(typeof globalThis!==',fs.readFileSync('features/titan342/rewards396.js','utf8')+'\n})(typeof globalThis!=='),catalog={};
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


const a=boot({novaRTSIntro:'1'}),G=a.s.Game,e=a.s.test232.e,owner='10000000-0000-4000-8000-000000000002';let shown=[];a.s.NovaAds={rewardTest248:(...args)=>shown.push(args),acknowledgeTest248(){}};
const reply=d=>{const r=a.requests.at(-1);a.s.novaCloudEvent('war',{action:r.a,request_id:r.id,data:d});};
const base={owner,test_gems:0,test_checkin248:true,checkin233:{day:'2026-11-14',claimed:false,streak:6,reward:0,next_reward:5,server_time:new Date().toISOString(),next_reset:new Date(Date.now()+3600000).toISOString(),schedule340:true}};
G.openDaily340();reply(base);assert(a.el('modal').innerHTML.includes('15 NOVA'));assert(a.el('modal').innerHTML.includes('5 NOVA'));
const before=e.d.gems;G.checkin();assert.equal(a.requests.at(-1).p.normal396,true);assert.equal(shown.length,0);reply({...base,test_gems:5,checkin233:{...base.checkin233,claimed:true,reward:5}});assert.equal(e.d.gems,before+5);G.refreshCheckin233();reply({...base,test_gems:5,checkin233:{...base.checkin233,claimed:true,reward:5}});assert.equal(e.d.gems,before+5);
G.refreshCheckin233();reply({...base,checkin233:{...base.checkin233,day:'2026-11-15'}});G.checkinAd396();const p=a.requests.at(-1).p;assert.equal(p.checkin_test248,'prepare');reply({...base,test_receipt248:{id:p.request_id,day:'2026-11-15',amount:15,claimed:false}});assert.equal(shown.length,1);a.s.novaRewardStatus('closed');assert.equal(e.d.gems,before+5);a.s.novaTestRewardEarned248(owner,p.request_id);assert.equal(e.d.gems,before+5);reply({...base,test_gems:20,checkin233:{...base.checkin233,day:'2026-11-15',claimed:true,reward:15},test_receipt248:{id:p.request_id,day:'2026-11-15',amount:15,claimed:true,granted:15}});assert.equal(e.d.gems,before+20);
console.log('PASS rewards396 UI: normal skips ads, 5/15 labels, test bridge, no early reward, replay-safe credits');
