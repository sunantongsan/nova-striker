// Approved cheerful terrain; surface coordinates and buildable cells remain unchanged.
var terrainArt383=new Image();terrainArt383.onload=function(){terrainKey219='';drawNeeded=true;};terrainArt383.src='assets/terrain383.webp';
var oldPlanet383=planetChoice298;
planets298=[
 {name:mt251('ทุ่งหญ้า','Meadow'),ground:['#b5df79','#d4ef99','#9dd16d'],sky:'#bcebd7',rock:'#bda87c'},
 {name:mt251('ทะเลทราย','Desert'),ground:['#f6cb96','#ffe5b9','#efb87d'],sky:'#ffe7c6',rock:'#e8ac86'},
 {name:mt251('แพมหาสมุทร','Ocean raft'),ground:['#f9dfb4','#fff0cf','#e4bf91'],sky:'#64d9e4',rock:'#89c2ca'},
 {name:mt251('ฐานลอยฟ้า','Sky base'),ground:['#e5e8fa','#f9f6ff','#d9d7f0'],sky:'#a8dcff',rock:'#9ebfdc'}
];
function themeOwner383(){return E.d.onlineCrystal&&E.d.onlineCrystal.owner;}
function themeCache383(){var o=themeOwner383();return E.d.themes383&&E.d.themes383[o]||{};}
function themeOwned383(i){return i<2||!!(themeCache383()[i===2?'ocean':'sky']||{}).unlocked;}
function themeRestore383(){var prefs=E.d.terrainChoices383||{},o=themeOwner383()||'guest',i=prefs[o];if(!Number.isInteger(i))i=oldPlanet383===1||oldPlanet383===4?1:0;planetChoice298=i>=0&&i<4&&themeOwned383(i)?i:0;terrainKey219='';drawNeeded=true;}
themeRestore383();
function texture383(index,x,y,w,h){if(!terrainArt383.complete||!terrainArt383.naturalWidth)return;var sw=terrainArt383.naturalWidth/2,sh=terrainArt383.naturalHeight/2;ctx.drawImage(terrainArt383,index%2*sw,Math.floor(index/2)*sh,sw,sh,x,y,w,h);}
paintTerrain219=function(map,raid){
 var i=planetChoice298,z=zoom,pal=planetPalette298(),c=[point(-.5,-.5),point(map-.5,-.5),point(map-.5,map-.5),point(-.5,map-.5)];
 ctx.clearRect(0,0,viewWidth,viewHeight);box(0,0,viewWidth,viewHeight,pal.sky);
 if(i>=2)texture383(i,0,0,viewWidth,viewHeight);
 else {ctx.save();ctx.globalAlpha=.22;texture383(i,0,0,viewWidth,viewHeight);ctx.restore();}
 function poly(points,fill,stroke,width){ctx.beginPath();points.forEach(function(p,n){if(n)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width*z;ctx.lineJoin='round';ctx.stroke();}}
 // Deep rim and flotation / antigravity supports sit below the same walkable surface.
 if(i>=2){for(var k=1;k<=2;k++){var a=c[k],b=c[k+1];poly([a,b,{x:b.x,y:b.y+20*z},{x:a.x,y:a.y+20*z}],i===2?'#76bfc5':'#abb6db','#eafaff',2);
  for(var t=.12;t<1;t+=.25){var xx=a.x+(b.x-a.x)*t,yy=a.y+(b.y-a.y)*t;ctx.fillStyle=i===2?'#ecb689':'#88e3f7';ctx.beginPath();ctx.ellipse(xx,yy+17*z,13*z,6*z,0,0,7);ctx.fill();if(i===3){var glow=ctx.createLinearGradient(0,yy+18*z,0,yy+43*z);glow.addColorStop(0,'#95f5ffbb');glow.addColorStop(1,'#efffff00');box(xx-9*z,yy+18*z,18*z,25*z,glow);}}}
 }else{for(var k=1;k<=2;k++)poly([c[k],c[k+1],{x:c[k+1].x,y:c[k+1].y+10*z},{x:c[k].x,y:c[k].y+10*z}],i===0?'#acbd7e':'#e8b18a');}
 poly(c,pal.ground[0]);
 ctx.save();ctx.beginPath();c.forEach(function(p,n){if(n)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});ctx.closePath();ctx.clip();
 if(i<2){ctx.save();ctx.transform((c[1].x-c[0].x)/map,(c[1].y-c[0].y)/map,(c[3].x-c[0].x)/map,(c[3].y-c[0].y)/map,c[0].x,c[0].y);texture383(i,0,0,map,map);ctx.restore();}
 else{var grad=ctx.createLinearGradient(c[0].x,c[0].y,c[2].x,c[2].y);grad.addColorStop(0,pal.ground[1]);grad.addColorStop(1,pal.ground[0]);box(0,0,viewWidth,viewHeight,grad);
  // Broad deck panels, subtle and cosmetic, never a collision grid.
  ctx.strokeStyle=i===2?'#d7ac7f55':'#a9b5da44';ctx.lineWidth=.8*z;
  for(var n=0;n<=map;n+=i===2?.65:2){var a=point(n-.5,-.5),b=point(n-.5,map-.5);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
 }
 ctx.restore();
 ctx.beginPath();c.forEach(function(p,n){if(n)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});ctx.closePath();ctx.strokeStyle=i===0?'#d4f3a5':i===1?'#ffe5be':i===2?'#fff3d7':'#fcfaff';ctx.lineWidth=(i>=2?7:3)*z;ctx.lineJoin='round';ctx.stroke();
 // Sparse rounded foliage / rocks outside placement cells keeps the center clear.
 if(i<2)for(var n=0;n<20;n++){var side=n%4,t=1.5+(n*3.17)%(map-3),x=side===0?-.8:side===1?map+.3:t,y=side===2?-.8:side===3?map+.3:t,p=point(x,y);if(p.x<-45||p.x>viewWidth+45||p.y<-60||p.y>viewHeight+50)continue;
  ctx.save();ctx.translate(p.x,p.y);ctx.scale(z,z);ctx.fillStyle='#769d6940';ctx.beginPath();ctx.ellipse(2,3,15,5,0,0,7);ctx.fill();
  if(i===0){ctx.strokeStyle='#c7a17c';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-20);ctx.stroke();for(var k=0;k<3;k++){var g=ctx.createRadialGradient(-6,-23,2,0,-18,21);g.addColorStop(0,'#e2f9a4');g.addColorStop(.5,'#a8dd82');g.addColorStop(1,'#74bc8c');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse((k-1)*8,-18-(k===1?10:0),12,13,0,0,7);ctx.fill();}ctx.fillStyle=n%3?'#fff1b1':'#f7b7d6';ctx.beginPath();ctx.arc(9,-15,3,0,7);ctx.fill();}
  else{ctx.fillStyle=n%3?'#edb994':'#a9d9ad';ctx.beginPath();ctx.ellipse(0,-7,13,10,-.2,0,7);ctx.fill();ctx.fillStyle=n%3?'#ffddaf':'#d9f1bc';ctx.beginPath();ctx.ellipse(-3,-11,9,5,-.2,0,7);ctx.fill();}ctx.restore();}
 if(!raid&&(placing||moving))for(var x=1;x<=20;x++)for(var y=1;y<=20;y++)if(E.empty(x,y,moving))diamond(x,y,'rgba(255,255,255,.22)','#72b1a7');
};
var infoBefore383=defenseInfo223;defenseInfo223=function(b){if(b.type!=='wall')return infoBefore383(b);var s=wallStats383(b.lv);return '<small style="display:block;color:#398b9b">'+(s.armed?mt251('ปืนกล • เป้าหมายพื้นดิน • ระยะ ','Machine gun • Ground targets • Range ')+s.range.toFixed(1)+mt251(' ช่อง • ยิงทุก 0.9 วินาที',' tiles • Fires every 0.9 seconds'):mt251('ปลดล็อกปืนกลเมื่อกำแพงเลเวล 15','Machine gun unlocks at wall level 15'))+'</small>';};
var terrainStyle383=document.createElement('style');terrainStyle383.textContent=`
#app>header .resources>span,#app>header .resources>.gembalance{background:linear-gradient(150deg,#fbfff7,#b3dfdf)!important;border-color:#f7fffc!important;border-bottom-color:#7db9be!important;box-shadow:inset 0 1px white,0 2px 4px #49778b40!important}
#app>header .resources b{color:#30556b!important;text-shadow:0 1px #fff!important}
#app>header #commanderButton{background:linear-gradient(140deg,#e2f4ff,#9ccedc)!important;border-color:#f4ffff!important}
#app:not([data-battle300="true"]) #homebar>button{background:linear-gradient(155deg,#f4ffff,#abdcd8)!important;border-color:#ecffff!important;border-bottom-color:#80b9be!important;box-shadow:inset 0 1px white,0 2px 4px #578b9140!important}
#app:not([data-battle300="true"]) #homebar>button:nth-child(3n){background:linear-gradient(150deg,#fff0fa,#cdbde8)!important}
#app:not([data-battle300="true"]) #homebar>button .railLabel373{color:#31546a!important;text-shadow:0 1px #ffffff!important}
#app:not([data-battle300="true"]) #homebar>#playerSearch382{background:linear-gradient(145deg,#fff1c9,#ffc38e)!important;border-color:#fff5dc!important;border-bottom-color:#dfa577!important}
.themeGrid383{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.themeCard383{background:#f5fcff;border:1px solid #c8dfe7;border-radius:16px;padding:10px;color:#34576d}.themeCard383 h3{font-size:15px;margin:6px 0}.themeCard383 small{display:block;min-height:20px}.themePreview383{height:90px;border-radius:12px;background-image:url('assets/terrain383.webp');background-size:200% 200%;border:3px solid #fff}.themeCard383 button{min-height:44px;width:100%;margin-top:6px;background:linear-gradient(#e5fbff,#addfdf);color:#29536a;border:1px solid #8fc1cf;border-radius:10px;box-shadow:inset 0 1px #fff,0 2px #a1cbd1}.themeCard383 .themeBuy383{background:linear-gradient(#ffecdf,#ffcaad);border-color:#e4ad91}.themePanel383{color:#34576d;background:#edf8ff;border-radius:18px;padding:12px}.themePanel383 h2{color:#34576d}.themePanel383 p{font-size:12px}.themePanel383>button{color:#34576d;background:#d6eff6}.themePanel383 button:disabled{opacity:.55}.themeCard383[data-selected="true"]{border:2px solid #6cbbac;box-shadow:0 0 0 2px #d6f3e9}.themePanel383 .themeStatus383{min-height:20px;color:#9c5d34}
`;document.head.appendChild(terrainStyle383);
