// 400: HUD polish lives in the last stylesheet so it wins over earlier skins.
(function(){var style=document.createElement('style');style.id='hud400';style.textContent=hud400CSS;document.head.appendChild(style);})();
// 401: builder count moves out from under the base card into the resource readouts, so the
// shop badge below the card can be big.
(function(){var badge=$('builderBadge'),res=document.querySelector('#app>header .resources');if(badge&&res)res.appendChild(badge);})();
