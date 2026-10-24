// Titan combat shares the existing damage, targeting and collision systems.
var Titan342={names:['ATLAS','VANGUARD','TITAN'],models:['atlas-09','vanguard-07','titan-06'],hp:[16000,34000,72000],damage:[420,900,1900],skills:{
 slash:{name:'ดาบพลาสมา',en:'Plasma blade',level:1,range:2.8,arc:2.4,damage:1.4,cool:4,cost:12,delay:.42,duration:1.15,clip:'SwordSlash'},
 palm:{name:'ปืนฝ่ามือ',en:'Palm cannon',level:1,range:7,arc:.4,damage:2,cool:8,cost:20,delay:.75,duration:1.35,air:true,clip:'KneelFire'},
 dash:{name:'พุ่งทะลวง',en:'Jet assault',level:1,range:3,arc:1.4,damage:1.8,cool:12,cost:25,delay:.48,duration:.9,clip:'Run'},
 shield:{name:'เกราะพิทักษ์',en:'Aegis field',level:2,range:3.2,cool:18,cost:25,delay:0,duration:1,clip:'ShieldGuard'},
 nova:{name:'โนวาระเบิด',en:'Nova rupture',level:3,range:4.5,arc:Math.PI*2,damage:3,cool:24,cost:40,delay:1.05,duration:1.7,clip:'ChestBeam'}
}};
function titan342(level,x,y,skills){level=Math.max(1,Math.min(3,level||1));return {id:34000,kind:10,titan342:true,tier342:level,x:x,y:y,hp:Titan342.hp[level-1],max:Titan342.hp[level-1],energy342:100,skills342:skills||{slash:1,palm:1,dash:1,shield:1,nova:1},cooldowns342:{},cool:0,route:[],aim:0,heading:0,knockbackMass274:100,action342:'Sentinel',actionTime342:0};}
function titanBlocked342(scene,x,y){var max=(scene.mapSize||22)-1;return x<.4||y<.4||x>max-.4||y>max-.4||scene.buildings.some(function(b){return b.hp>0&&!trap278(b)&&Math.abs(x-b.x)<.75&&Math.abs(y-b.y)<.75;});}
function titanMove342(scene,t,dx,dy,dt,speed){var len=Math.hypot(dx,dy);if(!len)return;var step=Math.min(len,speed*dt),x=t.x+dx/len*step,y=t.y+dy/len*step;if(!titanBlocked342(scene,x,y)){t.x=x;t.y=y;}else if(!titanBlocked342(scene,x,t.y))t.x=x;else if(!titanBlocked342(scene,t.x,y))t.y=y;t.aim=t.heading=Math.atan2(dy,dx);t.moving=true;}
function titanEnemies342(scene,t){return scene.defenders?(scene.enemies||[]):scene.troops.includes(t)?scene.guards.concat(scene.buildings.filter(function(b){return !trap278(b)||b.revealed278;})):scene.troops.concat(scene.transports277||[]);}
function titanFriends342(scene,t){return scene.defenders?scene.defenders:scene.troops.includes(t)?scene.troops:scene.guards;}
function titanCast342(scene,t,id){var s=Titan342.skills[id];if(!s||t.hp<=0||t.stun>0||t.tier342<s.level||!(t.skills342[id]>0)||t.energy342<s.cost||t.cooldowns342[id]>0||t.pending342)return false;
 t.cool=Math.max(t.cool,s.duration+.8);t.energy342-=s.cost;t.cooldowns342[id]=s.cool;t.action342=s.clip;t.actionTime342=s.duration;t.actionSeq342=(t.actionSeq342||0)+1;var target=titanEnemies342(scene,t).filter(function(v){return v.hp>0&&(s.air||!air277(v));}).sort(function(a,b){return dist(t,a)-dist(t,b);})[0];
 if(target&&dist(t,target)<=s.range+1){t.aim=t.heading=Math.atan2(target.y-t.y,target.x-t.x);}
 if(id==='shield'){titanFriends342(scene,t).forEach(function(v){if(v.hp>0&&dist(t,v)<=s.range)v.shield342=5;});}
 else t.pending342={id:id,remaining:s.delay,angle:t.aim,x:target?target.x:t.x+Math.cos(t.aim)*s.range,y:target?target.y:t.y+Math.sin(t.aim)*s.range};
 scene.fx.push({weapon:'titan342',skill342:id,x:t.x,y:t.y,tx:target?target.x:t.x,ty:target?target.y:t.y,angle:t.aim,life:s.duration,maxLife:s.duration,radius:s.range,color:'#62eaff'});return true;
}
function titanImpact342(scene,t,p){var s=Titan342.skills[p.id],scale=1+.25*Math.max(0,(t.skills342[p.id]||1)-1);titanEnemies342(scene,t).forEach(function(v){if(v.hp<=0||!s.air&&air277(v))return;var dx=v.x-t.x,dy=v.y-t.y,d=Math.hypot(dx,dy),angle=Math.atan2(Math.sin(Math.atan2(dy,dx)-p.angle),Math.cos(Math.atan2(dy,dx)-p.angle));if(p.id==='palm'){if(Math.hypot(v.x-p.x,v.y-p.y)>1.15||Math.hypot(p.x-t.x,p.y-t.y)>s.range+1)return;}else if(d>s.range||Math.abs(angle)>s.arc/2)return;hit(scene,v,Titan342.damage[t.tier342-1]*s.damage*scale,t,'plasma');});}
function titanTick342(scene,t,dt){if(t.hp<=0){t.action342='Collapse';delete t.pending342;return;}Object.keys(t.cooldowns342).forEach(function(k){t.cooldowns342[k]=Math.max(0,t.cooldowns342[k]-dt);});t.energy342=Math.min(100,t.energy342+dt*7);t.actionTime342=Math.max(0,t.actionTime342-dt);t.moving=false;t.cool-=dt;
 if(t.pending342){var p=t.pending342;if(p.id==='dash')titanMove342(scene,t,Math.cos(p.angle)*10,Math.sin(p.angle)*10,dt,6);p.remaining-=dt;if(p.remaining<=0){titanImpact342(scene,t,p);delete t.pending342;}return;}
 if(t.stun>0)return;
 if(t.manual342){var m=t.input342||{x:0,y:0};titanMove342(scene,t,m.x,m.y,dt,2);if(Math.hypot(m.x,m.y)>.1){t.action342='Run';return;}}
 var enemies=titanEnemies342(scene,t).filter(function(v){return v.hp>0;}),target=enemies.sort(function(a,b){return dist(t,a)-dist(t,b);})[0];
 if(!target){if(!t.actionTime342)t.action342='Sentinel';return;}var d=dist(t,target);t.aimTarget=target;
 if(!t.manual342){t.aim=t.heading=Math.atan2(target.y-t.y,target.x-t.x);var skill=t.hp<t.max*.6&&t.tier342>=2&&!(t.shield342>0)?'shield':t.tier342===3&&d<4?'nova':air277(target)||d>2.8&&d<=7?'palm':d<=2.8?'slash':null;if(skill&&titanCast342(scene,t,skill))return;}
 if(d<=2.2&&!air277(target)){if(t.cool<=0){t.aim=t.heading=Math.atan2(target.y-t.y,target.x-t.x);t.cool=1.8;t.action342='SwordSlash';t.actionTime342=1.1;t.actionSeq342=(t.actionSeq342||0)+1;t.pending342={id:'slash',remaining:.42,angle:t.aim,x:target.x,y:target.y};scene.fx.push({weapon:'titan342',skill342:'slash',x:t.x,y:t.y,tx:target.x,ty:target.y,angle:t.aim,life:1.1,maxLife:1.1,radius:2.8,color:'#62eaff'});}}
 else if(!t.manual342){t.pathAge=(t.pathAge||0)-dt;if(t.pathAge<=0||!t.route.length){t.route=route(t,target,scene.buildings.filter(function(b){return b.hp>0;}),2,(scene.mapSize||22)-1)||[];t.pathAge=.7;}var p=t.route[0];if(p){titanMove342(scene,t,p.x-t.x,p.y-t.y,dt,1.5);if(dist(t,p)<.15)t.route.shift();}if(t.moving)t.action342='Run';}
 if(!t.actionTime342&&!t.moving)t.action342='Sentinel';
}
var hitTitan342=hit;hit=function(scene,target,damage,source,weapon){return hitTitan342(scene,target,damage*(target.shield342>0?.35:1),source,weapon);};
function tickTitans342(scene,dt){['troops','guards','defenders','enemies'].forEach(function(k){(scene[k]||[]).forEach(function(t){t.shield342=Math.max(0,(t.shield342||0)-dt);if(t.titan342)titanTick342(scene,t,dt);});});}
var tickTitan342=Engine.prototype.tick;Engine.prototype.tick=function(dt){if(this.raid&&this.raid.phase==='battle'&&!this.raid.result)tickTitans342(this.raid,Math.min(.1,Math.max(0,dt)));return tickTitan342.call(this,dt);};
var defenseTitan342=Engine.prototype.tickDefense;Engine.prototype.tickDefense=function(dt){if(this.defense&&!this.defense.result)tickTitans342(this.defense,Math.min(.1,Math.max(0,dt)));return defenseTitan342.call(this,dt);};
var scoutTitan342=Engine.prototype.scoutPlayer;Engine.prototype.scoutPlayer=function(target){var ok=scoutTitan342.call(this,target);if(ok&&target.titan342&&target.titan342.level){var h=this.raid.buildings.find(function(b){return b.type==='hq';})||{x:10,y:10};var t=titan342(target.titan342.level,h.x+1.5,h.y+1.5,target.titan342.skills);t.owner=target.id;this.raid.guards.push(t);}return ok;};
var startTitan342=Engine.prototype.startDefense;Engine.prototype.startDefense=function(){var error=startTitan342.call(this);if(!error&&this.d.titan342&&this.d.titan342.level){var h=supportPark339(this.d.buildings)||{x:10,y:10};this.defense.defenders.push(titan342(this.d.titan342.level,h.x+1.8,h.y+1.8,this.d.titan342.skills));}return error;};
Engine.prototype.deployTitan342=function(x,y){var r=this.raid,s=this.d.titan342;if(!r||r.result||!s||!s.level||r.titanUsed342)return 'หุ่นยังไม่พร้อม';if(r.liveMode)return 'กำลังเตรียมระบบหุ่นสำหรับสนามออนไลน์';var max=(r.mapSize||22)-1;if(!Number.isFinite(x)||!Number.isFinite(y)||titanBlocked342(r,x,y)||!(x<2||y<2||x>max-2||y>max-2))return 'เลือกจุดลงที่ขอบสนาม';var t=titan342(s.level,x,y,s.skills);r.troops.push(t);r.titanUsed342=true;r.deployed++;r.phase='battle';return '';};
Titan342.make=titan342;Titan342.cast=titanCast342;Titan342.tick=titanTick342;Titan342.blocked=titanBlocked342;
