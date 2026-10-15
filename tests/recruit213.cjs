const {PGlite}=require('@electric-sql/pglite'),fs=require('fs'),assert=require('assert');
(async()=>{const db=new PGlite();await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;`);for(const file of ['nova_war.sql','nova_160.sql','nova_170.sql','nova_infrastructure_fix.sql','nova_economy_180.sql','nova_war_browse.sql','nova_live.sql','nova_siege_200.sql','nova_enhance_210.sql','nova_transport_212.sql','nova_merc_recruit_213.sql'])await db.exec(fs.readFileSync('backend/'+file,'utf8'));
const a='10000000-0000-4000-8000-000000000001',b='10000000-0000-4000-8000-000000000002',c='10000000-0000-4000-8000-000000000003';await db.query('insert into auth.users values($1),($2),($3)',[a,b,c]);let n=0;const id=()=>`20000000-0000-4000-8000-${String(++n).padStart(12,'0')}`;
async function call(uid,action,payload={}){await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid]);await db.exec('set role authenticated');try{return(await db.query('select public.nova_war_command($1,$2) result',[action,JSON.stringify(payload)])).rows[0].result;}finally{await db.exec('reset role');}}
const live=(uid,mode,p={})=>call(uid,'attack',{live:'siege_'+mode,...p}),layout=[{type:'hq',x:10,y:10,lv:7},{type:'mine',x:11,y:10,lv:3}],army=[4,0,0,0,0,0,0,0,0,0,0];for(const uid of[a,b,c])await call(uid,'enroll',{layout});

const buy=(uid,nonce=id(),extra={})=>live(uid,'recruit',{request_id:nonce,...extra});
await assert.rejects(()=>buy(a),/ต้องมีฐาน/);
const base=[...layout,{type:'mercenary',x:8,y:8,lv:1},{type:'tech',x:9,y:8,lv:2}];
for(const uid of[a,b])await call(uid,'publish',{layout:base});
await db.exec("update public.nova_war_players set shield_until=now()-interval '1 second',resource_power=5000,resource_at=now(),power_rate=0");
let nonce=id(),r=await buy(a,nonce);assert.equal(r.merc.total,1);assert.equal(r.merc.seconds,0);assert.equal(r.merc.capacity,12);assert.equal(r.online.resources.power_delta,-150);
assert.equal((await buy(a,nonce)).merc.total,1);assert.equal((await buy(a,nonce)).online.resources.power_delta,-150);
await db.exec("update nova_private.mercenaries set produced_at=now()-interval '20 days'");assert.equal((await live(a,'status')).merc.total,1,'no automatic production');
for(let i=1;i<12;i++)await buy(a);assert.equal((await live(a,'status')).merc.total,12);await assert.rejects(()=>buy(a),/เต็ม/);
await call(a,'publish',{layout:base.map(x=>x.type==='mercenary'?{...x,lv:2}:x)});r=await live(a,'status');assert.equal(r.merc.capacity,14);assert.equal(r.merc.total,12);await buy(a);
await db.query('update public.nova_war_players set resource_power=149 where user_id=$1',[b]);await assert.rejects(()=>buy(b),/พลังงาน/);assert.equal((await live(b,'status')).merc.total,0);
let peek=await live(a,'peek',{target:b});assert.equal(peek.target.merc_version,2);
let room=(await live(a,'start',{target:b,army,request_id:id()})).battle;assert.equal(room.target.merc_version,2);assert.equal(room.orders.length,6);assert(room.orders.every(o=>o.alien&&o.kind===5));assert.equal((await live(a,'status')).merc.total,7);
await assert.rejects(()=>buy(a),/รอการรบ/);await assert.rejects(()=>buy(b),/รอการรบ/);
assert.equal((await buy(a,nonce)).receipt.id,nonce,'replay succeeds without duplicate troop or debit during battle');
await db.exec('set role authenticated');await assert.rejects(()=>db.query("select nova_private.siege_command_before_recruit('{}')"));await db.exec('reset role');
console.log('PASS merc recruitment: unlock, exact charge, idempotency, no passive troops, capacity upgrade, insufficient funds, fighter orders, half allocation, battle lock and private alias');await db.close();})().catch(e=>{console.error(e);process.exit(1)});
