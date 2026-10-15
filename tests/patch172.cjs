const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {build,hash}=require('../scripts/patch.cjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'nova-pack-')),src=path.join(dir,'src'),out=path.join(dir,'out');
try{
 fs.mkdirSync(path.join(src,'assets'),{recursive:true});
 fs.writeFileSync(path.join(src,'patch-config.json'),JSON.stringify({schema:1,channel:'test',nativeVersion:19,contentVersion:1,label:'test',maxBytes:67108864}));
 for(const [p,s]of Object.entries({'index.html':'game','game.js':'code','assets/tank.webp':'image','assets/private.txt':'not public'}))fs.writeFileSync(path.join(src,p),s);
 const a=build(src,out);assert.equal(a.files.length,3);assert(!fs.existsSync(path.join(out,'assets/private.txt')));
 assert.deepEqual(build(src,out),a,'pack must be deterministic');
 fs.writeFileSync(path.join(src,'assets/tank.webp'),'new image');const b=build(src,out);
 assert.notEqual(a.id,b.id);assert.equal(a.files.filter((f,i)=>f.sha256!==b.files[i].sha256).length,1,'only changed asset downloaded');
 for(const f of b.files){const data=fs.readFileSync(path.join(out,'objects',f.sha256));assert.equal(data.length,f.size);assert.equal(hash(data),f.sha256);}
 assert.equal(JSON.parse(fs.readFileSync(path.join(out,'patches/test/native-19/manifest.json'))).id,b.id);
 assert(!fs.existsSync(path.join(out,'patches/live')),'test patch must not leak into live channel');
 console.log('PASS patch manifest: deterministic, delta files, hashes, channel separation, source exclusion');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
