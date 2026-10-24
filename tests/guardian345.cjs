const fs=require('fs'),vm=require('vm'),assert=require('assert');function Engine(){};Engine.prototype={tick(){},tickDefense(){},scoutPlayer(){},startDefense(){}};
const c={Engine,trap278:()=>false,air277:()=>false,dist:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),route:()=>[],hit:(s,t,d)=>t.hp-=d};vm.createContext(c);vm.runInContext(fs.readFileSync(process.argv[2]||'features/titan342/engine.js','utf8'),c);
let t=c.Titan342.make(1,4,5),s={mapSize:22,buildings:[{type:'wall',x:5,y:5,hp:2000}],troops:[t],guards:[],fx:[]};for(let i=0;i<3&&!t.jump345;i++)c.Titan342.move(s,t,1,0,.1,2);assert(t.jump345);assert(!c.Titan342.cast(s,t,'slash'));for(let i=0;i<10;i++)c.Titan342.advanceJump(s,t,.1);assert(t.x>5.75&&!t.jump345);
t=c.Titan342.make(1,4.2,5);s.buildings.push({type:'hq',x:6,y:5,hp:1000});assert(!c.Titan342.jump(s,t,1,0),'cannot jump through buildings');
s.buildings=[{type:'wall',x:5,y:5,hp:2000}];s.troops=[t];assert(c.Titan342.cast(s,t,'slash'));c.Titan342.tick(s,t,.5);assert(s.buildings[0].hp<2000,'wall is destructible');
t=c.Titan342.make(1,19.9,5);s.buildings=[{type:'wall',x:20.5,y:5,hp:1000}];assert(!c.Titan342.jump(s,t,1,0),'no landing beyond boundary');
console.log('PASS guardian jump: wall crossing, safe landing, building and boundary rejection, no airborne cast, wall damage');
