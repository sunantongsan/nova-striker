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
const owner='10000000-0000-4000-8000-000000000001',id='20000000-0000-4000-8000-000000000001';e.d.onlineCrystal={owner};T.clearBusy();
const target={id:'10000000-0000-4000-8000-000000000002',callsign:'Enemy',layout:[{type:'hq',lv:1,x:10,y:10}]};
const battle={v:2,id,role:'attacker',host:true,epoch:1,seq:0,ack:0,target,roster:[3,0,0,0,0,0,0,0,0,0,0],army:[2,0,0,0,0,0,0,0,0,0,0],orders:[],members:[],remaining:172,finished:false};
T.accept(battle);assert.equal(T.screen(),'raid');const army=e.d.army[0];const done={...battle,finished:true,result:{destruction:100,loot_gold:100,loot_power:50,nova255:40,army:battle.army}};
T.accept(done);assert.equal(T.screen(),'home','server finish returns home with 172 seconds remaining');assert.equal(e.raid,null);assert.equal(e.d.army[0],army+2);assert(a.el('modal').innerHTML.includes('รับรางวัล'));assert(!/วิดีโอ|โฆษณา/.test(a.el('modal').innerHTML));
let ads=0;a.s.NovaAds={rewardTest248(){ads++},acknowledgeTest248(){}};
const pending=[{battle:id,gold:100,power:50,nova:40}];function reply(data){const q=a.requests.at(-1);a.s.novaCloudEvent('war',{action:q.a,request_id:q.id,data:{owner,raid260:true,pending,...data}});}
G.raidRewards260(id);reply({});let req=a.requests.at(-1);assert.equal(req.p.raid260,'prepare');const intent=req.p.request_id;reply({receipt:{id:intent,battle:id,provider:'test',claimed:false,expires_at:new Date(Date.now()+1e6).toISOString()}});assert.equal(ads,1,'one claim tap launches video');
a.s.novaRewardStatus('closed');assert(a.el('modal').innerHTML.includes('Game.claimRaid260'));assert(!e.d.pendingRaid260.completed);G.claimRaid260(id);reply({receipt:{id:intent,battle:id,provider:'test',claimed:false,expires_at:new Date(Date.now()+1e6).toISOString()}});assert.equal(ads,2);
a.s.novaTestRewardEarned248(owner,intent);reply({pending:[],receipt:{id:intent,battle:id,provider:'test',claimed:true,granted:{gold:100,power:50,nova:40}}});assert(a.el('modal').innerHTML.includes('ยินดีด้วย'));assert(a.el('modal').innerHTML.includes('Game.raidRewardDone269()'));assert.equal((a.el('modal').innerHTML.match(/<button /g)||[]).length,1);
T.setRoom({...battle,finished:false});T.setScreen('raid');e.raid={time:172};G.raidRewardDone269();assert.equal(T.screen(),'home');assert.equal(a.el('modal').style.display,'none');T.accept(done);assert.equal(a.el('modal').style.display,'none','late repeated result cannot reopen battle or summary');assert.equal(e.d.army[0],army+2);
const other={...battle,id:'20000000-0000-4000-8000-000000000002'};T.accept(other);G.raidRewardDone269();assert.equal(T.screen(),'raid','old reward acknowledgement cannot abandon a different live battle');assert.equal(a.errors.length,0);
console.log('PASS raid269: normal finish at172s, receipt-only reward, one-tap video, interrupted-video retry, congratulations single OK, home, result replay and unrelated-battle guard');
