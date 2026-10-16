const assert=require('node:assert');require('../game.js');
const {Engine,route}=NovaRTS;
// Deployment at the far corner of a 22-cell player map must enter the battle immediately.
const e=new Engine({getItem:()=>null,setItem:()=>{}},()=>Date.now());e.scout(1);e.raid.mapSize=22;e.raid.guards=[];
assert.equal(e.deploy(0,21,21),'');let t=e.raid.troops[0];e.tick(.1);assert(Math.hypot(t.x-21,t.y-21)>0,'far-edge troop must move on first tick');
for(let i=0;i<100;i++)e.tick(.1);assert(t.x<18&&t.y<18,'troop keeps advancing toward base');
// Rounded cell can be inside firing radius while actual coordinates are outside.
const p=route({x:2.49,y:2},{x:1,y:2},[{x:1,y:2,hp:100}],1.2,11);assert(p&&p.length,'must move to cell centre instead of getting an empty path');
assert(route({x:21,y:21},{x:6,y:6},[{x:6,y:6,hp:100}],1.8).length,'implicit bounds include deployment position');
const blocked=route({x:0,y:0},{x:4,y:0},[{x:1,y:0,hp:100}],1,11);assert(blocked&&!blocked.some(p=>p.x===1&&p.y===0));
e.d.army[3]=1;assert.equal(e.deploy(3,21,20),'');const medic=e.raid.troops.at(-1),before=medic.x;e.tick(.1);assert(medic.x<before,'healthy army is followed by medic');
console.log('PASS: far-edge first-tick advance, continued pursuit, fractional firing-range stall, obstacle avoidance, medic follows healthy army');
