// 400: HUD polish lives in the last stylesheet so it wins over earlier skins.
(function(){var style=document.createElement('style');style.id='hud400';style.textContent=hud400CSS;document.head.appendChild(style);})();
// 401: builder count moves out from under the base card into the resource readouts, so the
// shop badge below the card can be big.
(function(){var badge=$('builderBadge'),res=document.querySelector('#app>header .resources');if(badge&&res)res.appendChild(badge);})();
// 401: until a real banner ad fills the top-right slot, show our own Nova Striker banner there
// (game art + logo). It only appears inside the Android app, where the slot exists, and steps
// aside the moment the native banner is shown (data-nova-banner39).
(function(){
 var root=document.documentElement,house=document.createElement('div');
 house.id='houseBanner401';house.setAttribute('aria-hidden','true');house.hidden=true;
 house.innerHTML='<b class="hb401-logo">NOVA<span>STRIKER</span></b>';
 document.body.appendChild(house);
 function shown(id){var el=document.getElementById(id);if(!el||el.hidden)return false;var s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&el.getClientRects().length>0;}
 function update(){
  var app=$('app'),cs=getComputedStyle(root),safe=parseFloat(cs.getPropertyValue('--safe-right303'))||0,left=parseFloat(cs.getPropertyValue('--safe-left303'))||0;
  var blocked=['welcome','boot','baseNameGate','modal','nova-admin293','moveControls','selection','guideDock288'].some(shown);
  var on=!!window.NovaAds&&!!app&&innerWidth-safe-left>=660&&innerHeight>=280&&app.dataset.battle300!=='true'&&!blocked&&!document.hidden&&!root.hasAttribute('data-nova-banner39');
  if(root.hasAttribute('data-nova-house401')!==on)root.toggleAttribute('data-nova-house401',on);
  if(house.hidden===on)house.hidden=!on;
 }
 setInterval(update,700);addEventListener('resize',update);document.addEventListener('visibilitychange',update);update();
})();
