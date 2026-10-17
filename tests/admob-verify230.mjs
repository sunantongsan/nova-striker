import assert from 'node:assert/strict';import {generateKeyPairSync,sign} from 'node:crypto';import {parseCallback,verifyCallback} from '../backend/functions/nova-admob-ssv/verify.mjs';
const {privateKey,publicKey}=generateKeyPairSync('ec',{namedCurve:'prime256v1'}),pem=publicKey.export({type:'spki',format:'pem'});
const content='ad_unit=9387691342&custom_data=hello%20world&reward_amount=1&timestamp=123&transaction_id=abc&user_id=123';const signature=sign('sha256',Buffer.from(content),privateKey).toString('base64url');
const url='https://example.test/?'+content+'&signature='+signature+'&key_id=1';assert.equal((await verifyCallback(parseCallback(url),pem)).custom_data,'hello world');
await assert.rejects(()=>verifyCallback(parseCallback(url.replace('reward_amount=1','reward_amount=100')),pem));assert.throws(()=>parseCallback(url+'&user_id=spoof'));assert.throws(()=>parseCallback(url.replace('ad_unit=9387691342','ad_unit=9387691342&ad_unit=9387691342')));await assert.rejects(()=>verifyCallback(parseCallback(url),generateKeyPairSync('ec',{namedCurve:'prime256v1'}).publicKey));
console.log('PASS SSV: exact-byte ECDSA, tamper/duplicate/unsigned suffix/wrong-key rejection');
