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
await call('enroll',{layout:[{type:'hq',lv:15,x:10,y:10},{type:'mine',lv:1,x:8,y:8}]},other);
await db.exec('update public.nova_war_players set resource_gold=10000,resource_power=8000,gold_rate=0,power_rate=0,gold_delta=0,power_delta=0,resource_at=now()');
await db.query('insert into nova_private.test_wallets(user_id,gems) values($1,100) on conflict(user_id) do update set gems=100',[uid]);
const peek={live:'siege_peek',target:other,request_id:nonce()};let r=await call('attack',peek);assert.equal(r.scout262.cost,2);await call('attack',peek);
assert.equal((await db.query('select gems from nova_private.test_wallets where user_id=$1',[uid])).rows[0].gems,98);
const cancel={...peek,request_id:nonce(),live:'siege_scout_cancel262'};r=await call('attack',cancel);assert.equal(r.scout262.cost,0);r=await call('attack',{...cancel,live:'siege_peek'});assert.equal(r.scout262.cost,0);
await assert.rejects(()=>call('attack',{...peek,target:uid}),/อัปเดต/);
async function roomFor(members){
 const room=nonce();await db.query(`insert into nova_private.sieges(id,defender,host,target,frame) values($1,$2,$3,'{"id":"${other}","layout":[{"type":"hq","lv":15},{"type":"mine","lv":1}]}','{"buildings":[[0],[100]],"troops":[],"guards":[],"army":[],"time":120}')`,[room,other,members[0]]);
 for(const owner of members){await db.query(`insert into nova_private.siege_members(room,owner,nonce,roster,army,merc) values($1,$2,$3,'[3,0,0,0,0,0,0,0,0,0,0]','[2,0,0,0,0,0,0,0,0,0,0]',0)`,[room,owner,nonce()]);await db.query('insert into nova_private.siege_orders(room,owner,nonce,kind,x,y) values($1,$2,$3,0,0,2)',[room,owner,nonce()]);}
 await db.query('update nova_private.sieges set ack=(select max(id) from nova_private.siege_orders where room=$1) where id=$1',[room]);return room;
}
const solo=await roomFor([uid]);r=await call('attack',{live:'siege_retreat',id:solo});assert(r.battle.finished);assert(r.battle.withdrawn);assert.equal(r.battle.result.destruction,50);assert.equal(r.battle.result.nova255,20);assert.equal(r.battle.result.loot_gold,2500);assert.equal(r.battle.result.army[0],2);
assert((await db.query('select finished_at from nova_private.sieges where id=$1',[solo])).rows[0].finished_at);
const result=r.battle.result;r=await call('attack',{live:'siege_retreat',id:solo});assert.deepEqual(r.battle.result,result);
assert.equal((await db.query('select count(*)::int n from nova_private.raid_rewards260 where battle=$1',[solo])).rows[0].n,1);
assert.equal((await db.query('select gold_delta from public.nova_war_players where user_id=$1',[uid])).rows[0].gold_delta,0,'reward stays behind ad claim');
// Shared raid freezes withdrawing member results and returns only undeployed troops once.
const third='10000000-0000-4000-8000-000000000003';await db.query('insert into auth.users(id) values($1)',[third]);await call('enroll',{layout:[{type:'hq',lv:15,x:10,y:10}]},third);
const multi=await roomFor([uid,third]);r=await call('attack',{live:'siege_retreat',id:multi});assert(r.battle.finished);assert.equal(r.battle.result.nova255,10);
const frozen=r.battle.result;let sr=(await db.query('select * from nova_private.sieges where id=$1',[multi])).rows[0];assert.equal(sr.finished_at,null);assert.equal(sr.host,third);
r=await call('attack',{live:'siege_status',seen:[solo,multi]});assert(!r.battle,'reported withdrawn raid must not pull player back');
await db.query(`update nova_private.sieges set frame=jsonb_set(frame,'{buildings}','[[0],[0]]') where id=$1`,[multi]);await db.query('select nova_private.siege_finish($1)',[multi]);
sr=(await db.query('select result from nova_private.sieges where id=$1',[multi])).rows[0];assert.deepEqual(sr.result[uid],frozen);assert.equal(sr.result[third].destruction,100);assert.equal(sr.result[third].nova255,20);
// Final host snapshot is accepted before settlement, rather than using an older poll.
const last=await roomFor([uid]);await db.query(`update nova_private.sieges set frame=jsonb_set(frame,'{buildings}','[[100],[100]]') where id=$1`,[last]);
let latest=(await db.query('select * from nova_private.sieges where id=$1',[last])).rows[0];
r=await call('attack',{live:'siege_retreat',id:last,epoch:latest.epoch,seq:latest.seq+1,ack:Number(latest.ack),frame:{...latest.frame,buildings:[[0],[100]]}});assert.equal(r.battle.result.destruction,50);assert.equal(r.battle.result.nova255,20);
// No destruction gives no Duck Coins, even when surrendering; legacy withdrawn rooms recover.
const zero=await roomFor([uid]);await db.query(`update nova_private.sieges set frame=jsonb_set(frame,'{buildings}','[[100],[100]]') where id=$1`,[zero]);await db.query('update nova_private.siege_members set withdrawn=true where room=$1',[zero]);r=await call('attack',{live:'siege_retreat',id:zero});assert.equal(r.battle.result.nova255,0);assert.equal(r.battle.result.loot_gold,0);
const job=nonce();await db.query("insert into nova_private.upgrade_jobs225(owner,request_id,job_key,category,item,target_level,finishes_at) values($1,$2,'research:weapon','research','weapon',1,now()+interval '60 seconds')",[uid,job]);
const speedPayload={support228:'speed',request_id:nonce(),job_id:job,quoted:1};await assert.rejects(()=>call('research',speedPayload),/ราคาเปลี่ยน/);r=await call('research',{...speedPayload,quoted:6});assert.equal(r.receipt.cost,6);r=await call('research',{...speedPayload,quoted:6});assert.equal(r.receipt.cost,6);
const speed=(await db.query("select pg_get_functiondef('nova_private.command_before_admob230(text,jsonb)'::regprocedure) s")).rows[0].s;assert(speed.includes('finishes_at-now()))/10)'));
await db.exec('set role authenticated');await assert.rejects(()=>db.query('select * from nova_private.scout_receipts262'));await assert.rejects(()=>db.query('select nova_private.siege_settle262($1,$2)',[multi,uid]));await db.exec('reset role');
console.log('PASS battle262: paid search replay/cancel, immediate surrender, proportional rewards, ad escrow, multi-attacker frozen results, host handoff, return-home recovery, ACL');await db.close();})().catch(e=>{console.error(e);process.exit(1)});
