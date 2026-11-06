// Equipment is snapshotted when combat units spawn, never changed mid-battle.
function equipmentLevel370(e,key){return Math.max(0,Math.min(10,Math.floor(Number(e&&e[key])||0)));}
var titanBefore370=titan342;titan342=function(level,x,y,skills,equipment){var t=titanBefore370(level,x,y,skills);t.weapon370=equipmentLevel370(equipment,'weapon');t.armor370=equipmentLevel370(equipment,'armor');t.max=t.hp=Math.round(t.max*(1+t.armor370*.04));return t;};
var hitBefore370=hit;hit=function(scene,target,damage,source,weapon){return hitBefore370(scene,target,damage*(source&&source.titan342?1+(source.weapon370||0)*.03:1),source,weapon);};
Titan342.make=titan342;
