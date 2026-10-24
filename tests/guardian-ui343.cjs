const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync(process.argv[2]||'features/titan342/ui.js','utf8');let html='',previews=[];
const c={titanState342:{level:0,gold:0,power:0,skills:{},ads:{}},titanShopOnly342:false,titanBusy342:null,root:{},E:{d:{gems:100},hq:()=>10},Game:{titanPreview342:n=>previews.push(n)},Titan342:{names:['ATLAS','VANGUARD','TITAN'],skills:{slash:{level:1,name:'slash',en:'slash'},shield:{level:2,name:'shield',en:'shield'},nova:{level:3,name:'nova',en:'nova'}}},mt251:(a,b)=>b,modal:{querySelector:()=>({scrollTop:0}),setAttribute(){}},open:h=>html=h,duration:n=>String(n)};
vm.createContext(c);vm.runInContext(src.slice(src.indexOf('function art345('),src.indexOf('var previewMech342')),c);
c.titanPanel342();assert(html.includes("titanAction342('order')"));assert(!html.includes('Contribute'));assert(!html.includes('VANGUARD'));
Object.assign(c.titanState342,{ordered345:true,gold:1700000,power:1700000,remaining_nova345:1660,remaining_ads345:9});c.titanPanel342();assert.equal((html.match(/class="action345"/g)||[]).length,3);assert(html.includes('1,660'));assert(html.includes('9 videos'));assert(html.includes("titanAction342('wait')"));
Object.assign(c.titanState342,{finishes_at:new Date(Date.now()+259200000).toISOString(),speed_nova345:25920,speed_ads345:10});c.titanPanel342();assert(html.includes('10 videos'));assert(html.includes('Game.close()'));
Object.assign(c.titanState342,{level:1,finishes_at:null});c.titanPanel342();assert(html.includes('ATLAS')&&!html.includes('VANGUARD'));assert.equal(previews.at(-1),1);
c.titanShopOnly342=true;c.shopTab348="skills";c.titanPanel342();assert(html.includes('slash'));assert(!html.includes('shield'));assert(html.includes('art345'));
console.log('PASS guardian UI: one-click order, three payment/wait choices, server quotes, illustrated skills and hidden future forms');

