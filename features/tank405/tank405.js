// 405: storage tanks change with every level (20 tiers, see features/render3d/tank405) and grow with
// capacity. The atlas holds an empty and a full picture per tier; the liquid level is drawn by
// overlaying the full picture below the liquid line, so the fill is continuous instead of 6 steps.
tankMeta405.fills=[0,1];tankMeta403=tankMeta405;
tankArt403.src='assets/tanks405.webp';
tankTier403=function(b){return Math.max(0,Math.min(tankMeta405.tiers.length-1,(Number(b.lv)||1)-1));};
function tankBlit405(b,t,fill,wreck,x,y,k){
 var m=tankMeta405,tm=m.tiers[wreck?0:t],row=TANK403[b.type],cw=m.cw,ch=m.ch,dx=x-tm.ax*k,dy=y-tm.ay*k;
 if(wreck){ctx.drawImage(tankArt403,2*m.tiers.length*cw,row*ch,cw,ch,dx,dy,cw*k,ch*k);return;}
 ctx.drawImage(tankArt403,2*t*cw,row*ch,cw,ch,dx,dy,cw*k,ch*k);
 var f=Math.max(0,Math.min(1,fill));if(f<=.001)return;
 var line=Math.max(0,Math.floor(tm.l0+(tm.l1-tm.l0)*f));
 ctx.drawImage(tankArt403,(2*t+1)*cw,row*ch+line,cw,ch-line,dx,dy+line*k,cw*k,(ch-line)*k);
}
drawTank403=function(b,p,size,col){
 var wreck=col>=tankMeta405.fills.length;
 tankBlit405(b,tankTier403(b),wreck?0:tankFill403(b),wreck,p.x,p.y+size*.06,tankK403(size));
};
// Upgrade window: draw both levels at one shared scale on a tall canvas so the growth shows.
var preview405=buildingPreview265,previewCache405={};
buildingPreview265=function(b,compare){
 if(TANK403[b.type]===undefined||!document.createElement||!tankArt403.complete||!tankArt403.naturalWidth)return preview405.apply(this,arguments);
 var m=tankMeta405,lv=b.lv||1,next=Math.min(20,lv+1),big=m.tiers[Math.min(m.tiers.length-1,next-1)],H=200,W=120,k=(H-8)/(big.ay-big.top+2),fill=1;
 function pic(level){
  var key=b.type+':'+level+':'+next;
  if(!previewCache405[key]){var c=document.createElement('canvas');c.width=W;c.height=H;var old=ctx;
   try{ctx=c.getContext('2d');tankBlit405({type:b.type},Math.max(0,Math.min(m.tiers.length-1,level-1)),fill,false,W/2,H-4,k);previewCache405[key]=c.toDataURL('image/png');}finally{ctx=old;}}
  return '<figure class="tankFig405"><img src="'+previewCache405[key]+'" alt="'+escapeHTML(B[b.type].name)+' Lv.'+level+'"><figcaption>Lv.'+level+'</figcaption></figure>';
 }
 return '<div class="tankPair405">'+pic(lv)+(compare===false||next===lv?'':'<span>→</span>'+pic(next))+'</div>';
};
// Compact upgrade / info windows: picture on the left, numbers and the button on the right, one screen.
(function(){
 var st=document.createElement('style');st.id='up405';st.textContent=[
  '.tankPair405{display:flex;align-items:flex-end;justify-content:center;gap:4px}',
  '.tankFig405{margin:0;text-align:center}.tankFig405 img{display:block;height:min(150px,30vh);width:auto}.tankFig405 figcaption{font-size:11px;font-weight:700}',
  '#modal section.up405 .preview361{margin:0!important;padding:4px!important;min-height:0!important}',
  '#modal section.up405 .preview361 img{max-height:min(110px,24vh)!important;width:auto!important;max-width:110px!important}',
  '#modal section.up405 .preview361 .tankFig405 img{max-height:min(150px,34vh)!important;max-width:none!important}',
  '#modal section.up405 .upgradeRows361{margin:2px 0!important}#modal section.up405 .upgradeRows361 td{padding:4px 4px!important}',
  '#modal section.up405 .cost261{margin:4px 0!important;padding:4px!important}#modal section.up405>p{margin:2px 0!important;font-size:11px}',
  '#modal section.up405>button.wide{margin-top:4px!important;min-height:40px!important}',
  '@media (orientation:landscape){#modal section.up405{display:grid!important;grid-template-columns:minmax(150px,36%) 1fr;column-gap:12px;align-items:center}',
  ' #modal section.up405>.preview361{grid-column:1;grid-row:1 / span 8;align-self:stretch;display:flex;align-items:center;justify-content:center}',
  ' #modal section.up405>:not(.preview361){grid-column:2}}'
 ].join('\n');document.head.appendChild(st);
 function tag(){Array.prototype.forEach.call(modal.querySelectorAll('section'),function(s){var has=!!s.querySelector(':scope>.preview361');if(has!==s.classList.contains('up405'))s.classList.toggle('up405',has);});}
 new MutationObserver(tag).observe(modal,{childList:true,subtree:true});tag();
})();
