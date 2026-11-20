/* Presentation only: preserve gems balances, save keys and server contracts. */
(function(root){'use strict';
function label(value){return value.replace(/เพชร/g,' เหรียญเป็ด ').replace(/\bdiamonds?\b/gi,'NOVA').replace(/\bgems?\b/gi,'NOVA').replace(/ {2,}/g,' ');}
function paint(node){
 if(!node)return;
 if(node.nodeType===3){
  if(!node.parentNode||/^(SCRIPT|STYLE|TEXTAREA|INPUT)$/.test(node.parentNode.tagName)||node.parentNode.isContentEditable)return;
  var text=label(node.nodeValue);
  if(text.indexOf('💎')<0){if(text!==node.nodeValue)node.nodeValue=text;return;}
  var parts=text.split('💎'),fragment=root.document.createDocumentFragment();
  parts.forEach(function(part,i){if(i){var img=root.document.createElement('img');img.src='assets/nova-core.webp';img.className='nova-core-icon';img.alt='NOVA';img.width=24;img.height=24;fragment.appendChild(img);}if(part)fragment.appendChild(root.document.createTextNode(part));});
  node.parentNode.replaceChild(fragment,node);return;
 }
 if(node.nodeType!==1||/^(SCRIPT|STYLE|TEXTAREA|INPUT)$/.test(node.tagName)||node.isContentEditable)return;
 ['title','aria-label','alt'].forEach(function(key){var value=node.getAttribute(key);if(value){var next=label(value).replace(/💎/g,'NOVA');if(value!==next)node.setAttribute(key,next);}});
 Array.prototype.slice.call(node.childNodes).forEach(paint);
}
root.NovaCurrency={label:label,paint:paint};
if(!root.document||!root.document.body)return;
paint(root.document.body);
if(root.MutationObserver)new root.MutationObserver(function(records){records.forEach(function(record){if(record.type==='characterData')paint(record.target);else Array.prototype.forEach.call(record.addedNodes,paint);});}).observe(root.document.body,{subtree:true,childList:true,characterData:true});
})(typeof globalThis==='object'?globalThis:this);


