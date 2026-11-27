// Run the actual game entry points with a controlled Android bridge and cloud latency.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const feature = fs.readFileSync('features/rewardVideo/ready.js','utf8');
const game = fs.readFileSync('game.js','utf8');
const owner = '10000000-0000-4000-8000-000000000001';
function boot(legacy=false) {
 const calls=[], shows=[], timers=new Map(), storage=new Map(), nodes=new Map();
 let sequence=0, buttons=[], cached=false, cancels=0;
 const ctx = new Proxy({measureText:t=>({width:String(t).length*8})},{get:(o,k)=>o[k]||(()=>{})});
 function element(id) {
  if(!nodes.has(id)) nodes.set(id,{hidden:false,style:{},innerHTML:'',classList:{add(){},remove(){},toggle(){}},addEventListener(){},setAttribute(){},removeAttribute(){},getAttribute(){return null;},getContext:()=>ctx,getBoundingClientRect:()=>({width:420,height:800}),querySelectorAll:()=>buttons});
  return nodes.get(id);
 }
 const s={crypto:require('node:crypto').webcrypto,Math,Date,performance:{now:()=>0},Uint8Array,
  setTimeout(fn,ms){timers.set(++sequence,{fn,ms});return sequence;},clearTimeout(id){timers.delete(id);},
  requestAnimationFrame(){},Image:class{},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
  addEventListener(){},document:{hidden:false,getElementById:element,addEventListener(){}},
  NovaCloud:{hasAccount:()=>true,warAvailable:()=>true,available:()=>true,load(){},warRequest:(action,json,id)=>calls.push({action,p:JSON.parse(json),id})},
  NovaAds:{rewardVerified:(who,id)=>shows.push({who,id}),cancelRewardLoad254:()=>cancels++,rewardProblem254:()=>'',acknowledgeReward(){}}
 };
 if(!legacy)s.NovaAds.rewardCached=()=>cached;
 vm.createContext(s);
 const end=game.lastIndexOf('})(typeof globalThis');
 vm.runInContext(game.slice(0,end)+feature+';root.qaVideo={E,select:id=>selected=id,setWallet:(v)=>{testWallet=v;checkinState233=v.checkin233;liveAds400=true;warBusy=false;},refresh:()=>treasury()};'+game.slice(end),s);
 s.qaVideo.E.d.onlineCrystal={owner};
 const day='2026-11-28', wallet={owner,admob230:true,checkin233:{day,claimed:false,streak:0,next_reset:new Date(Date.now()+600000).toISOString()}};
 s.qaVideo.setWallet(wallet);
 const b=s.qaVideo.E.d.buildings[0];b.started=Date.now();b.until=Date.now()+900000;s.qaVideo.select(b.id);
 function run(ms){const entries=[...timers].filter(([,t])=>t.ms===ms);for(const [id,t] of entries){if(timers.delete(id))t.fn();}}
 function open(kind){
  const handler=kind==='checkin'?'Game.checkin()':"Game.speedAd264('building','"+b.id+"')";
  const attrs=new Map([['onclick',handler]]);
  const button={disabled:false,textContent:'Watch',innerHTML:'Watch',hasAttribute:k=>attrs.has(k),getAttribute:k=>attrs.get(k),setAttribute:(k,v)=>attrs.set(k,v),removeAttribute:k=>attrs.delete(k)};
  buttons=[button];
  if(kind==='checkin')s.Game.openDaily340();else s.Game.speedConfirm();
  assert(element('modal').innerHTML.includes(handler));
  run(0);
  return button;
 }
 function reply(q,data){s.novaCloudEvent('war',{action:q.action,request_id:q.id,data});}
 function prepared(kind,who=owner){
  const q=calls.filter(x=>x.id.startsWith('warm-ad-')).at(-1);assert(q);
  const r={id:q.p.request_id,expires_at:new Date(Date.now()+600000).toISOString(),kind:'checkin',day,provider:'admob',target:q.p.target,seconds:900,claimed:false};
  reply(q,kind==='checkin'?{...wallet,owner:who,ad_reward:r}:{owner:who,speed264:true,receipt:r});run(0);
 }
 return {s,calls,shows,run,open,prepared,reply,b,cancels:()=>cancels,cached:v=>{cached=v;run(1000);},tap:kind=>kind==='checkin'?s.Game.checkin():s.Game.speedAd264('building',String(b.id))};
}
for(const kind of ['checkin','speed']){
 const g=boot(),button=g.open(kind);
 assert(button.disabled);g.tap(kind);assert.equal(g.shows.length,0);
 g.prepared(kind);assert(button.disabled);assert.equal(g.shows.length,0);
 g.cached(true);assert(!button.disabled);
 const before=g.calls.length;
 g.tap(kind);assert.equal(g.shows.length,1);assert.equal(g.calls.length,before,'no server round trip after a ready tap');
 g.tap(kind);assert.equal(g.shows.length,1,'double tap must not open a second video');
 assert.equal(g.calls.length,before);
 assert.equal(g.shows[0].who,owner);
 const expected=g.calls.find(c=>c.id.startsWith('warm-ad-')).p.request_id;
 assert.equal(g.shows[0].id,expected);
 const invalid=boot();invalid.open(kind);invalid.cached(true);invalid.prepared(kind,'another-account');invalid.tap(kind);assert.equal(invalid.shows.length,0);
}
const older=boot(true);older.open('speed');older.prepared('speed');older.tap('speed');older.s.novaRewardStatus('loading');
assert.equal(older.cancels(),1);older.s.novaRewardStatus('ready');assert.equal(older.shows.length,1);
console.log('PASS ready video: check-in and speed-up preflight, cold cache, warm single-tap, wrong owner, legacy cancellation');
