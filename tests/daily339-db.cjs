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
await db.exec(fs.readFileSync('backend/nova_wallet_255.sql','utf8'));await db.exec(fs.readFileSync('backend/nova_daily_339.sql','utf8'));
await assert.rejects(()=>call('test_status',{mining251:'prepare',request_id:nonce()},other),/เช็คอินรายวัน/);
let r=await call('test_status',{checkin233:true},other);assert(r.test_checkin248);let id=nonce();r=await call('test_status',{checkin_test248:'prepare',owner:other,request_id:id},other);assert.equal(r.test_receipt248.amount,20);await assert.rejects(()=>call('test_claim',{checkin_test248:'claim',owner:other,request_id:id},other),/ให้ครบ/);r=await call('test_claim',{checkin_test248:'claim',owner:other,request_id:id,completed248:true},other);assert.equal(r.test_receipt248.granted,20);let balance=r.test_gems;r=await call('test_claim',{checkin_test248:'claim',owner:other,request_id:id,completed248:true},other);assert.equal(r.test_gems,balance);await assert.rejects(()=>call('test_status',{checkin_test248:'prepare',owner:other,request_id:nonce()},other),/วันนี้แล้ว/);
// Legacy balance remains claimable and cannot be turned into a new mining session.
r=await call('test_status',{mining251:'status'},other);await db.query('update nova_private.miners251 set earned=100 where owner=$1',[other]);id=nonce();r=await call('test_status',{mining251:'prepare',purpose:'wallet',amount:25,request_id:id},other);r=await call('test_claim',{mining251:'claim',purpose:'wallet',request_id:id,completed:true},other);assert.equal(r.mining251.credited,25);assert.equal(r.mining251.unclaimed,75);r=await call('test_claim',{mining251:'claim',purpose:'wallet',request_id:id,completed:true},other);assert.equal(r.mining251.credited,25);
await assert.rejects(()=>call('test_status',{mining251:'prepare',purpose:'wallet',amount:10,owner:uid,request_id:nonce()},other),/บัญชีเดิม/);
// Real provider path still requires verified postback plus explicit completion.
await db.exec('update nova_private.admob_settings230 set enabled=true');id=nonce();let p={owner:uid,request_id:id,kind:'checkin',monetag231:'prepare'};r=await call('research',p,uid,true);assert.equal(r.ad_reward.amount,20);r=await call('research',{...p,monetag231:'claim',completed234:true},uid,true);assert(!r.ad_reward.claimed);await db.query('update nova_private.monetag_intents231 set verified_at=now() where id=$1',[id]);r=await call('research',{...p,monetag231:'claim',completed234:true},uid,true);assert.equal(r.ad_reward.granted,20);r=await call('research',{...p,monetag231:'claim',completed234:true},uid,true);assert.equal(r.ad_reward.granted,20);assert.equal(r.test_gems,20);
console.log('PASS daily339 DB: session retirement, daily cap, verified ads, duplicate protection, legacy recovery and account isolation');await db.close();})().catch(e=>{console.error(e);process.exitCode=1;});
