import { Buffer } from 'node:buffer';
// Verify Google's form-decoded query without reordering or reserializing parameters.
export function parseCallback(url) {
 const raw=new URL(url).search.slice(1);
 if(raw.length>8192)throw Error('query');
 const match=/^(.+)&signature=([A-Za-z0-9_%=-]+)&key_id=(\d+)$/.exec(raw);
 if(!match)throw Error('signature');
 const p=new URLSearchParams(raw),seen=new Set();
 for(const [k] of p){if(seen.has(k))throw Error('duplicate');seen.add(k);}
 return {p,content:decodeURIComponent(match[1].replace(/\+/g,' ')),signature:Buffer.from(decodeURIComponent(match[2]),'base64url'),keyId:match[3]};
}
export function derToRaw(bytes){
 if(bytes[0]!==48||bytes[1]!==bytes.length-2)throw Error('DER sequence');
 let pos=2;const out=new Uint8Array(64);
 for(let i=0;i<2;i++){
  if(bytes[pos++]!==2)throw Error('DER integer');let size=bytes[pos++];
  if(size<1||size>33||pos+size>bytes.length||bytes[pos]&128)throw Error('DER length');
  let value=bytes.subarray(pos,pos+size);pos+=size;
  if(value.length>1&&value[0]===0){if(!(value[1]&128))throw Error('DER padding');value=value.subarray(1);}
  if(value.length>32)throw Error('DER size');out.set(value,i*32+32-value.length);
 }
 if(pos!==bytes.length)throw Error('DER trailing');return out;
}
export async function verifyCallback(parsed,pem) {
 if(typeof pem!=='string')throw Error('key');
 const spki=Buffer.from(pem.replace(/-----[^-]+-----|\s/g,''),'base64');
 const key=await crypto.subtle.importKey('spki',spki,{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
 if(!await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,derToRaw(parsed.signature),new TextEncoder().encode(parsed.content)))throw Error('signature');
 return Object.fromEntries(parsed.p);
}
