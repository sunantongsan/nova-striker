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
 const base={owner:'new',mining251:{server_time:new Date().toISOString(),code:'test',base_rate:200,active_team:0,team_total:0,credited:0,earned:0,provider:'test'},test_gems:0,checkin233:{day:'2026-10-17',claimed:false,streak:0,reward:0,next_reward:20},welcome247:{eligible:true,amount:500,claimed:false}};
 a.s.test232.clearBusy();G.treasury();reply(base);assert.match(a.el('modal').innerHTML,/Claim 500 NOVA/);const before=e.d.gems;
 G.claimWelcome247();const count=a.requests.length;G.claimWelcome247();assert.equal(a.requests.length,count);assert.equal(a.requests.at(-1).p.welcome247,'claim');assert.equal(e.d.gems,before,'no credit before server confirmation');
 const granted={...base,test_gems:500,welcome247:{eligible:true,amount:500,claimed:true,id:'welcome-one'}};
 reply(granted);assert.equal(e.d.gems,before+500);assert.match(a.el('modal').innerHTML,/Congratulations/);assert.equal((a.el('modal').innerHTML.match(/<i style=/g)||[]).length,56,'bounded fireworks');
 G.treasury();reply(granted);assert.equal(e.d.gems,before+500);assert(!a.el('modal').innerHTML.includes('Congratulations'));
 const b=boot({...a.data},platform);b.s.test232.clearBusy();b.s.Game.treasury();const r=b.requests.at(-1);b.s.novaCloudEvent('war',{action:r.a,request_id:r.id,data:granted});assert.equal(b.s.test232.e.d.gems,before+500,'reload cannot credit receipt twice');
 G.treasury();reply({...base,welcome247:{eligible:false,amount:500,claimed:false}});assert(!a.el('modal').innerHTML.includes('Claim 500 NOVA'));
}
console.log('PASS welcome247 UI: Android/Telegram, server-confirmed credit, double tap, saved replay guard, eligibility and bounded celebration');

