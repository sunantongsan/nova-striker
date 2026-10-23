const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8');
let draws=0,rings=0,normal=0;
const ctx=new Proxy({drawImage(){draws++;},ellipse(){rings++;}},{get:(o,k)=>o[k]||(()=>{})});
const box={screen:'raid',E:{raid:{player:true,phase:'scout',liveMode:'preview'}},trap278:b=>['landmine','silo'].includes(b.type),drawBuilding(){normal++;},point:()=>({x:10,y:10}),zoom:1,tile:20,selected:1,art278:{complete:true,naturalWidth:300,naturalHeight:300},ctx,Math};
vm.createContext(box);
vm.runInContext(source.split('\n').filter(l=>l.startsWith('function hiddenTrap305')||l.startsWith('var building278=')).join('\n'),box);
for(const type of ['landmine','silo']){
 const b={id:1,type,x:1,y:1,hp:100};
 for(const mode of ['preview','attacker',undefined])for(const phase of ['scout','battle']){
  box.screen='raid';box.E.raid={player:true,liveMode:mode,phase};
  draws=rings=0;box.drawBuilding(b,false);assert.equal(draws,0,type+' hidden '+mode+' '+phase);assert.equal(rings,0);
 }
 box.E.raid={player:true,liveMode:'attacker',phase:'battle'};b.revealed278=true;
 draws=rings=0;box.drawBuilding(b,false);assert(draws>0,'triggered trap visible');assert.equal(rings,0,'no owner range ring');
 box.E.raid.liveMode='preview';draws=0;box.drawBuilding(b,false);assert.equal(draws,0,'preview hides stale revealed state');
 delete b.revealed278;
 box.E.raid.liveMode='defender';draws=0;box.drawBuilding(b,false);assert(draws>0,'defender sees own traps');
 box.screen='home';draws=0;box.drawBuilding(b,false);assert(draws>0,'home sees own traps');
 box.screen='defense';draws=0;box.drawBuilding(b,false);assert(draws>0,'offline defense sees traps');
}
box.drawBuilding({type:'hq'},false);assert.equal(normal,1);
vm.runInContext(source.split('\n').find(l=>l.startsWith('function tapCommand299')),box);
Object.assign(box,{screen:'raid',commandMode299:true,liveRoom:null,selectedUnits299:[7],controllable299:()=>[],toast(){},hud(){},issueOrder299:(r,ids,o)=>{box.order=o;return true;}});
box.E.raid={phase:'battle',buildings:[{id:4,type:'landmine',x:3,y:3,hp:100}]};
box.tapCommand299(3,3);assert.equal(box.order.target,undefined,'hidden trap tap is movement');
box.E.raid.buildings[0].revealed278=true;box.tapCommand299(3,3);assert.equal(box.order.target,4,'revealed trap can be targeted');
console.log('PASS trap visibility: scouting, attack, trigger reveal, defense, owner editing and hidden-target taps');
