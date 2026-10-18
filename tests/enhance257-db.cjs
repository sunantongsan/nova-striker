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

await db.exec(fs.readFileSync('backend/nova_wallet_255.sql','utf8'));
await db.exec(fs.readFileSync('backend/nova_raids_255.sql','utf8'));

// Legacy in-flight jobs remain crystal-funded and must never be charged NOVA on retry.
await db.exec('update public.nova_war_players set crystals=50000,produced_at=now()');
const old=nonce();let r=await call('research',{enhance:'unit:1',enhance_path245:'attack',request_id:old});
await db.exec(fs.readFileSync('backend/nova_enhance_nova_257.sql','utf8'));
await db.query('insert into nova_private.test_wallets(user_id,gems) values($1,50000) on conflict(user_id) do update set gems=50000',[uid]);
const wallet=async()=>+(await db.query('select gems from nova_private.test_wallets where user_id=$1',[uid])).rows[0].gems;
await call('research',{enhance:'unit:1',enhance_path245:'attack',request_id:old});assert.equal(await wallet(),50000);
const id=nonce(),q={enhance:'unit:0',enhance_path245:'attack',request_id:id,enhance_currency257:'NOVA',quoted_cost257:100,quoted_level257:0};
await db.exec('update public.nova_war_players set crystals=0,produced_at=now()');
r=await call('research',q);assert.equal(r.receipt.currency,'NOVA');assert.equal(r.receipt.cost,100);assert.equal(await wallet(),49900);assert.equal(r.crystals,0);assert.equal(r.enhancements['unit:0'],1);assert.equal(r.receipt.pending,false);assert.equal(r.active_upgrades.length,0);assert.equal(r.enhancement_paths245['unit:0'].attack,1);
await call('research',q);assert.equal(await wallet(),49900);
await assert.rejects(()=>call('research',{...q,enhance:'unit:2'}),/รหัสรายการ/);
await assert.rejects(()=>call('research',{...q,enhance_path245:'armor'}),/รหัสรายการ/);
await assert.rejects(()=>call('research',{...q,request_id:nonce(),enhance:'unit:2',quoted_cost257:1}),/ราคาตีบวก/);assert.equal(await wallet(),49900);
await assert.rejects(()=>call('research',{enhance:'unit:2',request_id:nonce()}),/อัปเดตเกม/);
await db.exec("update nova_private.upgrade_jobs225 set finishes_at=now()-interval '1 second'");r=await call('status');assert.equal(r.enhancements['unit:0'],1);assert.equal(r.enhancement_paths245['unit:0'].attack,1);await call('research',q);assert.equal(await wallet(),49900);
await db.exec('update nova_private.test_wallets set gems=99');
await assert.rejects(()=>call('research',{...q,request_id:nonce(),enhance:'unit:2'}),/NOVA ไม่พอ/);assert.equal(await wallet(),99);
await db.exec('update nova_private.test_wallets set gems=10000');
await db.exec("update public.nova_war_players set enhancements=jsonb_set(enhancements,'{building:mine}','9')");
r=await call('research',{...q,enhance:'building:mine',enhance_path245:'production',request_id:nonce(),quoted_level257:9,quoted_cost257:10000});assert.equal(await wallet(),0);assert.equal(r.receipt.level,10);
await db.exec('set role authenticated');await assert.rejects(()=>db.query("select nova_private.command_before_timers225('status','{}')"));await db.exec('reset role');
console.log('PASS NOVA enhancements: zero crystals, atomic charge, quotes, insufficient funds, cap price, legacy jobs, instant paths, replay and private ACL');await db.close();})().catch(e=>{console.error(e);process.exit(1)});
