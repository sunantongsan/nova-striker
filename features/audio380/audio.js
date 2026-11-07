// Decoded, embedded CC0 samples: no network requests or oscillator-only weapon fallback.
var samples380={},loading380={},audioOwner380=null,playing380=new Set(),queued380=0,lastSample380={},outcomeUntil380=0;
function context380(){
 unlockAudio218();if(!audio||audio.state==='closed')return null;
 if(audioOwner380!==audio){audioOwner380=audio;samples380={};loading380={};}
 return audio;
}
function decode380(key){
 var ac=context380();if(!ac||!sampleData380[key])return Promise.resolve(null);if(samples380[key])return Promise.resolve(samples380[key]);
 if(!loading380[key]){var raw=atob(sampleData380[key]),bytes=new Uint8Array(raw.length);for(var i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
 loading380[key]=ac.decodeAudioData(bytes.buffer).then(function(buffer){samples380[key]=buffer;return buffer;},function(){delete loading380[key];return null;});}return loading380[key];
}
function warm380(){if(!soundOn||!mediaAllowed250())return;Object.keys(sampleData380).forEach(decode380);}
document.addEventListener('pointerdown',warm380,{passive:true});
async function sample380(key,options){
 options=options||{};if(!soundOn||!mediaAllowed250()||(!options.outcome&&(queued380>=8||performance.now()<outcomeUntil380)))return false;
 var ac=context380();if(!ac)return false;var requested=performance.now();queued380++;
 try{
  var buffer=await decode380(key);if(ac.state==='suspended')await ac.resume();
  if(!buffer||ac.state!=='running'||!soundOn||!mediaAllowed250()||performance.now()-requested>(options.outcome?5000:400))return false;
  if(!options.outcome&&(playing380.size>=8||performance.now()<outcomeUntil380))return false;
  var mix=mixer218();if(!mix)return false;
  if(options.outcome){playing380.forEach(function(n){try{n.stop();}catch(ignore){}});outcomeUntil380=performance.now()+2200;}
  function start(delay,rate,volume){var n=ac.createBufferSource(),g=ac.createGain();n.buffer=buffer;n.playbackRate.value=rate;g.gain.value=volume;n.connect(g);g.connect(mix.sfx);playing380.add(n);n.onended=function(){playing380.delete(n);n.disconnect();g.disconnect();};n.start(ac.currentTime+delay);}
  start(0,options.rate||1,options.volume||.75);
  if(key==='machine')start(.07,options.rate||1,.45);
  if(options.outcome&&key==='victory'){start(.7,1.12,.55);start(1.35,1.25,.5);}
  return true;
 }catch(ignore){return false;}finally{queued380--;}
}
var soundKeys380={machine:'machine',sniper:'sniper',cannon:'cannon',grenade:'cannon',bomb:'missile',missile:'missile',plasma:'plasma',tesla:'tesla',shock:'tesla',heal:'heal',energy276:'plasma',energyRing276:'impact',impact:'impact',mineburst278:'impact',airburst278:'impact',siloLaunch278:'missile'};
weaponAudio218=function(f){
 var key=soundKeys380[f.weapon];if(!key||f.heard218||f.queued380||!soundOn||!mediaAllowed250())return;
 var now=performance.now(),bucket=key+':'+(f.sourceKind379===undefined?f.sourceType379||'default':f.sourceKind379),gap=key==='impact'?280:120;
 if(now-(lastSample380[bucket]===undefined?-10000:lastSample380[bucket])<gap){f.heard218=true;return;}
 lastSample380[bucket]=now;f.queued380=true;
 sample380(key,{rate:f.sourceType379?.9:1+(Math.max(0,f.sourceKind379||0)%4)*.07,volume:key==='impact'?.35:.8}).then(function(ok){f.queued380=false;if(ok)f.heard218=true;});
};
outcomeSound379=function(win){return sample380(win?'victory':'defeat',{outcome:true,volume:1});};
document.addEventListener('visibilitychange',function(){if(document.hidden)playing380.forEach(function(n){try{n.stop();}catch(ignore){}});});
