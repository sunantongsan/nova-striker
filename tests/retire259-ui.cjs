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
e.d.buildings.push({id:200,type:'crystalplant',lv:8,x:1,y:1},{id:201,type:'crystalstore',lv:9,x:2,y:1},{id:202,type:'tech',lv:10,x:3,y:1});e.d.buildings[0].lv=12;e.d.enhancements={'unit:0':7,'building:hq':4};e.d.research={weapon:3,armor:4};e.d.crystals=90000;e.save();
const b=boot(a.data),f=b.s.test232.e,H=b.s.Game;
assert(!f.d.buildings.some(x=>x.type.startsWith('crystal')));assert.equal(f.d.buildings[0].lv,12);assert.equal(f.d.enhancements['unit:0'],7);assert.equal(f.d.research.armor,4);assert.equal(f.d.crystals,0);
for(const method of ['build','training','activities','treasury','enhanceMenu']){H[method]();assert(!/ผลึก|crystalplant|crystalstore|🔮/.test(b.el('modal').innerHTML),method);}
f.d.gold=f.d.power=10000000;f.d.army=f.d.army.map(()=>0);f.d.builderCount228=5;f.d.onlineCrystal={owner:'a'};f.d.economyConfirmedAt=Date.now();
assert.equal(f.upgradeCost(f.d.buildings[0]).crystals,0);b.s.test232.select(f.d.buildings[0].id);H.upgrade();assert(f.d.buildings[0].until);assert(!f.d.pendingCrystal);
f.d.buildings.push({id:300,type:'airbase',lv:10,x:4,y:1},{id:301,type:'factory',lv:10,x:5,y:1},{id:302,type:'camp',lv:15,x:6,y:1},{id:303,type:'garrison',lv:7,x:7,y:1});assert.equal(f.train(7),'');assert.equal(f.train(9),'');assert.equal(f.d.crystals,0);
b.s.test232.select(303);H.upgrade();assert(f.d.buildings.find(x=>x.id===303).until);assert(!b.el('selection').innerHTML.includes('ผลึก'));
H.crystalExchange();assert(!/ผลึก|🔮/.test(b.el('modal').innerHTML));assert.equal(f.exchange('crystals',1).length>0,true);
// Repeat reload migration: bonuses, other buildings and queued troops remain.
f.save();const c=boot(b.data);assert.equal(c.s.test232.e.d.enhancements['unit:0'],7);assert.equal(c.s.test232.e.d.queue.length,2);
console.log('PASS retirement UI: old save migration, menus, zero-crystal high-level upgrades and heavy troops, garrison, reload and bonuses');
