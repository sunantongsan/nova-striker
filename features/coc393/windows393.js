// 393: window polish. Apply the Clash-style additions after the main skin, and stop the NOVA mech
// window from re-rendering (and flashing its 3D preview) when a status refresh returns the same content.
(function(){
 function attach(){var old=document.getElementById('novaCoC393');if(old)old.remove();var st=document.createElement('style');st.id='novaCoC393';st.textContent=coc393CSS;document.head.appendChild(st);}
 attach();setTimeout(attach,0);setTimeout(attach,50);
})();
var titanPanel393=titanPanel342,titanKey393='';
titanPanel342=function(){
 var html=null,realOpen=open,realPreview=Game.titanPreview342;
 open=function(h){html=h;};Game.titanPreview342=function(){};
 try{titanPanel393();}finally{open=realOpen;Game.titanPreview342=realPreview;}
 if(html===null)return;
 var key=html.replace(/(<p[^>]*Countdown\d*"[^>]*>)[^<]*/g,'$1');
 if(key===titanKey393&&modal.style.display==='flex'&&modal.hasAttribute('data-guardian343')&&modal.querySelector('.titanShop342,.store348'))return;
 titanKey393=key;titanPanel393();
};
