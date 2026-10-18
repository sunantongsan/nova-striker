const assert=require('node:assert/strict');require('../game.js');const {Engine}=NovaRTS;let data={},now=1e6;const store={getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v};let e=new Engine(store,()=>now);e.d.buildings[0].lv=20;e.d.gold=e.d.power=1e7;
// A busy builder does not block instantaneous wall jobs.
e.d.buildings.push({id:90,type:'tech',lv:1,x:15,y:15,started:now,until:now+1e6});
for(const [x,y] of [[1,1],[2,1],[1,2],[8,8]])assert.equal(e.build('wall',x,y),'');
const w=e.d.buildings.filter(b=>b.type==='wall');assert(w.every(b=>!b.until&&!b.constructing));assert.equal(e.builderFree(),0);assert.equal(e.wallGroup(w[0].id,'x').length,2);assert.equal(e.wallGroup(w[0].id,'y').length,2);assert.equal(e.wallGroup(w[0].id,'all').length,4);
assert.equal(e.upgrade(w[0].id),'');assert.equal(w[0].lv,2);assert(!w[0].until);
w.forEach(b=>b.lv=19);const q=e.wallQuote(w[0].id,'all'),gold=e.d.gold;assert.equal(e.upgradeWalls(w[0].id,'all',JSON.stringify(q)),'');assert(w.every(b=>b.lv===20&&!b.until));assert.equal(e.d.gold,gold-q.gold);assert(e.upgradeWalls(w[0].id,'all',JSON.stringify(q)));assert.equal(e.d.gold,gold-q.gold);
w[0].lv=2;e.d.gold=0;const short=e.wallQuote(w[0].id,'one');assert(e.upgradeWalls(w[0].id,'one',JSON.stringify(short)));assert.equal(w[0].lv,2);
// Already paid wall timers finish once, construction does not grant an extra level.
w[0].until=now+1e6;w[1].lv=1;w[1].constructing=true;w[1].until=now+1e6;e.d.siegeLocked=true;e.sync();assert(w[0].until);assert(e.build('wall',3,1));e.d.siegeLocked=false;e.sync();assert.equal(w[0].lv,3);assert.equal(w[1].lv,1);assert(!w[0].until&&!w[1].until);e.save();e=new Engine(store,()=>now);assert.equal(e.d.buildings.find(b=>b.id===w[0].id).lv,3);assert.equal(e.wallQuote(w[0].id,'invalid').ids.length,0);
console.log('PASS walls267: instant construction/single/group, x/y rows, disconnected all, cap20, price/replay, shortage, busy builders, migration/reload and siege lock');
