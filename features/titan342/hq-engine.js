// Headquarters remains one building: one HP pool, footprint and loot identity.
var HQ352={buildingTier:function(lv){return Math.min(4,Math.floor((Math.max(1,lv||1)-1)/4));},robotTier:function(lv){return lv<5?-1:Math.min(5,Math.floor((lv-5)/3));},transformTime:2.4,chargeTime:1.05,reload:4.2,radius:1.65};
var rangeHQ352=defenseRange223;defenseRange223=function(type,mode,lv){var b=typeof type==='object'?type:{type:type,lv:lv};return b.type==='hq'&&b.lv>=5?rangeHQ352('cannonturret',mode,b.lv):rangeHQ352(type,mode,lv);};
var damageHQ352=baseDamage;baseDamage=function(kind,lv){return kind==='hq'&&lv>=5?Math.round(damageHQ352('cannonturret',lv)*.65*100)/100:damageHQ352(kind,lv);};
var hitHQ352=hit;hit=function(scene,target,damage,source,weapon){var hp=target.hp,out=hitHQ352(scene,target,damage,source,weapon);if(target.type&&target.hp<hp&&scene.buildings.includes(target))scene.buildings.forEach(function(b){if(b.type==='hq'&&b.lv>=5&&b.hp>0)b.alert352=8;});return out;};
function hqFX352(scene,b,kind,target,duration){scene.hqFX352=scene.hqFX352||[];scene.hqSeq352=(scene.hqSeq352||0)+1;scene.hqFX352.push({id352:scene.hqSeq352,x:b.x,y:b.y,tx:target?target.x:b.x,ty:target?target.y:b.y,kind:kind,muzzle352:b.muzzle352||null,life:duration,maxLife:duration});scene.hqFX352=scene.hqFX352.slice(-16);}
function tickHQ352(scene,dt,group){
 dt=Math.min(.1,Math.max(0,dt));scene.hqFX352=(scene.hqFX352||[]).filter(function(f){f.life-=dt;return f.life>0;});
 var targets=(scene[group]||[]).concat(group==='troops'?scene.transports277||[]:[]),shots=scene.hqShots352||[];scene.hqShots352=[];
 shots.forEach(function(s){s.remaining-=dt;if(s.remaining>0){scene.hqShots352.push(s);return;}var source=scene.buildings.find(function(b){return b.id===s.source;});if(!source)return;var victims=targets.filter(function(t){return t.hp>0&&!air277(t)&&dist(t,s)<=HQ352.radius;}).map(function(t){return {t:t,d:s.damage*(1-.65*Math.min(1,dist(t,s)/HQ352.radius))};});victims.forEach(function(v){hit(scene,v.t,v.d,source,'plasma');});hqFX352(scene,s,'blast',null,1.4);});
 scene.buildings.forEach(function(b){if(b.type!=='hq'||b.lv<5)return;
 if(b.hp<=0){if(!b.wreck352){b.wreck352=true;hqFX352(scene,b,'wreck',null,1.7);}b.form352=0;b.charge352=0;b.lock352=null;return;}
 b.alert352=Math.max(0,(b.alert352||0)-dt);b.reload352=Math.max(0,(b.reload352||0)-dt);
 var inRange=targets.filter(function(t){return t.hp>0&&!air277(t)&&canDamage285(t,b,'plasma')&&dist(t,b)<=defenseRange223(b);}).sort(function(a,c){return dist(a,b)-dist(c,b);}),target=inRange[0];
 // Wake only after an actual hit on the defending base. Remain deployed while threats remain.
 if(b.alert352>0)b.awake352=true;if(b.awake352&&target)b.alert352=8;
 if(b.alert352<=0&&!target)b.awake352=false;
 var old=b.form352||0;b.form352=Math.max(0,Math.min(1,old+(b.awake352?1:-1)*dt/HQ352.transformTime));
 if(old===0&&b.form352>0)hqFX352(scene,b,'transform',null,2.4);
 if(old===1&&b.form352<1)hqFX352(scene,b,'fold',null,2.4);
 if(target&&b.form352>0){b.aimTarget=target;b.aim=turnAngle(b.aim||0,Math.atan2(target.y-b.y,target.x-b.x),dt*3.4);}
 if(b.form352<1||!target){b.charge352=0;b.lock352=null;return;}
 if(b.reload352>0)return;
 if(!b.lock352){b.lock352={x:target.x,y:target.y};b.charge352=HQ352.chargeTime;hqFX352(scene,b,'charge',b.lock352,HQ352.chargeTime);}
 b.charge352-=dt;if(b.charge352>1e-8)return;
 var pos=b.lock352,flight=Math.max(.3,dist(b,pos)/10);b.aim=Math.atan2(pos.y-b.y,pos.x-b.x);b.reload352=HQ352.reload;b.lock352=null;b.charge352=0;
 scene.hqShots352.push({source:b.id,x:pos.x,y:pos.y,remaining:flight,damage:baseDamage('hq',b.lv)});hqFX352(scene,b,'orb',pos,flight);
 });
}
var tickBeforeHQ352=Engine.prototype.tick;Engine.prototype.tick=function(dt){var r=this.raid;if(r&&r.phase==='battle'&&!r.result)tickHQ352(r,dt,'troops');return tickBeforeHQ352.call(this,dt);};
var defenseBeforeHQ352=Engine.prototype.tickDefense;Engine.prototype.tickDefense=function(dt){var r=this.defense;if(r&&!r.result)tickHQ352(r,dt,'enemies');return defenseBeforeHQ352.call(this,dt);};
HQ352.tick=tickHQ352;HQ352.damage=function(lv){return baseDamage('hq',lv);};HQ352.range=function(lv){return defenseRange223({type:'hq',lv:lv});};
