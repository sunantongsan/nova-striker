// 393: Clash-style multiplayer bot bases. Each stage gets its own seeded layout from one of
// several archetypes (core box, compartments, diamond, offset core, wheel, islands, layered rings,
// farming). Walls are laid first, then every building picks a cell by role: HQ deepest inside,
// storages spread in the core, defenses spread to cover the base, traps along the wall lines,
// army buildings and collectors around the outside. Levels, counts, wall coverage, defending
// troops and their research all rise with the stage, so later bots are clearly stronger.
function rng393(seed){var s=(seed>>>0)||1;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function baseTier393(n){return Math.min(20,1+Math.floor((n-1)/5));}
function baseCounts393(hq,n){
 var c={hq:1,gun:Math.min(4,1+Math.floor(hq/3)),tesla:hq>=2?(hq>=6?2:1):0,missileturret:1+(hq>=5)+(hq>=10)+(hq>=15),cannonturret:hq>=8?1+(hq>=12)+(hq>=16):0,shield:hq>=10?1:0,
  landmine:hq>=3?Math.min(5,Math.floor((hq-1)/2)):0,silo:hq>=6?Math.min(5,Math.floor((hq-3)/3)):0,
  goldstore:hq>=2?Math.min(2,1+(hq>=7)):1,powerstore:hq>=2?Math.min(2,1+(hq>=7)):1,storage:hq>=4?Math.min(2,1+(hq>=12)):0,
  mine:Math.min(3,1+Math.floor(hq/4)),reactor:Math.min(3,1+Math.floor(hq/4)),barracks:hq>=3?2:1,camp:hq>=2?2:1,factory:hq>=2?1:0,airbase:hq>=5?1:0,tech:hq>=4?1:0,garrison:hq>=3?1:0};
 c.wall=Math.min(150,14+hq*7+Math.floor(n/4));return c;}
function campaignLayout393(n){
 var R=rng393(n*2654435761+97),hq=baseTier393(n),S=n>=60?24:20,c=(S+1)/2,counts=baseCounts393(hq,n),occ={},walls=[],out=[];
 function ri(a,b){return a+Math.floor(R()*(b-a+1));}
 var turn=ri(0,3),mirror=R()<.5;
 function tf(dx,dy){if(mirror)dx=-dx;for(var k=0;k<turn;k++){var t=dx;dx=-dy;dy=t;}return{x:Math.round(c+dx),y:Math.round(c+dy)};}
 function inb(x,y){return x>=1&&y>=1&&x<=S&&y<=S;}
 // walls in relative coordinates; queued by importance and trimmed to the wall budget
 var queue=[];function w(dx,dy){queue.push([dx,dy]);}
 function rect(x0,y0,x1,y1,gaps){for(var x=x0;x<=x1;x++){w(x,y0);w(x,y1);}for(var y=y0+1;y<y1;y++){w(x0,y);w(x1,y);}}
 function hline(x0,x1,y){for(var x=x0;x<=x1;x++)w(x,y);}function vline(x,y0,y1){for(var y=y0;y<=y1;y++)w(x,y);}
 function diamond(r){for(var i=0;i<r;i++){w(i,-r+i);w(i+1,-r+i);w(r-i,i);w(r-i,i+1);w(-i,r-i);w(-i-1,r-i);w(-r+i,-i);w(-r+i,-i-1);}}
 function ring(r){var seen={};for(var a=0;a<360;a+=2){var x=Math.round(Math.cos(a*Math.PI/180)*r),y=Math.round(Math.sin(a*Math.PI/180)*r),k=x+','+y;if(!seen[k]){seen[k]=1;w(x,y);}}
  // close diagonal leaks so the ring blocks walking (4-connected)
  Object.keys(seen).forEach(function(k){var p=k.split(',').map(Number);[[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(d){var q=(p[0]+d[0])+','+(p[1]+d[1]);if(seen[q]&&!seen[(p[0]+d[0])+','+p[1]]&&!seen[p[0]+','+(p[1]+d[1])]){seen[(p[0]+d[0])+','+p[1]]=1;w(p[0]+d[0],p[1]);}});});}
 var kinds=n<=5?['core']:n<=15?['core','offset','compart','ring']:['core','compart','diamond','offset','wheel','islands','layers','farm'];
 var kind=kinds[(n*7+ri(0,kinds.length-1))%kinds.length],core={dx:0,dy:0},hqOut=false,a,b;
 if(kind==='core'){a=ri(2,3);rect(-a,-a,a,a);b=a+ri(3,4);rect(-b,-b,b,b);if(R()<.6){hline(-b,-a,0);hline(a,b,0);}else{vline(0,-b,-a);vline(0,a,b);}}
 else if(kind==='offset'){var ox=ri(3,5)*(R()<.5?-1:1),oy=ri(2,4)*(R()<.5?-1:1);core={dx:ox,dy:oy};rect(ox-2,oy-2,ox+2,oy+2);rect(-7,-7,7,7);hline(-7,7,-oy>0?2:-2);vline(-ox>0?2:-2,-7,7);}
 else if(kind==='compart'){var b2=ri(6,8),cx=[-b2,-ri(1,3),ri(1,3),b2],cy=[-b2,-ri(1,3),ri(1,3),b2];rect(cx[1],cy[1],cx[2],cy[2]);rect(-b2,-b2,b2,b2);cx.slice(1,3).forEach(function(x){vline(x,-b2,b2);});cy.slice(1,3).forEach(function(y){hline(-b2,b2,y);});}
 else if(kind==='ring'){a=ri(3,4);rect(-a,-a,a,a);ring(a+ri(3,4));}
 else if(kind==='diamond'){diamond(3);diamond(ri(7,8));if(R()<.5){vline(0,-7,-4);vline(0,4,7);}else{hline(-7,-4,0);hline(4,7,0);}}
 else if(kind==='wheel'){rect(-2,-2,2,2);ring(ri(7,8));vline(0,-7,-3);vline(0,3,7);hline(-7,-3,0);hline(3,7,0);}
 else if(kind==='islands'){var off=ri(4,5);core={dx:-off+1,dy:-off+1};rect(core.dx-2,core.dy-2,core.dx+2,core.dy+2);rect(off-3,-2,off+2,3);rect(-3,off-3,3,off+2);rect(-off-2,-off-2,off+3,off+3);}
 else if(kind==='layers'){rect(-2,-2,2,2);var r1=ri(4,5),r2=r1+ri(3,4);rect(-r1,-r1,r1,r1);rect(-r2,-r2,r2,r2);vline(0,-r2,-r1);hline(r1,r2,0);}
 else if(kind==='farm'){a=3;rect(-a,-a,a,a);rect(-a-4,-a-4,a+4,a+4);hqOut=R()<.6;}
 // funnels: open a few gaps in outer lines so attackers get pulled into kill zones
 var gaps=ri(0,n>40?1:3),seen={};queue.forEach(function(q){var p=tf(q[0],q[1]);if(!inb(p.x,p.y))return;var k=p.x+','+p.y;if(seen[k])return;seen[k]=1;walls.push({x:p.x,y:p.y,d:Math.abs(q[0])+Math.abs(q[1])});});
 walls.sort(function(p,q){return p.d-q.d;});
 if(gaps)walls=walls.filter(function(p,i){return !(p.d>9&&i%Math.max(9,Math.floor(walls.length/gaps))===4);});
 walls=walls.slice(0,counts.wall);
 walls.forEach(function(p){occ[p.x+','+p.y]='w';});
 // enclosure depth: number of wall layers between a cell and the map edge (0-1 BFS)
 var depth={},dq=[];for(var x=0;x<=S+1;x++)for(var y=0;y<=S+1;y++){if(x===0||y===0||x===S+1||y===S+1){depth[x+','+y]=0;dq.push([x,y]);}}
 while(dq.length){var cur=dq.shift(),cd=depth[cur[0]+','+cur[1]];[[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var nx=cur[0]+d[0],ny=cur[1]+d[1];if(nx<0||ny<0||nx>S+1||ny>S+1)return;var cost=occ[nx+','+ny]==='w'?1:0,nd=cd+cost,k=nx+','+ny;if(depth[k]===undefined||nd<depth[k]){depth[k]=nd;if(cost)dq.push([nx,ny]);else dq.unshift([nx,ny]);}});}
 var maxDepth=0;Object.keys(depth).forEach(function(k){if(occ[k]!=='w'&&depth[k]>maxDepth)maxDepth=depth[k];});
 var corePt=tf(core.dx,core.dy),placed=[];
 function nearWall(x,y){for(var dx=-1;dx<=1;dx++)for(var dy=-1;dy<=1;dy++)if(occ[(x+dx)+','+(y+dy)]==='w')return true;return false;}
 function spaced(x,y,trap){return !placed.some(function(p){return Math.max(Math.abs(p.x-x),Math.abs(p.y-y))<(trap||p.trap?1:2);});}
 function lvFor(type){var base=type==='hq'?hq:hq-ri(0,n<20?2:1);if(['gun','tesla','missileturret','cannonturret'].indexOf(type)>=0&&n>30)base=hq-ri(0,1);return Math.max(1,Math.min(MAX_BUILDING_LEVEL,base));}
 function put(type,score,trap){var best=null,bs=-1e9;for(var x=1;x<=S;x++)for(var y=1;y<=S;y++){var k=x+','+y;if(occ[k]||!spaced(x,y,trap))continue;var v=score(x,y,depth[k]||0);if(v===null)continue;v+=R()*1.5;if(v>bs){bs=v;best={x:x,y:y};}}
  if(!best)return;occ[best.x+','+best.y]='b';placed.push({type:type,x:best.x,y:best.y,trap:!!trap});out.push({type:type,x:best.x,y:best.y,lv:lvFor(type)});}
 function dist2(x,y,p){return Math.hypot(x-p.x,y-p.y);}
 function minTo(x,y,types){var m=99;placed.forEach(function(p){if(types.indexOf(p.type)>=0)m=Math.min(m,dist2(x,y,p));});return m;}
 var DEF=['gun','tesla','missileturret','cannonturret','shield','hq'],STO=['goldstore','powerstore','storage'];
 // HQ
 put('hq',function(x,y,d){return hqOut?(d===0&&nearWall(x,y)?20-dist2(x,y,corePt):null):d*12-dist2(x,y,corePt)*1.4;});
 // storages: deep and apart from each other (farming bases pull them into the core)
 ['storage','goldstore','powerstore'].forEach(function(t){for(var i=0;i<counts[t];i++)put(t,function(x,y,d){return d*(kind==='farm'?14:7)+Math.min(6,minTo(x,y,STO))*2-dist2(x,y,corePt)*.4;});});
 // splash and heavy defenses near the core, point defenses spread to the outer compartments
 var order=['shield','cannonturret','tesla','missileturret','gun'];
 order.forEach(function(t){for(var i=0;i<counts[t];i++)put(t,function(x,y,d){var inner=t==='shield'||t==='cannonturret'||t==='tesla';var cov=Math.min(7,minTo(x,y,DEF));return (inner?d*6:Math.min(d,1)*8+d)+cov*(inner?1.5:3)-Math.abs(dist2(x,y,{x:c,y:c})-(inner?2:6))*1.2;});});
 // traps hide along walls and in the gaps attackers walk through
 ['silo','landmine'].forEach(function(t){for(var i=0;i<counts[t];i++)put(t,function(x,y,d){if(!nearWall(x,y))return null;return (t==='silo'?d*4:4-d)+Math.min(5,minTo(x,y,['silo','landmine']))*2-dist2(x,y,{x:c,y:c})*.15;},true);});
 // army buildings and lab sit in the outer ring, collectors on the edge
 ['garrison','tech','airbase','factory','barracks','camp'].forEach(function(t){for(var i=0;i<counts[t];i++)put(t,function(x,y,d){var r=dist2(x,y,{x:c,y:c});return (t==='garrison'?d*4:d===0?6:d*1.5)-Math.abs(r-(t==='garrison'?4:8.5))*1.3+Math.min(5,minTo(x,y,['barracks','camp','factory','airbase','tech']))*1.5;});});
 ['mine','reactor'].forEach(function(t){for(var i=0;i<counts[t];i++)put(t,function(x,y,d){if(d)return null;var r=dist2(x,y,{x:c,y:c});return r*.6+Math.min(6,minTo(x,y,['mine','reactor']))*2;});});
 walls.forEach(function(p){out.push({type:'wall',x:p.x,y:p.y,lv:Math.max(1,Math.min(MAX_BUILDING_LEVEL,hq-ri(0,n<40?2:1)))});});
 out.layout393=kind;return out;
}
campaignLayout299=campaignLayout393;
// Stronger defending squads with research that grows by stage. Mixed unit kinds unlock over time.
var scoutBots393=Engine.prototype.scout;
Engine.prototype.scout=function(n){
 var ok=scoutBots393.apply(this,arguments);if(!ok||!this.raid||!this.raid.campaign299)return ok;
 var r=this.raid,R=rng393(n*7919+3),g=r.buildings.find(function(b){return b.type==='garrison';}),lvl=Math.min(10,Math.floor(n/10));
 r.defenderResearch={weapon:lvl,armor:lvl};
 if(g&&n>=12){var pool=[0,2,4].concat(n>=25?[6,8]:[],n>=45?[1]:[],n>=60?[10,9]:[]),count=Math.min(18,2+Math.floor(n/7));
  r.guards=r.guards.filter(function(t){return t.x!==g.x||t.y!==g.y||t.alien||t.guard339;});
  for(var i=0;i<count;i++){var k=pool[Math.floor(R()*pool.length)],u=U[k];if(!u||u.air)continue;var hp=u.hp*(1+lvl*.1);r.guards.push({id:500+i,kind:k,x:g.x+(R()-.5)*.6,y:g.y+(R()-.5)*.6,hp:hp,max:hp,cool:0,route:[]});}}
 return ok;
};
// Frame the whole bot base when a stage opens (larger late-game bases no longer start half off-screen).
function fitRaid393(){var r=E.raid;if(screen!=='raid'||!r||!r.campaign299||!r.buildings.length)return;
 var x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;r.buildings.forEach(function(b){if(b.type==='mine'||b.type==='reactor')return;var sx=(b.x-b.y)*tile,sy=(b.x+b.y)*tile*ISO412;x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy);});
 var top=58,bottom=96,w=Math.max(200,viewWidth-30),h=Math.max(120,viewHeight-top-bottom),bw=x1-x0+tile*2.4,bh=y1-y0+tile*2.6;
 zoom=Math.max(.62,Math.min(1,w/bw,h/bh));var cx=(x0+x1)/2,cy=(y0+y1)/2-tile*.5;
 panX=viewWidth/2-originX-cx*zoom;panY=top+h/2-originY-cy*zoom;drawNeeded=true;}
var scoutCam393=Game.scout;Game.scout=function(){var out=scoutCam393.apply(this,arguments);fitRaid393();setTimeout(fitRaid393,0);return out;};
