const assert=require('assert');require('../game.js');const {Engine,units:U,buildings:B}=NovaRTS;const make=()=>new Engine({getItem:()=>null,setItem(){}},()=>Date.now());
assert.equal(U[7].damage,230);assert(U[5].name.includes('Helicopter'));assert.equal(U[5].weapon,'missile');assert.equal(B.missileturret.require,1);
let e=make();assert.equal(e.hq(),1);assert.equal(e.build('missileturret',1,1),'','starter resources can build rocket battery');
e=make();e.scout(1);let r=e.raid;r.mapSize=22;r.phase='battle';r.time=500;r.guards=[];r.buildings=[{id:1,type:'hq',x:10,y:10,hp:100000,max:100000,cool:999}];r.troops=[{id:1,kind:7,x:0,y:10,hp:450,max:450,cool:0,route:[]}];r.deployed=1;r.army=U.map(()=>0);let t=r.troops[0],drops=0,lastHP=r.buildings[0].hp,positions=[],passTicks=0;
for(let i=0;i<750;i++){e.tick(.05);positions.push([t.x,t.y]);if(r.buildings[0].hp<lastHP){drops++;assert.equal(lastHP-r.buildings[0].hp,230);lastHP=r.buildings[0].hp;}if(t.bombFlight&&t.bombFlight.phase==='turn')passTicks++;}
assert(drops>=2,'bomber returns for multiple passes');assert(passTicks>20,'bomber circles after each pass');assert(positions.some(p=>p[0]>11),'bomber flies beyond the target');assert(positions.some(p=>Math.abs(p[1]-10)>1),'bomber turns rather than hovering');assert(r.fx.every(f=>f.weapon!=='impact'||f.effect!=='bomb'||f.radius===38));
// The long-range battery engages ground targets, never helicopters.
e=make();e.scout(1);r=e.raid;r.phase='battle';r.time=100;r.mapSize=22;r.guards=[];r.buildings=[{id:1,type:'missileturret',x:5,y:5,lv:1,hp:1500,max:1500,cool:0}];r.troops=[{id:1,kind:5,x:11,y:5,hp:330,max:330,cool:999,route:[]}];e.tick(.01);assert.equal(r.troops[0].hp,330);r.troops.push({id:2,kind:0,x:11,y:5,hp:1000,max:1000,cool:999,route:[]});e.tick(.01);assert(r.troops[1].hp<1000,'ground target at six cells is hit');assert.equal(r.troops[0].hp,330,'aircraft immune to rocket splash');assert(r.fx.some(f=>f.weapon==='missile'&&f.highArc));assert.equal(r.buildings[0].cool,2.4);
console.log('PASS HQ1 starter rocket battery, ground-only long range/splash, arcing projectile, helicopter slot preserved, bomber 230 damage, repeated moving bombing passes');


