// Visual presentation only: no economy, save-schema or combat-stat changes.
(function(){
 var style=document.createElement('style');style.id='novaVisual373';style.textContent=visualCSS373;document.head.appendChild(style);
 // Keep one continuous ground surface. Decorative marks are cached by drawTerrain219.
 // Alien bedrock, cached by drawTerrain219; all ornament stays cosmetic.
 paintTerrain219=function(map,raid){
  var z=zoom,palette=planetPalette298(),alien=planetChoice298===0||planetChoice298===5;
  ctx.clearRect(0,0,viewWidth,viewHeight);
  var sky=ctx.createLinearGradient(0,0,0,viewHeight);sky.addColorStop(0,alien?'#182e50':palette.sky);sky.addColorStop(1,'#354e69');box(0,0,viewWidth,viewHeight,sky);
  var corners=[point(-.5,-.5),point(map-.5,-.5),point(map-.5,map-.5),point(-.5,map-.5)];
  ctx.save();ctx.beginPath();corners.forEach(function(p,i){if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});ctx.closePath();
  var ground=ctx.createLinearGradient(corners[0].x,corners[0].y,corners[2].x,corners[2].y);ground.addColorStop(0,alien?'#73949e':palette.ground[1]);ground.addColorStop(.55,alien?'#617f95':palette.ground[0]);ground.addColorStop(1,alien?'#555d83':palette.ground[2]);ctx.fillStyle=ground;ctx.fill();ctx.clip();
  // Broad mineral strata, subtle enough to read buildings against them.
  for(var i=0;i<95;i++){var x=((i*73)%997)/997*map,y=((i*137+39)%991)/991*map,p=point(x,y);ctx.fillStyle=i%3?'#1128430c':'#d7faff13';ctx.beginPath();ctx.ellipse(p.x,p.y,(14+i%29)*z,(5+i%11)*z,-.12,0,Math.PI*2);ctx.fill();}
  for(var i=0;i<12;i++){var x=(i*7.31+1.7)%map,y=(i*3.79+.8)%map,p=point(x,y);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+20*z,p.y+3*z);ctx.lineTo(p.x+32*z,p.y-2*z);ctx.lineTo(p.x+47*z,p.y+4*z);ctx.strokeStyle='#1f344c38';ctx.lineWidth=2*z;ctx.stroke();ctx.strokeStyle='#9ce7e52b';ctx.lineWidth=.6*z;ctx.stroke();}
  ctx.restore();
  // Faceted rock ledge below the near edges; no collision objects added.
  for(var edge=1;edge<3;edge++){var a=corners[edge],b=corners[edge+1];ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(b.x,b.y+12*z);ctx.lineTo(a.x,a.y+12*z);ctx.closePath();ctx.fillStyle=edge===1?'#283c57':'#364f69';ctx.fill();}
  // A few crystal outcrops outside the buildable area, instead of terrestrial trees.
  for(var n=0;n<12;n++){var side=n%2,x=side?map+.6:1+(n*1.91)%(map-2),y=side?1+(n*1.91)%(map-2):map+.6,p=point(x,y);if(p.x<-45||p.x>viewWidth+45||p.y<-50||p.y>viewHeight+50)continue;
   ctx.save();ctx.fillStyle='#10233d55';ctx.beginPath();ctx.ellipse(p.x+5*z,p.y+3*z,14*z,5*z,0,0,7);ctx.fill();
   for(var k=0;k<2;k++){var xx=p.x+(k*10-5)*z,h=(k?18:29)*z,w=(k?5:7)*z;ctx.beginPath();ctx.moveTo(xx-w,p.y);ctx.lineTo(xx-w*.7,p.y-h*.65);ctx.lineTo(xx,p.y-h);ctx.lineTo(xx+w,p.y-h*.7);ctx.lineTo(xx+w,p.y);ctx.closePath();ctx.fillStyle=k?'#7687b7':'#5eabae';ctx.fill();ctx.beginPath();ctx.moveTo(xx,p.y-h);ctx.lineTo(xx+w,p.y-h*.7);ctx.lineTo(xx+w,p.y);ctx.lineTo(xx,p.y-2*z);ctx.closePath();ctx.fillStyle=k?'#b3bce0':'#ade5de';ctx.fill();}ctx.restore();
  }
  // Preserve placement feedback on the same surface rather than switching scenes.
  if(!raid&&(placing||moving)){for(var x=1;x<=20;x++)for(var y=1;y<=20;y++)if(E.empty(x,y,moving))diamond(x,y,'rgba(172,255,203,.17)','#a4e4cb');}
 };
 terrainKey219='';drawNeeded=true;
 // Soft contact shadows anchor buildings; health bars and selection remain in the original renderer.
 var previousBuilding=drawBuilding;
 drawBuilding=function(b,enemy){if(b.type!=='wall'&&!trap278(b)&&(b.hp===undefined||b.hp>0)){var p=point(b.x,b.y);if(p.x>-90&&p.x<viewWidth+90&&p.y>-90&&p.y<viewHeight+90){ctx.save();ctx.fillStyle='#102c3130';ctx.beginPath();ctx.ellipse(p.x+8*zoom,p.y+4*zoom,27*zoom,10*zoom,-.15,0,7);ctx.fill();ctx.restore();}}previousBuilding(b,enemy);};
 var entryImage=document.querySelector('#titanEntry342 img');if(entryImage){entryImage.onerror=function(){this.onerror=null;this.src='assets/nova-hero.webp';};if(!entryImage.getAttribute('src'))entryImage.src='assets/nova-hero.webp';}
 // Keep bot raids distinct from the existing player-base attack button.
 var homeDock376=$('homebar');
 var bot376=document.createElement('button');bot376.id='botAttack376';bot376.type='button';
 bot376.title=mt251('มัลติเพลย์ • โจมตีฐานบอท','Multiplayer • Bot bases');bot376.setAttribute('aria-label',bot376.title);
 bot376.innerHTML='<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M5 33V18h9V9h12v9h9v15Z M17 9V4h6v5 M10 23h4m12 0h4M17 16h6v7h-6Z M17 33v-6h6v6"/><path d="m3 10 6-6m-5 0h5v5M31 4h5v5m-5-5 6 6"/></svg>';
 bot376.onclick=function(){Game.missions();};
 homeDock376.querySelector('.rail-attack338').after(bot376);
 var checkin=$('dailyCheckin340');if(checkin)homeDock376.appendChild(checkin);
 // Small descriptive labels make the existing icon rail learnable on touch screens.
 Array.from(document.querySelectorAll('#homebar > button')).forEach(function(b){var label=document.createElement('span');label.className='railLabel373';var names={titanEntry342:mt251('หุ่น NOVA','Mech'),botAttack376:mt251('มัลติเพลย์','Multiplayer'),dailyCheckin340:mt251('เช็คอิน','Check-in'),skillShop342:mt251('ร้านค้า','Shop')};label.textContent=names[b.id]||(b.classList.contains('rail-attack338')?mt251('ตีผู้เล่น','Players'):b.getAttribute('aria-label')||b.title);label.title=b.title;b.appendChild(label);});
 var playerSearch382=homeDock376.querySelector('.rail-attack338');
 if(playerSearch382){playerSearch382.id='playerSearch382';playerSearch382.title=mt251('ค้นหาผู้เล่น','Find players');playerSearch382.setAttribute('aria-label',playerSearch382.title);var label=playerSearch382.querySelector('.railLabel373');if(label)label.textContent=playerSearch382.title;}
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

