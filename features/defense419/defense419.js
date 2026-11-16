// 419: base defense waves are attacked by real troops from the game, not the old aliens.
// The attackers are the same unit types a player at your HQ level can build (same stats and
// research level as yours), and the wave is sized from your own army capacity, so the fight is
// even. Defense wins pay resources only (no NOVA). The defense garrison window is rebuilt:
// pick your own trained troops to station, up to the garrison capacity.

// ---------- who may attack: units a player at this HQ level could train ----------
function foeRoster419(e){
 var hq=Math.max(1,e.hq?e.hq():1),out=[];
 U.forEach(function(u,k){
  if(!u||u.stub412)return;
  if(u.z410>0&&hq<(typeof ZHQ410!=='undefined'?ZHQ410:7))return;
  if(u.tech&&(hq<2||u.tech>hq))return;
  var br=typeof branch278==='function'?branch278(k):'camp',need=B[br]&&B[br].require||1;if(need>hq)return;
  out.push(k);});
 return out.length?out:[0];
}
function foeBudget419(e,w){
 var cap=(e.capacity?e.capacity():20)+(e.airCapacity277?e.airCapacity277():0);
 var f=Math.min(1.1,.3+.06*(w-1));return Math.max(6,Math.round(cap*f));
}
// names for the wave report (the 393 report reads ROLES393)
function foeKey419(k){var key='u'+k;if(!ROLES393[key]){var n=U[k].name;ROLES393[key]={hp:1,dmg:1,spd:1,cost:U[k].space,name:[n,n]};}return key;}

plan393=function(d){
 var w=d.wave||1,R=rng393((Date.now()&0xffffff)^(w*977)),eng=d.engine419||foeEngine419||E,roster=foeRoster419(eng),budget=foeBudget419(eng,w),list=[];
 var plan=PLANS393[Math.floor(R()*PLANS393.length)],mut=w>=3&&R()<.6?MUTS393[Math.floor(R()*MUTS393.length)]:null;
 var fav=roster[Math.floor(R()*roster.length)],best=roster.slice().sort(function(a,b){return U[b].space-U[a].space;})[0];
 var healers=roster.filter(function(k){return U[k].weapon==='heal';}),fighters=roster.filter(function(k){return U[k].weapon!=='heal';});if(!fighters.length)fighters=[0];
 if(w>=5&&w%5===0&&U[best].space<=budget){list.push(best);budget-=U[best].space;}
 var guard=0;while(budget>0&&guard++<400){
  var pool=healers.length&&R()<.1?healers:fighters,k=R()<.4&&U[fav].weapon!=='heal'?fav:pool[Math.floor(R()*pool.length)];
  if(U[k].space>budget){var fit=fighters.filter(function(q){return U[q].space<=budget;});if(!fit.length)break;k=fit[Math.floor(R()*fit.length)];}
  list.push(k);budget-=U[k].space;}
 for(var i=list.length-1;i>0;i--){var j=Math.floor(R()*(i+1)),t=list[i];list[i]=list[j];list[j]=t;}
 var sides=plan[0]==='one'||plan[0]==='burst'?[Math.floor(R()*4)]:plan[0]==='two'?[0,1,2,3].sort(function(){return R()-.5;}).slice(0,2):[0,1,2,3];
 var edge=(d.mapSize||22)-1,spots=sides.map(function(){return 3+Math.floor(R()*(edge-5));}),t=1,out=[];
 list.forEach(function(kind,i){var s=sides[i%sides.length],along=spots[i%sides.length]+(R()-.5)*5;along=Math.max(2,Math.min(edge-2,along));
  out.push({kind:kind,role:foeKey419(kind),at:t,x:s===0?0:s===1?edge:along,y:s===2?0:s===3?edge:along});
  t+=plan[0]==='burst'?(i%6===5?6:.35):plan[0]==='trickle'?1.5:plan[0]==='all'?.8:1;});
 return {queue:out,time:0,plan:plan,mut:mut,sides:sides,list:out.map(function(s){return s.role;})};
};
spawn393=function(d,s,mut){
 if(s.kind===undefined)return;
 var eng=d.engine419||foeEngine419||E,res=eng.d&&eng.d.research||{},u=U[s.kind],boss=s.boss419;
 var hp=u.hp*(1+(res.armor||0)*.1),dmg=u.damage*(1+(res.weapon||0)*.1),spd=u.speed;
 if(mut==='armor')hp*=1.3;if(mut==='rage')spd*=1.25;if(mut==='power')dmg*=1.25;
 var e={id:5000+d.enemies.length,kind:s.kind,foe419:true,x:s.x,y:s.y,hp:hp,max:hp,damage:dmg,speed:spd,knockbackMass274:Math.max(1,u.space),cool:.5,route:[],heading:Math.atan2(d.mapSize/2-s.y,d.mapSize/2-s.x)};
 if(mut==='regen')e.regen393=true;
 d.enemies.push(e);d.fx.push({x:e.x,y:e.y,tx:e.x,ty:e.y,weapon:'warp',life:.45,maxLife:.45,color:'#ff6a5a'});
};
var startFoe419=Engine.prototype.startDefense;
var foeEngine419=null;
Engine.prototype.startDefense=function(){foeEngine419=this;var err;try{err=startFoe419.apply(this,arguments);}finally{foeEngine419=null;}if(!err&&this.defense)this.defense.engine419=this;return err;};

// ---------- the attackers fight like the real troops ----------
// Real buildings first (never walls) - the nearest one there is a way to.
// Only when every building is sealed off does it break the wall that stands in the shortest way.
function pickFoeTarget419(e,u,bs,range,max,air){
 e.route=[];var real=bs.filter(function(b){return b.type!=='wall'&&canDamage285(b,e,u.weapon);}).sort(function(a,b){return dist(e,a)-dist(e,b);});
 if(!real.length)return null;
 if(air){e.targetId='b'+real[0].id;e.route=[{x:real[0].x,y:real[0].y}];return real[0];}
 var best=null,bestLen=1e9;
 for(var i=0;i<real.length&&i<6;i++){var rt=route(e,real[i],bs,range,max);if(rt!==null&&rt.length<bestLen){best=real[i];bestLen=rt.length;e.route=rt;}}
 if(best){e.targetId='b'+best.id;e.pathAge=.65;e.wallAge419=0;return best;}
 var goal=real[0],walls=bs.filter(function(b){return b.type==='wall';}),wall=null,score=1e9;
 walls.forEach(function(w){var sc=dist(e,w)+dist(w,goal)*1.4;if(sc<score){var rt=route(e,w,bs,Math.max(1.05,Math.min(range,1.6)),max);if(rt!==null){score=sc;wall=w;e.route=rt;}}});
 if(!wall)return null;e.targetId='b'+wall.id;e.pathAge=.65;e.wallAge419=2;return wall;
}
function foeTick419(eng,d,dt){
 var bs=d.buildings.filter(function(b){return b.hp>0&&!trap278(b);}),max=(d.mapSize||22)-1,live=d.enemies.filter(function(e){return e.hp>0;});
 d.enemies.forEach(function(e){
  if(!e.foe419||e.hp<=0||e.stun>0)return;var u=U[e.kind],air=!!u.air;e.cool-=dt;e.pathAge=(e.pathAge||0)-dt;
  if(u.weapon==='heal'){var friend=live.filter(function(o){return o!==e&&o.hp<o.max;}).sort(function(a,b){return dist(e,a)-dist(e,b);})[0];
   var lead=friend||live.filter(function(o){return o!==e;}).sort(function(a,b){return dist(e,a)-dist(e,b);})[0];if(!lead){e.moving=false;return;}
   if(friend&&dist(e,friend)<=u.range){e.moving=false;e.aimTarget=friend;if(e.cool<=0){friend.hp=Math.min(friend.max,friend.hp+e.damage);d.fx.push(weaponFX(e,friend,'heal'));e.cool=u.rate;e.recoil=.18;}return;}
   var hl=dist(e,lead);if(hl>1.2){var st=Math.min(hl-1.1,u.speed*dt);e.x+=(lead.x-e.x)/hl*st;e.y+=(lead.y-e.y)/hl*st;e.moving=true;e.heading=Math.atan2(lead.y-e.y,lead.x-e.x);}else e.moving=false;return;}
  var range=Math.max(1.05,Math.min(u.range,4.6)),target=null;
  var defender=(d.defenders||[]).filter(function(t){return t.hp>0&&!t.builder&&canDamage285(t,e,u.weapon)&&dist(e,t)<Math.max(3,range+1);}).sort(function(a,b){return dist(e,a)-dist(e,b);})[0];
  if(defender){if(dist(e,defender)<=range)e.route=[];else if(e.pathAge<=0||e.targetId!=='d'+defender.id){e.route=air?[{x:defender.x,y:defender.y}]:route(e,defender,bs,range,max);e.pathAge=.6;}
   if(e.route!==null){target=defender;e.targetId='d'+defender.id;}}
  if(!target){target=bs.find(function(b){return 'b'+b.id===e.targetId;});
   // a wall is only a stop-gap: look again every so often for an open way to a real building
   if(target&&target.type==='wall'&&(e.wallAge419=(e.wallAge419||0)-dt)<=0)target=null;
   if(target&&!air&&(e.pathAge<=0||!e.route)){e.route=route(e,target,bs,range,max);e.pathAge=.65;if(e.route===null)target=null;}
   if(!target)target=pickFoeTarget419(e,u,bs,range,max,air);}
  if(!target){e.moving=false;return;}e.aimTarget=target;
  var dd=dist(e,target);
  if(dd<=range+.05){e.moving=false;e.aim=Math.atan2(target.y-e.y,target.x-e.x);
   if(e.cool<=0){hit(d,target,e.damage,e,u.weapon);
    if(u.splash)bs.forEach(function(b){if(b!==target&&dist(b,target)<=u.splash)hit(d,b,e.damage*.5,e,u.weapon);});
    d.fx.push(weaponFX(e,target,u.weapon||'cannon'));e.cool=u.rate;e.recoil=.18;}return;}
  if(air&&(!e.route||!e.route.length))e.route=[{x:target.x,y:target.y}];
  var dest=e.route&&e.route[0];if(dest){var len=dist(e,dest),step=Math.min(Math.max(0,air?len-range*.9:len),e.speed*dt);if(len>1e-6){e.x+=(dest.x-e.x)/len*step;e.y+=(dest.y-e.y)/len*step;e.heading=Math.atan2(dest.y-e.y,dest.x-e.x);}e.moving=step>1e-4;if(!air&&step>=len)e.route.shift();}else e.moving=false;
 });
}
var foeDepth419=0;
function wrapFoe419(prev){return function(dt){
 var d=this.defense;if(foeDepth419||!d||d.result)return prev.apply(this,arguments);
 // time ran out and the HQ still stands: the defense held
 if(d.time-dt<=0&&d.buildings.some(function(b){return b.type==='hq'&&b.hp>0;})){d.time=0;this.finishDefense(true);return;}
 foeDepth419++;var saved=[];
 try{d.enemies.forEach(function(e){if(e.foe419){saved.push([e,e.stun||0]);e.stun=1e9;}});
  var out=prev.apply(this,arguments);
 }finally{saved.forEach(function(s){s[0].stun=Math.max(0,s[1]-dt);});foeDepth419--;}
 if(!d.result){foeTick419(this,d,dt);d.enemies.forEach(function(e){if(e.foe419)e.recoil=Math.max(0,(e.recoil||0)-dt);});}
 return out;};}
Engine.prototype.tickDefense=wrapFoe419(Engine.prototype.tickDefense);
if(E&&Object.prototype.hasOwnProperty.call(E,'tickDefense'))E.tickDefense=wrapFoe419(E.tickDefense);

// attackers look like the real troops, with a red team ring
var drawFoe419=drawFighter;
drawFighter=function(t,enemy){
 if(!(t&&t.foe419))return drawFoe419(t,enemy);
 if(t.hp>0){var p=point(t.x,t.y),z=zoom,air=U[t.kind]&&U[t.kind].air;ctx.save();ctx.strokeStyle='rgba(255,70,60,.9)';ctx.fillStyle='rgba(255,60,50,.22)';ctx.lineWidth=2*z;ctx.beginPath();ctx.ellipse(p.x,p.y+2*z,(10+(U[t.kind].space>4?5:0))*z,(5+(U[t.kind].space>4?2:0))*z,0,0,7);ctx.fill();ctx.stroke();ctx.restore();}
 return drawFoe419(t,false);
};

// ---------- defense pays resources only, never NOVA ----------
var finishFoe419=Engine.prototype.finishDefense;
Engine.prototype.finishDefense=function(){var d=this.defense,before=this.d.gems,out=finishFoe419.apply(this,arguments);
 if(d&&d.result&&this.d.gems>before){this.d.gems=before;d.result.gems=0;this.save();}else if(d&&d.result)d.result.gems=0;return out;};

// ---------- garrison window: choose your own troops, up to capacity ----------
function garrisonHTML419(){
 var cap=E.garrisonCapacity(),used=spaces(E.d.garrison),pct=cap?Math.min(100,used/cap*100):0,has=E.d.buildings.some(function(b){return b.type==='garrison'&&active(b);});
 var cards=U.map(function(u,i){if(!u||u.stub412)return'';var ready=E.d.army[i]||0,inn=E.d.garrison[i]||0;if(!ready&&!inn)return'';
  var full=used+u.space>cap;
  var off=!ready||full;return '<div class="g419card'+(inn?' in':'')+(off&&!inn?' off':'')+'"><button class="g419add" onclick="Game.station419('+i+',1)">'+unitPortrait393(i,'g419pic')+'<b class="g419n">'+(inn?'×'+inn:'')+'</b><small>'+u.name+'</small><em>'+mt251('พร้อม ','ready ')+ready+' · '+u.space+mt251(' ช่อง',' sp')+'</em></button>'+(inn?'<button class="g419rem" onclick="Game.station419('+i+',-1)">−</button>':'')+'</div>';}).join('');
 return '<h2>'+mt251('กองกำลังป้องกันฐาน','Base garrison')+'</h2><div class="g419">'+
  '<p class="g419tip">'+mt251('เลือกทหารที่ฝึกแล้วเข้าประจำการ • แตะการ์ดเพื่อใส่ • แตะ − เพื่อถอน • ช่วยป้องกันเมื่อถูกบุก แล้วกลับมาครบหลังจบ','Pick trained troops to station • tap a card to add • − to remove • they defend when you are attacked and come back after')+'</p>'+
  '<div class="g419bar"><span style="width:'+pct.toFixed(1)+'%"></span><b>'+used+' / '+cap+'</b></div>'+
  (has?'':'<p class="g419warn">'+mt251('สร้างกองบัญชาการป้องกันฐานก่อน','Build the Defense HQ first')+'</p>')+
  '<div class="g419grid">'+(cards||'<p class="g419warn">'+mt251('ยังไม่มีทหาร ฝึกทหารที่โรงฝึกก่อน','No troops yet - train some first')+'</p>')+'</div>'+
  '<div class="g419row"><button class="green" onclick="Game.fill419()">'+mt251('เติมเต็มอัตโนมัติ','Auto fill')+'</button><button onclick="Game.clear419()">'+mt251('ถอนทั้งหมด','Remove all')+'</button></div></div>';
}
Game.garrison=function(){open(garrisonHTML419());};
Game.station419=function(i,delta){var err=E.station(i,delta);if(err)toast(err);Game.garrison();hud();};
Game.fill419=function(){var guard=0,order=U.map(function(u,i){return i;}).filter(function(i){return U[i]&&!U[i].stub412&&U[i].weapon!=='heal';}).sort(function(a,b){return U[b].damage*U[b].hp-U[a].damage*U[a].hp;});
 var moved=true;while(moved&&guard++<300){moved=false;for(var j=0;j<order.length;j++){var i=order[j];if((E.d.army[i]||0)>0&&spaces(E.d.garrison)+U[i].space<=E.garrisonCapacity()&&!E.station(i,1)){moved=true;break;}}}
 Game.garrison();hud();};
Game.clear419=function(){U.forEach(function(u,i){var g=0;while((E.d.garrison[i]||0)>0&&g++<200&&!E.station(i,-1));});Game.garrison();hud();};
(function(){var st=document.createElement('style');st.id='g419css';st.textContent=
 '.g419{display:flex;flex-direction:column;gap:7px}.g419tip{margin:0;font-size:11.5px;line-height:1.35;color:#3a5a78}'+
 '.g419bar{position:relative;height:20px;border-radius:10px;background:#cfe2f2;border:2px solid #8fb6d6;overflow:hidden}.g419bar span{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(#ffd96a,#f0a326)}.g419bar b{position:relative;display:block;text-align:center;font-size:12px;line-height:16px;color:#3b2a08}'+
 '.g419grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;max-height:52vh;overflow:auto}'+
 '.g419card{position:relative;min-width:0}.g419card.off .g419add{opacity:.5}'+'.g419add{width:100%;min-height:0;padding:4px 2px 5px;border-radius:12px;display:flex;flex-direction:column;align-items:center;gap:1px;background:linear-gradient(#f6fbff,#d9eaf8);border:2px solid #9ec3e6;border-bottom-width:4px;color:#1d3d5c;text-shadow:none;box-shadow:none}'+
 '.g419card.in .g419add{border-color:#f0a326;background:linear-gradient(#fff6d6,#ffe39a)}.g419add .g419pic{width:44px;height:44px}.g419add small{font-size:10px;line-height:1.1;max-width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.g419add em{font-style:normal;font-size:9px;color:#5b7690}'+
 '.g419n{position:absolute;left:5px;top:3px;font-size:13px;color:#fff;text-shadow:0 1px 2px #000,0 0 3px #000}'+
 '.g419rem{position:absolute;right:2px;top:2px;min-height:0;width:24px;height:24px;padding:0;border-radius:50%;font-size:16px;line-height:18px;background:linear-gradient(#ff8a7a,#e04434);border:2px solid #fff;border-bottom-width:2px;box-shadow:0 1px 3px #0005}'+
 '.g419row{display:flex;gap:6px}.g419row button{flex:1;min-height:40px;font-size:13px}.g419warn{margin:0;font-size:12px;color:#c0392b;grid-column:1/-1;text-align:center}';
 document.head.appendChild(st);})();
