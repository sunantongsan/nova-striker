function setup(){
const vm=require('vm'),fs=require('fs'),assert=require('assert'),crypto=require('crypto').webcrypto;
let now=Date.now(),timers=[],frames=[];class Clock extends Date{constructor(...a){super(...(a.length?a:[now]));}static now(){return now;}}
const elements={},data={novaRTSIntro:'1'},requests=[],ctx=new Proxy({measureText:t=>({width:t.length*8})},{get:(o,k)=>o[k]||(()=>{})});const el=id=>elements[id]||(elements[id]={style:{},innerHTML:'',textContent:'',addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:420,height:600}),querySelectorAll:()=>[]});
const box={console,crypto,Date:Clock,Math,Uint8Array,performance:{now:()=>0},setTimeout:(fn,ms)=>{timers.push({fn,ms});return timers.length;},clearTimeout(){},Image:class{},localStorage:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v},document:{getElementById:el,addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame:fn=>frames.push(fn),NovaCloud:{warAvailable:()=>true,available:()=>true,war:(action,payload)=>requests.push({action,payload:JSON.parse(payload)})}};
box.localStorage && box.localStorage.setItem('novaLanguage','th');vm.createContext(box);vm.runInContext(fs.readFileSync('game.js','utf8').replace("})(typeof globalThis!==","root.__engine=E;root.__pack=livePack;})(typeof globalThis!=="),box);const G=box.Game,reply=d=>box.novaCloudEvent('war',{action:'attack',data:d}),online={enrolled:true,owner:'a',callsign:'A',tier:3,crystals:0,capacity:20000,rate:0,server_time:new Clock().toISOString(),infra:{crystalplant:1,crystalstore:1,garrison:1},resources:{gold_delta:0,power_delta:0}},target={id:'b',callsign:'B',tier:3,can_attack:true,layout:[{type:'hq',x:10,y:10,lv:3},{type:'mercenary',x:12,y:10,lv:3}],merc_guard:3};
return {box,G,requests,online,target,el};}
const assert=require('assert');
function search(x){x.G.findWar();x.box.novaCloudEvent('war',{action:'targets',data:{...x.online,targets:[x.target]}});}
function peeks(x){return x.requests.filter(r=>r.payload.live==='siege_scout_gold362').length;}
for(const provider of ['native','monetag','missing']){const x=setup();let ads=0;if(provider!=='missing')x.box.NovaAds={provider:provider,levelComplete(){ads++;},scout(){ads++;},rewardVerified(){ads++;}};search(x);assert.equal(peeks(x),1);assert.equal(ads,0,'scouting must never load ads');}
console.log('PASS scouting without ads: native, Telegram and missing bridge');

