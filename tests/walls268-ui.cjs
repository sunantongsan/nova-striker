const fs=require('fs'),vm=require('vm'),assert=require('assert');
function boot(cache){const elements={},data={novaRTSIntro:'1',...(cache?{novaBaseProfile224:JSON.stringify(cache)}:{})},events={},requests=[],timers=[];const ctx=new Proxy({measureText:t=>({width:t.length*8})},{get:(o,k)=>o[k]||(()=>{})});
const el=id=>elements[id]||(elements[id]={hidden:true,value:'',style:{},innerHTML:'',textContent:'',addEventListener(name,f){if(id==='world')events[name]=f},setPointerCapture(){},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:420,height:600}),querySelectorAll:()=>[]});
const s={console,Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:f=>(timers.push(f),timers.length),clearTimeout(){},Image:class{},localStorage:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v,removeItem:k=>delete data[k]},document:{getElementById:el,addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame(){},NovaCloud:{hasAccount:()=>true,available:()=>true,load(){},warRequest:(action,payload,id)=>requests.push({action,payload:JSON.parse(payload),id})}};
s.localStorage && s.localStorage.setItem('novaLanguage','th');vm.createContext(s);vm.runInContext(fs.readFileSync('game.js','utf8').replace("})(typeof globalThis!==",`root.test224={e:E,point:point,draw:draw,preview:function(){return movePreview224;},selected:function(){return selected;},pan:function(){return [panX,panY];},placing:()=>placing,paint:()=>wallPaint268,token:()=>wallLastQuote268&&wallLastQuote268.serial,picked:()=>wallPicked268(),height:()=>viewHeight};})(typeof globalThis!==`),s);
return {s,el,data,requests,timers,t:s.test224,fire:(type,x,y)=>events[type]({pointerId:1,clientX:x,clientY:y}),reply:(name,owner='a')=>s.novaCloudEvent('war',{request_id:requests.at(-1).id,data:{profile:true,name,owner}})};}

const a=boot(),G=a.s.Game,t=a.t,e=t.e;e.d.buildings=[{id:1,type:'hq',lv:20,x:10,y:10}];e.d.next=2;e.d.gold=e.d.power=1e7;t.draw();
function fire(type,x,y){const p=t.point(x,y);a.fire(type,p.x,p.y*600/t.height());}
const count=()=>e.d.buildings.filter(b=>b.type==='wall').length;
G.place('wall');const pan=JSON.stringify(t.pan()),gold=e.d.gold;fire('pointerdown',2,2);fire('pointermove',6,2);assert.equal(count(),0);assert.equal(e.d.gold,gold);assert.equal(t.paint().quote.cells.length,5);fire('pointerup',6,2);assert.equal(count(),5);assert.equal(e.d.gold,gold-125);assert.equal(t.placing(),'wall');assert.equal(JSON.stringify(t.pan()),pan);assert(a.el('selection').innerHTML.includes('เสร็จ'));
fire('pointerdown',7,2);fire('pointerup',7,2);assert.equal(count(),6);assert.equal(t.placing(),'wall');
fire('pointerdown',8,2);fire('pointermove',9,2);a.fire('pointercancel',0,0);assert.equal(count(),6);assert.equal(t.paint(),null);
G.wallPan268();fire('pointerdown',8,2);fire('pointerup',8,2);assert.equal(count(),6);assert.equal(t.placing(),'wall');G.wallPan268();
// Obstacles and insufficient resources reject the entire stroke.
fire('pointerdown',8,10);fire('pointermove',12,10);assert(t.paint().quote.invalid);fire('pointerup',12,10);assert.equal(count(),6);
e.d.gold=24;fire('pointerdown',8,2);fire('pointerup',8,2);assert.equal(count(),6);e.d.gold=1e7;
G.wallDone268();assert.equal(t.placing(),null);const first=e.d.buildings.find(b=>b.type==='wall');G.inspectBuilding261(first.id,true);assert.equal(a.el('modal').style.display,'none');G.wallScope268('x');assert.equal(t.picked().length,6);let token=t.token();G.wallUpgrade268(token);assert(e.d.buildings.filter(b=>b.type==='wall').every(b=>b.lv===2));const spent=e.d.gold;G.wallUpgrade268(token);assert.equal(e.d.gold,spent);assert(e.d.buildings.filter(b=>b.type==='wall').every(b=>b.lv===2));G.wallScope268('one');G.wallCount268(10);assert.equal(t.picked().length,6);G.wallCount268(-1);assert.equal(t.picked().length,5);
G.wallExtend268(0,1);assert.equal(count(),7);G.wallContinue268();assert.equal(t.placing(),'wall');G.wallDone268();
// Save failure rolls back the complete stroke, plus resources and mission counters.
let cells=[{x:15,y:1},{x:16,y:1}],q=e.wallBuildQuote268(cells),before=JSON.stringify(e.d),save=e.save;e.save=()=>false;assert(e.buildWalls268(cells,JSON.stringify(q)));assert.equal(JSON.stringify(e.d),before);e.save=save;
e.d.siegeLocked=true;assert(e.buildWalls268(cells,JSON.stringify(q)));assert.equal(count(),7);
console.log('PASS walls268 UI: drag preview/release, continuous taps, pan mode, cancel, blocked row, shortage, in-map group upgrade, replay, count controls, extension, save rollback, siege');
