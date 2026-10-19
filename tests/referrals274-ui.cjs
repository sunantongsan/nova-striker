const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8'),catalog=require('../localization/en.json');
function boot(data={},platform='android'){
 const elements={},errors=[],requests=[];let reloads=0,frame,timerId=0;const timers=new Map();
 const ctx=new Proxy({measureText:t=>({width:String(t).length*8}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
 const el=id=>elements[id]||(elements[id]={hidden:true,value:'',style:{},innerHTML:'',textContent:'',addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({width:420,height:800}),querySelectorAll:()=>[]});
 const storage={getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v,removeItem:k=>delete data[k]};
 const s={crypto:require('node:crypto').webcrypto,console:{log(){},error:(...a)=>errors.push(a)},Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:(f,ms)=>{timers.set(++timerId,{f,ms});return timerId;},clearTimeout:id=>timers.delete(id),Image:class{},localStorage:storage,document:{getElementById:el,addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame:f=>frame=f,location:{reload:()=>reloads++},NovaCloud:{hasAccount:()=>true,available:()=>true,warAvailable:()=>true,load(){},warRequest:(a,p,id)=>requests.push({a,p:JSON.parse(p),id})}};
 if(platform==='telegram'){s.Telegram={WebApp:{}};s.window=s;}
 vm.createContext(s);vm.runInContext(source.replace('})(typeof globalThis!==','root.test232={e:E,setScreen:v=>screen=v,select:id=>selected=id,clearBusy:()=>{warBusy=false;warActive=null;},setOnline:()=>{E.d.onlineCrystal={owner:"a"};E.d.admob230=true;}};})(typeof globalThis!=='),s);
 return {s,el,data,errors,requests,timers,reloads:()=>reloads,frame:n=>frame(n)};
}


const a=boot({novaRTSIntro:'1',novaLanguage:'th',novaBaseProfile224:JSON.stringify({owner:'10000000-0000-4000-8000-000000000002',name:'Old base'})}),G=a.s.Game;
G.renameBase274();const initial=a.requests.find(r=>r.p.profile==='status');if(initial)a.s.novaCloudEvent('war',{request_id:initial.id,data:{profile:true,owner:'10000000-0000-4000-8000-000000000002',name:'Old base'}});assert(!a.el('baseNameGate').hidden,'status refresh must not close rename editor');assert.equal(a.el('baseNameInput').value,'Old base');a.el('baseNameInput').value='New base';G.claimBaseName({preventDefault(){}});let req=a.requests.at(-1);assert.equal(req.p.profile,'rename');assert.equal(req.p.name,'New base');
a.s.novaCloudEvent('war',{request_id:req.id,data:{profile:true,owner:'10000000-0000-4000-8000-000000000002',name:'New base'}});assert(a.el('baseNameGate').hidden);assert.equal(JSON.parse(a.data.novaBaseProfile224).name,'New base');
G.referrals251();assert(a.el('modal').innerHTML.includes('referralLoading274'));req=a.requests.at(-1);assert.equal(req.p.mining251,'status');
a.s.novaCloudEvent('war',{request_id:req.id,data:{owner:'10000000-0000-4000-8000-000000000002',mining251:{server_time:new Date().toISOString(),code:'NOVA QA',started:false,invited:false,referral_eligible:true,team_total:0,active_team:0,credited:0}}});
assert(a.el('modal').innerHTML.includes('NOVA QA'),'async reply opens referral settings');
a.el('mineCode251').value='NEWCODE';G.saveMineCode251();assert.equal(a.requests.at(-1).p.code,'NEWCODE');
G.shareMine251();assert(a.el('modal').innerHTML.includes('LINE'));assert(a.el('modal').innerHTML.includes('Facebook'));assert(a.el('modal').innerHTML.includes('ref_10000000000040008000000000000002'));
const shared=[];a.s.NovaCloud.shareInvite274=(...args)=>shared.push(args);G.sendInvite274('system');G.copyInvite274();assert.equal(shared[0][2],'system');assert.equal(shared[1][2],'copy');assert(shared[0][1].endsWith('ref_10000000000040008000000000000002'));
delete a.s.NovaCloud.shareInvite274;a.s.NovaCloud.provider='telegram';a.s.Telegram={WebApp:{openLink:url=>shared.push(url),openTelegramLink:url=>shared.push(url)}};G.sendInvite274('line');assert(shared.at(-1).startsWith('https://line.me/R/share?'));G.sendInvite274('telegram');assert(shared.at(-1).startsWith('https://t.me/share/url?'));
console.log('PASS referrals274: rename payload and persistence, async referrals, custom code, stable invite link, native and social share routing');
