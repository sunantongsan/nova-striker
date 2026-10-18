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
await call('enroll',{layout:[{type:'hq',lv:15,x:10,y:10}]},other);
await db.exec('update public.nova_war_players set resource_gold=10000,resource_power=8000,gold_rate=0,power_rate=0,gold_delta=0,power_delta=0,resource_at=now()');
const room=nonce();await db.query("insert into nova_private.sieges(id,defender,host,target,frame) values($1,$2,$3,'{\"layout\":[{\"type\":\"hq\",\"lv\":15}]}','{\"buildings\":[[0]]}')",[room,other,uid]);
await db.query("insert into nova_private.siege_members(room,owner,nonce,roster,army,merc) values($1,$2,$3,'[0,0,0,0,0,0,0,0,0,0,0]','[0,0,0,0,0,0,0,0,0,0,0]',0)",[room,uid,nonce()]);
await db.query("insert into nova_private.siege_orders(room,owner,nonce,kind,x,y,alien,level) values($1,$2,$3,0,0,2,false,1)",[room,uid,nonce()]);await db.query('update nova_private.sieges set ack=(select max(id) from nova_private.siege_orders) where id=$1',[room]);
const balance=async(who=uid)=>(await db.query('select resource_gold,resource_power,gold_delta,power_delta from public.nova_war_players where user_id=$1',[who])).rows[0];
const before=await balance();await db.query('select nova_private.siege_finish($1)',[room]);assert.deepEqual(await balance(),before,'finish cannot credit resources');assert.equal(Number((await balance(other)).resource_gold),5000);
let r=await call('test_status',{raid260:'status'});assert.equal(r.pending.length,1);assert.equal(r.pending[0].nova,40);assert.equal(r.pending[0].gold,5000);assert.equal(r.pending[0].power,4000);
const id=nonce(),p={battle:room,owner:uid,request_id:id};r=await call('test_status',{raid260:'prepare',...p});assert.equal(r.receipt.provider,'monetag');
await assert.rejects(()=>call('test_claim',{raid260:'claim',...p}),/ดูโฆษณา/);
r=await call('test_claim',{raid260:'claim',...p,completed:true,nova:999999});assert(!r.receipt.claimed);assert.deepEqual(await balance(),before,'client completion cannot bypass real ad verification');
await assert.rejects(()=>call('test_claim',{raid260:'claim',...p,completed:true},other),/บัญชี/);
await db.query('update nova_private.monetag_intents231 set verified_at=now() where id=$1',[id]);r=await call('test_claim',{raid260:'claim',...p,completed:true});assert(r.receipt.claimed);assert.deepEqual(r.receipt.granted,{gold:5000,power:4000,nova:40});assert.equal(r.pending.length,0);assert.equal(Number((await balance()).gold_delta),5000);
const paid=await balance();r=await call('test_claim',{raid260:'claim',...p,completed:true});assert.deepEqual(await balance(),paid);assert.deepEqual(r.receipt.granted,{gold:5000,power:4000,nova:40});assert.equal(Number((await db.query("select sum(amount) n from nova_private.mining_ledger251 where owner=$1 and kind='raid'",[uid])).rows[0].n),40);
await db.query('select nova_private.siege_finish($1)',[room]);assert.deepEqual(await balance(),paid);
// Test ads require the explicit test feature flag; no real provider fallback from a spoofed payload.
const battle2=nonce();await db.query("insert into public.nova_war_reports(attacker,defender,request_id,tactic,destruction,loot,loot_gold,loot_power) values($1,$2,$3,'siege',100,0,20,30)",[other,uid,battle2]);
const q={battle:battle2,request_id:nonce(),owner:other};r=await call('test_status',{raid260:'prepare',...q},other);assert.equal(r.receipt.provider,'test');await db.exec('update nova_private.test_checkin_settings248 set enabled=false');r=await call('test_claim',{raid260:'claim',...q,completed:true},other);assert(!r.receipt.claimed);await db.exec('update nova_private.test_checkin_settings248 set enabled=true');r=await call('test_claim',{raid260:'claim',...q,completed:true},other);assert(r.receipt.claimed);
// AdMob also waits for SSV and grants only once with several intents for the same battle.
await db.exec('update nova_private.admob_settings230 set enabled=true');const battle3=nonce();await db.query("insert into public.nova_war_reports(attacker,defender,request_id,tactic,destruction,loot,loot_gold,loot_power) values($1,$2,$3,'siege',50,0,100,100)",[other,uid,battle3]);
const z={battle:battle3,request_id:nonce(),owner:other};r=await call('test_status',{raid260:'prepare',...z},other);assert.equal(r.receipt.provider,'admob');r=await call('test_claim',{raid260:'claim',...z,completed:true,provider:'test'},other);assert(!r.receipt.claimed);await db.query('update nova_private.admob_intents230 set verified_at=now() where id=$1',[z.request_id]);await db.query('update public.nova_war_players set resource_gold=gold_cap-7,resource_power=power_cap-3,resource_at=now() where user_id=$1',[other]);r=await call('test_claim',{raid260:'claim',...z,completed:true},other);assert(r.receipt.claimed);assert.deepEqual(r.receipt.granted,{gold:7,power:3,nova:0});
for(const name of ['command_before_siege(text,jsonb)','live_finish(uuid)','siege_finish(uuid)']){const src=(await db.query('select pg_get_functiondef($1::regprocedure) s',['nova_private.'+name])).rows[0].s;assert(!src.includes('gold_delta=gold_delta+gl'));assert(!src.includes('gold_delta=gold_delta+gold_loot'));}
await db.exec('set role authenticated');await assert.rejects(()=>db.query('select * from nova_private.raid_rewards260'));await assert.rejects(()=>db.query("select nova_private.raid260('{\"raid260\":\"status\"}')"));await db.exec('reset role');
console.log('PASS raid260: actual settlement escrow, defender loss, completed/verified ads, provider spoofing, replay, recovery, ownership, ACL');await db.close();})().catch(e=>{console.error(e);process.exit(1)});
