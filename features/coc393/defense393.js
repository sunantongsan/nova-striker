// 393: base defense waves with random bot abilities. Every wave rolls a battle plan: which sides
// the bots come from, how they pace their spawns, a wave-wide mutation, and a mix of roles that
// unlock with the wave number (runners, brutes, shield bearers, healers, suicide sappers, and a
// boss every fifth wave). Stats are built on the existing balanced enemy numbers.
var ROLES393={
 grunt:{hp:1,dmg:1,spd:1,cost:1,name:['ทหารต่างดาว','Grunt']},
 runner:{hp:.55,dmg:.8,spd:1.7,cost:.7,from:2,name:['นักวิ่ง','Runner']},
 brute:{hp:2.6,dmg:1.8,spd:.72,cost:2.5,mass:2.5,scale:1.35,from:3,name:['ยักษ์','Brute']},
 sapper:{hp:.7,dmg:.6,spd:1.25,cost:1.5,from:4,name:['ระเบิดพลีชีพ','Sapper']},
 shield:{hp:1.1,dmg:.9,spd:.9,cost:2,shield:.9,from:5,name:['ถือโล่','Shield bearer']},
 healer:{hp:.8,dmg:.4,spd:1,cost:1.5,from:6,name:['หมอต่างดาว','Healer']},
 boss:{hp:8,dmg:3,spd:.6,cost:6,mass:5,scale:1.75,name:['บอสยักษ์','Boss']}};
var PLANS393=[['one',['บุกทางเดียว','Single-side push']],['two',['แบ่งสองทาง','Pincer']],['all',['ล้อมทุกทิศ','Surround']],['burst',['บุกเป็นระลอก','Burst waves']],['trickle',['ทยอยกดดัน','Steady pressure']]];
var MUTS393=[['armor',['เกราะหนา +30% พลังชีวิต','Thick armor +30% HP']],['rage',['คลั่ง +25% ความเร็ว','Frenzy +25% speed']],['regen',['ฟื้นฟูตัวเอง','Regeneration']],['power',['อาวุธแรง +25% ดาเมจ','Heavy weapons +25% damage']]];
var SIDES393=[['ตะวันตก','west'],['ตะวันออก','east'],['เหนือ','north'],['ใต้','south']];
function plan393(d){
 var w=d.wave||1,R=rng393((Date.now()&0xffffff)^(w*977)),budget=Math.min(36,7+w*2),list=[],plan=PLANS393[Math.floor(R()*PLANS393.length)],mut=w>=3&&R()<.7?MUTS393[Math.floor(R()*MUTS393.length)]:null;
 var unlocked=Object.keys(ROLES393).filter(function(k){var r=ROLES393[k];return k!=='boss'&&(!r.from||w>=r.from);}),fav=unlocked[Math.floor(R()*unlocked.length)];
 if(w>=5&&w%5===0){list.push('boss');budget-=ROLES393.boss.cost;}
 while(budget>.6){var k=R()<.35?fav:unlocked[Math.floor(R()*unlocked.length)];if(ROLES393[k].cost>budget+.3)k='grunt';list.push(k);budget-=ROLES393[k].cost;}
 for(var i=list.length-1;i>0;i--){var j=Math.floor(R()*(i+1)),t=list[i];list[i]=list[j];list[j]=t;}
 var sides=plan[0]==='one'||plan[0]==='burst'?[Math.floor(R()*4)]:plan[0]==='two'?[0,1,2,3].sort(function(){return R()-.5;}).slice(0,2):[0,1,2,3];
 var edge=(d.mapSize||22)-1,spots=sides.map(function(){return 3+Math.floor(R()*(edge-5));}),t=1,out=[];
 list.forEach(function(role,i){var s=sides[i%sides.length],along=spots[i%sides.length]+(R()-.5)*5;along=Math.max(2,Math.min(edge-2,along));
  out.push({role:role,at:t,x:s===0?0:s===1?edge:along,y:s===2?0:s===3?edge:along});
  t+=plan[0]==='burst'?(i%6===5?7:.35):plan[0]==='trickle'?1.7:plan[0]==='all'?.9:1.15;});
 return {queue:out,time:0,plan:plan,mut:mut,sides:sides,list:list};
}
function spawn393(d,s,mut){
 var r=ROLES393[s.role],hp=(d.enemyHP274||100+d.wave*22)*r.hp,dmg=(d.enemyDamage274||16+d.wave*2)*r.dmg,spd=(d.enemySpeed274||.9)*r.spd;
 if(mut==='armor')hp*=1.3;if(mut==='rage')spd*=1.25;if(mut==='power')dmg*=1.25;
 var e={x:s.x,y:s.y,hp:hp,max:hp,damage:Math.round(dmg),speed:Math.min(2.6,spd),knockbackMass274:(d.enemyMass274||4)*(r.mass||1),cool:0,role393:s.role};
 if(r.shield)e.shield393=e.shieldMax393=hp*r.shield;if(mut==='regen')e.regen393=true;
 d.enemies.push(e);d.fx.push({x:e.x,y:e.y,tx:e.x,ty:e.y,weapon:'warp',life:.45,maxLife:.45,color:s.role==='boss'?'#ff7a5a':'#c58bff'});
}
var startDefense393=Engine.prototype.startDefense;
Engine.prototype.startDefense=function(){var err=startDefense393.apply(this,arguments);if(err||!this.defense)return err;var d=this.defense;d.plan393=plan393(d);d.remaining=d.plan393.queue.length;d.spawn=1e9;return err;};
var tickDefense393=Engine.prototype.tickDefense;
Engine.prototype.tickDefense=function(dt){
 var d=this.defense;if(!d||d.result||!d.plan393)return tickDefense393.apply(this,arguments);
 var p=d.plan393;p.time+=dt;d.spawn=1e9;
 while(p.queue.length&&p.queue[0].at<=p.time){spawn393(d,p.queue.shift(),p.mut&&p.mut[0]);d.remaining=p.queue.length;}
 d.remaining=p.queue.length;
 var out=tickDefense393.apply(this,arguments);if(d.result)return out;
 var live=d.enemies.filter(function(e){return e.hp>0;});
 live.forEach(function(e){
  if(e.regen393&&e.hp<e.max)e.hp=Math.min(e.max,e.hp+e.max*.012*dt);
  if(e.role393==='healer'){e.heal393=(e.heal393||0)-dt;if(e.heal393<=0){var friend=live.filter(function(o){return o!==e&&o.hp<o.max&&dist(o,e)<2.4;}).sort(function(a,b){return a.hp/a.max-b.hp/b.max;})[0];if(friend){friend.hp=Math.min(friend.max,friend.hp+friend.max*.08);d.fx.push(weaponFX(e,friend,'heal'));}e.heal393=1;}}
  if(e.role393==='sapper'&&e.aimTarget&&e.aimTarget.type&&e.aimTarget.hp>0&&dist(e,e.aimTarget)<=1.25){
   var dmg=e.damage*9;d.buildings.forEach(function(b){if(b.hp>0&&!trap278(b)&&dist(b,e)<1.5)hit(d,b,dmg*(b===e.aimTarget?1:.5),e,'bomb');});
   d.fx.push({x:e.x,y:e.y,tx:e.x,ty:e.y,weapon:'impact',life:.8,maxLife:.8,color:'#ffb060',radius:44});e.hp=0;e.dead=1.2;}
 });
 return out;
};
// shield bearers soak damage on their energy shield first
var hit393=hit;hit=function(scene,target,damage,source,weapon){if(target&&target.shield393>0&&damage>0){var soak=Math.min(target.shield393,damage*.75);target.shield393-=soak;damage-=soak;}return hit393(scene,target,damage,source,weapon);};
var drawFighter393=drawFighter;
drawFighter=function(t,enemy){
 var r=t&&t.role393&&ROLES393[t.role393];if(!r||t.hp<=0&&!t.dead)return drawFighter393(t,enemy);
 var p=point(t.x,t.y),z=zoom,s=r.scale||1;
 ctx.save();if(s!==1){ctx.translate(p.x,p.y);ctx.scale(s,s);ctx.translate(-p.x,-p.y);}drawFighter393(t,enemy);ctx.restore();
 if(t.hp<=0)return;ctx.save();
 if(t.role393==='shield'&&t.shield393>0){ctx.globalAlpha=.25+.35*t.shield393/t.shieldMax393;ctx.strokeStyle='#7fe6ff';ctx.fillStyle='rgba(127,230,255,.18)';ctx.lineWidth=2*z;ctx.beginPath();ctx.ellipse(p.x,p.y-14*z,15*z,19*z,0,0,7);ctx.fill();ctx.stroke();}
 else if(t.role393==='healer'){ctx.fillStyle='#62e08a';ctx.strokeStyle='#fff';ctx.lineWidth=1.5*z;ctx.beginPath();ctx.arc(p.x+10*z,p.y-32*z,5.5*z,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.fillRect(p.x+7.5*z,p.y-33*z,5*z,2*z);ctx.fillRect(p.x+9*z,p.y-34.5*z,2*z,5*z);}
 else if(t.role393==='sapper'){var f=(Math.sin(Date.now()/90)+1)/2;ctx.fillStyle='#4a3a5c';ctx.beginPath();ctx.arc(p.x+9*z,p.y-20*z,5*z,0,7);ctx.fill();ctx.fillStyle=f>.5?'#ffdd55':'#ff7a3a';ctx.beginPath();ctx.arc(p.x+12*z,p.y-26*z,2.4*z,0,7);ctx.fill();drawNeeded=true;}
 else if(t.role393==='runner'){ctx.strokeStyle='rgba(255,236,140,.85)';ctx.lineWidth=1.6*z;for(var i=0;i<3;i++){ctx.beginPath();ctx.moveTo(p.x-10*z,p.y-8*z-i*5*z);ctx.lineTo(p.x-18*z,p.y-8*z-i*5*z);ctx.stroke();}}
 else if(t.role393==='brute'||t.role393==='boss'){ctx.strokeStyle=t.role393==='boss'?'#ff6a4a':'#ffb35a';ctx.lineWidth=2*z;ctx.globalAlpha=.75;ctx.beginPath();ctx.ellipse(p.x,p.y+1*z,15*s*z,6*s*z,0,0,7);ctx.stroke();if(t.role393==='boss'){ctx.globalAlpha=1;ctx.fillStyle='#ffd34a';ctx.beginPath();var cy=p.y-36*s*z;ctx.moveTo(p.x-8*z,cy);ctx.lineTo(p.x-8*z,cy-7*z);ctx.lineTo(p.x-4*z,cy-3*z);ctx.lineTo(p.x,cy-8*z);ctx.lineTo(p.x+4*z,cy-3*z);ctx.lineTo(p.x+8*z,cy-7*z);ctx.lineTo(p.x+8*z,cy);ctx.closePath();ctx.fill();}}
 ctx.restore();
};
// announce the rolled plan like a scouting report
var startDefenseUI393=Game.startDefense;
Game.startDefense=function(){startDefenseUI393.apply(this,arguments);var d=E.defense;if(screen!=='defense'||!d||!d.plan393)return;var p=d.plan393,tally={};p.list.forEach(function(k){tally[k]=(tally[k]||0)+1;});
 var who=Object.keys(tally).sort(function(a,b){return tally[b]-tally[a];}).map(function(k){return mt251(ROLES393[k].name[0],ROLES393[k].name[1])+' ×'+tally[k];}).join(' · ');
 var from=p.sides.length>=4?mt251('ทุกทิศ','all sides'):p.sides.map(function(s){return mt251(SIDES393[s][0],SIDES393[s][1]);}).join(' + ');
 toast(mt251('ระลอก ','Wave ')+d.wave+' · '+mt251(p.plan[1][0],p.plan[1][1])+' · '+mt251('มาจาก','from')+' '+from+(p.mut?' · '+mt251(p.mut[1][0],p.mut[1][1]):'')+'\n'+who);};
