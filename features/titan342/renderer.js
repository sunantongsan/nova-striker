import {mechClip442,mechFrame442} from './motion442.mjs';
import {resources375,dispose375} from './resources375.mjs';
import {createHQRenderer} from './hq-renderer.js';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import payload from './payload.generated.json';
const cache=new Map(),instances=new Map();let renderer,scene,camera,last=0,error='';
function init(){if(renderer)return;renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:true});renderer.setSize(256,320);renderer.setPixelRatio(1);renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.45;scene=new T.Scene();camera=new T.OrthographicCamera(-1.68,1.68,2.1,-2.1,0.1,50);camera.position.set(5,8.86,6);camera.lookAt(0,1.86,0);// 412: higher camera (~48.6 deg) like the base view; lookAt keeps the ground point at the same pixel
scene.add(new T.HemisphereLight(0xd4eeff,0x354552,3));const key=new T.DirectionalLight(0xffeedb,4);key.position.set(-4,6,5);scene.add(key);const rim=new T.DirectionalLight(0x56dcff,3);rim.position.set(4,3,-4);scene.add(rim);renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();error='กราฟิก 3D หยุดทำงาน กรุณาเปิดเกมใหม่';});}
async function load(name){if(cache.has(name))return cache.get(name);const promise=(async()=>{init();const raw=Uint8Array.from(atob(name==='ronin-04'?window.NovaHQModel352:payload.packed[name]),c=>c.charCodeAt(0));const buffer=await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();const gltf=await new GLTFLoader().parseAsync(buffer,'');gltf.scene.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(gltf.scene),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());gltf.scene.position.set(-center.x,-bounds.min.y,-center.z);const wrap=new T.Group();wrap.add(gltf.scene);wrap.scale.setScalar(2.8/size.y);gltf.scene.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.material.roughness=Math.max(.32,o.material.roughness||.6);}});const names=new Set();gltf.scene.traverse(o=>names.add(o.name));for(const [clip,tracks] of Object.entries(payload.motions)){const ts=tracks.filter(t=>names.has(T.PropertyBinding.sanitizeNodeName(t.name))).map(t=>new T.QuaternionKeyframeTrack(T.PropertyBinding.sanitizeNodeName(t.name)+'.quaternion',t.times,t.values));if(ts.length)gltf.animations.push(new T.AnimationClip(clip,-1,ts));}return{root:wrap,clips:gltf.animations,height:size.y};})();cache.set(name,promise);promise.catch(e=>{error=e.message;cache.delete(name);});return promise;}
function gear(root,height){let handR,handL;root.traverse(o=>{if(o.name===T.PropertyBinding.sanitizeNodeName('hand.R'))handR=o;if(o.name===T.PropertyBinding.sanitizeNodeName('hand.L'))handL=o;});
 // 401: energy sword (glowing blade on a metal hilt). Blade colour follows the guardian tier.
 const metal=new T.MeshStandardMaterial({color:0xc9d3dc,metalness:.9,roughness:.25}),dark=new T.MeshStandardMaterial({color:0x1d2430,metalness:.6,roughness:.4}),light=new T.MeshStandardMaterial({color:0xb8faff,emissive:0x00cfff,emissiveIntensity:2,metalness:.3,roughness:.2});
 const sword=new T.Group(),L=height*.46,r=height*.011;
 const hilt=new T.Mesh(new T.CylinderGeometry(r*1.25,r*1.35,height*.075,16),metal);hilt.position.y=-height*.012;sword.add(hilt);
 for(const y of [-.03,0,.03]){const g=new T.Mesh(new T.CylinderGeometry(r*1.45,r*1.45,height*.008,16),dark);g.position.y=-height*.012+height*y*.6;sword.add(g);}
 const emitter=new T.Mesh(new T.CylinderGeometry(r*1.6,r*1.3,height*.016,16),metal);emitter.position.y=height*.032;sword.add(emitter);
 const core=new T.Mesh(new T.CapsuleGeometry(r*.75,L,6,14),new T.MeshBasicMaterial({color:0xffffff}));core.position.y=height*.04+L/2;sword.add(core);
 const glowMat=new T.MeshBasicMaterial({color:0x3fc8ff,transparent:true,opacity:.55,blending:T.AdditiveBlending,depthWrite:false});
 const glow=new T.Mesh(new T.CapsuleGeometry(r*1.9,L,6,14),glowMat);glow.position.copy(core.position);sword.add(glow);
 const halo=new T.Mesh(new T.CapsuleGeometry(r*3.4,L*1.02,6,14),new T.MeshBasicMaterial({color:0x3fc8ff,transparent:true,opacity:.18,blending:T.AdditiveBlending,depthWrite:false}));halo.position.copy(core.position);sword.add(halo);
 sword.userData.glow=[glowMat,halo.material];
 sword.rotation.x=Math.PI/2;handR?.add(sword);const palm=new T.Mesh(new T.SphereGeometry(height*.028,12,8),light);palm.scale.set(1,.5,1);handL?.add(palm);return{sword,palm};}
const NOVA401='android-nova',TINT401=[0xe6f2ff,0xffd877,0xff8796],SABER401=[0x3fc8ff,0xffc23a,0xff3348];
function tier401(r,tier){if(r.tier401===tier)return;r.tier401=tier;const i=Math.max(0,Math.min(2,(tier||1)-1));
 if(r.name===NOVA401)r.root.traverse(o=>{if(o.isMesh&&o.material&&o.material.name==='NovaAndroid'){if(!o.userData.own401){o.material=o.material.clone();o.userData.own401=true;}o.material.color.setHex(TINT401[i]);}});
 for(const m of r.gear.sword.userData.glow||[])m.color.setHex(SABER401[i]);}
async function get(key,name){const source=await load(name);if(instances.has(key))return instances.get(key);const root=clone(source.root),mixer=new T.AnimationMixer(root),actions={};for(const clip of source.clips)actions[clip.name]=mixer.clipAction(clip);const record={shared375:resources375(source.root),root,mixer,actions,gear:gear(root,source.height),h419:source.height,clip:null,seq:-1,used:performance.now()};instances.set(key,record);return record;}
// 419: idle sword toss at home - the saber leaves the hand, spins up in the air and is caught again.
const TOSSMS419=1500,_v419=new T.Vector3(),_q419=new T.Quaternion(),_ax419=new T.Vector3(1,0,0);
function toss419(r,t,resting){const s=r.gear.sword,k=t.toss419?(Date.now()-t.toss419)/TOSSMS419:2;
 if(resting||t.hp<=0||!(k>=0&&k<1)){if(r.toss419){const o=r.toss419;r.toss419=null;o.parent.add(s);s.position.copy(o.pos);s.quaternion.copy(o.quat);s.scale.copy(o.scale);}return;}
 if(!r.toss419){if(!s.parent||s.parent===r.root)return;r.toss419={parent:s.parent,pos:s.position.clone(),quat:s.quaternion.clone(),scale:s.scale.clone()};}
 const o=r.toss419;o.parent.add(s);s.position.copy(o.pos);s.quaternion.copy(o.quat);s.scale.copy(o.scale);r.root.updateMatrixWorld(true);r.root.attach(s);
 // ease up and down, spinning end over end around the blade's middle
 const h=r.h419||2.8,up=Math.sin(Math.PI*k)*h*.45,turn=k*Math.PI*4;_v419.set(0,h*.25,0).applyQuaternion(s.quaternion);
 s.position.add(_v419);s.quaternion.premultiply(_q419.setFromAxisAngle(_ax419,turn));_v419.set(0,-h*.25,0).applyQuaternion(s.quaternion);s.position.add(_v419);s.position.y+=up;}
// 444: in battle the mech is drawn like a Clash sprite: each pose (clip, frame at 15 fps, one of 16 facings) is
// rendered once into a small 2D canvas and reused. The old path rendered WebGL and copied it back 30 times a second,
// which made battles with the mech stutter on phones.
const FPS444=15,DIRS444=16,MAX444=120,W444=160,H444=200,count444={hit:0,miss:0,wait:0};
function scale444(clip,dur){return ['Sentinel','Run','Walk'].includes(clip)?1:dur/(clip==='BoostJump'||clip==='Backflip'?.85:clip==='SwordSlash'?1.15:clip==='ChestBeam'?1.7:1.35);}
function cached444(r,t,clip,name){
 if(clip==='BoostJump'&&!r.actions[clip])clip='Backflip';if(!r.actions[clip])clip='KneelFire';if(!r.actions[clip])clip='Sentinel';
 const action=r.actions[clip];if(!action)return null;
 const now=performance.now();
 if(t.clip444!==clip||t.seq444!==t.actionSeq342){t.clip444=clip;t.seq444=t.actionSeq342;t.start444=now;}
 const loop=['Sentinel','Run','Walk'].includes(clip),dur=Math.max(.05,action.getClip().duration),frames=Math.max(1,Math.ceil(dur*FPS444));
 let f=Math.floor((now-t.start444)/1000*scale444(clip,dur)*FPS444);f=loop?f%frames:Math.min(frames-1,Math.max(0,f));
 const turn=Math.PI*2/DIRS444,d=((Math.round((Math.PI*.5-(t.heading||0))/turn)%DIRS444)+DIRS444)%DIRS444,alive=t.hp>0;
 const key=name+'|'+(t.tier342||1)+'|'+clip+'|'+f+'|'+d+'|'+(alive?1:0),cache=r.cache444||(r.cache444=new Map()),hit=cache.get(key);
 if(hit){count444.hit++;cache.delete(key);cache.set(key,hit);r.sprite442=hit;return hit;}
 // at most one new pose every 30 ms; until then keep showing the last one
 if(r.sprite442&&now-(r.missAt444||0)<30){count444.wait++;return r.sprite442;}r.missAt444=now;count444.miss++;
 for(const a of Object.values(r.actions))if(a!==action)a.stop();
 action.enabled=true;action.setEffectiveWeight(1);action.setEffectiveTimeScale(1);action.play();action.paused=true;action.time=Math.min(dur,f/FPS444);r.mixer.update(0);
 r.clip=null;r.seq=undefined;
 r.gear.sword.visible=name===NOVA401?alive:clip.startsWith('Sword');r.gear.palm.visible=clip==='KneelFire'||clip==='ChestBeam';
 toss419(r,t,false);
 r.root.rotation.set(0,d*turn,0);r.root.position.set(0,0,0);
 scene.add(r.root);try{renderer.render(scene,camera);}finally{scene.remove(r.root);}
 const c=document.createElement('canvas');c.width=W444;c.height=H444;c.getContext('2d').drawImage(renderer.domElement,0,0,W444,H444);
 cache.set(key,c);while(cache.size>MAX444)cache.delete(cache.keys().next().value);
 r.sprite442=c;return c;
}
window.NovaTitan3D={load,portrait:level=>payload.portraits?.[payload.packed[NOVA401]?NOVA401+'-'+level:['atlas-09','vanguard-07','titan-06'][level-1]],error:()=>error,render(t,dt=.033){try{init();const name=payload.packed[NOVA401]?NOVA401:['atlas-09','vanguard-07','titan-06'][(t.tier342||1)-1],key=t.renderKey342||(t.renderKey342=Math.random().toString(36));let r=instances.get(key);if(!r){if(!t.loading342){t.loading342=true;get(key,name).then(()=>{t.loading342=false;}).catch(e=>{t.loading342=false;error=e.message;});}return null;}if(r.name&&r.name!==name){dispose375(r,r.shared375);instances.delete(key);return null;}r.name=name;tier401(r,t.tier342||1);r.used=performance.now();const resting=!!t.resting347;let clip=mechClip442(t);if(t.cache444&&!resting&&!t.toss419){const sprite444=cached444(r,t,clip,name);if(sprite444)return sprite444;}const frame442=mechFrame442(r,t,clip,r.used);if(!frame442.draw)return r.sprite442;dt=frame442.dt;if(clip==='BoostJump'&&!r.actions[clip])clip='Backflip';if(!r.actions[clip])clip='KneelFire';if(!r.actions[clip])clip='Sentinel';if(clip!==r.clip||t.actionSeq342!==r.seq){const old=r.actions[r.clip],next=r.actions[clip];if(next){next.reset().setLoop(['Sentinel','Run','Walk'].includes(clip)?T.LoopRepeat:T.LoopOnce,Infinity);next.clampWhenFinished=true;next.setEffectiveTimeScale(['Sentinel','Run','Walk'].includes(clip)?1:next.getClip().duration/(clip==='BoostJump'||clip==='Backflip'?.85:clip==='SwordSlash'?1.15:clip==='ChestBeam'?1.7:1.35));next.play();if(old&&old!==next)next.crossFadeFrom(old,.16,false);}r.clip=clip;r.seq=t.actionSeq342;}r.gear.sword.visible=name===NOVA401?t.hp>0:clip.startsWith('Sword');r.gear.palm.visible=clip==='KneelFire'||clip==='ChestBeam';r.root.rotation.y=Math.PI*.5-(t.heading||0);r.root.rotation.x=0;r.root.rotation.z=0;r.root.position.set(0,0,0);
if(resting){
 const action=r.actions[clip];if(action){action.paused=true;action.time=action.getClip().duration*.46;r.mixer.update(0);}
 // Use the fitted, ground-planted kneel for both rigs; lower the weapon arms.
 if(!r.restArms){r.restArms=[];const neutral=r.actions.Sentinel;if(neutral){const prev=action?.time;neutral.reset().play();neutral.setEffectiveWeight(1);if(action)action.setEffectiveWeight(0);r.mixer.update(0);r.root.traverse(o=>{if(/^(upper_arm|forearm|hand)[LR]$/.test(o.name))r.restArms.push([o,o.quaternion.clone()]);});neutral.stop();if(action){action.setEffectiveWeight(1);action.time=prev;r.mixer.update(0);}}}
 for(const [bone,q] of r.restArms||[])bone.quaternion.copy(q);
 if(t.restPose347==='RestDown347'){r.root.quaternion.premultiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),-Math.PI/2));if(!r.restBounds347||r.restBounds347.heading!==t.heading){r.root.updateMatrixWorld(true);const box=new T.Box3().setFromObject(r.root,true);r.restBounds347={heading:t.heading,y:-box.min.y,x:-(box.min.x+box.max.x)/2};}r.root.position.y=r.restBounds347.y;r.root.position.x=r.restBounds347.x;}
 r.gear.sword.visible=false;r.gear.palm.visible=false;
}else{for(const a of Object.values(r.actions))a.paused=false;r.mixer.update(Math.min(.08,dt));}toss419(r,t,resting);
scene.add(r.root);try{renderer.render(scene,camera);}finally{scene.remove(r.root);}if(performance.now()-last>5000){last=performance.now();for(const [k,v] of instances)if(performance.now()-v.used>15000){v.disposed443=true;v.cache444=null;if(v.bitmap443&&v.bitmap443.close)v.bitmap443.close();dispose375(v,v.shared375);instances.delete(k);}}r.frameAt442=r.used;r.frameKey442=frame442.key;if(typeof createImageBitmap==='function'&&!window.noBitmap443&&r.sprite442){const seq443=(r.seq443||0)+1;r.seq443=seq443;createImageBitmap(renderer.domElement).then(bm=>{if(seq443!==r.seq443||r.disposed443){bm.close&&bm.close();return;}const old=r.bitmap443;r.bitmap443=bm;r.sprite442=bm;if(old&&old.close)old.close();if(typeof drawNeeded!=='undefined')drawNeeded=true;}).catch(()=>{window.noBitmap443=true;});return r.sprite442;}if(!r.canvas443){r.canvas443=document.createElement('canvas');r.canvas443.width=256;r.canvas443.height=320;}const pixels442=r.canvas443.getContext('2d');pixels442.clearRect(0,0,256,320);pixels442.drawImage(renderer.domElement,0,0);r.sprite442=r.canvas443;return r.sprite442;}catch(e){error=e.message;return null;}},stats(){return {poses444:Object.assign({},count444),models:cache.size,instances:instances.size,error,rigs:[...instances.values()].map(r=>({model:r.name,bladeAttached:!!r.gear.sword.parent,palmAttached:!!r.gear.palm.parent,clip:r.clip}))};}};



let headquarters352;window.NovaHQ3D={render(b){try{init();if(!headquarters352)headquarters352=createHQRenderer({renderer,scene,camera,load});return headquarters352.render(b);}catch(e){error=e.message;return null;}},ready(){init();if(!headquarters352)headquarters352=createHQRenderer({renderer,scene,camera,load});return headquarters352.ready();},stats(){return headquarters352?.stats();}};

