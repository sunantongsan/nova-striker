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
await db.exec(fs.readFileSync('backend/nova_weekly_checkin_340.sql','utf8'));

for(const f of ['nova_raids_255.sql','nova_enhance_nova_257.sql','nova_retire_crystals_259.sql','nova_raid_rewards_260.sql','nova_battle_economy_262.sql','nova_logistics_277.sql','nova_speed_ads_264.sql'])await db.exec(fs.readFileSync('backend/'+f,'utf8'));
await db.exec(fs.readFileSync('backend/nova_titan_342.sql','utf8'));
await db.exec('update nova_private.admob_settings230 set enabled=true');

await db.exec(fs.readFileSync('backend/nova_guardian_orders_345.sql','utf8'));await db.exec(fs.readFileSync('backend/nova_guardian_ad_budget_346.sql','utf8'));
await db.exec(fs.readFileSync('backend/nova_guardian_recovery_347.sql','utf8'));
const send=(p={},who=uid)=>call('test_status',{titan342:'status',owner:who,...p},who);
await db.query('insert into nova_private.titans342(owner,level) values($1,1),($2,1) on conflict(owner) do update set level=1',[uid,other]);
let r=await send({recovery347:{id:'test-injury-001',fraction:.5}});assert(r.state.resting347);let until=r.state.recovery_until347;assert(Math.abs(Date.parse(until)-Date.now()-900000)<5000);
r=await send({recovery347:{id:'test-injury-001',fraction:.5}});assert.equal(r.state.recovery_until347,until);
r=await send({recovery347:{id:'test-injury-002',fraction:1}});assert.equal(r.state.recovery_until347,until);
await assert.rejects(()=>send({owner:other,recovery347:{id:'test-foreign',fraction:0}}),/บัญชีเดิม/);
await assert.rejects(()=>send({recovery347:{id:'test-invalid',fraction:-1}}));
r=await send({recovery347:{id:'test-destroyed',fraction:0}});assert(r.state.recovery_destroyed347);assert(Math.abs(Date.parse(r.state.recovery_until347)-Date.now()-1800000)<5000);
await assert.rejects(()=>call('test_status',{titan342:'deploy',room:nonce(),x:1,y:1,request_id:nonce()}),/พักฟื้น/);
await db.query("update nova_private.titans342 set recovery_until347=now()-interval '1 second' where owner=$1",[uid]);r=await send();assert(!r.state.resting347);
await call('enroll',{layout:[{type:'hq',lv:10,x:10,y:10}]},other);const room=nonce();await db.query(`insert into nova_private.sieges(id,defender,host,target,frame,ends_at) values($1,$2,$3,'{}',$4,now()+interval '1 hour')`,[room,other,uid,JSON.stringify({guards:[[10,1,1,0,16000]],titans342:{guards:[{i:0,level:1}],troops:[]}})]);
await db.query('update nova_private.sieges set finished_at=now() where id=$1',[room]);r=await send({},other);assert(r.state.resting347&&r.state.recovery_destroyed347);until=r.state.recovery_until347;
await db.query('update nova_private.sieges set finished_at=now() where id=$1',[room]);r=await send({},other);assert.equal(r.state.recovery_until347,until);
assert.equal((await db.query("select has_function_privilege('anon','nova_private.titan_command342(jsonb)','execute') ok")).rows[0].ok,false);
console.log('PASS recovery DB: persistence, proportional duration, replay, no healing/foreign writes, deployment gate, offline defender and once-only settlement');await db.close();})().catch(e=>{console.error(e);process.exitCode=1;});
