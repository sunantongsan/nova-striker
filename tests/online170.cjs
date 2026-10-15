const {PGlite}=require('@electric-sql/pglite');const fs=require('fs'),assert=require('assert');
require('../game.js');
(async()=>{
 const db=new PGlite();await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;`);
 for(const file of ['nova_war.sql','nova_160.sql','nova_170.sql'])await db.exec(fs.readFileSync('backend/'+file,'utf8'));
 const a='10000000-0000-4000-8000-000000000001',b='10000000-0000-4000-8000-000000000002';await db.query('insert into auth.users values($1),($2)',[a,b]);
 async function call(uid,action,payload={},rpc='nova_test_command'){await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid]);await db.exec('set role authenticated');try{return (await db.query('select public.'+rpc+'($1,$2) as result',[action,JSON.stringify(payload)])).rows[0].result;}finally{await db.exec('reset role');}}
 assert.equal((await call(a,'test_status')).test_gems,0);assert.equal((await call(a,'test_claim')).test_gems,10000);assert.equal((await call(a,'test_claim')).test_gems,10000);assert.equal((await call(b,'test_status')).test_gems,0);
 let request={request_id:'20000000-0000-4000-8000-000000000001',kind:'gold',quantity:10};assert.equal((await call(a,'test_exchange',request)).test_gems,9900);assert.equal((await call(a,'test_exchange',request)).test_gems,9900);
 assert.equal((await call(a,'test_exchange',{...request,kind:'power'})).receipt.kind,'gold','nonce cannot change purchased item');
 await assert.rejects(()=>call(a,'test_exchange',{...request,request_id:null}));await assert.rejects(()=>call(a,'test_exchange',{...request,request_id:'20000000-0000-4000-8000-000000000002',quantity:-1}));
 let cancelled={request_id:'20000000-0000-4000-8000-000000000003',kind:'power',quantity:1};assert((await call(a,'test_cancel',cancelled)).receipt.cancelled);assert((await call(a,'test_exchange',cancelled)).receipt.cancelled);assert.equal((await call(a,'test_status')).test_gems,9900);
 let bot=(await call(a,'test_targets')).target;assert(bot.bot);
 const layout=[{type:'hq',x:10,y:10},{type:'gun',x:8,y:10},{type:'tesla',x:12,y:10},{type:'crystalstore',x:10,y:12}];await call(a,'enroll',{layout},'nova_war_command');await call(b,'enroll',{layout},'nova_war_command');
 await db.query('update public.nova_war_players set tier=15 where user_id=$1',[b]);let target=(await call(a,'test_targets')).target;assert.equal(target.id,b);assert(!target.bot);assert.equal((await call(b,'test_targets')).target.id,a,'random finder excludes self and includes shielded unequal tier during practice');
 const before=(await db.query('select crystals from public.nova_war_players where user_id=$1',[b])).rows[0].crystals;
 let crystals={request_id:'20000000-0000-4000-8000-000000000004',kind:'crystals',quantity:10};let result=await call(a,'test_exchange',crystals);assert.equal(result.online.crystals,100);assert.equal(result.test_gems,9800);assert.equal((await call(a,'test_exchange',crystals)).online.crystals,100);
 await assert.rejects(()=>call(a,'test_exchange',{...crystals,request_id:'20000000-0000-4000-8000-000000000005',quantity:1000}));assert.equal((await call(a,'test_status')).test_gems,9800,'failed exchange is atomic');
 await call(a,'leave',{},'nova_war_command');assert.equal((await call(a,'test_claim')).test_gems,9800,'leaving does not reset daily claim');
 await db.query("update nova_private.test_wallets set claimed_day=(now() at time zone 'Asia/Bangkok')::date-1 where user_id=$1",[a]);assert.equal((await call(a,'test_claim')).test_gems,19800);
 await db.exec('set role authenticated');await assert.rejects(()=>db.query('select * from nova_private.test_wallets'));await db.exec('reset role');await assert.rejects(()=>call('','test_claim'));
 const e=new NovaRTS.Engine({getItem:()=>null,setItem:()=>{}},()=>1000),saved=JSON.stringify(e.d);assert(e.scoutPlayer(bot));assert.equal(e.raid.mapSize,22);assert(e.deploy(0,10,10));assert(e.deploy(0,NaN,0));assert.equal(e.deploy(0,0,10),'');assert.equal(e.deploy(1,21,10),'');assert.equal(e.deploy(5,10,0),'');assert.equal(e.deploy(7,10,21),'');assert.equal(e.raid.phase,'battle');
 for(let t=0;t<3601&&!e.raid.result;t++)e.tick(.05);assert(e.raid.result);assert.equal(JSON.stringify(e.d),saved,'practice never consumes saved troops or gives campaign rewards');assert.equal(e.raid.result.gems,0);assert(e.raid.buildings.some(x=>x.hp<x.max),'manual deployed units damage base');assert.equal((await db.query('select crystals from public.nova_war_players where user_id=$1',[b])).rows[0].crystals,before);
 await db.exec('update nova_private.test_settings set enabled=false');await assert.rejects(()=>call(a,'test_claim'));
 console.log('PASS 1.7: daily server claim, next day, account isolation, retries, cancellation, all resources, full-store rollback, random opponent/fallback, practice combat and no economy damage');await db.close();
})().catch(e=>{console.error(e);process.exit(1)});
