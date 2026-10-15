const vm=require('vm'),fs=require('fs'),assert=require('assert'),crypto=require('crypto').webcrypto;
let writes=0,layouts=0,clears=0;const elements={},data={novaRTSIntro:'1'},requests=[];
const ctx=new Proxy({measureText:t=>({width:t.length*8}),clearRect:()=>clears++},{get:(o,k)=>o[k]||(()=>{})});
const el=id=>elements[id]||(elements[id]={style:{},innerHTML:'',textContent:'',addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>{layouts++;return {width:420,height:600};},querySelectorAll:()=>[]});
let frame;
const sandbox={console,crypto,Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:()=>0,clearTimeout(){},Image:class{},localStorage:{getItem:k=>data[k]||null,setItem:(k,v)=>{writes++;data[k]=v;}},document:{getElementById:el,addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame:f=>frame=f,NovaCloud:{warAvailable:()=>true,available:()=>true,war:(action,payload)=>requests.push({action,payload:JSON.parse(payload)})}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('game.js','utf8').replace("})(typeof globalThis!==","root.__engine=E;})(typeof globalThis!=="),sandbox);
const G=sandbox.Game,event=(action,d)=>sandbox.novaCloudEvent('war',{action,data:d}),wallet={owner:'account-a',test_gems:10000,can_claim:false};

const online={enrolled:true,owner:'a',tier:3,crystals:50000,capacity:100000,rate:0,research:{weapon:0,armor:0},enhancements:{'unit:0':5,'building:hq':10}};
const e=sandbox.__engine;e.save();const before=writes;e.save();e.save();assert.equal(writes,before,'identical saves do not write storage');e.d.gems++;e.save();assert.equal(writes,before+1,'changed balances save immediately');
G.training();const start=clears;for(let n=100;n<1100;n+=40)frame(n);assert.equal(clears,start,'menu does not redraw hidden battlefield');G.close();for(let n=1200;n<2200;n+=40)frame(n);assert(clears>start);assert.equal(layouts,1,'canvas layout read cached across frames');
G.treasury();assert(!el('modal').innerHTML.includes('exchangeBackMenu'));console.log('PASS menu performance: duplicate writes eliminated, hidden rendering stopped, canvas layout cached, reverse menu absent');
