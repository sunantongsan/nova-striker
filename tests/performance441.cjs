const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(process.env.PERF_SOURCE||'features/perf437/perf437.js','utf8');
function atlas(){
 let allocations=0,blits=0,scale=1;class Image{constructor(){this.complete=true;this.naturalWidth=4096;this.naturalHeight=2048;}}
 const g={drawImage(){},getImageData(){throw Error('atlas must not read pixels')}};
 const s={Math,WeakMap,frame:0,HTMLImageElement:Image,ctx:{drawImage(){blits++;},getTransform:()=>({a:scale,b:0})},renderScale226:()=>1,document:{createElement(){allocations++;return{getContext:()=>g}}}};
 vm.createContext(s);vm.runInContext(source.slice(source.indexOf('(function(){\n if(!ctx||!ctx.drawImage'),source.indexOf('// ---------- 437i:')>=0?source.indexOf('// ---------- 437i:'):source.indexOf('// ---------- 441:')),s);
 const img=new Image();
 function run(){for(let i=0;i<120;i++){s.frame++;for(const size of [100,210,390]){scale=1+(i%5)*.01;s.ctx.drawImage(img,0,0,1000,1000,0,0,size,size);}}}
 run();const warm=allocations;run();console.log('Atlas canvases: warm-up='+warm+', next 120 mixed-size frames='+(allocations-warm));
 assert.equal(allocations,warm,'mixed sizes and recoil must not rebuild image sheets after warm-up');assert.equal(blits,720);
}
atlas();
{
 let builds=0,last;const s={Math,ctx:{drawImage(...v){last=v}},buildingStructure265(){builds++},renderScale226:()=>2,document:{createElement:()=>({getContext:()=>({setTransform(){}})})},crop437:(c,scale,w,h,ox,oy)=>({c,w,h,ox,oy})};vm.createContext(s);vm.runInContext(source.slice(source.indexOf('var struct437='),source.indexOf('// ---------- 437e')),s);
 for(let i=0;i<120;i++)s.buildingStructure265({type:'hq',lv:20},{x:200,y:200},60+i/2,true);
 assert.equal(builds,1,'smooth zoom reuses the same structural art');assert(Math.abs(last[3]-120*119.5/80)<.001,'art scales to requested size');
}
{
 let builds=0,last;const s={Math,zoom:.5,tile:50,ISO412:.5,screen:'raid',E:{raid:{buildings:[]}},wallIndex219:new Map(),wallArt274:{complete:true,naturalWidth:100},point:()=>({x:100,y:100}),ctx:{drawImage(...v){last=v}},renderScale226:()=>2,drawWall(){builds++;assert.equal(s.zoom,1)},document:{createElement:()=>({getContext:()=>({setTransform(){}})})}};vm.createContext(s);vm.runInContext(source.slice(source.indexOf('var wallCache437='),source.indexOf('// ---------- crater sprites')),s);
 for(let i=0;i<120;i++){s.zoom=.5+i/200;s.drawWall({type:'wall',x:1,y:1,lv:20},true);assert.equal(s.zoom,.5+i/200,'restore gameplay zoom');}
 assert.equal(builds,1,'zoom does not regenerate wall sprites');assert(Math.abs(last[3]-124*s.zoom)<.001);
 s.zoom=1;s.drawWall({type:'wall',x:1,y:1,lv:19},true);assert.equal(builds,2,'level change selects different art');
 s.wallIndex219.set('2,1',{hp:10});s.drawWall({type:'wall',x:1,y:1,lv:19},true);assert.equal(builds,3,'wall topology still updates');
}
{
 let now=10000;const s={Math,Date:{now:()=>now},screen:'raid',E:{raid:{buildings:Array(150),troops:[]},d:{buildings:[]}},frameAvg420:22,renderScale226:()=>2};vm.createContext(s);vm.runInContext(source.slice(source.indexOf('var dynScale437=')),s);
 assert.equal(s.renderScale226(),1.25);now+=2100;assert.equal(s.renderScale226(),1);s.frameAvg420=5;now+=2100;assert.equal(s.renderScale226(),1,'no immediate resolution oscillation');now+=13000;assert.equal(s.renderScale226(),1.25);s.screen='home';s.frameAvg420=25;now+=2100;assert.equal(s.renderScale226(),1,'home also responds to overload');
}
console.log('PASS performance441: stable image levels, zoom reuse, wall topology, resolution hysteresis');
