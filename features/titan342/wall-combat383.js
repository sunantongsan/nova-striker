// All wall pieces unlock a short-range ground-only machine gun at level 15.
function wallStats383(lv){lv=Math.max(1,Math.min(20,lv||1));return {armed:lv>=15,range:lv>=15?2.5+(lv-15)*.1:0,damage:lv>=15?Math.round(baseDamage('gun',lv)*.08*100)/100:0,rate:.9};}
function wallMount383(b){var a=screenBearing(b.aim===undefined?-Math.PI/2:b.aim),h=27+Math.floor((Math.max(1,b.lv||1)-1)/4)*5,l=15-Math.min(.18,b.recoil||0)*10;return{x:Math.cos(a)*l,y:Math.sin(a)*l*.62-h,height:h,angle:a};}
var mountBefore383=weaponMount;weaponMount=function(b){return b.type==='wall'&&b.lv>=15?wallMount383(b):mountBefore383(b);};
var rangeBefore383=defenseRange223;defenseRange223=function(b,mode,lv){return (typeof b==='object'?b.type:b)==='wall'?wallStats383(typeof b==='object'?b.lv:lv).range:rangeBefore383(b,mode,lv);};
function tickWalls383(scene,targets,dt){
 if(!scene||scene.result||!(dt>0)||hqDestroyed379(scene.buildings))return;
 var ground=(targets||[]).filter(function(t){return t.hp>0&&!air277(t);});
 (scene.buildings||[]).forEach(function(b){if(b.type!=='wall'||b.lv<15||b.hp<=0||b.constructing||b.stun>0)return;
  b.wallCool383=Math.max(0,(b.wallCool383||0)-dt);if(b.wallCool383>0)return;
  var s=wallStats383(b.lv),target=null,nearest=s.range*s.range;
  ground.forEach(function(t){if(t.hp<=0||!canDamage285(t,b,'machine'))return;var d=(t.x-b.x)*(t.x-b.x)+(t.y-b.y)*(t.y-b.y);if(d<=nearest){target=t;nearest=d;}});
  if(!target)return;b.aimTarget=target;var shot=weaponFX(b,target,'machine');hit(scene,target,s.damage*plusFactor(damageLevel245(b)),b,'machine');scene.fx.push(shot);b.wallCool383=s.rate;
 });
}
var tickBefore383=Engine.prototype.tick;Engine.prototype.tick=function(dt){var r=this.raid;if(r&&r.phase==='battle'&&!r.result)tickWalls383(r,(r.troops||[]).concat(r.transports277||[]),dt);return tickBefore383.call(this,dt);};
var defendBefore383=Engine.prototype.tickDefense;Engine.prototype.tickDefense=function(dt){var d=this.defense;if(d&&!d.result)tickWalls383(d,d.enemies,dt);return defendBefore383.call(this,dt);};
var statsBefore383=Engine.prototype.enhanceStats;Engine.prototype.enhanceStats=function(key,lv){var s=statsBefore383.call(this,key,lv);if(s&&key==='building:wall'){s.baseDamage=wallStats383(lv).damage;s.damage=s.baseDamage*plusFactor(damageLevel245({enhance:s.level,enhancePaths245:s.paths}));}return s;};
