// 408: scouting a real player shows the loot on offer (like a bot base), no health bars while scouting,
// and the HUD sits at the screen edges.
(function(){var s=document.createElement('style');s.id='scout408';s.textContent=scout408CSS;document.head.appendChild(s);})();
// A live player preview is built by scoutPlayer, which marks the raid as practice; the 403 loot panel skipped it.
lootInfo403=function(){
 var r=E.raid;if(screen!=='raid'||!r||r.result||r.liveMode==='defender')return null;
 if(r.campaign299){var o=storageLoot299(r);return {gold:Math.max(0,o.total.gold-o.taken.gold),power:Math.max(0,o.total.power-o.taken.power),nova:r.nova403===undefined?2:r.nova403,why:r.novaWhy403,full:2};}
 if(liveTarget&&(r.liveMode==='preview'||r.liveMode==='attacker'||!r.practice)){var nv=novaRate403(E.hq(),Number(liveTarget.tier)||1,5);return {gold:Math.max(0,Number(liveTarget.loot_gold)||0),power:Math.max(0,Number(liveTarget.loot_power)||0),nova:nv,why:nv<5?'low':'',full:5,player:true};}
 return null;
};
// Scouting = looking at a base before any troop lands (bot search or player search).
function scouting408(){var r=E.raid;return screen==='raid'&&!!r&&!r.result&&(r.liveMode==='preview'||!r.liveMode&&r.phase==='scout'&&!r.deployed);}
// Every health bar in the game is two box() calls with these colours (background + fill).
var BAR408={'#263745':1,'#a4ee69':1,'#152d42':1,'#6df4cc':1,'#24384c':1,'#a0ee94':1,'#f492e8':1,'#15324c':1,'#ffda69':1,'#173a4f':1,'#69edbc':1,'#183549':1,'#78dc9a':1};
var box408=box;
box=function(x,y,w,h,c){if(typeof c==='string'&&BAR408[c]===1&&scouting408())return;return box408.apply(this,arguments);};
(function(){var root=document.documentElement,last='';
 setInterval(function(){var r=E.raid,v=screen==='raid'&&r&&r.liveMode==='preview'&&liveTarget?'player':'';
  if(v!==last){last=v;if(v)root.setAttribute('data-scout408',v);else root.removeAttribute('data-scout408');}},200);})();
