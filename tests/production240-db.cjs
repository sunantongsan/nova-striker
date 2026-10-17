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
for(const telegram of [false,true]){
 const table=telegram?'monetag_intents231':'admob_intents230',key=telegram?'monetag231':'admob230';
 await db.exec('delete from nova_private.admob_intents230;delete from nova_private.monetag_intents231;update public.nova_war_players set resource_gold=0,resource_power=0,crystals=0,resource_at=now()');
 const p={owner:uid,request_id:nonce(),kind:'production',[key]:'prepare'};
 let r=await call('research',p,uid,telegram);assert.equal(r.ad_reward.production240.gold,2160);assert.equal(r.ad_reward.production240.power,3240);assert(r.ad_reward.production240.crystals>0);
 await assert.rejects(()=>call('research',{...p,request_id:nonce()},uid,telegram),/รายการก่อน/);
 r=await call('research',{...p,[key]:'claim',completed234:true},uid,telegram);assert(!r.ad_reward.claimed);
 await db.query('update nova_private.'+table+' set verified_at=now() where id=$1',[p.request_id]);
 r=await call('research',{...p,[key]:'claim',completed234:true},uid,telegram);assert(r.ad_reward.claimed);assert.equal(r.ad_reward.granted240.gold,2160);assert.equal(r.ad_reward.granted240.power,3240);
 const before=r.resources.gold_delta;r=await call('research',{...p,[key]:'claim',completed234:true},uid,telegram);assert.equal(r.resources.gold_delta,before);
 r=await call('research',{...p,request_id:nonce()},uid,telegram);assert(r.ad_reward.production240,'next ad immediately available');
}
const defs=await db.query("select prosrc from pg_proc where proname in ('checkin_ad234','nova_telegram_command','command_before_resources233')");assert(defs.rows.every(x=>!x.prosrc.includes("interval '2 minutes'")));
console.log('PASS production240: both providers, all resources quoted, verification gate, atomic grant, replay protection, no cooldown and concurrent receipt guard');await db.close();})().catch(e=>{console.error(e);process.exit(1)});
