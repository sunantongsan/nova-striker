const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const scope={};vm.runInNewContext(fs.readFileSync('game.js','utf8'),scope);const n=scope.NovaRTS;
for(const type of ['gun','tesla','missileturret']){let previous=0;for(let lv=1;lv<=20;lv++){const r=n.defenseRange({type,lv});assert(r>previous);previous=r;}assert.equal(n.defenseRange({type,lv:500}),n.defenseRange({type,lv:20}));}
assert.equal(n.weaponSides({type:'gun',lv:17}),8);assert.equal(n.weaponSides({type:'missileturret',lv:13}),4);
const e=new n.Engine({getItem:()=>null,setItem(){}},()=>0);
function battle(lv){const tower={id:1,type:'gun',lv,x:10,y:10,hp:5000,max:5000,cool:0};const hq={id:2,type:'hq',lv:1,x:1,y:1,hp:5000,max:5000,cool:100};const enemies=[{x:15,y:10},{x:5,y:10},{x:10,y:15},{x:10,y:5}].map(p=>({...p,hp:5000,max:5000,cool:100,stun:1}));e.defense={buildings:[hq,tower],defenders:[],enemies,fx:[],time:120,spawn:100,remaining:1,wave:1};e.tickDefense(.01);return enemies;}
assert(battle(1).every(t=>t.hp===5000),'low-level turret cannot reach five tiles');assert(battle(20).every(t=>t.hp<5000),'upgraded turret covers all four occupied sectors');
console.log('PASS level range/clamps, weapon counts, real wave combat multi-sector coverage');
