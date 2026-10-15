-- Mercenaries are purchased, never produced by elapsed time. Preserve existing troops.
create or replace function nova_private.merc_settle(who uuid) returns jsonb language plpgsql set search_path='' as $$
declare lv int; tech int; m nova_private.mercenaries;cap int;
begin
 select coalesce(max((v->>'lv')::int) filter(where v->>'type'='mercenary'),0),coalesce(max((v->>'lv')::int) filter(where v->>'type'='tech'),0) into lv,tech from public.nova_war_players p,jsonb_array_elements(p.layout) v where p.user_id=who;
 insert into nova_private.mercenaries(owner) values(who) on conflict do nothing;
 select * into m from nova_private.mercenaries where owner=who;
 cap:=case when lv>0 then 10+2*lv else 0 end;
 return jsonb_build_object('level',lv,'total',m.total,'attack',m.total/2,'guard',m.total-m.total/2,'capacity',cap,'seconds',0,'cost',150,'unlocked',lv>=1 and tech>=2,'version',2);
end $$;
alter function nova_private.siege_command(jsonb) rename to siege_command_before_recruit;
create function nova_private.siege_command(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();rid uuid;r jsonb;outcome jsonb;merc jsonb;p public.nova_war_players;balance bigint;
begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 if payload->>'live'<>'siege_recruit' then
  outcome:=nova_private.siege_command_before_recruit(payload);
  if outcome ? 'target' then outcome:=jsonb_set(outcome,'{target,merc_version}','2');end if;
  return outcome;
 end if;
 perform pg_advisory_xact_lock(153014,1);
 rid:=(payload->>'request_id')::uuid;if rid is null then raise exception 'ต้องมีรหัสรายการ';end if;
 select q.payload into r from nova_private.receipts q where q.user_id=uid and q.request_id=rid;
 if r is not null and r->>'action' is distinct from 'merc_recruit' then raise exception 'รหัสรายการไม่ถูกต้อง';end if;
 -- Apply monotonic resource snapshot and finish expired battles before purchase checks.
 outcome:=nova_private.siege_command_before_recruit(jsonb_set(payload,'{live}','"siege_status"'));
 if not coalesce((outcome->'online'->>'enrolled')::bool,false) then raise exception 'กรุณาเข้าร่วมออนไลน์ก่อน';end if;
 if r is null then
  if exists(select 1 from nova_private.sieges s where s.finished_at is null and (s.defender=uid or exists(select 1 from nova_private.siege_members m where m.room=s.id and m.owner=uid))) or exists(select 1 from nova_private.live_battles where not finished and (attacker=uid or defender=uid)) then raise exception 'รอการรบสิ้นสุดก่อนซื้อทหาร';end if;
  merc:=nova_private.merc_settle(uid);
  if not (merc->>'unlocked')::bool then raise exception 'ต้องมีฐานทหารรับจ้างระดับ 1 และศูนย์วิจัยระดับ 2';end if;
  if (merc->>'total')::int >= (merc->>'capacity')::int then raise exception 'ฐานทหารรับจ้างเต็ม';end if;
  select * into p from public.nova_war_players where user_id=uid for update;
  balance:=nova_private.resource_balance(p,'power');if balance<150 then raise exception 'พลังงานไม่พอ';end if;
  update public.nova_war_players set resource_gold=nova_private.resource_balance(p,'gold'),resource_power=balance-150,power_delta=power_delta-150,resource_at=now() where user_id=uid;
  update nova_private.mercenaries set total=total+1 where owner=uid;
  r:=jsonb_build_object('id',rid,'action','merc_recruit','cost',150,'quantity',1);
  insert into nova_private.receipts values(uid,rid,r);
 end if;
 return outcome||jsonb_build_object('live','siege_recruit','receipt',r,'merc',nova_private.merc_settle(uid),'online',nova_private.command('status','{}'));
end $$;
revoke all on function nova_private.siege_command_before_recruit(jsonb) from public,anon,authenticated;
revoke all on function nova_private.siege_command(jsonb) from public,anon;
grant execute on function nova_private.siege_command(jsonb) to authenticated;
-- New battle recruits use fighter mechanics; ongoing old rooms keep their original snapshots.
do $$ declare src text;begin
 select pg_get_functiondef('nova_private.siege_command_before_enhance(jsonb)'::regprocedure) into src;
 src:=replace(src,'values(s.id,uid,gen_random_uuid(),2,0,2+i%18,true,lev)','values(s.id,uid,gen_random_uuid(),5,0,2+i%18,true,lev)');execute src;
end $$;
create or replace function nova_private.siege_enhance_target() returns trigger language plpgsql set search_path='' as $$
begin new.target:=new.target||jsonb_build_object('merc_version',2,'enhancements',(select enhancements from public.nova_war_players where user_id=new.defender));return new;end $$;
