-- Additive recovery state. Existing wallets, construction and ad receipts are untouched.
alter table nova_private.titans342 add column recovery_until347 timestamptz,
 add column recovery_destroyed347 boolean not null default false,
 add column recovery_report347 text;
alter function nova_private.titan_state342(uuid) rename to titan_state_before347;
create function nova_private.titan_state342(who uuid) returns jsonb language sql stable set search_path='' as $$
 select nova_private.titan_state_before347(who)||jsonb_build_object('recovery_until347',recovery_until347,'recovery_destroyed347',recovery_destroyed347,'resting347',coalesce(recovery_until347>now(),false)) from nova_private.titans342 where owner=who;
$$;
-- Campaigns already simulate locally. Reports can only add damage, never shorten server recovery.
-- Retry IDs prevent repeated status polling from extending the same recovery.
alter function nova_private.titan_command342(jsonb) rename to titan_command_before347;
create function nova_private.titan_command342(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;uid uuid:=auth.uid();r jsonb:=payload->'recovery347';fraction numeric;token text;
begin
 result:=nova_private.titan_command_before347(payload);
 if uid is not null and r is not null and jsonb_typeof(r)='object' then
  fraction:=(r->>'fraction')::numeric;token:=r->>'id';
  if fraction is null or fraction<0 or fraction>1 or fraction='NaN'::numeric or token is null or length(token) not between 8 and 100 then raise exception 'ข้อมูลพักฟื้นไม่ถูกต้อง';end if;
  update nova_private.titans342 set recovery_until347=greatest(coalesce(recovery_until347,now()),now()+(1-fraction)*interval '30 minutes'),recovery_destroyed347=(fraction=0 or recovery_destroyed347 and recovery_until347>now()),recovery_report347=token where owner=uid and level>0 and recovery_report347 is distinct from token;
  result:=result||jsonb_build_object('recovery_ack347',token,'state',nova_private.titan_state342(uid));
 end if;return result;
end $$;
alter function nova_private.titan_combat342(jsonb) rename to titan_combat_before347;
create function nova_private.titan_combat342(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(153014,1);
 if payload->>'titan342'='deploy' and exists(select 1 from nova_private.titans342 where owner=auth.uid() and recovery_until347>now()) then raise exception 'หุ่นกำลังพักฟื้น';end if;
 return nova_private.titan_combat_before347(payload);
end $$;
-- The accepted host frame is the same source used by existing siege settlement.
-- Settle both sides even when the defending owner is offline. Only run once per siege.
create function nova_private.titan_siege_recovery347() returns trigger language plpgsql security definer set search_path='' as $$
declare side text;meta jsonb;unit jsonb;who uuid;hp numeric;maximum numeric;idx int;fraction numeric;
begin
 if old.finished_at is not null or new.finished_at is null then return new;end if;
 foreach side in array array['troops','guards'] loop
  for meta in select value from jsonb_array_elements(case when jsonb_typeof(new.frame->'titans342'->side)='array' then new.frame->'titans342'->side else '[]'::jsonb end) loop
   if coalesce(meta->>'i','') !~ '^[0-9]{1,3}$' then continue;end if;idx:=(meta->>'i')::int;if idx is null or idx<0 or idx>500 then continue;end if;
   unit:=new.frame->side->idx;if jsonb_typeof(unit->3)<>'number' or jsonb_typeof(unit->4)<>'number' then continue;end if;hp:=(unit->>3)::numeric;maximum:=(unit->>4)::numeric;
   if hp is null or maximum is null or maximum<=0 or hp<0 or hp>maximum or hp='NaN'::numeric or maximum='NaN'::numeric then continue;end if;
   if side='guards' then who:=new.defender;
   else select owner into who from nova_private.siege_orders where room=new.id and owner::text=meta->>'owner' and titan342 is not null limit 1;if who is null then continue;end if;end if;
   fraction:=hp/maximum;
   if fraction<1 then update nova_private.titans342 set recovery_until347=greatest(coalesce(recovery_until347,now()),now()+(1-fraction)*interval '30 minutes'),recovery_destroyed347=(hp=0),recovery_report347=new.id::text where owner=who and level>0;end if;
  end loop;
 end loop;return new;
end $$;
create trigger titan_siege_recovery347 after update of finished_at on nova_private.sieges for each row execute function nova_private.titan_siege_recovery347();
revoke all on function nova_private.titan_state_before347(uuid),nova_private.titan_state342(uuid),nova_private.titan_command_before347(jsonb),nova_private.titan_command342(jsonb),nova_private.titan_combat_before347(jsonb),nova_private.titan_combat342(jsonb),nova_private.titan_siege_recovery347() from public,anon,authenticated;
