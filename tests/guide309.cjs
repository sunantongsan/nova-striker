const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8'),catalog=require('../localization/en.json');
function boot(data={},platform='android',account=false,locale='en-US'){
 const elements={},errors=[],requests=[];let reloads=0,frame,timerId=0;const timers=new Map();
 const ctx=new Proxy({measureText:t=>({width:String(t).length*8}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
 const el=id=>elements[id]||(elements[id]={hidden:true,value:'',style:{},innerHTML:'',textContent:'',addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:420,height:800}),querySelectorAll:()=>[]});
 const storage={getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v,removeItem:k=>delete data[k]};
 const s={navigator:{languages:[locale],language:locale},crypto:require('node:crypto').webcrypto,console:{log(){},error:(...a)=>errors.push(a)},Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:(f,ms)=>{timers.set(++timerId,{f,ms});return timerId;},clearTimeout:id=>timers.delete(id),Image:class{},localStorage:storage,document:{getElementById:el,addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame:f=>frame=f,location:{reload:()=>reloads++},NovaCloud:{hasAccount:()=>account,available:()=>true,warAvailable:()=>true,load(){},warRequest:(a,p,id)=>requests.push({a,p:JSON.parse(p),id})}};
 if(platform==='telegram'){s.Telegram={WebApp:{}};s.window=s;}
 vm.createContext(s);vm.runInContext(source.replace('})(typeof globalThis!==','root.test232={e:E,setScreen:v=>screen=v,select:id=>selected=id,clearBusy:()=>{warBusy=false;warActive=null;},tick:()=>guideTick288(),guide:()=>guide288,guest:()=>guest288,setOnline:()=>{E.d.onlineCrystal={owner:"a"};E.d.admob230=true;}};})(typeof globalThis!=='),s);
 return {s,el,data,errors,requests,timers,reloads:()=>reloads,frame:n=>frame(n)};
}


const a=boot({},'android',false,'th-TH');a.s.Game.welcomeGuest();a.s.Game.guideAction288();a.el('baseNameInput').value='Alpha';a.s.Game.claimBaseName({preventDefault(){}});a.s.Game.guideNext288();
assert.equal(a.s.test232.guide().step,2);
a.s.Game.guideNext288();assert.equal(a.s.test232.guide().step,2,'next cannot skip building');
const e=a.s.test232.e;assert.equal(e.build('mine',1,1),'');
a.s.Game.guideNext288();assert.equal(a.s.test232.guide().step,3,'placing a mine completes the mission');
a.s.Game.guideAction288();a.s.Game.guideNext288();assert.equal(a.s.test232.guide().step,4);
a.s.Game.guideNext288();assert.equal(a.s.test232.guide().step,4,'opening Army does not complete training');
e.d.power=0;assert.ok(e.train278(0));a.s.Game.guideNext288();assert.equal(a.s.test232.guide().step,4,'failed training cannot complete mission');
e.d.power=500;assert.equal(e.train278(0),'');a.s.Game.guideNext288();assert.equal(a.s.test232.guide().step,5);
a.s.Game.guideNext288();assert.equal(a.s.test232.guide().step,5,'mission list is not a completed battle');
a.s.test232.setScreen('raid');a.s.test232.tick();assert.equal(a.el('guideDock288').hidden,true);a.s.test232.setScreen('home');a.s.test232.tick();a.s.Game.guideNext288();assert.equal(a.s.test232.guide().step,6);
a.s.Game.guideFinish288();assert.equal(a.s.test232.guide(),null);assert.deepEqual(a.errors,[]);
console.log('PASS guided actions: real build/train/battle gates, rejection, skip and combat visibility');
// Shipped demonstrations are self-contained H.264 MP4s, available offline.
const videos=JSON.parse(source.match(/var guideVideos309=(\{[^\n]+\});/)[1]);
for(const name of ['build','defense','train','attack']){const bytes=Buffer.from(videos[name].split(',')[1],'base64');assert.equal(bytes.toString('ascii',4,8),'ftyp');assert(bytes.includes(Buffer.from('avc1')));assert(bytes.length>10000);}
const auth=boot({},'android',false,'en-US');let logins=0,cancels=0;
auth.s.NovaCloud.loginPlayGames=()=>logins++;auth.s.NovaCloud.cancelPlayGames=()=>cancels++;
auth.s.Game.welcomePlayGames();auth.s.Game.welcomePlayGames();assert.equal(logins,1);
const deadline=[...auth.timers.values()].find(t=>t.ms===50000);assert(deadline);deadline.f();assert.equal(cancels,1);assert.equal(auth.el('welcomePlayGames').disabled,false);assert.match(auth.el('welcomeStatus').textContent,/respond/i);
auth.s.Game.welcomePlayGames();assert.equal(logins,2);auth.s.novaCloudEvent('status',{message:'Play Games unavailable'});assert.equal(auth.el('welcomePlayGames').disabled,false);
console.log('PASS offline MP4 demonstrations, Play Games timeout unlock, duplicate taps and retry');
