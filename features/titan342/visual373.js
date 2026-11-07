// Visual presentation only: no economy, save-schema or combat-stat changes.
(function(){
 var style=document.createElement('style');style.id='novaVisual373';style.textContent=visualCSS373;document.head.appendChild(style);
 // Keep one continuous ground surface. Decorative marks are cached by drawTerrain219.
 var originalTerrain=paintTerrain219;
 paintTerrain219=function(map,raid){
  if(placing||moving)return originalTerrain(map,raid);
  var palette=planetPalette298(),z=zoom;
  ctx.clearRect(0,0,viewWidth,viewHeight);box(0,0,viewWidth,viewHeight,palette.sky);
  var corners=[point(-.5,-.5),point(map-.5,-.5),point(map-.5,map-.5),point(-.5,map-.5)];
  ctx.save();ctx.beginPath();corners.forEach(function(p,i){if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});ctx.closePath();
  var ground=ctx.createLinearGradient(0,0,viewWidth,viewHeight);ground.addColorStop(0,palette.ground[1]);ground.addColorStop(.6,palette.ground[0]);ground.addColorStop(1,palette.ground[2]);ctx.fillStyle=ground;ctx.fill();ctx.clip();
  for(var i=0;i<220;i++){var x=((i*73)%997)/997*map,y=((i*137+39)%991)/991*map,p=point(x,y);ctx.fillStyle=i%3?'#1738240a':'#edffc014';ctx.beginPath();ctx.ellipse(p.x,p.y,(10+i%17)*z,(4+i%7)*z,-.25,0,Math.PI*2);ctx.fill();}
  // A shallow border gives the island depth without cluttering the buildable area.
  ctx.strokeStyle='#183e3666';ctx.lineWidth=10*z;ctx.beginPath();ctx.moveTo(corners[1].x,corners[1].y);ctx.lineTo(corners[2].x,corners[2].y);ctx.lineTo(corners[3].x,corners[3].y);ctx.stroke();ctx.restore();
  if(raid){for(var x=0;x<map;x++)for(var y=0;y<map;y++)if(!raid.buildings.some(function(b){return b.hp>0&&!trap278(b)&&Math.abs(b.x-x)<.75&&Math.abs(b.y-y)<.75;}))diamond(x,y,'rgba(66,190,240,.035)');}
  for(var n=0;n<22;n++){var side=n%2,x=side?map+.15:(n*.91)%map,y=side?(n*.91)%map:map+.15,p=point(x,y);if(p.x<-35||p.x>viewWidth+35||p.y<-60||p.y>viewHeight+60)continue;ctx.save();ctx.fillStyle='#102c3438';ctx.beginPath();ctx.ellipse(p.x+7*z,p.y+3*z,17*z,6*z,0,0,7);ctx.fill();box(p.x-2*z,p.y-20*z,4*z,23*z,palette.rock);for(var k=0;k<3;k++){ctx.fillStyle=k===2?palette.ground[1]:k===1?palette.ground[0]:palette.rock;ctx.beginPath();ctx.moveTo(p.x,p.y-(38-k*9)*z);ctx.lineTo(p.x+(15-k*3)*z,p.y-(8-k*4)*z);ctx.quadraticCurveTo(p.x,p.y-k*3*z,p.x-(15-k*3)*z,p.y-(8-k*4)*z);ctx.closePath();ctx.fill();}ctx.restore();}
 };
 terrainKey219='';drawNeeded=true;
 // Soft contact shadows anchor buildings; health bars and selection remain in the original renderer.
 var previousBuilding=drawBuilding;
 drawBuilding=function(b,enemy){if(b.type!=='wall'&&!trap278(b)&&(b.hp===undefined||b.hp>0)){var p=point(b.x,b.y);if(p.x>-90&&p.x<viewWidth+90&&p.y>-90&&p.y<viewHeight+90){ctx.save();ctx.fillStyle='#102c3130';ctx.beginPath();ctx.ellipse(p.x+8*zoom,p.y+4*zoom,27*zoom,10*zoom,-.15,0,7);ctx.fill();ctx.restore();}}previousBuilding(b,enemy);};
 // Small descriptive labels make the existing icon rail learnable on touch screens.
 Array.from(document.querySelectorAll('#homebar > button')).forEach(function(b){var label=document.createElement('span');label.className='railLabel373';label.textContent=b.getAttribute('aria-label')||b.title;b.appendChild(label);});
 var settingsBefore=Game.settings;
 Game.settings=function(){settingsBefore.apply(this,arguments);var sheet=modal.querySelector('.novaContent360')||modal.querySelector('.sheet');if(sheet&&!sheet.querySelector('.replayGuide373')){var b=document.createElement('button');b.className='wide replayGuide373';b.textContent=mt251('สอนเล่นทีละขั้น','Learn step by step');b.onclick=function(){close();Game.help();};sheet.appendChild(b);}};
 // A single anchored coach card; focus never intercepts a player's tap.
 guideHint337=function(th,en,selector,button){
  var dock=$('guideDock288'),step=guide288?guide288.step:0;dock.hidden=false;
  setHTML219(dock,'<div class="coachPortrait373" aria-hidden="true"></div><div class="coachCopy373"><small>'+mt251('ผู้ช่วย NOVA','NOVA GUIDE')+' · '+(step+1)+'/8</small><p>'+mt251(th,en)+'</p><div class="coachActions373">'+(button||'')+'<button class="guide-skip337" onclick="Game.guideFinish288()">'+mt251('พักก่อน','Later')+'</button></div><div class="coachProgress373" aria-hidden="true"><i style="width:'+((step+1)*12.5)+'%"></i></div></div>');
  var target=selector&&document.querySelector(selector);
  if(target!==guideFocusTarget337){guideClearFocus288();guideFocusTarget337=target;if(target){target.classList.add('guide-focus288');if(target.id!=='world'&&target.scrollIntoView)target.scrollIntoView({block:'nearest',inline:'nearest'});}}
  // Pick the corner with least overlap; use viewport coordinates for a fixed coach.
  var w=dock.offsetWidth,h=dock.offsetHeight,pad=10,top=60,bottom=Math.max(top,innerHeight-h-pad),right=Math.max(pad,innerWidth-w-84),r=target&&target.getBoundingClientRect();
  var spots=[[pad,top],[pad,bottom],[right,top],[right,bottom]];
  function overlap(s){if(!r||target.id==='world')return 0;return Math.max(0,Math.min(s[0]+w,r.right)-Math.max(s[0],r.left))*Math.max(0,Math.min(s[1]+h,r.bottom)-Math.max(s[1],r.top));}
  spots.sort(function(a,b){return overlap(a)-overlap(b);});dock.style.left=spots[0][0]+'px';dock.style.top=Math.min(spots[0][1],Math.max(pad,innerHeight-h-pad))+'px';
 };
 // Do not auto-restart guides already completed or skipped by an existing player.
 guideAutoPending288=true;
})();
