// 404: compact resource numbers + cartoon digit font, shorter house banner, smaller shop cart that
// hides while searching for an opponent and during any battle.
(function(){var style=document.createElement('style');style.id='hud404';style.textContent=hud404CSS;document.head.appendChild(style);})();
(function(){
 function short(n){var a=Math.abs(n);if(a<10000)return n.toLocaleString('en-US');if(a<1e6)return (Math.floor(n/100)/10).toString().replace(/\.0$/,'')+'K';if(a<1e9)return (Math.floor(n/1e5)/10).toString().replace(/\.0$/,'')+'M';return (Math.floor(n/1e8)/10).toString().replace(/\.0$/,'')+'B';}
 function parse(s){var m=String(s).trim().match(/^([\d.,]+)\s*([KMB]?)$/i);if(!m)return null;var v=parseFloat(m[1].replace(/,/g,''));if(!isFinite(v))return null;return v*({k:1e3,m:1e6,b:1e9}[m[2].toLowerCase()]||1);}
 function compact(el){var t=el.textContent,parts=t.split('/'),out=[];
  for(var i=0;i<parts.length;i++){var v=parse(parts[i]);if(v===null)return;out.push(short(Math.floor(v)));}
  var next=out.join('/');if(next!==t)el.textContent=next;}
 ['gold','energy','gems','army'].forEach(function(id){var el=$(id);if(!el)return;compact(el);new MutationObserver(function(){compact(el);}).observe(el,{childList:true,characterData:true,subtree:true});});
})();
(function(){
 var root=document.documentElement;
 function searching(){var m=$('modal');if(!m||!m.firstChild||getComputedStyle(m).display==='none')return false;
  if(m.querySelector('.hub395'))return true;var h=m.querySelector('h2');var t=h?h.textContent:'';
  return /กำลังค้นหา|Finding (opponent|base)/.test(t);}
 function update(){var app=$('app'),hide=!!app&&(app.dataset.battle300==='true'||screen!=='home'||searching());
  if(root.hasAttribute('data-nova-noshop404')!==hide)root.toggleAttribute('data-nova-noshop404',hide);}
 var m=$('modal');if(m)new MutationObserver(update).observe(m,{childList:true,subtree:false,attributes:true,attributeFilter:['style','class','hidden']});
 var a=$('app');if(a)new MutationObserver(update).observe(a,{attributes:true,attributeFilter:['data-battle300']});
 setInterval(update,400);update();
})();
