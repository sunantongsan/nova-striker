const {PGlite}=require('@electric-sql/pglite'),fs=require('fs'),assert=require('assert');
(async()=>{const db=new PGlite();await db.exec(`create role service_role;create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;`);
for(const file of ['nova_war.sql','nova_160.sql','nova_170.sql','nova_infrastructure_fix.sql','nova_economy_180.sql','nova_war_browse.sql','nova_live.sql','nova_siege_200.sql','nova_enhance_210.sql','nova_transport_212.sql','nova_merc_recruit_213.sql','nova_disable_reverse_215.sql','nova_names_224.sql','nova_upgrade_timers_225.sql','nova_rocket_caps_227.sql','nova_builders_speed_228.sql','nova_speed_economy_229.sql','nova_admob_230.sql'])await db.exec(fs.readFileSync('backend/'+file,'utf8'));
await db.exec("alter table auth.users add column email text;");await db.exec(fs.readFileSync('backend/nova_telegram_231.sql','utf8'));
await db.exec(fs.readFileSync('backend/nova_checkin_resources_233.sql','utf8'));
const uid='10000000-0000-4000-8000-000000000001',other='10000000-0000-4000-8000-000000000002';await db.query('insert into auth.users(id) values($1),($2)',[uid,other]);let serial=0;const nonce=()=>`20000000-0000-4000-8000-${String(++serial).padStart(12,'0')}`;
async function call(action,payload={},who=uid,telegram=false){await db.query("select set_config('request.jwt.claim.sub',$1,false)",[who]);await db.exec('set role authenticated');try{return(await db.query('select public.'+(action.startsWith('test_')?'nova_test_command':telegram?'nova_telegram_command':'nova_war_command')+'($1,$2) result',[action,JSON.stringify(payload)])).rows[0].result;}finally{await db.exec('reset role');}}

await db.exec(fs.readFileSync('backend/nova_resource_bundle_238.sql','utf8'));
await call('enroll',{layout:[{type:'hq',lv:15,x:10,y:10},{type:'mine',lv:10,x:9,y:10},{type:'reactor',lv:10,x:8,y:10}]});
await db.query('insert into nova_private.test_wallets(user_id,gems) values($1,1000) on conflict(user_id) do update set gems=1000',[uid]);
let r=await call('research',{resource233:'quote',kind:'bundle',owner:uid,needs:{gold:2000,power:3000}});const q=r.resource_quote;assert(q.available);assert.equal(q.cost,7);assert.equal(q.items.length,2);
const p={resource233:'buy',kind:'bundle',owner:uid,needs:{gold:2000,power:3000},request_id:nonce(),quoted_cost:q.cost,quoted_amount:q.amount};
r=await call('research',p);assert.equal(r.wallet_gems,993);assert.equal(r.resources.gold_delta,2000);assert.equal(r.resources.power_delta,3000);r=await call('research',p);assert.equal(r.wallet_gems,993);assert.equal(r.resources.gold_delta,2000);
r=await call('research',{...p,resource233:'cancel'});assert(!r.resource_receipt.cancelled,'late cancellation preserves successful purchase');
await assert.rejects(()=>call('research',{...p,needs:{gold:1}}),/ถูกใช้แล้ว/);
await assert.rejects(()=>call('research',{...p,request_id:nonce(),quoted_cost:1}),/ราคาเปลี่ยน/);
await assert.rejects(()=>call('research',{...p,owner:other}),/บัญชีเดิม/);
const cancelled={...p,request_id:nonce()};await call('research',{...cancelled,resource233:'cancel'});r=await call('research',cancelled);assert(r.resource_receipt.cancelled);assert.equal(r.wallet_gems,993);
await db.exec('update nova_private.test_wallets set gems=0');await assert.rejects(()=>call('research',{...p,request_id:nonce()}),/เพชรออนไลน์ไม่พอ/);r=await call('status');assert.equal(r.resources.gold_delta,2000,'no partial resource grant on insufficient diamonds');
r=await call('research',{resource233:'quote',kind:'bundle',owner:uid,needs:{gold:99999999}});assert(!r.resource_quote.available);
await db.exec('set role authenticated');await assert.rejects(()=>db.query("select nova_private.command_before_bundle238('status','{}')"));await db.exec('reset role');
console.log('PASS bundle238: total price, atomic multi-resource grant, replay, changed quote/owner denial, cancellation, insufficient diamonds, storage limits and private access');await db.close();})().catch(e=>{console.error(e);process.exit(1)});
