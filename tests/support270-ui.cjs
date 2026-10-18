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




const a=boot({novaRTSIntro:'1',novaLanguage:'th'}),G=a.s.Game,T=a.s.test232,e=T.e;
const owner='10000000-0000-4000-8000-000000000001';e.d.onlineCrystal={owner};e.d.support228=true;e.d.builderCount228=1;e.d.gems=1000;T.clearBusy();
function reply(event,data={},message=''){const q=a.requests.at(-1);a.s.novaCloudEvent(event,{action:q.a,request_id:q.id,data:{owner,enrolled:true,support228:true,...data},message});}
G.buyBuilder228();G.supportConfirm228();const p={...e.d.pendingSupport228};assert.equal(e.d.gems,975);assert(p.request_id);G.close();
reply('war_error',{},'network timeout');assert.equal(a.el('modal').style.display,'none','error must not reopen dismissed dialog');
G.retrySupport228(false,true);assert.equal(a.el('modal').style.display,'none','background retry must not show loading');assert.equal(a.requests.at(-1).p.request_id,p.request_id);assert.equal(e.d.gems,975);
reply('war',{builder_count:2,receipt:{id:p.request_id,cost:25}});assert.equal(a.el('modal').style.display,'none','background success must not open shop');assert(!e.d.pendingSupport228);assert.equal(e.builderCount(),2);assert.equal(e.d.gems,975);
G.buyBuilder228();G.supportConfirm228();const stale={...e.d.pendingSupport228};reply('war_error',{},'จำนวนช่างเปลี่ยน กรุณาตรวจรายการ');assert.equal(a.requests.at(-1).p.support228,'cancel');assert.equal(a.requests.at(-1).p.request_id,stale.request_id);reply('war',{builder_count:3,receipt:{id:stale.request_id,cost:0,cancelled:true}});assert(!e.d.pendingSupport228);assert.equal(e.d.gems,975);assert.equal(e.builderCount(),3);assert(a.el('modal').innerHTML.includes('Game.buyBuilder228'));
G.buyBuilder228();G.supportConfirm228();const paid={...e.d.pendingSupport228};G.cancelSupport228();reply('war',{builder_count:4,receipt:{id:paid.request_id,cost:500,cancelled:false}});assert.equal(e.d.gems,475,'cancel after server success must not refund paid purchase');assert.equal(e.builderCount(),4);
assert.equal(a.errors.length,0);console.log('PASS support270: dismissed and background requests stay closed, same receipt retry, stale quote cancellation unlocks shop, no duplicate debit or false refund');
