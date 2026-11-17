// 425: the NOVA mech can be sent while scouting a player base (Clash-style: no separate Attack button).
// The mech card shows in the scout bar; tapping it arms the mech, and tapping open ground starts the attack
// and drops the mech there as soon as the server has opened the battle.
var mechPending425=null;
function mechReady425(){var s=E.d.titan342;return !!(s&&s.level)&&!E.titanRecovery347().resting;}
var place425=placeMech379;
placeMech379=function(){place425.apply(this,arguments);var r=E.raid;if(screen!=='raid'||!r||r.result||r.liveMode!=='preview'||!mechEntry379)return;
 var dock=$('deploy');if(!dock)return;var show=mechReady425()&&!!liveTarget&&liveTarget.can_attack!==false;
 if(show){var end=dock.querySelector('.end395');if(mechEntry379.parentNode!==dock||mechEntry379.previousElementSibling!==end){if(end)end.after(mechEntry379);else dock.prepend(mechEntry379);}mechEntry379.hidden=modal.style.display==='flex';mechEntry379.classList.add('battle342');mechEntry379.classList.toggle('armed425',!!deployTitan342||!!mechPending425);}
 else if(mechEntry379.parentNode===dock)mechEntry379.hidden=true;};
var titanDeploy425=Game.titanDeploy342;
Game.titanDeploy342=function(){var r=E.raid;if(screen!=='raid'||!r||r.result||r.liveMode!=='preview')return titanDeploy425.apply(this,arguments);
 if(!liveTarget||liveTarget.can_attack===false){toast(mt251('ฐานนี้มีโล่ป้องกัน แตะ ถัดไป','This base is shielded. Tap Next'));return;}
 if(!E.d.titan342||!E.d.titan342.level){Game.titan342();return;}if(E.titanRecovery347().resting){toast('หุ่นกำลังพักฟื้น');return;}
 if(E.d.gold<1000*E.d.titan342.level){toast(mt251('ทองไม่พอ • ส่งหุ่นใช้ ','Not enough gold • Deploy mech: ')+(1000*E.d.titan342.level));return;}
 if(!E.d.army.some(function(n){return n>0;})){toast(mt251('ต้องมีทหารในค่ายก่อนออกบุก','Train troops before attacking'));return;}
 deployTitan342=true;placeMech379();toast(mt251('แตะพื้นที่ว่างเพื่อส่งหุ่น • เริ่มบุกทันที','Tap open ground to send the mech • the attack starts')+' • '+(1000*E.d.titan342.level)+mt251(' ทอง',' gold'));};
var deployMech425=E.deployTitan342;
E.deployTitan342=function(x,y){var r=this.raid;if(!r||r.result||r.liveMode!=='preview')return deployMech425.call(this,x,y);
 if(!Number.isFinite(x)||!Number.isFinite(y)||titanBlocked342(r,x,y))return mt251('เลือกพื้นที่ว่าง ห้ามวางทับอาคาร','Choose open ground, away from buildings');
 if(mechPending425)return mt251('กำลังเริ่มการบุก…','Starting attack…');
 mechPending425={x:x,y:y,at:Date.now()};deployTitan342=false;Game.attackSelected();
 if(!E.d.pendingLiveStart){mechPending425=null;return mt251('เริ่มบุกไม่สำเร็จ','Could not start the attack');}
 return mt251('กำลังเริ่มการบุก…','Starting attack…');};
// drop the mech once the attack is live
setInterval(function(){var p=mechPending425;if(!p)return;if(screen!=='raid'||Date.now()-p.at>20000){mechPending425=null;return;}
 var r=E.raid;if(!r||r.result||r.liveMode!=='attacker'||!liveRoom||liveRoom.role!=='attacker'||E.d.pendingSiegeDeploy||warBusy||titanBusy342)return;
 mechPending425=null;deployTitan342=true;var msg=E.deployTitan342(p.x,p.y);if(msg){deployTitan342=false;toast(msg);}else toast(mt251('หุ่นออกสู้แล้ว • แตะตัวหุ่นเพื่อบังคับเอง','Mech deployed on AUTO • Tap it for manual control'));hud();},250);
(function(){var st=document.createElement('style');st.id='mech425';st.textContent='#app[data-battle300="true"] #deploy>#titanEntry342.armed425{outline:3px solid #ffd447!important;outline-offset:1px;box-shadow:0 0 12px #ffd447!important}';document.head.appendChild(st);})();
