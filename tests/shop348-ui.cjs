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

// Home taps open management for healthy and completely destroyed mechs; battle taps still select.
let tap,managed=0,selected=null,closed=0;const mech={titan342:true,hp:100,resting347:false,building348:false};
const touch={canvas:{addEventListener:(name,fn)=>tap=fn},screen:'home',coordinates:()=>({x:100,y:80}),titanScene342:()=>({troops:[mech],guards:[]}),homeTitan342:()=>mech,ownTitan342:()=>true,point:()=>({x:100,y:100}),zoom:1,selectTitan342:t=>selected=t,Game:{titan342:()=>managed++},close:()=>closed++,selectedTitan342:null,deployTitan342:false};
vm.createContext(touch);const tapLine=src.split('\n').find(l=>l.startsWith("canvas.addEventListener('pointerdown'"));vm.runInContext(tapLine,touch);
const event={button:0,preventDefault(){},stopImmediatePropagation(){}};tap(event);assert.equal(managed,1);assert.equal(selected,null);
mech.hp=0;mech.resting347=true;tap(event);assert.equal(managed,2,'destroyed/resting mech is tappable');
mech.hp=100;mech.resting347=false;touch.screen='raid';tap(event);assert.equal(selected,mech);assert.equal(managed,2);
vm.runInContext(src.split('\n').find(l=>l.startsWith('Game.titanControl356=')),touch);touch.screen='home';touch.Game.titanControl356();assert.equal(closed,1);assert.equal(selected,mech);
mech.resting347=true;touch.Game.titanControl356();assert.equal(managed,3);assert.equal(closed,1);
console.log('PASS home tap management, zero-HP tap, explicit control and unchanged battle selection');
