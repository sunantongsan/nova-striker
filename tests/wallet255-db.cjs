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
let r=await call('test_status',{mining251:'status'});await db.query('update nova_private.miners251 set earned=1000,credited=100 where owner=$1',[uid]);
r=await call('test_status',{mining251:'status'});assert.equal(r.mining251.credited,100);assert.equal(r.mining251.unclaimed,900);
let id=nonce();r=await call('test_status',{mining251:'prepare',purpose:'wallet',amount:200,request_id:id});assert.equal(r.mining251.receipt.amount,200);
let walletBefore=r.test_gems;
r=await call('test_claim',{mining251:'claim',purpose:'wallet',request_id:id,completed:true,amount:900});assert(!r.mining251.receipt.claimed);assert.equal(r.test_gems,walletBefore);
await assert.rejects(()=>call('test_claim',{mining251:'claim',request_id:id,completed:true},other),/บัญชี/);
await db.query('update nova_private.monetag_intents231 set verified_at=now() where id=$1',[id]);
r=await call('test_claim',{mining251:'claim',purpose:'wallet',request_id:id,completed:true,amount:900});assert(r.mining251.receipt.claimed);assert.equal(r.test_gems,walletBefore+200);assert.equal(r.mining251.unclaimed,700);assert.equal(r.mining251.credited,300);
r=await call('test_claim',{mining251:'claim',request_id:id,completed:true});assert.equal(r.test_gems,walletBefore+200);assert.equal(r.mining251.unclaimed,700);
for(const amount of [0,-1,1.5,701,'NaN'])await assert.rejects(()=>call('test_status',{mining251:'prepare',purpose:'wallet',amount,request_id:nonce()}));
assert.equal((await db.query("select count(*) n from nova_private.mining_ledger251 where kind='wallet_claim' and source=$1",[id])).rows[0].n,1);
// An independent test-provider account never receives automatic wallet credit either.
await call('test_status',{mining251:'status'},other);await db.query('update nova_private.miners251 set earned=50.75 where owner=$1',[other]);id=nonce();await call('test_status',{mining251:'prepare',purpose:'wallet',amount:25,request_id:id},other);r=await call('test_claim',{mining251:'claim',request_id:id,completed:true},other);assert.equal(r.mining251.unclaimed,25.75);assert.equal(r.mining251.credited,25);
for(const [a,d,n] of [[10,10,40],[10,9,32],[10,8,24],[10,5,0],[10,11,44],[10,13,52],[1,15,52]])assert.equal((await db.query('select nova_private.raid_rate255($1,$2) n',[a,d])).rows[0].n,n);
await call('enroll',{layout:[{type:'hq',lv:1,x:10,y:10}]},other);
assert((await db.query('select nova_private.match255($1,$2) ok',[uid,other])).rows[0].ok,'few players: all levels');
// Test actual siege finalization: full storages cannot prevent defender loss; rewards never debit defender.
await db.query("update public.nova_war_players set crystals=100,resource_gold=10000,resource_power=8000,resource_at=now(),produced_at=now() where user_id=$1",[other]);
const room=nonce();await db.query("insert into nova_private.sieges(id,defender,host,target,frame) values($1,$2,$3,'{\"layout\":[{\"type\":\"hq\",\"lv\":1}]}','{\"buildings\":[[0]]}')",[room,other,uid]);
await db.query("insert into nova_private.siege_members(room,owner,nonce,roster,army,merc) values($1,$2,$3,'[0,0,0,0,0,0,0,0,0,0,0]','[0,0,0,0,0,0,0,0,0,0,0]',0)",[room,uid,nonce()]);
await db.query("insert into nova_private.siege_orders(room,owner,nonce,kind,x,y,alien,level) values($1,$2,$3,0,0,2,false,1)",[room,uid,nonce()]);await db.query('update nova_private.sieges set ack=(select max(id) from nova_private.siege_orders) where id=$1',[room]);
await db.query('select nova_private.siege_finish($1)',[room]);let defender=(await db.query('select crystals,resource_gold,resource_power,extract(epoch from(shield_until-now())) seconds from public.nova_war_players where user_id=$1',[other])).rows[0];assert.equal(defender.crystals,50);assert.equal(defender.resource_gold,5000);assert.equal(defender.resource_power,4000);assert(Number(defender.seconds)>14395);
const before=(await db.query('select gems from nova_private.test_wallets where user_id=$1',[other])).rows[0].gems;await db.query('select nova_private.siege_finish($1)',[room]);assert.equal((await db.query('select gems from nova_private.test_wallets where user_id=$1',[other])).rows[0].gems,before);
// Stronger opponent produces Duck Coins, report replay cannot create a second credit.
await db.query("update public.nova_war_players set layout='[{\"type\":\"hq\",\"lv\":10}]' where user_id=$1",[uid]);await db.query("update public.nova_war_players set layout='[{\"type\":\"hq\",\"lv\":11}]' where user_id=$1",[other]);
const rid=nonce();await db.query("insert into public.nova_war_reports(attacker,defender,request_id,tactic,destruction,loot,loot_gold,loot_power) values($1,$2,$3,'siege',100,0,0,0) on conflict(attacker,request_id) do nothing",[uid,other,rid]);
let credited=(await db.query('select credited from nova_private.miners251 where owner=$1',[uid])).rows[0].credited;assert.equal(credited,344);
await db.query("insert into public.nova_war_reports(attacker,defender,request_id,tactic,destruction,loot,loot_gold,loot_power) values($1,$2,$3,'siege',100,0,0,0) on conflict(attacker,request_id) do nothing",[uid,other,rid]);assert.equal((await db.query('select credited from nova_private.miners251 where owner=$1',[uid])).rows[0].credited,credited);
for(let k=3;k<=100;k++){const u='10000000-0000-4000-8000-'+String(k).padStart(12,'0');await db.query('insert into auth.users(id) values($1)',[u]);await db.query('insert into nova_private.miners251(owner,code,code_key) values($1,$2,$2)',[u,'member'+k]);}
await db.query("update public.nova_war_players set layout='[{\"type\":\"hq\",\"lv\":4}]' where user_id=$1",[other]);assert(!(await db.query('select nova_private.match255($1,$2) ok',[uid,other])).rows[0].ok);await db.query("update public.nova_war_players set layout='[{\"type\":\"hq\",\"lv\":5}]' where user_id=$1",[other]);assert((await db.query('select nova_private.match255($1,$2) ok',[uid,other])).rows[0].ok);
// Browse and direct start both enforce the 100-account gate; shields still block eligible targets.
await db.query("update public.nova_war_players set layout='[{\"type\":\"hq\",\"lv\":4}]',shield_until=now()-interval '1 second' where user_id=$1",[other]);
let targets=await call('targets');assert(!targets.targets.some(t=>t.id===other));
await assert.rejects(()=>call('attack',{live:'siege_start',target:other,request_id:nonce(),army:[1,0,0,0,0,0,0,0,0,0,0]}),/ค้นหาใหม่/);
await db.query("update public.nova_war_players set layout='[{\"type\":\"hq\",\"lv\":5}]',shield_until=now()+interval '4 hours' where user_id=$1",[other]);
await assert.rejects(()=>call('attack',{live:'siege_start',target:other,request_id:nonce(),army:[1,0,0,0,0,0,0,0,0,0,0]}),/โล่/);
assert(!(await db.query("select has_table_privilege('authenticated','public.nova_war_reports','insert') ok")).rows[0].ok);
console.log('PASS wallet255: partial claim, verified ads, immutable amount, replay, ownership, no autocredit, raid rewards, 50% loss, 4h shield, 100-player level gate');await db.close();})().catch(e=>{console.error(e);process.exit(1)});
