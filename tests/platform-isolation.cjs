const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {build:android}=require('../scripts/patch.cjs');
const {build:telegram}=require('../scripts/telegram.cjs');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'nova-platforms-'));
try {
 const source=path.join(temp,'source'),output=path.join(temp,'output');
 fs.mkdirSync(path.join(source,'assets'),{recursive:true});fs.mkdirSync(path.join(source,'web'));
 for(const p of ['index.html','game.js','patch-config.json','web/index.html','web/telegram.js'])fs.copyFileSync(path.join(__dirname,'..',p),path.join(source,p));
 const vm=require('node:vm'),game=fs.readFileSync(path.join(source,'game.js'),'utf8');
 const cloud=game.slice(game.indexOf('var accountId282='),game.indexOf('Game.emailForm=function'));
 let menu='';const ctx={Game:{},root:{NovaCloud:{provider:'telegram',available:()=>true}},tr:s=>s,mt251:s=>s,escapeHTML:s=>s,open:s=>menu=s};
 vm.runInNewContext(cloud,ctx);ctx.Game.cloud();
 assert(menu.includes('Telegram'));assert(!menu.includes('Google'));assert(!menu.includes('emailForm'));
 ctx.root.NovaCloud={available:()=>true};ctx.Game.cloud();assert(menu.includes('Google'));assert(menu.includes('emailForm'));
 const m=android(source,output),before=JSON.stringify(m);
 const entry=m.files.find(f=>f.path==='index.html');
 const nativeHTML=fs.readFileSync(path.join(output,'objects',entry.sha256),'utf8');
 assert(!nativeHTML.includes('telegram-web-app.js'));if(JSON.parse(fs.readFileSync(path.join(source,'patch-config.json'))).titan342){
  const packed=nativeHTML.match(/var raw=atob\(("[^"]+")\)/);
  assert(packed,'compressed model payload must be present');
  const decoded=require('node:zlib').gunzipSync(Buffer.from(JSON.parse(packed[1]),'base64')).toString('utf8');
  assert(decoded.includes('window.NovaHQModel352='),'compressed native payload must include the HQ model');
 }
 assert(!m.files.some(f=>f.path.startsWith('web/')||f.path==='telegram.js'));
 const play=telegram(source,output),webHTML=fs.readFileSync(path.join(play,'index.html'),'utf8');
 assert(webHTML.includes('telegram-web-app.js'));assert(webHTML.includes('src="telegram.js"'));
 const config=JSON.parse(fs.readFileSync(path.join(source,'patch-config.json'),'utf8'));
 const expectedWeb=fs.readFileSync(path.join(source,'web/index.html'),'utf8').replace(/var info=\{contentVersion:\d+,label:"[^"]*"\};/,'var info={contentVersion:'+JSON.stringify(config.contentVersion)+',label:'+JSON.stringify(config.label)+'};');
 assert.equal(webHTML,config.titan342?require('../features/titan342/build.cjs').documentPayload(expectedWeb):expectedWeb,'Telegram entry must preserve its own markup and use the current content version');
 assert.equal(JSON.stringify(m),before);
 fs.appendFileSync(path.join(source,'web/index.html'),'<!-- Telegram-only edit -->');
 assert.deepEqual(android(source,output),m,'Telegram entry edits must not change Android patch');
 telegram(source,output);
 assert(fs.readFileSync(path.join(output,'play/index.html'),'utf8').includes('Telegram-only edit'));
 assert(!fs.existsSync(path.join(output,'play/backend')));
 console.log('PASS independent Android/Telegram entry pages, shared engine, isolated output');
} finally {fs.rmSync(temp,{recursive:true,force:true});}


