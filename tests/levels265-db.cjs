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


for(const f of ['nova_enhance_nova_257.sql','nova_retire_crystals_259.sql','nova_raid_rewards_260.sql','nova_reward_receipt_263.sql'])await db.exec(fs.readFileSync('backend/'+f,'utf8'));

await db.exec(fs.readFileSync('backend/nova_speed_ads_264.sql','utf8'));
const target={kind:'building',id:1,started:123,level:1},p={owner:uid,request_id:nonce(),target};
let r=await call('test_status',{speed264:'prepare',...p});assert.equal(r.receipt.provider,'monetag');assert.equal(r.receipt.seconds,500);
await assert.rejects(()=>call('test_claim',{speed264:'claim',...p}),/ดูโฆษณา/);
r=await call('test_claim',{speed264:'claim',...p,completed:true,seconds:999999});assert(!r.receipt.claimed);
await assert.rejects(()=>call('test_claim',{speed264:'claim',...p,completed:true},other),/บัญชี/);
await assert.rejects(()=>call('test_claim',{speed264:'claim',...p,target:{...target,id:2},completed:true}),/งาน/);
await db.query('update nova_private.monetag_intents231 set verified_at=now() where id=$1',[p.request_id]);r=await call('test_claim',{speed264:'claim',...p,completed:true});assert(r.receipt.claimed);assert.equal(r.receipt.seconds,500);const receipt=r.receipt;r=await call('test_claim',{speed264:'claim',...p,completed:true});assert.deepEqual(r.receipt,receipt);
// Test mode is explicit and never substituted for a real provider.
await db.query('delete from nova_private.telegram_accounts231 where user_id=$1',[uid]);const q={...p,request_id:nonce(),target:{kind:'training',keys:['queue-1']}};r=await call('test_status',{speed264:'prepare',...q});assert.equal(r.receipt.provider,'test');await db.exec('update nova_private.test_checkin_settings248 set enabled=false');r=await call('test_claim',{speed264:'claim',...q,completed:true});assert(!r.receipt.claimed);await db.exec('update nova_private.test_checkin_settings248 set enabled=true');r=await call('test_claim',{speed264:'claim',...q,completed:true});assert(r.receipt.claimed);
// Actual timed server job: one ad subtracts 500 seconds and replay cannot subtract again.
const job=nonce();await db.query("insert into nova_private.upgrade_jobs225(owner,request_id,job_key,category,item,target_level,finishes_at) values($1,$2,'research:weapon','research','weapon',1,now()+interval '900 seconds')",[uid,job]);
const j={...p,request_id:nonce(),target:{kind:'server',id:job}};r=await call('test_status',{speed264:'prepare',...j});
const end=async()=>(await db.query('select finishes_at from nova_private.upgrade_jobs225 where owner=$1 and request_id=$2',[uid,job])).rows[0].finishes_at;
const before=await end();r=await call('test_claim',{speed264:'claim',...j,completed:true});assert.equal(r.receipt.seconds,500);const after=await end();assert.equal(new Date(before)-new Date(after),500000);await call('test_claim',{speed264:'claim',...j,completed:true});assert.equal(String(await end()),String(after));
await db.exec('update nova_private.admob_settings230 set enabled=true');const a={...p,request_id:nonce()};r=await call('test_status',{speed264:'prepare',...a});assert.equal(r.receipt.provider,'admob');r=await call('test_claim',{speed264:'claim',...a,completed:true,provider:'test'});assert(!r.receipt.claimed);await db.query('update nova_private.admob_intents230 set verified_at=now() where id=$1',[a.request_id]);r=await call('test_claim',{speed264:'claim',...a,completed:true});assert(r.receipt.claimed);
await db.exec('set role authenticated');await assert.rejects(()=>db.query('select * from nova_private.speed_ads264'));await assert.rejects(()=>db.query("select nova_private.speed264('{}')"));await db.exec('reset role');
await db.exec(fs.readFileSync('backend/nova_building_levels_265.sql','utf8'));
const layout=[{type:'hq',lv:20,x:10,y:10},{type:'mine',lv:20,x:9,y:10},{type:'reactor',lv:20,x:8,y:10},{type:'tech',lv:20,x:6,y:10}];
await call('publish',{layout});
assert.equal((await db.query('select nova_private.hq255($1::jsonb) as h',[JSON.stringify(layout)])).rows[0].h,20);
for(const bad of [0,21,1.5])await assert.rejects(()=>call('publish',{layout:layout.map(b=>({...b,lv:bad}))}));
const stored=(await db.query('select layout from public.nova_war_players where user_id=$1',[uid])).rows[0].layout;assert(stored.every(b=>b.lv===20));
console.log('PASS levels265 DB: publish/reload20, reject0/21/fraction, HQ matchmaking20');
console.log('PASS speed264 DB: fixed500s, completed/verified video, immutable task, all providers, replay, server timer, owner binding, private ACL');await db.close();})().catch(e=>{console.error(e);process.exit(1)});
