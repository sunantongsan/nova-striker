/* Battle presentation: bounded effects; result rewards remain server/engine authoritative. */
var mechEntry379=$('titanEntry342'),hudBefore379=hud;
hud=function(){hudBefore379();placeMech379();};
function placeMech379(){
 var r=E.raid;if(screen!=='raid'||!r||r.result||r.liveMode==='preview'||r.liveMode==='defender')return;
 var dock=$('deploy');if(dock&&mechEntry379){dock.prepend(mechEntry379);mechEntry379.hidden=modal.style.display==='flex';mechEntry379.classList.add('battle342');}
}
var tickBefore379=tickUI342;tickUI342=function(dt){tickBefore379(dt);placeMech379();};

// Rotate only the weapon assembly; the painted footing stays anchored to the ground.
var paintedWeapon379=drawWeapon272,paintedRocket379=drawRocket227,paintedTurret379=drawTurret;
function drawHead379(b,p){
 var g=turret379(b),z=zoom,size=tile*z*2.25;
 ctx.save();ctx.beginPath();ctx.rect(p.x-size/2,p.y-13*z,size,35*z);ctx.clip();
 if(b.type==='missileturret')paintedRocket379(b,p);else paintedWeapon379(b,p);ctx.restore();
 ctx.save();ctx.translate(p.x,p.y-g.height*z);ctx.scale(z,z);
 var metal=ctx.createLinearGradient(0,-5,0,13);metal.addColorStop(0,'#dcecf2');metal.addColorStop(.45,'#668899');metal.addColorStop(1,'#243f55');
 ctx.fillStyle=metal;ctx.beginPath();ctx.ellipse(0,7,12,7,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#92bdcf';ctx.stroke();
 ctx.scale(1,.62);ctx.rotate(g.turn);ctx.lineWidth=1;ctx.strokeStyle='#102b41';
 ctx.fillStyle=metal;ctx.fillRect(-10,-9,23,18);ctx.strokeRect(-10,-9,23,18);
 var rocket=b.type==='missileturret',barrels=rocket?3:Math.min(3,1+weaponStage272(b));
 for(var i=0;i<barrels;i++){var side=(i-(barrels-1)/2)*6;ctx.fillStyle=metal;ctx.fillRect(4,side-2.5,g.length-4,5);ctx.strokeRect(4,side-2.5,g.length-4,5);ctx.fillStyle=rocket?'#ffb966':'#67e4ff';ctx.fillRect(g.length-3,side-1.8,3,3.6);}
 ctx.fillStyle='#43c8f5';ctx.fillRect(-5,-5,7,10);ctx.restore();
 if(b.recoil>.12){var m=weaponMount(b);ctx.save();ctx.globalAlpha=Math.min(1,b.recoil/.18);disk(p.x+m.x*z,p.y+m.y*z,5*z,rocket?'#ffbd75':'#bdf8ff');disk(p.x+m.x*z,p.y+m.y*z,2*z,'#fff');ctx.restore();}
}
drawWeapon272=function(b,p){if(b.type==='gun'||b.type==='missileturret')return drawHead379(b,p);paintedWeapon379(b,p);};
drawRocket227=function(b,p){drawHead379(b,p);};
drawTurret=function(b,p){if(b.type==='gun')return drawHead379(b,p);paintedTurret379(b,p);};

// Distinct timbres per weapon AND shooter, using the existing muted/limited audio mixer.
var audioBefore379=weaponAudio218;
var voices379={machine:[['noise',4800,700,.045,.19],['triangle',180,50,.06,.08]],sniper:[['noise',6200,900,.12,.27],['sine',220,45,.2,.12]],cannon:[['noise',1800,80,.3,.28],['sine',100,28,.4,.24]],grenade:[['triangle',330,80,.13,.2],['noise',800,180,.15,.16]],bomb:[['sine',430,90,.45,.16],['noise',900,250,.25,.13]],missile:[['noise',400,4200,.42,.24],['sawtooth',90,300,.3,.07]],plasma:[['triangle',1300,180,.19,.18],['sine',650,90,.24,.1]],shock:[['sawtooth',830,130,.17,.12],['noise',5400,1500,.09,.14]],tesla:[['sawtooth',1700,230,.2,.11],['square',440,150,.11,.06]],heal:[['sine',520,880,.3,.08]],energy276:[['sine',680,65,.45,.24],['triangle',1500,170,.38,.12]]};
weaponAudio218=function(f){
 var profile=voices379[f.weapon];if(!profile)return audioBefore379(f);
 if(f.heard218)return;f.heard218=true;
 if(!soundOn||document.hidden||!mediaAllowed250()||!audio||audio.state!=='running')return;
 var kind=Number.isInteger(f.sourceKind379)?f.sourceKind379:0,key='379:'+f.weapon+':'+(f.sourceType379||kind),now=audio.currentTime;
 if(now-(lastSfx218[key]===undefined?-99:lastSfx218[key])<.13)return;lastSfx218[key]=now;
 var pitch=f.sourceType379?.72:1+(kind%5)*.085;
 try{profile.forEach(function(v){voice218(v[0],v[1]*pitch,v[2]*pitch,v[3],v[4],'sfx');});if(f.weapon==='machine')voice218('noise',3600*pitch,650,.045,.12,'sfx',.055);}catch(ignore){}
};

function outcomeHTML379(win,defending){return '<section class="outcome379 '+(win?'victory379':'defeat379')+'" role="status"><div class="emblem379" aria-hidden="true">'+(win?'★':'◆')+'</div><strong class="outcomeTitle379">'+mt251(win?'ชัยชนะ':'พ่ายแพ้',win?'VICTORY':'DEFEAT')+'</strong><p>'+mt251(defending?(win?'ป้องกันฐานแม่สำเร็จ':'ฐานแม่ถูกทำลาย'):(win?'ทำลายฐานแม่สำเร็จ':'ฐานแม่ศัตรูยังไม่ถูกทำลาย'),defending?(win?'Your HQ survived':'Your HQ was destroyed'):(win?'Enemy HQ destroyed':'Enemy HQ remains standing'))+'</p>'+Array.from({length:18},function(_,i){return '<i style="--i:'+i+'" aria-hidden="true"></i>';}).join('')+'</section>';}
function outcomeSound379(win){if(!soundOn||document.hidden)return;try{unlockAudio218();(win?[523,659,784,1047]:[294,247,196]).forEach(function(f,i){voice218(win?'triangle':'sine',f,win?f:f*.7,.42,.12,'sfx',i*.13);});}catch(ignore){}}
var resultBefore379=result277;result277=function(){var r=E.raid;resultBefore379();if(!r||r.liveMode||!r.result)return;var body=(modal.querySelector('.novaContent360')||modal.querySelector('.sheet'));if(body&&!body.querySelector('.outcome379')){var win=hqDestroyed379(r.buildings);var title=body.querySelector('h2');if(title)title.remove();body.insertAdjacentHTML('afterbegin',outcomeHTML379(win));if(!r.result.heard379){r.result.heard379=true;outcomeSound379(win);}}};
// Capture the authoritative final HQ health before older receipt handlers return home.
var acceptBefore379=acceptLive,liveOutcomes379=new Map(),heardOutcomes379=new Set();
acceptLive=function(b){if(b&&b.finished){var bs=E.raid&&E.raid.buildings||[],layout=b.target&&b.target.layout||[];var frame=b.frame&&b.frame.buildings;if(frame){bs=(layout.length?layout:bs).map(function(v,i){return Object.assign({},v,{hp:frame[i]?frame[i][0]:v.hp});});}liveOutcomes379.set(b.id,hqDestroyed379(bs));if(liveOutcomes379.size>20)liveOutcomes379.delete(liveOutcomes379.keys().next().value);}var out=acceptBefore379(b);if(b&&b.finished&&!heardOutcomes379.has(b.id)&&(E.d.liveReceipts||[]).includes(b.id)){heardOutcomes379.add(b.id);if(heardOutcomes379.size>20)heardOutcomes379.delete(heardOutcomes379.values().next().value);var down=liveOutcomes379.get(b.id);outcomeSound379(b.role==='defender'?!down:down);}return out;};
var summaryBefore379=siegeSummary;
siegeSummary=function(b){var html=summaryBefore379(b),down=liveOutcomes379.get(b.id);if(down===undefined)down=hqDestroyed379(E.raid&&E.raid.buildings);var win=b.role==='defender'?!down:down;return outcomeHTML379(win,b.role==='defender')+html;};
var defenseBefore379=defenseResult;defenseResult=function(){defenseBefore379();var body=(modal.querySelector('.novaContent360')||modal.querySelector('.sheet'));if(body&&E.defense&&E.defense.result){body.insertAdjacentHTML('afterbegin',outcomeHTML379(!!E.defense.result.win,true));outcomeSound379(!!E.defense.result.win);}};
(function(){var style=document.createElement('style');style.textContent=`
#app[data-battle300="true"] #deploy>#titanEntry342{position:relative!important;inset:auto!important;order:-1!important;flex:0 0 48px!important;width:48px!important;height:46px!important;min-height:46px!important;padding:1px 1px 11px!important;margin:0!important}
#app[data-battle300="true"] #deploy>#titanEntry342 img{width:30px!important;height:30px!important;object-fit:contain!important}
#app[data-battle300="true"] #deploy>#titanEntry342 .railLabel373{position:absolute;bottom:1px;left:0;width:100%;font:700 8px/10px Tahoma,Arial,sans-serif;white-space:nowrap}
#modal#modal[data-nova360] .novaContent360 .outcome379{position:relative;isolation:isolate;overflow:hidden;text-align:center;padding:12px 8px 16px;min-height:118px;color:#ffdf8c;border-radius:10px;background:radial-gradient(ellipse at 50% 20%,#385363,#10283e 70%)}
#modal#modal[data-nova360] .outcome379 .outcomeTitle379{display:block;font-size:25px!important;margin:4px 0!important;color:inherit!important;letter-spacing:2px;text-shadow:0 0 20px currentColor}#modal#modal[data-nova360] .novaContent360 .outcome379 p{margin:3px!important;font-size:11px!important;color:#d4e1e8!important}.emblem379{display:inline-grid;place-items:center;width:53px;height:53px;font-size:38px;border:1px solid currentColor;transform:rotate(-8deg);border-radius:16px;box-shadow:0 0 26px #ffd56c55;animation:emblem379 .6s ease-out both}#modal#modal[data-nova360] .novaContent360 .defeat379{color:#ff8e86;background:radial-gradient(ellipse at 50% 20%,#533440,#201f35 70%)}.defeat379 .emblem379{box-shadow:0 0 26px #e5575355;clip-path:polygon(0 0,100% 0,100% 40%,52% 48%,100% 60%,100% 100%,0 100%)}
.outcome379 i{position:absolute;z-index:-1;left:50%;top:40%;width:3px;height:8px;background:currentColor;--angle:calc(var(--i)*20deg);transform:rotate(var(--angle));animation:sparks379 1.8s calc(var(--i)*.025s) ease-out both}.defeat379 i{animation-name:embers379}
@keyframes emblem379{from{opacity:0;transform:scale(.5) rotate(-25deg)}to{opacity:1;transform:scale(1) rotate(-8deg)}}
@keyframes sparks379{0%{opacity:0;transform:rotate(var(--angle)) translateY(18px)}20%{opacity:1}100%{opacity:0;transform:rotate(var(--angle)) translateY(125px)}}
@keyframes embers379{0%{opacity:0;transform:rotate(var(--angle)) translateY(15px)}30%{opacity:.7}100%{opacity:0;transform:translateY(100px) rotate(var(--angle)) translateX(60px)}}
@media(prefers-reduced-motion:reduce){.outcome379 i{display:none}.emblem379{animation:none}}
`;document.head.appendChild(style);})();
