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
e.d.gold=e.d.power=100000;e.d.buildings[0].lv=4;
G.build('economy');let html=a.el('modal').innerHTML;assert(html.includes('build-card261'));assert(html.includes('Game.place(\'goldstore\')'));assert(!html.includes('Game.place(\'gun\')'));assert(!/crystalplant|crystalstore|ผลึก/.test(html));
G.build('defense');html=a.el('modal').innerHTML;assert(html.includes('Game.place(\'wall\')'));assert(!html.includes('Game.place(\'mine\')'));
const b=e.d.buildings.find(x=>x.type==='mine'),before={gold:e.d.gold,power:e.d.power,level:b.lv};G.inspectBuilding261(b.id,true);assert(a.el('modal').innerHTML.includes('detail-hero261'));assert(a.el('modal').innerHTML.includes('→'));assert.equal(e.d.gold,before.gold);assert.equal(e.d.power,before.power);assert.equal(b.lv,before.level);assert(!b.until,'preview must not spend or upgrade');
G.confirmUpgrade261(b.id,b.lv+1);assert(!b.until,'stale level rejected');G.confirmUpgrade261(b.id,b.lv);assert(b.until,'confirmed upgrade uses existing engine');const gold=e.d.gold;G.confirmUpgrade261(b.id,b.lv);assert.equal(e.d.gold,gold,'duplicate confirm cannot spend again');
G.inspectBuilding261(b.id,false);assert(a.el('modal').innerHTML.includes('Game.speedConfirm()'));
console.log('PASS village261: illustrated categories, retired content absent, current/next stats, preview has no side effects, stale/duplicate confirmation, progress and speed controls');
