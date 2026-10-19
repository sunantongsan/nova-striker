const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8'),catalog=require('../localization/en.json');
function boot(data={},platform='android'){
 const events={};const elements={},errors=[],requests=[];let reloads=0,frame,timerId=0;const timers=new Map();
 const ctx=new Proxy({measureText:t=>({width:String(t).length*8}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
 const el=id=>elements[id]||(elements[id]={hidden:true,value:'',style:{},innerHTML:'',textContent:'',addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:420,height:800}),querySelectorAll:()=>[]});
 const storage={getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v,removeItem:k=>delete data[k]};
 const s={crypto:require('node:crypto').webcrypto,console:{log(){},error:(...a)=>errors.push(a)},Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:(f,ms)=>{timers.set(++timerId,{f,ms});return timerId;},clearTimeout:id=>timers.delete(id),Image:class{},localStorage:storage,document:{getElementById:el,addEventListener:(n,f)=>{(events[n]||(events[n]=[])).push(f);},createElement:()=>({style:{},remove(){}}),body:{appendChild(){}},hidden:false},addEventListener(){},requestAnimationFrame:f=>frame=f,location:{reload:()=>reloads++},NovaCloud:{hasAccount:()=>true,available:()=>true,warAvailable:()=>true,load(){},warRequest:(a,p,id)=>requests.push({a,p:JSON.parse(p),id})}};
 if(platform==='telegram'){s.Telegram={WebApp:{}};s.window=s;}
 vm.createContext(s);vm.runInContext(source.replace('})(typeof globalThis!==','root.test232={pack:livePack,unpack:liveUnpack,orders:siegeOrders,setRoom:v=>liveRoom=v,e:E,setScreen:v=>screen=v,select:id=>selected=id,clearBusy:()=>{warBusy=false;warActive=null;},setOnline:()=>{E.d.onlineCrystal={owner:"a"};E.d.admob230=true;}};})(typeof globalThis!=='),s);
 return {events,s,el,data,errors,requests,timers,reloads:()=>reloads,frame:n=>frame(n)};
}



const a=boot({novaRTSIntro:'1',novaLanguage:'th'}),G=a.s.Game,e=a.s.test232.e;
e.d.gold=e.d.power=100000;e.d.army[0]=20;e.d.buildings.push({id:999,type:'camp',lv:10,x:15,y:15});
const handlers={},unit={dataset:{kind278:'0',from278:'0'},addEventListener:(n,f)=>handlers[n]=f,setPointerCapture(){},releasePointerCapture(){}};
a.el('modal').querySelectorAll=sel=>sel==='[data-kind278]'?[unit]:[];
G.training();assert(a.el('modal').innerHTML.includes('roster278'));assert(a.el('modal').innerHTML.includes('overflow-x:auto'));
const ev=(x=10,y=10)=>({pointerId:1,clientX:x,clientY:y,target:{closest:()=>null},preventDefault(){}}),fire=(name,v)=>a.events[name].forEach(f=>f(v));
handlers.pointerdown(ev());fire('pointerup',ev());assert.equal(e.d.queue.length,1,'tap produces once, no cargo');assert.equal(e.d.logistics277.ships[0].cargo[0],0);
handlers.pointerdown(ev());fire('pointermove',ev(80,10));fire('pointerup',ev(80,10));assert.equal(e.d.queue.length,1,'horizontal swipe does not produce');
handlers.pointerdown(ev());for(const t of [...a.timers.values()])if(t.ms===320)t.f();a.s.document.elementFromPoint=()=>({closest:s=>s==='[data-ship278]'?{dataset:{ship278:'1'}}:null});fire('pointermove',ev(50,200));fire('pointerup',ev(50,200));assert.equal(e.d.logistics277.ships[0].cargo[0],1,'held drag loads one');assert.equal(e.d.queue.length,1);assert.equal(e.d.army[0],20,'loading does not duplicate or consume inventory');
handlers.pointerdown(ev());fire('pointercancel',ev());fire('pointerup',ev());assert.equal(e.d.queue.length,1,'cancel is inert');
G.enhanceInfo('unit:transport',1);assert(a.el('modal').innerHTML.includes('Game.enhanceBuy'));assert(!a.errors.length);
console.log('PASS army278 UI: tap production, swipe isolation, hold-drag loading, cancellation and transport enhancement panel');
