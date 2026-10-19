const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const s={};vm.runInNewContext(fs.readFileSync('game.js','utf8'),s);const N=s.NovaRTS;
function battle(){const e=new N.Engine({getItem:()=>null,setItem(){}},()=>0);e.defense={mapSize:22,time:120,remaining:1,spawn:999,wave:1,fx:[],defenders:[],enemies:[],buildings:[{id:1,type:'hq',lv:1,x:15,y:15,hp:10000,max:10000,cool:999}]};return e;}
// Reproduction: impact knockback empties the route but preserves targetId.
let e=battle(),d=e.defense;d.enemies=[{x:19,y:15,hp:10000,max:10000,cool:0,targetId:1,route:[]}];
for(let i=0;i<80;i++)e.tickDefense(.1);
assert(d.buildings[0].hp<10000,'knocked-back attacker must resume and damage the target');
// A defender behind impassable walls must not trap the enemy in an empty pursuit route.
e=battle();d=e.defense;d.buildings[0].x=10;d.buildings[0].y=10;
for(let y=0;y<22;y++)d.buildings.push({id:100+y,type:'wall',lv:1,x:12,y,hp:50,max:50,cool:0});
d.defenders=[{x:10.5,y:10,hp:100,max:100,kind:0,cool:999,stun:100}];
d.enemies=[{x:13,y:10,hp:10000,max:10000,cool:0}];
for(let i=0;i<100;i++)e.tickDefense(.1);
assert(d.buildings.some(b=>b.type==='wall'&&b.hp<50),'attacker breaks the blocking wall');
// Expired targets are reacquired, including buildings beyond the old 12-cell map.
e=battle();d=e.defense;d.enemies=[{x:21,y:21,hp:10000,max:10000,cool:0,targetId:999,route:[]}];
for(let i=0;i<160;i++)e.tickDefense(.1);
assert(d.buildings[0].hp<10000,'far-edge attacker reaches the base');
// The same wave scales up with the current base, without changing saved buildings.
function stats(lv){const e=battle();e.defense=null;e.d.defenseLevel=1;e.d.buildings=[{id:1,type:'hq',lv,x:10,y:10},{id:2,type:'gun',lv,x:11,y:10},{id:3,type:'tesla',lv,x:9,y:10}];assert.equal(e.startDefense(),'');return e.defense;}
const low=stats(1),high=stats(20);assert(high.enemyHP274>low.enemyHP274*3);assert(high.enemyDamage274>low.enemyDamage274*3);assert(high.enemySpeed274>=low.enemySpeed274);assert(high.enemySpeed274<=1.5);
console.log('PASS base274: knockback recovery, blocked defenders, wall attack, distant targets, current-base scaling');
