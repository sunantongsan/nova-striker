// 403: liquid resources, tall glass tanks, loot preview and NOVA loot rules.
// * Names (presentation only; save keys and server fields stay gold/power/crystals):
//   gold = แร่ Y (Ore Y, golden liquid), power = แร่ G (Ore G, green), crystals = แร่ R (Ore R, red).
// * Gold / energy / fluid storages are tall glass tanks whose liquid level shows how full they are
//   (home: own storage, raid: loot still available). Taller with every 4 levels.
// * Scouting shows the loot on offer and the NOVA a win would pay. NOVA can never be looted.
//   NOVA by HQ gap: target same or higher = full (bot 2, player 5 at 100%), 1-2 lower = 1, 3+ lower = 0.
//   A bot base already cleared with 3 stars pays resources only. The server applies the same rules.
// * Bot bases lose what is looted and refill over 24 hours, so farming one level runs dry.
var tankArt403=new Image();tankArt403.onload=function(){drawNeeded=true;};tankArt403.src='assets/tanks403.webp';
var TANK403={goldstore:0,powerstore:1,crystalstore:2},KIND403=['gold','power','crystals'];
function tankTier403(b){return Math.max(0,Math.min(4,Math.floor(((b.lv||1)-1)/4)));}
function storeFill403(kind){var cap=kind==='crystals'?E.crystalCapacity():E.resourceCapacity(kind),have=Number(E.d[kind])||0;return cap>0?Math.max(0,Math.min(1,have/cap)):0;}
function tankFill403(b){
 if(screen==='raid'&&E.raid){var r=E.raid;if(r.campaign299){var f=r.lootFrac403===undefined?1:r.lootFrac403;return b.type==='crystalstore'?0:f;}
  if(liveTarget){var key=b.type==='goldstore'?'loot_gold':b.type==='powerstore'?'loot_power':null,v=key?Number(liveTarget[key])||0:0;return v>0?Math.min(1,.25+v/400000):0;}
  return .7;}
 return storeFill403(KIND403[TANK403[b.type]]);
}
// one world unit of the 3D model = 0.335 x the building size, the same for every tier (the ball grows, the foot does not)
function tankK403(size){return size*.335/tankMeta403.unit;}
function drawTank403(b,p,size,col){
 var m=tankMeta403,t=tankTier403(b),tm=m.tiers[t],row=TANK403[b.type]*m.tiers.length+t,k=tankK403(size);
 ctx.drawImage(tankArt403,col*m.cw,row*m.ch,m.cw,m.ch,p.x-tm.ax*k,p.y+size*.06-tm.ay*k,m.cw*k,m.ch*k);
}
// Aircraft warning lamp on top of every tower: blinks red (0.6 s on / 0.6 s off), each tower slightly out of step.
var lampSeen403=0;
function tankLamp403(b,p,size){
 var m=tankMeta403,t=tankTier403(b),tm=m.tiers[t],L=tm.lamp;if(!L)return;lampSeen403=Date.now();
 var k=tankK403(size),x=p.x+(L[0]-tm.ax)*k,y=p.y+size*.06+(L[1]-tm.ay)*k,ph=((Date.now()+(b.x*37+b.y*53)*29)%1200)/1200;
 if(ph>.5)return;var a=Math.sin(ph/.5*Math.PI),r=size*.11;
 ctx.save();var g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(255,255,235,'+a+')');g.addColorStop(.25,'rgba(255,70,50,'+(.95*a)+')');g.addColorStop(1,'rgba(255,40,30,0)');
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.restore();
}
var evolved403=evolvedArt265;
evolvedArt265=function(b,p,size){
 if(TANK403[b.type]!==undefined&&tankArt403.complete&&tankArt403.naturalWidth){
  var col=Math.round(tankFill403(b)*(tankMeta403.fills.length-1));drawTank403(b,p,size,col);
  if(b.lv>1){var marks=(b.lv-1)%4+1;for(var i=0;i<marks;i++)disk(p.x+(i-(marks-1)/2)*5*zoom,p.y+size*.1,1.5*zoom,'#ffe391');}
  if(!b.constructing)tankLamp403(b,p,size);
  return true;}
 return evolved403(b,p,size);
};
var wreck403=drawWreck;
drawWreck=function(b,p,size,enemy){if(TANK403[b.type]!==undefined&&tankArt403.complete&&tankArt403.naturalWidth){drawTank403(b,p,size,tankMeta403.fills.length);return;}return wreck403(b,p,size,enemy);};

// ---------- names ----------
function spaced403(src,re,name){return src.replace(re,function(m,o,s){var a=s[o-1]||'',z=s[o+m.length]||'';return (/[ก-๎]/.test(a)?' ':'')+name+(/[ก-ฮ]/.test(z)?' ':'');});}
var KEEP403=/ปืนใหญ่พลังงาน|กับระเบิดพลังงาน|ระเบิดพลังงาน|แกนพลังงาน|รัศมีพลังงาน|ลูกพลังงาน|คลื่นพลังงาน|โล่พลังงาน|ลำแสงพลังงาน|สีทอง|ขอบทอง|ทองคำ|Energy Cannon|Energy Cores?|energy cores?|Energy Mine|energy wave|Energy Wave|energy beam|Energy Beam|Golden|golden/g;
var NAMES403=[[/โรงสังเคราะห์ผลึก/g,'โรงสกัดแร่ R'],[/คลังผลึก/g,'แท้งแร่ R'],[/คลังทอง/g,'แท้งแร่ Y'],[/ถังเก็บพลังงาน/g,'แท้งแร่ G'],[/เหมืองทอง/g,'เหมืองแร่ Y'],[/เครื่องสกัดพลังงาน/g,'เครื่องขุดแร่ G'],
 [/Crystal Synthesizer/g,'Ore R Extractor'],[/Crystal Storage/g,'Ore R Tank'],[/Gold Storage/g,'Ore Y Tank'],[/Energy Storage/g,'Ore G Tank'],[/Gold Mine/g,'Ore Y Mine'],[/Energy Extractor/g,'Ore G Drill'],
 [/\bCrystals\b/g,'Ore R'],[/\bcrystals\b/g,'Ore R'],[/\bCrystal\b/g,'Ore R'],[/\bcrystal\b/g,'Ore R'],[/\bGold\b/g,'Ore Y'],[/\bgold\b/g,'Ore Y'],[/\bEnergy\b/g,'Ore G'],[/\benergy\b/g,'Ore G']];
var TEST403=/ผลึก|พลังงาน|ทอง|[Cc]rystal|[Gg]old|[Ee]nergy/;
function rename403(text){
 if(typeof text!=='string'||!TEST403.test(text))return text;
 var kept=[];text=text.replace(KEEP403,function(m){kept.push(m);return '\u0001'+(kept.length-1)+'\u0002';});
 NAMES403.forEach(function(n){text=text.replace(n[0],n[1]);});
 text=spaced403(text,/ผลึก/g,'แร่ R');text=spaced403(text,/พลังงาน/g,'แร่ G');text=spaced403(text,/ทอง/g,'แร่ Y');
 return text.replace(/\u0001(\d+)\u0002/g,function(m,i){return kept[+i];});
}
function paint403(node){
 if(!node)return;
 if(node.nodeType===3){var p=node.parentNode;if(!p||/^(SCRIPT|STYLE|TEXTAREA|INPUT)$/.test(p.tagName))return;var t=rename403(node.nodeValue);if(t!==node.nodeValue)node.nodeValue=t;return;}
 if(node.nodeType!==1||/^(SCRIPT|STYLE|TEXTAREA)$/.test(node.tagName))return;
 ['aria-label','title','placeholder'].forEach(function(a){var v=node.getAttribute&&node.getAttribute(a);if(v){var t=rename403(v);if(t!==v)node.setAttribute(a,t);}});
 for(var c=node.firstChild;c;c=c.nextSibling)paint403(c);
}
if(root.document&&root.MutationObserver&&document.body){
 paint403(document.body);
 new MutationObserver(function(list){list.forEach(function(m){if(m.type==='characterData')paint403(m.target);else m.addedNodes.forEach(paint403);});}).observe(document.body,{childList:true,subtree:true,characterData:true});
}
if(root.CanvasRenderingContext2D){var fill403=CanvasRenderingContext2D.prototype.fillText,stroke403=CanvasRenderingContext2D.prototype.strokeText;
 CanvasRenderingContext2D.prototype.fillText=function(t){arguments[0]=rename403(t);return fill403.apply(this,arguments);};
 CanvasRenderingContext2D.prototype.strokeText=function(t){arguments[0]=rename403(t);return stroke403.apply(this,arguments);};}
resourceIcon238=function(k){var i={gold:0,power:1,crystals:2}[k];if(i===undefined)return '';return '<span class="fluid403" role="img" aria-label="'+rename403(resourceName233(k))+'" style="background-position:'+(i*50)+'% 50%"></span>';};

// ---------- NOVA rules ----------
function novaRate403(mine,target,full){mine=mine||1;target=target||1;return mine<=target?full:mine-target<=2?Math.min(1,full):0;}
function botFrac403(e,n){var v=(e.d.botLoot403||{})[n];if(!v)return 1;return Math.max(0,Math.min(1,(Number(v.f)||0)+(Date.now()-(Number(v.at)||0))/864e5));}
var scout403=Engine.prototype.scout;
Engine.prototype.scout=function(n){
 var ok=scout403.apply(this,arguments);var r=this.raid;
 if(ok&&r&&r.campaign299){r.lootFrac403=botFrac403(this,n);r.prior3_403=((this.d.stars||{})[n]||0)>=3;var full=novaRate403(this.hq(),baseTier393(n),2);r.nova403=r.prior3_403?0:full;r.novaWhy403=r.prior3_403?'stars':full<2?'low':'';}
 return ok;
};
var loot403=storageLoot299;
storageLoot299=function(r){var o=loot403(r),f=r&&r.lootFrac403;if(f!==undefined&&f<1)['gold','power'].forEach(function(k){o.total[k]=Math.floor(o.total[k]*f);o.taken[k]=Math.floor(o.taken[k]*f);});return o;};
// E.finish is an instance wrapper (live rooms, 200) that captured the prototype earlier, so wrap the instance
// (again after a cloud restore creates a new engine).
function wrapFinish403(e){if(!e||e.finish403)return;var finish403=e.finish;e.finish=function(){
 var r=this.raid;if(!r||!r.campaign299||r.result)return finish403.apply(this,arguments);
 var n=(this.d.campaignPending399||[]).length,res=finish403.apply(this,arguments),nova=r.nova403===undefined?2:r.nova403;
 if(res&&res.win399){res.gems=nova;res.win399.nova403=nova;var list=this.d.campaignPending399||[];if(list.length>n)list[list.length-1].nova403=nova;}
 else if(res&&res.gems===2&&nova<2){res.gems=nova;this.d.gems-=2-nova;}
 // drain what was taken from this bot base; it refills over 24 hours
 var f=r.lootFrac403===undefined?1:r.lootFrac403,raw=loot403(r),full=raw.total.gold+raw.total.power,took=(raw.taken.gold+raw.taken.power)*f;
 if(full>0&&took>0){var m=Object.assign({},this.d.botLoot403||{});m[r.stage]={f:Math.max(0,f-took/full),at:Date.now()};this.d.botLoot403=m;}
 this.save();return res;
};e.finish403=true;}
wrapFinish403(E);
// Bot win reports carry the expected NOVA so the server can only lower it (never raise).
camp399Send=function(mode,p){
 if(camp399Busy||warBusy||guest288||!root.NovaCloud||!root.NovaCloud.warRequest||!p||p.owner!==camp399Owner())return false;
 var id='camp399-'+(++camp399Serial);camp399Busy={id:id,mode:mode,p:p};clearTimeout(camp399Timer);
 camp399Timer=setTimeout(function(){if(camp399Busy&&camp399Busy.id===id){camp399Busy=null;camp399Showing=false;if(mode!=='win')toast(mt251('เชื่อมต่อไม่ได้ รางวัลยังบันทึกไว้ ลองใหม่','Connection timed out. Your reward is saved. Retry.'));}},25000);
 camp399Next=Date.now()+15000;
 var payload={campaign399:mode,owner:p.owner,id:p.id,stage:p.stage,stars:p.stars};if(mode==='claim')payload.completed=!!p.completed;if(mode==='win'&&p.nova403!==undefined)payload.nova403=p.nova403;
 try{root.NovaCloud.warRequest(mode==='prepare'?'test_status':'test_claim',JSON.stringify(payload),id);}catch(e){clearTimeout(camp399Timer);camp399Busy=null;return false;}
 return true;
};

// ---------- loot panel while scouting / attacking ----------
function lootInfo403(){
 var r=E.raid;if(screen!=='raid'||!r||r.result||r.liveMode==='defender'||r.practice)return null;
 if(r.campaign299){var o=storageLoot299(r);return {gold:Math.max(0,o.total.gold-o.taken.gold),power:Math.max(0,o.total.power-o.taken.power),nova:r.nova403===undefined?2:r.nova403,why:r.novaWhy403,full:2};}
 if(liveTarget){var nv=novaRate403(E.hq(),Number(liveTarget.tier)||1,5);return {gold:Number(liveTarget.loot_gold)||0,power:Number(liveTarget.loot_power)||0,nova:nv,why:nv<5?'low':'',full:5,player:true};}
 return null;
}
function lootHTML403(i){
 var why=i.why==='stars'?mt251('ฐานนี้ได้ 3 ดาวแล้ว','Already 3-starred'):i.why==='low'?mt251('ฐานเลเวลต่ำกว่าคุณ','Lower-level base'):'';
 return '<b>'+mt251('ปล้นได้','Available loot')+'</b>'
  +'<p>'+resourceIcon238('gold')+'<span>'+i.gold.toLocaleString()+'</span></p>'
  +'<p>'+resourceIcon238('power')+'<span>'+i.power.toLocaleString()+'</span></p>'
  +'<p class="nova403"><img src="assets/nova-core.webp" alt="NOVA"><span>'+(i.nova>0?'+'+i.nova:'0')+'</span><small>'+(i.player?mt251('เมื่อทำลาย 100%','at 100%'):mt251('เมื่อชนะ','on win'))+'</small></p>'
  +(why?'<em>'+why+'</em>':'')+'<i>'+mt251('ปล้น NOVA ไม่ได้','NOVA cannot be looted')+'</i>';
}
var lootLast403='';
function lootTick403(){
 var info=lootInfo403(),el=$('loot403');
 if(!info){if(el)el.hidden=true;return;}
 if(!el){el=document.createElement('aside');el.id='loot403';var f=$('field');if(!f)return;f.appendChild(el);}
 var html=lootHTML403(info);if(html!==lootLast403){el.innerHTML=html;lootLast403=html;}el.hidden=false;
}
if(root.setInterval)setInterval(function(){try{wrapFinish403(E);lootTick403();if(Date.now()-lampSeen403<1500)drawNeeded=true;}catch(e){}},100);
if(root.document){var css403=document.createElement('style');css403.textContent=
 '.fluid403{display:inline-block;width:20px;height:20px;vertical-align:middle;background:url(assets/fluids403.webp) 0 50%/300% 100% no-repeat;flex-shrink:0}'+
 '#loot403{position:absolute;left:max(8px,env(safe-area-inset-left,0px));top:calc(70px + env(safe-area-inset-top,0px));z-index:30;min-width:118px;padding:7px 10px 6px;border-radius:12px;background:rgba(18,30,66,.62);color:#fff;font:700 13px/1.25 Tahoma,Arial,sans-serif;text-shadow:0 1px 2px #000a;pointer-events:none}'+
 '#loot403 b{display:block;font-size:12px;color:#ffe48a;margin-bottom:3px}#loot403 p{display:flex;align-items:center;gap:6px;margin:2px 0}#loot403 p span{font-size:15px}'+
 '#loot403 .nova403 img{width:20px;height:20px;object-fit:contain}#loot403 .nova403 small{font-size:10px;opacity:.85}#loot403 em{display:block;font-style:normal;font-size:11px;color:#ffb3a8}#loot403 i{display:block;font-style:normal;font-size:10px;opacity:.7;margin-top:2px}';
 document.head.appendChild(css403);}
