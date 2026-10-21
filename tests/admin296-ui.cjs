const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('ui/admin293.js','utf8');
class Node {constructor(tag,text=''){this.tag=tag;this.textContent=text;this.children=[];this.style={};this.isConnected=true;this.value='';}appendChild(e){e.parent=this;this.children.push(e);return e;}setAttribute(){}remove(){this.isConnected=false;if(this.parent)this.parent.children=this.parent.children.filter(x=>x!==this);}click(){if(!this.disabled&&this.onclick)this.onclick();}requestSubmit(){if(this.onsubmit)this.onsubmit({preventDefault(){}});}scrollIntoView(){}}
const el=(tag,text,parent)=>{const n=new Node(tag,text);if(parent)parent.appendChild(n);return n;};
const button=(p,t,fn)=>{const n=el('button',t,p);n.onclick=fn;return n;};
const field=(p,label,type,value)=>{const n=el('input',label,p);n.type=type;n.value=value===undefined?'':String(value);return n;};
const all=n=>[n,...n.children.flatMap(all)];let sent=[],pendingReply;
const c={el,button,field,tr:(th,en)=>en,root:{confirm:()=>{throw Error('Native dialogs unavailable');}},nonce:()=> '10000000-0000-0000-0000-000000000001',request:(mode,p,cb)=>{sent.push({mode,p});pendingReply=cb;},render:()=>{},Date,Number,isFinite,document:{querySelector:()=>null}};
vm.createContext(c);vm.runInContext(source.slice(source.indexOf('function confirmInline296'),source.indexOf('function errorText')),c);vm.runInContext(source.slice(source.indexOf('function adminTools'),source.indexOf('function offers')),c);
const box=new Node('div'),recipient='00000000-0000-0000-0000-000000000002';c.adminTools(box,{players:[{user_id:recipient,name:'Test base',nova:20}],promos:[]});
const gift=box.children[0],form=gift.children.find(n=>n.tag==='form'&&all(n).some(x=>x.tag==='select'));
all(form).find(n=>n.tag==='select').value=recipient;all(form).find(n=>n.textContent==='NOVA amount (1–1,000,000)').value='500';all(form).find(n=>n.textContent==='Reason').value='test reward';
form.requestSubmit();assert.equal(sent.length,0);all(form).find(n=>n.textContent==='Cancel').click();assert.equal(sent.length,0);
form.requestSubmit();all(form).find(n=>n.textContent==='Confirm these details').click();assert.equal(sent.length,1);assert.equal(sent[0].mode,'gift');assert.equal(sent[0].p.amount,500);assert.equal(sent[0].p.recipient,recipient);
form.requestSubmit();assert.equal(sent.length,1,'double submit while in flight must not duplicate');
pendingReply(Error('network'));form.requestSubmit();assert.equal(sent.length,2);assert.equal(sent[1].p.id,sent[0].p.id,'uncertain result retries same operation');
assert(!source.includes('root.confirm('));console.log('admin296: gift form inline review, cancel, no native dialogs, in-flight guard and same-ID retry passed');
