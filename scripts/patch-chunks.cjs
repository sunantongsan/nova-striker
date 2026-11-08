// Content-defined boundaries keep later chunks stable after small insertions.
const crypto=require('node:crypto');
const MIN=16*1024,MAX=128*1024,MASK=65535,THRESHOLD=256*1024;
const gear=[];let seed=0x12345678;
for(let i=0;i<256;i++){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;gear.push(seed>>>0);}
function chunks(bytes){
 const out=[];let start=0,rolling=0;
 for(let i=0;i<bytes.length;i++){
  rolling=((rolling<<1)+gear[bytes[i]])>>>0;const size=i+1-start;
  if(size>=MAX||(size>=MIN&&(rolling&MASK)===0)){
   const data=bytes.subarray(start,i+1);out.push({offset:start,size,sha256:crypto.createHash('sha256').update(data).digest('hex')});start=i+1;rolling=0;
  }
 }
 if(start<bytes.length){const data=bytes.subarray(start);out.push({offset:start,size:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')});}
 return out;
}
module.exports={chunks,MIN,MAX,THRESHOLD};
