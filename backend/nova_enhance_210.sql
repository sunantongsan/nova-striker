-- Crystal enhancements are account-owned, per unit/building type, and receipt-idempotent.
alter table public.nova_war_players add column enhancements jsonb not null default '{}';
alter table nova_private.siege_orders add column enhancement integer not null default 0 check(enhancement between 0 and 10);
alter table nova_private.siege_orders add column weapon_research int not null default 0,add column armor_research int not null default 0;
alter function nova_private.command(text,jsonb) rename to command_before_enhance;
create function nova_private.command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();p public.nova_war_players;r jsonb;outcome jsonb;k text;lev int;cost int;rid uuid;
begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ';end if;perform pg_advisory_xact_lock(153014,1);
 if action='research' and payload ? 'enhance' then
  rid:=(payload->>'request_id')::uuid;k:=payload->>'enhance';if rid is null then raise exception 'ต้องมีรหัสรายการ';end if;
  select q.payload into r from nova_private.receipts q where q.user_id=uid and q.request_id=rid;
  if r is not null and r->>'action'<>'enhance' then raise exception 'รหัสรายการไม่ถูกต้อง';end if;
  if r is null then
   if exists(select 1 from nova_private.sieges s where s.finished_at is null and (s.defender=uid or exists(select 1 from nova_private.siege_members m where m.room=s.id and m.owner=uid))) or exists(select 1 from nova_private.live_battles where not finished and (attacker=uid or defender=uid)) then raise exception 'รอการรบสิ้นสุดก่อนตีบวก';end if;
   select * into p from nova_private.settle(uid);if p.user_id is null then return jsonb_build_object('enrolled',false);end if;
   if k is null or not(k ~ '^unit:([0-9]|10|alien)$' or k ~ '^building:[a-z]+$' and exists(select 1 from jsonb_array_elements(p.layout) b where 'building:'||(b->>'type')=k)) then raise exception 'ไม่พบเป้าหมายตีบวก';end if;
   if k='unit:alien' and not exists(select 1 from jsonb_array_elements(p.layout) b where b->>'type'='mercenary') then raise exception 'สร้างฐานทหารรับจ้างก่อน';end if;
   lev:=coalesce((p.enhancements->>k)::int,0);if lev>=10 then raise exception 'ตีบวกสูงสุดแล้ว';end if;
   cost:=100*(lev+1)*(lev+1);if p.crystals<cost then raise exception 'ผลึกไม่พอ';end if;
   update public.nova_war_players set crystals=crystals-cost,enhancements=jsonb_set(enhancements,array[k],to_jsonb(lev+1)) where user_id=uid;
   r:=jsonb_build_object('id',rid,'action','enhance','key',k,'level',lev+1,'cost',cost);insert into nova_private.receipts values(uid,rid,r);
  end if;
  outcome:=nova_private.command_before_enhance('status','{}')||jsonb_build_object('receipt',r);
 else outcome:=nova_private.command_before_enhance(action,payload);end if;
 return outcome||jsonb_build_object('enhancements',coalesce((select enhancements from public.nova_war_players where user_id=uid),'{}'));
end $$;
revoke all on function nova_private.command_before_enhance(text,jsonb),nova_private.command(text,jsonb) from public,anon,authenticated;
grant execute on function nova_private.command(text,jsonb) to authenticated;
-- Freeze each participant's enhancement loadout at deployment; snapshots retain defender stats.
create function nova_private.siege_enhance_order() returns trigger language plpgsql set search_path='' as $$
begin
 select coalesce((enhancements->>(case when new.alien then 'unit:alien' else 'unit:'||new.kind end))::int,0) ,coalesce((research->>'weapon')::int,0),coalesce((research->>'armor')::int,0) into new.enhancement,new.weapon_research,new.armor_research from public.nova_war_players where user_id=new.owner;return new;
end $$;
create trigger nova_siege_enhance_order before insert on nova_private.siege_orders for each row execute function nova_private.siege_enhance_order();
create function nova_private.siege_enhance_target() returns trigger language plpgsql set search_path='' as $$
begin new.target:=new.target||jsonb_build_object('enhancements',(select enhancements from public.nova_war_players where user_id=new.defender));return new;end $$;
create trigger nova_siege_enhance_target before insert on nova_private.sieges for each row execute function nova_private.siege_enhance_target();
revoke all on function nova_private.siege_enhance_order(),nova_private.siege_enhance_target() from public,anon,authenticated;
-- Add the same stats to previews, including legacy previews; do not accept loadouts from clients.
alter function nova_private.siege_command(jsonb) rename to siege_command_before_enhance;
create function nova_private.siege_command(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare r jsonb;begin
 if auth.uid() is null then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 r:=nova_private.siege_command_before_enhance(payload);
 if r ? 'target' then r:=jsonb_set(r,'{target,enhancements}',coalesce((select enhancements from public.nova_war_players where user_id=(r->'target'->>'id')::uuid),'{}'));end if;
 return r;
end $$;
revoke all on function nova_private.siege_command_before_enhance(jsonb),nova_private.siege_command(jsonb) from public,anon,authenticated;
grant execute on function nova_private.siege_command(jsonb) to authenticated;
