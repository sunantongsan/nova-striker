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
for(let day=1;day<=8;day++){
 if(day>1){await db.query("update nova_private.test_wallets set claimed_day=(now() at time zone 'Asia/Bangkok')::date-1 where user_id=$1",[other]);await db.query('delete from nova_private.test_checkin_receipts248 where owner=$1',[other]);}
 let status=await call('test_status',{checkin233:true},other),expected=day===7?200:50;assert.equal(status.checkin233.next_reward,expected);assert(status.checkin233.next_reset&&status.checkin233.server_time);
 let id=nonce(),p={owner:other,request_id:id,checkin_test248:'prepare'},r=await call('test_status',p,other);assert.equal(r.test_receipt248.amount,expected);assert.equal(r.test_gems,balance);
 await assert.rejects(()=>call('test_claim',{...p,checkin_test248:'claim'},other),/ให้ครบ/);assert.equal((await call('test_status',{},other)).test_gems,balance,'incomplete video cannot grant');
 r=await call('test_claim',{...p,checkin_test248:'claim',completed248:true,amount:99999},other);balance+=expected;assert.equal(r.test_gems,balance);assert.equal(r.checkin233.streak,day);assert.equal(r.test_receipt248.granted,expected);
 r=await call('test_claim',{...p,checkin_test248:'claim',completed248:true},other);assert.equal(r.test_gems,balance);await assert.rejects(()=>call('test_status',{...p,request_id:nonce()},other),/วันนี้แล้ว/);
}
await db.query("update nova_private.test_wallets set claimed_day=(now() at time zone 'Asia/Bangkok')::date-3 where user_id=$1",[other]);await db.query('delete from nova_private.test_checkin_receipts248 where owner=$1',[other]);let id=nonce(),r=await call('test_status',{owner:other,request_id:id,checkin_test248:'prepare'},other);assert.equal(r.test_receipt248.amount,50);r=await call('test_claim',{owner:other,request_id:id,checkin_test248:'claim',completed248:true},other);assert.equal(r.checkin233.streak,1,'missed day starts over');
// Both real providers: completion alone, verification alone, and duplicate requests.
await db.exec('update nova_private.admob_settings230 set enabled=true');
for(const telegram of [false,true]){
 const key=telegram?'monetag231':'admob230',table=telegram?'monetag_intents231':'admob_intents230';await db.query('update nova_private.test_wallets set gems=0,claimed_day=null,checkin_streak233=0 where user_id=$1',[uid]);let expectedBalance=0;
 for(let day=1;day<=8;day++){
  if(day>1)await db.query("update nova_private.test_wallets set claimed_day=(now() at time zone 'Asia/Bangkok')::date-1 where user_id=$1",[uid]);
  let id=nonce(),p={owner:uid,request_id:id,kind:'checkin',[key]:'prepare'},expected=day===7?200:50;r=await call('research',p,uid,telegram);assert.equal(r.ad_reward.amount,expected);
  r=await call('research',{...p,[key]:'claim',completed234:true},uid,telegram);assert.equal(r.test_gems,expectedBalance);
  await db.query('update nova_private.'+table+' set verified_at=now() where id=$1',[id]);r=await call('research',{...p,[key]:'claim'},uid,telegram);assert.equal(r.test_gems,expectedBalance);
  r=await call('research',{...p,[key]:'claim',completed234:true},uid,telegram);expectedBalance+=expected;assert.equal(r.test_gems,expectedBalance);assert.equal(r.checkin233.streak,day);
  r=await call('research',{...p,[key]:'claim',completed234:true},uid,telegram);assert.equal(r.test_gems,expectedBalance);
  await assert.rejects(()=>call('research',{...p,owner:other,[key]:'claim',completed234:true},uid,telegram),/บัญชีเดิม/);
 }
}
assert.equal((await db.query("select has_function_privilege('anon','nova_private.checkin_ad234(text,jsonb,text)','execute') allowed")).rows[0].allowed,false);
console.log('PASS weekly340 DB: 50x6, day7=200, cycle/reset, server midnight, completion+verification, idempotency and owner isolation');await db.close();})().catch(e=>{console.error(e);process.exitCode=1;});
