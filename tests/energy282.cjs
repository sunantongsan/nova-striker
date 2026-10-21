const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const ctx={};
vm.runInNewContext(fs.readFileSync('game.js','utf8').replace('root.NovaRTS={','root.EnergyTest={startEnergyBurst282,tickEnergy276,energyGeometry276};root.NovaRTS={'),ctx);
const F=ctx.EnergyTest;
for(const [lv,count] of [[1,1],[6,2],[12,3],[20,4]]){
 const gun={id:1,type:'cannonturret',lv,x:1,y:1,hp:100},scene={fx:[],enemies:[]};
 F.startEnergyBurst282(scene,gun,{x:5,y:5},120);
 assert.equal(scene.fx.length,1);assert.equal(scene.energyBurst282.length,count-1);
 for(let i=1;i<count;i++){F.tickEnergy276(scene,.12,'enemies');assert.equal(scene.fx.length,i+1);}
 assert.equal(scene.energy276.length,count);assert.equal(scene.energy276.reduce((a,b)=>a+b.damage,0),120);
 assert.equal(new Set(scene.fx.map(f=>f.muzzle.x+':'+f.muzzle.y)).size,count);
 assert(Math.abs(scene.fx[0].orb281*14.4-F.energyGeometry276(gun).muzzleDiameter*2)<1e-9);
 F.tickEnergy276(scene,2,'enemies');assert.equal(scene.energy276.length,0);
}
const scene={fx:[],enemies:[]},gun={type:'cannonturret',lv:20,x:0,y:0,hp:10};F.startEnergyBurst282(scene,gun,{x:2,y:2},100);gun.hp=0;F.tickEnergy276(scene,.5,'enemies');assert.equal(scene.fx.length,1);assert.equal(scene.energyBurst282.length,0);
console.log('PASS 1/2/3/4 sequential shots, distinct muzzle positions, exact 2x projectile diameter, total damage, delayed impact and destroyed-source cancellation');
