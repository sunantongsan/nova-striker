// Keep walking cadence independent of screen refresh rate; cache only the 3D pose,
// never the unit's world position or combat simulation.
export function mechClip442(t) {
 if(t.resting347)return t.restPose347==='RestDown347'?'Sentinel':'KneelFire';
 if(t.hp<=0)return 'Collapse';
 if(t.moving&&!t.jump345&&!t.pending342&&!(t.actionTime342>0))return 'Walk';
 return t.action342||'Sentinel';
}
export function mechFrame442(record,t,clip,now) {
 const idle=t.resting347||clip==='Sentinel';
 const key=[clip,t.actionSeq342||0,t.tier342||1,!!t.resting347,idle?Math.round((t.heading||0)*20):0,t.toss419||0].join(':');
 const interval=idle&&!t.toss419?100:1000/30;
 const elapsed=record.frameAt442===undefined?1/30:Math.max(0,(now-record.frameAt442)/1000);
 return {key,dt:Math.min(.1,elapsed),draw:!record.sprite442||key!==record.frameKey442||elapsed*1000>=interval-.01};
}
