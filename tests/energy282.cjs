const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const ctx={};
vm.runInNewContext(fs.readFileSync('game.js','utf8').replace('root.NovaRTS={','root.EnergyTest={startEnergyBurst282,tickEnergy276,energyGeometry276};root.NovaRTS={'),ctx);
const F=ctx.EnergyTest;
for(const [lv,count] of [[1,1],[3,1],[4,2],[8,3],[12,4],[16,5],[19,5],[20,6]]){
 const gun={id:1,type:'cannonturret',lv,x:1,y:1,hp:100},scene={fx:[],enemies:[]};
 F.startEnergyBurst282(scene,gun,{x:5,y:5},120);
 assert.equal(scene.fx.length,1);assert.equal(scene.energyBurst282.length,count-1);
 for(let i=1;i<count;i++){F.tickEnergy276(scene,.12,'enemies');assert.equal(scene.fx.length,i+1);}
 assert.equal(scene.energy276.length,count);assert(Math.abs(scene.energy276.reduce((a,b)=>a+b.damage,0)-120)<1e-9);
 assert(new Set(scene.fx.map(f=>f.muzzle.x+':'+f.muzzle.y)).size>=Math.min(count,(lv>=20?3:lv>=12?2:lv>=6?1:0)+1));
 assert(Math.abs(scene.fx[0].orb281*14.4-F.energyGeometry276(gun).muzzleDiameter*2)<1e-9);
 F.tickEnergy276(scene,2,'enemies');assert.equal(scene.energy276.length,0);
}
const scene={fx:[],enemies:[]},gun={type:'cannonturret',lv:20,x:0,y:0,hp:10};F.startEnergyBurst282(scene,gun,{x:2,y:2},100);gun.hp=0;F.tickEnergy276(scene,.5,'enemies');assert.equal(scene.fx.length,1);assert.equal(scene.energyBurst282.length,0);
console.log('PASS 1/2/3/4 sequential shots, distinct muzzle positions, exact 2x projectile diameter, total damage, delayed impact and destroyed-source cancellation');
