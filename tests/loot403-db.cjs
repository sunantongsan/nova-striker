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
// 399 prerequisites not in this harness: first-win table (362) and siege cancellation flag (262).
await db.exec("create table nova_private.campaign_rewards362(owner uuid,stage int,stars int,amount int,created_at timestamptz default now(),primary key(owner,stage));alter table nova_private.siege_orders add column if not exists cancelled262 boolean not null default false;");
await db.exec(fs.readFileSync('backend/nova_battle_rewards399.sql','utf8'));
await db.query('delete from nova_private.telegram_accounts231 where user_id=$1',[uid]);await db.exec("update nova_private.test_checkin_settings248 set enabled=true");

await db.exec(fs.readFileSync('backend/nova_loot_rules403.sql','utf8'));
const gems=async(who=uid)=>Number((await db.query('select gems from nova_private.test_wallets where user_id=$1',[who])).rows[0]?.gems||0);
const setHQ=async(who,lv)=>db.query("update public.nova_war_players set layout=$2 where user_id=$1",[who,JSON.stringify([{type:'hq',lv,x:10,y:10}])]);
async function siege(){const room=nonce();await db.query("insert into nova_private.sieges(id,defender,host,target,frame) values($1,$2,$3,'{\"layout\":[{\"type\":\"hq\",\"lv\":15},{\"type\":\"mine\",\"lv\":1}]}',$4)",[room,other,uid,JSON.stringify({buildings:[[0],[0]]})]);
 await db.query("insert into nova_private.siege_members(room,owner,nonce,roster,army,merc) values($1,$2,$3,'[0,0,0,0,0,0,0,0,0,0,0]','[0,0,0,0,0,0,0,0,0,0,0]',0)",[room,uid,nonce()]);
 await db.query("insert into nova_private.siege_orders(room,owner,nonce,kind,x,y,alien,level) values($1,$2,$3,0,0,2,false,1)",[room,uid,nonce()]);await db.query('update nova_private.sieges set ack=(select max(id) from nova_private.siege_orders) where id=$1',[room]);
 await db.exec('update public.nova_war_players set resource_gold=10000,resource_power=8000,gold_rate=0,power_rate=0,gold_delta=0,power_delta=0,resource_at=now()');await db.query('select nova_private.siege_finish($1)',[room]);
 const r=await call('test_status',{raid260:'status'});return (r.pending.find(x=>x.battle===room)||{nova:0}).nova;}
// Player attacks at 100%: same level 5, defender 1-2 lower 1, 3+ lower 0, defender higher 5.
// (this harness predates the level-20 HQ cap, so levels stay at 15 or below)
await setHQ(uid,10);await setHQ(other,10);assert.equal(await siege(),5);
await setHQ(uid,11);assert.equal(await siege(),1);await setHQ(uid,12);assert.equal(await siege(),1);
await setHQ(uid,13);assert.equal(await siege(),0);await setHQ(uid,8);assert.equal(await siege(),5);
// Bot wins: stage n is HQ 1+floor((n-1)/5).
const gap=()=>db.exec("update nova_private.campaign_wins399 set created_at=now()-interval '1 minute'");
const win=async(extra)=>{await gap();return (await call('test_claim',{campaign399:'win',owner:uid,id:nonce(),stage:71,stars:2,...extra})).campaign399;};
await setHQ(uid,15);let g0=await gems();
let w=await win();assert.equal(w.amount,2);assert.equal(await gems(),g0+2);          // stage 71 = HQ15
w=await win({stage:66});assert.equal(w.amount,1);                                     // HQ14, 1 lower
w=await win({stage:61});assert.equal(w.amount,1);                                     // HQ13, 2 lower
w=await win({stage:56});assert.equal(w.amount,0);                                     // HQ12, 3 lower
w=await win({stage:96});assert.equal(w.amount,2);                                     // HQ20, higher
w=await win({stage:71,nova403:1});assert.equal(w.amount,1,'client may ask less');
w=await win({stage:71,nova403:9});assert.equal(w.amount,2,'never more');
w=await win({stage:71,stars:3});assert.equal(w.amount,2,'first 3-star still pays');
w=await win({stage:71,stars:3});assert.equal(w.amount,0,'re-raid after 3 stars: no Duck Coins');
w=await win({stage:91});assert.equal(w.amount,2);
await db.query("insert into nova_private.campaign_rewards362(owner,stage,stars,amount) values($1,91,3,5)",[uid]);w=await win({stage:91});assert.equal(w.amount,0,'old 3-star record');
// A 0-Duck Coins win can still use its video (client triples resources); bonus stays 0.
const zero=w.id;let r=await call('test_status',{campaign399:'prepare',owner:uid,id:zero});assert.equal(r.campaign399.provider,'test');
r=await call('test_claim',{campaign399:'claim',owner:uid,id:zero,completed:true});assert.equal(r.campaign399.claimed,true);assert.equal(r.campaign399.bonus,0);
w=await win({stage:96});const g1=await gems();r=await call('test_status',{campaign399:'prepare',owner:uid,id:w.id});r=await call('test_claim',{campaign399:'claim',owner:uid,id:w.id,completed:true});assert.equal(r.campaign399.bonus,4);assert.equal(await gems(),g1+4);
r=await call('test_claim',{campaign399:'claim',owner:uid,id:w.id,completed:true});assert.equal(await gems(),g1+4,'bonus replay');
console.log('PASS loot403 DB: Duck Coins by HQ gap (5/1/0 PvP, 2/1/0 bots), 3-star re-raid pays no Duck Coins, client can only lower, 0-Duck Coins video claim');await db.close();})().catch(e=>{console.error(e);process.exitCode=1;});
