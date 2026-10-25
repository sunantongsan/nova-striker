const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');const box={};
vm.runInNewContext(fs.readFileSync('game.js','utf8').replace('root.NovaRTS={','root.balance351={baseDamage,energyFalloff351,defenseGrowth351};root.NovaRTS={'),box);
const N=box.NovaRTS,F=box.balance351;
for(let lv=1;lv<=20;lv++){assert(F.baseDamage('cannonturret',lv)>0);if(lv>1)assert(F.baseDamage('cannonturret',lv)>F.baseDamage('cannonturret',lv-1));assert.equal(F.baseDamage('cannonturret',lv),N.Engine.prototype.enhanceStats.call({d:{research:{},enhancements:{}}},'building:cannonturret',lv).baseDamage);}
// Equal armor research 10, no enhancement: infantry has a reaction window, tanks absorb sustained fire.
const artillery=F.baseDamage('cannonturret',10);assert.equal(artillery,252);
assert.equal(Math.ceil(N.units[0].hp*2/artillery),3);assert.equal(Math.ceil(N.units[1].hp*2/artillery),10);
assert(N.units[6].hp>N.units[1].hp);assert(N.units[4].hp<N.units[0].hp);
function impact(mode,lv){const e=new N.Engine({getItem:()=>null,setItem(){}},()=>0),gun={id:2,type:'cannonturret',lv,x:10,y:10,hp:5000,max:5000,cool:0},hq={id:1,type:'hq',lv:1,x:1,y:1,hp:5000,max:5000,cool:999};
 const targets=[[12,10],[14.5,10],[15.1,10]].map(([x,y],i)=>({id:i+1,kind:0,x,y,hp:10000,max:10000,cool:999,stun:100,route:[]}));
 const scene={mapSize:22,time:120,remaining:1,spawn:999,wave:1,fx:[],buildings:[hq,gun],enemies:targets,defenders:[],troops:targets,guards:[],phase:'battle',stage:1,player:true,defenderResearch:{},army:[1],deployed:1};
 if(mode==='wave')e.defense=scene;else e.raid=scene;let tick=dt=>mode==='wave'?e.tickDefense(dt):e.tick(dt);tick(.01);gun.cool=999;for(let i=0;i<200;i++)tick(.01);return targets.map(t=>10000-t.hp);}
for(const lv of [1,10,20]){const a=impact('wave',lv),b=impact('raid',lv);a.forEach((v,i)=>assert(Math.abs(v-b[i])<1e-8,'raid and defense agree'));assert(a[0]>a[1]&&a[1]>0);assert.equal(a[2],0);assert(a[0]<=F.baseDamage('cannonturret',lv)+1e-8,'multiple barrels do not multiply total damage');}
console.log('PASS balance351: level progression/UI agreement, research-matched survivability, tank roles, actual raid/wave impact parity and spreading advantage');
console.table([1,10,20].map(lv=>({level:lv,artillery:F.baseDamage('cannonturret',lv),rangerHP:N.units[0].hp*2,tankHP:N.units[1].hp*2,rangerVolleys:Math.ceil(N.units[0].hp*2/F.baseDamage('cannonturret',lv)),tankVolleys:Math.ceil(N.units[1].hp*2/F.baseDamage('cannonturret',lv))})));
