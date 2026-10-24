/* Embedded in game.js so existing Android content patches need no new file type. */
(function(root){'use strict';
var dictionary=/* NOVA_CATALOG */{},language='en';
// Explicit choice wins; locale/region is a hint, never a claim about nationality.
var savedLanguage288=null;try{savedLanguage288=root.localStorage&&root.localStorage.getItem('novaLanguage');}catch(e){}
if(savedLanguage288==='th'||savedLanguage288==='en')language=savedLanguage288;
else{var nav288=root.navigator||{},locales288=nav288.languages&&nav288.languages.length?Array.from(nav288.languages):[nav288.language||''];
 if(locales288.some(function(v){return /^th(?:-|_|$)/i.test(v)||/(?:-|_)TH(?:-|_|$)/i.test(v);}))language='th';
 else if(!locales288.some(function(v){return /^en(?:-|_|$)/i.test(v);}))try{if(Intl.DateTimeFormat().resolvedOptions().timeZone==='Asia/Bangkok')language='th';}catch(e){}
}
var originals=new WeakMap(),reverse={};Object.keys(dictionary).forEach(function(k){if(!reverse[dictionary[k]])reverse[dictionary[k]]=k;});
var phrase=/[\u0e00-\u0e7f]+(?:[ \t]+[\u0e00-\u0e7f]+)*/g;
function translate(value){if(typeof value!=='string'||language==='th')return value;if(dictionary[value])return dictionary[value];return value.replace(phrase,function(text,offset,source){var translated=dictionary[text];if(!translated)return text;var before=source[offset-1]||'',after=source[offset+text.length]||'';return (/[A-Za-z0-9]/.test(before)?' ':'')+translated+(/[A-Za-z0-9]/.test(after)?' ':'');});}
function localize(document){if(!document||!document.createTreeWalker)return;if(document.documentElement)document.documentElement.lang=language;var walker=document.createTreeWalker(document.body,4),node;while((node=walker.nextNode())){if(!/^(SCRIPT|STYLE|TEXTAREA)$/.test(node.parentNode.tagName)&&node.parentNode.lang!=='th'){var record=originals.get(node);if(!record||record.last!==node.nodeValue)record={source:node.nodeValue};node.nodeValue=translate(record.source);record.last=node.nodeValue;originals.set(node,record);}}document.querySelectorAll('[aria-label],[title],[placeholder],[alt]').forEach(function(el){['aria-label','title','placeholder','alt'].forEach(function(attr){if(el.hasAttribute(attr)){var rec=originals.get(el)||{},value=el.getAttribute(attr),old=rec[attr];if(!old||old.last!==value)old={source:value};old.last=translate(old.source);el.setAttribute(attr,old.last);rec[attr]=old;originals.set(el,rec);}});});}
root.NovaI18n={language:language,translate:translate,localize:localize,source:function(v){return reverse[v]||v;},setLanguage:function(v){if(v!=='en'&&v!=='th')return false;language=v;this.language=v;localize(root.document);return true;}};
localize(root.document);
})(typeof globalThis === 'object' ? globalThis : this);



