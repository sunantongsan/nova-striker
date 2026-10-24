const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const s={};vm.runInNewContext(fs.readFileSync('game.js','utf8'),s);const N=s.NovaRTS;
function setup(mode){const e=new N.Engine({getItem:()=>null,setItem(){}},()=>0),gun={id:2,type:'cannonturret',lv:1,x:10,y:10,hp:5000,max:5000,cool:0},hq={id:1,type:'hq',lv:1,x:1,y:1,hp:5000,max:5000,cool:999};
 const targets=[[12,10],[15,10],[15.01,10],[14.1,12.1],[14.2,12.2]].map(([x,y],i)=>({id:i+1,kind:0,x,y,hp:1000,max:1000,cool:999,stun:100,route:[]}));
 const scene={mapSize:22,time:120,remaining:1,spawn:999,wave:1,fx:[],buildings:[hq,gun],enemies:targets,defenders:[],troops:targets,guards:[],phase:'battle',stage:1,player:true,defenderResearch:{},army:[1],deployed:1};
 if(mode==='wave')e.defense=scene;else e.raid=scene;return{e,scene,gun,targets,tick:dt=>mode==='wave'?e.tickDefense(dt):e.tick(dt)};}
for(const mode of ['wave','raid']){
 const {scene,gun,targets,tick}=setup(mode);tick(.05);gun.cool=999;
 assert(targets.every(t=>t.hp===1000),mode+': no damage on launch');assert.equal(scene.energy276.length,1);assert(scene.fx.some(f=>f.weapon==='energy276'&&f.highArc));
 tick(1.4);assert(targets.every(t=>t.hp===1000),mode+': no damage in flight');tick(.1);
 assert.equal(targets[0].hp,910);assert.equal(targets[1].hp,910,'exact three-tile boundary is included');assert.equal(targets[2].hp,1000,'outside three tiles is excluded');assert.equal(targets[3].hp,910,'diagonal inside circle is hit');assert.equal(targets[4].hp,1000,'diagonal outside circle is safe');
 assert.equal(scene.energy276.length,0);assert(scene.fx.some(f=>f.weapon==='energyRing276'&&f.radius===3));const hp=targets.map(t=>t.hp);tick(.1);assert.deepEqual(targets.map(t=>t.hp),hp,'one damage event per projectile');assert.equal(gun.hp,5000,'no friendly fire on own tower');
}
// A moving target cannot drag the blast to its new position.
let a=setup('wave');a.tick(.05);a.gun.cool=999;a.targets[0].x=20;a.targets[0].y=20;a.tick(1.5);assert.equal(a.targets[0].hp,1000);assert.equal(a.targets[1].hp,910);
// Launches survive destruction of the firing tower; queued hits still land.
a=setup('wave');a.tick(.05);a.gun.hp=0;a.tick(1.5);assert.equal(a.targets[1].hp,910);
// Enhancements apply once to the area damage, using the existing combat rules.
a=setup('wave');a.gun.enhance=2;a.tick(.05);a.gun.cool=999;a.tick(1.5);assert(a.targets[0].hp<910);assert.equal(a.targets[0].hp,a.targets[1].hp);
console.log('PASS energy276: delayed impact, both battle modes, radius boundary/diagonals, one hit, fixed landing point, destroyed source, enhancements');

