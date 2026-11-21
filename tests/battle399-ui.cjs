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
a.s.test232.setScreen('raid');G.campaignAd399();let q=a.requests.at(-1);assert.equal(q.p.campaign399,'win');reply({campaign399:{id:q.p.id,amount:2,bonus:0,claimed:false,credited:2}});q=a.requests.at(-1);assert.equal(q.p.campaign399,'prepare');assert.equal(q.a,'test_status');const wid=q.p.id;assert.equal(wid,res.win399.id);
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

// Regression 440: base credit survives ad failure; every waiting/failure state can return home.
function campaign440(){
 const b=boot({novaRTSIntro:'1',novaLanguage:'th'}),e=b.s.test232.e;
 e.d.onlineCrystal={owner};e.d.gems=10;e.scout(1);e.raid.buildings.forEach(v=>v.hp=0);e.finish();b.s.test232.setScreen('raid');
 b.reply=c=>{const q=b.requests.at(-1);b.s.novaCloudEvent('war',{request_id:q.id,data:{owner,campaign399:{id:q.p.id,amount:2,credited:2,claimed:false,...c}}});};
 b.fire=ms=>{const timer=[...b.timers.values()].find(t=>t.ms===ms);assert(timer,'timer '+ms);timer.f();};
 return b;
}
{
 const b=campaign440(),G=b.s.Game,e=b.s.test232.e;let shown=0;
 b.s.NovaAds={rewardVerified(){shown++;}};
 G.campaignAd399();assert.equal(b.requests.at(-1).p.campaign399,'win');assert.match(b.el('modal').innerHTML,/Game.home/);
 b.reply({});assert.equal(e.d.gems,12);assert.equal(b.requests.at(-1).p.campaign399,'prepare');
 b.reply({provider:'admob'});assert.equal(shown,1);
 b.s.novaRewardStatus('unavailable');assert.match(b.el('modal').innerHTML,/Game.home/);assert.equal(e.d.gems,12);
 G.campaignAd399();b.fire(25000);assert.match(b.el('modal').innerHTML,/Game.home/);assert.equal(e.d.gems,12);
 G.home();assert.equal(b.s.test232.screen(),'home');assert.equal(e.raid,null);
}
{
 const b=campaign440();let shown=0;b.s.NovaAds={rewardVerified(){shown++;}};
 b.s.Game.campaignAd399();b.reply({});b.s.Game.home();b.reply({provider:'admob'});
 assert.equal(shown,0,'late prepare must not launch an ad after returning home');assert.equal(b.s.test232.screen(),'home');assert.equal(b.s.test232.e.d.gems,12);
}
{
 const b=campaign440();let ack=0;b.s.NovaAds={rewardVerified(){},acknowledgeReward(){ack++;}};
 b.s.Game.campaignAd399();b.reply({});b.reply({provider:'admob'});b.fire(45000);
 assert.match(b.el('modal').innerHTML,/Game.home/);
 b.s.novaRewardEarned('native-receipt');assert.equal(ack,1,'late earned event remains recoverable');
 assert.equal(b.requests.at(-1).p.campaign399,'claim');assert.equal(b.s.test232.e.d.gems,12,'native event alone cannot grant bonus');
 b.reply({provider:'admob',amount:2,bonus:4,credited:6,claimed:true});assert.equal(b.s.test232.e.d.gems,16);
 b.reply({provider:'admob',amount:2,bonus:4,credited:6,claimed:true});assert.equal(b.s.test232.e.d.gems,16,'duplicate response cannot pay twice');
}
console.log('PASS campaign440: independent base credit, ad errors, network/SDK timeout, home navigation, late callbacks, server verification and duplicate protection');
{
 const b=campaign440();let ack=0;b.s.NovaAds={rewardVerified(){},acknowledgeReward(){ack++;}};
 b.s.Game.campaignAd399();b.reply({});b.reply({provider:'admob'});
 const e=b.s.test232.e,save=e.save;e.save=()=>false;b.s.novaRewardEarned('unsaved-receipt');
 assert.equal(ack,0,'do not acknowledge a reward that failed durable save');assert.equal(e.d.campaignAd399.completed,false);e.save=save;
 assert.match(b.el('modal').innerHTML,/Game.home/);
}
{
 const b=campaign440(),e=b.s.test232.e;b.s.Game.campaignAd399();b.fire(25000);
 assert.equal(e.d.gems,10,'network timeout cannot create unverified NOVA');assert.equal(e.d.campaignPending399.length,1,'retain win for retry');
 assert.match(b.el('modal').innerHTML,/Game.home/);b.s.Game.home();assert.equal(b.s.test232.screen(),'home');
}
console.log('PASS campaign440: failed saves retain native receipts; offline wins stay pending without blocking Home');
