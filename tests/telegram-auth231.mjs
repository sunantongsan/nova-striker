import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {validateInitData,BOT_ID} from '../backend/functions/nova-telegram-auth/verify.mjs';
const {publicKey,privateKey}=generateKeyPairSync('ed25519');
const hex=publicKey.export({format:'der',type:'spki'}).subarray(-32).toString('hex');
const now=1770000000;
function fixture(fields={},botId=BOT_ID){const p=new URLSearchParams({auth_date:String(now),user:JSON.stringify({id:123456789,first_name:'ผู้เล่น'}),...fields});const check=botId+':WebAppData\n'+[...p].sort(([a],[b])=>a<b?-1:1).map(([k,v])=>k+'='+v).join('\n');p.set('signature',sign(null,Buffer.from(check),privateKey).toString('base64url'));p.set('hash','unused');return p.toString();}
const options={publicKey:hex,now};
assert.deepEqual(await validateInitData(fixture(),options),{id:'123456789'});
await assert.rejects(()=>validateInitData(fixture({auth_date:String(now-301)}),options));
await assert.rejects(()=>validateInitData(fixture({auth_date:String(now+31)}),options));
await assert.rejects(()=>validateInitData(fixture({},'111111111'),options));
await assert.rejects(()=>validateInitData(fixture().replace('123456789','123456780'),options));
await assert.rejects(()=>validateInitData(fixture()+'&user={}',options));
await assert.rejects(()=>validateInitData(fixture({user:'{"id":-1}'}),options));
await assert.rejects(()=>validateInitData(fixture({user:'{"id":123,"is_bot":true}'}),options));
await assert.rejects(()=>validateInitData('user={"id":123}',options));
console.log('PASS Telegram signatures: valid login, wrong bot, tampering, expiry, future timestamp, duplicate keys, invalid users');
