// Titan combat shares the existing damage, targeting and collision systems.
var Titan342={names:['NOVA I','NOVA II','NOVA III'],models:['atlas-09','vanguard-07','titan-06'],hp:[9600,20400,43200],damage:[273,585,1235],skills:{
 slash:{name:'ดาบพลาสมา',en:'Plasma blade',level:1,range:2.8,arc:2.4,damage:1.4,cool:4,cost:12,delay:.42,duration:1.15,clip:'SwordSlash'},
 palm:{name:'ปืนฝ่ามือ',en:'Palm cannon',level:1,range:7,arc:.4,damage:2,cool:8,cost:20,delay:.75,duration:1.35,air:true,clip:'KneelFire'},
 dash:{name:'พุ่งทะลวง',en:'Jet assault',level:1,range:3,arc:1.4,damage:1.8,cool:12,cost:25,delay:.48,duration:.9,clip:'Run'},
 shield:{name:'เกราะพิทักษ์',en:'Aegis field',level:2,range:3.2,cool:18,cost:25,delay:0,duration:1,clip:'ShieldGuard'},
 nova:{name:'โนวาระเบิด',en:'Nova rupture',level:3,range:4.5,arc:Math.PI*2,damage:3,cool:24,cost:40,delay:1.05,duration:1.7,clip:'ChestBeam'}
}};
function titan342(level,x,y,skills){level=Math.max(1,Math.min(3,level||1));return {id:34000,kind:10,titan342:true,tier342:level,x:x,y:y,hp:Titan342.hp[level-1],max:Titan342.hp[level-1],energy342:100,skills342:skills||{slash:1,palm:1,dash:1,shield:1,nova:1},cooldowns342:{},cool:0,route:[],aim:0,heading:0,knockbackMass274:100,action342:'Sentinel',actionTime342:0};}
function titanSolid442(scene,b){return !trap278(b)&&(b.hp>0||scene.home355&&b.hp===undefined);}
function titanBlocked342(scene,x,y){var max=(scene.mapSize||22)-1;return x<.4||y<.4||x>max-.4||y>max-.4||scene.buildings.some(function(b){return titanSolid442(scene,b)&&Math.abs(x-b.x)<.75&&Math.abs(y-b.y)<.75;});}
function titanJump345(scene,t,dx,dy){
 if(t.jump345||t.jumpCooldown345>0)return false;var len=Math.hypot(dx,dy);if(!len)return false;dx/=len;dy/=len;
 if(scene.home355)return titanHomeJump355(scene,t,dx,dy);
 var wall=scene.buildings.find(function(b){return b.type==='wall'&&b.hp>0&&Math.abs(t.x+dx*.65-b.x)<.85&&Math.abs(t.y+dy*.65-b.y)<.85;});if(!wall)return false;
 for(var length=1.8;length<=3.3;length+=.3){var x=t.x+dx*length,y=t.y+dy*length;if(titanBlocked342(scene,x,y))continue;var safe=true;for(var d=.2;d<length;d+=.2){var px=t.x+dx*d,py=t.y+dy*d;if(scene.buildings.some(function(b){return b.hp>0&&b.type!=='wall'&&!trap278(b)&&Math.abs(px-b.x)<.75&&Math.abs(py-b.y)<.75;})){safe=false;break;}}if(!safe)continue;
 t.jump345={x:t.x,y:t.y,tx:x,ty:y,elapsed:0,duration:.85};t.jumpCooldown345=3;t.action342='BoostJump';t.actionTime342=.85;t.actionSeq342=(t.actionSeq342||0)+1;t.heading=t.aim=Math.atan2(dy,dx);return true;}return false;
}
// Home navigation may boost over obstacles, but only land on clear ground inside the base.
function titanHomeJump355(scene,t,dx,dy){
 if(!titanBlocked342(scene,t.x+dx*.8,t.y+dy*.8))return false;
 var heading=Math.atan2(dy,dx);
 for(var length=1.8;length<=5.1;length+=.3)for(var turn of [0,.35,-.35,.7,-.7]){
  var x=t.x+Math.cos(heading+turn)*length,y=t.y+Math.sin(heading+turn)*length;
  if(titanBlocked342(scene,x,y))continue;
  t.jump345={x:t.x,y:t.y,tx:x,ty:y,elapsed:0,duration:.85};t.jumpCooldown345=1;t.action342='BoostJump';t.actionTime342=.85;t.actionSeq342=(t.actionSeq342||0)+1;t.heading=t.aim=heading+turn;return true;
 }return false;
}
function advanceJump345(scene,t,dt){t.jumpCooldown345=Math.max(0,(t.jumpCooldown345||0)-dt);if(!t.jump345)return false;var j=t.jump345;j.elapsed=Math.min(j.duration,j.elapsed+dt);var p=j.elapsed/j.duration;t.x=j.x+(j.tx-j.x)*p;t.y=j.y+(j.ty-j.y)*p;t.action342='BoostJump';if(p>=1){delete t.jump345;t.action342='Sentinel';if(scene.fx)scene.fx.push({weapon:'titan342',skill342:'land345',x:t.x,y:t.y,tx:t.x,ty:t.y,life:.45,maxLife:.45});}return true;}
// Walk directly through cleared ground; only intact buildings obstruct the route.
function titanRoute442(scene,t,target,buildings){
 var dx=target.x-t.x,dy=target.y-t.y,d=Math.hypot(dx,dy),end=Math.max(0,d-1.8),clear=true;
 for(var n=.2;n<=end+.001;n+=.2){if(titanBlocked342(scene,t.x+dx/d*n,t.y+dy/d*n)){clear=false;break;}}
 if(clear)return [{x:target.x,y:target.y}];
 return route(t,target,buildings,1.6,(scene.mapSize||22)-1)||[];
}
// A sealed objective needs a breach target. Follow the route that would open
// if walls were removed and cut the first intact wall on that route.
function titanPlan443(scene,t,target){
 var buildings=scene.buildings;
 var path=titanRoute442(scene,t,target,buildings);
 if(path.length)return path;
 if(!scene.defenders&&scene.troops.includes(t)){
  var open=route(t,target,buildings.filter(function(b){return b.type!=='wall';}),1.6,(scene.mapSize||22)-1)||[];
  var wallsOnly=open.length>0;
  if(!wallsOnly)open=route(t,target,[],1.6,(scene.mapSize||22)-1)||[];
  for(var cell of open){
   var obstruction=buildings.find(function(b){return b.hp>0&&!trap278(b)&&(!wallsOnly||b.type==='wall')&&b.x===cell.x&&b.y===cell.y;});
   if(obstruction){
    t.breach443=obstruction;
    return titanRoute442(scene,t,obstruction,buildings);
   }
  }
 }
 return [{x:target.x,y:target.y}];
}
function titanTarget443(scene,t,dt){
 if(t.breach443&&t.breach443.hp>0)return t.breach443;
 t.breach443=null;
 t.searchIn443=(t.searchIn443||0)-dt;
 var prior=t.aimTarget;
 if(t.searchIn443>0&&prior&&prior.hp>0&&!(prior.sortie277||prior.transport277))return prior;
 var enemies=titanEnemies342(scene,t),best=null,rank=Infinity,nearest=Infinity;
 var raider=!t.manual342&&!scene.defenders&&scene.troops.includes(t);
 for(var enemy of enemies){
  if(!(enemy.hp>0)||enemy.sortie277&&enemy.sortie277.phase==='reload'||enemy.transport277&&['away','destroyed'].includes(enemy.state))continue;
  var priority=raider?(enemy.type==='wall'?2:air277(enemy)?1:0):0;
  var dx=enemy.x-t.x,dy=enemy.y-t.y,d=dx*dx+dy*dy;
  if(priority<rank||priority===rank&&d<nearest){best=enemy;rank=priority;nearest=d;}
 }
 t.searchIn443=.25;
 return best;
}
function titanMove342(scene,t,dx,dy,dt,speed){if(t.jump345)return;var len=Math.hypot(dx,dy);if(!len)return;var step=Math.min(len,speed*dt),x=t.x+dx/len*step,y=t.y+dy/len*step;if(!titanBlocked342(scene,x,y)){t.x=x;t.y=y;}else if(titanJump345(scene,t,dx,dy))return;else if(!titanBlocked342(scene,x,t.y))t.x=x;else if(!titanBlocked342(scene,t.x,y))t.y=y;t.aim=t.heading=Math.atan2(dy,dx);t.moving=true;}
function titanEnemies342(scene,t){return scene.defenders?(scene.enemies||[]):scene.troops.includes(t)?scene.guards.concat(scene.buildings.filter(function(b){return !trap278(b)||b.revealed278;})):scene.troops.concat(scene.transports277||[]);}
function titanFriends342(scene,t){return scene.defenders?scene.defenders:scene.troops.includes(t)?scene.troops:scene.guards;}
function titanCast342(scene,t,id,aimTarget){var s=Titan342.skills[id];if(!s||t.hp<=0||t.resting347||t.stun>0||t.tier342<s.level||!(t.skills342[id]>0)||t.energy342<s.cost||t.cooldowns342[id]>0||t.pending342||t.jump345)return false;
 t.cool=Math.max(t.cool,s.duration+.8);t.energy342-=s.cost;t.cooldowns342[id]=s.cool;t.action342=s.clip;t.actionTime342=s.duration;t.actionSeq342=(t.actionSeq342||0)+1;var target=aimTarget||titanEnemies342(scene,t).filter(function(v){return v.hp>0&&(s.air||!air277(v));}).reduce(function(best,v){return !best||dist(t,v)<dist(t,best)?v:best;},undefined);
 if(target&&dist(t,target)<=s.range+1){t.aim=t.heading=Math.atan2(target.y-t.y,target.x-t.x);}
 if(id==='shield'){titanFriends342(scene,t).forEach(function(v){if(v.hp>0&&dist(t,v)<=s.range)v.shield342=5;});}
 else t.pending342={id:id,remaining:s.delay,angle:t.aim,x:target?target.x:t.x+Math.cos(t.aim)*s.range,y:target?target.y:t.y+Math.sin(t.aim)*s.range};
 scene.fx.push({weapon:'titan342',skill342:id,x:t.x,y:t.y,tx:target?target.x:t.x+Math.cos(t.aim)*s.range,ty:target?target.y:t.y+Math.sin(t.aim)*s.range,angle:t.aim,delay347:s.delay,life:id==='shield'?5:s.duration,maxLife:id==='shield'?5:s.duration,radius:s.range,color:'#62eaff'});return true;
}
function titanImpact342(scene,t,p){scene.fx.push({weapon:'titan342',skill342:p.id+'Impact',x:t.x,y:t.y,tx:p.x,ty:p.y,angle:p.angle,life:.85,maxLife:.85,radius:Titan342.skills[p.id].range});var s=Titan342.skills[p.id],scale=1+.25*Math.max(0,(t.skills342[p.id]||1)-1);titanEnemies342(scene,t).forEach(function(v){if(v.hp<=0||!s.air&&air277(v))return;var dx=v.x-t.x,dy=v.y-t.y,d=Math.hypot(dx,dy),angle=Math.atan2(Math.sin(Math.atan2(dy,dx)-p.angle),Math.cos(Math.atan2(dy,dx)-p.angle));if(p.id==='palm'){if(Math.hypot(v.x-p.x,v.y-p.y)>1.15||Math.hypot(p.x-t.x,p.y-t.y)>s.range+1)return;}else if(d>s.range||Math.abs(angle)>s.arc/2)return;hit(scene,v,Titan342.damage[t.tier342-1]*s.damage*scale,t,'plasma');});}
function titanTick342(scene,t,dt){if(t.hp<=0){t.action342='Collapse';delete t.pending342;delete t.jump345;return;}Object.keys(t.cooldowns342).forEach(function(k){t.cooldowns342[k]=Math.max(0,t.cooldowns342[k]-dt);});t.energy342=Math.min(100,t.energy342+dt*7);t.actionTime342=Math.max(0,t.actionTime342-dt);t.moving=false;t.cool-=dt;if(advanceJump345(scene,t,dt))return;
 if(t.pending342){var p=t.pending342;if(p.id==='dash')titanMove342(scene,t,Math.cos(p.angle)*10,Math.sin(p.angle)*10,dt,6);p.remaining-=dt;if(p.remaining<=0){titanImpact342(scene,t,p);delete t.pending342;}return;}
 if(t.stun>0)return;
 if(t.manual342){var m=t.input342||{x:0,y:0};titanMove342(scene,t,m.x,m.y,dt,2);if(Math.hypot(m.x,m.y)>.1){if(!t.jump345)t.action342=t.moving?'Walk':'Sentinel';return;}}
 var target=titanTarget443(scene,t,dt);
 if(!target){if(!t.actionTime342)t.action342='Sentinel';return;}var d=dist(t,target);t.aimTarget=target;
 if(!t.manual342){
  t.aim=t.heading=Math.atan2(target.y-t.y,target.x-t.x);
  if(t.hp<t.max*.6&&!(t.shield342>0)&&titanCast342(scene,t,'shield',target))return;
  if(!air277(target)&&d<4&&titanCast342(scene,t,'nova',target))return;
  if(d<=7&&(air277(target)||d>2.8)&&titanCast342(scene,t,'palm',target))return;
  if(d<=2.8&&!air277(target)&&titanCast342(scene,t,'slash',target))return;
 }
 if(d<=2.2&&!air277(target)){if(t.cool<=0){t.aim=t.heading=Math.atan2(target.y-t.y,target.x-t.x);t.cool=1.8;t.action342='SwordSlash';t.actionTime342=1.1;t.actionSeq342=(t.actionSeq342||0)+1;t.pending342={id:'slash',remaining:.42,angle:t.aim,x:target.x,y:target.y};scene.fx.push({weapon:'titan342',skill342:'slash',x:t.x,y:t.y,tx:target.x,ty:target.y,angle:t.aim,life:1.1,maxLife:1.1,radius:2.8,color:'#62eaff'});}}
 else if(!t.manual342){
  t.pathAge=(t.pathAge||0)-dt;
  var revision=scene.obstacles443||0;
  if(t.pathAge<=0||t.routeRevision443!==revision||t.routeTarget442!==target){
   t.route=titanPlan443(scene,t,target);
   t.routeTarget442=t.breach443||target;
   t.routeRevision443=revision;
   t.pathAge=.7;
  }
  var waypoint=t.route[0];
  if(waypoint){
   titanMove342(scene,t,waypoint.x-t.x,waypoint.y-t.y,dt,1.5);
   if(dist(t,waypoint)<.15)t.route.shift();
  }
  if(!t.jump345&&t.moving)t.action342='Walk';
 }
 if(!t.jump345&&!t.actionTime342&&!t.moving)t.action342='Sentinel';
}
var hitTitan342=hit;hit=function(scene,target,damage,source,weapon){var alive=target.hp>0,result=hitTitan342(scene,target,damage*(target.shield342>0?.35:1),source,weapon);if(alive&&target.type&&target.hp<=0)scene.obstacles443=(scene.obstacles443||0)+1;return result;};
function tickTitans342(scene,dt){['troops','guards','defenders','enemies'].forEach(function(k){(scene[k]||[]).forEach(function(t){t.shield342=Math.max(0,(t.shield342||0)-dt);if(t.titan342)titanTick342(scene,t,dt);});});}
var tickTitan342=Engine.prototype.tick;Engine.prototype.tick=function(dt){if(this.raid&&this.raid.phase==='battle'&&!this.raid.result)tickTitans342(this.raid,Math.min(.1,Math.max(0,dt)));return tickTitan342.call(this,dt);};
var defenseTitan342=Engine.prototype.tickDefense;Engine.prototype.tickDefense=function(dt){if(this.defense&&!this.defense.result)tickTitans342(this.defense,Math.min(.1,Math.max(0,dt)));return defenseTitan342.call(this,dt);};
var scoutTitan342=Engine.prototype.scoutPlayer;Engine.prototype.scoutPlayer=function(target){var ok=scoutTitan342.call(this,target);if(ok&&target.titan342&&target.titan342.level&&!target.titan342.resting347){var h=this.raid.buildings.find(function(b){return b.type==='hq';})||{x:10,y:10};var t=titan342(target.titan342.level,h.x+1.5,h.y+1.5,target.titan342.skills);t.owner=target.id;this.raid.guards.push(t);}return ok;};
var startTitan342=Engine.prototype.startDefense;Engine.prototype.startDefense=function(){var error=startTitan342.call(this);if(!error&&this.d.titan342&&this.d.titan342.level&&!this.titanRecovery347().resting){var h=supportPark339(this.d.buildings)||{x:10,y:10};this.defense.defenders.push(titan342(this.d.titan342.level,h.x+1.8,h.y+1.8,this.d.titan342.skills));}return error;};
Engine.prototype.deployTitan342=function(x,y){var r=this.raid,s=this.d.titan342;if(!r||r.result||!s||!s.level||r.titanUsed342)return 'หุ่นยังไม่พร้อม';if(this.titanRecovery347().resting)return 'หุ่นกำลังพักฟื้น';if(r.liveMode)return 'กำลังเตรียมระบบหุ่นสำหรับสนามออนไลน์';var max=(r.mapSize||22)-1;if(!Number.isFinite(x)||!Number.isFinite(y)||titanBlocked342(r,x,y))return 'เลือกพื้นที่ว่าง ห้ามวางทับอาคาร';var t=titan342(s.level,x,y,s.skills);r.troops.push(t);r.titanUsed342=true;r.deployed++;r.phase='battle';return '';};
Titan342.route442=titanRoute442;Titan342.make=titan342;Titan342.cast=titanCast342;Titan342.tick=titanTick342;Titan342.blocked=titanBlocked342;Titan342.move=titanMove342;Titan342.jump=titanJump345;Titan342.advanceJump=advanceJump345;


// Recovery is checkpointed in the existing saved base, never in a disposable unit.
// Thirty minutes restores a completely destroyed guardian; partial injuries scale linearly.
Engine.prototype.titanRecovery347=function(){var now=this.now(),r=this.d.titanRecovery347;if(!r)return {fraction:1,resting:false,remaining:0};var elapsed=Math.max(0,now-r.at),fraction=Math.min(1,Math.max(0,r.fraction)+elapsed/1800000);return {fraction:fraction,resting:fraction<1,remaining:Math.ceil((1-fraction)*1800),destroyed:!!r.destroyed};};
Engine.prototype.recordTitan347=function(t,active){if(!t||!t.titan342)return;var fraction=Math.max(0,Math.min(1,t.hp/t.max)),old=this.d.titanRecovery347,now=this.now();if(old&&old.active===!!active&&old.fraction===fraction&&(!active||now-old.at<5000))return;this.d.titanRecovery347={fraction:fraction,at:now,active:!!active,destroyed:fraction===0};if(!active&&fraction<1)this.d.pendingRecovery347={id:'rest-'+now+'-'+Math.random().toString(36).slice(2),fraction:fraction};if(!active||!this.recoverySaveAt347||now-this.recoverySaveAt347>=1000){this.recoverySaveAt347=now;this.save();}};
var finish347=Engine.prototype.finish;Engine.prototype.finish=function(){var scene=this.raid,out=finish347.apply(this,arguments);if(scene&&scene.result&&!scene.recovered347){scene.recovered347=true;this.recordTitan347(scene.troops.find(function(t){return t.titan342&&!t.owner;}),false);}return out;};
var finishDefense347=Engine.prototype.finishDefense;Engine.prototype.finishDefense=function(){var scene=this.defense,out=finishDefense347.apply(this,arguments);if(scene&&scene.result&&!scene.recovered347){scene.recovered347=true;this.recordTitan347(scene.defenders.find(function(t){return t.titan342;}),false);}return out;};
// Keep a bounded priority budget for guardian effects even under heavy artillery fire.
function preserveTitanFX347(scene,step){if(!scene)return step();var keep=(scene.fx||[]).filter(function(f){return f.weapon==='titan342';});var out=step();keep.forEach(function(f){if(f.life>0&&!scene.fx.includes(f))scene.fx.push(f);});var other=scene.fx.filter(function(f){return f.weapon!=='titan342';}).slice(-35),hero=scene.fx.filter(function(f){return f.weapon==='titan342';}).slice(-24);scene.fx=other.concat(hero);return out;}
var combatTick347=Engine.prototype.tick;Engine.prototype.tick=function(dt){var self=this,r=this.raid,out=preserveTitanFX347(r,function(){return combatTick347.call(self,dt);});if(r&&!r.result)this.recordTitan347(r.troops.find(function(t){return t.titan342&&!t.owner;}),true);return out;};
var defenseTick347=Engine.prototype.tickDefense;Engine.prototype.tickDefense=function(dt){var self=this,r=this.defense,out=preserveTitanFX347(r,function(){return defenseTick347.call(self,dt);});if(r&&!r.result)this.recordTitan347(r.defenders.find(function(t){return t.titan342;}),true);return out;};

function limitTitanFX347(fx){return fx.filter(function(f){return f.weapon!=='titan342';}).slice(-35).concat(fx.filter(function(f){return f.weapon==='titan342';}).slice(-24));}

