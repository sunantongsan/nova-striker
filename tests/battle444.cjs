// 444 (owner video 2026-11-27): after the mech was sent, every tap said "หุ่นกำลังพักฟื้น" and no troop could be
// deployed; battles with the mech stuttered. The mech and HQ now reuse finished 3D poses like Clash sprites.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ui=fs.readFileSync('features/titan342/ui.js','utf8');
const renderer=fs.readFileSync('features/titan342/renderer.js','utf8');
const hq=fs.readFileSync('features/titan342/hq-renderer.js','utf8');
const engine=fs.readFileSync('features/titan342/engine.js','utf8');

// --- tap routing: an armed-but-spent mech must not swallow troop taps
const start=ui.indexOf('function mechSpent444');assert(start>0,'mechSpent444 exists');
const helpers=ui.slice(start,ui.indexOf("canvas.addEventListener('pointerdown'",start));
const listener=ui.slice(ui.indexOf("canvas.addEventListener('pointerdown'",start));
const body=listener.slice(0,listener.indexOf('},true);')+8);
function run({resting=false,used=false,onField=false}){
 const handlers=[];const toasts=[];let deployed=0,placed=0,stopped=false;
 const s={E:{raid:{result:null,titanUsed342:used,troops:onField?[{titan342:true,hp:10,x:1,y:1}]:[]},titanRecovery347:()=>({resting}),
   deployTitan342(){deployed++;return resting?'หุ่นกำลังพักฟื้น':'';}},
  deployTitan342:true,screen:'raid',selectedTitan342:null,zoom:1,
  ownTitan342:()=>true,placeMech379(){placed++;},coordinates:()=>({x:500,y:500}),titanScene342(){return s.E.raid;},
  point:()=>({x:0,y:0}),unpoint:(x,y)=>({x,y}),toast(m){toasts.push(m);},mt251:a=>a,selectTitan342(t){s.selectedTitan342=t;s.deployTitan342=false;},
  canvas:{addEventListener(n,f){handlers.push(f);}}};
 vm.createContext(s);vm.runInContext(helpers+body,s);
 handlers[0]({button:0,preventDefault(){},stopImmediatePropagation(){stopped=true;}});
 return {stopped,deployed,toasts,armed:s.deployTitan342,placed};
}
{const r=run({resting:true});assert.equal(r.stopped,false,'resting mech: the tap reaches troop deployment');assert.equal(r.deployed,0);assert.equal(r.armed,false);assert.deepEqual(r.toasts,[]);}
{const r=run({onField:true});assert.equal(r.stopped,false,'mech already on the field: tap deploys troops');assert.equal(r.armed,false);}
{const r=run({used:true});assert.equal(r.stopped,false,'mech used this battle: tap deploys troops');}
{const r=run({});assert.equal(r.stopped,true,'ready mech, armed: the tap still sends the mech');assert.equal(r.deployed,1);}

// --- pose caches
assert(/t\.cache444=screen!=='home'/.test(ui),'battle draws use the pose cache; the home base keeps live idle animation');
assert(/if\(t\.cache444&&!resting&&!t\.toss419\)\{const sprite444=cached444\(r,t,clip,name\)/.test(renderer),'battle mech uses cached poses');
assert(/FPS444=15,DIRS444=16,MAX444=120/.test(renderer),'15 fps poses, 16 facings, bounded memory');
assert(/while\(cache\.size>MAX444\)/.test(renderer)&&/v\.cache444=null/.test(renderer),'mech pose cache is bounded and released');
assert(!/createImageBitmap\(renderer\.domElement\)[^]*cached444/.test(renderer.slice(renderer.indexOf('function cached444'),renderer.indexOf('window.NovaTitan3D'))),'cached path makes no per-frame bitmap');
assert(/memo\.get\(signature\)/.test(hq)&&/while\(memo\.size>32\)/.test(hq),'HQ reuses finished poses, bounded');
assert(/Math\.round\(\(b\.aim\|\|0\)\*24\/\(Math\.PI\*2\)\)/.test(hq),'HQ aim in 24 steps');
assert(/now-this\.recoverySaveAt347>=4000/.test(engine),'mech health is saved at most every 4 s during battle');
console.log('battle444 ok');

// --- always-automatic mech that does not stall
const auto=fs.readFileSync('features/auto444/auto444.js','utf8');
assert(fs.readFileSync('features/titan342/build.cjs','utf8').includes("features/auto444/auto444.js"),'auto444 is bundled');
assert(/#titanControls342,#mechTap412\{display:none!important\}/.test(auto),'joystick/skill panel and home control button are gone');
assert(/var found=screen!=='home'\?null:units\.find/.test(ui),'battle taps on the mech go to troop deployment');
assert(/t\.pathAge=2\.5;/.test(engine),'routes are kept 2.5 s instead of 0.7 s');
function autoSandbox(buildings,jumpOk){
 const calls={jump:0,base:0,select:[]};
 const s={Math,Game:{},document:{createElement:()=>({}),head:{appendChild(){}}},toast(){},
  selectTitan342(t){calls.select.push(t);},mechTap412(){},trap278:()=>false,
  titanTarget443(scene,t){calls.base++;return scene.buildings.filter(b=>b.hp>0&&b.type!=='wall').sort((a,b)=>Math.hypot(a.x-t.x,a.y-t.y)-Math.hypot(b.x-t.x,b.y-t.y))[0];},
  titanTick342(scene,t,dt){t.aimTarget=s.titanTarget443(scene,t,dt);},
  titanJump345(){calls.jump++;return jumpOk;}};
 vm.createContext(s);vm.runInContext(auto,s);
 const scene={buildings,troops:[]},t={titan342:true,hp:100,x:0,y:0,cool:0,jumpCooldown345:0};scene.troops.push(t);
 for(let i=0;i<60;i++)s.titanTick342(scene,t,.05);// 3 s without moving
 return {s,t,calls};
}
{const target={type:'hq',x:6,y:0,hp:100},wall={type:'wall',x:1.5,y:0,hp:50};const {t}=autoSandbox([target,wall],false);
 assert.equal(t.breach443,wall,'a stalled mech cuts the wall in front of it');assert.equal(t.action342,'SwordSlash');}
{const target={type:'hq',x:6,y:0,hp:100};const {t,calls}=autoSandbox([target],true);assert(calls.jump>0,'nothing to cut: it leaps toward the target');assert.equal(t.unstuck444,'jump');}
{const a={type:'hq',x:6,y:0,hp:100},b={type:'mine',x:0,y:7,hp:100};const {t}=autoSandbox([a,b],false);assert(t.skip444&&t.skip444.b===a,'cannot cut or leap: tries another target');}
{const {s,calls}=autoSandbox([{type:'hq',x:6,y:0,hp:1}],false);const m={manual342:true};s.selectTitan342(m);assert.equal(m.manual342,false);assert.equal(calls.select.at(-1),null,'selecting the mech never gives manual control');}
console.log('auto444 ok');

// --- ruins and easy troop drops
const ruin=fs.readFileSync('features/ruin444/ruin444.js','utf8'),dep=fs.readFileSync('features/deploy444/deploy444.js','utf8'),bld=fs.readFileSync('features/titan342/build.cjs','utf8');
assert(bld.indexOf('ruin444.js')>bld.indexOf('auto444.js')&&bld.indexOf('deploy444.js')>bld.indexOf('ruin444.js'),'ruins and drops load last');
{ // a destroyed building (HQ included) is drawn as a low rubble pile, never with its own art
 const draws=[];let inner=0;
 const s={Math,Date,wreckParts:{complete:true,naturalWidth:768,naturalHeight:512},tile:20,zoom:1,viewWidth:800,viewHeight:400,frame:0,drawNeeded:false,
  point:()=>({x:200,y:200}),trap278:()=>false,drawBuilding(){inner++;},
  ctx:{save(){},restore(){},translate(){},scale(){},beginPath(){},ellipse(){},fill(){},drawImage(...a){draws.push(a);},set globalAlpha(v){},set fillStyle(v){}}};
 vm.createContext(s);vm.runInContext(ruin,s);
 s.drawBuilding({type:'hq',x:1,y:1,hp:0,id:1});s.drawBuilding({type:'cannonturret',x:1,y:1,hp:0,id:2});
 assert.equal(inner,0,'destroyed buildings skip their own wreck art');assert(draws.every(d=>d[0]===s.wreckParts),'only the rubble sheet is drawn');
 s.drawBuilding({type:'cannonturret',x:1,y:1,hp:5,id:3});s.drawBuilding({type:'wall',x:1,y:1,hp:0,id:4});assert.equal(inner,2,'living buildings and walls keep their drawing');
}
{ // a tap in the red zone drops on the nearest open spot; online taps queue instead of failing
 const calls=[];const r={mapSize:22,buildings:[{type:'gun',x:10,y:10,hp:5}],army:[3],result:null,liveMode:'attacker'};
 const s={Math,Date,screen:'raid',drawNeeded:false,warBusy:false,liveRoom:null,E:{raid:r,d:{},deploy(i,x,y){calls.push([x,y]);return '';}},trap278:()=>false,mt251:a=>a,toast(){},hud(){},
  setInterval(){},draw(){},ctx:{},point:()=>({x:0,y:0}),zoom:1};
 vm.createContext(s);vm.runInContext(dep,s);
 assert.equal(s.E.deploy(0,10.5,10.2),'');const [x,y]=calls[0];assert(Math.max(Math.abs(x-10),Math.abs(y-10))>=1.5,'moved out of the red zone');assert(Math.hypot(x-10.5,y-10.2)<1.6,'to the nearest edge');
 s.E.deploy(0,2,2);assert.deepEqual(calls[1],[2,2],'open ground is untouched');
 s.liveRoom={v:2,role:'attacker'};s.E.d.pendingSiegeDeploy={id:1};
 assert.equal(s.E.deploy(0,3,3),'');assert.equal(s.E.deploy(0,4,4),'');assert.equal(s.E.deploy(0,5,5),'');assert.equal(calls.length,2,'queued while the server confirms');
 assert.match(s.E.deploy(0,6,6),/หมด/,'cannot queue more troops than you have');
}
assert(/>\(screen==='raid'\?13:7\)\)drag\.moved=true/.test(fs.readFileSync('game.js','utf8')),'a small wobble is still a tap in battle');
console.log('ruins/drops 444 ok');
