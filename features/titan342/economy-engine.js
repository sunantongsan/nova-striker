// Expanded stores preserve existing balances and passive production rates.
B.goldstore.cap=4;B.powerstore.cap=4;
function storeCapacity358(lv){return Math.max(20000*lv,10000*lv*lv);}
Engine.prototype.resourceCapacity=function(kind){return 50000+10000*(this.hq()-1)+this.d.buildings.filter(function(b){return active(b)&&(b.type==='storage'||b.type===(kind==='power'?'powerstore':'goldstore'));}).reduce(function(n,b){return n+(b.type==='storage'?20000*b.lv:storeCapacity358(b.lv));},0);};
// Early bases pay 3x; HQ 10 pays 25x; HQ 20 pays 100x the old energy costs.
U.forEach(function(u){u.baseCost358=u.cost;});
function refreshTraining358(engine){var factor=Math.max(3,Math.ceil(engine.hq()*engine.hq()/4));U.forEach(function(u){u.cost=u.baseCost358*factor;});}
var syncEconomy358=Engine.prototype.sync;
Engine.prototype.sync=function(){var result=syncEconomy358.apply(this,arguments);refreshTraining358(this);return result;};

