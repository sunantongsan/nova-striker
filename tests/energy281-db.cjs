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
await call('enroll',{layout:[{type:'hq',lv:15,x:10,y:10},{type:'mine',lv:2,x:9,y:10},{type:'reactor',lv:3,x:8,y:10},{type:'crystalplant',lv:1,x:7,y:10},{type:'tech',lv:5,x:6,y:10}]});

await db.exec(fs.readFileSync('backend/nova_paths_boost_245.sql','utf8'));

await db.exec("alter table auth.users add column created_at timestamptz default now(),add column is_anonymous boolean default false;update auth.users set created_at=now()-interval '1 day'");
await db.exec(fs.readFileSync('supabase/migrations/20261017141227_welcome_bonus_247.sql','utf8'));
await db.exec(fs.readFileSync('supabase/migrations/20261017142921_test_checkin_248.sql','utf8'));
await db.exec('update nova_private.admob_settings230 set enabled=false');
await db.exec(fs.readFileSync('backend/nova_mining_251.sql','utf8'));

await db.exec(fs.readFileSync('backend/nova_wallet_255.sql','utf8'));
await db.exec(fs.readFileSync('backend/nova_raids_255.sql','utf8'));


for(const f of ['nova_enhance_nova_257.sql','nova_retire_crystals_259.sql','nova_raid_rewards_260.sql'])await db.exec(fs.readFileSync('backend/'+f,'utf8'));

await db.exec(fs.readFileSync('backend/nova_battle_economy_262.sql','utf8'));

await db.exec(fs.readFileSync('backend/nova_logistics_277.sql','utf8'));
await db.exec(fs.readFileSync('backend/nova_army_278.sql','utf8'));
await db.exec(fs.readFileSync('backend/nova_building_levels_265.sql','utf8'));
await db.exec(fs.readFileSync('backend/nova_energy_281.sql','utf8'));
function layout(lv,n){return [{type:'hq',x:10,y:10,lv},...Array.from({length:n},(_,i)=>({type:'cannonturret',x:i+1,y:5,lv:1}))];}
await call('enroll',{layout:layout(8,1)});
for(const [lv,cap] of [[7,0],[8,1],[11,1],[12,2],[15,2],[16,3],[20,3]]){await call('publish',{layout:layout(lv,cap)});await assert.rejects(()=>call('publish',{layout:layout(lv,cap+1)}),/จำนวนอาคาร/);}
await assert.rejects(()=>call('publish',{layout:[...layout(16,3),{type:'cannonturret',x:1,y:5,lv:1}]}),/จำนวนอาคาร/);
await db.exec(fs.readFileSync('backend/nova_energy_281.sql','utf8'));
assert.equal((await db.query("select has_function_privilege('authenticated','nova_private.command_before_siege(text,jsonb)','execute') allowed")).rows[0].allowed,false);
assert.equal((await call('status')).active_upgrades.length,0);
console.log('PASS online energy caps: HQ boundaries, maximum three, invalid placement, idempotent migration, private ACL and timer protocol preserved');await db.close();})().catch(e=>{console.error(e);process.exit(1)});

