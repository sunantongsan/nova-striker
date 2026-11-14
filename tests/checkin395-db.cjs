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
let balance=0;
await db.exec(fs.readFileSync('backend/nova_checkin395.sql','utf8'));
const today="(now() at time zone 'Asia/Bangkok')::date";
// Free claim: 5 NOVA once per day, streak continues, replay grants nothing.
await db.query('update nova_private.test_wallets set gems=0,claimed_day=null,checkin_streak233=0,checkin_reward233=0,checkin_ad395=null where user_id=$1',[other]);
let s=await call('test_status',{checkin233:true},other);assert.equal(s.checkin233.next_reward,5);assert.equal(s.checkin233.ad_bonus395,15);assert.equal(s.checkin233.claimed,false);
let r=await call('test_status',{checkin233:true,checkin395:'free'},other);assert.equal(r.test_gems,5);assert.equal(r.checkin233.claimed,true);assert.equal(r.checkin233.reward,5);assert.equal(r.checkin233.ad_bonus395,10);assert.equal(r.checkin233.streak,1);
r=await call('test_claim',{checkin395:'free'},other);assert.equal(r.test_gems,5,'free replay');
await assert.rejects(()=>call('test_status',{checkin395:'x'},other),/ไม่ถูกต้อง/);
await db.query(`update nova_private.test_wallets set claimed_day=${today}-1,checkin_ad395=${today}-1 where user_id=$1`,[other]);r=await call('test_status',{checkin395:'free'},other);assert.equal(r.test_gems,10);assert.equal(r.checkin233.streak,2);
await db.query('update auth.users set is_anonymous=true where id=$1',[other]);await assert.rejects(()=>call('test_status',{checkin395:'free'},other),/เข้าสู่ระบบ/);await db.query('update auth.users set is_anonymous=false where id=$1',[other]);
// Video: 15 when unclaimed; +10 top-up after a free claim; never more than 15 per day.
await db.exec('update nova_private.admob_settings230 set enabled=true');
for(const telegram of [false,true]){
 const key=telegram?'monetag231':'admob230',table=telegram?'monetag_intents231':'admob_intents230';
 await db.query('update nova_private.test_wallets set gems=0,claimed_day=null,checkin_streak233=0,checkin_reward233=0,checkin_ad395=null where user_id=$1',[uid]);
 const watch=async(expected,balance)=>{const id=nonce(),p={owner:uid,request_id:id,kind:'checkin',[key]:'prepare'};let x=await call('research',p,uid,telegram);assert.equal(x.ad_reward.amount,expected);
  x=await call('research',{...p,[key]:'claim',completed234:true},uid,telegram);assert.equal(x.test_gems,balance-expected,'unverified video gives nothing');
  await db.query('update nova_private.'+table+' set verified_at=now() where id=$1',[id]);x=await call('research',{...p,[key]:'claim',completed234:true},uid,telegram);assert.equal(x.test_gems,balance);assert.equal(x.ad_reward.granted,expected);
  x=await call('research',{...p,[key]:'claim',completed234:true},uid,telegram);assert.equal(x.test_gems,balance,'claim replay');return x;};
 let x=await watch(15,15);assert.equal(x.checkin233.reward,15);assert.equal(x.checkin233.ad_bonus395,0);assert.equal(x.checkin233.streak,1);
 await assert.rejects(()=>call('research',{owner:uid,request_id:nonce(),kind:'checkin',[key]:'prepare'},uid,telegram),/วันนี้แล้ว/);
 x=await call('test_status',{checkin395:'free'},uid);assert.equal(x.test_gems,15,'free after video gives nothing');
 await db.query(`update nova_private.test_wallets set claimed_day=${today}-1,checkin_ad395=${today}-1 where user_id=$1`,[uid]);
 x=await call('test_status',{checkin395:'free'},uid);assert.equal(x.test_gems,20);assert.equal(x.checkin233.streak,2);
 x=await watch(10,30);assert.equal(x.checkin233.reward,15);assert.equal(x.checkin233.ad_bonus395,0);assert.equal(x.checkin233.streak,2);
 await assert.rejects(()=>call('research',{owner:uid,request_id:nonce(),kind:'checkin',[key]:'prepare'},uid,telegram),/วันนี้แล้ว/);
 // Video prepared before a free claim on the same day still caps the day at 15.
 await db.query(`update nova_private.test_wallets set claimed_day=${today}-1,checkin_ad395=${today}-1 where user_id=$1`,[uid]);
 const id=nonce(),p={owner:uid,request_id:id,kind:'checkin',[key]:'prepare'};x=await call('research',p,uid,telegram);assert.equal(x.ad_reward.amount,15);
 x=await call('test_status',{checkin395:'free'},uid);assert.equal(x.test_gems,35);
 await db.query('update nova_private.'+table+' set verified_at=now() where id=$1',[id]);x=await call('research',{...p,[key]:'claim',completed234:true},uid,telegram);assert.equal(x.test_gems,45);assert.equal(x.ad_reward.granted,10);assert.equal(x.checkin233.reward,15);
}
// 396: Google demo video while AdMob is pending (AdMob off, non-Telegram account).
await db.exec(fs.readFileSync('backend/nova_test_ads396.sql','utf8'));await db.exec('update nova_private.admob_settings230 set enabled=false');
await db.query('update nova_private.test_wallets set gems=0,claimed_day=null,checkin_streak233=0,checkin_reward233=0,checkin_ad395=null where user_id=$1',[other]);await db.query('delete from nova_private.test_checkin_receipts248 where owner=$1',[other]);
const demo=async(expected,balance)=>{const id=nonce(),p={owner:other,request_id:id,checkin_test248:'prepare'};let x=await call('test_status',p,other);assert.equal(x.test_checkin248,true);assert.equal(x.test_receipt248.amount,expected);
 await assert.rejects(()=>call('test_claim',{...p,request_id:x.test_receipt248.id,checkin_test248:'claim'},other),/ให้ครบ/);
 x=await call('test_claim',{...p,request_id:x.test_receipt248.id,checkin_test248:'claim',completed248:true},other);assert.equal(x.test_gems,balance);
 x=await call('test_claim',{...p,request_id:x.test_receipt248.id,checkin_test248:'claim',completed248:true},other);assert.equal(x.test_gems,balance,'demo replay');return x;};
let dx=await demo(15,15);assert.equal(dx.checkin233.reward,15);assert.equal(dx.checkin233.ad_bonus395,0);
await assert.rejects(()=>call('test_status',{owner:other,request_id:nonce(),checkin_test248:'prepare'},other),/วันนี้แล้ว/);
await db.query(`update nova_private.test_wallets set claimed_day=${today}-1,checkin_ad395=${today}-1 where user_id=$1`,[other]);await db.query('delete from nova_private.test_checkin_receipts248 where owner=$1',[other]);
dx=await call('test_status',{checkin395:'free'},other);assert.equal(dx.test_gems,20);
dx=await demo(10,30);assert.equal(dx.checkin233.reward,15);assert.equal(dx.checkin233.streak,2);
await assert.rejects(()=>call('test_status',{owner:other,request_id:nonce(),checkin_test248:'prepare'},other),/วันนี้แล้ว/);
assert.equal((await db.query("select has_function_privilege('anon','nova_private.test_command(text,jsonb)','execute') allowed")).rows[0].allowed,false);
console.log('PASS checkin395 DB: free 5/day, video 15 (x3), +10 top-up after free, 15/day cap, replay, login, provider and Google demo-video coverage');await db.close();})().catch(e=>{console.error(e);process.exitCode=1;});
