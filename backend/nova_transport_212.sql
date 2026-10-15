-- Battle transport does no economy settlement or resource writes.
-- Shared gate coexists with old clients' exclusive gate; each room has its own row lock.
create index if not exists nova_siege_member_owner on nova_private.siege_members(owner,room);
create index if not exists nova_siege_order_room on nova_private.siege_orders(room,id);
create index if not exists nova_siege_defender_clock on nova_private.sieges(defender,started_at);
alter function nova_private.siege_command(jsonb) rename to siege_command_before_transport;
create function nova_private.siege_command(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();mode text:=payload->>'live';s nova_private.sieges;m nova_private.siege_members;rid uuid;f jsonb;ackn bigint;orders jsonb;members jsonb;result jsonb;clock jsonb;hostid uuid;
begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 -- Cheap home heartbeat still checks incoming attacks every 1.5 seconds.
 if payload->>'transport'='2' and mode='siege_status' then
  perform pg_advisory_xact_lock_shared(153014,1);
  if exists(select 1 from nova_private.sieges x where (x.defender=uid and (x.finished_at is null or not x.defender_reported)) or exists(select 1 from nova_private.siege_members y where y.room=x.id and y.owner=uid and (x.finished_at is null or not y.reported))) then
   return jsonb_build_object('live',mode,'refresh',true);
  end if;
 select jsonb_build_object('now',now(),'locked',nova_private.siege_locked(uid),'intervals',coalesce(jsonb_agg(jsonb_build_array(started_at,least(now(),coalesce(finished_at,ends_at)))),'[]')) into clock from nova_private.sieges where defender=uid and coalesce(finished_at,ends_at)>coalesce(nullif(payload->>'clock_from','')::timestamptz,now()-interval '30 days');
  return jsonb_build_object('live',mode,'clock',clock,'transport',2);
 end if;
 if coalesce((payload->>'transport')::int,0)<>1 or mode not in ('siege_frame','siege_status') or not (payload ? 'id') then return nova_private.siege_command_before_transport(payload);end if;
 rid:=(payload->>'id')::uuid;
 select * into s from nova_private.sieges where id=rid;
 if s.id is null or (s.defender<>uid and not exists(select 1 from nova_private.siege_members where room=rid and owner=uid)) then raise exception 'ไม่พบห้องรบ';end if;
 if s.finished_at is not null or s.ends_at<=now() then return nova_private.siege_command_before_transport(payload);end if;
 perform pg_advisory_xact_lock_shared(153014,1);
 select * into s from nova_private.sieges where id=rid for update;
 -- A legacy finish may have won the exclusive gate before we acquired it.
 -- Ask for a full refresh without upgrading the shared lock (avoids deadlocks).
 if s.finished_at is not null then return jsonb_build_object('live',mode,'refresh',true);end if;
 if mode='siege_frame' then
  if s.host<>uid or (payload->>'epoch')::int is distinct from s.epoch then raise exception 'ผู้ควบคุมสนามเปลี่ยนแล้ว';end if;
   f:=payload->'frame';ackn:=(payload->>'ack')::bigint;
   if (payload->>'seq')::int>s.seq then
    if f is null or length(f::text)>180000 or jsonb_typeof(f->'buildings') is distinct from 'array' or jsonb_array_length(f->'buildings')<>jsonb_array_length(s.target->'layout') or jsonb_array_length(f->'troops')>800 or jsonb_array_length(f->'guards')>80 or ackn is null or ackn<s.ack or ackn>coalesce((select max(id) from nova_private.siege_orders where room=rid),0) then raise exception 'ข้อมูลสนามไม่ถูกต้อง';end if;
    -- Every attacking unit must come from an accepted deployment order, with unique ids.
    if exists(select 1 from jsonb_array_elements(f->'troops') t where not exists(select 1 from nova_private.siege_orders o where o.room=rid and o.id=(t->>10)::bigint and o.kind=(t->>0)::int)) or (select count(*) from jsonb_array_elements(f->'troops'))<>(select count(distinct t->>10) from jsonb_array_elements(f->'troops') t) then raise exception 'ข้อมูลกองทัพไม่ถูกต้อง';end if;
    update nova_private.sieges set frame=f,seq=(payload->>'seq')::int,ack=ackn,heartbeat=now() where id=rid returning * into s;
   end if;
 end if;
 if coalesce((payload->>'awake')::bool,true) then update nova_private.siege_members set seen=now() where room=rid and owner=uid;end if;
 if s.heartbeat<now()-interval '10 seconds' then
  select owner into hostid from nova_private.siege_members where room=rid and seen>now()-interval '8 seconds' order by seen desc limit 1;
  if hostid is null and uid=s.defender and coalesce((payload->>'awake')::bool,true) then hostid:=uid;end if;
  if hostid is not null then update nova_private.sieges set host=hostid,epoch=epoch+1,heartbeat=now() where id=rid returning * into s;end if;
 end if;
  select * into m from nova_private.siege_members where room=s.id and owner=uid;
  select coalesce(jsonb_agg(to_jsonb(o) order by o.id),'[]') into orders from nova_private.siege_orders o where room=s.id and id>s.ack;
  select jsonb_agg(jsonb_build_object('id',y.owner,'name',player.callsign,'withdrawn',y.withdrawn)) into members from nova_private.siege_members y join public.nova_war_players player on player.user_id=y.owner where y.room=s.id;
  result:=coalesce(result,'{}')||jsonb_build_object('battle',jsonb_build_object('v',2,'id',s.id,'role',case when uid=s.defender then 'defender' else 'attacker' end,'host',s.host=uid,'epoch',s.epoch,'target',s.target,'roster',coalesce(m.roster,'[]'),'army',coalesce(m.army,'[]'),'frame',s.frame,'seq',s.seq,'ack',s.ack,'orders',orders,'members',members,'finished',s.finished_at is not null,'result',s.result->uid::text,'remaining',greatest(0,extract(epoch from(s.ends_at-now()))),'withdrawn',coalesce(m.withdrawn,false)));

 -- Only omit immutable scene data when the caller confirms it has this epoch.
 if (payload->>'known_epoch')::int=s.epoch then
  result:=jsonb_set(result,'{battle}',(result->'battle')-'target'-'roster');
  if s.host=uid or (payload->>'known_seq')::int=s.seq then result:=jsonb_set(result,'{battle}',(result->'battle')-'frame');end if;
 end if;
 select jsonb_build_object('now',now(),'locked',nova_private.siege_locked(uid),'intervals',coalesce(jsonb_agg(jsonb_build_array(started_at,least(now(),coalesce(finished_at,ends_at)))),'[]')) into clock from nova_private.sieges where defender=uid and coalesce(finished_at,ends_at)>coalesce(nullif(payload->>'clock_from','')::timestamptz,now()-interval '30 days');
 return result||jsonb_build_object('live',mode,'clock',clock,'transport',1);
end $$;
revoke all on function nova_private.siege_command_before_transport(jsonb) from public,anon,authenticated;
revoke all on function nova_private.siege_command(jsonb) from public,anon;
grant execute on function nova_private.siege_command(jsonb) to authenticated;
-- Full status/peek requests already computed their economy once. Reuse that result.
do $$ declare src text;begin
 select pg_get_functiondef('nova_private.siege_command_before_enhance(jsonb)'::regprocedure) into src;
 src:=replace(src,'''online'',nova_private.command(''status'',''{}''),''merc'',nova_private.merc_settle(uid)',
 '''online'',case when mode in (''siege_status'',''siege_peek'') then online else nova_private.command(''status'',''{}'') end,''merc'',case when mode in (''siege_status'',''siege_peek'') then merc else nova_private.merc_settle(uid) end');
 execute src;
end $$;
