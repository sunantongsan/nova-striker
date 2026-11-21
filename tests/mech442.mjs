import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {mechClip442,mechFrame442} from '../features/titan342/motion442.mjs';
const t={hp:100,moving:true,action342:'Run',tier342:1};assert.equal(mechClip442(t),'Walk');assert.equal(mechClip442({...t,pending342:{id:'dash'}}),'Run');assert.equal(mechClip442({...t,action342:'SwordSlash',actionTime342:1}),'SwordSlash');assert.equal(mechClip442({...t,hp:0}),'Collapse');
for(const hz of [30,60,120]){const r={};let renders=0,elapsed=0;for(let i=0;i<=hz;i++){const f=mechFrame442(r,t,'Walk',1000+i*1000/hz);if(f.draw){renders++;elapsed+=f.dt;r.frameAt442=1000+i*1000/hz;r.frameKey442=f.key;r.sprite442={};}}assert(renders<=31);assert(Math.abs(elapsed-1-1/30)<.002,'animation advances one real second, independent of refresh rate');}
const r={frameAt442:1000,sprite442:{},frameKey442:mechFrame442({},t,'Walk',1000).key};assert(mechFrame442(r,{...t,actionSeq342:2},'SwordSlash',1001).draw,'attacks bypass pose throttle');
const {integrate}=await import('../features/titan342/build.cjs');const c={console};vm.createContext(c);vm.runInContext(integrate(fs.readFileSync('game.js','utf8')),c);const titan=c.NovaRTS.titan342;
assert(titan);
const scene={mapSize:22,buildings:[{id:1,type:'wall',x:5,y:5,hp:100}],troops:[],guards:[],fx:[]};const unit=titan.make(1,3,5),target={x:8,y:5,hp:100};scene.troops=[unit];
assert.equal(titan.blocked(scene,5,5),true);scene.buildings[0].hp=0;assert.equal(titan.blocked(scene,5,5),false,'destroyed wall is walkable');let route=titan.route442(scene,unit,target,scene.buildings);assert.equal(route.length,1,'cleared ground takes the direct path');assert.equal(route[0].x,8);
scene.buildings[0].hp=100;route=titan.route442(scene,unit,target,scene.buildings);assert(route.length>1,'intact obstruction uses a route around it');assert(!route.some(p=>p.x===5&&p.y===5));assert(titan.blocked({home355:true,mapSize:22,buildings:[{type:'hq',x:5,y:5}]},5,5),'home buildings without battle HP still block');
const walker=titan.make(1,3,5,{}),objective={id:2,type:'hq',x:8,y:5,hp:1000,max:1000};
walker.cool=999;walker.route=[{x:3,y:4}];walker.pathAge=10;walker.routeCount442=2;walker.routeTarget442=objective;
const cleared={mapSize:22,buildings:[{id:1,type:'wall',x:5,y:5,hp:0},objective],troops:[walker],guards:[],fx:[]};
titan.tick(cleared,walker,.1);assert(walker.x>3&&walker.y===5,'destroyed obstruction invalidates stale detour immediately');assert.equal(walker.action342,'Walk');
// Exercise the final movement override, including steering and the no-fake-walk flag.
const perf=fs.readFileSync('features/perf437/perf437.js','utf8');const moves={Math,titanSolid442:(s,b)=>b.hp>0,titanBlocked342:titan.blocked,trap278:()=>false,titanJump345:()=>false};vm.createContext(moves);vm.runInContext(perf.slice(perf.indexOf('titanMove342=function'),perf.indexOf('var manualTick437=')),moves);
scene.buildings[0].hp=0;unit.x=4.7;unit.y=5;moves.titanMove342(scene,unit,1,0,.1,2);assert(unit.x>4.8&&unit.moving,'walk through rubble');
const trapped={mapSize:2,buildings:[]};unit.x=.5;unit.y=.5;moves.titanMove342(trapped,unit,1,0,.1,2);assert.equal(unit.moving,false,'blocked feet do not run in place');
console.log('PASS mech442: refresh-independent Walk, attack priority, rubble shortcut, intact walls, home collision, movement flag');
