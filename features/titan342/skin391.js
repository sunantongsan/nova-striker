// 391: apply the bright window skin last, and close a window when its dimmed backdrop is tapped.
(function(){
 function attach(){var old=document.getElementById('novaSkin391');if(old)old.remove();var st=document.createElement('style');st.id='novaSkin391';st.textContent=skinCSS391;document.head.appendChild(st);}
 attach();setTimeout(attach,0);
 modal.addEventListener('click',function(e){if(e.target!==modal||!modal.querySelector('.novaHead360 .window-close243'))return;e.preventDefault();Game.dismissWindow243();});
})();
