// Reproducible offline payload: pinned CC0 models, compressed within allowed game.js.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),zlib=require('zlib');
const root=path.resolve(__dirname,'../..'),dir=__dirname,sha='1b8fb9d54160215c071c5a29a49b1c36dc01f0df';
const sources={'atlas-09':'68913d17f93d48775ea628883fb49e93368bb405','vanguard-07':'32536bad2a9542f5a02675535709817322678372','titan-06':'258a2b9da020cc3cd9a12475661d3ca3c51e974e','ronin-04':'92ba2cfe2d447835e5a888ff8dc1d118a7139704'};
function gitHash(b){return crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');}
async function compact(b){
 const sharp=require('sharp'),j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12))),off=20+b.readUInt32LE(12)+8,bin=b.subarray(off),chunks=[];let pos=0;
 const imageViews=new Map(j.images.map(i=>[i.bufferView,i]));
 for(let n=0;n<j.bufferViews.length;n++){const v=j.bufferViews[n];let data=bin.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength);if(imageViews.has(n)){const image=imageViews.get(n);const s=sharp(data).resize({width:512,height:512,fit:'inside',withoutEnlargement:true});data=await s.png({compressionLevel:9}).toBuffer();image.mimeType='image/png';}v.byteOffset=pos;v.byteLength=data.length;chunks.push(data);pos+=data.length;const pad=(4-pos%4)%4;if(pad){chunks.push(Buffer.alloc(pad));pos+=pad;}}
 j.buffers=[{byteLength:pos}];let js=Buffer.from(JSON.stringify(j));js=Buffer.concat([js,Buffer.alloc((4-js.length%4)%4,32)]);const body=Buffer.concat(chunks),out=Buffer.alloc(28+js.length+body.length);out.writeUInt32LE(0x46546c67,0);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);out.writeUInt32LE(js.length,12);out.writeUInt32LE(0x4e4f534a,16);js.copy(out,20);out.writeUInt32LE(body.length,20+js.length);out.writeUInt32LE(0x004e4942,24+js.length);body.copy(out,28+js.length);return out;
}
async function build(){
 const cache=path.join(root,'staging/titan/forge/models');fs.mkdirSync(cache,{recursive:true});const packed={},motions={},portraits={};
 for(const [name,hash] of Object.entries(sources)){const file=path.join(cache,name+'.glb');let b=fs.existsSync(file)?fs.readFileSync(file):null;if(!b||gitHash(b)!==hash){const r=await fetch(`https://raw.githubusercontent.com/RamonLinares/atlas-09/${sha}/public/models/${name}.glb`);if(!r.ok)throw Error('Model download '+r.status);b=Buffer.from(await r.arrayBuffer());if(gitHash(b)!==hash)throw Error('Model integrity '+name);fs.writeFileSync(file,b);}if(name==='ronin-04'){// Preserve the reserved model off-line; transfer quaternion sword motion only.
 const j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12))),bin=b.subarray(28+b.readUInt32LE(12));
 for(const a of j.animations.filter(a=>['SwordSlash','SwordCombo'].includes(a.name))){motions[a.name]=a.channels.filter(c=>c.target.path==='rotation').map(c=>{const s=a.samplers[c.sampler],read=i=>{const ac=j.accessors[i],v=j.bufferViews[ac.bufferView],n=ac.count*(ac.type==='VEC4'?4:1),start=(v.byteOffset||0)+(ac.byteOffset||0);return Array.from({length:n},(_,k)=>bin.readFloatLE(start+k*4));};return {name:j.nodes[c.target.node].name,times:read(s.input),values:read(s.output)};});}const small=await compact(b);const packedHQ=zlib.gzipSync(small,{level:9}).toString('base64');fs.writeFileSync(path.join(dir,'hq-payload.generated.json'),JSON.stringify(packedHQ));console.log(name,small.length,'bytes',packedHQ.length,'embedded in HTML');continue;}
 const renderPath=name==='atlas-09'?'output/atlas-09-beauty.png':'output/'+name+'/'+name+'-beauty.png';const pr=await fetch(`https://raw.githubusercontent.com/RamonLinares/atlas-09/${sha}/${renderPath}`);if(!pr.ok)throw Error('Portrait download');portraits[name]='data:image/webp;base64,'+(await require('sharp')(Buffer.from(await pr.arrayBuffer())).resize(192,192).webp({quality:78}).toBuffer()).toString('base64');
 const small=await compact(b);packed[name]=zlib.gzipSync(small,{level:9}).toString('base64');console.log(name,small.length,'bytes',packed[name].length,'embedded');}
 fs.writeFileSync(path.join(dir,'payload.generated.json'),JSON.stringify({packed,motions,portraits}));
 const esbuild=require('esbuild');await esbuild.build({entryPoints:[path.join(dir,'renderer.js')],bundle:true,minify:true,format:'iife',target:'es2020',outfile:path.join(dir,'renderer.generated.js'),legalComments:'eof'});
}
function integrate(source){
 if(source.includes('/* titan342:engine */'))return source;
 const core=fs.readFileSync(path.join(dir,'engine.js'),'utf8')+'\n'+fs.readFileSync(path.join(dir,'hq-engine.js'),'utf8')+'\n'+fs.readFileSync(path.join(dir,'economy-engine.js'),'utf8')+'\n'+fs.readFileSync(path.join(dir,'production-engine.js'),'utf8'),ui=fs.readFileSync(path.join(dir,'ui.js'),'utf8')+'\n'+fs.readFileSync(path.join(dir,'purchase-celebration.js'),'utf8')+'\n'+fs.readFileSync(path.join(dir,'hq-ui.js'),'utf8')+'\n'+fs.readFileSync(path.join(dir,'movable-ui.js'),'utf8')+'\n'+fs.readFileSync(path.join(dir,'combat-feedback.js'),'utf8')+'\n'+fs.readFileSync(path.join(dir,'economy-ui.js'),'utf8')+'\n'+fs.readFileSync(path.join(dir,'production-ui.js'),'utf8');
 source=source.replace('root.NovaRTS={','/* titan342:engine */\n'+core+'\nroot.NovaRTS={hq352:HQ352,titan342:Titan342,');
 source=source.replace("r.fx=r.fx.filter(function(f){return f.life>0;}).slice(-35);", "r.fx=limitTitanFX347(r.fx.filter(function(f){return f.life>0;}));");
 source=source.replace("d.fx=d.fx.filter(function(f){f.life-=dt;return f.life>0;}).slice(-30);", "d.fx=limitTitanFX347(d.fx.filter(function(f){f.life-=dt;return f.life>0;}));");
 source=source.replaceAll("if(b.hp<=0||['gun','hq','boss'","if(b.type==='hq'&&b.lv>=5||b.hp<=0||['gun','hq','boss'");
 source=source.replaceAll("if(b.hp<=0||['hq','gun'","if(b.type==='hq'&&b.lv>=5||b.hp<=0||['hq','gun'");
 source=source.replace('def.fx.forEach(drawFX);','def.fx.forEach(drawFX);(def.hqFX352||[]).forEach(drawHQEffect352);');
 source=source.replace('raid.fx.forEach(drawFX);','raid.fx.forEach(drawFX);(raid.hqFX352||[]).forEach(drawHQEffect352);');
 source=source.replace('function drawFighter(t,enemy){','function drawFighter(t,enemy){if(t.titan342){drawTitan342(t);return;}');
 source=source.replace('if(t.builder){repairBuilder228(d,t,dt);return;}','if(t.titan342)return;if(t.builder){repairBuilder228(d,t,dt);return;}');
 source=source.replace('r.troops.forEach(function(t){if(t.hp<=0||t.stun>0)return;','r.troops.forEach(function(t){if(t.titan342)return;if(t.hp<=0||t.stun>0)return;');
 source=source.replace("if(screen==='home'){updateRobots251();", "if(screen==='home'){var ht=homeTitan342();if(ht)objects.push({depth:ht.x+ht.y,t:ht});updateRobots251();");
 source=source.replace('return t.hp>0&&!t.alien;','return t.hp>0&&!t.alien&&!t.titan342;');
 source=source.replace('if(!!U[t.kind].air===air)n+=','if(!t.titan342&&!!U[t.kind].air===air)n+=');
 source=source.replace('if(t.hp>0&&branch278(t.kind)===branch)n+=','if(!t.titan342&&t.hp>0&&branch278(t.kind)===branch)n+=');
 source=source.replace('t.hp>0&&!t.alien&&!U[t.kind].air','t.hp>0&&!t.alien&&!t.titan342&&!U[t.kind].air');
 source=source.replace('try{musicTick218();if(screen', 'try{tickUI342(dt);musicTick218();if(screen');
 // Insert immediately before the outer IIFE closes, after all existing wrappers.
 const end=source.lastIndexOf("})(typeof globalThis");if(end<0)throw Error('Game closure not found');source=source.slice(0,end)+ui+'\n'+source.slice(end);
 return source;
}
function payload(source){const vendor=fs.readFileSync(path.join(dir,'renderer.generated.js'),'utf8');const out='if(typeof document!=="undefined"){'+vendor+'}\n'+integrate(source);if(Buffer.byteLength(out)>16*1024*1024)throw Error('Native per-file limit exceeded');return out;}
function documentPayload(html){const packed=JSON.parse(fs.readFileSync(path.join(dir,'hq-payload.generated.json'),'utf8'));const script='<script>window.NovaHQModel352='+JSON.stringify(packed)+';</script>';const result=html.replace(/<script([^>]*?)src=["']game\.js[^"']*["']([^>]*)>/,script+'<script$1src="game.js"$2>');if(result===html)throw Error('Game script insertion point missing');if(Buffer.byteLength(result)>16*1024*1024)throw Error('Native HTML limit exceeded');return result;}
module.exports={build,integrate,payload,documentPayload};if(require.main===module)build().catch(e=>{console.error(e);process.exitCode=1;});



