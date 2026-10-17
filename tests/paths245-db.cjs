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
await db.exec('update public.nova_war_players set crystals=10000,resource_gold=0,resource_power=0,resource_at=now();');
let r=await call('status');assert(r.paths245);assert.deepEqual(r.enhancement_paths245,{});
const eid=nonce();r=await call('research',{enhance:'building:mine',enhance_path245:'production',request_id:eid});assert(r.receipt.pending);assert.deepEqual(r.enhancement_paths245,{});
await assert.rejects(()=>call('research',{enhance:'building:mine',enhance_path245:'strength',request_id:eid}),/สายตีบวก/);
await db.query("update nova_private.upgrade_jobs225 set finishes_at=now()-interval '1 second' where request_id=$1",[eid]);
r=await call('status');assert.equal(r.enhancement_paths245['building:mine'].production,1);assert.equal(r.enhancements['building:mine'],1);
r=await call('research',{enhance:'building:mine',enhance_path245:'production',request_id:eid});assert.equal(r.enhancement_paths245['building:mine'].production,1,'replay does not add a point');
await assert.rejects(()=>call('research',{enhance:'building:wall',enhance_path245:'production',request_id:nonce()}),/สายตีบวก/);
await db.query('insert into nova_private.test_wallets(user_id,gems) values($1,100000) on conflict(user_id) do update set gems=100000',[uid]);
r=await call('research',{resource233:'quote',owner:uid,kind:'gold'});assert.equal(r.resource_quote.hourly_rate,4752);assert.equal(r.resource_quote.cost,15);assert.equal(r.resource_quote.amount,2376);
const full=await call('research',{resource233:'quote',owner:uid,kind:'gold',wanted:100000000});assert.equal(full.resource_quote.amount,full.resource_quote.room);assert(full.resource_quote.cost>15);
await db.exec("update public.nova_war_players set crystals=0,produced_at=now(),boost_seconds245=21540,boost_day245=(now() at time zone 'Asia/Bangkok')::date");
r=await call('research',{resource233:'quote',owner:uid,kind:'crystals',wanted:40});assert.equal(r.resource_quote.cost,2,'60 seconds at base rate plus 60 at doubled rate rounds up');
const q=r.resource_quote,buy={resource233:'buy',owner:uid,kind:'crystals',wanted:40,quoted_amount:q.amount,quoted_cost:q.cost,request_id:nonce()};r=await call('research',buy);const wallet=r.wallet_gems;assert(r.resource_receipt);r=await call('research',buy);assert.equal(r.wallet_gems,wallet,'no duplicate debit');
const used=(await db.query('select boost_seconds245 from public.nova_war_players where user_id=$1',[uid])).rows[0].boost_seconds245;assert.equal(+used,21660,'count production time once');
r=await call('research',{resource233:'quote',owner:uid,kind:'crystals',wanted:40});assert.equal(r.resource_quote.cost,2);
await db.exec("update public.nova_war_players set boost_day245=current_date-2");r=await call('research',{resource233:'quote',owner:uid,kind:'crystals',wanted:40});assert.equal(r.resource_quote.cost,1,'daily tier resets');

await db.exec('update public.nova_war_players set resource_gold=0,resource_at=now()');
let fq=(await call('research',{resource233:'quote',owner:uid,kind:'gold',wanted:100000000})).resource_quote;
await db.exec('update public.nova_war_players set resource_gold=1000,resource_at=now()');
let fr=await call('research',{resource233:'buy',owner:uid,kind:'gold',wanted:100000000,quoted_amount:fq.amount,quoted_cost:fq.cost,request_id:nonce()});assert(fr.resource_receipt.amount<fq.amount);assert(fr.resource_receipt.cost<=fq.cost);
await call('enroll',{layout:[{type:'hq',lv:3,x:10,y:10},{type:'mine',lv:1,x:9,y:10}]},other);
await db.query("update public.nova_war_players set shield_until=now()-interval '1 second',enhancements=$1,enhancement_paths245=$2",[JSON.stringify({'unit:0':2}),JSON.stringify({'unit:0':{attack:2}})]);
let room=(await call('attack',{live:'siege_start',target:other,army:[2,0,0,0,0,0,0,0,0,0,0],request_id:nonce()})).battle;
assert.equal(room.target.enhancement_paths245['unit:0'].attack,2);
let dep=(await call('attack',{live:'siege_deploy',id:room.id,kind:0,x:0,y:10,request_id:nonce()})).battle.orders[0];assert.equal(dep.enhance_paths245.attack,2);
console.log('PASS paths245: delayed specialization, replay guards, invalid branch, production rate, full storage, crystal tiers, atomic debit and daily reset');await db.close();})().catch(e=>{console.error(e);process.exit(1)});
