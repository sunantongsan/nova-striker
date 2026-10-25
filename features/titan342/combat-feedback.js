// Combat presentation only: no extra damage, timers, or persistent save changes.
var lastImpact354=-Infinity;
function impactFeedback354(f){
 if(f.feedback354||document.hidden||!['raid','defense'].includes(screen))return;
 var heavy=f.weapon==='energyRing276'||f.weapon==='mineburst278'||f.weapon==='airburst278'||f.weapon==='impact'&&['cannon','missile','bomb','grenade','energy276'].includes(f.effect);
 if(!heavy)return;f.feedback354=true;
 var now=Date.now();if(now-lastImpact354<180)return;lastImpact354=now;
 if(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 // Animate the battlefield only, keeping buttons and HUD steady. Never stack shakes.
 if(canvas.animate){if(canvas.shake354)canvas.shake354.cancel();canvas.shake354=canvas.animate([{transform:'translate(0,0)'},{transform:'translate(-2px,1px)'},{transform:'translate(2px,-1px)'},{transform:'translate(-1px,0)'},{transform:'translate(0,0)'}],{duration:160,easing:'ease-out'});}
}
var combatFX354=drawFX;
drawFX=function(f){
 // Run audio before older renderers' narrow portrait-screen culling.
 if(!document.hidden&&mediaAllowed250()&&f.weapon!=='titan342')weaponAudio218(f);
 impactFeedback354(f);return combatFX354(f);
};
