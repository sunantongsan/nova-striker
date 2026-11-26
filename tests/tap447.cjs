// 447: a scroll inside a window must not press its buttons (owner report 2026-11-26).
const fs=require('fs'),assert=require('assert');
const src=fs.readFileSync('features/tap447/tap447.js','utf8');
const build=fs.readFileSync('features/titan342/build.cjs','utf8');
assert(build.includes("features/tap447/tap447.js"),'tap447 is bundled into the game');
assert(build.indexOf('tap447.js')>build.indexOf('perf443.js'),'tap447 loads after earlier window code');
assert(src.includes("addEventListener('pointercancel',function(e){end(e,true);}"),'a browser-cancelled touch (scroll) counts as a scroll');
assert(/addEventListener\('click'[\s\S]*stopImmediatePropagation/.test(src),'clicks after a scroll are swallowed');
assert(/novaTrain360\{min-height:24px/.test(src),'train buttons are shorter');
console.log('tap447 ok');
