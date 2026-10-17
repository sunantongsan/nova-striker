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
let r=await call('test_claim',{checkin233:true});assert.equal(r.test_gems,0);assert(r.admob230&&r.monetag231);
for(const telegram of [false,true]){
 const table=telegram?'monetag_intents231':'admob_intents230',key=telegram?'monetag231':'admob230';
 await db.exec('delete from nova_private.admob_intents230;delete from nova_private.monetag_intents231;update nova_private.test_wallets set gems=0,claimed_day=null,checkin_streak233=0');
 const p={owner:uid,request_id:nonce(),kind:'checkin',[key]:'prepare'};
 r=await call('research',p,uid,telegram);assert.equal(r.ad_reward.amount,20,'works without PvP enrollment');
 await assert.rejects(()=>call('research',{...p,owner:other},uid,telegram),/บัญชีเดิม/);
 r=await call('research',{...p,[key]:'claim',completed234:true},uid,telegram);assert(!r.ad_reward.claimed);assert.equal(r.test_gems,0,'SDK completion alone cannot grant');
 await db.query('update nova_private.'+table+' set verified_at=now() where id=$1',[p.request_id]);
 r=await call('research',{...p,[key]:'claim'},uid,telegram);assert(!r.ad_reward.claimed,'postback alone cannot grant');
 r=await call('research',{...p,[key]:'claim',completed234:true},uid,telegram);assert.equal(r.test_gems,20);assert(r.ad_reward.claimed);assert.equal(r.checkin233.streak,1);
 r=await call('research',{...p,[key]:'claim',completed234:true},uid,telegram);assert.equal(r.test_gems,20,'retry does not double credit');
 await assert.rejects(()=>call('research',{...p,request_id:nonce()},uid,telegram),/วันนี้แล้ว/);
 await db.exec('delete from nova_private.'+table+";update nova_private.test_wallets set claimed_day=(now() at time zone 'Asia/Bangkok')::date-1");
 p.request_id=nonce();r=await call('research',p,uid,telegram);assert.equal(r.ad_reward.amount,25);
 await db.query('update nova_private.'+table+' set verified_at=now() where id=$1',[p.request_id]);
 r=await call('research',{...p,[key]:'claim',completed234:true},uid,telegram);assert.equal(r.test_gems,45);
 await db.exec('delete from nova_private.'+table+";update nova_private.test_wallets set claimed_day=(now() at time zone 'Asia/Bangkok')::date-3");
 p.request_id=nonce();r=await call('research',p,uid,telegram);assert.equal(r.ad_reward.amount,20,'missed day resets');
 r=await call('research',{...p,[key]:'cancel'},uid,telegram);assert(r.ad_reward.cancelled);
 await db.query('update nova_private.'+table+' set verified_at=now() where id=$1',[p.request_id]);
 r=await call('research',{...p,[key]:'claim',completed234:true},uid,telegram);assert.equal(r.test_gems,45,'cancelled ads cannot grant');
 // Late confirmation remains attached to prepared Bangkok day, never steals tomorrow's check-in.
 await db.exec('delete from nova_private.'+table);
 p.request_id=nonce();await call('research',p,uid,telegram);
 await db.query('update nova_private.'+table+" set created_at=now()-interval '1 day',verified_at=now() where id=$1",[p.request_id]);
 r=await call('research',{...p,[key]:'claim',completed234:true},uid,telegram);assert.equal(r.test_gems,65);assert(!r.checkin233.claimed);
 // A second valid receipt for the same day cannot award again.
 const second=nonce();await db.query('insert into nova_private.'+table+"(owner,id,kind,amount,created_at,verified_at) values($1,$2,'checkin',20,now()-interval '1 day',now())",[uid,second]);
 r=await call('research',{...p,request_id:second,[key]:'claim',completed234:true},uid,telegram);assert.equal(r.ad_reward.granted,0);assert.equal(r.test_gems,65);
}
await db.exec('update nova_private.admob_settings230 set enabled=false;delete from nova_private.admob_intents230;delete from nova_private.monetag_intents231');
await assert.rejects(()=>call('research',{owner:uid,kind:'checkin',request_id:nonce(),admob230:'prepare'}),/ยังไม่เปิด/);
await db.exec('set role authenticated');await assert.rejects(()=>db.query("select nova_private.checkin_ad234('research','{}','admob')"));await db.exec('reset role');
console.log('PASS rewarded234: both providers, no PvP prerequisite, completion + verification gate, idempotence, streak/reset, cancellation, ownership, midnight and disabled-provider safety');await db.close();})().catch(e=>{console.error(e);process.exit(1)});
