const assert=require('node:assert/strict');require('../game.js');
const {Engine,buildings,maxBuildingLevel}=NovaRTS;assert.equal(maxBuildingLevel,20);
let now=Date.now(),data={},store={getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v};
let e=new Engine(store,()=>now);e.d.buildings[0].lv=15;e.d.buildings.push({id:90,type:'storage',lv:15,x:12,y:12});e.d.gold=1e7;e.d.power=1e7;
for(let lv=15;lv<20;lv++){assert.equal(e.hq(),lv);assert.equal(e.upgrade(1),'');now=e.d.buildings[0].until;e.sync();assert.equal(e.hq(),lv+1);}
assert(e.upgrade(1));e.save();const loaded=new Engine(store,()=>now);assert.equal(loaded.hq(),20);assert.equal(loaded.d.buildings.find(b=>b.id===90).lv,15);
for(const [type,info] of Object.entries(buildings)){if(type.startsWith('crystal'))continue;for(let lv=1;lv<20;lv++){const c=e.upgradeCost({type,lv});assert(c.gold<=40000+90000*Math.max(lv,info.require||1),type+' quote fits storage');assert(c.power<=40000+90000*Math.max(lv,info.require||1));assert(c.time>0);assert.equal(c.crystals,0);}}
let mine=e.d.buildings.find(b=>b.type==='mine');mine.lv=19;e.d.gold=1e7;e.d.power=1e7;assert.equal(e.upgrade(mine.id),'');now=mine.until;e.sync();assert.equal(mine.lv,20);assert(e.upgrade(mine.id));
e.d.buildings.push({id:91,type:'wall',lv:19,x:1,y:1});e.d.gold=1e7;e.d.power=1e7;const q=e.wallQuote(91,'one');assert.equal(q.ids.length,1);assert.equal(e.upgradeWalls(91,'one',JSON.stringify(q)),'');now=e.d.buildings.find(b=>b.id===91).until;e.sync();assert.equal(e.d.buildings.find(b=>b.id===91).lv,20);assert.equal(e.wallQuote(91,'one').ids.length,0);
console.log('PASS levels265: save/reload, 15→20, cap20, walls, upgrade quotes fit storage, no crystals');
