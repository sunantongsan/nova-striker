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


const a=boot({novaRTSIntro:'1'}),G=a.s.Game,e=a.s.test232.e;
e.d.gems=500;e.d.crystals=0;
G.war();let req=a.requests.at(-1);
const online={enrolled:true,owner:'a',tier:3,crystals:0,capacity:100000,rate:0,research:{weapon:0,armor:0},enhancements:{},paths245:true,enhancement_paths245:{},active_upgrades:[]};
const reply=d=>{let r=a.requests.at(-1);a.s.novaCloudEvent('war',{action:r.a,request_id:r.id,data:d});};reply(online);
G.enhanceInfo('unit:0',1);assert(a.el('modal').innerHTML.includes('NOVA'));assert(!a.el('modal').innerHTML.includes('🔮'));G.pickEnhance245('attack');G.enhanceBuy();req=a.requests.at(-1);assert.equal(req.p.enhance_currency257,'NOVA');assert.equal(req.p.quoted_cost257,100);assert.equal(e.d.gems,500,'no premature debit');
const response={...online,enhancements:{'unit:0':1},enhancement_paths245:{'unit:0':{attack:1}},receipt:{id:req.p.request_id,key:'unit:0',level:1,pending:false,completed:true,cost:100,currency:'NOVA'}};reply(response);assert.equal(e.d.gems,400);assert.equal(e.d.crystals,0);assert.equal(e.d.enhancements['unit:0'],1);assert(!a.el('modal').innerHTML.includes('◷'));reply(response);assert.equal(e.d.gems,400,'receipt replay is not charged twice');
G.enhanceInfo('building:hq',1);assert(a.el('modal').innerHTML.includes('aria-pressed="true"'),'single path automatically selected');
G.close();const tg=boot({novaRTSIntro:'1'},'telegram');tg.s.novaCloudEvent('signed_in',{});const delayed=[...tg.timers.values()].filter(t=>t.ms===700);assert.equal(delayed.length,1);delayed[0].f();assert(!tg.el('modal').innerHTML.includes('mining251'),'login does not open wallet');tg.s.Game.treasury();assert(tg.el('modal').innerHTML.includes('checkin-grid237'),'wallet still opens on demand');
console.log('PASS enhance257 UI: NOVA only with zero crystals, quoted request, single debit/replay, automatic sole path, no login wallet, manual wallet');

