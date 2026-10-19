const fs=require('fs'),vm=require('vm'),assert=require('assert');
let draws=0,filters=0,tick=0,frame;const elements={},data={novaRTSIntro:'1'};
const ctx=new Proxy({measureText:t=>({width:t.length*8}),clearRect(){draws++;}},{get:(o,k)=>o[k]||(()=>{}),set(o,k,v){if(k==='filter'&&v!=='none')filters++;o[k]=v;return true;}});
const el=id=>elements[id]||(elements[id]={style:{},innerHTML:'',textContent:'',addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:420,height:600}),querySelectorAll:()=>[]});
const s={console,Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:()=>0,clearTimeout(){},Image:class{},localStorage:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v},document:{getElementById:el,addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame:f=>frame=f};vm.createContext(s);vm.runInContext(fs.readFileSync('game.js','utf8').replace("})(typeof globalThis!==","root.e220=E;})(typeof globalThis!=="),s);
const e=s.e220;let original=e.tick;e.tick=function(dt){tick++;return original.call(this,dt);};e.assign277(1,0,0,1);s.Game.scout(1);s.Game.readyManifest277();e.deploy(0,0,0);frame(40);assert(tick>0);s.Game.home();assert.equal(e.raid,null);assert.equal(e.defense,null);const count=tick;
e.d.buildings.forEach(b=>b.lv=12);frame(80);const initial=draws;for(let n=120;n<1320;n+=40)frame(n);assert.equal(tick,count,'home never advances old battle');assert(draws-initial<=2,'idle home redraws at HUD cadence, not ten times per second');assert.equal(filters,0,'high-level home buildings use no live image filters');
let before=draws;s.Game.zoom(.1);frame(1360);assert.equal(draws,before+1,'zoom draws on next frame');
e.d.buildings[0].until=Date.now()+60000;before=draws;for(let n=1400;n<2000;n+=40)frame(n);assert(draws-before>=4,'construction clock remains animated');
s.Game.training();before=draws;for(let n=2040;n<2640;n+=40)frame(n);assert.equal(draws,before,'modal stops home canvas work');
console.log('PASS return-home releases battle, idle redraw budget, no building filters, immediate zoom, animated construction, hidden canvas stops');

