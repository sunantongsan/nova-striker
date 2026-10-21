const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const box={console};vm.createContext(box);vm.runInContext(fs.readFileSync('game.js','utf8').replace('root.NovaRTS={','root.balance285={targetable277,tickEnergy276,defenderTick,defenseCooldown285};root.NovaRTS={'),box);
const {Engine,units:U,buildings:B,hit}=box.NovaRTS,{targetable277,tickEnergy276,defenderTick,defenseCooldown285}=box.balance285;
const make=()=>new Engine({getItem:()=>null,setItem(){}},()=>1000);
for(const kind of [3,5,7])for(const type of ['cannonturret','missileturret','gun','tesla']){
 const t={kind,x:5,y:5,hp:1000,max:1000},b={type,x:4,y:5,hp:1000,lv:1};
 const valid=['gun','tesla'].includes(type);assert.equal(targetable277(t,b),valid);
 hit({buildings:[],fx:[]},t,100,b,type==='tesla'?'tesla':'cannon');assert.equal(t.hp,valid?900:1000,`${type} vs ${kind}`);
}
for(const weapon of ['cannon','grenade','energy276','bomb','shock']){const t={kind:3,x:5,y:5,hp:130,max:130};hit({buildings:[],fx:[]},t,100,{kind:1,x:4,y:5},weapon);assert.equal(t.hp,130,weapon+' cannot damage drone');}
const scene={buildings:[],fx:[],troops:[{kind:3,x:5,y:5,hp:130},{kind:0,x:5,y:5,hp:300}],energy276:[{remaining:.01,x:5,y:5,damage:90,source:{type:'cannonturret',x:4,y:5}}]};tickEnergy276(scene,.02,'troops');assert.equal(scene.troops[0].hp,130);assert.equal(scene.troops[1].hp,210);
// A healing drone crosses a solid wall to reach its wounded ground ally.
const drone={kind:3,x:1,y:5,hp:130,max:130,cool:0,route:[]},ally={kind:0,x:7,y:5,hp:1,max:100,cool:999,route:[]};
const d={buildings:[{type:'wall',x:3,y:5,hp:100}],defenders:[drone,ally],enemies:[],fx:[]};
for(let i=0;i<30;i++)defenderTick({d:{research:{weapon:0}}},d,.1);assert(drone.x>3);assert(ally.hp>1);
// Ground defenders ignore nearby aircraft and engage the next valid ground target.
const tank={kind:1,x:5,y:5,hp:650,max:650,cool:0,route:[]};const air={kind:3,x:5.2,y:5,hp:130,max:130};const infantry={kind:0,x:6,y:5,hp:500,max:500};
defenderTick({d:{research:{weapon:0}}},{buildings:[],defenders:[tank],enemies:[air,infantry],fx:[]},.01);assert.equal(air.hp,130);assert(infantry.hp<500);
assert.equal(U[7].hp,720);assert.equal(U[7].damage,230);assert.equal(U[7].cost,360);assert.equal(U[7].time,36);
assert.equal(B.silo.cost,6000);assert.equal(B.landmine.cost,1200);
const e=make();let sum=0;for(let n=0;n<10;n++){e.d.enhancements={'unit:7':n,'building:gun':n,'unit:transport':n};const price=50*(n+1)*(n+2);for(const key of ['unit:7','building:gun','unit:transport'])assert.equal(e.enhanceStats(key).cost,price);sum+=price;}assert.equal(sum,22000);
assert.equal(defenseCooldown285({type:'gun'}),.9);assert.equal(defenseCooldown285({type:'tesla'}),1.4);
console.log('PASS balance285: targeting/damage matrix, ground splash immunity, drone over walls, valid target selection, bomber stats, defense costs, equal enhancement curves and tower cadence');
