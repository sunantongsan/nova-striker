import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {resources375,dispose375} from '../features/titan342/resources375.mjs';

test('clone cleanup preserves shared model assets, releases owned assets once',()=>{
 const source=new T.Group(),sharedGeo=new T.BoxGeometry(),sharedMat=new T.MeshBasicMaterial();
 source.add(new T.Mesh(sharedGeo,sharedMat));
 const root=source.clone(),ownGeo=new T.BoxGeometry(),ownMat=sharedMat.clone();
 root.add(new T.Mesh(ownGeo,ownMat));
 let shared=0,owned=0,stopped=0,uncached=0;
 for(const r of [sharedGeo,sharedMat])r.addEventListener('dispose',()=>shared++);
 for(const r of [ownGeo,ownMat])r.addEventListener('dispose',()=>owned++);
 const bone=new T.Bone(),skeleton=new T.Skeleton([bone]);skeleton.computeBoneTexture();
 let textures=0;skeleton.boneTexture.addEventListener('dispose',()=>textures++);
 root.children[0].skeleton=skeleton;
 const record={root,canvas:{width:256,height:320},mixer:{stopAllAction(){stopped++;},uncacheRoot(r){assert.equal(r,root);uncached++;}}};
 dispose375(record,resources375(source));dispose375(record,resources375(source));
 assert.equal(shared,0);assert.equal(owned,2);assert.equal(textures,1);
 assert.equal(stopped,1);assert.equal(uncached,1);assert.equal(record.canvas.width,1);
});

test('repeated HQ upgrades release previous graphics; stable frames evict stale previews',async()=>{
 globalThis.Image=class{complete=true;naturalWidth=100;decode(){return Promise.resolve();}};
 globalThis.window={dispatchEvent(){}};
 globalThis.document={createElement(){return {width:0,height:0,getContext(){return {clearRect(){},drawImage(){},save(){},restore(){},translate(){},rotate(){},scale(){}};}};}};
 let now=0;Object.defineProperty(globalThis,'performance',{value:{now:()=>now},configurable:true});
 const {createHQRenderer}=await import('../features/titan342/hq-renderer.js');
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(),source=new T.Group();
 const sharedGeo=new T.BoxGeometry(),sharedMat=new T.MeshBasicMaterial();source.add(new T.Mesh(sharedGeo,sharedMat));
 let sourceDisposed=0;sharedGeo.addEventListener('dispose',()=>sourceDisposed++);sharedMat.addEventListener('dispose',()=>sourceDisposed++);
 const tracked=new Map();let fail=false;
 const renderer={domElement:{},render(){for(const r of scene.children)r.traverse(o=>{if(o.geometry&&o.geometry!==sharedGeo&&!tracked.has(o.geometry)){tracked.set(o.geometry,0);o.geometry.addEventListener('dispose',()=>tracked.set(o.geometry,tracked.get(o.geometry)+1));}});if(fail)throw Error('GPU lost');}};
 const hq=createHQRenderer({renderer,scene,camera,load:async()=>({root:source,height:1,clips:[]})});
 await hq.ready();
 let old=[];
 for(let lv=1;lv<=20;lv++){now+=100;hq.render({lv,renderKey352:'home'});for(const g of old)assert.equal(tracked.get(g),1);old=[...tracked.keys()];assert.equal(hq.stats().cached,1);assert.equal(scene.children.length,0);}
 now+=100;hq.render({lv:5,renderKey352:'preview'});
 now+=31000;hq.render({lv:20,renderKey352:'home'});
 assert.equal(hq.stats().cached,1);assert.equal(sourceDisposed,0);
 fail=true;now+=100;assert.throws(()=>hq.render({lv:19,renderKey352:'home'}),/GPU lost/);
 assert.equal(scene.children.length,0);
});
