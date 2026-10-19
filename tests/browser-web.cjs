const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const code=fs.readFileSync('web/browser.js','utf8');
const uid='11111111-1111-4111-8111-111111111111';
const session={access_token:'access',refresh_token:'refresh',expires_at:Date.now()/1000+3600,user:{id:uid}};
function harness(initial={}){
 const values=new Map(Object.entries(initial)),events=[],calls=[],navigations=[],nodes={welcome:{hidden:false},welcomeGoogle:{hidden:false}};
 const storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 let ready;
 const window={location:{origin:'https://example.com',pathname:'/web/',search:'',replace:p=>navigations.push(p)},history:{replaceState(){}},novaCloudEvent:(...e)=>events.push(e),Game:{close(){},welcomeForm(){}}};
 const context={window,localStorage:storage,sessionStorage:storage,document:{addEventListener:(e,f)=>ready=f,getElementById:id=>nodes[id]},console,AbortController,setTimeout,clearTimeout,URLSearchParams,TextEncoder,crypto:require('node:crypto').webcrypto,btoa:s=>Buffer.from(s,'binary').toString('base64'),fetch:async(url,options)=>{
  calls.push({url,options});let data=url.includes('/auth/v1/token')?session:url.endsWith('/auth/v1/user')?session.user:url.includes('/rest/v1/rpc/')?{owner:uid}:[];
  return {ok:true,status:200,json:async()=>data};
 }};
 vm.runInNewContext(code,context);return {window,context,values,events,calls,navigations,nodes,ready:()=>ready()};
}
(async()=>{
 const h=harness({'novaRTS1':'telegram-base'});
 assert.equal(h.window.NovaCloud.hasAccount(),false);
 assert.equal(h.window.NovaWebStorage.getItem('novaRTS1'),null,'does not read Telegram save');
 await h.window.NovaCloud.warRequest('status','{}','request-1');
 assert.equal(h.calls.length,0,'unauthenticated requests do not reach game RPC');
 assert.equal(h.events.at(-1)[0],'war_login');
 await h.window.NovaCloud.emailAuth('login','test@example.com','password');
 assert.equal(h.calls[0].url.endsWith('grant_type=password'),true);
 assert.equal(h.navigations[0],'/web/','reload before starting engine with new account');
 assert.equal(h.values.get('novaRTS1'),'telegram-base');
 const logged=harness(Object.fromEntries(h.values));
 logged.window.NovaWebStorage.setItem('novaRTS1','web-base');
 assert.equal(logged.values.get('novaWeb1:'+uid+':novaRTS1'),'web-base');
 assert.equal(logged.values.get('novaRTS1'),'telegram-base');
 await logged.ready();assert.equal(logged.nodes.welcomeGoogle.hidden,true);
 assert.equal(logged.events.at(-1)[0],'signed_in');
 await logged.window.NovaCloud.warRequest('status','{}','request-2');
 assert.equal(logged.events.at(-1)[1].request_id,'request-2');
 assert.equal(logged.calls.at(-1).options.headers.Authorization,'Bearer access');
 const before=logged.calls.length;
 await logged.window.NovaCloud.warRequest('research',JSON.stringify({admob230:'prepare'}),'request-3');
 assert.equal(logged.calls.length,before,'no unsupported native ad receipts on web');
 assert.equal(logged.events.at(-1)[0],'war_error');
 let continued=0;await logged.window.NovaAds.scout(()=>continued++);assert.equal(continued,1);
 await logged.window.NovaCloud.logout();assert.equal(logged.values.has('novaWebSession1'),false);
 assert.equal(logged.values.get('novaWeb1:'+uid+':novaRTS1'),'web-base','logout preserves account campaign');
 const expired=harness({novaWebSession1:JSON.stringify({...session,expires_at:1})});
 await Promise.all([expired.window.NovaCloud.warRequest('status','{}','a'),expired.window.NovaCloud.warRequest('status','{}','b')]);
 assert.equal(expired.calls.filter(c=>c.url.includes('grant_type=refresh_token')).length,1,'concurrent RPCs refresh once');
 const native={window:{NovaCloud:{native:true}}};vm.runInNewContext(code,native);assert.equal(native.window.NovaCloud.native,true);
 console.log('PASS web auth, account storage isolation, refresh concurrency, RPC correlation, ad safety, logout and native isolation');
})().catch(e=>{console.error(e);process.exit(1)});
