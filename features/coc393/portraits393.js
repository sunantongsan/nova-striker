// 393: troop cards use portraits rendered from the same 3D models as the battlefield
// (assets/portraits393.webp from features/render3d/render-portraits.cjs; kind k at col k%4, row k/4).
function unitPortrait393(k,cls){if(!(k>=0&&k<=10))return cardSprite(U[k]&&U[k].sprite);return '<span class="'+(cls||'icon')+' portrait393" style="background-position:'+(k%4*100/3)+'% '+(Math.floor(k/4)*50)+'%"></span>';}
portrait278=function(i){return unitPortrait393(i,'art278');};
