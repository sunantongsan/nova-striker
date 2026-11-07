const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c={};vm.runInNewContext(require('../features/titan342/build.cjs').integrate(fs.readFileSync('game.js','utf8')),c);
const {Engine}=c.NovaRTS;
test('upgrade completes, survives reload, and next HQ upgrade starts',()=>{
 let now=1000000;const saved=new Map(),store={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)};
 let e=new Engine(store,()=>now);e.d.gold=50000;let h=e.d.buildings.find(b=>b.type==='hq');
 assert.equal(e.upgrade(h.id),'');now=h.until+1;e.sync();assert.equal(h.lv,2);assert.ok(!h.until);assert.equal(e.save(),true);
 e=new Engine(store,()=>now);h=e.d.buildings.find(b=>b.type==='hq');assert.equal(h.lv,2);assert.equal(e.upgrade(h.id),'');assert.equal(h.until,now+1620000);
 now=h.until+1;e.sync();assert.equal(h.lv,3);assert.ok(!h.until);
});
test('values-only payload excludes new window resizing, outpost and new reward UI',()=>{
 const code=require('../features/titan342/build.cjs').integrate(fs.readFileSync('game.js','utf8'));
 assert(!code.includes('Game.outpost370='));assert(!code.includes('novaWindowCompact372'));
 assert(!fs.readFileSync('features/titan342/build.cjs','utf8').includes('outpost-ui370.js'));
});
