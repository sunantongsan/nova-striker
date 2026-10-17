const fs=require('fs'),vm=require('vm'),assert=require('assert');
const rings=[],elements={};const ctx=new Proxy({ellipse(...a){rings.push(a)},measureText:t=>({width:t.length*8})},{get:(o,k)=>o[k]||(()=>{})});
const el=id=>elements[id]||(elements[id]={style:{},innerHTML:'',textContent:'',addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:420,height:600}),querySelectorAll:()=>[]});
const s={console,Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:()=>0,clearTimeout(){},Image:class{},localStorage:{getItem:k=>k==='novaLanguage'?'th':null,setItem(){}},document:{getElementById:el,addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame(){}};
s.localStorage && s.localStorage.setItem('novaLanguage','th');vm.createContext(s);vm.runInContext(fs.readFileSync('game.js','utf8').replace("})(typeof globalThis!==",`root.rangeTest={e:E,select:function(b){E.d.buildings=[b,{id:1,type:"hq",x:1,y:1,lv:1}];selected=b.id;screen='home';placing=null;moving=null;},draw:drawDefenseRange223,hud:hud,move:function(){moving=selected;},place:function(){placing='gun';},raid:function(){screen='raid';},clear:function(){selected=null;},point:point};})(typeof globalThis!==`),s);
const t=s.rangeTest,r=s.NovaRTS.defenseRange,b={id:99,type:'missileturret',x:8,y:8,lv:1};
t.select(b);t.draw();assert.equal(rings.length,1);assert.equal(r('missileturret'),7);const center=t.point(8,8),edge=t.point(8+7/Math.SQRT2,8-7/Math.SQRT2);assert(Math.abs(rings[0][2]-(edge.x-center.x))<1e-8,'world-circle projection matches real distance');assert.equal(rings[0][0],center.x);t.hud();assert(el('selection').innerHTML.includes('7 ช่อง'));
t.move();b.x=10;t.draw();assert.equal(rings.at(-1)[0],t.point(10,8).x,'moving building moves range');
for(const type of ['hq','gun','tesla','cannonturret']){t.select({...b,type});rings.length=0;t.draw();assert.equal(rings.length,2);assert.notEqual(r(type),r(type,'wave'));t.hud();assert(el('selection').innerHTML.includes('วงประส้ม'));}
t.select({...b,type:'shield'});rings.length=0;t.draw();assert.equal(rings.length,1);assert.equal(r('shield'),3.5);
for(const type of ['mine','wall','garrison']){t.select({...b,type});rings.length=0;t.draw();assert.equal(rings.length,0);}
for(const action of ['place','raid','clear']){t.select(b);t[action]();rings.length=0;t.draw();assert.equal(rings.length,0);}
console.log('PASS range geometry, combat range values, dual-mode labels, shield, move, non-defense and deselection');

