// 420: resources can never become NaN again, and the game saves less often in the background.
// * Ore X / Ore Y / NOVA / Fluid Z are guarded on the save object: a non-number (NaN / Infinity) is refused, the
//   last good value stays, and the first bad write is recorded (d.nanTrace420) so it can be found later.
//   A value that is already broken is repaired once (last good value, else the full storage).
// * The background sync (every ~half second) writes the save at most every 5 seconds; every real action still
//   saves immediately. Render-only fields (turret facing, animation clocks) are no longer written to the save.
var RES420=['gold','power','gems','zfluid410'];
function capFor420(e,k){try{if(k==='gold')return e.resourceCapacity();if(k==='power')return e.resourceCapacity('power');if(k==='zfluid410')return e.zCapacity410?e.zCapacity410():0;}catch(x){}return 0;}
function trace420(d,k,v){try{var s=(new Error().stack||'').split('\n').slice(2,7).map(function(l){return l.trim().replace(/https?:\/\/[^)]*\//,'');}).join(' < ');
 if(!d.nanTrace420)d.nanTrace420={};d.nanTrace420[k]={at:Date.now(),v:String(v),stack:s.slice(0,600)};console.warn('Nova blocked bad '+k,v,s);}catch(e){}}
function guard420(e){
 var d=e&&e.d;if(!d||typeof d!=='object'||d.__g420===d)return;
 RES420.forEach(function(k){
  var desc=Object.getOwnPropertyDescriptor(d,k);if(desc&&desc.get)return;
  var v=d[k];
  if(typeof v==='number'&&!Number.isFinite(v)||v===null&&k!=='zfluid410'){
   var good=d.good420&&Number.isFinite(d.good420[k])?d.good420[k]:capFor420(e,k);trace420(d,k,v);v=Math.max(0,good||0);d.repaired420=(d.repaired420||0)+1;}
  Object.defineProperty(d,k,{enumerable:true,configurable:true,get:function(){return v;},set:function(x){if(typeof x==='number'&&!Number.isFinite(x)){trace420(d,k,x);return;}v=x;}});
 });
 Object.defineProperty(d,'__g420',{value:d,enumerable:false,configurable:true});
}
function remember420(d){if(!d)return;var g=d.good420||(d.good420={});RES420.forEach(function(k){if(Number.isFinite(d[k]))g[k]=d[k];});}
// render-only fields: never worth a save write
var VOLATILE420={view412:1,vt412:1,tips412:1,tipPx410:1,hz412:1,wz412:1,openAt392:1,open392:1,idleBase419:1,aimSeen419:1,aimAt419:1,muzzle352:1,renderKey352:1,lx3d:1,ly3d:1,odo3d:1,dir3d:1};
function replacer420(key,val){return VOLATILE420[key]?undefined:val;}
var lastWrite420=0,inSync420=0;
var save420=Engine.prototype.save;
Engine.prototype.save=function(){
 guard420(this);
 if(inSync420&&Date.now()-lastWrite420<5000)return true;
 try{var s=JSON.stringify(this.d,replacer420);if(s!==this.lastSaved215){this.storage.setItem('novaRTS1',s);this.lastSaved215=s;lastWrite420=Date.now();}this.saveFailed=false;remember420(this.d);return true;}
 catch(err){this.saveFailed=true;return false;}
};
var sync420=Engine.prototype.sync;
Engine.prototype.sync=function(){guard420(this);inSync420++;try{return sync420.apply(this,arguments);}finally{inSync420--;}};
// write right away when the app goes to the background
document.addEventListener('visibilitychange',function(){if(document.hidden)try{lastWrite420=0;var was=inSync420;inSync420=0;E.save();inSync420=was;}catch(e){}});
try{if(Array.isArray(E.d.nanRepair420)){E.d.nanRepair420.forEach(function(k){var g=E.d.good420&&Number.isFinite(E.d.good420[k])?E.d.good420[k]:capFor420(E,k);E.d[k]=Math.max(E.d[k]||0,g||0);});delete E.d.nanRepair420;E.d.repaired420=(E.d.repaired420||0)+1;}guard420(E);if(E.d.repaired420){var was=inSync420;inSync420=0;E.save();inSync420=was;setTimeout(function(){try{hud();}catch(e){}},0);}}catch(e){}
// online resource sync: missing numbers count as 0, never NaN
if(typeof syncCrystal==='function'){var syncCrystal420=syncCrystal;syncCrystal=function(d){if(d&&d.resources){['gold_delta','power_delta'].forEach(function(k){if(!Number.isFinite(+d.resources[k]))d.resources[k]=0;else d.resources[k]=+d.resources[k];});}
 if(E.d.raidDeltas){['gold_delta','power_delta'].forEach(function(k){if(!Number.isFinite(+E.d.raidDeltas[k]))E.d.raidDeltas[k]=0;});}return syncCrystal420.apply(this,arguments);};}
