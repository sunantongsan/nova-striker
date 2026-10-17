-- Account-owned names survive leaving PvP and restoring an older offline save.
create or replace function nova_private.base_name_key224(value text)
returns text language sql immutable strict set search_path='' as $$
 select lower(btrim(regexp_replace(translate(normalize(value,NFKC),U&'\00AD\034F\061C\180E\200B\200C\200D\200E\200F\202A\202B\202C\202D\202E\2060\2061\2062\2063\2064\2066\2067\2068\2069\FEFF',''),'[[:space:]]+',' ','g')));
$$;
revoke all on function nova_private.base_name_key224(text) from public,anon,authenticated;
create table nova_private.base_names224 (
 user_id uuid primary key references auth.users(id) on delete cascade,
 name text not null check(char_length(name) between 1 and 40),
 name_key text generated always as (nova_private.base_name_key224(name)) stored not null unique,
 created_at timestamptz not null default now(),
 check(char_length(name_key)>0)
);
alter table nova_private.base_names224 enable row level security;
revoke all on nova_private.base_names224 from public,anon,authenticated;
create or replace function nova_private.base_name_command224(payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); v_name text; saved text;
begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ'; end if;
 if payload->>'profile' not in ('status','claim') or payload->>'profile' is null then raise exception 'คำสั่งชื่อฐานไม่ถูกต้อง';end if;
 -- Same lock as the existing PvP command keeps enrollment/name synchronization atomic.
 perform pg_advisory_xact_lock(153014,1);
 select name into saved from nova_private.base_names224 where user_id=uid;
 if payload->>'profile'='claim' and saved is null then
  v_name:=normalize(btrim(regexp_replace(payload->>'name','[[:space:]]+',' ','g')),NFC);
  if v_name is null or char_length(v_name) not between 1 and 40 or char_length(nova_private.base_name_key224(v_name))=0
   or v_name ~ '[[:cntrl:]<>]' or v_name ~ U&'[\202A-\202E\2066-\2069]' then
   raise exception 'กรุณาตั้งชื่อ 1–40 ตัวอักษร ไม่ใช้สัญลักษณ์ควบคุมหรือ < >';
  end if;
  begin
   insert into nova_private.base_names224(user_id,name) values(uid,v_name) returning name into saved;
  exception when unique_violation then raise exception 'ชื่อนี้มีผู้ใช้แล้ว กรุณาเลือกชื่ออื่น';end;
  update public.nova_war_players set callsign=saved where user_id=uid;
 end if;
 return jsonb_build_object('profile',true,'owner',uid,'name',saved);
end $$;
revoke all on function nova_private.base_name_command224(jsonb) from public,anon,authenticated;
grant execute on function nova_private.base_name_command224(jsonb) to authenticated;
-- Existing native apps allow status requests with arbitrary JSON payloads.
create or replace function public.nova_war_command(action text,payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
begin
 if payload ? 'profile' then
  if action<>'status' then raise exception 'คำสั่งชื่อฐานไม่ถูกต้อง';end if;
  return nova_private.base_name_command224(payload);
 end if;
 if payload->>'live' like 'siege_%' then return nova_private.siege_command(payload);end if;
 if payload ? 'live' then return nova_private.live_command(payload);end if;
 return nova_private.command(action,payload);
end $$;
revoke all on function public.nova_war_command(text,jsonb) from public,anon;
grant execute on function public.nova_war_command(text,jsonb) to authenticated;
create or replace function nova_private.base_name_sync224()
returns trigger language plpgsql security definer set search_path='' as $$
declare saved text;
begin
 select name into saved from nova_private.base_names224 where user_id=new.user_id;
 if saved is not null then new.callsign:=saved;end if;
 return new;
end $$;
revoke all on function nova_private.base_name_sync224() from public,anon,authenticated;
create trigger nova_base_name224 before insert or update of callsign on public.nova_war_players
 for each row execute function nova_private.base_name_sync224();
