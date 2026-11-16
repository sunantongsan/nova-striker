-- 412 (applied to production 2026-11-16): backup of published bases and a one-time restore for bases reset by the patch-210 save bug.
create table if not exists nova_private.layout_backup412 as
select user_id, layout, snapshot_seq, resource_gold, resource_power, garrison, research, infra, now() as backed_up_at
from public.nova_war_players;
alter table nova_private.layout_backup412 add primary key (user_id);
revoke all on nova_private.layout_backup412 from public, anon, authenticated;
alter table nova_private.layout_backup412 add column if not exists restored_at timestamptz;

create or replace function nova_private.restore412(payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); r record;
begin
 if me is null then raise exception 'not signed in'; end if;
 select * into r from nova_private.layout_backup412 where user_id=me for update;
 if not found or r.restored_at is not null or nova_private.hq255(r.layout)<2 then
  return jsonb_build_object('restore412',jsonb_build_object('available',false));
 end if;
 if coalesce((payload->>'claim')::boolean,false) then
  update nova_private.layout_backup412 set restored_at=now() where user_id=me;
 end if;
 return jsonb_build_object('restore412',jsonb_build_object('available',true,'layout',r.layout,'gold',r.resource_gold,'power',r.resource_power,
  'hq',nova_private.hq255(r.layout),'count',jsonb_array_length(r.layout),'claimed',coalesce((payload->>'claim')::boolean,false)));
end $$;
revoke all on function nova_private.restore412(jsonb) from public, anon;
grant execute on function nova_private.restore412(jsonb) to authenticated;

create or replace function public.nova_war_command(action text, payload jsonb default '{}'::jsonb) returns jsonb
language plpgsql set search_path='' as $$
begin
 if payload ? 'restore412' then return nova_private.restore412(payload); end if;
 if payload ? 'profile' then
  if action<>'status' then raise exception 'คำสั่งชื่อฐานไม่ถูกต้อง';end if;
  return nova_private.base_name_command224(payload);
 end if;
 if payload->>'live' like 'siege_%' then return nova_private.siege_command(payload);end if;
 if payload ? 'live' then return nova_private.live_command(payload);end if;
 return nova_private.command(action,payload);
end $$;
