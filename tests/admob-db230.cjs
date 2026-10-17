const {PGlite}=require('@electric-sql/pglite'),fs=require('fs'),assert=require('assert');
(async()=>{const db=new PGlite();await db.exec(`create role service_role;create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;`);
for(const file of ['nova_war.sql','nova_160.sql','nova_170.sql','nova_infrastructure_fix.sql','nova_economy_180.sql','nova_war_browse.sql','nova_live.sql','nova_siege_200.sql','nova_enhance_210.sql','nova_transport_212.sql','nova_merc_recruit_213.sql','nova_disable_reverse_215.sql','nova_names_224.sql','nova_upgrade_timers_225.sql','nova_rocket_caps_227.sql','nova_builders_speed_228.sql','nova_speed_economy_229.sql','nova_admob_230.sql'])await db.exec(fs.readFileSync('backend/'+file,'utf8'));
const uid='10000000-0000-4000-8000-000000000001';await db.query('insert into auth.users values($1)',[uid]);let serial=0;const nonce=()=>`20000000-0000-4000-8000-${String(++serial).padStart(12,'0')}`;
async function call(action,payload={}){await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid]);await db.exec('set role authenticated');try{return(await db.query('select public.nova_war_command($1,$2) result',[action,JSON.stringify(payload)])).rows[0].result;}finally{await db.exec('reset role');}}


let r=await call('enroll',{layout:[{type:'hq',lv:15,x:10,y:10},{type:'mine',lv:1,x:9,y:10},{type:'tech',lv:10,x:8,y:10},{type:'crystalplant',lv:1,x:7,y:10}]});assert.equal(r.admob230,false);
const payload={admob230:'prepare',owner:uid,request_id:nonce(),kind:'gold'};
await assert.rejects(()=>call('research',payload),/ยังไม่เปิด/);
await db.exec("update nova_private.admob_settings230 set enabled=true");
r=await call('research',payload);assert.equal(r.ad_reward.amount,1080);const id=payload.request_id;
await assert.rejects(()=>call('research',{...payload,kind:'power'}),/รหัสรางวัล/);
r=await call('research',{...payload,admob230:'claim'});assert.equal(r.ad_reward.claimed,false);
await db.exec('set role authenticated');await assert.rejects(()=>db.query('select public.nova_admob_verify230($1,$2,$3,$4)',[uid,id,'tx1',Date.now()]));await db.exec('reset role');
assert.equal((await db.query('select public.nova_admob_verify230($1,$2,$3,$4) ok',[uid,id,'tx1',Date.now()])).rows[0].ok,true);
r=await call('research',{...payload,admob230:'claim'});assert.equal(r.ad_reward.granted,1080);assert.equal(r.resources.gold_delta,1080);
r=await call('research',{...payload,admob230:'claim'});assert.equal(r.resources.gold_delta,1080);
assert.equal((await db.query('select public.nova_admob_verify230($1,$2,$3,$4) ok',[uid,id,'tx2',Date.now()])).rows[0].ok,false);
await assert.rejects(()=>call('research',{...payload,request_id:nonce()}),/2 นาที/);
await db.exec("update nova_private.admob_intents230 set created_at=now()-interval '3 minutes';update public.nova_war_players set crystals=10000");
const job=nonce();await call('research',{kind:'weapon',request_id:job});await db.query("update nova_private.upgrade_jobs225 set finishes_at=now()+interval '30 minutes' where request_id=$1",[job]);
const speed={admob230:'prepare',owner:uid,request_id:nonce(),kind:'speed',job};r=await call('research',speed);assert.equal(r.ad_reward.amount,1500);
await db.query('select public.nova_admob_verify230($1,$2,$3,$4)',[uid,speed.request_id,'tx3',Date.now()]);
r=await call('research',{...speed,admob230:'claim'});assert.equal(r.ad_reward.granted,1500);const secs=(await db.query('select extract(epoch from(finishes_at-now())) remaining from nova_private.upgrade_jobs225 where request_id=$1',[job])).rows[0].remaining;assert(secs>290&&secs<=300);
await db.exec('set role authenticated');await assert.rejects(()=>db.exec('select * from nova_private.admob_intents230'));await db.exec('reset role');
console.log('PASS AdMob: disabled gate, owner-bound intent, actual production, cooldown, unverified no grant, service-only verification, idempotent claims, 25min selected job, private ACL');await db.close();})().catch(e=>{console.error(e);process.exit(1)});
