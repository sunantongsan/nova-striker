// Static, content-addressed game patches. Never publish the repository root.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function build(source=root,output=path.join(root,'patch-dist')){
 const config=JSON.parse(fs.readFileSync(path.join(source,'patch-config.json')));
 if(config.schema!==1||!['test','live'].includes(config.channel)||!Number.isSafeInteger(config.nativeVersion)||config.nativeVersion<19||!Number.isSafeInteger(config.contentVersion)||config.contentVersion<1)throw Error('Invalid patch configuration');
 const content=p=>{const bytes=p==='game.js'&&config.titan342?Buffer.from(require('../features/titan342/build.cjs').payload(fs.readFileSync(path.join(source,p),'utf8'))):fs.readFileSync(path.join(source,p));return p==='index.html'?Buffer.from(bytes.toString('utf8').replace(/var info=\{contentVersion:\d+,label:"[^"]*"\};/,'var info={contentVersion:'+JSON.stringify(config.contentVersion)+',label:'+JSON.stringify(config.label)+'};')):bytes;};
 const paths=['index.html','game.js',...fs.readdirSync(path.join(source,'assets')).filter(p=>p.endsWith('.webp')).sort().map(p=>'assets/'+p)];
 const files=paths.map(p=>{const bytes=content(p);return{path:p,sha256:hash(bytes),size:bytes.length};});
 const size=files.reduce((n,f)=>n+f.size,0);if(size>config.maxBytes||size>67108864)throw Error('Patch too large');
 const manifest={schema:1,channel:config.channel,nativeVersion:config.nativeVersion,contentVersion:config.contentVersion,label:config.label,files};
 manifest.id=hash(Buffer.from(JSON.stringify(manifest)));
 fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(path.join(output,'objects'),{recursive:true});
 for(const f of files)fs.writeFileSync(path.join(output,'objects',f.sha256),content(f.path));
 const dir=path.join(output,'patches',config.channel,'native-'+config.nativeVersion);fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest));
 for(const version of config.compatibleNativeVersions||[]){if(!Number.isSafeInteger(version)||version<19)throw Error('Invalid compatible native version');const compatible={...manifest,nativeVersion:version};delete compatible.id;compatible.id=hash(Buffer.from(JSON.stringify(compatible)));const compatDir=path.join(output,'patches',config.channel,'native-'+version);fs.mkdirSync(compatDir,{recursive:true});fs.writeFileSync(path.join(compatDir,'manifest.json'),JSON.stringify(compatible));}
 fs.writeFileSync(path.join(output,'index.html'),'<!doctype html><meta charset="utf-8"><title>Nova Striker Updates</title><p>Nova Striker game content delivery</p>');
 return manifest;
}
function android(source=root,expectedNative){
 const config=JSON.parse(fs.readFileSync(path.join(source,'patch-config.json'),'utf8'));
 if(!Number.isSafeInteger(expectedNative)||config.nativeVersion!==expectedNative)throw Error('Android versionCode and patch nativeVersion must match');
 const output=path.join(source,'patch-dist'),m=build(source,output);
 const contentDir=path.join(source,'app/build/generated/gameAssets'),manifestDir=path.join(source,'app/build/generated/patchAssets');
 fs.rmSync(contentDir,{recursive:true,force:true});fs.mkdirSync(contentDir,{recursive:true});fs.mkdirSync(manifestDir,{recursive:true});
 for(const f of m.files){const dest=path.join(contentDir,f.path);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(output,'objects',f.sha256),dest);}
 fs.writeFileSync(path.join(manifestDir,'patch-bundled.json'),JSON.stringify(m));
 return m;
}
if(require.main===module){
 const i=process.argv.indexOf('--native-version');
 const m=process.argv.includes('--android')?android(root,i>=0?Number(process.argv[i+1]):NaN):build();
 console.log('Patch',m.label,m.id,m.files.length,'verified content files');
}
module.exports={build,hash,android};

