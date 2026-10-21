(function(root){
'use strict';
var G=root.Game;if(!G)return;
var allowed=false,pending={},serial=0,generation=0,current=null;
function tr(th,en){return root.NovaI18n&&root.NovaI18n.language==='en'?en:th;}
function el(tag,text,parent){var e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(parent)parent.appendChild(e);return e;}
function button(parent,text,fn){var b=el('button',text,parent);b.type='button';b.onclick=fn;return b;}
function account(){try{return root.NovaCloud&&root.NovaCloud.hasAccount&&root.NovaCloud.hasAccount()&&localStorage.getItem('novaGuest288')!=='1';}catch(e){return false;}}
function errorText(code){if(/feedback_wait/.test(code))return tr('รอ 1 นาทีก่อนส่งข้อความถัดไป','Wait one minute before sending again.');if(/settings_changed/.test(code))return tr('ค่าถูกเปลี่ยนแล้ว กดรีเฟรชก่อนบันทึกใหม่','Settings changed. Refresh before saving.');return tr('ทำรายการไม่สำเร็จ ตรวจการเข้าสู่ระบบและอินเทอร์เน็ต แล้วลองใหม่','Request failed. Check your login and connection, then retry.');}
function request(mode,data,done){
 if(!account()){done(Error(tr('กรุณาเชื่อมบัญชีก่อนใช้งาน','Sign in to use this feature.')));return;}
 var id='admin293-'+(++serial),epoch=generation;
 var timer=setTimeout(function(){if(!pending[id])return;delete pending[id];done(Error(errorText('timeout')));},25000);
 pending[id]={done:done,timer:timer,epoch:epoch};
 try{root.NovaCloud.warRequest('test_status',JSON.stringify(Object.assign({},data,{admin293:mode})),id);}catch(e){clearTimeout(timer);delete pending[id];done(Error(errorText('network')));}
}
var cloudEvent=root.novaCloudEvent;
root.novaCloudEvent=function(event,data){
 data=data||{};
 if(data.request_id&&data.request_id.indexOf('admin293-')===0){var p=pending[data.request_id];if(!p)return;clearTimeout(p.timer);delete pending[data.request_id];if(p.epoch!==generation)return;
 if(event==='war'&&data.data&&data.data.admin293)p.done(null,data.data);else p.done(Error(errorText(data.message||event)));return;}
 if(event==='signed_out'||event==='signed_in'){generation++;allowed=false;current=null;Object.keys(pending).forEach(function(k){clearTimeout(pending[k].timer);delete pending[k];});close();}
 if(cloudEvent)cloudEvent.apply(this,arguments);
 if(event==='signed_in'||event==='loaded')setTimeout(pulse,1500);
};
function close(){var e=document.getElementById('nova-admin293');if(e)e.remove();}
function panel(title){close();var overlay=el('section');overlay.id='nova-admin293';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label',title);overlay.style.cssText='position:fixed;inset:0;z-index:100000;background:#071b2ceF;overflow:auto;padding:20px;box-sizing:border-box;color:#eaf8ff;';var box=el('div',undefined,overlay);box.style.cssText='max-width:680px;margin:auto;padding-bottom:40px;';button(box,tr('← กลับ','← Back'),close);el('h2',title,box);document.body.appendChild(overlay);return box;}
function feedback(){var box=panel(tr('ส่งข้อเสนอแนะ / แจ้งปัญหา','Feedback / Report a problem'));el('p',tr('ข้อความจะส่งถึงแอดมินพร้อมชื่อฐานของคุณ กรุณาอย่าใส่รหัสผ่าน','Your message and base name will be visible to the admin. Do not include passwords.'),box);var form=el('form',undefined,box),label=el('label',tr('ข้อความ','Message'),form),area=el('textarea',undefined,label);area.required=true;area.minLength=3;area.maxLength=2000;area.rows=7;area.style.cssText='display:block;width:100%;box-sizing:border-box;margin:12px 0;color:#102b40;background:white;padding:12px;font-size:18px';var status=el('p','',form);status.setAttribute('role','status');var send=el('button',tr('ส่งข้อเสนอแนะ','Send feedback'),form);send.type='submit';form.onsubmit=function(e){e.preventDefault();if(send.disabled)return;send.disabled=true;status.textContent=tr('กำลังส่ง…','Sending…');request('feedback',{body:area.value.trim()},function(err){send.disabled=false;status.textContent=err?err.message:tr('ส่งถึงแอดมินแล้ว ขอบคุณครับ','Sent to the admin. Thank you.');if(!err)area.value='';});};}
function dashboard(){var box=panel(tr('ศูนย์แอดมิน NOVA','NOVA Admin'));el('p',tr('กำลังอ่านข้อมูลจากเซิร์ฟเวอร์…','Loading server data…'),box);request('dashboard',{},function(err,data){if(!box.isConnected)return;if(err){el('p',err.message,box);button(box,tr('ลองใหม่','Retry'),dashboard);return;}render(data);});}
function render(data){
 current=data;allowed=data.is_admin===true;var box=panel(tr('ศูนย์แอดมิน NOVA','NOVA Admin'));
 button(box,tr('รีเฟรชข้อมูล','Refresh'),dashboard);
 el('p',tr('อัปเดต: ','Updated: ')+new Date(data.server_time).toLocaleString(),box);
 var grid=el('div',undefined,box);grid.style.cssText='display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px';
 [[data.total,tr('บัญชีผู้เล่น','Player accounts')],[data.online,tr('ออนไลน์','Online')],[data.active24h,tr('ใช้งาน 24 ชม.','Active in 24h')]].forEach(function(x){var c=el('div',undefined,grid);c.style.cssText='padding:12px 6px;background:#164768;border-radius:12px;text-align:center';var n=el('strong',String(x[0]),c);n.style.fontSize='30px';el('div',x[1],c);});
 el('p',tr('ออนไลน์ = บัญชีที่เปิดเกมและส่งสถานะใน 2 นาทีล่าสุด • ไม่นับโหมดเยี่ยมชม/ผู้เล่นออฟไลน์ • สถิติการใช้งานเริ่มเก็บหลังอัปเดตนี้','Online = accounts active in the last 2 minutes. Guests/offline play are excluded. Activity tracking starts with this update.'),box);
 el('h3',tr('ตั้งค่าระบบขุด NOVA','NOVA mining settings'),box);
 el('p',tr('อัตราใหม่ใช้กับรอบขุดที่เริ่มหลังบันทึก รอบเดิมคงอัตราเดิม การปิดระบบขุดจะหยุดการเริ่มรอบและการรับยอดจนกว่าจะเปิดอีกครั้ง','New rates apply to newly started mining sessions. Existing sessions retain their rate. Disabling mining pauses starting and collecting until re-enabled.'),box);
 var form=el('form',undefined,box),label=el('label',undefined,form),enabled=el('input',undefined,label);enabled.type='checkbox';enabled.checked=data.settings.mining_enabled;label.appendChild(document.createTextNode(tr(' เปิดระบบขุด',' Enable mining')));
 var rateLabel=el('label',tr('อัตราฐาน NOVA ต่อชั่วโมง (ก่อนลดตามจำนวนสมาชิก)','Base NOVA per hour (before member scaling)'),form);rateLabel.style.display='block';var rate=el('input',undefined,rateLabel);rate.type='number';rate.min='1';rate.max='10000';rate.step='0.01';rate.required=true;rate.value=data.settings.base_rate;rate.style.cssText='display:block;background:white;color:#102b40;padding:10px;margin:8px 0;width:180px';
 var status=el('p','',form);status.setAttribute('role','status');var save=el('button',tr('บันทึกค่า','Save settings'),form);save.type='submit';form.onsubmit=function(e){e.preventDefault();if(save.disabled)return;if(!root.confirm(tr('ยืนยันเปลี่ยนค่าระบบขุดสำหรับผู้เล่นทั้งหมด?','Apply these mining settings to all players?')))return;save.disabled=true;request('settings',{enabled:enabled.checked,base_rate:Number(rate.value),expected:data.settings},function(err,next){if(!box.isConnected)return;save.disabled=false;if(err)status.textContent=err.message;else render(next);});};
 el('h3',tr('ข้อเสนอแนะล่าสุด (สูงสุด 100 รายการ)','Latest feedback (up to 100)'),box);
 if(!data.feedback.length)el('p',tr('ยังไม่มีข้อเสนอแนะ','No feedback yet.'),box);
 data.feedback.forEach(function(f){var card=el('article',undefined,box);card.style.cssText='padding:12px;margin:12px 0;background:#12384f;border-radius:12px';el('strong',f.player,card);el('div',new Date(f.created_at).toLocaleString(),card);var body=el('p',f.body,card);body.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere';var select=el('select',undefined,card);select.setAttribute('aria-label',tr('สถานะข้อเสนอแนะ','Feedback status'));[['new',tr('ใหม่','New')],['reviewing',tr('กำลังตรวจ','Reviewing')],['done',tr('จัดการแล้ว','Done')]].forEach(function(x){var o=el('option',x[1],select);o.value=x[0];});select.value=f.status;var msg=el('p','',card);select.onchange=function(){select.disabled=true;request('feedback_status',{id:f.id,status:select.value},function(err,next){if(!box.isConnected)return;select.disabled=false;if(err){select.value=f.status;msg.textContent=err.message;}else render(next);});};});
 var details=el('details',undefined,box);el('summary',tr('ประวัติการจัดการ 20 รายการล่าสุด','Last 20 admin changes'),details);data.audit.forEach(function(a){el('p',new Date(a.created_at).toLocaleString()+' · '+a.action+' · '+JSON.stringify(a.before_value)+' → '+JSON.stringify(a.after_value),details).style.overflowWrap='anywhere';});
}
var settings=G.settings;
G.settings=function(){settings.apply(this,arguments);var sheet=document.querySelector('#modal .sheet');if(!sheet)return;var section=el('div',undefined,sheet);section.id='nova-support293';section.style.cssText='border-top:1px solid #81ccec;margin-top:12px;padding-top:12px';button(section,tr('ข้อเสนอแนะ / แจ้งปัญหา','Feedback / Report a problem'),feedback);var admin=button(section,tr('ศูนย์แอดมิน','Admin center'),dashboard);admin.hidden=!allowed;
 if(account())request('presence',{},function(err,d){if(!err){allowed=d.is_admin===true;admin.hidden=!allowed;}});
};
var lastPulse=0;
function pulse(){if(document.hidden||!account()||Date.now()-lastPulse<45000)return;lastPulse=Date.now();request('presence',{},function(err,d){if(!err)allowed=d.is_admin===true;});}
setTimeout(pulse,4000);setInterval(pulse,60000);document.addEventListener('visibilitychange',pulse);
})(window);
