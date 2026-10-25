const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const {integrate}=require('../features/titan342/build.cjs');const b={};
vm.runInNewContext(integrate(fs.readFileSync('game.js','utf8')),b);
const N=b.NovaRTS,T=N.titan342;
for(let tier=1;tier<=3;tier++){
 const t=T.make(tier,1,1);assert.equal(t.max,[9600,20400,43200][tier-1]);
 assert.equal(T.damage[tier-1],[273,585,1235][tier-1]);
 const e=new N.Engine({getItem:()=>null,setItem(){}},()=>0);
 e.d.titan342={level:tier,skills:{slash:1,palm:1,dash:1,shield:1,nova:1}};
 assert(e.scoutPlayer({layout:N.campaignLayout(85).map(v=>({...v,lv:17})),callsign:'HQ17 fixture',garrison:[],builder_count:0}));
 assert.equal(e.deployTitan342(1,1),'');const unit=e.raid.troops.find(t=>t.titan342);
 for(let i=0;i<18000&&unit.hp>0&&!e.raid.result;i++)e.tick(.05);
 assert.equal(unit.hp,0,'unsupported mech with level-1 skills cannot solo fortified HQ17 fixture');
 assert(e.raid.buildings.some(v=>v.hp>0));
}
let now=1000,shakes=0,cancels=0,audioCalls=0,draws=0,reduced=false;
const s={Date:{now:()=>now},document:{hidden:false},screen:'raid',root:{matchMedia:()=>({matches:reduced})},canvas:{animate:()=>{shakes++;return{cancel:()=>cancels++};}},mediaAllowed250:()=>true,weaponAudio218:()=>audioCalls++,drawFX:()=>draws++};
vm.createContext(s);vm.runInContext(fs.readFileSync('features/titan342/combat-feedback.js','utf8'),s);
const fx=()=>({weapon:'impact',effect:'missile'}),f=fx();s.drawFX(f);s.drawFX(f);assert.equal(shakes,1);
s.drawFX(fx());assert.equal(shakes,1,'cap simultaneous explosions');now+=200;s.drawFX({weapon:'energyRing276'});assert.equal(shakes,2);assert.equal(cancels,1);
now+=200;s.drawFX({weapon:'missile'});assert.equal(shakes,2,'launch does not shake');s.screen='home';s.drawFX(fx());assert.equal(shakes,2);
s.screen='raid';s.document.hidden=true;const heard=audioCalls;s.drawFX(fx());assert.equal(audioCalls,heard);assert.equal(shakes,2);
s.document.hidden=false;reduced=true;s.drawFX(fx());assert.equal(shakes,2,'respect reduced motion');assert(draws>0);
console.log('PASS NOVA balance, three solo HQ17 fixtures, impact-only bounded battlefield shake, background/reduced-motion handling');
