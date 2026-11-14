// 400: HUD polish lives in the last stylesheet so it wins over earlier skins.
(function(){
 var style=document.createElement('style');style.id='hud400';style.textContent=hud400CSS;document.head.appendChild(style);
 var badge=$('builderBadge'),calendar=$('dailyCheckin340'),dock=$('homebar');
 if(badge&&dock){
  if(calendar&&calendar.parentNode===dock)dock.insertBefore(badge,calendar);else dock.appendChild(badge);
  badge.title=mt251('ช่างว่าง / ช่างทั้งหมด','Available builders / total builders');
  badge.setAttribute('aria-label',badge.title);
 }
 var shop=$('skillShop342');
 if(shop&&!shop.querySelector('.shopLabel401')){
  var label=document.createElement('span');label.className='shopLabel401';label.textContent=mt251('ร้านค้า','Shop');shop.appendChild(label);
 }
})();

