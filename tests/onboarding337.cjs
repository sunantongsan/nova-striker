const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('game.js','utf8').split('// Interactive onboarding 337:')[1].split('// End interactive onboarding 337.')[0];
function setup(step=2){
 const elements={},nodes={};const el=()=>({hidden:true,innerHTML:'',style:{display:'none'},classList:{add(){},remove(){}},scrollIntoView(){}});
 ['guideDock288','welcome','mode','baseNameGate','baseNameInput'].forEach(k=>elements[k]=el());
 const E={d:{buildings:[],queue:[],army:[1]},save:()=>true,now:()=>1000,hq:()=>1,buildCap:()=>3,unitLock278:()=>'',train278:()=>'',raid:null};
 const c={E,guide288:{step},guideOwner288:()=> 'user',guideNamed288:()=>true,guideSave288(){},guideClearFocus288(){},guideTick288(){},guideRender288(){},guideAutoPending288:false,guideTickAt288:0,guest288:false,screen:'home',placing:null,selectedShip277:null,welcomeState247:null,B:{gun:{name:'Plasma'}},fleet277:()=>({ships:[]}),spaces:a=>a.reduce((x,y)=>x+y,0),duration:x=>String(x),mt251:(th,en)=>en,setHTML219:(e,s)=>e.innerHTML=s,$:k=>elements[k],document:{hidden:false,querySelector:s=>nodes[s]||null,createElement:el,head:{appendChild(){}}},Game:{beginGuide288(){},guideFinish288(){c.guide288=null;},home(){c.screen='home';E.raid=null;}},close(){c.modal.style.display='none';},open:s=>{c.modal.innerHTML=s;c.modal.style.display='flex';},modal:el(),mineSend251(){},welcomePanel247:()=>'',droneNameOpen251:false};
 vm.createContext(c);vm.runInContext('//'+source,c);return c;
}
let c=setup();c.guideTick288();c.Game.guideNext288();assert.equal(c.guide288.step,2,'Next cannot bypass building');
c.E.d.buildings.push({id:1,type:'mine',constructing:true,until:5000});c.guideTick288();assert.equal(c.guide288.step,2,'Wait for construction');delete c.E.d.buildings[0].constructing;delete c.E.d.buildings[0].until;c.guideTick288();assert.equal(c.guide288.step,3);c.Game.guideNext288();assert.equal(c.guide288.step,4,'Resource explanation can be acknowledged');
c=setup(4);c.guideTick288();c.Game.guideNext288();assert.equal(c.guide288.step,4);c.E.train278(0);c.E.d.queue=[{kind:0}];c.guideTick288();assert.equal(c.guide288.step,4);c.E.d.queue=[];c.guideTick288();assert.equal(c.guide288.step,5);
c=setup(5);c.guideTick288();c.Game.guideNext288();assert.equal(c.guide288.step,5);c.screen='raid';c.E.raid={result:{stars:0}};c.guideTick288();c.Game.home();c.guideTick288();assert.equal(c.guide288.step,6,'Return from completed practice unlocks defense');
c=setup(5);c.screen='raid';c.E.raid={liveMode:true,result:{stars:3}};c.Game.home();c.guideTick288();assert.equal(c.guide288.step,5,'Online battle is not the practice lesson');
c=setup(1);c.guideTick288();assert.equal(c.guide288.step,1,'Wait for actual bonus eligibility');c.welcomeState247={claimed:true};c.guideTick288();assert.equal(c.guide288.step,2);
c=setup(1);c.guest288=true;c.guideTick288();assert.equal(c.guide288.step,2,'Guests are not blocked on online bonus');
c=setup(6);c.guideTick288();c.E.d.buildings.push({id:8,type:'gun'});c.guideTick288();assert.equal(c.guide288.step,7);
c=setup(2);c.E.d.buildings=[1,2,3].map(id=>({id,type:'mine'}));c.guideTick288();assert.equal(c.guide288.step,3,'Existing capped building type does not deadlock');
c=setup(4);c.E.d.guideEvidence337={user:{step:4,trained:true,ids:[]}};c.guideTick288();assert.equal(c.guide288.step,5,'Training evidence resumes after restart');
c=setup(2);c.document.hidden=true;c.guideTick288();assert.equal(c.$('guideDock288').hidden,true);
console.log('PASS: interactive guide gates, construction timers, training, battle completion, guest bonus, capped bases and resume');
