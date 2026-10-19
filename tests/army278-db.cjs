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

await db.exec(fs.readFileSync('backend/nova_logistics_277.sql','utf8'));
await db.exec(fs.readFileSync('backend/nova_army_278.sql','utf8'));

await call('enroll',{layout:[{type:'hq',lv:15,x:10,y:10},{type:'mine',lv:1,x:8,y:8},{type:'silo',lv:1,x:7,y:7}]},other);
await db.exec("update public.nova_war_players set shield_until=now()-interval '1 second'");
const roster=[8,1,0,1,0,0,0,2,0,0,0],start=await call('attack',{live:'siege_start',target:other,request_id:nonce(),army:roster});let room=start.battle;assert(room);
const launch={live:'siege_logistics277',id:room.id,request_id:nonce(),action:'launch',ship:1,lv:1,cargo:[4,1,0,0,0,0,0,0,0,0,0],x:5,y:5};let r=await call('attack',launch);assert.equal(r.logisticsReceipt277,launch.request_id);assert.equal(r.battle.orders.length,5);assert.equal(r.battle.army[0],4);assert.equal(r.battle.orders[0].logistics277.ship,1);
r=await call('attack',{...launch,resourceSnapshot:{seq:999}});assert.equal(r.battle.orders.length,5,'retry does not duplicate cargo');await assert.rejects(()=>call('attack',{...launch,request_id:nonce()}),/เดินทาง/);
await assert.rejects(()=>call('attack',{...launch,request_id:nonce(),ship:2,cargo:[0,0,0,1,0,0,0,0,0,0,0]}),/หน่วยบิน/);
await assert.rejects(()=>call('attack',{...launch,request_id:nonce(),ship:2,cargo:[4,0,0,0,0,0,0,0,0,0,0],x:10,y:10}),/ลงจอด/);
await assert.rejects(()=>call('attack',{...launch,request_id:nonce(),ship:2},other),/สิทธิ์/);
const air={live:'siege_logistics277',id:room.id,request_id:nonce(),action:'air',kind:7,count:1,target:0,x:4.75,y:7.25};let ar=await call('attack',air);const exact=(await db.query("select y,logistics277 from nova_private.siege_orders where kind=7 order by id desc limit 1")).rows[0];assert.equal(+exact.y,7.25);assert.equal(+exact.logistics277.x,4.75,'empty-ground coordinate survives authoritative reservation');let rest=ar.battle.army[7];ar=await call('attack',{...air,request_id:nonce(),retarget:true});assert.equal(ar.battle.army[7],rest,'retarget does not deploy another plane');
const unload={live:'siege_logistics277',id:room.id,request_id:nonce(),action:'unload',ship:1};r=await call('attack',unload);assert(r.battle.logisticsOrders277.some(c=>c.payload.action==='unload'));
const orders=r.battle.orders,ack=Math.max(...orders.map(o=>o.id));
// One survivor on the ground, remaining cargo lost: return survivor plus unlaunched reserve.
await db.query("update nova_private.sieges set ack=$2,frame=$3 where id=$1",[room.id,ack,JSON.stringify({logistics277:true,buildings:[[0],[0],[600]],troops:[[0,0,10,100,150,0,0,0,0,0,orders[0].id]],guards:[],transports277:[{id:1,owner:uid,hp:0,cargo:orders.slice(1).map(o=>({kind:o.kind,order:o.id}))}]})]);
await db.query('select nova_private.siege_finish($1)',[room.id]);const result=(await db.query('select result from nova_private.sieges where id=$1',[room.id])).rows[0].result[uid];assert.equal(result.destruction,100,'concealed trap does not block total destruction');assert.equal(result.army[0],5);assert.equal(result.army[1],0);await db.query('select nova_private.siege_finish($1)',[room.id]);assert.deepEqual((await db.query('select result from nova_private.sieges where id=$1',[room.id])).rows[0].result[uid],result);
await db.exec('set role authenticated');await assert.rejects(()=>db.query('select * from nova_private.logistics_orders277'));await db.exec('reset role');
console.log('PASS army278 database: authenticated cargo orders, ownership, aircraft exclusion, landing bounds, nonce retries, manual unload events, casualty and survivor settlement');await db.close();})().catch(e=>{console.error(e);process.exit(1)});
