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
const balance=async(who=uid)=>(await db.query('select resource_gold,resource_power from public.nova_war_players where user_id=$1',[who])).rows[0];
const gems=async(who=uid)=>Number((await db.query('select gems from nova_private.test_wallets where user_id=$1',[who])).rows[0]?.gems||0);
async function siege(destroyed){const room=nonce();await db.query("insert into nova_private.sieges(id,defender,host,target,frame) values($1,$2,$3,'{\"layout\":[{\"type\":\"hq\",\"lv\":15},{\"type\":\"mine\",\"lv\":1}]}',$4)",[room,other,uid,JSON.stringify({buildings:destroyed?[[0],[0]]:[[0],[100]]})]);
 await db.query("insert into nova_private.siege_members(room,owner,nonce,roster,army,merc) values($1,$2,$3,'[0,0,0,0,0,0,0,0,0,0,0]','[0,0,0,0,0,0,0,0,0,0,0]',0)",[room,uid,nonce()]);
 await db.query("insert into nova_private.siege_orders(room,owner,nonce,kind,x,y,alien,level) values($1,$2,$3,0,0,2,false,1)",[room,uid,nonce()]);await db.query('update nova_private.sieges set ack=(select max(id) from nova_private.siege_orders) where id=$1',[room]);
 await db.exec('update public.nova_war_players set resource_gold=10000,resource_power=8000,gold_rate=0,power_rate=0,gold_delta=0,power_delta=0,resource_at=now()');await db.query('select nova_private.siege_finish($1)',[room]);return room;}
// Player attack, 100%: 5 NOVA, collect without a video = x1.
let room=await siege(true),r=await call('test_status',{raid260:'status'});let row=r.pending.find(x=>x.battle===room);assert.equal(row.nova,5);assert(row.gold>0&&row.power>0);
let g0=await gems(),b0=await balance();await assert.rejects(()=>call('test_status',{raid260:'collect',battle:room,owner:uid,request_id:nonce()}),/ไม่ถูกต้อง/);
r=await call('test_claim',{raid260:'collect',battle:room,owner:uid,request_id:nonce()});assert.equal(r.receipt.claimed,true);assert.equal(r.receipt.multiplier,1);assert.equal(r.receipt.granted.nova,5);assert.equal(r.receipt.granted.gold,row.gold);assert.equal(await gems(),g0+5);assert.equal(Number((await balance()).resource_gold),Number(b0.resource_gold)+row.gold);
r=await call('test_claim',{raid260:'collect',battle:room,owner:uid,request_id:nonce()});assert.equal(await gems(),g0+5,'collect replay');
// Player attack, 100%, with a video = x3 ไข่ทอง and resources (storage-capped).
room=await siege(true);r=await call('test_status',{raid260:'status'});row=r.pending.find(x=>x.battle===room);g0=await gems();
const id=nonce(),p={raid260:'prepare',battle:room,owner:uid,request_id:id};r=await call('test_status',p);assert.equal(r.receipt.provider,'test');
await assert.rejects(()=>call('test_claim',{...p,raid260:'claim'}),/ดูโฆษณา/);
r=await call('test_claim',{...p,raid260:'claim',completed:true});assert.equal(r.receipt.multiplier,3);assert.equal(r.receipt.granted.nova,15);assert.equal(r.receipt.granted.gold,row.gold*3);assert.equal(r.receipt.granted.power,row.power*3);assert.equal(await gems(),g0+15);
r=await call('test_claim',{raid260:'collect',battle:room,owner:uid,request_id:nonce()});assert.equal(await gems(),g0+15,'no collect after video');
// Not 100%: no Golden Eggs, resources still collectable.
room=await siege(false);r=await call('test_status',{raid260:'status'});row=r.pending.find(x=>x.battle===room);assert.equal(row?row.nova:0,0);
// Bot-base wins: 2 ไข่ทอง every win, video triples to 6.
const win=(wid,extra={},who=uid)=>call('test_claim',{campaign399:'win',owner:who,id:wid,stage:3,stars:2,...extra},who);
g0=await gems();const w1=nonce();r=await win(w1);assert.equal(r.campaign399.amount,2);assert.equal(r.campaign399.credited,2);assert.equal(await gems(),g0+2);
r=await win(w1);assert.equal(await gems(),g0+2,'same win replay');
await assert.rejects(()=>win(nonce()),/เร็วเกินไป/);await db.exec("update nova_private.campaign_wins399 set created_at=now()-interval '1 minute'");
const w2=nonce();r=await win(w2,{stage:1,stars:1});assert.equal(r.campaign399.credited,4);
r=await call('test_status',{campaign399:'prepare',owner:uid,id:w2});assert.equal(r.campaign399.provider,'test');
await assert.rejects(()=>call('test_claim',{campaign399:'claim',owner:uid,id:w2}),/ดูโฆษณา/);
await assert.rejects(()=>call('test_claim',{campaign399:'claim',owner:uid,id:w2,completed:true},other),/บัญชี/);
r=await call('test_claim',{campaign399:'claim',owner:uid,id:w2,completed:true});assert.equal(r.campaign399.bonus,4);assert.equal(r.campaign399.credited,8);assert.equal(await gems(),g0+8);
r=await call('test_claim',{campaign399:'claim',owner:uid,id:w2,completed:true});assert.equal(await gems(),g0+8,'bonus replay');
await db.exec("update nova_private.campaign_wins399 set created_at=now()-interval '1 minute'");await assert.rejects(()=>win(nonce(),{stage:101}),/Invalid/);await assert.rejects(()=>win(nonce(),{stars:0}),/Invalid/);
await assert.rejects(()=>call('test_claim',{campaign399:'claim',owner:uid,id:nonce(),completed:true}),/Invalid|ไม่พบ/);
assert.equal((await db.query("select has_table_privilege('authenticated','nova_private.campaign_wins399','INSERT') a")).rows[0].a,false);
console.log('PASS battle399 DB: PvP 100% = 5 NOVA, collect x1, video x3 (NOVA + resources), no double claim; bot win 2 Golden Eggs every win, video +4, replay/spacing/owner checks');await db.close();})().catch(e=>{console.error(e);process.exitCode=1;});
