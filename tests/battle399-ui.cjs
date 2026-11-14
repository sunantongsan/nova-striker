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



const a=boot({novaRTSIntro:'1',novaLanguage:'th'}),e=a.s.test232.e,G=a.s.Game,owner='10000000-0000-4000-8000-000000000001';
let ads=0;a.s.NovaAds={rewardTest248(who,id){assert.equal(who,owner);ads++;},acknowledgeTest248(){}};
const reply=d=>{const q=a.requests.at(-1);a.s.novaCloudEvent('war',{action:q.a,request_id:q.id,data:{owner,...d}});};
// Bot win: 2 NOVA queued; video x3 = +4 NOVA from server and 2x more resources locally.
e.d.onlineCrystal={owner};e.d.gems=10;e.d.gold=0;e.d.power=0;e.scout(1);e.raid.buildings.forEach(b=>b.hp=0);const res=e.finish();assert.equal(res.gems,2);assert(res.win399);const base={gold:e.d.gold,power:e.d.power};assert(base.gold>0);
G.campaignAd399();let q=a.requests.at(-1);assert.equal(q.p.campaign399,'prepare');assert.equal(q.a,'test_status');const wid=q.p.id;assert.equal(wid,res.win399.id);
reply({campaign399:{owner,id:wid,stage:1,amount:2,bonus:0,claimed:false,provider:'test',credited:2}});assert.equal(e.d.gems,12,'win credited once registered');assert.equal(ads,1);assert.equal((e.d.campaignPending399||[]).length,0);
G.campaignAd399();assert.equal(ads,1,'no second video while showing');
a.s.novaTestRewardEarned248(owner,wid);q=a.requests.at(-1);assert.equal(q.p.campaign399,'claim');assert.equal(q.p.completed,true);assert.equal(e.d.gems,12,'callback alone grants nothing');
reply({campaign399:{owner,id:wid,stage:1,amount:2,bonus:4,claimed:true,provider:'test',credited:6}});assert.equal(e.d.gems,16);assert.equal(e.d.gold,Math.min(e.resourceCapacity(),base.gold*3));assert.equal(e.d.power,Math.min(e.resourceCapacity('power'),base.power*3));assert(!e.d.campaignAd399);assert(a.el('modal').innerHTML.includes('x3'));
a.s.test232.clearBusy&&a.s.test232.clearBusy();G.campaignAd399();assert.equal(a.requests.at(-1).p.campaign399,'claim','tripled result cannot start another video');
// Player attack: collect x1 without a video.
const battle='30000000-0000-4000-8000-000000000001',pending=[{battle,gold:100,power:50,nova:5}];
G.raidRewards260(battle);q=a.requests.at(-1);a.s.novaCloudEvent('war',{action:q.a,request_id:q.id,data:{owner,raid260:true,pending}});assert(a.el('modal').innerHTML.includes('collectRaid260')&&a.el('modal').innerHTML.includes('x3'));
G.collectRaid260(battle);q=a.requests.at(-1);assert.equal(q.a,'test_claim');assert.equal(q.p.raid260,'collect');assert.equal(ads,1,'collect needs no video');
a.s.novaCloudEvent('war',{action:q.a,request_id:q.id,data:{owner,raid260:true,pending:[],receipt:{id:q.p.request_id,battle,claimed:true,multiplier:1,granted:{gold:100,power:50,nova:5}}}});assert(!e.d.pendingRaid260);assert(a.el('modal').innerHTML.includes('5'));
console.log('PASS battle399 UI: bot win 2 NOVA, video x3 NOVA + resources once, raid collect x1 without video');
