const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8'),catalog=require('../localization/en.json');
function boot(data={},platform='android'){
 const elements={},errors=[],requests=[];let reloads=0,frame,timerId=0;const timers=new Map();
 const ctx=new Proxy({measureText:t=>({width:String(t).length*8}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
 const el=id=>elements[id]||(elements[id]={hidden:true,value:'',style:{},innerHTML:'',textContent:'',addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:420,height:800}),querySelectorAll:()=>[]});
 const storage={getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v,removeItem:k=>delete data[k]};
 const s={crypto:require('node:crypto').webcrypto,console:{log(){},error:(...a)=>errors.push(a)},Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:(f,ms)=>{timers.set(++timerId,{f,ms});return timerId;},clearTimeout:id=>timers.delete(id),Image:class{},localStorage:storage,document:{getElementById:el,addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame:f=>frame=f,location:{reload:()=>reloads++},NovaCloud:{hasAccount:()=>true,available:()=>true,warAvailable:()=>true,load(){},warRequest:(a,p,id)=>requests.push({a,p:JSON.parse(p),id})}};
 if(platform==='telegram'){s.Telegram={WebApp:{}};s.window=s;}
 vm.createContext(s);vm.runInContext(source.replace('})(typeof globalThis!==','root.test232={hud:hud,draw:draw,bomber:bomberTick221,pack:livePack,unpack:liveUnpack,orders:siegeOrders,setRoom:v=>liveRoom=v,e:E,setScreen:v=>screen=v,select:id=>selected=id,clearBusy:()=>{warBusy=false;warActive=null;},setOnline:()=>{E.d.onlineCrystal={owner:"a"};E.d.admob230=true;}};})(typeof globalThis!=='),s);
 return {s,el,data,errors,requests,timers,reloads:()=>reloads,frame:n=>frame(n)};
}



const a=boot({novaRTSIntro:'1',novaLanguage:'th'}),G=a.s.Game,T=a.s.test232,e=T.e;
e.d.army[7]=4;e.scout(1);e.enableLogistics277();T.setScreen('raid');
assert.equal(Object.keys(e.raid.airAllowed278).length,0);
G.selectAir277(7);G.airNumber277(2,true);
assert.match(a.el('deploy').innerHTML,/aria-pressed="true"/);
assert.equal(e.deploy(7,3.25,3.75),'','bombers launch even with legacy empty manifest');
assert.equal(e.raid.troops.length,2);assert.equal(e.d.army[7],2);
for(const t of e.raid.troops){assert.equal(t.x<0,true);assert.deepEqual(JSON.parse(JSON.stringify(t.attackPoint280)),{x:3.25,y:3.75});}
const t=e.raid.troops[0];T.bomber(e.raid,t,e.raid.buildings,.01,0);assert.equal(t.sortie277.x,3.25);assert.equal(t.sortie277.y,3.75);
G.airNumber277(1,false);assert.equal(e.deploy(7,8.4,2.3),'');assert.equal(e.d.army[7],2,'retarget does not consume reserve');assert.equal(t.attackPoint280.x,8.4);assert.equal(e.raid.troops[1].attackPoint280.x,3.25);
for(let k=0;k<300;k++)T.bomber(e.raid,t,e.raid.buildings,.05,0);
assert.equal(t.sortie277.x,8.4,'subsequent passes preserve chosen point');
const before=JSON.stringify(e.d.army);assert(e.deploy(7,-1,3));assert.equal(JSON.stringify(e.d.army),before);
// Lost transports disappear from the command bar, while their simulation tombstones remain.
e.raid.fleet277=[{id:99,lv:1,cargo:[1]},{id:100,lv:1,cargo:[1]}];e.raid.transports277=[{id:99,cargo:[],hp:0,state:'approach'},{id:100,cargo:[],hp:100,state:'approach',lx:4,ly:4,x:-1,y:4}];
G.selectTransport277(100);assert(a.el('deploy').innerHTML.includes('Game.selectTransport277(100)'));assert(!a.el('deploy').innerHTML.includes('Game.selectTransport277(99)'));T.draw();
e.raid.transports277[1].hp=0;T.hud();assert(!a.el('deploy').innerHTML.includes('Game.selectTransport277(100)'));assert.equal(e.raid.transports277.length,2);
// Authoritative orders retain exact point across duplicates and host handover.
const b=boot({novaRTSIntro:'1'}),V=b.s.test232,f=V.e;f.scoutPlayer({callsign:'QA',layout:[{type:'hq',lv:8,x:10,y:10}],garrison:[],research:{}});f.enableLogistics277();f.raid.liveMode='attacker';f.d.onlineCrystal={owner:'a'};const room={v:2,id:'room',role:'attacker',host:true};V.setRoom(room);
const order={id:1,kind:7,x:0,y:7.25,owner:'a',logistics277:{target:0,x:4.75}};
V.orders({...room,orders:[order],logisticsOrders277:[]});assert.equal(f.raid.troops.length,1);const plane=f.raid.troops[0];assert.equal(plane.attackPoint280.x,4.75);assert.equal(plane.attackPoint280.y,7.25);plane.x=2;
V.orders({...room,orders:[order],logisticsOrders277:[]});assert.equal(plane.x,2,'repeated status must not teleport planes to entry');
V.orders({...room,orders:[],logisticsOrders277:[{id:1,owner:'a',payload:{action:'air',kind:5,count:1,x:1,y:1}}]});assert.equal(plane.attackPoint280.x,4.75,'helicopter launch cannot retarget bomber');
V.orders({...room,orders:[],logisticsOrders277:[{id:2,owner:'a',payload:{action:'air',kind:7,retarget:true,count:1,x:6.1,y:8.2,target:0}}]});assert.equal(plane.attackPoint280.x,6.1);
const packet=JSON.parse(JSON.stringify(V.pack()));delete plane.attackPoint280;V.unpack(packet);assert.equal(f.raid.troops[0].attackPoint280.y,8.2);
assert(!a.errors.length);assert(!b.errors.length);
console.log('PASS air280: exact point, legacy roster launch, repeated sorties, selected count retarget, highlights, dead ship removal, duplicate orders, independent air commands and host handover');
