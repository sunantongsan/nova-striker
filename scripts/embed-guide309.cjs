// Run render-guide309.cjs first. Embed the offline demos in the existing patch payload.
const fs=require('node:fs');
const videos=Object.fromEntries(['build','defense','train','attack'].map(k=>[k,'data:video/mp4;base64,'+fs.readFileSync('qa309/'+k+'.mp4').toString('base64')]));
const file='game.js',source=fs.readFileSync(file,'utf8');
if(!/var guideVideos309=\{[^\n]*\};/.test(source))throw Error('Missing video pack marker');
fs.writeFileSync(file,source.replace(/var guideVideos309=\{[^\n]*\};/,'var guideVideos309='+JSON.stringify(videos)+';'));
