const fs=require('fs'),vm=require('vm'),assert=require('assert');
let offFills=0,htmlWrites=0,translations=0;const elements={},data={novaRTSIntro:'1'};
const ctx=new Proxy({measureText:t=>({width:t.length*8}),translate(){translations++;}},{get:(o,k)=>o[k]||(()=>{})});
const off=new Proxy({fill(){offFills++;}},{get:(o,k)=>o[k]||(()=>{})});
function el(id){if(!elements[id]){let html='';elements[id]={style:{},textContent:'',addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:420,height:600}),querySelectorAll:()=>[]};Object.defineProperty(elements[id],'innerHTML',{get:()=>html,set:v=>{if(id==='deploy')htmlWrites++;html=v;}});}return elements[id];}
const s={console,Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:()=>0,clearTimeout(){},Image:class{},localStorage:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v},document:{getElementById:el,createElement:()=>({getContext:()=>off}),addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame(){}};
vm.createContext(s);vm.runInContext(fs.readFileSync('game.js','utf8').replace("})(typeof globalThis!==","root.test219={e:E,draw:draw,hud:hud,building:drawBuilding,pan:()=>{panX+=1;},raid:()=>{screen='raid';}};})(typeof globalThis!=="),s);
const t=s.test219;s.Game.close();t.draw();const first=offFills;assert(first>400);t.draw();assert.equal(offFills,first,'cached floor is not repainted');t.pan();t.draw();assert(offFills>first,'pan invalidates floor');
t.e.scout(1);t.raid();t.hud();const n=htmlWrites;t.hud();assert.equal(htmlWrites,n,'identical troop strip reuses DOM');t.e.d.army[0]++;t.hud();assert.equal(htmlWrites,n+1,'army change updates controls');
translations=0;t.building({id:1,type:'hq',x:1,y:1,lv:1,hp:500,max:1000,hit:.25},false);assert.equal(translations,0,'building never shakes on hit');
const {route}=s.NovaRTS;let wall={x:1,y:0,hp:100};let r=route({x:0,y:0},{x:3,y:0},[wall],1,5);assert(r&&!r.some(p=>p.x===1&&p.y===0));wall.hp=0;r=route({x:0,y:0},{x:3,y:0},[wall],1,5);assert(r.some(p=>p.x===1&&p.y===0),'destroyed walls immediately open routes');assert.equal(route({x:0,y:0},{x:3,y:3},[{x:1,y:0,hp:1},{x:0,y:1,hp:1}],1,5),null);
console.log('PASS terrain cache/repaint on pan, unchanged DOM reuse, army updates, anchored buildings, blocked/destroyed-wall routes');
