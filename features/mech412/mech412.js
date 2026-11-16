// 412: NOVA mech window on one screen. The status moves into the title bar next to the NOVA balance, the
// "control mech" button is gone (tapping the mech on the map already gives its controls), the preview sits on the
// left and the other mech menus are small buttons on the right. Built from the existing window's own pieces.
function mechStatus412(btn){var t=(btn.getAttribute('aria-label')||btn.textContent||'').replace(/^.*?:\s*/,'');var ok=/#8ff0bf/i.test(btn.getAttribute('style')||'');return '<span class="mst412 '+(ok?'ok412':'wait412')+'">'+(ok?'● ':'◌ ')+t+'</span>';}
function compactMech412(){
 var sheet=modal.querySelector('.sheet'),sec=sheet&&sheet.querySelector('section.titanShop342');if(!sec||sec.dataset.m412||sec.closest('.store348')||sec.querySelector('.storeGrid348'))return;
 sec.dataset.m412='1';sheet.classList.add('mech412sheet');
 var h2=sheet.querySelector('.novaHead360 h2')||sec.querySelector('h2'),status=sec.querySelector('button[onclick="Game.titan342()"]');
 if(h2){var tag=el412('span','mtag412');tag.innerHTML=(status?mechStatus412(status):'')+'<span class="bal412"><i class="nova412" aria-hidden="true"></i><b>'+(E.d.gems||0).toLocaleString()+'</b></span>';h2.appendChild(tag);}
 if(status)status.remove();
 Array.prototype.forEach.call(sec.querySelectorAll('button[onclick*="titanControl356"]'),function(b){b.remove();});
 var own=sec.querySelector('h2');if(own&&own!==h2)own.remove();
 var canvas=sec.querySelector('#titanPreview342');
 if(!canvas){sec.classList.add('mechplain412');return;}
 var left=el412('div','left412'),right=el412('div','right412'),rank=sec.querySelector('.guardianRank343');
 left.appendChild(canvas);if(rank)left.appendChild(rank);
 // the remaining parts go to the right; single-button action rows merge into one row of small buttons
 var row=el412('div','mbtns412');
 Array.prototype.slice.call(sec.children).forEach(function(n){if(n===left||n===right)return;
  if(n.classList.contains('actions345')&&n.children.length===1&&!n.closest('.recovery348')){row.appendChild(n.firstElementChild);n.remove();return;}
  right.appendChild(n);});
 if(row.children.length)right.insertBefore(row,right.firstChild);
 sec.appendChild(left);sec.appendChild(right);sec.classList.add('mech412');}
var titanPanel412=titanPanel342;
titanPanel342=function(){var out=titanPanel412.apply(this,arguments);try{compactMech412();}catch(e){}return out;};
var hudMech412=hud;hud=function(){var r=hudMech412.apply(this,arguments);var b=modal.querySelector('.mtag412 .bal412 b');if(b){var t=(E.d.gems||0).toLocaleString();if(b.textContent!==t)b.textContent=t;}return r;};
(function(){var st=document.createElement('style');st.id='mech412';var M='#modal#modal[data-nova360] .mech412sheet';st.textContent=
 M+'.mech412sheet{width:min(600px,96vw)!important;height:auto!important;min-height:0!important}'+
 M+' .novaHead360 h2{display:flex;align-items:center;gap:8px;flex:1;min-width:0;flex-wrap:nowrap}'+
 M+' .mtag412{display:flex;align-items:center;gap:6px;margin-left:auto;margin-right:8px;font-family:inherit;text-shadow:none}'+
 M+' .mst412{padding:3px 9px;border-radius:999px;font-size:13px;font-weight:800;white-space:nowrap;color:#fff}'+M+' .ok412{background:#2f9e55}'+M+' .wait412{background:#c9861c}'+
 M+' .bal412{display:inline-flex;align-items:center;gap:4px;padding:3px 9px 3px 4px;border-radius:999px;background:rgba(10,40,70,.35);color:#fff;font-weight:800;font-size:14px;white-space:nowrap}'+
 M+' .nova412{display:inline-block;width:18px;height:18px;background:url(assets/nova-core.webp) center/contain no-repeat}'+
 M+' .novaContent360{overflow-y:auto!important;padding:8px 10px!important}'+
 M+' .mech412{display:grid!important;grid-template-columns:minmax(0,46%) minmax(0,1fr)!important;grid-template-rows:auto!important;grid-template-areas:none!important;gap:10px;align-items:start}'+
 M+' .left412{display:flex;flex-direction:column;align-items:center;grid-column:1!important;grid-row:1!important;min-width:0}'+M+' .left412 canvas{width:100%!important;height:auto!important;max-height:min(62dvh,320px);object-fit:contain}'+
 M+' .left412 .guardianRank343{margin:2px 0 0;font-size:13px}'+
 M+' .right412{display:flex;flex-direction:column;gap:7px;min-width:0;grid-column:2!important;grid-row:1!important}'+
 M+' .mbtns412{display:grid;grid-template-columns:repeat(auto-fit,minmax(70px,1fr));gap:6px}'+
 M+' .mbtns412 .action345{margin:0!important;min-height:0!important;height:auto!important;padding:5px 4px!important;display:flex;flex-direction:column;align-items:center;gap:1px;border-radius:12px}'+
 M+' .mbtns412 .art345{width:30px!important;height:30px!important}'+M+' .mbtns412 b{font-size:12px!important}'+
 M+' .titanZ410{margin:0!important;padding:6px 8px!important}'+M+' .titanZ410 b{font-size:13px}'+M+' .titanZ410 p{font-size:12px;margin:2px 0}'+
 M+' .titanZ410 button{margin:2px 0 0!important;min-height:34px;padding:4px 6px!important;font-size:13px!important}'+
 M+' .right412 .actions345{display:flex;gap:6px;flex-wrap:wrap}'+M+' .right412 .actions345 .action345{flex:1 1 70px;margin:0!important;padding:5px 4px!important;min-height:0!important}'+
 M+' .right412 .recovery348,'+M+' .right412 .guardianStatus345{font-size:12px;margin:0}'+
 '@media (orientation:portrait){'+M+' .mech412{grid-template-columns:minmax(0,42%) minmax(0,1fr)}}';
 document.head.appendChild(st);})();

// ---------- tapping the mech at home: control on the left, a small "manage" button on the right ----------
function mechTapHide412(){var bar=$('mechTap412');if(bar)bar.hidden=true;}
function mechTap412(t){if(!t||t.resting347||t.building348){Game.titan342();return;}
 selected=null;try{hud();}catch(e){}
 var bar=$('mechTap412');if(!bar){bar=document.createElement('div');bar.id='mechTap412';bar.innerHTML='<button class="go412" onclick="Game.mechTapControl412()">🎮 '+mt251('บังคับหุ่น','Control mech')+'</button><button class="mini412" onclick="Game.mechTapManage412()">⚙ '+mt251('จัดการหุ่น','Manage mech')+'</button>';document.body.appendChild(bar);}
 bar.hidden=false;bar.dataset.at=Date.now();}
Game.mechTapControl412=function(){mechTapHide412();Game.titanControl356();};
Game.mechTapManage412=function(){mechTapHide412();Game.titan342();};
// any other tap on the map closes the bar
canvas.addEventListener('pointerdown',function(){var bar=$('mechTap412');if(bar&&!bar.hidden&&Date.now()-(+bar.dataset.at||0)>250)mechTapHide412();},true);
var tickMechTap412=tickUI342;tickUI342=function(dt){tickMechTap412(dt);var bar=$('mechTap412');if(bar&&!bar.hidden&&(screen!=='home'||modal.style.display==='flex'||selectedTitan342))mechTapHide412();};

// ---------- the mech stays where you leave it ----------
function mechSave412(t){if(!t||!Number.isFinite(t.x)||!Number.isFinite(t.y))return;var p=E.d.titanHome412;if(p&&Math.abs(p.x-t.x)<.05&&Math.abs(p.y-t.y)<.05)return;E.d.titanHome412={x:+t.x.toFixed(2),y:+t.y.toFixed(2)};E.save();}
var homeTitan412=homeTitan342,lastMech412=null,savedAt412=0;
homeTitan342=function(){var t=homeTitan412.apply(this,arguments);
 if(t&&t!==lastMech412){lastMech412=t;var p=E.d.titanHome412,m=typeof homeMap391==='function'?homeMap391():20;if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.y>=0&&p.x<m&&p.y<m){t.x=p.x;t.y=p.y;}}
 if(t&&t.manual342&&Date.now()-savedAt412>1500){savedAt412=Date.now();mechSave412(t);}
 return t;};
var selectMech412=selectTitan342;
selectTitan342=function(t){var prev=selectedTitan342;var r=selectMech412.apply(this,arguments);if(prev&&prev!==selectedTitan342&&screen==='home'&&prev===lastMech412)mechSave412(prev);return r;};
(function(){var st=document.createElement('style');st.id='mechTapCss412';st.textContent=
 '#mechTap412{position:fixed;left:50%;bottom:calc(92px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:60;display:flex;align-items:center;gap:8px;padding:6px;border-radius:16px;background:rgba(12,36,60,.55);box-shadow:0 4px 14px rgba(0,0,0,.25)}'+
 '#mechTap412[hidden]{display:none}'+
 '#mechTap412 .go412{min-width:150px;min-height:48px;padding:6px 16px;border-radius:13px;border:2px solid #2f7a2a;background:linear-gradient(#a6ec6b,#4fb43a);color:#173b0d;font:800 16px/1.1 inherit;box-shadow:0 3px 0 #2f7a2a}'+
 '#mechTap412 .mini412{min-height:36px;padding:4px 10px;border-radius:11px;border:1px solid #9ec3e6;background:linear-gradient(#f3f9ff,#dcecfb);color:#1d3d5c;font:700 12.5px/1.1 inherit;box-shadow:0 2px 0 #9ec3e6}';
 document.head.appendChild(st);})();
