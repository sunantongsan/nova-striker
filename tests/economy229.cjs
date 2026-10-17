const assert=require('assert');require('../game.js');let now=1e6;const e=new NovaRTS.Engine({getItem:()=>null,setItem(){}},()=>now);
const b=e.d.buildings[0];b.until=now+1800000;assert.equal(e.speedCost(b.id),15);b.until++;assert.equal(e.speedCost(b.id),16);b.until=now+1;assert.equal(e.speedCost(b.id),1);
e.d.gold=0;assert.equal(e.rewardQuote229('gold',false).amount,1080);assert.equal(e.rewardQuote229('gold',true).amount,1296);assert.equal(e.rewardQuote229('crystals',false).amount,0);
e.d.buildings.push({id:99,type:'mine',lv:3,constructing:true,until:now+9999});assert.equal(e.rewardQuote229('gold',false).amount,1080);
e.d.gold=e.resourceCapacity('gold')-10;assert.equal(e.rewardQuote229('gold',false).amount,10);e.d.gold+=100;assert.equal(e.rewardQuote229('gold',false).amount,0);assert.equal(e.rewardQuote229('invalid',true),null);
e.d.buildings.push({id:100,type:'crystalplant',lv:2});e.d.crystals=0;assert.equal(e.rewardQuote229('crystals',false).amount,600);assert.equal(e.rewardQuote229('crystals',true).amount,720);
console.log('PASS economy229: 30min=15 gems, rounding boundaries, 20% resource preview, construction exclusion and storage caps');
