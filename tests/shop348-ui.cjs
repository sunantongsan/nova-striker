const fs=require('fs'),vm=require('vm'),assert=require('assert');const src=fs.readFileSync('features/titan342/ui.js','utf8');let opened=0;
const c={E:{d:{titan342:{level:0},titanBuild348:{ordered:true,ends:Date.now()+7200000,offset:0}},titanRecovery347:()=>({fraction:1,resting:false})},homeMech342:null,supportPark339:()=>({x:10,y:10}),titan342:(level,x,y)=>({tier342:level,x,y,max:16000}),selectedTitan342:null,Game:{titan342:()=>opened++},updateTitanControls342(){},mt251:(a,b)=>b,duration:n=>String(Math.round(n))};vm.createContext(c);
vm.runInContext(src.slice(src.indexOf('function homeTitan342()'),src.indexOf('function titanScene342')),c);
vm.runInContext(src.slice(src.indexOf('function selectTitan342('),src.indexOf('function selectTitan342(')+src.slice(src.indexOf('function selectTitan342(')).indexOf('\n')),c);
let t=c.homeTitan342();assert(t.building348);c.selectTitan342(t);assert.equal(opened,1);assert.equal(c.selectedTitan342,null);
c.E.d.titan342={level:1};c.E.titanRecovery347=()=>({fraction:.3,resting:true,destroyed:true});t=c.homeTitan342();assert(t.resting347&&!t.building348);assert.equal(t.restPose347,'RestDown347');c.selectTitan342(t);assert.equal(opened,2);
c.E.titanRecovery347=()=>({fraction:1,resting:false});t=c.homeTitan342();assert(!t.resting347);c.selectTitan342(t);assert.equal(c.selectedTitan342,t);
console.log('PASS shop348 UI: construction hologram, tap-to-speed building/recovery, restored control after healing');

// A delayed guardian status must not replace the drone/shield panel the user just opened.
let renders=0;const race={root:{novaCloudEvent(){}},titanBusy342:{id:'titan342-1',mode:'status'},clearTimeout(){},E:{d:{},save(){}},screen:'home',testWallet:null,modal:{style:{display:'flex'},hasAttribute:()=>false},titanPanelOpen342:true,titanPanel342(){renders++},hud(){}};vm.createContext(race);
vm.runInContext(src.slice(src.indexOf('var titanCloud342='),src.indexOf('var titanCloud342=')+src.slice(src.indexOf('var titanCloud342=')).indexOf('\n')),race);
const data={request_id:'titan342-1',data:{titan342:true,state:{level:1,skills:{}},server_time:new Date().toISOString(),owner:'test'}};race.root.novaCloudEvent('war',data);assert.equal(renders,0);assert.equal(race.E.d.titan342.level,1);
race.titanBusy342={id:'titan342-1',mode:'status'};race.modal.hasAttribute=()=>true;race.root.novaCloudEvent('war',data);assert.equal(renders,1);console.log('PASS shop navigation: delayed status preserves unrelated panels');
