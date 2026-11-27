// 444 (owner 2026-11-27): the NOVA mech is always automatic, Clash-hero style — no joystick, no skill buttons,
// no "control mech". Tapping it in battle does nothing (taps deploy troops); at home it opens the mech window.
// It also no longer dithers in place: it commits to a route, and if it makes no progress toward its target it
// cuts through what is in front, leaps over it, or picks another target.

// ---------- no player control ----------
selectTitan342=(function(inner){return function(t){if(t){t.manual342=false;t=null;}return inner.call(this,t);};})(selectTitan342);
Game.titanControl356=function(){Game.titan342();};
Game.titanSkill342=function(){};
mechTap412=function(t){if(t){t.manual342=false;}Game.titan342();};
(function(){var st=document.createElement('style');st.id='auto444';st.textContent='#titanControls342,#mechTap412{display:none!important}';document.head.appendChild(st);})();

// ---------- unstick ----------
function auto444Slash(scene,t,b){
 t.aim=t.heading=Math.atan2(b.y-t.y,b.x-t.x);t.cool=1.8;t.action342='SwordSlash';t.actionTime342=1.1;t.actionSeq342=(t.actionSeq342||0)+1;
 t.pending342={id:'slash',remaining:.42,angle:t.aim,x:b.x,y:b.y};t.blocked437=0;
 if(scene.fx)scene.fx.push({weapon:'titan342',skill342:'slash',x:t.x,y:t.y,tx:b.x,ty:b.y,angle:t.aim,life:1.1,maxLife:1.1,radius:2.8,color:'#62eaff'});
}
function auto444Unstick(scene,t,target){
 var toward=Math.atan2(target.y-t.y,target.x-t.x),best=null,bd=1e9;
 // 1) the building standing between the mech and its target (walls included): cut through it
 (scene.buildings||[]).forEach(function(b){if(!(b.hp>0)||trap278(b)&&!b.revealed278)return;var d=Math.hypot(b.x-t.x,b.y-t.y);if(d>2.6)return;
  var off=Math.abs(Math.atan2(Math.sin(Math.atan2(b.y-t.y,b.x-t.x)-toward),Math.cos(Math.atan2(b.y-t.y,b.x-t.x)-toward)));if(off>1.2)return;
  var score=d+off;if(score<bd){bd=score;best=b;}});
 if(best&&t.cool<=0){t.breach443=best;auto444Slash(scene,t,best);return 'cut';}
 if(best){t.breach443=best;return 'wait';}
 // 2) nothing to cut: leap toward the target
 if(!t.jump345&&!(t.jumpCooldown345>0)&&titanJump345(scene,t,Math.cos(toward),Math.sin(toward)))return 'jump';
 // 3) still stuck: give up on this target for a while
 t.skip444={b:target,left:6};t.aimTarget=null;t.searchIn443=0;t.breach443=null;t.route=[];t.pathAge=0;return 'retarget';
}
var target444=titanTarget443;
titanTarget443=function(scene,t,dt){
 if(t.skip444){t.skip444.left-=dt;if(t.skip444.left<=0)t.skip444=null;}
 var skip=t.skip444&&t.skip444.b;
 // Clash-hero style: once a building is chosen, stay on it until it falls (re-picking the nearest every 0.25 s made it turn back and forth)
 var prior=t.aimTarget;
 if(!(t.breach443&&t.breach443.hp>0)&&prior&&prior!==skip&&prior.hp>0&&prior.type&&prior.type!=='wall'&&!scene.defenders&&scene.troops&&scene.troops.indexOf(t)>=0&&(scene.buildings||[]).indexOf(prior)>=0)return prior;
 if(!skip)return target444.apply(this,arguments);
 var keep=skip.hp;skip.hp=0;try{t.searchIn443=0;if(t.aimTarget===skip)t.aimTarget=null;if(t.breach443===skip)t.breach443=null;var got=target444.apply(this,arguments);}finally{skip.hp=keep;}
 return got||skip;
};
var tick444=titanTick342;
titanTick342=function(scene,t,dt){
 if(t&&t.manual342&&!scene.home355)t.manual342=false;
 var out=tick444.apply(this,arguments);
 if(!t||scene.home355||!(t.hp>0)||t.manual342)return out;
 // (engine.js: replans every 2.5 s, at once when the route runs out)
 var target=t.breach443&&t.breach443.hp>0?t.breach443:t.aimTarget;
 if(!target||!(target.hp>0)||t.pending342||t.jump345||t.stun>0){t.watch444=0;t.watchD444=undefined;t.watchX444=t.x;t.watchY444=t.y;return out;}
 var d=Math.hypot(target.x-t.x,target.y-t.y);
 // progress check every 1.5 s: closer to the target, moved, or damaged it — otherwise unstick
 if(t.watchT444!==target){var same=t.watchT444&&t.watchX444!==undefined;t.watchT444=target;t.watchD444=d;t.watchHp444=target.hp;if(!same){t.watch444=0;t.watchX444=t.x;t.watchY444=t.y;}return out;}
 t.watch444=(t.watch444||0)+dt;
 if(t.watch444>=1.5){
  var closer=(t.watchD444===undefined?1:t.watchD444-d),hurt=t.watchHp444-target.hp,moved=Math.hypot(t.x-t.watchX444,t.y-t.watchY444);
  t.watch444=0;t.watchD444=d;t.watchHp444=target.hp;t.watchX444=t.x;t.watchY444=t.y;
  if((closer<.3||moved<.3)&&hurt<=0&&d>2.2)t.unstuck444=auto444Unstick(scene,t,target);
 }
 return out;
};

// ---------- battle wording ----------
(function(){var old=toast;toast=function(m){if(typeof m==='string'&&m.indexOf('แตะตัวหุ่นเพื่อบังคับเอง')>=0)m='หุ่นออกสู้แล้ว • บุกอัตโนมัติ';else if(typeof m==='string'&&m.indexOf('Tap it for manual control')>=0)m='Mech deployed • fights automatically';return old.apply(this,arguments.length>1?[m].concat([].slice.call(arguments,1)):[m]);};})();
