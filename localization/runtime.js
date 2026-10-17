/* Embedded in game.js so existing Android content patches need no new file type. */
(function(root){'use strict';
var dictionary=/* NOVA_CATALOG */{},language='en';
try{if(root.localStorage&&root.localStorage.getItem('novaLanguage')==='th')language='th';}catch(e){}
var phrase=/[\u0e00-\u0e7f]+(?:[ \t]+[\u0e00-\u0e7f]+)*/g;
function translate(value){if(typeof value!=='string'||language==='th')return value;if(dictionary[value])return dictionary[value];return value.replace(phrase,function(text,offset,source){var translated=dictionary[text];if(!translated)return text;var before=source[offset-1]||'',after=source[offset+text.length]||'';return (/[A-Za-z0-9]/.test(before)?' ':'')+translated+(/[A-Za-z0-9]/.test(after)?' ':'');});}
function localize(document){if(!document||!document.createTreeWalker)return;if(document.documentElement)document.documentElement.lang=language;var walker=document.createTreeWalker(document.body,4),node;while((node=walker.nextNode())){if(!/^(SCRIPT|STYLE|TEXTAREA)$/.test(node.parentNode.tagName))node.nodeValue=translate(node.nodeValue);}document.querySelectorAll('[aria-label],[title],[placeholder],[alt]').forEach(function(el){['aria-label','title','placeholder','alt'].forEach(function(attr){if(el.hasAttribute(attr))el.setAttribute(attr,translate(el.getAttribute(attr)));});});}
root.NovaI18n={language:language,translate:translate,localize:localize};
localize(root.document);
})(typeof globalThis === 'object' ? globalThis : this);
