// 391: paid environments allow 26x26 bases; 20x20 bases and their battle maps are unchanged.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const s={console,Date,Math};vm.createContext(s);vm.runInContext(fs.readFileSync('game.js','utf8'),s);
const n=s.NovaRTS,store={getItem(){return null},setItem(){}},e=new n.Engine(store);
assert.equal(e.empty(20,20),true);assert.equal(e.empty(21,5),false,'free grid stops at 20');
e.d.grid391=26;assert.equal(e.empty(26,26),true);assert.equal(e.empty(27,1),false,'paid grid stops at 26');
assert.equal(e.wallBuildQuote268([{x:25,y:3}]).invalid||false,false,'walls may use the paid area');
e.d.grid391=20;assert(e.wallBuildQuote268([{x:25,y:3}]).invalid||e.wallBuildQuote268([{x:25,y:3}]).cells.length===0,'walls cannot leave a free grid');
const layout=[{type:'hq',x:10,y:10,lv:3},{type:'gun',x:12,y:12,lv:2}];
e.scoutPlayer({callsign:'a',layout});assert.equal(e.raid.mapSize,22,'20x20 opponents keep the 22 battle map');
e.scoutPlayer({callsign:'b',layout:layout.concat([{type:'gun',x:25,y:24,lv:1}])});assert.equal(e.raid.mapSize,27,'larger layouts get a battle map one cell beyond their extent');
assert(e.raid.buildings.some(b=>b.x===25),'far buildings are kept');
console.log('PASS grid391: free 20x20 and paid 26x26 placement, wall bounds, battle map size follows the layout');
