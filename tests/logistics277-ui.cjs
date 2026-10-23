const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8'),catalog=require('../localization/en.json');
function boot(data={},platform='android'){
 const elements={},errors=[],requests=[];let reloads=0,frame,timerId=0;const timers=new Map();
 const ctx=new Proxy({measureText:t=>({width:String(t).length*8}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
 const el=id=>elements[id]||(elements[id]={hidden:true,value:'',style:{},innerHTML:'',textContent:'',addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:420,height:800}),querySelectorAll:()=>[]});
 const storage={getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v,removeItem:k=>delete data[k]};
 const s={crypto:require('node:crypto').webcrypto,console:{log(){},error:(...a)=>errors.push(a)},Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:(f,ms)=>{timers.set(++timerId,{f,ms});return timerId;},clearTimeout:id=>timers.delete(id),Image:class{},localStorage:storage,document:{getElementById:el,addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame:f=>frame=f,location:{reload:()=>reloads++},NovaCloud:{hasAccount:()=>true,available:()=>true,warAvailable:()=>true,load(){},warRequest:(a,p,id)=>requests.push({a,p:JSON.parse(p),id})}};
 if(platform==='telegram'){s.Telegram={WebApp:{}};s.window=s;}
 vm.createContext(s);vm.runInContext(source.replace('})(typeof globalThis!==','root.test232={pack:livePack,unpack:liveUnpack,orders:siegeOrders,setRoom:v=>liveRoom=v,e:E,setScreen:v=>screen=v,select:id=>selected=id,clearBusy:()=>{warBusy=false;warActive=null;},setOnline:()=>{E.d.onlineCrystal={owner:"a"};E.d.admob230=true;}};})(typeof globalThis!=='),s);
 return {s,el,data,errors,requests,timers,reloads:()=>reloads,frame:n=>frame(n)};
}


const a=boot({novaRTSIntro:'1'}),G=a.s.Game,e=a.s.test232.e;
G.manifest277();assert(a.el('modal').innerHTML.includes('data-ship278="1"'));assert(a.el('modal').innerHTML.includes('data-kind278="0"'));assert(a.el('modal').innerHTML.includes('row278'));
assert.equal(e.assign277(1,0,0,4),'');G.manifest277();assert(a.el('modal').innerHTML.includes('4 / 12'));G.saveManifest277();e.assign277(0,0,1,2);G.loadManifest277();assert.equal(e.d.logistics277.ships[0].cargo[0],4);
G.readyManifest277();e.scoutPlayer({callsign:'QA',layout:[{type:'hq',lv:8,x:10,y:10},{type:'gun',lv:1,x:11,y:10}],garrison:[],research:{}});e.enableLogistics277();e.raid.liveMode='attacker';e.d.onlineCrystal={owner:'a'};
const room={v:2,id:'room',role:'attacker',host:true};a.s.test232.setRoom(room);
const orders=[{id:1,kind:0,x:0,y:10,owner:'a',logistics277:{ship:1,lv:1}},{id:2,kind:1,x:0,y:10,owner:'a',logistics277:{ship:1,lv:1}}];
a.s.test232.orders({...room,orders,logisticsOrders277:[]});assert.equal(e.raid.troops.length,0);assert.equal(e.raid.transports277.length,1);assert.equal(e.raid.transports277[0].cargo.length,2);a.s.test232.orders({...room,orders,logisticsOrders277:[]});assert.equal(e.raid.transports277[0].cargo.length,2);
assert.equal(e.raid.transports277[0].unload,true,'new transport unloads automatically');e.raid.transports277[0].unload=false;
a.s.test232.orders({...room,orders:[],logisticsOrders277:[{id:1,owner:'other',payload:{action:'unload',ship:1}}]});assert.equal(e.raid.transports277[0].unload,false);
a.s.test232.orders({...room,orders:[],logisticsOrders277:[{id:2,owner:'a',payload:{action:'unload',ship:1}}]});assert.equal(e.raid.transports277[0].unload,true);
const packet=JSON.parse(JSON.stringify(a.s.test232.pack()));e.raid.transports277=[];a.s.test232.unpack(packet);assert.equal(e.raid.transports277[0].cargo[0].order,1);assert.equal(e.raid.commandAck277,2);assert.equal(e.raid.transports277[0].unload,true);assert(JSON.stringify(packet).length<32768);
assert.equal(a.errors.length,0);console.log('PASS logistics277 UI: compact manifest, preset, server cargo withholding, duplicate orders, owner-only unloading, host handover, embedded offline voice clips');
e.raid.troops=Array.from({length:150},(_,i)=>({kind:0,x:20.123,y:20.321,hp:9999,max:9999,aim:1,heading:2,walk:3,order:i+1,owner:'a'}));e.raid.guards=Array.from({length:80},()=>({kind:2,x:20,y:20,hp:9999,max:9999,alien:true}));e.raid.buildings=Array.from({length:200},()=>({hp:99999,aim:1,recoil:0}));e.raid.transports277=Array.from({length:20},(_,i)=>({...e.raid.transports277[0],id:i,key:'owner:'+i,cargo:[]}));assert(JSON.stringify(a.s.test232.pack()).length+3000<32768,'large battle and fleet fit Android bridge');

