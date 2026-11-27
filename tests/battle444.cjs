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
