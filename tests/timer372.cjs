const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');
test('idle mech status rejects null quote before fix and returns zero after fix',async()=>{
 const db=new PGlite();try{
 await db.exec('create schema nova_private; create role anon; create role authenticated;');
 await db.exec(fs.readFileSync('backend/nova_speed_reference_365.sql','utf8').split('do $migration$')[0].replace('begin;',''));
 await db.exec(`create table nova_private.titans342(owner uuid,finishes_at timestamptz,recovery_until347 timestamptz,upgrade_until355 timestamptz);insert into nova_private.titans342(owner) values('00000000-0000-4000-8000-000000000001');`);
 for(const [fn,col] of [['titan_state_before347','finishes_at'],['titan_state_before355','recovery_until347'],['titan_state_before370','upgrade_until355']]){
 await db.exec(`create function nova_private.${fn}(who uuid) returns jsonb language sql stable as $$select jsonb_build_object('quote',nova_private.speed_price365(extract(epoch from(${col}-now())))) from nova_private.titans342 where owner=who$$;`);
 await assert.rejects(()=>db.query(`select nova_private.${fn}('00000000-0000-4000-8000-000000000001')`),/Invalid remaining time/);
 }
 await db.exec(fs.readFileSync('backend/nova_timer_quotes_372.sql','utf8'));
 for(const fn of ['titan_state_before347','titan_state_before355','titan_state_before370'])assert.equal((await db.query(`select nova_private.${fn}('00000000-0000-4000-8000-000000000001') as state`)).rows[0].state.quote,0);
 await db.exec("update nova_private.titans342 set finishes_at=now()+interval '1 hour'");
 assert.equal((await db.query("select nova_private.titan_state_before347('00000000-0000-4000-8000-000000000001') as state")).rows[0].state.quote,18);
 await assert.rejects(()=>db.query('select nova_private.speed_price365(null)'),/Invalid remaining time/);
 }finally{await db.close()}
});
