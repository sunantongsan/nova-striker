// 419: the base feels alive when nothing is happening.
// - Sky Guard AA gun: slowly scans the sky left and right when it has no target.
// - Ground rocket battery (missile silo): at home it pops up now and then, sweeps around, then hides again.
// - Duck Colonel at home: when left alone it tosses its saber up and catches it, or performs a sword dance.
function idleNow419(){return Date.now();}
function aimMoved419(b,now){if(b.aim!==b.aimSeen419){var first=b.aimSeen419===undefined;b.aimSeen419=b.aim;if(!first)b.aimAt419=now;}return now-(b.aimAt419||0)>3000;}
function sweep419(b,now,span,period){var base=b.idleBase419;if(base===undefined)base=b.idleBase419=(b.aim===undefined?Math.PI*.75:b.aim);
 var s=(b.id||0)*1.37,t=now/period+s;return base+Math.sin(t)*span+Math.sin(t*2.3+1)*span*.25;}

// --- Sky Guard: scanning ---
if(typeof turn412==='function'){
 var turnIdle419=turn412;
 turn412=function(b){
  if(b&&b.type==='skyguard'&&b.hp!==0){var now=idleNow419(),idle=aimMoved419(b,now);
   if(idle){var real=b.aim;b.aim=sweep419(b,now,1.25,1900);try{turnIdle419(b);}finally{b.aim=real;}drawNeeded=true;return;}
   b.idleBase419=undefined;}
  return turnIdle419(b);
 };
}

// --- Rocket battery: pop up, look around, hide ---
if(typeof silo3dOpen392==='function'){
 var openIdle419=silo3dOpen392,dirIdle419=silo3dDir392;
 var siloIdle419=function(b){return screen==='home'&&b&&b.type==='missileturret'&&!b.constructing;};
 silo3dOpen392=function(b){
  if(!siloIdle419(b))return openIdle419(b);
  var now=idleNow419(),dt=Math.min(.1,Math.max(0,(now-(b.openAt392||now))/1000));b.openAt392=now;
  var cyc=((now/1000+(b.id||0)*3.7)%13),want=(typeof selected!=='undefined'&&selected===b.id)||cyc<8.5?1:0;
  b.open392=Math.max(0,Math.min(1,(b.open392||0)+(want?dt/.6:-dt/.9)));drawNeeded=true;return b.open392;
 };
 silo3dDir392=function(b){
  if(siloIdle419(b)){var n=silo3dMeta392.dirs,a=sweep419(b,idleNow419(),1.4,1500);return ((Math.round(a/(2*Math.PI/n))%n)+n)%n;}
  return dirIdle419(b);
 };
}

// --- Duck Colonel at home: saber toss / sword dance ---
var MECHIDLE419=[
 // toss: throw the saber up, catch it, finish with a slash
 [{act:'Sentinel',toss:true,ms:1500},{act:'SwordSlash',ms:1250},{act:'Sentinel',ms:300}],
 // sword dance
 [{act:'SwordSlash',ms:1250},{act:'SwordCombo',ms:1450},{act:'SwordSlash',ms:1250},{act:'Sentinel',ms:300}],
 // double toss
 [{act:'Sentinel',toss:true,ms:1500},{act:'Sentinel',toss:true,ms:1500},{act:'SwordCombo',ms:1450},{act:'Sentinel',ms:300}]
];
function mechIdleStop419(t){if(!t.idle419)return;if(t.action342===t.idle419.act)t.action342='Sentinel';t.toss419=0;t.idle419=null;}
function mechIdleTick419(t){
 var now=idleNow419(),ok=screen==='home'&&modal.style.display!=='flex'&&!t.resting347&&!t.building348&&!t.manual342&&!t.jump345&&!t.moving&&t.hp>0&&selectedTitan342!==t;
 if(!ok){mechIdleStop419(t);t.idleNext419=now+4000;return;}
 // someone else changed the pose (a tap, a control) - step aside
 if(t.idle419&&t.action342!==t.idle419.act){t.idle419=null;t.toss419=0;t.idleNext419=now+4000;return;}
 if(!t.idle419){if(t.action342&&t.action342!=='Sentinel')return;
  if(!t.idleNext419){t.idleNext419=now+2500;return;}if(now<t.idleNext419)return;
  var r=t.idleRoutine419=((t.idleRoutine419===undefined?-1:t.idleRoutine419)+1)%MECHIDLE419.length;
  t.idle419={steps:MECHIDLE419[r],i:-1,until:0,act:null};}
 var s=t.idle419;if(now<s.until)return;
 s.i++;var st=s.steps[s.i];
 if(!st){t.idle419=null;t.toss419=0;t.action342='Sentinel';t.idleNext419=now+5000+Math.random()*4000;return;}
 s.until=now+st.ms;s.act=st.act;t.action342=st.act;t.actionSeq342=(t.actionSeq342||0)+1;t.toss419=st.toss?now:0;
}
var tickIdle419=tickUI342;
tickUI342=function(dt){tickIdle419(dt);try{var ht=screen==='home'?homeTitan342():null;if(ht){mechIdleTick419(ht);drawNeeded=true;}}catch(e){}};
