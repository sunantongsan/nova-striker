const {PGlite}=require('@electric-sql/pglite'),fs=require('fs'),assert=require('assert');
(async()=>{const db=new PGlite();await db.exec(`create role service_role;create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;`);
for(const file of ['nova_war.sql','nova_160.sql','nova_170.sql','nova_infrastructure_fix.sql','nova_economy_180.sql','nova_war_browse.sql','nova_live.sql','nova_siege_200.sql','nova_enhance_210.sql','nova_transport_212.sql','nova_merc_recruit_213.sql','nova_disable_reverse_215.sql','nova_names_224.sql','nova_upgrade_timers_225.sql','nova_rocket_caps_227.sql','nova_builders_speed_228.sql','nova_speed_economy_229.sql','nova_admob_230.sql'])await db.exec(fs.readFileSync('backend/'+file,'utf8'));
await db.exec("alter table auth.users add column email text;");await db.exec(fs.readFileSync('backend/nova_telegram_231.sql','utf8'));
await db.exec(fs.readFileSync('backend/nova_checkin_resources_233.sql','utf8'));
const uid='10000000-0000-4000-8000-000000000001',other='10000000-0000-4000-8000-000000000002';await db.query('insert into auth.users(id) values($1),($2)',[uid,other]);let serial=0;const nonce=()=>`20000000-0000-4000-8000-${String(++serial).padStart(12,'0')}`;
async function call(action,payload={},who=uid,telegram=false){await db.query("select set_config('request.jwt.claim.sub',$1,false)",[who]);await db.exec('set role authenticated');try{return(await db.query('select public.'+(action.startsWith('test_')?'nova_test_command':telegram?'nova_telegram_command':'nova_war_command')+'($1,$2) result',[action,JSON.stringify(payload)])).rows[0].result;}finally{await db.exec('reset role');}}

await db.exec(fs.readFileSync('backend/nova_rewarded_checkin_234.sql','utf8'));
await db.exec('update nova_private.admob_settings230 set enabled=true;update nova_private.monetag_settings231 set enabled=true');
await db.query('insert into nova_private.telegram_accounts231(telegram_id,user_id) values(123,$1)',[uid]);

await db.exec(fs.readFileSync('backend/nova_resource_bundle_238.sql','utf8'));
await db.exec(fs.readFileSync('backend/nova_production_ads_240.sql','utf8'));
await call('enroll',{layout:[{type:'hq',lv:15,x:10,y:10},{type:'mine',lv:2,x:9,y:10},{type:'reactor',lv:3,x:8,y:10},{type:'crystalplant',lv:1,x:7,y:10}]});

await db.exec(fs.readFileSync('backend/nova_paths_boost_245.sql','utf8'));

await db.exec("alter table auth.users add column created_at timestamptz default now(),add column is_anonymous boolean default false;update auth.users set created_at=now()-interval '1 day'");
await db.exec(fs.readFileSync('supabase/migrations/20261017141227_welcome_bonus_247.sql','utf8'));
await db.exec(fs.readFileSync('supabase/migrations/20261017142921_test_checkin_248.sql','utf8'));
await db.exec('update nova_private.admob_settings230 set enabled=false');
await db.exec(fs.readFileSync('backend/nova_mining_251.sql','utf8'));
let r=await call('test_status',{mining251:'status'},other);assert.equal(r.mining251.base_rate,200);
let id=nonce();r=await call('test_status',{mining251:'prepare',request_id:id},other);assert.equal(r.mining251.receipt.provider,'test');
await assert.rejects(()=>call('test_claim',{mining251:'claim',request_id:id},other),/ดูโฆษณา/);
r=await call('test_claim',{mining251:'claim',request_id:id,completed:true},other);assert(r.mining251.receipt.claimed);
r=await call('test_claim',{mining251:'claim',request_id:id,completed:true},other);assert(r.mining251.receipt.claimed);
await assert.rejects(()=>call('test_status',{mining251:'prepare',request_id:nonce()},other),/ยังไม่หมด/);
await db.query("update nova_private.mining_sessions251 set started_at=now()-interval '1 hour',settled_at=now()-interval '1 hour',ends_at=now()+interval '23 hours' where owner=$1",[other]);
r=await call('test_status',{mining251:'status'},other);assert.equal(r.mining251.credited,200);
r=await call('test_status',{mining251:'status'},other);assert.equal(r.mining251.credited,200);
id=nonce();r=await call('test_status',{mining251:'prepare',request_id:id},uid);assert.equal(r.mining251.receipt.provider,'monetag');
r=await call('test_claim',{mining251:'claim',request_id:id,completed:true},uid);assert(!r.mining251.receipt.claimed,'SDK callback alone cannot start real session');
await db.query('update nova_private.monetag_intents231 set verified_at=now() where id=$1',[id]);
r=await call('test_claim',{mining251:'claim',request_id:id,completed:true},uid);assert(r.mining251.receipt.claimed);
await assert.rejects(()=>call('test_status',{mining251:'status',owner:uid},other),/บัญชีเดิม/);
for(const [n,rate] of [[100,200],[101,100],[1000,100],[1001,50],[1000001,6.25]])assert.equal(Number((await db.query('select nova_private.mining_rate251($1) r',[n])).rows[0].r),rate);
// Exact overlap: parent 2h, child only the second hour => 400 + 30, not 460.
await db.query('update nova_private.miners251 set inviter=$1,referral_paid=true where owner=$2',[other,uid]);
await db.query("update nova_private.mining_sessions251 set started_at=now()-interval '2 hours',settled_at=now()-interval '2 hours',ends_at=now()+interval '22 hours' where owner=$1",[other]);
await db.query("update nova_private.mining_sessions251 set started_at=now()-interval '1 hour',settled_at=now()-interval '1 hour',ends_at=now()+interval '23 hours' where owner=$1",[uid]);
await db.query('update nova_private.miners251 set earned=0,credited=0 where owner=$1',[other]);
r=await call('test_status',{mining251:'status'},other);assert.equal(r.mining251.credited,430);
// 21 concurrent referrals never exceed 20 bonuses, even if all are active.
for(let k=3;k<=22;k++){let u='10000000-0000-4000-8000-'+String(k).padStart(12,'0');await db.query('insert into auth.users(id) values($1)',[u]);await db.query('insert into nova_private.miners251(owner,code,code_key,inviter,first_started,referral_paid) values($1,$2,$2,$3,now(),true)',[u,'user'+k,other]);await db.query("insert into nova_private.mining_sessions251 values($1,$2,now()-interval '1 hour',now()+interval '23 hours',now(),'200','test')",[nonce(),u]);}
await db.query("update nova_private.mining_sessions251 set settled_at=now()-interval '1 hour' where owner=$1",[other]);
await db.query('update nova_private.miners251 set earned=0,credited=0 where owner=$1',[other]);
r=await call('test_status',{mining251:'status'},other);assert.equal(r.mining251.credited,800);assert.equal(r.mining251.active_team,20);
// No earnings after expiry even though the children remain active.
await db.query("update nova_private.mining_sessions251 set ends_at=now()-interval '1 minute',settled_at=now()-interval '1 minute' where owner=$1",[other]);
r=await call('test_status',{mining251:'status'},other);assert.equal(r.mining251.credited,800);
await assert.rejects(()=>call('test_status',{checkin_test248:'prepare',owner:other,request_id:nonce()},other),/เช็คอินเปลี่ยน/);
// New referral binds once, pays only after a named base and first session.
const newcomer='10000000-0000-4000-8000-000000000090';await db.query("insert into auth.users(id,created_at) values($1,now()+interval '1 second')",[newcomer]);
r=await call('test_status',{mining251:'status'},other);const code=r.mining251.code;
await call('test_status',{mining251:'refer',code},newcomer);
await assert.rejects(()=>call('test_status',{mining251:'refer',code},newcomer),/ครั้งเดียว/);
let ni=nonce();await call('test_status',{mining251:'prepare',request_id:ni},newcomer);await call('test_claim',{mining251:'claim',request_id:ni,completed:true},newcomer);
assert.equal((await db.query('select count(*) n from nova_private.mining_ledger251 where source=$1 and kind=\'referral\'',[newcomer])).rows[0].n,0);
await db.query('insert into nova_private.base_names224(user_id,name) values($1,\'New Base\')',[newcomer]);
await call('test_status',{mining251:'status'},newcomer);await call('test_status',{mining251:'status'},newcomer);
assert.equal((await db.query('select count(*) n from nova_private.mining_ledger251 where source=$1 and kind=\'referral\'',[newcomer])).rows[0].n,1);
assert.equal((await db.query("select has_table_privilege('authenticated','nova_private.miners251','update') ok")).rows[0].ok,false);
console.log('PASS mining251: receipts, replay, halving, overlap, 20-member cap, expiry, referral qualification/once, old-claim rejection, permissions');await db.close();})().catch(e=>{console.error(e);process.exit(1)});
