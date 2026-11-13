const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync(process.argv[2]||'features/titan342/ui.js','utf8');let html='',previews=[];
const c={titanPay357:false,titanSend342(){},titanState342:{level:0,gold:0,power:0,skills:{},ads:{}},titanShopOnly342:false,titanBusy342:null,root:{},E:{d:{gems:100},hq:()=>10},Game:{titanPreview342:n=>previews.push(n)},Titan342:{names:['ATLAS','VANGUARD','TITAN'],skills:{slash:{level:1,name:'slash',en:'slash'},shield:{level:2,name:'shield',en:'shield'},nova:{level:3,name:'nova',en:'nova'}}},mt251:(a,b)=>b,modal:{querySelector:()=>({scrollTop:0}),setAttribute(){}},open:h=>html=h,duration:n=>String(n)};
vm.createContext(c);vm.runInContext(src.slice(src.indexOf('function art345('),src.indexOf('var previewMech342')),c);
c.titanPanel342();assert(html.includes("titanAction342('order')"));assert(!html.includes('Contribute'));assert(!html.includes('VANGUARD'));
Object.assign(c.titanState342,{ordered345:true,gold:1700000,power:1700000,remaining_nova345:1660,remaining_ads345:9});c.titanPanel342();assert.equal((html.match(/class="action345"/g)||[]).length,3);assert(html.includes('1,660'));assert(html.includes('9 videos'));assert(html.includes("titanAction342('wait')"));
Object.assign(c.titanState342,{finishes_at:new Date(Date.now()+259200000).toISOString(),speed_nova345:25920,speed_ads345:10});c.titanPanel342();assert(html.includes('10 videos'));assert(html.includes('Game.close()'));
Object.assign(c.titanState342,{level:1,finishes_at:null});c.titanPanel342();assert(html.includes('ATLAS')&&!html.includes('VANGUARD'));assert.equal(previews.at(-1),1);
c.titanShopOnly342=true;c.shopTab348="skills";c.titanPanel342();assert(html.includes('slash'));assert(!html.includes("titanAction342('skill','shield')"));assert(!html.includes("titanAd342('skill:shield')"));assert(!html.includes('Game.shieldShop()'));assert(html.includes('art345'));c.shopTab348='support';c.titanPanel342();assert(html.includes('Game.shieldShop()'));
console.log('PASS guardian UI: one-click order, three payment/wait choices, server quotes, illustrated skills and hidden future forms');



c.titanShopOnly342=false;Object.assign(c.titanState342,{level:1,upgrading355:true,upgrade_level355:2,upgrade_until355:new Date(Date.now()+259200000).toISOString(),upgrade_nova355:25920});c.titanPanel342();assert(html.includes('upgradeCountdown355'));assert(html.includes("titanAction342('speed')"));assert(html.includes("titanAd342('speed')"));assert(!html.includes("titanAction342('upgrade')"));assert(html.includes('8m 20s'));console.log('PASS upgrade countdown and quoted paid/video speed, no duplicate upgrade button');
c.titanShopOnly342=false;Object.assign(c.titanState342,{level:1,upgrading355:false,resting347:false});c.titanPanel342();assert(html.includes('Status: Ready'));assert(html.includes('titanUpgrade357'));assert(!html.includes('3 days per level'));assert(!html.includes('2,500 NOVA'));assert(html.includes('titanControl356'));
Object.assign(c.titanState342,{resting347:true,recovery_until347:new Date(Date.now()+900000).toISOString(),heal_nova348:90,heal_ads348:2});c.titanPanel342();assert(html.includes('Not ready · Recovering'));assert(html.includes("titanAction342('heal')"));assert(html.includes("titanAd342('heal')"));assert(!html.includes('titanControl356'));
console.log('PASS ready/recovering status button, visible upgrade label and paid/video recovery controls');

Object.assign(c.titanState342,{level:2,resting347:false,upgrading355:false,ads:{upgrade:37}});c.E.d.gems=9999;c.Game.titanUpgrade357();assert(html.includes('10,000'));assert(html.includes('163 videos'));assert(html.includes('short357'));assert(/short357" disabled/.test(html));assert(!html.includes('3 days'));
c.E.d.gems=10000;c.titanPanel342();assert(html.includes('enough357'));assert(!/enough357" disabled/.test(html));assert(html.includes("titanAction342('upgrade')"));assert(html.includes("titanAd342('upgrade')"));
c.titanBusy342={id:'pending'};c.titanPanel342();assert(/enough357" disabled/.test(html));c.titanBusy342=null;c.titanState342.upgrading355=true;c.titanPanel342();assert(!html.includes('pay357'));assert(html.includes('upgradeCountdown355'));
console.log('PASS compact upgrade opener, priced NOVA choice, balance colors/disabled state, remaining ADS count, pending request and automatic timer transition');
