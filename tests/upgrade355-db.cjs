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
await db.exec(fs.readFileSync('backend/nova_shop_recovery_348.sql','utf8'));
await db.query("update nova_private.titans342 set recovery_until347=now()+interval '1800 seconds',last_ad=null where owner=$1",[uid]);await db.query('update nova_private.test_wallets set gems=1000 where user_id=$1',[uid]);
let hid=nonce();r=await call('test_status',{titan342:'heal',owner:uid,request_id:hid});assert.equal(r.gems,820);assert(!r.state.resting347);r=await call('test_status',{titan342:'heal',owner:uid,request_id:hid});assert.equal(r.gems,820);
await db.query("update nova_private.titans342 set recovery_until347=now()+interval '1800 seconds',last_ad=null where owner=$1",[uid]);hid=nonce();r=await call('test_status',{titan342:'prepare',owner:uid,target:'heal',request_id:hid});assert.equal(r.receipt.provider,'monetag');
await assert.rejects(()=>call('test_status',{titan342:'claim',owner:uid,target:'heal',request_id:hid}),/ให้จบ/);
r=await call('test_status',{titan342:'claim',owner:uid,target:'heal',request_id:hid,completed:true});assert(!r.receipt.claimed);
await db.query('update nova_private.monetag_intents231 set verified_at=now() where owner=$1 and id=$2',[uid,hid]);r=await call('test_status',{titan342:'claim',owner:uid,target:'heal',request_id:hid,completed:true});assert(r.receipt.claimed);assert.equal(r.state.heal_ads348,3);let until2=r.state.recovery_until347;
r=await call('test_status',{titan342:'claim',owner:uid,target:'heal',request_id:hid,completed:true});assert.equal(r.state.recovery_until347,until2);
await assert.rejects(()=>call('test_status',{titan342:'prepare',owner:uid,target:'heal',request_id:nonce()}),/60/);
const hash='a'.repeat(64);await db.exec('set role service_role');let buy=(who,prod,test=true)=>db.query('select public.nova_grant_play348($1,$2,$3,$4,$5) r',[who,hash,prod,'GPA.TEST',test]);
let receipt=(await buy(uid,'nova_5000')).rows[0].r;assert.equal(receipt.nova,5000);assert.equal(receipt.gems,5820);assert(receipt.granted);assert(!(await buy(uid,'nova_5000')).rows[0].r.granted);await assert.rejects(()=>buy(other,'nova_5000'),/another account/);await assert.rejects(()=>buy(uid,'nova_5000',false),/Real purchases/);await db.exec('reset role');
assert.equal((await db.query("select has_function_privilege('authenticated','public.nova_grant_play348(uuid,text,text,text,boolean)','execute') ok")).rows[0].ok,false);

await db.exec(fs.readFileSync('backend/nova_upgrade_deploy_355.sql','utf8'));
await db.query('update nova_private.test_wallets set gems=50000 where user_id=$1',[uid]);
let up=nonce();r=await send({titan342:'upgrade',request_id:up});
assert.equal(r.state.level,1);assert(r.state.upgrading355);assert.equal(r.state.upgrade_level355,2);assert.equal(r.gems,47500);
let finish=Date.parse(r.state.upgrade_until355);assert(Math.abs(finish-Date.now()-259200000)<5000);
r=await send({titan342:'upgrade',request_id:up});assert.equal(r.gems,47500);assert.equal(Date.parse(r.state.upgrade_until355),finish);
await assert.rejects(()=>send({titan342:'upgrade',request_id:nonce()}),/กำลังอัปเกรด/);
await assert.rejects(()=>send({titan342:'upgrade',owner:other,request_id:nonce()}),/บัญชีเดิม/);
await db.query('update nova_private.titans342 set last_ad=null where owner=$1',[uid]);let ad=nonce();
r=await send({titan342:'prepare',target:'speed',request_id:ad});assert.equal(r.receipt.provider,'monetag');
r=await send({titan342:'claim',target:'speed',request_id:ad,completed:true});assert(!r.receipt.claimed);assert.equal(Date.parse(r.state.upgrade_until355),finish);
await db.query('update nova_private.monetag_intents231 set verified_at=now() where owner=$1 and id=$2',[uid,ad]);
r=await send({titan342:'claim',target:'speed',request_id:ad,completed:true});assert(r.receipt.claimed);assert.equal(Date.parse(r.state.upgrade_until355),finish-500000);assert.equal(r.state.level,1);
r=await send({titan342:'claim',target:'speed',request_id:ad,completed:true});assert.equal(Date.parse(r.state.upgrade_until355),finish-500000);
let speed=nonce();r=await send({titan342:'speed',request_id:speed});assert.equal(r.state.level,2);assert(!r.state.upgrading355);const paid=r.gems;
r=await send({titan342:'speed',request_id:speed});assert.equal(r.gems,paid);
r=await send({titan342:'upgrade',request_id:nonce()});assert.equal(r.state.level,2);assert.equal(r.state.upgrade_level355,3);assert.equal(r.gems,paid-10000);
await db.query("update nova_private.titans342 set upgrade_until355=now()-interval '1 second' where owner=$1",[uid]);
r=await send();assert.equal(r.state.level,3);assert(!r.state.upgrading355);
await assert.rejects(()=>send({titan342:'upgrade',request_id:nonce()}),/อัปเกรดไม่ได้/);
// A fresh paid order rolls back completely if its wallet cannot cover the cost.
await db.query('update nova_private.titans342 set level=1 where owner=$1',[uid]);await db.query('update nova_private.test_wallets set gems=0 where user_id=$1',[uid]);
await assert.rejects(()=>send({titan342:'upgrade',request_id:nonce()}),/NOVA/);r=await send();assert.equal(r.state.level,1);assert(!r.state.upgrading355);
// Completing the existing video-payment alternative also starts a timer, never grants an instant tier.
await db.query("update nova_private.titans342 set last_ad=null,ads='{"+'"upgrade":49'+"}' where owner=$1",[uid]);ad=nonce();
await send({titan342:'prepare',target:'upgrade',request_id:ad});await db.query('update nova_private.monetag_intents231 set verified_at=now() where owner=$1 and id=$2',[uid,ad]);
r=await send({titan342:'claim',target:'upgrade',request_id:ad,completed:true});assert.equal(r.state.level,1);assert(r.state.upgrading355);

await db.query("update nova_private.titans342 set recovery_until347=now()-interval '1 second' where owner=$1",[uid]);
const battlefield=nonce(),layout355=[{type:'hq',lv:10,x:10,y:10},{type:'wall',lv:1,x:11,y:10},{type:'landmine',lv:1,x:12,y:12}];
await db.query(`insert into nova_private.sieges(id,defender,host,target,ends_at) values($1,$2,$3,$4,now()+interval '1 hour')`,[battlefield,other,uid,JSON.stringify({layout:layout355})]);
await db.query(`insert into nova_private.siege_members(room,owner,nonce,roster,army) values($1,$2,$3,'[4,0,0,0,0,0,0,0,0,0,0]','[4,0,0,0,0,0,0,0,0,0,0]')`,[battlefield,uid,nonce()]);
let order=nonce();await call('status',{live:'siege_deploy',id:battlefield,request_id:order,kind:0,x:8,y:8});
await call('status',{live:'siege_deploy',id:battlefield,request_id:order,kind:0,x:8,y:8});
assert.equal((await db.query('select count(*)::int n from nova_private.siege_orders where nonce=$1',[order])).rows[0].n,1);
await assert.rejects(()=>call('status',{live:'siege_deploy',id:battlefield,request_id:nonce(),kind:0,x:10,y:10}),/อาคาร/);
await assert.rejects(()=>call('status',{live:'siege_deploy',id:battlefield,request_id:nonce(),kind:0,x:11,y:10}),/อาคาร/);
await assert.rejects(()=>call('status',{live:'siege_deploy',id:battlefield,request_id:nonce(),kind:0,x:-1,y:8}));
await call('status',{live:'siege_deploy',id:battlefield,request_id:nonce(),kind:0,x:12,y:12});
await assert.rejects(()=>call('test_status',{titan342:'deploy',room:battlefield,request_id:nonce(),x:10,y:10}),/อาคาร/);
await call('test_status',{titan342:'deploy',room:battlefield,request_id:nonce(),x:8,y:9});
assert.equal((await db.query('select count(*)::int n from nova_private.siege_orders where room=$1 and titan342 is not null',[battlefield])).rows[0].n,1);
for(const name of ['siege_command_before_enhance','titan_combat_before347']){const body=(await db.query("select prosrc from pg_proc where pronamespace='nova_private'::regnamespace and proname=$1",[name])).rows[0].prosrc;assert(!body.includes('not(xx<2'));assert(body.includes("b->>'type' not in('landmine','silo')"));}
assert.equal((await db.query("select has_function_privilege('authenticated','nova_private.titan_state_before355(uuid)','execute') ok")).rows[0].ok,false);
console.log('PASS upgrade355 DB: 72-hour tiers, paid/video speed, verified receipts, replay, time settlement, balance rollback, max tier, owner and ACL checks');
await db.close();})().catch(e=>{console.error(e);process.exitCode=1;});
