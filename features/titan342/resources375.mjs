// GLTF clones share geometry/materials/textures; only instance-owned resources
// may be released. SkeletonUtils gives each clone its own skeleton.
export function resources375(root) {
 const geometries=new Set(),materials=new Set();
 root?.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of [].concat(o.material||[]))materials.add(m);});
 return {geometries,materials};
}
export function dispose375(record,shared={geometries:new Set(),materials:new Set()}) {
 if(!record||record.disposed375)return;
 record.disposed375=true;
 record.mixer?.stopAllAction();
 record.mixer?.uncacheRoot(record.robot||record.root);
 const own=resources375(record.root),skeletons=new Set();
 record.root.traverse(o=>{if(o.skeleton)skeletons.add(o.skeleton);});
 for(const s of skeletons)s.dispose();
 for(const g of own.geometries)if(!shared.geometries.has(g))g.dispose();
 for(const m of own.materials)if(!shared.materials.has(m))m.dispose();
 record.root.removeFromParent();
 if(record.canvas){record.canvas.width=1;record.canvas.height=1;}
}
