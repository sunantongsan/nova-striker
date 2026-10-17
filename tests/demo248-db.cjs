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
let r=await call('test_status');assert(!r.test_checkin248,'Telegram accounts excluded');
r=await call('test_status',{},other);assert(r.test_checkin248);
const id=nonce(),p={owner:other,request_id:id,checkin_test248:'prepare'};
r=await call('test_status',p,other);assert.equal(r.test_receipt248.amount,20);assert(!r.test_receipt248.claimed);
let again=await call('test_status',{...p,request_id:nonce()},other);assert.equal(again.test_receipt248.id,id,'only one receipt per day');
await assert.rejects(()=>call('test_claim',{...p,checkin_test248:'claim'},other),/ดูโฆษณา/);
await assert.rejects(()=>call('test_claim',{...p,checkin_test248:'claim',completed248:true},uid),/บัญชีเดิม/);
const claim={...p,checkin_test248:'claim',completed248:true,amount:99999};
r=await call('test_claim',claim,other);assert.equal(r.test_gems,20);assert(r.checkin233.claimed);assert.equal(r.checkin233.streak,1);
await db.query('update nova_private.test_wallets set gems=gems-5 where user_id=$1',[other]);
r=await call('test_claim',claim,other);assert.equal(r.test_gems,15);
await assert.rejects(()=>call('test_status',{...p,request_id:nonce()},other),/วันนี้แล้ว/);
await db.query("update nova_private.test_checkin_receipts248 set day=day-1 where owner=$1",[other]);
await db.query("update nova_private.test_wallets set claimed_day=claimed_day-1 where user_id=$1",[other]);
const next={owner:other,request_id:nonce(),checkin_test248:'prepare'};
r=await call('test_status',next,other);assert.equal(r.test_receipt248.amount,25);
// A verified production reward winning the same day's race prevents any demo credit.
await db.query("update nova_private.test_wallets set claimed_day=(now() at time zone 'Asia/Bangkok')::date,checkin_reward233=25 where user_id=$1",[other]);
r=await call('test_claim',{...next,checkin_test248:'claim',completed248:true},other);assert.equal(r.test_receipt248.granted,0);assert.equal(r.test_gems,15);
await db.exec('update nova_private.admob_settings230 set enabled=true');r=await call('test_status',{},other);assert(!r.test_checkin248);
await db.exec("update nova_private.admob_settings230 set enabled=false;update nova_private.test_checkin_settings248 set expires_at=now()-interval '1 second'");r=await call('test_status',{},other);assert(!r.test_checkin248);
assert.equal((await db.query("select has_table_privilege('authenticated','nova_private.test_checkin_receipts248','insert') allowed")).rows[0].allowed,false);
assert.equal((await db.query("select has_function_privilege('authenticated','nova_private.test_command_before_demo248(text,jsonb)','execute') allowed")).rows[0].allowed,false);
console.log('PASS demo248 DB: owner validation, fixed reward, daily cap, retry after spend, streak, shared production cap, Telegram exclusion and expiry');await db.close();})().catch(e=>{console.error(e);process.exit(1)});
