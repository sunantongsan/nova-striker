// 390: periodic guide tips appear at real milestones, once per account, never during the first-play guide.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8');
function boot(data={}){
 const elements={},errors=[];
 const ctx=new Proxy({measureText:t=>({width:String(t).length*8}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
 const el=id=>elements[id]||(elements[id]={hidden:true,value:'',style:{},innerHTML:'',textContent:'',addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:420,height:800}),querySelectorAll:()=>[],setAttribute(){},getAttribute(){return null},removeAttribute(){}});
 const storage={getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v,removeItem:k=>delete data[k]};
 const s={navigator:{languages:['th-TH'],language:'th-TH'},console:{log(){},error:(...a)=>errors.push(a)},Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:()=>1,clearTimeout(){},Image:class{},localStorage:storage,document:{getElementById:el,addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame(){},location:{reload(){}},NovaCloud:{hasAccount:()=>false,available:()=>true,load(){}}};
 vm.createContext(s);vm.runInContext(source.replace('})(typeof globalThis!==','root.t390={e:E,home:()=>{document.getElementById("welcome").hidden=true;screen="home";guide288=null;modal.style.display="none";},tick:()=>{tipShownAt390=0;tipCheckAt390=0;tipTick390();},cur:()=>tipNow390&&tipNow390.id,unlocks:tipUnlocks390,done:()=>Game.tipDone390(),go:()=>Game.tipGo390(),guide:v=>{guide288=v;}};})(typeof globalThis!=='),s);
 return {s,el,errors,t:s.t390};
}
const a=boot({novaRTSIntro:'1',novaLanguage:'th'}),t=a.t,E=t.e,hq=()=>E.d.buildings.find(b=>b.type==='hq');
assert.deepEqual([...t.unlocks(2).fresh].length>0,true,'HQ2 unlocks new buildings');
assert(t.unlocks(8).fresh.length===1,'HQ8 unlocks the energy cannon');
t.home();t.tick();assert.equal(t.cur(),null,'tips wait until the first-play tutorial switches them on');
// The 394 tutorial (or the Settings toggle) enables tips when the player finishes it.
E.d.tips390.enabledByPlayer=true;t.home();t.tick();const first=t.cur();assert(first,'a new base receives a tip');t.done();
assert.equal(E.d.tips390.seen[first],1,'dismissed tips are saved');
hq().lv=2;t.home();t.tick();assert.equal(t.cur(),'hq2','HQ level-up is announced first');
t.done();t.tick();assert.notEqual(t.cur(),'hq2','each tip shows only once');
// The step-by-step first-play guide always has priority.
if(t.cur())t.done();hq().lv=3;t.guide({step:2});t.tick();assert.equal(t.cur(),null,'no tip while the first-play guide runs');
t.home();t.tick();assert.equal(t.cur(),'hq3');t.done();
// Turning tips off silences them.
E.d.tips390.off=true;hq().lv=4;t.home();t.tick();assert.equal(t.cur(),null,'tips can be turned off');
// Existing developed bases do not replay old milestones.
const b=boot({novaRTSIntro:'1'}),E2=b.t.e;E2.d.buildings.find(x=>x.type==='hq').lv=7;delete E2.d.tips390;b.t.home();b.t.tick();assert.equal(b.t.cur(),null,'veteran baseline');
E2.d.tips390.enabledByPlayer=true;E2.d.buildings.find(x=>x.type==='hq').lv=8;b.t.tick();assert.equal(b.t.cur(),'hq8','future level-ups still announced');
assert.deepEqual(a.errors,[]);assert.deepEqual(b.errors,[]);
console.log('PASS tips390: milestone tips once per account, HQ unlock lists, guide priority, opt-out, veteran baseline');
