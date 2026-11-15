// 405: with AdMob off and demo ads on, speed-up videos use the Google demo ad again (provider 'test').
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'rewards367.cjs'),'utf8');
assert.match(src,/nova_speed_ads_368\.sql/);
const patched=src.replace("await db.exec(fs.readFileSync('backend/nova_speed_ads_368.sql','utf8'));","await db.exec(fs.readFileSync('backend/nova_speed_ads_368.sql','utf8'));await db.exec(fs.readFileSync('backend/nova_speed_ads_405.sql','utf8'));")
 .split('\n').filter(l=>!l.startsWith('test(')).join('\n')
 +`
test('405: demo provider when AdMob is off and demo ads are on; blocked when demo is off',async()=>{const db=await speedSetup();try{
 await db.exec('update nova_private.admob_settings230 set enabled=false;delete from nova_private.test_checkin_settings248;insert into nova_private.test_checkin_settings248 values(true)');
 const r=await speed(db,'prepare',41);assert.equal(r.receipt.provider,'test');assert.equal(r.receipt.seconds,900);
 assert.equal((await speed(db,'claim',41)).receipt.claimed,true);
 for(let n=42;n<=46;n++){await speed(db,'prepare',n);}
 await assert.rejects(speed(db,'prepare',47),/6/);
 await db.exec('update nova_private.test_checkin_settings248 set enabled=false');
 await assert.rejects(speed(db,'prepare',48));
}finally{await db.close();}});
`;
const tmp=path.join(__dirname,'.speed405.tmp.cjs');fs.writeFileSync(tmp,patched);try{require(tmp);}finally{setTimeout(()=>fs.rmSync(tmp,{force:true}),0);}
