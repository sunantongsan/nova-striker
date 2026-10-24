'use strict';
// Isolated prototype. Not imported by the live game and never grants currency.
const RULES=Object.freeze({maxPerBase:1,hqLevel:10,buildSeconds:259200,gold:10000000,power:10000000,skillAdCompletions:5,adCooldownSeconds:60});
const SKILLS=Object.freeze({
 slash:{level:1,cooldown:3,energy:10,range:3,arc:Math.PI*.8,damage:180,air:false,clip:'Sword_Regular_Combo',vfx:'cyan-blade-ribbon'},
 dash:{level:1,cooldown:10,energy:20,range:5,arc:Math.PI*.35,damage:260,air:false,clip:'Sword_Dash_RM',vfx:'back-jet-streak'},
 palm:{level:1,cooldown:8,energy:20,range:7,arc:Math.PI*.2,damage:300,air:true,clip:null,vfx:'charged-cyan-orb'},
 shield:{level:2,cooldown:18,energy:25,range:3,damage:0,clip:'Idle_Shield_Loop',vfx:'hex-shield-ripple'},
 shockwave:{level:3,cooldown:22,energy:35,range:4,arc:Math.PI*2,damage:400,air:false,clip:null,vfx:'ground-ring-debris'}
});
function creationAllowed(base){return base.hqLevel>=RULES.hqLevel&&!base.titan&&!base.titanJob&&base.gold>=RULES.gold&&base.power>=RULES.power;}
function eligible(caster,target,skill){if(target.hp<=0||target.team===caster.team||target.air&&!skill.air)return false;const dx=target.x-caster.x,dz=target.z-caster.z;if(Math.hypot(dx,dz)>skill.range)return false;const diff=Math.atan2(Math.sin(Math.atan2(dz,dx)-caster.heading),Math.cos(Math.atan2(dz,dx)-caster.heading));return Math.abs(diff)<=skill.arc/2;}
function cast(caster,id,targets,now){const s=SKILLS[id];if(!s||caster.hp<=0||caster.level<s.level||caster.energy<s.energy||now<(caster.cooldowns[id]||0))return {ok:false,hits:[]};caster.energy-=s.energy;caster.cooldowns[id]=now+s.cooldown;if(id==='shield'){caster.shieldUntil=now+5;return {ok:true,hits:[],shieldUntil:caster.shieldUntil};}const hits=targets.filter(t=>eligible(caster,t,s));for(const t of hits)t.hp=Math.max(0,t.hp-s.damage);return {ok:true,hits:hits.map(t=>t.id),clip:s.clip,vfx:s.vfx};}
module.exports={RULES,SKILLS,creationAllowed,eligible,cast};
