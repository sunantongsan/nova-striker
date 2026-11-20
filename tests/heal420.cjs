const assert=require('assert');require(process.cwd()+'/game.js');
// 420: a save whose Honey / Veggie juice became NaN (stored as null) keeps the base and refills the broken resource.
let time=Date.UTC(2026,10,16,8),data={},store={getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v};
let e=new NovaRTS.Engine(store,()=>time);assert(e.build('mine',10,10)===''||true);e.save();
const ids=e.d.buildings.length;let s=JSON.parse(data.novaRTS1);s.power=null;s.gold=1234;data.novaRTS1=JSON.stringify(s);
let e2=new NovaRTS.Engine(store,()=>time);
assert.equal(e2.d.buildings.length,ids,'base kept');assert.equal(e2.d.gold,1234,'other resources kept');
assert.equal(e2.d.power,e2.resourceCapacity('power'),'broken Veggie juice refilled');assert(!e2.d.nanRepair420);assert.equal(e2.d.repaired420,1);
console.log('PASS NaN resource save repair keeps the base and refills the broken resource');
