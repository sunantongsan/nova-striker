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

await db.exec(fs.readFileSync('backend/nova_guardian_orders_345.sql','utf8'));
const send=(mode,p={},who=uid)=>call('test_status',{titan342:mode,owner:who,request_id:nonce(),...p},who);
await db.query('update public.nova_war_players set resource_gold=1700000,resource_power=1700000,gold_cap=10000000,power_cap=10000000 where user_id=$1',[uid]);
let id=nonce(),r=await send('order',{request_id:id});assert.equal(r.state.gold,1700000);assert.equal(r.state.power,1700000);assert.equal(r.state.remaining_nova345,1660);assert.equal(r.state.remaining_ads345,9);assert(!r.state.finishes_at);
r=await send('order',{request_id:id});assert.equal(r.state.gold,1700000);await assert.rejects(()=>send('order'),/สั่งสร้าง/);
await db.query('update nova_private.test_wallets set gems=0 where user_id=$1',[uid]);await assert.rejects(()=>send('complete'),/NOVA/);r=await send('status');assert.equal(r.state.gold,1700000);
await send('wait');await db.query('update public.nova_war_players set resource_gold=1000000,resource_power=1000000 where user_id=$1',[uid]);r=await send('status');assert.equal(r.state.gold,2700000);assert.equal(r.state.power,2700000);assert(!r.state.finishes_at);
await db.query('update public.nova_war_players set resource_gold=7300000,resource_power=7300000 where user_id=$1',[uid]);r=await send('status');assert(r.state.finishes_at);assert.equal(r.state.speed_ads345,10);assert.equal(r.state.gold,10000000);await assert.rejects(()=>send('complete'),/ค้างชำระ/);
for(let i=0;i<10;i++){await db.query("update nova_private.titans342 set last_ad=now()-interval '61 seconds' where owner=$1",[uid]);id=nonce();r=await send('prepare',{target:'speed',request_id:id});assert.equal(r.receipt.provider,'monetag');let old=r.state.finishes_at;r=await send('claim',{target:'speed',request_id:id,completed:true});assert.equal(r.state.finishes_at,old);await db.query('update nova_private.monetag_intents231 set verified_at=now() where owner=$1 and id=$2',[uid,id]);r=await send('claim',{target:'speed',request_id:id,completed:true});assert(r.receipt.claimed);if(i===9)assert.equal(r.state.level,1);}
await call('enroll',{layout:[{type:'hq',lv:10,x:10,y:10}]},other);
await db.query('update public.nova_war_players set resource_gold=0,resource_power=0 where user_id=$1',[other]);r=await send('order',{},other);assert.equal(r.state.remaining_ads345,10);
for(let i=0;i<10;i++){await db.query("update nova_private.titans342 set last_ad=now()-interval '61 seconds' where owner=$1",[other]);id=nonce();r=await send('prepare',{target:'resources',request_id:id},other);assert.equal(r.receipt.provider,'admob');await assert.rejects(()=>send('claim',{target:'resources',request_id:id},other),/ให้จบ/);await db.query('update nova_private.admob_intents230 set verified_at=now() where owner=$1 and id=$2',[other,id]);r=await send('claim',{target:'resources',request_id:id,completed:true},other);assert(r.receipt.claimed);assert.equal(r.state.gold+r.state.power,(i+1)*2000000);let finished=r.state.finishes_at;r=await send('claim',{target:'resources',request_id:id,completed:true},other);assert.equal(r.state.finishes_at,finished);if(i<9)await assert.rejects(()=>send('prepare',{target:'resources'},other),/60/);}
assert(r.state.finishes_at);assert.equal(r.state.remaining_ads345,0);
await db.query("update nova_private.titans342 set ordered345=false,waiting345=false,level=0,gold=0,power=0,finishes_at=null where owner=$1",[other]);await db.query('update public.nova_war_players set resource_gold=0,resource_power=0 where user_id=$1',[other]);await send('order',{},other);await db.query('update nova_private.test_wallets set gems=2000 where user_id=$1',[other]);id=nonce();r=await send('complete',{request_id:id},other);assert.equal(r.gems,0);assert(r.state.finishes_at);r=await send('complete',{request_id:id},other);assert.equal(r.gems,0);
assert.equal((await db.query("select has_function_privilege('anon','nova_private.titan_command342(jsonb)','execute') ok")).rows[0].ok,false);
console.log('PASS guardian345 DB: atomic available-resource debit, waiting accumulation before timer, shortage quote, NOVA rollback/replay, ten verified ads, cooldown and private access');await db.close();})().catch(e=>{console.error(e);process.exitCode=1;});
