import {resources375,dispose375} from './resources375.mjs';
import * as T from 'three';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
const smooth=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};
const steel=new T.MeshStandardMaterial({color:0x233d60,metalness:.72,roughness:.32});
const white=new T.MeshStandardMaterial({color:0xc7dfec,metalness:.6,roughness:.25});
const dark=new T.MeshStandardMaterial({color:0x101e31,metalness:.65,roughness:.45});
const gold=new T.MeshStandardMaterial({color:0xd7ae57,metalness:.8,roughness:.24});
const blue=new T.MeshStandardMaterial({color:0x51ddff,emissive:0x00aaff,emissiveIntensity:1.8,metalness:.3,roughness:.18});
const glass=new T.MeshPhysicalMaterial({color:0x3bcfff,emissive:0x0078ce,emissiveIntensity:.75,metalness:.2,roughness:.14,transparent:true,opacity:.8});
function mesh(parent,geo,mat,x=0,y=0,z=0){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;}
function box(p,w,h,d,m,x,y,z){return mesh(p,new T.BoxGeometry(w,h,d),m,x,y,z);}
function cylinder(p,r,h,m,y,segments=8){return mesh(p,new T.CylinderGeometry(r,r*1.08,h,segments),m,0,y,0);}
function ring(p,r,t,m,x,y,z,tilt=0){const a=mesh(p,new T.TorusGeometry(r,t,8,48),m,x,y,z);a.rotation.x=Math.PI/2+tilt;return a;}
function plate(p,w,h,d,m,x,y,z){const shape=new T.Shape(),cut=Math.min(w,d)*.14;shape.moveTo(-w/2+cut,-d/2);shape.lineTo(w/2-cut,-d/2);shape.lineTo(w/2,-d/2+cut);shape.lineTo(w/2,d/2-cut);shape.lineTo(w/2-cut,d/2);shape.lineTo(-w/2+cut,d/2);shape.lineTo(-w/2,d/2-cut);shape.lineTo(-w/2,-d/2+cut);shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:h,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:Math.min(h*.22,cut/2),bevelThickness:Math.min(h*.22,cut/2)});geo.rotateX(-Math.PI/2);geo.translate(0,-h/2,0);return mesh(p,geo,m,x,y,z);}
function structure(tier){
 const root=new T.Group(),shell=new T.Group(),parts=[];root.add(shell);
 cylinder(root,1.18,.13,dark,.07);cylinder(root,1.08,.12,steel,.18);ring(root,1.02,.026,blue,0,.25,0);
 // Recessed runway, eight anchoring pads and cobalt light strips.
 for(let k=0;k<8;k++){let a=k*Math.PI/4;const foot=box(root,.3,.12,.38,white,Math.cos(a)*1.02,.14,Math.sin(a)*1.02);foot.rotation.y=-a;}
 const height=.70+tier*.12;
 cylinder(shell,.68,height,steel,.27+height/2);cylinder(shell,.74,.13,white,.32+height);cylinder(shell,.56,.08,dark,.43+height);
 box(shell,.44,.35,.08,dark,0,.46,.72);box(shell,.32,.05,.1,blue,0,.64,.76);
 for(let k=0;k<6;k++){const a=k*Math.PI/3,fin=box(shell,.14,height*.8,.15,white,Math.sin(a)*.64,.4+height/2,Math.cos(a)*.64);fin.rotation.y=a;}
 const orb=mesh(shell,new T.SphereGeometry(.28+tier*.035,32,20),glass,0,height+.56,0);const core=mesh(shell,new T.IcosahedronGeometry(.17+tier*.014,1),blue,0,height+.56,0);
 const halo=ring(shell,.4+tier*.05,.035,tier>=3?gold:white,0,height+.56,0,.65);halo.rotation.z=.3;
 if(tier>=2){const r=ring(shell,.47+tier*.04,.022,blue,0,height+.56,0,-.75);r.rotation.z=-.55;}
 // Mechanical side pods become the shoulders; panels hinge instead of fading.
 for(const side of [-1,1]){const pod=new T.Group();pod.position.set(side*.75,.57,0);shell.add(pod);box(pod,.47,.5,.83,steel,0,0,0);plate(pod,.5,.09,.86,white,0,.28,0);box(pod,.06,.25,.6,blue,side*.25,.02,0);for(let n=0;n<3;n++)box(pod,.3,.025,.03,dark,0,.1-n*.07,.43);parts.push({o:pod,x:side*.75,y:.57,side});}
 if(tier>=1)for(const side of [-1,1]){const tower=box(shell,.25,.65+tier*.1,.3,steel,side*.65,.9+tier*.06,-.55);box(tower,.17,.09,.22,blue,0,.36+tier*.05,0);}
 if(tier>=2)for(const side of [-1,1]){const fin=box(shell,.1,.8,.45,white,side*.95,1.0,-.25);fin.rotation.z=-side*.25;box(shell,.6,.1,.15,steel,side*.65,1.35,-.3);}
 if(tier>=3){ring(shell,.82,.045,gold,0,1.75,0);for(let k=0;k<4;k++){const a=k*Math.PI/2;box(shell,.12,.4,.12,white,Math.sin(a)*.82,1.55,Math.cos(a)*.82);}}
 if(tier>=4){const crown=ring(shell,.62,.055,white,0,2.12,0,.4);crown.rotation.z=-.3;for(const s of [-1,1]){const f=plate(shell,.18,.95,.55,gold,s*1.03,1.15,-.3);f.rotation.z=-s*.4;}mesh(shell,new T.OctahedronGeometry(.16),blue,0,2.22,0);}
 return {root,shell,parts,orb,core,halo,tier};
}
function outfit(root,tier,height){
 const tint=[0x477cb9,0x439ed0,0x74c4de,0xb7d8ee,0xd6e8f4,0xf0e7cf][tier];const bones={};root.traverse(o=>{bones[o.name]=o;if(o.isMesh){o.material=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{const v=m.clone();v.color.setHex(tint);v.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nfloat hqLum=dot(diffuseColor.rgb,vec3(.299,.587,.114)); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(hqLum)*vec3(1.25,1.75,2.25),.85);');};v.customProgramCacheKey=()=> 'hq-blue352';return v;});if(o.material.length===1)o.material=o.material[0];}});
 const sword=bones['swordR']||bones['sword_R']||bones['sword.R'];if(sword)sword.scale.setScalar(.00001);
 const chest=bones.chest,head=bones.head;
 // Local rig dimensions follow the model's source units, normalized by the wrapper.
 const h=height;
 if(chest){const g=new T.Group();g.position.set(0,h*.025,h*.105);chest.add(g);mesh(g,new T.CylinderGeometry(h*.055,h*.055,h*.028,24),dark).rotation.x=Math.PI/2;mesh(g,new T.SphereGeometry(h*.044,20,12),blue,0,0,h*.02);const r=ring(g,h*.06,h*.009,tier>=3?gold:white,0,0,h*.022,Math.PI/2);r.rotation.x=0;}
 for(const side of ['L','R']){const sign=side==='L'?1:-1,bone=bones['shoulder'+side]||bones['shoulder_'+side]||bones['shoulder.'+side];if(!bone)continue;for(let n=0;n<=Math.floor(tier/2);n++){const panel=plate(bone,h*(.13+tier*.012+n*.02),h*.018,h*.11,tier>=4?gold:white,sign*h*.025,h*(.045+n*.025),0);panel.rotation.z=sign*(.12+n*.08);}if(tier>=1){const fin=box(bone,h*.018,h*(.06+tier*.012),h*.065,steel,sign*h*.08,h*.07,0);fin.rotation.z=-sign*.3;}}
 if(head&&tier>=2){for(const s of [-1,1]){const horn=mesh(head,new T.ConeGeometry(h*.018,h*(.09+tier*.012),4),tier>=4?gold:white,s*h*.055,h*.09,0);horn.rotation.z=-s*.65;}}
 if(chest&&tier>=3)for(const s of [-1,1]){const fin=mesh(chest,new T.ConeGeometry(h*(.045+tier*.006),h*(.27+tier*.025),4),tier>=4?gold:white,s*h*(.16+tier*.008),h*.08,-h*.07);fin.rotation.z=-s*.35;}
 if(chest&&tier===5){const halo=ring(chest,h*.19,h*.012,gold,0,h*.16,-h*.10);halo.rotation.x=0;for(const side of [-1,1]){const crown=mesh(chest,new T.ConeGeometry(h*.025,h*.19,4),white,side*h*.23,h*.12,-h*.06);crown.rotation.z=-side*.8;}}
 return bones;
}
const headquartersArt352=Array.from({length:5},(_,i)=>{const im=new Image();im.onload=()=>window.dispatchEvent(new Event('nova-hq-art352'));im.src='assets/hq352-'+(i+1)+'.webp';return im;});
function armorPanels352(c,im,form,tier){const size=218+tier*5,x=128-size/2,y=286-size;if(form<=0){c.drawImage(im,x,y,size,size);return;}const unfold=smooth(form/.6),lock=smooth((form-.55)/.45),alpha=1-smooth((form-.78)/.22);
 const parts=[[0,0,.24,1,-1],[.76,0,.24,1,1],[.24,0,.52,.42,0],[.24,.42,.52,.38,2],[.24,.8,.26,.2,-2],[.5,.8,.26,.2,3]];
 for(const [sx,sy,sw,sh,role] of parts){let dx=0,dy=0,rotation=0,scale=1-lock*.65;if(role===-1||role===1){dx=role*(unfold*10-lock*35);dy=-unfold*22;rotation=role*unfold*.24;}else if(role===0){dy=unfold*28;scale*=1-unfold*.3;}else if(role===2){dy=-unfold*8;scale*=1-unfold*.2;}else{dx=(role===-2?-1:1)*unfold*15;dy=-unfold*12;rotation=(role===-2?-1:1)*unfold*.25;}
 c.save();c.globalAlpha=alpha;c.translate(x+(sx+sw/2)*size+dx,y+(sy+sh/2)*size+dy);c.rotate(rotation);c.scale(scale,scale);c.drawImage(im,sx*im.width,sy*im.height,sw*im.width,sh*im.height,-sw*size/2,-sh*size/2,sw*size,sh*size);c.restore();}
}
export function createHQRenderer({renderer,scene,camera,load}){
 const cache=new Map();let model=null,pending=null;
 function release(r){const shared=resources375(model?.root);for(const m of [steel,white,dark,gold,blue,glass])shared.materials.add(m);dispose375(r,shared);}
 function sweep(now,key){for(const [k,r] of cache)if(k!==key&&now-r.used>30000){release(r);cache.delete(k);}}
 function request(){if(!pending)pending=load('ronin-04').then(v=>{model=v;window.dispatchEvent(new Event('nova-hq-art352'));return v;}).catch(()=>{pending=null;});}
 function make(key,b){const tier=Math.min(4,Math.floor(((b.lv||1)-1)/4)),r=structure(tier);r.key=key;r.canvas=document.createElement('canvas');r.canvas.width=256;r.canvas.height=320;r.last=-1000;r.version=b.lv;r.used=performance.now();r.wreck=new T.Group();r.root.add(r.wreck);r.wreck.visible=false;
 for(let i=0;i<22;i++){let a=i*2.399;const m=box(r.wreck,.12+(i%4)*.08,.10+(i%3)*.04,.15+(i%5)*.04,i%5===0?gold:i%3===0?white:steel,Math.sin(a)*(.2+i%5*.15),.25+(i%4)*.04,Math.cos(a)*(.2+i%5*.15));m.rotation.set(i*.7,i*.4,i*.9);}const helmet=mesh(r.wreck,new T.DodecahedronGeometry(.18,0),steel,.48,.34,.14);helmet.rotation.z=1.2;const visor=box(helmet,.23,.04,.04,dark,0,.03,.15);for(const side of [-1,1]){const horn=mesh(helmet,new T.ConeGeometry(.04,.22,4),gold,side*.13,.14,0);horn.rotation.z=-side*.7;}for(let k=0;k<5;k++){const limb=mesh(r.wreck,new T.CylinderGeometry(.07,.09,.45,8),k%2?steel:white,Math.sin(k*2.4)*.65,.3,Math.cos(k*2.4)*.65);limb.rotation.z=1.4;limb.rotation.y=k;mesh(r.wreck,new T.SphereGeometry(.09,8,6),dark,limb.position.x,.31,limb.position.z);}const brokenRing=mesh(r.wreck,new T.TorusGeometry(.4,.035,6,20,Math.PI*1.3),gold,-.22,.32,-.15);brokenRing.rotation.x=1.3;cache.set(key,r);return r;}
 function render(b){request();const tier=Math.min(5,Math.max(0,Math.floor(((b.lv||5)-5)/3))),key=b.renderKey352||(b.renderKey352='hq-'+Math.random().toString(36).slice(2));let r=cache.get(key);if(!r||r.version!==b.lv){release(r);r=make(key,b);}r.used=performance.now();sweep(r.used,key);
 if(model&&!r.robot&&b.lv>=5){r.robot=clone(model.root);r.root.add(r.robot);r.bones=outfit(r.robot,tier,model.height);r.mixer=new T.AnimationMixer(r.robot);const clip=model.clips.find(c=>c.name==='Sentinel');if(clip){r.action=r.mixer.clipAction(clip);r.action.play();r.mixer.update(0);}r.rest={};r.robot.traverse(o=>{if(o.isBone)r.rest[o.name]={p:o.position.clone(),q:o.quaternion.clone(),s:o.scale.clone()};});}
 const form=T.MathUtils.clamp(b.form352||0,0,1),dead=b.hp!==undefined&&b.hp<=0,charge=b.charge352>0?1-b.charge352/1.05:0,signature=[form.toFixed(2),dead,Math.round(charge*4),Math.round((b.aim||0)*24/(Math.PI*2)),!!r.robot,headquartersArt352[r.tier].complete].join(':');
 if(r.signature===signature)return r.canvas;// 444: keep finished poses (aim in 24 steps, charge in quarters) and reuse them, Clash-sprite style, instead of
 // rendering WebGL and copying it back on every aim/charge change during battle.
 const memo=r.memo444||(r.memo444=new Map()),got=memo.get(signature);if(got){memo.delete(signature);memo.set(signature,got);r.signature=signature;r.canvas=got;return got;}
 if(performance.now()-r.last<100)return r.canvas;r.last=performance.now();r.signature=signature;if(memo.size){r.canvas=document.createElement('canvas');r.canvas.width=256;r.canvas.height=320;}memo.set(signature,r.canvas);while(memo.size>32)memo.delete(memo.keys().next().value);
 const art=headquartersArt352[r.tier],hasArt=art.complete&&art.naturalWidth>0;r.shell.visible=!hasArt&&!dead&&form<.98;r.wreck.visible=dead;
 const open=smooth(form/.5),rise=smooth((form-.18)/.7);r.shell.position.y=rise*.55;r.shell.scale.set(1-open*.25,1-rise*.7,1-open*.25);
 r.parts.forEach(p=>{p.o.position.x=p.x+p.side*open*.32;p.o.position.y=p.y+rise*.5;p.o.rotation.z=-p.side*open*.8;});
 if(r.robot){r.robot.visible=!dead&&form>.12;r.robot.rotation.y=Math.PI*.5-(b.aim||0);r.robot.position.y=.23;r.robot.scale.setScalar((2.8/model.height)*(.97+.016*tier));r.robot.traverse(o=>{const base=r.rest[o.name];if(base){o.position.copy(base.p);o.quaternion.copy(base.q);o.scale.copy(base.s);}});
 const bend=1-smooth((form-.3)/.7);for(const side of ['L','R']){for(const [name,angle] of [['thigh',-1.3],['shin',1.7],['upper_arm',-.85]]){const bone=r.bones[name+side]||r.bones[name+'_'+side]||r.bones[name+'.'+side];if(bone)bone.rotateX(angle*bend);}}const chest=r.bones.chest;if(chest)chest.rotateX(.35*bend-charge*.035);r.root.updateMatrixWorld(true);const feet=['footL','footR','foot_L','foot_R','foot.L','foot.R'].map(n=>r.bones[n]).filter(Boolean);if(feet.length){const floor=Math.min(...feet.map(o=>o.getWorldPosition(new T.Vector3()).y));r.robot.position.y+=.33-floor;}}
 scene.add(r.root);try{renderer.render(scene,camera);}finally{scene.remove(r.root);}if(r.robot&&r.bones.chest){const point=r.bones.chest.getWorldPosition(new T.Vector3());point.project(camera);r.canvas.hqMuzzle352={x:(point.x+1)*128,y:(1-point.y)*160};}scene.remove(r.root);const c=r.canvas.getContext('2d');c.clearRect(0,0,256,320);if(form>0||dead||!hasArt)c.drawImage(renderer.domElement,0,0);if(hasArt&&!dead)armorPanels352(c,art,form,r.tier);return r.canvas;
 }
 return {render,stats:()=>({cached:cache.size,model:!!model}),ready:()=>{request();return Promise.all([pending,...headquartersArt352.map(im=>im.decode().catch(()=>{}))]);}};
}

