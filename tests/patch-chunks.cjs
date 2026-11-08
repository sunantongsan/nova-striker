const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {build,hash}=require('../scripts/patch.cjs'),chunker=require('../scripts/patch-chunks.cjs');
const dir=process.argv[2]||fs.mkdtempSync(path.join(os.tmpdir(),'nova-delta-'));
fs.mkdirSync(dir,{recursive:true});fs.mkdirSync(path.join(dir,'assets'),{recursive:true});
let state=0x76543210;const data=Buffer.alloc(12*1024*1024),alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
for(let i=0;i<data.length;i++){state^=state<<13;state^=state>>>17;state^=state<<5;data[i]=alphabet.charCodeAt((state>>>0)%64);}
const old=Buffer.concat([Buffer.from('<style>button{color:red}</style><script>var model="'),data,Buffer.from('";</script>')]);
const next=Buffer.concat([old.subarray(0,1000),Buffer.from('small interface change'),old.subarray(1000)]);
fs.writeFileSync(path.join(dir,'old.bin'),old);fs.writeFileSync(path.join(dir,'next.bin'),next);
const before=chunker.chunks(old),after=chunker.chunks(next),known=new Set(before.map(c=>c.sha256));
const missing=after.filter(c=>!known.has(c.sha256)).reduce((n,c)=>n+c.size,0);
assert(missing>0&&missing<=256*1024,'small insertion should not transfer the entire model payload');
assert.deepEqual(chunker.chunks(next),after,'repeatable boundaries');
assert.equal(after.reduce((n,c)=>n+c.size,0),next.length);
fs.writeFileSync(path.join(dir,'index.html'),next);fs.writeFileSync(path.join(dir,'game.js'),'var game=true;');
fs.writeFileSync(path.join(dir,'patch-config.json'),JSON.stringify({schema:1,channel:'test',nativeVersion:39,compatibleNativeVersions:[38],contentVersion:152,label:'delta test',maxBytes:67108864}));
const output=path.join(dir,'output'),m=build(dir,output),file=m.files.find(f=>f.path==='index.html');
assert.deepEqual(file.chunks,after.map(({size,sha256})=>({size,sha256})));
assert(fs.readFileSync(path.join(output,'objects',file.sha256)).equals(next),'full-file fallback for old clients');
let offset=0;for(const c of file.chunks){const b=fs.readFileSync(path.join(output,'objects',c.sha256));assert.equal(hash(b),c.sha256);assert(b.equals(next.subarray(offset,offset+c.size)));offset+=c.size;}
const legacy=JSON.parse(fs.readFileSync(path.join(output,'patches/test/native-38/manifest.json')));
assert(legacy.files.every(f=>!f.chunks),'legacy manifest stays small');
assert.equal(legacy.files.find(f=>f.path==='index.html').sha256,file.sha256);
fs.writeFileSync(path.join(dir,'chunks.tsv'),after.map(c=>c.sha256+'\t'+c.size).join('\n'));
fs.writeFileSync(path.join(dir,'expected.txt'),hash(next)+'\n'+missing);
console.log(JSON.stringify({oldBytes:old.length,newBytes:next.length,downloadBytes:missing,savedPercent:Number((100*(1-missing/next.length)).toFixed(2)),chunks:after.length}));
if(!process.argv[2])fs.rmSync(dir,{recursive:true,force:true});
