// Shared projection: the visible barrel and projectile start use precisely the same muzzle.
function turret379(b){
 var angle=screenBearing(b.aim===undefined?-Math.PI/2:b.aim),stage=weaponStage272(b),rocket=b.type==='missileturret',height=rocket?27+stage*2:26+stage*2;
 var turn=Math.atan2(Math.sin(angle)/ISO412,Math.cos(angle)),length=(rocket?24:27)+stage*2-Math.min(.18,b.recoil||0)*12;
 return {turn:turn,length:length,height:height,x:Math.cos(turn)*length,y:Math.sin(turn)*length*ISO412-height};
}
// 381: use the original weapon geometry together with the restored painted artwork.
function hqDestroyed379(buildings){return !!(buildings||[]).find(function(b){return b.type==='hq'&&b.hp<=0;});}
