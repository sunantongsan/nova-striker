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

// Keep existing bonuses and finish an already-paid job after retirement.
await db.exec("update public.nova_war_players set crystals=50000,research='{\"weapon\":2,\"armor\":3}',tier=4,enhancements='{\"unit:0\":2}'");
const old=nonce();await call('research',{kind:'weapon',economyVersion:2,request_id:old});
await db.exec(fs.readFileSync('backend/nova_enhance_nova_257.sql','utf8'));
await db.exec(fs.readFileSync('backend/nova_retire_crystals_259.sql','utf8'));
let backup=(await db.query('select * from nova_private.crystal_retirement259_backup where owner=$1',[uid])).rows[0];assert(backup.crystals>0);assert(backup.layout.some(b=>b.type==='crystalplant'));
let r=await call('status');assert.equal(r.crystals,0);assert.equal(r.rate,0);assert.equal(r.capacity,0);assert.equal(r.enhancements['unit:0'],2);assert.equal(r.research.armor,3);assert.equal(r.tier,4);
let row=(await db.query('select layout from public.nova_war_players where user_id=$1',[uid])).rows[0];assert(!row.layout.some(b=>b.type.startsWith('crystal')));
await db.exec("update nova_private.upgrade_jobs225 set finishes_at=now()-interval '1 second'");r=await call('status');assert.equal(r.research.weapon,3);
r=await call('research',{kind:'armor',request_id:nonce()});assert(r.receipt.cancelled);assert.equal(r.research.armor,3);
r=await call('infrastructure',{kind:'crystalplant',request_id:nonce()});assert(r.receipt.cancelled);
r=await call('fund',{kind:'upgrade',index:1,level:8,economyVersion:2,request_id:nonce()});assert.equal(r.receipt.cost,0);assert.equal(r.crystals,0);
await assert.rejects(()=>call('research',{resource233:'quote',kind:'crystals',owner:uid}),/ทรัพยากร/);
await assert.rejects(()=>call('research',{resource233:'quote',kind:'bundle',owner:uid,needs:{crystals:1}}),/ทรัพยากร/);
await db.query('insert into nova_private.test_wallets(user_id,gems) values($1,50000) on conflict(user_id) do update set gems=50000',[uid]);
r=await call('research',{enhance:'unit:0',enhance_path245:'attack',request_id:nonce(),enhance_currency257:'NOVA',quoted_cost257:900,quoted_level257:2});assert.equal(r.enhancements['unit:0'],3);assert.equal(r.receipt.currency,'NOVA');assert.equal(r.crystals,0);
r=await call('publish',{layout:[{type:'hq',lv:15,x:10,y:10},{type:'crystalplant',lv:4,x:8,y:9},{type:'mine',lv:3,x:7,y:9}]});row=(await db.query('select layout from public.nova_war_players where user_id=$1',[uid])).rows[0];assert.equal(row.layout.length,2);
await db.exec('set role authenticated');await assert.rejects(()=>db.query('select * from nova_private.crystal_retirement259_backup'));await assert.rejects(()=>db.query("select nova_private.command_before_siege('status','{}')"));await db.exec('reset role');
console.log('PASS crystal retirement: migration preserves bonuses, paid jobs, no production/exchange, legacy fund recovery, Duck Coins enhancement, stale layouts, ACL');await db.close();})().catch(e=>{console.error(e);process.exit(1)});
