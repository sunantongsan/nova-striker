const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8'),catalog=require('../localization/en.json');
function boot(data={},platform='android'){
 const elements={},errors=[],requests=[];let reloads=0,frame,timerId=0;const timers=new Map();
 const ctx=new Proxy({measureText:t=>({width:String(t).length*8}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
 const el=id=>elements[id]||(elements[id]={hidden:true,value:'',style:{},innerHTML:'',textContent:'',addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:420,height:800}),querySelectorAll:()=>[]});
 const storage={getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v,removeItem:k=>delete data[k]};
 const s={crypto:require('node:crypto').webcrypto,console:{log(){},error:(...a)=>errors.push(a)},Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:(f,ms)=>{timers.set(++timerId,{f,ms});return timerId;},clearTimeout:id=>timers.delete(id),Image:class{},localStorage:storage,document:{getElementById:el,addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame:f=>frame=f,location:{reload:()=>reloads++},NovaCloud:{hasAccount:()=>true,available:()=>true,warAvailable:()=>true,load(){},warRequest:(a,p,id)=>requests.push({a,p:JSON.parse(p),id})}};
 if(platform==='telegram'){s.Telegram={WebApp:{}};s.window=s;}
 vm.createContext(s);vm.runInContext(source.replace('})(typeof globalThis!==','root.test232={pack:livePack,unpack:liveUnpack,e:E,setScreen:v=>screen=v,select:id=>selected=id,clearBusy:()=>{warBusy=false;warActive=null;},setOnline:()=>{E.d.onlineCrystal={owner:"a"};E.d.admob230=true;}};})(typeof globalThis!=='),s);
 return {s,el,data,errors,requests,timers,reloads:()=>reloads,frame:n=>frame(n)};
}


const a=boot({novaRTSIntro:'1'}),e=a.s.test232.e;
e.scoutPlayer({callsign:'QA',layout:[{type:'hq',lv:8,x:10,y:10},{type:'cannonturret',lv:1,x:11,y:10}],infra:{},inventory:{},garrison:{},research:{}});
assert(e.raid);const r=e.raid,gun=r.buildings.find(b=>b.type==='cannonturret');
r.energy276=[{remaining:.4,x:13,y:10,damage:90,source:gun}];r.fx=[{x:11,y:10,tx:13,ty:10,weapon:'energy276',orb281:1.855,highArc:true,life:.4,maxLife:.85,color:'#35dfff'}];
const packet=a.s.test232.pack();assert.equal(packet.energy276.length,1);assert.equal(packet.fx[0].life,.4);assert.equal(packet.fx[0].maxLife,.85);assert.equal(packet.fx[0].orb281,1.855);
r.energy276=[];a.s.test232.unpack(JSON.parse(JSON.stringify(packet)));assert.equal(r.energy276.length,1);assert.equal(r.energy276[0].source,gun);assert.equal(r.energy276[0].remaining,.4);
packet.energy276.push([999,1,1,90,gun.id],[.4,99,1,90,gun.id],[.4,1,1,-1,gun.id],[.4,1,1,90,99999]);a.s.test232.unpack(packet);assert.equal(r.energy276.length,1,'invalid handover projectiles ignored');
console.log('PASS energy276 UI: live flight timing and pending projectile host-handover serialization');
