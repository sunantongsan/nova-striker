const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const p=require('../scripts/patch.cjs'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'nova-native-'));
try{
 fs.mkdirSync(path.join(dir,'assets'));
 fs.writeFileSync(path.join(dir,'index.html'),'var info={contentVersion:91,label:"old"};');
 fs.writeFileSync(path.join(dir,'game.js'),'game');
 fs.writeFileSync(path.join(dir,'assets/energy-shell286.webp'),'shell');
 fs.writeFileSync(path.join(dir,'patch-config.json'),JSON.stringify({schema:1,channel:'test',nativeVersion:30,contentVersion:92,label:'new',maxBytes:67108864}));
 assert.throws(()=>p.android(dir,27),/must match/);
 assert.throws(()=>p.android(dir,NaN),/must match/);
 const m=p.android(dir,30);
 for(const f of m.files){const b=fs.readFileSync(path.join(dir,'app/build/generated/gameAssets',f.path));assert.equal(b.length,f.size);assert.equal(p.hash(b),f.sha256);}
 assert(fs.readFileSync(path.join(dir,'app/build/generated/gameAssets/index.html'),'utf8').includes('contentVersion:92'));
 assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'app/build/generated/patchAssets/patch-bundled.json'))).nativeVersion,30);
 console.log('PASS native version guard and exact bundled bytes');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
