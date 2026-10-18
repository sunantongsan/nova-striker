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



const a=boot({novaRTSIntro:'1',novaLanguage:'th'}),G=a.s.Game,e=a.s.test232.e;
G.build();let html=a.el('modal').innerHTML;assert(html.includes('build-card261'));assert(!html.includes('Game.place(\'hq\')'));assert(!html.includes('Game.place(\'factory\')'),'locked HQ level cannot build');assert(html.includes('Game.buildUpgrade260(\'hq\')'));assert(html.includes('Game.buildEnhance260(\'hq\')'));assert(!html.includes('class="grid"'));
const battle='20000000-0000-4000-8000-000000000099',owner='10000000-0000-4000-8000-000000000001';
const pending=[{battle,gold:100,power:50,nova:40}];let ads=0;
a.s.NovaAds={rewardTest248(who,id){assert.equal(who,owner);ads++;},acknowledgeTest248(){}};
function reply(data){const q=a.requests.at(-1);a.s.novaCloudEvent('war',{action:q.a,request_id:q.id,data:{owner,raid260:true,pending,...data}});}
G.raidRewards260(battle);assert.equal(ads,0);reply({});let req=a.requests.at(-1);assert.equal(req.p.raid260,'prepare');const id=req.p.request_id;reply({receipt:{id,battle,provider:'test',claimed:false,expires_at:new Date(Date.now()+1800000).toISOString()}});assert.equal(ads,1);assert(!e.d.pendingRaid260.completed);G.claimRaid260(battle);assert.equal(ads,1,'double click cannot load another video');
a.s.novaRewardStatus('closed');assert(!e.d.pendingRaid260.completed);G.claimRaid260(battle);reply({receipt:{id,battle,provider:'test',claimed:false,expires_at:new Date(Date.now()+1800000).toISOString()}});assert.equal(ads,2);
a.s.novaTestRewardEarned248('wrong',id);assert(!e.d.pendingRaid260.completed);const before=e.d.gems;a.s.novaTestRewardEarned248(owner,id);assert.equal(a.requests.at(-1).p.raid260,'claim');assert.equal(e.d.gems,before,'callback alone cannot credit');assert(e.d.pendingRaid260.completed);
// Reload remembers completed video and retries the same receipt; it does not load another video.
const b=boot(a.data);b.s.Game.raidRewards260();let q=b.requests.at(-1);b.s.novaCloudEvent('war',{action:q.a,request_id:q.id,data:{owner,raid260:true,pending}});b.s.Game.claimRaid260(battle);q=b.requests.at(-1);assert.equal(q.p.raid260,'claim');assert.equal(q.p.request_id,id);b.s.novaCloudEvent('war',{action:q.a,request_id:q.id,data:{owner,raid260:true,pending:[],receipt:{id,battle,provider:'test',claimed:true}}});assert(!b.s.test232.e.d.pendingRaid260);assert.equal(b.requests.at(-1).p.mining251,'status','wallet reconciles only after server grant');
console.log('PASS raid260 UI: compact menu, locked/full building controls, opt-in ads, no premature credit, failure, ownership, duplicate clicks and reload recovery');
// Native production bridge sends ready before show and a separate delivery UUID after earning.
const c=boot({novaRTSIntro:'1'});let shown=0,ack=null;c.s.NovaAds={rewardVerified(){shown++;},acknowledgeReward(id){ack=id;}};c.s.Game.raidRewards260(battle);let n=c.requests.at(-1);c.s.novaCloudEvent('war',{action:n.a,request_id:n.id,data:{owner,raid260:true,pending}});n=c.requests.at(-1);const intent=n.p.request_id;c.s.novaCloudEvent('war',{action:n.a,request_id:n.id,data:{owner,raid260:true,pending,receipt:{id:intent,battle,provider:'admob',claimed:false,expires_at:new Date(Date.now()+1800000).toISOString()}}});assert.equal(shown,1);c.s.novaRewardStatus('ready');assert.equal(shown,2);c.s.novaRewardEarned('native-delivery-uuid');assert.equal(ack,'native-delivery-uuid');assert.equal(c.requests.at(-1).p.request_id,intent);assert.equal(c.requests.at(-1).p.raid260,'claim');
console.log('PASS native production ready/show/delivery correlation');
