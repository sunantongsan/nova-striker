const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8'),catalog=require('../localization/en.json');
function boot(data={},platform='android'){
 const elements={},errors=[],requests=[];let reloads=0,frame;
 const ctx=new Proxy({measureText:t=>({width:String(t).length*8}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
 const el=id=>elements[id]||(elements[id]={hidden:true,value:'',style:{},innerHTML:'',textContent:'',addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:420,height:800}),querySelectorAll:()=>[]});
 const storage={getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v,removeItem:k=>delete data[k]};
 const s={console:{log(){},error:(...a)=>errors.push(a)},Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:()=>1,clearTimeout(){},Image:class{},localStorage:storage,document:{getElementById:el,addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame:f=>frame=f,location:{reload:()=>reloads++},NovaCloud:{hasAccount:()=>true,available:()=>true,load(){},warRequest:(a,p,id)=>requests.push({a,p:JSON.parse(p),id})}};
 if(platform==='telegram'){s.Telegram={WebApp:{}};s.window=s;}
 vm.createContext(s);vm.runInContext(source.replace('})(typeof globalThis!==','root.test232={e:E,setScreen:v=>screen=v};})(typeof globalThis!=='),s);
 return {s,el,data,errors,requests,reloads:()=>reloads,frame:n=>frame(n)};
}
for(const platform of ['android','telegram']){
 const a=boot({novaRTSIntro:'1'},platform);assert.equal(a.s.NovaI18n.language,'en');assert.equal(a.s.NovaRTS.buildings.hq.name,'Command Center');
 a.s.Game.settings();assert.match(a.el('modal').innerHTML,/Language/);assert.match(a.el('modal').innerHTML,/English/);assert.match(a.el('modal').innerHTML,/aria-pressed="true" onclick="Game.setLanguage\('en'\)"/);
 a.s.novaCloudEvent('status',{message:'เชื่อมต่อบัญชีไม่ได้ ตรวจอินเทอร์เน็ตแล้วลองใหม่'});assert.match(a.el('toast').textContent,/Could not connect/);
 a.s.Game.setLanguage('xx');assert.equal(a.reloads(),0);
 a.s.test232.setScreen('raid');a.s.Game.setLanguage('th');assert.equal(a.reloads(),0);a.s.test232.setScreen('home');
 const baseName='ศูนย์บัญชาการ';a.s.novaCloudEvent('war',{request_id:a.requests.at(-1).id,data:{profile:true,owner:'test',name:baseName}});assert.match(a.el('mode').textContent,/ศูนย์บัญชาการ/,'player names remain unchanged');
 a.s.Game.setLanguage('th');assert.equal(a.reloads(),1);assert.equal(a.data.novaLanguage,'th');assert.equal(JSON.parse(a.data.novaBaseProfile224).name,baseName);
 const before=JSON.parse(a.data.novaRTS1),b=boot({...a.data},platform);assert.equal(b.s.NovaI18n.language,'th');assert.equal(b.s.NovaRTS.buildings.hq.name,'ศูนย์บัญชาการ');b.s.Game.settings();assert.match(b.el('modal').innerHTML,/ภาษา/);assert.equal(b.s.test232.e.d.gold,before.gold);
 b.s.Game.setLanguage('en');assert.equal(b.data.novaLanguage,'en');const c=boot({...b.data},platform);assert.equal(c.s.NovaI18n.language,'en');
 c.el('modal').style.display='none';for(let n=40;n<=2000;n+=40)c.frame(n);assert.deepEqual(c.errors,[],'home animation remains healthy');
 const saved=c.data.novaLanguage;c.s.localStorage.setItem=()=>{throw Error('full')};c.s.Game.setLanguage('th');assert.equal(c.reloads(),0);assert.equal(c.data.novaLanguage,saved);
}
// Every legacy Thai phrase and backend/native status is covered, without translating user content.
const seen=new Set();for(const [thai,en]of Object.entries(catalog)){assert(en.trim());assert(!/[\u0e00-\u0e7f]/.test(en));seen.add(thai);}
const runtime=source.slice(0,source.indexOf('/* locale232:end */'));const sandbox={};vm.runInNewContext(runtime,sandbox);for(const [thai,en] of Object.entries(catalog))assert.equal(sandbox.NovaI18n.translate(thai),en);
assert.equal(sandbox.NovaI18n.translate('ต้องรอ 15 นาทีก่อนบุกคนเดิม'),'Please wait 15 minutes before raiding the same player');
// Real DOM text and accessibility attributes use the same preference.
const nodes=[{nodeValue:'ตั้งค่า',parentNode:{tagName:'BUTTON'}},{nodeValue:'ตั้งค่า',parentNode:{tagName:'SCRIPT'}},{nodeValue:'ไทย',parentNode:{tagName:'BUTTON',lang:'th'}}],attrs={'aria-label':'ชื่อฐาน'},doc={documentElement:{lang:'th'},body:{},createTreeWalker:()=>{let i=0;return{nextNode:()=>nodes[i++]};},querySelectorAll:()=>[{hasAttribute:k=>k in attrs,getAttribute:k=>attrs[k],setAttribute:(k,v)=>attrs[k]=v}]};sandbox.NovaI18n.localize(doc);assert.equal(nodes[0].nodeValue,'Settings');assert.equal(nodes[1].nodeValue,'ตั้งค่า');assert.equal(nodes[2].nodeValue,'ไทย','language autonym stays Thai');assert.equal(attrs['aria-label'],'Base name');assert.equal(doc.documentElement.lang,'en');
const generated=fs.readFileSync('game.js','utf8');require('../scripts/localization.cjs').build();assert.equal(fs.readFileSync('game.js','utf8'),generated,'embedded translations match catalog');
require('../scripts/telegram.cjs').build();assert(fs.readFileSync('patch-dist/play/game.js','utf8').includes('NovaI18n'));assert(fs.readFileSync('patch-dist/play/game.js','utf8').includes('ระบบจะรอ Monetag ยืนยัน'));
console.log('PASS localization: English default, Thai/English persistence on Android/Telegram, save preservation, battle/storage guards, online messages, untouched player names, DOM accessibility, animation and bundled patch coverage');
