// Reviewed anchors keep the delivery menu consistent with the actual battle state.
module.exports=function(source){
 const edits=[
 ["if(deployed&&(deployed.hp<=0||deployed.state==='away'))", "if(deployed)"],
 ["if(u.air&&(airStock280(i)>0||ownAir280(i).length))", "if(u.air&&airStock280(i)>0)"],
 ["muzzle:muzzle,weapon:weapon,highArc:","muzzle:muzzle,sourceKind379:a.kind,sourceType379:a.type,weapon:weapon,highArc:"],
 ["weapon:f.weapon,highArc:!!f.highArc", "weapon:f.weapon,sourceKind379:f.sourceKind379,sourceType379:f.sourceType379,highArc:!!f.highArc"]
 ];
 for(const [a,b] of edits){if(!source.includes(a))throw Error('Combat379 anchor drift: '+a);source=source.replace(a,b);}return source;
};
