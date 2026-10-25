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
const owner='10000000-0000-4000-8000-000000000001',id='20000000-0000-4000-8000-000000000001';
e.d.onlineCrystal={owner};e.d.gems=100;const target={id:'10000000-0000-4000-8000-000000000002',callsign:'Test',layout:[{type:'hq',lv:1,x:10,y:10}]};T.clearBusy();T.setWar({targets:[target]});
e.d.gold=1000;G.warScout(0);assert.equal(e.d.gems,100);assert(e.d.pendingScout362);const search=e.d.pendingScout362.request_id;G.warScout(0);assert.equal(e.d.gems,100);let q=a.requests.at(-1);assert.equal(q.p.live,'siege_scout_gold362');assert.equal(q.p.request_id,search);
a.s.novaCloudEvent('war',{action:q.a,request_id:q.id,data:{live:'siege_peek',target,scout362:{id:search,owner,cost:100},online:{enrolled:true,owner,resources:{gold_delta:-100,power_delta:0}}}});assert(!e.d.pendingScout362);assert.equal(T.screen(),'raid');assert.equal(e.d.gems,100);assert.equal(e.d.gold,900);

const b={v:2,id,role:'attacker',host:true,epoch:1,seq:0,ack:0,target,roster:[3,0,0,0,0,0,0,0,0,0,0],army:[2,0,0,0,0,0,0,0,0,0,0],orders:[],members:[],remaining:150,finished:false};T.accept(b);T.clearBusy();G.confirmRetreat243();assert(e.d.pendingRetreat262);q=a.requests.at(-1);assert.equal(q.p.live,'siege_retreat');assert(q.p.frame,'host sends final frame');assert.equal(q.p.epoch,1);
const army=e.d.army[0];a.s.novaCloudEvent('war',{action:q.a,request_id:q.id,data:{live:'siege_retreat',battle:{...b,host:false,finished:true,withdrawn:true,result:{surrendered:true,destruction:50,loot_gold:250,loot_power:100,nova255:20,army:b.army}}}});
assert.equal(T.screen(),'home','surrender must immediately return home without waiting');assert(!e.d.pendingRetreat262);assert(!e.d.liveBattle);assert.equal(e.d.army[0],army+2);assert(a.el('modal').innerHTML.includes('Game.raidRewards260'));T.accept({...b,finished:true,withdrawn:true,result:{army:b.army}});assert.equal(e.d.army[0],army+2,'replayed result cannot return troops twice');
// Busy frame transmission queues surrender instead of dropping the tap.
const b2={...b,id:'20000000-0000-4000-8000-000000000002'};T.accept(b2);G.confirmRetreat243();T.clearBusy();T.heartbeat();assert.equal(a.requests.at(-1).p.live,'siege_retreat');
assert.equal(a.errors.length,0);console.log('PASS battle262 UI: gold-only search, paid preview, final host snapshot, immediate home, troop replay, queued surrender');

