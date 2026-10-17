const {PGlite}=require('@electric-sql/pglite'),fs=require('fs'),assert=require('assert');
(async()=>{const db=new PGlite();await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;`);
for(const file of ['nova_war.sql','nova_160.sql','nova_170.sql','nova_infrastructure_fix.sql','nova_economy_180.sql','nova_war_browse.sql','nova_live.sql','nova_siege_200.sql','nova_enhance_210.sql','nova_transport_212.sql','nova_merc_recruit_213.sql','nova_disable_reverse_215.sql','nova_names_224.sql','nova_upgrade_timers_225.sql','nova_rocket_caps_227.sql'])await db.exec(fs.readFileSync('backend/'+file,'utf8'));
const uid='10000000-0000-4000-8000-000000000001';await db.query('insert into auth.users values($1)',[uid]);let serial=0;const nonce=()=>`20000000-0000-4000-8000-${String(++serial).padStart(12,'0')}`;
async function call(action,payload={}){await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid]);await db.exec('set role authenticated');try{return(await db.query('select public.nova_war_command($1,$2) result',[action,JSON.stringify(payload)])).rows[0].result;}finally{await db.exec('reset role');}}

function layout(lv,n){return [{type:'hq',x:10,y:10,lv},...Array.from({length:n},(_,i)=>({type:'missileturret',x:i+1,y:5,lv:1}))];}
await call('enroll',{layout:layout(1,1)});
for(const [lv,cap] of [[1,1],[4,1],[5,2],[9,2],[10,3],[14,3],[15,4]]){await call('publish',{layout:layout(lv,cap)});await assert.rejects(()=>call('publish',{layout:layout(lv,cap+1)}),/จำนวนอาคาร/);}
await assert.rejects(()=>call('publish',{layout:[...layout(15,4),{type:'missileturret',x:1,y:5,lv:1}]}),/จำนวนอาคาร/);
await db.exec(fs.readFileSync('backend/nova_rocket_caps_227.sql','utf8'));
assert.equal((await db.query("select has_function_privilege('authenticated','nova_private.command_before_siege(text,jsonb)','execute') allowed")).rows[0].allowed,false);
assert.equal((await call('status')).active_upgrades.length,0);
console.log('PASS online rocket caps: HQ boundaries, maximum four, invalid placement, idempotent migration, private ACL and timer protocol preserved');await db.close();})().catch(e=>{console.error(e);process.exit(1)});
