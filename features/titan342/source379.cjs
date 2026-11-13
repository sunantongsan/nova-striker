// Reviewed anchors keep the delivery menu consistent with the actual battle state.
module.exports=function(source){
 const edits=[
 ["(r.army||this.d.army)[i]--;r.deployed++","(r.army||this.d.army)[i]--;if(r.directCampaign360)this.d.army[i]--;r.deployed++"],
 ["U.map(function(u,i){return'<button class=\"troop ","U.map(function(u,i){if(r.directCampaign360&&!(r.army[i]>0))return '';return'<button class=\"troop "],
 ["var army=E.d.army.slice();E.d.pendingLiveStart={request_id:nonce160(),target:liveTarget.id,army:army};E.d.army=army.map(function(){return 0;});if(!E.save()){E.d.army=army;","var available=E.d.army.slice(),army=formationRoster360(E,E.d.formation360);if(!army.some(Boolean)&&!(E.d.mercenaries&&E.d.mercenaries.attack)){toast(mt251('เลือกทหารในหน้าจัดทัพก่อน','Choose troops in Formation first'));return;}E.d.pendingLiveStart={request_id:nonce160(),target:liveTarget.id,army:army};E.d.army=available.map(function(count,i){return count-army[i];});if(!E.save()){E.d.army=available;"],
 ["if(E.raid&&E.raid.liveMode!=='preview'){E.enableLogistics277();if(E.raid.campaign299&&!E.raid.fleet277.length){E.raid.logistics277=false;delete E.raid.airAllowed278;selectedShip277=null;}else selectedShip277=E.raid.fleet277[0]?E.raid.fleet277[0].id:null;hud();}","if(name==='scout'&&E.raid&&E.raid.campaign299&&E.raid!==previousRaid){E.raid.directCampaign360=true;E.raid.army=formationRoster360(E,E.d.formation360);selectedShip277=null;deployKind=E.raid.army.findIndex(Boolean);hud();}else if(name==='practiceStart'&&E.raid!==previousRaid){selectedShip277=null;hud();}"],
 ["if(b&&b.v===2&&E.raid&&b.role==='attacker'&&!done){E.enableLogistics277();hud();}","if(b&&b.v===2&&E.raid&&b.role==='attacker'&&!done){if(!E.raid.logistics277)selectedShip277=null;hud();}"],
 ["if(!old)return;Game[name]=function(){var args=arguments;(function(next)","if(!old)return;Game[name]=function(){var args=arguments,previousRaid=E.raid;(function(next)"],
 ["(r.army||this.d.army)[i]<=0)return tr('ไม่มีหน่วยนี้')","(r.army||this.d.army)[i]<=0||(r.directCampaign360&&this.d.army[i]<=0))return tr('ไม่มีหน่วยนี้')"],
 ["if(r.troops.length>=(r.logistics277?150:40))","if(r.troops.length>=(r.logistics277||r.directCampaign360?150:40))"],
 ["if(deployed&&(deployed.hp<=0||deployed.state==='away'))", "if(deployed)"],
 ["if(u.air&&(airStock280(i)>0||ownAir280(i).length))", "if(u.air&&airStock280(i)>0)"],
 ["muzzle:muzzle,weapon:weapon,highArc:","muzzle:muzzle,sourceKind379:a.kind,sourceType379:a.type,weapon:weapon,highArc:"],
 ["weapon:f.weapon,highArc:!!f.highArc", "weapon:f.weapon,sourceKind379:f.sourceKind379,sourceType379:f.sourceType379,highArc:!!f.highArc"]
 ];
 for(const [a,b] of edits){if(!source.includes(a))throw Error('Combat379 anchor drift: '+a);source=source.replace(a,b);}return source;
};
