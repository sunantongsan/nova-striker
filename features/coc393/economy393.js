// 393: affordable upgrades. Every build/upgrade price is capped at 70% of what a base can hold
// with two dedicated stores and one shared supply depot at the level before the target
// (previously four dedicated + two shared stores fully upgraded were needed). Times are unchanged.
function storageFor393(lv){lv=Math.max(1,Math.min(20,lv));return 50000+10000*(lv-1)+2*Math.max(20000*lv,10000*lv*lv)+20000*lv;}
function priceCap393(target){var v=storageFor393(Math.max(1,target-1))*.7;return v>=100000?Math.floor(v/10000)*10000:Math.floor(v/1000)*1000;}
var quote393=progressionQuote369;
progressionQuote369=function(type,target){var q=quote393(type,target);if(!q)return q;var cap=priceCap393(target);q.gold=Math.min(q.gold,cap);q.power=Math.min(q.power,cap);return q;};
var upgradeCost393=Engine.prototype.upgradeCost;
Engine.prototype.upgradeCost=function(b){var c=upgradeCost393.call(this,b),cap=priceCap393((b.lv||1)+1);return Object.assign({},c,{gold:Math.min(c.gold,cap),power:Math.min(c.power,cap)});};
Object.keys(B).forEach(function(type){var q=progressionQuote369(type,1);if(q&&type!=='hq'){B[type].cost=q.gold;B[type].power=q.power;}});
