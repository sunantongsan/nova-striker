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

await db.exec(fs.readFileSync('backend/nova_raid_rewards_260.sql','utf8'));
await db.exec(fs.readFileSync('backend/nova_reward_receipt_263.sql','utf8'));
await db.exec(`create table nova_private.campaign_rewards362(owner uuid references auth.users(id),stage int,stars int,amount int,created_at timestamptz default now(),primary key(owner,stage));
create table nova_private.launch_grants367(owner uuid,amount int);
create table nova_private.coin_ads367(owner uuid,amount int,claimed_at timestamptz);
create function nova_private.external_credits_before367() returns jsonb language sql as $$select jsonb_build_object('owner',auth.uid(),'credited',0)$$;
alter function nova_private.test_command(text,jsonb) rename to test_command_before396_fixture;
create function nova_private.test_command_before383(action text,payload jsonb) returns jsonb language plpgsql as $$begin if payload ? 'campaign362' then return nova_private.test_command_before367(action,payload);end if;return nova_private.test_command_before396_fixture(action,payload);end$$;`);
await db.exec(fs.readFileSync('backend/nova_rewards_396.sql','utf8'));
let s=await call('test_status',{},other);assert.equal(s.checkin233.next_reward,5);assert.equal(s.test_checkin248,true);
let b=s.test_gems;
s=await call('test_claim',{checkin233:true,normal396:true},other);assert.equal(s.test_gems,b+5);assert.equal(s.checkin233.reward,5);
assert.equal((await call('test_claim',{checkin233:true,normal396:true},other)).test_gems,b+5);
await assert.rejects(()=>call('test_status',{owner:other,request_id:nonce(),checkin_test248:'prepare'},other));
await db.query("update nova_private.test_wallets set claimed_day=null,checkin_streak233=6 where user_id=$1",[other]);
let id=nonce(),p={owner:other,request_id:id,checkin_test248:'prepare'};s=await call('test_status',p,other);assert.equal(s.test_receipt248.amount,15);
await assert.rejects(()=>call('test_claim',{...p,checkin_test248:'claim'},other));
s=await call('test_claim',{...p,checkin_test248:'claim',completed248:true},other);assert.equal(s.test_gems,b+20);
assert.equal((await call('test_claim',{...p,checkin_test248:'claim',completed248:true},other)).test_gems,b+20);
for(const stage of [1,49,50,100]){s=await call('test_claim',{campaign362:true,owner:other,stage,stars:3},other);assert.equal(s.campaign362.amount,1);}
let bonus={campaign_bonus396:'prepare',owner:other,stage:100,request_id:nonce()};s=await call('test_status',bonus,other);assert.equal(s.receipt.claimed,false);
await assert.rejects(()=>call('test_claim',{...bonus,campaign_bonus396:'claim'},other));
s=await call('test_claim',{...bonus,campaign_bonus396:'claim',completed:true},other);assert.equal(s.external297.credited,2);
assert.equal((await call('test_claim',{...bonus,campaign_bonus396:'claim',completed:true},other)).external297.credited,2);
await assert.rejects(()=>call('test_claim',{...bonus,campaign_bonus396:'claim',completed:true},uid));
await call('enroll',{layout:[{type:'hq',lv:1,x:10,y:10}]},other);
const raid=async(mode,n)=>{let battle=nonce(),report=nonce(),request_id=nonce();await db.query('insert into nova_private.raid_rewards260(owner,battle,report,gold,power,nova) values($1,$2,$3,0,0,3)',[other,battle,report]);let p={raid260:mode,owner:other,battle,request_id};if(mode==='claim'){await call('test_status',{...p,raid260:'prepare'},other);await assert.rejects(()=>call('test_claim',p,other));p.completed=true;}let before=Number((await db.query('select gems from nova_private.test_wallets where user_id=$1',[other])).rows[0].gems);let x=await call('test_claim',p,other);assert.equal(x.receipt.granted.nova,n);await call('test_claim',p,other);assert.equal(Number((await db.query('select gems from nova_private.test_wallets where user_id=$1',[other])).rows[0].gems),before+n);};
await raid('normal',3);await raid('claim',9);
assert.equal((await db.query("select has_table_privilege('authenticated','nova_private.campaign_bonus396','insert') x")).rows[0].x,false);
console.log('PASS rewards396: daily 5/15 including day 7, campaign 1+2, raid 3/9, incomplete ads, duplicate claims and owner isolation');await db.close();})().catch(e=>{console.error(e);process.exitCode=1;});
