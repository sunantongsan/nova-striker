const fs=require('fs'),vm=require('vm'),assert=require('assert');
function boot(cache,rect={width:420,height:600}){const elements={},data={novaRTSIntro:'1',...(cache?{novaBaseProfile224:JSON.stringify(cache)}:{})},events={},requests=[],timers=[];const ctx=new Proxy({measureText:t=>({width:t.length*8})},{get:(o,k)=>o[k]||(()=>{})});
const el=id=>elements[id]||(elements[id]={hidden:true,value:'',style:{},innerHTML:'',textContent:'',addEventListener(name,f){if(id==='world')events[name]=f},setPointerCapture(){},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,...rect}),querySelectorAll:()=>[]});
const s={console,Date,Math,Uint8Array,performance:{now:()=>0},setTimeout:f=>(timers.push(f),timers.length),clearTimeout(){},Image:class{},localStorage:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v,removeItem:k=>delete data[k]},document:{getElementById:el,addEventListener(){},hidden:false},addEventListener(){},requestAnimationFrame(){},NovaCloud:{hasAccount:()=>true,available:()=>true,load(){},warRequest:(action,payload,id)=>requests.push({action,payload:JSON.parse(payload),id})}};
s.localStorage && s.localStorage.setItem('novaLanguage','th');vm.createContext(s);vm.runInContext(fs.readFileSync('game.js','utf8').replace("})(typeof globalThis!==",`root.test224={e:E,point:point,draw:draw,coordinates:coordinates,fit:fitCanvas,palette:planetPalette298,size:()=>[viewWidth,viewHeight],preview:function(){return movePreview224;},selected:function(){return selected;},pan:function(){return [panX,panY];}};})(typeof globalThis!==`),s);
return {s,el,data,requests,timers,t:s.test224,fire:(type,x,y)=>events[type]({pointerId:1,clientX:x,clientY:y}),reply:(name,owner='a')=>s.novaCloudEvent('war',{request_id:requests.at(-1).id,data:{profile:true,name,owner}})};}

for(const rect of [{width:900,height:300},{width:740,height:260},{width:420,height:600}]){
 const a=boot(null,rect),t=a.t;t.fit();t.draw();
 const [w,h]=t.size();assert.equal(Math.round(w/h*1000),Math.round(rect.width/rect.height*1000));
 const p=t.point(10,10),q=t.coordinates({clientX:p.x*rect.width/w,clientY:p.y*rect.height/h});
 assert(Math.abs(q.x-p.x)<1e-8&&Math.abs(q.y-p.y)<1e-8,'pointer mapping follows viewport');
 const b=t.e.d.buildings[0];a.fire('pointerdown',0,0);a.s.Game.choosePlanet298(5);
 assert.equal(a.data.novaPlanet298,'5');assert.equal(t.palette().ground.length,4);t.draw();
 a.s.Game.choosePlanet298(99);assert.equal(a.data.novaPlanet298,'5');
}
console.log('PASS landscape/portrait aspect and pointer mapping; palette changes, invalid selection and terrain redraw');
