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



const a=boot({novaRTSIntro:'1',novaLanguage:'th'}),e=a.s.test232.e,G=a.s.Game;const owner='10000000-0000-4000-8000-000000000001';e.d.onlineCrystal={owner};e.d.gems=10;e.scout(1);e.raid.buildings.forEach(b=>b.hp=0);e.finish();assert.equal(e.d.gems,10);G.home();let q=a.requests.at(-1);assert.equal(q.p.campaign399,'win');assert.equal(q.p.stage,1);const wid=q.p.id;a.s.novaCloudEvent('war',{request_id:q.id,data:{campaign399:{owner,id:wid,stage:1,amount:2,bonus:0,claimed:false,credited:2}}});assert.equal(e.d.gems,12);assert.equal(e.d.campaignPending399.length,0);a.s.novaCloudEvent('war',{request_id:q.id,data:{campaign399:{owner,id:wid,stage:1,amount:2,bonus:0,claimed:false,credited:2}}});assert.equal(e.d.gems,12);
console.log('PASS campaign credit queue, acknowledged reward and duplicate callback');
